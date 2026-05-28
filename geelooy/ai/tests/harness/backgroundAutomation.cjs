//B"H
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { ROOT, assert, test } = require("./assert.cjs");

async function run() {
  const results = [];
  results.push(await test("extension-background-automation-wiring", async () => {
    const ext = path.join(ROOT, "../scripts/tricks/extensions/server");
    const manifest = JSON.parse(fs.readFileSync(path.join(ext, "manifest.json"), "utf8"));
    const background = fs.readFileSync(path.join(ext, "background.js"), "utf8");
    const jected = fs.readFileSync(path.join(ext, "jected.js"), "utf8");
    const page = fs.readFileSync(path.join(ROOT, "index.js"), "utf8");
    const api = fs.readFileSync(path.join(ext, "bgAutomation/api.js"), "utf8");
    const engine = fs.readFileSync(path.join(ext, "bgAutomation/engine.js"), "utf8");
    const delegate = fs.readFileSync(path.join(ext, "bgAutomation/pageDelegate.js"), "utf8");
    const chatgpt = fs.readFileSync(path.join(ext, "bgAutomation/chatgpt.js"), "utf8");
    const bridge = fs.readFileSync(path.join(ROOT, "js/automation/backgroundBridge.js"), "utf8");
    const panel = fs.readFileSync(path.join(ROOT, "js/automation/panel.js"), "utf8");
    assert(manifest.permissions.includes("alarms"), "background automation needs chrome.alarms permission");
    assert(/bgAutomation\/pageDelegate\.js/.test(background), "background must import state broadcast module");
    assert(/registerAwtsmoosBackgroundAutomation/.test(background), "background must register automation port handlers");
    assert(/Awtsmoos background awake/.test(background) && /background-awake/.test(background), "background worker must expose/log awake heartbeat");
    assert(!/globalThis\.globalThis/.test(background), "background registration must not use broken globalThis.globalThis path");
    assert(/automation-start/.test(api) && /automation-status/.test(api), "automation start/status handlers must exist");
    assert(!/automation-visible-done/.test(api + jected + page), "page must never tell extension to continue automation");
    assert(/startBackgroundAutomation/.test(jected) && /backgroundAutomationStatus/.test(jected), "page bridge must expose background automation controls");
    assert(/automation-state/.test(jected) && /awtsmoos-background-automation-state/.test(jected), "extension must relay background automation state to open pages");
    assert(/automation-stream/.test(jected) && /awtsmoos-background-automation-stream/.test(jected), "extension must relay ordered automation stream packets to open pages");
    assert(/sendChatGptBackground/.test(engine) && /onPacket/.test(engine), "background engine must own the ChatGPT streaming call and packet callback");
    assert(/broadcastAutomationState/.test(engine) && /broadcastAutomationStream/.test(delegate), "background must broadcast state and stream packets for UI mirroring");
    assert(/mountBackgroundAutomationMirror/.test(page), "open /ai tab must mount live background stream mirror");
    assert(!/shouldUsePageSender/.test(bridge), "visible page must not steal automation ownership from extension background");
    assert(/backgroundOwned:true/.test(bridge), "background bridge must mark extension-owned automation");
    assert(/!hasBackgroundAutomationBridge\(\)\) pipeline\.resumeActiveRuns/.test(page), "page must not resume local automation when extension bridge exists");
    assert(/normalizeSettings/.test(bridge), "background bridge must normalize real UI settings before sending to extension");
    assert(/scheduleNext/.test(engine) && /setTimeout\(\(\) => tickAutomation\("timer"\)/.test(engine), "background automation must chain timer ticks in addition to alarms");
    assert(/latest = await store\.loadAutomationState\(\)/.test(engine) && /!latest\.enabled/.test(engine), "background must re-check enabled after a stream before scheduling next turn");
    assert(/waitForSettledAssistant/.test(chatgpt) && /current_node/.test(chatgpt), "background sender must wait for settled final assistant message after custom GPT/tool events");
    assert(/data-auto-action=\"stop\"/.test(panel) && /bindAutomationActions/.test(panel), "automation panel must expose a stop button while streaming");
    return { alarms:true, bridge:true, backgroundOwnsStreaming:true, pageMirrorsOnly:true, stop:true, settled:true, awake:true };
  }));

  results.push(await test("background-engine-sends-five-real-turns", async () => {
    const ext = path.join(ROOT, "../scripts/tricks/extensions/server/bgAutomation");
    const turnState = fs.readFileSync(path.join(ext, "turnState.js"), "utf8");
    const engine = fs.readFileSync(path.join(ext, "engine.js"), "utf8");
    let now = 1000;
    let state = {
      enabled:true,
      conversationId:"conv-auto",
      turns:0,
      settings:{ enabled:true, maxTurns:5, delayMs:25, prompt:"continue", stopOnError:true },
      prompt:"continue"
    };
    const sends = [];
    const broadcasts = [];
    const context = {
      console,
      Date: class extends Date { constructor(...args){ super(...(args.length ? args : [now])); } static now(){ return now; } static parse = Date.parse; static UTC = Date.UTC; },
      setTimeout: () => 0,
      clearTimeout: () => {},
      localStorage:{ getItem:()=>null },
      chrome:{ alarms:{ create(){}, clear(){}, onAlarm:{ addListener(fn){ context.__alarm = fn; } } } },
      globalThis:null
    };
    context.globalThis = context;
    context.AwtsmoosBgAutomationStorage = {
      DEFAULTS:{ maxTurns:5, delayMs:25, prompt:"continue", stopOnError:true },
      async loadAutomationState(){ return { ...state, settings:{ ...(state.settings || {}) } }; },
      async saveAutomationState(patch){ state = { ...state, ...patch, settings: patch.settings ? { ...patch.settings } : state.settings }; return { ...state, settings:{ ...(state.settings || {}) } }; },
      publicAutomationState(x){ return { ...x, settings:{ ...(x.settings || {}) } }; }
    };
    context.AwtsmoosBgAutomationGraph = { chooseAutomationPrompt: () => "continue" };
    context.AwtsmoosBgChatGpt = { sendChatGptBackground: async ({ conversationId, prompt }) => { sends.push({ conversationId, prompt, parent:`assistant-${sends.length}` }); return { ok:true, text:`reply ${sends.length}`, assistantMessageId:`a${sends.length}`, userMessageId:`u${sends.length}`, conversationId }; } };
    context.AwtsmoosBgPageDelegate = { broadcastAutomationState: s => broadcasts.push({ type:"state", s }), broadcastAutomationStream: s => broadcasts.push({ type:"stream", s }) };
    vm.runInNewContext(turnState, context, { filename:"turnState.js" });
    vm.runInNewContext(engine, context, { filename:"engine.js" });
    for (let turn = 1; turn <= 5; turn++) {
      await context.AwtsmoosBgAutomationEngine.tickAutomation(`test-${turn}`);
      const finalTurn = turn === 5;
      assert(sends.length === turn && state.turns === turn, `background turn ${turn} must commit exactly once`, { sends, state, turn });
      if (!finalTurn) {
        assert(state.status === "scheduled_next" && state.enabled === true, `background turn ${turn} must schedule the next turn`, { sends, state, turn });
        now = state.nextRunAt + 1;
      }
    }
    assert(state.status === "done:max-turns" && state.enabled === false, "background must stop only after five committed turns", { sends, state });
    assert(sends.every((send, index) => send.parent === `assistant-${index}`), "background sends must keep advancing parents for five turns", sends);
    assert(broadcasts.some(x => x.s?.status === "scheduled_next"), "scheduled-next state must be broadcast to UI", broadcasts);
    return { sends:sends.length, turns:state.turns, status:state.status, scheduledBroadcast:true, parents:sends.map(send => send.parent) };
  }));

  return {
    ok: results.every(r => r.ok),
    name: "extension-background-automation-wiring",
    ms: results.reduce((n, r) => n + r.ms, 0),
    facts: Object.fromEntries(results.map(r => [r.name, r.facts]))
  };
}
module.exports = { run };
