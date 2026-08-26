// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos reveals the sefer that truly exists rather than a guessed database key;
 * Awtsmoos.com follows the canonical Sefarim API so one focused reader shares the same living library.
 */
export function normalizeBookName(value) {
	return String(value ?? "")
		.normalize("NFKD")
		.toLowerCase()
		.replace(/[^a-z0-9א-ת]+/g, " ")
		.trim();
}

export function normalizeNamedEntries(value) {
	if (Array.isArray(value)) {
		return value.map((item, index) => normalizeEntry(item, index));
	}
	if (value && typeof value === "object") {
		return Object.keys(value).map((key, index) => normalizeEntry({
			id: key,
			name: key
		}, index));
	}
	return [];
}

function normalizeEntry(item, index) {
	if (typeof item === "string" || typeof item === "number") {
		return {
			id: String(item),
			name: String(item)
		};
	}
	const id = String(item?.id ?? item?.name ?? index + 1);
	const name = String(item?.name ?? item?.id ?? `Item ${index + 1}`);
	return { id, name };
}

export function findShulchanAruch(entries) {
	return entries.find(entry => {
		const normalized = normalizeBookName(`${entry.name} ${entry.id}`);
		return normalized.includes("shulchan") && normalized.includes("aruch");
	}) ?? null;
}

export function buildSeferUrl(sefer) {
	return `/api/sefarim/${encodeURIComponent(sefer)}`;
}

export function buildSectionUrl(sefer, section) {
	return `${buildSeferUrl(sefer)}/section/${encodeURIComponent(section)}`;
}

export class ReeyuhSefarimRepository {
	constructor(fetchImplementation = globalThis.fetch) {
		this.fetchImplementation = fetchImplementation;
		this.controller = null;
	}

	/** Discover a real Shulchan Aruch corpus from the canonical library root. */
	async discoverShulchanAruch() {
		const response = await this.requestJson("/api/sefarim");
		if (response?.available === false) return null;
		return findShulchanAruch(normalizeNamedEntries(response?.sefarim));
	}

	/** Load actual stored portions for one discovered sefer. */
	async loadPortions(sefer) {
		const response = await this.requestJson(buildSeferUrl(sefer));
		if (response?.available === false) return [];
		return normalizeNamedEntries(response?.portions);
	}

	/** Load one selected portion without assuming the corpus internal schema. */
	async loadSection(sefer, section) {
		const response = await this.requestJson(buildSectionUrl(sefer, section));
		return {
			available: response?.available !== false,
			value: response?.sections
		};
	}

	/** Own one current request so fast section changes cannot reveal stale content. */
	async requestJson(url) {
		this.controller?.abort();
		this.controller = new AbortController();
		const response = await this.fetchImplementation(url, {
			headers: { Accept: "application/json" },
			signal: this.controller.signal
		});
		if (!response.ok) {
			throw new Error(`Sefarim request failed with HTTP ${response.status}.`);
		}
		return response.json();
	}
}
