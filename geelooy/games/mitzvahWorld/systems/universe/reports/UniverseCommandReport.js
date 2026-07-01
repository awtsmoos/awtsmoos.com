// B"H
/**
 * @file UniverseCommandReport.js
 * @purpose Summarize construction commands used by the live universe plan.
 * @owner mitzvahWorld universe construction diagnostic layer.
 * @inputs Runtime command array from UniverseConstructionPlan.
 * @outputs JSON-safe command counts, ids, and authority coverage flags.
 * @runtimeAuthority Diagnostic only; it never mutates scene or worker state.
 * @updateOrder Run before Sefiros/procedural reports are merged into plan stats.
 * @callers systems/universe/UniverseConstructionPlan.js.
 * @invariants Missing command arrays report zero counts instead of throwing.
 * @failureModes Unknown command shapes are counted as unknown with safe ids.
 */
function asCommands(commands) {
  return Array.isArray(commands) ? commands : [];
}

function countBy(commands, picker) {
  return commands.reduce((acc, command) => {
    const key = picker(command) || "unknown";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function ids(commands) {
  return commands.map((command, index) => command?.id || `command_${index}`);
}

function coverage(commands) {
  return commands.reduce((acc, command) => {
    if (command?.manual) acc.manual += 1;
    if (Array.isArray(command?.modifiers) && command.modifiers.length) acc.modifiers += 1;
    if (command?.group) acc.groups += 1;
    if (command?.dialogue || command?.interaction) acc.interactions += 1;
    return acc;
  }, { manual:0, modifiers:0, groups:0, interactions:0 });
}

export function universeCommandReport(commands = []) {
  const safeCommands = asCommands(commands);
  return {
    ok: true,
    source: "UniverseConstructionPlan",
    total: safeCommands.length,
    ids: ids(safeCommands),
    byType: countBy(safeCommands, command => command?.type),
    byRegion: countBy(safeCommands, command => command?.region || command?.zone),
    coverage: coverage(safeCommands)
  };
}

export default universeCommandReport;
