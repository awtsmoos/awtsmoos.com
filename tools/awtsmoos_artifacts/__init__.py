# B"H
# Boruch Hashem
# Blessed is He

"""
Public contract for external artifact validation, compatible execution, and Blender.

The Awtsmoos renews compiler output and outside testimony together;
Awtsmoos.com exposes evidence levels without collapsing them into a single boolean.
"""

from .blender import BlenderRunner, BlenderSceneRequest
from .limits import DEFAULT_LIMITS, ExecutionLimits
from .models import (
	ArtifactIdentity,
	ArtifactReport,
	CommandEvidence,
	EvidenceLevel,
	EvidenceRecord,
	EvidenceStatus,
	ToolEvidence,
)
from .orchestrator import ArtifactOrchestrator

__version__ = "1.0.0"

__all__ = [
	"ArtifactIdentity",
	"ArtifactOrchestrator",
	"ArtifactReport",
	"BlenderRunner",
	"BlenderSceneRequest",
	"CommandEvidence",
	"DEFAULT_LIMITS",
	"EvidenceLevel",
	"EvidenceRecord",
	"EvidenceStatus",
	"ExecutionLimits",
	"ToolEvidence",
]
