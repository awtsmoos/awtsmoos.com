
// B"H
export const eventsModule = `
class EventEmitter {
    constructor() { this._events = {}; }
    on(event, listener) {
        if (!this._events[event]) this._events[event] = [];
        this._events[event].push(listener);
        return this;
    }
    once(event, listener) {
        const wrapper = (...args) => {
            this.removeListener(event, wrapper);
            listener(...args);
        };
        return this.on(event, wrapper);
    }
    emit(event, ...args) {
        if (!this._events[event]) return false;
        this._events[event].slice().forEach(l => l(...args));
        return true;
    }
    removeListener(event, listener) {
        if (!this._events[event]) return this;
        this._events[event] = this._events[event].filter(l => l !== listener);
        return this;
    }
}
module.exports = EventEmitter;
`;
