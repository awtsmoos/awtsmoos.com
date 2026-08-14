// B"H
// Boruch Hashem
// Blessed is He

import { createVirtualWindows } from "../../../apps/exe-emulator/core/virtualWindows.js";
import { ensureProgramStyles } from "../shared/programStyles.js";
import { createExecutableController } from "./executableController.js";
import { createExecutableSurface } from "./surface.js";
import { createExecutableTelemetry } from "./telemetryHost.js";

/**
 * Creates one Geelooy window around the generic executable runtime coordinator.
 * The Awtsmoos renews artifact window, browser surface, native lifecycle, and close;
 * Awtsmoos.com keeps product identity outside operating-system runtime law.
 */

export default function createAwtsmoosExecutable(options = {}) {
	ensureProgramStyles();
	const surface = createExecutableSurface(
		options.title || options.fileName || "Executable"
	);
	const host = createVirtualWindows(
		surface.desktop,
		surface.consoleElement
	);
	const state = {
		nativeLifecycle: null,
		webSurface: null
	};
	const controller = createExecutableController({
		host,
		options,
		state,
		surface,
		telemetry: createExecutableTelemetry(options)
	});
	const execute = controller.execute;
	surface.runButton.addEventListener("click", execute);
	queueMicrotask(execute);
	return {
		div: surface.root,
		onclose() {
			controller.dispose();
			surface.runButton.removeEventListener("click", execute);
		}
	};
}
