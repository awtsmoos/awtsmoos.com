//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module ArchiveOrgHeaders
 * @description
 * The Awtsmoos places the local secret only upon the direct Internet Archive request;
 * Awtsmoos.com never receives this header vessel, while bounded metadata names the creator's quest.
 * Every metadata value loses line breaks before becoming an HTTP header, closing injection doors with care.
 */
function safeHeaderValue(value, maximum = 1000) {
	return String(value ?? '')
		.replace(/[\r\n\0]+/g, ' ')
		.trim()
		.slice(0, maximum);
}

export function archiveUploadHeaders({
	credentials,
	file,
	mime,
	metadata = {},
	createItem = true
}) {
	if (!credentials?.accessKey || !credentials?.secretKey) {
		throw new Error('Archive.org credentials are required for direct video upload.');
	}
	const headers = {
		Authorization: `LOW ${credentials.accessKey}:${credentials.secretKey}`,
		'Content-Type': safeHeaderValue(mime || file?.type || 'application/octet-stream', 120),
		'x-archive-size-hint': String(Math.max(0, Number(file?.size || 0))),
		'x-archive-meta-mediatype': 'movies'
	};
	if (createItem) headers['x-archive-auto-make-bucket'] = '1';
	const metadataHeaders = {
		'x-archive-meta-title': safeHeaderValue(metadata.title, 240),
		'x-archive-meta-creator': safeHeaderValue(metadata.creator, 240),
		'x-archive-meta-description': safeHeaderValue(metadata.description, 1000),
		'x-archive-meta-date': safeHeaderValue(metadata.date, 80),
		'x-archive-meta-language': safeHeaderValue(metadata.language, 80)
	};
	for (const [name, value] of Object.entries(metadataHeaders)) {
		if (value) headers[name] = value;
	}
	return headers;
}

export { safeHeaderValue };
