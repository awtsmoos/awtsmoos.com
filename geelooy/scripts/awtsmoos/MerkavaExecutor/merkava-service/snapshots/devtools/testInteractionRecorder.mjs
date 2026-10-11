// B"H — test the InteractionRecorder: record, timeline, diff, play fwd/bwd, goto, variables.
import { InteractionRecorder } from "./interactionRecorder.js";

const HTML = `<html><body>
<style>
  #inc { padding: 8px; background: #eee; }
  #inc:hover { background: #cfc; }
</style>
<h1 id="title">Counter app</h1>
<div id="count">0</div>
<button id="inc">Increment</button>
<input id="name" type="text" value="" />
</body></html>`;

function findById(dom, id) {
  if (!dom || typeof dom !== "object") return null;
  if (dom.attributes?.id === id) return dom;
  for (const c of (dom.children || [])) { const h = findById(c, id); if (h) return h; }
  return null;
}
function setText(node, text) {
  node.textContent = text;
  node.children = node.children.filter((c) => c.nodeType !== 3);
  node.children.push({ tagName: "#text", localName: "#text", nodeType: 3, attributes: {}, children: [], textContent: text, style: {} });
}

let failures = 0;
function check(name, cond, extra) {
  if (cond) { console.log(`  PASS ${name}`); }
  else { failures++; console.log(`  FAIL ${name}${extra ? " — " + extra : ""}`); }
}

console.log("1) record scripted interactions");
const rec = new InteractionRecorder(HTML, { width: 800, height: 600, label: "test" });
// page-script handler: increments counter (host-level, re-runs on replay)
let counter = 0;
rec.on("click", "#inc", () => {
  counter++;
  setText(findById(rec.sim._dom, "count"), String(counter));
});
const r0 = rec.do("clickSelector", { selector: "#inc" });
check("click recorded", r0.action === "clickSelector" && r0.index === 0, JSON.stringify(r0));
check("domChanged on counter", r0.domChanged === true);
check("counter is 1", counter === 1, `counter=${counter}`);
check("event log has click", r0.events.some((e) => e.type === "click"));

const r1 = rec.do("type", { text: "Yaakov", selector: "#name" });
check("type recorded", r1.action === "type" && r1.index === 1);
check("input value", r1.result.value === "Yaakov", JSON.stringify(r1.result));

const r2 = rec.do("clickSelector", { selector: "#inc" });
check("second click", counter === 2, `counter=${counter}`);

console.log("2) timeline");
const tl = rec.timeline();
check("timeline length 3", tl.length === 3, `len=${tl.length}`);
check("timeline has perf fields", tl.every((t) => typeof t.elapsedMs === "number" && typeof t.heapDeltaMB === "number"));
check("timeline has timestamps", tl.every((t) => !!t.ts));

console.log("3) diff between interaction points");
const d = rec.diff(-1, 2);
check("diff found changes", d.changeCount > 0, `changes=${d.changeCount}`);
const hasCountChange = d.changes.some((c) => c.kind === "text-changed");
check("diff shows counter text change", hasCountChange, JSON.stringify(d.changes.slice(0, 3)));
const dSame = rec.diff(1, 1);
check("self diff empty", dSame.changeCount === 0, `changes=${dSame.changeCount}`);

console.log("4) play backward restores DOM");
const back = rec.playBackward(2);
check("played back 2", back.applied.length === 2 && rec.currentIndex === 0, JSON.stringify(back));
const countNode = findById(rec.sim._dom, "count");
check("counter text restored to 1", countNode.textContent === "1", `text=${countNode.textContent}`);
const nameNode = findById(rec.sim._dom, "name");
check("input value restored to empty", (nameNode.value || "") === "", `value=${nameNode.value}`);

console.log("5) play forward re-applies");
const fwd = rec.playForward(2);
check("played forward 2", fwd.applied.length === 2 && rec.currentIndex === 2);
// NOTE: replay re-runs handlers; record set counter to 2, replay of the 2nd click adds 1 more
check("counter text is 3 after replay", findById(rec.sim._dom, "count").textContent === "3",
  `text=${findById(rec.sim._dom, "count").textContent} (handler re-runs on replay — expected)`);
check("input value restored to Yaakov", findById(rec.sim._dom, "name").value === "Yaakov");

console.log("6) goto");
const g = rec.goto(0);
check("goto 0", rec.currentIndex === 0, `idx=${rec.currentIndex}`);
const g2 = rec.goto(2);
check("goto 2", rec.currentIndex === 2, `idx=${rec.currentIndex}`);
const g3 = rec.goto(99);
check("goto clamps to end", rec.currentIndex === 2, `idx=${rec.currentIndex}`);

console.log("7) live variables with probe");
rec.attachVarProbe(() => ({ counter, page: "counter-app" }));
const lv = rec.liveVariables();
check("probe attached", lv.probed === true);
check("now has counter", lv.now && lv.now.counter === counter, JSON.stringify(lv.now));
check("history entries", lv.history.length === 3);
// variable snapshots captured during do() were null (probe attached after); re-do one:
rec.do("press", { key: "Enter" });
const lv2 = rec.liveVariables();
check("variables captured on new interaction", lv2.history[3].variables?.counter === counter,
  JSON.stringify(lv2.history[3].variables));

console.log("8) redo-tail truncation");
rec.goto(1);
const before = rec.interactions.length;
rec.do("press", { key: "a" });
check("tail truncated", rec.interactions.length === 3 && rec.currentIndex === 2,
  `len=${rec.interactions.length} idx=${rec.currentIndex} (was ${before})`);

console.log("9) screenshot render");
const png = rec.renderPng();
check("png data url", typeof png === "string" && png.startsWith("data:image/png"), (png || "").slice(0, 30));

console.log(failures === 0 ? "\nALL INTERACTION RECORDER TESTS PASS" : `\n${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);
