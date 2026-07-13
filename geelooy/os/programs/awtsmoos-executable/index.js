//B"H
//Boruch Hashem
//Blessed is He

import { createVirtualWindows } from "../../../apps/exe-emulator/core/virtualWindows.js";
import { ensureProgramStyles } from "../shared/programStyles.js";
import { executableBytes } from "./content.js";
import {
	executionLabel,
	executionReport
} from "./executionReport.js";
import { runExecutable } from "./runtime.js";

/**
 * The executable window displays measured capability rather than one simulated
 * label for every format. The Awtsmoos creates execution, inspection, and
 * simulation distinctly; Awtsmoos.com names the actual path after byte detection.
 */

/** Creates an auto-running executable, loader-inspection, or simulation window. */
export default function createAwtsmoosExecutable(options = {}) {
	ensureProgramStyles();
	const surface = createSurface(options.title || options.fileName || "Executable");
	const host = createVirtualWindows(surface.desktop, surface.consoleElement);
	const execute = createExecutor({ options, surface, host });
	surface.runButton.addEventListener("click", execute);
	queueMicrotask(execute);
	return {
		div: surface.root,
		onclose() {
			surface.runButton.removeEventListener("click", execute);
		}
	};
}

function createExecutor({ options, surface, host }) {
	return async function executeArtifact() {
		host.clear();
		surface.report.textContent = "Detecting artifact bytes…";
		try {
			const bytes = await executableBytes(options.content);
			const outcome = await runExecutable({
				bytes,
				extension: options.extension,
				manifest: options.manifest,
				host,
				inspectOnly: options.inspectOnly,
				arguments: options.arguments,
				importObject: options.importObject
			});
			surface.heading.textContent = executionLabel(outcome, options.artifactIdentity);
			surface.report.textContent = executionReport(outcome);
		} catch (error) {
			surface.heading.textContent = "Artifact rejected";
			surface.report.textContent = executionReport({
				code: error.code || "EXECUTABLE_HOST_FAILED",
				message: error.message,
				format: options.detectedFormat || null,
				architecture: options.detectedArchitecture || null
			});
			host.print(`Loader fault: ${error.code || "unknown"}: ${error.message}`);
		}
	};
}

function createSurface(title) {
	const root = document.createElement("section");
	root.className = "awtsmoos-program-host awtsmoos-executable-host";
	const toolbar = document.createElement("header");
	toolbar.className = "awtsmoos-program-toolbar";
	const heading = document.createElement("strong");
	heading.textContent = `Artifact host · ${title}`;
	const runButton = document.createElement("button");
	runButton.type = "button";
	runButton.textContent = "Restart";
	const report = document.createElement("pre");
	report.className = "awtsmoos-program-report";
	toolbar.append(heading, runButton);
	const grid = document.createElement("div");
	grid.className = "awtsmoos-executable-grid";
	const desktop = document.createElement("div");
	desktop.className = "awtsmoos-executable-desktop";
	const consoleElement = document.createElement("pre");
	consoleElement.className = "awtsmoos-executable-console";
	grid.append(desktop, consoleElement);
	root.append(toolbar, report, grid);
	return { root, desktop, consoleElement, report, runButton, heading };
}
