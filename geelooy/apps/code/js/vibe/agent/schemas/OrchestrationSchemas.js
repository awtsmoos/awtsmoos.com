
// B"H
/**
 * @file OrchestrationSchemas.js
 * @brief The Crown (Keter) of Autonomous Intent.
 * 
 * CHAPTER XCV: THE OMNISCIENT GOVERNOR
 * 
 * To navigate the infinite permutations of code, the AI must govern itself.
 * It must know which realms are free (zero-cost models) and which are expensive.
 * It must be able to branch its consciousness, asking a lesser model to read 
 * a vast directory, while saving the core intellect (like Claude 3.5 or Gemini Pro)
 * for the intricate synthesis.
 */

export const OrchestrationSchemas = [
    {
        function: {
            name: "get_model_usage_limits",
            description: "Returns a list of all currently accessible AI models (from Gemini and OpenRouter), highlighting which ones are FREE ($0 cost), along with their context window limits. PRIORITIZE FREE MODELS for heavy data gathering (reading directories) to save resources.",
            parameters: {
                type: "object",
                properties: {}
            }
        }
    },
    {
        function: {
            name: "shift_consciousness",
            description: "Shifts your execution environment to a different AI model for the NEXT autonomous loop. Use this to downgrade to a FREE/cheaper model for simple reading tasks, or upgrade to a smarter model when deep reasoning is required.",
            parameters: {
                type: "object",
                properties: {
                    model_id: { type: "string", description: "The exact ID of the model to switch to, obtained from get_model_usage_limits." },
                    reasoning: { type: "string", description: "Explain why you are shifting your consciousness." }
                },
                required: ["model_id", "reasoning"]
            }
        }
    },
    {
        function: {
            name: "consult_oracle",
            description: "Pauses your execution to spawn a sub-agent (ANOTHER AI model). You pass it a prompt, it thinks, and returns the answer to you. Extremely useful for asking a superior model a difficult logic question while you are operating on a faster/cheaper model.",
            parameters: {
                type: "object",
                properties: {
                    target_model: { type: "string", description: "The model ID to consult (e.g., 'openrouter/anthropic/claude-3.5-sonnet')." },
                    query: { type: "string", description: "The specific coding question or problem you want the sub-agent to solve for you." }
                },
                required: ["target_model", "query"]
            }
        }
    },
    {
        function: {
            name: "continue_autonomous_loop",
            description: "Forces the Engine to trigger you again immediately without waiting for the human. Essential for chaining complex multi-step tasks (e.g., Read File -> Write File -> Test App -> Read Test Results -> Fix File).",
            parameters: {
                type: "object",
                properties: {
                    internal_monologue: { type: "string", description: "Your internal strategy on what you will execute in the next loop." }
                },
                required: ["internal_monologue"]
            }
        }
    }
];
