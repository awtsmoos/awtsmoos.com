// B"H
async function request(path, options = {}) {
	const response = await fetch(`/api/youtube/${path}`, {
		credentials: 'same-origin',
		...options,
		headers: { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...(options.headers || {}) }
	});
	const data = await response.json().catch(() => ({}));
	if (!response.ok || data.ok === false) throw new Error(data.message || data.error || `Request failed: ${response.status}`);
	return data;
}

export const youtubeApi = {
	status: () => request('auth/status'),
	channel: () => request('channel/mine'),
	videos: () => request('videos/list'),
	disconnect: () => request('auth/logout', { method: 'POST', body: '{}' }),
	startUpload: metadata => request('uploads/start', { method: 'POST', body: JSON.stringify(metadata) }),
	updateVideo: changes => request('videos/update', { method: 'POST', body: JSON.stringify(changes) })
};
