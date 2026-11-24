//B"H
/** The Awtsmoos preserves each source and its arrangement in one portable vessel. */
import { createMultitrackProject } from './multitrackProject.js';
import { createMultitrackId } from './multitrackIds.js';
const MAX_BYTES = 256 * 1024 * 1024;
const MAX_HEADER = 2 * 1024 * 1024;

/** Packs metadata and lossless float PCM without base64 expansion. */
export function packMultitrackProject(project, store) {
	const ids = new Set(project.tracks.flatMap(track => track.clips.map(clip => clip.bufferId)));
	const sources = [];
	const parts = [];
	let size = 0;
	for (const id of ids) {
		const buffer = store.getBuffer(id);
		if (!buffer) throw Error('Project has missing audio sources.');
		const entry = { id, name: store.getMetadata(id)?.name || 'Audio', channels: buffer.numberOfChannels, length: buffer.length, rate: buffer.sampleRate };
		size += entry.channels * entry.length * 4;
		if (size > MAX_BYTES) throw Error('Project exceeds the 256 MB archive limit.');
		sources.push(entry);
		for (let c = 0; c < entry.channels; c++) parts.push(buffer.getChannelData(c));
	}
	const header = new TextEncoder().encode(JSON.stringify({ format: 'awtsmoos-studio-1', project, sources }));
	if (header.length > MAX_HEADER || size + header.length + 4 > MAX_BYTES) throw Error('Project archive too large.');
	const prefix = new ArrayBuffer(4);
	new DataView(prefix).setUint32(0, header.length, true);
	return new Blob([prefix, header, ...parts], { type: 'application/octet-stream' });
}

/** Validates archive boundaries before replacing the live project. */
export async function unpackMultitrackProject(blob, context) {
	if (!blob || blob.size < 4 || blob.size > MAX_BYTES) throw Error('Invalid project archive size.');
	const headerSize = new DataView(await blob.slice(0,4).arrayBuffer()).getUint32(0,true);
	if (!headerSize || headerSize > MAX_HEADER || headerSize + 4 > blob.size) throw Error('Invalid project header.');
	const header = JSON.parse(await blob.slice(4,4 + headerSize).text());
	if (header.format !== 'awtsmoos-studio-1' || !Array.isArray(header.project?.tracks) || !Array.isArray(header.sources)) throw Error('Unsupported project format.');
	const project = createMultitrackProject(header.project);
	const descriptors = new Map();
	let position = 4 + headerSize;
	for (const source of header.sources) {
		const { id, channels, length, rate } = source;
		if (typeof id !== 'string' || descriptors.has(id) || !Number.isInteger(channels) || channels < 1 || channels > 8 || !Number.isSafeInteger(length) || length < 1 || !Number.isFinite(rate) || rate < 8000 || rate > 192000) throw Error('Invalid source metadata.');
		const bytes = channels * length * 4;
		if (position + bytes > blob.size) throw Error('Truncated audio source.');
		descriptors.set(id, { ...source, position });
		position += bytes;
	}
	if (position !== blob.size) throw Error('Unexpected archive data.');
	const trackIds = new Set();
	const clipIds = new Set();
	const regionIds = new Set();
	for (const track of project.tracks) {
		if (trackIds.has(track.id)) throw Error('Duplicate track identity.');
		trackIds.add(track.id);
		for (const clip of track.clips) {
			if (clipIds.has(clip.id) || !descriptors.has(clip.bufferId)) throw Error('Invalid clip reference.');
			clipIds.add(clip.id);
		}
		// MIDI regions own no audio sources; v1 archives simply have none.
		for (const region of track.midiRegions || []) {
			if (regionIds.has(region.id)) throw Error('Duplicate MIDI region identity.');
			regionIds.add(region.id);
		}
	}
	const buffers = new Map();
	const metadata = new Map();
	for (const source of descriptors.values()) {
		const id = createMultitrackId('buffer');
		const buffer = context.createBuffer(source.channels, source.length, source.rate);
		for (let c = 0; c < source.channels; c++) {
			const start = source.position + c * source.length * 4;
			const samples = new Float32Array(await blob.slice(start,start + source.length * 4).arrayBuffer());
			if (!samples.every(Number.isFinite)) throw Error('Invalid audio samples.');
			buffer.getChannelData(c).set(samples);
		}
		buffers.set(id, buffer);
		metadata.set(id, { id, name: String(source.name || 'Audio'), duration: buffer.duration, channels: source.channels, sampleRate: source.rate });
		source.newId = id;
	}
	for (const track of project.tracks) for (const clip of track.clips) clip.bufferId = descriptors.get(clip.bufferId).newId;
	return { project, buffers, metadata };
}

/** Installs validated data without deleting the previous session's undo sources. */
export function installMultitrackArchive(state, store, archive) {
	for (const [id, buffer] of archive.buffers) store.buffers.set(id, buffer);
	for (const [id, metadata] of archive.metadata) store.metadata.set(id, metadata);
	state.selection.clearSelection();
	state.selection.setPlayhead(0);
	state.setProject(archive.project);
}
