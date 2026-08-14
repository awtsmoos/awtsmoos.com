# B"H
# Boruch Hashem
# Blessed is He

"""
External ELF validation without claiming a missing Linux runtime.

The Awtsmoos renews ELF header, architecture, sections, and unavailable execution;
Awtsmoos.com separates a real Linux artifact from a process this Mac cannot host.
"""

from .base import ArtifactValidator


class ElfValidator(ArtifactValidator):
	"""Validate ELF structure with installed file and object inspection tools."""

	def validate(self, identity):
		"""Return external parsing evidence and explicit inspector availability."""
		path = identity.path
		return (
			self.tool_record(
				"file",
				("-b", path),
				"ELF_FILE_IDENTITY",
				"External file magic recognized the ELF artifact.",
			),
			self.tool_record(
				"objdump",
				("-f", path),
				"ELF_OBJECT_HEADER",
				"External objdump parsed the ELF object header.",
			),
			self.tool_record(
				"objdump",
				("-h", path),
				"ELF_SECTION_TABLE",
				"External objdump parsed the ELF section table.",
			),
			self.tool_record(
				"readelf",
				("-h", path),
				"ELF_READELF_HEADER",
				"External readelf parsed the ELF header.",
			),
		)
