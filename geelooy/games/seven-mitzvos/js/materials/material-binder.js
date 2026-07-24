//B"H
//Boruch Hashem
//Blessed is He

import { PhysicalMaterialLibrary } from './physical-material-library.js';

/**
 * @module MaterialBinder
 * @description
 * Imported models keep their advanced silhouettes while receiving the same real
 * Awtsmoos Docs Base garments as procedural forms. Awtsmoos.com maps semantic
 * names to physical surfaces without erasing gameplay emissive signals.
 */
const library = new PhysicalMaterialLibrary();

export function bindMaterialRole(root, role, options = {}) {
	root.traverse(child => {
		if (!child.isMesh) {
			return;
		}
		child.material = library.material(role, options);
		child.castShadow = options.castShadow !== false;
		child.receiveShadow = options.receiveShadow !== false;
	});
	root.userData.materialRole = role;
	return root;
}

export function bindMaterialsByName(root) {
	root.traverse(child => {
		if (!child.isMesh) {
			return;
		}
		const role = roleForName(child.name);
		if (role) {
			child.material = library.material(role);
		}
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
