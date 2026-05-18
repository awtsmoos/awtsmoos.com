
// B"H
/**
 * @file Testing.js
 * @brief Headless browser simulation schemas.
 */

export const TestingSchemas = [
    {
        function: {
            name: "run_ui_test",
            description: "Spins up a virtual machine browser, runs your HTML or hits a running URL (e.g., http://localhost:3000), executes clicks, typing, keyboard actions, touches, DOM reads, JavaScript evaluation, waits, custom event waits, and canvas snapshots, then returns browser errors and results.",
            parameters: {
                type: "object",
                properties: {
                    html_entry_path: { type: "string", description: "Relative path to index.html. Optional if using target_url." },
                    target_url: { type: "string", description: "The HTTP URL to test (e.g., 'http://localhost:3000'). Optional if using html_entry_path." },
                    test_plan: { 
                        type: "array", 
                        items: {
                            type: "object",
                            properties: {
                                action: { type: "string", enum: ["click", "type", "keyboard_press", "touch", "wait", "wait_for_element", "evaluate", "read_dom", "await_event", "snapshot_canvas", "snapshot_page"] },
                                selector: { type: "string", description: "CSS selector for the target element when needed." },
                                text: { type: "string", description: "Text to input or key to press." },
                                expression: { type: "string", description: "Raw JavaScript to evaluate in the page." },
                                ms: { type: "number", description: "Milliseconds to wait." },
                                timeout: { type: "number", description: "Maximum wait duration." },
                                eventName: { type: "string", description: "Custom event name for await_event." },
                                touchType: { type: "string", enum: ["touchstart", "touchmove", "touchend"], description: "Touch event type." },
                                x: { type: "number", description: "Client X for touch events." },
                                y: { type: "number", description: "Client Y for touch events." }
                            },
                            required: ["action"]
                        }
                    }
                },
                required: ["test_plan"]
            }
        }
    },
    {
        function: {
            name: "run_node_script",
            description: "Runs a Node-style script through the built-in simulator, captures console output, and reports completion or timeout.",
            parameters: {
                type: "object",
                properties: {
                    entry_path: { type: "string", description: "Relative path to the JavaScript entry file to run." },
                    timeout_ms: { type: "number", description: "Optional timeout in milliseconds. Defaults to 10000." }
                },
                required: ["entry_path"]
            }
        }
    },
    {
        function: {
            name: "verify_vibe_tool_parity",
            description: "Verifies that semantic, patch, runtime, and preview tools exist across editor schemas, legacy schemas, routers, executors, tunnel docs, agent actions, and GPT Action OpenAPI.",
            parameters: {
                type: "object",
                properties: {}
            }
        }
    },
    {
        function: {
            name: "run_command_batch",
            description: "Runs a sequential batch of terminal commands in one call. Useful for setup/build/test chains and for executing .bat/.sh scripts through the emulated command runner.",
            parameters: {
                type: "object",
                properties: {
                    cwd: { type: "string", description: "Optional working directory path." },
                    commands: {
                        type: "array",
                        items: { type: "string" },
                        description: "Commands to run in exact sequence."
                    }
                },
                required: ["commands"]
            }
        }
    },
    {
        function: {
            name: "run_semantic_workflow",
            description: "Runs a declarative conditional workflow graph instead of shell scripting.",
            parameters: {
                type: "object",
                properties: { workflow: { type: "object" } },
                required: ["workflow"]
            }
        }
    },
    {
        function: {
            name: "assert_runtime_contracts",
            description: "Asserts semantic runtime behaviors like page health, DOM expectations, and console errors.",
            parameters: {
                type: "object",
                properties: {
                    target_url: {type: "string" },
                    assertions: {
                        type: "array",
                        items: { type: "string" }
                    }
                },
                required: ["target_url", "assertions"]
            }
        }
    }
];
