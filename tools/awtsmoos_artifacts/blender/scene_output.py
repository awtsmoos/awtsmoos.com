# B"H
# Boruch Hashem
# Blessed is He

"""
Save, render, export, and describe the deterministic Blender witness scene.

The Awtsmoos renews native scene, rendered pixel, portable GLB, and metadata;
Awtsmoos.com requires each browser garment to descend from a real Blender process.
"""

import json
from pathlib import Path

import bpy
from mathutils import Vector


def write_scene_outputs(request, output_directory):
	"""Configure Eevee, save `.blend`, render PNG, export GLB, and write metadata."""
	root = Path(output_directory).resolve()
	root.mkdir(parents=True, exist_ok=True)
	blend_path = root / "awtsmoos-witness.blend"
	preview_path = root / "awtsmoos-witness.png"
	glb_path = root / "awtsmoos-witness.glb"
	metadata_path = root / "awtsmoos-witness.scene.json"
	configure_render(request, preview_path)
	bpy.context.scene.frame_set(1)
	bpy.ops.wm.save_as_mainfile(filepath=str(blend_path), compress=True)
	bpy.ops.render.render(write_still=True)
	bpy.ops.export_scene.gltf(
		filepath=str(glb_path),
		export_format="GLB",
		export_animations=True,
		export_apply=True,
	)
	metadata = scene_metadata(request, blend_path, preview_path, glb_path)
	metadata_path.write_text(
		json.dumps(metadata, indent=2, sort_keys=True) + "\n",
		encoding="utf-8",
	)
	return metadata


def configure_render(request, preview_path):
	"""Apply bounded deterministic render settings supported by Blender 3.6."""
	scene = bpy.context.scene
	scene.render.engine = "BLENDER_EEVEE"
	scene.eevee.taa_render_samples = request["samples"]
	scene.render.resolution_x = request["width"]
	scene.render.resolution_y = request["height"]
	scene.render.resolution_percentage = 100
	scene.render.image_settings.file_format = "PNG"
	scene.render.film_transparent = False
	scene.render.filepath = str(preview_path)
	scene.view_settings.look = "Medium High Contrast"


def scene_metadata(request, blend_path, preview_path, glb_path):
	"""Collect transforms, bounds, mesh counts, and Blender build identity."""
	objects = [
		object_record(value)
		for value in sorted(bpy.context.scene.objects, key=lambda item: item.name)
	]
	build_hash = bpy.app.build_hash
	if isinstance(build_hash, bytes):
		build_hash = build_hash.decode("utf-8", "replace")
	return {
		"schemaVersion": "1.0.0",
		"name": request["name"],
		"blenderVersion": bpy.app.version_string,
		"buildHash": str(build_hash),
		"frameRange": [bpy.context.scene.frame_start, bpy.context.scene.frame_end],
		"render": {
			"engine": bpy.context.scene.render.engine,
			"width": request["width"],
			"height": request["height"],
			"samples": request["samples"],
		},
		"files": {
			"blend": blend_path.name,
			"preview": preview_path.name,
			"glb": glb_path.name,
		},
		"objects": objects,
	}


def object_record(value):
	"""Describe one scene object without serializing Blender runtime objects."""
	mesh = value.data if value.type == "MESH" else None
	world_bounds = [
		value.matrix_world @ Vector(corner)
		for corner in value.bound_box
	] if value.bound_box else []
	return {
		"name": value.name,
		"type": value.type,
		"location": rounded(value.location),
		"rotationEuler": rounded(value.rotation_euler),
		"scale": rounded(value.scale),
		"vertices": len(mesh.vertices) if mesh else 0,
		"polygons": len(mesh.polygons) if mesh else 0,
		"bounds": [rounded(corner) for corner in world_bounds],
	}


def rounded(values):
	"""Return stable six-decimal numeric vectors."""
	return [round(float(value), 6) for value in values]
