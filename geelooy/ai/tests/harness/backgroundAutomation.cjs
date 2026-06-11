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
    const storage = fs.readFileSync(path.join(ext, "bgAutomation/storage.js"), "utf8");
    const delegate = fs.readFileSync(path.join(ext, "bgAutomation/pageDelegate.js"), "utf8");
    const chatgpt = fs.readFileSync(path.join(ext, "bgAutomation/chatgpt.js"), "utf8");
    const bridge = fs.readFileSync(path.join(ROOT, "js/automation/backgroundBridge.js"), "utf8");
    const panel = fs.readFileSync(path.join(ROOT, "js/automation/panel.js"), "utf8");
    assert(manifest.permissions.includes("alarms"), "background automation needs chrome.alarms permission");
    assert(/registerAwtsmoosBackgroundAutomation/.test(background), "background must register automation port handlers");
    assert(/Awtsmoos background awake/.test(background) && /background-awake/.test(background), "background worker must expose awake heartbeat");
    assert(/automation-start/.test(api) && /automation-status/.test(api), "automation handlers must exist");
    assert(/conversationId/.test(api) && /stopAutomation\(msg\.reason/.test(api), "stop/status/tick must accept conversationId");
    assert(/startBackgroundAutomation/.test(jected) && /backgroundAutomationStatus\(conversationId/.test(jected), "page bridge must pass per-chat status controls");
    assert(/stopBackgroundAutomation\(reason = "stopped", conversationId/.test(jected), "page bridge must stop one conversation by id");
    assert(/automation-stream/.test(jected) && /awtsmoos-background-automation-stream/.test(jected), "stream packets must reach visible pages");
    assert(/sendChatGptBackground/.test(engine) && /onPacket/.test(engine), "background engine must own streaming send");
    assert(/ALARM_PREFIX/.test(engine) && /alarmName\(id\)/.test(engine), "each conversation must own its own alarm");
    assert(/busyConversations/.test(engine) && /wakeTimers/.test(engine), "each conversation must own busy and timer isolation");
    assert(/loadAllAutomationStates/.test(storage) && /runs:safeRuns/.test(storage), "storage must hold many runs keyed by conversationId");
    assert(/broadcastAutomationState/.test(engine) && /broadcastAutomationStream/.test(delegate), "state and stream mirror broadcasts must exist");
    assert(/mountBackgroundAutomationMirror/.test(page), "open /ai tab must mount live background stream mirror");
    assert(!/shouldUsePageSender/.test(bridge), "visible page must not steal extension ownership");
    assert(/backgroundOwned:true/.test(bridge), "bridge must mark background-owned automation");
    assert(/!hasBackgroundAutomationBridge\(\)\) pipeline\.resumeActiveRuns/.test(page), "page must not resume local automation when extension bridge exists");
    assert(/waitForSettledAssistant/.test(chatgpt) && /current_node/.test(chatgpt), "sender must wait for settled assistant history");
    assert(/data-auto-action=\"stop\"/.test(panel) && /bindAutomationActions/.test(panel), "panel must expose stop button");
    return { alarms:true, multiStorage:true, bridge:true, backgroundOwnsStreaming:true, stop:true };
  }));

  results.push(await test("background-engine-runs-multiple-conversations", async () => {
    const ext = path.join(ROOT, "../scripts/tricks/extensions/server/bgAutomation");
    const files = ["authErrors.js", "turnState.js", "storage.js", "engine.js"].map(name => fs.readFileSync(path.join(ext, name), "utf8"));
    let now = 1000;
    const rawStore = {};
    const sends = [];
    const broadcasts = [];
    const alarms = [];
    const context = {
      console,
      Date: class extends Date { constructor(...args){ super(...(args.length ? args : [now])); } static now(){ return now; } static parse = Date.parse; static UTC = Date.UTC; },
      setTimeout: () => 0,
      clearTimeout: () => {},
      localStorage:{ getItem:()=>null },
      chrome:{ storage:{ local:{ get(keys, cb){ const list = Array.isArray(keys) ? keys : [keys]; cb(Object.fromEntries(list.map(key => [key, rawStore[key]]))); }, set(value, cb){ Object.assign(rawStore, value); cb?.(); } } }, alarms:{ create(name, spec){ alarms.push({ name, spec }); }, clear(){}, onAlarm:{ addListener(fn){ context.__alarm = fn; } } } },
      globalThis:null
    };
    context.globalThis = context;
    context.AwtsmoosBgAutomationGraph = { chooseAutomationPrompt: (_graph, state) => `continue ${state.conversationId} ${state.turn}` };
    context.AwtsmoosBgChatGpt = { sendChatGptBackground: async ({ conversationId, prompt }) => { sends.push({ conversationId, prompt }); return { ok:true, text:`reply ${conversationId} ${sends.length}`, assistantMessageId:`a${sends.length}`, userMessageId:`u${sends.length}`, conversationId }; } };
    context.AwtsmoosBgPageDelegate = { broadcastAutomationState: s => broadcasts.push({ type:"state", s }), broadcastAutomationStream: s => broadcasts.push({ type:"stream", s }) };
    files.forEach((code, index) => vm.runInNewContext(code, context, { filename:`bg-${index}.js` }));
    await context.AwtsmoosBgAutomationEngine.startAutomation({ conversationId:"conv-a", settings:{ enabled:true, maxTurns:2, delayMs:25, prompt:"A", stopOnError:true } });
    await context.AwtsmoosBgAutomationEngine.startAutomation({ conversationId:"conv-b", settings:{ enabled:true, maxTurns:3, delayMs:25, prompt:"B", stopOnError:true } });
    for (let i = 0; i < 6; i++) { now += 1000; await context.AwtsmoosBgAutomationEngine.tickAutomation("test"); }
    const status = await context.AwtsmoosBgAutomationEngine.statusAutomation();
    const byId = Object.fromEntries(status.runs.map(run => [run.conversationId, run]));
    assert(byId["conv-a"]?.turns === 2 && byId["conv-a"]?.enabled === false, "conv-a must finish at its own max turns", byId);
    assert(byId["conv-b"]?.turns === 3 && byId["conv-b"]?.enabled === false, "conv-b must finish at its own max turns", byId);
    assert(sends.filter(send => send.conversationId === "conv-a").length === 2, "conv-a must send exactly two turns", sends);
    assert(sends.filter(send => send.conversationId === "conv-b").length === 3, "conv-b must send exactly three turns", sends);
    assert(alarms.some(alarm => /conv-a$/.test(alarm.name)) && alarms.some(alarm => /conv-b$/.test(alarm.name)), "each conversation must receive its own alarm", alarms);
    assert(broadcasts.some(item => item.s?.conversationId === "conv-a") && broadcasts.some(item => item.s?.conversationId === "conv-b"), "broadcasts must identify both conversations", broadcasts);
    return { sends:sends.length, convA:byId["conv-a"].turns, convB:byId["conv-b"].turns, alarmNames:alarms.map(a => a.name) };
  }));

  return { ok:results.every(r => r.ok), name:"extension-background-automation-wiring", ms:results.reduce((n, r) => n + r.ms, 0), facts:Object.fromEntries(results.map(r => [r.name, r.facts])), error:results.find(r => !r.ok)?.error };
}
module.exports = { run };
