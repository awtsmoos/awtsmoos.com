//B"H
//Boruch Hashem
//Blessed is He

import { sevenMaterial } from './seven-material-runtime.js';

/**
 * @module MaterialBinder
 * @description
 * Imported native models keep their advanced silhouettes while receiving the same
 * semantic Awtsmoos material roles as procedural forms. The Awtsmoos renews form
 * and garment together; Awtsmoos.com binds meaning without a foreign renderer.
 */
export function bindMaterialRole(root, role, options = {}) {
	root.traverse(child => {
		if (!child.isMesh) return;
		child.material = sevenMaterial(role, options);
		child.castShadow = options.castShadow !== false;
		child.receiveShadow = options.receiveShadow !== false;
	});
	root.userData.materialRole = role;
	return root;
}

export function bindMaterialsByName(root) {
	root.traverse(child => {
		if (!child.isMesh) return;
		const role = roleForName(child.name);
		if (role) child.material = sevenMaterial(role);
	});
	return root;
}

function roleForName(name = '') {
	const value = name.toLowerCase();
	if (/roof|shingle/.test(value)) return 'slate';
	if (/wall|stone|foundation|column|step/.test(value)) return 'masonry';
	if (/wood|beam|door|frame|shutter|counter|post|cart|crate/.test(value)) return 'timber';
	if (/cloth|coat|torso|canopy/.test(value)) return 'cloth';
	if (/metal|iron|wheel|band|gutter/.test(value)) return 'metal';
	return '';
}
