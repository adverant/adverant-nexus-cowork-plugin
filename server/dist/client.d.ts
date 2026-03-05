/**
 * Unified Nexus API Client
 *
 * Merged from:
 * - nexus-skills-mcp/src/index.ts (Skills Engine client)
 * - nexus-desktop-extension/src/client.ts (GraphRAG/MageAgent client)
 *
 * Single axios instance, single Bearer token, all Nexus endpoints.
 */
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
export declare class NexusClient {
    private http;
    private skillsHttp;
    private config;
    constructor(config: NexusConfig);
    private formatError;
    listSkills(params?: {
        limit?: number;
        offset?: number;
        status?: string;
        category?: string;
        search?: string;
    }): Promise<any>;
    getSkill(skillId: string): Promise<any>;
    matchPrompt(prompt: string, limit?: number): Promise<any>;
    discoverSkills(query: string, categories?: string[], minRelevance?: number, limit?: number): Promise<any>;
    invokeSkill(skillId: string, input?: Record<string, unknown>): Promise<any>;
    getQualityScore(skillId: string): Promise<any>;
    getTopSkills(limit?: number): Promise<any>;
    recordExecution(record: {
        skillId: string;
        skillName: string;
        status: string;
        duration?: number;
        input?: string;
        output?: string;
        error?: string;
    }): Promise<any>;
    getRelatedSkills(skillId: string): Promise<any>;
    generateSkill(request: {
        prompt: string;
        referenceSkills?: string[];
        referenceUrls?: string[];
        constraints?: {
            maxComplexity?: string;
            allowedTools?: string[];
            maxTokenBudget?: number;
        };
        visibility?: string;
    }): Promise<any>;
    getSkillJobStatus(jobId: string): Promise<any>;
    synthesizeSkills(params: {
        sourceSkillIds: string[];
        strategy: string;
        targetName: string;
        prompt?: string;
        focusAreas?: string[];
        visibility?: string;
    }): Promise<any>;
    /**
     * Fetch the user's complete tool inventory from the gateway.
     * Returns platform tools (tier-filtered) + marketplace plugin tools.
     */
    getToolInventory(): Promise<{
        platformTools: any[];
        pluginTools: any[];
        blockedTools: any[];
        summary: {
            totalAvailable: number;
            platformCount: number;
            pluginCount: number;
            blockedCount: number;
        };
        userTier: string;
        activePlugins: any[];
    }>;
    /**
     * Execute any tool via the gateway's generic execution endpoint.
     * Handles both platform tools (SmartRouter) and plugin tools (PluginClient).
     */
    executeTool(toolName: string, args: Record<string, any>): Promise<any>;
    storeMemory(content: string, tags?: string[], metadata?: any): Promise<NexusResponse>;
    recallMemory(query: string, limit?: number, scoreThreshold?: number): Promise<NexusResponse>;
    storeEpisode(content: string, type?: string, metadata?: any): Promise<NexusResponse>;
    recallEpisodes(query: string, limit?: number): Promise<NexusResponse>;
    storeDocument(content: string, title?: string, metadata?: any): Promise<NexusResponse>;
    getDocument(documentId: string, includeChunks?: boolean): Promise<NexusResponse>;
    listDocuments(limit?: number, offset?: number): Promise<NexusResponse>;
    ingestUrl(url: string, options?: any): Promise<NexusResponse>;
    validateUrl(url: string): Promise<NexusResponse>;
    checkIngestionJob(jobId: string): Promise<NexusResponse>;
    storeEntity(domain: string, entityType: string, textContent: string, tags?: string[], metadata?: any): Promise<NexusResponse>;
    queryEntities(domain?: string, entityType?: string, searchText?: string, limit?: number): Promise<NexusResponse>;
    getEntity(entityId: string): Promise<NexusResponse>;
    getEntityHistory(entityId: string): Promise<NexusResponse>;
    getEntityHierarchy(entityId: string): Promise<NexusResponse>;
    getFacts(subject: string): Promise<NexusResponse>;
    crossDomainQuery(domains: string[], query: string, maxResults?: number): Promise<NexusResponse>;
    search(query: string, filters?: any, limit?: number): Promise<NexusResponse>;
    retrieve(query: string, strategy?: string, limit?: number): Promise<NexusResponse>;
    enhancedRetrieve(query: string, includeDocuments?: boolean, includeEpisodic?: boolean, maxTokens?: number): Promise<NexusResponse>;
    orchestrate(task: string, maxAgents?: number, timeout?: number): Promise<NexusResponse>;
    collaborate(objective: string, agents?: any[], iterations?: number): Promise<NexusResponse>;
    competition(challenge: string, competitorCount?: number, criteria?: string[]): Promise<NexusResponse>;
    analyze(topic: string, depth?: string, includeMemory?: boolean): Promise<NexusResponse>;
    synthesizeInfo(sources: string[], objective?: string, format?: string): Promise<NexusResponse>;
    getTaskStatus(taskId: string): Promise<NexusResponse>;
    listAgents(): Promise<NexusResponse>;
    getAgentDetails(agentId: string): Promise<NexusResponse>;
    getHealth(detailed?: boolean): Promise<NexusResponse>;
    getStats(includeHealth?: boolean): Promise<NexusResponse>;
    getModelStats(): Promise<NexusResponse>;
    selectModel(complexity: number, taskType: string): Promise<NexusResponse>;
}
//# sourceMappingURL=client.d.ts.map