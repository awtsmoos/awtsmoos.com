//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module VoiceTakeStore
 * @description
 * The Awtsmoos does not let a sung take vanish when the page sleeps:
 * every main-piano voice take — BOTH stems, its chosen Voice/Piano
 * balance and its polished rendering — is written into the same
 * content-addressed IndexedDB asset store the Studio uses, with a small
 * manifest in localStorage. Reloading restores the takes whole; deleting
 * a take releases its assets, and identical stems dedupe to one copy.
 */
import { MultitrackAssetStore } from '../workstation/song/multitrack/multitrackAssetStore.js';
import { bufferToAssetBytes, assetBytesToBuffer } from '../workstation/song/multitrack/multitrackAssetWiring.js';

export const VOICE_TAKES_KEY = 'awtsmoos-voice-takes-v1';

export function readTakeManifest(storage = globalThis.localStorage) {
	try {
		const parsed = JSON.parse(storage?.getItem(VOICE_TAKES_KEY) || '[]');
		return Array.isArray(parsed) ? parsed : [];
	} catch (_) { return []; }
}

export function writeTakeManifest(entries, storage = globalThis.localStorage) {
	try { storage?.setItem(VOICE_TAKES_KEY, JSON.stringify(entries)); } catch (_) { /* Quota: takes stay session-only. */ }
}

async function putStem(store, buffer, name) {
	if (!buffer) return null;
	const put = await store.put(bufferToAssetBytes(buffer), name);
	return { assetId: put.id, channels: buffer.numberOfChannels, length: buffer.length, rate: buffer.sampleRate, name };
}

async function releaseStem(store, meta) {
	if (meta?.assetId) await store.release(meta.assetId);
}

/**
 * Persists one take (replacing any earlier persisted copy of the same
 * take, releasing its old assets first). Returns the manifest entry.
 */
export async function saveVoiceTake(take, options = {}) {
	const store = options.store || new MultitrackAssetStore(options.backend);
	const storage = options.storage;
	const entries = readTakeManifest(storage);
	const previous = entries.find(entry => entry.id === take.id);
	if (previous) {
		await releaseStem(store, previous.voice);
		await releaseStem(store, previous.piano);
		await releaseStem(store, previous.polished);
	}
	const entry = {
		id: take.id,
		createdAt: take.createdAt || Date.now(),
		duration: take.duration,
		voiceGain: take.voiceGain,
		pianoGain: take.pianoGain,
		duckAmount: take.duckAmount,
		voiceCompression: take.voiceCompression,
		voiceStart: take.voice?.startContextTime || 0,
		pianoStart: take.piano?.startContextTime ?? null,
		voice: await putStem(store, take.voice?.buffer, `Voice Take ${take.id}`),
		piano: await putStem(store, take.piano?.buffer, `Piano Take ${take.id}`),
		polished: await putStem(store, take.polishedBuffer, `Polished Take ${take.id}`)
	};
	writeTakeManifest([...entries.filter(item => item.id !== take.id), entry], storage);
	return entry;
}

export function updateVoiceTakeMix(id, mix = {}, storage = globalThis.localStorage) {
	const entries = readTakeManifest(storage);
	const entry = entries.find(item => item.id === id);
	if (!entry) return false;
	if (Number.isFinite(Number(mix.voiceGain))) entry.voiceGain = Number(mix.voiceGain);
	if (Number.isFinite(Number(mix.pianoGain))) entry.pianoGain = Number(mix.pianoGain);
	if (Number.isFinite(Number(mix.duckAmount))) entry.duckAmount = Number(mix.duckAmount);
	if (Number.isFinite(Number(mix.voiceCompression))) entry.voiceCompression = Number(mix.voiceCompression);
	writeTakeManifest(entries, storage);
	return true;
}

/** Balance-only manifest update — no asset churn when the singer remixes. */
export function updateVoiceTakeBalance(id, voiceGain, pianoGain, storage = globalThis.localStorage) {
	const entries = readTakeManifest(storage);
	const entry = entries.find(item => item.id === id);
	if (!entry) return false;
	entry.voiceGain = voiceGain;
	entry.pianoGain = pianoGain;
	writeTakeManifest(entries, storage);
	return true;
}

/** Removes a take from the manifest and releases its stored stems. */
export async function deleteVoiceTake(id, options = {}) {
	const store = options.store || new MultitrackAssetStore(options.backend);
	const entries = readTakeManifest(options.storage);
	const entry = entries.find(item => item.id === id);
	if (!entry) return false;
	await releaseStem(store, entry.voice);
	await releaseStem(store, entry.piano);
	await releaseStem(store, entry.polished);
	writeTakeManifest(entries.filter(item => item.id !== id), options.storage);
	return true;
}

/**
 * Restores every persisted take with stems, balance and polished buffer
 * intact, in the exact shape the piano voice-take control keeps in
 * memory. Missing assets skip that stem silently (never throw).
 */
export async function restoreVoiceTakes(options = {}) {
	const store = options.store || new MultitrackAssetStore(options.backend);
	const context = options.context;
	if (!context) throw new Error('An audio context is required to restore takes.');
	const takes = [];
	for (const entry of readTakeManifest(options.storage)) {
		const load = async meta => {
			if (!meta?.assetId) return null;
			const bytes = await store.get(meta.assetId);
			return bytes ? assetBytesToBuffer(bytes, meta, context) : null;
		};
		const voiceBuffer = await load(entry.voice);
		if (!voiceBuffer) continue;
		const pianoBuffer = await load(entry.piano);
		takes.push({
			id: entry.id,
			createdAt: entry.createdAt,
			duration: entry.duration,
			voiceGain: entry.voiceGain,
			pianoGain: entry.pianoGain,
			duckAmount: entry.duckAmount,
			voiceCompression: entry.voiceCompression,
			voice: { buffer: voiceBuffer, startContextTime: entry.voiceStart || 0 },
			piano: pianoBuffer ? { buffer: pianoBuffer, startContextTime: entry.pianoStart || 0 } : null,
			polishedBuffer: await load(entry.polished),
			mixedCache: null,
			restored: true
		});
	}
	return takes.sort((a, b) => a.id - b.id);
}
