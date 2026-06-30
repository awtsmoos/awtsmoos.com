// B"H
/**
 * @module InviteForm
 * @description
 * Sends a role invitation into the Heichel without hiding who is acting.
 */

import { el } from "../dom.js";
import { field } from "./field.js";
import { formShell } from "./formShell.js";

/**
 * Builds the invite form.
 * @param {object} config route config
 * @returns {HTMLFormElement}
 */
export function inviteForm(config) {
  return formShell(config, `/api/social/heichelos/${config.heichelId}/invites`, "B\"H invite sent.", [
    field("toAlias", "Alias to invite"),
    field("role", "Role", "select", ["admin", "contributor"]),
    el("button", { className: "soft-btn", text: "Invite", attrs: { type: "submit" } })
  ]);
}
