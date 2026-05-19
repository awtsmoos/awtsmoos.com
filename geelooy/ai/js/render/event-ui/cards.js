//B"H
import { escapeHtml } from "../escapeHtml.js";
import { eventFacts, importantLinks, requestPayload, responsePayload } from "./eventFacts.js";
import { valueView } from "./valueView.js";

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
  sections.push(linkPanel(importantLinks(event)));
  sections.push(panel("All interpreted fields", event.raw || event, false));
  return sections.filter(Boolean).join("");
}

export function textPanel(title, text = "") {
  return `<section class="event-summary-card"><div class="event-summary-title">${escapeHtml(title)}</div><div class="event-markdown-source">${escapeHtml(text || "")}</div></section>`;
}

function panel(title, value, open = false) {
  return `<details class="event-payload" ${open ? "open" : ""}><summary>${escapeHtml(title)}</summary>${valueView(value)}</details>`;
}

function linkPanel(links = []) {
  if (!links.length) return "";
  const body = links.map(link => `<a href="${escapeHtml(link)}" target="_blank" rel="noreferrer">${escapeHtml(labelLink(link))}</a>`).join("");
  return `<section class="event-link-panel"><b>Links / policy / external references</b><div>${body}</div></section>`;
}

function short(value, max = 160) {
  const text = String(value).replace(/\s+/g, " ").trim();
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

function labelLink(link = "") {
  if (/privacy/i.test(link)) return `Privacy policy · ${link}`;
  return link;
}
