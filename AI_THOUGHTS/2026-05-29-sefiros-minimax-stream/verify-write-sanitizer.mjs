//B"H
import { sanitizeToolArguments } from "../../geelooy/ai/central/toolArgumentSanitizer.js";
import { BrowserLocalTunnelBridge } from "../../geelooy/ai/central/browserLocalTunnelBridge.js";

const bad = '```js\nclass Projector {\n  static camY() {\n    const targetY = 1;\n<Author: anonymous\n    return targetY;\n  }\n}\n```';
const direct = sanitizeToolArguments("write", { p: "Projector.js", content: bad });
console.log(JSON.stringify(direct, null, 2));
if (/Author: anonymous/.test(direct.args.content)) throw new Error("devtools ghost survived direct sanitizer");
if (/```/.test(direct.args.content)) throw new Error("markdown fence survived direct sanitizer");
if (!direct.warnings.length) throw new Error("sanitizer did not report warnings");

const sent = [];
const fetchImpl = async (url, init = {}) => {
  if (url.endsWith("/actions")) return { ok: true, json: async () => ({ actions: ["write"] }) };
  if (url.endsWith("/tool")) {
    const body = JSON.parse(init.body);
    sent.push(body);
    return { ok: true, json: async () => ({ ok: true, action: body.name }) };
  }
  throw new Error(url);
};
const bridge = await new BrowserLocalTunnelBridge({ fetchImpl }).init();
const result = await bridge.call("write", { p: "Projector.js", content: bad });
console.log(JSON.stringify({ sent, result }, null, 2));
if (/Author: anonymous|```/.test(sent[0].arguments.content)) throw new Error("bridge sent poisoned content");
if (!result.awtsmoosSanitizerWarnings?.length) throw new Error("bridge omitted sanitizer warning");
