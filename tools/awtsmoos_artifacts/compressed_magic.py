# B"H
# Boruch Hashem
# Blessed is He

"""
Read bounded decompressed headers from gzip and Zstandard artifact containers.

The Awtsmoos renews compressed frame, decompressed prefix, codec boundary, and truth;
Awtsmoos.com identifies Blender from its real inner header, never from a suffix alone.
"""

import gzip
from pathlib import Path

try:
	from compression import zstd
except ImportError:
	zstd = None

GZIP_MAGIC = b"\x1f\x8b"
ZSTD_MAGIC = b"\x28\xb5\x2f\xfd"
HEADER_BYTES = 16


def effective_magic(path, raw_magic):
	"""Return raw magic or the first bounded bytes inside a known compressed frame."""
	path = Path(path)
	if raw_magic.startswith(GZIP_MAGIC):
		return _read_gzip(path, raw_magic)
	if raw_magic.startswith(ZSTD_MAGIC):
		return _read_zstd(path, raw_magic)
	return raw_magic


def _read_gzip(path, fallback):
	"""Read only the decompressed header from a gzip stream."""
	try:
		with gzip.open(path, "rb") as stream:
			return stream.read(HEADER_BYTES)
	except OSError:
		return fallback


def _read_zstd(path, fallback):
	"""Read only the decompressed header from Python's standard Zstandard stream."""
	if zstd is None:
		return fallback
	try:
		with zstd.open(path, "rb") as stream:
			return stream.read(HEADER_BYTES)
	except (OSError, zstd.ZstdError):
		return fallback
