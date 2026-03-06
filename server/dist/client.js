/**
 * Unified Nexus API Client
 *
 * Merged from:
 * - nexus-skills-mcp/src/index.ts (Skills Engine client)
 * - nexus-desktop-extension/src/client.ts (GraphRAG/MageAgent client)
 *
 * Single axios instance, single Bearer token, all Nexus endpoints.
 */
import axios from 'axios';
import axiosRetry from 'axios-retry';
// ---------------------------------------------------------------------------
// Client
// ---------------------------------------------------------------------------
export class NexusClient {
    http;
    skillsHttp;
    config;
    constructor(config) {
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
            retryCondition: (error) => axiosRetry.isNetworkOrIdempotentRequestError(error) ||
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
            retryCondition: (error) => axiosRetry.isNetworkOrIdempotentRequestError(error) ||
                error.response?.status === 429 ||
                error.response?.status === 502 ||
                error.response?.status === 503 ||
                error.response?.status === 504,
            onRetry: (retryCount, error, requestConfig) => {
                console.error(`[nexus-skills] Retry #${retryCount} for ${requestConfig.url}: ${error.message}`);
            }
        });
        this.http.interceptors.response.use((response) => response, (error) => Promise.reject(this.formatError(error)));
        this.skillsHttp.interceptors.response.use((response) => response, (error) => Promise.reject(this.formatError(error)));
    }
    formatError(error) {
        if (error.response) {
            const data = error.response.data;
            return new Error(`Nexus API Error (${error.response.status}): ${data?.error?.message || data?.message || error.message}`);
        }
        if (error.request) {
            return new Error(`Network Error: Unable to reach ${this.config.apiUrl}`);
        }
        return new Error(`Request Error: ${error.message}`);
    }
    // =========================================================================
    // Skills Engine Operations
    // =========================================================================
    async listSkills(params) {
        const { data } = await this.skillsHttp.get('', { params });
        return data;
    }
    async getSkill(skillId) {
        const { data } = await this.skillsHttp.get(`/${skillId}`);
        return data;
    }
    async matchPrompt(prompt, limit) {
        const { data } = await this.skillsHttp.post('/match', { prompt, limit: limit || 5 });
        return data;
    }
    async discoverSkills(query, categories, minRelevance, limit) {
        const { data } = await this.skillsHttp.post('/discover', {
            query,
            categories,
            minRelevance,
            limit,
        });
        return data;
    }
    async invokeSkill(skillId, input) {
        const { data } = await this.skillsHttp.post(`/${skillId}/invoke`, { input: input || {} });
        return data;
    }
    async getQualityScore(skillId) {
        const { data } = await this.skillsHttp.get(`/${skillId}/quality`);
        return data;
    }
    async getTopSkills(limit) {
        const { data } = await this.skillsHttp.get('/quality/top', { params: { limit: limit || 20 } });
        return data;
    }
    async recordExecution(record) {
        const { data } = await this.skillsHttp.post('/execution', record);
        return data;
    }
    async getRelatedSkills(skillId) {
        const { data } = await this.skillsHttp.get(`/${skillId}/related`);
        return data;
    }
    async generateSkill(request) {
        const { data } = await this.skillsHttp.post('/generate', request, {
            timeout: 60000,
        });
        return data;
    }
    async getSkillJobStatus(jobId) {
        const { data } = await this.skillsHttp.get(`/jobs/${jobId}`);
        return data;
    }
    async synthesizeSkills(params) {
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
    // Dynamic Tool Discovery & Execution
    // =========================================================================
    /**
     * Fetch the user's complete tool inventory from the gateway.
     * Returns platform tools (tier-filtered) + marketplace plugin tools.
     */
    async getToolInventory() {
        const { data } = await this.http.get('/api/tools/inventory', {
            params: { surface: 'cowork' },
        });
        return data;
    }
    /**
     * Execute any tool via the gateway's generic execution endpoint.
     * Handles both platform tools (SmartRouter) and plugin tools (PluginClient).
     */
    async executeTool(toolName, args) {
        const { data } = await this.http.post('/api/tools/execute', {
            tool: toolName,
            arguments: args,
        });
        return data;
    }
    // =========================================================================
    // Memory Operations
    // =========================================================================
    async storeMemory(content, tags, metadata) {
        return this.executeTool('nexus_store_memory', { content, tags, metadata, event_type: 'learning' });
    }
    async recallMemory(query, limit, scoreThreshold) {
        return this.executeTool('nexus_recall_memory', {
            query,
            limit,
            score_threshold: scoreThreshold,
        });
    }
    async storeEpisode(content, type, metadata) {
        return this.executeTool('nexus_store_episode', {
            content,
            episodeType: type,
            metadata,
            event_type: 'learning',
            forceEpisodicStorage: true,
        });
    }
    async recallEpisodes(query, limit) {
        return this.executeTool('nexus_recall_episodes', {
            query,
            limit,
        });
    }
    // =========================================================================
    // Document Operations
    // =========================================================================
    async storeDocument(content, title, metadata) {
        const { data } = await this.http.post('/api/documents', { content, title, metadata });
        return data;
    }
    async getDocument(documentId, includeChunks) {
        const { data } = await this.http.get(`/api/documents/${documentId}`, {
            params: { include_chunks: includeChunks },
        });
        return data;
    }
    async listDocuments(limit, offset) {
        const { data } = await this.http.get('/api/documents', { params: { limit, offset } });
        return data;
    }
    async ingestUrl(url, options) {
        const { data } = await this.http.post('/api/ingestion/url', { url, ...options });
        return data;
    }
    async validateUrl(url) {
        const { data } = await this.http.post('/api/ingestion/url/validate', { url });
        return data;
    }
    async checkIngestionJob(jobId) {
        const { data } = await this.http.get(`/api/ingestion/jobs/${jobId}`);
        return data;
    }
    // =========================================================================
    // Entity Operations
    // =========================================================================
    async storeEntity(domain, entityType, textContent, tags, metadata) {
        const { data } = await this.http.post('/api/entities', { domain, entityType, textContent, tags, metadata });
        return data;
    }
    async queryEntities(domain, entityType, searchText, limit) {
        const { data } = await this.http.post('/api/entities/query', { domain, entityType, searchText, limit });
        return data;
    }
    async getEntity(entityId) {
        const { data } = await this.http.get(`/api/entities/${entityId}`);
        return data;
    }
    async getEntityHistory(entityId) {
        const { data } = await this.http.get(`/api/entities/${entityId}/history`);
        return data;
    }
    async getEntityHierarchy(entityId) {
        const { data } = await this.http.get(`/api/entities/${entityId}/hierarchy`);
        return data;
    }
    async getFacts(subject) {
        const { data } = await this.http.get(`/api/facts/${encodeURIComponent(subject)}`);
        return data;
    }
    async crossDomainQuery(domains, query, maxResults) {
        const { data } = await this.http.post('/api/query/cross-domain', { domains, query, max_results: maxResults });
        return data;
    }
    // =========================================================================
    // Search & Retrieval
    // =========================================================================
    async search(query, filters, limit) {
        const { data } = await this.http.post('/api/search', { query, filters, limit });
        return data;
    }
    async retrieve(query, strategy, limit) {
        const { data } = await this.http.post('/api/retrieve', { query, strategy, limit });
        return data;
    }
    async enhancedRetrieve(query, includeDocuments, includeEpisodic, maxTokens) {
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
    async orchestrate(task, maxAgents, timeout) {
        const { data } = await this.http.post('/api/orchestrate', { task, max_agents: maxAgents, timeout });
        return data;
    }
    async collaborate(objective, agents, iterations) {
        const { data } = await this.http.post('/api/collaborate', { objective, agents, iterations });
        return data;
    }
    async competition(challenge, competitorCount, criteria) {
        const { data } = await this.http.post('/api/compete', { challenge, competitor_count: competitorCount, evaluation_criteria: criteria });
        return data;
    }
    async analyze(topic, depth, includeMemory) {
        const { data } = await this.http.post('/api/analyze', { topic, depth, include_memory: includeMemory });
        return data;
    }
    async synthesizeInfo(sources, objective, format) {
        const { data } = await this.http.post('/api/synthesize', { sources, objective, format });
        return data;
    }
    async getTaskStatus(taskId) {
        const { data } = await this.http.get(`/api/tasks/${taskId}`);
        return data;
    }
    async listAgents() {
        const { data } = await this.http.get('/api/agents');
        return data;
    }
    async getAgentDetails(agentId) {
        const { data } = await this.http.get(`/api/agents/${agentId}`);
        return data;
    }
    // =========================================================================
    // System & Health
    // =========================================================================
    async getHealth(detailed) {
        const { data } = await this.http.get('/api/health', { params: { detailed } });
        return data;
    }
    async getStats(includeHealth) {
        const { data } = await this.http.get('/api/stats', { params: { include_health: includeHealth } });
        return data;
    }
    async getModelStats() {
        const { data } = await this.http.get('/api/models/stats');
        return data;
    }
    async selectModel(complexity, taskType) {
        const { data } = await this.http.post('/api/models/select', { complexity, task_type: taskType });
        return data;
    }
}
//# sourceMappingURL=client.js.map