
// B"H
/**
 * @file diagnostics.js
 * @description Revealing the hidden state of the manifested world.
 */

export function logNivrayim(nivrayim) {
    console.group('B"H - 📜 CURRENT MANIFESTATIONS');
    const logs = Object.entries(nivrayim).map(([id, n]) => ({
        Entity: id,
        Status: n.isReady ? '✅ Ready' : '⏳ Building',
        Altitude: n.position ? n.position.y.toFixed(2) : '??'
    }));
    console.table(logs);
    console.groupEnd();
}
    