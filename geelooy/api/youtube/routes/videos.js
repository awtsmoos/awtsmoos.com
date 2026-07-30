// B"H
const { body } = require('../core/body.js');
const { youtube } = require('../core/client.js');
const { requireIdentity } = require('../core/identity.js');
const { ok } = require('../core/json.js');
const { assertSameOrigin, requestError } = require('../core/origin.js');

async function list($i) {
	const identity = await requireIdentity($i);
	const channel = await ownChannel(identity.sub, 'id,contentDetails');
	const playlistId = channel?.contentDetails?.relatedPlaylists?.uploads;
	if (!playlistId) return ok({ channel, videos: [], nextPageToken: null });
	const query = new URLSearchParams({
		part: 'snippet,contentDetails',
		playlistId,
		maxResults: String(Math.min(50, Math.max(1, Number($i.$_GET?.maxResults) || 25)))
	});
	if ($i.$_GET?.pageToken) query.set('pageToken', $i.$_GET.pageToken);
	const data = await youtube(identity.sub, `playlistItems?${query}`);
	return ok({ channel, videos: data.items || [], nextPageToken: data.nextPageToken || null });
}

async function update($i) {
	assertSameOrigin($i);
	const identity = await requireIdentity($i);
	const input = await body($i);
	const videoId = String(input.videoId || '').trim();
	if (!videoId) throw requestError('video_id_required', 400);
	const current = await youtube(identity.sub, `videos?part=snippet,status&id=${encodeURIComponent(videoId)}`);
	const video = current.items?.[0];
	if (!video) throw requestError('video_not_found', 404);
	const channel = await ownChannel(identity.sub, 'id');
	if (video.snippet?.channelId !== channel?.id) throw requestError('video_not_owned_by_connected_channel', 403);
	const resource = { id: videoId };
	const parts = [];
	if (changesSnippet(input)) {
		resource.snippet = writableSnippet(video.snippet, input);
		parts.push('snippet');
	}
	if (changesStatus(input)) {
		resource.status = writableStatus(video.status, input);
		parts.push('status');
	}
	if (!parts.length) throw requestError('no_video_changes_requested', 400);
	const data = await youtube(identity.sub, `videos?part=${parts.join(',')}`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(resource)
	});
	return ok({ video: data });
}

async function ownChannel(subject, part) {
	const data = await youtube(subject, `channels?part=${encodeURIComponent(part)}&mine=true`);
	return data.items?.[0] || null;
}

function changesSnippet(input) {
	return ['title', 'description', 'categoryId', 'tags'].some(key => input[key] !== undefined);
}

function changesStatus(input) {
	return ['privacyStatus', 'selfDeclaredMadeForKids'].some(key => input[key] !== undefined);
}

function writableSnippet(current, input) {
	const title = input.title === undefined ? current.title : String(input.title).trim();
	if (!title || title.length > 100 || /[<>]/.test(title)) throw requestError('invalid_video_title', 400);
	return {
		title,
		description: input.description === undefined ? current.description || '' : String(input.description).slice(0, 5000),
		categoryId: input.categoryId === undefined ? current.categoryId || '22' : String(input.categoryId),
		...(input.tags === undefined && !current.tags ? {} : {
			tags: input.tags === undefined ? current.tags : normalizedTags(input.tags)
		}),
		...(current.defaultLanguage ? { defaultLanguage: current.defaultLanguage } : {}),
		...(current.defaultAudioLanguage ? { defaultAudioLanguage: current.defaultAudioLanguage } : {})
	};
}

function writableStatus(current, input) {
	const privacyStatus = input.privacyStatus === undefined ? current.privacyStatus : input.privacyStatus;
	if (!['private', 'unlisted', 'public'].includes(privacyStatus)) throw requestError('invalid_privacy_status', 400);
	return {
		privacyStatus,
		...(typeof input.selfDeclaredMadeForKids === 'boolean'
			? { selfDeclaredMadeForKids: input.selfDeclaredMadeForKids }
			: typeof current.selfDeclaredMadeForKids === 'boolean'
				? { selfDeclaredMadeForKids: current.selfDeclaredMadeForKids }
				: {})
	};
}

function normalizedTags(value) {
	return Array.isArray(value) ? value.map(String).map(tag => tag.trim()).filter(Boolean).slice(0, 50) : [];
}

module.exports = { list, update, writableSnippet, writableStatus };
