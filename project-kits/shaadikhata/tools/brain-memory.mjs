#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

function loadDotEnv() {
  const envPath = path.resolve(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) return;

  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;
    const [, key, rawValue] = match;
    if (process.env[key] !== undefined) continue;
    process.env[key] = rawValue.replace(/^['"]|['"]$/g, '');
  }
}

loadDotEnv();

const memoryPath = process.env.BRAIN_MEMORY_PATH || path.join('.data', 'brain-memory.json');
const defaultProjectId = process.env.BRAIN_PROJECT_ID || 'phere-shaadikhata';
const provider = String(process.env.BRAIN_MEMORY_PROVIDER || 'json').toLowerCase();
const mem0ApiKey = process.env.MEM0_API_KEY || '';
const mem0BaseUrl = process.env.MEM0_BASE_URL || 'https://api.mem0.ai';
const mem0UserId = process.env.BRAIN_MEMORY_USER_ID || 'phere-user';
const mem0Enabled = provider === 'mem0' && Boolean(mem0ApiKey);
const command = process.argv[2] || 'help';
const args = process.argv.slice(3);
const flagsWithValues = new Set(['--category', '--scope', '--tag', '--run-id', '--confidence']);

const categories = new Set([
  'profile',
  'preference',
  'project',
  'writing_style',
  'design_style',
  'skill_rule',
  'workflow',
  'correction',
  'decision',
  'example',
  'rejected_output',
  'tool_usage',
]);
const scopes = new Set(['user', 'project', 'run']);
const approvalCategories = new Set(['project', 'decision', 'workflow', 'skill_rule']);

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9\u0900-\u097f]+/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeTags(value) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map(tag => String(tag).trim().toLowerCase()).filter(Boolean))];
}

function normalizeId(value) {
  const text = String(value || '').trim();
  return text || null;
}

function sanitizeMemoryContent(content) {
  const text = String(content || '').trim();
  const checks = [
    {
      pattern: /\b(?:password|passwd|pwd|secret|api[_\s-]?key|access[_\s-]?token|auth[_\s-]?token|bearer)\b\s*[:=]?\s*[^\s,;]{4,}/i,
      reason: 'access credential or secret',
    },
    {
      pattern: /\b(?:sk|m0|ghp|gho|glpat|xox[baprs])[-_][a-z0-9_-]{4,}\b/i,
      reason: 'API key or platform token',
    },
    {
      pattern: /\b(?:otp|one[-\s]?time password|verification code)\D{0,20}\d{4,8}\b/i,
      reason: 'OTP or verification code',
    },
    {
      pattern: /\b(?:bank|account|ifsc|iban|routing|card|cvv|upi pin)\b.{0,80}\d{4,}/i,
      reason: 'bank or payment data',
    },
    {
      pattern: /\b(?:aadhaar|aadhar|pan|passport|ssn|driver'?s?\s+license)\b.{0,80}[a-z0-9-]{4,}/i,
      reason: 'private identity document',
    },
  ];

  if (!text) return { rejected: true, reason: 'empty memory content', safeContent: '' };
  const match = checks.find(check => check.pattern.test(text));
  if (!match) return { rejected: false, safeContent: text };
  return { rejected: true, reason: match.reason, safeContent: '[REDACTED]' };
}

function nowIso() {
  return new Date().toISOString();
}

function readFlag(name) {
  const index = args.indexOf(name);
  if (index < 0) return null;
  return args[index + 1] && !args[index + 1].startsWith('--') ? args[index + 1] : true;
}

function positionalArgs() {
  const values = [];
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg.startsWith('--')) {
      if (flagsWithValues.has(arg) && args[index + 1] && !args[index + 1].startsWith('--')) index += 1;
      continue;
    }
    values.push(arg);
  }
  return values;
}

function readMemoryFile() {
  try {
    if (!fs.existsSync(memoryPath)) return [];
    const parsed = JSON.parse(fs.readFileSync(memoryPath, 'utf8'));
    return Array.isArray(parsed) ? parsed.map(normalizeMemory) : [];
  } catch (error) {
    console.error(`Could not read ${memoryPath}: ${error.message}`);
    process.exitCode = 1;
    return [];
  }
}

function writeMemoryFile(memories) {
  fs.mkdirSync(path.dirname(memoryPath), { recursive: true });
  fs.writeFileSync(memoryPath, JSON.stringify(memories, null, 2), 'utf8');
}

function normalizeMemory(memory) {
  const createdAt = memory?.created_at || nowIso();
  const category = categories.has(memory?.category) ? memory.category : 'preference';
  const scope = scopes.has(memory?.scope) ? memory.scope : 'user';

  return {
    id: String(memory?.id || crypto.randomUUID()),
    content: String(memory?.content || '').trim(),
    category,
    scope,
    project_id: normalizeId(memory?.project_id),
    run_id: normalizeId(memory?.run_id),
    tags: normalizeTags(memory?.tags),
    source: memory?.source || 'manual',
    confidence: Number.isFinite(Number(memory?.confidence)) ? Math.max(0, Math.min(1, Number(memory.confidence))) : 0.8,
    created_at: createdAt,
    updated_at: memory?.updated_at || createdAt,
    last_used_at: memory?.last_used_at || null,
    is_sensitive: Boolean(memory?.is_sensitive),
    is_approved: memory?.is_approved !== false,
    requires_approval: Boolean(memory?.requires_approval),
    approval_reason: normalizeId(memory?.approval_reason),
  };
}

function memoryKey(memory) {
  return [
    memory.scope || 'user',
    memory.project_id || '',
    memory.run_id || '',
    memory.category || 'preference',
    normalizeText(memory.content),
  ].join('|');
}

function scoreMemory(query, memory) {
  const tokens = normalizeText(query).split(' ').filter(token => token.length >= 2);
  if (!tokens.length) return memory.confidence;
  const haystack = normalizeText(`${memory.content} ${memory.category} ${memory.tags.join(' ')}`);
  return tokens.reduce((score, token) => score + (haystack.includes(token) ? 2 : 0), memory.confidence);
}

function printMemory(memory) {
  const approval = memory.is_approved ? 'approved' : 'pending';
  const scope = memory.project_id ? `${memory.scope}:${memory.project_id}` : memory.scope;
  console.log(`- ${memory.id} [${memory.category}/${scope}/${approval}] ${memory.content}`);
  if (memory.tags.length) console.log(`  tags: ${memory.tags.join(', ')}`);
  if (memory.approval_reason) console.log(`  approval: ${memory.approval_reason}`);
}

function buildMemoryFromArgs() {
  const content = positionalArgs().join(' ').trim();
  if (!content) {
    console.error('Usage: npm run brain:add -- "memory text" [--category preference] [--scope user|project|run] [--tag tag]');
    process.exitCode = 1;
    return null;
  }

  const sanitized = sanitizeMemoryContent(content);
  if (sanitized.rejected) {
    console.error(`Rejected memory: ${sanitized.reason}.`);
    process.exitCode = 1;
    return null;
  }

  const category = categories.has(readFlag('--category')) ? readFlag('--category') : 'preference';
  const scope = scopes.has(readFlag('--scope')) ? readFlag('--scope') : (approvalCategories.has(category) ? 'project' : 'user');
  const tags = args
    .map((arg, index) => (arg === '--tag' ? args[index + 1] : null))
    .filter(Boolean);
  const requiresApproval = scope === 'project' && approvalCategories.has(category) && readFlag('--approved') !== true;
  const createdAt = nowIso();
  return normalizeMemory({
    id: crypto.randomUUID(),
    content: sanitized.safeContent,
    category,
    scope,
    project_id: scope === 'project' || scope === 'run' ? defaultProjectId : null,
    run_id: scope === 'run' ? normalizeId(readFlag('--run-id')) : null,
    tags,
    source: 'manual',
    confidence: Number(readFlag('--confidence')) || 0.8,
    created_at: createdAt,
    updated_at: createdAt,
    is_approved: !requiresApproval,
    requires_approval: requiresApproval,
    approval_reason: requiresApproval ? 'Project/workflow memories require approval before long-term use.' : null,
  });
}

function addMemory() {
  const memory = buildMemoryFromArgs();
  if (!memory) return;
  const createdAt = nowIso();
  const memories = readMemoryFile();
  const existingIndex = memories.findIndex(item => memoryKey(item) === memoryKey(memory));

  if (existingIndex >= 0) {
    const existing = memories[existingIndex];
    const merged = normalizeMemory({
      ...existing,
      tags: [...new Set([...existing.tags, ...memory.tags])],
      confidence: Math.max(existing.confidence, memory.confidence),
      is_approved: existing.is_approved && memory.is_approved,
      requires_approval: existing.requires_approval || memory.requires_approval,
      approval_reason: existing.approval_reason || memory.approval_reason,
      updated_at: createdAt,
    });
    writeMemoryFile([merged, ...memories.filter((_, index) => index !== existingIndex)]);
    printMemory(merged);
    return;
  }

  writeMemoryFile([memory, ...memories]);
  printMemory(memory);
}

function listMemories() {
  const includeAll = args.includes('--all');
  const scope = readFlag('--scope');
  const memories = readMemoryFile()
    .filter(memory => includeAll || memory.is_approved)
    .filter(memory => !scope || memory.scope === scope)
    .sort((a, b) => String(b.updated_at).localeCompare(String(a.updated_at)));

  if (!memories.length) {
    console.log('No memories found.');
    return;
  }
  memories.forEach(printMemory);
}

function searchMemories() {
  const query = positionalArgs().join(' ').trim();
  if (!query) {
    console.error('Usage: npm run brain:search -- "query" [--all]');
    process.exitCode = 1;
    return;
  }
  const includeAll = args.includes('--all');
  const results = readMemoryFile()
    .filter(memory => includeAll || memory.is_approved)
    .map(memory => ({ memory, score: scoreMemory(query, memory) }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map(item => item.memory);

  if (!results.length) {
    console.log('No matching memories found.');
    return;
  }
  results.forEach(printMemory);
}

function forgetMemory() {
  const id = args[0];
  if (!id) {
    console.error('Usage: npm run brain:forget -- <memory-id>');
    process.exitCode = 1;
    return;
  }
  const memories = readMemoryFile();
  const next = memories.filter(memory => memory.id !== id);
  if (next.length === memories.length) {
    console.log(`Memory not found: ${id}`);
    return;
  }
  writeMemoryFile(next);
  console.log(`Forgot memory: ${id}`);
}

function approveMemory() {
  const id = args[0];
  if (!id) {
    console.error('Usage: npm run brain:approve -- <memory-id>');
    process.exitCode = 1;
    return;
  }
  const memories = readMemoryFile();
  let approved = null;
  const next = memories.map(memory => {
    if (memory.id !== id) return memory;
    approved = normalizeMemory({
      ...memory,
      is_approved: true,
      requires_approval: false,
      approval_reason: null,
      updated_at: nowIso(),
    });
    return approved;
  });

  if (!approved) {
    console.log(`Memory not found: ${id}`);
    return;
  }

  writeMemoryFile(next);
  printMemory(approved);
}

function mem0Endpoint(route) {
  return `${mem0BaseUrl.replace(/\/$/, '')}${route}`;
}

async function mem0Request(route, init = {}) {
  const response = await fetch(mem0Endpoint(route), {
    ...init,
    headers: {
      Authorization: `Token ${mem0ApiKey}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });
  const text = await response.text();
  if (!response.ok) {
    const detail = text ? ` ${text.slice(0, 160)}` : '';
    throw new Error(`Mem0 request failed: ${response.status}${detail}`);
  }
  return text ? JSON.parse(text) : null;
}

function unwrapMem0Results(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.memories)) return payload.memories;
  if (Array.isArray(payload?.data?.results)) return payload.data.results;
  if (Array.isArray(payload?.data?.memories)) return payload.data.memories;
  return [];
}

function normalizeMem0Memory(item) {
  const metadata = item?.metadata || {};
  return normalizeMemory({
    id: item?.id,
    content: item?.memory || item?.text || item?.content || metadata.content,
    category: metadata.category,
    scope: metadata.scope,
    project_id: metadata.project_id,
    run_id: item?.run_id || metadata.run_id,
    tags: metadata.tags,
    source: metadata.source || 'mem0',
    confidence: item?.score ?? metadata.confidence,
    created_at: item?.created_at || item?.createdAt,
    updated_at: item?.updated_at || item?.updatedAt,
    last_used_at: metadata.last_used_at,
    is_sensitive: metadata.is_sensitive,
    is_approved: metadata.is_approved,
    requires_approval: metadata.requires_approval,
    approval_reason: metadata.approval_reason,
  });
}

function mem0Filters() {
  return { user_id: mem0UserId };
}

function memoryMetadata(memory) {
  return {
    category: memory.category,
    scope: memory.scope,
    project_id: memory.project_id,
    run_id: memory.run_id,
    tags: memory.tags,
    source: memory.source,
    confidence: memory.confidence,
    is_sensitive: memory.is_sensitive,
    is_approved: memory.is_approved,
    requires_approval: memory.requires_approval,
    approval_reason: memory.approval_reason,
  };
}

async function withMem0Fallback(remoteCommand, localCommand) {
  if (!mem0Enabled) {
    localCommand();
    return;
  }

  try {
    await remoteCommand();
  } catch (error) {
    console.error(`Mem0 unavailable; falling back to ${memoryPath}.`);
    console.error(error.message);
    localCommand();
  }
}

async function addMemoryRemote() {
  const memory = buildMemoryFromArgs();
  if (!memory) return;
  const payload = await mem0Request('/v3/memories/add/', {
    method: 'POST',
    body: JSON.stringify({
      messages: [{ role: 'user', content: memory.content }],
      user_id: mem0UserId,
      metadata: memoryMetadata(memory),
    }),
  });
  console.log(`Queued Mem0 memory add: ${payload?.event_id || payload?.status || 'ok'}`);
  printMemory({ ...memory, id: payload?.event_id || memory.id, source: 'mem0-queued' });
}

async function listMemoriesRemote() {
  const includeAll = args.includes('--all');
  const scope = readFlag('--scope');
  const payload = await mem0Request('/v3/memories/?page=1&page_size=100', {
    method: 'POST',
    body: JSON.stringify({ filters: mem0Filters() }),
  });
  const memories = unwrapMem0Results(payload)
    .map(normalizeMem0Memory)
    .filter(memory => includeAll || memory.is_approved)
    .filter(memory => !scope || memory.scope === scope)
    .sort((a, b) => String(b.updated_at).localeCompare(String(a.updated_at)));

  if (!memories.length) {
    console.log('No memories found.');
    return;
  }
  memories.forEach(printMemory);
}

async function searchMemoriesRemote() {
  const query = positionalArgs().join(' ').trim();
  if (!query) {
    console.error('Usage: npm run brain:search -- "query" [--all]');
    process.exitCode = 1;
    return;
  }
  const includeAll = args.includes('--all');
  const payload = await mem0Request('/v3/memories/search/', {
    method: 'POST',
    body: JSON.stringify({
      query,
      filters: mem0Filters(),
      top_k: 10,
      threshold: 0.0,
    }),
  });
  const memories = unwrapMem0Results(payload)
    .map(normalizeMem0Memory)
    .filter(memory => includeAll || memory.is_approved);

  if (!memories.length) {
    console.log('No matching memories found.');
    return;
  }
  memories.forEach(printMemory);
}

async function approveMemoryRemote() {
  const id = args[0];
  if (!id) {
    console.error('Usage: npm run brain:approve -- <memory-id>');
    process.exitCode = 1;
    return;
  }
  const current = await mem0Request(`/v1/memories/${encodeURIComponent(id)}/`);
  const memory = normalizeMem0Memory(current);
  const metadata = {
    ...memoryMetadata(memory),
    is_approved: true,
    requires_approval: false,
    approval_reason: null,
  };
  const updated = await mem0Request(`/v1/memories/${encodeURIComponent(id)}/`, {
    method: 'PUT',
    body: JSON.stringify({ text: memory.content, metadata }),
  });
  printMemory(normalizeMem0Memory(updated || { ...current, metadata }));
}

async function forgetMemoryRemote() {
  const id = args[0];
  if (!id) {
    console.error('Usage: npm run brain:forget -- <memory-id>');
    process.exitCode = 1;
    return;
  }
  await mem0Request(`/v1/memories/${encodeURIComponent(id)}/`, { method: 'DELETE' });
  console.log(`Forgot Mem0 memory: ${id}`);
}

function help() {
  console.log(`Brain Memory CLI

Commands:
  npm run brain:list -- [--all] [--scope user|project|run]
  npm run brain:search -- "query" [--all]
  npm run brain:add -- "memory text" [--category preference] [--scope user|project|run] [--tag tag] [--approved]
  npm run brain:approve -- <memory-id>
  npm run brain:forget -- <memory-id>

Storage:
  ${mem0Enabled ? `Mem0 (${mem0BaseUrl}) with local fallback ${memoryPath}` : memoryPath}
`);
}

async function main() {
  if (command === 'list') await withMem0Fallback(listMemoriesRemote, listMemories);
  else if (command === 'search') await withMem0Fallback(searchMemoriesRemote, searchMemories);
  else if (command === 'add') await withMem0Fallback(addMemoryRemote, addMemory);
  else if (command === 'approve') await withMem0Fallback(approveMemoryRemote, approveMemory);
  else if (command === 'forget') await withMem0Fallback(forgetMemoryRemote, forgetMemory);
  else help();
}

await main();
