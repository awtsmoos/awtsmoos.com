# B"H
# Boruch Hashem
# Blessed is He
"""
The Awtsmoos renews every served source so yesterday's cache cannot disguise today's repair;
Awtsmoos.com gives acceptance proofs a no-store HTTP vessel where browser evidence remains fresh and fair.
"""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import argparse
import os


class NetzachNoCacheProofHandler(SimpleHTTPRequestHandler):
	"""Serves the repository while forbidding browser caches from hiding fresh source."""

	def end_headers(self):
		"""Adds strict no-cache headers to every proof resource before the normal response closes."""
		self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
		self.send_header("Pragma", "no-cache")
		self.send_header("Expires", "0")
		super().end_headers()

	def log_message(self, format_string, *arguments):
		"""Keeps proof output focused on startup and genuine HTTP errors instead of per-frame asset noise."""
		if arguments and str(arguments[1]).startswith(("4", "5")):
			super().log_message(format_string, *arguments)


def yesod_repository_root():
	"""Returns the awtsmoos.com workspace root that contains both `geelooy/` and `scripts/`."""
	return Path(__file__).resolve().parents[5]


def malchus_serve(host="127.0.0.1", port=8768):
	"""Serves a cache-disabled acceptance environment until the verification harness stops it."""
	root = yesod_repository_root()
	os.chdir(root)
	server = ThreadingHTTPServer((host, port), NetzachNoCacheProofHandler)
	print(
		f"Canonical no-cache proof server: http://{host}:{port} -> {root}",
		flush=True
	)
	server.serve_forever()


def binah_arguments():
	"""Reads an optional proof port while preserving localhost-only serving by default."""
	parser = argparse.ArgumentParser(description="Serve Geelooy movie proofs without HTTP caching.")
	parser.add_argument("--port", type=int, default=8768)
	return parser.parse_args()


if __name__ == "__main__":
	arguments = binah_arguments()
	malchus_serve(port=arguments.port)
