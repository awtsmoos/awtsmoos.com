# B"H
# Boruch Hashem
# Blessed is He
"""
The Awtsmoos lets browser evidence cross a narrow localhost gate and return after interruption;
Awtsmoos.com routes resumable status, frames, sound, and finalization without confusing transport with production.
"""
from http.server import BaseHTTPRequestHandler
import json
from CanonicalFfmpegHttpSupport import HodCanonicalFfmpegHttpSupport
from CanonicalFfmpegRunner import MalchusCanonicalFfmpegRunner
from CanonicalFfmpegSession import YesodCanonicalFfmpegSession

_MAX_JSON = 32 * 1024
_MAX_FRAME = 2 * 1024 * 1024
_MAX_AUDIO = 64 * 1024 * 1024


class GevurahCanonicalFfmpegHandler(BaseHTTPRequestHandler):
	"""Owns localhost ffmpeg route semantics while focused helpers own filesystem and HTTP mechanics."""

	def do_OPTIONS(self):
		"""Allows the neighboring no-cache proof origin to use this localhost service."""
		self.send_response(204)
		HodCanonicalFfmpegHttpSupport.cors(self)
		self.end_headers()

	def do_GET(self):
		"""Reports immutable configuration plus resumable frame/audio progress for one session."""
		try:
			parts = HodCanonicalFfmpegHttpSupport.parts(self)
			if len(parts) != 3 or parts[0] != "session" or parts[2] != "status":
				raise ValueError("Unknown status route.")
			session = YesodCanonicalFfmpegSession.open(parts[1])
			HodCanonicalFfmpegHttpSupport.json_response(self, 200, session.status_payload())
		except Exception as error:
			HodCanonicalFfmpegHttpSupport.error_response(self, error)

	def do_POST(self):
		"""Routes one bounded mutation without exposing arbitrary filesystem or command input."""
		try:
			parts = HodCanonicalFfmpegHttpSupport.parts(self)
			if parts == ["session"]:
				self._create()
				return
			if len(parts) < 3 or parts[0] != "session":
				raise ValueError("Unknown ffmpeg route.")
			session = YesodCanonicalFfmpegSession.open(parts[1])
			self._route_session_mutation(session, parts)
		except Exception as error:
			HodCanonicalFfmpegHttpSupport.error_response(self, error)

	def _route_session_mutation(self, session, parts):
		"""Dispatches one validated session mutation to its focused route method."""
		if len(parts) == 4 and parts[2] == "frame":
			self._frame(session, int(parts[3]))
		elif parts[2:] == ["audio"]:
			self._audio(session)
		elif parts[2:] == ["finalize"]:
			result = MalchusCanonicalFfmpegRunner.render(session)
			HodCanonicalFfmpegHttpSupport.json_response(self, 201, result)
		else:
			raise ValueError("Unknown ffmpeg mutation route.")

	def _create(self):
		"""Creates a server-owned session from bounded JSON render metadata."""
		body = HodCanonicalFfmpegHttpSupport.body(self, _MAX_JSON)
		session = YesodCanonicalFfmpegSession.create(json.loads(body.decode("utf-8")))
		HodCanonicalFfmpegHttpSupport.json_response(
			self,
			201,
			{"sessionId": session.session_id, "config": session.config}
		)

	def _frame(self, session, index):
		"""Stores one indexed JPEG witness beneath the current session only."""
		body = HodCanonicalFfmpegHttpSupport.body(self, _MAX_FRAME)
		if not body.startswith(b"\xff\xd8"):
			raise ValueError("Frame payload must be JPEG.")
		session.frame_path(index).write_bytes(body)
		HodCanonicalFfmpegHttpSupport.json_response(
			self,
			201,
			{"frame": index, "bytes": len(body)}
		)

	def _audio(self, session):
		"""Stores one browser-rendered PCM WAV soundtrack for final muxing."""
		body = HodCanonicalFfmpegHttpSupport.body(self, _MAX_AUDIO)
		if len(body) < 44 or body[:4] != b"RIFF" or body[8:12] != b"WAVE":
			raise ValueError("Audio payload must be WAV.")
		session.audio.write_bytes(body)
		HodCanonicalFfmpegHttpSupport.json_response(
			self,
			201,
			{"audioBytes": len(body)}
		)

	def log_message(self, format_string, *arguments):
		"""Keeps thousands of successful frame requests from flooding tunnel output."""
		return
