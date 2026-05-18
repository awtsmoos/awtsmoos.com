//B"H
(function revealAwtsmoosServerContentBridge() {
  const bridgeKey = "__awtsmoosServerPortManager";
  const scriptKey = "__awtsmoosServerJectedInjected";

  /**
   * The content bridge is allowed to be injected again and again by Chrome.
   * Nothing here may declare page globals twice, steal window.onmessage, or
   * break when the same tab softly reincarnates. The Awtsmoos keeps the port
   * alive as a guarded singleton and forwards only messages meant for this
   * server bridge.
   */
  class AwtsmoosServerPortManager {
    constructor() {
      this.id = "BH_WOW_" + Date.now();
      this.port = null;
      this.retryInterval = 1000;
      this.maxRetries = 12;
      this.retryCount = 0;
      this.boundPageListener = event => this.onPageMessage(event);
      this.connect();
      this.listenForPageMessages();
    }

    connect() {
      try {
        console.log("Connecting to the background with id:", this.id);
        this.port = chrome.runtime.connect({ name: this.id });
        this.port.onMessage.addListener(this.onMessageReceived.bind(this));
        this.port.onDisconnect.addListener(this.onDisconnect.bind(this));
        this.retryCount = 0;
        window.postMessage({ from: "awtsmoos-content", type: "server-ready" }, "*");
      } catch (error) {
        console.error("Could not connect Awtsmoos server extension", error);
      }
    }

    listenForPageMessages() {
      globalThis.removeEventListener?.("message", this.boundPageListener);
      globalThis.addEventListener?.("message", this.boundPageListener);
    }

    onPageMessage(event) {
      const data = event?.data;
      if (!data || data.from === "background" || data.from === "awtsmoos-content") return;
      if (!data.action || !(data.id || data.action === "ping")) return;
      try {
        this.sendMessage(data);
      } catch (error) {
        console.error("Error while processing message from page:", error);
      }
    }

    onMessageReceived(message) {
      window.postMessage(message, "*");
    }

    sendMessage(message) {
      try {
        if (!this.port) throw new Error("Port is closed or disconnected.");
        this.port.postMessage(message);
      } catch (error) {
        console.log("Awtsmoos Port Error, trying to reconnect", error);
        try {
          this.connect();
          this.port?.postMessage(message);
        } catch (again) {
          console.warn("Awtsmoos reconnect failed", again);
        }
      }
    }

    onDisconnect() {
      this.port = null;
      this.retryCount++;
      if (this.retryCount <= this.maxRetries) {
        console.log(`Reconnecting... Attempt ${this.retryCount}/${this.maxRetries}`);
        setTimeout(() => this.connect(), this.retryInterval);
      } else {
        console.error("Max retries reached. Could not reconnect.");
      }
    }
  }

  if (!globalThis[bridgeKey]) globalThis[bridgeKey] = new AwtsmoosServerPortManager();

  if (!globalThis[scriptKey]) {
    globalThis[scriptKey] = true;
    const script = document.createElement("script");
    script.src = chrome.runtime.getURL("./jected.js") + "?v=" + Date.now();
    script.onload = () => script.remove();
    (document.head || document.documentElement).appendChild(script);
  }
})();
