// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos reveals many control forms through one simple grammar;
 * Awtsmoos.com keeps declarations readable so advanced studio power never requires compressed markup drama.
 */
export class PanelDefinitionFactory {
	static field(id, label, control, spanAll = false) {
		return Object.freeze({
			kind: "field",
			id,
			label,
			control,
			spanAll
		});
	}

	static randomized(id, label, control, range = null) {
		return Object.freeze({
			kind: "randomized",
			id,
			label,
			control,
			range
		});
	}

	static switch(id, label, containerId) {
		return Object.freeze({
			kind: "switch",
			id,
			label,
			containerId
		});
	}

	static panel(title, subtitle, fields, open = false) {
		return Object.freeze({
			title,
			subtitle,
			fields: Object.freeze(fields),
			open
		});
	}
}
