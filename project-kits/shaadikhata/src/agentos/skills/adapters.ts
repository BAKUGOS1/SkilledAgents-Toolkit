import type {
  Skill,
  SkillInput,
  SkillMatchResult,
  SkillMetadata,
  SkillRunInput,
  SkillRunResult,
} from './types';

export type SkillRunner = (input: SkillRunInput) => Promise<SkillRunResult> | SkillRunResult;
export type SkillMatcher = (input: SkillInput) => Promise<SkillMatchResult> | SkillMatchResult;

const lower = (value: string) => value.toLowerCase();

function keywordMatchScore(message: string, keywords: string[]) {
  const text = lower(message);
  const matches = keywords.filter(keyword => text.includes(lower(keyword)));
  return Math.min(1, matches.length / Math.max(1, Math.min(4, keywords.length)));
}

export function createStaticSkill(
  metadata: SkillMetadata,
  runner: SkillRunner,
  matcher?: SkillMatcher,
): Skill {
  return {
    metadata,
    async canHandle(input: SkillInput) {
      if (matcher) return matcher(input);
      const keywordScore = keywordMatchScore(input.message, metadata.trigger_keywords);
      const categoryScore = input.intent.primary_intent === metadata.category ? 0.4 : 0;
      const confidence = Math.min(1, 0.2 + keywordScore * 0.5 + categoryScore + metadata.priority / 500);
      return {
        skill_id: metadata.id,
        can_handle: confidence >= 0.45,
        confidence,
        reason: keywordScore > 0 ? 'matched trigger keywords' : 'matched category or priority',
        requires_approval: metadata.requires_approval,
      };
    },
    async run(input: SkillRunInput) {
      try {
        return await runner(input);
      } catch (error) {
        return {
          skill_id: metadata.id,
          success: false,
          output: null,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    },
  };
}

export function legacySkillAdapter(options: {
  metadata: SkillMetadata;
  legacyFunction: (input: SkillRunInput) => Promise<unknown> | unknown;
  summary?: string;
}): Skill {
  return createStaticSkill(options.metadata, async input => {
    const output = await options.legacyFunction(input);
    return {
      skill_id: options.metadata.id,
      success: true,
      output,
      summary: options.summary || `${options.metadata.name} completed.`,
    };
  });
}
