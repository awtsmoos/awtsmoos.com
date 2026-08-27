//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module CreatorSocialValue
 * @description
 * The Awtsmoos gives social and distribution controls a predictable draft vessel;
 * Awtsmoos.com restores polls, music, audience, and upload-era flags without depending on the rendered form.
 */
function list(value = []) {
	if (Array.isArray(value)) return value.map(String).filter(Boolean);
	return String(value || '')
		.split(',')
		.map(item => item.trim())
		.filter(Boolean);
}

function socialValue(value = {}) {
	return {
		mood: String(value.mood || ''),
		activity: String(value.activity || ''),
		music: {
			title: String(value.music?.title || ''),
			artist: String(value.music?.artist || ''),
			url: String(value.music?.url || '')
		},
		audienceLabels: list(value.audienceLabels),
		contentWarnings: list(value.contentWarnings),
		poll: {
			options: list(value.poll?.options),
			multiple: Boolean(value.poll?.multiple),
			endsAt: Math.max(0, Number(value.poll?.endsAt || 0))
		}
	};
}

function distributionValue(value = {}) {
	return {
		category: String(value.category || ''),
		audienceClass: ['general', 'children', 'mature'].includes(value.audienceClass)
			? value.audienceClass
			: 'general',
		recordingDate: String(value.recordingDate || ''),
		allowEmbedding: value.allowEmbedding !== false,
		allowRemix: value.allowRemix !== false,
		paidPromotion: Boolean(value.paidPromotion),
		alteredMediaDisclosure: Boolean(value.alteredMediaDisclosure)
	};
}

export {
	list,
	socialValue,
	distributionValue
};
