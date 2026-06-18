import { beforeEach, describe, expect, it } from 'vitest';
import { createBrainSkill } from './brain.skill';

const memoryPath = '.data/brain-memory-test.json';

async function resetMemoryFile() {
  try {
    const fs = await import('node:fs/promises');
    await fs.rm(memoryPath, { force: true });
  } catch {}
}

describe('Brain Memory Skill', () => {
  beforeEach(async () => {
    await resetMemoryFile();
  });

  it('extracts and saves Hinglish writing style memory', async () => {
    const brain = createBrainSkill({ provider: 'json', memoryPath });
    const extracted = await brain.extractMemoriesFromConversation([
      { role: 'user', content: 'Mujhe normal answer Hinglish me chahiye.' },
    ]);

    expect(extracted[0]).toMatchObject({
      category: 'writing_style',
      content: 'User prefers Hinglish for normal answers.',
    });

    const saved = await brain.addMemory(extracted[0]);
    expect(saved?.category).toBe('writing_style');
  });

  it('extracts image edit face-preservation design memory', async () => {
    const brain = createBrainSkill({ provider: 'json', memoryPath });
    const extracted = await brain.extractMemoriesFromConversation([
      { role: 'user', content: 'Face mat change karna image edit me.' },
    ]);

    expect(extracted[0]).toMatchObject({
      category: 'design_style',
      tags: ['image-edit', 'face-preservation'],
    });
  });

  it('rejects sensitive API key memories', async () => {
    const brain = createBrainSkill({ provider: 'json', memoryPath });
    const saved = await brain.addMemory('My API key is sk-xxxxx');

    expect(saved).toBeNull();
    expect(brain.sanitizeMemory('My API key is sk-xxxxx')).toMatchObject({
      rejected: true,
      isSensitive: true,
    });
  });

  it('returns short English Phere support memory for customer reply searches', async () => {
    const brain = createBrainSkill({ provider: 'json', memoryPath });
    await brain.addMemory({
      content: 'For Phere customer support messages, user prefers short and simple English replies.',
      category: 'writing_style',
      tags: ['phere', 'support', 'short-english'],
      confidence: 0.95,
    });

    const results = await brain.searchMemory('Phere customer reply style');
    expect(results[0].content).toContain('short and simple English');
  });

  it('returns face preservation memory for image edit preference searches', async () => {
    const brain = createBrainSkill({ provider: 'json', memoryPath });
    await brain.addMemory({
      content: 'User prefers image edit prompts that preserve face identity and avoid changing facial structure.',
      category: 'design_style',
      tags: ['image-edit', 'face-preservation'],
      confidence: 0.95,
    });

    const context = await brain.getRelevantContext('Image edit preference');
    expect(context.contextText).toContain('preserve face identity');
  });

  it('queues project decisions for approval before long-term context use', async () => {
    const brain = createBrainSkill({ provider: 'json', memoryPath });
    const saved = await brain.addMemory({
      content: 'Karynth AgentOS should keep paid model providers blocked by default.',
      category: 'decision',
      scope: 'project',
      tags: ['karynth', 'agentos', 'cost-control'],
      confidence: 0.95,
    });

    expect(saved).toMatchObject({
      scope: 'project',
      project_id: 'phere-shaadikhata',
      is_approved: false,
      requires_approval: true,
    });

    const context = await brain.getRelevantContext('Karynth AgentOS paid model policy');
    expect(context.contextText).not.toContain('paid model providers blocked');
  });

  it('uses approved project-scoped memories in relevant context', async () => {
    const brain = createBrainSkill({
      provider: 'json',
      memoryPath,
      projectDecisionApprovalRequired: false,
    });
    await brain.addMemory({
      content: 'Use NotebookLM as a research accelerator, then verify local files.',
      category: 'workflow',
      scope: 'project',
      tags: ['notebooklm', 'research'],
      confidence: 0.95,
    });

    const context = await brain.getRelevantContext('NotebookLM research flow');
    expect(context.contextText).toContain('verify local files');
  });

  it('deduplicates repeated memories instead of storing duplicates', async () => {
    const brain = createBrainSkill({ provider: 'json', memoryPath });
    await brain.addMemory({
      content: 'User prefers Hinglish for normal answers.',
      category: 'writing_style',
      tags: ['hinglish'],
    });
    await brain.addMemory({
      content: 'User prefers Hinglish for normal answers.',
      category: 'writing_style',
      tags: ['normal-replies'],
    });

    const memories = await brain.listMemories({ approvedOnly: false });
    expect(memories).toHaveLength(1);
    expect(memories[0].tags).toEqual(expect.arrayContaining(['hinglish', 'normal-replies']));
  });

  it('extracts Karynth AgentOS and NotebookLM workflow memories', async () => {
    const brain = createBrainSkill({ provider: 'json', memoryPath });
    const extracted = await brain.extractMemoriesFromConversation([
      {
        role: 'user',
        content: 'Karynth AgentOS multi-project agents me NotebookLM research bhi use karna, but local files verify karna.',
      },
    ]);

    expect(extracted).toEqual(expect.arrayContaining([
      expect.objectContaining({
        category: 'project',
        scope: 'project',
        tags: expect.arrayContaining(['karynth', 'agentos']),
      }),
      expect.objectContaining({
        category: 'workflow',
        scope: 'project',
        tags: expect.arrayContaining(['notebooklm', 'research']),
      }),
    ]));
  });

  it('uses current Mem0 V3 add, search, and list endpoints when configured', async () => {
    const originalFetch = globalThis.fetch;
    const calls: Array<{ url: string; body: any }> = [];
    globalThis.fetch = (async (url: RequestInfo | URL, init?: RequestInit) => {
      const requestUrl = String(url);
      const body = init?.body ? JSON.parse(String(init.body)) : null;
      calls.push({ url: requestUrl, body });

      if (requestUrl.includes('/v3/memories/add/')) {
        return new Response(JSON.stringify({ status: 'PENDING', event_id: 'evt-test' }), { status: 200 });
      }

      return new Response(JSON.stringify({
        results: [{
          id: 'mem-test',
          memory: 'User prefers Hinglish for normal answers.',
          score: 0.92,
          metadata: {
            category: 'writing_style',
            scope: 'user',
            tags: ['hinglish'],
            is_approved: true,
          },
          created_at: '2026-06-03T00:00:00.000Z',
          updated_at: '2026-06-03T00:00:00.000Z',
        }],
      }), { status: 200 });
    }) as typeof fetch;

    try {
      const brain = createBrainSkill({
        provider: 'mem0',
        fallback: 'json',
        apiKey: 'm0-test',
        baseUrl: 'https://api.mem0.ai',
        userId: 'phere-user',
        memoryPath,
      });

      await brain.addMemory({
        content: 'User prefers Hinglish for normal answers.',
        category: 'writing_style',
        tags: ['hinglish'],
      });
      const results = await brain.searchMemory('Hinglish style');
      const listed = await brain.listMemories();

      expect(calls[0].url).toContain('/v3/memories/add/');
      expect(calls[0].body).toMatchObject({
        user_id: 'phere-user',
        metadata: { category: 'writing_style', scope: 'user' },
      });
      expect(calls[1].url).toContain('/v3/memories/search/');
      expect(calls[1].body).toMatchObject({
        query: 'Hinglish style',
        filters: { user_id: 'phere-user' },
      });
      expect(calls[2].url).toContain('/v3/memories/?page=1&page_size=100');
      expect(calls[2].body).toMatchObject({ filters: { user_id: 'phere-user' } });
      expect(results[0].content).toContain('Hinglish');
      expect(listed[0].id).toBe('mem-test');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
