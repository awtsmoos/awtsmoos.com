# B"H
# Boruch Hashem
# Blessed is He

"""
Immutable request and result records for deterministic headless Blender creation.

The Awtsmoos renews scene intention, output vessel, render boundary, and evidence;
Awtsmoos.com permits only bounded parameters to reach repository-owned Blender code.
"""

from dataclasses import dataclass

from ..errors import ArtifactPolicyError
from ..models import ArtifactIdentity, CommandEvidence, ToolEvidence


@dataclass(frozen=True, slots=True)
class BlenderSceneRequest:
	"""Bounded scene parameters accepted by the repository-owned Blender script."""

	name: str = "Awtsmoos Blender Witness"
	width: int = 640
	height: int = 480
	samples: int = 32
	frame_end: int = 48

	def __post_init__(self):
		"""Reject resource-heavy or unsafe scene parameters before Blender starts."""
		if not self.name.strip() or len(self.name) > 80:
			raise ArtifactPolicyError("BLENDER_NAME_INVALID", "Scene name must be 1-80 characters.")
		if not 64 <= self.width <= 1920 or not 64 <= self.height <= 1080:
			raise ArtifactPolicyError("BLENDER_RESOLUTION_LIMIT", "Render resolution is outside policy.")
		if not 1 <= self.samples <= 128:
			raise ArtifactPolicyError("BLENDER_SAMPLE_LIMIT", "Render samples are outside policy.")
		if not 1 <= self.frame_end <= 240:
			raise ArtifactPolicyError("BLENDER_FRAME_LIMIT", "Frame range is outside policy.")


@dataclass(frozen=True, slots=True)
class BlenderRunResult:
	"""Real Blender process and output identities from create and reopen phases."""

	tool: ToolEvidence
	create_command: CommandEvidence
	reopen_command: CommandEvidence
	blend: ArtifactIdentity
	preview: ArtifactIdentity
	glb: ArtifactIdentity
	metadata_path: str
	reopen_path: str
