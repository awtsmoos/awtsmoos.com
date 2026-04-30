
/**
 * B"H
 * @module TimeTracker
 * @description
 * ⏱️ THE SCALES OF TIME (MISHKAL) ⏱️
 * 
 * "To everything there is a season, and a time to every purpose under the heaven." (Koheles 3:1)
 * This utility tracks the exact nanosecond duration of our creation stages, 
 * revealing bottlenecks and proving the blazing speed of the Awtsmoos Engine.
 */
export default class TimeTracker {
    static marks = new Map();

    /**
     * @function start
     * @description Marks the beginning of a temporal epoch.
     */
    static start(processName) {
        this.marks.set(processName, performance.now());
        console.log(`%cB"H - ⏱️ [${processName}] Epoch Commenced.`, 'color: #ffd700; font-weight: bold;');
    }

    /**
     * @function log
     * @description Logs a step within an epoch, showing elapsed time.
     */
    static log(processName, stepName) {
        const start = this.marks.get(processName);
        if (!start) return;
        const elapsed = (performance.now() - start).toFixed(2);
        console.log(`B"H - ⏳ [${processName}] +${elapsed}ms : ${stepName}`);
    }

    /**
     * @function finish
     * @description Closes the epoch and logs total duration.
     */
    static finish(processName, finalMessage = "Complete") {
        const start = this.marks.get(processName);
        if (!start) return;
        const total = (performance.now() - start).toFixed(2);
        console.log(`%cB"H - 🏁 [${processName}] EPOCH CONCLUDED in ${total}ms : ${finalMessage}`, 'color: #00ffed; font-weight: bold;');
        this.marks.delete(processName);
    }
}
