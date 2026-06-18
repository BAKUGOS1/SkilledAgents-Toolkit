import { describe, expect, it, beforeEach } from 'vitest';
import { createBrainSkill } from '../brain';
import { runAssistant } from './skill-orchestrator';

const skillIds = (result: Awaited<ReturnType<typeof runAssistant>>) =>
  result.selected_skills.map(skill => skill.skill_id);

const makeBrain = () => createBrainSkill({
  provider: 'json',
  fallback: 'json',
  memoryPath: `.data/test-brain-${Date.now()}-${Math.random().toString(36).slice(2)}.json`,
  autoSave: true,
  approvalRequired: false,
  debug: true,
});

describe('skill orchestrator routing', () => {
  let brain: ReturnType<typeof createBrainSkill>;

  beforeEach(() => {
    brain = makeBrain();
  });

  it('routes Phere Codex prompt requests through project, product, prompt, and formatter skills', async () => {
    const result = await runAssistant(
      { message: 'Mere Phere app ke liye Codex prompt bana', mode: 'debug' },
      { brain, config: { enableMemoryUpdate: false } },
    );

    expect(skillIds(result)).toEqual(expect.arrayContaining([
      'brain_memory_skill',
      'project_context_skill',
      'phere_product_skill',
      'codex_prompt_builder_skill',
      'final_response_formatter_skill',
    ]));
    expect(result.answer).toContain('You are Codex');
  });

  it('routes image edit prompts with face preservation constraints', async () => {
    const result = await runAssistant(
      { message: 'Photo edit prompt bana, face change nahi hona chahiye', mode: 'debug' },
      { brain, config: { enableMemoryUpdate: false } },
    );

    expect(skillIds(result)).toEqual(expect.arrayContaining([
      'brain_memory_skill',
      'image_edit_skill',
      'identity_preservation_skill',
      'design_prompt_skill',
      'final_response_formatter_skill',
    ]));
    expect(result.answer).toContain('Identity lock');
  });

  it('routes Python viva Gujarati requests through academic and Gujarati skills', async () => {
    const result = await runAssistant(
      { message: 'Python viva ke question answer Gujarati me bana', mode: 'debug' },
      { brain, config: { enableMemoryUpdate: false } },
    );

    expect(skillIds(result)).toEqual(expect.arrayContaining([
      'brain_memory_skill',
      'academic_skill',
      'gujarati_language_skill',
      'final_response_formatter_skill',
    ]));
    expect(result.answer).toContain('Python viva');
  });

  it('routes Phere customer replies through support and short English skills', async () => {
    const result = await runAssistant(
      { message: 'Phere customer ko short English reply dena hai', mode: 'debug' },
      { brain, config: { enableMemoryUpdate: false } },
    );

    expect(skillIds(result)).toEqual(expect.arrayContaining([
      'brain_memory_skill',
      'phere_support_reply_skill',
      'short_english_writing_skill',
      'final_response_formatter_skill',
    ]));
    expect(result.answer).toBe('Thanks for reaching out. We will check this and update you shortly.');
  });

  it('routes website optimization through project context, UI/UX, optimization, and formatter skills', async () => {
    const result = await runAssistant(
      { message: 'Website ka full optimization plan bana', mode: 'debug' },
      { brain, config: { enableMemoryUpdate: false } },
    );

    expect(skillIds(result)).toEqual(expect.arrayContaining([
      'brain_memory_skill',
      'project_context_skill',
      'uiux_skill',
      'website_optimization_skill',
      'final_response_formatter_skill',
    ]));
    expect(result.answer).toContain('website optimization plan');
  });

  it('routes Watermelon UI component requests through the Watermelon UI skill', async () => {
    const result = await runAssistant(
      { message: 'Phere landing page FAQ me Watermelon UI card-split-accordian use karna hai', mode: 'debug' },
      { brain, config: { enableMemoryUpdate: false } },
    );

    expect(skillIds(result)).toEqual(expect.arrayContaining([
      'brain_memory_skill',
      'project_context_skill',
      'phere_product_skill',
      'uiux_skill',
      'watermelon_ui_skill',
      'final_response_formatter_skill',
    ]));
  });

  it('routes repo feature Codex prompts through coding and Codex prompt skills', async () => {
    const result = await runAssistant(
      { message: 'Is repo me feature add karne ka Codex prompt bana', mode: 'debug' },
      { brain, config: { enableMemoryUpdate: false } },
    );

    expect(skillIds(result)).toEqual(expect.arrayContaining([
      'brain_memory_skill',
      'coding_skill',
      'codex_prompt_builder_skill',
      'final_response_formatter_skill',
    ]));
    expect(result.answer).toContain('preserve unrelated worktree changes');
  });

  it('keeps simple greetings out of heavy skill chains', async () => {
    const result = await runAssistant(
      { message: 'Hello', mode: 'debug' },
      { brain, config: { enableMemoryUpdate: false } },
    );

    expect(skillIds(result)).toEqual(['brain_memory_skill', 'final_response_formatter_skill']);
    expect(result.skill_outputs.length).toBeLessThanOrEqual(2);
  });

  it('requires approval before destructive memory deletion', async () => {
    const result = await runAssistant(
      { message: 'Delete all memories', mode: 'debug' },
      { brain, config: { enableMemoryUpdate: false } },
    );

    expect(skillIds(result)).toEqual(expect.arrayContaining([
      'brain_memory_skill',
      'final_response_formatter_skill',
    ]));
    expect(result.warnings).toContain('Approval required before running risky or destructive actions.');
    expect(result.answer).toContain('explicit approval');
  });
});
