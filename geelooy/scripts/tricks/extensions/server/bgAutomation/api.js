//B"H
(function(){
  function registerAwtsmoosBackgroundAutomation(portManager) {
    const engine = globalThis.AwtsmoosBgAutomationEngine;
    bind(portManager, "automation-start", async msg => await engine.startAutomation(msg.config || {}));
    bind(portManager, "automation-stop", async msg => await engine.stopAutomation(msg.reason || "stopped"));
    bind(portManager, "automation-status", async () => await engine.statusAutomation());
    bind(portManager, "automation-tick", async () => await engine.tickAutomation("manual"));
  }

  function bind(portManager, action, fn) {
    portManager.on(action, async (msg, port) => {
      try { portManager.reply(port, { result: await fn(msg), id:msg.id }); }
      catch (error) { portManager.reply(port, { error:String(error?.stack || error), id:msg.id }); }
    });
  }

  globalThis.registerAwtsmoosBackgroundAutomation = registerAwtsmoosBackgroundAutomation;
})();
