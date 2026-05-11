
// B"H
/**
 * @file TestingSchemas.js
 * @brief The Tools of the Mirror of Truth.
 */

export const TestingSchemas =[
    {
        function: {
            name: "run_ui_test",
            description: "The Mirror of Truth. Spins up a full headless browser simulation. Tests a local file OR a running server (http://localhost:3000). Executes your sequence of actions (clicks, keyboard_press, touch, evaluate, snapshot_canvas) and returns all Console errors, Network 404s, and action results. IF IT FAILS, analyze the stack traces, fix the code, and call run_ui_test AGAIN until you succeed.",
            parameters: {
                type: "object",
                properties: {
                    html_entry_path: { type: "string", description: "Relative path to HTML. LEAVE EMPTY if using target_url." },
                    target_url: { type: "string", description: "Exact HTTP URL of a running server (e.g., 'http://localhost:3000'). Ignore html_entry_path if using this." },
                    test_plan: { 
                        type: "array", 
                        description: "A sequential list of actions to perform.",
                        items: {
                            type: "object",
                            properties: {
                                action: { type: "string", enum:["click", "type", "keyboard_press", "touch", "wait", "wait_for_element", "evaluate", "read_dom", "await_event", "snapshot_canvas"], description: "The type of action." },
                                selector: { type: "string", description: "CSS selector for the target element (optional for global keyboard_press)." },
                                text: { type: "string", description: "Text to input (for 'type') or key to press (for 'keyboard_press'). e.g., 'Enter', 'ArrowUp', 'a'" },
                                ms: { type: "number", description: "Milliseconds to wait (for 'wait')." },
                                expression: { type: "string", description: "Raw JavaScript to eval() inside the iframe, returns the result (for 'evaluate')." },
                                timeout: { type: "number", description: "Max MS to wait (for 'wait_for_element' or 'await_event')." },
                                eventName: { type: "string", description: "Name of the custom CustomEvent to listen for (for 'await_event'). e.g., 'app-ready'" },
                                touchType: { type: "string", enum: ["touchstart", "touchmove", "touchend"], description: "The specific touch event (for 'touch')." },
                                x: { type: "number", description: "X coordinate (for 'touch')." },
                                y: { type: "number", description: "Y coordinate (for 'touch')." }
                            },
                            required: ["action"]
                        }
                    }
                },
                required:["test_plan"]
            }
        }
    }
];
