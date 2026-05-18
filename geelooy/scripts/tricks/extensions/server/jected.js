//B"H
(function revealAwtsmoosFetchIntoPage() {
  console.log(`B"H\nAwtsmoos server fetch bridge awake`);
  const readyEvent = () => window.dispatchEvent(new CustomEvent("awtsmoos-server-ready", {
    detail: { transport: "extension", at: Date.now() }
  }));

  if (window.awtsmoosFetch && window.awtsmoosFetch.__awtsmoosServerBridge) {
    window.__awtsmoosServerReady = true;
    readyEvent();
    return;
  }

  class AwtsResponse {
    constructor(metadata, id) {
      Object.assign(this, metadata);
      this.id = id;
      this.bodyUsed = false;
      this.headers = new Headers(Array.isArray(metadata?.headers) ? metadata.headers : []);
    }

    clone() {
      return new AwtsResponse({
        status: this.status,
        ok: this.ok,
        headers: Array.from(this.headers.entries()),
        url: this.url,
        redirected: this.redirected,
        type: this.type || "basic"
      }, this.id);
    }

    async _requestBody(action) {
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          window.removeEventListener("message", onMessage);
          reject(new Error(`Awtsmoos extension timed out while reading ${action}.`));
        }, 120000);

        function onMessage(event) {
          if (event.data?.from === "background" && event.data.id === thisId) {
            clearTimeout(timeout);
            window.removeEventListener("message", onMessage);
            if (event.data.error) reject(new Error(event.data.error));
            else resolve(event.data.result);
          }
        }

        const thisId = this.id;
        window.addEventListener("message", onMessage);
        window.postMessage({ action: "fetch-body", id: this.id, bodyAction: action }, "*");
      });
    }

    async text() {
      this.bodyUsed = true;
      return await this._requestBody("text");
    }

    async json() {
      return JSON.parse(await this.text());
    }

    async blob() {
      const url = await this._requestBody("blob");
      return await (await fetch(url)).blob();
    }

    get body() {
      return {
        getReader: () => {
          let done = false;
          return {
            read: async () => {
              if (done) return { done: true, value: undefined };
              const value = await this._requestBody("read");
              if (value === null) {
                done = true;
                return { done: true, value: undefined };
              }
              const blob = await (await fetch(value)).blob();
              const uint8Array = new Uint8Array(await blob.arrayBuffer());
              return { done: false, value: uint8Array };
            }
          };
        }
      };
    }
  }

  function awtsFetch(url, options = {}) {
    const id = `BH_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        window.removeEventListener("message", onMessage);
        reject(new Error("Awtsmoos extension fetch timed out."));
      }, 120000);

      function onMessage(event) {
        if (event.data?.from === "background" && event.data.id === id) {
          clearTimeout(timeout);
          window.removeEventListener("message", onMessage);
          if (event.data.error) reject(new Error(event.data.error));
          else resolve(new AwtsResponse(event.data.metadata, id));
        }
      }

      window.addEventListener("message", onMessage);
      window.postMessage({ action: "fetch", id, url: String(url), options }, "*");
    });
  }

  awtsFetch.__awtsmoosServerBridge = true;
  window.awtsmoosFetch = awtsFetch;
  window.__awtsmoosServerReady = true;
  readyEvent();
})();
