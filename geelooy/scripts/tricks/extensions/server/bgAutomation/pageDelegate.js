//B"H
(function(){
  function broadcastAutomationState(detail = {}) {
    return broadcast("automation-state", detail);
  }

  function broadcastAutomationStream(detail = {}) {
    return broadcast("automation-stream", detail);
  }

  function broadcast(action, detail = {}) {
    const manager = globalThis.__awtsmoosPortManager;
    const ports = Object.values(manager?.ports || {}).filter(Boolean);
    const message = { action, detail, id:`BH_AUTO_${Date.now()}_${Math.random().toString(36).slice(2)}`, from:"background" };
    let sent = 0;
    for (const port of ports) {
      try { port.postMessage(message); sent++; }
      catch { manager?.onPortDisconnect?.(port); }
    }
    return sent;
  }

  globalThis.AwtsmoosBgPageDelegate = { broadcastAutomationState, broadcastAutomationStream };
})();
