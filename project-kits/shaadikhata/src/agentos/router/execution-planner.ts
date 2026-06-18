import type { ExecutionStep, RoutedSkill } from '../skills/types';

function actionFor(skillId: string) {
  if (skillId === 'brain_memory_skill') return 'getRelevantContext';
  if (skillId === 'final_response_formatter_skill') return 'formatFinalResponse';
  return 'run';
}

function inputFrom(step: number, skillId: string) {
  if (skillId === 'brain_memory_skill') return 'user_query';
  if (step <= 2) return 'brain_memory_skill.output';
  return 'previous_step.output';
}

export function createExecutionPlan(selectedSkills: RoutedSkill[]): ExecutionStep[] {
  const ordered = [...selectedSkills].sort((a, b) => a.order_hint - b.order_hint);
  const steps = ordered.map((skill, index) => ({
    step: index + 1,
    skill_id: skill.skill_id,
    action: actionFor(skill.skill_id),
    input_from: inputFrom(index + 1, skill.skill_id),
    parallel_group: null,
    requires_approval: Boolean(skill.requires_approval),
  }));

  const lastStep = steps.length + 1;
  return [
    ...steps,
    {
      step: lastStep,
      skill_id: 'brain_memory_skill',
      action: 'extractAndSaveMemories',
      input_from: 'final_response',
      parallel_group: null,
      requires_approval: false,
    },
  ];
}
