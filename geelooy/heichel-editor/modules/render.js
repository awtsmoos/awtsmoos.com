// B"H
/**
 * @module EditorRender
 * @description
 * Renders either the governance workbench or a guarded missing-params doorway,
 * depending on whether the route names both actor and Heichel.
 */

import { el } from "./dom.js";
import { missingParamLinks } from "./routerLinks.js";
import { settingsForm } from "./forms/settingsForm.js";
import { inviteForm } from "./forms/inviteForm.js";
import { submissionForm } from "./forms/submissionForm.js";

/**
 * Renders the editor surface.
 * @param {HTMLElement|null} root mount point
 * @param {{heichelId:string,actorAlias:string,missing:string[]}} config route config
 */
export function renderEditor(root, config) {
  if (!root) return;
  root.replaceChildren(config.missing.length ? missingParams(config) : workbench(config));
}

function workbench(config) {
  return el("main", { className: "editor-shell" }, [
    el("section", { className: "editor-hero" }, [
      el("p", { text: "B\"H Heichel Governance" }),
      el("h1", { text: config.heichelId }),
      el("p", { text: `Actor: @${config.actorAlias}` })
    ]),
    settingsForm(config),
    inviteForm(config),
    submissionForm(config)
  ]);
}

function missingParams(config) {
  const copy = `Missing ${config.missing.join(" and ")}. Governance actions are disabled until the route names both.`;
  return el("main", { className: "editor-shell" }, [
    el("section", { className: "geelooy-card editor-form" }, [
      el("h1", { text: "Heichel editor needs context" }),
      el("p", { text: copy }),
      el("div", { className: "editor-actions" }, missingParamLinks().map(link =>
        el("a", { className: "soft-btn", text: link.label, attrs: { href: link.href } })
      ))
    ])
  ]);
}
