// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every attribute, index, object, and world from nothing
 * at every instant. This Awtsmoos.com vessel keeps one responsibility bounded
 * so limitless procedural form remains inspectable, deterministic, and safe.
 */

export const PROCEDURAL_MODELING_OPERATIONS = Object.freeze([
	"create_curve",
	"create_bezier_curve",
	"create_nurbs_curve",
	"create_surface",
	"create_text",
	"create_volume",
	"curve_to_mesh",
	"sweep_profile",
	"loft_sections",
	"skin_graph",
	"boolean_union",
	"boolean_intersection",
	"boolean_difference",
	"bevel_geometry",
	"inset_faces",
	"extrude_faces",
	"bridge_boundaries",
	"weld_vertices",
	"subdivide_surface",
	"voxel_remesh",
	"retopologize",
	"decimate_geometry",
	"solidify_geometry",
	"array_geometry",
	"radial_array",
	"lattice_deform",
	"shrinkwrap",
	"project_to_surface",
	"sculpt_surface",
	"generate_geometry_nodes"
]);

export const PROCEDURAL_SURFACE_OPERATIONS = Object.freeze([
	"unwrap_uv",
	"pack_uv",
	"create_uv_seams",
	"transfer_uv",
	"create_shader_graph",
	"create_procedural_texture",
	"assign_material_regions",
	"bake_texture",
	"bake_normal_map",
	"bake_displacement",
	"bake_ambient_occlusion",
	"generate_tangents",
	"generate_lightmap_uv"
]);

export const PROCEDURAL_SIMULATION_OPERATIONS = Object.freeze([
	"simulate_cloth",
	"simulate_soft_body",
	"simulate_fluid",
	"simulate_smoke",
	"simulate_fire",
	"simulate_rigid_body",
	"simulate_particles",
	"simulate_hair",
	"simulate_fur",
	"simulate_ocean",
	"simulate_geometry_nodes",
	"bake_simulation"
]);

export const PROCEDURAL_OUTPUT_OPERATIONS = Object.freeze([
	"create_render_settings",
	"create_world",
	"create_compositor_graph",
	"create_view_layer",
	"create_export_collection",
	"render_image",
	"render_animation",
	"export_asset"
]);

export const PROCEDURAL_ADAPTER_OPERATIONS = Object.freeze([
	...PROCEDURAL_MODELING_OPERATIONS,
	...PROCEDURAL_SURFACE_OPERATIONS,
	...PROCEDURAL_SIMULATION_OPERATIONS,
	...PROCEDURAL_OUTPUT_OPERATIONS
]);
