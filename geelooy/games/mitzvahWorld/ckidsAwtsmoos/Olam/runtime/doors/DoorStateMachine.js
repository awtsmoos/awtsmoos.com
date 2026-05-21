/**
 * B"H
 * @file DoorStateMachine.js
 *
 * Chapter 29: The Threshold Learned Law.
 *
 * A door is not a rectangle. It is permission, memory, sound, and promise.
 * The Awtsmoos lets the hinge obey declarative transition law, so animation
 * may dance later while logic already knows what may open.
 */

const TRANSITIONS = Object.freeze({
  closed: Object.freeze({ open: 'open', lock: 'locked', jam: 'jammed' }),
  open: Object.freeze({ close: 'closed' }),
  locked: Object.freeze({ unlock: 'closed', force: 'jammed' }),
  jammed: Object.freeze({ repair: 'closed' })
});

export class DoorStateMachine {
  constructor(initial = 'closed') {
    if (!TRANSITIONS[initial]) throw new Error(`Invalid door state: ${initial}`);
    this.state = initial;
    this.history = [initial];
  }

  send(event) {
    const next = TRANSITIONS[this.state]?.[event];
    if (!next) return { ok: false, state: this.state, event };
    this.state = next;
    this.history.push(next);
    return { ok: true, state: this.state, event };
  }

  can(event) {
    return Boolean(TRANSITIONS[this.state]?.[event]);
  }

  snapshot() {
    return { state: this.state, history: [...this.history] };
  }
}

export default DoorStateMachine;
