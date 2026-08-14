# B"H
# Boruch Hashem
# Blessed is He

"""
Run real Blender create/render/export and second-process reopen testimony.

The Awtsmoos renews executable, scene request, native file, rendered image, and GLB;
Awtsmoos.com requires Blender itself to create and consume every claimed scene output.
"""

import json
from dataclasses import asdict
from pathlib import Path

from ..errors import ArtifactToolError
from ..identity import ArtifactIdentifier
from ..process import ProcessRunner
from .discovery import BlenderDiscovery
from .models import BlenderRunResult, BlenderSceneRequest


class BlenderRunner:
	"""Orchestrate bounded repository-owned scripts through installed Blender."""

	def __init__(self, runner=None, identifier=None, discovery=None):
		"""Create Blender orchestration with shared process and identity services."""
		self.runner = runner or ProcessRunner()
		self.identifier = identifier or ArtifactIdentifier(self.runner)
		self.discovery = discovery or BlenderDiscovery(self.runner)
		self.script_root = Path(__file__).resolve().parent

	def create(self, output_directory, request=None):
		"""Create, render, export, reopen, and identify one deterministic scene."""
		request = request or BlenderSceneRequest()
		root = Path(output_directory).expanduser().resolve()
		root.mkdir(parents=True, exist_ok=True)
		request_path = root / "awtsmoos-blender-request.json"
		request_payload = {**asdict(request), "output_directory": str(root)}
		request_path.write_text(
			json.dumps(request_payload, indent=2, sort_keys=True) + "\n",
			encoding="utf-8",
		)
		tool = self.discovery.require()
		create_command = self.runner.run(
			(
				tool.path,
				"--background",
				"--factory-startup",
				"--python",
				str(self.script_root / "scene_entry.py"),
				"--",
				str(request_path),
			),
			timeout=240,
		)
		self._require_success(create_command, "BLENDER_CREATE_FAILED")
		blend_path = root / "awtsmoos-witness.blend"
		preview_path = root / "awtsmoos-witness.png"
		glb_path = root / "awtsmoos-witness.glb"
		metadata_path = root / "awtsmoos-witness.scene.json"
		self._require_files(blend_path, preview_path, glb_path, metadata_path)
		reopen_path = root / "awtsmoos-witness.reopen.json"
		reopen_command = self.runner.run(
			(
				tool.path,
				"--background",
				"--factory-startup",
				"--python",
				str(self.script_root / "reopen_entry.py"),
				"--",
				str(blend_path),
				str(glb_path),
				str(reopen_path),
			),
			timeout=180,
		)
		self._require_success(reopen_command, "BLENDER_REOPEN_FAILED")
		self._require_files(reopen_path)
		return BlenderRunResult(
			tool=tool,
			create_command=create_command,
			reopen_command=reopen_command,
			blend=self.identifier.identify(blend_path),
			preview=self.identifier.identify(preview_path),
			glb=self.identifier.identify(glb_path),
			metadata_path=str(metadata_path),
			reopen_path=str(reopen_path),
		)

	@staticmethod
	def _require_success(command, code):
		if command.return_code == 0 and not command.timed_out:
			return
		raise ArtifactToolError(
			code,
			"Blender did not complete the required headless phase.",
			{"command": command.arguments, "stderr": command.stderr[-4096:]},
		)

	@staticmethod
	def _require_files(*paths):
		missing = [str(path) for path in paths if not path.is_file() or path.stat().st_size == 0]
		if missing:
			raise ArtifactToolError(
				"BLENDER_OUTPUT_MISSING",
				"Blender did not create every required non-empty output.",
				{"missing": missing},
			)
