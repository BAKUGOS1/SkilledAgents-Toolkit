import { brainSkillMetadata, getBrainConfig } from './config';
import {
  BrainCompositeProvider,
  sanitizeMemoryContent,
} from './memory';
import {
  extractMemoriesFromMessages,
  shouldRememberContent,
} from './extractor';
import type {
  BrainConfig,
  BrainContextResult,
  BrainMemory,
  BrainMemoryFilter,
  BrainMemoryInput,
  BrainMemoryPatch,
  BrainMemoryScope,
  BrainMessage,
  BrainSanitizeResult,
  BrainSkillMetadata,
} from './types';

const PROJECT_DECISION_CATEGORIES = new Set(['project', 'decision', 'workflow', 'skill_rule']);

const inferScope = (input: BrainMemoryInput, config: BrainConfig): BrainMemoryScope => {
  if (input.scope) return input.scope;
  if (input.run_id || config.runId) return 'run';
  if (input.project_id || PROJECT_DECISION_CATEGORIES.has(input.category || '')) return 'project';
  return config.defaultScope;
};

export class BrainMemorySkill {
  readonly metadata: BrainSkillMetadata = brainSkillMetadata;
  private readonly config: BrainConfig;
  private readonly provider: BrainCompositeProvider;
  private rejectedSensitiveMemories: Array<{ content: string; reason?: string }> = [];

  constructor(overrides: Partial<BrainConfig> = {}) {
    this.config = getBrainConfig(overrides);
    this.provider = new BrainCompositeProvider(this.config);
  }

  private applyGovernance(input: BrainMemoryInput): BrainMemoryInput {
    const scope = inferScope(input, this.config);
    const category = input.category || 'preference';
    const isProjectDecision = scope === 'project' && PROJECT_DECISION_CATEGORIES.has(category);
    const requiresApproval = Boolean(
      input.requires_approval ||
      this.config.approvalRequired ||
      (this.config.projectDecisionApprovalRequired && isProjectDecision),
    );

    return {
      ...input,
      category,
      scope,
      project_id: scope === 'project' || scope === 'run'
        ? input.project_id || this.config.projectId || null
        : input.project_id || null,
      run_id: scope === 'run' ? input.run_id || this.config.runId || null : input.run_id || null,
      is_approved: requiresApproval ? false : input.is_approved,
      requires_approval: requiresApproval,
      approval_reason: requiresApproval
        ? input.approval_reason || (isProjectDecision
          ? 'Project/workflow decisions require approval before long-term use.'
          : 'Memory approval is required by configuration.')
        : input.approval_reason || null,
    };
  }

  async addMemory(input: BrainMemoryInput | string): Promise<BrainMemory | null> {
    const memoryInput: BrainMemoryInput = this.applyGovernance(
      typeof input === 'string' ? { content: input } : input,
    );
    const sanitized = this.sanitizeMemory(memoryInput.content);

    if (sanitized.rejected) {
      this.rejectedSensitiveMemories.push({
        content: sanitized.safeContent || memoryInput.content,
        reason: sanitized.reason,
      });
      return null;
    }

    return this.provider.add({
      ...memoryInput,
      content: sanitized.safeContent,
    });
  }

  async searchMemory(query: string, filter?: BrainMemoryFilter): Promise<BrainMemory[]> {
    return this.provider.search(query, filter);
  }

  async updateMemory(memoryId: string, patch: BrainMemoryPatch): Promise<BrainMemory | null> {
    if (patch.content) {
      const sanitized = this.sanitizeMemory(patch.content);
      if (sanitized.rejected) {
        this.rejectedSensitiveMemories.push({
          content: sanitized.safeContent || patch.content,
          reason: sanitized.reason,
        });
        return null;
      }
      patch = { ...patch, content: sanitized.safeContent };
    }

    return this.provider.update(memoryId, patch);
  }

  async deleteMemory(memoryId: string): Promise<boolean> {
    return this.provider.delete(memoryId);
  }

  async listMemories(filter?: BrainMemoryFilter): Promise<BrainMemory[]> {
    return this.provider.list(filter);
  }

  async extractMemoriesFromConversation(messages: BrainMessage[] = []): Promise<BrainMemoryInput[]> {
    return extractMemoriesFromMessages(messages);
  }

  async getRelevantContext(userQuery: string): Promise<BrainContextResult> {
    const userMemories = await this.searchMemory(userQuery, { approvedOnly: true, scope: 'user' });
    const projectMemories = await this.searchMemory(userQuery, {
      approvedOnly: true,
      scope: 'project',
      project_id: this.config.projectId || null,
    });
    const runMemories = this.config.runId
      ? await this.searchMemory(userQuery, {
          approvedOnly: true,
          scope: 'run',
          project_id: this.config.projectId || null,
          run_id: this.config.runId,
        })
      : [];
    const memories = [...new Map([...runMemories, ...projectMemories, ...userMemories].map(memory => [memory.id, memory])).values()];
    const contextText = memories.length
      ? `Relevant user memories:\n${memories.map(memory => `- ${memory.content}`).join('\n')}`
      : '';

    return {
      memories,
      contextText,
      ...(this.config.debug
        ? {
            debug: {
              provider: this.provider.name,
              searchQuery: userQuery,
              selectedMemories: memories,
              rejectedSensitiveMemories: this.rejectedSensitiveMemories,
              confidenceScores: memories.map(memory => ({
                id: memory.id,
                confidence: memory.confidence,
              })),
            },
          }
        : {}),
    };
  }

  shouldRemember(content: string): boolean {
    return shouldRememberContent(content);
  }

  sanitizeMemory(content: string): BrainSanitizeResult {
    return sanitizeMemoryContent(content);
  }
}

export function createBrainSkill(overrides: Partial<BrainConfig> = {}) {
  return new BrainMemorySkill(overrides);
}

export const brainSkill = createBrainSkill();
