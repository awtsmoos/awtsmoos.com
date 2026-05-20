//B"H
import { normalizeMessage } from "../../../render/messageNormalizer.js";

/**
 * Chapter 18: The Turn Became One Vessel.
 *
 * History must not hang thoughts before the user who caused them. Event-only
 * siblings wait until the next assistant text for that turn/request. User text
 * passes through cleanly, and hidden preamble noise never becomes a pre-user
 * visual trace.
 *
 * @param {object[]} nodes Ordered conversation nodes from the history graph.
 * @returns {object[]} Message-like inputs with assistant events folded in.
 */
export function foldHistoryTurns(nodes = []) {
  const out = [];
  const pendingByTurn = new Map();
  const assistantByTurn = new Map();
  for (const node of nodes) {
    const msg = node.message || node;
    const norm = normalizeMessage(msg);
    const turn = turnId(msg);
    if (!norm.text && norm.events?.length) {
      const target = assistantByTurn.get(turn);
      if (target) appendEvents(target, norm.events);
      else pendingByTurn.set(turn, [...(pendingByTurn.get(turn) || []), ...norm.events]);
      continue;
    }
    if (norm.text && norm.role === "assistant") {
      appendEvents(msg, pendingByTurn.get(turn) || []);
      pendingByTurn.delete(turn);
      assistantByTurn.set(turn, msg);
    }
    out.push(msg);
  }
  return out;
}

function appendEvents(msg, events = []) {
  const clean = events.filter(event => event?.kind !== "hidden" || event.text || event.raw?.type || event.raw?.event);
  if (!clean.length) return;
  msg.awtsmoosFoldedEvents = [...(msg.awtsmoosFoldedEvents || []), ...clean];
}

function turnId(msg = {}) {
  return msg.metadata?.turn_exchange_id || msg.metadata?.request_id || msg.id || "turn";
}
