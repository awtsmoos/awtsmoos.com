
// B"H
/**
 * @file MetaSchemas.js
 * @brief The Tools of the Higher Spheres (Chochmah & Binah).
 */

export const MetaSchemas = [
    {
        function: {
            name: "get_model_usage_limits",
            description: "Returns a list of all currently accessible AI models (from Gemini and OpenRouter), along with their context window limits and relative prices.",
            parameters: {
                type: "object",
                properties: {}
            }
        }
    },
    {
        function: {
            name: "shift_consciousness",
            description: "Shifts your execution environment to a different AI model for the NEXT loop. Use this to downgrade to a cheaper/faster model for simple tasks (list_files, read), or upgrade to a smarter model when stuck.",
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
            description: "Pauses your current execution and sends a query to ANOTHER AI model (e.g., Gemini asking Claude, or vice versa), returning its response to you so you can continue your task with new insight.",
            parameters: {
                type: "object",
                properties: {
                    target_model: { type: "string", description: "The model ID to consult (e.g., 'openrouter/anthropic/claude-3.5-sonnet')." },
                    query: { type: "string", description: "The question or problem you want the other AI to solve for you." }
                },
                required: ["target_model", "query"]
            }
        }
    },
    {
        function: {
            name: "continue_autonomous_loop",
            description: "Forces the Vibe Engine to trigger you again immediately without waiting for the human to speak. Use this to chain complex logic steps together, or to review your work after writing files.",
            parameters: {
                type: "object",
                properties: {
                    internal_monologue: { type: "string", description: "Your internal thought process on what you will do in the next loop." }
                },
                required: ["internal_monologue"]
            }
        }
    }
];
