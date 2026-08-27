//B"H
const path = require("path");
const { pathToFileURL } = require("url");
const { ROOT, assert, test, makeStorage } = require("./assert.cjs");

/**
 * B"H — proves automation does not secretly change the send payload shape.
 *
 * The test stops at the app/service boundary where `/ai` hands the message to
 * the ChatGPT service. Manual visible send and automation visible send both use
 * `controller.send`. Hidden same-tab automation uses only visibility changes;
 * it must not set `automation:true` in stream context.
 */
async function run() {
  return test("manual-and-automation-service-payload-parity", async () => {
    installGlobals();
    const suffix = `?h=${Date.now()}${Math.random()}`;
    const controllerUrl = pathToFileURL(path.join(ROOT, "js/app/conversationController.js")).href + suffix;
    const settingsUrl = pathToFileURL(path.join(ROOT, "js/automation/settingsStore.js")).href + suffix;
    const { ConversationController } = await import(controllerUrl);
    const { AutomationSettingsStore } = await import(settingsUrl);

    const manualCalls = [];
    const automationCalls = [];
    const manual = makeController(ConversationController, manualCalls);
    const automation = makeController(ConversationController, automationCalls);
    await manual.send("same payload", { conversationId:"chat-a", ondone: () => {} });
    await automation.send("same payload", { conversationId:"chat-a", ondone: () => {} });
    assert(JSON.stringify(shape(manualCalls[0])) === JSON.stringify(shape(automationCalls[0])), "visible automation must equal manual controller.send service payload", { manual: shape(manualCalls[0]), automation: shape(automationCalls[0]) });

    const hiddenCalls = [];
    const hidden = makeController(ConversationController, hiddenCalls);
    await hidden.sendAutomation("same payload", { conversationId:"chat-b", ondone: () => {} });
    const hiddenShape = shape(hiddenCalls[0]);
    assert(hiddenShape.options.streamContext.automation === false, "hidden automation must not mark stream context as automation", { hiddenShape });
    assert(hiddenShape.options.conversationId === "chat-b", "hidden automation can target a non-visible chat by id", { hiddenShape });

    const storage = makeMultiKeyStorage();
    const store = new AutomationSettingsStore({ storage });
    store.setConversationId("chat-a");
    store.save({ enabled:true, promptMode:"cycle", promptListText:"one\ntwo" }, "chat-a");
    store.setConversationId("chat-b");
    const chatB = store.load("chat-b");
    assert(chatB.enabled === false, "chat B must stay default off when chat A is enabled", { chatB });
    assert(store.load("chat-a").enabled === true, "chat A must remember its own enabled setting");
    return { visibleParity:true, hiddenNoAutomationFlag:true, perChatDefaults:true };
  });
}

function makeController(ConversationController, calls) {
  const service = { promptFunction: async (message, options) => {
    calls.push({ message, options });
    options.onstream?.({ data:{ conversation_id: options.conversationId, message:{ content:{ parts:["stream"] } } } });
    const packet = { conversation_id: options.conversationId, message:{ id:"assistant", content:{ parts:["done"] } } };
    await options.ondone?.(packet);
    return packet;
  }};
  return new ConversationController({
    aiHandler: { getActiveService: async () => service },
    serviceSelect: { value:"chatgpt" },
    renderer: makeRenderer()
  });
}

function makeRenderer() {
  let id = 0;
  return {
    chatBox: { append(){}, textContent:"" },
    records: [],
    add(input) { const record = { id:`r${++id}`, shell:{ isConnected:true, textContent:"" }, text: input?.message?.content?.parts?.join?.("\n") || "", events:[] }; this.records.push(record); return record; },
    updateRecord(id, packet) { const record = this.records.find(item => item.id === id); if (record) record.text = packet?.message?.content?.parts?.[0] || packet?.data?.message?.content?.parts?.[0] || record.text; return Promise.resolve(); },
    setRecordEvents(id, events) { const record = this.records.find(item => item.id === id); if (record) record.events = events; },
    finalizeLiveRecords(){}, forceScrollDownSoon(){}, showError(){}, pushTransport(){}, refreshLive(){}, clear(){}, forceScrollDown(){}, loadMessages: async () => {}
  };
}

function shape(call = {}) {
  return {
    message: call.message,
    options: {
      conversationId: call.options?.conversationId || null,
      remember: call.options?.remember,
      attachmentsLength: call.options?.attachments?.length || 0,
      streamContext: {
        conversationId: call.options?.streamContext?.conversationId || null,
        title: call.options?.streamContext?.title,
        automation: call.options?.streamContext?.automation
      },
      hasOnstream: typeof call.options?.onstream === "function",
      hasOndone: typeof call.options?.ondone === "function"
    }
  };
}

function installGlobals() {
  globalThis.window = globalThis;
  globalThis.localStorage = makeStorage();
  globalThis.sessionStorage = makeStorage();
  globalThis.location = { search:"?awtsmoosConversation=visible-chat" };
  globalThis.history = { replaceState(){} };
  globalThis.document = { title:"", querySelector(){ return null; }, getElementById(){ return null; } };
  globalThis.CustomEvent = class CustomEvent { constructor(type, init) { this.type = type; this.detail = init?.detail; } };
  globalThis.dispatchEvent = () => true;
}

function makeMultiKeyStorage() {
  const map = new Map();
  return { getItem:key => map.has(key) ? map.get(key) : null, setItem:(key, value) => map.set(key, String(value)), removeItem:key => map.delete(key) };
}

module.exports = { run };
