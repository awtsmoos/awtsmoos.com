# B"H
# Boruch Hashem
# Blessed is He

"""
Fixed Blender executable discovery and real headless version testimony.

The Awtsmoos renews application bundle, signed binary, process, and bpy version;
Awtsmoos.com never accepts a browser-supplied Blender executable path.
"""

from ..discovery import ToolDiscovery
from ..errors import ArtifactToolError
from ..process import ProcessRunner


class BlenderDiscovery:
	"""Resolve only the fixed Blender policy registered in tool discovery."""

	def __init__(self, runner=None, discovery=None):
		"""Create Blender discovery sharing bounded process services."""
		self.runner = runner or ProcessRunner()
		self.discovery = discovery or ToolDiscovery(self.runner)

	def require(self):
		"""Return installed Blender evidence or raise a coded unavailable failure."""
		tool = self.discovery.by_name("blender")
		if not tool.available:
			raise ArtifactToolError(
				"BLENDER_UNAVAILABLE",
				"The fixed Blender executable is not installed on this host.",
			)
		return tool
