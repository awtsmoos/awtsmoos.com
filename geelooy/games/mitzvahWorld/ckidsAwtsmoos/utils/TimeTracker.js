
/**
 * B"H
 * @module TimeTracker
 * @description
 * ⏱️ THE MEASURE OF TIME — Silent Observer.
 * 
 * Chapter 9: The Silence of the Infinite.
 * Time is a creation, and like all creations, it must be humbled 
 * before the Essence. This tracker remains in the potential, 
 * recording the steps of manifestation without cluttering the 
 * perception of the soul.
 */
export default class TimeTracker {
    static processes = {};

    static start(processName) {
        this.processes[processName] = {
            start: Date.now(),
            last: Date.now()
        };
        // B"H: silent

    }

    static log(processName, stepName) {
        if (!this.processes[processName]) return;
        const now = Date.now();
        const elapsed = now - this.processes[processName].last;
        this.processes[processName].last = now;
        // B"H: silent

    }

    static finish(processName, finalMessage = "Done.") {
        if (!this.processes[processName]) return;
        const total = Date.now() - this.processes[processName].start;
        delete this.processes[processName];
        // B"H: silent

    }
}
