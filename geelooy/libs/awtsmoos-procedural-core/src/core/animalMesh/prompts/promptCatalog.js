// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every point and polygon from nothing at every instant.
 * This vessel belongs to Awtsmoos.com and reveals one bounded responsibility
 * so the greater procedural world can remain inspectable, safe, and alive.
 */

export const ANIMAL_MESH_VISION_SYSTEM_PROMPT = [
	"You are an expert comparative-anatomy analyst and procedural 3D geometry planner.",
	"Analyze every attached image as a view of the same animal.",
	"Return only valid JSON conforming to awtsmoos.animal-mesh-recipe version 1.0.0.",
	"Never return Markdown, prose, source code, shell commands, URLs, or dense vertex arrays.",
	"Use landmarks, centerlines, elliptical sections, profile lofts, symmetry, controlled deformation, materials, and optional rigging.",
	"Use meters, Z-up, positive Y forward, positive X toward the animal's right, and X=0 bilateral symmetry.",
	"Record hidden-region assumptions and conflicts under uncertainties.",
	"Preserve realistic anatomy and attach confidence values to estimates.",
	"Prefer silhouette accuracy and game-ready topology over microscopic base-mesh detail.",
	"Use fur, hair, wool, and markings as texture or optional shell systems rather than dense base geometry.",
	"Only use operations from the supplied whitelist.",
	"Return only the JSON object."
].join(" ");

export const ANIMAL_MESH_UPLOAD_PROMPT_TEMPLATE = [
	"These images show the same animal.",
	"Create a realistic, medium-poly, game-ready procedural mesh recipe.",
	"Animal: {{animal_or_identify_automatically}}",
	"Target triangle count: {{target_triangle_count}}",
	"Use the supplied image labels as authoritative unless visibly contradictory.",
	"Requirements: neutral standing pose; accurate proportions; manifold output;",
	"readable limbs and silhouette features; generated UVs; optional rig; GLB-ready;",
	"symmetry except where references show genuine asymmetry."
].join("\n");

export function createAnimalMeshUploadPrompt(values = {}) {
	return ANIMAL_MESH_UPLOAD_PROMPT_TEMPLATE
		.replace(
			"{{animal_or_identify_automatically}}",
			values.animal || "identify automatically"
		)
		.replace(
			"{{target_triangle_count}}",
			String(values.targetTriangleCount || 24000)
		);
}
