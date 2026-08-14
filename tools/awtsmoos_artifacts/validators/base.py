# B"H
# Boruch Hashem
# Blessed is He

"""
Shared external-tool validation helpers preserve commands and unavailable boundaries.

The Awtsmoos renews validator, third-party witness, return code, and explanation;
Awtsmoos.com keeps every outside testimony attributable to its exact executable.
"""

from abc import ABC, abstractmethod

from ..discovery import ToolDiscovery
from ..models import EvidenceLevel, EvidenceRecord, EvidenceStatus
from ..process import ProcessRunner


class ArtifactValidator(ABC):
	"""Base contract for one artifact-format external validator."""

	def __init__(self, runner=None, discovery=None):
		"""Create a validator sharing bounded process and tool discovery services."""
		self.runner = runner or ProcessRunner()
		self.discovery = discovery or ToolDiscovery(self.runner)

	@abstractmethod
	def validate(self, identity):
		"""Return an immutable tuple of independent external evidence records."""

	def tool_record(self, tool_name, arguments, code, message, *, timeout=15):
		"""Run one discovered tool and convert termination into evidence."""
		tool = self.discovery.by_name(tool_name)
		if not tool.available:
			return EvidenceRecord(
				level=EvidenceLevel.EXTERNALLY_VALIDATED,
				status=EvidenceStatus.UNAVAILABLE,
				code=f"{code}_TOOL_UNAVAILABLE",
				message=f"{tool_name} is not installed on this host.",
				tool=tool,
			)
		command = self.runner.run((tool.path, *arguments), timeout=timeout)
		status = EvidenceStatus.PASSED
		if command.timed_out or command.return_code != 0:
			status = EvidenceStatus.FAILED
		return EvidenceRecord(
			level=EvidenceLevel.EXTERNALLY_VALIDATED,
			status=status,
			code=code,
			message=message,
			tool=tool,
			command=command,
			details={
				"returnCode": command.return_code,
				"timedOut": command.timed_out,
			},
		)

	@staticmethod
	def unavailable(code, message, details=None):
		"""Create an explicit unavailable external-evidence boundary."""
		return EvidenceRecord(
			level=EvidenceLevel.EXTERNALLY_VALIDATED,
			status=EvidenceStatus.UNAVAILABLE,
			code=code,
			message=message,
			details=details or {},
		)
