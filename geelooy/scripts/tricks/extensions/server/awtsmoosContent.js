//B"H
(function revealAwtsmoosServerContentBridge() {
  console.log('B"H awtsmoosContent guarded bridge v2 loaded');
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
      this.deadContext = false;
      this.reconnectTimer = null;
      this.heartbeatTimer = null;
      this.boundPageListener = event => this.onPageMessage(event);
      this.listenForPageMessages();
      this.listenForLifecycle();
      this.connectSoon(0);
    }

    listenForPageMessages() {
      globalThis.removeEventListener?.("message", this.boundPageListener);
      globalThis.addEventListener?.("message", this.boundPageListener);
    }

    listenForLifecycle() {
      globalThis.addEventListener?.("pagehide", event => {
        if (!event.persisted) return;
        this.announce("server-suspended-bfcache");
        this.disconnectQuietly("page entering BFCache");
      });
      globalThis.addEventListener?.("pageshow", event => {
        if (!event.persisted || this.deadContext) return;
        this.announce("server-restoring-bfcache");
        this.connectSoon(0);
      });
      globalThis.addEventListener?.("visibilitychange", () => {
        if (document.visibilityState === "visible" && !this.port && !this.deadContext) this.connectSoon(0);
      });
    }

    disconnectQuietly(reason = "disconnect") {
      clearInterval(this.heartbeatTimer);
      const port = this.port;
      this.port = null;
      try { port?.disconnect?.(); }
      catch (error) { this.announce("server-disconnect-skip", { reason, error: String(error?.message || error) }); }
    }

    runtimeAvailable() {
      try {
        return Boolean(globalThis.chrome?.runtime?.id && globalThis.chrome?.runtime?.connect);
      } catch (error) {
        this.markDeadContext(error);
        return false;
      }
    }

    markDeadContext(error) {
      const message = String(error?.message || error || "Extension context invalidated");
      if (/context invalidated|extension context/i.test(message)) this.deadContext = true;
      this.port = null;
      clearTimeout(this.reconnectTimer);
      clearInterval(this.heartbeatTimer);
      this.announce("server-context-invalidated", { error: message });
    }

    connectSoon(delay = this.retryDelay) {
      if (this.deadContext) return;
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = setTimeout(() => {
        if (!this.deadContext) this.connect();
      }, delay);
    }

    connect() {
      if (this.deadContext) return;
      this.epoch++;
      const epoch = this.epoch;
      try {
        if (!this.runtimeAvailable()) throw new Error("Extension runtime is not available yet.");
        this.port = chrome.runtime.connect({ name: this.id });
        this.port.onMessage.addListener(message => this.onMessageReceived(message));
        this.port.onDisconnect.addListener(() => {
          const lastError = chrome.runtime?.lastError;
          if (lastError?.message) this.announce("server-port-last-error", { error: lastError.message });
          this.onDisconnect(epoch, lastError);
        });
        this.retryDelay = 250;
        this.announce("server-ready");
        this.flushQueue();
        this.startHeartbeat();
      } catch (error) {
        this.port = null;
        const message = String(error?.message || error);
        this.announce("server-reconnecting", { error: message });
        if (/context invalidated|extension context|disconnected port object|port object/i.test(message)) return this.queueAndReconnect(null, error);
        this.retryDelay = Math.min(this.retryDelay * 1.6, this.maxRetryDelay);
        this.connectSoon(this.retryDelay);
      }
    }

    startHeartbeat() {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = setInterval(() => {
        if (this.deadContext) return clearInterval(this.heartbeatTimer);
        this.sendMessage({ action: "ping", id: "BH_HEARTBEAT_" + Date.now(), internal: true });
      }, 15000);
    }

    announce(type, extra = {}) {
      try {
        window.postMessage({ from: "awtsmoos-content", type, epoch: this.epoch, ...extra }, "*");
      } catch {}
    }

    onPageMessage(event) {
      const data = event?.data;
      if (!data || data.from === "background" || data.from === "awtsmoos-content") return;
      if (!data.action || !(data.id || data.action === "ping")) return;
      this.sendMessage(data);
    }

    onMessageReceived(message) {
      this.announce("server-message", { lastAction: message?.action, id: message?.id });
      window.postMessage(message, "*");
    }

    sendMessage(message) {
      if (this.deadContext) return this.queueMessage(message, "context invalidated");
      if (!this.port) return this.queueAndReconnect(message);
      try {
        this.port.postMessage(message);
      } catch (error) {
        this.port = null;
        const text = String(error?.message || error);
        if (/context invalidated|extension context/i.test(text)) return this.markDeadContext(error);
        if (/disconnected port object|port object/i.test(text)) return this.queueAndReconnect(message, error);
        this.queueAndReconnect(message, error);
      }
    }

    queueMessage(message) {
      if (message && !message.internal) {
        this.queue.push(message);
        if (this.queue.length > this.maxQueue) this.queue.shift();
      }
    }

    queueAndReconnect(message, error) {
      this.queueMessage(message);
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
      if (this.deadContext) return;
      this.announce("server-disconnected");
      this.retryDelay = Math.min(this.retryDelay * 1.6, this.maxRetryDelay);
      this.connectSoon(this.retryDelay);
    }
  }

  if (!globalThis[bridgeKey]) globalThis[bridgeKey] = new AwtsmoosServerPortManager();

  if (!globalThis[scriptKey]) {
    globalThis[scriptKey] = true;
    try {
      if (globalThis.chrome?.runtime?.getURL) {
        const script = document.createElement("script");
        script.src = chrome.runtime.getURL("./jected.js") + "?v=" + Date.now();
        script.onload = () => script.remove();
        (document.head || document.documentElement).appendChild(script);
      }
    } catch (error) {
      globalThis[bridgeKey]?.markDeadContext?.(error);
    }
  }
})();
