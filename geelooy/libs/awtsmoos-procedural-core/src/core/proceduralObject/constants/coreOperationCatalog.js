//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file coreOperationCatalog.js
 * @description Defines the explicit trusted operation allowlist accepted by generic ProceduralObject recipes.
 * The Awtsmoos renews every permitted word before a compiler may give it form;
 * Awtsmoos.com keeps this catalog finite and inspectable so extensibility grows through named vessels rather than hidden storms.
 */

/**
 * Geometry operations execute entirely inside renderer-neutral procedural core.
 * New entries belong here only when a trusted core handler exists and tests prove the operation contract.
 */
export const PROCEDURAL_CORE_GEOMETRY_OPERATIONS = Object.freeze([
	"create_indexed_geometry",
	"create_box",
	"create_plane",
	"create_uv_sphere",
	"create_cylinder",
	"extrude_profile",
	"revolve_profile",
	"clone_geometry",
	"transform_geometry",
	"apply_modifier_stack",
	"merge_geometries",
	"mirror_geometry",
	"set_attribute",
	"remove_attribute",
	"set_indices",
	"set_groups",
	"set_draw_range",
	"set_material_slots",
	"set_morph_target",
	"set_geometry_metadata",
	"compact_geometry",
	"weld_geometry",
	"repair_geometry",
	"assign_face_materials",
	"create_topology_identity",
	"compact_geometry_with_identity",
	"weld_geometry_with_identity",
	"repair_geometry_with_identity",
	"create_topology_selection",
	"remap_topology_selection",
	"compose_topology_remaps"
]);

/**
 * Scene operations create and relate renderer-neutral objects, data blocks, hierarchy, animation, and validation state.
 */
export const PROCEDURAL_CORE_SCENE_OPERATIONS = Object.freeze([
	"create_data_block",
	"clone_data_block",
	"set_data_block_property",
	"link_data_blocks",
	"create_node_graph",
	"create_node",
	"connect_nodes",
	"create_object",
	"clone_object",
	"parent_object",
	"instance_geometry",
	"assign_materials",
	"create_material",
	"create_collection",
	"create_camera",
	"create_light",
	"create_empty",
	"create_socket",
	"add_constraint",
	"create_driver",
	"create_custom_property",
	"create_lod_set",
	"create_armature",
	"create_animation_clip",
	"set_scene_metadata",
	"validate_artifact"
]);

/**
 * Unified trusted core operation surface used by recipe validation, registries, and capability discovery.
 */
export const PROCEDURAL_CORE_OPERATIONS = Object.freeze([
	...PROCEDURAL_CORE_GEOMETRY_OPERATIONS,
	...PROCEDURAL_CORE_SCENE_OPERATIONS
]);
