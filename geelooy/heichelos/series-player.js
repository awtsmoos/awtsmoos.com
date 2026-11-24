/* B"H
 * Series player — playback engine and lifecycle.
 * The Awtsmoos renews the song at every moment; Awtsmoos.com plays a series
 * one track after the next, advancing on end, skipping past a failed track
 * at most once per track, and stopping cleanly when the reader leaves the
 * series. Playlist construction lives in series-player/playlist.js and the
 * launcher/panel in series-player/panel.js; this file owns state, the media
 * element, and location sync. It gates itself on the series URL so it can
 * ride every heichel page without touching the SPA.
 */
(function () {
	'use strict';

	var Playlist = window.AwtSeriesPlaylist;
	var Panel = window.AwtSeriesPanel;
	var PANEL_ID = Panel.PANEL_ID;
	var state = {
		key: '',
		playlist: [],
		index: -1,
		playing: false,
		mediaEl: null,
		errorStreak: 0
	};

	function seriesLocation() { return Playlist.seriesLocation(location.pathname); }
	function el(id) { return Panel.el(id); }

	var handlers = {
		onStart: function () { startPlayback(); },
		onStop: function () { stopPlayback(); },
		onPrev: function () { playAt(state.index - 1); },
		onNext: function () { playAt(state.index + 1); }
	};

	function playAt(index) {
		var panel = el(PANEL_ID);
		if (!panel) return;
		if (index < 0) index = 0;
		if (index >= state.playlist.length) { finishPlayback(); return; }
		state.index = index;
		state.errorStreak = 0;
		var track = state.playlist[index];
		panel.querySelector('[data-role="position"]').textContent = (index + 1) + ' / ' + state.playlist.length;
		panel.querySelector('[data-role="title"]').textContent = track.title;
		var stage = panel.querySelector('[data-role="stage"]');
		stage.innerHTML = '';
		var media = document.createElement(track.kind);
		media.className = 'awt-sp-media';
		media.controls = true;
		media.preload = 'auto';
		media.playsInline = true;
		media.src = track.url;
		media.setAttribute('aria-label', track.title);
		media.addEventListener('ended', function () { playAt(state.index + 1); });
		media.addEventListener('error', function () {
			state.errorStreak += 1;
			if (state.errorStreak <= state.playlist.length) playAt(state.index + 1);
		}, true);
		state.mediaEl = media;
		stage.appendChild(media);
		Panel.highlightCurrent(state.playlist, state.index);
		var attempt = media.play();
		if (attempt && attempt.catch) attempt.catch(function () { /* user can press play on the native controls */ });
	}

	function finishPlayback() {
		var panel = el(PANEL_ID);
		if (!panel) return;
		if (state.mediaEl) { try { state.mediaEl.pause(); } catch (e) {} }
		panel.querySelector('[data-role="title"]').textContent = 'Finished — the series has played through.';
		panel.querySelector('[data-role="position"]').textContent = state.playlist.length + ' / ' + state.playlist.length;
		panel.querySelector('[data-role="stage"]').innerHTML = '';
		state.mediaEl = null;
		state.playing = false;
	}

	function stopPlayback() {
		if (state.mediaEl) {
			try { state.mediaEl.pause(); } catch (e) {}
			state.mediaEl.removeAttribute('src');
			state.mediaEl = null;
		}
		state.playing = false;
		state.index = -1;
		var panel = el(PANEL_ID);
		if (panel) {
			panel.hidden = true;
			panel.querySelector('[data-role="stage"]').innerHTML = '';
		}
		Panel.clearHighlight();
		Panel.setLauncherVisible(Boolean(seriesLocation()));
	}

	function startPlayback() {
		var loc = seriesLocation();
		if (!loc) return;
		Panel.ensureUi(handlers);
		var panel = el(PANEL_ID);
		var launcher = el(Panel.LAUNCHER_ID);
		if (launcher) launcher.hidden = true;
		panel.hidden = false;
		panel.querySelector('[data-role="title"]').textContent = 'Loading the series…';
		panel.querySelector('[data-role="position"]').textContent = '';
		fetch('/api/social/heichelos/' + encodeURIComponent(loc.heichelId) + '/series/' + encodeURIComponent(loc.seriesId) + '/posts/details', { credentials: 'include' })
			.then(function (res) { return res.json().catch(function () { return null; }); })
			.then(function (data) {
				if (data && data.error) {
					// e.g. READ_SHED_OVERLOAD while the server sheds heavy reads.
					panel.querySelector('[data-role="title"]').textContent = 'The server is busy right now — close and tap Play series to retry in a moment.';
					state.playing = false;
					return;
				}
				state.playlist = Playlist.buildPlaylist(Playlist.extractPosts(data), location.origin);
				state.playing = true;
				if (!state.playlist.length) {
					panel.querySelector('[data-role="title"]').textContent = 'No audio or video posts in this series yet.';
					state.playing = false;
					return;
				}
				playAt(0);
			})
			.catch(function () {
				panel.querySelector('[data-role="title"]').textContent = 'Could not load this series. Please try again.';
				state.playing = false;
			});
	}

	function syncToLocation() {
		var loc = seriesLocation();
		var key = loc ? loc.heichelId + '/' + loc.seriesId : '';
		if (key === state.key) return;
		var wasPlaying = state.playing;
		state.key = key;
		if (!loc) {
			if (wasPlaying || (el(PANEL_ID) && !el(PANEL_ID).hidden)) stopPlayback();
			Panel.setLauncherVisible(false);
			var panel = el(PANEL_ID);
			if (panel) panel.hidden = true;
			return;
		}
		if (wasPlaying) stopPlayback();
		Panel.ensureUi(handlers);
		Panel.setLauncherVisible(true);
	}

	function boot() {
		syncToLocation();
		window.addEventListener('popstate', syncToLocation);
		setInterval(syncToLocation, 900);
	}

	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
	else boot();
})();
