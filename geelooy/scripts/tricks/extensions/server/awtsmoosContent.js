//B"H
(function revealAwtsmoosServerContentBridge() {
  const bridgeKey = "__awtsmoosServerPortManager";
  const scriptKey = "__awtsmoosServerJectedInjected";

  /**
   * B"H — The Port Guardian stands in the shaking hallway between the page
   * and the extension. Chrome may reload the background, close the channel,
   * or invalidate the old world without warning; this guardian accepts that
   * every connection is temporary and every message must be queued until the
   * Awtsmoos reveals a fresh path again.
   */
  class AwtsmoosServerPortManager {
    constructor() {
      this.id = "BH_WOW_" + Date.now() + "_" + Math.random().toString(36).slice(2);
      this.port = null;
      this.epoch = 0;
      this.queue = [];
      this.maxQueue = 300;
      this.retryDelay = 250;
      this.maxRetryDelay = 5000;
      this.reconnectTimer = null;
      this.heartbeatTimer = null;
      this.boundPageListener = event => this.onPageMessage(event);
      this.listenForPageMessages();
      this.connectSoon(0);
    }

    listenForPageMessages() {
      globalThis.removeEventListener?.("message", this.boundPageListener);
      globalThis.addEventListener?.("message", this.boundPageListener);
    }

    connectSoon(delay = this.retryDelay) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = setTimeout(() => this.connect(), delay);
    }

    connect() {
      this.epoch++;
      const epoch = this.epoch;
      try {
        if (!chrome?.runtime?.id) throw new Error("Extension runtime is not available yet.");
        this.port = chrome.runtime.connect({ name: this.id });
        this.port.onMessage.addListener(message => this.onMessageReceived(message));
        this.port.onDisconnect.addListener(() => this.onDisconnect(epoch));
        this.retryDelay = 250;
        this.announce("server-ready");
        this.flushQueue();
        this.startHeartbeat();
      } catch (error) {
        this.port = null;
        this.announce("server-reconnecting", { error: String(error?.message || error) });
        this.retryDelay = Math.min(this.retryDelay * 1.6, this.maxRetryDelay);
        this.connectSoon(this.retryDelay);
      }
    }

    startHeartbeat() {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = setInterval(() => {
        this.sendMessage({ action: "ping", id: "BH_HEARTBEAT_" + Date.now(), internal: true });
      }, 15000);
    }

    announce(type, extra = {}) {
      window.postMessage({ from: "awtsmoos-content", type, epoch: this.epoch, ...extra }, "*");
    }

    onPageMessage(event) {
      const data = event?.data;
      if (!data || data.from === "background" || data.from === "awtsmoos-content") return;
      if (!data.action || !(data.id || data.action === "ping")) return;
      this.sendMessage(data);
    }

    onMessageReceived(message) {
      window.postMessage(message, "*");
    }

    sendMessage(message) {
      if (!this.port) return this.queueAndReconnect(message);
      try {
        this.port.postMessage(message);
      } catch (error) {
        this.port = null;
        this.queueAndReconnect(message, error);
      }
    }

    queueAndReconnect(message, error) {
      if (message && !message.internal) {
        this.queue.push(message);
        if (this.queue.length > this.maxQueue) this.queue.shift();
      }
      this.announce("server-reconnecting", { error: String(error?.message || error || "closed") });
      this.connectSoon();
    }

    flushQueue() {
      const pending = this.queue.splice(0);
      for (const message of pending) this.sendMessage(message);
    }

    onDisconnect(epoch) {
      if (epoch !== this.epoch) return;
      this.port = null;
      clearInterval(this.heartbeatTimer);
      this.announce("server-disconnected");
      this.retryDelay = Math.min(this.retryDelay * 1.6, this.maxRetryDelay);
      this.connectSoon(this.retryDelay);
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
