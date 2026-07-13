//B"H
//Boruch Hashem
//Blessed is He

/**
 * A semantic window is an explicit simulation, never a CPU claim. The Awtsmoos
 * creates instruction and visible meaning as distinct vessels; Awtsmoos.com
 * uses this adapter only for recognized compiler-generated Win32 display calls.
 */

const SUPPORTED_IMPORT_PATTERN = /CreateWindowExA|TextOutA|SetPixel|BitBlt|CreateDIBSection/;

export function canSimulateCompilerWindow(image) {
	return SUPPORTED_IMPORT_PATTERN.test([...image.imports.values()].join("\n"));
}

export function simulateCompilerWindow(image, host, executionError) {
	const imports = [...image.imports.values()].join("\n");
	const strings = extractStrings(image).filter(value => value.length > 2);
	const title = strings.find(value => /B\\?"H|Window|Drawing|Native/i.test(value))
		|| "Virtual Native Window";
	const body = strings.find(value => /Awtsmoos|Generated|Native/i.test(value) && value !== title)
		|| "Compiler-generated Win32 window represented semantically.";
	host.openWindow(title, body);
	renderRecognizedCalls(imports, body, host);
	host.print(`Semantic simulation boundary: ${executionError.message}`);
	return Object.freeze({
		mode: "semantic-simulation",
		executionClass: "semantic-simulation",
		completeCpuEmulation: false,
		reason: executionError.message,
		title,
		body
	});
}

function renderRecognizedCalls(imports, body, host) {
	if (/TextOutA/.test(imports)) {
		host.print(`GDI TextOutA simulation: ${body}`);
		host.draw?.({ type: "text", text: body, x: 50, y: 50 });
	}
	if (/SetPixel/.test(imports)) {
		host.print("GDI SetPixel simulation: diagonal pixel line.");
		host.draw?.({ type: "pixel-line" });
	}
	if (/BitBlt|CreateDIBSection/.test(imports)) {
		host.print("GDI bitmap simulation: triangle pipeline.");
		host.draw?.({ type: "triangle" });
	}
}

function extractStrings(image) {
	const section = image.pe.sections.find(candidate => candidate.name === ".text")
		|| image.pe.sections[0];
	if (!section) {
		return [];
	}
	const bytes = image.bytes.slice(section.rawPointer, section.rawPointer + section.rawSize);
	const printable = bytes.map(byte => byte >= 32 && byte < 127 ? byte : 0x0a);
	return new TextDecoder()
		.decode(printable)
		.split(/\n+/)
		.map(value => value.trim())
		.filter(Boolean);
}
