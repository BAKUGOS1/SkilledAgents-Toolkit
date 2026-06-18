import { createBrainSkill } from '../brain';
import type { BrainMemorySkill } from '../brain/brain.skill';
import { getOrchestrationConfig } from '../config';
import { analyzeIntent } from '../router/intent-analyzer';
import { routeSkills } from '../router/skill-router';
import { createExecutionPlan } from '../router/execution-planner';
import { getSkillRegistry, SkillRegistry } from '../skills/registry';
import { mergeSkillOutputs } from './result-merger';
import { runMemoryUpdateHook } from './memory-update-hook';
import type {
  AssistantRunInput,
  AssistantRunOutput,
  OrchestrationConfig,
  SkillRunResult,
} from '../skills/types';

export interface RunAssistantOptions {
  registry?: SkillRegistry;
  brain?: BrainMemorySkill;
  config?: Partial<OrchestrationConfig>;
}

export async function runAssistant(
  input: AssistantRunInput,
  options: RunAssistantOptions = {},
): Promise<AssistantRunOutput> {
  const config = getOrchestrationConfig(options.config);
  const mode = input.mode || config.mode;
  const registry = options.registry || getSkillRegistry();
  const brain = options.brain || createBrainSkill();
  const warnings: string[] = [];

  const memoryContext = config.enableMemory
    ? await brain.getRelevantContext(input.message)
    : { memories: [], contextText: '' };

  const intent = analyzeIntent(input.message, memoryContext.contextText);
  const requiresApproval = intent.risk_flags.length > 0 && config.requireApprovalForRiskyActions;
  if (requiresApproval || mode === 'safe' || config.safeMode) {
    if (intent.risk_flags.length) warnings.push('Approval required before running risky or destructive actions.');
  }

  const routing = routeSkills({
    query: input.message,
    intent,
    memoryContext: memoryContext.contextText,
    registry,
    mode,
    forcedSkillIds: input.forced_skill_ids,
    config,
  });
  const executionPlan = createExecutionPlan(routing.selected_skills);
  const skillOutputs: SkillRunResult[] = [];

  for (const step of executionPlan) {
    if (step.action === 'extractAndSaveMemories') continue;

    const skill = registry.get(step.skill_id);
    if (!skill) {
      warnings.push(`Skill not found: ${step.skill_id}`);
      continue;
    }

    if (step.requires_approval || (requiresApproval && step.skill_id !== 'brain_memory_skill' && step.skill_id !== 'final_response_formatter_skill')) {
      skillOutputs.push({
        skill_id: step.skill_id,
        success: false,
        output: null,
        warnings: ['Skipped because approval is required.'],
      });
      continue;
    }

    const output = await skill.run({
      message: input.message,
      intent,
      memories: memoryContext.memories,
      memoryContext: memoryContext.contextText,
      mode,
      conversationId: input.conversation_id,
      userId: input.user_id,
      skillOutputs,
      action: step.action,
      step: step.step,
      selectedSkills: routing.selected_skills,
      executionPlan,
    });

    skillOutputs.push(output);
    if (output.warnings?.length) warnings.push(...output.warnings);
    if (!output.success && output.error) warnings.push(`${step.skill_id} failed: ${output.error}`);
  }

  const answer = mergeSkillOutputs({
    message: input.message,
    intent,
    memories: memoryContext.memories,
    memoryContext: memoryContext.contextText,
    skillOutputs,
    warnings,
  });

  const memoryUpdate = await runMemoryUpdateHook({
    brainSkill: brain,
    message: input.message,
    answer,
    enabled: config.enableMemory && config.enableMemoryUpdate,
    skip: requiresApproval,
  });
  warnings.push(...memoryUpdate.warnings);

  return {
    answer,
    intent,
    memory_used: memoryContext.memories,
    selected_skills: routing.selected_skills,
    execution_plan: executionPlan,
    skill_outputs: skillOutputs,
    memory_saved: memoryUpdate.saved,
    warnings,
    debug: mode === 'debug' || config.debugRouting
      ? {
          rejected_skills: routing.rejected_skills,
          routing_confidence: routing.routing_confidence,
          provider: memoryContext.debug?.provider,
          search_query: memoryContext.debug?.searchQuery,
          selected_memories: memoryContext.debug?.selectedMemories,
          rejected_sensitive_memories: memoryContext.debug?.rejectedSensitiveMemories,
        }
      : {},
  };
}
