# B"H
# Boruch Hashem
# Blessed is He

"""
Construct the deterministic Blender witness scene from bounded request values.

The Awtsmoos renews mesh, material, camera, light, and animated frame together;
Awtsmoos.com gives the headless process a scene whose contents can be reopened.
"""

import math

import bpy
from mathutils import Vector


def build_scene(request):
	"""Create the complete deterministic object, material, light, and camera graph."""
	reset_scene()
	world = bpy.context.scene.world
	world.color = (0.012, 0.02, 0.055)
	plane_material = material("Ground", (0.035, 0.08, 0.16, 1), 0.1, 0.62)
	cube_material = material("CyanGlass", (0.03, 0.8, 0.72, 1), 0.45, 0.2)
	sphere_material = material("VioletMetal", (0.38, 0.11, 0.72, 1), 0.72, 0.22)

	bpy.ops.mesh.primitive_plane_add(size=18, location=(0, 0, 0))
	plane = named_active("Awtsmoos Ground")
	plane.data.materials.append(plane_material)

	bpy.ops.mesh.primitive_cube_add(size=2.4, location=(-1.65, 0, 1.25))
	cube = named_active("Renewed Cube")
	cube.data.materials.append(cube_material)
	cube.rotation_euler = (0.12, 0.2, 0)
	cube.keyframe_insert(data_path="rotation_euler", frame=1)
	cube.rotation_euler.z = math.tau
	cube.rotation_euler.y = math.pi * 0.7
	cube.keyframe_insert(data_path="rotation_euler", frame=request["frame_end"])

	bpy.ops.mesh.primitive_uv_sphere_add(
		segments=48,
		ring_count=24,
		location=(1.8, 0.1, 1.2),
	)
	sphere = named_active("Luminous Sphere")
	sphere.data.materials.append(sphere_material)
	bpy.ops.object.shade_smooth()

	camera = add_camera((7.6, -8.8, 6.2), (0.1, 0, 1.1))
	add_area_light("Key Light", (4.5, -3.2, 7.2), 1100, 5.0, (0.45, 0.82, 1.0))
	add_area_light("Fill Light", (-4.0, -1.0, 4.5), 800, 4.0, (0.76, 0.42, 1.0))
	add_area_light("Rim Light", (0.0, 4.4, 5.8), 950, 3.0, (0.2, 1.0, 0.72))
	bpy.context.scene.camera = camera
	bpy.context.scene.frame_start = 1
	bpy.context.scene.frame_end = request["frame_end"]
	return [plane, cube, sphere, camera]


def reset_scene():
	"""Remove startup data so every Blender run begins from the same world."""
	bpy.ops.object.select_all(action="SELECT")
	bpy.ops.object.delete(use_global=False)
	for collection in (bpy.data.meshes, bpy.data.curves, bpy.data.materials, bpy.data.cameras, bpy.data.lights):
		for item in list(collection):
			if item.users == 0:
				collection.remove(item)


def material(name, color, metallic, roughness):
	"""Create one Principled material with bounded deterministic properties."""
	value = bpy.data.materials.new(name)
	value.diffuse_color = color
	value.use_nodes = True
	shader = value.node_tree.nodes.get("Principled BSDF")
	shader.inputs["Base Color"].default_value = color
	shader.inputs["Metallic"].default_value = metallic
	shader.inputs["Roughness"].default_value = roughness
	return value


def named_active(name):
	"""Name and return the current active object."""
	value = bpy.context.active_object
	value.name = name
	return value


def add_camera(location, target):
	"""Create a perspective camera aimed at a fixed world-space target."""
	bpy.ops.object.camera_add(location=location)
	camera = named_active("Witness Camera")
	camera.data.lens = 52
	camera.data.sensor_width = 36
	camera.rotation_euler = (Vector(target) - camera.location).to_track_quat("-Z", "Y").to_euler()
	return camera


def add_area_light(name, location, energy, size, color):
	"""Create one area light aimed at the center of the scene."""
	bpy.ops.object.light_add(type="AREA", location=location)
	light = named_active(name)
	light.data.energy = energy
	light.data.shape = "DISK"
	light.data.size = size
	light.data.color = color
	light.rotation_euler = (Vector((0, 0, 1)) - light.location).to_track_quat("-Z", "Y").to_euler()
	return light
