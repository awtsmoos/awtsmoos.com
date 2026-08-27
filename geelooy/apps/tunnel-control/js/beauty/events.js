// B"H

import { loadBeautyState, saveBeautyState } from "./state.js";

const listeners = new Set();

/**
 * B"H
 * Chapter 391: Events Became Sparks In A Timeline.
 */
export function recordBeautyEvent(type, label, detail = {}) {
  const entry = { type, label, detail, time: Date.now() };
  const state = loadBeautyState();
  const timeline = [entry, ...(state.timeline || [])].slice(0, 80);
  saveBeautyState({ timeline });
  for (const listener of listeners) listener(entry, timeline);
  document.dispatchEvent(new CustomEvent("awt:beauty-event", { detail: entry }));
  return entry;
}

export function onBeautyEvent(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function readTimeline() {
  return loadBeautyState().timeline || [];
}
