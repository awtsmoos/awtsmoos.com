// B"H
export const AwtsmoosNativeToolExtras = [
  tool("astOutline", "Return imports, exports, variables, functions/classes/arrow symbols, comments, and edit ranges for one file.", { path: str("File path") }, ["path"]),
  tool("replaceFunction", "Replace an entire function/class/arrow symbol by name using AST-like balanced ranges.", { path: str("File path"), name: str("Function or symbol name"), content: str("Complete replacement code") }, ["path", "name", "content"]),
  tool("replaceFunctionBody", "Replace only the body of a named function/class/arrow symbol.", { path: str("File path"), name: str("Function or symbol name"), body: str("New body code") }, ["path", "name", "body"]),
  tool("insertBeforeFunction", "Insert code immediately before a named function/class/arrow symbol.", { path: str("File path"), name: str("Function or symbol name"), content: str("Code to insert") }, ["path", "name", "content"]),
  tool("insertAfterFunction", "Insert code immediately after a named function/class/arrow symbol.", { path: str("File path"), name: str("Function or symbol name"), content: str("Code to insert") }, ["path", "name", "content"]),
  tool("testMatrix", "Run several native actions as a matrix and summarize pass/fail.", { cases: arr("Action cases"), stopOnFail: bool("Stop at first failure") }),
  tool("bundleTrace", "Trace dependency/bundle reachability from an entry file.", { path: str("Entry path"), depth: num("Max depth") }, ["path"]),
  tool("dependencyCycleCheck", "Detect cycles in dependency graph edges.", { path: str("Entry path") }, ["path"]),
  tool("deadExportScan", "Find exported names that appear unused by a conservative scan.", { path: str("File path") }, ["path"]),
  tool("mutationPatchTest", "Apply a patch and run a follow-up test action as one mutation test vessel.", { path: str("File path"), patches: arr("Patch objects"), test: obj("Follow-up action") }),
  tool("browserReplay", "Replay browser interactions through simulateRuntime in browser mode.", { entry: str("HTML entry"), files64: str("Base64 JSON file map"), interactions64: str("Base64 JSON interactions") }),
  tool("apiContractCheck", "Validate an OpenAPI/API contract for required surface conventions.", { path: str("Contract path"), getOnly: bool("Require no POST methods") }, ["path"]),
  tool("perfBudgetCheck", "Run a native action and fail if it exceeds a duration budget.", { budgetMs: num("Budget in ms"), test: obj("Native action to run") }),
  tool("simulateRuntime", "Run arbitrary virtual JavaScript/HTML/CSS files in browser or node mode.", { runtime: str("browser or node"), entry: str("Entry file"), files64: str("Base64 JSON file map"), interactions64: str("Base64 interactions"), probes64: str("Base64 probes") })
];

function tool(name, description, properties = {}, required = []) {
  return { function: { name, description, parameters: { type: "object", properties, required } } };
}
function str(description) { return { type: "string", description }; }
function num(description) { return { type: "number", description }; }
function bool(description) { return { type: "boolean", description }; }
function arr(description) { return { type: "array", description, items: { type: "object" } }; }
function obj(description) { return { type: "object", description }; }
