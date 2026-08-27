
// B"H
/**
 * @file FileSystemSchemas.js
 * @brief THE ARCHITECTURE OF THE CRAFTSMAN'S HANDS.
 */

export const FileSystemSchemas = [
    {
        function: {
            name: "list_files_tree",
            description: "Scans the structural hierarchy. Always use '/' for your project's current session root folder.",
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
            description: "Reads the entire content of a file. Best for files under 20k characters.",
            parameters: {
                type: "object",
                properties: {
                    path: { type: "string", description: "Relative path of the file." }
                },
                required: ["path"]
            }
        }
    },
    {
        function: {
            name: "read_file_chunk",
            description: "Reads specific lines from a file. Perfect for massive codebases.",
            parameters: {
                type: "object",
                properties: {
                    path: { type: "string", description: "Relative path of the file." },
                    start_line: { type: "number", description: "1-based starting line number." },
                    end_line: { type: "number", description: "1-based ending line number (inclusive)." }
                },
                required: ["path", "start_line", "end_line"]
            }
        }
    },
    {
        function: {
            name: "search_in_files",
            description: "Hunts for specific variables, patterns, or strings throughout the whole folder and returns snippets with context. Use this instead of reading everything one-by-one.",
            parameters: {
                type: "object",
                properties: {
                    query: { type: "string", description: "The exact search term or functional label." },
                    directory_path: { type: "string", description: "Folder to restrict the search. Defaults to '/'." }
                },
                required: ["query"]
            }
        }
    },
    {
        function: {
            name: "bulk_read_markdown",
            description: "HIGH PERFORMANCE GATHERING: Recursively reads everything in a directory and merges it into one Markdown scroll. Use this when entering a new sub-dimension.",
            parameters: {
                type: "object",
                properties: {
                    directory_path: { type: "string", description: "Folder to read entirely. e.g., 'src/render'" }
                },
                required: ["directory_path"]
            }
        }
    },
    {
        function: {
            name: "engrave_vessel",
            description: "Creates or overwrites a physical file. ALWAYS provide FULL unfiltered content.",
            parameters: {
                type: "object",
                properties: {
                    path: { type: "string", description: "The destination relative path." },
                    content: { type: "string", description: "Complete, absolute code essence." }
                },
                required: ["path", "content"]
            }
        }
    },
    {
        function: {
            name: "purge_vessel",
            description: "Deletes a vessel permanently.",
            parameters: {
                type: "object",
                properties: {
                    path: { type: "string" }
                },
                required: ["path"]
            }
        }
    }
];
