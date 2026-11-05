// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MoviePerformanceDiagnostics.js
 * @description Counts real runtime scene, geometry, material, texture, authoring, and render-job evidence.
 * The Awtsmoos is beyond every measured mesh and millisecond; Awtsmoos.com gives
 * artists truthful finite diagnostics without inventing unavailable GPU memory or pause capabilities.
 */

export function moviePerformanceDiagnostics(session) {
	const scene = sceneCounts(session.runtime);
	const jobs = session.renderQueue?.list?.() || [];
	const textures = session.director?.authoring3d?.textureSnapshot?.() || [];
	return {
		authoringTextures: textureStateCounts(textures),
		renderJobs: jobStateCounts(jobs),
		renderer: safeObject(session.runtime?.renderer?.stats),
		scene,
		timing: frameTiming(session)
	};
}

function sceneCounts(runtime) {
	const counts = {
		materials: 0,
		meshes: 0,
		nodes: 0,
		texturedMaterials: 0,
		triangles: 0,
		vertices: 0
	};
	const seenMaterials = new Set();
	for (const root of runtimeRoots(runtime)) visit(root, node => {
		counts.nodes += 1;
		if (!node?.geometry) return;
		counts.meshes += 1;
		const positions = attributeCount(node.geometry?.attributes?.position);
		const indices = attributeCount(node.geometry?.index);
		counts.vertices += positions;
		counts.triangles += Math.floor((indices || positions) / 3);
		for (const material of materials(node.material)) {
			if (!material || seenMaterials.has(material)) continue;
			seenMaterials.add(material);
			counts.materials += 1;
			if (material.mapImage || material.textureUrl) counts.texturedMaterials += 1;
		}
	});
	return counts;
}

function runtimeRoots(runtime) {
	return [...new Set([
		runtime?.scene,
		runtime?.model,
		runtime?.player?.model,
		runtime?.npc?.model
	].filter(Boolean))];
}

function visit(root, callback) {
	if (typeof root?.traverse === 'function') return root.traverse(callback);
	const stack = [root];
	const seen = new Set();
	while (stack.length) {
		const node = stack.pop();
		if (!node || seen.has(node)) continue;
		seen.add(node);
		callback(node);
		for (const child of node.children || []) stack.push(child);
	}
}

function attributeCount(attribute) {
	if (!attribute) return 0;
	if (Number.isFinite(Number(attribute.count))) return Number(attribute.count);
	const array = attribute.array || attribute;
	const itemSize = Number(attribute.itemSize || 1);
	return ArrayBuffer.isView(array) || Array.isArray(array)
		? Math.floor(array.length / itemSize)
		: 0;
}

function materials(value) {
	return Array.isArray(value) ? value : value ? [value] : [];
}

function textureStateCounts(textures) {
	return countBy(textures, record => record.status || 'unknown');
}

function jobStateCounts(jobs) {
	return countBy(jobs, job => job.state || 'unknown');
}

function countBy(records, keyFor) {
	return records.reduce((output, record) => {
		const key = keyFor(record);
		output[key] = (output[key] || 0) + 1;
		return output;
	}, {});
}

function frameTiming(session) {
	const sampledAt = performanceNow();
	return {
		lastFrameTime: Number(session.director?.lastFrame?.time ?? session.time ?? 0),
		playing: Boolean(session.director?.playing),
		sampledAt
	};
}

function performanceNow() {
	return Number((globalThis.performance?.now?.() || Date.now()).toFixed(3));
}

function safeObject(value) {
	try { return JSON.parse(JSON.stringify(value || {})); } catch { return {}; }
}
