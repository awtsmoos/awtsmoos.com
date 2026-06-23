// B"H
// Rendering the revealed sparks without exposing what the user kept private.
import { stats } from "./state.js";

export function render(entries) {
  const s = stats(entries);
  setText("totalDeposits", s.total);
  setText("publicDeposits", s.publicCount);
  setText("streakCount", s.streak);
  renderLedger(entries);
  renderProfile(entries.filter(item => item.profileVisible));
}

export function renderTemplates(templates, onPick) {
  const target = document.getElementById("templateButtons");
  target.innerHTML = templates.map(item => `<button class="chip" data-title="${escapeHtml(item)}">${escapeHtml(item)}</button>`).join("");
  target.querySelectorAll("button").forEach(button => button.addEventListener("click", () => onPick(button.dataset.title)));
}

function setText(id, value) { document.getElementById(id).textContent = value; }

function renderLedger(entries) {
  const list = document.getElementById("ledgerList");
  list.innerHTML = entries.map(entryTemplate).join("") || "<p>The pushkuh is open. Drop the first hachlata.</p>";
}

function renderProfile(entries) {
  const list = document.getElementById("profileList");
  list.innerHTML = entries.map(profileTemplate).join("") || "<p>No public sparks yet.</p>";
}

function entryTemplate(entry) {
  return `<article class="entry ${entry.demo ? "demo" : ""}"><b>${escapeHtml(entry.title)}</b><div class="meta">${escapeHtml(entry.type)} · ${escapeHtml(entry.status)} · ${escapeHtml(entry.visibility)} · ${dateLabel(entry)}</div>${entry.note ? `<p>${escapeHtml(entry.note)}</p>` : ""}<div class="meter"><span style="width:${entry.intensity * 20}%"></span></div></article>`;
}

function profileTemplate(entry) {
  const status = entry.socialDraft?.status || entry.status;
  return `<article class="spark"><b>${escapeHtml(entry.title)}</b><div class="meta">${escapeHtml(status)} · ${escapeHtml(entry.type)} · ${escapeHtml(entry.visibility)}</div><p>${escapeHtml(entry.note || "A mitzvah spark was placed in the pushkuh.")}</p></article>`;
}

function dateLabel(entry) {
  return new Date(entry.createdAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, char => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", "'":"&#39;", '"':"&quot;" }[char]));
}
