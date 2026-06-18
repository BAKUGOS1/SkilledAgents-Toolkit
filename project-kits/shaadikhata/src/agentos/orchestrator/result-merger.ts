import type {
  AssistantIntent,
  SkillRunResult,
} from '../skills/types';
import type { BrainMemory } from '../brain/types';

export interface MergeResultInput {
  message: string;
  intent: AssistantIntent;
  memories: BrainMemory[];
  memoryContext: string;
  skillOutputs: SkillRunResult[];
  warnings: string[];
}

const getOutput = <T = any>(outputs: SkillRunResult[], skillId: string): T | null =>
  (outputs.find(output => output.skill_id === skillId && output.success)?.output as T | undefined) || null;

const wantsHinglish = (intent: AssistantIntent, memories: BrainMemory[]) =>
  intent.language === 'hinglish' ||
  memories.some(memory => /hinglish/i.test(memory.content));

function approvalAnswer() {
  return 'This is a risky action. I need explicit approval before deleting memories, files, data, deployments, emails, payments, or other irreversible items.';
}

function mergeImagePrompt(input: MergeResultInput) {
  const identity = getOutput<{ constraints?: string[] }>(input.skillOutputs, 'identity_preservation_skill');
  const style = getOutput<{ style?: string }>(input.skillOutputs, 'design_prompt_skill')?.style || 'realistic, polished, production-ready';
  const constraints = identity?.constraints || [];

  return [
    'Edit the provided image with a realistic, premium finish.',
    `Style: ${style}.`,
    constraints.length
      ? `Identity lock: ${constraints.join(' ')}`
      : 'Preserve the main subject and avoid unnecessary changes.',
    'Change only the requested elements. Keep lighting, details, and composition natural.',
  ].join('\n');
}

function mergeCodexPrompt(input: MergeResultInput) {
  const prompt = getOutput<{ prompt?: string }>(input.skillOutputs, 'codex_prompt_builder_skill')?.prompt;
  if (prompt) return prompt;

  return [
    'You are Codex working as a senior product engineer.',
    `User request: ${input.message}`,
    'Inspect the repo first, preserve unrelated changes, make scoped edits, add tests, and report verification.',
  ].join('\n');
}

function mergeAcademic(input: MergeResultInput) {
  if (input.intent.language === 'gujarati') {
    return [
      'Python viva Q&A Gujarati style:',
      '1. Question: Python shu che?',
      '   Answer: Python ek simple ane popular programming language che. Te web development, automation, data analysis ane AI ma use thay che.',
      '2. Question: Variable shu che?',
      '   Answer: Variable data store karva mate nu naam che.',
      '3. Question: List shu che?',
      '   Answer: List ek ordered collection che jema multiple values store kari shakay che.',
    ].join('\n');
  }

  return [
    'Use this academic format:',
    '1. Question',
    '2. Short answer',
    '3. Simple explanation',
    '4. Small example when useful',
  ].join('\n');
}

function mergeWebsitePlan(input: MergeResultInput) {
  return [
    wantsHinglish(input.intent, input.memories)
      ? 'website optimization plan ke liye yeh practical steps follow karo:'
      : 'Use this practical website optimization plan:',
    '1. Clarify the first-screen promise, primary CTA, and user outcome.',
    '2. Tighten mobile layout, spacing, heading hierarchy, and trust cues.',
    '3. Improve loading by compressing media, lazy-loading non-critical assets, and checking bundle size.',
    '4. Add accessibility basics: labels, focus states, contrast, keyboard flow, and readable text.',
    '5. Improve conversion only with real proof: screenshots, testimonials, pricing, or product workflow evidence.',
  ].join('\n');
}

function mergeSupportReply(input: MergeResultInput) {
  const reply = getOutput<{ fallback_reply?: string }>(input.skillOutputs, 'phere_support_reply_skill')?.fallback_reply;
  return reply || 'Thanks for reaching out. We will check this and update you shortly.';
}

function mergeSimple(input: MergeResultInput) {
  return wantsHinglish(input.intent, input.memories)
    ? 'Haan, bolo. Main ready hoon.'
    : 'Hi. Tell me what you want to work on.';
}

export function mergeSkillOutputs(input: MergeResultInput) {
  if (input.intent.risk_flags.length) return approvalAnswer();
  if (input.intent.primary_intent === 'image_edit') return mergeImagePrompt(input);
  if (input.intent.primary_intent === 'academic') return mergeAcademic(input);
  if (input.intent.primary_intent === 'support_reply') return mergeSupportReply(input);
  if (input.intent.needs_prompt) return mergeCodexPrompt(input);
  if (input.intent.primary_intent === 'website_optimization' || input.intent.primary_intent === 'uiux_review') {
    return mergeWebsitePlan(input);
  }
  if (input.intent.complexity === 'simple') return mergeSimple(input);

  const summaries = input.skillOutputs
    .filter(output => output.success && output.summary)
    .map(output => output.summary);

  if (!summaries.length) {
    return wantsHinglish(input.intent, input.memories)
      ? 'Samajh gaya. Is request ke liye main direct answer de sakta hoon.'
      : 'Understood. I can answer this directly.';
  }

  return summaries.join('\n');
}
