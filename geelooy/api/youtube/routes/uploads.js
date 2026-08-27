// B"H
const { authorizedFetch, apiError } = require('../core/client.js');
const { body } = require('../core/body.js');
const { requireIdentity } = require('../core/identity.js');
const { ok } = require('../core/json.js');
const { assertSameOrigin, requestError } = require('../core/origin.js');

async function start($i) {
	assertSameOrigin($i);
	const identity = await requireIdentity($i);
	const input = await body($i);
	const fileSize = Number(input.fileSize);
	const mimeType = String(input.mimeType || 'application/octet-stream');
	if (!Number.isSafeInteger(fileSize) || fileSize <= 0) throw requestError('invalid_file_size', 400);
	if (fileSize > 256 * 1024 ** 3) throw requestError('youtube_file_too_large', 400);
	if (!/^video\//.test(mimeType) && mimeType !== 'application/octet-stream') throw requestError('invalid_video_mime_type', 400);
	const metadata = uploadMetadata(input);
	const parts = Object.keys(metadata).join(',');
	const url = `https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=${encodeURIComponent(parts)}`;
	const response = await authorizedFetch(identity.sub, url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json; charset=UTF-8',
			'X-Upload-Content-Length': String(fileSize),
			'X-Upload-Content-Type': mimeType
		},
		body: JSON.stringify(metadata)
	});
	if (!response.ok) {
		const data = await response.json().catch(() => ({}));
		throw apiError(data.error?.message || 'youtube_upload_session_failed', response.status, data);
	}
	const uploadUrl = response.headers.get('location');
	if (!uploadUrl) throw apiError('youtube_upload_location_missing', 502);
	return ok({ uploadUrl, method: 'PUT', contentType: mimeType, fileSize, metadata }, 201);
}

function uploadMetadata(input) {
	const title = String(input.title || '').trim();
	if (!title || title.length > 100 || /[<>]/.test(title)) throw requestError('invalid_video_title', 400);
	const snippet = {
		title,
		description: String(input.description || '').slice(0, 5000),
		categoryId: String(input.categoryId || '22')
	};
	if (Array.isArray(input.tags)) snippet.tags = input.tags.map(String).filter(Boolean).slice(0, 50);
	const privacyStatus = ['private', 'unlisted', 'public'].includes(input.privacyStatus) ? input.privacyStatus : 'private';
	const status = { privacyStatus };
	if (typeof input.selfDeclaredMadeForKids === 'boolean') status.selfDeclaredMadeForKids = input.selfDeclaredMadeForKids;
	return { snippet, status };
}

module.exports = { start, uploadMetadata };
