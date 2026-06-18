import { brainSkill } from '../brain';
import { createStaticSkill } from './adapters';
import type { AssistantIntent, Skill, SkillMetadata, SkillRunInput, SkillRunResult } from './types';

const metadata = (
  item: Omit<SkillMetadata, 'input_schema' | 'output_schema' | 'can_run_parallel' | 'requires_approval' | 'confidence_rules' | 'safety_rules'> &
    Partial<Pick<SkillMetadata, 'input_schema' | 'output_schema' | 'can_run_parallel' | 'requires_approval' | 'confidence_rules' | 'safety_rules'>>,
): SkillMetadata => ({
  input_schema: {},
  output_schema: {},
  can_run_parallel: false,
  requires_approval: false,
  confidence_rules: [],
  safety_rules: [],
  ...item,
});

const result = (
  skillId: string,
  output: unknown,
  summary: string,
  warnings: string[] = [],
): SkillRunResult => ({
  skill_id: skillId,
  success: true,
  output,
  summary,
  warnings,
});

const includes = (message: string, words: string[]) =>
  words.some(word => message.toLowerCase().includes(word.toLowerCase()));

const phereTerms = ['phere', 'shaadikhata', 'wedding app', 'wedding finance', 'kharcha', 'shagun', 'lena-dena', 'saman'];
const watermelonTerms = [
  'watermelon ui',
  'watermelon',
  'registry.watermelon.sh',
  'card-split-accordian',
  'card split accordian',
  'shadcn registry',
  'shadcn component',
];

const intentLine = (intent: AssistantIntent) =>
  `${intent.primary_intent}${intent.secondary_intents.length ? ` + ${intent.secondary_intents.join(', ')}` : ''}`;

const brainMemorySkill = createStaticSkill(
  metadata({
    id: 'brain_memory_skill',
    name: 'Brain Memory Skill',
    description: brainSkill.metadata.description,
    category: 'memory',
    trigger_keywords: brainSkill.metadata.trigger_keywords,
    examples: [
      'Remember that I prefer Hinglish.',
      'Search my Phere support reply style.',
      'Forget this memory after approval.',
    ],
    priority: 100,
    dependencies: [],
    safe_to_run_automatically: true,
  }),
  input => result(
    'brain_memory_skill',
    {
      memories: input.memories,
      contextText: input.memoryContext,
      action: input.action || 'getRelevantContext',
    },
    input.memories.length
      ? `Loaded ${input.memories.length} relevant memory item(s).`
      : 'No relevant memory found.',
  ),
);

const intentAnalyzerSkill = createStaticSkill(
  metadata({
    id: 'intent_analyzer_skill',
    name: 'Intent Analyzer Skill',
    description: 'Converts raw user messages into structured intent for routing.',
    category: 'utility',
    trigger_keywords: ['intent', 'understand', 'classify', 'route'],
    examples: ['Classify this request before selecting skills.'],
    priority: 92,
    dependencies: ['brain_memory_skill'],
    safe_to_run_automatically: true,
  }),
  input => result(
    'intent_analyzer_skill',
    { intent: input.intent },
    `Intent detected as ${intentLine(input.intent)}.`,
  ),
);

const projectContextSkill = createStaticSkill(
  metadata({
    id: 'project_context_skill',
    name: 'Project Context Skill',
    description: 'Detects project context such as Phere, portfolio, website, app, or repo scope.',
    category: 'utility',
    trigger_keywords: ['phere', 'project', 'repo', 'website', 'portfolio', 'app', 'context'],
    examples: ['Detect that this is about Phere landing page work.'],
    priority: 84,
    dependencies: ['brain_memory_skill'],
    safe_to_run_automatically: true,
  }),
  input => result(
    'project_context_skill',
    {
      project: input.intent.project,
      context: input.intent.project === 'Phere'
        ? 'Phere is a mobile-first Indian wedding finance and planning PWA with local-first behavior.'
        : 'No specific project was confirmed; keep recommendations generic until repo context is inspected.',
      entities: input.intent.entities,
    },
    input.intent.project === 'Phere' ? 'Detected Phere project context.' : 'Project context remains general.',
  ),
);

const codingSkill = createStaticSkill(
  metadata({
    id: 'coding_skill',
    name: 'Coding Skill',
    description: 'Plans safe implementation, code analysis, debugging, and repo-aware engineering work.',
    category: 'coding',
    trigger_keywords: ['repo', 'code', 'feature', 'fix', 'debug', 'refactor', 'wire', 'module', 'implementation'],
    examples: ['Add this module safely to the repo.', 'Fix this code issue.'],
    priority: 80,
    dependencies: ['brain_memory_skill'],
    safe_to_run_automatically: true,
    safety_rules: ['Inspect files before edits.', 'Preserve unrelated worktree changes.'],
  }),
  input => result(
    'coding_skill',
    {
      checklist: [
        'Inspect current repo structure and contracts before edits.',
        'Keep changes scoped and additive.',
        'Add focused tests for routing and orchestration behavior.',
        'Run typecheck/build/test verification that matches risk.',
      ],
    },
    'Prepared repo-safe coding guidance.',
  ),
);

const codexPromptBuilderSkill = createStaticSkill(
  metadata({
    id: 'codex_prompt_builder_skill',
    name: 'Codex Prompt Builder Skill',
    description: 'Creates ready-to-paste implementation prompts for Codex or other coding agents.',
    category: 'codex_prompt',
    trigger_keywords: ['codex', 'prompt bana', 'implementation prompt', 'execution prompt', 'build prompt'],
    examples: ['Phere landing page improve karna hai and Codex prompt bana de.'],
    priority: 78,
    dependencies: ['brain_memory_skill'],
    safe_to_run_automatically: true,
  }),
  input => {
    const projectLine = input.intent.project === 'Phere'
      ? 'Project: Phere/Shaadikhata, a local-first Indian wedding finance and planning PWA.'
      : 'Project: current repo or product context from the user query.';

    return result(
      'codex_prompt_builder_skill',
      {
        prompt: [
          'You are Codex working as a senior product engineer.',
          projectLine,
          `User request: ${input.message}`,
          'First inspect the existing files and preserve unrelated worktree changes.',
          'Use the smallest safe implementation that satisfies the request.',
          'Do not claim tests/build/deploy passed without direct command evidence.',
          'Return changed files, verification performed, risks, and assumptions.',
        ].join('\n'),
      },
      'Built a ready-to-paste Codex implementation prompt.',
    );
  },
);

const uiuxSkill = createStaticSkill(
  metadata({
    id: 'uiux_skill',
    name: 'UI/UX Skill',
    description: 'Reviews product flows, layout clarity, hierarchy, mobile ergonomics, copy, and premium polish.',
    category: 'uiux',
    trigger_keywords: ['ui', 'ux', 'design', 'layout', 'landing page', 'hero', 'premium', 'mobile', 'flow'],
    examples: ['Improve Phere landing page UX.', 'Website layout ka audit karo.'],
    priority: 74,
    dependencies: ['brain_memory_skill'],
    safe_to_run_automatically: true,
  }),
  input => result(
    'uiux_skill',
    {
      recommendations: [
        'Make the primary user job visible in the first screen.',
        'Reduce decorative content when the task is operational.',
        'Keep mobile tap targets, empty states, and loading states clear.',
        'Use premium restraint: strong hierarchy, readable spacing, purposeful color.',
      ],
    },
    'Prepared UI/UX review guidance.',
  ),
);

const websiteOptimizationSkill = createStaticSkill(
  metadata({
    id: 'website_optimization_skill',
    name: 'Website Optimization Skill',
    description: 'Creates meaningful website optimization plans for performance, SEO, accessibility, layout, and conversion.',
    category: 'website_optimization',
    trigger_keywords: ['website', 'landing page', 'seo', 'performance', 'optimization', 'conversion', 'hero'],
    examples: ['Website ka full optimization plan bana.'],
    priority: 72,
    dependencies: ['project_context_skill'],
    safe_to_run_automatically: true,
  }),
  input => result(
    'website_optimization_skill',
    {
      plan: [
        'Clarify above-the-fold promise and primary CTA.',
        'Compress and lazy-load non-critical media.',
        'Check mobile layout, heading order, color contrast, and form labels.',
        'Measure bundle size before adding heavy visual libraries.',
        'Add trust signals only when they are real and verifiable.',
      ],
    },
    'Prepared website optimization plan.',
  ),
);

const watermelonUiSkill = createStaticSkill(
  metadata({
    id: 'watermelon_ui_skill',
    name: 'Watermelon UI Skill',
    description: 'Guides when and how to use Watermelon UI shadcn registry components in Tailwind CSS v4 projects.',
    category: 'uiux',
    trigger_keywords: watermelonTerms,
    examples: [
      'Use Watermelon UI card split accordian for a landing page FAQ.',
      'Add https://registry.watermelon.sh/r/card-split-accordian.json safely.',
      'Choose a shadcn registry component for a premium responsive UI section.',
    ],
    priority: 73,
    dependencies: ['uiux_skill'],
    safe_to_run_automatically: true,
    safety_rules: [
      'Use Watermelon UI only when the user needs a real UI component, not for every design request.',
      'Before install, verify Tailwind CSS v4 and shadcn components.json setup.',
      'Registry install or package changes should be handled by coding flow with normal repo verification.',
    ],
  }),
  input => result(
    'watermelon_ui_skill',
    {
      source: 'https://registry.watermelon.sh',
      install_command: 'npx shadcn@latest add https://registry.watermelon.sh/r/card-split-accordian.json',
      use_when: [
        'landing page FAQ or feature explanation sections',
        'premium responsive card/accordion UI',
        'existing shadcn/Tailwind v4 projects that need copied-in component ownership',
      ],
      setup_checks: [
        'Tailwind CSS v4 installed',
        'shadcn initialized with components.json',
        'Vite alias supports @/ imports',
      ],
    },
    'Selected Watermelon UI component guidance.',
  ),
);

const imageEditSkill = createStaticSkill(
  metadata({
    id: 'image_edit_skill',
    name: 'Image Edit Prompt Skill',
    description: 'Creates image edit prompts for photos, mockups, logos, posters, and hero visuals.',
    category: 'image_edit',
    trigger_keywords: ['image', 'photo', 'edit', 'mockup', 'poster', 'logo', 'hero image', 'background'],
    examples: ['Photo edit prompt bana.', 'Poster realistic banana hai.'],
    priority: 76,
    dependencies: ['brain_memory_skill'],
    safe_to_run_automatically: true,
  }),
  input => result(
    'image_edit_skill',
    {
      prompt_rules: [
        'Describe the desired change clearly.',
        'Preserve important subject details unless the user asks otherwise.',
        'Specify lighting, realism, background, and output usage.',
      ],
    },
    'Prepared image edit prompt rules.',
  ),
);

const identityPreservationSkill = createStaticSkill(
  metadata({
    id: 'identity_preservation_skill',
    name: 'Identity Preservation Skill',
    description: 'Adds strict face and identity preservation constraints to image edit prompts.',
    category: 'image_edit',
    trigger_keywords: ['face mat change', 'face change nahi', 'same face', 'identity', 'facial structure'],
    examples: ['Photo edit prompt bana, face change nahi hona chahiye.'],
    priority: 82,
    dependencies: ['image_edit_skill'],
    safe_to_run_automatically: true,
  }),
  input => result(
    'identity_preservation_skill',
    {
      constraints: [
        'Do not alter the person identity.',
        'Preserve facial structure, skin texture, age, expression, and unique features.',
        'Only change the requested background, styling, lighting, outfit, or composition.',
      ],
    },
    'Added face identity preservation constraints.',
  ),
);

const designPromptSkill = createStaticSkill(
  metadata({
    id: 'design_prompt_skill',
    name: 'Design Prompt Skill',
    description: 'Formats design, visual, and image prompts into clean production-ready wording.',
    category: 'design',
    trigger_keywords: ['prompt', 'design prompt', 'premium', 'realistic', 'clean', 'website-ready'],
    examples: ['Premium realistic website hero prompt banao.'],
    priority: 68,
    dependencies: ['image_edit_skill'],
    safe_to_run_automatically: true,
  }),
  input => result(
    'design_prompt_skill',
    {
      style: input.memoryContext.includes('premium')
        ? 'premium, minimal, clean, website-ready'
        : 'clear, realistic, polished, production-ready',
    },
    'Prepared visual prompt style.',
  ),
);

const academicSkill = createStaticSkill(
  metadata({
    id: 'academic_skill',
    name: 'Academic Skill',
    description: 'Creates academic assignment, viva, exam, theory, PDF, and question-answer material.',
    category: 'academic',
    trigger_keywords: ['viva', 'assignment', 'pdf', 'question answer', 'theory', 'exam', 'python'],
    examples: ['Python viva ke question answer Gujarati me bana.'],
    priority: 72,
    dependencies: ['brain_memory_skill'],
    safe_to_run_automatically: true,
  }),
  input => result(
    'academic_skill',
    {
      format: [
        'Question',
        'Short answer',
        'Simple explanation',
        'Example when useful',
      ],
      topic: includes(input.message, ['python']) ? 'Python' : 'academic topic from user query',
    },
    'Prepared academic Q&A format.',
  ),
);

const gujaratiLanguageSkill = createStaticSkill(
  metadata({
    id: 'gujarati_language_skill',
    name: 'Gujarati Language Skill',
    description: 'Formats academic or requested content in Gujarati-friendly language.',
    category: 'language',
    trigger_keywords: ['gujarati', 'gujrati', 'ગુજરાતી'],
    examples: ['Gujarati me viva answer banao.'],
    priority: 70,
    dependencies: ['academic_skill'],
    safe_to_run_automatically: true,
  }),
  input => result(
    'gujarati_language_skill',
    {
      language: 'gujarati',
      style: 'simple student-friendly Gujarati with clear exam/viva answers',
    },
    'Selected Gujarati answer style.',
  ),
);

const languageFormatterSkill = createStaticSkill(
  metadata({
    id: 'language_formatter_skill',
    name: 'Language Formatter Skill',
    description: 'Converts final output to Hinglish, English, Gujarati, Hindi, or the requested style.',
    category: 'language',
    trigger_keywords: ['hinglish', 'english', 'gujarati', 'hindi', 'language', 'style'],
    examples: ['Normal answers Hinglish me chahiye.'],
    priority: 64,
    dependencies: ['brain_memory_skill'],
    safe_to_run_automatically: true,
  }),
  input => result(
    'language_formatter_skill',
    {
      language: input.intent.language,
      memoryContext: input.memoryContext,
    },
    `Selected ${input.intent.language} language formatting.`,
  ),
);

const phereProductSkill = createStaticSkill(
  metadata({
    id: 'phere_product_skill',
    name: 'Phere Product Skill',
    description: 'Handles Phere app planning, landing pages, dashboards, features, wedding finance workflows, and launch planning.',
    category: 'product_planning',
    trigger_keywords: phereTerms,
    examples: ['Phere landing page improve karna hai.', 'Budget tracker flow plan karo.'],
    priority: 86,
    dependencies: ['project_context_skill'],
    safe_to_run_automatically: true,
  }),
  input => result(
    'phere_product_skill',
    {
      product_context: 'Mobile-first Indian wedding finance and planning PWA.',
      focus: [
        'Fast entry for family wedding spending.',
        'Clear kharcha, shagun, lena-dena, saman, vendors, guests, and reports workflows.',
        'Local-first behavior with optional Supabase sync.',
      ],
    },
    'Prepared Phere product context.',
  ),
);

const phereSupportReplySkill = createStaticSkill(
  metadata({
    id: 'phere_support_reply_skill',
    name: 'Phere Support Reply Skill',
    description: 'Creates short, simple, professional customer replies for Phere-related messages.',
    category: 'support_reply',
    trigger_keywords: ['phere customer', 'support reply', 'customer reply', 'short english', 'message'],
    examples: ['Phere customer ko short English reply dena hai.'],
    priority: 78,
    dependencies: ['brain_memory_skill'],
    safe_to_run_automatically: true,
  }),
  input => result(
    'phere_support_reply_skill',
    {
      reply_style: 'short, simple, professional English',
      fallback_reply: 'Thanks for reaching out. We will check this and update you shortly.',
    },
    'Prepared Phere support reply style.',
  ),
);

const shortEnglishWritingSkill = createStaticSkill(
  metadata({
    id: 'short_english_writing_skill',
    name: 'Short English Writing Skill',
    description: 'Keeps support and customer-facing replies short, clear, and simple in English.',
    category: 'language',
    trigger_keywords: ['short english', 'simple english', 'short reply', 'concise english'],
    examples: ['Customer ko short English me reply dena hai.'],
    priority: 66,
    dependencies: [],
    safe_to_run_automatically: true,
  }),
  input => result(
    'short_english_writing_skill',
    {
      style: 'short simple English',
      rules: ['Use one to three sentences.', 'Avoid overexplaining.', 'Sound polite and calm.'],
    },
    'Selected short English writing style.',
  ),
);

const finalResponseFormatterSkill = createStaticSkill(
  metadata({
    id: 'final_response_formatter_skill',
    name: 'Final Response Formatter Skill',
    description: 'Formats the merged response according to the user request, language, brevity, and output type.',
    category: 'formatter',
    trigger_keywords: ['format', 'final', 'answer', 'reply', 'prompt', 'plan'],
    examples: ['Return only the customer reply.', 'Give a step-by-step plan.'],
    priority: 60,
    dependencies: [],
    safe_to_run_automatically: true,
  }),
  input => result(
    'final_response_formatter_skill',
    {
      language: input.intent.language,
      output_type: input.intent.needs_prompt ? 'prompt' : input.intent.primary_intent,
    },
    'Prepared final response formatting.',
  ),
);

const phereAgentManagerSkill = createStaticSkill(
  metadata({
    id: 'phere_9_agent_manager_skill',
    name: 'Phere 9-Agent Manager Skill',
    description: 'Routes Phere/Shaadikhata engineering work through the repo-local 9-agent operating model and truthfulness gates.',
    category: 'product_planning',
    trigger_keywords: ['9-agent', 'agent manager', 'handoff', 'orchestrator', 'planner', 'tester', 'production gate', 'truthfulness'],
    examples: ['Use the Phere 9-Agent Manager to plan this release.'],
    priority: 62,
    dependencies: ['project_context_skill'],
    safe_to_run_automatically: true,
    safety_rules: ['Do not spawn real subagents unless explicitly requested.', 'Do not claim deployment or production status without evidence.'],
  }),
  input => result(
    'phere_9_agent_manager_skill',
    {
      roles: ['orchestrator', 'planner', 'product', 'frontend', 'backend', 'database', 'tester', 'production', 'security'],
      guidance: 'Use the smallest relevant agent set and keep claims evidence-based.',
    },
    'Mapped request to the Phere 9-Agent Manager operating model.',
  ),
);

const supabaseSkill = createStaticSkill(
  metadata({
    id: 'supabase_skill',
    name: 'Supabase Skill',
    description: 'Guides Supabase auth, RLS, storage, edge function, and API boundary work without performing live mutations automatically.',
    category: 'utility',
    trigger_keywords: ['supabase', 'auth', 'rls', 'edge function', 'storage bucket', 'realtime', 'migration'],
    examples: ['Add RLS policy review for this table.'],
    priority: 68,
    dependencies: ['brain_memory_skill'],
    safe_to_run_automatically: true,
    safety_rules: ['Require explicit approval before production SQL, deploys, secret rotation, or data deletion.'],
  }),
  input => result(
    'supabase_skill',
    {
      review_points: ['auth boundary', 'RLS policy', 'server-only secrets', 'edge function contract', 'rollback plan'],
    },
    'Prepared Supabase safety and architecture review points.',
  ),
);

const supabasePostgresBestPracticesSkill = createStaticSkill(
  metadata({
    id: 'supabase_postgres_best_practices_skill',
    name: 'Supabase Postgres Best Practices Skill',
    description: 'Reviews Postgres schema, index, query, migration, and RLS performance risks.',
    category: 'utility',
    trigger_keywords: ['postgres', 'sql', 'index', 'query performance', 'schema', 'migration', 'database performance'],
    examples: ['Review this migration for Postgres performance.'],
    priority: 66,
    dependencies: ['supabase_skill'],
    safe_to_run_automatically: true,
    safety_rules: ['Review migrations locally before any live database operation.'],
  }),
  input => result(
    'supabase_postgres_best_practices_skill',
    {
      checks: ['additive migration', 'RLS coverage', 'index selectivity', 'lock risk', 'query plan risk'],
    },
    'Prepared Postgres best-practice checks.',
  ),
);

const automationWorkerSkill = createStaticSkill(
  metadata({
    id: 'automation_worker_skill',
    name: 'Automation Worker Skill',
    description: 'Plans safe background worker, scheduled job, and automation flows from the local tools folder.',
    category: 'utility',
    trigger_keywords: ['automation worker', 'background worker', 'cron', 'scheduled job', 'digest', 'automation'],
    examples: ['Plan an automation worker for reminders.'],
    priority: 50,
    dependencies: ['coding_skill'],
    safe_to_run_automatically: true,
    safety_rules: ['Do not send emails, publish, or mutate external systems without approval.'],
  }),
  input => result(
    'automation_worker_skill',
    {
      checks: ['idempotency', 'retry behavior', 'auth secret boundary', 'dry-run mode', 'audit trail'],
    },
    'Prepared automation worker safety checks.',
  ),
);

const generalAssistantSkill = createStaticSkill(
  metadata({
    id: 'general_assistant_skill',
    name: 'General Assistant Skill',
    description: 'Handles simple messages directly without heavy orchestration.',
    category: 'utility',
    trigger_keywords: ['hello', 'hi', 'hey', 'thanks'],
    examples: ['Hello'],
    priority: 30,
    dependencies: [],
    safe_to_run_automatically: true,
  }),
  input => result(
    'general_assistant_skill',
    { message: 'direct_response' },
    'Handled as a simple direct response.',
  ),
);

const DEFAULT_SKILLS: Skill[] = [
  brainMemorySkill,
  intentAnalyzerSkill,
  projectContextSkill,
  codingSkill,
  codexPromptBuilderSkill,
  uiuxSkill,
  websiteOptimizationSkill,
  watermelonUiSkill,
  imageEditSkill,
  identityPreservationSkill,
  designPromptSkill,
  academicSkill,
  gujaratiLanguageSkill,
  languageFormatterSkill,
  phereProductSkill,
  phereSupportReplySkill,
  shortEnglishWritingSkill,
  finalResponseFormatterSkill,
  phereAgentManagerSkill,
  supabaseSkill,
  supabasePostgresBestPracticesSkill,
  automationWorkerSkill,
  generalAssistantSkill,
];

export class SkillRegistry {
  private readonly skills = new Map<string, Skill>();

  constructor(initialSkills: Skill[] = DEFAULT_SKILLS) {
    initialSkills.forEach(skill => this.register(skill));
  }

  register(skill: Skill) {
    this.skills.set(skill.metadata.id, skill);
  }

  get(skillId: string) {
    return this.skills.get(skillId);
  }

  list() {
    return [...this.skills.values()].sort((a, b) => b.metadata.priority - a.metadata.priority);
  }

  metadata() {
    return this.list().map(skill => skill.metadata);
  }
}

let cachedRegistry: SkillRegistry | null = null;

export function getSkillRegistry() {
  if (!cachedRegistry) cachedRegistry = new SkillRegistry();
  return cachedRegistry;
}

export function resetSkillRegistryForTests(skills: Skill[] = DEFAULT_SKILLS) {
  cachedRegistry = new SkillRegistry(skills);
  return cachedRegistry;
}
