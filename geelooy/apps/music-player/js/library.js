// B"H — Device library: File System Access folder picking, file picking,
// drag-and-drop, and turning raw files into track records.
export const AUDIO_EXTS = new Set([
	'mp3', 'wav', 'wave', 'ogg', 'oga', 'm4a', 'aac', 'flac', 'opus', 'webm', 'aif', 'aiff', 'mp4', 'm4b',
]);

export function isAudioName(name) {
	const dot = name.lastIndexOf('.');
	if (dot < 0) return false;
	return AUDIO_EXTS.has(name.slice(dot + 1).toLowerCase());
}

export function parseFileName(name) {
	const base = name.replace(/\.[^.]+$/, '').replace(/_/g, ' ').trim();
	const parts = base.split(/\s+-\s+/);
	if (parts.length >= 2) return { artist: parts[0].trim(), title: parts.slice(1).join(' - ').trim() };
	return { artist: '', title: base };
}

export function uid() {
	if (crypto.randomUUID) return crypto.randomUUID();
	return 't-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
}

function probeDuration(file) {
	return new Promise((resolve) => {
		const url = URL.createObjectURL(file);
		const audio = new Audio();
		audio.preload = 'metadata';
		const done = (value) => {
			URL.revokeObjectURL(url);
			audio.src = '';
			resolve(value);
		};
		const timer = setTimeout(() => done(null), 8000);
		audio.onloadedmetadata = () => { clearTimeout(timer); done(Number.isFinite(audio.duration) ? audio.duration : null); };
		audio.onerror = () => { clearTimeout(timer); done(null); };
		audio.src = url;
	});
}

export async function fileToTrack(file, sourceName, handle) {
	const { artist, title } = parseFileName(file.name);
	const duration = await probeDuration(file);
	return {
		id: uid(),
		name: file.name,
		title: title || file.name,
		artist,
		size: file.size,
		lastModified: file.lastModified || Date.now(),
		dateAdded: Date.now(),
		duration,
		source: sourceName || '',
		handle: handle || null,
		blob: handle ? null : file,
	};
}

async function walkDirectory(dirHandle, out, onProgress) {
	for await (const entry of dirHandle.values()) {
		if (entry.kind === 'file') {
			if (isAudioName(entry.name)) {
				try {
					const file = await entry.getFile();
					out.push({ file, handle: entry });
					if (onProgress) onProgress(out.length);
				} catch (err) { console.warn('Could not read file', entry.name, err); }
			}
		} else if (entry.kind === 'directory') {
			await walkDirectory(entry, out, onProgress);
		}
	}
}

export async function pickFolder(onProgress) {
	if (!window.showDirectoryPicker) throw new Error('folder-picker-unsupported');
	const dir = await window.showDirectoryPicker({ mode: 'read' });
	const found = [];
	await walkDirectory(dir, found, onProgress);
	return { sourceName: dir.name, dirHandle: dir, files: found };
}

export async function pickFiles() {
	if (!window.showOpenFilePicker) throw new Error('file-picker-unsupported');
	const handles = await window.showOpenFilePicker({
		multiple: true,
		types: [{ description: 'Audio', accept: { 'audio/*': ['.mp3', '.wav', '.ogg', '.oga', '.m4a', '.aac', '.flac', '.opus', '.webm', '.aif', '.aiff'] } }],
	});
	const out = [];
	for (const h of handles) {
		if (!isAudioName(h.name)) continue;
		out.push({ file: await h.getFile(), handle: h });
	}
	return { sourceName: 'Chosen files', dirHandle: null, files: out };
}

async function entryToFiles(entry, out) {
	if (entry.isFile) {
		if (!isAudioName(entry.name)) return;
		const file = await new Promise((res, rej) => entry.file(res, rej));
		out.push({ file, handle: null });
	} else if (entry.isDirectory) {
		const reader = entry.createReader();
		const entries = await new Promise((res, rej) => reader.readEntries(res, rej));
		for (const child of entries) await entryToFiles(child, out);
	}
}

export async function collectFromDrop(dataTransfer) {
	const out = [];
	const items = Array.from(dataTransfer.items || []);
	for (const item of items) {
		if (typeof item.getAsFileSystemHandle === 'function') {
			const handle = await item.getAsFileSystemHandle();
			if (!handle) continue;
			if (handle.kind === 'file') {
				if (isAudioName(handle.name)) out.push({ file: await handle.getFile(), handle });
			} else if (handle.kind === 'directory') {
				await walkDirectory(handle, out);
			}
		} else if (typeof item.webkitGetAsEntry === 'function') {
			const entry = item.webkitGetAsEntry();
			if (entry) await entryToFiles(entry, out);
		} else if (item.kind === 'file') {
			const file = item.getAsFile();
			if (file && isAudioName(file.name)) out.push({ file, handle: null });
		}
	}
	return { sourceName: 'Dropped files', dirHandle: null, files: out };
}

export async function resolveTrackFile(track) {
	if (track.handle) {
		if (typeof track.handle.queryPermission === 'function') {
			const perm = await track.handle.queryPermission({ mode: 'read' });
			if (perm !== 'granted') {
				const asked = await track.handle.requestPermission({ mode: 'read' });
				if (asked !== 'granted') throw new Error('permission-denied');
			}
		}
		return track.handle.getFile();
	}
	if (track.blob) return track.blob;
	throw new Error('missing-file');
}

export async function handleNeedsPermission(track) {
	if (!track.handle || !track.handle.queryPermission) return false;
	return (await track.handle.queryPermission({ mode: 'read' })) !== 'granted';
}
