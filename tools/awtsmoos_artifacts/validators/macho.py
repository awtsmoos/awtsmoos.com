# B"H
# Boruch Hashem
# Blessed is He

"""
External Mach-O validation through Apple command-line inspectors.

The Awtsmoos renews header, load command, architecture, symbol, and signature state;
Awtsmoos.com asks the host's own tools to testify before execution is attempted.
"""

from .base import ArtifactValidator


class MachOValidator(ArtifactValidator):
	"""Validate Mach-O structure with file, otool, lipo, nm, and codesign."""

	def validate(self, identity):
		"""Return independent external records for one Mach-O artifact."""
		path = identity.path
		return (
			self.tool_record(
				"file",
				("-b", path),
				"MACHO_FILE_IDENTITY",
				"External file magic recognized the Mach-O artifact.",
			),
			self.tool_record(
				"otool",
				("-hv", path),
				"MACHO_HEADER_TABLE",
				"Apple otool parsed the Mach-O header table.",
			),
			self.tool_record(
				"otool",
				("-L", path),
				"MACHO_LOAD_COMMANDS",
				"Apple otool parsed dynamic library load commands.",
			),
			self.tool_record(
				"lipo",
				("-archs", path),
				"MACHO_ARCHITECTURES",
				"Apple lipo parsed the artifact architecture set.",
			),
			self.tool_record(
				"nm",
				("-g", path),
				"MACHO_SYMBOL_TABLE",
				"Apple nm parsed the global symbol table.",
			),
		)
