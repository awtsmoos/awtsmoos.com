# B"H
# Boruch Hashem
# Blessed is He

"""
External Portable Executable validation without pretending Wine is installed.

The Awtsmoos renews DOS stub, PE header, sections, imports, and absent Windows host;
Awtsmoos.com distinguishes real structure from execution this Mac cannot perform.
"""

from .base import ArtifactValidator


class PeValidator(ArtifactValidator):
	"""Validate PE/COFF structure with installed file and objdump tools."""

	def validate(self, identity):
		"""Return external PE header, section, and import evidence."""
		path = identity.path
		return (
			self.tool_record(
				"file",
				("-b", path),
				"PE_FILE_IDENTITY",
				"External file magic recognized the PE artifact.",
			),
			self.tool_record(
				"objdump",
				("-f", path),
				"PE_OBJECT_HEADER",
				"External objdump parsed the PE/COFF object header.",
			),
			self.tool_record(
				"objdump",
				("-h", path),
				"PE_SECTION_TABLE",
				"External objdump parsed the PE section table.",
			),
			self.tool_record(
				"objdump",
				("-p", path),
				"PE_PRIVATE_HEADERS",
				"External objdump parsed PE imports and private headers.",
			),
		)
