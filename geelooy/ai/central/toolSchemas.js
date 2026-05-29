// B"H

const TOOL_DETAIL_NAME = "awtsmoos_tool_details";
const TOOL_CALL_NAME = "awtsmoos_tool_call";

/**
 * B"H
 * Chapter 205: The Tool Names Became A Small Door Instead Of A Flood.
 *
 * Non-ChatGPT providers should not receive hundreds of huge schemas. Essential
 * tools are direct; the rest are discoverable by name/query through one details
 * tool and runnable through one dispatcher.
 */
export function makeAwtsmoosToolSchema(name) {
  return {
    type: "function",
    function: {
      name,
      description: `Run Awtsmoos tunnel action: ${name}`,
      parameters: genericActionParameters()
    }
  };
}

export function makeToolSchemas(actions = []) {
  return unique(actions).map(makeAwtsmoosToolSchema);
}

export function makeBridgeToolSchemas(essential = [], allActions = []) {
  const names = unique(allActions.length ? allActions : essential);
  const visible = unique(essential).filter(name => names.includes(name));
  return [...makeToolSchemas(visible), makeToolDetailsSchema(names), makeToolCallSchema(names)];
}

export function makeToolDetailsSchema(names = []) {
  return {
    type: "function",
    function: {
      name: TOOL_DETAIL_NAME,
      description: `Search/get details for Awtsmoos tunnel tools. Catalog sample: ${compactNames(names)}. Use query for unknown tools.`,
      parameters: {
        type: "object",
        additionalProperties: false,
        properties: {
          names: { type: "array", items: { type: "string" }, description: "Exact tool names to describe." },
          query: { type: "string", description: "Search text to find matching tool names." }
        }
      }
    }
  };
}

export function makeToolCallSchema(names = []) {
  return {
    type: "function",
    function: {
      name: TOOL_CALL_NAME,
      description: `Run any Awtsmoos tunnel tool by name. Catalog sample: ${compactNames(names)}. Use awtsmoos_tool_details before rare tools.`,
      parameters: {
        type: "object",
        additionalProperties: false,
        required: ["name", "arguments"],
        properties: {
          name: { type: "string", description: "Exact Awtsmoos tool/action name." },
          arguments: { type: "object", additionalProperties: true, description: "Arguments for that action." }
        }
      }
    }
  };
}

export function isCatalogToolName(name = "") {
  return name === TOOL_DETAIL_NAME || name === TOOL_CALL_NAME;
}

export function toolDetailName() { return TOOL_DETAIL_NAME; }
export function toolCallName() { return TOOL_CALL_NAME; }

export function describeTool(name = "") {
  return {
    name,
    directSchema: makeAwtsmoosToolSchema(name),
    callVia: TOOL_CALL_NAME,
    commonArguments: Object.keys(genericActionParameters().properties),
    note: `Use ${TOOL_CALL_NAME} with {"name":"${name}","arguments":{...}} when this tool is not directly exposed.`
  };
}

export const DEFAULT_SAFE_ACTIONS = Object.freeze([
  "list", "tree", "read", "readLines", "readManyLines", "read64",
  "bulk", "rg", "grep", "find", "selectString", "bulkSearch",
  "fileHashes", "connectedFiles", "aiContextPack", "simulateRuntime",
  "nodeCheckFiles", "nodeCheckFile", "command", "write", "bulkWrite", "mkdirp"
]);

function genericActionParameters() {
  return {
    type: "object",
    additionalProperties: true,
    properties: {
      action: { type: "string", description: "Optional action override." },
      path: { type: "string", description: "File or workspace path." },
      p: { type: "string", description: "Short path alias." },
      query: { type: "string", description: "Search or command query." },
      content: { type: "string", description: "Complete file content." },
      command: { type: "string", description: "Shell command when using command-like actions." },
      names: { type: "array", items: { type: "string" }, description: "Names for catalog/detail tools." }
    }
  };
}

function unique(values = []) {
  return [...new Set(values.filter(Boolean).map(String))];
}

function compactNames(names = []) {
  const uniqueNames = unique(names);
  const head = uniqueNames.slice(0, 90).join(", ");
  const suffix = uniqueNames.length > 90 ? ` … plus ${uniqueNames.length - 90} more` : "";
  return `${head}${suffix}`;
}
