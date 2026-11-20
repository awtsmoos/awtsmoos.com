/* B"H
 * Series player — continuous playback for a series page.
 * Collects the series' posts in order, keeps those with an audio or video
 * attachment (the post's `media` field first, then its root assets), and
 * plays them one after the next. A post with both plays its video.
 * Plain script, no framework; it gates itself on the series URL so it can
 * ride every heichel page without touching the SPA.
 */
(function () {
	'use strict';

	var LAUNCHER_ID = 'awt-series-player-launcher';
	var PANEL_ID = 'awt-series-player-panel';
	var state = {
		key: '',
		playlist: [],
		index: -1,
		playing: false,
		mediaEl: null,
		errorStreak: 0
	};

	function seriesLocation() {
		var match = /^\/heichelos\/([^/]+)\/series\/([^/]+)\/?$/.exec(location.pathname);
		if (!match) return null;
		var seriesId = decodeURIComponent(match[2]);
		if (!seriesId || seriesId === 'root') return null;
		return { heichelId: decodeURIComponent(match[1]), seriesId: seriesId };
	}

	function kindOf(asset) {
		var type = String((asset && (asset.type || asset.kind || asset.mime || asset.contentType)) || '').toLowerCase();
		if (type.indexOf('audio') !== -1) return 'audio';
		if (type.indexOf('video') !== -1) return 'video';
		var url = String((asset && (asset.publicPath || asset.url || asset.src)) || '');
		if (/\.(mp3|wav|ogg|m4a|aac|flac)(\?.*)?$/i.test(url)) return 'audio';
		if (/\.(mp4|webm|mov|m4v|ogv)(\?.*)?$/i.test(url)) return 'video';
		return '';
	}

	function assetUrl(asset) {
		var raw = asset && (asset.publicPath || asset.url || asset.src);
		if (!raw) return '';
		try { return new URL(String(raw), location.origin).href; } catch (e) { return ''; }
	}

	function pickMedia(record) {
		var byKind = {};
		function consider(asset) {
			var kind = kindOf(asset);
			var url = assetUrl(asset);
			if ((kind === 'audio' || kind === 'video') && url && !byKind[kind]) {
				byKind[kind] = { kind: kind, url: url };
			}
		}
		if (record.media && typeof record.media === 'object') {
			consider(record.media.video);
			consider(record.media.audio);
		}
		var assets = record.rootAssets || record.assets || [];
		if (Array.isArray(assets)) assets.forEach(consider);
		return byKind.video || byKind.audio || null;
	}

	function extractPosts(data) {
		var s = (data && data.success !== undefined) ? data.success : data;
		if (Array.isArray(s)) return s;
		if (s && Array.isArray(s.posts)) return s.posts;
		if (s && Array.isArray(s.details)) return s.details;
		if (s && typeof s === 'object') {
			return Object.values(s).filter(function (v) { return v && typeof v === 'object'; });
		}
		return [];
	}

	function buildPlaylist(posts) {
		var list = [];
		posts.forEach(function (entry) {
			var record = (entry && entry.post) || entry || {};
			var media = pickMedia(record);
			if (!media) return;
			list.push({
				id: String(record.id || record.postId || ''),
				title: String(record.title || record.name || 'Untitled post'),
				kind: media.kind,
				url: media.url
			});
		});
		return list;
	}

	function el(id) { return document.getElementById(id); }

	function ensureUi() {
		if (!el(LAUNCHER_ID)) {
			var launcher = document.createElement('button');
			launcher.id = LAUNCHER_ID;
			launcher.type = 'button';
			launcher.className = 'awt-series-player-launcher';
			launcher.textContent = '▶ Play series';
			launcher.setAttribute('aria-label', 'Play this series in order');
			launcher.addEventListener('click', startPlayback);
			document.body.appendChild(launcher);
		}
		if (!el(PANEL_ID)) {
			var panel = document.createElement('section');
			panel.id = PANEL_ID;
			panel.className = 'awt-series-player-panel';
			panel.hidden = true;
			panel.setAttribute('aria-label', 'Series player');
			panel.innerHTML =
				'<div class="awt-sp-head">' +
					'<span class="awt-sp-kicker">Series player</span>' +
					'<span class="awt-sp-position" data-role="position"></span>' +
					'<button type="button" class="awt-sp-close" data-role="close" aria-label="Stop and close the series player">✕</button>' +
				'</div>' +
				'<p class="awt-sp-title" data-role="title" aria-live="polite"></p>' +
				'<div class="awt-sp-stage" data-role="stage"></div>' +
				'<div class="awt-sp-controls">' +
					'<button type="button" class="awt-sp-btn" data-role="prev">⏮ Previous</button>' +
					'<button type="button" class="awt-sp-btn" data-role="next">Next ⏭</button>' +
				'</div>';
			panel.querySelector('[data-role="close"]').addEventListener('click', stopPlayback);
			panel.querySelector('[data-role="prev"]').addEventListener('click', function () { playAt(state.index - 1); });
			panel.querySelector('[data-role="next"]').addEventListener('click', function () { playAt(state.index + 1); });
			document.body.appendChild(panel);
		}
	}

	function setLauncherVisible(visible) {
		var launcher = el(LAUNCHER_ID);
		if (launcher) launcher.hidden = !visible;
	}

	function highlightCurrent() {
		document.querySelectorAll('.awt-series-player-current').forEach(function (node) {
			node.classList.remove('awt-series-player-current');
		});
		var track = state.playlist[state.index];
		if (!track || !track.id) return;
		var link = document.querySelector('a[href*="/post/' + CSS.escape(track.id) + '"]');
		if (link) {
			link.classList.add('awt-series-player-current');
			link.scrollIntoView({ block: 'nearest' });
		}
	}

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
		highlightCurrent();
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
		document.querySelectorAll('.awt-series-player-current').forEach(function (node) {
			node.classList.remove('awt-series-player-current');
		});
		setLauncherVisible(Boolean(seriesLocation()));
	}

	function startPlayback() {
		var loc = seriesLocation();
		if (!loc) return;
		ensureUi();
		var panel = el(PANEL_ID);
		var launcher = el(LAUNCHER_ID);
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
				state.playlist = buildPlaylist(extractPosts(data));
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
			setLauncherVisible(false);
			var panel = el(PANEL_ID);
			if (panel) panel.hidden = true;
			return;
		}
		if (wasPlaying) stopPlayback();
		ensureUi();
		setLauncherVisible(true);
	}

	function boot() {
		syncToLocation();
		window.addEventListener('popstate', syncToLocation);
		setInterval(syncToLocation, 900);
	}

	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
	else boot();
})();
