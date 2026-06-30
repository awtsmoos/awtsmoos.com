// B"H
function root(holder = {}) {
  holder.worldState ||= holder.__awtsmoosWorldState || {};
  holder.worldState.flags ||= {};
  holder.worldState.flags.cutscenesSeen ||= {};
  holder.__awtsmoosWorldState = holder.worldState;
  return holder.worldState.flags.cutscenesSeen;
}

export function isCutsceneSeen(holder = {}, id = "") {
  return Boolean(id && root(holder)[id]);
}

export function markCutsceneSeen(holder = {}, id = "", value = true) {
  if (!id) return root(holder);
  root(holder)[id] = value === false ? false : new Date().toISOString();
  return root(holder);
}

export function cutsceneSeenSnapshot(holder = {}) {
  return { ...root(holder) };
}

export default { isCutsceneSeen, markCutsceneSeen, cutsceneSeenSnapshot };
