# B"H
# Boruch Hashem
# Blessed is He
"""
The Awtsmoos gathers browser-rendered frames into a localhost encoding gate;
Awtsmoos.com starts only the bounded handler, leaving semantic rendering in the browser state.
"""
from http.server import ThreadingHTTPServer
from pathlib import Path
import argparse
import sys

_FFMPEG_DIR = Path(__file__).resolve().parent / "ffmpeg"
sys.path.insert(0, str(_FFMPEG_DIR))
from CanonicalFfmpegHandler import GevurahCanonicalFfmpegHandler


def malchus_serve(host="127.0.0.1", port=8769):
	"""Serves the local ffmpeg bridge until the verification harness explicitly stops it."""
	server = ThreadingHTTPServer((host, port), GevurahCanonicalFfmpegHandler)
	print(f"Canonical ffmpeg bridge listening on http://{host}:{port}", flush=True)
	server.serve_forever()


def binah_arguments():
	"""Reads an optional local proof port without widening the bind address."""
	parser = argparse.ArgumentParser(description="Canonical movie ffmpeg bridge.")
	parser.add_argument("--port", type=int, default=8769)
	return parser.parse_args()


if __name__ == "__main__":
	arguments = binah_arguments()
	malchus_serve(port=arguments.port)
