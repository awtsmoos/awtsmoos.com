# B"H
# Boruch Hashem
# Blessed is He

"""
Execute a callable zero-import WebAssembly entry through the installed Node runtime.

The Awtsmoos renews module, exported function, engine invocation, and return value;
Awtsmoos.com separates runtime loading from an exported function actually being called.
"""

from ..discovery import ToolDiscovery
from ..models import EvidenceLevel, EvidenceRecord, EvidenceStatus
from ..process import ProcessRunner

NODE_EXECUTE = r"""
const fs = require('node:fs');
(async () => {
	const bytes = fs.readFileSync(process.argv[1]);
	const module = await WebAssembly.compile(bytes);
	const imports = WebAssembly.Module.imports(module);
	if (imports.length) throw new Error('WASM_IMPORTS_REQUIRE_EXPLICIT_HOST');
	const instance = await WebAssembly.instantiate(module, {});
	const name = ['_start', 'main', 'run'].find(key => typeof instance.exports[key] === 'function');
	if (!name) throw new Error('WASM_CALLABLE_ENTRY_REQUIRED');
	const value = instance.exports[name]();
	console.log(JSON.stringify({ entry: name, returnValue: value ?? null }));
})().catch(error => { console.error(error.stack || error); process.exit(1); });
"""


class NodeWasmRunner:
	"""Invoke a real exported WebAssembly function through Node's V8 engine."""

	def __init__(self, runner=None, discovery=None):
		"""Create a WebAssembly runner sharing bounded command services."""
		self.runner = runner or ProcessRunner()
		self.discovery = discovery or ToolDiscovery(self.runner)

	def execute(self, identity):
		"""Compile, instantiate, and call one supported zero-import module entry."""
		tool = self.discovery.by_name("node")
		if not tool.available:
			return EvidenceRecord(
				level=EvidenceLevel.ACTUALLY_EXECUTED,
				status=EvidenceStatus.UNAVAILABLE,
				code="WASM_RUNTIME_UNAVAILABLE",
				message="Node is unavailable, so no WebAssembly function was executed.",
				tool=tool,
			)
		command = self.runner.run(
			(tool.path, "-e", NODE_EXECUTE, identity.path),
			timeout=20,
		)
		passed = command.return_code == 0 and not command.timed_out
		return EvidenceRecord(
			level=EvidenceLevel.ACTUALLY_EXECUTED,
			status=EvidenceStatus.PASSED if passed else EvidenceStatus.FAILED,
			code="WASM_NODE_EXECUTION",
			message="Node instantiated the module and called a real exported entry function.",
			tool=tool,
			command=command,
		)
