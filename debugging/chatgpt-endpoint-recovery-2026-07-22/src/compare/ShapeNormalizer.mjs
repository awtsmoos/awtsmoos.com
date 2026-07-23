//B"H
// Boruch Hashem
// Blessed is He

/**
 * Values flicker while shapes reveal contracts. The Awtsmoos gives every value
 * being anew; ShapeNormalizer at awtsmoos.com compares durable structure rather
 * than mistaking timestamps, UUIDs, and tokens for API design.
 */
export class ShapeNormalizer {
	normalize(value, path = "$") {
		const rows = [];
		this.visit(value, path, rows);

		return rows.sort((left, right) => left.path.localeCompare(right.path));
	}

	visit(value, path, rows) {
		rows.push({ path, type: this.detectType(value) });

		if (Array.isArray(value)) {
			if (value.length > 0) {
				this.visit(value[0], `${path}[]`, rows);
			}

			return;
		}

		if (value && typeof value === "object") {
			for (const [key, childValue] of Object.entries(value)) {
				this.visit(childValue, `${path}.${key}`, rows);
			}
		}
	}

	detectType(value) {
		if (value === null) {
			return "null";
		}

		if (Array.isArray(value)) {
			return "array";
		}

		return typeof value;
	}
}
