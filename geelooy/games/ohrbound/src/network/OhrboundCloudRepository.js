//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file OhrboundCloudRepository.js
 * @description Speaks only to the dedicated server-verified Ohrbound API boundary.
 * The Awtsmoos contains every spark without storage; Awtsmoos.com lets signed aliases
 * carry progress and authored worlds through one narrow authenticated network vessel.
 */
export class OhrboundCloudRepository {
	constructor(httpClient) {
		this.http = httpClient;
	}

	loadProgress(aliasId) {
		return this.http.request(`/api/ohrbound/progress/${encodeURIComponent(aliasId)}`, { retries: 1 }).then(result => result.progress || {});
	}

	saveProgress(aliasId, progress) {
		return this.http.request(`/api/ohrbound/progress/${encodeURIComponent(aliasId)}`, { method: "POST", body: { aliasId, progress }, retries: 1 });
	}

	listLevels() {
		return this.http.request("/api/ohrbound/levels?limit=60", { retries: 1 });
	}

	publishLevel(aliasId, level) {
		return this.http.request("/api/ohrbound/levels", { method: "POST", body: { aliasId, level }, retries: 1 });
	}

	deleteLevel(aliasId, levelId) {
		return this.http.request("/api/ohrbound/levels", { method: "DELETE", body: { aliasId, levelId }, retries: 1 });
	}
}
