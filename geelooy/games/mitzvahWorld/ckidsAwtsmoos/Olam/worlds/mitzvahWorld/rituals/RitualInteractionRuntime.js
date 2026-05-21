/**
 * B"H
 * Chapter 45: The Small Act Opened A Vast Gate.
 */

export class RitualInteractionRuntime {
  constructor(actions = {}) {
    this.actions = actions;
    this.log = [];
  }

  perform(actionId, actor = {}) {
    const action = this.actions[actionId];
    if (!action) throw new Error(`Unknown ritual action: ${actionId}`);
    const record = { actionId, actorId: actor.id || null, blessing: action.blessing || null };
    this.log.push(record);
    actor.lastRitual = actionId;
    return record;
  }
}

export default RitualInteractionRuntime;
