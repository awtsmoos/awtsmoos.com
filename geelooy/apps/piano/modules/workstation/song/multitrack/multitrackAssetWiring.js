//B"H
/**
 * The Awtsmoos keeps one copy of each sound: an ADDITIVE dedupe layer beside
 * the existing library/autosave. Embedded project archives remain the source
 * of truth — the asset store only mirrors source PCM by content hash, loads
 * hydrate from it when present, and a missing entry is a cache miss, never an
 * error. A localStorage revision guard keeps two Studio tabs from silently
 * overwriting each other's deduplication work.
 */
import { MultitrackAssetStore } from './multitrackAssetStore.js';

export const ASSET_MANIFEST_KEY = 'awtsmoos-studio-asset-manifest-v1';
export const ASSET_REVISION_KEY = 'awtsmoos-studio-asset-revision-v1';

/** Interleaves an AudioBuffer-like object into Float32 bytes for the store. */
export function bufferToAssetBytes(buffer) {
	const channels = buffer.numberOfChannels, length = buffer.length;
	const out = new Float32Array(channels * length);
	for (let c = 0; c < channels; c++) {
		const data = buffer.getChannelData(c);
		for (let i = 0; i < length; i++) out[i * channels + c] = data[i];
	}
	return new Uint8Array(out.buffer, out.byteOffset, out.byteLength);
}

/** Rebuilds an AudioBuffer-like object from interleaved asset bytes. */
export function assetBytesToBuffer(bytes, meta, context) {
	const floats = new Float32Array(bytes.buffer, bytes.byteOffset, Math.floor(bytes.byteLength / 4));
	const buffer = context.createBuffer(meta.channels, meta.length, meta.rate);
	for (let c = 0; c < meta.channels; c++) {
		const data = buffer.getChannelData(c);
		for (let i = 0; i < meta.length; i++) data[i] = floats[i * meta.channels + c];
	}
	return buffer;
}

export function readAssetManifest(storage = globalThis.localStorage) {
	try { return JSON.parse(storage?.getItem(ASSET_MANIFEST_KEY) || '{}') || {}; } catch (_) { return {}; }
}
export function writeAssetManifest(manifest, storage = globalThis.localStorage) {
	try { storage?.setItem(ASSET_MANIFEST_KEY, JSON.stringify(manifest)); } catch (_) { /* Quota: embedded archives still carry the audio. */ }
}

/**
 * Mirrors every project source buffer into the asset store once per content
 * hash. Returns per-buffer outcomes; identical PCM under two ids dedupes.
 */
export async function dedupeProjectSources(project, audioStore, assetStore, storage) {
	const manifest = readAssetManifest(storage);
	const results = [];
	const ids = new Set();
	for (const track of project?.tracks || []) {
		for (const clip of track.clips || []) ids.add(clip.bufferId);
		for (const clip of track.frozen?.snapshot?.clips || []) ids.add(clip.bufferId);
		if (track.frozen?.bufferId) ids.add(track.frozen.bufferId);
	}
	for (const bufferId of ids) {
		if (!bufferId || manifest[bufferId]) { if (bufferId) results.push({ bufferId, skipped: true }); continue; }
		const buffer = audioStore?.getBuffer?.(bufferId);
		if (!buffer) { results.push({ bufferId, missing: true }); continue; }
		const put = await assetStore.put(bufferToAssetBytes(buffer), audioStore.getMetadata?.(bufferId)?.name || 'Audio');
		manifest[bufferId] = { assetId: put.id, channels: buffer.numberOfChannels, length: buffer.length, rate: buffer.sampleRate, name: audioStore.getMetadata?.(bufferId)?.name || 'Audio' };
		results.push({ bufferId, assetId: put.id, deduplicated: put.deduplicated });
	}
	writeAssetManifest(manifest, storage);
	return results;
}

/**
 * Restores manifest buffers that are absent from the runtime audio store.
 * Missing asset-store entries are skipped silently — callers fall back to the
 * embedded archive bytes exactly as before this layer existed.
 */
export async function hydrateProjectSources(audioStore, assetStore, context, storage) {
	const manifest = readAssetManifest(storage);
	const restored = [], missing = [];
	for (const [bufferId, meta] of Object.entries(manifest)) {
		if (audioStore.getBuffer?.(bufferId)) continue;
		const bytes = await assetStore.get(meta.assetId);
		if (!bytes) { missing.push(bufferId); continue; }
		audioStore.setBuffer(bufferId, assetBytesToBuffer(bytes, meta, context), meta.name);
		restored.push(bufferId);
	}
	return { restored, missing };
}

/**
 * Multi-tab revision guard: each tab claims a monotonically increasing
 * revision for a project id; a tab whose claim is no longer the latest has
 * been superseded and must not write.
 */
export function createProjectRevisionGuard(storage = globalThis.localStorage, tabId = Math.random().toString(36).slice(2)) {
	const read = () => { try { return JSON.parse(storage?.getItem(ASSET_REVISION_KEY) || '{}') || {}; } catch (_) { return {}; } };
	return {
		tabId,
		claim(projectId) {
			const all = read();
			const revision = (all[projectId]?.revision || 0) + 1;
			all[projectId] = { revision, tabId };
			try { storage?.setItem(ASSET_REVISION_KEY, JSON.stringify(all)); } catch (_) {}
			return revision;
		},
		isLatest(projectId, revision) {
			const current = read()[projectId];
			return Boolean(current) && current.revision === revision && current.tabId === tabId;
		}
	};
}

/**
 * Binds the additive layer to studio state: on project change (debounced,
 * serialized) claim a revision, dedupe sources, and warn instead of writing
 * when another tab has claimed a newer revision. Never touches the existing
 * autosave/library save paths.
 */
export function bindAssetStoreWiring(state, audioStore, options = {}) {
	const assetStore = options.assetStore || new MultitrackAssetStore();
	const guard = createProjectRevisionGuard(options.storage);
	const report = options.report || (() => {});
	let previous = state.project, timer = null, serial = Promise.resolve(), warned = false;
	const unsubscribe = state.subscribe(() => {
		if (state.project === previous) return;
		previous = state.project;
		clearTimeout(timer);
		const project = previous;
		timer = setTimeout(() => {
			serial = serial.catch(() => {}).then(async () => {
				const revision = guard.claim(project.id);
				await Promise.resolve(); // Let a simultaneous tab claim land before checking.
				if (!guard.isLatest(project.id, revision)) {
					if (!warned) { warned = true; report('Another Studio tab is active — asset mirroring paused to avoid overwriting it.'); }
					return;
				}
				warned = false;
				await dedupeProjectSources(project, audioStore, assetStore, options.storage);
			}).catch(() => { /* Additive layer: failures never affect saves. */ });
		}, options.debounceMs ?? 1500);
	});
	return { assetStore, guard, unsubscribe, idle: () => serial };
}
