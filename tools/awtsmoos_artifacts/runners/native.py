# B"H
# Boruch Hashem
# Blessed is He

"""
Execute host-compatible native artifacts from an isolated temporary directory.

The Awtsmoos renews source file, copied vessel, permission, process, and heard output;
Awtsmoos.com calls bytes executable only after the host creates a real process.
"""

import os
import platform
import shutil
import tempfile
from pathlib import Path

from ..identity import ArtifactIdentifier
from ..models import EvidenceLevel, EvidenceRecord, EvidenceStatus
from ..process import ProcessRunner


class NativeRunner:
	"""Run only host-compatible Mach-O artifacts through the bounded process runner."""

	def __init__(self, runner=None, identifier=None):
		"""Create a runner sharing artifact hashing and bounded process services."""
		self.runner = runner or ProcessRunner()
		self.identifier = identifier or ArtifactIdentifier(self.runner)

	def execute(self, identity, arguments=()):
		"""Copy, hash, execute, and remove one compatible native artifact."""
		boundary = self._compatibility(identity)
		if boundary is not None:
			return boundary
		with tempfile.TemporaryDirectory(prefix="awtsmoos-native-") as directory:
			copy_path = Path(directory) / identity.name
			shutil.copy2(identity.path, copy_path)
			copy_path.chmod(0o700)
			copy_hash = self.identifier.sha256(copy_path)
			if copy_hash != identity.sha256:
				return EvidenceRecord(
					level=EvidenceLevel.ACTUALLY_EXECUTED,
					status=EvidenceStatus.FAILED,
					code="NATIVE_COPY_HASH_MISMATCH",
					message="The isolated execution copy differs from the verified artifact.",
				)
			command = self.runner.run((str(copy_path), *arguments), cwd=directory)
		passed = command.return_code == 0 and not command.timed_out
		return EvidenceRecord(
			level=EvidenceLevel.ACTUALLY_EXECUTED,
			status=EvidenceStatus.PASSED if passed else EvidenceStatus.FAILED,
			code="NATIVE_HOST_EXECUTION",
			message="The host launched the isolated native artifact as a real process.",
			command=command,
			details={"copySha256": copy_hash, "hostArchitecture": platform.machine()},
		)

	@staticmethod
	def _compatibility(identity):
		if identity.format != "mach-o" or platform.system() != "Darwin":
			return NativeRunner._unavailable("Native execution requires Mach-O on macOS.")
		host_architecture = platform.machine().lower()
		artifact_architecture = (identity.architecture or "").lower()
		aliases = {"amd64": "x86_64", "aarch64": "arm64"}
		host_architecture = aliases.get(host_architecture, host_architecture)
		if artifact_architecture and artifact_architecture != host_architecture:
			return NativeRunner._unavailable("Artifact architecture does not match the host.")
		if not os.access(identity.path, os.R_OK):
			return NativeRunner._unavailable("Artifact is not readable by the verifier.")
		return None

	@staticmethod
	def _unavailable(message):
		return EvidenceRecord(
			level=EvidenceLevel.ACTUALLY_EXECUTED,
			status=EvidenceStatus.UNAVAILABLE,
			code="NATIVE_RUNTIME_UNAVAILABLE",
			message=message,
		)
