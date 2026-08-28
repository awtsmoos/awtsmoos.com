# B"H
# Boruch Hashem
# Blessed is He
"""
The Awtsmoos gives each export a bounded chamber where frames may gather in order;
Awtsmoos.com keeps names, paths, counts, and evidence inside one verified border.
"""
from pathlib import Path
import json
import re
import uuid

_SAFE_FILE = re.compile(r"^[A-Za-z0-9._-]+\.mp4$")
_MEDIA_ROOT = Path(__file__).resolve().parents[5] / ".ai-thoughts" / "2026-08-28T0144-do-all-long-render-closure" / "media"
_SESSION_ROOT = _MEDIA_ROOT / "ffmpeg-sessions"


class YesodCanonicalFfmpegSession:
	"""Owns one safe frame/audio staging directory and immutable render configuration."""

	def __init__(self, session_id, config):
		self.session_id = session_id
		self.config = self._validated_config(config)
		self.root = _SESSION_ROOT / session_id
		self.frames = self.root / "frames"
		self.audio = self.root / "audio.wav"
		self.frames.mkdir(parents=True, exist_ok=True)
		(self.root / "config.json").write_text(json.dumps(self.config, indent=2))

	@classmethod
	def create(cls, config):
		"""Creates a server-owned session id so browser input can never select a filesystem path."""
		return cls(uuid.uuid4().hex, config)

	@classmethod
	def open(cls, session_id):
		"""Reopens an existing validated session from its server-controlled metadata."""
		if not re.fullmatch(r"[a-f0-9]{32}", session_id or ""):
			raise ValueError("Invalid ffmpeg session id.")
		root = _SESSION_ROOT / session_id
		config = json.loads((root / "config.json").read_text())
		instance = cls.__new__(cls)
		instance.session_id = session_id
		instance.config = config
		instance.root = root
		instance.frames = root / "frames"
		instance.audio = root / "audio.wav"
		return instance

	def frame_path(self, index):
		"""Maps one bounded zero-based index to its deterministic JPEG filename."""
		if not 0 <= index < self.config["frameCount"]:
			raise ValueError(f"Frame index {index} is outside this session.")
		return self.frames / f"frame_{index:06d}.jpg"

	def output_path(self):
		"""Returns the final evidence path beneath the fixed media root."""
		_MEDIA_ROOT.mkdir(parents=True, exist_ok=True)
		return _MEDIA_ROOT / self.config["fileName"]

	def received_frame_count(self):
		"""Counts only deterministic JPEG frame files in this session."""
		return len(list(self.frames.glob("frame_*.jpg")))

	def public_path(self):
		"""Returns the no-cache proof server path for the final artifact."""
		relative = self.output_path().relative_to(Path(__file__).resolve().parents[5])
		return f"/geelooy/{relative.as_posix()}"

	@staticmethod
	def _validated_config(config):
		"""Bounds all browser-controlled numeric and filename values before disk or ffmpeg use."""
		width = int(config.get("width", 0))
		height = int(config.get("height", 0))
		fps = float(config.get("fps", 0))
		duration = float(config.get("durationSeconds", 0))
		frame_count = int(config.get("frameCount", 0))
		file_name = str(config.get("fileName", ""))
		if not 16 <= width <= 7680 or not 16 <= height <= 4320:
			raise ValueError("Invalid render dimensions.")
		if not 1 <= fps <= 120 or not 0.1 <= duration <= 21600:
			raise ValueError("Invalid render timing.")
		if frame_count != int(round(duration * fps)) or frame_count > 2_000_000:
			raise ValueError("Frame count does not match duration and fps.")
		if not _SAFE_FILE.fullmatch(file_name):
			raise ValueError("Invalid output filename.")
		return {"width": width, "height": height, "fps": fps, "durationSeconds": duration, "frameCount": frame_count, "fileName": file_name}
