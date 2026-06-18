import type { BrainMemory, BrainMemoryInput } from '../brain/types';

export type AssistantMode = 'auto' | 'manual' | 'debug' | 'safe';

export type SkillCategory =
  | 'memory'
  | 'coding'
  | 'codex_prompt'
  | 'design'
  | 'image_edit'
  | 'uiux'
  | 'website_optimization'
  | 'academic'
  | 'language'
  | 'support_reply'
  | 'product_planning'
  | 'business_strategy'
  | 'research'
  | 'formatter'
  | 'utility';

export type PrimaryIntent =
  | 'coding'
  | 'design'
  | 'image_edit'
  | 'research'
  | 'academic'
  | 'support_reply'
  | 'product_planning'
  | 'uiux_review'
  | 'website_optimization'
  | 'prompt_generation'
  | 'debugging'
  | 'general';

export type AssistantProject = 'Phere' | 'portfolio' | 'general' | 'unknown';
export type AssistantLanguage = 'hinglish' | 'english' | 'gujarati' | 'hindi' | 'unknown';
export type IntentComplexity = 'simple' | 'medium' | 'complex';
export type IntentUrgency = 'low' | 'medium' | 'high';

export interface SkillMetadata {
  id: string;
  name: string;
  description: string;
  category: SkillCategory;
  trigger_keywords: string[];
  examples: string[];
  input_schema: Record<string, unknown>;
  output_schema: Record<string, unknown>;
  priority: number;
  dependencies: string[];
  can_run_parallel: boolean;
  safe_to_run_automatically: boolean;
  requires_approval: boolean;
  confidence_rules: string[];
  safety_rules: string[];
}

export interface AssistantIntent {
  primary_intent: PrimaryIntent;
  secondary_intents: PrimaryIntent[];
  entities: string[];
  project: AssistantProject;
  language: AssistantLanguage;
  needs_memory: boolean;
  needs_code: boolean;
  needs_file: boolean;
  needs_web: boolean;
  needs_image: boolean;
  needs_prompt: boolean;
  urgency: IntentUrgency;
  complexity: IntentComplexity;
  risk_flags: string[];
}

export interface SkillInput {
  message: string;
  intent: AssistantIntent;
  memories: BrainMemory[];
  memoryContext: string;
  mode: AssistantMode;
  conversationId?: string;
  userId?: string;
  skillOutputs?: SkillRunResult[];
}

export interface SkillMatchResult {
  skill_id: string;
  can_handle: boolean;
  confidence: number;
  reason: string;
  requires_approval?: boolean;
}

export interface SkillRunInput extends SkillInput {
  action?: string;
  step?: number;
  selectedSkills?: RoutedSkill[];
  executionPlan?: ExecutionStep[];
}

export interface SkillRunResult {
  skill_id: string;
  success: boolean;
  output: unknown;
  summary?: string;
  warnings?: string[];
  error?: string;
}

export interface Skill {
  metadata: SkillMetadata;
  canHandle(input: SkillInput): Promise<SkillMatchResult>;
  run(input: SkillRunInput): Promise<SkillRunResult>;
}

export interface RoutedSkill {
  skill_id: string;
  confidence: number;
  reason: string;
  order_hint: number;
  requires_approval?: boolean;
}

export interface RejectedSkill {
  skill_id: string;
  reason: string;
}

export interface SkillRoutingResult {
  selected_skills: RoutedSkill[];
  rejected_skills: RejectedSkill[];
  routing_confidence: number;
}

export interface ExecutionStep {
  step: number;
  skill_id: string;
  action: string;
  input_from: string;
  parallel_group: string | null;
  requires_approval: boolean;
}

export interface AssistantRunInput {
  message: string;
  mode?: AssistantMode;
  forced_skill_ids?: string[];
  conversation_id?: string;
  user_id?: string;
}

export interface AssistantDebugInfo {
  rejected_skills?: RejectedSkill[];
  routing_confidence?: number;
  provider?: string;
  search_query?: string;
  selected_memories?: BrainMemory[];
  rejected_sensitive_memories?: Array<{ content: string; reason?: string }>;
}

export interface AssistantRunOutput {
  answer: string;
  intent: AssistantIntent;
  memory_used: BrainMemory[];
  selected_skills: RoutedSkill[];
  execution_plan: ExecutionStep[];
  skill_outputs: SkillRunResult[];
  memory_saved: BrainMemoryInput[];
  warnings: string[];
  debug: AssistantDebugInfo;
}

export interface OrchestrationConfig {
  mode: AssistantMode;
  debugRouting: boolean;
  safeMode: boolean;
  maxSelectedSkills: number;
  minSkillConfidence: number;
  enableMemory: boolean;
  enableMemoryUpdate: boolean;
  enableParallelSkills: boolean;
  requireApprovalForRiskyActions: boolean;
}
