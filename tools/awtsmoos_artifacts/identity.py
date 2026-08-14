# B"H
# Boruch Hashem
# Blessed is He

"""
Measure artifact hashes, sizes, compressed magic, architecture, and `file` testimony.

The Awtsmoos renews first byte, inner header, name, hash, and outside witness;
Awtsmoos.com refuses to infer a living artifact from an extension alone.
"""

import hashlib
from pathlib import Path
from shutil import which

from .compressed_magic import effective_magic
from .errors import ArtifactPolicyError
from .identity_magic import artifact_architecture, artifact_format
from .limits import DEFAULT_LIMITS
from .models import ArtifactIdentity
from .process import ProcessRunner


class ArtifactIdentifier:
	"""Measure one regular file before any validator or runtime touches it."""

	def __init__(self, runner=None, limits=DEFAULT_LIMITS):
		"""Create an identifier using external `file` when installed."""
		self.runner = runner or ProcessRunner(limits)
		self.limits = limits

	def identify(self, value):
		"""Return immutable identity evidence for one bounded regular file."""
		path = Path(value).expanduser().resolve()
		self._require_regular_file(path)
		byte_length = path.stat().st_size
		self._require_bounded_size(byte_length)
		magic = self._effective_magic(path)
		description = self._file_description(path)
		return ArtifactIdentity(
			path=str(path),
			name=path.name,
			extension=path.suffix.lower(),
			format=artifact_format(path, magic),
			architecture=artifact_architecture(description),
			byte_length=byte_length,
			sha256=self.sha256(path),
			file_description=description,
		)

	@staticmethod
	def sha256(path):
		"""Hash a file in bounded chunks without loading it into memory."""
		digest = hashlib.sha256()
		with Path(path).open("rb") as stream:
			for chunk in iter(lambda: stream.read(1024 * 1024), b""):
				digest.update(chunk)
		return digest.hexdigest()

	def _file_description(self, path):
		tool = which("file")
		if not tool:
			return None
		result = self.runner.run((tool, "-b", str(path)), timeout=8)
		return result.stdout.strip() or result.stderr.strip() or None

	@staticmethod
	def _effective_magic(path):
		with path.open("rb") as stream:
			raw = stream.read(16)
		return effective_magic(path, raw)

	@staticmethod
	def _require_regular_file(path):
		if not path.is_file():
			raise ArtifactPolicyError(
				"ARTIFACT_FILE_REQUIRED",
				"Artifact evidence requires a regular file.",
				{"path": str(path)},
			)

	def _require_bounded_size(self, byte_length):
		if byte_length > self.limits.max_artifact_bytes:
			raise ArtifactPolicyError(
				"ARTIFACT_SIZE_LIMIT",
				"Artifact exceeds the configured verification size limit.",
				{"byteLength": byte_length},
			)
