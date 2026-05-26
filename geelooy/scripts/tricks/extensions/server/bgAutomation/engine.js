//B"H
(function(){
  const ALARM = "BH_awtsmoos_background_automation_tick";
  let busy = false;

  async function startAutomation(config = {}) {
    const store = globalThis.AwtsmoosBgAutomationStorage;
    const next = await store.saveAutomationState({
      enabled:true, turns:0, status:"armed", lastError:"",
      conversationId:config.conversationId,
      graph:config.graph || null,
      settings:{ ...(config.settings || {}), enabled:true },
      prompt:config.settings?.prompt || config.prompt || "continue"
    });
    schedule(0.02);
    tickAutomation("start").catch(error => fail(error));
    return store.publicAutomationState(next);
  }

  async function stopAutomation(reason = "stopped") {
    chrome.alarms.clear(ALARM);
    const store = globalThis.AwtsmoosBgAutomationStorage;
    return store.publicAutomationState(await store.saveAutomationState({ enabled:false, status:reason }));
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
    const graph = globalThis.AwtsmoosBgAutomationGraph;
    const chat = globalThis.AwtsmoosBgChatGpt;
    const turn = Number(state.turns || 0) + 1;
    const prompt = graph.chooseAutomationPrompt(state.graph, { ...state, settings, turn }) || state.prompt || settings.prompt;
    await store.saveAutomationState({ status:`sending:${turn}`, turns:turn, lastPrompt:prompt });
    const result = await chat.sendChatGptBackground({ conversationId:state.conversationId, prompt });
    const next = await store.saveAutomationState({
      status:"waiting", lastReply:result.text || "", lastMessageId:result.messageId || "",
      lastConversationId:result.conversationId || state.conversationId, lastError:""
    });
    if (turn >= Number(settings.maxTurns || 0)) return await stopAutomation("done:max-turns");
    schedule(Math.max(0.02, Number(settings.delayMs || 1000) / 60000));
    return store.publicAutomationState(next);
  }

  async function fail(error, stop = true) {
    const store = globalThis.AwtsmoosBgAutomationStorage;
    const next = await store.saveAutomationState({ status:"error", lastError:String(error?.stack || error?.message || error) });
    if (stop) await stopAutomation("error"); else schedule(1);
    console.warn("B'H background automation error", error?.message || error);
    return store.publicAutomationState(next);
  }

  function schedule(delayInMinutes) { chrome.alarms.create(ALARM, { delayInMinutes }); }
  chrome.alarms.onAlarm.addListener(alarm => { if (alarm.name === ALARM) tickAutomation("alarm"); });
  globalThis.AwtsmoosBgAutomationEngine = { startAutomation, stopAutomation, statusAutomation, tickAutomation };
})();
