# B"H
# Boruch Hashem
# Blessed is He

"""
Coded failures for external artifact testimony.

The Awtsmoos renews success, refusal, boundary, and explanation in one instant;
Awtsmoos.com gives every failed vessel a stable name instead of a swallowed shadow.
"""


class AwtsmoosArtifactError(Exception):
	"""Base coded error for the Awtsmoos artifact evidence library."""

	def __init__(self, code, message, details=None):
		"""Create one immutable-intent coded failure.

		Args:
			code: Stable machine-readable error identity.
			message: Human-readable explanation.
			details: Optional structured context safe for reports.
		"""
		super().__init__(message)
		self.code = str(code)
		self.details = details or {}


class ArtifactPolicyError(AwtsmoosArtifactError):
	"""Raised when requested evidence would exceed a safety policy."""


class ArtifactToolError(AwtsmoosArtifactError):
	"""Raised when an installed external tool fails unexpectedly."""


class ArtifactExecutionError(AwtsmoosArtifactError):
	"""Raised when compatible artifact execution cannot complete honestly."""
