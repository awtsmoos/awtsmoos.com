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

	function pickMedia(record, origin) {
		var byKind = {};
		function consider(asset) {
			var kind = kindOf(asset);
			var url = assetUrl(asset, origin);
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
				url: media.url
			});
		});
		return list;
	}

	window.AwtSeriesPlaylist = {
		seriesLocation: seriesLocation,
		kindOf: kindOf,
		assetUrl: assetUrl,
		pickMedia: pickMedia,
		extractPosts: extractPosts,
		buildPlaylist: buildPlaylist
	};
})();
