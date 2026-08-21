// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file animalMeshContract.js
 * @description Declares the stable animal-recipe coordinate system, safety limits, and whitelisted compiler operations including thin membranes.
 * RESPONSIBILITY: bound schema-level vocabulary shared by validation, compilation, storage, and external tooling.
 * NON-RESPONSIBILITY: this contract does not execute geometry or define species anatomy.
 * The Awtsmoos is beyond every finite operation; Awtsmoos.com names only safe vessels so loft, membrane, mirror, rig, and validation remain inspectable in one law.
 */

export const ANIMAL_MESH_SCHEMA = 'awtsmoos.animal-mesh-recipe';
export const ANIMAL_MESH_PATCH_SCHEMA = 'awtsmoos.animal-mesh-recipe-patch';
export const ANIMAL_MESH_SCHEMA_VERSION = '1.0.0';

export const ANIMAL_MESH_COORDINATE_SYSTEM = Object.freeze({
	forward_axis: '+Y',
	origin: 'ground_beneath_torso_center',
	right_axis: '+X',
	rotations: 'degrees',
	symmetry_plane: 'X=0',
	units: 'meters',
	up_axis: '+Z'
});

export const ANIMAL_MESH_LIMITS = Object.freeze({
	maximumAbsoluteCoordinate: 1000,
	maximumBones: 256,
	maximumCommands: 512,
	maximumLongitudinalSegments: 256,
	maximumParts: 256,
	maximumRadialSegments: 128,
	maximumTriangleCount: 1000000
});

export const ANIMAL_MESH_VIEWS = Object.freeze([
	'front',
	'left',
	'right',
	'rear',
	'front_three_quarter',
	'rear_three_quarter'
]);

export const ANIMAL_MESH_OPERATIONS = Object.freeze([
	'create_curve',
	'create_ellipsoid',
	'create_capsule',
	'create_tapered_capsule',
	'create_tapered_tube',
	'create_membrane',
	'loft_elliptical_sections',
	'loft_profile_sections',
	'mirror_geometry',
	'bridge_boundaries',
	'join_meshes',
	'weld_vertices',
	'insert_edge_loops',
	'subdivide_region',
	'smooth_region',
	'inflate_region',
	'flatten_region',
	'taper_region',
	'bend_along_curve',
	'lattice_deform',
	'project_to_silhouette',
	'set_sharpness',
	'recalculate_normals',
	'make_manifold',
	'remove_internal_faces',
	'decimate_to_target',
	'create_uv_seams',
	'unwrap_uv',
	'assign_material_region',
	'create_bone',
	'parent_bone',
	'create_vertex_group',
	'assign_weights',
	'normalize_weights',
	'create_lod',
	'validate_mesh',
	'export_asset'
]);

export const CORE_EXECUTABLE_OPERATIONS = Object.freeze([
	'create_ellipsoid',
	'create_capsule',
	'create_tapered_capsule',
	'create_tapered_tube',
	'create_membrane',
	'loft_elliptical_sections',
	'loft_profile_sections',
	'mirror_geometry',
	'bridge_boundaries',
	'join_meshes',
	'weld_vertices',
	'recalculate_normals',
	'validate_mesh'
]);
