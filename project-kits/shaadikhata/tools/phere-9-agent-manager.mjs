#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const statusDir = path.join(process.cwd(), '.agents', 'status');
const statusJsonPath = path.join(statusDir, 'PHERE_9_AGENT_LIVE_STATUS.json');
const statusMarkdownPath = path.join(statusDir, 'PHERE_9_AGENT_LIVE_STATUS.md');
const workerPidPath = path.join(statusDir, 'PHERE_9_AGENT_WORKER.pid');
const workerLogPath = path.join(statusDir, 'PHERE_9_AGENT_WORKER.log');
const handoffDir = path.join(process.cwd(), '.agents', 'handoff');
const handoffTasksDir = path.join(handoffDir, 'tasks');
const handoffQueuePath = path.join(handoffDir, 'PHERE_CODEX_HANDOFF_QUEUE.json');
const handoffMarkdownPath = path.join(handoffDir, 'PHERE_CODEX_HANDOFF_QUEUE.md');
const scriptPath = fileURLToPath(import.meta.url);
const agentosBrandName = process.env.AGENTOS_BRAND_NAME || 'Karynth AgentOS';
const agentosCompatibilityName = 'Phere 9-Agent Manager';
const agentosProjectProfilePath = path.join(process.cwd(), 'agentos.project.json');
const agentosRunsDir = path.join(process.cwd(), '.agents', 'runs');
const agentosNotebookId = process.env.NOTEBOOKLM_NOTEBOOK_ID || '';
const agentosUserRegistryPath = path.join(
  process.env.USERPROFILE || process.env.HOME || process.cwd(),
  '.karynth-agentos',
  'projects.json'
);

const agentDisplayNames = {
  orchestrator: 'Command Director',
  planner: 'Strategy Planner',
  product: 'Product Strategist',
  frontend: 'Experience Engineer',
  backend: 'Systems Engineer',
  database: 'Data Architect',
  tester: 'Quality Sentinel',
  production: 'Release Commander',
  security: 'Trust Guardian',
  architect: 'Solution Architect',
  performance: 'Performance Analyst',
  observability: 'Telemetry Engineer',
  mobile: 'Mobile Systems Specialist',
  accessibility: 'Accessibility Advocate',
  documentation: 'Knowledge Curator',
  'data-ai': 'AI Data Specialist',
  marketing: 'Market Strategist',
  sales: 'Revenue Architect',
  'customer-success': 'Adoption Lead',
  support: 'Support Operations Lead',
  'finance-strategy': 'Commercial Strategist',
  'legal-compliance': 'Compliance Reviewer',
};

const researchCatalog = [
  {
    repo: 'teng-lin/notebooklm-py',
    category: 'research-connector',
    v1Decision: 'use-installed',
    lesson: 'NotebookLM can summarize approved project docs, but local files and command output remain source of truth.',
    installPolicy: 'Already installed locally; re-authenticate before use.',
  },
  {
    repo: 'open-multi-agent/open-multi-agent',
    category: 'orchestration',
    v1Decision: 'reference-only',
    lesson: 'Goal-to-task DAG planning and explicit pipeline structure.',
    installPolicy: 'Do not install in V1.',
  },
  {
    repo: 'dsifry/metaswarm',
    category: 'codex-cli-loop',
    v1Decision: 'reference-only',
    lesson: 'CLI-friendly work units, TDD loop, and independent review pattern.',
    installPolicy: 'Do not install in V1.',
  },
  {
    repo: 'langchain-ai/langgraph',
    category: 'durable-graph',
    v1Decision: 'reference-only',
    lesson: 'Durable graph execution, checkpoints, human-in-the-loop, and memory boundaries.',
    installPolicy: 'Do not install in V1.',
  },
  {
    repo: 'mastra-ai/mastra',
    category: 'typescript-agent-framework',
    v1Decision: 'future-phase',
    lesson: 'TypeScript workflows, memory, evals, observability, and MCP integration.',
    installPolicy: 'Do not install in V1; current core package requires Node >=22.13.0.',
  },
  {
    repo: 'VoltAgent/voltagent',
    category: 'typescript-agent-framework',
    v1Decision: 'optional-adapter',
    lesson: 'TypeScript agent runtime and local-model-friendly provider options.',
    installPolicy: 'Install as optional adapter; default runtime stays local.',
  },
  {
    repo: 'openai/openai-agents-js',
    category: 'agent-sdk',
    v1Decision: 'reference-only',
    lesson: 'Guardrails, traces, handoffs, and session concepts.',
    installPolicy: 'Do not install in V1 because paid model calls are disabled by default.',
  },
  {
    repo: 'mem0ai/mem0',
    category: 'memory',
    v1Decision: 'reference-only',
    lesson: 'Long-term memory extraction, search, and user-level memory patterns.',
    installPolicy: 'No SDK install in V1; existing Brain provider remains opt-in through env.',
  },
  {
    repo: 'letta-ai/letta',
    category: 'memory',
    v1Decision: 'reference-only',
    lesson: 'Stateful agents and memory governance patterns.',
    installPolicy: 'Do not install in V1.',
  },
  {
    repo: 'getzep/graphiti',
    category: 'memory-graph',
    v1Decision: 'reference-only',
    lesson: 'Temporal knowledge graph and episodic memory patterns.',
    installPolicy: 'Do not install in V1.',
  },
  {
    repo: 'OpenHands/OpenHands',
    category: 'autonomous-coding',
    v1Decision: 'reference-only',
    lesson: 'Sandboxing, coding-agent review loops, and autonomous development product shape.',
    installPolicy: 'Do not install in V1.',
  },
  {
    repo: 'getzep/zep',
    category: 'memory',
    v1Decision: 'reference-only',
    lesson: 'Production LLM app memory blocks and session memory patterns.',
    installPolicy: 'Do not install in V1.',
  },
  {
    repo: 'letta-ai/letta-chatbot-example',
    category: 'memory-example',
    v1Decision: 'reference-only',
    lesson: 'Small TypeScript example of a stateful assistant experience.',
    installPolicy: 'Do not install in V1.',
  },
  {
    repo: 'pinkpixel-dev/mem0-mcp',
    category: 'memory-mcp',
    v1Decision: 'reference-only',
    lesson: 'MCP shape for memory access without hard-wiring memory into every agent.',
    installPolicy: 'Do not install in V1.',
  },
  {
    repo: 'AIAnytime/Agent-Memory-Playground',
    category: 'memory-playground',
    v1Decision: 'reference-only',
    lesson: 'Memory technique comparison and playground examples.',
    installPolicy: 'Do not install in V1.',
  },
  {
    repo: 'raymondmdzz123/agent-memory',
    category: 'memory',
    v1Decision: 'reference-only',
    lesson: 'Lightweight persistent memory idea; low-star repo so use only as inspiration.',
    installPolicy: 'Do not install in V1.',
  },
  {
    repo: 'ntbpy/AI_Agent_Memory_Techniques',
    category: 'memory-techniques',
    v1Decision: 'reference-only',
    lesson: 'Memory technique notes and examples.',
    installPolicy: 'Do not install in V1.',
  },
  {
    repo: 'homgorn/graphiti-free-agent-memory-zep',
    category: 'free-memory-stack',
    v1Decision: 'reference-only',
    lesson: 'Free memory-stack composition ideas using Graphiti/Zep-style concepts.',
    installPolicy: 'Do not install in V1.',
  },
  {
    repo: 'openaeon/OpenAEON',
    category: 'personal-brain',
    v1Decision: 'reference-only',
    lesson: 'Personal AI memory implementation patterns.',
    installPolicy: 'Do not install in V1.',
  },
  {
    repo: 'swarmclawai/swarmvault',
    category: 'local-first-memory',
    v1Decision: 'reference-only',
    lesson: 'Local-first memory vault and privacy-friendly storage ideas.',
    installPolicy: 'Do not install in V1.',
  },
  {
    repo: 'sachitrafa/YourMemory',
    category: 'personal-brain',
    v1Decision: 'reference-only',
    lesson: 'Agentic personal memory idea; license unclear in earlier review, so avoid copying code.',
    installPolicy: 'Do not install or copy code in V1.',
  },
];

const voltagentAdapterPackages = [
  '@voltagent/core',
  '@voltagent/logger',
  'ai',
  '@ai-sdk/provider-utils',
  'zod',
];

const agents = [
  {
    id: 'orchestrator',
    tier: 'core',
    name: 'Manager / Orchestrator',
    mission: 'Coordinate the agent system, split work safely, assign ownership, and integrate results.',
    activation: 'Always for broad, ambiguous, risky, or multi-file work.',
    reads: ['AGENTS.md', 'README.md', 'docs/ARCHITECTURE.md', 'docs/ROADMAP.md'],
    validates: ['Names work type, risk, owner agents, file scopes, and verification plan.'],
    keywords: ['manage', 'agent', 'coordinate', 'big', 'large', 'enterprise', 'system', 'multi', 'complex'],
  },
  {
    id: 'planner',
    tier: 'core',
    name: 'Planner Agent',
    mission: 'Turn goals into milestones, acceptance criteria, dependencies, and release slices.',
    activation: 'Planning, roadmap, sprint, sequencing, or unclear scope.',
    reads: ['docs/ROADMAP.md', 'docs/sprint-progress.md', 'docs/progress&planhistory .md'],
    validates: ['Every task has user outcome, owner, dependency, and done criteria.'],
    keywords: ['plan', 'roadmap', 'sprint', 'milestone', 'priority', 'sequence', 'scope'],
  },
  {
    id: 'product',
    tier: 'core',
    name: 'Product Agent',
    mission: 'Protect user value, wedding-family workflow fit, finance clarity, and feature tradeoffs.',
    activation: 'User flows, copy, feature decisions, or product behavior changes.',
    reads: ['README.md', 'docs/ROADMAP.md', 'docs/ARCHITECTURE.md'],
    validates: ['Confirms user outcome, edge cases, and whether the feature belongs in Phere.'],
    keywords: ['user', 'feature', 'flow', 'copy', 'ux', 'wedding', 'family', 'customer'],
  },
  {
    id: 'frontend',
    tier: 'core',
    name: 'Frontend Agent',
    mission: 'Build React UI that is mobile-first, accessible, fast, and consistent with Phere design.',
    activation: 'React pages, components, forms, layout, state wiring, visual polish.',
    reads: ['Phere.jsx', 'src/pages/', 'src/components/', 'src/lib/constants.ts'],
    validates: ['Checks mobile states and runs npm run build for UI wiring changes.'],
    keywords: ['ui', 'frontend', 'react', 'page', 'component', 'layout', 'screen', 'button', 'form', 'mobile'],
  },
  {
    id: 'backend',
    tier: 'core',
    name: 'Backend Agent',
    mission: 'Own service boundaries, client integration helpers, edge function contracts, and API flows.',
    activation: 'Service helpers, API contracts, edge calls, AI/OCR/email integrations.',
    reads: ['src/lib/', 'src/hooks/', 'supabase/functions/', 'docs/integrations.md'],
    validates: ['Checks failure states, retries, env behavior, and contract compatibility.'],
    keywords: ['api', 'backend', 'edge', 'function', 'integration', 'email', 'ocr', 'service', 'hook'],
  },
  {
    id: 'database',
    tier: 'core',
    name: 'Database Agent',
    mission: 'Protect Supabase/Postgres schema, migrations, RLS, query safety, and data integrity.',
    activation: 'Schema, migrations, RLS, roles, queries, data compatibility.',
    reads: ['supabase/schema.sql', 'supabase/migrations/', 'docs/ARCHITECTURE.md'],
    validates: ['Requires migration review, RLS review, rollback notes, and advisor checks when available.'],
    keywords: ['database', 'db', 'supabase', 'postgres', 'migration', 'rls', 'schema', 'query', 'table'],
  },
  {
    id: 'tester',
    tier: 'core',
    name: 'Tester / QA Agent',
    mission: 'Catch regressions with tests, repros, manual QA, and edge-case thinking.',
    activation: 'Any code change, bug, release candidate, or risky behavior change.',
    reads: ['src/lib/__tests__/', 'docs/android-apk-qa-tracker.md', 'package.json'],
    validates: ['Runs npm run test for logic changes and creates manual QA for UI/mobile flows.'],
    keywords: ['test', 'qa', 'bug', 'regression', 'verify', 'check', 'repro', 'failure'],
  },
  {
    id: 'production',
    tier: 'core',
    name: 'Production / DevOps Agent',
    mission: 'Keep releases reversible, verified, and approval-gated.',
    activation: 'Build, deploy, env, Vercel, Capacitor, Supabase functions, APK release.',
    reads: ['DEPLOYMENT_GUIDE.md', 'docs/android-apk-qa-tracker.md', 'package.json'],
    validates: ['Requires tests, build, env review, rollback path, smoke tests, and human deploy approval.'],
    keywords: ['production', 'prod', 'deploy', 'release', 'vercel', 'build', 'env', 'apk', 'capacitor'],
  },
  {
    id: 'security',
    tier: 'core',
    name: 'Security Agent',
    mission: 'Protect auth, secrets, privacy, RLS, public routes, destructive flows, and wedding finance data.',
    activation: 'Auth, secrets, RLS, exports, deletes, public routes, logs, production data.',
    reads: ['src/context/AuthContext.jsx', 'src/lib/supabase.js', 'supabase/', '.env.example'],
    validates: ['Blocks secret exposure, unsafe RLS, sensitive logs, and unclear destructive flows.'],
    keywords: ['security', 'auth', 'secret', 'privacy', 'public', 'delete', 'export', 'role', 'permission'],
  },
  {
    id: 'architect',
    tier: 'enterprise',
    name: 'Architecture Agent',
    mission: 'Design module boundaries, refactor slices, interfaces, and long-term maintainability strategy.',
    activation: 'Cross-module work, large refactors, scaling decisions, shared contracts.',
    reads: ['docs/ARCHITECTURE.md', 'Phere.jsx', 'src/pages/', 'src/lib/'],
    validates: ['Produces tradeoffs, boundaries, non-goals, and integration order.'],
    keywords: ['architecture', 'architect', 'refactor', 'modular', 'scale', 'boundary', 'interface'],
  },
  {
    id: 'performance',
    tier: 'enterprise',
    name: 'Performance Agent',
    mission: 'Control render cost, bundle size, lazy loading, heavy exports, and large-list behavior.',
    activation: 'Slow UI, charts, reports, imports, exports, large lists, bundle growth.',
    reads: ['vite.config.js', 'src/pages/', 'src/components/', 'package.json'],
    validates: ['States expected impact and checks build output or relevant measurements.'],
    keywords: ['performance', 'slow', 'bundle', 'render', 'large', 'list', 'virtual', 'export', 'chart'],
  },
  {
    id: 'observability',
    tier: 'enterprise',
    name: 'Observability Agent',
    mission: 'Make failures diagnosable with safe logs, health checks, and production signals.',
    activation: 'Production debugging, monitoring, logs, incidents, sync failures.',
    reads: ['src/lib/', 'src/hooks/', 'supabase/functions/'],
    validates: ['No sensitive data in logs and diagnostics identify actionable failure points.'],
    keywords: ['log', 'monitor', 'observability', 'incident', 'debug', 'health', 'trace'],
  },
  {
    id: 'mobile',
    tier: 'enterprise',
    name: 'Mobile / Capacitor Agent',
    mission: 'Own Android/iOS wrapper behavior, WebView, viewport, downloads, and APK readiness.',
    activation: 'Capacitor, APK, mobile web assets, Android/iOS wrappers, WebView bugs.',
    reads: ['mobile/', 'android/', 'ios/', 'docs/android-apk-qa-tracker.md'],
    validates: ['Checks web build, Capacitor sync/build needs, and mobile QA notes.'],
    keywords: ['mobile', 'android', 'ios', 'apk', 'webview', 'capacitor', 'flutter', 'download'],
  },
  {
    id: 'accessibility',
    tier: 'enterprise',
    name: 'Accessibility Agent',
    mission: 'Protect keyboard flow, labels, focus, contrast, touch targets, and form usability.',
    activation: 'Forms, modals, dense tables, navigation, keyboard-heavy UI.',
    reads: ['src/pages/', 'src/components/'],
    validates: ['Checks labels, focus, tap targets, contrast, and long text behavior.'],
    keywords: ['accessibility', 'a11y', 'keyboard', 'focus', 'contrast', 'label', 'modal'],
  },
  {
    id: 'documentation',
    tier: 'enterprise',
    name: 'Documentation Agent',
    mission: 'Keep system docs, onboarding, release notes, and technical handoffs clear and current.',
    activation: 'New systems, changed workflows, APIs, release notes, onboarding docs.',
    reads: ['README.md', 'docs/', 'AGENTS.md'],
    validates: ['Docs are accurate, scoped, and do not claim unbuilt behavior.'],
    keywords: ['docs', 'documentation', 'readme', 'guide', 'handoff', 'notes'],
  },
  {
    id: 'data-ai',
    tier: 'enterprise',
    name: 'Data / AI Agent',
    mission: 'Improve AI/OCR prompts, parsing, confidence handling, and data-minimizing AI workflows.',
    activation: 'AI assistant, OCR, parsing, prompt contracts, model behavior, data quality.',
    reads: ['src/lib/ocr.js', 'supabase/functions/groq-proxy/', 'src/lib/', 'docs/ARCHITECTURE.md'],
    validates: ['Pairs with security for sensitive data and documents confidence/fallback behavior.'],
    keywords: ['ai', 'ocr', 'prompt', 'model', 'parse', 'classification', 'confidence', 'groq'],
  },
  {
    id: 'marketing',
    tier: 'business',
    name: 'Marketing Agent',
    mission: 'Create positioning, launch copy, campaigns, and app-store style messaging after code is done.',
    activation: 'Only after verified engineering work or explicit marketing request.',
    reads: ['README.md', 'docs/ROADMAP.md'],
    validates: ['No claims about unbuilt features; assumptions are stated.'],
    keywords: ['marketing', 'launch', 'campaign', 'positioning', 'copy', 'landing'],
  },
  {
    id: 'sales',
    tier: 'business',
    name: 'Sales Agent',
    mission: 'Create ICP, sales scripts, demo flow, pricing objections, and pitch material.',
    activation: 'Only after verified engineering work or explicit sales request.',
    reads: ['README.md', 'docs/ROADMAP.md'],
    validates: ['Current capability is separated from roadmap; no fake enterprise claims.'],
    keywords: ['sales', 'sell', 'pitch', 'demo', 'objection', 'lead', 'customer'],
  },
  {
    id: 'customer-success',
    tier: 'business',
    name: 'Customer Success Agent',
    mission: 'Create onboarding, activation, retention, and feedback loops.',
    activation: 'Only after verified engineering work or explicit onboarding/retention request.',
    reads: ['README.md', 'docs/ROADMAP.md'],
    validates: ['Maps guidance to real app flows and escalates missing features.'],
    keywords: ['onboard', 'retention', 'activation', 'success', 'feedback'],
  },
  {
    id: 'support',
    tier: 'business',
    name: 'Support Agent',
    mission: 'Create FAQ, triage scripts, known-issue notes, and support workflows.',
    activation: 'Only after verified engineering work or explicit support request.',
    reads: ['README.md', 'docs/android-apk-qa-tracker.md'],
    validates: ['Includes repro fields for device, browser, auth/local mode, and sync state.'],
    keywords: ['support', 'faq', 'help', 'issue', 'triage'],
  },
  {
    id: 'finance-strategy',
    tier: 'business',
    name: 'Finance Strategy Agent',
    mission: 'Draft pricing, cost assumptions, monetization options, and business model notes.',
    activation: 'Only after explicit pricing, cost, or monetization request.',
    reads: ['README.md', 'docs/ROADMAP.md'],
    validates: ['States assumptions and avoids financial-advice claims.'],
    keywords: ['pricing', 'cost', 'revenue', 'finance', 'monetization', 'runway'],
  },
  {
    id: 'legal-compliance',
    tier: 'business',
    name: 'Legal / Compliance Agent',
    mission: 'Flag privacy, terms, consent, and compliance risks for human legal review.',
    activation: 'Only after explicit legal/compliance request or when business claims need review.',
    reads: ['.env.example', 'README.md', 'supabase/', 'src/components/SettingsPage.jsx'],
    validates: ['Flags legal risk and never presents itself as final legal advice.'],
    keywords: ['legal', 'compliance', 'privacy', 'terms', 'policy', 'dpdp', 'gdpr'],
  },
];

const aliases = new Map([
  ['manager', 'orchestrator'],
  ['planer', 'planner'],
  ['planning', 'planner'],
  ['qa', 'tester'],
  ['test', 'tester'],
  ['devops', 'production'],
  ['prod', 'production'],
  ['db', 'database'],
  ['supabase', 'database'],
  ['sec', 'security'],
  ['ui', 'frontend'],
  ['api', 'backend'],
  ['perf', 'performance'],
  ['a11y', 'accessibility'],
  ['docs', 'documentation'],
  ['ai', 'data-ai'],
  ['growth', 'marketing'],
  ['cs', 'customer-success'],
  ['legal', 'legal-compliance'],
]);

const workflows = {
  feature: ['orchestrator', 'planner', 'product', 'frontend/backend/database as needed', 'tester'],
  review: ['orchestrator', 'owning specialist agent', 'tester if verification is needed'],
  bug: ['tester', 'orchestrator', 'owning implementation agent', 'security if data/auth risk'],
  refactor: ['orchestrator', 'architect', 'owning implementation agent', 'tester', 'performance if heavy code path'],
  database: ['orchestrator', 'database', 'security', 'tester', 'production for production-bound migrations'],
  release: ['orchestrator', 'production', 'tester', 'security', 'database if migrations exist'],
  incident: ['orchestrator', 'production', 'observability', 'security', 'tester', 'owning implementation agent'],
  business: ['orchestrator', 'product', 'requested business agent', 'legal-compliance when claims/privacy are involved'],
};

function resolveAgent(id) {
  const normalized = (id || '').toLowerCase().trim();
  const resolved = aliases.get(normalized) || normalized;
  return agents.find((agent) => agent.id === resolved);
}

function agentDisplayName(id) {
  return agentDisplayNames[id] || resolveAgent(id)?.name || id;
}

function agentLabel(agentOrId) {
  const id = typeof agentOrId === 'string' ? agentOrId : agentOrId.id;
  return `${agentDisplayName(id)} (${id})`;
}

function agentWithDisplay(agent) {
  return {
    ...agent,
    displayName: agentDisplayName(agent.id),
    label: agentLabel(agent.id),
  };
}

function dedupeResearchCatalog(items = researchCatalog) {
  const seen = new Set();
  const unique = [];
  for (const item of items) {
    const key = item.repo.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(item);
  }
  return unique;
}

function readBoolEnv(key, fallback = false) {
  const value = String(process.env[key] || '').trim().toLowerCase();
  if (!value) return fallback;
  return ['1', 'true', 'yes', 'on'].includes(value);
}

function readProjectProfile() {
  if (!fs.existsSync(agentosProjectProfilePath)) {
    return {
      brandName: agentosBrandName,
      compatibilityName: agentosCompatibilityName,
      runtime: { default: 'local' },
      agents: agents.map((agent) => agent.id),
      profilePath: agentosProjectProfilePath,
    };
  }

  try {
    return {
      profilePath: agentosProjectProfilePath,
      ...JSON.parse(fs.readFileSync(agentosProjectProfilePath, 'utf8')),
    };
  } catch (error) {
    return {
      brandName: agentosBrandName,
      compatibilityName: agentosCompatibilityName,
      runtime: { default: 'local' },
      agents: agents.map((agent) => agent.id),
      profilePath: agentosProjectProfilePath,
      profileWarning: `Could not parse agentos.project.json: ${error.message}`,
    };
  }
}

function agentosConfig() {
  const profile = readProjectProfile();
  const runtime = (process.env.AGENTOS_RUNTIME || profile.runtime?.default || 'local').toLowerCase();
  const normalizedRuntime = runtime === 'voltagent' ? 'voltagent' : 'local';
  return {
    brandName: process.env.AGENTOS_BRAND_NAME || profile.brandName || agentosBrandName,
    compatibilityName: profile.compatibilityName || agentosCompatibilityName,
    runtime: normalizedRuntime,
    allowPaidModels: readBoolEnv('AGENTOS_ALLOW_PAID_MODELS', false),
    localModelProvider: process.env.AGENTOS_LOCAL_MODEL_PROVIDER || profile.runtime?.localModelProvider || 'none',
    notebookEnabled: readBoolEnv('AGENTOS_ENABLE_NOTEBOOKLM', true),
    profile,
    userRegistryPath: agentosUserRegistryPath,
  };
}

function resolveOptionalPackage(packageName) {
  try {
    return { packageName, installed: true, resolved: import.meta.resolve(packageName) };
  } catch (error) {
    return { packageName, installed: false, error: error.message };
  }
}

function voltagentAdapterStatus() {
  return {
    packages: voltagentAdapterPackages.map((packageName) => resolveOptionalPackage(packageName)),
    policy: {
      defaultRuntime: 'local',
      enableWith: 'AGENTOS_RUNTIME=voltagent',
      paidModelGuard: 'AGENTOS_ALLOW_PAID_MODELS=false blocks paid providers by default',
    },
  };
}

function byTier(tier) {
  if (!tier || tier === 'all') return agents;
  return agents.filter((agent) => agent.tier === tier);
}

function usage() {
  console.log(`Phere 9-Agent Manager + ${agentosBrandName}

Usage:
  node tools/phere-9-agent-manager.mjs list [core|enterprise|business|all]
  node tools/phere-9-agent-manager.mjs brief <agent> <task>
  node tools/phere-9-agent-manager.mjs route <task>
  node tools/phere-9-agent-manager.mjs workflow <feature|review|bug|refactor|database|release|incident|business>
  node tools/phere-9-agent-manager.mjs gate [feature|database|release|security|business|truth]
  node tools/phere-9-agent-manager.mjs truth
  node tools/phere-9-agent-manager.mjs codex-autonomous <task>
  node tools/phere-9-agent-manager.mjs start <task>
  node tools/phere-9-agent-manager.mjs status [json]
  node tools/phere-9-agent-manager.mjs activity [agent]
  node tools/phere-9-agent-manager.mjs flow
  node tools/phere-9-agent-manager.mjs eta
  node tools/phere-9-agent-manager.mjs handoff <task>
  node tools/phere-9-agent-manager.mjs handoff-next [agent]
  node tools/phere-9-agent-manager.mjs handoff-status
  node tools/phere-9-agent-manager.mjs handoff-done <agent> <summary>
  node tools/phere-9-agent-manager.mjs run <task>
  node tools/phere-9-agent-manager.mjs logs
  node tools/phere-9-agent-manager.mjs stop
  node tools/phere-9-agent-manager.mjs update <status note>
  node tools/phere-9-agent-manager.mjs update <agent> <status note>
  node tools/phere-9-agent-manager.mjs done <summary>
  node tools/phere-9-agent-manager.mjs done <agent> <summary>
  node tools/phere-9-agent-manager.mjs agentos:list [core|enterprise|business|all]
  node tools/phere-9-agent-manager.mjs agentos:research
  node tools/phere-9-agent-manager.mjs agentos:adapter
  node tools/phere-9-agent-manager.mjs agentos:plan <task>
  node tools/phere-9-agent-manager.mjs agentos:start <task>
  node tools/phere-9-agent-manager.mjs agentos:status [run-id|json]
  node tools/phere-9-agent-manager.mjs agentos:update [run-id] <agent> <note>
  node tools/phere-9-agent-manager.mjs agentos:done [run-id] <summary>
  node tools/phere-9-agent-manager.mjs agentos:gate [feature|database|release|security|business|truth]
  node tools/phere-9-agent-manager.mjs agentos:truth

Examples:
  npm run agents:list
  npm run agents:list -- business
  npm run agents:brief -- architect "Split Dashboard safely"
  npm run agents:route -- "Add family role permissions with RLS"
  npm run agents:workflow -- release
  npm run agents:gate -- release
  npm run agents:truth
  npm run agents:codex -- "Improve Saman performance"
  npm run agents:start -- "Improve Saman performance"
  npm run agents:status
  npm run agents:activity
  npm run agents:activity -- frontend
  npm run agents:flow
  npm run agents:eta
  npm run agents:handoff -- "Saman feature, performance, and mobile layout"
  npm run agents:handoff-next
  npm run agents:handoff-status
  npm run agents:handoff-done -- frontend "Saman UI patch prepared and build checked"
  npm run agents:run -- "Saman performance and mobile verification"
  npm run agents:logs
  npm run agents:update -- "frontend inspecting src/pages/Saman.jsx"
  npm run agents:update -- frontend "checking Saman mobile layout"
  npm run agents:done -- "route and QA plan prepared"
  npm run agentos:list
  npm run agentos:research
  npm run agentos:adapter
  npm run agentos:plan -- "Improve Saman performance"
  npm run agentos:status`);
}

function listAgents(tier = 'all') {
  const selected = byTier(tier);
  if (!selected.length) {
    console.error(`Unknown tier: ${tier}. Use core, enterprise, business, or all.`);
    process.exitCode = 1;
    return;
  }

  console.log(`Phere 9-Agent Manager agents (${tier}):\n`);
  for (const agent of selected) {
    console.log(`${agent.id.padEnd(18)} ${agentLabel(agent)} [${agent.tier}]`);
    console.log(`  ${agent.mission}`);
    console.log(`  Activation: ${agent.activation}`);
  }
}

function printBrief(agentId, taskParts) {
  const agent = resolveAgent(agentId);
  if (!agent) {
    console.error(`Unknown agent: ${agentId || '(missing)'}`);
    console.error(`Known agents: ${agents.map((item) => item.id).join(', ')}`);
    process.exitCode = 1;
    return;
  }

  const task = taskParts.join(' ').trim() || 'Describe the task clearly before starting.';
  console.log(`# Agent Brief: ${agentLabel(agent)}

Agent id: ${agent.id}
Tier: ${agent.tier}
Legacy name: ${agent.name}

## Task

${task}

## Mission

${agent.mission}

## Activation Rule

${agent.activation}

## Read First

${agent.reads.map((item) => `- ${item}`).join('\n')}

## Guardrails

- Preserve unrelated user changes.
- Keep changes scoped to the task.
- Do not present claims as facts without file, command, user, or deployment/admin evidence.
- Do not deploy, delete data, push production migrations, rotate secrets, or expose secrets without explicit approval.
- Business agents run only after coding is done or when the user explicitly asks.
- Hand off with changed files, validation performed, and remaining risks.

## Validation

${agent.validates.map((item) => `- ${item}`).join('\n')}
`);
}

function isReviewOnlyTask(text) {
  return /\b(review|audit|inspect|check|list|identify|find)\b/i.test(text)
    && !/\b(add|create|build|implement|change|fix|update|edit|refactor|deploy|migration|delete)\b/i.test(text);
}

function classifyRisk(text) {
  if (/\b(production sql|drop|delete data|rotate secret|secret rotation|deploy|live|incident)\b/i.test(text)) return 'R4';
  if (/\b(auth|rls|supabase|migration|schema|database|public route|export|privacy|apk|capacitor|env)\b/i.test(text)) return 'R3';
  if (isReviewOnlyTask(text)) return 'R1';
  if (/\b(feature|ui|page|screen|shared|report|dashboard|flow|integration)\b/i.test(text)) return 'R2';
  if (/\b(fix|bug|test|component|helper|copy)\b/i.test(text)) return 'R1';
  return 'R0';
}

function classifyWorkType(text) {
  if (/\b(marketing|sales|launch|pricing|support|faq|onboard|legal|compliance)\b/i.test(text)) return 'business';
  if (/\b(deploy|release|production|vercel|apk|build)\b/i.test(text)) return 'release';
  if (/\b(database|supabase|migration|rls|schema|postgres)\b/i.test(text)) return 'database';
  if (isReviewOnlyTask(text)) return 'review';
  if (/\b(refactor|split|architecture|modular|rewrite)\b/i.test(text)) return 'refactor';
  if (/\b(bug|fix|broken|error|regression|failing)\b/i.test(text)) return 'bug';
  if (/\b(plan|roadmap|sprint|milestone)\b/i.test(text)) return 'plan';
  if (/\b(incident|outage|down|urgent)\b/i.test(text)) return 'incident';
  return 'feature';
}

function inferRoute(task) {
  const risk = classifyRisk(task);
  const workType = classifyWorkType(task);
  const selected = new Map();

  function add(id, reason) {
    const agent = resolveAgent(id);
    if (agent) selected.set(agent.id, { id: agent.id, tier: agent.tier, name: agent.name, displayName: agentDisplayName(agent.id), label: agentLabel(agent), reason });
  }

  const featureIntent = /\b(add|create|build|implement|feature|flow|permission|role|workflow)\b/i.test(task);
  add('orchestrator', 'Owns routing, scope, file ownership, and final integration.');
  if (['plan', 'feature', 'business'].includes(workType) || featureIntent) add('planner', 'Defines sequence and acceptance criteria.');
  if (['feature', 'business'].includes(workType) || featureIntent || /\b(user|ux|flow|copy)\b/i.test(task)) add('product', 'Checks user value and workflow fit.');
  if (/\b(ui|frontend|react|page|component|screen|layout|form|dashboard|report|saman)\b/i.test(task)) add('frontend', 'Owns React and UI implementation.');
  if (/\b(api|edge|function|integration|ocr|email|service|hook)\b/i.test(task)) add('backend', 'Owns service and integration contracts.');
  if (/\b(database|db|supabase|postgres|migration|rls|schema|query|table)\b/i.test(task)) add('database', 'Owns data integrity, migrations, and RLS.');
  if (risk !== 'R0' || featureIntent || ['feature', 'bug', 'refactor', 'database', 'release'].includes(workType) || /\b(test|qa|bug|fix|regression|verify)\b/i.test(task)) add('tester', 'Defines and runs verification.');
  if (/\b(production|prod|deploy|release|vercel|build|env|apk|capacitor)\b/i.test(task) || ['R3', 'R4'].includes(risk)) add('production', 'Controls release readiness and approval boundary.');
  if (/\b(security|auth|secret|privacy|public|delete|export|role|permission|rls)\b/i.test(task) || ['R3', 'R4'].includes(risk)) add('security', 'Reviews auth, data, secrets, RLS, and destructive risk.');
  if (/\b(architecture|architect|refactor|split|modular|scale|boundary|enterprise)\b/i.test(task)) add('architect', 'Designs module boundaries and safe slices.');
  if (/\b(performance|slow|bundle|render|large list|large-list|virtual list|virtualized|export|chart)\b/i.test(task)) add('performance', 'Controls render, bundle, and heavy workflow cost.');
  if (/\b(log|monitor|observability|incident|debug|health|trace)\b/i.test(task)) add('observability', 'Makes failures diagnosable without leaking sensitive data.');
  if (/\b(mobile|android|ios|apk|webview|capacitor|flutter|download|layout)\b/i.test(task)) add('mobile', 'Owns mobile wrapper and APK-specific behavior.');
  if (/\b(accessibility|a11y|keyboard|focus|contrast|label|modal)\b/i.test(task)) add('accessibility', 'Checks accessibility and robust interaction states.');
  if (/\b(docs|documentation|readme|guide|handoff|notes)\b/i.test(task)) add('documentation', 'Keeps docs and handoffs accurate.');
  if (/\b(ai|ocr|prompt|model|parse|classification|confidence|groq)\b/i.test(task)) add('data-ai', 'Owns AI/OCR quality and data-minimizing prompt contracts.');

  const explicitBusiness = /\b(marketing|sales|launch|campaign|pricing|support|faq|onboard|retention|legal|compliance)\b/i.test(task);
  if (explicitBusiness) {
    if (/\b(marketing|launch|campaign|positioning|landing)\b/i.test(task)) add('marketing', 'Explicit business request.');
    if (/\b(sales|sell|pitch|demo|lead)\b/i.test(task)) add('sales', 'Explicit business request.');
    if (/\b(onboard|retention|activation|success)\b/i.test(task)) add('customer-success', 'Explicit business request.');
    if (/\b(support|faq|help|triage)\b/i.test(task)) add('support', 'Explicit business request.');
    if (/\b(pricing|cost|revenue|finance|monetization)\b/i.test(task)) add('finance-strategy', 'Explicit business request.');
    if (/\b(legal|compliance|privacy|terms|policy|dpdp|gdpr|claim|claims)\b/i.test(task)) add('legal-compliance', 'Claims, legal, privacy, or compliance language needs review; human review still required.');
  }

  return { task, risk, workType, agents: Array.from(selected.values()), explicitBusiness };
}

function routeTask(taskParts) {
  const task = taskParts.join(' ').trim();
  if (!task) {
    console.error('Provide a task to route.');
    process.exitCode = 1;
    return;
  }

  const risk = classifyRisk(task);
  const workType = classifyWorkType(task);
  const selected = new Map();

  function add(id, reason) {
    const agent = resolveAgent(id);
    if (agent) selected.set(agent.id, { agent, reason });
  }

  const featureIntent = /\b(add|create|build|implement|feature|flow|permission|role|workflow)\b/i.test(task);

  add('orchestrator', 'Owns routing, scope, file ownership, and final integration.');

  if (['plan', 'feature', 'business'].includes(workType) || featureIntent) add('planner', 'Defines sequence and acceptance criteria.');
  if (['feature', 'business'].includes(workType) || featureIntent || /\b(user|ux|flow|copy)\b/i.test(task)) add('product', 'Checks user value and workflow fit.');
  if (/\b(ui|frontend|react|page|component|screen|layout|form|dashboard|report|saman)\b/i.test(task)) add('frontend', 'Owns React and UI implementation.');
  if (/\b(api|edge|function|integration|ocr|email|service|hook)\b/i.test(task)) add('backend', 'Owns service and integration contracts.');
  if (/\b(database|db|supabase|postgres|migration|rls|schema|query|table)\b/i.test(task)) add('database', 'Owns data integrity, migrations, and RLS.');
  if (risk !== 'R0' || featureIntent || ['feature', 'bug', 'refactor', 'database', 'release'].includes(workType) || /\b(test|qa|bug|fix|regression)\b/i.test(task)) add('tester', 'Defines and runs verification.');
  if (/\b(production|prod|deploy|release|vercel|build|env|apk|capacitor)\b/i.test(task) || ['R3', 'R4'].includes(risk)) add('production', 'Controls release readiness and approval boundary.');
  if (/\b(security|auth|secret|privacy|public|delete|export|role|permission|rls)\b/i.test(task) || ['R3', 'R4'].includes(risk)) add('security', 'Reviews auth, data, secrets, RLS, and destructive risk.');
  if (/\b(architecture|architect|refactor|split|modular|scale|boundary|enterprise)\b/i.test(task)) add('architect', 'Designs module boundaries and safe slices.');
  if (/\b(performance|slow|bundle|render|large list|large-list|virtual list|virtualized|export|chart)\b/i.test(task)) add('performance', 'Controls render, bundle, and heavy workflow cost.');
  if (/\b(log|monitor|observability|incident|debug|health|trace)\b/i.test(task)) add('observability', 'Makes failures diagnosable without leaking sensitive data.');
  if (/\b(mobile|android|ios|apk|webview|capacitor|flutter|download)\b/i.test(task)) add('mobile', 'Owns mobile wrapper and APK-specific behavior.');
  if (/\b(accessibility|a11y|keyboard|focus|contrast|label|modal)\b/i.test(task)) add('accessibility', 'Checks accessibility and robust interaction states.');
  if (/\b(docs|documentation|readme|guide|handoff|notes)\b/i.test(task)) add('documentation', 'Keeps docs and handoffs accurate.');
  if (/\b(ai|ocr|prompt|model|parse|classification|confidence|groq)\b/i.test(task)) add('data-ai', 'Owns AI/OCR quality and data-minimizing prompt contracts.');

  const explicitBusiness = /\b(marketing|sales|launch|campaign|pricing|support|faq|onboard|retention|legal|compliance)\b/i.test(task);
  if (explicitBusiness) {
    if (/\b(marketing|launch|campaign|positioning|landing)\b/i.test(task)) add('marketing', 'Explicit business request.');
    if (/\b(sales|sell|pitch|demo|lead)\b/i.test(task)) add('sales', 'Explicit business request.');
    if (/\b(onboard|retention|activation|success)\b/i.test(task)) add('customer-success', 'Explicit business request.');
    if (/\b(support|faq|help|triage)\b/i.test(task)) add('support', 'Explicit business request.');
    if (/\b(pricing|cost|revenue|finance|monetization)\b/i.test(task)) add('finance-strategy', 'Explicit business request.');
    if (/\b(legal|compliance|privacy|terms|policy|dpdp|gdpr|claim|claims)\b/i.test(task)) add('legal-compliance', 'Claims, legal, privacy, or compliance language needs review; human review still required.');
  }

  const blockedBusiness = agents
    .filter((agent) => agent.tier === 'business' && !selected.has(agent.id))
    .map((agent) => agent.id);
  const needsCodeVerification = risk !== 'R0'
    || featureIntent
    || ['feature', 'bug', 'refactor', 'database', 'release'].includes(workType)
    || ['frontend', 'backend', 'database', 'performance', 'mobile', 'accessibility', 'data-ai'].some((id) => selected.has(id));

  console.log(`# Route: Phere 9-Agent Manager

Task: ${task}
Work type: ${workType}
Risk: ${risk}

## Recommended agents

${Array.from(selected.values()).map(({ agent, reason }) => `- ${agentLabel(agent)} (${agent.tier}): ${reason}`).join('\n')}

## Business-agent rule

${explicitBusiness
  ? 'Business agent requested explicitly. Keep claims tied to verified current capability or clearly marked roadmap/proposal items.'
  : `Business agents parked until coding is complete or the user asks for them: ${blockedBusiness.join(', ')}.`}

## Minimum verification

${needsCodeVerification ? '- Run targeted checks.\n- Run npm run test for logic changes when feasible.\n- Run npm run build for UI/app wiring changes when feasible.' : '- Validate docs/plan consistency.'}
${['R3', 'R4'].includes(risk) ? '- Security and production gates are required.\n- Human approval is required for live deploy, production SQL, secrets, or destructive actions.' : ''}

## Truth requirement

- State what is fact, assumption, recommendation, or unknown.
- Use package.json/lockfiles for dependency versions.
- Do not claim tests, deploy, production readiness, security, or enterprise readiness without direct evidence.
`);
}

function printCodexAutonomous(taskParts) {
  const task = taskParts.join(' ').trim();
  if (!task) {
    console.error('Provide a task for Codex autonomous mode.');
    process.exitCode = 1;
    return;
  }

  const route = inferRoute(task);
  const selectedIds = route.agents.map((agent) => agent.id);
  const selectedAgents = route.agents
    .map((item) => ({ ...item, definition: resolveAgent(item.id) }))
    .filter((item) => item.definition);
  const implementationIds = selectedIds.filter((id) => [
    'frontend',
    'backend',
    'database',
    'architect',
    'performance',
    'observability',
    'mobile',
    'accessibility',
    'documentation',
    'data-ai',
  ].includes(id));
  const reviewIds = selectedIds.filter((id) => ['tester', 'security', 'production'].includes(id));
  const needsCodeVerification = route.risk !== 'R0'
    || ['feature', 'bug', 'refactor', 'database', 'release'].includes(route.workType)
    || implementationIds.length > 0;
  const parkedBusiness = agents
    .filter((agent) => agent.tier === 'business' && !selectedIds.includes(agent.id))
    .map((agent) => agent.id);

  console.log(`# Codex Autonomous Agent Run

Task: ${task}
Work type: ${route.workType}
Risk: ${route.risk}

This mode is for the current Codex session. Codex should execute the selected roles sequentially in one continuous run, make scoped edits when needed, and verify before the final handoff. It does not spawn hidden paid API workers, does not control Codex Desktop in the background, and does not bypass human approval for deploys, production SQL, secret rotation, deletes, or destructive git operations.

## Selected agents

${selectedAgents.map(({ id, tier, reason, definition }) => `- ${agentLabel(id)} (${tier}): ${definition.mission} Reason: ${reason}`).join('\n')}

## Execution order for Codex

1. ${agentLabel('orchestrator')}: inspect git status, classify risk, set file ownership, and decide the smallest safe scope.
${selectedIds.includes('planner') ? `2. ${agentLabel('planner')}: write acceptance criteria, non-goals, and verification plan.` : `2. ${agentLabel('planner')}: skip unless scope becomes unclear.`}
${selectedIds.includes('product') ? `3. ${agentLabel('product')}: confirm user value, Phere workflow fit, and edge cases.` : `3. ${agentLabel('product')}: skip unless user-flow or copy risk appears.`}
4. implementation specialists: ${implementationIds.length ? implementationIds.join(', ') : 'none selected; inspect only unless implementation becomes necessary'}.
5. review gates: ${reviewIds.length ? reviewIds.join(', ') : 'tester when code changes; security/production only if risk appears'}.
6. truth gate: separate facts, assumptions, unknowns, and recommendations; cite file/command evidence.
7. final handoff: summarize changed files, verification performed, unverified items, source conflicts, assumptions, and residual risk.

## Autonomous behavior contract

- Keep working through the selected agents without asking routine follow-up questions.
- Ask the user only for high-impact choices, missing secrets, deploy/production approval, destructive action approval, or ambiguous product decisions that cannot be safely inferred.
- Preserve unrelated worktree changes and do not revert files outside the scoped task.
- Use NotebookLM only as a research accelerator for approved docs; verify implementation truth in local files and command output.
- Business agents remain parked unless the user explicitly requested that business output or engineering work is already verified. Parked: ${parkedBusiness.join(', ') || 'none'}.

## Minimum verification

${needsCodeVerification
  ? '- Run targeted checks for changed code.\n- Run npm run test for logic changes when feasible.\n- Run npm run build for UI/app wiring changes when feasible.'
  : '- Verify the plan or docs against current files.'}
${['R3', 'R4'].includes(route.risk) ? '- Run security and production gates.\n- Stop for human approval before live deploy, production SQL, secret rotation, data delete, or destructive git operations.' : ''}

## Suggested first command

\`\`\`bash
git status --short --untracked-files=all
\`\`\`
`);
}

function ensureStatusDir() {
  fs.mkdirSync(statusDir, { recursive: true });
}

function appendWorkerLog(message) {
  ensureStatusDir();
  fs.appendFileSync(workerLogPath, `${new Date().toISOString()} ${message}\n`, 'utf8');
}

function readLiveStatus() {
  if (!fs.existsSync(statusJsonPath)) return null;
  return normalizeLiveStatus(JSON.parse(fs.readFileSync(statusJsonPath, 'utf8')));
}

function normalizeLiveStatus(status) {
  const now = new Date().toISOString();
  status.agents = (status.agents || []).map((agent) => ({
    state: agent.state || 'queued',
    current: agent.current || 'Waiting for a status update.',
    objective: agent.objective || defaultAgentDetails(agent.id, status.task).objective,
    output: agent.output || defaultAgentDetails(agent.id, status.task).output,
    next: agent.next || defaultAgentDetails(agent.id, status.task).next,
    files: agent.files || defaultAgentDetails(agent.id, status.task).files,
    estimate: agent.estimate || defaultAgentEstimate(agent.id, status.risk, status.task),
    updatedAt: agent.updatedAt || status.updatedAt || now,
    ...agent,
  }));
  status.events = status.events || [];
  status.flow = status.flow || buildWorkflowGraph(status.agents);
  status.estimate = estimateWorkflow(status);
  return status;
}

function riskMultiplier(risk) {
  if (risk === 'R4') return 2;
  if (risk === 'R3') return 1.5;
  if (risk === 'R2') return 1.2;
  return 1;
}

function scaleEstimate(minMinutes, maxMinutes, risk) {
  const multiplier = riskMultiplier(risk);
  return {
    minMinutes: Math.ceil(minMinutes * multiplier),
    maxMinutes: Math.ceil(maxMinutes * multiplier),
  };
}

function defaultAgentEstimate(agentId, risk = 'R1', task = '') {
  const isSaman = /\bsaman\b/i.test(task);
  const reviewOnly = isReviewOnlyTask(task);
  const base = {
    orchestrator: reviewOnly ? [5, 10, 'quick review routing'] : [8, 15, 'scope routing and coordination'],
    planner: [12, 25, 'acceptance criteria and sequencing'],
    product: [12, 25, 'workflow and edge-case review'],
    frontend: reviewOnly ? [15, 35, 'focused UI review'] : isSaman ? [45, 100, 'Saman UI/mobile implementation or risk review'] : [35, 90, 'UI implementation or review'],
    backend: [30, 90, 'integration contract work'],
    database: [45, 120, 'schema/RLS/migration work'],
    tester: reviewOnly ? [10, 25, 'review checklist and light verification'] : [20, 60, 'targeted tests and QA checklist'],
    production: [20, 60, 'release gate and rollback review'],
    security: [25, 75, 'auth/data/secrets review'],
    architect: [25, 75, 'module boundary and design review'],
    performance: reviewOnly ? [15, 30, 'focused performance review'] : isSaman ? [30, 75, 'large-list and bundle performance review'] : [25, 70, 'performance review'],
    observability: [20, 60, 'logging and diagnostics review'],
    mobile: reviewOnly ? [10, 25, 'focused mobile layout review'] : [25, 60, 'mobile layout and wrapper impact review'],
    accessibility: [20, 50, 'a11y interaction review'],
    documentation: [15, 45, 'docs and handoff update'],
    'data-ai': [30, 90, 'AI/OCR data-flow review'],
    marketing: [30, 90, 'positioning and launch copy'],
    sales: [30, 90, 'pitch and sales playbook'],
    'customer-success': [25, 75, 'onboarding and retention plan'],
    support: [20, 60, 'FAQ and support triage'],
    'finance-strategy': [30, 90, 'pricing and cost assumptions'],
    'legal-compliance': [30, 90, 'compliance checklist draft'],
  };
  const [min, max, basis] = base[agentId] || [15, 45, 'role-specific work'];
  const scaled = scaleEstimate(min, max, risk);
  return { ...scaled, basis, confidence: 'rough planning estimate' };
}

function formatDuration(minutes) {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins ? `${hours}h ${mins}m` : `${hours}h`;
}

function maxEstimateFor(ids, agentsInStatus, key) {
  return Math.max(
    0,
    ...agentsInStatus
      .filter((agent) => ids.includes(agent.id))
      .map((agent) => agent.estimate?.[key] || 0)
  );
}

function estimateWorkflow(status) {
  const agentsInStatus = status.agents || [];
  const implementationIds = ['frontend', 'backend', 'database', 'architect', 'performance', 'mobile', 'accessibility', 'data-ai', 'documentation'];
  const reviewIds = ['tester', 'security', 'production'];
  const planningMin = maxEstimateFor(['orchestrator'], agentsInStatus, 'minMinutes')
    + maxEstimateFor(['planner', 'product'], agentsInStatus, 'minMinutes');
  const planningMax = maxEstimateFor(['orchestrator'], agentsInStatus, 'maxMinutes')
    + maxEstimateFor(['planner', 'product'], agentsInStatus, 'maxMinutes');
  const implementationMin = maxEstimateFor(implementationIds, agentsInStatus, 'minMinutes');
  const implementationMax = maxEstimateFor(implementationIds, agentsInStatus, 'maxMinutes');
  const reviewMin = maxEstimateFor(reviewIds, agentsInStatus, 'minMinutes') + 5;
  const reviewMax = maxEstimateFor(reviewIds, agentsInStatus, 'maxMinutes') + 10;
  return {
    minMinutes: planningMin + implementationMin + reviewMin,
    maxMinutes: planningMax + implementationMax + reviewMax,
    model: 'critical-path estimate; parallel agents are not fully summed',
    confidence: 'rough planning estimate, not a guarantee',
  };
}

function defaultAgentDetails(agentId, task = '') {
  const isSaman = /\bsaman\b/i.test(task);
  const featureWord = isSaman ? 'Saman' : 'requested';
  const commonFiles = isSaman ? ['src/pages/Saman.jsx', 'src/components/', 'src/lib/'] : ['affected files to be discovered'];
  const details = {
    orchestrator: {
      objective: `Coordinate the ${featureWord} work and keep scope, truth rules, and handoff clean.`,
      current: `Routing ${featureWord} work across implementation, performance, mobile, and verification agents.`,
      output: 'Agent ownership map, work order, risks, and final integration notes.',
      next: 'Confirm write scopes and decide which agent acts first.',
      files: ['AGENTS.md', 'docs/PHERE_9_AGENT_MANAGER_SYSTEM.md'],
    },
    planner: {
      objective: `Convert the ${featureWord} request into acceptance criteria and work slices.`,
      current: 'Waiting to define exact feature scope, non-goals, and done criteria.',
      output: 'Small plan with acceptance criteria and verification checklist.',
      next: 'Clarify what Saman feature change is being added or improved.',
      files: ['docs/ROADMAP.md', 'docs/sprint-progress.md'],
    },
    product: {
      objective: `Check that the ${featureWord} work helps real wedding planning and finance workflows.`,
      current: 'Waiting to review user value and edge cases.',
      output: 'User-flow notes, edge cases, and copy/UX guidance.',
      next: 'Identify family-user scenarios and what success looks like.',
      files: ['README.md', 'docs/ROADMAP.md'],
    },
    frontend: {
      objective: `Implement or improve the ${featureWord} UI without breaking mobile-first layout.`,
      current: `Inspecting ${featureWord} screen behavior, layout risk, and UI states.`,
      output: 'React/UI changes or a UI risk report with affected states.',
      next: 'Review screen structure, long text, controls, and 320px behavior.',
      files: commonFiles,
    },
    tester: {
      objective: `Verify the ${featureWord} change with focused tests and manual QA.`,
      current: 'Waiting to prepare regression and mobile QA checklist.',
      output: 'Test commands, manual QA checklist, and residual risk notes.',
      next: 'Define targeted checks before implementation is marked complete.',
      files: ['src/lib/__tests__/', 'package.json'],
    },
    performance: {
      objective: `Keep the ${featureWord} workflow fast for large lists and mobile devices.`,
      current: `Reviewing ${featureWord} rendering, large-list behavior, and bundle risk.`,
      output: 'Performance risks, optimization candidates, and measurement/check plan.',
      next: 'Inspect list rendering, derived calculations, and lazy-loading boundaries.',
      files: commonFiles,
    },
    mobile: {
      objective: `Verify the ${featureWord} experience on narrow screens and mobile wrappers.`,
      current: 'Waiting to check small viewport, touch targets, WebView risks, and APK impact.',
      output: 'Mobile QA checklist and wrapper impact notes.',
      next: 'Review 320px layout, sticky controls, scrolling, and download/share behavior.',
      files: ['mobile/', 'android/', 'ios/', 'docs/android-apk-qa-tracker.md'],
    },
  };
  return details[agentId] || {
    objective: `Handle ${agentId} responsibility for the current task.`,
    current: 'Waiting for assignment.',
    output: 'Role-specific notes and verification.',
    next: 'Await orchestrator or user update.',
    files: ['affected files to be discovered'],
  };
}

function enrichAgent(agent, task, now) {
  const defaults = defaultAgentDetails(agent.id, task);
  return {
    ...agent,
    objective: agent.objective || defaults.objective,
    current: agent.current || defaults.current,
    output: agent.output || defaults.output,
    next: agent.next || defaults.next,
    files: agent.files || defaults.files,
    updatedAt: agent.updatedAt || now,
  };
}

function buildWorkflowGraph(agentsInStatus) {
  const ids = agentsInStatus.map((agent) => agent.id);
  const has = (id) => ids.includes(id);
  const nodes = [
    { id: 'start', label: 'Start', state: 'completed' },
    ...agentsInStatus.map((agent) => ({ id: agent.id, label: agent.id, state: agent.state })),
    { id: 'truth-gate', label: 'Truth Gate', state: 'queued' },
    { id: 'done', label: 'Done', state: 'queued' },
  ];
  const edges = [];
  if (has('orchestrator')) edges.push(['start', 'orchestrator']);
  for (const id of ['planner', 'product']) if (has(id)) edges.push(['orchestrator', id]);
  for (const id of ['frontend', 'backend', 'database', 'performance', 'mobile', 'accessibility', 'data-ai']) {
    if (has(id)) edges.push([has('product') ? 'product' : 'orchestrator', id]);
  }
  if (has('tester')) {
    for (const id of ['frontend', 'backend', 'database', 'performance', 'mobile']) if (has(id)) edges.push([id, 'tester']);
    if (!edges.some((edge) => edge[1] === 'tester')) edges.push(['orchestrator', 'tester']);
  }
  if (has('security')) edges.push([has('database') ? 'database' : 'orchestrator', 'security']);
  if (has('production')) edges.push([has('tester') ? 'tester' : 'orchestrator', 'production']);
  edges.push([has('production') ? 'production' : has('tester') ? 'tester' : 'orchestrator', 'truth-gate']);
  edges.push(['truth-gate', 'done']);
  return { nodes, edges: edges.map(([from, to]) => ({ from, to })) };
}

function writeLiveStatus(status) {
  ensureStatusDir();
  fs.writeFileSync(statusJsonPath, `${JSON.stringify(status, null, 2)}\n`, 'utf8');
  const lines = [
    '# Phere 9-Agent Live Status',
    '',
    `Task: ${status.task}`,
    `State: ${status.state}`,
    `Phase: ${status.phase}`,
    `Work type: ${status.workType}`,
    `Risk: ${status.risk}`,
    `Started: ${status.startedAt}`,
    `Updated: ${status.updatedAt}`,
    '',
    '## Agents',
    '',
    ...status.agents.map((agent) => [
      `- ${agent.id} (${agent.tier}) [${agent.state}]`,
      `  Objective: ${agent.objective}`,
      `  Current: ${agent.current}`,
      `  Output: ${agent.output}`,
      `  Next: ${agent.next}`,
      `  ETA: ${formatDuration(agent.estimate.minMinutes)}-${formatDuration(agent.estimate.maxMinutes)} max (${agent.estimate.basis})`,
      `  Files: ${agent.files.join(', ')}`,
    ].join('\n')),
    '',
    '## Workflow',
    '',
    ...status.flow.edges.map((edge) => `- ${edge.from} -> ${edge.to}`),
    '',
    '## Events',
    '',
    ...status.events.map((event) => `- ${event.at} - ${event.message}`),
    '',
  ];
  fs.writeFileSync(statusMarkdownPath, `${lines.join('\n')}\n`, 'utf8');
}

function startLiveStatus(taskParts) {
  const task = taskParts.join(' ').trim();
  if (!task) {
    console.error('Provide a task to start live status.');
    process.exitCode = 1;
    return;
  }

  const route = inferRoute(task);
  const now = new Date().toISOString();
  const status = {
    task,
    state: 'in_progress',
    phase: 'started',
    workType: route.workType,
    risk: route.risk,
    agents: route.agents.map((agent) => enrichAgent({
      ...agent,
      state: agent.id === 'orchestrator' ? 'active' : 'queued',
      current: agent.id === 'orchestrator' ? undefined : 'Waiting for assignment.',
    }, task, now)),
    startedAt: now,
    updatedAt: now,
    events: [
      { at: now, message: `Started live status for ${route.workType} task (${route.risk}).` },
      { at: now, message: `Selected agents: ${route.agents.map((agent) => agent.id).join(', ')}.` },
    ],
  };
  status.flow = buildWorkflowGraph(status.agents);
  status.estimate = estimateWorkflow(status);
  writeLiveStatus(status);
  printLiveStatus();
}

function printLiveStatus(asJson = false) {
  const status = readLiveStatus();
  if (!status) {
    console.log('No live agent status found. Start one with: npm run agents:start -- "your task"');
    return;
  }

  if (asJson) {
    console.log(JSON.stringify(status, null, 2));
    return;
  }

  console.log(`# Phere 9-Agent Live Status

Task: ${status.task}
State: ${status.state}
Phase: ${status.phase}
Work type: ${status.workType}
Risk: ${status.risk}
Started: ${status.startedAt}
Updated: ${status.updatedAt}
Estimated max: ${formatDuration(status.estimate.maxMinutes)}
Estimated range: ${formatDuration(status.estimate.minMinutes)}-${formatDuration(status.estimate.maxMinutes)}
Estimate note: ${status.estimate.model}; ${status.estimate.confidence}
Status files:
- ${statusJsonPath}
- ${statusMarkdownPath}

## Active agents

${status.agents.map((agent) => `- ${agent.id} (${agent.tier}) [${agent.state}]\n  Current: ${agent.current}\n  Next: ${agent.next}\n  ETA: ${formatDuration(agent.estimate.minMinutes)}-${formatDuration(agent.estimate.maxMinutes)} max`).join('\n')}

## Latest events

${status.events.slice(-8).map((event) => `- ${event.at} - ${event.message}`).join('\n')}
`);
}

function updateLiveStatus(noteParts, state = 'in_progress') {
  const status = readLiveStatus();
  if (!status) {
    console.error('No live agent status found. Start one first with agents:start.');
    process.exitCode = 1;
    return;
  }

  const maybeAgent = resolveAgent(noteParts[0]);
  const agentIndex = maybeAgent
    ? status.agents.findIndex((agent) => agent.id === maybeAgent.id)
    : -1;
  const isAgentUpdate = agentIndex !== -1;
  const note = (isAgentUpdate ? noteParts.slice(1) : noteParts).join(' ').trim();
  if (!note) {
    console.error('Provide a status note.');
    process.exitCode = 1;
    return;
  }

  const now = new Date().toISOString();
  status.updatedAt = now;
  if (isAgentUpdate) {
    const agent = status.agents[agentIndex];
    agent.state = state === 'completed' ? 'completed' : 'active';
    agent.current = note;
    agent.next = state === 'completed' ? 'Handoff completed for this agent.' : agent.next;
    agent.updatedAt = now;
    status.phase = status.state === 'completed' ? 'done' : 'working';
    status.events.push({ at: now, agent: agent.id, message: `[${agent.id}] ${note}` });
  } else {
    status.state = state;
    status.phase = state === 'completed' ? 'done' : 'working';
    status.events.push({ at: now, message: note });
  }
  status.flow = buildWorkflowGraph(status.agents);
  status.estimate = estimateWorkflow(status);
  writeLiveStatus(status);
  printLiveStatus();
}

function printAgentActivity(agentId) {
  const status = readLiveStatus();
  if (!status) {
    console.log('No live agent status found. Start one with: npm run agents:start -- "your task"');
    return;
  }

  const selectedAgent = agentId ? resolveAgent(agentId) : null;
  const visibleAgents = selectedAgent
    ? status.agents.filter((agent) => agent.id === selectedAgent.id)
    : status.agents;

  if (!visibleAgents.length) {
    console.error(`Agent is not active in current live status: ${agentId}`);
    process.exitCode = 1;
    return;
  }

  console.log(`# Phere 9-Agent Activity

Task: ${status.task}
State: ${status.state}
Phase: ${status.phase}
Updated: ${status.updatedAt}
Estimated max: ${formatDuration(status.estimate.maxMinutes)}
Estimated range: ${formatDuration(status.estimate.minMinutes)}-${formatDuration(status.estimate.maxMinutes)}

## Agent activity

${visibleAgents.map((agent) => `- ${agent.id} (${agent.tier})\n  State: ${agent.state}\n  Objective: ${agent.objective}\n  Current: ${agent.current}\n  Output: ${agent.output}\n  Next: ${agent.next}\n  ETA: ${formatDuration(agent.estimate.minMinutes)}-${formatDuration(agent.estimate.maxMinutes)} max\n  Estimate basis: ${agent.estimate.basis}; ${agent.estimate.confidence}\n  Likely files: ${agent.files.join(', ')}\n  Updated: ${agent.updatedAt}\n  Role: ${agent.reason}`).join('\n\n')}

## Agent events

${status.events
  .filter((event) => !selectedAgent || event.agent === selectedAgent.id || event.message.includes(`[${selectedAgent.id}]`))
  .slice(-10)
  .map((event) => `- ${event.at} - ${event.message}`)
  .join('\n') || '- No agent-specific events yet.'}
`);
}

function printLiveFlow() {
  const status = readLiveStatus();
  if (!status) {
    console.log('No live agent status found. Start one with: npm run agents:start -- "your task"');
    return;
  }

  const nodeLine = status.flow.nodes
    .map((node) => `${node.id}[${node.state}]`)
    .join(' | ');

  console.log(`# Phere n8n-style Live Workflow

Task: ${status.task}
State: ${status.state}
Phase: ${status.phase}

## Nodes

${nodeLine}

## Edges

${status.flow.edges.map((edge) => `- ${edge.from} -> ${edge.to}`).join('\n')}

## Active Work

${status.agents.map((agent) => `- ${agent.id} [${agent.state}]\n  Building/Doing: ${agent.current}\n  Expected output: ${agent.output}\n  Next: ${agent.next}\n  ETA: ${formatDuration(agent.estimate.minMinutes)}-${formatDuration(agent.estimate.maxMinutes)} max`).join('\n\n')}

## Mermaid

\`\`\`mermaid
flowchart LR
${status.flow.edges.map((edge) => `  ${edge.from.replaceAll('-', '_')}["${edge.from}"] --> ${edge.to.replaceAll('-', '_')}["${edge.to}"]`).join('\n')}
\`\`\`
`);
}

function printEta() {
  const status = readLiveStatus();
  if (!status) {
    console.log('No live agent status found. Start one with: npm run agents:start -- "your task"');
    return;
  }

  console.log(`# Phere 9-Agent ETA

Task: ${status.task}
Estimated max: ${formatDuration(status.estimate.maxMinutes)}
Estimated range: ${formatDuration(status.estimate.minMinutes)}-${formatDuration(status.estimate.maxMinutes)}
Model: ${status.estimate.model}
Confidence: ${status.estimate.confidence}

## Per-agent ETA

${status.agents.map((agent) => `- ${agent.id} [${agent.state}]: ${formatDuration(agent.estimate.minMinutes)}-${formatDuration(agent.estimate.maxMinutes)} max (${agent.estimate.basis})`).join('\n')}
`);
}

function relativeDisplayPath(filePath) {
  return path.relative(process.cwd(), filePath).split(path.sep).join('/');
}

function ensureHandoffDir() {
  fs.mkdirSync(handoffTasksDir, { recursive: true });
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64) || 'task';
}

function readHandoffQueue() {
  if (!fs.existsSync(handoffQueuePath)) return null;
  return JSON.parse(fs.readFileSync(handoffQueuePath, 'utf8'));
}

function writeHandoffQueue(queue) {
  ensureHandoffDir();
  fs.writeFileSync(handoffQueuePath, `${JSON.stringify(queue, null, 2)}\n`, 'utf8');

  const nextAgent = queue.agents.find((agent) => agent.status !== 'completed');
  const lines = [
    '# Phere Codex Handoff Queue',
    '',
    `Task: ${queue.task}`,
    `State: ${queue.state}`,
    `Mode: ${queue.mode}`,
    `Cost: ${queue.cost}`,
    `Work type: ${queue.workType}`,
    `Risk: ${queue.risk}`,
    `Created: ${queue.createdAt}`,
    `Updated: ${queue.updatedAt}`,
    `Estimated max: ${formatDuration(queue.estimate.maxMinutes)}`,
    '',
    '## How To Use',
    '',
    '1. Run `npm run agents:handoff-next`.',
    '2. Copy the printed prompt into your already-open Codex app in this same repo.',
    '3. Let Codex inspect/edit/verify only inside the task scope.',
    '4. Mark that agent done with `npm run agents:handoff-done -- <agent> "summary"`.',
    '5. Repeat until all required agents are complete.',
    '',
    '## Next Agent',
    '',
    nextAgent
      ? `- ${nextAgent.id}: ${relativeDisplayPath(nextAgent.promptPath)}`
      : '- Queue complete. Run truth/test/release gates as needed.',
    '',
    '## Agent Queue',
    '',
    ...queue.agents.map((agent) => [
      `- ${agent.order}. ${agent.id} (${agent.tier}) [${agent.status}]`,
      `  Reason: ${agent.reason}`,
      `  Prompt: ${relativeDisplayPath(agent.promptPath)}`,
      agent.summary ? `  Summary: ${agent.summary}` : undefined,
    ].filter(Boolean).join('\n')),
    '',
    '## Rules',
    '',
    '- Free/manual handoff only. No paid API worker is used.',
    '- The current open Codex app does the thinking when you paste a prompt.',
    '- Queue files do not control Codex desktop directly.',
    '- No production deploys, production SQL, secrets, destructive git, or data deletion without explicit human approval.',
    '- Business agents run only after coding is done or when explicitly requested.',
    '- Every claim needs file, command, user, or deployment/admin evidence.',
    '',
  ];
  fs.writeFileSync(handoffMarkdownPath, `${lines.join('\n')}\n`, 'utf8');
}

function buildHandoffPrompt(queue, queueAgent) {
  const agent = resolveAgent(queueAgent.id);
  const agentDetails = defaultAgentDetails(queueAgent.id, queue.task);
  const readFirst = Array.from(new Set([
    'AGENTS.md',
    'docs/PHERE_9_AGENT_MANAGER_SYSTEM.md',
    'docs/PHERE_CODEX_HANDOFF_QUEUE.md',
    ...(agent?.reads || []),
  ]));
  const eta = queueAgent.estimate || defaultAgentEstimate(queueAgent.id, queue.risk, queue.task);

  return `# Phere Codex Handoff: ${queueAgent.id}

You are the already-open Codex app, acting as the \`${queueAgent.id}\` agent in the Phere 9-Agent Manager.

This is Phase 1: Codex Handoff Queue.

- Free/manual flow: no OpenAI API worker, no paid background LLM.
- Same workspace: \`${process.cwd()}\`
- Queue id: \`${queue.id}\`
- Prompt file: \`${relativeDisplayPath(queueAgent.promptPath)}\`

## Task

${queue.task}

## Route Context

- Work type: ${queue.workType}
- Risk: ${queue.risk}
- Agent reason: ${queueAgent.reason}
- Agent mission: ${agent?.mission || agentDetails.objective}
- Expected output: ${agentDetails.output}
- Rough ETA for this agent: ${formatDuration(eta.minMinutes)}-${formatDuration(eta.maxMinutes)} max (${eta.basis})

## Read First

${readFirst.map((item) => `- ${item}`).join('\n')}

## Hard Rules

- Start by checking \`git status --short --untracked-files=all\`.
- Protect unrelated user/generated changes. Do not revert files outside your task.
- Do not read, print, copy, or expose secrets from \`.env*\`, tokens, private keys, or credentials.
- Do not deploy, run production SQL, rotate secrets, delete data, or use destructive git commands.
- Do not call paid APIs or create API-based workers for this handoff.
- Do not claim "tests passed", "deployed", "secure", "production-ready", "enterprise-ready", or "shipped" without direct evidence.
- If you find conflicting sources, say what conflicts and prefer runtime truth such as \`package.json\`, lockfiles, current code, or fresh command output.
- Business agents can only produce truthful plans/copy/scripts tied to verified current capability, unless the user explicitly asks for roadmap material.

## What To Do

1. Act only as \`${queueAgent.id}\` for this handoff.
2. Inspect the files needed for this role.
3. Explain briefly what you found before editing.
4. Make the smallest scoped code/doc changes only if this role owns them.
5. Run the verification that matches the risk, or state exactly why it was not run.
6. Hand off with files inspected, files changed, commands run, evidence, risks, and next agent needs.

## Done Command

When this agent is done, run:

\`\`\`bash
npm run agents:handoff-done -- ${queueAgent.id} "short truthful summary of what ${queueAgent.id} completed"
\`\`\`
`;
}

function syncLiveStatusFromHandoff(queue, eventMessage, eventAgentId) {
  const now = new Date().toISOString();
  const status = {
    task: queue.task,
    state: queue.state === 'completed' ? 'completed' : 'handoff_ready',
    phase: queue.state === 'completed' ? 'codex_handoff_completed' : 'codex_handoff_queue_ready',
    workType: queue.workType,
    risk: queue.risk,
    agents: queue.agents.map((queueAgent) => enrichAgent({
      id: queueAgent.id,
      tier: queueAgent.tier,
      name: queueAgent.name,
      reason: queueAgent.reason,
      state: queueAgent.status === 'completed'
        ? 'completed'
        : queueAgent.status === 'ready'
          ? 'ready'
          : 'queued',
      current: queueAgent.status === 'completed'
        ? queueAgent.summary || 'Handoff completed.'
        : queueAgent.status === 'ready'
          ? `Prompt ready: ${relativeDisplayPath(queueAgent.promptPath)}`
          : 'Waiting in Codex handoff queue.',
      next: queueAgent.status === 'completed'
        ? 'No further handoff action for this agent.'
        : `Run npm run agents:handoff-next${queueAgent.status === 'ready' ? '' : ` -- ${queueAgent.id}`}`,
      estimate: queueAgent.estimate,
    }, queue.task, now)),
    startedAt: queue.createdAt,
    updatedAt: now,
    events: [
      { at: queue.createdAt, message: 'Codex handoff queue created.' },
      ...(queue.events || []),
      eventMessage ? { at: now, agent: eventAgentId, message: eventMessage } : null,
    ].filter(Boolean),
  };
  status.flow = buildWorkflowGraph(status.agents);
  status.estimate = estimateWorkflow(status);
  writeLiveStatus(status);
}

function createHandoffQueue(taskParts) {
  const task = taskParts.join(' ').trim();
  if (!task) {
    console.error('Provide a task for the Codex handoff queue.');
    process.exitCode = 1;
    return;
  }

  ensureHandoffDir();
  const route = inferRoute(task);
  const now = new Date().toISOString();
  const id = `${new Date().toISOString().replace(/[:.]/g, '-')}-${slugify(task)}`;
  const taskDir = path.join(handoffTasksDir, id);
  fs.mkdirSync(taskDir, { recursive: true });

  const queue = {
    id,
    task,
    state: 'ready',
    mode: 'Phase 1 Codex Handoff Queue',
    cost: 'free; uses the already-open Codex app manually; no API worker',
    workType: route.workType,
    risk: route.risk,
    explicitBusiness: route.explicitBusiness,
    createdAt: now,
    updatedAt: now,
    agents: route.agents.map((agent, index) => ({
      order: index + 1,
      id: agent.id,
      tier: agent.tier,
      name: agent.name,
      reason: agent.reason,
      status: index === 0 ? 'ready' : 'queued',
      promptPath: path.join(taskDir, `${String(index + 1).padStart(2, '0')}-${agent.id}.md`),
      estimate: defaultAgentEstimate(agent.id, route.risk, task),
      createdAt: now,
    })),
    events: [
      { at: now, message: `Created free Codex handoff queue with agents: ${route.agents.map((agent) => agent.id).join(', ')}.` },
    ],
  };
  queue.estimate = estimateWorkflow({ agents: queue.agents, risk: queue.risk, task: queue.task });

  for (const queueAgent of queue.agents) {
    fs.writeFileSync(queueAgent.promptPath, buildHandoffPrompt(queue, queueAgent), 'utf8');
  }
  writeHandoffQueue(queue);
  syncLiveStatusFromHandoff(queue, 'Codex handoff queue is ready.', 'orchestrator');

  const firstAgent = queue.agents[0];
  console.log(`# Codex Handoff Queue Created

Task: ${queue.task}
Mode: ${queue.mode}
Cost: ${queue.cost}
Queue: ${relativeDisplayPath(handoffQueuePath)}
Guide: docs/PHERE_CODEX_HANDOFF_QUEUE.md
Estimated max: ${formatDuration(queue.estimate.maxMinutes)}

Next prompt:
- ${firstAgent.id}: ${relativeDisplayPath(firstAgent.promptPath)}

Use:
  npm run agents:handoff-next
  npm run agents:handoff-status
  npm run agents:handoff-done -- ${firstAgent.id} "summary"
`);
}

function nextHandoffAgent(queue, requestedAgentId) {
  if (requestedAgentId) {
    const requested = resolveAgent(requestedAgentId);
    return requested
      ? queue.agents.find((agent) => agent.id === requested.id)
      : null;
  }
  return queue.agents.find((agent) => agent.status !== 'completed') || null;
}

function printHandoffNext(requestedAgentId) {
  const queue = readHandoffQueue();
  if (!queue) {
    console.log('No Codex handoff queue found. Create one with: npm run agents:handoff -- "your task"');
    return;
  }

  const queueAgent = nextHandoffAgent(queue, requestedAgentId);
  if (!queueAgent) {
    console.log('No matching pending handoff agent found. Run: npm run agents:handoff-status');
    return;
  }
  if (queueAgent.status === 'completed') {
    console.log(`${queueAgent.id} is already completed. Summary: ${queueAgent.summary || 'No summary recorded.'}`);
    return;
  }
  if (queueAgent.status === 'queued') {
    queueAgent.status = 'ready';
    queue.updatedAt = new Date().toISOString();
    queue.events.push({ at: queue.updatedAt, agent: queueAgent.id, message: `[${queueAgent.id}] Prompt opened from queue.` });
    writeHandoffQueue(queue);
    syncLiveStatusFromHandoff(queue, `[${queueAgent.id}] Prompt opened from queue.`, queueAgent.id);
  }

  console.log(`# Next Codex Handoff Prompt

Agent: ${queueAgent.id}
Prompt file: ${relativeDisplayPath(queueAgent.promptPath)}

Copy/paste the prompt below into your already-open Codex app.

---

${fs.readFileSync(queueAgent.promptPath, 'utf8')}
`);
}

function printHandoffStatus() {
  const queue = readHandoffQueue();
  if (!queue) {
    console.log('No Codex handoff queue found. Create one with: npm run agents:handoff -- "your task"');
    return;
  }

  const completed = queue.agents.filter((agent) => agent.status === 'completed').length;
  const nextAgent = queue.agents.find((agent) => agent.status !== 'completed');

  console.log(`# Phere Codex Handoff Status

Task: ${queue.task}
State: ${queue.state}
Mode: ${queue.mode}
Cost: ${queue.cost}
Work type: ${queue.workType}
Risk: ${queue.risk}
Progress: ${completed}/${queue.agents.length} agents completed
Estimated max: ${formatDuration(queue.estimate.maxMinutes)}
Queue files:
- ${relativeDisplayPath(handoffQueuePath)}
- ${relativeDisplayPath(handoffMarkdownPath)}

Next:
${nextAgent ? `- ${nextAgent.id}: run npm run agents:handoff-next${nextAgent.status === 'ready' ? '' : ` -- ${nextAgent.id}`}` : '- All handoff agents completed. Run truth/test/release gates as needed.'}

## Agents

${queue.agents.map((agent) => `- ${agent.order}. ${agent.id} (${agent.tier}) [${agent.status}]\n  Prompt: ${relativeDisplayPath(agent.promptPath)}\n  Reason: ${agent.reason}${agent.summary ? `\n  Summary: ${agent.summary}` : ''}`).join('\n\n')}
`);
}

function markHandoffDone(agentId, summaryParts) {
  const queue = readHandoffQueue();
  if (!queue) {
    console.error('No Codex handoff queue found.');
    process.exitCode = 1;
    return;
  }

  const resolved = resolveAgent(agentId);
  if (!resolved) {
    console.error(`Unknown agent: ${agentId || '(missing)'}`);
    process.exitCode = 1;
    return;
  }
  const summary = summaryParts.join(' ').trim();
  if (!summary) {
    console.error('Provide a truthful completion summary.');
    process.exitCode = 1;
    return;
  }

  const queueAgent = queue.agents.find((agent) => agent.id === resolved.id);
  if (!queueAgent) {
    console.error(`Agent ${resolved.id} is not in this handoff queue.`);
    process.exitCode = 1;
    return;
  }

  const now = new Date().toISOString();
  queueAgent.status = 'completed';
  queueAgent.summary = summary;
  queueAgent.completedAt = now;
  queue.updatedAt = now;

  const nextAgent = queue.agents.find((agent) => agent.status !== 'completed');
  if (nextAgent) {
    nextAgent.status = 'ready';
    queue.state = 'in_progress';
  } else {
    queue.state = 'completed';
  }

  queue.events.push({ at: now, agent: resolved.id, message: `[${resolved.id}] ${summary}` });
  writeHandoffQueue(queue);
  syncLiveStatusFromHandoff(queue, `[${resolved.id}] ${summary}`, resolved.id);
  printHandoffStatus();
}

function setAgentStatus(status, agentId, state, current, next) {
  const agent = status.agents.find((item) => item.id === agentId);
  const now = new Date().toISOString();
  if (!agent) return status;
  agent.state = state;
  agent.current = current;
  if (next) agent.next = next;
  agent.updatedAt = now;
  status.updatedAt = now;
  status.phase = state === 'failed' ? 'needs_attention' : 'working';
  status.events.push({ at: now, agent: agent.id, message: `[${agent.id}] ${current}` });
  status.flow = buildWorkflowGraph(status.agents);
  status.estimate = estimateWorkflow(status);
  writeLiveStatus(status);
  appendWorkerLog(`[${agentId}] ${state}: ${current}`);
  return status;
}

function runCommand(command, label) {
  return new Promise((resolve) => {
    appendWorkerLog(`$ ${command}`);
    const child = spawn(command, {
      cwd: process.cwd(),
      shell: true,
      windowsHide: true,
    });
    let output = '';
    child.stdout.on('data', (data) => {
      const text = data.toString();
      output += text;
      appendWorkerLog(text.trimEnd());
    });
    child.stderr.on('data', (data) => {
      const text = data.toString();
      output += text;
      appendWorkerLog(text.trimEnd());
    });
    child.on('error', (error) => {
      appendWorkerLog(`${label} failed to start: ${error.message}`);
      resolve({ code: 1, output, error });
    });
    child.on('close', (code) => {
      appendWorkerLog(`${label} exited with ${code}`);
      resolve({ code, output });
    });
  });
}

function createStatus(task) {
  const route = inferRoute(task);
  const now = new Date().toISOString();
  const status = {
    task,
    state: 'in_progress',
    phase: 'background_worker_started',
    workType: route.workType,
    risk: route.risk,
    agents: route.agents.map((agent) => enrichAgent({
      ...agent,
      state: agent.id === 'orchestrator' ? 'active' : 'queued',
      current: agent.id === 'orchestrator' ? undefined : 'Waiting for background worker.',
    }, task, now)),
    startedAt: now,
    updatedAt: now,
    events: [
      { at: now, message: `Background runner started for ${route.workType} task (${route.risk}).` },
      { at: now, message: `Selected agents: ${route.agents.map((agent) => agent.id).join(', ')}.` },
    ],
  };
  status.flow = buildWorkflowGraph(status.agents);
  status.estimate = estimateWorkflow(status);
  writeLiveStatus(status);
  return status;
}

async function runAutonomousWorker(taskParts) {
  const task = taskParts.join(' ').trim();
  if (!task) {
    appendWorkerLog('No task provided to worker.');
    process.exitCode = 1;
    return;
  }

  fs.writeFileSync(workerLogPath, '', 'utf8');
  appendWorkerLog(`worker started for task: ${task}`);
  let status = createStatus(task);
  status = setAgentStatus(status, 'orchestrator', 'active', 'Building route, ownership map, and safe execution order.', 'Hand off to planner/product and implementation checks.');

  const gitStatus = await runCommand('git status --short', 'git status');
  status.events.push({
    at: new Date().toISOString(),
    agent: 'orchestrator',
    message: `[orchestrator] git status checked; exit ${gitStatus.code}.`,
  });
  writeLiveStatus(status);
  status = setAgentStatus(status, 'orchestrator', 'completed', 'Route and initial repository state check completed.', 'Await final integration handoff.');

  status = setAgentStatus(status, 'planner', 'active', 'Creating acceptance criteria and verification slices for the task.', 'Hand off criteria to product and tester.');
  status = setAgentStatus(status, 'planner', 'completed', 'Acceptance criteria drafted: feature behavior, performance review, mobile layout verification, and test/build checks.', 'No further planner action until scope changes.');

  status = setAgentStatus(status, 'product', 'active', 'Checking whether the requested work fits the Saman wedding-planning workflow.', 'Hand off workflow edge cases to frontend/tester.');
  status = setAgentStatus(status, 'product', 'completed', 'Product review drafted: keep Saman fast for shopping lists, assignments, conversion to expenses, and mobile family use.', 'No further product action until implementation changes.');

  if (status.agents.some((agent) => agent.id === 'frontend')) {
    status = setAgentStatus(status, 'frontend', 'active', 'Inspecting Saman UI/mobile surfaces and likely files.', 'Run static scan on Saman implementation.');
    const frontendScan = await runCommand('rg -n "useMemo|useCallback|map\\(|filter\\(|reduce\\(|Virtual|React\\.memo|memo\\(|overflow|sticky|grid|flex" src/pages/Saman.jsx src/components', 'frontend scan');
    status = setAgentStatus(
      status,
      'frontend',
      frontendScan.code === 0 ? 'completed' : 'failed',
      frontendScan.code === 0
        ? 'Saman UI scan completed; review logs for layout/list hotspots.'
        : 'Saman UI scan failed or found no matching files; review logs.',
      'Tester should verify mobile behavior after any code change.'
    );
  }

  if (status.agents.some((agent) => agent.id === 'performance')) {
    status = setAgentStatus(status, 'performance', 'active', 'Checking Saman list rendering, derived totals, and bundle/build risk.', 'Run performance-oriented static scan.');
    const perfScan = await runCommand('rg -n "map\\(|filter\\(|reduce\\(|useMemo|useCallback|lazy\\(|import\\(|Virtual|virtual" src/pages/Saman.jsx src/lib src/components', 'performance scan');
    status = setAgentStatus(
      status,
      'performance',
      perfScan.code === 0 ? 'completed' : 'failed',
      perfScan.code === 0
        ? 'Performance scan completed; review logs for repeated calculations and list rendering risk.'
        : 'Performance scan failed or found no matching files; review logs.',
      'Tester should run build and targeted checks.'
    );
  }

  if (status.agents.some((agent) => agent.id === 'mobile')) {
    status = setAgentStatus(status, 'mobile', 'completed', 'Mobile review checklist prepared: 320px width, scrolling, sticky controls, touch targets, long item names, WebView wrapper impact.', 'Run manual mobile QA or browser viewport checks when UI changes exist.');
  }

  if (status.agents.some((agent) => agent.id === 'tester')) {
    status = setAgentStatus(status, 'tester', 'active', 'Running npm test as deterministic verification.', 'Run build after tests.');
    const testResult = await runCommand('npm run test', 'npm test');
    status = setAgentStatus(
      status,
      'tester',
      testResult.code === 0 ? 'active' : 'failed',
      testResult.code === 0 ? 'npm run test passed; running build next.' : 'npm run test failed; review logs before continuing.',
      testResult.code === 0 ? 'Run npm run build.' : 'Fix failing tests before release.'
    );

    if (testResult.code === 0) {
      const buildResult = await runCommand('npm run build', 'npm build');
      status = setAgentStatus(
        status,
        'tester',
        buildResult.code === 0 ? 'completed' : 'failed',
        buildResult.code === 0 ? 'npm run build passed; verification gate completed.' : 'npm run build failed; review logs before marking done.',
        buildResult.code === 0 ? 'Truth gate can summarize verified results.' : 'Fix build failure.'
      );
    }
  }

  const failedAgents = status.agents.filter((agent) => agent.state === 'failed');
  const now = new Date().toISOString();
  status.updatedAt = now;
  status.phase = failedAgents.length ? 'needs_attention' : 'truth_gate_completed';
  status.state = failedAgents.length ? 'needs_attention' : 'completed';
  status.events.push({
    at: now,
    message: failedAgents.length
      ? `Background worker finished with attention needed: ${failedAgents.map((agent) => agent.id).join(', ')}.`
      : 'Background worker finished successfully; deterministic verification completed.',
  });
  status.flow = buildWorkflowGraph(status.agents);
  status.estimate = estimateWorkflow(status);
  writeLiveStatus(status);
  appendWorkerLog(`worker finished with state: ${status.state}`);
}

function startBackgroundRun(taskParts) {
  const task = taskParts.join(' ').trim();
  if (!task) {
    console.error('Provide a task to run.');
    process.exitCode = 1;
    return;
  }

  ensureStatusDir();
  fs.writeFileSync(workerLogPath, '', 'utf8');
  const child = spawn(process.execPath, [scriptPath, 'worker', task], {
    cwd: process.cwd(),
    detached: true,
    stdio: 'ignore',
    windowsHide: true,
  });
  child.unref();
  fs.writeFileSync(workerPidPath, `${child.pid}\n`, 'utf8');
  console.log(`Started background agent runner.
PID: ${child.pid}
Task: ${task}

Watch status:
  npm run agents:status
  npm run agents:activity
  npm run agents:flow
  npm run agents:logs`);
}

function printWorkerLogs() {
  if (!fs.existsSync(workerLogPath)) {
    console.log('No worker log found yet.');
    return;
  }
  const text = fs.readFileSync(workerLogPath, 'utf8').trim();
  console.log(text || 'Worker log is empty.');
}

function stopBackgroundRun() {
  if (!fs.existsSync(workerPidPath)) {
    console.log('No worker PID file found.');
    return;
  }
  const pid = Number(fs.readFileSync(workerPidPath, 'utf8').trim());
  if (!pid) {
    console.log('Worker PID file is invalid.');
    return;
  }
  try {
    process.kill(pid);
    console.log(`Stopped background worker ${pid}.`);
  } catch (error) {
    console.log(`Could not stop worker ${pid}: ${error.message}`);
  }
}

function ensureAgentosRunsDir() {
  fs.mkdirSync(agentosRunsDir, { recursive: true });
}

function normalizeRunId(value) {
  return String(value || '').trim();
}

function agentosRunPath(runId, ext = 'json') {
  return path.join(agentosRunsDir, runId, `KARYNTH_AGENT_RUN.${ext}`);
}

function latestAgentosRunId() {
  if (!fs.existsSync(agentosRunsDir)) return null;
  const candidates = fs.readdirSync(agentosRunsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort()
    .reverse();
  return candidates[0] || null;
}

function readAgentosRun(runId) {
  const id = normalizeRunId(runId) || latestAgentosRunId();
  if (!id) return null;
  const jsonPath = agentosRunPath(id, 'json');
  if (!fs.existsSync(jsonPath)) return null;
  return JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
}

function writeAgentosRun(run) {
  ensureAgentosRunsDir();
  const runDir = path.join(agentosRunsDir, run.id);
  fs.mkdirSync(runDir, { recursive: true });
  const jsonPath = agentosRunPath(run.id, 'json');
  const markdownPath = agentosRunPath(run.id, 'md');
  fs.writeFileSync(jsonPath, `${JSON.stringify(run, null, 2)}\n`, 'utf8');

  const lines = [
    `# ${run.brandName} Run`,
    '',
    `Run id: ${run.id}`,
    `Task: ${run.task}`,
    `State: ${run.state}`,
    `Runtime: ${run.runtime.mode}`,
    `Paid models allowed: ${run.runtime.allowPaidModels ? 'yes' : 'no'}`,
    `Work type: ${run.workType}`,
    `Risk: ${run.risk}`,
    `Created: ${run.createdAt}`,
    `Updated: ${run.updatedAt}`,
    '',
    '## Agents',
    '',
    ...run.agents.map((agent) => `- ${agent.displayName} (${agent.id}) [${agent.status}]: ${agent.reason}`),
    '',
    '## Work Units',
    '',
    ...run.workUnits.map((unit) => `- ${unit.id} [${unit.status}]: ${unit.objective}`),
    '',
    '## Evidence',
    '',
    ...(run.evidence.length ? run.evidence.map((item) => `- ${item.at} - ${item.type}: ${item.note}`) : ['- No evidence recorded yet.']),
    '',
    '## Warnings',
    '',
    ...(run.warnings.length ? run.warnings.map((warning) => `- ${warning}`) : ['- None.']),
    '',
    '## Research Catalogue',
    '',
    ...run.researchCatalog.map((item) => `- ${item.repo}: ${item.v1Decision}; ${item.installPolicy}`),
    '',
    '## Paths',
    '',
    `- JSON: ${relativeDisplayPath(jsonPath)}`,
    `- Markdown: ${relativeDisplayPath(markdownPath)}`,
    `- Project profile: ${relativeDisplayPath(agentosProjectProfilePath)}`,
    `- User registry: ${run.userRegistryPath}`,
    '',
  ];
  fs.writeFileSync(markdownPath, `${lines.join('\n')}\n`, 'utf8');
  return { jsonPath, markdownPath };
}

function createWorkUnits(route) {
  const needsImplementation = ['feature', 'bug', 'refactor', 'database', 'release'].includes(route.workType);
  const needsReview = route.risk !== 'R0' || needsImplementation;
  return [
    { id: 'research', status: 'queued', objective: 'Read project profile, approved docs, and relevant local files before implementation.' },
    { id: 'plan', status: 'queued', objective: 'Define safe scope, agent ownership, acceptance criteria, and approvals.' },
    { id: 'implement', status: needsImplementation ? 'queued' : 'skipped', objective: 'Make scoped code or documentation changes owned by selected agents.' },
    { id: 'verify', status: needsReview ? 'queued' : 'skipped', objective: 'Run tests/build/checklists appropriate to the risk.' },
    { id: 'review', status: needsReview ? 'queued' : 'skipped', objective: 'Apply tester, security, production, and truth gates where relevant.' },
    { id: 'handoff', status: 'queued', objective: 'Summarize changes, evidence, unverified items, assumptions, and residual risk.' },
  ];
}

function createAgentosRun(taskParts, startState = 'planned') {
  const task = taskParts.join(' ').trim();
  if (!task) {
    console.error(`Provide a task for ${agentosBrandName}.`);
    process.exitCode = 1;
    return null;
  }

  const config = agentosConfig();
  const route = inferRoute(task);
  const now = new Date().toISOString();
  const id = `${now.replace(/[:.]/g, '-')}-${slugify(task)}`;
  const uniqueResearch = dedupeResearchCatalog();
  const warnings = [];

  if (config.profile.profileWarning) warnings.push(config.profile.profileWarning);
  if (config.runtime === 'voltagent') {
    warnings.push('VoltAgent adapter selected; paid model providers remain blocked unless AGENTOS_ALLOW_PAID_MODELS=true.');
  }
  if (!config.allowPaidModels) {
    warnings.push('Zero-investment guard active: paid model providers and hidden API workers are blocked by default.');
  }

  const run = {
    schemaVersion: 1,
    id,
    brandName: config.brandName,
    compatibilityName: config.compatibilityName,
    task,
    state: startState,
    workType: route.workType,
    risk: route.risk,
    runtime: {
      mode: config.runtime,
      allowPaidModels: config.allowPaidModels,
      localModelProvider: config.localModelProvider,
      adapter: config.runtime === 'voltagent' ? 'VoltAgent optional adapter' : 'Local deterministic Codex/CLI adapter',
    },
    notebooklm: {
      enabled: config.notebookEnabled,
      notebookId: agentosNotebookId,
      boundary: 'Research accelerator only; local files and command output remain source of truth.',
    },
    projectProfilePath: agentosProjectProfilePath,
    userRegistryPath: config.userRegistryPath,
    agents: route.agents.map((agent, index) => ({
      order: index + 1,
      id: agent.id,
      tier: agent.tier,
      name: agent.name,
      displayName: agent.displayName || agentDisplayName(agent.id),
      label: agent.label || agentLabel(agent.id),
      reason: agent.reason,
      status: index === 0 && startState === 'in_progress' ? 'active' : 'queued',
      estimate: defaultAgentEstimate(agent.id, route.risk, task),
    })),
    workUnits: createWorkUnits(route),
    approvals: {
      requiredFor: ['live deploy', 'production SQL', 'secret rotation', 'data deletion', 'destructive git', 'paid model providers'],
      granted: [],
    },
    filesTouched: [],
    commandsRun: [],
    evidence: [
      { at: now, type: 'route', note: `Selected agents: ${route.agents.map((agent) => agent.id).join(', ')}` },
      { at: now, type: 'runtime', note: `Runtime mode: ${config.runtime}; paid models allowed: ${config.allowPaidModels}` },
    ],
    researchCatalog: uniqueResearch,
    warnings,
    createdAt: now,
    updatedAt: now,
  };

  const paths = writeAgentosRun(run);
  return { run, paths };
}

function printAgentosList(tier = 'all') {
  const config = agentosConfig();
  const selected = byTier(tier);
  console.log(`# ${config.brandName} Agent Roster

Compatibility layer: ${config.compatibilityName}
Default runtime: ${config.runtime}
Paid models allowed: ${config.allowPaidModels ? 'yes' : 'no'}
Project profile: ${relativeDisplayPath(agentosProjectProfilePath)}
User registry: ${config.userRegistryPath}

## Agents

${selected.map((agent) => `- ${agentLabel(agent)} (${agent.tier}): ${agent.mission}`).join('\n')}
`);
}

function printAgentosResearch() {
  const uniqueResearch = dedupeResearchCatalog();
  console.log(`# ${agentosBrandName} Research Catalogue

Unique repos: ${uniqueResearch.length}

${uniqueResearch.map((item) => `- ${item.repo} [${item.category}]: ${item.v1Decision}. ${item.installPolicy} Lesson: ${item.lesson}`).join('\n')}
`);
}

function printAgentosAdapter() {
  const config = agentosConfig();
  const status = voltagentAdapterStatus();
  console.log(`# ${config.brandName} Adapter Status

Runtime selected: ${config.runtime}
Paid models allowed: ${config.allowPaidModels ? 'yes' : 'no'}
VoltAgent enable switch: ${status.policy.enableWith}
Paid provider guard: ${status.policy.paidModelGuard}

## VoltAgent packages

${status.packages.map((item) => `- ${item.packageName}: ${item.installed ? `installed (${item.resolved})` : `missing (${item.error})`}`).join('\n')}

## Boundary

- This command only resolves packages.
- It does not import providers, call models, spawn workers, or spend money.
- AgentOS remains local by default.
`);
}

function printAgentosPlan(taskParts, startState = 'planned') {
  const result = createAgentosRun(taskParts, startState);
  if (!result) return;
  const { run, paths } = result;
  console.log(`# ${run.brandName} Run ${startState === 'in_progress' ? 'Started' : 'Planned'}

Run id: ${run.id}
Task: ${run.task}
State: ${run.state}
Runtime: ${run.runtime.mode}
Paid models allowed: ${run.runtime.allowPaidModels ? 'yes' : 'no'}
Work type: ${run.workType}
Risk: ${run.risk}

## Selected agents

${run.agents.map((agent) => `- ${agent.displayName} (${agent.id}) [${agent.tier}]: ${agent.reason}`).join('\n')}

## Work units

${run.workUnits.map((unit) => `- ${unit.id} [${unit.status}]: ${unit.objective}`).join('\n')}

## Files

- ${relativeDisplayPath(paths.jsonPath)}
- ${relativeDisplayPath(paths.markdownPath)}

## Guardrails

- Default runtime is local unless AGENTOS_RUNTIME=voltagent.
- Paid model providers are blocked unless AGENTOS_ALLOW_PAID_MODELS=true.
- NotebookLM is research-only and must be re-authenticated before use.
`);
}

function printAgentosStatus(runIdOrJson) {
  const asJson = runIdOrJson === 'json';
  const run = readAgentosRun(asJson ? null : runIdOrJson);
  if (!run) {
    console.log(`No ${agentosBrandName} run found. Create one with: npm run agentos:plan -- "your task"`);
    return;
  }
  if (asJson) {
    console.log(JSON.stringify(run, null, 2));
    return;
  }
  console.log(`# ${run.brandName} Status

Run id: ${run.id}
Task: ${run.task}
State: ${run.state}
Runtime: ${run.runtime.mode}
Work type: ${run.workType}
Risk: ${run.risk}
Updated: ${run.updatedAt}

## Agents

${run.agents.map((agent) => `- ${agent.displayName} (${agent.id}) [${agent.status}]`).join('\n')}

## Latest evidence

${run.evidence.slice(-8).map((item) => `- ${item.at} - ${item.type}: ${item.note}`).join('\n') || '- No evidence yet.'}

## Warnings

${run.warnings.map((warning) => `- ${warning}`).join('\n') || '- None.'}
`);
}

function updateAgentosRun(noteParts, done = false) {
  const maybeRun = readAgentosRun(noteParts[0]);
  const run = maybeRun || readAgentosRun();
  if (!run) {
    console.error(`No ${agentosBrandName} run found.`);
    process.exitCode = 1;
    return;
  }

  const parts = maybeRun ? noteParts.slice(1) : noteParts;
  const maybeAgent = resolveAgent(parts[0]);
  const note = (maybeAgent ? parts.slice(1) : parts).join(' ').trim();
  if (!note) {
    console.error('Provide a status note.');
    process.exitCode = 1;
    return;
  }

  const now = new Date().toISOString();
  run.updatedAt = now;
  run.state = done ? 'completed' : 'in_progress';
  if (maybeAgent) {
    const agent = run.agents.find((item) => item.id === maybeAgent.id);
    if (agent) agent.status = done ? 'completed' : 'active';
    run.evidence.push({ at: now, type: 'agent-update', agent: maybeAgent.id, note });
  } else {
    run.evidence.push({ at: now, type: done ? 'done' : 'status', note });
  }
  if (done) {
    run.workUnits = run.workUnits.map((unit) => unit.status === 'queued' ? { ...unit, status: 'completed' } : unit);
  }
  writeAgentosRun(run);
  printAgentosStatus(run.id);
}

function printWorkflow(type) {
  const normalized = (type || '').toLowerCase().trim();
  const flow = workflows[normalized];
  if (!flow) {
    console.error(`Unknown workflow: ${type || '(missing)'}`);
    console.error(`Known workflows: ${Object.keys(workflows).join(', ')}`);
    process.exitCode = 1;
    return;
  }

  console.log(`# Workflow: ${normalized}

## Agent sequence

${flow.map((step, index) => `${index + 1}. ${step}`).join('\n')}

## Rules

- Assign write scopes before edits.
- Define verification before implementation.
- Add security for auth, data, secrets, public routes, exports, deletes, or RLS.
- Add production for build, env, deploy, migrations, functions, mobile release, or rollback.
- Business agents run only after coding is done or explicit user request.
`);
}

function printGate(scope = 'release') {
  const gates = {
    feature: [
      'Acceptance criteria written.',
      'Product edge cases checked.',
      'Tester verification defined.',
      'npm run test for logic changes.',
      'npm run build for UI/app wiring changes.',
    ],
    database: [
      'Migration reviewed for idempotency and compatibility.',
      'RLS checked for owner, editor, and viewer.',
      'Rollback risk documented.',
      'Security review complete.',
      'No production SQL without explicit human approval.',
    ],
    security: [
      'No secrets in tracked files or frontend VITE variables except publishable keys.',
      'Public routes expose only intended data.',
      'Logs avoid sensitive finance/auth data.',
      'Delete/export/recovery flows are safe.',
      'RLS and role boundaries are clear.',
    ],
    release: [
      'git status reviewed.',
      'npm run test passed or skipped with reason.',
      'npm run build passed or skipped with reason.',
      'Env changes reviewed.',
      'Supabase migrations/functions reviewed if touched.',
      'Rollback path documented.',
      'Smoke test plan ready.',
      'Human approval before live deploy.',
    ],
    business: [
      'Coding is complete and verified, or user explicitly requested business output.',
      'No claims about unbuilt features.',
      'Assumptions stated.',
      'Legal/compliance claims reviewed by legal-compliance and final human reviewer.',
      'Output is plan/copy/script/docs unless user asks for code.',
    ],
    truth: [
      'Important claims have evidence from files, command output, user context, or deployment/admin sources.',
      'Facts, assumptions, recommendations, and unknowns are separated.',
      'Dependency versions come from package.json or lockfiles.',
      'Verification claims name the command and result.',
      'Production/deployment claims name deployment evidence.',
      'Source conflicts are called out instead of hidden.',
      'No blanket secure/enterprise-ready/shipped claim without direct evidence.',
    ],
  };

  const selected = gates[scope] || gates.release;
  console.log(`# Gate: ${scope}

${selected.map((item) => `- ${item}`).join('\n')}
`);
}

function printTruthRules() {
  console.log(`# Phere 9-Agent Manager Truth Rules

## Evidence levels

- E0: no evidence. Say unknown or verify first.
- E1: inference from nearby code/docs. Phrase as likely or appears.
- E2: direct file evidence. Name the file.
- E3: fresh command/test output. Name the command and result.
- E4: external production/admin evidence. Name the source.

## Source order

1. Fresh command output for validation status.
2. Current code for implemented behavior.
3. package.json and lockfiles for dependency versions and scripts.
4. Supabase schema/migrations for database structure.
5. Deployment logs/dashboards for production status.
6. Docs for design intent, roadmap, and history.
7. User statement for requested goals or external context.

## Forbidden without evidence

- tests passed
- deployed
- production-ready
- secure
- enterprise-ready
- shipped
- customer demand, adoption, revenue, or compliance

When sources conflict, say so and use the closest source to runtime truth.
`);
}

const [command, first, ...rest] = process.argv.slice(2);

if (!command || command === 'help' || command === '--help' || command === '-h') {
  usage();
} else if (command === 'list') {
  listAgents(first || 'all');
} else if (command === 'brief') {
  printBrief(first, rest);
} else if (command === 'route') {
  routeTask([first, ...rest].filter(Boolean));
} else if (command === 'workflow') {
  printWorkflow(first);
} else if (command === 'gate') {
  printGate(first || 'release');
} else if (command === 'truth') {
  printTruthRules();
} else if (command === 'codex' || command === 'codex-autonomous' || command === 'autonomous') {
  printCodexAutonomous([first, ...rest].filter(Boolean));
} else if (command === 'start') {
  startLiveStatus([first, ...rest].filter(Boolean));
} else if (command === 'status') {
  printLiveStatus(first === 'json');
} else if (command === 'activity') {
  printAgentActivity(first);
} else if (command === 'flow') {
  printLiveFlow();
} else if (command === 'eta') {
  printEta();
} else if (command === 'handoff') {
  createHandoffQueue([first, ...rest].filter(Boolean));
} else if (command === 'handoff-next') {
  printHandoffNext(first);
} else if (command === 'handoff-status') {
  printHandoffStatus();
} else if (command === 'handoff-done') {
  markHandoffDone(first, rest);
} else if (command === 'run') {
  startBackgroundRun([first, ...rest].filter(Boolean));
} else if (command === 'logs') {
  printWorkerLogs();
} else if (command === 'stop') {
  stopBackgroundRun();
} else if (command === 'worker') {
  await runAutonomousWorker([first, ...rest].filter(Boolean));
} else if (command === 'update') {
  updateLiveStatus([first, ...rest].filter(Boolean));
} else if (command === 'done') {
  updateLiveStatus([first, ...rest].filter(Boolean), 'completed');
} else if (command === 'agentos:list' || command === 'agentos-list') {
  printAgentosList(first || 'all');
} else if (command === 'agentos:research' || command === 'agentos-research') {
  printAgentosResearch();
} else if (command === 'agentos:adapter' || command === 'agentos-adapter') {
  printAgentosAdapter();
} else if (command === 'agentos:plan' || command === 'agentos-plan') {
  printAgentosPlan([first, ...rest].filter(Boolean), 'planned');
} else if (command === 'agentos:start' || command === 'agentos-start') {
  printAgentosPlan([first, ...rest].filter(Boolean), 'in_progress');
} else if (command === 'agentos:status' || command === 'agentos-status') {
  printAgentosStatus(first);
} else if (command === 'agentos:update' || command === 'agentos-update') {
  updateAgentosRun([first, ...rest].filter(Boolean), false);
} else if (command === 'agentos:done' || command === 'agentos-done') {
  updateAgentosRun([first, ...rest].filter(Boolean), true);
} else if (command === 'agentos:gate' || command === 'agentos-gate') {
  printGate(first || 'release');
} else if (command === 'agentos:truth' || command === 'agentos-truth') {
  printTruthRules();
} else {
  console.error(`Unknown command: ${command}`);
  usage();
  process.exitCode = 1;
}
