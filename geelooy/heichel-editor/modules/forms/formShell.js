// B"H
/**
 * @module EditorFormShell
 * @description
 * Wraps each governance form with shared submit handling and inline status.
 */

import { el } from "../dom.js";
import { postEditorRequest } from "../api.js";
import { createStatus } from "../status.js";

/**
 * Creates a submitting editor form.
 * @param {object} config route config
 * @param {string} endpoint API endpoint
 * @param {string} success success message
 * @param {Node[]} children form contents
 * @returns {HTMLFormElement}
 */
export function formShell(config, endpoint, success, children) {
  const status = createStatus();
  const form = el("form", {
    className: "geelooy-card editor-form",
    on: { submit: event => submitForm(event, config, endpoint, success, status) }
  }, [...children, status.node]);
  return form;
}

async function submitForm(event, config, endpoint, success, status) {
  event.preventDefault();
  const button = event.currentTarget.querySelector("button[type='submit']");
  const data = Object.fromEntries(new FormData(event.currentTarget));
  try {
    if (button) button.disabled = true;
    status.set("Saving...", "info");
    await postEditorRequest(endpoint, config.actorAlias, data);
    status.set(success, "success");
  } catch (error) {
    status.set(error.message || "Request failed.", "error");
  } finally {
    if (button) button.disabled = false;
  }
}
