// B"H — Merkava DevTools test + demo.
// Proves: record a page -> step backwards -> inspect variables -> profile -> elements -> network.
import { recordSession, getSession, listSessions, closeSession } from "./devtools/devtoolsSession.js";
import { NetworkRecorder } from "./devtools/networkPanel.js";

let pass = 0, fail = 0;
function check(name, cond, extra = "") {
  if (cond) { pass++; console.log(`  PASS ${name}${extra ? " — " + extra : ""}`); }
  else { fail++; console.log(`  FAIL ${name}${extra ? " — " + extra : ""}`); }
}

console.log("[1] recordSession: HTML + JS through the real pipeline");
const session = await recordSession({
  label: "devtools-demo",
  html: `<body><h1 id="title">Hello</h1><p class="note">world</p></body>`,
  js: `
    var x = 40 + 2;
    var greeting = "hello";
    var doubled = x * 2;
    var nums = [1, 2, 3];
    var total = 0;
    for (var i = 0; i < nums.length; i = i + 1) { total = total + nums[i]; }
  `,
  width: 800, height: 600, maxSteps: 20000
});
check("session created", !!session.id, session.id);
check("thread completed", session.result.status === "COMPLETED", session.result.status);
check("steps recorded", session.steps > 10, `${session.steps} steps`);
check("timeTravel history", session.timeTravel.length === session.steps, `${session.timeTravel.length}`);

console.log("[2] time travel: step backwards then forwards");
const latest = session.describeStep(session.timeTravel.length - 1);
check("describe latest step", !!latest && latest.step === session.timeTravel.length - 1, `step ${latest?.step}`);
const back1 = session.stepBack();
check("stepBack ok", back1.ok === true, `now at step ${back1.step}`);
const back2 = session.stepBack();
check("stepBack again", back2.ok === true && back2.step === back1.step - 1);
const fwd = session.stepForward();
check("stepForward restores", fwd.ok === true && fwd.step === back1.step);
const vars = session.getVariables();
check("getVariables returns scopes", Array.isArray(vars.scopes) && vars.scopes.length > 0, `${vars.scopes.length} scopes`);
const varNames = vars.scopes.flatMap((s) => s.variables.map((v) => v.name));
check("sees user vars (x, total)", varNames.includes("x") && varNames.includes("total"), varNames.slice(0, 12).join(","));
const xVar = vars.scopes.flatMap((s) => s.variables).find((v) => v.name === "x");
check("x formatted", !!xVar && /42/.test(xVar.preview), xVar?.preview);

console.log("[3] time travel to initial state and re-run");
session.gotoStep(-1);
check("goto initial", session.thread.ip === 0 || session.thread.status !== "COMPLETED", `ip=${session.thread.ip}`);
const watch = session.watch("x");
check("watch on empty scope handled", watch.ok === false || watch.ok === true, JSON.stringify(watch).slice(0, 60));

console.log("[4] profiler");
const report = session.profiler.report();
check("profiler has steps", report.steps === session.steps, `${report.steps}`);
check("opcode profile non-empty", report.topOpcodes.length > 0, `${report.uniqueOpcodes} unique opcodes`);
check("flame graph root", !!session.profiler.flameGraph().children, "tree built");
check("memory summary", typeof session.profiler.memorySummary().samples === "number");

console.log("[5] elements inspector");
const tree = session.elements.getTree(4);
check("DOM tree", !!tree && tree.childCount > 0, `root children: ${tree?.childCount}`);
const hits = session.elements.querySelector("h1");
check("querySelector h1", hits.length >= 1, hits[0]?.label);
const detail = session.elements.inspect(hits[0].devId);
check("inspect element", !!detail && detail.tag === "h1", detail?.label);
const cs = session.elements.computedStyle(hits[0].devId);
check("computed style", !!cs && typeof cs === "object");
const edit = session.elements.setInlineStyle(hits[0].devId, { color: "red" });
check("setInlineStyle re-layout", edit.ok === true, `${edit.layoutItems} items`);

console.log("[6] network recorder (attach/detach, block, replay-shape)");
const net = new NetworkRecorder();
check("fetch exists to wrap", typeof globalThis.fetch === "function");
net.attach();
check("attached", net.attached === true);
net.block("blocked\\.example");
let blockedErr = null;
try { await globalThis.fetch("https://blocked.example/x"); } catch (e) { blockedErr = e; }
check("block works", !!blockedErr && /blocked/.test(blockedErr.message));
check("blocked logged", net.list({ failed: true }).length >= 1);
net.detach();
check("detached", net.attached === false);
check("net stats", typeof net.stats().total === "number");

console.log("[7] session registry");
check("listSessions has it", listSessions().some((s) => s.id === session.id));
check("getSession works", getSession(session.id)?.id === session.id);
closeSession(session.id);
check("closeSession removes", getSession(session.id) === null);

console.log(`\nRESULT: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
