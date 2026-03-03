/**
 * Unified Nexus API Client
 *
 * Merged from:
 * - nexus-skills-mcp/src/index.ts (Skills Engine client)
 * - nexus-desktop-extension/src/client.ts (GraphRAG/MageAgent client)
 *
 * Single axios instance, single Bearer token, all Nexus endpoints.
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import axiosRetry from 'axios-retry';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

export interface NexusConfig {
  apiUrl: string;
  apiKey: string;
  userId?: string;
  timeout?: number;
}

export interface NexusResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

// ---------------------------------------------------------------------------
// Client
// ---------------------------------------------------------------------------

export class NexusClient {
  private http: AxiosInstance;
  private skillsHttp: AxiosInstance;
  private config: NexusConfig;

  constructor(config: NexusConfig) {
    this.config = config;

    const userId = config.userId || process.env.USER || 'anonymous';

    // Main API client (GraphRAG, MageAgent, documents, entities, etc.)
    this.http = axios.create({
      baseURL: config.apiUrl,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
        'X-Company-ID': 'adverant',
        'X-App-ID': 'nexus-cowork',
        'X-User-ID': userId,
      },
    });

    // Retry transient failures with exponential backoff
    axiosRetry(this.http, {
      retries: 3,
      retryDelay: axiosRetry.exponentialDelay,
      retryCondition: (error) =>
        axiosRetry.isNetworkOrIdempotentRequestError(error) ||
        error.response?.status === 429 ||
        error.response?.status === 502 ||
        error.response?.status === 503 ||
        error.response?.status === 504,
      onRetry: (retryCount, error, requestConfig) => {
        console.error(`[nexus-client] Retry #${retryCount} for ${requestConfig.url}: ${error.message}`);
      }
    });

    // Skills Engine client (skills-specific endpoints under /api/skills)
    this.skillsHttp = axios.create({
      baseURL: `${config.apiUrl}/api/skills`,
      timeout: config.timeout || 15000,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
        'X-Company-ID': 'adverant',
        'X-App-ID': 'nexus-cowork',
        'X-User-ID': userId,
      },
    });

    axiosRetry(this.skillsHttp, {
      retries: 3,
      retryDelay: axiosRetry.exponentialDelay,
      retryCondition: (error) =>
        axiosRetry.isNetworkOrIdempotentRequestError(error) ||
        error.response?.status === 429 ||
        error.response?.status === 502 ||
        error.response?.status === 503 ||
        error.response?.status === 504,
      onRetry: (retryCount, error, requestConfig) => {
        console.error(`[nexus-skills] Retry #${retryCount} for ${requestConfig.url}: ${error.message}`);
      }
    });

    this.http.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => Promise.reject(this.formatError(error))
    );

    this.skillsHttp.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => Promise.reject(this.formatError(error))
    );
  }

  private formatError(error: AxiosError): Error {
    if (error.response) {
      const data = error.response.data as any;
      return new Error(
        `Nexus API Error (${error.response.status}): ${data?.error?.message || data?.message || error.message}`
      );
    }
    if (error.request) {
      return new Error(`Network Error: Unable to reach ${this.config.apiUrl}`);
    }
    return new Error(`Request Error: ${error.message}`);
  }

  // =========================================================================
  // Skills Engine Operations
  // =========================================================================

  async listSkills(params?: {
    limit?: number;
    offset?: number;
    status?: string;
    category?: string;
    search?: string;
  }): Promise<any> {
    const { data } = await this.skillsHttp.get('', { params });
    return data;
  }

  async getSkill(skillId: string): Promise<any> {
    const { data } = await this.skillsHttp.get(`/${skillId}`);
    return data;
  }

  async matchPrompt(prompt: string, limit?: number): Promise<any> {
    const { data } = await this.skillsHttp.post('/match', { prompt, limit: limit || 5 });
    return data;
  }

  async discoverSkills(query: string, categories?: string[], minRelevance?: number, limit?: number): Promise<any> {
    const { data } = await this.skillsHttp.post('/discover', {
      query,
      categories,
      minRelevance,
      limit,
    });
    return data;
  }

  async invokeSkill(skillId: string, input?: Record<string, unknown>): Promise<any> {
    const { data } = await this.skillsHttp.post(`/${skillId}/invoke`, { input: input || {} });
    return data;
  }

  async getQualityScore(skillId: string): Promise<any> {
    const { data } = await this.skillsHttp.get(`/${skillId}/quality`);
    return data;
  }

  async getTopSkills(limit?: number): Promise<any> {
    const { data } = await this.skillsHttp.get('/quality/top', { params: { limit: limit || 20 } });
    return data;
  }

  async recordExecution(record: {
    skillId: string;
    skillName: string;
    status: string;
    duration?: number;
    input?: string;
    output?: string;
    error?: string;
  }): Promise<any> {
    const { data } = await this.skillsHttp.post('/execution', record);
    return data;
  }

  async getRelatedSkills(skillId: string): Promise<any> {
    const { data } = await this.skillsHttp.get(`/${skillId}/related`);
    return data;
  }

  async synthesizeSkills(params: {
    sourceSkillIds: string[];
    strategy: string;
    targetName: string;
    prompt?: string;
    focusAreas?: string[];
    visibility?: string;
  }): Promise<any> {
    const { data } = await this.skillsHttp.post('/synthesize', {
      source_skill_ids: params.sourceSkillIds,
      strategy: params.strategy,
      name: params.targetName,
      prompt: params.prompt,
      focus_areas: params.focusAreas,
      visibility: params.visibility || 'private',
    });
    return data;
  }

  // =========================================================================
  // Memory Operations
  // =========================================================================

  async storeMemory(content: string, tags?: string[], metadata?: any): Promise<NexusResponse> {
    const { data } = await this.http.post('/api/v2/memory', { content, tags, metadata });
    return data;
  }

  async recallMemory(query: string, limit?: number, scoreThreshold?: number): Promise<NexusResponse> {
    const { data } = await this.http.post('/api/retrieve/enhanced', {
      query,
      limit,
      score_threshold: scoreThreshold,
      includeEpisodic: true,
      includeDocuments: true,
    });
    return data;
  }

  async storeEpisode(content: string, type?: string, metadata?: any): Promise<NexusResponse> {
    const { data } = await this.http.post('/api/v2/memory', {
      content,
      episodeType: type,
      metadata,
      forceEpisodicStorage: true,
    });
    return data;
  }

  async recallEpisodes(query: string, limit?: number): Promise<NexusResponse> {
    const { data } = await this.http.post('/api/retrieve/enhanced', {
      query,
      limit,
      includeEpisodic: true,
      includeDocuments: false,
    });
    return data;
  }

  // =========================================================================
  // Document Operations
  // =========================================================================

  async storeDocument(content: string, title?: string, metadata?: any): Promise<NexusResponse> {
    const { data } = await this.http.post('/api/documents', { content, title, metadata });
    return data;
  }

  async getDocument(documentId: string, includeChunks?: boolean): Promise<NexusResponse> {
    const { data } = await this.http.get(`/api/documents/${documentId}`, {
      params: { include_chunks: includeChunks },
    });
    return data;
  }

  async listDocuments(limit?: number, offset?: number): Promise<NexusResponse> {
    const { data } = await this.http.get('/api/documents', { params: { limit, offset } });
    return data;
  }

  async ingestUrl(url: string, options?: any): Promise<NexusResponse> {
    const { data } = await this.http.post('/api/ingestion/url', { url, ...options });
    return data;
  }

  async validateUrl(url: string): Promise<NexusResponse> {
    const { data } = await this.http.post('/api/ingestion/url/validate', { url });
    return data;
  }

  async checkIngestionJob(jobId: string): Promise<NexusResponse> {
    const { data } = await this.http.get(`/api/ingestion/jobs/${jobId}`);
    return data;
  }

  // =========================================================================
  // Entity Operations
  // =========================================================================

  async storeEntity(domain: string, entityType: string, textContent: string, tags?: string[], metadata?: any): Promise<NexusResponse> {
    const { data } = await this.http.post('/api/entities', { domain, entityType, textContent, tags, metadata });
    return data;
  }

  async queryEntities(domain?: string, entityType?: string, searchText?: string, limit?: number): Promise<NexusResponse> {
    const { data } = await this.http.post('/api/entities/query', { domain, entityType, searchText, limit });
    return data;
  }

  async getEntity(entityId: string): Promise<NexusResponse> {
    const { data } = await this.http.get(`/api/entities/${entityId}`);
    return data;
  }

  async getEntityHistory(entityId: string): Promise<NexusResponse> {
    const { data } = await this.http.get(`/api/entities/${entityId}/history`);
    return data;
  }

  async getEntityHierarchy(entityId: string): Promise<NexusResponse> {
    const { data } = await this.http.get(`/api/entities/${entityId}/hierarchy`);
    return data;
  }

  async getFacts(subject: string): Promise<NexusResponse> {
    const { data } = await this.http.get(`/api/facts/${encodeURIComponent(subject)}`);
    return data;
  }

  async crossDomainQuery(domains: string[], query: string, maxResults?: number): Promise<NexusResponse> {
    const { data } = await this.http.post('/api/query/cross-domain', { domains, query, max_results: maxResults });
    return data;
  }

  // =========================================================================
  // Search & Retrieval
  // =========================================================================

  async search(query: string, filters?: any, limit?: number): Promise<NexusResponse> {
    const { data } = await this.http.post('/api/search', { query, filters, limit });
    return data;
  }

  async retrieve(query: string, strategy?: string, limit?: number): Promise<NexusResponse> {
    const { data } = await this.http.post('/api/retrieve', { query, strategy, limit });
    return data;
  }

  async enhancedRetrieve(query: string, includeDocuments?: boolean, includeEpisodic?: boolean, maxTokens?: number): Promise<NexusResponse> {
    const { data } = await this.http.post('/api/retrieve/enhanced', {
      query,
      include_documents: includeDocuments,
      include_episodic: includeEpisodic,
      max_tokens: maxTokens,
    });
    return data;
  }

  // =========================================================================
  // Agent Orchestration (MageAgent)
  // =========================================================================

  async orchestrate(task: string, maxAgents?: number, timeout?: number): Promise<NexusResponse> {
    const { data } = await this.http.post('/api/orchestrate', { task, max_agents: maxAgents, timeout });
    return data;
  }

  async collaborate(objective: string, agents?: any[], iterations?: number): Promise<NexusResponse> {
    const { data } = await this.http.post('/api/collaborate', { objective, agents, iterations });
    return data;
  }

  async competition(challenge: string, competitorCount?: number, criteria?: string[]): Promise<NexusResponse> {
    const { data } = await this.http.post('/api/compete', { challenge, competitor_count: competitorCount, evaluation_criteria: criteria });
    return data;
  }

  async analyze(topic: string, depth?: string, includeMemory?: boolean): Promise<NexusResponse> {
    const { data } = await this.http.post('/api/analyze', { topic, depth, include_memory: includeMemory });
    return data;
  }

  async synthesizeInfo(sources: string[], objective?: string, format?: string): Promise<NexusResponse> {
    const { data } = await this.http.post('/api/synthesize', { sources, objective, format });
    return data;
  }

  async getTaskStatus(taskId: string): Promise<NexusResponse> {
    const { data } = await this.http.get(`/api/tasks/${taskId}`);
    return data;
  }

  async listAgents(): Promise<NexusResponse> {
    const { data } = await this.http.get('/api/agents');
    return data;
  }

  async getAgentDetails(agentId: string): Promise<NexusResponse> {
    const { data } = await this.http.get(`/api/agents/${agentId}`);
    return data;
  }

  // =========================================================================
  // System & Health
  // =========================================================================

  async getHealth(detailed?: boolean): Promise<NexusResponse> {
    const { data } = await this.http.get('/api/health', { params: { detailed } });
    return data;
  }

  async getStats(includeHealth?: boolean): Promise<NexusResponse> {
    const { data } = await this.http.get('/api/stats', { params: { include_health: includeHealth } });
    return data;
  }

  async getModelStats(): Promise<NexusResponse> {
    const { data } = await this.http.get('/api/models/stats');
    return data;
  }

  async selectModel(complexity: number, taskType: string): Promise<NexusResponse> {
    const { data } = await this.http.post('/api/models/select', { complexity, task_type: taskType });
    return data;
  }
}
