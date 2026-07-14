//B"H
//Boruch Hashem
//Blessed is He

import { createVirtualWindows } from "../../../apps/exe-emulator/core/virtualWindows.js";
import { ensureProgramStyles } from "../shared/programStyles.js";
import { executableBytes } from "./content.js";
import { executionLabel, executionReport } from "./executionReport.js";
import { runExecutable } from "./runtime.js";
import { createExecutableTelemetry } from "./telemetryHost.js";

/**
 * The executable window displays measured capability rather than one simulated
 * label for every format. The Awtsmoos creates execution, debugger testimony, and
 * simulation distinctly; Awtsmoos.com preserves the selected application contract.
 */
export default function createAwtsmoosExecutable(options = {}) {
	ensureProgramStyles();
	const surface = createSurface(options.title || options.fileName || "Executable");
	const host = createVirtualWindows(surface.desktop, surface.consoleElement);
	const telemetry = createExecutableTelemetry(options);
	const execute = createExecutor({ options, surface, host, telemetry });
	surface.runButton.addEventListener("click", execute);
	queueMicrotask(execute);
	return {
		div: surface.root,
		onclose() {
			surface.runButton.removeEventListener("click", execute);
		}
	};
}

function createExecutor({ options, surface, host, telemetry }) {
	return async function executeArtifact() {
		host.clear();
		surface.report.textContent = options.bundle
			? "Resolving application bundle…"
			: "Detecting artifact bytes…";
		try {
			const bytes = await executableBytes(options.content);
			telemetry.begin(bytes);
			const outcome = await runExecutable({
				arguments: options.arguments,
				artifactIdentity: options.artifactIdentity,
				bundle: options.bundle,
				bytes,
				extension: options.extension,
				host,
				importObject: options.importObject,
				inspectOnly: options.inspectOnly,
				instructionLimit: options.instructionLimit,
				manifest: options.manifest,
				maximumBytes: options.maximumBytes,
				maximumStackBytes: options.maximumStackBytes,
				stackSize: options.stackSize
			});
			telemetry.complete(outcome, host);
			surface.heading.textContent = executionLabel(outcome, options.artifactIdentity);
			surface.report.textContent = executionReport(outcome);
		} catch (error) {
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
