
// B"H
/**
 * @file Testing.js
 * @brief Headless browser simulation schemas.
 */

export const TestingSchemas = [
    {
        function: {
            name: "run_ui_test",
            description: "Spins up a virtual machine browser, runs your HTML or hits a running URL (e.g., http://localhost:3000), executes your clicks/types, and returns all errors including network 404s and uncaught exceptions. MANDATORY after writing UI code.",
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
                                action: { type: "string", enum: ["click", "type", "wait", "wait_for_element", "evaluate", "read_dom"] },
                                selector: { type: "string" },
                                text: { type: "string" },
                                expression: { type: "string" },
                                ms: { type: "number" },
                                timeout: { type: "number" }
                            },
                            required: ["action"]
                        }
                    }
                },
                required: ["test_plan"]
            }
        }
    }
];
