// B"H
/**
 * @file Runtime.js
 * @brief Schemas for virtual preview and app runtime control.
 */
export const RuntimeSchemas = [
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
    }
];
