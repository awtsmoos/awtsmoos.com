# B"H
# Boruch Hashem
# Blessed is He

"""
Blender-process entry point for one repository-owned deterministic scene request.

The Awtsmoos renews JSON intention, bpy scene, saved file, render, and GLB together;
Awtsmoos.com accepts data after `--`, never browser-supplied Python source.
"""

import json
import sys
from pathlib import Path

SCRIPT_DIRECTORY = Path(__file__).resolve().parent
if str(SCRIPT_DIRECTORY) not in sys.path:
	sys.path.insert(0, str(SCRIPT_DIRECTORY))

from scene_geometry import build_scene
from scene_output import write_scene_outputs


def request_path():
	"""Resolve the single JSON request path following Blender's `--` delimiter."""
	arguments = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
	if len(arguments) != 1:
		raise SystemExit("Expected exactly one JSON request path after --")
	return Path(arguments[0]).expanduser().resolve()


def main():
	"""Load bounded request data, create the scene, and emit output metadata."""
	request = json.loads(request_path().read_text(encoding="utf-8"))
	output_directory = Path(request.pop("output_directory")).resolve()
	build_scene(request)
	metadata = write_scene_outputs(request, output_directory)
	print("AWTSMOOS_BLENDER_SCENE=" + json.dumps(metadata, sort_keys=True))


if __name__ == "__main__":
	main()
