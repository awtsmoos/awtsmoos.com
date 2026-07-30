// B"H
const { body } = require('../core/body.js');
const { youtube } = require('../core/client.js');
const { requireIdentity } = require('../core/identity.js');
const { ok } = require('../core/json.js');
const { assertSameOrigin, requestError } = require('../core/origin.js');

async function list($i) {
	const identity = await requireIdentity($i);
	const query = new URLSearchParams({
		part: 'id,snippet,status,contentDetails',
		broadcastStatus: String($i.$_GET?.broadcastStatus || 'all'),
		broadcastType: String($i.$_GET?.broadcastType || 'all'),
		maxResults: '25'
	});
	const data = await youtube(identity.sub, `liveBroadcasts?${query}`);
	return ok({ broadcasts: data.items || [], nextPageToken: data.nextPageToken || null });
}

async function create($i) {
	assertSameOrigin($i);
	const identity = await requireIdentity($i);
	const input = await body($i);
	const title = validTitle(input.title || `Awtsmoos Live ${new Date().toISOString()}`);
	const stream = await youtube(identity.sub, 'liveStreams?part=snippet,cdn', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(streamBody(title, input))
	});
	const broadcast = await youtube(identity.sub, 'liveBroadcasts?part=snippet,status,contentDetails', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(broadcastBody(title, input))
	});
	const bindPath = `liveBroadcasts/bind?id=${encodeURIComponent(broadcast.id)}&streamId=${encodeURIComponent(stream.id)}&part=id,snippet,contentDetails,status`;
	const bound = await youtube(identity.sub, bindPath, { method: 'POST' });
	return ok({ stream, broadcast, bound, ingestion: stream.cdn?.ingestionInfo || null }, 201);
}

async function transition($i) {
	assertSameOrigin($i);
	const identity = await requireIdentity($i);
	const input = await body($i);
	const broadcastId = String(input.broadcastId || '');
	const status = String(input.status || '');
	if (!broadcastId || !['testing', 'live', 'complete'].includes(status)) {
		throw requestError('valid_broadcast_id_and_status_required', 400);
	}
	const path = `liveBroadcasts/transition?broadcastStatus=${encodeURIComponent(status)}&id=${encodeURIComponent(broadcastId)}&part=id,status`;
	const broadcast = await youtube(identity.sub, path, { method: 'POST' });
	return ok({ broadcast });
}

function streamBody(title, input) {
	return {
		snippet: { title: `${title} Stream` },
		cdn: {
			frameRate: input.frameRate || '30fps',
			ingestionType: input.ingestionType || 'rtmp',
			resolution: input.resolution || '1080p'
		}
	};
}

function broadcastBody(title, input) {
	return {
		snippet: {
			title,
			description: String(input.description || '').slice(0, 5000),
			scheduledStartTime: input.scheduledStartTime || new Date(Date.now() + 60_000).toISOString()
		},
		status: {
			privacyStatus: ['private', 'unlisted', 'public'].includes(input.privacyStatus) ? input.privacyStatus : 'unlisted',
			selfDeclaredMadeForKids: Boolean(input.selfDeclaredMadeForKids)
		},
		contentDetails: { enableAutoStart: true, enableAutoStop: true }
	};
}

function validTitle(value) {
	const title = String(value).trim();
	if (!title || title.length > 100 || /[<>]/.test(title)) throw requestError('invalid_broadcast_title', 400);
	return title;
}

module.exports = { create, list, transition };
