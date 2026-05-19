//B"H
(function revealAwtsmoosFetchIntoPage() {
  console.log(`B"H\nAwtsmoos server fetch bridge awake`);
  const READY = "awtsmoos-server-ready";
  const bridgeMark = "__awtsmoosServerBridge";

  /**
   * B"H — A small Response vessel. The first fetch only returns metadata;
   * body reads are separate messages so streamed ChatGPT responses can keep
   * breathing through the extension without forcing one giant body into memory.
   */
  class AwtsResponse {
    constructor(metadata, id) {
      Object.assign(this, metadata);
      this.id = id;
      this.bodyUsed = false;
      this.headers = new Headers(Array.isArray(metadata?.headers) ? metadata.headers : []);
    }

    clone() {
      return new AwtsResponse({
        status: this.status, ok: this.ok, headers: Array.from(this.headers.entries()),
        url: this.url, redirected: this.redirected, type: this.type || "basic"
      }, this.id);
    }

    async _requestBody(action) {
      const result = await sendBridgeMessage({ action: "fetch-body", id: this.id, bodyAction: action }, 180000);
      return result;
    }

    async text() { this.bodyUsed = true; return await this._requestBody("text"); }
    async json() { return JSON.parse(await this.text()); }
    async blob() { return await (await fetch(await this._requestBody("blob"))).blob(); }

    get body() {
      return { getReader: () => {
        let done = false;
        return { read: async () => {
          if (done) return { done: true, value: undefined };
          const value = await this._requestBody("read");
          if (value === null) { done = true; return { done: true, value: undefined }; }
          const blob = await (await fetch(value)).blob();
          return { done: false, value: new Uint8Array(await blob.arrayBuffer()) };
        }};
      }};
    }
  }

  function readyEvent(extra = {}) {
    window.__awtsmoosServerReady = true;
    window.dispatchEvent(new CustomEvent(READY, { detail: { transport: "extension", at: Date.now(), ...extra } }));
  }

  function wait(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

  function sendBridgeMessage(payload, timeoutMs = 120000) {
    const id = payload.id || `BH_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    payload.id = id;
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => cleanup(() => reject(new Error("Awtsmoos extension fetch timed out."))), timeoutMs);
      function cleanup(after) { clearTimeout(timeout); window.removeEventListener("message", onMessage); after?.(); }
      function onMessage(event) {
        if (event.data?.from === "background" && event.data.id === id) {
          cleanup(() => event.data.error ? reject(new Error(event.data.error)) : resolve(event.data.result ?? event.data.metadata));
        }
      }
      window.addEventListener("message", onMessage);
      window.postMessage(payload, "*");
    });
  }

  async function awtsFetch(url, options = {}) {
    let lastError;
    for (let attempt = 0; attempt < 4; attempt++) {
      try {
        const id = `BH_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        const metadata = await sendBridgeMessage({ action: "fetch", id, url: String(url), options }, 180000);
        readyEvent({ attempt });
        return new AwtsResponse(metadata, id);
      } catch (error) {
        lastError = error;
        window.dispatchEvent(new CustomEvent("awtsmoos-server-reconnecting", { detail: { attempt, error: String(error?.message || error) } }));
        await wait(250 * Math.pow(2, attempt));
      }
    }
    throw lastError;
  }

  window.addEventListener("message", event => {
    const data = event?.data;
    if (data?.from === "awtsmoos-content" && ["server-ready", "server-reconnecting", "server-disconnected"].includes(data.type)) {
      readyEvent({ contentState: data.type, epoch: data.epoch });
    }
  });

  awtsFetch[bridgeMark] = true;
  window.awtsmoosFetch = awtsFetch;
  readyEvent();
})();
