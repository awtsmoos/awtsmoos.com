// B"H
/**
 * @module EditorField
 * @description
 * Form fields as small vessels: label first, control second, readable by eye
 * and by assistive technology.
 */

import { el } from "../dom.js";

/**
 * Creates a labeled input, textarea, or select.
 * @param {string} name field name
 * @param {string} label field label
 * @param {"text"|"textarea"|"select"|"number"} type control type
 * @param {string[]} options select options
 * @returns {HTMLLabelElement}
 */
export function field(name, label, type = "text", options = []) {
  const tag = type === "textarea" ? "textarea" : type === "select" ? "select" : "input";
  const attrs = tag === "input" ? { name, type } : { name };
  const control = el(tag, { attrs }, options.map(option => el("option", { text: option, attrs: { value: option } })));
  return el("label", {}, [document.createTextNode(label), control]);
}
