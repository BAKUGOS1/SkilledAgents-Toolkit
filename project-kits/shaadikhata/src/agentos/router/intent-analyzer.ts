import type { AssistantIntent, AssistantLanguage, AssistantProject, PrimaryIntent } from '../skills/types';

const includesAny = (text: string, words: string[]) =>
  words.some(word => text.includes(word.toLowerCase()));

const unique = <T>(items: T[]) => [...new Set(items)];

const phereTerms = [
  'phere',
  'shaadikhata',
  'wedding app',
  'wedding finance',
  'wedding planning',
  'app.wrkly.in',
  'family wedding',
  'budget tracker',
  'vendor payments',
  'shagun',
  'kharcha',
  'lena-dena',
  'saman',
  'timeline',
];

const imageTerms = ['image', 'photo', 'edit', 'face', 'same face', 'realistic', 'poster', 'mockup', 'logo', 'hero image', 'background'];
const academicTerms = ['viva', 'assignment', 'pdf', 'question answer', 'question-answer', 'theory', 'exam', 'academic', 'print'];
const supportTerms = ['customer reply', 'support', 'reply dena', 'message reply', 'customer ko', 'short english'];
const websiteTerms = ['website', 'landing page', 'hero', 'layout', 'conversion', 'seo', 'performance', 'mobile', 'ui', 'ux', 'optimize', 'optimization'];
const watermelonTerms = ['watermelon ui', 'watermelon', 'registry.watermelon.sh', 'card-split-accordian', 'card split accordian', 'shadcn registry', 'shadcn component'];
const promptTerms = ['prompt bana', 'codex prompt', 'implementation prompt', 'execution prompt', 'prompt banao', 'prompt de'];
const codingTerms = ['repo', 'code', 'feature', 'fix', 'debug', 'refactor', 'wire', 'module', 'api', 'test'];
const hinglishTerms = ['bana', 'banao', 'chahiye', 'karna', 'karke', 'mat', 'nahi', 'hai', 'ka', 'ke liye', 'mujhe', 'mere'];

function detectProject(text: string): AssistantProject {
  if (includesAny(text, phereTerms)) return 'Phere';
  if (includesAny(text, ['portfolio'])) return 'portfolio';
  if (includesAny(text, ['website', 'app', 'repo', 'project'])) return 'general';
  return 'unknown';
}

function detectLanguage(text: string): AssistantLanguage {
  if (includesAny(text, ['gujarati', 'gujrati', 'ગુજરાતી'])) return 'gujarati';
  if (includesAny(text, ['short english', 'simple english', 'english me', 'english mein'])) return 'english';
  if (includesAny(text, ['hindi', 'हिंदी'])) return 'hindi';
  if (includesAny(text, hinglishTerms)) return 'hinglish';
  return 'unknown';
}

function detectEntities(text: string) {
  const entities: string[] = [];
  if (includesAny(text, phereTerms)) entities.push('Phere');
  if (includesAny(text, ['python'])) entities.push('Python');
  if (includesAny(text, ['codex'])) entities.push('Codex');
  if (includesAny(text, ['website', 'landing page'])) entities.push('Website');
  if (includesAny(text, ['customer'])) entities.push('Customer');
  if (includesAny(text, ['memory', 'memories', 'brain'])) entities.push('Memory');
  if (includesAny(text, watermelonTerms)) entities.push('Watermelon UI');
  return unique(entities);
}

function detectPrimaryIntent(text: string): PrimaryIntent {
  if (includesAny(text, supportTerms)) return 'support_reply';
  if (includesAny(text, imageTerms)) return 'image_edit';
  if (includesAny(text, academicTerms)) return 'academic';
  if (includesAny(text, websiteTerms) && includesAny(text, ['optimize', 'optimization', 'improve', 'full optimization'])) {
    return 'website_optimization';
  }
  if (includesAny(text, ['ui', 'ux', 'layout', 'design', 'hero', 'landing page', 'premium']) || includesAny(text, watermelonTerms)) return 'uiux_review';
  if (includesAny(text, promptTerms)) return 'prompt_generation';
  if (includesAny(text, ['debug', 'bug', 'error', 'failing', 'fix'])) return 'debugging';
  if (includesAny(text, codingTerms)) return 'coding';
  if (includesAny(text, phereTerms)) return 'product_planning';
  return 'general';
}

function detectSecondary(text: string, primary: PrimaryIntent): PrimaryIntent[] {
  const intents: PrimaryIntent[] = [];
  if (includesAny(text, promptTerms) && primary !== 'prompt_generation') intents.push('prompt_generation');
  if (includesAny(text, codingTerms) && primary !== 'coding') intents.push('coding');
  if (includesAny(text, websiteTerms) && primary !== 'website_optimization') intents.push('website_optimization');
  if ((includesAny(text, ['ui', 'ux', 'layout', 'design', 'hero', 'premium']) || includesAny(text, watermelonTerms)) && primary !== 'uiux_review') intents.push('uiux_review');
  if (includesAny(text, phereTerms) && primary !== 'product_planning') intents.push('product_planning');
  return unique(intents);
}

function detectComplexity(raw: string, primary: PrimaryIntent) {
  const words = raw.trim().split(/\s+/).filter(Boolean).length;
  const simpleGreeting = /^(hi|hello|hey|thanks|thank you|ok|okay)$/i.test(raw.trim());
  if (simpleGreeting) return 'simple' as const;
  if (words <= 5 && primary === 'general') return 'simple' as const;
  if (words > 28 || includesAny(raw.toLowerCase(), ['full', 'complete', 'production', 'architecture', 'orchestrator', 'router'])) {
    return 'complex' as const;
  }
  return 'medium' as const;
}

function detectRiskFlags(text: string) {
  const flags: string[] = [];
  if (includesAny(text, ['delete all memories', 'delete memory', 'forget everything', 'remove all memories'])) flags.push('memory_delete');
  if (includesAny(text, ['delete file', 'remove file', 'drop table', 'deploy', 'publish', 'send email', 'make payment'])) flags.push('risky_action');
  if (includesAny(text, ['api key', 'password', 'token', 'otp', 'bank account'])) flags.push('sensitive_data');
  return flags;
}

export function analyzeIntent(message: string, memoryContext = ''): AssistantIntent {
  const raw = String(message || '').trim();
  const text = raw.toLowerCase();
  const primary = detectPrimaryIntent(text);
  const secondary = detectSecondary(text, primary);
  const project = detectProject(text);
  const language = detectLanguage(text);
  const riskFlags = detectRiskFlags(text);

  return {
    primary_intent: primary,
    secondary_intents: secondary,
    entities: detectEntities(text),
    project,
    language,
    needs_memory: primary !== 'general' || includesAny(text, ['remember', 'my style', 'preference', 'what i like']) || Boolean(memoryContext),
    needs_code: primary === 'coding' || primary === 'debugging' || secondary.includes('coding'),
    needs_file: includesAny(text, ['repo', 'file', 'pdf', 'image', 'photo', 'upload', 'component', 'registry']),
    needs_web: includesAny(text, ['latest', 'current', 'today', 'search web', 'browse', 'news']),
    needs_image: primary === 'image_edit' || includesAny(text, imageTerms),
    needs_prompt: primary === 'prompt_generation' || includesAny(text, promptTerms),
    urgency: includesAny(text, ['urgent', 'asap', 'jaldi', 'abhi']) ? 'high' : 'medium',
    complexity: detectComplexity(raw, primary),
    risk_flags: riskFlags,
  };
}
