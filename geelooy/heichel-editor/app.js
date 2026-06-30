// B"H
/**
 * @module HeichelEditorApp
 * @description
 * A small gate for Heichel governance: read the route, then let focused modules
 * render forms only when the actor and palace are truly named.
 */

import { readEditorConfig } from "./modules/config.js";
import { renderEditor } from "./modules/render.js";

renderEditor(document.querySelector("#heichel-editor-root"), readEditorConfig(location));
