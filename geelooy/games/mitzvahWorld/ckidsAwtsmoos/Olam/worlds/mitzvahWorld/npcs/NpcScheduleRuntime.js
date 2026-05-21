/**
 * B"H
 * Chapter 32: The Chossid Walked Where Time Whispered.
 */

export class NpcScheduleRuntime {
  constructor(schedules = {}) {
    this.schedules = schedules;
  }

  activity(npcId, phase) {
    const schedule = this.schedules[npcId] || {};
    return schedule[phase] || schedule.default || { action: 'stand', place: 'street' };
  }

  apply(npc, phase) {
    const plan = this.activity(npc.id || npc.name, phase);
    npc.userData = { ...(npc.userData || {}), currentActivity: plan.action, targetPlace: plan.place };
    return plan;
  }
}

export default NpcScheduleRuntime;
