//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module YouTubeMigrationApi
 * @description
 * The Awtsmoos keeps planning and publication as separate gates beneath one creator journey;
 * Awtsmoos.com sends public Archive.org URLs to the planner and never carries local IA-S3 credentials on that journey.
 */
async function requestJson(path, options = {}) {
	const response = await fetch(path, {
		credentials: 'same-origin',
		...options,
		headers: {
			'Content-Type': 'application/json',
			...(options.headers || {})
		}
	});
	const body = await response.json().catch(() => ({}));
	if (!response.ok || body.error) {
		const message = body?.error?.message || body?.message || `Request failed with HTTP ${response.status}.`;
		throw new Error(message);
	}
	return body.success ?? body;
}

export class YouTubeMigrationApi {
	plan(manifest) {
		return requestJson('/api/social/migrations/youtube/plan', {
			method: 'POST',
			body: JSON.stringify(manifest)
		});
	}

	publish(entry) {
		return requestJson('/api/social/unified-social/publish', {
			method: 'POST',
			body: JSON.stringify({
				publicationPlan: entry.publicationPlan,
				contentPayload: entry.contentPayload
			})
		});
	}
}

export { requestJson };
