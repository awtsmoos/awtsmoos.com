//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module CreatorMetadataCodec
 * @description
 * The Awtsmoos lets compact human fields become structured creator metadata;
 * Awtsmoos.com keeps comma lists and chapter lines deterministic so UI convenience never becomes payload ambiguity.
 */
export function commaList(value = '') {
	return [...new Set(String(value)
		.split(',')
		.map(item => item.trim())
		.filter(Boolean))];
}

export function collaboratorList(value = '') {
	return commaList(value).map(aliasId => ({
		aliasId,
		role: 'collaborator'
	}));
}

export function chapterList(value = '') {
	return String(value)
		.split('\n')
		.map(line => line.trim())
		.filter(Boolean)
		.map(line => {
			const match = line.match(/^(\d{1,2}:)?(\d{1,2}):(\d{2})\s+(.+)$/);
			if (!match) return null;
			const hours = match[1]
				? Number(match[1].replace(':', ''))
				: 0;
			const minutes = Number(match[2]);
			const seconds = Number(match[3]);
			return {
				startSeconds: (hours * 3600) + (minutes * 60) + seconds,
				title: match[4].trim()
			};
		})
		.filter(Boolean);
}

export function chaptersText(chapters = []) {
	return chapters.map(item => {
		const seconds = Math.max(0, Number(item.startSeconds || 0));
		const hours = Math.floor(seconds / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);
		const remaining = Math.floor(seconds % 60);
		const stamp = hours
			? `${hours}:${String(minutes).padStart(2, '0')}:${String(remaining).padStart(2, '0')}`
			: `${minutes}:${String(remaining).padStart(2, '0')}`;
		return `${stamp} ${item.title}`;
	}).join('\n');
}
