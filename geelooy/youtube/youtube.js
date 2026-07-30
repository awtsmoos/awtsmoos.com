// B"H
import { youtubeApi } from './youtubeApi.js';
import { uploadToGoogle } from './youtubeUpload.js';
import { byId, fillVideoPicker, message, showChannel, showConnection } from './youtubeView.js';

async function boot() {
	try {
		const status = await youtubeApi.status();
		showConnection(status);
		if (status.connected) await loadChannel();
	} catch (error) {
		message(byId('connection-status'), error.message, 'error');
	}
}

async function loadChannel() {
	const { channel } = await youtubeApi.channel();
	showChannel(channel);
	await loadVideos();
}

async function loadVideos() {
	const result = await youtubeApi.videos();
	fillVideoPicker(result.videos);
}

byId('disconnect').addEventListener('click', async () => {
	await youtubeApi.disconnect();
	location.reload();
});

byId('refresh-videos').addEventListener('click', () => loadVideos().catch(showUpdateError));
byId('video-picker').addEventListener('change', event => byId('update-id').value = event.target.value);

byId('upload-form').addEventListener('submit', async event => {
	event.preventDefault();
	const file = byId('video-file').files[0];
	if (!file) return;
	const target = byId('upload-message');
	try {
		message(target, 'Creating secure YouTube upload session…');
		const session = await youtubeApi.startUpload(uploadMetadata(file));
		const video = await uploadToGoogle({
			uploadUrl: session.uploadUrl,
			file,
			contentType: session.contentType,
			onProgress: percent => byId('upload-progress').value = percent
		});
		message(target, `Uploaded successfully${video.id ? `: ${video.id}` : ''}`, 'success');
		await loadVideos();
	} catch (error) {
		message(target, error.message, 'error');
	}
});

function uploadMetadata(file) {
	return {
		fileSize: file.size,
		mimeType: file.type || 'application/octet-stream',
		title: byId('upload-title').value,
		description: byId('upload-description').value,
		privacyStatus: byId('upload-privacy').value,
		selfDeclaredMadeForKids: byId('upload-kids').checked
	};
}

byId('update-form').addEventListener('submit', async event => {
	event.preventDefault();
	try {
		await youtubeApi.updateVideo(updateChanges());
		message(byId('update-message'), 'Video updated.', 'success');
		await loadVideos();
	} catch (error) {
		showUpdateError(error);
	}
});

function updateChanges() {
	const changes = { videoId: byId('update-id').value };
	if (byId('update-title').value) changes.title = byId('update-title').value;
	if (byId('update-description').value) changes.description = byId('update-description').value;
	if (byId('update-privacy').value) changes.privacyStatus = byId('update-privacy').value;
	return changes;
}

function showUpdateError(error) {
	message(byId('update-message'), error.message, 'error');
}

boot();
