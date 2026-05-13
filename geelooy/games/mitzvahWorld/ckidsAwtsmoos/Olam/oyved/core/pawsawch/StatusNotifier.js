
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

    static complete() {
        self.postMessage({ type: 'loadedWorld', payload: { status: 'Complete' } });
        self.postMessage({ type: 'game started', payload: true });
    }

    static error(err) {
        console.error('B"H - 🚨 [OYVED]: Fatal Crash during creation:', err);
        self.postMessage({ type: 'ERROR', details: err.stack || err.toString() });
    }
}
