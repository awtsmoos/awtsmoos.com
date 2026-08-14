# B"H
# Boruch Hashem
# Blessed is He

"""Bounded process and file identity tests for the outside evidence library."""

import sys
import tempfile
import unittest
from pathlib import Path

from tools.awtsmoos_artifacts.identity import ArtifactIdentifier
from tools.awtsmoos_artifacts.limits import ExecutionLimits
from tools.awtsmoos_artifacts.process import ProcessRunner


class ProcessAndIdentityTest(unittest.TestCase):
	"""Prove timeout, truncation, hashing, and file magic behavior."""

	def test_kills_timed_out_process_group(self):
		"""A sleeping child must terminate as a timeout rather than linger."""
		runner = ProcessRunner(ExecutionLimits(timeout_seconds=0.2))
		result = runner.run((
			sys.executable,
			"-c",
			"import time; time.sleep(10)",
		))
		self.assertTrue(result.timed_out)
		self.assertIsNotNone(result.return_code)

	def test_truncates_external_output(self):
		"""Large stdout must be bounded while preserving truncation evidence."""
		runner = ProcessRunner(ExecutionLimits(max_output_bytes=64))
		result = runner.run((
			sys.executable,
			"-c",
			"print('A' * 500)",
		))
		self.assertEqual(len(result.stdout.encode()), 64)
		self.assertTrue(result.stdout_truncated)

	def test_identifies_and_hashes_regular_file(self):
		"""Identity must include external file description and stable SHA-256."""
		with tempfile.TemporaryDirectory() as directory:
			path = Path(directory) / "witness.bin"
			path.write_bytes(b"Awtsmoos external witness\n")
			identity = ArtifactIdentifier().identify(path)
			self.assertEqual(identity.byte_length, path.stat().st_size)
			self.assertEqual(len(identity.sha256), 64)
			self.assertIsNotNone(identity.file_description)
			self.assertEqual(identity.format, "unknown")


if __name__ == "__main__":
	unittest.main()
