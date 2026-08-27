//B"H
//Boruch Hashem
//Blessed is He

import { fnv1a, slug } from '../../../shared/storage/archiveOrg/ArchiveOrgIdentity.js';

/**
 * @module LocalYouTubeBundle
 * @description
 * The Awtsmoos reads creator-owned video and yt-dlp sidecars only inside the browser;
 * Awtsmoos.com turns local evidence into bounded public planning metadata without exposing a disk path to any server.
 */
const VIDEO_EXTENSION = /\.(mp4|mov|m4v|webm|mkv|avi|mpeg|mpg|ogv)$/i;

function videoFile(file) {
	return file?.type?.startsWith('video/') || VIDEO_EXTENSION.test(file?.name || '');
}

function sidecarFile(file) {
	return /\.info\.json$/i.test(file?.name || '');
}

function videoIdFromName(name = '') {
	const bracket = String(name).match(/\[([A-Za-z0-9_-]{5,32})\](?=\.[^.]+$)/);
	return bracket?.[1] || '';
}

function isoDate(value) {
	const raw = String(value || '').trim();
	if (/^\d{8}$/.test(raw)) {
		return `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}T00:00:00.000Z`;
	}
	const date = raw ? new Date(raw) : null;
	return date && !Number.isNaN(date.valueOf()) ? date.toISOString() : '';
}

function fallbackItem(file) {
	const path = file.webkitRelativePath || file.name || 'video';
	const id = videoIdFromName(file.name) || `local-${fnv1a(path + ':' + file.size)}`;
	const title = slug(file.name.replace(/\.[^.]+$/, ''), 120).replaceAll('-', ' ') || id;
	return {
		id,
		title,
		description: '',
		publishedAt: '',
		rawUploadDate: '',
		channel: '',
		channelId: '',
		channelUrl: '',
		webpageUrl: '',
		playlistMemberships: [],
		transcriptLanguages: [],
		commentCount: 0,
		archive: {}
	};
}

function itemFromInfo(info = {}, file) {
	const fallback = fallbackItem(file);
	return {
		...fallback,
		id: String(info.id || fallback.id).slice(0, 180),
		title: String(info.title || fallback.title).slice(0, 300),
		description: String(info.description || '').slice(0, 20000),
		publishedAt: isoDate(info.timestamp || info.release_timestamp || info.upload_date),
		rawUploadDate: String(info.upload_date || '').slice(0, 20),
		channel: String(info.channel || info.uploader || '').slice(0, 300),
		channelId: String(info.channel_id || info.uploader_id || '').slice(0, 180),
		channelUrl: String(info.channel_url || info.uploader_url || '').slice(0, 1400),
		webpageUrl: String(info.webpage_url || info.original_url || '').slice(0, 1400),
		commentCount: Math.max(0, Number(info.comment_count || 0))
	};
}

export async function readLocalYouTubeBundle(files = []) {
	const all = [...files];
	const sidecars = new Map();
	for (const file of all.filter(sidecarFile)) {
		if (file.size > 8 * 1024 * 1024) continue;
		try {
			const info = JSON.parse(await file.text());
			if (info?.id) sidecars.set(String(info.id), info);
		} catch {
			continue;
		}
	}
	return all.filter(videoFile).map(file => {
		const id = videoIdFromName(file.name);
		const info = id ? sidecars.get(id) : null;
		return { file, item: itemFromInfo(info || {}, file) };
	});
}

export { videoFile, sidecarFile, videoIdFromName, isoDate, fallbackItem, itemFromInfo };
