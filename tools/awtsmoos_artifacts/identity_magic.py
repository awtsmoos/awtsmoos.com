# B"H
# Boruch Hashem
# Blessed is He

"""
Classify artifact format and architecture from measured magic and `file` testimony.

The Awtsmoos renews first bytes, host description, format name, and architecture;
Awtsmoos.com keeps pure classification separate from filesystem and process concerns.
"""

MACHO_MAGICS = {
	b"\xfe\xed\xfa\xce",
	b"\xce\xfa\xed\xfe",
	b"\xfe\xed\xfa\xcf",
	b"\xcf\xfa\xed\xfe",
	b"\xca\xfe\xba\xbe",
	b"\xbe\xba\xfe\xca",
}


def artifact_format(path, magic):
	"""Return one stable artifact format from magic bytes and APK extension policy."""
	if magic[:4] in MACHO_MAGICS:
		return "mach-o"
	if magic.startswith(b"\x7fELF"):
		return "elf"
	if magic.startswith(b"MZ"):
		return "pe"
	if magic.startswith(b"\x00asm"):
		return "webassembly"
	if magic.startswith(b"glTF"):
		return "glb"
	if magic.startswith(b"BLENDER"):
		return "blend"
	if magic.startswith(b"\x89PNG\r\n\x1a\n"):
		return "png"
	if magic.startswith(b"PK\x03\x04") and path.suffix.lower() == ".apk":
		return "apk"
	if magic.startswith(b"PK\x03\x04"):
		return "zip"
	return "unknown"


def artifact_architecture(description):
	"""Normalize architecture phrases emitted by external file implementations."""
	text = (description or "").lower()
	for needle, value in (
		("x86_64", "x86_64"),
		("x86-64", "x86_64"),
		("x86 64", "x86_64"),
		("arm64", "arm64"),
		("aarch64", "arm64"),
		("i386", "x86"),
	):
		if needle in text:
			return value
	return None
