
// B"H
/**
 * @file ToolSchemas.js
 * @brief The Ten Utterances of the Digital Realm.
 */

export const ToolSchemas = [
    {
        function: {
            name: "list_files_tree",
            description: "Reveals the deep structural hierarchy of the project. Use this to understand the directory layout before diving into specific files.",
            parameters: {
                type: "object",
                properties: {
                    path: { type: "string", description: "The relative path to explore. Use '/' for the project root." }
                },
                required: ["path"]
            }
        }
    },
    {
        function: {
            name: "read_vessel",
            description: "Extracts the exact physical essence (string content) of a single file.",
            parameters: {
                type: "object",
                properties: {
                    path: { type: "string", description: "The relative path of the file to read." }
                },
                required: ["path"]
            }
        }
    },
    {
        function: {
            name: "bulk_read_markdown",
            description: "Reads an entire directory recursively and returns all text-based file contents concatenated as a single Markdown scroll.",
            parameters: {
                type: "object",
                properties: {
                    directory_path: { type: "string", description: "The folder to read entirely. e.g., 'src/components'" }
                },
                required: ["directory_path"]
            }
        }
    },
    {
        function: {
            name: "search_essence",
            description: "Hunts for specific variables, functions, or strings across the entire workspace.",
            parameters: {
                type: "object",
                properties: {
                    query: { type: "string", description: "The exact string or term to search for." },
                    directory_path: { type: "string", description: "Optional folder to restrict the search. Defaults to '/'." }
                },
                required: ["query"]
            }
        }
    },
    {
        function: {
            name: "engrave_vessel",
            description: "The ultimate act of creation. Completely overwrites or creates a new file at the specified coordinate. Do NOT use placeholders. Provide the FULL, complete, final code.",
            parameters: {
                type: "object",
                properties: {
                    path: { type: "string", description: "The destination relative path." },
                    content: { type: "string", description: "The complete, absolute, unfiltered code content." }
                },
                required: ["path", "content"]
            }
        }
    },
    {
        function: {
            name: "purge_vessel",
            description: "Deletes a file or directory, returning its space to the void.",
            parameters: {
                type: "object",
                properties: {
                    path: { type: "string", description: "The path to obliterate." }
                },
                required: ["path"]
            }
        }
    },
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
            description: "Shifts your execution environment to a different AI model for the NEXT loop. Use this to downgrade to a cheaper model for simple tasks, or upgrade to a smarter model when stuck.",
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
            name: "run_ui_test",
            description: "The Mirror of Truth. Spins up a full headless browser simulation of your HTML. Executes your specified sequence of actions (clicks, types, evaluations) like Puppeteer, and returns all Console errors, Network 404s, and action results.",
            parameters: {
                type: "object",
                properties: {
                    html_entry_path: { type: "string", description: "The relative path to the HTML file to run. e.g., 'index.html'" },
                    test_plan: { 
                        type: "array", 
                        description: "A sequential list of actions to perform inside the simulation.",
                        items: {
                            type: "object",
                            properties: {
                                action: { type: "string", enum: ["click", "type", "wait", "wait_for_element", "evaluate", "read_dom"], description: "The type of action to perform." },
                                selector: { type: "string", description: "CSS selector for the target element (for click, type, wait_for_element, read_dom)." },
                                text: { type: "string", description: "The text to input (only used if action is 'type')." },
                                ms: { type: "number", description: "Milliseconds to wait (only used if action is 'wait')." },
                                expression: { type: "string", description: "Raw JavaScript to eval() inside the iframe, returns the result (only used if action is 'evaluate')." },
                                timeout: { type: "number", description: "Max MS to wait for an element (only used if action is 'wait_for_element')." }
                            },
                            required: ["action"]
                        }
                    }
                },
                required: ["html_entry_path", "test_plan"]
            }
        }
    },
    {
        function: {
            name: "consult_oracle",
            description: "Pauses your current execution and sends a query to ANOTHER AI model, returning its response to you so you can continue your task.",
            parameters: {
                type: "object",
                properties: {
                    target_model: { type: "string", description: "The model ID to consult (e.g., 'openrouter/anthropic/claude-3-opus')." },
                    query: { type: "string", description: "The question or problem you want the other AI to solve for you." }
                },
                required: ["target_model", "query"]
            }
        }
    },
    {
        function: {
            name: "continue_autonomous_loop",
            description: "Forces the Vibe Engine to trigger you again immediately without waiting for the human to speak. Use this to chain complex logic steps together seamlessly.",
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
