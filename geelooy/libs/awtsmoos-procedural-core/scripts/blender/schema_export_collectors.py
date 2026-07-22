# B"H
# Boruch Hashem
# Blessed is He
"""Blender RNA collectors isolate temporary data-block work from manifest output."""

import bpy

from schema_export_helpers import node_record, recursive_subclasses, rna_properties, zone_role

TREE_TYPES = (
	"ShaderNodeTree",
	"GeometryNodeTree",
	"CompositorNodeTree",
	"TextureNodeTree",
)


def instantiate_tree(tree_type):
	return bpy.data.node_groups.new(f"__awtsmoos_schema_{tree_type}", tree_type)


def collect_tree(tree_type, diagnostics):
	try:
		tree = instantiate_tree(tree_type)
	except Exception as error:
		diagnostics.append({
			"code": "TREE.CREATE_FAILED",
			"message": str(error),
			"nativeType": tree_type,
		})
		return {
			"nativeType": tree_type,
			"name": tree_type,
			"category": "unknown",
			"nodes": [],
		}
	nodes = []
	try:
		for node_class in recursive_subclasses(bpy.types.Node):
			native_type = getattr(
				getattr(node_class, "bl_rna", None),
				"identifier",
				node_class.__name__,
			)
			try:
				node = tree.nodes.new(native_type)
				nodes.append(node_record(node, node_class, tree_type))
				tree.nodes.remove(node)
			except Exception as error:
				diagnostics.append({
					"code": "NODE.INSTANTIATE_FAILED",
					"message": str(error),
					"nativeType": native_type,
					"treeType": tree_type,
				})
	finally:
		bpy.data.node_groups.remove(tree)
	return {
		"nativeType": tree_type,
		"name": tree_type,
		"category": tree_type.replace("NodeTree", "").lower(),
		"nodes": sorted(nodes, key=lambda item: item["nativeType"]),
	}


def collect_tree_types(diagnostics):
	return [collect_tree(tree_type, diagnostics) for tree_type in TREE_TYPES]


def collect_modifiers():
	records = []
	for item in recursive_subclasses(bpy.types.Modifier):
		records.append({
			"nativeType": getattr(item.bl_rna, "identifier", item.__name__),
			"name": getattr(item.bl_rna, "name", item.__name__),
			"category": "general",
			"domains": ["object"],
			"properties": rna_properties(item),
		})
	return sorted(records, key=lambda item: item["nativeType"])


def collect_interfaces():
	base = getattr(bpy.types, "NodeTreeInterfaceItem", None)
	if base is None:
		return []
	records = [{
		"id": getattr(item.bl_rna, "identifier", item.__name__),
		"nativeType": getattr(item.bl_rna, "identifier", item.__name__),
		"properties": rna_properties(item),
	} for item in recursive_subclasses(base)]
	return sorted(records, key=lambda item: item["id"])


def collect_zones(tree_types):
	records = []
	for tree in tree_types:
		for node in tree["nodes"]:
			role = zone_role(node["nativeType"])
			if role:
				records.append({
					"id": f'{tree["nativeType"]}:{node["nativeType"]}',
					"treeType": tree["nativeType"],
					"nativeType": node["nativeType"],
					"role": role,
				})
	return sorted(records, key=lambda item: item["id"])
