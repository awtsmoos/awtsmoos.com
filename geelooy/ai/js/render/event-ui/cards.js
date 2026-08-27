//B"H
import { escapeHtml } from "../escapeHtml.js";
import { eventFacts, requestPayload, responsePayload } from "./eventFacts.js";
import { valueView } from "./valueView.js";
import { collectReferences } from "./referenceFacts.js";
import { safeHttpUrl } from "../safeUrl.js";

export function factsCard(title, facts = {}) {
  const chips = Object.entries(facts).map(([k, v]) => `<span class="event-chip"><b>${escapeHtml(k)}</b>${escapeHtml(short(v))}</span>`).join("");
  return `<section class="event-summary-card"><div class="event-summary-title">${escapeHtml(title)}</div><div class="event-chip-row">${chips || "details"}</div></section>`;
}

export function interpretedEvent(event = {}) {
  const sections = [factsCard("Trace fields", eventFacts(event))];
  const request = requestPayload(event);
  const response = responsePayload(event);
  if (request) sections.push(panel("Request / input", request, true));
  if (response) sections.push(panel("Result / output", response, true));
  sections.push(referencePanel(collectReferences(event)));
  sections.push(panel("All interpreted fields", event.raw || event, false));
  return sections.filter(Boolean).join("");
}

export function textPanel(title, text = "") {
  return `<section class="event-summary-card"><div class="event-summary-title">${escapeHtml(title)}</div><div class="event-markdown-source">${escapeHtml(text || "")}</div></section>`;
}

function panel(title, value, open = false) {
  return `<details class="event-payload" ${open ? "open" : ""}><summary>${escapeHtml(title)}</summary>${valueView(value)}</details>`;
}

function referencePanel(refs = []) {
  if (!refs.length) return "";
  const body = refs.map(ref => {
    const href = safeHttpUrl(ref.href);
    return href
      ? `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer"><span>${escapeHtml(ref.kind)}</span>${escapeHtml(ref.label)}</a>`
      : `<span class="event-reference-chip"><span>${escapeHtml(ref.kind)}</span>${escapeHtml(ref.label)}</span>`;
  }).join("");
  return `<section class="event-link-panel"><b>References / citations</b><div>${body}</div></section>`;
}

function short(value, max = 160) {
  const text = String(value).replace(/\s+/g, " ").trim();
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

function labelLink(link = "") {
  if (/privacy/i.test(link)) return `Privacy policy · ${link}`;
  return link;
}
