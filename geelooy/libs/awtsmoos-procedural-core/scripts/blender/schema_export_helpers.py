# B"H
# Boruch Hashem
# Blessed is He
"""RNA reflection helpers preserve Blender declarations without executing generated source."""


def recursive_subclasses(base):
	seen = set()
	pending = list(base.__subclasses__())
	while pending:
		candidate = pending.pop()
		if candidate in seen:
			continue
		seen.add(candidate)
		pending.extend(candidate.__subclasses__())
	return sorted(seen, key=lambda item: getattr(item, "__name__", ""))


def safe_value(value):
	if value is None or isinstance(value, (bool, int, float, str)):
		return value
	if isinstance(value, bytes):
		return value.decode("utf-8", "replace")
	try:
		return [safe_value(item) for item in value]
	except TypeError:
		return str(value)


def enum_items(prop):
	try:
		items = prop.enum_items
	except (AttributeError, TypeError):
		return []
	return sorted([{
		"identifier": item.identifier,
		"name": item.name,
		"description": item.description,
		"value": item.value,
	} for item in items], key=lambda item: item["identifier"])


def property_schema(prop):
	if prop.identifier == "rna_type":
		return None
	pointer_type = getattr(getattr(prop, "fixed_type", None), "identifier", None)
	return {
		"identifier": prop.identifier,
		"name": prop.name,
		"description": prop.description,
		"rnaType": prop.type,
		"subtype": getattr(prop, "subtype", None),
		"defaultValue": safe_value(getattr(prop, "default", None)),
		"minimum": safe_value(getattr(prop, "hard_min", None)),
		"maximum": safe_value(getattr(prop, "hard_max", None)),
		"softMinimum": safe_value(getattr(prop, "soft_min", None)),
		"softMaximum": safe_value(getattr(prop, "soft_max", None)),
		"arrayLength": getattr(prop, "array_length", 0),
		"readonly": getattr(prop, "is_readonly", False),
		"animatable": getattr(prop, "is_animatable", True),
		"hidden": getattr(prop, "is_hidden", False),
		"pointerType": pointer_type if prop.type == "POINTER" else None,
		"collectionType": pointer_type if prop.type == "COLLECTION" else None,
		"enumItems": enum_items(prop),
	}


def rna_properties(value):
	return [record for record in (
		property_schema(prop) for prop in value.bl_rna.properties
	) if record is not None]


def socket_schema(socket):
	return {
		"identifier": socket.identifier or socket.name,
		"name": socket.name,
		"nativeType": socket.bl_idname,
		"subtype": getattr(socket, "type", None),
		"defaultValue": safe_value(getattr(socket, "default_value", None)),
		"minimum": safe_value(getattr(socket, "min_value", None)),
		"maximum": safe_value(getattr(socket, "max_value", None)),
		"hideValue": getattr(socket, "hide_value", False),
		"linkLimit": getattr(socket, "link_limit", None),
		"multiInput": getattr(socket, "is_multi_input", False),
		"fieldCapable": bool(getattr(socket, "is_attribute", False)),
	}


def node_record(node, node_class, tree_type):
	return {
		"nativeType": node.bl_idname,
		"name": node.bl_label or node.bl_idname,
		"treeType": tree_type,
		"inputs": [socket_schema(socket) for socket in node.inputs],
		"outputs": [socket_schema(socket) for socket in node.outputs],
		"properties": rna_properties(node_class),
		"pollModes": [],
		"toolContexts": [],
		"zoneRole": zone_role(node.bl_idname),
	}


def zone_role(native_type):
	for family in ("Simulation", "Repeat", "ForeachGeometryElement"):
		if family in native_type:
			if native_type.endswith("Input"):
				return f"{family.lower()}-input"
			if native_type.endswith("Output"):
				return f"{family.lower()}-output"
	return None
