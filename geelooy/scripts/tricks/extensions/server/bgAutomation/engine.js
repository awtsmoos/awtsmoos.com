//B"H
(function(){
  const ALARM = "BH_awtsmoos_background_automation_tick";
  const MIN_DELAY_MS = 250;
  const busyConversations = new Set();
  let wakeTimer = null;

  /**
   * Chapter 105: The Engine Counted Only Living Footsteps.
   *
   * Background automation is the real driver. It waits the configured delay,
   * sends the same ChatGPT conversation POST a normal Enter would produce,
   * commits only after verification, and schedules the next turn until maxTurns.
   */
  async function startAutomation(config = {}) {
    const store = globalThis.AwtsmoosBgAutomationStorage;
    const current = await store.loadAutomationState();
    const sameConversation = current.enabled && current.conversationId === config.conversationId;
    const shouldContinue = sameConversation && Number(current.turns || 0) < Number(config.settings?.maxTurns || current.settings?.maxTurns || store.DEFAULTS.maxTurns || 3);
    const next = await store.saveAutomationState({
      enabled:true,
      turns:shouldContinue ? Number(current.turns || 0) : 0,
      status:"armed",
      phase:"armed",
      lastError:"",
      nextRunAt:0,
      pendingTurn:0,
      conversationId:config.conversationId,
      graph:config.graph || current.graph || null,
      settings:{ ...(config.settings || {}), enabled:true },
      chatgptMode:config.chatgptMode || "regular",
      chatgptModePayload:config.chatgptModePayload || {},
      prompt:config.settings?.prompt || config.prompt || "continue"
    });
    announce(next);
    scheduleSoon(10);
    tickAutomation("start").catch(error => fail(error));
    return store.publicAutomationState(next);
  }

  async function stopAutomation(reason = "stopped") {
    chrome.alarms.clear(ALARM);
    clearWakeTimer();
    return await savePublic({ enabled:false, status:reason, phase:reason, nextRunAt:0, pendingTurn:0 });
  }

  async function statusAutomation() {
    const store = globalThis.AwtsmoosBgAutomationStorage;
    return store.publicAutomationState(await store.loadAutomationState());
  }

  async function tickAutomation(reason = "tick") {
    touchAwake(`automation:${reason}`);
    const store = globalThis.AwtsmoosBgAutomationStorage;
    const state = await store.loadAutomationState();
    const settings = { ...store.DEFAULTS, ...(state.settings || {}) };
    if (!state.enabled || !state.conversationId) return store.publicAutomationState(state);
    if (busyConversations.has(state.conversationId)) return store.publicAutomationState(state);
    if (Date.now() < Number(state.nextRunAt || 0)) {
      await scheduleNext(Number(state.nextRunAt) - Date.now(), { preserveTarget:true });
      return store.publicAutomationState(await store.loadAutomationState());
    }
    if (Number(state.turns || 0) >= Number(settings.maxTurns || 0)) return await stopAutomation("done:max-turns");
    busyConversations.add(state.conversationId);
    try { return await runTurn({ state, settings, reason }); }
    catch (error) { return await fail(error, settings.stopOnError !== false); }
    finally { busyConversations.delete(state.conversationId); }
  }

  async function runTurn({ state, settings }) {
    const store = globalThis.AwtsmoosBgAutomationStorage;
    const pending = globalThis.AwtsmoosBgTurnState.beginTurn(state);
    const nextTurn = pending.pendingTurn;
    const prompt = globalThis.AwtsmoosBgAutomationGraph.chooseAutomationPrompt(state.graph, { ...state, settings, turn:nextTurn }) || state.prompt || settings.prompt;
    await savePublic({ ...pending, status:`sending:${nextTurn}`, lastPrompt:prompt, visiblePage:false });
    streamMirror({ phase:"start", conversationId:state.conversationId, prompt, turn:nextTurn, seq:0 });
    await savePublic(globalThis.AwtsmoosBgTurnState.awaitingAssistant({ pendingTurn:nextTurn, prompt }));
    const result = await globalThis.AwtsmoosBgChatGpt.sendChatGptBackground({
      conversationId:state.conversationId,
      prompt,
      chatgptMode:state.chatgptMode || settings.chatgptMode || "regular",
      chatgptModePayload:state.chatgptModePayload || settings.chatgptModePayload || {},
      onPacket:event => streamMirror({ ...event, conversationId:event.conversationId || state.conversationId, prompt, turn:nextTurn })
    });
    if (!result?.ok && !String(result?.text || "").trim()) throw new Error("Automation send was not verified by ChatGPT conversation history.");
    const fresh = await store.loadAutomationState();
    const committed = await store.saveAutomationState(globalThis.AwtsmoosBgTurnState.commitTurn(fresh, result));
    announce(committed);
    const latest = await store.loadAutomationState();
    if (!latest.enabled) return store.publicAutomationState(latest);
    if (nextTurn >= Number(settings.maxTurns || 0)) return await stopAutomation("done:max-turns");
    await scheduleNext(Number(settings.delayMs || 1000));
    return store.publicAutomationState(await store.loadAutomationState());
  }

  async function fail(error, stop = true) {
    const patch = globalThis.AwtsmoosBgTurnState.errorTurn(error);
    const next = await globalThis.AwtsmoosBgAutomationStorage.saveAutomationState(patch);
    announce(next);
    if (stop) await stopAutomation("error"); else await scheduleNext(5000);
    if (localStorageFlag()) console.warn("B'H background automation error", error?.message || error);
    return globalThis.AwtsmoosBgAutomationStorage.publicAutomationState(next);
  }

  async function savePublic(patch) {
    const next = await globalThis.AwtsmoosBgAutomationStorage.saveAutomationState(patch);
    announce(next);
    return globalThis.AwtsmoosBgAutomationStorage.publicAutomationState(next);
  }

  function announce(state) { globalThis.AwtsmoosBgPageDelegate?.broadcastAutomationState?.(globalThis.AwtsmoosBgAutomationStorage.publicAutomationState(state)); }
  function streamMirror(detail) { globalThis.AwtsmoosBgPageDelegate?.broadcastAutomationStream?.(detail); }
  function scheduleSoon(ms) { setWakeTimer(ms); chrome.alarms.create(ALARM, { delayInMinutes:Math.max(0.02, ms / 60000) }); }
  async function scheduleNext(delayMs, options = {}) {
    const ms = Math.max(MIN_DELAY_MS, Number(delayMs || 1000));
    clearWakeTimer();
    let nextState = null;
    if (!options.preserveTarget) nextState = await globalThis.AwtsmoosBgAutomationStorage.saveAutomationState(globalThis.AwtsmoosBgTurnState.scheduledNext(ms));
    else nextState = await globalThis.AwtsmoosBgAutomationStorage.loadAutomationState();
    announce(nextState);
    scheduleSoon(ms);
  }
  function setWakeTimer(ms) { clearWakeTimer(); wakeTimer = setTimeout(() => tickAutomation("timer"), Math.max(MIN_DELAY_MS, Number(ms || MIN_DELAY_MS))); }
  function clearWakeTimer() { if (wakeTimer) clearTimeout(wakeTimer); wakeTimer = null; }
  function localStorageFlag() { try { return localStorage.getItem("awtsmoosDebugAutomation") === "1"; } catch { return false; } }
  function touchAwake(reason) { try { globalThis.__awtsmoosBackgroundAwake = { ok:true, awake:true, reason, at:Date.now(), iso:new Date().toISOString() }; } catch {} }

  chrome.alarms.onAlarm.addListener(alarm => { if (alarm.name === ALARM) tickAutomation("alarm"); });
  globalThis.AwtsmoosBgAutomationEngine = { startAutomation, stopAutomation, statusAutomation, tickAutomation };
})();
