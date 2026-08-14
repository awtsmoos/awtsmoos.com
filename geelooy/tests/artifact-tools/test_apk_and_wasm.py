# B"H
# Boruch Hashem
# Blessed is He

"""Outside APK archive validation and real Node WebAssembly execution tests."""

import tempfile
import unittest
import zipfile
from pathlib import Path

from tools.awtsmoos_artifacts.models import EvidenceLevel, EvidenceStatus
from tools.awtsmoos_artifacts.orchestrator import ArtifactOrchestrator

WASM_RETURN_42 = bytes([
	0x00, 0x61, 0x73, 0x6D, 0x01, 0x00, 0x00, 0x00,
	0x01, 0x05, 0x01, 0x60, 0x00, 0x01, 0x7F,
	0x03, 0x02, 0x01, 0x00,
	0x07, 0x07, 0x01, 0x03, 0x72, 0x75, 0x6E, 0x00, 0x00,
	0x0A, 0x06, 0x01, 0x04, 0x00, 0x41, 0x2A, 0x0B,
])


class ApkAndWasmTest(unittest.TestCase):
	"""Prove third-party APK parsing and compatible WebAssembly execution."""

	def test_validates_apk_and_refuses_missing_emulator(self):
		"""ZIP tools must pass while APK installation remains unavailable safely."""
		with tempfile.TemporaryDirectory() as directory:
			path = Path(directory) / "witness.apk"
			with zipfile.ZipFile(path, "w") as archive:
				archive.writestr("AndroidManifest.xml", b"binary-manifest-witness")
				archive.writestr("classes.dex", b"dex\n035\x00external-witness")
			report = ArtifactOrchestrator().verify(path, execute=True)
			self.assertEqual(report.identity.format, "apk")
			self.assertTrue(any(
				record.code == "APK_ZIP_INTEGRITY"
				and record.status == EvidenceStatus.PASSED
				for record in report.records
			))
			install = next(
				record for record in report.records
				if record.level == EvidenceLevel.RUNTIME_LOADED
			)
			self.assertEqual(install.status, EvidenceStatus.UNAVAILABLE)
			self.assertEqual(install.code, "APK_EMULATOR_RUNTIME_UNAVAILABLE")

	def test_executes_exported_wasm_function_in_node(self):
		"""V8 must compile, instantiate, and call exported `run` returning 42."""
		with tempfile.TemporaryDirectory() as directory:
			path = Path(directory) / "witness.wasm"
			path.write_bytes(WASM_RETURN_42)
			report = ArtifactOrchestrator().verify(path, execute=True)
			self.assertEqual(report.identity.format, "webassembly")
			self.assertTrue(report.executed)
			execution = next(
				record for record in report.records
				if record.level == EvidenceLevel.ACTUALLY_EXECUTED
			)
			self.assertIn('"returnValue":42', execution.command.stdout)


if __name__ == "__main__":
	unittest.main()
