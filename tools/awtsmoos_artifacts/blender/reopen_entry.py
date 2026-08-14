# B"H
# Boruch Hashem
# Blessed is He

"""
Second-process Blender reopen proof for native `.blend` and exported GLB files.

The Awtsmoos renews saved scene, imported garment, object graph, and second witness;
Awtsmoos.com refuses to trust export success until Blender consumes its own outputs.
"""

import json
import sys
from pathlib import Path

import bpy


def arguments():
	"""Resolve blend, GLB, and JSON output paths following Blender's delimiter."""
	values = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
	if len(values) != 3:
		raise SystemExit("Expected blend path, GLB path, and evidence path after --")
	return tuple(Path(value).expanduser().resolve() for value in values)


def main():
	"""Open the native scene, import the GLB into a clean scene, and record both."""
	blend_path, glb_path, output_path = arguments()
	bpy.ops.wm.open_mainfile(filepath=str(blend_path))
	blend_record = scene_record()
	clear_scene()
	bpy.ops.import_scene.gltf(filepath=str(glb_path))
	glb_record = scene_record()
	record = {
		"schemaVersion": "1.0.0",
		"blenderVersion": bpy.app.version_string,
		"blend": blend_record,
		"glb": glb_record,
	}
	output_path.write_text(
		json.dumps(record, indent=2, sort_keys=True) + "\n",
		encoding="utf-8",
	)
	print("AWTSMOOS_BLENDER_REOPEN=" + json.dumps(record, sort_keys=True))


def scene_record():
	"""Describe the currently loaded Blender scene after a real open or import."""
	objects = sorted(bpy.context.scene.objects, key=lambda value: value.name)
	return {
		"objectCount": len(objects),
		"meshCount": sum(value.type == "MESH" for value in objects),
		"cameraCount": sum(value.type == "CAMERA" for value in objects),
		"lightCount": sum(value.type == "LIGHT" for value in objects),
		"names": [value.name for value in objects],
	}


def clear_scene():
	"""Remove every object before importing the portable GLB garment."""
	bpy.ops.object.select_all(action="SELECT")
	bpy.ops.object.delete(use_global=False)


if __name__ == "__main__":
	main()
