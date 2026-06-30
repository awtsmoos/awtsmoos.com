//B"H
(function(){
  const ALARM_PREFIX = "BH_awtsmoos_background_automation_tick:";
  const MIN_DELAY_MS = 250;
  const busyConversations = new Set();
  const wakeTimers = new Map();

  /**
   * B"H
   * Chapter 382: Many Thrones Remembered The Single Old Throne.
   *
   * The multi-conversation engine still walks every active run when the new
   * vault exists, but it now bows to older/test storage vessels that only know
   * `loadAutomationState`. Continuation no longer breaks because one scroll is
   * missing a plural doorway.
   */
  async function startAutomation(config = {}) {
    const store = globalThis.AwtsmoosBgAutomationStorage;
    const conversationId = String(config.conversationId || "");
    if (!conversationId) throw new Error("conversationId_required");
    const current = await store.loadAutomationState(conversationId);
    const shouldContinue = current.enabled && Number(current.turns || 0) < Number(config.settings?.maxTurns || current.settings?.maxTurns || store.DEFAULTS.maxTurns);
    const next = await store.saveAutomationState({ enabled:true, turns:shouldContinue ? Number(current.turns || 0) : 0, status:"armed", phase:"armed", lastError:"", nextRunAt:0, pendingTurn:0, conversationId, graph:config.graph || current.graph || null, settings:{ ...(config.settings || {}), enabled:true }, chatgptMode:config.chatgptMode || "regular", chatgptModePayload:config.chatgptModePayload || {}, prompt:config.settings?.prompt || config.prompt || "continue" }, conversationId);
    announce(next); scheduleSoon(conversationId, 10); tickAutomation("start", conversationId).catch(error => fail(conversationId, error));
    return store.publicAutomationState(next);
  }

  async function stopAutomation(reason = "stopped", conversationId = "") {
    const store = globalThis.AwtsmoosBgAutomationStorage;
    const targets = await targetStates(conversationId);
    for (const state of targets) { clearSchedule(state.conversationId); await savePublic({ enabled:false, status:reason, phase:reason, nextRunAt:0, pendingTurn:0 }, state.conversationId); }
    return conversationId ? await statusAutomation(conversationId) : { ok:true, enabled:false, status:reason, runs:publicList(await allStates()) };
  }

  async function statusAutomation(conversationId = "") {
    const store = globalThis.AwtsmoosBgAutomationStorage;
    if (conversationId) return store.publicAutomationState(await store.loadAutomationState(conversationId));
    const runs = await allStates(), active = runs.filter(run => run.enabled);
    return { ok:true, enabled:Boolean(active.length), status:active.length ? "multi-active" : "off", runs:publicList(runs), activeCount:active.length };
  }

  async function tickAutomation(reason = "tick", conversationId = "") {
    touchAwake(`automation:${reason}`);
    const states = conversationId ? [await load(conversationId)] : await dueStates();
    const results = [];
    for (const state of states) if (state?.conversationId) results.push(await tickOne(state, reason));
    return conversationId ? results[0] : { ok:true, processed:results.length, results };
  }

  async function tickOne(state) {
    const store = globalThis.AwtsmoosBgAutomationStorage;
    const settings = { ...store.DEFAULTS, ...(state.settings || {}) };
    if (!state.enabled || !state.conversationId) return store.publicAutomationState(state);
    if (busyConversations.has(state.conversationId)) return store.publicAutomationState(state);
    if (Date.now() < Number(state.nextRunAt || 0)) return await scheduleNext(state.conversationId, Number(state.nextRunAt) - Date.now(), { preserveTarget:true });
    if (Number(state.turns || 0) >= Number(settings.maxTurns || 0)) return await stopAutomation("done:max-turns", state.conversationId);
    busyConversations.add(state.conversationId);
    try { return await runTurn({ state, settings }); }
    catch (error) { return await fail(state.conversationId, error, settings.stopOnError !== false); }
    finally { busyConversations.delete(state.conversationId); }
  }

  async function runTurn({ state, settings }) {
    const store = globalThis.AwtsmoosBgAutomationStorage;
    const pending = globalThis.AwtsmoosBgTurnState.beginTurn(state), nextTurn = pending.pendingTurn;
    const prompt = globalThis.AwtsmoosBgAutomationGraph.chooseAutomationPrompt(state.graph, { ...state, settings, turn:nextTurn }) || state.prompt || settings.prompt;
    await savePublic({ ...pending, status:`sending:${nextTurn}`, lastPrompt:prompt, visiblePage:false }, state.conversationId);
    streamMirror({ phase:"start", conversationId:state.conversationId, prompt, turn:nextTurn, seq:0 });
    await savePublic(globalThis.AwtsmoosBgTurnState.awaitingAssistant({ pendingTurn:nextTurn, prompt }), state.conversationId);
    const result = await globalThis.AwtsmoosBgChatGpt.sendChatGptBackground({ conversationId:state.conversationId, prompt, chatgptMode:state.chatgptMode || settings.chatgptMode || "regular", chatgptModePayload:state.chatgptModePayload || settings.chatgptModePayload || {}, onPacket:event => streamMirror({ ...event, conversationId:event.conversationId || state.conversationId, prompt, turn:nextTurn }) });
    if (!result?.ok && !String(result?.text || "").trim()) throw new Error("Automation send was not verified by ChatGPT conversation history.");
    const fresh = await store.loadAutomationState(state.conversationId);
    const committed = await store.saveAutomationState(globalThis.AwtsmoosBgTurnState.commitTurn(fresh, result), state.conversationId);
    announce(committed);
    const latest = await store.loadAutomationState(state.conversationId);
    if (!latest.enabled) return store.publicAutomationState(latest);
    if (nextTurn >= Number(settings.maxTurns || 0)) return await stopAutomation("done:max-turns", state.conversationId);
    return await scheduleNext(state.conversationId, Number(settings.delayMs || 1000));
  }

  async function fail(conversationId, error, stop = true) {
    const patch = globalThis.AwtsmoosBgTurnState.errorTurn(error);
    const next = await globalThis.AwtsmoosBgAutomationStorage.saveAutomationState(patch, conversationId);
    announce(next);
    if (stop) await stopAutomation("error", conversationId); else await scheduleNext(conversationId, 5000);
    if (localStorageFlag()) console.warn("B'H background automation error", error?.message || error);
    return globalThis.AwtsmoosBgAutomationStorage.publicAutomationState(next);
  }

  async function allStates() { const store = globalThis.AwtsmoosBgAutomationStorage; return typeof store.loadAllAutomationStates === "function" ? await store.loadAllAutomationStates() : [await store.loadAutomationState("")]; }
  async function dueStates() { return (await allStates()).filter(run => run.enabled && Date.now() >= Number(run.nextRunAt || 0)); }
  async function targetStates(id) { return id ? [await load(id)] : await allStates(); }
  async function load(id) { return await globalThis.AwtsmoosBgAutomationStorage.loadAutomationState(id); }
  async function savePublic(patch, id) { const next = await globalThis.AwtsmoosBgAutomationStorage.saveAutomationState(patch, id); announce(next); return globalThis.AwtsmoosBgAutomationStorage.publicAutomationState(next); }
  function publicList(states = []) { const store = globalThis.AwtsmoosBgAutomationStorage; return typeof store.publicAutomationList === "function" ? store.publicAutomationList(states) : states.map(state => store.publicAutomationState(state)); }
  function announce(state) { globalThis.AwtsmoosBgPageDelegate?.broadcastAutomationState?.(globalThis.AwtsmoosBgAutomationStorage.publicAutomationState(state)); }
  function streamMirror(detail) { globalThis.AwtsmoosBgPageDelegate?.broadcastAutomationStream?.(detail); }
  async function scheduleNext(id, delayMs, options = {}) { const ms = Math.max(MIN_DELAY_MS, Number(delayMs || 1000)); const next = options.preserveTarget ? await load(id) : await globalThis.AwtsmoosBgAutomationStorage.saveAutomationState(globalThis.AwtsmoosBgTurnState.scheduledNext(ms), id); announce(next); scheduleSoon(id, ms); return globalThis.AwtsmoosBgAutomationStorage.publicAutomationState(next); }
  function alarmName(id) { return `${ALARM_PREFIX}${id}`; }
  function scheduleSoon(id, ms) { clearSchedule(id); wakeTimers.set(id, setTimeout(() => tickAutomation("timer", id), Math.max(MIN_DELAY_MS, Number(ms || MIN_DELAY_MS)))); chrome.alarms.create(alarmName(id), { delayInMinutes:Math.max(0.02, Number(ms || MIN_DELAY_MS) / 60000) }); }
  function clearSchedule(id) { const timer = wakeTimers.get(id); if (timer) clearTimeout(timer); wakeTimers.delete(id); chrome.alarms.clear(alarmName(id)); }
  function localStorageFlag() { try { return localStorage.getItem("awtsmoosDebugAutomation") === "1"; } catch { return false; } }
  function touchAwake(reason) { try { globalThis.__awtsmoosBackgroundAwake = { ok:true, awake:true, reason, at:Date.now(), iso:new Date().toISOString() }; } catch {} }

  chrome.alarms.onAlarm.addListener(alarm => { if (String(alarm.name || "").startsWith(ALARM_PREFIX)) tickAutomation("alarm", alarm.name.slice(ALARM_PREFIX.length)); });
  globalThis.AwtsmoosBgAutomationEngine = { startAutomation, stopAutomation, statusAutomation, tickAutomation };
})();
