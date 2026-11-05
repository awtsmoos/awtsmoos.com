// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioSessionTransport.js
 * @description Owns bounded transport while delegated media readiness keeps paused source-video scrubbing truthful.
 * The Awtsmoos renews timeline intention before motion or stillness can divide the frame;
 * Awtsmoos.com keeps transport immediate while a focused helper restores the real source image after decoder delay.
 */

import {
	boundMoviePlaybackTime,
	nextMovieShuttleRate,
	normalizeMoviePlaybackRate,
	stepMoviePlaybackTime
} from './MoviePlaybackRate.js';
import { publishMovieStudioPlaybackState } from './MovieStudioPlaybackState.js';
import { scheduleMovieStudioMediaRedraw } from './MovieStudioSessionMediaSeek.js';

export function seekMovieStudioSession(session, time) {
	session.time = boundMoviePlaybackTime(time, session.project.duration);
	const frame = session.director.seek(session.time);
	applySeekState(session, frame);
	scheduleMovieStudioMediaRedraw(session, frame.time);
	return frame;
}

export function playMovieStudioSession(session, options = {}) {
	const rate = normalizeMoviePlaybackRate(options.rate, session.playbackRate || 1);
	if (!rate) return pauseMovieStudioSession(session);
	const boundaryStart = rate > 0 ? 0 : session.project.duration;
	const atBoundary = rate > 0 ? session.time >= session.project.duration : session.time <= 0;
	session.time = Object.hasOwn(options, 'startAt')
		? boundMoviePlaybackTime(options.startAt, session.project.duration)
		: atBoundary ? boundaryStart : session.time;
	session.playbackRate = rate;
	session.director.play({
		onEnd: frame => finishMovieStudioPlayback(session, frame),
		onFrame: frame => applyMovieStudioPlaybackFrame(session, frame),
		rate,
		startAt: session.time
	});
	return publishMovieStudioPlaybackState(session);
}

export function pauseMovieStudioSession(session) {
	session.director.pause();
	session.playbackRate = 0;
	session.view.status.textContent = `Paused at ${session.time.toFixed(2)}s.`;
	return publishMovieStudioPlaybackState(session);
}

export function stopMovieStudioSession(session) {
	pauseMovieStudioSession(session);
	seekMovieStudioSession(session, 0);
	return publishMovieStudioPlaybackState(session);
}

export function stepMovieStudioSession(session, frames = 1) {
	pauseMovieStudioSession(session);
	seekMovieStudioSession(session, stepMoviePlaybackTime(
		session.time, frames, session.project.fps, session.project.duration
	));
	return publishMovieStudioPlaybackState(session);
}

export function shuttleMovieStudioSession(session, direction) {
	return playMovieStudioSession(session, {
		rate: nextMovieShuttleRate(session.playbackRate, direction)
	});
}

export function setMovieStudioPlaybackRate(session, rate) {
	const normalized = normalizeMoviePlaybackRate(rate, 0);
	return normalized
		? playMovieStudioSession(session, { rate: normalized })
		: pauseMovieStudioSession(session);
}

function applySeekState(session, frame) {
	session.timeline?.setTime(frame.time);
	session.view.status.textContent = `${frame.time.toFixed(2)} / ${session.project.duration.toFixed(2)}s · ${frame.shot}`;
	session.events.emit('playback:time', {
		revision: session.revision,
		shot: frame.shot,
		time: frame.time
	});
}

function applyMovieStudioPlaybackFrame(session, frame) {
	session.time = frame.time;
	session.timeline.setTime(frame.time);
	session.view.status.textContent = `Preview ${frame.time.toFixed(2)} / ${session.project.duration.toFixed(2)}s · ${formatRate(session.playbackRate)}`;
	session.events.emit('playback:time', {
		revision: session.revision,
		shot: frame.shot,
		time: frame.time
	});
}

function finishMovieStudioPlayback(session, frame) {
	applyMovieStudioPlaybackFrame(session, frame);
	session.playbackRate = 0;
	session.view.status.textContent = 'Preview boundary reached.';
	publishMovieStudioPlaybackState(session);
}

function formatRate(rate) {
	return `${Number(rate || 0).toFixed(2)}×`;
}
