/**
 * 8 Consolidated Gateway Tools
 *
 * Reduces 52 individual tools to 8 gateway tools with action routing.
 * ~85% token reduction in system prompt (2,400 vs 15,600 tokens).
 */
import { syncSkillsToFilesystem } from './sync.js';
// ---------------------------------------------------------------------------
// Tool Definitions
// ---------------------------------------------------------------------------
export const NEXUS_TOOLS = [
    // 1. Skills Engine
    {
        name: 'nexus_skills',
        description: 'Interact with the Nexus Skills Engine. Actions: list (browse skills), get (full details + SKILL.md), discover (semantic search), match (match prompt to skills), invoke (run a skill), create (generate new skill from prompt), check_job (poll creation progress), quality (quality score breakdown), related (find similar), top (top-ranked), record (log execution), sync (sync to local ~/.claude/skills/).',
        inputSchema: {
            type: 'object',
            properties: {
                action: {
                    type: 'string',
                    enum: ['list', 'get', 'discover', 'match', 'invoke', 'create', 'check_job', 'quality', 'related', 'top', 'record', 'sync'],
                    description: 'The operation to perform',
                },
                skill_id: { type: 'string', description: 'Skill ID (for get, invoke, quality, related)' },
                query: { type: 'string', description: 'Search query (for discover)' },
                prompt: { type: 'string', description: 'User prompt to match (for match)' },
                input: { type: 'object', description: 'Input parameters (for invoke)' },
                search: { type: 'string', description: 'Search term (for list)' },
                status: { type: 'string', enum: ['draft', 'testing', 'published', 'deprecated'], description: 'Filter by status (for list)' },
                category: { type: 'string', enum: ['development', 'engineering', 'content', 'platform', 'automation', 'uncategorized'], description: 'Filter by category (for list, discover)' },
                categories: { type: 'array', items: { type: 'string' }, description: 'Filter categories (for discover)' },
                min_relevance: { type: 'number', description: 'Minimum relevance 0-1 (for discover)' },
                limit: { type: 'number', description: 'Max results (default varies by action)' },
                offset: { type: 'number', description: 'Pagination offset (for list)' },
                force: { type: 'boolean', description: 'Force overwrite (for sync)' },
                reference_skills: { type: 'array', items: { type: 'string' }, description: 'Skill IDs to use as reference (for create)' },
                reference_urls: { type: 'array', items: { type: 'string' }, description: 'Documentation URLs (for create)' },
                visibility: { type: 'string', enum: ['private', 'team', 'public'], description: 'Skill visibility (for create, default: private)' },
                max_complexity: { type: 'string', enum: ['simple', 'moderate', 'complex', 'expert'], description: 'Max complexity (for create)' },
                allowed_tools: { type: 'array', items: { type: 'string' }, description: 'Allowed tools (for create)' },
                max_token_budget: { type: 'number', description: 'Max token budget (for create)' },
                job_id: { type: 'string', description: 'Generation job ID (for check_job)' },
                skill_name: { type: 'string', description: 'Skill name (for record)' },
                execution_status: { type: 'string', enum: ['success', 'failure', 'partial'], description: 'Execution result (for record)' },
                duration: { type: 'number', description: 'Execution time ms (for record)' },
                error: { type: 'string', description: 'Error message (for record)' },
            },
            required: ['action'],
        },
    },
    // 2. Skill Synthesis
    {
        name: 'nexus_skill_synth',
        description: 'Synthesize new skills from existing ones. Strategies: combine (merge capabilities), chain (sequential workflow), specialize (focused subset), generalize (abstract patterns), adapt (different domain).',
        inputSchema: {
            type: 'object',
            properties: {
                source_skill_ids: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'IDs of source skills to synthesize from',
                },
                strategy: {
                    type: 'string',
                    enum: ['combine', 'chain', 'specialize', 'generalize', 'adapt'],
                    description: 'Synthesis strategy',
                },
                target_name: { type: 'string', description: 'Name for the new skill' },
                prompt: { type: 'string', description: 'Additional guidance for synthesis' },
                focus_areas: { type: 'array', items: { type: 'string' }, description: 'Focus areas (for specialize/adapt)' },
                visibility: { type: 'string', enum: ['private', 'team', 'public'], description: 'Visibility (default: private)' },
            },
            required: ['source_skill_ids', 'strategy', 'target_name'],
        },
    },
    // 3. Memory
    {
        name: 'nexus_memory',
        description: 'Store and recall memories using Nexus GraphRAG. Actions: store (save memory), recall (semantic search), store_episode (temporal event), recall_episodes (search episodes).',
        inputSchema: {
            type: 'object',
            properties: {
                action: {
                    type: 'string',
                    enum: ['store', 'recall', 'store_episode', 'recall_episodes'],
                    description: 'The operation to perform',
                },
                content: { type: 'string', description: 'Memory/episode content (for store, store_episode)' },
                query: { type: 'string', description: 'Search query (for recall, recall_episodes)' },
                tags: { type: 'array', items: { type: 'string' }, description: 'Tags (for store)' },
                metadata: { type: 'object', description: 'Additional metadata (for store, store_episode)' },
                type: { type: 'string', enum: ['user_query', 'system_response', 'event', 'observation', 'insight'], description: 'Episode type (for store_episode)' },
                limit: { type: 'number', description: 'Max results (for recall)' },
                score_threshold: { type: 'number', description: 'Min similarity 0-1 (for recall)' },
            },
            required: ['action'],
        },
    },
    // 4. Documents
    {
        name: 'nexus_documents',
        description: 'Manage documents with intelligent chunking and embeddings. Actions: store (save document), get (retrieve by ID), list (browse), ingest (from URL), validate_url (check URL), check_job (ingestion status).',
        inputSchema: {
            type: 'object',
            properties: {
                action: {
                    type: 'string',
                    enum: ['store', 'get', 'list', 'ingest', 'validate_url', 'check_job'],
                    description: 'The operation to perform',
                },
                content: { type: 'string', description: 'Document content (for store)' },
                title: { type: 'string', description: 'Document title (for store)' },
                document_id: { type: 'string', description: 'Document ID (for get)' },
                include_chunks: { type: 'boolean', description: 'Include chunks (for get)' },
                url: { type: 'string', description: 'URL to ingest/validate (for ingest, validate_url)' },
                job_id: { type: 'string', description: 'Job ID (for check_job)' },
                metadata: { type: 'object', description: 'Document metadata (for store)' },
                limit: { type: 'number', description: 'Max results (for list)' },
                offset: { type: 'number', description: 'Pagination offset (for list)' },
            },
            required: ['action'],
        },
    },
    // 5. Entities (Knowledge Graph)
    {
        name: 'nexus_entities',
        description: 'Manage knowledge graph entities and relationships. Actions: store (create entity), query (search entities), get (by ID), history (entity evolution), hierarchy (entity tree), facts (about subject), cross_domain (search across domains).',
        inputSchema: {
            type: 'object',
            properties: {
                action: {
                    type: 'string',
                    enum: ['store', 'query', 'get', 'history', 'hierarchy', 'facts', 'cross_domain'],
                    description: 'The operation to perform',
                },
                entity_id: { type: 'string', description: 'Entity ID (for get, history, hierarchy)' },
                domain: { type: 'string', description: 'Domain: creative_writing, code, medical, legal, research, general' },
                entity_type: { type: 'string', description: 'Entity type (for store, query)' },
                text_content: { type: 'string', description: 'Entity content (for store)' },
                search_text: { type: 'string', description: 'Search within content (for query)' },
                subject: { type: 'string', description: 'Subject to get facts about (for facts)' },
                domains: { type: 'array', items: { type: 'string' }, description: 'Domains to search (for cross_domain)' },
                query: { type: 'string', description: 'Search query (for cross_domain)' },
                tags: { type: 'array', items: { type: 'string' }, description: 'Tags (for store)' },
                metadata: { type: 'object', description: 'Metadata (for store)' },
                limit: { type: 'number', description: 'Max results' },
                max_results: { type: 'number', description: 'Max results per domain (for cross_domain)' },
            },
            required: ['action'],
        },
    },
    // 6. Search & Retrieval
    {
        name: 'nexus_search',
        description: 'Search across all memory types. Actions: search (unified search), retrieve (with strategy selection), enhanced (multi-source with reranking).',
        inputSchema: {
            type: 'object',
            properties: {
                action: {
                    type: 'string',
                    enum: ['search', 'retrieve', 'enhanced'],
                    description: 'The operation to perform',
                },
                query: { type: 'string', description: 'Search query' },
                strategy: { type: 'string', enum: ['semantic_chunks', 'graph_traversal', 'hybrid', 'adaptive'], description: 'Retrieval strategy (for retrieve)' },
                filters: { type: 'object', description: 'Optional filters (for search)' },
                include_documents: { type: 'boolean', description: 'Include documents (for enhanced)' },
                include_episodic: { type: 'boolean', description: 'Include episodes (for enhanced)' },
                max_tokens: { type: 'number', description: 'Max context tokens (for enhanced)' },
                limit: { type: 'number', description: 'Max results' },
            },
            required: ['action', 'query'],
        },
    },
    // 7. Agent Orchestration
    {
        name: 'nexus_agents',
        description: 'Coordinate AI agents via MageAgent. Actions: orchestrate (auto-assign agents), collaborate (shared context), compete (ranked solutions), analyze (deep analysis), synthesize (combine sources), list (active agents), details (agent info), task_status (check task).',
        inputSchema: {
            type: 'object',
            properties: {
                action: {
                    type: 'string',
                    enum: ['orchestrate', 'collaborate', 'compete', 'analyze', 'synthesize', 'list', 'details', 'task_status'],
                    description: 'The operation to perform',
                },
                task: { type: 'string', description: 'Task objective (for orchestrate)' },
                objective: { type: 'string', description: 'Collaboration/synthesis objective' },
                challenge: { type: 'string', description: 'Competition challenge (for compete)' },
                topic: { type: 'string', description: 'Analysis topic (for analyze)' },
                sources: { type: 'array', items: { type: 'string' }, description: 'Sources to synthesize (for synthesize)' },
                agents: { type: 'array', items: { type: 'object' }, description: 'Agent config (for collaborate)' },
                max_agents: { type: 'number', description: 'Max agents (for orchestrate)' },
                competitor_count: { type: 'number', description: 'Competitors 2-10 (for compete)' },
                evaluation_criteria: { type: 'array', items: { type: 'string' }, description: 'Criteria (for compete)' },
                depth: { type: 'string', enum: ['quick', 'standard', 'deep'], description: 'Depth (for analyze)' },
                include_memory: { type: 'boolean', description: 'Include memory context (for analyze)' },
                format: { type: 'string', enum: ['summary', 'report', 'analysis', 'recommendations'], description: 'Output format (for synthesize)' },
                iterations: { type: 'number', description: 'Collaboration iterations 1-5 (for collaborate)' },
                timeout: { type: 'number', description: 'Timeout ms (for orchestrate)' },
                task_id: { type: 'string', description: 'Task ID (for task_status)' },
                agent_id: { type: 'string', description: 'Agent ID (for details)' },
            },
            required: ['action'],
        },
    },
    // 8. System
    {
        name: 'nexus_system',
        description: 'System health and model management. Actions: health (service status), stats (memory statistics), model_stats (model usage), model_select (choose best model for task).',
        inputSchema: {
            type: 'object',
            properties: {
                action: {
                    type: 'string',
                    enum: ['health', 'stats', 'model_stats', 'model_select'],
                    description: 'The operation to perform',
                },
                detailed: { type: 'boolean', description: 'Detailed health (for health)' },
                include_health: { type: 'boolean', description: 'Include health in stats (for stats)' },
                complexity: { type: 'number', description: 'Task complexity 0-1 (for model_select)' },
                task_type: { type: 'string', description: 'Task type (for model_select)' },
            },
            required: ['action'],
        },
    },
];
// ---------------------------------------------------------------------------
// Tool Handler
// ---------------------------------------------------------------------------
export async function handleToolCall(client, toolName, args) {
    switch (toolName) {
        // -----------------------------------------------------------------------
        // nexus_skills
        // -----------------------------------------------------------------------
        case 'nexus_skills': {
            switch (args.action) {
                case 'list':
                    return client.listSkills({
                        limit: args.limit || 20,
                        offset: args.offset || 0,
                        status: args.status || 'published',
                        category: args.category,
                        search: args.search,
                    });
                case 'get':
                    if (!args.skill_id)
                        throw new Error('skill_id is required for get action');
                    return client.getSkill(args.skill_id);
                case 'discover':
                    if (!args.query)
                        throw new Error('query is required for discover action');
                    return client.discoverSkills(args.query, args.categories, args.min_relevance, args.limit);
                case 'match':
                    if (!args.prompt)
                        throw new Error('prompt is required for match action');
                    return client.matchPrompt(args.prompt, args.limit);
                case 'invoke':
                    if (!args.skill_id)
                        throw new Error('skill_id is required for invoke action');
                    return client.invokeSkill(args.skill_id, args.input);
                case 'create':
                    if (!args.prompt)
                        throw new Error('prompt is required for create action');
                    return client.generateSkill({
                        prompt: args.prompt,
                        referenceSkills: args.reference_skills,
                        referenceUrls: args.reference_urls,
                        constraints: {
                            maxComplexity: args.max_complexity,
                            allowedTools: args.allowed_tools,
                            maxTokenBudget: args.max_token_budget,
                        },
                        visibility: args.visibility || 'private',
                    });
                case 'check_job':
                    if (!args.job_id)
                        throw new Error('job_id is required for check_job action');
                    return client.getSkillJobStatus(args.job_id);
                case 'quality':
                    if (!args.skill_id)
                        throw new Error('skill_id is required for quality action');
                    return client.getQualityScore(args.skill_id);
                case 'related':
                    if (!args.skill_id)
                        throw new Error('skill_id is required for related action');
                    return client.getRelatedSkills(args.skill_id);
                case 'top':
                    return client.getTopSkills(args.limit);
                case 'record':
                    if (!args.skill_id || !args.skill_name || !args.execution_status)
                        throw new Error('skill_id, skill_name, and execution_status are required for record action');
                    return client.recordExecution({
                        skillId: args.skill_id,
                        skillName: args.skill_name,
                        status: args.execution_status,
                        duration: args.duration,
                        input: args.input_summary,
                        output: args.output_summary,
                        error: args.error,
                    });
                case 'sync':
                    return syncSkillsToFilesystem(client, args.force || false);
                default:
                    throw new Error(`Unknown nexus_skills action: ${args.action}`);
            }
        }
        // -----------------------------------------------------------------------
        // nexus_skill_synth
        // -----------------------------------------------------------------------
        case 'nexus_skill_synth':
            return client.synthesizeSkills({
                sourceSkillIds: args.source_skill_ids,
                strategy: args.strategy,
                targetName: args.target_name,
                prompt: args.prompt,
                focusAreas: args.focus_areas,
                visibility: args.visibility,
            });
        // -----------------------------------------------------------------------
        // nexus_memory
        // -----------------------------------------------------------------------
        case 'nexus_memory': {
            switch (args.action) {
                case 'store':
                    if (!args.content)
                        throw new Error('content is required for store action');
                    return client.storeMemory(args.content, args.tags, args.metadata);
                case 'recall':
                    if (!args.query)
                        throw new Error('query is required for recall action');
                    return client.recallMemory(args.query, args.limit, args.score_threshold);
                case 'store_episode':
                    if (!args.content)
                        throw new Error('content is required for store_episode action');
                    return client.storeEpisode(args.content, args.type, args.metadata);
                case 'recall_episodes':
                    if (!args.query)
                        throw new Error('query is required for recall_episodes action');
                    return client.recallEpisodes(args.query, args.limit);
                default:
                    throw new Error(`Unknown nexus_memory action: ${args.action}`);
            }
        }
        // -----------------------------------------------------------------------
        // nexus_documents
        // -----------------------------------------------------------------------
        case 'nexus_documents': {
            switch (args.action) {
                case 'store':
                    if (!args.content)
                        throw new Error('content is required for store action');
                    return client.storeDocument(args.content, args.title, args.metadata);
                case 'get':
                    if (!args.document_id)
                        throw new Error('document_id is required for get action');
                    return client.getDocument(args.document_id, args.include_chunks);
                case 'list':
                    return client.listDocuments(args.limit, args.offset);
                case 'ingest':
                    if (!args.url)
                        throw new Error('url is required for ingest action');
                    return client.ingestUrl(args.url, { skip_confirmation: args.skip_confirmation });
                case 'validate_url':
                    if (!args.url)
                        throw new Error('url is required for validate_url action');
                    return client.validateUrl(args.url);
                case 'check_job':
                    if (!args.job_id)
                        throw new Error('job_id is required for check_job action');
                    return client.checkIngestionJob(args.job_id);
                default:
                    throw new Error(`Unknown nexus_documents action: ${args.action}`);
            }
        }
        // -----------------------------------------------------------------------
        // nexus_entities
        // -----------------------------------------------------------------------
        case 'nexus_entities': {
            switch (args.action) {
                case 'store':
                    if (!args.domain || !args.entity_type || !args.text_content)
                        throw new Error('domain, entity_type, and text_content are required for store action');
                    return client.storeEntity(args.domain, args.entity_type, args.text_content, args.tags, args.metadata);
                case 'query':
                    return client.queryEntities(args.domain, args.entity_type, args.search_text, args.limit);
                case 'get':
                    if (!args.entity_id)
                        throw new Error('entity_id is required for get action');
                    return client.getEntity(args.entity_id);
                case 'history':
                    if (!args.entity_id)
                        throw new Error('entity_id is required for history action');
                    return client.getEntityHistory(args.entity_id);
                case 'hierarchy':
                    if (!args.entity_id)
                        throw new Error('entity_id is required for hierarchy action');
                    return client.getEntityHierarchy(args.entity_id);
                case 'facts':
                    if (!args.subject)
                        throw new Error('subject is required for facts action');
                    return client.getFacts(args.subject);
                case 'cross_domain':
                    if (!args.domains || !args.query)
                        throw new Error('domains and query are required for cross_domain action');
                    return client.crossDomainQuery(args.domains, args.query, args.max_results);
                default:
                    throw new Error(`Unknown nexus_entities action: ${args.action}`);
            }
        }
        // -----------------------------------------------------------------------
        // nexus_search
        // -----------------------------------------------------------------------
        case 'nexus_search': {
            switch (args.action) {
                case 'search':
                    return client.search(args.query, args.filters, args.limit);
                case 'retrieve':
                    return client.retrieve(args.query, args.strategy, args.limit);
                case 'enhanced':
                    return client.enhancedRetrieve(args.query, args.include_documents, args.include_episodic, args.max_tokens);
                default:
                    throw new Error(`Unknown nexus_search action: ${args.action}`);
            }
        }
        // -----------------------------------------------------------------------
        // nexus_agents
        // -----------------------------------------------------------------------
        case 'nexus_agents': {
            switch (args.action) {
                case 'orchestrate':
                    if (!args.task)
                        throw new Error('task is required for orchestrate action');
                    return client.orchestrate(args.task, args.max_agents, args.timeout);
                case 'collaborate':
                    if (!args.objective)
                        throw new Error('objective is required for collaborate action');
                    return client.collaborate(args.objective, args.agents, args.iterations);
                case 'compete':
                    if (!args.challenge)
                        throw new Error('challenge is required for compete action');
                    return client.competition(args.challenge, args.competitor_count, args.evaluation_criteria);
                case 'analyze':
                    if (!args.topic)
                        throw new Error('topic is required for analyze action');
                    return client.analyze(args.topic, args.depth, args.include_memory);
                case 'synthesize':
                    if (!args.sources)
                        throw new Error('sources is required for synthesize action');
                    return client.synthesizeInfo(args.sources, args.objective, args.format);
                case 'list':
                    return client.listAgents();
                case 'details':
                    if (!args.agent_id)
                        throw new Error('agent_id is required for details action');
                    return client.getAgentDetails(args.agent_id);
                case 'task_status':
                    if (!args.task_id)
                        throw new Error('task_id is required for task_status action');
                    return client.getTaskStatus(args.task_id);
                default:
                    throw new Error(`Unknown nexus_agents action: ${args.action}`);
            }
        }
        // -----------------------------------------------------------------------
        // nexus_system
        // -----------------------------------------------------------------------
        case 'nexus_system': {
            switch (args.action) {
                case 'health':
                    return client.getHealth(args.detailed);
                case 'stats':
                    return client.getStats(args.include_health);
                case 'model_stats':
                    return client.getModelStats();
                case 'model_select':
                    if (args.complexity === undefined || !args.task_type)
                        throw new Error('complexity and task_type are required for model_select action');
                    return client.selectModel(args.complexity, args.task_type);
                default:
                    throw new Error(`Unknown nexus_system action: ${args.action}`);
            }
        }
        default:
            throw new Error(`Unknown tool: ${toolName}`);
    }
}
//# sourceMappingURL=tools.js.map