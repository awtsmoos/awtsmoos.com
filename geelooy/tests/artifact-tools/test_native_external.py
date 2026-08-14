# B"H
# Boruch Hashem
# Blessed is He

"""Real Clang compilation, Apple validation, and isolated execution tests."""

import shutil
import tempfile
import unittest
from pathlib import Path

from tools.awtsmoos_artifacts.models import EvidenceLevel, EvidenceStatus
from tools.awtsmoos_artifacts.orchestrator import ArtifactOrchestrator
from tools.awtsmoos_artifacts.process import ProcessRunner


@unittest.skipUnless(shutil.which("clang"), "Clang is required for real native proof.")
class NativeExternalTest(unittest.TestCase):
	"""Compile and execute an actual Mach-O through outside validators."""

	def test_compiles_validates_and_executes_c(self):
		"""The verifier must return exact stdout from a real isolated process."""
		with tempfile.TemporaryDirectory() as directory:
			root = Path(directory)
			source = root / "witness.c"
			executable = root / "witness"
			source.write_text(
				"#include <stdio.h>\n"
				"int main(void){puts(\"Python native witness.\");return 0;}\n",
				encoding="utf-8",
			)
			compile_result = ProcessRunner().run((
				shutil.which("clang"),
				"-std=c17",
				"-O2",
				str(source),
				"-o",
				str(executable),
			))
			self.assertEqual(compile_result.return_code, 0)
			report = ArtifactOrchestrator().verify(executable, execute=True)
			self.assertEqual(report.identity.format, "mach-o")
			self.assertTrue(report.executed)
			self.assertTrue(any(
				record.level == EvidenceLevel.EXTERNALLY_VALIDATED
				and record.status == EvidenceStatus.PASSED
				for record in report.records
			))
			execution = next(
				record for record in report.records
				if record.level == EvidenceLevel.ACTUALLY_EXECUTED
			)
			self.assertEqual(execution.command.return_code, 0)
			self.assertEqual(execution.command.stdout, "Python native witness.\n")


if __name__ == "__main__":
	unittest.main()
