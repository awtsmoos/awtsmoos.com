# B"H
# Boruch Hashem
# Blessed is He
"""
The Awtsmoos turns ordered witnesses into encoded time without a shell-string disguise;
Awtsmoos.com invokes ffmpeg and ffprobe as bounded argv vessels, then records what actually survives.
"""
import json
import shutil
import subprocess

_FFMPEG = "/usr/local/bin/ffmpeg"
_FFPROBE = "/usr/local/bin/ffprobe"


class MalchusCanonicalFfmpegRunner:
	"""Validates staged evidence, encodes H.264/AAC MP4, probes it, and retires temporary frames."""

	@classmethod
	def render(cls, session):
		"""Encodes one complete session only when every expected frame and its soundtrack exist."""
		expected = session.config["frameCount"]
		received = session.received_frame_count()
		if received != expected:
			raise ValueError(f"Expected {expected} frames, found {received}.")
		if not session.audio.exists() or session.audio.stat().st_size < 44:
			raise ValueError("A valid soundtrack WAV is required.")
		output = session.output_path()
		command = cls.command(session, output)
		completed = subprocess.run(command, capture_output=True, text=True, check=False)
		if completed.returncode != 0:
			raise RuntimeError(f"ffmpeg failed: {completed.stderr[-4000:]}")
		probe = cls.probe(output)
		result = {
			"ok": True,
			"fileName": output.name,
			"filePath": str(output),
			"publicPath": session.public_path(),
			"bytes": output.stat().st_size,
			"frameCount": expected,
			"probe": probe,
			"backend": "native-ffmpeg-libx264"
		}
		(output.with_suffix(".ffprobe.json")).write_text(json.dumps(probe, indent=2))
		shutil.rmtree(session.root)
		return result

	@staticmethod
	def command(session, output):
		"""Builds the shell-free ffmpeg argv for the canonical JPEG sequence and browser soundtrack."""
		config = session.config
		return [
			_FFMPEG, "-y", "-hide_banner", "-loglevel", "error",
			"-framerate", str(config["fps"]), "-start_number", "0",
			"-i", str(session.frames / "frame_%06d.jpg"),
			"-i", str(session.audio),
			"-t", f"{config['durationSeconds']:.6f}",
			"-c:v", "libx264", "-preset", "medium", "-crf", "20",
			"-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "128k",
			"-movflags", "+faststart", str(output)
		]

	@staticmethod
	def probe(output):
		"""Returns independent ffprobe JSON for streams and container duration."""
		completed = subprocess.run(
			[_FFPROBE, "-v", "error", "-show_entries", "format=duration,size,format_name", "-show_entries", "stream=index,codec_name,codec_type,width,height,r_frame_rate,sample_rate,channels", "-of", "json", str(output)],
			capture_output=True,
			text=True,
			check=True
		)
		return json.loads(completed.stdout)
