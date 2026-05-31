//B"H
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { ROOT, assert, test } = require("./assert.cjs");

/**
 * B"H
 * Chapter 344: The Timer Refused To Become A Cage.
 *
 * The Awtsmoos does not confuse five test turns with a cosmic limit. This gate
 * drives the real background automation engine through many scheduled turns,
 * proving parent advancement, state broadcasts, and clean max-turn stopping can
 * hold while the delegate chain keeps going and going.
 */
async function run() {
  return test("automation-continuance-many-turns", async () => {
    const ext = path.join(ROOT, "../scripts/tricks/extensions/server/bgAutomation");
    const turnState = fs.readFileSync(path.join(ext, "turnState.js"), "utf8");
    const engine = fs.readFileSync(path.join(ext, "engine.js"), "utf8");
    const maxTurns = 27;
    let now = 1000;
    let state = {
      enabled: true,
      conversationId: "conv-many",
      turns: 0,
      settings: { enabled: true, maxTurns, delayMs: 3, prompt: "continue forever until told to stop", stopOnError: true },
      prompt: "continue forever until told to stop"
    };
    const sends = [];
    const broadcasts = [];
    const alarms = [];
    const context = makeContext({ nowRef: () => now, stateRef: () => state, setState: next => { state = next; }, sends, broadcasts, alarms });
    vm.runInNewContext(turnState, context, { filename: "turnState.js" });
    vm.runInNewContext(engine, context, { filename: "engine.js" });

    for (let turn = 1; turn <= maxTurns; turn++) {
      await context.AwtsmoosBgAutomationEngine.tickAutomation(`many-${turn}`);
      assert(sends.length === turn, `send count wrong at turn ${turn}`);
      assert(state.turns === turn, `state turns wrong at turn ${turn}`);
      assert(sends[turn - 1].parent === `assistant-${turn - 1}`, `parent did not advance at turn ${turn}`);
      if (turn < maxTurns) {
        assert(state.enabled === true, `state stopped early at turn ${turn}`);
        assert(state.status === "scheduled_next", `turn ${turn} did not schedule next`);
        now = state.nextRunAt + 1;
      }
    }

    assert(state.enabled === false, "automation must disable itself at maxTurns");
    assert(state.status === "done:max-turns", "automation max-turn status wrong");
    assert(new Set(sends.map(x => x.parent)).size === maxTurns, "parents must remain unique");
    assert(broadcasts.filter(x => x.s?.status === "scheduled_next").length >= maxTurns - 1, "scheduled broadcasts missing");
    assert(alarms.length >= maxTurns - 1, "alarm scheduling did not keep going");
    return { maxTurns, sends: sends.length, alarms: alarms.length, finalStatus: state.status };
  });
}

function makeContext({ nowRef, stateRef, setState, sends, broadcasts, alarms }) {
  const context = {
    console,
    Date: class extends Date {
      constructor(...args) { super(...(args.length ? args : [nowRef()])); }
      static now() { return nowRef(); }
      static parse = Date.parse;
      static UTC = Date.UTC;
    },
    setTimeout: () => 0,
    clearTimeout: () => {},
    localStorage: { getItem: () => null },
    chrome: { alarms: { create: (name, opts) => alarms.push({ name, opts }), clear() {}, onAlarm: { addListener(fn) { context.__alarm = fn; } } } },
    globalThis: null
  };
  context.globalThis = context;
  context.AwtsmoosBgAutomationStorage = {
    DEFAULTS: { maxTurns: 5, delayMs: 25, prompt: "continue", stopOnError: true },
    async loadAutomationState() { const state = stateRef(); return { ...state, settings: { ...(state.settings || {}) } }; },
    async saveAutomationState(patch) {
      const current = stateRef();
      const next = { ...current, ...patch, settings: patch.settings ? { ...patch.settings } : current.settings };
      setState(next);
      return { ...next, settings: { ...(next.settings || {}) } };
    },
    publicAutomationState(x) { return { ...x, settings: { ...(x.settings || {}) } }; }
  };
  context.AwtsmoosBgAutomationGraph = { chooseAutomationPrompt: (_state, turn) => `turn ${turn}: keep going` };
  context.AwtsmoosBgChatGpt = {
    sendChatGptBackground: async ({ conversationId, prompt }) => {
      const parent = `assistant-${sends.length}`;
      sends.push({ conversationId, prompt, parent });
      return { ok: true, text: `reply ${sends.length}`, assistantMessageId: parent, userMessageId: `user-${sends.length}`, conversationId };
    }
  };
  context.AwtsmoosBgPageDelegate = {
    broadcastAutomationState: s => broadcasts.push({ type: "state", s }),
    broadcastAutomationStream: s => broadcasts.push({ type: "stream", s })
  };
  return context;
}

module.exports = { run };
