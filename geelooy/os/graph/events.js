// B"H

export class EventLog {
  constructor(limit = 500) {
    this.limit = limit;
    this.events = [];
    this.seq = 0;
  }

  push(type, data = {}) {
    const seq = ++this.seq;
    const event = {
      id:`evt:${seq.toString(36)}`,
      seq,
      type,
      data,
      at:new Date().toISOString()
    };
    this.events.push(event);
    this.events = this.events.slice(-this.limit);
    return event;
  }

  list() {
    return [...this.events];
  }

  lastSeq() {
    return this.seq;
  }
}

/**
 * B"H
 * Every graph event now receives a rising number. The river may forget old
 * ripples when the log trims itself, but the count never turns backward.
 */
