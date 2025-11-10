// B"H
/**
 * Simple EventEmitter (Pub/Sub)
 * Allows modules to communicate without direct dependencies.
 */
export class EventEmitter {
    constructor() {
        this.events = {};
    }

    /**
     * Subscribe to an event.
     * @param {string} eventName - The name of the event.
     * @param {Function} listener - The callback function.
     * @returns {Function} An unsubscribe function.
     */
    on(eventName, listener) {
        if (!this.events[eventName]) {
            this.events[eventName] = [];
        }
        this.events[eventName].push(listener);

        // Return an unsubscribe function
        return () => {
            this.off(eventName, listener);
        };
    }

    /**
     * Unsubscribe from an event.
     * @param {string} eventName - The name of the event.
     * @param {Function} listenerToRemove - The specific listener to remove.
     */
    off(eventName, listenerToRemove) {
        if (!this.events[eventName]) {
            return;
        }

        this.events[eventName] = this.events[eventName].filter(listener => listener !== listenerToRemove);
    }

    /**
     * Emit an event, calling all subscribed listeners.
     * @param {string} eventName - The name of the event to emit.
     * @param {*} [data] - Optional data to pass to the listeners.
     */
    emit(eventName, data) {
        if (!this.events[eventName]) {
            return;
        }
        // Call listeners in a setTimeout to avoid blocking the emitter
        // and potential issues if a listener modifies the listener array during iteration.
        // Make a copy of the listeners array in case listeners are added/removed during emit.
        const listeners = [...this.events[eventName]];
        setTimeout(() => {
             listeners.forEach(listener => {
                try {
                    listener(data);
                } catch (error) {
                    console.error(`Error in listener for event "${eventName}":`, error);
                }
            });
        }, 0);
    }

    /**
     * Subscribe to an event only once.
     * @param {string} eventName - The name of the event.
     * @param {Function} listener - The callback function.
     */
    once(eventName, listener) {
        const onceWrapper = (data) => {
            listener(data);
            this.off(eventName, onceWrapper);
        };
        this.on(eventName, onceWrapper);
    }
}