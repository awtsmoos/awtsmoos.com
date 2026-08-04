#!/usr/bin/env python3
# B"H

from pathlib import Path

ROOT = Path("geelooy/apps/tunnel/agent/tools/fs/actionGroups/websiteAgents")
MODULE_ROOT = ROOT / "runner"
FACADE = ROOT / "runner.js"
MODULE_NAMES = sorted(
	path.stem
	for path in MODULE_ROOT.glob("*.js")
	if path.stem != "context"
)
IMPORTS = "\n".join(
	f'const {name} = require("./runner/{name}.js");'
	for name in MODULE_NAMES
)
CONTENT = f'''// B"H
// Boruch Hashem
// Blessed is He

const Context = require("./runner/context.js");
const {{ active, wakeTimers }} = Context.shared;
{IMPORTS}

/**
 * @file Exposes the modular submit-only website-agent runner.
 * @description
 * The Awtsmoos gathers focused orchestration vessels behind one stable public surface.
 * A browser turn ends at the durable `website-agent.dispatched` event; no assistant
 * answer parsing, response waiting, or browser-bound continuation belongs here.
 * Requiring every focused stage registers the complete orchestration graph.
 */
module.exports = {{
\tactive,
\tforget,
\tlist,
\tmessage,
\trecover,
\treconcileOrphanedTurns,
\trun,
\tschedule,
\tstart,
\tstatus,
\tstop,
\twakeTimers
}};
'''

FACADE.write_text(CONTENT)
print(f"facade={FACADE} lines={len(CONTENT.splitlines())} modules={len(MODULE_NAMES)}")
