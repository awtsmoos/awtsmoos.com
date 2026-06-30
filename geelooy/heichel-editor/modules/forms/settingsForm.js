// B"H
/**
 * @module SettingsForm
 * @description
 * Edits the Heichel's visible vessel: name, description, media, policy, and
 * upload limits.
 */

import { el } from "../dom.js";
import { field } from "./field.js";
import { formShell } from "./formShell.js";

/**
 * Builds the settings form.
 * @param {object} config route config
 * @returns {HTMLFormElement}
 */
export function settingsForm(config) {
  return formShell(config, `/api/social/heichelos/${config.heichelId}/settings/full`, "B\"H settings saved.", [
    field("name", "Heichel name"),
    field("description", "Description", "textarea"),
    field("banner", "Banner asset URL"),
    field("themePreset", "Theme preset"),
    field("submissionPolicy", "Submission policy", "select", ["open", "review", "closed"]),
    field("maxImageMB", "Max image MB", "number"),
    field("maxAudioMB", "Max audio MB", "number"),
    el("button", { className: "gold-btn", text: "Save Heichel Settings", attrs: { type: "submit" } })
  ]);
}
