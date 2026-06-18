import type { BrainMemorySkill } from '../brain/brain.skill';
import type { BrainMemoryInput } from '../brain/types';

export interface MemoryUpdateHookInput {
  brainSkill: BrainMemorySkill;
  message: string;
  answer: string;
  enabled: boolean;
  skip?: boolean;
}

export interface MemoryUpdateHookResult {
  saved: BrainMemoryInput[];
  warnings: string[];
}

export async function runMemoryUpdateHook(input: MemoryUpdateHookInput): Promise<MemoryUpdateHookResult> {
  if (!input.enabled || input.skip) return { saved: [], warnings: [] };
  if (!input.brainSkill.shouldRemember(input.message)) return { saved: [], warnings: [] };

  const extracted = await input.brainSkill.extractMemoriesFromConversation([
    { role: 'user', content: input.message },
  ]);
  const saved: BrainMemoryInput[] = [];
  const warnings: string[] = [];

  for (const memory of extracted) {
    const savedMemory = await input.brainSkill.addMemory(memory);
    if (savedMemory) {
      saved.push({
        content: savedMemory.content,
        category: savedMemory.category,
        tags: savedMemory.tags,
        source: savedMemory.source,
        confidence: savedMemory.confidence,
        is_approved: savedMemory.is_approved,
      });
    } else {
      warnings.push('A memory candidate was rejected by the sensitive-data filter.');
    }
  }

  return { saved, warnings };
}
