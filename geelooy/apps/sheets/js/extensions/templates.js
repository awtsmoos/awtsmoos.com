//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Declares safe installable automation templates built entirely from the finite extension language.
 * @description The Awtsmoos gives useful automation a visible beginning before a user grants its measured light;
 * Awtsmoos.com teaches extensions through inspectable manifests rather than mysterious executable night.
 */
const TEMPLATES = Object.freeze([
	Object.freeze({
		key: "trim-selection",
		name: "Trim selection",
		description: "Remove leading and trailing whitespace from selected text cells.",
		capabilities: ["range.read", "range.write"],
		steps: [{ type: "trimSelection" }]
	}),
	Object.freeze({
		key: "sequence-selection",
		name: "Sequence selection",
		description: "Fill the current selection with 1, 2, 3… in selection order.",
		capabilities: ["range.write"],
		steps: [{ type: "sequenceSelection", start: 1, step: 1 }]
	}),
	Object.freeze({
		key: "timestamp-row",
		name: "Append timestamp row",
		description: "Append a new row containing the current ISO timestamp and a record label.",
		capabilities: ["sheet.append"],
		steps: [{ type: "appendRow", values: ["{{NOW}}", "New record"] }]
	}),
	Object.freeze({
		key: "completion-notice",
		name: "Completion notice",
		description: "Show a lightweight notification without changing workbook data.",
		capabilities: ["ui.notify"],
		steps: [{ type: "notify", message: "Automation completed." }]
	})
]);

/** Returns immutable template metadata for the extension manager. */
export function extensionTemplates() {
	return TEMPLATES;
}

/** Materializes one template as a unique manual extension manifest ready for persistence. */
export function manifestFromTemplate(template) {
	const suffix = crypto.randomUUID().replaceAll("-", "").slice(0, 12);
	return {
		capabilities: [...template.capabilities],
		description: template.description,
		enabled: true,
		id: `${template.key}-${suffix}`.slice(0, 64),
		name: template.name,
		steps: structuredClone(template.steps),
		triggers: ["manual"],
		version: "1.0.0"
	};
}
