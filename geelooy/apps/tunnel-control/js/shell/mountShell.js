
// B"H

import { h } from "../ui/core/html.js";
import { ensureActivePane } from "../router/paneRouter.js";
import { normalizePaneHeadings } from "../router/paneHeadings.js";
import { createSideRail } from "./sideRail.js";
import { createDashboard } from "../dashboard/dashboard.js";
import { mountDashboardSync } from "../dashboard/activeCards.js";
import { findAppRoot, findTabRail } from "./findRoot.js";

/**
 * B"H
 * Mounts the professional shell around the existing app.
 *
 * @param {object} ctx Runtime context.
 * @returns {void}
 */
export function mountShell(ctx) {
  if (document.querySelector(".awt-control-shell")) return;

  document.body.classList.add("awt-pro-ready");
  ensureActivePane();

  const root = findAppRoot();
  const tabRail = findTabRail();
  const side = createSideRail(tabRail, ctx);
  const main = h("div", { classes: ["awt-control-main"] });
  const shell = h("div", { classes: ["awt-control-shell"] });
  const dashboard = createDashboard(ctx);

  const children = Array.from(root.childNodes).filter(node => node !== tabRail);

  main.append(dashboard);
  for (const child of children) main.append(child);

  shell.append(side, main);
  root.append(shell);

  normalizePaneHeadings();
  mountDashboardSync();

  document.getElementById("awtRefreshView")?.addEventListener("click", () => {
    document.dispatchEvent(new CustomEvent("awt:repair-ui"));
  });
}
