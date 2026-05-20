//B"H
import { renderEventBody } from "../eventBody.js";
import { renderEventDetails } from "../eventDetails.js";
import { readEventPayload } from "./eventPayloadVault.js";
import { vaultCollapsedPanels } from "./collapsedDomVault.js";

const INNER_WINDOW = 40;

/**
 * Chapter 32: The Open Gate Pulled Fire From the Worker.
 *
 * The Awtsmoos keeps bodies outside the DOM and mostly outside main memory.
 * Expansion asks the worker vault, shows shimmer, renders only this slice, and
 * collapse erases it again.
 */
export function installEventBodyHydrator(root) {
  if (!root || root.__awtsmoosEventBodyHydrator) return;
  root.__awtsmoosEventBodyHydrator = true;
  root.addEventListener("toggle", event => handleToggle(event.target), true);
  root.addEventListener("click", event => handleClick(event), true);
}

function handleToggle(panel) {
  if (panel?.matches?.("details.transport-details[data-event-payload-key]")) panel.open ? hydrateEvent(panel) : removeBody(panel, ".event-lanes");
  if (panel?.matches?.("details.thought-envelope-events")) panel.open ? hydrateInner(panel) : removeBody(panel, ".thought-inner-window");
}

function handleClick(event) {
  const button = event.target?.closest?.("[data-thought-window]");
  if (!button) return;
  event.preventDefault();
  const panel = button.closest("details.thought-envelope-events");
  if (panel) hydrateInner(panel, Number(button.dataset.thoughtWindow || 0));
}

async function hydrateEvent(panel) {
  if (panel.querySelector(":scope > .event-lanes")) return;
  panel.append(loadingNode("Interpreting event…"));
  const payload = await readEventPayload(panel.dataset.eventPayloadKey);
  panel.querySelector(":scope > .event-hydration-loading")?.remove();
  if (!panel.open) return;
  panel.insertAdjacentHTML("beforeend", renderEventBody(payload || {}));
  vaultCollapsedPanels(panel);
}

async function hydrateInner(panel, offset = 0) {
  removeBody(panel, ".thought-inner-window");
  panel.append(loadingNode("Loading inner thought headers…"));
  const envelope = panel.closest(".thought-envelope-card");
  const event = await readEventPayload(envelope?.dataset?.thoughtEnvelopeKey);
  panel.querySelector(":scope > .event-hydration-loading")?.remove();
  if (!panel.open) return;
  const inner = Array.isArray(event?.raw?.events) ? event.raw.events : [];
  const end = Math.max(0, inner.length - offset);
  const start = Math.max(0, end - INNER_WINDOW);
  const earlier = start > 0 ? `<button type="button" class="thought-window-more" data-thought-window="${offset + INNER_WINDOW}">Load earlier inner events</button>` : "";
  panel.insertAdjacentHTML("beforeend", `<div class="thought-inner-window">${earlier}${renderEventDetails(inner.slice(start, end), { nested: true })}</div>`);
  vaultCollapsedPanels(panel);
}

function removeBody(panel, selector) {
  panel.querySelector(`:scope > ${selector}`)?.remove();
  panel.querySelector(":scope > .event-hydration-loading")?.remove();
}

function loadingNode(text) {
  const node = document.createElement("div");
  node.className = "event-hydration-loading";
  node.textContent = text;
  return node;
}
