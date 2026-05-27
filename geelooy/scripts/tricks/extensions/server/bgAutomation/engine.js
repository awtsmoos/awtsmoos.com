//B"H
(function(){
  const ALARM = "BH_awtsmoos_background_automation_tick";
  const MIN_DELAY_MS = 250;
  let busy = false;
  let wakeTimer = null;

  /**
   * Chapter 100: The Counter Stopped Lying.
   *
   * A turn is not a turn when a request merely begins. It becomes a turn only
   * after ChatGPT accepts the prompt and a settled assistant answer is recovered.
   * This prevents AUTO 2/AUTO 3 badges from appearing when no new message was
   * actually created on chatgpt.com.
   */
  async function startAutomation(config = {}) {
    const store = globalThis.AwtsmoosBgAutomationStorage;
    const current = await store.loadAutomationState();
    const sameConversation = current.enabled && current.conversationId === config.conversationId;
    const next = await store.saveAutomationState({
      enabled:true,
      turns:sameConversation ? Number(current.turns || 0) : 0,
      status:"armed",
      lastError:"",
      nextRunAt:0,
      conversationId:config.conversationId,
      graph:config.graph || null,
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
    return await savePublic({ enabled:false, status:reason, nextRunAt:0 });
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
    const nextRunAt = Number(state.nextRunAt || 0);
    if (nextRunAt && Date.now() < nextRunAt) {
      await scheduleNext(nextRunAt - Date.now(), { preserveTarget:true });
      return store.publicAutomationState(await store.loadAutomationState());
    }
    if (Number(state.turns || 0) >= Number(settings.maxTurns || 0)) return await stopAutomation("done:max-turns");
    busy = true;
    try { return await runTurn({ state, settings, reason }); }
    catch (error) { return await fail(error, settings.stopOnError !== false); }
    finally { busy = false; }
  }

  async function runTurn({ state, settings }) {
    const store = globalThis.AwtsmoosBgAutomationStorage;
    const nextTurn = Number(state.turns || 0) + 1;
    const prompt = globalThis.AwtsmoosBgAutomationGraph.chooseAutomationPrompt(state.graph, { ...state, settings, turn: nextTurn }) || state.prompt || settings.prompt;
    await savePublic({ status:`sending:${nextTurn}`, pendingTurn:nextTurn, lastPrompt:prompt, visiblePage:false, nextRunAt:0, lastError:"" });
    streamMirror({ phase:"start", conversationId:state.conversationId, prompt, turn:nextTurn, seq:0 });
    const result = await globalThis.AwtsmoosBgChatGpt.sendChatGptBackground({
      conversationId:state.conversationId,
      prompt,
      chatgptMode:state.chatgptMode || settings.chatgptMode || "regular",
      chatgptModePayload:state.chatgptModePayload || settings.chatgptModePayload || {},
      onPacket:event => streamMirror({ ...event, conversationId:event.conversationId || state.conversationId, prompt, turn:nextTurn })
    });
    if (!result?.messageId && !String(result?.text || "").trim()) throw new Error("Automation send returned no assistant message id or text.");
    const committed = await store.saveAutomationState({
      status:"waiting",
      turns:nextTurn,
      pendingTurn:0,
      lastReply:result.text || "",
      lastMessageId:result.messageId || "",
      lastConversationId:result.conversationId || state.conversationId,
      lastError:""
    });
    announce(committed);
    const latest = await store.loadAutomationState();
    if (!latest.enabled) return store.publicAutomationState(latest);
    if (nextTurn >= Number(settings.maxTurns || 0)) return await stopAutomation("done:max-turns");
    await scheduleNext(Number(settings.delayMs || 1000));
    return store.publicAutomationState(await store.loadAutomationState());
  }

  async function fail(error, stop = true) {
    const message = String(error?.stack || error?.message || error);
    const next = await globalThis.AwtsmoosBgAutomationStorage.saveAutomationState({ status:"error", pendingTurn:0, lastError:message });
    announce(next);
    if (stop) await stopAutomation("error"); else await scheduleNext(5000);
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
  function scheduleSoon(ms) { setWakeTimer(ms); chrome.alarms.create(ALARM, { delayInMinutes: Math.max(0.02, ms / 60000) }); }
  async function scheduleNext(delayMs, options = {}) {
    const ms = Math.max(MIN_DELAY_MS, Number(delayMs || 1000));
    clearWakeTimer();
    if (!options.preserveTarget) await globalThis.AwtsmoosBgAutomationStorage.saveAutomationState({ nextRunAt:Date.now() + ms });
    scheduleSoon(ms);
  }
  function setWakeTimer(ms) {
    clearWakeTimer();
    wakeTimer = setTimeout(() => tickAutomation("timer"), Math.max(MIN_DELAY_MS, Number(ms || MIN_DELAY_MS)));
  }
  function clearWakeTimer() {
    if (!wakeTimer) return;
    clearTimeout(wakeTimer);
    wakeTimer = null;
  }
  chrome.alarms.onAlarm.addListener(alarm => { if (alarm.name === ALARM) tickAutomation("alarm"); });
  globalThis.AwtsmoosBgAutomationEngine = { startAutomation, stopAutomation, statusAutomation, tickAutomation };
})();
