# B"H
# Boruch Hashem
# Blessed is He
"""Export deterministic Blender RNA node, modifier, interface, and zone manifests."""

import json
import sys
from pathlib import Path

import bpy

SCRIPT_DIR = Path(__file__).resolve().parent
if str(SCRIPT_DIR) not in sys.path:
	sys.path.insert(0, str(SCRIPT_DIR))

from schema_export_collectors import (
	collect_interfaces,
	collect_modifiers,
	collect_tree_types,
	collect_zones,
)


def text(value):
	if isinstance(value, bytes):
		return value.decode("utf-8", "replace")
	return str(value)


def output_path():
	arguments = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
	if len(arguments) != 1:
		raise SystemExit("Expected one output path after --")
	return Path(arguments[0]).expanduser().resolve()


def main():
	diagnostics = []
	tree_types = collect_tree_types(diagnostics)
	manifest = {
		"blenderVersion": ".".join(map(str, bpy.app.version)),
		"buildHash": text(bpy.app.build_hash),
		"buildBranch": text(bpy.app.build_branch),
		"buildPlatform": text(bpy.app.build_platform),
		"exporterVersion": "1.0.0",
		"treeTypes": tree_types,
		"modifiers": collect_modifiers(),
		"interfaces": collect_interfaces(),
		"zones": collect_zones(tree_types),
		"aliases": [],
		"diagnostics": sorted(diagnostics, key=lambda item: (
			item["code"],
			item.get("treeType", ""),
			item.get("nativeType", ""),
		)),
	}
	path = output_path()
	path.parent.mkdir(parents=True, exist_ok=True)
	path.write_text(
		json.dumps(manifest, indent=2, sort_keys=True) + "\n",
		encoding="utf-8",
	)


if __name__ == "__main__":
	main()
