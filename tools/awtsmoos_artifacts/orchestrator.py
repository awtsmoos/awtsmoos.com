# B"H
# Boruch Hashem
# Blessed is He

"""
Compose identity, external validators, mutation guards, and compatible runtimes.

The Awtsmoos renews artifact, outside witness, runtime boundary, and final ledger;
Awtsmoos.com never lets validation success silently become execution success.
"""

from .discovery import ToolDiscovery
from .identity import ArtifactIdentifier
from .models import ArtifactReport, EvidenceLevel, EvidenceRecord, EvidenceStatus
from .process import ProcessRunner
from .runners import AdbRunner, NativeRunner, NodeWasmRunner
from .validators import VALIDATORS


class ArtifactOrchestrator:
	"""Build one complete evidence report without mutating the artifact."""

	def __init__(self, runner=None):
		"""Create shared identity, discovery, validator, and runtime services."""
		self.runner = runner or ProcessRunner()
		self.discovery = ToolDiscovery(self.runner)
		self.identifier = ArtifactIdentifier(self.runner)

	def verify(self, path, *, execute=False, arguments=(), adb_serial=None):
		"""Identify, externally validate, optionally execute, and mutation-check a file."""
		identity = self.identifier.identify(path)
		records = [self._generated_record(identity)]
		validator_type = VALIDATORS.get(identity.format)
		if validator_type is None:
			records.append(self._unsupported_validator(identity.format))
		else:
			validator = validator_type(self.runner, self.discovery)
			records.extend(validator.validate(identity))
		after_validation = self.identifier.identify(identity.path)
		records.append(self._mutation_record(identity, after_validation))
		if execute:
			records.append(self._execute(identity, arguments, adb_serial))
		return ArtifactReport(identity=identity, records=tuple(records))

	def discover(self):
		"""Return external tool capabilities for the current process lifetime."""
		return self.discovery.discover_all()

	def _execute(self, identity, arguments, adb_serial):
		if identity.format == "mach-o":
			return NativeRunner(self.runner, self.identifier).execute(identity, arguments)
		if identity.format == "webassembly":
			return NodeWasmRunner(self.runner, self.discovery).execute(identity)
		if identity.format == "apk":
			return AdbRunner(self.runner, self.discovery).install(identity, adb_serial)
		return EvidenceRecord(
			level=EvidenceLevel.ACTUALLY_EXECUTED,
			status=EvidenceStatus.UNAVAILABLE,
			code=f"{identity.format.upper()}_RUNTIME_UNAVAILABLE",
			message=(
				f"No compatible real runtime for {identity.format} is installed on this host."
			),
			details={"format": identity.format},
		)

	@staticmethod
	def _generated_record(identity):
		return EvidenceRecord(
			level=EvidenceLevel.GENERATED,
			status=EvidenceStatus.PASSED,
			code="ARTIFACT_BYTES_PRESENT",
			message="A bounded regular artifact file was measured and hashed.",
			details={"byteLength": identity.byte_length, "sha256": identity.sha256},
		)

	@staticmethod
	def _unsupported_validator(format_name):
		return EvidenceRecord(
			level=EvidenceLevel.EXTERNALLY_VALIDATED,
			status=EvidenceStatus.UNAVAILABLE,
			code="FORMAT_VALIDATOR_UNAVAILABLE",
			message=f"No external validator is registered for '{format_name}'.",
		)

	@staticmethod
	def _mutation_record(before, after):
		mutated = before.sha256 != after.sha256 or before.byte_length != after.byte_length
		return EvidenceRecord(
			level=EvidenceLevel.EXTERNALLY_VALIDATED,
			status=EvidenceStatus.FAILED if mutated else EvidenceStatus.PASSED,
			code="ARTIFACT_MUTATION_GUARD",
			message="Validator commands did not mutate the artifact." if not mutated else (
				"The artifact changed while external validators were running."
			),
			details={"before": before.sha256, "after": after.sha256},
		)
