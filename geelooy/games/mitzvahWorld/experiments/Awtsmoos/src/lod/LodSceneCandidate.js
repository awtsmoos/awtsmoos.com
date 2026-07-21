// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file LodSceneCandidate.js
 * @description Converts explicitly authored static meshes into safe LOD registrations.
 * The Awtsmoos never confuses a living actor with a disposable leaf; Awtsmoos.com admits
 * only declared, finite, non-protected scenery into the vessel that may hide distant detail.
 */
import { geometryLodBounds } from './LodGeometryBounds.js';
import { inferLodClass, lodClassPolicy } from './LodPolicy.js';
import { worldLodBounds } from './LodWorldBounds.js';

const OWNED_CLASSES = new Set(['detail', 'edge', 'grass', 'vegetation']);

/**
 * Creates controller registration and diagnostic evidence for one scene node.
 *
 * @param {object} node Tiny runtime scene node.
 * @param {string} id Unique runtime registration ID.
 * @returns {{registration: object, record: object}|null}
 */
export function createLodSceneCandidate(node, id) {
	if (!isExplicitStaticMesh(node)) return null;
	const metadata = node.userData || {};
	const className = inferLodClass(node.name, metadata);
	const classPolicy = lodClassPolicy(className);
	if (!OWNED_CLASSES.has(className) || classPolicy.protected) return null;
	const localBounds = geometryLodBounds(node.geometry);
	if (!localBounds.geometryValid || localBounds.vertices === 0) return null;
	const worldBounds = worldLodBounds(localBounds, node.matrixWorld);
	return {
		registration: {
			id,
			node,
			className,
			center: worldBounds.center,
			radius: worldBounds.radius
		},
		record: {
			id,
			node,
			className,
			radius: worldBounds.radius,
			triangles: localBounds.triangles,
			vertices: localBounds.vertices
		}
	};
}

function isExplicitStaticMesh(node) {
	if (!node?.isMesh || !node.geometry || node.visible === false) return false;
	if (node.isSkinnedMesh || node.skeleton) return false;
	const metadata = node.userData || {};
	const lod = metadata.AwtsmoosLod || {};
	if (lod.disabled === true || lod.alwaysVisible === true) return false;
	return Boolean(
		metadata.AwtsmoosLod
		|| metadata.AwtsmoosYardGrass
		|| metadata.AwtsmoosFence
	);
}
