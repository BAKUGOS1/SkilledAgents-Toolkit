import type { BrainMemoryInput, BrainMessage } from './types';
import { sanitizeMemoryContent } from './memory';

const textOf = (content: string) => content.replace(/\s+/g, ' ').trim();

const includesAny = (text: string, words: string[]) =>
  words.some(word => text.toLowerCase().includes(word.toLowerCase()));

function uniqueMemories(memories: BrainMemoryInput[]) {
  const seen = new Set<string>();
  return memories.filter(memory => {
    const key = `${memory.scope || 'user'}:${memory.project_id || ''}:${memory.run_id || ''}:${memory.category}:${memory.content.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function shouldRememberContent(content: string): boolean {
  const safe = sanitizeMemoryContent(content);
  if (safe.rejected) return false;

  const text = content.toLowerCase();
  const durableSignals = [
    'remember',
    'yaad rakh',
    'preference',
    'prefer',
    'pasand',
    'style',
    'hamesha',
    'always',
    'do not',
    'don\'t',
    'mat ',
    'nahi',
    'chahiye',
    'future',
    'next time',
    'phere',
    'agentos',
    'karynth',
    'nexusops',
    'notebooklm',
    'voltagent',
    'mastra',
    'skill',
    'router',
    'agent',
  ];

  return durableSignals.some(signal => text.includes(signal));
}

export function extractMemoriesFromText(content: string): BrainMemoryInput[] {
  const text = textOf(content);
  const lower = text.toLowerCase();
  const memories: BrainMemoryInput[] = [];
  const source = 'conversation' as const;

  if (includesAny(lower, ['normal answer hinglish', 'normal answers hinglish', 'hinglish me chahiye', 'hinglish mein chahiye'])) {
    memories.push({
      content: 'User prefers Hinglish for normal answers.',
      category: 'writing_style',
      tags: ['language', 'hinglish', 'normal-replies'],
      source,
      confidence: 0.95,
    });
  }

  if (lower.includes('phere') && includesAny(lower, ['short english', 'simple english']) && includesAny(lower, ['customer', 'support', 'reply'])) {
    memories.push({
      content: 'For Phere customer support messages, user prefers short and simple English replies.',
      category: 'writing_style',
      tags: ['phere', 'support', 'short-english'],
      source,
      confidence: 0.95,
    });
  }

  if (includesAny(lower, ['face mat change', 'face change nahi', 'face change nahin', 'face identity', 'facial structure']) && includesAny(lower, ['image', 'photo', 'edit', 'prompt'])) {
    memories.push({
      content: 'User prefers image edit prompts that preserve face identity and avoid changing facial structure.',
      category: 'design_style',
      tags: ['image-edit', 'face-preservation'],
      source,
      confidence: 0.95,
    });
  }

  if (includesAny(lower, ['gujarati']) && includesAny(lower, ['viva', 'assignment', 'exam', 'academic', 'pdf'])) {
    memories.push({
      content: 'For academic viva or assignment material, user sometimes prefers Gujarati answers.',
      category: 'preference',
      tags: ['academic', 'gujarati', 'viva'],
      source,
      confidence: 0.85,
    });
  }

  if (lower.includes('phere') && includesAny(lower, ['wedding finance', 'planning pwa', 'shaadikhata', 'wedding expense'])) {
    memories.push({
      content: 'User is building Phere, a wedding finance and planning PWA.',
      category: 'project',
      scope: 'project',
      project_id: 'phere-shaadikhata',
      tags: ['phere', 'shaadikhata', 'wedding-finance'],
      source,
      confidence: 0.9,
    });
  }

  if (includesAny(lower, ['karynth', 'agentos', 'nexusops']) && includesAny(lower, ['multi-project', 'multi project', 'client', 'enterprise', 'agent'])) {
    memories.push({
      content: 'Karynth AgentOS by NexusOps is the reusable multi-project agent layer over Phere agents.',
      category: 'project',
      scope: 'project',
      project_id: 'phere-shaadikhata',
      tags: ['karynth', 'agentos', 'nexusops', 'multi-project-agents'],
      source,
      confidence: 0.9,
    });
  }

  if (includesAny(lower, ['notebooklm']) && includesAny(lower, ['research', 'recharce', 'docs', 'source', 'summarize', 'optimize'])) {
    memories.push({
      content: 'Use NotebookLM as a research accelerator for approved Phere/Karynth docs, then verify implementation truth in local files and command output.',
      category: 'workflow',
      scope: 'project',
      project_id: 'phere-shaadikhata',
      tags: ['notebooklm', 'research', 'source-of-truth'],
      source,
      confidence: 0.9,
    });
  }

  if (includesAny(lower, ['free', 'local', 'zero investment', 'no paid', 'paid api', 'paid worker']) && includesAny(lower, ['agent', 'codex', 'worker', 'api'])) {
    memories.push({
      content: 'User prefers local/free Codex-first agent workflows and does not want hidden paid API workers unless explicitly approved.',
      category: 'workflow',
      scope: 'project',
      project_id: 'phere-shaadikhata',
      tags: ['local-first', 'zero-cost', 'codex', 'agentos'],
      source,
      confidence: 0.9,
    });
  }

  if (includesAny(lower, ['codex']) && includesAny(lower, ['autonomous', 'autonomously', 'khud', 'process sare agents', 'agents ke through', 'agents ke trows'])) {
    memories.push({
      content: 'User wants Codex to work autonomously through the selected agent process inside the current session when feasible.',
      category: 'workflow',
      scope: 'project',
      project_id: 'phere-shaadikhata',
      tags: ['codex', 'autonomous-mode', 'agent-process'],
      source,
      confidence: 0.9,
    });
  }

  if (includesAny(lower, ['agent ka name', 'agent name', 'name me role', 'role bhi', 'command director', 'orchestrator'])) {
    memories.push({
      content: 'User prefers client-facing agent names that include or clearly reveal the role, like Command Director (orchestrator).',
      category: 'preference',
      tags: ['agent-names', 'role-labels', 'client-facing'],
      source,
      confidence: 0.9,
    });
  }

  if (includesAny(lower, ['premium', 'minimal', 'clean', 'website-ready']) && includesAny(lower, ['design', 'ui', 'website'])) {
    memories.push({
      content: 'User prefers premium, minimal, clean, website-ready design.',
      category: 'design_style',
      tags: ['premium', 'minimal', 'clean-ui'],
      source,
      confidence: 0.9,
    });
  }

  if (includesAny(lower, ['codex']) && includesAny(lower, ['implementation prompt', 'coding implementation', 'execution prompt'])) {
    memories.push({
      content: 'User uses Codex for coding implementation prompts and execution-ready engineering work.',
      category: 'workflow',
      tags: ['codex', 'implementation-prompts'],
      source,
      confidence: 0.85,
    });
  }

  if (includesAny(lower, ['skill router', 'automatic skill wiring', 'auto skill', 'when to use which skill'])) {
    memories.push({
      content: 'User has many skills and wants automatic skill wiring later, with clear rules for when to use each skill.',
      category: 'skill_rule',
      tags: ['skills', 'router', 'orchestration'],
      source,
      confidence: 0.85,
    });
  }

  if (!memories.length && shouldRememberContent(text)) {
    memories.push({
      content: text,
      category: lower.includes('don\'t') || lower.includes('do not') || lower.includes('mat ') ? 'correction' : 'preference',
      tags: ['manual-review'],
      source,
      confidence: 0.6,
    });
  }

  return uniqueMemories(memories).filter(memory => !sanitizeMemoryContent(memory.content).rejected);
}

export function extractMemoriesFromMessages(messages: BrainMessage[] = []): BrainMemoryInput[] {
  const userMessages = (Array.isArray(messages) ? messages : [])
    .filter(message => message?.role === 'user' && typeof message.content === 'string')
    .map(message => message.content);

  return uniqueMemories(userMessages.flatMap(extractMemoriesFromText));
}
