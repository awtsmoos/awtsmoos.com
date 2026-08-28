# B"H
# Boruch Hashem
# Blessed is He
"""
The Awtsmoos lets HTTP become a narrow vessel instead of a tangled domain;
Awtsmoos.com centralizes bounded bodies, path parsing, JSON, CORS, and errors so movie routes stay plain.
"""
import json


class HodCanonicalFfmpegHttpSupport:
	"""Owns transport-only request/response mechanics for the localhost ffmpeg handler."""

	@staticmethod
	def body(handler, maximum):
		"""Reads exactly one declared request body while enforcing endpoint-specific byte bounds."""
		length = int(handler.headers.get("Content-Length", "0"))
		if length <= 0 or length > maximum:
			raise ValueError(f"Invalid request body length {length}.")
		body = handler.rfile.read(length)
		if len(body) != length:
			raise ValueError("Incomplete request body.")
		return body

	@staticmethod
	def parts(handler):
		"""Returns normalized non-empty URL path segments without query material."""
		path = handler.path.split("?", 1)[0]
		return [part for part in path.split("/") if part]

	@classmethod
	def json_response(cls, handler, status, value):
		"""Writes one bounded CORS-enabled JSON response for browser and test callers."""
		body = json.dumps(value).encode("utf-8")
		handler.send_response(status)
		cls.cors(handler)
		handler.send_header("Content-Type", "application/json; charset=utf-8")
		handler.send_header("Content-Length", str(len(body)))
		handler.end_headers()
		handler.wfile.write(body)

	@classmethod
	def error_response(cls, handler, error):
		"""Turns a route, validation, filesystem, or ffmpeg failure into bounded JSON evidence."""
		cls.json_response(
			handler,
			400,
			{
				"ok": False,
				"error": str(error)[:4000]
			}
		)

	@staticmethod
	def cors(handler):
		"""Permits only the browser's ordinary CORS methods and content-type header contract."""
		handler.send_header("Access-Control-Allow-Origin", "*")
		handler.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		handler.send_header("Access-Control-Allow-Headers", "Content-Type")
