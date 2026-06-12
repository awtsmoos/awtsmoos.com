// B"H

/**
 * Chapter 7: The Catalog Crown Accepted An Image River.
 *
 * The tunnel catalog names every callable gate: fs, command, Chrome, relay, and
 * now generated-image writing. The Awtsmoos breathes through one schema crown,
 * so YAML, localhost tools, and hosted callers all see the same doors.
 *
 * @param {object} input Live action names grouped by execution family.
 * @returns {object} JSON/YAML catalog of callable tunnel tools.
 */
function buildToolCatalog({ config = {}, fsActionNames = [], commandActionNames = [], chromeActionNames = [], relayActionNames = [], agentVersion = "unknown" } = {}) {
  const groups = {
    fs: unique(fsActionNames),
    command: unique(commandActionNames),
    chrome: unique(chromeActionNames),
    relay: unique(relayActionNames)
  };
  const tools = Object.entries(groups).flatMap(([kind, names]) => names.map(name => toolFor(kind, name)));
  const schemas = Object.fromEntries(tools.map(tool => [tool.name, tool.parameters]));
  return { ok: true, kind: "awtsmoos-tool-catalog", version: agentVersion, tunnelName: config.tunnelName || null, root: config.root || null, actions: groups, names: tools.map(tool => tool.name), tools, schemas, yaml: renderToolCatalogYaml({ version: agentVersion, actions: groups, tools }) };
}

function toolFor(kind, name) {
  const parameters = schemaFor(kind, name);
  return { type: "function", kind, name, description: descriptionFor(kind, name), parameters, function: { name, description: descriptionFor(kind, name), parameters } };
}

function schemaFor(kind, name) {
  if (kind === "command") return commandSchema(name);
  if (kind === "chrome") return chromeSchema(name);
  if (kind === "relay") return relaySchema(name);
  return fsSchema(name);
}

function relaySchema(name) {
  if (/json|jason/i.test(name)) return objectSchema({ url: string("HTTP/S JSON URL."), href: string("URL alias."), method: string("HTTP method."), headers: object("Request headers."), body: object("JSON body or string body."), options: object("Fetch-style options."), timeoutMs: integer("Timeout in milliseconds.") }, ["url"]);
  if (/Body/i.test(name)) return objectSchema({ id: string("Relay stream id."), bodyAction: string("read, resume, text, json, or blob."), cursor: integer("Chunk cursor.") }, ["id", "bodyAction"]);
  if (/Fetch/i.test(name)) return objectSchema({ url: string("ChatGPT URL."), href: string("URL alias."), method: string("HTTP method."), headers: object("Request headers."), body: string("Request body."), options: object("Fetch-style options.") }, ["url"]);
  return objectSchema({ action: string("Relay action."), relayAction: string("Relay action alias."), timeoutMs: integer("Timeout in milliseconds.") });
}

function fsSchema(name) {
  if (/^(writeImage|imageWrite|uploadImage)$/i.test(name)) return imageWriteSchema();
  if (name === "write" || name === "writeIfHash") return objectSchema({ path: string("Repo-relative file path."), p: string("Repo-relative file path alias."), content: string("Complete full file content."), expectedHash: string("Optional hash guard."), timeoutMs: integer("Timeout in milliseconds.") }, ["content"]);
  if (/bulkWrite/i.test(name)) return objectSchema({ writes: array(objectSchema({ path: string("Repo-relative file path."), p: string("Repo-relative file path alias."), content: string("Complete full file content.") })), timeoutMs: integer("Timeout in milliseconds.") }, ["writes"]);
  if (/readManyLines/i.test(name)) return objectSchema({ ranges: array(objectSchema({ path: string("Repo-relative file path."), p: string("Repo-relative file path alias."), startLine: integer("First line."), endLine: integer("Last line.") })), maxChars: integer("Maximum returned characters.") }, ["ranges"]);
  if (/read64/i.test(name)) return pathSchema({ offsetBytes: integer("Start byte offset."), maxBytes: integer("Maximum bytes to read.") });
  if (/readLines/i.test(name)) return pathSchema({ startLine: integer("First line."), endLine: integer("Last line."), maxChars: integer("Maximum returned characters.") });
  if (/read|stat|textStats|fileHashes|nodeCheckFile/i.test(name)) return pathSchema({ maxChars: integer("Maximum returned characters."), timeoutMs: integer("Timeout in milliseconds.") });
  if (/list|tree|findFiles|largeFiles|rootBrowse/i.test(name)) return pathSchema({ depth: integer("Tree depth."), limit: integer("Maximum entries."), maxChars: integer("Maximum returned characters."), query: string("Optional search query.") });
  if (/rg|grep|selectString|bulkSearch|find/i.test(name)) return objectSchema({ p: string("Repo-relative root/path."), path: string("Repo-relative root/path."), query: string("Search query."), pattern: string("Search pattern."), regex: bool("Treat pattern as regex."), maxResults: integer("Maximum matches."), maxFiles: integer("Maximum files to scan."), maxChars: integer("Maximum returned characters.") });
  if (/command|Runner|test|lint|typecheck|build/i.test(name)) return objectSchema({ p: string("Repo-relative path."), cwd: string("Repo-relative cwd."), command: string("Command to run."), timeoutMs: integer("Timeout in milliseconds."), maxChars: integer("Maximum returned characters.") });
  if (/http/i.test(name)) return objectSchema({ url: string("URL to request."), method: string("HTTP method."), headers: string("JSON/text headers."), body: string("Request body."), timeoutMs: integer("Timeout."), maxChars: integer("Maximum returned characters.") });
  return commonSchema();
}

function imageWriteSchema() {
  return objectSchema({ path: string("Repo-relative destination path. Extension is normalized to image type."), p: string("Path alias."), fileName: string("Safe filename when path is omitted."), directory: string("Repo-relative directory when path is omitted."), imageBase64: string("Raw base64 image bytes."), content64: string("Base64 alias."), dataUrl: string("data:image/...;base64,... payload."), mime: string("Image MIME type when raw base64 is used."), format: string("png, jpg, jpeg, webp, or gif."), publicBaseUrl: string("Optional public serving base URL used to build publicUrl."), localBaseUrl: string("Optional local serving base URL used to build localUrl."), maxBytes: integer("Maximum accepted decoded bytes."), timeoutMs: integer("Timeout in milliseconds.") });
}

function commandSchema(name) {
  if (/nodeCheck/.test(name)) return objectSchema({ path: string("Repo-relative file/directory."), p: string("Path alias."), paths: string("Newline-separated paths."), timeoutMs: integer("Timeout."), maxChars: integer("Maximum returned characters.") });
  return objectSchema({ command: string("Shell command to run."), cwd: string("Repo-relative cwd."), timeoutMs: integer("Timeout."), maxChars: integer("Maximum returned characters."), shell: string("Optional shell override.") }, /command|shell|runCommand/.test(name) ? ["command"] : []);
}

function chromeSchema(name) {
  if (/Navigate|TestUrl/i.test(name)) return objectSchema({ url: string("URL to open."), timeoutMs: integer("Timeout."), waitUntil: string("Load condition."), maxChars: integer("Maximum returned characters.") }, ["url"]);
  if (/Eval|RunScript/i.test(name)) return objectSchema({ expression: string("JavaScript expression."), script: string("JavaScript script."), timeoutMs: integer("Timeout."), maxChars: integer("Maximum returned characters.") });
  return objectSchema({ port: integer("Chrome debugging port."), url: string("URL when relevant."), selector: string("CSS selector."), text: string("Text."), timeoutMs: integer("Timeout."), maxChars: integer("Maximum returned characters."), format: string("Output format.") });
}

function commonSchema() { return objectSchema({ p: string("Repo-relative path."), path: string("Repo-relative path."), query: string("Query/search text."), content: string("Complete content."), command: string("Command."), timeoutMs: integer("Timeout."), maxChars: integer("Maximum returned characters."), totalMaxChars: integer("Maximum total returned characters.") }); }
function pathSchema(extra = {}) { return objectSchema({ path: string("Repo-relative file/path."), p: string("Path alias."), ...extra }); }
function objectSchema(properties = {}, required = []) { return { type: "object", additionalProperties: true, required, properties }; }
function string(description) { return { type: "string", description }; }
function integer(description) { return { type: "integer", description }; }
function bool(description) { return { type: "boolean", description }; }
function object(description) { return { type: "object", description, additionalProperties: true }; }
function array(items) { return { type: "array", items }; }

function descriptionFor(kind, name) {
  const base = `Run Awtsmoos ${kind} action ${name}.`;
  if (/^(writeImage|imageWrite|uploadImage)$/i.test(name)) return `${base} Writes a complete generated image from base64/dataUrl and returns path plus optional publicUrl.`;
  if (kind === "relay") return `${base} ChatGPT relay actions use browser cookies; JSON/Jason relay is separate.`;
  if (/write/i.test(name)) return `${base} Send complete file content only; never a partial patch.`;
  if (kind === "chrome") return `${base} Uses the authorized local Chrome/DevTools bridge.`;
  return base;
}

function renderToolCatalogYaml({ version, actions, tools }) {
  const lines = ["BH: B\\\"H", `version: ${yamlValue(version)}`, "actions:"];
  for (const [kind, names] of Object.entries(actions || {})) { lines.push(`  ${kind}:`); for (const name of names) lines.push(`    - ${yamlValue(name)}`); }
  lines.push("tools:");
  for (const tool of tools || []) { lines.push(`  - name: ${yamlValue(tool.name)}`); lines.push(`    kind: ${yamlValue(tool.kind)}`); lines.push(`    description: ${yamlValue(tool.description)}`); lines.push("    parameters:"); lines.push(...yamlSchema(tool.parameters, 6)); }
  return lines.join("\n") + "\n";
}

function yamlSchema(schema = {}, indent = 0) {
  const pad = " ".repeat(indent);
  const lines = [`${pad}type: ${yamlValue(schema.type || "object")}`, `${pad}additionalProperties: ${schema.additionalProperties !== false}`];
  if (schema.required?.length) { lines.push(`${pad}required:`); schema.required.forEach(item => lines.push(`${pad}  - ${yamlValue(item)}`)); }
  lines.push(`${pad}properties:`);
  for (const [key, prop] of Object.entries(schema.properties || {})) { lines.push(`${pad}  ${key}:`); lines.push(`${pad}    type: ${yamlValue(prop.type || "string")}`); if (prop.description) lines.push(`${pad}    description: ${yamlValue(prop.description)}`); if (prop.items) lines.push(`${pad}    items: ${yamlValue(prop.items.type || "object")}`); }
  return lines;
}

function yamlValue(value) { return JSON.stringify(String(value ?? "")); }
function unique(values = []) { return [...new Set(values.filter(Boolean).map(String))]; }

module.exports = { buildToolCatalog, renderToolCatalogYaml };
