// B"H

/**
 * B"H
 * Chapter 1: One Registry Became JSON, YAML, And Tool Breath.
 *
 * The local tunnel has many action rivers: fs, command, and Chrome. This module
 * gathers their names from the same live maps used by execution, then generates
 * the JSON schema catalog and the YAML manifest from that one source. No second
 * hand-written YAML shadow is allowed to drift away from the tools.
 */
function buildToolCatalog({ config = {}, fsActionNames = [], commandActionNames = [], chromeActionNames = [], agentVersion = "unknown" } = {}) {
  const groups = {
    fs: unique(fsActionNames),
    command: unique(commandActionNames),
    chrome: unique(chromeActionNames)
  };
  const tools = Object.entries(groups).flatMap(([kind, names]) => names.map(name => toolFor(kind, name)));
  const schemas = Object.fromEntries(tools.map(tool => [tool.name, tool.parameters]));
  return {
    ok: true,
    kind: "awtsmoos-tool-catalog",
    version: agentVersion,
    tunnelName: config.tunnelName || null,
    root: config.root || null,
    actions: groups,
    names: tools.map(tool => tool.name),
    tools,
    schemas,
    yaml: renderToolCatalogYaml({ version: agentVersion, actions: groups, tools })
  };
}

function toolFor(kind, name) {
  const parameters = schemaFor(kind, name);
  return {
    type: "function",
    kind,
    name,
    description: descriptionFor(kind, name),
    parameters,
    function: { name, description: descriptionFor(kind, name), parameters }
  };
}

function schemaFor(kind, name) {
  if (kind === "command") return commandSchema(name);
  if (kind === "chrome") return chromeSchema(name);
  return fsSchema(name);
}

function fsSchema(name) {
  if (name === "write" || name === "writeIfHash") return objectSchema({ path: string("Repo-relative file path."), p: string("Repo-relative file path alias."), content: string("Complete full file content."), expectedHash: string("Optional hash guard for conditional writes."), timeoutMs: integer("Timeout in milliseconds.") }, ["content"]);
  if (/bulkWrite/i.test(name)) return objectSchema({ writes: array(objectSchema({ path: string("Repo-relative file path."), p: string("Repo-relative file path alias."), content: string("Complete full file content.") })), timeoutMs: integer("Timeout in milliseconds.") }, ["writes"]);
  if (/readManyLines/i.test(name)) return objectSchema({ ranges: array(objectSchema({ path: string("Repo-relative file path."), p: string("Repo-relative file path alias."), startLine: integer("First line, 1-indexed."), endLine: integer("Last line, inclusive.") })), maxChars: integer("Maximum returned characters.") }, ["ranges"]);
  if (/read64/i.test(name)) return pathSchema({ offsetBytes: integer("Start byte offset."), maxBytes: integer("Maximum bytes to read.") });
  if (/readLines/i.test(name)) return pathSchema({ startLine: integer("First line, 1-indexed."), endLine: integer("Last line, inclusive."), maxChars: integer("Maximum returned characters.") });
  if (/read|stat|textStats|fileHashes|nodeCheckFile/i.test(name)) return pathSchema({ maxChars: integer("Maximum returned characters."), timeoutMs: integer("Timeout in milliseconds.") });
  if (/list|tree|findFiles|largeFiles|rootBrowse/i.test(name)) return pathSchema({ depth: integer("Tree depth."), limit: integer("Maximum entries."), maxChars: integer("Maximum returned characters."), query: string("Optional search query.") });
  if (/rg|grep|selectString|bulkSearch|find/i.test(name)) return objectSchema({ p: string("Repo-relative root/path."), path: string("Repo-relative root/path."), query: string("Search query."), pattern: string("Search pattern."), regex: bool("Treat pattern as regex."), maxResults: integer("Maximum matches."), maxFiles: integer("Maximum files to scan."), maxChars: integer("Maximum returned characters.") });
  if (/command|Runner|test|lint|typecheck|build/i.test(name)) return objectSchema({ p: string("Repo-relative working path."), cwd: string("Repo-relative working directory."), command: string("Command to run."), timeoutMs: integer("Timeout in milliseconds."), maxChars: integer("Maximum returned characters.") });
  if (/http/i.test(name)) return objectSchema({ url: string("URL to request."), method: string("HTTP method."), headers: string("JSON or text headers."), body: string("Request body."), timeoutMs: integer("Timeout in milliseconds."), maxChars: integer("Maximum returned characters.") });
  if (/simulateRuntime|isolated|Runtime|browser/i.test(name)) return objectSchema({ p: string("Repo-relative path."), html: string("HTML source."), scriptText: string("JavaScript source."), runtime: string("Runtime engine."), interactions: string("JSON browser/page interactions."), url: string("URL to load."), params: string("JSON object merged into runtime payload before collection/execution."), params64: string("Base64 JSON object merged into runtime payload before collection/execution."), compactModules: bool("Rewrite same-origin JS URL fetches to append compact=true during simulateRuntime URL collection."), networkRewrite: string("JSON rewrite rule or array for URL collection; supports match/kind/sameOrigin/appendQuery/setQuery/rewriteTo."), networkRewrite64: string("Base64 JSON networkRewrite rules."), timeoutMs: integer("Timeout in milliseconds."), maxChars: integer("Maximum returned characters."), maxFiles: integer("Maximum URL files to collect."), maxBytes: integer("Maximum bytes per fetched URL asset.") });
  return commonSchema();
}

function commandSchema(name) {
  if (/nodeCheck/.test(name)) return objectSchema({ path: string("Repo-relative file or directory."), p: string("Repo-relative file or directory."), paths: string("Newline-separated paths."), timeoutMs: integer("Timeout in milliseconds."), maxChars: integer("Maximum returned characters.") });
  return objectSchema({ command: string("Shell command to run."), cwd: string("Repo-relative working directory."), timeoutMs: integer("Timeout in milliseconds."), maxChars: integer("Maximum returned characters."), shell: string("Optional shell override.") }, /command|shell|runCommand/.test(name) ? ["command"] : []);
}

function chromeSchema(name) {
  if (/Navigate|TestUrl/i.test(name)) return objectSchema({ url: string("URL to open."), timeoutMs: integer("Timeout in milliseconds."), waitUntil: string("Load condition."), maxChars: integer("Maximum returned characters.") }, ["url"]);
  if (/Eval|RunScript/i.test(name)) return objectSchema({ expression: string("JavaScript expression."), script: string("JavaScript script."), timeoutMs: integer("Timeout in milliseconds."), maxChars: integer("Maximum returned characters.") });
  if (/Click|Type|Selector|Storage|Cookie/i.test(name)) return objectSchema({ selector: string("CSS selector."), text: string("Text to type or set."), key: string("Storage/cookie key."), value: string("Storage/cookie value."), url: string("URL scope."), timeoutMs: integer("Timeout in milliseconds."), maxChars: integer("Maximum returned characters.") });
  return objectSchema({ port: integer("Chrome debugging port."), url: string("URL when relevant."), timeoutMs: integer("Timeout in milliseconds."), maxChars: integer("Maximum returned characters."), format: string("Output format.") });
}

function commonSchema() {
  return objectSchema({ p: string("Repo-relative path."), path: string("Repo-relative path."), query: string("Query/search text."), content: string("Complete content when writing."), command: string("Command when running."), timeoutMs: integer("Timeout in milliseconds."), maxChars: integer("Maximum returned characters."), totalMaxChars: integer("Maximum total returned characters.") });
}

function pathSchema(extra = {}) {
  return objectSchema({ path: string("Repo-relative file/path."), p: string("Repo-relative file/path alias."), ...extra });
}

function objectSchema(properties = {}, required = []) {
  return { type: "object", additionalProperties: true, required, properties };
}
function string(description) { return { type: "string", description }; }
function integer(description) { return { type: "integer", description }; }
function bool(description) { return { type: "boolean", description }; }
function array(items) { return { type: "array", items }; }

function descriptionFor(kind, name) {
  const base = `Run Awtsmoos ${kind} action ${name}.`;
  if (/write/i.test(name)) return `${base} Send complete file content only; never a partial patch.`;
  if (/read|list|tree|search|grep|rg/i.test(name)) return `${base} Use repo-relative paths and small targeted reads.`;
  if (/simulateRuntime/i.test(name)) return `${base} Validate runtime/browser behavior from local source, URL, or interactions.`;
  if (kind === "chrome") return `${base} Uses the authorized local Chrome/DevTools bridge.`;
  return base;
}

function renderToolCatalogYaml({ version, actions, tools }) {
  const lines = ["BH: B\\\"H", `version: ${yamlValue(version)}`, "actions:"];
  for (const [kind, names] of Object.entries(actions || {})) {
    lines.push(`  ${kind}:`);
    for (const name of names) lines.push(`    - ${yamlValue(name)}`);
  }
  lines.push("tools:");
  for (const tool of tools || []) {
    lines.push(`  - name: ${yamlValue(tool.name)}`);
    lines.push(`    kind: ${yamlValue(tool.kind)}`);
    lines.push(`    description: ${yamlValue(tool.description)}`);
    lines.push("    parameters:");
    lines.push(...yamlSchema(tool.parameters, 6));
  }
  return lines.join("\n") + "\n";
}

function yamlSchema(schema = {}, indent = 0) {
  const pad = " ".repeat(indent);
  const lines = [`${pad}type: ${yamlValue(schema.type || "object")}`, `${pad}additionalProperties: ${schema.additionalProperties !== false}`];
  if (schema.required?.length) {
    lines.push(`${pad}required:`);
    schema.required.forEach(item => lines.push(`${pad}  - ${yamlValue(item)}`));
  }
  lines.push(`${pad}properties:`);
  for (const [key, prop] of Object.entries(schema.properties || {})) {
    lines.push(`${pad}  ${key}:`);
    lines.push(`${pad}    type: ${yamlValue(prop.type || "string")}`);
    if (prop.description) lines.push(`${pad}    description: ${yamlValue(prop.description)}`);
    if (prop.items) lines.push(`${pad}    items: ${yamlValue(prop.items.type || "object")}`);
  }
  return lines;
}
function yamlValue(value) { return JSON.stringify(String(value ?? "")); }
function unique(values = []) { return [...new Set(values.filter(Boolean).map(String))]; }

module.exports = { buildToolCatalog, renderToolCatalogYaml };

