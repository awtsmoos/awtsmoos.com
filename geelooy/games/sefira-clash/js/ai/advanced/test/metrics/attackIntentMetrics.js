/**
 * B"H
 * Attack intent metrics.
 *
 * Chapter 214: the simulator must not merely say “attacks happened.” It must
 * reveal whether the bot sought rapid pressure, charge death, upward launch,
 * horizontal exile, edge carry, and edgeguard punishment.
 */
export function createAttackIntentMetrics() {
  return { koIntents: {}, attackFamilies: {}, rapidAttempts: 0, chargeAttempts: 0, verticalKillAttempts: 0, horizontalKillAttempts: 0, edgeCarryAttempts: 0, edgeGuardAttempts: 0 };
}

export function observeAttackIntent(report, mind) {
  report.attackIntent ||= createAttackIntentMetrics();
  const intent = mind?.debug?.koIntent || mind?.koIntent?.name || 'none';
  const family = mind?.debug?.attackFamily || mind?.combatTactic?.family || mind?.tactic || 'none';
  count(report.attackIntent.koIntents, intent);
  count(report.attackIntent.attackFamilies, family);
  if (family === 'rapid' || mind?.tactic === 'RapidPunch') report.attackIntent.rapidAttempts++;
  if (family === 'chargePunch' || family === 'chargeKick' || String(mind?.tactic || '').includes('Charge')) report.attackIntent.chargeAttempts++;
  if (intent === 'VerticalKill' || intent === 'AntiAirKill') report.attackIntent.verticalKillAttempts++;
  if (intent === 'HorizontalKill') report.attackIntent.horizontalKillAttempts++;
  if (intent === 'EdgeCarry') report.attackIntent.edgeCarryAttempts++;
  if (intent === 'EdgeGuard') report.attackIntent.edgeGuardAttempts++;
}

function count(bucket, key) {
  bucket[key] = (bucket[key] || 0) + 1;
}
