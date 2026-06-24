// B"H
// DOM helpers: tiny vessels for safe HTML.
export const el = id => document.getElementById(id);
export const val = id => el(id).value;
export function set(id, value) { const node = el(id); if (node) node.textContent = value; }
export function esc(v) { return String(v ?? "").replace(/[&<>'"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[c])); }
export function fillSelect(id, rows) { el(id).innerHTML = rows.map(x => `<option>${esc(x)}</option>`).join(""); }
export function setActive(parent, button) { parent.querySelectorAll("button").forEach(b => b.classList.toggle("active", b === button)); }
