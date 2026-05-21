/**
 * B"H
 * @file CityProjectRuntime.js
 *
 * Chapter 40: The Broken Bridge Felt The Future Arrive.
 *
 * The Awtsmoos lets repair become state. A project consumes delivered resources,
 * completes once satisfied, and returns effects that can raise morale, open a
 * road, lower danger, or invite new NPC life into the city.
 */

export class CityProjectRuntime {
  constructor(project) {
    if (!project?.id) throw new Error('City project id is required.');
    this.project = project;
    this.delivered = {};
    this.completed = false;
  }

  deliver(resourceId, amount = 1) {
    if (this.completed) return this.snapshot();
    this.delivered[resourceId] = (this.delivered[resourceId] || 0) + amount;
    const ready = Object.entries(this.project.requires || {}).every(([id, needed]) => (this.delivered[id] || 0) >= needed);
    if (ready) this.completed = true;
    return this.snapshot();
  }

  effects() {
    return this.completed ? { ...(this.project.effects || {}) } : {};
  }

  snapshot() {
    return { id: this.project.id, delivered: { ...this.delivered }, completed: this.completed, effects: this.effects() };
  }
}

export default CityProjectRuntime;
