// B"H
importScripts("streamLedger.js");
importScripts(
  "bgAutomation/storage.js",
  "bgAutomation/graph.js",
  "bgAutomation/turnState.js",
  "bgAutomation/settledConversationPoller.js",
  "bgAutomation/authErrors.js",
  "bgAutomation/sendVerifier.js",
  "bgAutomation/chatgpt.js",
  "bgAutomation/pageDelegate.js",
  "bgAutomation/engine.js",
  "bgAutomation/api.js"
);

const AWAKE_ALARM = "BH_awtsmoos_background_awake";
console.log('B"H Awtsmoos background awake', new Date().toISOString());
markAwake("loaded");
chrome.alarms.create(AWAKE_ALARM, { periodInMinutes: 1 });
chrome.runtime.onStartup?.addListener?.(() => markAwake("startup"));
chrome.runtime.onInstalled?.addListener?.(() => markAwake("installed"));

chrome.webNavigation.onCompleted.addListener(async details => injectAwtsmoosContent(details.tabId));
chrome.tabs.onUpdated.addListener((tabId, info) => { if (info.status === "complete") injectAwtsmoosContent(tabId); });

async function injectAwtsmoosContent(tabId) {
  try { await chrome.scripting.executeScript({ target: { tabId }, files: ["awtsmoosContent.js"] }); }
  catch (error) { console.warn("B'H content bridge injection skipped", tabId, error?.message || error); }
}

const ChromePortManager = globalThis.ChromePortManager || class ChromePortManager {
  constructor() { this.ports = {}; this.events = {}; this.init(); }
  on(event, listener) {
    if (typeof event === "object") for (const [key, fn] of Object.entries(event)) this.on(key, fn);
    else (this.events[event] ||= []).push(listener);
  }
  emit(event, ...data) { (this.events[event] || []).forEach(listener => Promise.resolve(listener(...data)).catch(error => console.warn("B'H port listener failed", event, error?.message || error))); }
  init() {
    chrome.runtime.onConnect.addListener(port => this.handleNewConnection(port));
    chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => { await this.handleMessage(message, sendResponse); });
  }
  async handlePortMessage(port, message) {
    if (message.name) this.registerPortByName(port, message.name);
    if (message.action) this.emit(message.action, message, port);
    if (message.to) await this.sendMessageToPort(message);
    if (message.reply) this.reply(port, message.reply);
  }
  reply(port, data) {
    if (!port) return;
    try { port.postMessage({ ...data, from: data?.from || data?.name || "background" }); }
    catch (error) { console.warn("B'H reply skipped; port disconnected", error?.message || error); this.onPortDisconnect(port); }
  }
  async handleMessage(message, sendResponse) {
    if (message.command === "send") { await this.sendMessageToPort(message); sendResponse({ status:"Message sent" }); }
    else sendResponse({ error:"Unknown command" });
  }
  registerPortByName(port, name) { if (name) this.ports[name] = port; }
  async sendMessageToPort(message) {
    const targetPort = this.ports[message.to];
    if (!targetPort) return;
    try { targetPort.postMessage({ ...message, from: message.name || message.from }); }
    catch (e) { console.error("Error sending message to port", e); this.onPortDisconnect(targetPort); }
  }
  onPortDisconnect(port) { for (const [name, saved] of Object.entries(this.ports)) if (saved === port) delete this.ports[name]; }
  handleNewConnection(port) {
    this.registerPortByName(port, port.name);
    port.onMessage.addListener(async message => await this.handlePortMessage(port, message));
    port.onDisconnect.addListener(() => {
      const lastError = chrome.runtime?.lastError;
      if (lastError?.message) console.debug("B'H port disconnected", lastError.message);
      this.onPortDisconnect(port);
    });
  }
};

globalThis.ChromePortManager = ChromePortManager;
const portManager = globalThis.__awtsmoosPortManager || new ChromePortManager();
globalThis.__awtsmoosPortManager = portManager;
globalThis.registerAwtsmoosBackgroundAutomation?.(portManager);

portManager.on("ping", async (msg, p) => portManager.reply(p, { pong: msg, awake: awakeState(), id: msg.id }));
portManager.on("background-awake", async (msg, p) => { const state = await markAwake("manual"); portManager.reply(p, { result: state, id: msg.id }); });
portManager.on("fetch", async (msg, port) => {
  const { id, url, options } = msg;
  try {
    await markAwake("fetch");
    const response = await fetch(url, { ...(options || {}), credentials: options?.credentials || "include", cache: options?.cache || "no-store" });
    const metadata = { status: response.status, ok: response.ok, headers: Array.from(response.headers.entries()), url: response.url, redirected: response.redirected, streamId: id };
    metadata.cookies = { count: (await getCookieString(new URL(url).hostname))?.cookies?.length || 0 };
    globalThis.__awtsmoosStreamLedger.create(id, response);
    portManager.reply(port, { metadata, id });
  } catch (error) { portManager.reply(port, { error: error.stack, id }); }
});
portManager.on("fetch-body", async (msg, port) => {
  try {
    await markAwake("fetch-body");
    const result = msg.bodyAction === "read" ? await globalThis.__awtsmoosStreamLedger.read(msg.id) : await globalThis.__awtsmoosStreamLedger.body(msg.id, msg.bodyAction);
    portManager.reply(port, { result, id: msg.id });
  } catch (error) { portManager.reply(port, { error: error.stack, id: msg.id }); }
});
portManager.on("resume-stream", async (msg, port) => {
  try { await markAwake("resume-stream"); portManager.reply(port, { result: await globalThis.__awtsmoosStreamLedger.resume(msg.id, msg.cursor), id: msg.id }); }
  catch (error) { portManager.reply(port, { error: error.stack, id: msg.id }); }
});
portManager.on("ack-stream", async (msg, port) => {
  try { portManager.reply(port, { result: globalThis.__awtsmoosStreamLedger.ack(msg.id, msg.cursor), id: msg.id }); }
  catch (error) { portManager.reply(port, { error: error.stack, id: msg.id }); }
});
portManager.on("stream-stats", async (msg, port) => {
  try { portManager.reply(port, { result: globalThis.__awtsmoosStreamLedger.stats(msg.id), awake: awakeState(), id: msg.id }); }
  catch (error) { portManager.reply(port, { error: error.stack, id: msg.id }); }
});
portManager.on("cancel-stream", async (msg, port) => {
  try { portManager.reply(port, { result: globalThis.__awtsmoosStreamLedger.cancel(msg.id, msg.reason || "cancelled"), id: msg.id }); }
  catch (error) { portManager.reply(port, { error: error.stack, id: msg.id }); }
});

chrome.alarms.onAlarm.addListener(alarm => {
  if (alarm.name === AWAKE_ALARM) markAwake("alarm");
});

function awakeState(reason = "status") {
  return { ok:true, awake:true, reason, at:Date.now(), iso:new Date().toISOString() };
}

async function markAwake(reason = "awake") {
  const state = awakeState(reason);
  globalThis.__awtsmoosBackgroundAwake = state;
  console.log(`B"H Awtsmoos background awake: ${reason}`, state.iso);
  try { await chrome.storage.local.set({ BH_awtsmoos_background_awake: state }); } catch {}
  return state;
}

function getCookieString(domain) {
  return new Promise(resolve => chrome.cookies.getAll({ domain }, cookies => resolve({ string: cookies.map(w => `${w.name}=${w.value}; `).join(""), cookies })));
}
