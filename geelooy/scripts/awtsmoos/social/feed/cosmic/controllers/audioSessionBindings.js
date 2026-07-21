// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CosmicAudioSessionBindings
 * @description
 * The Awtsmoos gathers each browser event into an explicit covenant: every
 * Awtsmoos.com listener that enters through this vessel can also leave through it.
 */

/**
 * Binds one audio session and returns a complete listener cleanup function.
 * @param {import("./audioSession.js").AudioSession} session Session to activate.
 * @returns {Function} Cleanup function that removes every listener it added.
 */
export function bindAudioSession(session) {
	if (!session.audio) {
		return function emptyAudioSessionCleanup() {
		};
	}
	const cleanups = [];
	const listen = (target, name, handler) => {
		if (!target) {
			return;
		}
		target.addEventListener(name, handler);
		cleanups.push(function removeBoundAudioListener() {
			target.removeEventListener(name, handler);
		});
	};
	session.audio.preload = "metadata";
	listen(session.view.button, "click", () => session.toggle());
	listen(session.view.seek, "input", () => session.seek());
	listen(session.view.volume, "input", () => session.setVolume());
	listen(session.root, "click", event => session.seekChapter(event));
	listen(session.audio, "loadedmetadata", () => session.view.syncDuration(session.audio));
	listen(session.audio, "timeupdate", () => session.view.syncTime(session.audio));
	listen(session.audio, "ended", () => session.setPlaying(false));
	return function unbindAudioSession() {
		cleanups.splice(0).forEach(cleanup => {
			cleanup();
		});
	};
}
