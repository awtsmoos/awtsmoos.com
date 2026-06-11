//B"H
(function(){
  /**
   * B"H
   * Chapter 382: The Port Heard The Name Of Each Lamp.
   *
   * The bridge no longer shouts into a single hallway. Stop, status, and tick
   * carry conversationId when present, so one tab may rest while another keeps
   * streaming in the background, each guarded by its own name.
   *
   * @param {object} portManager Extension port router.
   * @returns {void}
   */
  function registerAwtsmoosBackgroundAutomation(portManager) {
    const engine = globalThis.AwtsmoosBgAutomationEngine;
    bind(portManager, "automation-start", async msg => await engine.startAutomation(msg.config || {}));
    bind(portManager, "automation-stop", async msg => await engine.stopAutomation(msg.reason || "stopped", msg.conversationId || msg.config?.conversationId || ""));
    bind(portManager, "automation-status", async msg => await engine.statusAutomation(msg.conversationId || msg.config?.conversationId || ""));
    bind(portManager, "automation-tick", async msg => await engine.tickAutomation("manual", msg.conversationId || msg.config?.conversationId || ""));
  }

  /** @param {object} portManager Router. @param {string} action Action name. @param {Function} fn Handler. */
  function bind(portManager, action, fn) {
    portManager.on(action, async (msg, port) => {
      try { portManager.reply(port, { result: await fn(msg), id:msg.id }); }
      catch (error) {
        const safe = globalThis.AwtsmoosBgAuthErrors?.publicError?.(error) || { status:"automation_error", error:"automation_error", safeHint:String(error?.message || error) };
        portManager.reply(port, { ok:false, status:safe.status, error:safe.error, safeHint:safe.safeHint, facts:safe.facts || {}, id:msg.id });
      }
    });
  }

  globalThis.registerAwtsmoosBackgroundAutomation = registerAwtsmoosBackgroundAutomation;
})();
