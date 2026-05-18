
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
            name: "semantic_outline",
            description: "Returns a compact symbol/import/export outline for a file through the active provider. Use before editing.",
            parameters: {
                type: "object",
                properties: {
                    path: { type: "string", description: "Relative file path." }
                },
                required: ["path"]
            }
        }
    },
    {
        function: {
            name: "semantic_search",
            description: "Searches a path semantically or line-locally with the active provider. Use for lazy context instead of bulk reads.",
            parameters: {
                type: "object",
                properties: {
                    path: { type: "string", description: "File or folder path. Defaults to '/'." },
                    query: { type: "string", description: "Query to search." },
                    limit: { type: "number", description: "Maximum results." }
                },
                required: ["query"]
            }
        }
    },
    {
        function: {
            name: "dependency_graph",
            description: "Builds a bounded local dependency graph from an entry file. Use to identify connected context without reading the whole project.",
            parameters: {
                type: "object",
                properties: {
                    path: { type: "string" },
                    max_files: { type: "number" },
                    max_depth: { type: "number" }
                },
                required: ["path"]
            }
        }
    },
    {
        function: {
            name: "file_hashes",
            description: "Returns SHA-256 hashes for paths. Use before hash-guarded patches.",
            parameters: {
                type: "object",
                properties: {
                    paths: { type: "array", items: { type: "string" } },
                    path: { type: "string" }
                }
            }
        }
    },
    {
        function: {
            name: "replace_range",
            description: "Hash-guarded micro-edit. Replaces a character range in a file. Prefer this over engrave_vessel for existing files.",
            parameters: {
                type: "object",
                properties: {
                    path: { type: "string" },
                    start: { type: "number" },
                    end: { type: "number" },
                    replacement: { type: "string" },
                    expectedSha256: { type: "string" }
                },
                required: ["path", "start", "end", "replacement", "expectedSha256"]
            }
        }
    },
    {
        function: {
            name: "apply_patch",
            description: "Applies multiple hash-guarded range patches to one file.",
            parameters: {
                type: "object",
                properties: {
                    path: { type: "string" },
                    patches: { type: "array", items: { type: "object" } },
                    expectedSha256: { type: "string" }
                },
                required: ["path", "patches", "expectedSha256"]
            }
        }
    },
    {
        function: {
            name: "engrave_vessel",
            description: "Creates or intentionally replaces a full file. Prefer semantic_outline, file_hashes, replace_range, or apply_patch for existing files so the AI does not rewrite whole vessels blindly.",
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
            name: "inspect_runtime",
            description: "Detects the app runtime from the active virtual filesystem without launching it.",
            parameters: {
                type: "object",
                properties: {
                    project_path: { type: "string", description: "Project folder. Defaults to /." }
                }
            }
        }
    },
    {
        function: {
            name: "launch_preview",
            description: "Launches a virtual preview and returns a usable URL. Supports static HTML and browser-virtual Node backend apps.",
            parameters: {
                type: "object",
                properties: {
                    project_path: { type: "string", description: "Project folder. Defaults to /." },
                    manifest: { type: "object", description: "Optional runtime override: kind, entry, port, command." }
                }
            }
        }
    },
    {
        function: {
            name: "list_previews",
            description: "Lists active virtual previews for this editor session.",
            parameters: { type: "object", properties: {} }
        }
    },
    {
        function: {
            name: "preview_logs",
            description: "Reads recent logs for a virtual preview.",
            parameters: {
                type: "object",
                properties: { id: { type: "string" } },
                required: ["id"]
            }
        }
    },
    {
        function: {
            name: "stop_preview",
            description: "Stops a virtual preview and releases browser object URLs when possible.",
            parameters: {
                type: "object",
                properties: { id: { type: "string" } },
                required: ["id"]
            }
        }
    },
    {
        function: {
            name: "restart_preview",
            description: "Stops and launches a fresh virtual preview for a project path.",
            parameters: {
                type: "object",
                properties: {
                    id: { type: "string" },
                    project_path: { type: "string" }
                }
            }
        }
    },
    {
        function: {
            name: "
// B"H cognition tool names for legacy provider schema parity
// {name: 'semantic_diff'}
// {name: 'detect_concept_clusters'}
// {name: 'simulate_failure'}
// {name: 'generate_repair_plan'}
// {name: 'supervise_runtime'}
// {name: 'infer_architecture'}
// {name: 'detect_abstraction_leaks'}
// {name: 'runtime_entity_graph'}
// {name: 'semantic_refactor'}
// {name: 'inspect_render_storms'}
// {name: 'runtime_contract_registry'}
// {name: 'semantic_search_runtime'}
// {name: 'preview_branch_matrix'}
// {name: 'infer_business_rules'}
// {name: 'state_time_machine'}
// {name: 'detect_dead_concepts'}
// {name: 'semantic_merge'}
// {name: 'runtime_introspection_stream'}
// {name: 'architecture_score'}
// {name: 'intent_drift_detector'}
// {name: 'semantic_package_generator'}
// {name: 'self_heal_preview'}
// {name: 'generate_test_universe'}
// {name: 'inspect_human_confusion'}
// {name: 'orchestration_graph'}
// {name: 'environment_virtualizer'}
// {name: 'runtime_snapshot'}
// {name: 'semantic_cache'}
// {name: 'goal_compiler'}
// {name: 'autonomous_background_agents'}
// {name: 'semantic_pipeline'}
// {name: 'universal_app_manifest'}
get_model_usage_limits",
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
