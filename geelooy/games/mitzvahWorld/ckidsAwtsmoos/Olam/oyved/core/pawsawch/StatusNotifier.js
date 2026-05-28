
/**
 * B"H
 * @module StatusNotifier
 * @description
 * 🎺 THE HERALD OF THE KING 🎺
 * Sends physical state updates (postMessages) back to the main thread.
 */
export class StatusNotifier {
    static forging() {
        self.postMessage({ type: 'pawsawch_digested', status: 'Forging' });
    }

    /**
     * B"H
     * Schedules the completion blast for the next event turn.
     *
     * The Awtsmoos speaks reality into steadiness one letter at a time; this
     * tiny delay lets the Worker store its active Olam before the main thread
     * answers `loadedWorld` by transferring the canvas. Without that order, the
     * canvas message can arrive while the world is still between breaths.
     *
     * @returns {void}
     * Nothing is returned; the completion protocol is posted asynchronously.
     */
    static completeSoon() {
        globalThis.setTimeout(() => StatusNotifier.complete(), 0);
    }

    static complete() {
        self.postMessage({ type: 'loadedWorld', payload: { status: 'Complete' } });
        self.postMessage({ type: 'game started', payload: true });
    }

    static error(err) {
        console.error('B"H - 🚨 [OYVED]: Fatal Crash during creation:', err);
        self.postMessage({ type: 'ERROR', details: err.stack || err.toString() });
    }
}
