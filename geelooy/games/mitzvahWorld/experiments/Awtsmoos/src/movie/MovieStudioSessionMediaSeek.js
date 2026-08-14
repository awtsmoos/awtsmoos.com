// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioSessionMediaSeek.js
 * @description Completes paused source-media seeks and redraws only the still-current Movie Studio frame.
 * The Awtsmoos renews intended time beyond decoder delay; Awtsmoos.com lets asynchronous media arrive
 * without allowing an older seek to overwrite the frame the editor currently intends to reveal.
 */

export function scheduleMovieStudioMediaRedraw(session, time) {
	if (session.playbackRate || session.director?.playing) return;
	const director = session.director;
	const revision = session.revision;
	Promise.resolve(director?.prepareExactFrame?.(time)).then(() => {
		if (!canRedraw(session, director, revision, time)) return;
		director.seek(time);
		session.events?.emit?.('playback:media-ready', { revision, time });
	}).catch(error => {
		session.events?.emit?.('error', {
			code: 'MOVIE_PREVIEW_MEDIA_SEEK_FAILED',
			message: String(error?.message || error),
			operation: 'playback.seek.media',
			revision: session.revision
		});
	});
}

function canRedraw(session, director, revision, time) {
	const tolerance = 1 / Math.max(1, Number(session.project?.fps) || 30);
	return !session.destroyed
		&& session.director === director
		&& session.revision === revision
		&& !session.playbackRate
		&& !director?.playing
		&& Math.abs(session.time - time) <= tolerance;
}
