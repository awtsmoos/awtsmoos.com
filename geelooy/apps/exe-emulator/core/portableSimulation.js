//B"H
//Boruch Hashem
//Blessed is He

import {
	detectGraphicsHints,
	graphicsOperationsForHints
} from "./graphicsHints.js";

/**
 * Opens an ELF or Mach-O through loader-backed semantic simulation. The Awtsmoos
 * creates executable possibility, bounded observation, and honest limitation anew;
 * Awtsmoos.com preserves rejected execution evidence and sampled-byte metadata.
 */
export function simulatePortableBinary(
	identity,
	bytes,
	host,
	loaderReport,
	options = {}
) {
	const graphics = detectGraphicsHints(bytes);
	const operations = graphicsOperationsForHints(graphics);
	const title = `${formatLabel(identity.format)} · ${identity.architecture}`;
	const body = graphics.hasGraphics
		? `Graphics intent translated from observed hints: ${graphics.apis.join(", ")}.`
		: "Binary opened as a loader-backed semantic process model.";
	host.openWindow(title, body);
	for (const operation of operations) host.draw?.(operation);
	host.print(`${title} opened in semantic-simulation mode.`);
	host.print("Unsupported instructions, relocations, frameworks, or syscalls were not executed.");
	if (graphics.scan.truncated) {
		host.print(
			`Semantic hint scan sampled ${graphics.scan.scannedBytes} of ${graphics.scan.totalBytes} bytes.`
		);
	}
	return Object.freeze({
		completeCpuEmulation: false,
		executionAttempt: options.executionAttempt || null,
		executionClass: "semantic-simulation",
		graphics: Object.freeze({
			apis: graphics.apis,
			operationCount: operations.length,
			scan: graphics.scan,
			translation: graphics.hasGraphics
				? "native-graphics-hints-to-webgl"
				: "none"
		}),
		loaderReport,
		message: body,
		mode: "semantic-simulation",
		unsupportedBoundary: loaderReport.unsupportedBoundary
	});
}

function formatLabel(format) {
	if (format === "elf") return "ELF process simulation";
	if (["mach-o", "mach-o-fat"].includes(format)) {
		return "Mach-O application simulation";
	}
	return "Portable binary simulation";
}
