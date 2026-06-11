//B"H
(function revealAwtsmoosFetchIntoPage() {
  console.log(`B"H\nAwtsmoos server fetch bridge awake`);
  const READY = "awtsmoos-server-ready";
  const bridgeMark = "__awtsmoosServerBridge";

  /**
   * B"H
   * Chapter 383: The Injected Messenger Carried The Conversation Seal.
   *
   * Every automation whisper now bears its conversationId. The visible tab may
   * close, sleep, or multiply into many windows, while the extension background
   * remembers which stream belongs to which vessel of the Awtsmoos.
   */
  class AwtsResponse {
    constructor(metadata, id) {
      Object.assign(this, metadata);
      this.id = id;
      this.bodyUsed = false;
      this.headers = new Headers(Array.isArray(metadata?.headers) ? metadata.headers : []);
    }
    clone() { return new AwtsResponse({ status:this.status, ok:this.ok, headers:Array.from(this.headers.entries()), url:this.url, redirected:this.redirected, type:this.type || "basic" }, this.id); }
    async _requestBody(action) { return await sendBridgeMessage({ action:"fetch-body", id:this.id, bodyAction:action }, 180000); }
    async text() { this.bodyUsed = true; return await this._requestBody("text"); }
    async json() { return JSON.parse(await this.text()); }
    async blob() { return await (await fetch(await this._requestBody("blob"))).blob(); }
    get body() { return { getReader:() => createBridgeReader(this.id) }; }
  }

  function createBridgeReader(id) {
    let done = false;
    let cursor = 0;
    return { read:async () => {
      if (done) return { done:true, value:undefined };
      const packet = await safeResumePacket(id, cursor);
      if (!packet || packet.error || (packet.done && !packet.chunks?.length)) { done = true; return { done:true, value:undefined }; }
      const chunk = [...(packet.chunks || [])].sort((a, b) => Number(a.index || 0) - Number(b.index || 0))[0];
      if (!chunk) return { done:false, value:new Uint8Array() };
      cursor = Math.max(cursor, Number(chunk.index || 0) + 1);
      const blob = await (await fetch(chunk.chunk)).blob();
      return { done:false, value:new Uint8Array(await blob.arrayBuffer()) };
    }};
  }

  function readyEvent(extra = {}) {
    window.__awtsmoosServerReady = true;
    window.dispatchEvent(new CustomEvent(READY, { detail:{ transport:"extension", at:Date.now(), ...extra } }));
  }

  function wait(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

  window.addEventListener("unhandledrejection", event => {
    const message = String(event?.reason?.message || event?.reason || "");
    if (/Awtsmoos extension fetch timed out|disconnected port object|Extension context invalidated/i.test(message)) {
      event.preventDefault();
      window.dispatchEvent(new CustomEvent("awtsmoos-server-feedback", { detail:{ type:"suppressed-extension-rejection", error:message } }));
    }
  });

  function sendBridgeMessage(payload, timeoutMs = 120000) {
    const id = payload.id || `BH_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    payload.id = id;
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => cleanup(() => reject(timeoutError(payload, id, timeoutMs))), timeoutMs);
      function cleanup(after) { clearTimeout(timeout); window.removeEventListener("message", onMessage); after?.(); }
      function onMessage(event) {
        if (event.data?.from === "background" && event.data.id === id) cleanup(() => event.data.error ? reject(new Error(event.data.error)) : resolve(Object.prototype.hasOwnProperty.call(event.data, "result") ? event.data.result : event.data.metadata));
      }
      window.addEventListener("message", onMessage);
      window.postMessage(payload, "*");
    });
  }

  function timeoutError(payload, id, timeoutMs) {
    const error = new Error("Awtsmoos extension fetch timed out.");
    window.dispatchEvent(new CustomEvent("awtsmoos-server-feedback", { detail:{ type:"extension-timeout", action:payload.action, id, timeoutMs, error:error.message } }));
    return error;
  }

  async function resumeStream(id, cursor = 0) { return await sendBridgeMessage({ action:"resume-stream", id, cursor }, 180000); }
  async function safeResumePacket(id, cursor = 0) { try { return await resumeStream(id, cursor); } catch (error) { if (/Response not found|already consumed|stream missing/i.test(String(error?.message || error))) return null; throw error; } }
  async function ackStream(id, cursor = 0) { try { return await sendBridgeMessage({ action:"ack-stream", id, cursor }, 30000); } catch (error) { window.dispatchEvent(new CustomEvent("awtsmoos-server-feedback", { detail:{ type:"ack-timeout", error:String(error?.message || error), id } })); return null; } }
  async function streamStats(id) { return await sendBridgeMessage({ action:"stream-stats", id }, 30000); }
  async function cancelStream(id, reason = "cancelled") { return await sendBridgeMessage({ action:"cancel-stream", id, reason }, 30000); }
  async function startBackgroundAutomation(config = {}) { return await sendBridgeMessage({ action:"automation-start", config, conversationId:config.conversationId || "" }, 60000); }
  async function stopBackgroundAutomation(reason = "stopped", conversationId = "") { return await sendBridgeMessage({ action:"automation-stop", reason, conversationId }, 30000); }
  async function backgroundAutomationStatus(conversationId = "") { return await sendBridgeMessage({ action:"automation-status", conversationId }, 30000); }

  async function awtsFetch(url, options = {}) {
    let lastError;
    for (let attempt = 0; attempt < 4; attempt++) {
      try {
        const id = `BH_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        const metadata = await sendBridgeMessage({ action:"fetch", id, url:String(url), options }, 180000);
        readyEvent({ attempt });
        return new AwtsResponse(metadata, id);
      } catch (error) { lastError = error; window.dispatchEvent(new CustomEvent("awtsmoos-server-reconnecting", { detail:{ attempt, error:String(error?.message || error) } })); await wait(250 * Math.pow(2, attempt)); }
    }
    throw lastError;
  }

  window.addEventListener("message", event => {
    const data = event?.data;
    if (data?.from === "awtsmoos-content" && ["server-ready", "server-reconnecting", "server-disconnected"].includes(data.type)) readyEvent({ contentState:data.type, epoch:data.epoch });
    if (data?.from === "background" && data?.action === "automation-state") window.dispatchEvent(new CustomEvent("awtsmoos-background-automation-state", { detail:data.detail || {} }));
    if (data?.from === "background" && data?.action === "automation-stream") window.dispatchEvent(new CustomEvent("awtsmoos-background-automation-stream", { detail:data.detail || {} }));
  });

  awtsFetch[bridgeMark] = true;
  Object.assign(awtsFetch, { resumeStream, ackStream, streamStats, cancelStream, startBackgroundAutomation, stopBackgroundAutomation, backgroundAutomationStatus });
  window.awtsmoosFetch = awtsFetch;
  window.mFetch = awtsFetch;
  readyEvent({ fetchName:"awtsmoosFetch" });
})();
