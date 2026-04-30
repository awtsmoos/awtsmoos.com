
// B"H
/**
 * @class WorkerMessageRelay
 * @description
 * * Chapter 6: The Inter-World Messenger
 * Between the Main Thread and the Worker lies a great divide,
 * A gap across which the messages must safely ride.
 * This class is the Map-driven dispatcher of truth,
 * Guiding the data with the energy of youth!
 * * No switch statements! Only the pure mapping of Intent to Action.
 * Every message received is a holy transaction.
 */
class WorkerMessageRelay {
    constructor() {
        this.handlers = new Map();
    }

    /**
     * @method register
     * @description Links a message type to a specific spiritual function.
     * @param {string} type - The key of the message.
     * @param {Function} func - The logic to execute.
     */
    register(type, func) {
        this.handlers.set(type, func);
        console.log(`B"H - 🔗 Handler Registered for: ${type}`);
    }

    /**
     * @method listen
     * @description The main ear of the Worker, catching all incoming speech.
     * @param {MessageEvent} event - The data packet from the Main Thread.
     */
    listen(event) {
        const { type, payload } = event.data;
        const action = this.handlers.get(type);

        if (action) {
            action(payload);
        } else {
            console.warn(`B"H - ❓ Unknown message type floating in the void: ${type}`);
        }
    }
}

module.exports = WorkerMessageRelay;
