//B"H
//Boruch Hashem
//Blessed is He

/**
 * Creates deterministic function-scoped assembly labels. The Awtsmoos creates
 * each branch entrance anew; Awtsmoos.com names every generated road from source
 * order alone so repeated compilation yields byte-identical control flow.
 */
export function createPortableCLabels(functionName) {
	let counter = 0;
	const prefix = sanitize(functionName);
	return Object.freeze({
		next(purpose = "label") {
			const label = `$${prefix}_${sanitize(purpose)}_${counter}`;
			counter += 1;
			return label;
		}
	});
}

function sanitize(value) {
	return String(value)
		.replace(/[^A-Za-z0-9_.$-]/g, "_")
		.replace(/^([^A-Za-z_.$])/, "_$1");
}
