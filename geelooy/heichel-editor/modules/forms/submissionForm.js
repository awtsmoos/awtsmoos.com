// B"H
/**
 * @module SubmissionForm
 * @description
 * Sends a lightweight review submission through the same named actor context.
 */

import { el } from "../dom.js";
import { field } from "./field.js";
import { formShell } from "./formShell.js";

/**
 * Builds the submission form.
 * @param {object} config route config
 * @returns {HTMLFormElement}
 */
export function submissionForm(config) {
  return formShell(config, `/api/social/heichelos/${config.heichelId}/submissions/full`, "B\"H submitted.", [
    field("title", "Submission title"),
    field("content", "Submission content", "textarea"),
    field("seriesId", "Series ID"),
    el("button", { className: "gold-btn", text: "Submit Post For Review", attrs: { type: "submit" } })
  ]);
}
