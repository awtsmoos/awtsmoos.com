// B"H
const { esc } = require("./Shell.js");

const PORTALS = Object.freeze([
  ["Treasury OS", "/api/tunnel/control/treasury/home", "command center"],
  ["Budgets", "/api/tunnel/control/treasury/budgets", "spending vessels"],
  ["Marketplace", "/api/tunnel/control/treasury/marketplace", "seller splits"],
  ["Providers", "/api/tunnel/control/treasury/providers", "margin spread"],
  ["Bank", "/api/tunnel/control/bank", "balance gate"],
  ["Compute", "/api/tunnel/control/compute", "peruta supply"],
  ["Apps Code", "/apps/code/", "builder editor"],
  ["Virtual OS", "/os", "desktop vessel"],
  ["Tunnel Control", "/apps/tunnel-control/", "local bridge"]
]);

/** B"H: launch pads bind the Treasury to every Awtsmoos surface. */
function portalGrid() {
  return `<section class="awt-card"><h2>Launch Surfaces</h2><div class="awt-portal-grid">${PORTALS.map(card).join("")}</div></section>`;
}
function card([label, href, note]) {
  return `<a class="awt-portal" href="${esc(href)}"><b>${esc(label)}</b><span>${esc(note)}</span><small>${esc(href)}</small></a>`;
}
module.exports = { PORTALS, portalGrid };
