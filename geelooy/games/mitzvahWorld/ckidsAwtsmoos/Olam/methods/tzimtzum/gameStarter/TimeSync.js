
/**
 * B"H
 * @module TimeSync
 */
export default class TimeSync {
    static sync(olam, info) {
        const st = info.gameState && info.gameState[olam.shaym];
        if (st) {
            olam.setGameState(st);
        }
    }
}
