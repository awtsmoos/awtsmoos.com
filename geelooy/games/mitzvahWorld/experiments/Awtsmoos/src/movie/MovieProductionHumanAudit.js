// B"H
// Boruch Hashem
// Blessed is He

/** Allows asset-native Chossid colors while rejecting substituted materials, people, and motion. */
import { materialList, materialUsesFallback } from './MovieProductionTextureEvidence.js';

export function auditMovieProductionHumans(runtime, director) {
	const violations = [];
	const model = runtime?.model;
	const meshes = visibleMeshes(model);
	if (!canonicalPlayer(runtime)) violations.push(issue('NONCANONICAL_PLAYER', model?.name));
	if (!meshes.length) violations.push(issue('CHOSSID_MESH_MISSING', model?.name));
	for (const mesh of meshes) auditChossidMesh(mesh, violations);
	auditPlayer(runtime?.player, 'runtime.player', violations);
	auditCrowd(director, violations);
	visitVisible(runtime?.scene, node => auditForbiddenNode(node, violations));
	return Object.freeze({
		chossidMeshes: meshes.length,
		ready: violations.length === 0,
		violations: Object.freeze(violations)
	});
}

function canonicalPlayer(runtime) {
	if (!runtime?.model || runtime.model.visible === false) return false;
	if (runtime.canonicalPlayer?.status === 'ready') return true;
	return runtime.model.userData?.AwtsmoosCanonicalPlayer?.modelSource === 'chossid.glb';
}

function auditChossidMesh(mesh, violations) {
	for (const material of materialList(mesh.material)) {
		if (materialUsesFallback(material)) {
			violations.push(issue('CHOSSID_MATERIAL_SUBSTITUTED', `${mesh.name}:${material.name}`));
			continue;
		}
		if (!validColor(material.baseColorFactor || material.color)) {
			violations.push(issue('CHOSSID_ASSET_COLOR_INVALID', `${mesh.name}:${material.name}`));
		}
	}
}

function auditPlayer(player, path, violations) {
	const state = player?.diagnostics?.() || {};
	const clips = Number(state.clipCount ?? player?.clips?.length ?? player?.names?.length ?? 0);
	const current = state.currentAnimation || player?.current?.name || null;
	const channels = Number(state.channels ?? player?.current?.channels?.length ?? 0);
	if (clips < 1 || !current || channels < 1 || state.bindPose === true || state.playing === false) {
		violations.push(issue('CHOSSID_ANIMATION_INACTIVE', path));
	}
}

function auditCrowd(director, violations) {
	for (const [id, record] of director?.crowd?.records || []) {
		if (record.figure?.visible === false) continue;
		if (!record.borrowed) violations.push(issue('PROCEDURAL_HUMAN_VISIBLE', id));
		else auditPlayer(record.actor?.player, `crowd.${id}`, violations);
	}
}

function auditForbiddenNode(node, violations) {
	const data = node?.userData || {};
	const family = String(data.family || '');
	const name = String(node?.name || '');
	if (data.modelAssetFallback || /movie-procedural-character|friendly-npc-proxy/i.test(family)) {
		violations.push(issue('PROCEDURAL_HUMAN_VISIBLE', name || family));
	}
	if (/fallback.*(?:human|player|chossid)|bootstrap.*player/i.test(name)) {
		violations.push(issue('FALLBACK_HUMAN_VISIBLE', name));
	}
}

function validColor(value) {
	if (Array.isArray(value) || ArrayBuffer.isView(value)) {
		return value.length >= 3 && Array.from(value).slice(0, 4).every(Number.isFinite);
	}
	return Number.isFinite(value?.r) && Number.isFinite(value?.g) && Number.isFinite(value?.b);
}

function visibleMeshes(root) {
	const meshes = [];
	visitVisible(root, node => { if (node.isMesh || node.isSkinnedMesh) meshes.push(node); });
	return meshes;
}

function visitVisible(node, visit) {
	if (!node || node.visible === false) return;
	visit(node);
	for (const child of node.children || []) visitVisible(child, visit);
}

function issue(code, path) { return Object.freeze({ code, path: path || null }); }
