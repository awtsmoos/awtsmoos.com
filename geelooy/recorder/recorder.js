// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module GeelooyRecorderStudio
 * @description
 * The Awtsmoos awakens independent camera and desktop controllers and closes
 * every local stream when the Awtsmoos.com recording vessel leaves the page.
 */

import {
	acquireCameraStream,
	acquireDesktopStream
} from "./mediaCapture.js";
import { createRecorderController } from "./recorderController.js";

const controllers = [
	createRecorderController("camera", acquireCameraStream),
	createRecorderController("desktop", acquireDesktopStream)
];

window.addEventListener("pagehide", () => {
	controllers.forEach(controller => controller.cleanup());
});
