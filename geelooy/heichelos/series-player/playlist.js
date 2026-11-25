// B"H
// Boruch Hashem
// Blessed is He
/*
 * Series player — playlist construction.
 * The Awtsmoos orders each creation in its sequence; Awtsmoos.com gathers a
 * series' posts in order and keeps those carrying playable media. A post's
 * own `media` field outranks its root assets, and a post with both audio and
 * video plays its video. Pure data work only: no DOM, no playback state.
 * Exposes window.AwtSeriesPlaylist for series-player.js (classic scripts,
 * loaded in order by the heichel template).
 */
(function () {
	'use strict';

	function seriesLocation(pathname) {
		var match = /^\/heichelos\/([^/]+)\/series\/([^/]+)\/?$/.exec(pathname || '');
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

	function assetUrl(asset, origin) {
		var raw = asset && (asset.publicPath || asset.url || asset.src);
		if (!raw) return '';
		try { return new URL(String(raw), origin).href; } catch (e) { return ''; }
	}

	var VISUALIZERS = ['waveform', 'spectrum', 'celestial'];

	function pickMedia(record, origin) {
		var byKind = {};
		function consider(asset) {
			var kind = kindOf(asset);
			var url = assetUrl(asset, origin);
			if ((kind === 'audio' || kind === 'video') && url && !byKind[kind]) {
				var visualizer = asset && VISUALIZERS.indexOf(asset.visualizer) !== -1 ? asset.visualizer : '';
				byKind[kind] = { kind: kind, url: url, visualizer: visualizer };
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

	function buildPlaylist(posts, origin) {
		var list = [];
		posts.forEach(function (entry) {
			var record = (entry && entry.post) || entry || {};
			var media = pickMedia(record, origin);
			if (!media) return;
			list.push({
				id: String(record.id || record.postId || ''),
				title: String(record.title || record.name || 'Untitled post'),
				kind: media.kind,
				url: media.url,
				visualizer: media.visualizer || ''
			});
		});
		return list;
	}

	/** Natural play order: series order, untouched. */
	function naturalOrder(length) {
		var order = [];
		for (var i = 0; i < length; i++) order.push(i);
		return order;
	}

	/** Shuffled order that still begins with the track already playing. */
	function shuffledOrder(length, startIndex, rng) {
		var order = naturalOrder(length);
		var random = typeof rng === 'function' ? rng : Math.random;
		for (var i = order.length - 1; i > 0; i--) {
			var j = Math.floor(random() * (i + 1));
			var swap = order[i]; order[i] = order[j]; order[j] = swap;
		}
		var at = order.indexOf(startIndex);
		if (at > 0) { order.splice(at, 1); order.unshift(startIndex); }
		return order;
	}

	/**
	 * Where playback goes when a track ends on its own.
	 * Repeat-track replays; without autoplay-next (and without
	 * repeat-series) the series rests; repeat-series wraps to the
	 * first track of the current order. Returns -1 to finish.
	 */
	function nextOnEnded(index, length, opts) {
		if (!length || index < 0 || index >= length) return -1;
		var options = opts || {};
		if (options.repeat === 'track') return index;
		var order = Array.isArray(options.order) && options.order.length === length
			? options.order : naturalOrder(length);
		var position = order.indexOf(index);
		if (position === -1) position = index;
		if (position < length - 1) {
			if (options.autoplayNext === false && options.repeat !== 'series') return -1;
			return order[position + 1];
		}
		return options.repeat === 'series' ? order[0] : -1;
	}

	window.AwtSeriesPlaylist = {
		seriesLocation: seriesLocation,
		kindOf: kindOf,
		assetUrl: assetUrl,
		pickMedia: pickMedia,
		extractPosts: extractPosts,
		buildPlaylist: buildPlaylist,
		naturalOrder: naturalOrder,
		shuffledOrder: shuffledOrder,
		nextOnEnded: nextOnEnded,
		VISUALIZERS: VISUALIZERS
	};
})();
