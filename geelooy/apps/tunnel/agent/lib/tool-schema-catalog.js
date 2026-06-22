// B"H

/**
 * B"H
 * Chapter 423: The Catalog Taught The Trees To Speak Plainly.
 *
 * The Awtsmoos does not hide structure behind one brittle field. AI delegates,
 * command trees, action batches, workflows, and ordinary file tools all receive
 * schemas that advertise the carriers they can actually understand.
 */
function buildToolCatalog({ config = {}, fsActionNames = [], commandActionNames = [], chromeActionNames = [], relayActionNames = [], agentVersion = "unknown" } = {}) {
  const groups = { fs: unique(fsActionNames), command: unique(commandActionNames), chrome: unique(chromeActionNames), relay: unique(relayActionNames) };
  const tools = Object.entries(groups).flatMap(([kind, names]) => names.map(name => toolFor(kind, name)));
  const schemas = Object.fromEntries(tools.map(tool => [tool.name, tool.parameters]));
  return { ok: true, kind: "awtsmoos-tool-catalog", version: agentVersion, tunnelName: config.tunnelName || null, root: config.root || null, actions: groups, names: tools.map(tool => tool.name), tools, schemas, yaml: renderToolCatalogYaml({ version: agentVersion, actions: groups, tools }) };
}

function toolFor(kind, name) {
  const parameters = schemaFor(kind, name);
  const description = descriptionFor(kind, name);
  return { type: "function", kind, name, description, parameters, function: { name, description, parameters } };
}

function schemaFor(kind, name) {
  if (kind === "command") return commandSchema(name);
  if (kind === "chrome") return chromeSchema(name);
  if (kind === "relay") return relaySchema(name);
  return fsSchema(name);
}

function fsSchema(name) {
  if (/^(agent|aiAgent)/i.test(name)) return aiAgentSchema(name);
  if (isBatchAction(name)) return batchSchema(name);
  if (/^(writeImage|imageWrite|uploadImage)$/i.test(name)) return imageWriteSchema();
  if (name === "write" || name === "writeIfHash") return objectSchema({ path: string("Repo-relative file path."), p: string("Path alias."), content: string("Complete full file content."), expectedHash: string("Optional hash guard."), timeoutMs: integer("Timeout in milliseconds.") }, ["content"]);
  if (/bulkWrite/i.test(name)) return objectSchema({ writes: array(fileWriteSpec()), files: object("Map of path to content."), content: string("JSON/XML carrier containing writes."), params: object("Object carrier containing writes/files."), body: string("JSON/XML carrier alias."), query: string("JSON carrier alias."), goal: string("JSON carrier alias."), timeoutMs: integer("Timeout in milliseconds.") });
  if (/readManyLines/i.test(name)) return objectSchema({ ranges: array(objectSchema({ path: string("Repo-relative file path."), p: string("Path alias."), startLine: integer("First line."), endLine: integer("Last line.") })), content: string("JSON carrier containing ranges."), params: object("Object carrier."), maxChars: integer("Maximum returned characters.") }, ["ranges"]);
  if (/read64/i.test(name)) return pathSchema({ offsetBytes: integer("Start byte offset."), maxBytes: integer("Maximum bytes to read.") });
  if (/readLines/i.test(name)) return pathSchema({ startLine: integer("First line."), endLine: integer("Last line."), maxChars: integer("Maximum returned characters.") });
  if (/^(bulk|read|stat|textStats|fileHashes|nodeCheckFile|connectedFiles)$/i.test(name)) return pathSchema({ paths: string("Newline-separated paths or JSON array."), files: string("Newline-separated paths or JSON array."), maxFiles: integer("Maximum files per page."), pageSize: integer("Files per page."), cursor: integer("Pagination cursor."), maxDepth: integer("Directory expansion depth."), maxChars: integer("Maximum chars per file."), totalMaxChars: integer("Maximum chars in page."), timeoutMs: integer("Timeout in milliseconds.") });
  if (/list|tree|findFiles|largeFiles|rootBrowse/i.test(name)) return pathSchema({ depth: integer("Tree depth."), limit: integer("Maximum entries."), maxChars: integer("Maximum returned characters."), query: string("Optional search query.") });
  if (/rg|grep|selectString|bulkSearch|find/i.test(name)) return objectSchema({ p: string("Repo-relative root/path."), path: string("Repo-relative root/path."), query: string("Search query."), pattern: string("Search pattern."), regex: bool("Treat pattern as regex."), maxResults: integer("Maximum matches."), maxFiles: integer("Maximum files to scan."), maxChars: integer("Maximum returned characters.") });
  if (/command|Runner|test|lint|typecheck|build/i.test(name)) return objectSchema({ p: string("Repo-relative path."), cwd: string("Repo-relative cwd."), command: string("Command to run."), timeoutMs: integer("Timeout in milliseconds."), maxChars: integer("Maximum returned characters.") });
  if (/http/i.test(name)) return objectSchema({ url: string("URL to request."), method: string("HTTP method."), headers: string("JSON/text headers."), body: string("Request body."), timeoutMs: integer("Timeout."), maxChars: integer("Maximum returned characters.") });
  return commonSchema();
}

function isBatchAction(name) {
  return /^(actionBatch|commandBatch|aiCommandBatch|testMatrix|parallelActionBatch|forEachActionBatch|retryAction|assertAction|policyGuard|destructiveIntentGate|snapshotBeforeAfter|awtsmoosCommandTree|merkavaCommandTree|aiWorkflowLang|commandTree|workflowRun|workflowValidate)/i.test(name);
}

function batchSchema(name) {
  return objectSchema({
    action: string(`Action name, e.g. ${name}.`),
    steps: array(stepSchema()),
    actions: array(stepSchema()),
    workflow: object("Workflow object, array, or JSON string."),
    commandTree: object("Command tree object, array, or JSON string."),
    tree: object("Tree object, array, or JSON string."),
    do: array(stepSchema()),
    content: string("JSON carrier: array of steps or object with steps/actions/workflow/commandTree/tree/do."),
    params: object("Object carrier with steps/actions/workflow/commandTree/tree/do."),
    body: string("JSON carrier alias."),
    query: string("JSON carrier alias."),
    goal: string("JSON carrier alias."),
    actionsJson: string("JSON array/object carrier."),
    workflow64: string("Base64 JSON workflow carrier."),
    steps64: string("Base64 JSON steps carrier."),
    dryRun: bool("Return plan without executing."),
    validateOnly: bool("Validate and return plan."),
    stopOnError: bool("Stop on first failed step; default true."),
    maxSteps: integer("Safety cap for total steps."),
    maxInlineBytes: integer("Compaction threshold."),
    vars: object("Variables available as $vars.name."),
    policy: object("Execution policy options.")
  });
}

function stepSchema() {
  return objectSchema({ action: string("Tunnel action to call."), type: string("Action alias."), call: string("Action alias."), payload: object("Payload for child action."), with: object("Payload alias."), saveAs: string("Save result under named key."), id: string("Step id."), if: object("Condition."), then: array(object("Steps.")), else: array(object("Steps.")), do: array(object("Nested steps.")), parallel: array(object("Parallel branches.")), forEach: object("Loop spec."), retry: object("Retry spec."), retries: integer("Retry count."), assert: object("Assertion condition."), onError: array(object("Error recovery steps.")) });
}

function aiAgentSchema(name) {
  return objectSchema({ mode: string(name === "agent" ? "list, message, config, setKey, removeKey, spawn, novel, status, result, or tasks." : "Optional mode alias."), provider: string("AI provider id: minimax, openrouter, groq."), providerId: string("Provider alias."), agent: string("Agent id alias."), agentId: string("Agent id, e.g. minimax-deep."), model: string("Provider model override."), message: string("User message/prompt."), prompt: string("Prompt alias."), system: string("System instruction override."), messages: array(objectSchema({ role: string("system, user, assistant."), content: string("Message content.") })), stream: bool("Use streaming."), taskId: string("Task id."), title: string("Task title."), kind: string("Task kind."), outputDir: string("Output directory."), fileName: string("Output file name."), maxDepth: integer("Max child depth."), maxChildrenPerTask: integer("Max children."), maxTotalTasks: integer("Max total tasks."), pollIntervalMs: integer("Polling interval."), promotionCycles: integer("Generic task cycles."), providerTimeoutMs: integer("Provider timeout."), allowRecursiveSpawn: bool("Allow child spawning."), content: string("Plain prompt or JSON carrier."), params: object("Object carrier."), body: string("JSON carrier alias."), query: string("JSON/prompt carrier alias."), goal: string("JSON/prompt carrier alias.") });
}

function relaySchema(name) {
  if (/json|jason/i.test(name)) return objectSchema({ url: string("HTTP/S JSON URL."), href: string("URL alias."), method: string("HTTP method."), headers: object("Request headers."), body: object("JSON body or string body."), options: object("Fetch-style options."), timeoutMs: integer("Timeout in milliseconds.") }, ["url"]);
  if (/Body/i.test(name)) return objectSchema({ id: string("Relay stream id."), bodyAction: string("read, resume, text, json, or blob."), cursor: integer("Chunk cursor.") }, ["id", "bodyAction"]);
  if (/Fetch/i.test(name)) return objectSchema({ url: string("ChatGPT URL."), href: string("URL alias."), method: string("HTTP method."), headers: object("Request headers."), body: string("Request body."), options: object("Fetch-style options.") }, ["url"]);
  return objectSchema({ action: string("Relay action."), relayAction: string("Relay action alias."), timeoutMs: integer("Timeout in milliseconds.") });
}

function imageWriteSchema() { return objectSchema({ path: string("Destination path."), p: string("Path alias."), fileName: string("Safe filename."), directory: string("Directory."), imageBase64: string("Raw base64 image bytes."), content64: string("Base64 alias."), dataUrl: string("data:image/... payload."), mime: string("Image MIME type."), format: string("png, jpg, jpeg, webp, gif."), maxBytes: integer("Maximum decoded bytes."), timeoutMs: integer("Timeout.") }); }
function fileWriteSpec() { return objectSchema({ path: string("Repo-relative file path."), p: string("Path alias."), content: string("Complete file content."), text: string("Content alias.") }); }
function commandSchema(name) { if (/nodeCheck/.test(name)) return objectSchema({ path: string("Path."), p: string("Path alias."), paths: string("Newline-separated paths."), timeoutMs: integer("Timeout."), maxChars: integer("Maximum returned characters.") }); if (/Wait|Status|Output|Cancel|job/i.test(name)) return objectSchema({ jobId: string("Command job id."), id: string("Job id alias."), waitTimeoutMs: integer("Maximum wait time."), pollIntervalMs: integer("Polling interval."), stream: string("stdout or stderr."), offsetChars: integer("Output cursor."), maxChars: integer("Maximum returned characters."), inlineOutput: bool("Include first output page in commandWait.") }, /Wait|Status|Output|Cancel/i.test(name) ? ["jobId"] : []); return objectSchema({ command: string("Shell command."), commands: string("Command alias."), cwd: string("Repo-relative cwd."), timeoutMs: integer("Timeout."), maxChars: integer("Maximum returned characters."), shell: string("Optional shell override."), sync: bool("Opt into blocking inline execution."), inline: bool("Opt into blocking inline execution.") }, /command|shell|runCommand/.test(name) ? ["command"] : []); }
function chromeSchema(name) { if (/Doctor|Trace|Inspect/i.test(name)) return objectSchema({ url: string("URL to open before diagnostics."), selector: string("Optional selector assertion."), screenshot: bool("Save screenshot."), accessibility: bool("Collect accessibility summary."), failedOnly: bool("Only failed network events."), assertNoConsoleErrors: bool("Fail on console/network errors."), timeoutMs: integer("Timeout."), maxLogs: integer("Maximum console/network logs."), maxChars: integer("Maximum returned characters.") }); if (/Navigate|TestUrl/i.test(name)) return objectSchema({ url: string("URL to open."), timeoutMs: integer("Timeout."), waitUntil: string("Load condition."), maxChars: integer("Maximum returned characters.") }, ["url"]); if (/Eval|RunScript/i.test(name)) return objectSchema({ expression: string("JavaScript expression."), script: string("JavaScript script."), timeoutMs: integer("Timeout."), maxChars: integer("Maximum returned characters.") }); return objectSchema({ port: integer("Chrome debugging port."), url: string("URL."), selector: string("CSS selector."), text: string("Text."), timeoutMs: integer("Timeout."), maxChars: integer("Maximum returned characters."), format: string("Output format.") }); }
function commonSchema() { return objectSchema({ p: string("Repo-relative path."), path: string("Repo-relative path."), query: string("Query/search text."), content: string("Complete content or JSON carrier."), params: object("Object carrier."), command: string("Command."), timeoutMs: integer("Timeout."), maxChars: integer("Maximum returned characters."), totalMaxChars: integer("Maximum total returned characters.") }); }
function pathSchema(extra = {}) { return objectSchema({ path: string("Repo-relative file/path."), p: string("Path alias."), ...extra }); }
function objectSchema(properties = {}, required = []) { return { type: "object", additionalProperties: true, required, properties }; }
function string(description) { return { type: "string", description }; }
function integer(description) { return { type: "integer", description }; }
function bool(description) { return { type: "boolean", description }; }
function object(description) { return { type: "object", description, additionalProperties: true }; }
function array(items) { return { type: "array", items }; }

function descriptionFor(kind, name) {
  const base = `Run Awtsmoos ${kind} action ${name}.`;
  if (/^(agent|aiAgent)/i.test(name)) return `${base} AI delegate action; accepts top-level fields and JSON in content/params/body/query/goal.`;
  if (isBatchAction(name)) return `${base} Command-tree/action-batch action; accepts native steps or JSON in content/params/actionsJson/workflow64.`;
  if (/bulkWrite/i.test(name)) return `${base} Bulk complete-file write; accepts writes/files or JSON/XML in content/params/body/query/goal.`;
  if (/^(writeImage|imageWrite|uploadImage)$/i.test(name)) return `${base} Writes generated image from base64/dataUrl.`;
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
