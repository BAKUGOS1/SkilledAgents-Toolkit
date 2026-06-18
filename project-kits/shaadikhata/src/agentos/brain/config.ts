import type { BrainConfig, BrainSkillMetadata } from './types';

export const brainSkillMetadata: BrainSkillMetadata = {
  id: 'brain_memory_skill',
  name: 'Brain Memory Skill',
  description: 'Stores and retrieves long-term user memory, preferences, project context, and skill usage patterns.',
  category: 'memory',
  trigger_keywords: [
    'remember',
    'memory',
    'brain',
    'preference',
    'project context',
    'what I like',
    'my style',
    'save this',
    'forget this',
  ],
  priority: 100,
  can_run_parallel: false,
  safe_to_run_automatically: true,
};

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

export function getBrainConfig(overrides: Partial<BrainConfig> = {}): BrainConfig {
  const provider = (readEnv('BRAIN_MEMORY_PROVIDER') || 'mem0').toLowerCase();
  const fallback = (readEnv('BRAIN_MEMORY_FALLBACK') || 'json').toLowerCase();
  const defaultScope = (readEnv('BRAIN_MEMORY_SCOPE') || 'user').toLowerCase();

  return {
    provider: provider === 'json' || provider === 'memory' ? provider : 'mem0',
    fallback: fallback === 'memory' ? 'memory' : 'json',
    memoryPath: readEnv('BRAIN_MEMORY_PATH') || '.data/brain-memory.json',
    apiKey: readEnv('MEM0_API_KEY'),
    baseUrl: readEnv('MEM0_BASE_URL') || 'https://api.mem0.ai',
    userId: readEnv('BRAIN_MEMORY_USER_ID') || 'phere-user',
    defaultScope: defaultScope === 'project' || defaultScope === 'run' ? defaultScope : 'user',
    projectId: readEnv('BRAIN_PROJECT_ID') || 'phere-shaadikhata',
    runId: readEnv('BRAIN_RUN_ID'),
    autoSave: readBool('BRAIN_AUTO_SAVE', true),
    approvalRequired: readBool('BRAIN_APPROVAL_REQUIRED', false),
    projectDecisionApprovalRequired: readBool('BRAIN_PROJECT_DECISIONS_REQUIRE_APPROVAL', true),
    debug: readBool('BRAIN_DEBUG', false),
    ...overrides,
  };
}
