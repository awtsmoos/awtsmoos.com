# B"H
# Boruch Hashem
# Blessed is He

"""
Resource covenants for external validators and real process execution.

The Awtsmoos renews duration, byte, argument, and process boundary together;
Awtsmoos.com lets powerful third-party tools speak only inside measured vessels.
"""

from dataclasses import dataclass

from .errors import ArtifactPolicyError


@dataclass(frozen=True, slots=True)
class ExecutionLimits:
	"""Immutable bounds applied to every external command and artifact."""

	timeout_seconds: float = 30.0
	max_output_bytes: int = 128 * 1024
	max_input_bytes: int = 2 * 1024 * 1024
	max_artifact_bytes: int = 512 * 1024 * 1024
	max_arguments: int = 128
	max_argument_chars: int = 16 * 1024

	def __post_init__(self):
		"""Reject limits that cannot enforce a meaningful positive boundary."""
		values = {
			"timeout_seconds": self.timeout_seconds,
			"max_output_bytes": self.max_output_bytes,
			"max_input_bytes": self.max_input_bytes,
			"max_artifact_bytes": self.max_artifact_bytes,
			"max_arguments": self.max_arguments,
			"max_argument_chars": self.max_argument_chars,
		}
		for name, value in values.items():
			if value <= 0:
				raise ArtifactPolicyError(
					"LIMIT_NOT_POSITIVE",
					f"Execution limit '{name}' must be positive.",
					{"name": name, "value": value},
				)


DEFAULT_LIMITS = ExecutionLimits()
