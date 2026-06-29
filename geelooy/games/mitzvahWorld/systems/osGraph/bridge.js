// B"H
import { objectTypeForUiEvent, safeClone, summarizePayload } from "./summary.js";

const APP_ID = "application:mitzvah-world";

function graphOf(win) { return win?.os?.graph || win?.AwtsmoosOS?.graph || null; }
function routeOf(win) { return win?.location?.href || "/games/mitzvahWorld/"; }
function idPart(value) { return String(value || "unknown").replace(/[^a-z0-9:_-]+/gi, "-").slice(0, 80); }

function makeState(win, options = {}) {
  return win.__MITZVAH_WORLD_OS_GRAPH__ ||= {
    seal:"mitzvah-world-os-graph-bridge-20260629-bh1",
    sessionId:options.sessionId || `mitzvah-world:${Date.now()}`,
    records:new Map(),
    events:[],
    errors:[]
  };
}

function remember(state, record) {
  state.records.set(record.id, record);
  state.events.push({ id:record.id, type:record.type, at:Date.now() });
  state.events = state.events.slice(-48);
  return record;
}

function upsert(win, record) {
  const state = makeState(win);
  remember(state, record);
  const graph = graphOf(win);
  if (!graph?.upsert) return record;
  try { graph.upsert(record); }
  catch (error) { state.errors.push({ message:String(error?.message || error), id:record.id }); }
  return record;
}

function baseRecord(type, id, data = {}) {
  return { type, id, title:data.title || id, data:{ source:"mitzvah-world", ...data } };
}

function recordBoot(win) {
  const state = makeState(win);
  upsert(win, baseRecord("application", APP_ID, { title:"Mitzvah World", route:routeOf(win) }));
  upsert(win, baseRecord("object", `game-session:${state.sessionId}`, {
    title:"Mitzvah World Session", route:routeOf(win), kind:"game-session"
  }));
}

function recordLoading(win, input = {}) {
  const stage = idPart(input.stage || input.kind || "loading");
  const total = Number(input.total ?? input.amount ?? 0) || 0;
  upsert(win, baseRecord("event", `event:mitzvah-world-loading:${stage}`, {
    title:`Mitzvah World loading ${stage}`, stage, total, payload:safeClone(input)
  }));
  upsert(win, baseRecord("metric", "metric:mitzvah-world-loading", {
    title:"Mitzvah World loading", stage, total, updatedAt:Date.now()
  }));
}

function recordUi(win, name, payload) {
  const type = objectTypeForUiEvent(name);
  upsert(win, baseRecord(type, `${type}:mitzvah-world-ui:${idPart(name)}`, {
    title:`Mitzvah UI ${name}`, uiEvent:name, payload:summarizePayload(payload)
  }));
}

function wrapLoadingProgress(win) {
  const progress = win.__AWTSMOOS_LOADING_PROGRESS__;
  if (!progress || progress.__mitzvahGraphWrapped) return false;
  const original = progress.update?.bind(progress);
  if (!original) return false;
  progress.update = input => { recordLoading(win, input || {}); return original(input); };
  progress.__mitzvahGraphWrapped = true;
  return true;
}

function wrapUiBridge(win) {
  const bridge = win.__MITZVAH_UI_BRIDGE__;
  if (!bridge?.receive || bridge.__mitzvahGraphWrapped) return false;
  const original = bridge.receive.bind(bridge);
  bridge.receive = (name, payload) => { recordUi(win, name, payload); return original(name, payload); };
  bridge.__mitzvahGraphWrapped = true;
  return true;
}

export function installMitzvahWorldOsGraphBridge(win = globalThis.window, options = {}) {
  if (!win) return null;
  const state = makeState(win, options);
  if (options.sessionId) state.sessionId = options.sessionId;
  recordBoot(win);
  wrapLoadingProgress(win);
  wrapUiBridge(win);
  const retries = Math.max(0, options.retries ?? 40);
  const delay = Math.max(20, options.delay ?? 250);
  let left = retries;
  const poll = () => {
    wrapLoadingProgress(win);
    const done = wrapUiBridge(win);
    if (!done && left-- > 0) win.setTimeout?.(poll, delay);
  };
  if (retries) win.setTimeout?.(poll, delay);
  return state;
}

installMitzvahWorldOsGraphBridge();
