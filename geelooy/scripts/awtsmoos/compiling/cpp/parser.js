// B"H
import { tokenizeCpp } from "./lexer.js";
import { CppTokenStream } from "./tokenStream.js";

const TYPE_START = new Set(["int", "char", "void"]);
const ACCESS = new Set(["public", "private", "protected"]);

/**
 * B"H
 * Parses a focused C++ syntax tree.
 *
 * Chapter 3: classes rise like chambers, methods like doors, statements like
 * footsteps. This is intentionally strict: the AST is honest about the subset it
 * can carry into the Windows x64 C bridge.
 *
 * @param {string} source C++ source.
 * @returns {object} Program AST.
 */
export function parseCpp(source = "") {
  const stream = new CppTokenStream(tokenizeCpp(source));
  const program = { type: "CppProgram", imports: [], namespaces: [], classes: [], functions: [] };
  while (stream.peek().type !== "eof") {
    if (stream.peek().value === "import") program.imports.push(...parseImport(stream));
    else if (stream.peek().value === "namespace") program.namespaces.push(parseNamespace(stream));
    else if (stream.peek().value === "class" || stream.peek().value === "struct") program.classes.push(parseClass(stream));
    else program.functions.push(parseFunction(stream));
  }
  return program;
}

function parseImport(stream) {
  stream.expectValue("import");
  const dll = stream.expectType("string").value;
  const funcs = [];
  while (stream.peek().type === "id") funcs.push(stream.consume().value);
  stream.expectValue(";");
  return funcs.map(func => ({ dll, func }));
}

function parseNamespace(stream) {
  stream.expectValue("namespace");
  const name = stream.expectType("id").value;
  stream.expectValue("{");
  const body = [];
  while (!stream.match("}")) body.push(stream.peek().value === "class" ? parseClass(stream) : parseFunction(stream));
  return { type: "Namespace", name, body };
}

function parseClass(stream) {
  const kind = stream.consume().value;
  const name = stream.expectType("id").value;
  stream.expectValue("{");
  const members = [];
  let access = kind === "struct" ? "public" : "private";
  while (!stream.match("}")) {
    if (ACCESS.has(stream.peek().value) && stream.peek(1).value === ":") { access = stream.consume().value; stream.consume(); continue; }
    members.push({ access, ...parseFunction(stream, name) });
  }
  stream.expectValue(";");
  return { type: "Class", kind, name, members };
}

function parseFunction(stream, owner = null) {
  const returnType = parseType(stream);
  const name = stream.expectType("id").value;
  stream.expectValue("(");
  const params = [];
  while (!stream.match(")")) {
    const paramType = parseType(stream);
    const paramName = stream.expectType("id").value;
    params.push({ type: paramType, name: paramName });
    stream.match(",");
  }
  return { type: "Function", owner, returnType, name, params, body: parseBlock(stream) };
}

function parseType(stream) {
  const token = stream.consume();
  if (token.type !== "keyword" && token.type !== "id") stream.error("Expected type");
  if (!TYPE_START.has(token.value) && token.type !== "id") stream.error("Unsupported C++ type " + token.value);
  let pointer = 0;
  while (stream.match("*")) pointer++;
  return { name: token.value, pointer };
}

function parseBlock(stream) {
  stream.expectValue("{");
  const statements = [];
  while (!stream.match("}")) statements.push(parseStatement(stream));
  return { type: "Block", statements };
}

function parseStatement(stream) {
  if (stream.peek().value === "return") { stream.consume(); const expression = readUntil(stream, ";"); return { type: "Return", expression }; }
  if (TYPE_START.has(stream.peek().value)) {
    const varType = parseType(stream);
    const name = stream.expectType("id").value;
    const init = stream.match("=") ? readUntil(stream, ";") : "";
    return { type: "Declaration", varType, name, init };
  }
  return { type: "Expression", expression: readUntil(stream, ";") };
}

function readUntil(stream, end) {
  const parts = [];
  let depth = 0;
  while (stream.peek().type !== "eof") {
    const value = stream.peek().value;
    if (value === end && depth === 0) { stream.consume(); break; }
    if (value === "(") depth++;
    if (value === ")") depth--;
    parts.push(stream.consume().value);
  }
  return parts.join(" ").replace(/\s+([(),;])/g, "$1").replace(/([([])\s+/g, "$1");
}
