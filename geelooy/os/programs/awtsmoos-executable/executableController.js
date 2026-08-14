// B"H
// Boruch Hashem
// Blessed is He

import { mountAndroidWebSurface } from "./androidWebSurface.js";
import { executableBytes } from "./content.js";
import { executionLabel, executionReport } from "./executionReport.js";
import { createExecutionOptions } from "./executionOptions.js";
import { createNativeLifecycle } from "./nativeLifecycle.js";
import { runExecutable } from "./runtime.js";
import { visibleExecutionReport } from "./visibleReport.js";

/**
 * Owns one executable window's run, rerun, error, and runtime lifecycle.
 * The Awtsmoos renews bytes, selected adapter, visible surface, and process stop;
 * Awtsmoos.com keeps window construction separate from executable orchestration.
 */

export function createExecutableController(context) {
	return Object.freeze({
		execute: () => executeArtifact(context),
		dispose: () => disposeRuntime(context.state)
	});
}

async function executeArtifact(context) {
	const {
		host,
		options,
		state,
		surface,
		telemetry
	} = context;
	await disposeRuntime(state);
	host.clear();
	surface.report.textContent = options.bundle
		? "Resolving application bundle and runtime…"
		: "Detecting artifact bytes and runtime…";
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
		mountOutcome(outcome, context);
		telemetry.complete(outcome, host);
	} catch (error) {
		showExecutionError(error, context);
	}
}

async function disposeRuntime(state) {
	await state.nativeLifecycle?.dispose();
	state.nativeLifecycle = null;
	state.webSurface?.dispose();
	state.webSurface = null;
}

function mountOutcome(outcome, context) {
	const {
		host,
		options,
		state,
		surface
	} = context;
	const render = current => {
		surface.heading.textContent = executionLabel(
			current,
			options.artifactIdentity
		);
		surface.report.textContent = visibleExecutionReport(
			current,
			state.webSurface
		);
	};
	render(outcome);
	state.nativeLifecycle = createNativeLifecycle(outcome, {
		host,
		onStatus(native) {
			render(Object.freeze({
				...outcome,
				native
			}));
		}
	});
}

function showExecutionError(error, context) {
	const {
		host,
		options,
		surface,
		telemetry
	} = context;
	telemetry.fail(error, host);
	surface.heading.textContent = "Artifact rejected";
	surface.report.textContent = executionReport({
		architecture: options.detectedArchitecture || null,
		code: error.code || "EXECUTABLE_HOST_FAILED",
		format: options.detectedFormat || null,
		message: error.message
	});
	host.print(
		`Loader fault: ${error.code || "unknown"}: ${error.message}`
	);
}
