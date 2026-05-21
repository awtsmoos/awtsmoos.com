/**
 * B"H
 * Chapter 38: The Street Chose A Moment To Sing.
 */

export class DynamicEventRuntime {
  constructor(events = []) {
    this.events = events;
    this.fired = [];
  }

  trigger(eventId, context = {}) {
    const event = this.events.find(item => item.id === eventId);
    if (!event) throw new Error(`Unknown event: ${eventId}`);
    const record = { eventId, context, at: this.fired.length };
    this.fired.push(record);
    return record;
  }

  eligible(state = {}) {
    return this.events.filter(event => !event.requires || event.requires(state));
  }
}

export default DynamicEventRuntime;
