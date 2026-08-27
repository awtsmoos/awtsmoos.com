
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
            name: "read_file_chunk",
            description: "Reads only a specific line range from a file. Use this when a large file would waste tokens.",
            parameters: {
                type: "object",
                properties: {
                    path: { type: "string", description: "The relative path of the file." },
                    start_line: { type: "number", description: "1-based starting line number." },
                    end_line: { type: "number", description: "1-based ending line number." }
                },
                required: ["path", "start_line", "end_line"]
            }
        }
    },
    {
        function: {
            name: "search_in_files",
            description: "Searches the workspace for an exact string and returns matching files with short snippets.",
            parameters: {
                type: "object",
                properties: {
                    query: { type: "string", description: "Exact text to search for." },
                    directory_path: { type: "string", description: "Optional subdirectory to restrict the search." }
                },
                required: ["query"]
            }
        }
    },
    {
        function: {
            name: "read_connected_vessels",
            description: "Traverses connected JS/TS/HTML module dependencies starting from one file and returns content up to a chosen depth.",
            parameters: {
                type: "object",
                properties: {
                    path: { type: "string", description: "Starting relative file path." },
                    max_depth: { type: "number", description: "Dependency traversal depth. Default 2." }
                },
                required: ["path"]
            }
        }
    },
    {
        function: {
            name: "set_working_directory",
            description: "Sets the AI terminal working directory for future terminal-like commands.",
            parameters: {
                type: "object",
                properties: {
                    directory_path: { type: "string", description: "Relative directory path. Use '/' for workspace root." }
                },
                required: ["directory_path"]
            }
        }
    },
    {
        function: {
            name: "run_terminal_command",
            description: "Runs a safe terminal-like command in the current workspace context. Supported commands: pwd, ls, tree, cat, grep, head, tail.",
            parameters: {
                type: "object",
                properties: {
                    command: { type: "string", description: "Terminal-like command text." },
                    cwd: { type: "string", description: "Optional relative working directory override for this command." }
                },
                required: ["command"]
            }
        }
    },
    {
        function: {
            name: "semantic_outline",
            description: "Returns a compact symbol/import/export outline for a file through the active virtual filesystem provider.",
            parameters: { type: "object", properties: { path: { type: "string" } }, required: ["path"] }
        }
    },
    {
        function: {
            name: "semantic_search",
            description: "Searches with the active provider without bulk-reading the workspace.",
            parameters: { type: "object", properties: { path: { type: "string" }, query: { type: "string" }, limit: { type: "number" } }, required: ["query"] }
        }
    },
    {
        function: {
            name: "dependency_graph",
            description: "Builds a bounded dependency graph from an entry file. Use to hydrate only relevant context.",
            parameters: { type: "object", properties: { path: { type: "string" }, max_files: { type: "number" }, max_depth: { type: "number" } }, required: ["path"] }
        }
    },
    {
        function: {
            name: "file_hashes",
            description: "Returns SHA-256 hashes. Use before hash-guarded patches.",
            parameters: { type: "object", properties: { paths: { type: "array", items: { type: "string" } }, path: { type: "string" } } }
        }
    },
    {
        function: {
            name: "replace_range",
            description: "Hash-guarded micro-edit for existing files. Replaces a character range without rewriting the whole file.",
            parameters: { type: "object", properties: { path: { type: "string" }, start: { type: "number" }, end: { type: "number" }, replacement: { type: "string" }, expectedSha256: { type: "string" } }, required: ["path", "start", "end", "replacement", "expectedSha256"] }
        }
    },
    {
        function: {
            name: "apply_patch",
            description: "Applies multiple hash-guarded range patches to one file.",
            parameters: { type: "object", properties: { path: { type: "string" }, patches: { type: "array", items: { type: "object" } }, expectedSha256: { type: "string" } }, required: ["path", "patches", "expectedSha256"] }
        }
    },
    {
        function: {
            name: "engrave_vessel",
            description: "Creates or intentionally replaces a full file. Prefer semantic_outline, file_hashes, replace_range, and apply_patch for existing files so the AI does not rewrite entire files blindly.",
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
