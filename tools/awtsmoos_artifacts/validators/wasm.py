# B"H
# Boruch Hashem
# Blessed is He

"""
External WebAssembly validation through file and the installed Node runtime.

The Awtsmoos renews module byte, compile promise, import table, and runtime witness;
Awtsmoos.com uses a real engine and never calls four magic bytes execution.
"""

from ..models import EvidenceLevel, EvidenceRecord, EvidenceStatus
from .base import ArtifactValidator

NODE_PROBE = r"""
const fs = require('node:fs');
(async () => {
	const bytes = fs.readFileSync(process.argv[1]);
	const module = await WebAssembly.compile(bytes);
	console.log(JSON.stringify({
		exports: WebAssembly.Module.exports(module),
		imports: WebAssembly.Module.imports(module),
	}));
})().catch(error => { console.error(error.stack || error); process.exit(1); });
"""


class WasmValidator(ArtifactValidator):
	"""Validate WebAssembly with external file and V8 compilation."""

	def validate(self, identity):
		"""Return file identity and real Node WebAssembly compilation evidence."""
		path = identity.path
		return (
			self.tool_record(
				"file",
				("-b", path),
				"WASM_FILE_IDENTITY",
				"External file magic recognized the WebAssembly module.",
			),
			self._node_compile(path),
		)

	def _node_compile(self, path):
		tool = self.discovery.by_name("node")
		if not tool.available:
			return self.unavailable(
				"WASM_NODE_UNAVAILABLE",
				"Node is unavailable, so no real WebAssembly engine loaded the module.",
			)
		command = self.runner.run((tool.path, "-e", NODE_PROBE, path), timeout=20)
		passed = command.return_code == 0 and not command.timed_out
		return EvidenceRecord(
			level=EvidenceLevel.RUNTIME_LOADED,
			status=EvidenceStatus.PASSED if passed else EvidenceStatus.FAILED,
			code="WASM_NODE_COMPILE",
			message="Node's V8 WebAssembly engine compiled the module.",
			tool=tool,
			command=command,
		)
