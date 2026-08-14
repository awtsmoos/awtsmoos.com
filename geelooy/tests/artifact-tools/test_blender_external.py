# B"H
# Boruch Hashem
# Blessed is He

"""Real installed-Blender create, render, GLB export, and reopen test."""

import json
import tempfile
import unittest
from pathlib import Path

from tools.awtsmoos_artifacts.blender import BlenderDiscovery, BlenderRunner, BlenderSceneRequest


class BlenderExternalTest(unittest.TestCase):
	"""Require a second Blender process to consume the generated outputs."""

	@classmethod
	def setUpClass(cls):
		"""Skip only when the fixed Blender executable is genuinely unavailable."""
		try:
			cls.tool = BlenderDiscovery().require()
		except Exception as error:
			raise unittest.SkipTest(str(error)) from error

	def test_creates_renders_exports_and_reopens(self):
		"""A miniature bounded scene must pass both real Blender phases."""
		with tempfile.TemporaryDirectory() as directory:
			result = BlenderRunner().create(
				directory,
				BlenderSceneRequest(
					name="Python Blender Witness",
					width=128,
					height=96,
					samples=1,
					frame_end=4,
				),
			)
			self.assertEqual(result.create_command.return_code, 0)
			self.assertEqual(result.reopen_command.return_code, 0)
			self.assertEqual(result.blend.format, "blend")
			self.assertEqual(result.preview.format, "png")
			self.assertEqual(result.glb.format, "glb")
			reopen = json.loads(Path(result.reopen_path).read_text(encoding="utf-8"))
			self.assertEqual(reopen["blend"]["meshCount"], 3)
			self.assertEqual(reopen["glb"]["meshCount"], 3)
			self.assertGreater(result.glb.byte_length, 1024)


if __name__ == "__main__":
	unittest.main()
