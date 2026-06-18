import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const cliPath = path.join(repoRoot, 'tools', 'phere-9-agent-manager.mjs');

function runCli(args, env = {}) {
  return spawnSync(process.execPath, [cliPath, ...args], {
    cwd: repoRoot,
    encoding: 'utf8',
    env: { ...process.env, ...env },
  });
}

describe('Karynth AgentOS CLI', () => {
  it('lists client-facing agent names with internal role ids', () => {
    const result = runCli(['agentos:list']);

    expect(result.status).toBe(0);
    expect(result.stdout).toContain('Karynth AgentOS Agent Roster');
    expect(result.stdout).toContain('Command Director (orchestrator)');
    expect(result.stdout).toContain('Quality Sentinel (tester)');
    expect(result.stdout).toContain('Trust Guardian (security)');
  });

  it('prints the complete 21-repo research catalogue without duplicates', () => {
    const result = runCli(['agentos:research']);

    expect(result.status).toBe(0);
    expect(result.stdout).toContain('Unique repos: 21');
    for (const repo of [
      'teng-lin/notebooklm-py',
      'open-multi-agent/open-multi-agent',
      'dsifry/metaswarm',
      'langchain-ai/langgraph',
      'mastra-ai/mastra',
      'VoltAgent/voltagent',
      'openai/openai-agents-js',
      'mem0ai/mem0',
      'letta-ai/letta',
      'getzep/graphiti',
      'OpenHands/OpenHands',
      'getzep/zep',
      'letta-ai/letta-chatbot-example',
      'pinkpixel-dev/mem0-mcp',
      'AIAnytime/Agent-Memory-Playground',
      'raymondmdzz123/agent-memory',
      'ntbpy/AI_Agent_Memory_Techniques',
      'homgorn/graphiti-free-agent-memory-zep',
      'openaeon/OpenAEON',
      'swarmclawai/swarmvault',
      'sachitrafa/YourMemory',
    ]) {
      expect(result.stdout).toContain(repo);
    }
  });

  it('keeps local runtime and zero-investment guard as the default', () => {
    const result = runCli(['agentos:plan', 'Improve Saman performance']);

    expect(result.status).toBe(0);
    expect(result.stdout).toContain('Runtime: local');
    expect(result.stdout).toContain('Paid models allowed: no');
    expect(result.stdout).toContain('Experience Engineer (frontend)');
    expect(result.stdout).toContain('Performance Analyst (performance)');
    expect(result.stdout).toContain('Quality Sentinel (tester)');
  });

  it('selects VoltAgent only when explicitly configured', () => {
    const result = runCli(['agentos:plan', 'Improve Saman performance'], {
      AGENTOS_RUNTIME: 'voltagent',
      AGENTOS_ALLOW_PAID_MODELS: 'false',
    });

    expect(result.status).toBe(0);
    expect(result.stdout).toContain('Runtime: voltagent');
    expect(result.stdout).toContain('Paid models allowed: no');
  });

  it('verifies the optional VoltAgent adapter packages without running providers', () => {
    const result = runCli(['agentos:adapter']);

    expect(result.status).toBe(0);
    expect(result.stdout).toContain('@voltagent/core: installed');
    expect(result.stdout).toContain('@voltagent/logger: installed');
    expect(result.stdout).toContain('It does not import providers, call models, spawn workers, or spend money.');
  });
});
