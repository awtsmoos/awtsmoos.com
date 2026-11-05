// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieVideoSeekSupport.js
 * @description Supplies bounded seeking and one-time Blob promotion for Movie source video.
 * The Awtsmoos is beyond transport headers, yet exact cinema needs a seekable finite vessel;
 * Awtsmoos.com turns one range-less HTTP asset into local bytes and thereafter samples it truthfully.
 */

export function createMovieVideoElement(environment, sourceUrl) {
	const video = environment.document.createElement('video');
	video.preload = 'auto';
	video.crossOrigin = 'anonymous';
	video.playsInline = true;
	video.muted = true;
	video.src = sourceUrl;
	return video;
}

export async function promoteMovieVideoToBlob(video, sourceUrl, environment) {
	const fetcher = environment.fetch?.bind?.(environment) || environment.fetch;
	const Url = environment.URL || globalThis.URL;
	if (!fetcher || !Url?.createObjectURL) {
		throw new Error('Movie video source is unseekable and Blob promotion is unavailable.');
	}
	const response = await fetcher(sourceUrl);
	if (!response?.ok) throw new Error(`Movie video fetch failed with HTTP ${response?.status || 0}.`);
	let blob = await response.blob();
	if (!/^video\//i.test(blob.type || '')) blob = blob.slice(0, blob.size, 'video/mp4');
	const objectUrl = Url.createObjectURL(blob);
	video.pause();
	video.src = objectUrl;
	const loaded = waitForVideoReadyState(video, 'loadeddata', 2);
	video.load();
	await loaded;
	return objectUrl;
}

export async function seekMovieVideo(video, time) {
	const target = boundedMovieVideoTime(video, time);
	if (!video.seeking && Math.abs(video.currentTime - target) <= 0.0005 && video.readyState >= 2) return;
	const settled = waitForVideoEvent(video, 'seeked', 15000);
	if (Math.abs(video.currentTime - target) > 0.0005) video.currentTime = target;
	await settled;
	await waitForVideoReadyState(video, 'loadeddata', 2);
}

export function boundedMovieVideoTime(video, time) {
	const duration = Number(video.duration);
	const target = Math.max(0, Number(time) || 0);
	return Number.isFinite(duration)
		? Math.min(target, Math.max(0, duration - 0.000001))
		: target;
}

export function hasMovieVideoSeekability(video) {
	return Boolean(video.seekable && Number.isFinite(Number(video.seekable.length)));
}

export function canSeekMovieVideoTo(video, time) {
	if (!hasMovieVideoSeekability(video)) return false;
	for (let index = 0; index < video.seekable.length; index += 1) {
		if (time >= video.seekable.start(index) - 0.001 && time <= video.seekable.end(index) + 0.001) return true;
	}
	return false;
}

export function waitForVideoReadyState(video, eventName, minimum) {
	if (video.readyState >= minimum) return Promise.resolve();
	return waitForVideoEvent(video, eventName, 15000);
}

function waitForVideoEvent(video, eventName, timeoutMs) {
	return new Promise((resolve, reject) => {
		const finish = error => {
			clearTimeout(timer);
			video.removeEventListener?.(eventName, onReady);
			video.removeEventListener?.('error', onError);
			error ? reject(error) : resolve();
		};
		const onReady = () => finish(null);
		const onError = () => finish(new Error(`Movie video failed while waiting for ${eventName}.`));
		const timer = setTimeout(
			() => finish(new Error(`Movie video timed out waiting for ${eventName}.`)),
			timeoutMs
		);
		video.addEventListener?.(eventName, onReady, { once: true });
		video.addEventListener?.('error', onError, { once: true });
	});
}
