
// B"H
/**
 * @file Orchestration.js
 * @brief Intelligence governance schemas.
 */

export const OrchestrationSchemas = [
    {
        function: {
            name: "get_model_usage_limits",
            description: "Lists all available models across providers, marking which are FREE. PRIORITIZE FREE models for reading files to save tokens.",
            parameters: { type: "object", properties: {} }
        }
    },
    {
        function: {
            name: "shift_consciousness",
            description: "Switches your environment to a different model for the next loop. Use this for economic routing.",
            parameters: {
                type: "object",
                properties: {
                    model_id: { type: "string" },
                    reasoning: { type: "string" }
                },
                required: ["model_id", "reasoning"]
            }
        }
    },
    {
        function: {
            name: "consult_oracle",
            description: "Asks ANOTHER AI model a question and gets the answer. Great for asking an expert model for help while on a cheaper model.",
            parameters: {
                type: "object",
                properties: {
                    target_model: { type: "string" },
                    query: { type: "string" }
                },
                required: ["target_model", "query"]
            }
        }
    },
    {
        function: {
            name: "continue_autonomous_loop",
            description: "Continues the autonomous cycle immediately.",
            parameters: {
                type: "object",
                properties: { internal_monologue: { type: "string" } },
                required: ["internal_monologue"]
            }
        }
    },
    {
        function: {
            name: "get_provider_status",
            description: "Lists all configured providers and how many keys/models are currently available for each.",
            parameters: { type: "object", properties: {} }
        }
    },
    {
        function: {
            name: "get_provider_telemetry",
            description: "Returns real-time runtime telemetry for each provider including success/failure counts, rate-limit hits, quota failures, and recent request events.",
            parameters: { type: "object", properties: {} }
        }
    },
    {
        function: {
            name: "get_registered_keys",
            description: "Lists all registered API keys (masked) and identifies which one is currently active for the selected model.",
            parameters: { type: "object", properties: {} }
        }
    },
    {
        function: {
            name: "shift_consciousness_by_provider",
            description: "Switches to the best model for a specific provider, optionally requiring free-only and tool-capable models.",
            parameters: {
                type: "object",
                properties: {
                    provider_id: { type: "string" },
                    require_free: { type: "boolean" },
                    require_tools: { type: "boolean" }
                },
                required: ["provider_id"]
            }
        }
    }
];
