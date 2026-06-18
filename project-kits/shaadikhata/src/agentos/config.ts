import type { AssistantMode, OrchestrationConfig } from './skills/types';

const readEnv = (key: string): string => {
  const processEnv = (globalThis as any)?.process?.env;
  const viteEnv = (import.meta as any)?.env;
  return String(processEnv?.[key] ?? viteEnv?.[key] ?? '');
};

const readBool = (key: string, fallback: boolean): boolean => {
  const value = readEnv(key).trim().toLowerCase();
  if (!value) return fallback;
  return ['1', 'true', 'yes', 'on'].includes(value);
};

const readNumber = (key: string, fallback: number) => {
  const value = Number(readEnv(key));
  return Number.isFinite(value) ? value : fallback;
};

const readMode = (value: string): AssistantMode => {
  if (value === 'manual' || value === 'debug' || value === 'safe') return value;
  return 'auto';
};

export function getOrchestrationConfig(overrides: Partial<OrchestrationConfig> = {}): OrchestrationConfig {
  return {
    mode: readMode(readEnv('AI_ORCHESTRATION_MODE').toLowerCase()),
    debugRouting: readBool('AI_DEBUG_ROUTING', false),
    safeMode: readBool('AI_SAFE_MODE', false),
    maxSelectedSkills: Math.max(2, readNumber('AI_MAX_SELECTED_SKILLS', 6)),
    minSkillConfidence: Math.max(0, Math.min(1, readNumber('AI_MIN_SKILL_CONFIDENCE', 0.55))),
    enableMemory: readBool('AI_ENABLE_MEMORY', true),
    enableMemoryUpdate: readBool('AI_ENABLE_MEMORY_UPDATE', true),
    enableParallelSkills: readBool('AI_ENABLE_PARALLEL_SKILLS', false),
    requireApprovalForRiskyActions: readBool('AI_REQUIRE_APPROVAL_FOR_RISKY_ACTIONS', true),
    ...overrides,
  };
}
