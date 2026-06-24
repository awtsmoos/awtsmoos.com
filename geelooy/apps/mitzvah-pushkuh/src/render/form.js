// B"H
// The form is only a temporary vessel for the ritual.
import { el, val } from "./dom.js";
export function formValues() { return { title: val("title"), note: val("note"), type: val("type"), visibility: val("visibility"), time: val("time"), intensity: val("intensity") }; }
export function clearForm() { el("title").value = ""; el("note").value = ""; }
