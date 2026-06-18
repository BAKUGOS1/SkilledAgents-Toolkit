import { getOrchestrationConfig } from '../config';
import { getSkillRegistry, SkillRegistry } from '../skills/registry';
import type {
  AssistantIntent,
  AssistantMode,
  OrchestrationConfig,
  RejectedSkill,
  RoutedSkill,
  Skill,
  SkillRoutingResult,
} from '../skills/types';

export interface RouteSkillsInput {
  query: string;
  intent: AssistantIntent;
  memoryContext?: string;
  registry?: SkillRegistry;
  mode?: AssistantMode;
  forcedSkillIds?: string[];
  config?: Partial<OrchestrationConfig>;
}

const ORDER_HINTS: Record<string, number> = {
  brain_memory_skill: 1,
  intent_analyzer_skill: 2,
  project_context_skill: 3,
  phere_product_skill: 4,
  coding_skill: 5,
  uiux_skill: 6,
  website_optimization_skill: 7,
  watermelon_ui_skill: 8,
  image_edit_skill: 9,
  identity_preservation_skill: 10,
  design_prompt_skill: 11,
  academic_skill: 12,
  gujarati_language_skill: 13,
  language_formatter_skill: 14,
  phere_support_reply_skill: 15,
  short_english_writing_skill: 16,
  codex_prompt_builder_skill: 17,
  general_assistant_skill: 90,
  final_response_formatter_skill: 99,
};

const includesAny = (text: string, words: string[]) =>
  words.some(word => text.includes(word.toLowerCase()));

const watermelonTerms = [
  'watermelon ui',
  'watermelon',
  'registry.watermelon.sh',
  'card-split-accordian',
  'card split accordian',
  'shadcn registry',
  'shadcn component',
  'components/ui',
];

function baseSelection(query: string, intent: AssistantIntent) {
  const text = query.toLowerCase();
  const selected = new Set<string>(['brain_memory_skill']);

  if (intent.risk_flags.includes('memory_delete')) {
    selected.add('final_response_formatter_skill');
    return selected;
  }

  if (intent.complexity === 'simple' && intent.primary_intent === 'general') {
    selected.add('final_response_formatter_skill');
    return selected;
  }

  if (intent.primary_intent === 'support_reply') {
    if (intent.project === 'Phere' || includesAny(text, ['phere'])) selected.add('phere_support_reply_skill');
    if (intent.language === 'english' || includesAny(text, ['short english', 'simple english'])) selected.add('short_english_writing_skill');
    selected.add('final_response_formatter_skill');
    return selected;
  }

  if (intent.primary_intent === 'image_edit') {
    selected.add('image_edit_skill');
    if (includesAny(text, ['face', 'same face', 'identity', 'facial structure', 'face change nahi', 'face mat change'])) {
      selected.add('identity_preservation_skill');
    }
    if (intent.needs_prompt || includesAny(text, ['prompt', 'premium', 'realistic', 'mockup', 'poster', 'logo'])) {
      selected.add('design_prompt_skill');
    }
    selected.add('final_response_formatter_skill');
    return selected;
  }

  if (intent.primary_intent === 'academic') {
    selected.add('academic_skill');
    if (intent.language === 'gujarati') selected.add('gujarati_language_skill');
    selected.add('final_response_formatter_skill');
    return selected;
  }

  if (intent.primary_intent === 'website_optimization' || intent.secondary_intents.includes('website_optimization')) {
    selected.add('project_context_skill');
    if (intent.project === 'Phere') selected.add('phere_product_skill');
    selected.add('uiux_skill');
    selected.add('website_optimization_skill');
    if (includesAny(text, watermelonTerms)) selected.add('watermelon_ui_skill');
    if (intent.needs_prompt) selected.add('codex_prompt_builder_skill');
    selected.add('final_response_formatter_skill');
    return selected;
  }

  if (intent.primary_intent === 'uiux_review') {
    selected.add('project_context_skill');
    if (intent.project === 'Phere') selected.add('phere_product_skill');
    selected.add('uiux_skill');
    if (includesAny(text, watermelonTerms)) selected.add('watermelon_ui_skill');
    if (intent.needs_prompt) selected.add('codex_prompt_builder_skill');
    selected.add('final_response_formatter_skill');
    return selected;
  }

  if (intent.primary_intent === 'prompt_generation') {
    if (intent.project === 'Phere') {
      selected.add('project_context_skill');
      selected.add('phere_product_skill');
    }
    if (intent.secondary_intents.includes('coding') || includesAny(text, ['repo', 'feature', 'fix', 'wire', 'module', 'code'])) {
      selected.add('coding_skill');
    }
    if (includesAny(text, watermelonTerms)) {
      selected.add('uiux_skill');
      selected.add('watermelon_ui_skill');
    }
    selected.add('codex_prompt_builder_skill');
    selected.add('final_response_formatter_skill');
    return selected;
  }

  if (intent.primary_intent === 'coding' || intent.primary_intent === 'debugging') {
    if (intent.project === 'Phere') selected.add('project_context_skill');
    selected.add('coding_skill');
    if (includesAny(text, ['agent manager', '9-agent', 'handoff', 'production gate', 'truthfulness'])) {
      selected.add('phere_9_agent_manager_skill');
    }
    if (includesAny(text, ['supabase', 'auth', 'rls', 'edge function', 'storage bucket', 'realtime'])) {
      selected.add('supabase_skill');
    }
    if (includesAny(text, ['postgres', 'sql', 'migration', 'index', 'query performance', 'schema'])) {
      selected.add('supabase_postgres_best_practices_skill');
    }
    if (includesAny(text, ['automation worker', 'background worker', 'cron', 'scheduled job', 'automation'])) {
      selected.add('automation_worker_skill');
    }
    if (includesAny(text, watermelonTerms)) {
      selected.add('uiux_skill');
      selected.add('watermelon_ui_skill');
    }
    if (intent.needs_prompt) selected.add('codex_prompt_builder_skill');
    selected.add('final_response_formatter_skill');
    return selected;
  }

  if (intent.project === 'Phere') {
    selected.add('project_context_skill');
    selected.add('phere_product_skill');
    selected.add('final_response_formatter_skill');
    return selected;
  }

  selected.add('general_assistant_skill');
  selected.add('final_response_formatter_skill');
  return selected;
}

function confidenceFor(skill: Skill, query: string, intent: AssistantIntent, memoryContext: string) {
  if (skill.metadata.id === 'brain_memory_skill') return 1;
  if (skill.metadata.id === 'final_response_formatter_skill') return 0.96;

  const text = `${query} ${memoryContext}`.toLowerCase();
  const keywordMatches = skill.metadata.trigger_keywords.filter(keyword => text.includes(keyword.toLowerCase())).length;
  const keywordScore = Math.min(0.35, keywordMatches * 0.12);
  const priorityScore = Math.min(0.2, skill.metadata.priority / 500);
  const categoryScore =
    (intent.primary_intent === 'image_edit' && skill.metadata.category === 'image_edit') ||
    (intent.primary_intent === 'academic' && skill.metadata.category === 'academic') ||
    (intent.primary_intent === 'support_reply' && skill.metadata.category === 'support_reply') ||
    (intent.primary_intent === 'prompt_generation' && skill.metadata.category === 'codex_prompt') ||
    (intent.primary_intent === 'website_optimization' && skill.metadata.category === 'website_optimization') ||
    (intent.primary_intent === 'uiux_review' && skill.metadata.category === 'uiux') ||
    (intent.primary_intent === 'coding' && skill.metadata.category === 'coding')
      ? 0.32
      : 0;
  const projectScore = intent.project === 'Phere' && skill.metadata.id.includes('phere') ? 0.2 : 0;
  return Math.min(1, 0.28 + keywordScore + priorityScore + categoryScore + projectScore);
}

function limitSelection(selected: RoutedSkill[], config: OrchestrationConfig) {
  const configuredMax = Number(config.maxSelectedSkills);
  const maxSelectedSkills = Number.isFinite(configuredMax) && configuredMax >= 3 ? configuredMax : 6;
  const pinned = selected.filter(item =>
    item.skill_id === 'brain_memory_skill' || item.skill_id === 'final_response_formatter_skill'
  );
  const rest = selected
    .filter(item => !pinned.some(pin => pin.skill_id === item.skill_id))
    .sort((a, b) => b.confidence - a.confidence || a.order_hint - b.order_hint)
    .slice(0, Math.max(0, maxSelectedSkills - pinned.length));

  return [...pinned.filter(item => item.skill_id === 'brain_memory_skill'), ...rest, ...pinned.filter(item => item.skill_id !== 'brain_memory_skill')]
    .sort((a, b) => a.order_hint - b.order_hint);
}

export function routeSkills(input: RouteSkillsInput): SkillRoutingResult {
  const registry = input.registry || getSkillRegistry();
  const config = getOrchestrationConfig(input.config);
  const mode = input.mode || config.mode;
  const forced = mode === 'manual' ? input.forcedSkillIds || [] : [];
  const selectedIds = baseSelection(input.query, input.intent);

  for (const skillId of forced) {
    if (registry.get(skillId)) selectedIds.add(skillId);
  }

  const selected: RoutedSkill[] = [];
  const rejected: RejectedSkill[] = [];
  const memoryContext = input.memoryContext || '';

  for (const skill of registry.list()) {
    const selectedByRule = selectedIds.has(skill.metadata.id);
    const confidence = confidenceFor(skill, input.query, input.intent, memoryContext);
    const routedConfidence = selectedByRule ? Math.max(confidence, 0.72) : confidence;
    if (selectedByRule && (routedConfidence >= config.minSkillConfidence || skill.metadata.id === 'brain_memory_skill' || forced.includes(skill.metadata.id))) {
      selected.push({
        skill_id: skill.metadata.id,
        confidence: routedConfidence,
        reason: forced.includes(skill.metadata.id)
          ? 'forced in manual mode'
          : skill.metadata.id === 'brain_memory_skill'
            ? 'always runs first for memory retrieval'
            : 'matched intent, keywords, project context, or routing rule',
        order_hint: ORDER_HINTS[skill.metadata.id] || 50,
        requires_approval: skill.metadata.requires_approval,
      });
    } else if (!selectedByRule) {
      rejected.push({
        skill_id: skill.metadata.id,
        reason: 'not relevant to this intent',
      });
    } else {
      rejected.push({
        skill_id: skill.metadata.id,
        reason: `below confidence threshold (${routedConfidence.toFixed(2)})`,
      });
    }
  }

  const limited = limitSelection(selected, config);
  const average = limited.length
    ? limited.reduce((sum, skill) => sum + skill.confidence, 0) / limited.length
    : 0;

  return {
    selected_skills: limited,
    rejected_skills: rejected.filter(item => !limited.some(selectedSkill => selectedSkill.skill_id === item.skill_id)),
    routing_confidence: Number(average.toFixed(2)),
  };
}
