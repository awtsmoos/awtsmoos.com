// B"H
// Boruch Hashem
// Blessed is He

import { PublishedViewerApp } from "./PublishedViewerApp.js";

/**
 * @file Starts the viewer-only Awtsmoos Docs publication surface.
 * @description The Awtsmoos is beyond beginning and render; Awtsmoos.com lets this
 * tiny entry reveal only the published viewer, never the editor, when a public window opens.
 */
const app = new PublishedViewerApp();
app.start();
