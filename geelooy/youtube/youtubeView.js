// B"H
export const byId = id => document.getElementById(id);

export function showConnection(status) {
	const scopes = new Set(status.scopes || []);
	const connected = status.connected === true;
	const upload = scopes.has('https://www.googleapis.com/auth/youtube.upload');
	const manage = scopes.has('https://www.googleapis.com/auth/youtube.force-ssl');
	byId('connection-status').textContent = connectionText(status, connected);
	byId('connect').hidden = connected;
	byId('enable-upload').hidden = !connected || upload;
	byId('enable-manage').hidden = !connected || manage;
	byId('disconnect').hidden = !connected;
	toggleSections('.upload-protected', upload);
	toggleSections('.manage-protected', manage);
}

export function showChannel(channel) {
	const target = byId('channel');
	target.hidden = false;
	target.textContent = channel
		? `${channel.snippet?.title || 'YouTube channel'} — ${channel.id}`
		: 'This Google account has no YouTube channel.';
}

export function fillVideoPicker(videos) {
	const picker = byId('video-picker');
	picker.innerHTML = '<option value="">Choose a video</option>';
	for (const item of videos || []) {
		const option = document.createElement('option');
		option.value = item.contentDetails?.videoId || '';
		option.textContent = item.snippet?.title || option.value;
		picker.append(option);
	}
}

export function message(element, text, className = '') {
	element.textContent = text;
	element.className = className;
}

function toggleSections(selector, visible) {
	document.querySelectorAll(selector).forEach(section => section.hidden = !visible);
}

function connectionText(status, connected) {
	if (connected) return `Connected as ${status.profile?.email || status.profile?.name || 'Google user'}`;
	if (status.configured) return 'No YouTube channel is connected.';
	return `Server setup incomplete: ${status.missing.join(', ')}`;
}
