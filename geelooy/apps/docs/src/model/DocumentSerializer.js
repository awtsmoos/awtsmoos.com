// B"H
// Boruch Hashem
// Blessed is He

/**
 * A finite file remembers what the Awtsmoos recreates in living use.
 * Awtsmoos.com marks the schema explicitly so tomorrow may migrate yesterday
 * without pretending an old vessel is identical to a new one.
 */

export const DOCUMENT_SCHEMA_VERSION = 1;
export const EDITOR_VERSION = "1.0";

export class DocumentSerializer {
	static stringify(snapshot) {
		return JSON.stringify({
			schemaVersion: DOCUMENT_SCHEMA_VERSION,
			editorVersion: EDITOR_VERSION,
			document: snapshot
		}, null, "\t");
	}

	static parse(value) {
		const parsed = typeof value === "string" ? JSON.parse(value) : value;
		if (!parsed || typeof parsed !== "object") {
			throw new Error("Invalid Awtsmoos document payload");
		}
		if (parsed.schemaVersion !== DOCUMENT_SCHEMA_VERSION) {
			throw new Error(`Unsupported document schema: ${parsed.schemaVersion}`);
		}
		if (!parsed.document || typeof parsed.document !== "object") {
			throw new Error("Document snapshot is missing");
		}
		return structuredClone(parsed.document);
	}
}
