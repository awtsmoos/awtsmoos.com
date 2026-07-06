// B"H
/** B"H: slow is not dead. If evidence says the tunnel can route, stay alive. */
function statusFromCircuit(circuit = {}) {
  const level = circuit.level || 'unknown', live = circuit.liveness || {};
  const canRoute = live.canRoute !== false && (live.canRoute === true || live.recentSuccess === true || live.freshWorker === true);
  const isAlive = canRoute || level === 'open';
  return { isAlive, state:stateFrom(level, canRoute), health:healthFrom(level, canRoute), reason:reasonFrom(level, canRoute, live), canRoute, liveness:live };
}
function stateFrom(level, canRoute) { if (!canRoute && level !== 'open') return 'recovering'; if (level === 'panic' || level === 'hard') return 'lagging_but_routable'; if (level === 'soft') return 'degraded_but_routable'; if (level === 'open') return 'alive'; return 'unknown'; }
function healthFrom(level, canRoute) { if (!canRoute && level !== 'open') return 'recovering'; if (level === 'panic') return 'emergency_routable'; if (level === 'hard') return 'degraded_routable'; if (level === 'soft') return 'degraded'; return 'healthy'; }
function reasonFrom(level, canRoute, live) { if (canRoute) return 'recent_success_or_fresh_worker_proves_route'; if (live.saturated) return 'queue_saturated'; if (level !== 'open') return 'lag_without_recent_route_evidence'; return 'open'; }
module.exports = { statusFromCircuit, stateFrom, healthFrom };
