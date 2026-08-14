# B"H
# Boruch Hashem
# Blessed is He

"""
Discover fixed external validators, runtimes, compilers, Android tools, and Blender.

The Awtsmoos renews tool presence, absence, path, and version together;
Awtsmoos.com records the actual host instead of assuming an imagined workstation.
"""

from dataclasses import dataclass
from pathlib import Path
from shutil import which

from .models import ToolEvidence
from .process import ProcessRunner


@dataclass(frozen=True, slots=True)
class ToolSpec:
	"""Fixed discovery policy for one command-line capability."""

	name: str
	candidates: tuple[str, ...]
	version_arguments: tuple[str, ...] = ("--version",)


TOOL_SPECS = (
	ToolSpec("file", ("file",)),
	ToolSpec("otool", ("otool",)),
	ToolSpec("lipo", ("lipo",), ("-info",)),
	ToolSpec("codesign", ("codesign",), ("-h",)),
	ToolSpec("nm", ("nm",)),
	ToolSpec("objdump", ("objdump",)),
	ToolSpec("readelf", ("readelf", "llvm-readelf")),
	ToolSpec("unzip", ("unzip",), ("-v",)),
	ToolSpec("zipinfo", ("zipinfo",), ("-h",)),
	ToolSpec("adb", ("adb",), ("version",)),
	ToolSpec("wine", ("wine64", "wine")),
	ToolSpec("qemu-x86_64", ("qemu-x86_64",)),
	ToolSpec("docker", ("docker",)),
	ToolSpec("node", ("node",)),
	ToolSpec("clang", ("clang",)),
	ToolSpec("clang++", ("clang++",)),
	ToolSpec("swiftc", ("swiftc",)),
	ToolSpec("wasmtime", ("wasmtime",)),
	ToolSpec("wasmer", ("wasmer",)),
	ToolSpec(
		"blender",
		("/Applications/Blender.app/Contents/MacOS/Blender", "blender"),
	),
)


class ToolDiscovery:
	"""Discover and version fixed tools without accepting user-selected paths."""

	def __init__(self, runner=None):
		"""Create discovery backed by the bounded process runner."""
		self.runner = runner or ProcessRunner()

	def discover_all(self):
		"""Return an immutable ordered tuple describing every known capability."""
		return tuple(self.discover(spec) for spec in TOOL_SPECS)

	def discover(self, spec):
		"""Resolve one fixed specification and attempt bounded version evidence."""
		path = self._resolve(spec.candidates)
		if path is None:
			return ToolEvidence(name=spec.name, available=False)
		command = self.runner.run((path, *spec.version_arguments), timeout=8)
		version = self._version_text(command.stdout, command.stderr)
		return ToolEvidence(
			name=spec.name,
			available=True,
			path=path,
			version=version,
		)

	def by_name(self, name):
		"""Discover one known tool by stable name."""
		for spec in TOOL_SPECS:
			if spec.name == name:
				return self.discover(spec)
		raise KeyError(name)

	@staticmethod
	def _resolve(candidates):
		for candidate in candidates:
			if candidate.startswith("/") and Path(candidate).is_file():
				return str(Path(candidate).resolve())
			resolved = which(candidate)
			if resolved:
				return resolved
		return None

	@staticmethod
	def _version_text(stdout, stderr):
		text = "\n".join(value.strip() for value in (stdout, stderr) if value.strip())
		return text[:4096] or None
