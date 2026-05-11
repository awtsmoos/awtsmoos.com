
// B"H
/**
 * @file FileSystem.js
 * @brief Autonomous structural manipulation schemas.
 */

export const FileSystemSchemas = [
    {
        function: {
            name: "list_files_tree",
            description: "Scans the project tree. Use this FIRST to see what files exist before trying to read them.",
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
            description: "Reads a single file's content. Use this to understand the logic within a specific file.",
            parameters: {
                type: "object",
                properties: {
                    path: { type: "string", description: "The relative path of the file." }
                },
                required: ["path"]
            }
        }
    },
    {
        function: {
            name: "bulk_read_markdown",
            description: "Reads multiple files in a directory recursively and concatenates them into one Markdown scroll. Extremely token-efficient for multi-file context gathering.",
            parameters: {
                type: "object",
                properties: {
                    directory_path: { type: "string", description: "The folder to read entirely." }
                },
                required: ["directory_path"]
            }
        }
    },
    {
        function: {
            name: "engrave_vessel",
            description: "Writes a file to disk. Provide the FULL content. This is how you implement your code changes.",
            parameters: {
                type: "object",
                properties: {
                    path: { type: "string", description: "The destination path." },
                    content: { type: "string", description: "The complete file content." }
                },
                required: ["path", "content"]
            }
        }
    }
];
