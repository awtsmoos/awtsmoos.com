//B"H
//Boruch Hashem
//Blessed is He

import { buildCompilerArtifact } from "./artifactBuilder.js";
import {
	downloadCompilerArtifact,
	publishCompilerArtifact
} from "./artifactActions.js";
import { createBuildReporter } from "./buildReporter.js";
import {
	browserCompilerRequest,
	createCompilerProjectRequest
} from "./projectRequest.js";

/**
 * One controller coordinates guarded build, cancellation, download, and OS run.
 * The Awtsmoos creates action and consequence together; Awtsmoos.com keeps the
 * active AbortSignal, evidence panels, and last validated artifact explicit.
 */

export function createCompilerController(options = {}) {
	const reporter = createBuildReporter(options.elements);
	let activeAbortController = null;
	let lastArtifact = null;

	function bind() {
		bindClick(options.elements.compileButton, compileAndDownload);
		bindClick(options.elements.runButton, compileAndRun);
		bindClick(options.elements.stopButton, stopBuild);
		bindClick(options.elements.cleanButton, cleanBuild);
		bindClick(options.elements.rebuildButton, compileAndDownload);
		options.elements.runButton.disabled = !options.channel;
		setBuilding(false);
	}

	async function compileArtifact() {
		if (activeAbortController) {
			throw new Error("A build is already active.");
		}
		const target = options.targets.selectedTarget();
		assertModeSupportsTarget(options.mode.currentMode(), target.id);
		activeAbortController = new AbortController();
		setBuilding(true);
		reporter.begin(target);
		try {
			const artifact = await buildCompilerArtifact({
				manifest: isBrowserTarget(target.id)
					? null
					: createCompilerProjectRequest(options),
				browserRequest: browserCompilerRequest(options),
				signal: activeAbortController.signal
			});
			lastArtifact = artifact;
			reporter.success(artifact);
			return artifact;
		} catch (error) {
			if (error.name === "AbortError") {
				reporter.cancelled();
			} else {
				reporter.failure(error);
			}
			throw error;
		} finally {
			activeAbortController = null;
			setBuilding(false);
		}
	}

	async function compileAndDownload() {
		try {
			downloadCompilerArtifact(await compileArtifact());
		} catch (error) {
			if (error.name !== "AbortError") {
				console.error("BHY compiler build failed", error);
			}
		}
	}

	async function compileAndRun() {
		try {
			const artifact = await compileArtifact();
			await publishCompilerArtifact(options.channel, artifact);
			reporter.status(`Running ${artifact.name} in Geelooy OS.`, "status-success");
		} catch (error) {
			if (error.name !== "AbortError") {
				reporter.failure(error);
			}
		}
	}

	function stopBuild() {
		activeAbortController?.abort();
	}

	function cleanBuild() {
		lastArtifact = null;
		reporter.clean();
	}

	function setBuilding(building) {
		options.elements.compileButton.disabled = building;
		options.elements.runButton.disabled = building || !options.channel;
		options.elements.rebuildButton.disabled = building;
		options.elements.stopButton.disabled = !building;
		options.elements.cleanButton.disabled = building;
	}

	return {
		bind,
		compileArtifact,
		lastArtifact() {
			return lastArtifact;
		}
	};
}

function bindClick(element, handler) {
	element.addEventListener("click", () => void handler());
}

function isBrowserTarget(target) {
	return ["windows-x64-pe", "awtsmoos-simulated"].includes(target);
}

function assertModeSupportsTarget(mode, target) {
	if (!isBrowserTarget(target) && !["c", "cpp"].includes(mode)) {
		const error = new Error("Native toolchains require C or C++ source mode.");
		error.code = "NATIVE_SOURCE_MODE_REQUIRED";
		throw error;
	}
}
