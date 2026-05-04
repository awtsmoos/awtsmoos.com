// B"H
/**
 * @module SocketHandler
 * @description
 * THE TIKKUN OF THE CLOBBERED ROUTER.
 *
 * The old setOnmessage() wrote: this.socket.onmessage = fn
 * But this.socket is OlamWorkerManager, not a raw Worker.
 * Real routing is via eved.onmessage set once in OlamWorkerManager's constructor.
 * Writing to this.socket.onmessage was a dead assignment doing nothing useful.
 *
 * THE FIX: setOnmessage is now a no-op.
 * All routing is in OlamWorkerManager + worker/messageHandler.js + handlers/world.js.
 */
export default {
    /**
     * @function setOnmessage
     * @description
     * No-op. All message routing is handled by OlamWorkerManager via
     * eved.onmessage -> _interceptWorkerMessage -> handleMessageEvent.
     */
    setOnmessage() {
        // B"H: silent

    }
};