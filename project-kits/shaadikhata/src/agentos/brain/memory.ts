import type {
  BrainConfig,
  BrainMemory,
  BrainMemoryFilter,
  BrainMemoryInput,
  BrainMemoryPatch,
  BrainMemoryProvider,
  BrainMemoryProviderName,
  BrainMemoryScope,
  BrainSanitizeResult,
} from './types';
import { MEMORY_CATEGORIES } from './types';

const STORAGE_KEY = 'phere_brain_memory';
const DEFAULT_CATEGORY = 'preference';
const DEFAULT_SCOPE = 'user';
const TOKEN_MIN_LENGTH = 2;

const isValidCategory = (value: unknown) =>
  typeof value === 'string' && (MEMORY_CATEGORIES as readonly string[]).includes(value);

const isValidScope = (value: unknown): value is BrainMemoryScope =>
  value === 'user' || value === 'project' || value === 'run';

const clampConfidence = (value: unknown): number => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0.8;
  return Math.max(0, Math.min(1, numeric));
};

const nowIso = () => new Date().toISOString();

const makeId = () => {
  const cryptoApi = (globalThis as any)?.crypto;
  if (cryptoApi?.randomUUID) return cryptoApi.randomUUID();
  return `mem_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
};

const normalizeTags = (tags: unknown): string[] =>
  Array.isArray(tags)
    ? [...new Set(tags.map(tag => String(tag).trim().toLowerCase()).filter(Boolean))]
    : [];

const normalizeText = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9\u0900-\u097f]+/gi, ' ').replace(/\s+/g, ' ').trim();

const normalizeOptionalId = (value: unknown): string | null => {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  return text || null;
};

const tokenize = (value: string) =>
  normalizeText(value).split(' ').filter(token => token.length >= TOKEN_MIN_LENGTH);

const fieldIncludes = (memory: BrainMemory, token: string) => {
  const haystack = normalizeText(`${memory.content} ${memory.category} ${memory.tags.join(' ')}`);
  return haystack.includes(token);
};

const queryAliases: Record<string, string[]> = {
  reply: ['support', 'writing_style', 'english'],
  customer: ['support', 'phere'],
  style: ['writing_style', 'design_style', 'preference'],
  image: ['image-edit', 'face-preservation', 'design_style'],
  edit: ['image-edit', 'face-preservation'],
  preference: ['preference', 'writing_style', 'design_style'],
  phere: ['phere', 'project'],
  agentos: ['karynth', 'agentos', 'orchestration', 'workflow'],
  karynth: ['agentos', 'nexusops', 'orchestration'],
  notebooklm: ['research', 'docs', 'source'],
  voltagent: ['agentos', 'adapter', 'runtime'],
};

const scoreMemory = (query: string, memory: BrainMemory) => {
  const tokens = tokenize(query);
  if (!tokens.length) return memory.confidence;
  let score = 0;

  for (const token of tokens) {
    if (fieldIncludes(memory, token)) score += 2;
    for (const alias of queryAliases[token] || []) {
      if (fieldIncludes(memory, alias)) score += 1;
    }
  }

  if (normalizeText(memory.content).includes(normalizeText(query))) score += 4;
  return score + memory.confidence;
};

const matchesFilter = (memory: BrainMemory, filter: BrainMemoryFilter = {}) => {
  if (filter.category && memory.category !== filter.category) return false;
  if (filter.scope && getMemoryScope(memory) !== filter.scope) return false;
  if (filter.project_id !== undefined && memory.project_id !== filter.project_id) return false;
  if (filter.run_id !== undefined && memory.run_id !== filter.run_id) return false;
  if (filter.source && memory.source !== filter.source) return false;
  if (filter.approvedOnly !== false && !memory.is_approved) return false;
  if (filter.tags?.length) {
    const tags = new Set(memory.tags);
    if (!filter.tags.some(tag => tags.has(tag.toLowerCase()))) return false;
  }
  return true;
};

export function getMemoryScope(memory: Pick<BrainMemory, 'scope'> | Partial<BrainMemory>): BrainMemoryScope {
  return isValidScope(memory.scope) ? memory.scope : DEFAULT_SCOPE;
}

export function makeMemoryDedupeKey(memory: Pick<BrainMemory, 'content' | 'category' | 'scope' | 'project_id' | 'run_id'>) {
  return [
    getMemoryScope(memory),
    memory.project_id || '',
    memory.run_id || '',
    isValidCategory(memory.category) ? memory.category : DEFAULT_CATEGORY,
    normalizeText(String(memory.content || '')),
  ].join('|');
}

function normalizeMemoryRecord(value: any): BrainMemory {
  const createdAt = value?.created_at || nowIso();
  const category = isValidCategory(value?.category) ? value.category : DEFAULT_CATEGORY;
  const scope = isValidScope(value?.scope) ? value.scope : DEFAULT_SCOPE;

  return {
    id: String(value?.id || makeId()),
    content: String(value?.content || '').trim(),
    category,
    scope,
    project_id: normalizeOptionalId(value?.project_id),
    run_id: normalizeOptionalId(value?.run_id),
    tags: normalizeTags(value?.tags),
    source: value?.source || 'manual',
    confidence: clampConfidence(value?.confidence),
    created_at: createdAt,
    updated_at: value?.updated_at || createdAt,
    last_used_at: value?.last_used_at || null,
    is_sensitive: Boolean(value?.is_sensitive),
    is_approved: value?.is_approved !== false,
    requires_approval: Boolean(value?.requires_approval),
    approval_reason: normalizeOptionalId(value?.approval_reason),
  };
}

export function sanitizeMemoryContent(content: string): BrainSanitizeResult {
  const text = String(content || '').trim();
  const checks: Array<{ pattern: RegExp; reason: string }> = [
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
    {
      pattern: /\b(?:customer|client)\b.{0,40}\b(?:phone|email|address|id|token|secret)\b/i,
      reason: 'confidential customer data',
    },
    {
      pattern: /\b(?:home address|full address|exact address|ghar ka address)\b/i,
      reason: 'exact personal address',
    },
  ];

  const match = checks.find(check => check.pattern.test(text));
  if (!text) {
    return { rejected: true, isSensitive: false, safeContent: '', reason: 'empty memory content' };
  }

  if (!match) {
    return { rejected: false, isSensitive: false, safeContent: text };
  }

  return {
    rejected: true,
    isSensitive: true,
    reason: match.reason,
    safeContent: text
      .replace(/([:=]\s*)[^\s,;]+/g, '$1[REDACTED]')
      .replace(/\b(?:sk|m0|ghp|gho|glpat|xox[baprs])[-_][a-z0-9_-]{4,}\b/gi, '[REDACTED_TOKEN]'),
  };
}

export function createBrainMemory(input: BrainMemoryInput): BrainMemory {
  const createdAt = nowIso();
  const scope = isValidScope(input.scope) ? input.scope : DEFAULT_SCOPE;
  return {
    id: makeId(),
    content: String(input.content || '').trim(),
    category: isValidCategory(input.category) ? input.category! : DEFAULT_CATEGORY,
    scope,
    project_id: normalizeOptionalId(input.project_id),
    run_id: normalizeOptionalId(input.run_id),
    tags: normalizeTags(input.tags),
    source: input.source || 'manual',
    confidence: clampConfidence(input.confidence),
    created_at: createdAt,
    updated_at: createdAt,
    last_used_at: null,
    is_sensitive: false,
    is_approved: input.is_approved !== false,
    requires_approval: Boolean(input.requires_approval),
    approval_reason: normalizeOptionalId(input.approval_reason),
  };
}

function mergeMemory(memory: BrainMemory, patch: BrainMemoryPatch): BrainMemory {
  const scope = patch.scope === undefined
    ? getMemoryScope(memory)
    : isValidScope(patch.scope) ? patch.scope : getMemoryScope(memory);

  return {
    ...memory,
    ...patch,
    category: isValidCategory(patch.category) ? patch.category! : memory.category,
    scope,
    project_id: patch.project_id === undefined ? memory.project_id : normalizeOptionalId(patch.project_id),
    run_id: patch.run_id === undefined ? memory.run_id : normalizeOptionalId(patch.run_id),
    tags: patch.tags ? normalizeTags(patch.tags) : memory.tags,
    confidence: patch.confidence === undefined ? memory.confidence : clampConfidence(patch.confidence),
    approval_reason: patch.approval_reason === undefined
      ? memory.approval_reason
      : normalizeOptionalId(patch.approval_reason),
    requires_approval: patch.requires_approval === undefined
      ? memory.requires_approval
      : Boolean(patch.requires_approval),
    updated_at: nowIso(),
  };
}

async function ensureDirectory(filePath: string) {
  const slashIndex = Math.max(filePath.lastIndexOf('/'), filePath.lastIndexOf('\\'));
  if (slashIndex <= 0) return;
  const dir = filePath.slice(0, slashIndex);
  const fs = await import('node:fs/promises');
  await fs.mkdir(dir, { recursive: true });
}

export class LocalJsonMemoryProvider implements BrainMemoryProvider {
  name: BrainMemoryProviderName = 'json';
  private memoryCache: BrainMemory[] | null = null;

  constructor(private readonly config: BrainConfig) {}

  private isBrowserStorageAvailable() {
    return Boolean((globalThis as any)?.localStorage);
  }

  private async read(): Promise<BrainMemory[]> {
    if (this.memoryCache) return this.memoryCache;

    if (this.isBrowserStorageAvailable()) {
      try {
        const raw = (globalThis as any).localStorage.getItem(STORAGE_KEY);
        this.memoryCache = raw ? JSON.parse(raw).map(normalizeMemoryRecord) : [];
        return this.memoryCache || [];
      } catch {
        this.memoryCache = [];
        return [];
      }
    }

    try {
      const fs = await import('node:fs/promises');
      const raw = await fs.readFile(this.config.memoryPath, 'utf8');
      this.memoryCache = JSON.parse(raw).map(normalizeMemoryRecord);
      return this.memoryCache || [];
    } catch {
      this.memoryCache = [];
      return [];
    }
  }

  private async write(memories: BrainMemory[]) {
    this.memoryCache = memories;

    if (this.isBrowserStorageAvailable()) {
      (globalThis as any).localStorage.setItem(STORAGE_KEY, JSON.stringify(memories, null, 2));
      return;
    }

    await ensureDirectory(this.config.memoryPath);
    const fs = await import('node:fs/promises');
    await fs.writeFile(this.config.memoryPath, JSON.stringify(memories, null, 2), 'utf8');
  }

  async add(input: BrainMemoryInput): Promise<BrainMemory> {
    const memories = await this.read();
    const memory = createBrainMemory(input);
    const dedupeKey = makeMemoryDedupeKey(memory);
    const existingIndex = memories.findIndex(existing => makeMemoryDedupeKey(existing) === dedupeKey);

    if (existingIndex >= 0) {
      const existing = memories[existingIndex];
      const merged = mergeMemory(existing, {
        tags: [...new Set([...existing.tags, ...memory.tags])],
        confidence: Math.max(existing.confidence, memory.confidence),
        is_approved: existing.is_approved && memory.is_approved,
        requires_approval: existing.requires_approval || memory.requires_approval,
        approval_reason: existing.approval_reason || memory.approval_reason,
      });
      await this.write([merged, ...memories.filter((_, index) => index !== existingIndex)]);
      return merged;
    }

    await this.write([memory, ...memories]);
    return memory;
  }

  async search(query: string, filter: BrainMemoryFilter = {}): Promise<BrainMemory[]> {
    const memories = await this.read();
    const scored = memories
      .filter(memory => matchesFilter(memory, filter))
      .map(memory => ({ memory, score: scoreMemory(query, memory) }))
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);

    const usedAt = nowIso();
    const usedIds = new Set(scored.map(item => item.memory.id));
    if (usedIds.size) {
      await this.write(memories.map(memory =>
        usedIds.has(memory.id) ? { ...memory, last_used_at: usedAt } : memory
      ));
    }

    return scored.map(item => ({
      ...item.memory,
      confidence: Math.max(item.memory.confidence, Math.min(1, item.score / 10)),
      last_used_at: usedIds.has(item.memory.id) ? usedAt : item.memory.last_used_at,
    }));
  }

  async update(memoryId: string, patch: BrainMemoryPatch): Promise<BrainMemory | null> {
    const memories = await this.read();
    let updated: BrainMemory | null = null;
    const next = memories.map(memory => {
      if (memory.id !== memoryId) return memory;
      updated = mergeMemory(memory, patch);
      return updated;
    });
    await this.write(next);
    return updated;
  }

  async delete(memoryId: string): Promise<boolean> {
    const memories = await this.read();
    const next = memories.filter(memory => memory.id !== memoryId);
    await this.write(next);
    return next.length !== memories.length;
  }

  async list(filter: BrainMemoryFilter = {}): Promise<BrainMemory[]> {
    return (await this.read())
      .filter(memory => matchesFilter(memory, filter))
      .sort((a, b) => String(b.updated_at).localeCompare(String(a.updated_at)));
  }
}

export class InMemoryProvider extends LocalJsonMemoryProvider {
  name = 'memory' as const;

  constructor(config: BrainConfig) {
    super({ ...config, fallback: 'memory' });
  }
}

export class Mem0RestMemoryProvider implements BrainMemoryProvider {
  name = 'mem0' as const;

  constructor(private readonly config: BrainConfig) {}

  get isConfigured() {
    return Boolean(this.config.apiKey && this.config.baseUrl);
  }

  private endpoint(path: string) {
    return `${this.config.baseUrl.replace(/\/$/, '')}${path}`;
  }

  private async request(path: string, init: RequestInit = {}) {
    if (!this.isConfigured) throw new Error('Mem0 is not configured');
    const response = await fetch(this.endpoint(path), {
      ...init,
      headers: {
        Authorization: `Token ${this.config.apiKey}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(init.headers || {}),
      },
    });
    if (!response.ok) throw new Error(`Mem0 request failed: ${response.status}`);
    if (response.status === 204) return null;
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  }

  private entityFilters() {
    return { user_id: this.config.userId };
  }

  private mapRemoteMemory(item: any): BrainMemory {
    const metadata = item?.metadata || {};
    const content = item?.memory || item?.text || item?.content || metadata.content || '';
    const category = metadata.category || (Array.isArray(item?.categories) ? item.categories[0] : undefined);
    const createdAt = item?.created_at || item?.createdAt || nowIso();
    return {
      id: String(item?.id || makeId()),
      content: String(content),
      category: isValidCategory(category) ? category : DEFAULT_CATEGORY,
      scope: isValidScope(metadata.scope) ? metadata.scope : DEFAULT_SCOPE,
      project_id: normalizeOptionalId(metadata.project_id),
      run_id: normalizeOptionalId(metadata.run_id),
      tags: normalizeTags(metadata.tags),
      source: metadata.source || 'manual',
      confidence: clampConfidence(item?.score ?? metadata.confidence),
      created_at: createdAt,
      updated_at: item?.updated_at || item?.updatedAt || createdAt,
      last_used_at: item?.last_used_at || null,
      is_sensitive: Boolean(metadata.is_sensitive),
      is_approved: metadata.is_approved !== false,
      requires_approval: Boolean(metadata.requires_approval),
      approval_reason: normalizeOptionalId(metadata.approval_reason),
    };
  }

  private unwrapResults(payload: any): any[] {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.results)) return payload.results;
    if (Array.isArray(payload?.memories)) return payload.memories;
    if (Array.isArray(payload?.data?.results)) return payload.data.results;
    if (Array.isArray(payload?.data?.memories)) return payload.data.memories;
    return [];
  }

  async add(input: BrainMemoryInput): Promise<BrainMemory> {
    const metadata = {
      category: input.category || DEFAULT_CATEGORY,
      scope: input.scope || DEFAULT_SCOPE,
      project_id: input.project_id || null,
      run_id: input.run_id || null,
      tags: normalizeTags(input.tags),
      source: input.source || 'manual',
      confidence: clampConfidence(input.confidence),
      is_sensitive: false,
      is_approved: input.is_approved !== false,
      requires_approval: Boolean(input.requires_approval),
      approval_reason: input.approval_reason || null,
    };

    const payload = await this.request('/v3/memories/add/', {
      method: 'POST',
      body: JSON.stringify({
        messages: [{ role: 'user', content: input.content }],
        user_id: this.config.userId,
        metadata,
      }),
    });

    return this.mapRemoteMemory(
      this.unwrapResults(payload)[0] || {
        id: payload?.event_id,
        memory: input.content,
        metadata: { ...metadata, source: metadata.source || 'mem0-queued' },
      }
    );
  }

  async search(query: string, filter: BrainMemoryFilter = {}): Promise<BrainMemory[]> {
    const payload = await this.request('/v3/memories/search/', {
      method: 'POST',
      body: JSON.stringify({
        query,
        filters: this.entityFilters(),
        top_k: 8,
        threshold: 0.0,
      }),
    });
    return this.unwrapResults(payload)
      .map(item => this.mapRemoteMemory(item))
      .filter(memory => matchesFilter(memory, filter));
  }

  async update(memoryId: string, patch: BrainMemoryPatch): Promise<BrainMemory | null> {
    const payload = await this.request(`/v1/memories/${encodeURIComponent(memoryId)}/`, {
      method: 'PUT',
      body: JSON.stringify({ text: patch.content, metadata: patch }),
    });
    return this.mapRemoteMemory(payload || { id: memoryId, memory: patch.content, metadata: patch });
  }

  async delete(memoryId: string): Promise<boolean> {
    await this.request(`/v1/memories/${encodeURIComponent(memoryId)}/`, { method: 'DELETE' });
    return true;
  }

  async list(filter: BrainMemoryFilter = {}): Promise<BrainMemory[]> {
    const payload = await this.request('/v3/memories/?page=1&page_size=100', {
      method: 'POST',
      body: JSON.stringify({ filters: this.entityFilters() }),
    });
    return this.unwrapResults(payload)
      .map(item => this.mapRemoteMemory(item))
      .filter(memory => matchesFilter(memory, filter));
  }
}

export class BrainCompositeProvider implements BrainMemoryProvider {
  name;
  private readonly primary: BrainMemoryProvider;
  private readonly fallback: BrainMemoryProvider;

  constructor(config: BrainConfig) {
    this.fallback = config.fallback === 'memory'
      ? new InMemoryProvider({ ...config, provider: 'memory' })
      : new LocalJsonMemoryProvider({ ...config, provider: 'json' });
    this.primary = config.provider === 'mem0' ? new Mem0RestMemoryProvider(config) : this.fallback;
    this.name = this.primary.name;
  }

  private async withFallback<T>(operation: (provider: BrainMemoryProvider) => Promise<T>): Promise<T> {
    try {
      return await operation(this.primary);
    } catch {
      this.name = this.fallback.name;
      return operation(this.fallback);
    }
  }

  add(memory: BrainMemoryInput) {
    return this.withFallback(provider => provider.add(memory));
  }

  search(query: string, filter?: BrainMemoryFilter) {
    return this.withFallback(provider => provider.search(query, filter));
  }

  update(memoryId: string, patch: BrainMemoryPatch) {
    return this.withFallback(provider => provider.update(memoryId, patch));
  }

  delete(memoryId: string) {
    return this.withFallback(provider => provider.delete(memoryId));
  }

  list(filter?: BrainMemoryFilter) {
    return this.withFallback(provider => provider.list(filter));
  }
}
