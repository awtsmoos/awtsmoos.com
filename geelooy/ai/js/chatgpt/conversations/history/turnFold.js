//B"H
import { normalizeMessage } from "../../../render/messageNormalizer.js";

/**
 * Chapter 19: The River Returned To Order.
 *
 * ChatGPT history arrives as a graph, but the eye needs a road. Event-only
 * nodes sometimes lack the exact request id of the assistant text they belong
 * to, so this fold keeps a living current turn. User messages open a turn;
 * assistant event sparks gather into that turn; assistant text receives them.
 *
 * @param {object[]} nodes Ordered conversation nodes from the history graph.
 * @returns {object[]} Message-like inputs with assistant events folded in.
 */
export function foldHistoryTurns(nodes = []) {
  const out = [];
  const pendingByTurn = new Map();
  const assistantByTurn = new Map();
  let currentTurn = "turn";

  for (const node of nodes) {
    const msg = node.message || node;
    const norm = normalizeMessage(msg);
    const explicitTurn = turnId(msg);
    if (norm.role === "user" && norm.text) currentTurn = explicitTurn;
    const turn = explicitTurn || currentTurn;

    if (!norm.text && norm.events?.length) {
      const target = assistantByTurn.get(turn) || assistantByTurn.get(currentTurn);
      if (target) appendEvents(target, norm.events);
      else pushPending(pendingByTurn, currentTurn, norm.events);
      continue;
    }

    if (norm.text && norm.role === "assistant") {
      appendEvents(msg, pendingByTurn.get(turn) || []);
      appendEvents(msg, turn === currentTurn ? [] : pendingByTurn.get(currentTurn) || []);
      pendingByTurn.delete(turn);
      pendingByTurn.delete(currentTurn);
      assistantByTurn.set(turn, msg);
      assistantByTurn.set(currentTurn, msg);
    }
    out.push(msg);
  }
  return out;
}

function pushPending(map, turn, events = []) {
  map.set(turn, [...(map.get(turn) || []), ...events]);
}

function appendEvents(msg, events = []) {
  const clean = events.filter(event => event?.kind !== "hidden" || event.text || event.raw?.type || event.raw?.event);
  if (!clean.length) return;
  msg.awtsmoosFoldedEvents = [...(msg.awtsmoosFoldedEvents || []), ...clean];
}

function turnId(msg = {}) {
  return msg.metadata?.turn_exchange_id || msg.metadata?.request_id || msg.id || "";
}
