export const MEMORY_CATEGORIES = [
  'profile',
  'preference',
  'project',
  'writing_style',
  'design_style',
  'skill_rule',
  'workflow',
  'correction',
  'decision',
  'example',
  'rejected_output',
  'tool_usage',
] as const;

export type BrainMemoryCategory = typeof MEMORY_CATEGORIES[number];
export type BrainMemorySource = 'manual' | 'conversation' | 'file' | 'system';
export type BrainMemoryProviderName = 'mem0' | 'json' | 'memory';
export type BrainMemoryScope = 'user' | 'project' | 'run';

export interface BrainSkillMetadata {
  id: string;
  name: string;
  description: string;
  category: 'memory';
  trigger_keywords: string[];
  priority: number;
  can_run_parallel: boolean;
  safe_to_run_automatically: boolean;
}

export interface BrainMemory {
  id: string;
  content: string;
  category: BrainMemoryCategory;
  scope: BrainMemoryScope;
  project_id: string | null;
  run_id: string | null;
  tags: string[];
  source: BrainMemorySource;
  confidence: number;
  created_at: string;
  updated_at: string;
  last_used_at: string | null;
  is_sensitive: boolean;
  is_approved: boolean;
  requires_approval: boolean;
  approval_reason: string | null;
}

export interface BrainMemoryInput {
  content: string;
  category?: BrainMemoryCategory;
  scope?: BrainMemoryScope;
  project_id?: string | null;
  run_id?: string | null;
  tags?: string[];
  source?: BrainMemorySource;
  confidence?: number;
  is_approved?: boolean;
  requires_approval?: boolean;
  approval_reason?: string | null;
}

export type BrainMemoryPatch = Partial<
  Pick<
    BrainMemory,
    | 'content'
    | 'category'
    | 'scope'
    | 'project_id'
    | 'run_id'
    | 'tags'
    | 'confidence'
    | 'is_approved'
    | 'requires_approval'
    | 'approval_reason'
  >
>;

export interface BrainMemoryFilter {
  category?: BrainMemoryCategory;
  scope?: BrainMemoryScope;
  project_id?: string | null;
  run_id?: string | null;
  tags?: string[];
  source?: BrainMemorySource;
  approvedOnly?: boolean;
}

export interface BrainSanitizeResult {
  rejected: boolean;
  isSensitive: boolean;
  safeContent: string;
  reason?: string;
}

export interface BrainContextResult {
  memories: BrainMemory[];
  contextText: string;
  debug?: BrainDebugInfo;
}

export interface BrainDebugInfo {
  provider: BrainMemoryProviderName;
  searchQuery?: string;
  selectedMemories?: BrainMemory[];
  rejectedSensitiveMemories?: Array<{ content: string; reason?: string }>;
  confidenceScores?: Array<{ id: string; confidence: number }>;
}

export interface BrainConfig {
  provider: BrainMemoryProviderName;
  fallback: 'json' | 'memory';
  memoryPath: string;
  apiKey: string;
  baseUrl: string;
  userId: string;
  defaultScope: BrainMemoryScope;
  projectId: string;
  runId: string;
  autoSave: boolean;
  approvalRequired: boolean;
  projectDecisionApprovalRequired: boolean;
  debug: boolean;
}

export interface BrainMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface BrainMemoryProvider {
  name: BrainMemoryProviderName;
  add(memory: BrainMemoryInput): Promise<BrainMemory>;
  search(query: string, filter?: BrainMemoryFilter): Promise<BrainMemory[]>;
  update(memoryId: string, patch: BrainMemoryPatch): Promise<BrainMemory | null>;
  delete(memoryId: string): Promise<boolean>;
  list(filter?: BrainMemoryFilter): Promise<BrainMemory[]>;
}
