//B"H
(function(){
  const ALARM = "BH_awtsmoos_background_automation_tick";
  let busy = false;
  let wakeTimer = null;

  async function startAutomation(config = {}) {
    const store = globalThis.AwtsmoosBgAutomationStorage;
    const next = await store.saveAutomationState({
      enabled:true, turns:0, status:"armed", lastError:"", conversationId:config.conversationId,
      graph:config.graph || null, settings:{ ...(config.settings || {}), enabled:true },
      chatgptMode:config.chatgptMode || "regular", chatgptModePayload:config.chatgptModePayload || {},
      prompt:config.settings?.prompt || config.prompt || "continue"
    });
    announce(next);
    schedule(0.02);
    tickAutomation("start").catch(error => fail(error));
    return store.publicAutomationState(next);
  }

  async function stopAutomation(reason = "stopped") {
    chrome.alarms.clear(ALARM);
    clearWakeTimer();
    return await savePublic({ enabled:false, status:reason });
  }

  async function statusAutomation() {
    const store = globalThis.AwtsmoosBgAutomationStorage;
    return store.publicAutomationState(await store.loadAutomationState());
  }

  async function tickAutomation(reason = "tick") {
    if (busy) return await statusAutomation();
    const store = globalThis.AwtsmoosBgAutomationStorage;
    const state = await store.loadAutomationState();
    const settings = { ...store.DEFAULTS, ...(state.settings || {}) };
    if (!state.enabled || !state.conversationId) return store.publicAutomationState(state);
    if (Number(state.turns || 0) >= Number(settings.maxTurns || 0)) return await stopAutomation("done:max-turns");
    busy = true;
    try { return await runTurn({ state, settings, reason }); }
    catch (error) { return await fail(error, settings.stopOnError !== false); }
    finally { busy = false; }
  }

  async function runTurn({ state, settings }) {
    const store = globalThis.AwtsmoosBgAutomationStorage;
    const turn = Number(state.turns || 0) + 1;
    const prompt = globalThis.AwtsmoosBgAutomationGraph.chooseAutomationPrompt(state.graph, { ...state, settings, turn }) || state.prompt || settings.prompt;
    await savePublic({ status:`sending:${turn}`, turns:turn, lastPrompt:prompt, visiblePage:false });
    streamMirror({ phase:"start", conversationId:state.conversationId, prompt, turn, seq:0 });
    const result = await globalThis.AwtsmoosBgChatGpt.sendChatGptBackground({
      conversationId:state.conversationId,
      prompt,
      chatgptMode:state.chatgptMode || settings.chatgptMode || "regular",
      chatgptModePayload:state.chatgptModePayload || settings.chatgptModePayload || {},
      onPacket:event => streamMirror({ ...event, conversationId:event.conversationId || state.conversationId, prompt, turn })
    });
    const next = await store.saveAutomationState({
      status:"waiting", lastReply:result.text || "", lastMessageId:result.messageId || "",
      lastConversationId:result.conversationId || state.conversationId, lastError:""
    });
    announce(next);
    const latest = await store.loadAutomationState();
    if (!latest.enabled) return store.publicAutomationState(latest);
    if (turn >= Number(settings.maxTurns || 0)) return await stopAutomation("done:max-turns");
    scheduleNext(Number(settings.delayMs || 1000));
    return store.publicAutomationState(next);
  }

  async function fail(error, stop = true) {
    const next = await globalThis.AwtsmoosBgAutomationStorage.saveAutomationState({ status:"error", lastError:String(error?.stack || error?.message || error) });
    announce(next);
    if (stop) await stopAutomation("error"); else schedule(1);
    console.warn("B'H background automation error", error?.message || error);
    return globalThis.AwtsmoosBgAutomationStorage.publicAutomationState(next);
  }

  async function savePublic(patch) {
    const next = await globalThis.AwtsmoosBgAutomationStorage.saveAutomationState(patch);
    announce(next);
    return globalThis.AwtsmoosBgAutomationStorage.publicAutomationState(next);
  }

  function announce(state) { globalThis.AwtsmoosBgPageDelegate?.broadcastAutomationState?.(globalThis.AwtsmoosBgAutomationStorage.publicAutomationState(state)); }
  function streamMirror(detail) { globalThis.AwtsmoosBgPageDelegate?.broadcastAutomationStream?.(detail); }
  function schedule(delayInMinutes) { chrome.alarms.create(ALARM, { delayInMinutes }); }
  function scheduleNext(delayMs) {
    const ms = Math.max(100, Number(delayMs || 1000));
    clearWakeTimer();
    schedule(Math.max(0.02, ms / 60000));
    wakeTimer = setTimeout(() => tickAutomation("timer"), ms);
  }
  function clearWakeTimer() {
    if (!wakeTimer) return;
    clearTimeout(wakeTimer);
    wakeTimer = null;
  }
  chrome.alarms.onAlarm.addListener(alarm => { if (alarm.name === ALARM) tickAutomation("alarm"); });
  globalThis.AwtsmoosBgAutomationEngine = { startAutomation, stopAutomation, statusAutomation, tickAutomation };
})();
