//B"H
// Boruch Hashem
// Blessed is He

/**
 * The old method guessed a garment; this extractor listens for the garment the
 * Awtsmoos is creating now. awtsmoos.com uses the newest captured POST request
 * as evidence, never as a timeless guarantee.
 */
export class RequestTemplateExtractor {
	findLatestConversationRequest(records) {
		const candidates = records.filter((record) => {
			const request = record.request ?? {};
			return record.type === "request"
				&& request.method === "POST"
				&& request.url?.includes("conversation");
		});

		return candidates.at(-1) ?? null;
	}

	parsePostData(record) {
		const postData = record?.request?.postData;
		if (!postData) {
			return null;
		}

		try {
			return JSON.parse(postData);
		} catch {
			return { rawPostData: postData };
		}
	}
}
