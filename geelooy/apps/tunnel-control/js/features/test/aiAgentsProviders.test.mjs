// B"H
import assert from "assert";

global.localStorage = { getItem() { return null; }, setItem() {} };
global.document = { getElementById() { return null; }, createElement(tag) { return { tag, children: [], classList: { add() {} }, append(...x) { this.children.push(...x); }, setAttribute() {} }; }, createTextNode(text) { return { textContent: String(text) }; } };
global.Node = function Node() {};

const { AI_PROVIDER_OPTIONS } = await import("../aiAgents.js");
const values = AI_PROVIDER_OPTIONS.map(x => x.value);
assert.deepStrictEqual(values, ["openrouter", "minimax", "deepseek", "groq"]);
assert.strictEqual(AI_PROVIDER_OPTIONS.find(x => x.value === "deepseek").text, "DeepSeek");
console.log("BHY tunnel-control AI provider options tests passed");
