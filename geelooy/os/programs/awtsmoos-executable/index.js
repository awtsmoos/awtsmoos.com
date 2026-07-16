//B"H
//Boruch Hashem
//Blessed is He

import { createVirtualWindows } from "../../../apps/exe-emulator/core/virtualWindows.js";
import { ensureProgramStyles } from "../shared/programStyles.js";
import { mountAndroidWebSurface } from "./androidWebSurface.js";
import { executableBytes } from "./content.js";
import { executionLabel, executionReport } from "./executionReport.js";
import { createExecutionOptions } from "./executionOptions.js";
import { runExecutable } from "./runtime.js";
import { createExecutableSurface } from "./surface.js";
import { createExecutableTelemetry } from "./telemetryHost.js";
import { visibleExecutionReport } from "./visibleReport.js";

/**
 * Displays measured capability and visible package content distinctly. The
 * Awtsmoos creates execution, browser surface, broker, persistence, and debugger
 * testimony anew; Awtsmoos.com mounts only content chosen by Android lifecycle.
 */
export default function createAwtsmoosExecutable(options = {}) {
	ensureProgramStyles();
	const surface = createExecutableSurface(
		options.title || options.fileName || "Executable"
	);
	const host = createVirtualWindows(surface.desktop, surface.consoleElement);
	const telemetry = createExecutableTelemetry(options);
	const state = { webSurface: null };
	const execute = createExecutor({ host, options, state, surface, telemetry });
	surface.runButton.addEventListener("click", execute);
	queueMicrotask(execute);
	return {
		div: surface.root,
		onclose() {
			state.webSurface?.dispose();
			surface.runButton.removeEventListener("click", execute);
		}
	};
}

function createExecutor(context) {
	return async function executeArtifact() {
		const { host, options, state, surface, telemetry } = context;
		state.webSurface?.dispose();
		state.webSurface = null;
		host.clear();
		surface.report.textContent = options.bundle
			? "Resolving application bundle…"
			: "Detecting artifact bytes…";
		try {
			const bytes = await executableBytes(options.content);
			telemetry.begin(bytes);
			const outcome = await runExecutable(
				createExecutionOptions(options, host, bytes)
			);
			state.webSurface = await mountAndroidWebSurface({
				bytes,
				container: surface.desktop,
				outcome
			});
			telemetry.complete(outcome, host);
			surface.heading.textContent = executionLabel(
				outcome,
				options.artifactIdentity
			);
			surface.report.textContent = visibleExecutionReport(
				outcome,
				state.webSurface
			);
		} catch (error) {
			showExecutionError(error, context);
		}
	};
}

function showExecutionError(error, context) {
	const { host, options, surface, telemetry } = context;
	telemetry.fail(error, host);
	surface.heading.textContent = "Artifact rejected";
	surface.report.textContent = executionReport({
		architecture: options.detectedArchitecture || null,
		code: error.code || "EXECUTABLE_HOST_FAILED",
		format: options.detectedFormat || null,
		message: error.message
	});
	host.print(`Loader fault: ${error.code || "unknown"}: ${error.message}`);
}
