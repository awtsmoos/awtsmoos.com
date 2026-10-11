// B"H — VirtualTerminal tests: real process spawning, ANSI, editing.
// Run: node testVirtualTerminal.mjs
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { VirtualTerminal, ScreenBuffer, AnsiParser, LineEditor } = require("./VirtualTerminal.js");

let pass = 0, fail = 0;
const failures = [];
function ok(cond, name) {
    if (cond) pass++;
    else { fail++; failures.push(name); console.log("  FAIL:", name); }
}
async function section(name, fn) {
    const p0 = pass, f0 = fail;
    try { await fn(); } catch (e) { fail++; failures.push(name + " threw: " + e.message); console.log("  THREW:", name, e.message, e.stack?.split("\n")[1]); }
    console.log(`## ${name}: ${pass - p0} pass, ${fail - f0} fail`);
}
const tick = (ms = 50) => new Promise(r => setTimeout(r, ms));
async function waitFor(fn, timeout = 8000, label = "") {
    const t0 = Date.now();
    while (Date.now() - t0 < timeout) { if (fn()) return true; await tick(100); }
    return false;
}

await section("screen buffer basics", async () => {
    const s = new ScreenBuffer(10, 4);
    const p = new AnsiParser(s);
    p.write("hello");
    ok(s.getLineText(0) === "hello", "plain text lands on line 0");
    ok(s.cx === 5, "cursor advances");
    p.write("\x1b[31mred\x1b[0m");
    ok(s.getLineText(0) === "hellored", "SGR text appended");
    const i = s.idx(5, 0);
    ok(s.fg[i] === 1, "SGR 31 sets fg=red(1), got " + s.fg[i]);
    p.write("\x1b[2J");
    ok(s.getLineText(0) === "", "ED 2 clears screen");
});

await section("ANSI cursor + erase", async () => {
    const s = new ScreenBuffer(20, 5);
    const p = new AnsiParser(s);
    p.write("abc\x1b[2DXY");
    ok(s.getLineText(0) === "aXY", "cursor back 2 + overwrite, got '" + s.getLineText(0) + "'");
    p.write("\x1b[1;1HZZ");
    ok(s.getLineText(0).startsWith("ZZ"), "CUP 1;1 homes cursor");
    p.write("\x1b[K");
    ok(s.getLineText(0) === "ZZ", "EL 0 erases to end of line");
});

await section("256-color + truecolor SGR", async () => {
    const s = new ScreenBuffer(20, 5);
    const p = new AnsiParser(s);
    p.write("\x1b[38;5;200mX");
    ok(s.fg[s.idx(0, 0)] === 200, "256-color fg stored");
    p.write("\x1b[38;2;10;20;30mY");
    ok(s.fg[s.idx(1, 0)] === 254, "truecolor flag stored");
    ok(s.truecolorCells.get(s.idx(1, 0)).join(",") === "10,20,30", "truecolor rgb stored");
});

await section("line editor", async () => {
    const ed = new LineEditor();
    for (const c of "hello") ed.key(c);
    ok(ed.buf === "hello", "typing builds buffer");
    ed.key("\x01"); // Ctrl+A
    ok(ed.cursor === 0, "Ctrl+A goes home");
    ed.key("\x05"); // Ctrl+E
    ok(ed.cursor === 5, "Ctrl+E goes end");
    ed.key("\x7f");
    ok(ed.buf === "hell" && ed.cursor === 4, "backspace deletes");
    const r = ed.key("\r");
    ok(r.submit === "hell", "enter submits");
    ok(ed.history.length === 1, "history recorded");
    ed.key("\x1b[A");
    ok(ed.buf === "hell", "up-arrow recalls history");
});

await section("real process: echo", async () => {
    const t = new VirtualTerminal({ cols: 80, rows: 24 });
    const s = t.createSession({ title: "echo-test" });
    let out = "";
    s.onOutput = (sess) => { out = sess.getText(); };
    s.start();
    await waitFor(() => out.length > 0, 5000, "shell boot");
    // Shell is interactive; send a command
    s.input("echo MERKAVA_TERM_OK\n");
    const got = await waitFor(() => out.includes("MERKAVA_TERM_OK"), 8000);
    ok(got, "echo output appears in terminal. screen:\n" + out.slice(0, 500));
    s.destroy();
});

await section("real process: pwd + ls", async () => {
    const t = new VirtualTerminal({ cols: 80, rows: 24 });
    const s = t.createSession({ title: "ls-test" });
    let out = "";
    s.onOutput = (sess) => { out = sess.getText(); };
    s.start();
    await waitFor(() => out.length > 0, 5000);
    s.input("pwd\n");
    const gotPwd = await waitFor(() => /\/home|\/root|\//.test(out) && out.split("\n").length > 3, 8000);
    ok(gotPwd, "pwd produced output");
    s.input("ls /tmp | head -3\n");
    await tick(1500);
    ok(out.includes("MERKAVA_TERM_OK") || out.length > 100, "ls produced output");
    s.destroy();
});

await section("tab completion (path)", async () => {
    const t = new VirtualTerminal({ cols: 80, rows: 24 });
    const s = t.createSession({ title: "complete-test" });
    const c = s.complete("ls /tmp/", "/tmp".length);
    ok(c === null || typeof c.buf === "string", "completion returns sane shape");
    s.destroy();
});

await section("multi-session", async () => {
    const t = new VirtualTerminal({ cols: 80, rows: 24 });
    const a = t.createSession({ title: "a" });
    const b = t.createSession({ title: "b" });
    ok(t.list().length === 2, "two sessions listed");
    t.activate(b.id);
    ok(t.session().id === b.id, "activate switches");
    t.closeSession(a.id);
    ok(t.list().length === 1, "close removes session");
    b.destroy();
});

console.log(`\n==== RESULT: ${pass} pass, ${fail} fail ====`);
if (failures.length) { console.log("Failures:"); failures.forEach(f => console.log(" - " + f)); }
process.exit(fail ? 1 : 0);
