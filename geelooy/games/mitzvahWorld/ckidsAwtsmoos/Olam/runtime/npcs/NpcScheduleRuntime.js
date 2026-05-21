/**
 * B"H
 * @file NpcScheduleRuntime.js
 *
 * Chapter 30: The Walker Heard The Hour Calling.
 *
 * The Awtsmoos turns time into assignment. An NPC does not wander by accident;
 * its schedule yields a place, a purpose, and a reason the living street can
 * later render into motion.
 */

export function resolveNpcSchedule(schedule = [], hour = 12) {
  const sorted = [...schedule].sort((a, b) => a.from - b.from);
  return sorted.find(slot => hour >= slot.from && hour < slot.to) || sorted[0] || null;
}

export function describeNpcAtTime(npc, hour) {
  const slot = resolveNpcSchedule(npc?.schedule, hour);
  if (!slot) return { npcId: npc?.id, locationId: null, action: 'idle' };
  return {
    npcId: npc.id,
    locationId: slot.locationId,
    action: slot.action,
    reason: slot.reason || 'schedule'
  };
}
