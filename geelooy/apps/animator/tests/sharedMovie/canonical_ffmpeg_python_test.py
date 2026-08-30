# B"H
# Boruch Hashem
# Blessed is He
"""
The Awtsmoos bounds native encoding before a subprocess may move;
Awtsmoos.com proves session validation and shell-free ffmpeg argv truth in this groove.
"""
import sys
import unittest
from pathlib import Path

_FFMPEG_DIR = Path(__file__).resolve().parents[2] / "tools" / "browser-export" / "ffmpeg"
sys.path.insert(0, str(_FFMPEG_DIR))
from CanonicalFfmpegRunner import MalchusCanonicalFfmpegRunner
from CanonicalFfmpegSession import YesodCanonicalFfmpegSession


class YesodCanonicalFfmpegPythonTest(unittest.TestCase):
	"""Verifies the security and timing contracts surrounding the localhost ffmpeg bridge."""

	def test_session_rejects_path_traversal_filename(self):
		"""Browser filenames may never select an output path beyond the evidence root."""
		with self.assertRaisesRegex(ValueError, "Invalid output filename"):
			YesodCanonicalFfmpegSession._validated_config(self.config(fileName="../escape.mp4"))

	def test_session_rejects_mismatched_frame_count(self):
		"""Final render cardinality must agree with declared seconds and fps."""
		with self.assertRaisesRegex(ValueError, "Frame count"):
			YesodCanonicalFfmpegSession._validated_config(self.config(frameCount=359))

	def test_runner_builds_shell_free_h264_aac_argv(self):
		"""The renderer uses fixed executable arguments rather than interpolated shell commands."""
		session = FakeSession(self.config())
		command = MalchusCanonicalFfmpegRunner.command(session, Path("/tmp/final.mp4"))
		self.assertEqual(command[0], "/usr/local/bin/ffmpeg")
		self.assertIn("libx264", command)
		self.assertIn("aac", command)
		self.assertNotIn("shell=True", command)
		self.assertEqual(command[-1], "/tmp/final.mp4")

	@staticmethod
	def config(**overrides):
		"""Creates one valid 30-second proof configuration with bounded override support."""
		config = {
			"width": 640,
			"height": 360,
			"fps": 12,
			"durationSeconds": 30,
			"frameCount": 360,
			"fileName": "proof.mp4"
		}
		config.update(overrides)
		return config


class FakeSession:
	"""Supplies only the runner fields needed to inspect the exact ffmpeg argv."""

	def __init__(self, config):
		self.config = config
		self.frames = Path("/tmp/frames")
		self.audio = Path("/tmp/audio.wav")


if __name__ == "__main__":
	unittest.main()
