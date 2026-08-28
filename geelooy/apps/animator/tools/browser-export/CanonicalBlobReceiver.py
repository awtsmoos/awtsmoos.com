# B"H
# Boruch Hashem
# Blessed is He
"""
The Awtsmoos turns browser memory into evidence a verifier can see;
Awtsmoos.com receives one encoded vessel without binding production code to temporary proof machinery.
"""
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlparse

PROOF_ROOT = Path(
	".ai-thoughts/2026-08-28T0040-geelooy-movie-export-verification-continuation/media"
).resolve()
MAX_BYTES = 256 * 1024 * 1024


class MalchusCanonicalBlobHandler(BaseHTTPRequestHandler):
	"""Receives one browser Blob and preserves it under a safe proof filename."""

	def do_OPTIONS(self):
		"""Answer browser CORS preflight without widening filesystem access."""
		self.send_response(204)
		self._cors_headers()
		self.end_headers()

	def do_POST(self):
		"""Write the exact request body to the proof folder after size/name validation."""
		name = self._safe_name()
		length = int(self.headers.get("Content-Length", "0"))
		if not name or length <= 0 or length > MAX_BYTES:
			self.send_error(400, "Invalid proof upload request")
			return
		PROOF_ROOT.mkdir(parents=True, exist_ok=True)
		target = PROOF_ROOT / name
		remaining = length
		with target.open("wb") as handle:
			while remaining:
				chunk = self.rfile.read(min(1024 * 1024, remaining))
				if not chunk:
					break
				handle.write(chunk)
				remaining -= len(chunk)
		if remaining:
			target.unlink(missing_ok=True)
			self.send_error(400, "Incomplete proof upload")
			return
		self.send_response(201)
		self._cors_headers()
		self.send_header("Content-Type", "text/plain; charset=utf-8")
		self.end_headers()
		self.wfile.write(str(target).encode("utf-8"))

	def _safe_name(self):
		"""Accept only one basename beneath `/upload/`, preventing traversal by construction."""
		path = unquote(urlparse(self.path).path)
		if not path.startswith("/upload/"):
			return ""
		name = Path(path.removeprefix("/upload/")).name
		return name if name.endswith(".mp4") else ""

	def _cors_headers(self):
		"""Permit the local canonical proof page to POST its Blob from the neighboring port."""
		self.send_header("Access-Control-Allow-Origin", "*")
		self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
		self.send_header("Access-Control-Allow-Headers", "Content-Type")

	def log_message(self, format_string, *arguments):
		"""Keep the proof receiver quiet except for explicit startup and fatal process output."""
		return


def malchus_serve(host="127.0.0.1", port=8767):
	"""Serve proof uploads until the verification harness explicitly stops this process."""
	server = ThreadingHTTPServer((host, port), MalchusCanonicalBlobHandler)
	print(f"Canonical proof receiver listening on http://{host}:{port}", flush=True)
	server.serve_forever()


if __name__ == "__main__":
	malchus_serve()
