// B"H

/**
 * B"H
 * Chapter 17: Every tunnel action became a callable constellation.
 *
 * This converts Awtsmoos tool names into OpenAI-compatible tool schemas. The
 * schema stays intentionally generic so native, browser-editor, and future OS
 * tunnels can expose hundreds of tools without hand-writing each function.
 */
export function makeAwtsmoosToolSchema(name) {
  return {
    type: "function",
    function: {
      name,
      description: `Run Awtsmoos tunnel action: ${name}`,
      parameters: {
        type: "object",
        additionalProperties: true,
        properties: {
          action: { type: "string", description: "Optional action override." },
          path: { type: "string", description: "File or workspace path." },
          p: { type: "string", description: "Short path alias." },
          query: { type: "string", description: "Search or command query." },
          content: { type: "string", description: "Complete file content." }
        }
      }
    }
  };
}

/**
 * B"H
 * Makes schemas from action names.
 *
 * @param {string[]} actions Tunnel action names.
 * @returns {object[]} OpenAI-compatible tool schemas.
 */
export function makeToolSchemas(actions = []) {
  return [...new Set(actions)].filter(Boolean).map(makeAwtsmoosToolSchema);
}

/**
 * B"H
 * Default safe starter tools for agents before full discovery.
 */
export const DEFAULT_SAFE_ACTIONS = Object.freeze([
  "list", "tree", "read", "readLines", "readManyLines", "read64",
  "bulk", "grep", "find", "selectString", "fileHashes", "astOutline",
  "symbolOutline", "connectedFiles", "getContext", "contextPack",
  "aiContextPack", "lazyContextPack",
  "simulateRuntime", "commandTreeRun", "write", "bulkWrite"
]);
