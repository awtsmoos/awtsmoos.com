# B"H
# Boruch Hashem
# Blessed is He

"""
External APK archive validation through file, unzip, and zipinfo.

The Awtsmoos renews ZIP vessel, manifest, DEX, resources, and signature boundary;
Awtsmoos.com requires third-party archive tools before Android execution is discussed.
"""

from ..models import EvidenceLevel, EvidenceRecord, EvidenceStatus
from .base import ArtifactValidator


class ApkValidator(ArtifactValidator):
	"""Validate APK archive integrity and required Android package entries."""

	def validate(self, identity):
		"""Return external archive, listing, and required-entry evidence."""
		path = identity.path
		file_record = self.tool_record(
			"file",
			("-b", path),
			"APK_FILE_IDENTITY",
			"External file magic recognized the APK ZIP container.",
		)
		test_record = self.tool_record(
			"unzip",
			("-tqq", path),
			"APK_ZIP_INTEGRITY",
			"External unzip verified every compressed APK entry.",
		)
		listing = self._listing(path)
		return (file_record, test_record, listing)

	def _listing(self, path):
		tool = self.discovery.by_name("zipinfo")
		if not tool.available:
			return self.unavailable(
				"APK_ZIPINFO_UNAVAILABLE",
				"zipinfo is unavailable, so required APK entries were not externally listed.",
			)
		command = self.runner.run((tool.path, "-1", path), timeout=20)
		entries = set(command.stdout.splitlines())
		required = {"AndroidManifest.xml", "classes.dex"}
		missing = sorted(required - entries)
		passed = command.return_code == 0 and not command.timed_out and not missing
		return EvidenceRecord(
			level=EvidenceLevel.EXTERNALLY_VALIDATED,
			status=EvidenceStatus.PASSED if passed else EvidenceStatus.FAILED,
			code="APK_REQUIRED_ENTRIES",
			message="External zipinfo listed the required Android manifest and DEX entries.",
			tool=tool,
			command=command,
			details={"entryCount": len(entries), "missing": missing},
		)
