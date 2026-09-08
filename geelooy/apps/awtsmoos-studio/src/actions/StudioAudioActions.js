//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file StudioAudioActions.js
 * @description Imports durable audio, registers canonical movie asset identity, then creates timed layers that reference the same stored bytes.
 * The Awtsmoos gives voice substance before interface or encoder names it; Awtsmoos.com keeps one asset ID across project validation, preview, recovery, and final sound.
 */
import { commitStudioEditorMovie } from '../editor/StudioEditorCommit.js';
import { getStudioScene } from '../editor/StudioLayerAccess.js';
import { createStudioLayer } from '../editor/StudioLayerFactory.js';
const IMPORT_KINDS = new Set(['narration', 'music', 'sfx', 'dialogue']);
const STORAGE_KIND = 'awtsmoos-studio-indexeddb';

export function createStudioAudioActions(session) {
	return {
		selectStudioAudioImportKind({ event, store }) {
			const kind = event.currentTarget.dataset.audioKind;
			if (IMPORT_KINDS.has(kind)) store.set('audioImportKind', kind);
		},
		async importStudioAudio({ event, store }) {
			const file = event.currentTarget.files?.[0];
			if (!file) return;
			let asset = null;
			try {
				store.set('status', `Importing ${file.name}…`);
				asset = await session.audioAssets.save(file);
				const duration = await session.audioRuntime.duration(asset.id).catch(() => 0);
				commitImportedAudio(session, store, asset, duration);
			} catch (error) {
				if (asset?.id) await session.audioAssets.delete(asset.id).catch(() => null);
				store.set('status', `Audio import failed: ${error.message}`);
			} finally {
				event.currentTarget.value = '';
			}
		}
	};
}

function commitImportedAudio(session, store, asset, decodedDuration) {
	const movie = structuredClone(store.get('movie'));
	const scene = getStudioScene(movie, store.get('selectedSceneId'));
	if (!scene) throw new Error('Select a scene before importing audio.');
	registerMovieAudioAsset(movie, asset);
	const kind = IMPORT_KINDS.has(store.get('audioImportKind')) ? store.get('audioImportKind') : 'music';
	const layer = createStudioLayer(movie, scene, kind);
	const localPlayhead = Math.max(0, Number(store.get('playhead') || 0) - Number(scene.start || 0));
	layer.start = Math.min(localPlayhead, Math.max(0, scene.duration - 0.1));
	const available = Math.max(0.1, scene.duration - layer.start);
	layer.duration = Math.max(0.1, Math.min(decodedDuration || available, available));
	layer.data = { ...(layer.data || {}), assetId: asset.id, assetName: asset.name,
		mimeType: asset.type, size: asset.size, gain: 1, muted: false };
	scene.layers.push(layer);
	commitStudioEditorMovie(session, store, movie, {
		historyLabel: `${asset.name} imported.`, selectedLayerId: layer.id,
		status: `${asset.name} imported as ${kind}.`
	});
}

function registerMovieAudioAsset(movie, asset) {
	movie.assets = Array.isArray(movie.assets) ? movie.assets : [];
	const descriptor = { id: asset.id, kind: 'audio', name: asset.name,
		mimeType: asset.type, size: asset.size, storage: { kind: STORAGE_KIND } };
	const index = movie.assets.findIndex(item => item?.id === asset.id);
	if (index >= 0) movie.assets[index] = descriptor;
	else movie.assets.push(descriptor);
}
