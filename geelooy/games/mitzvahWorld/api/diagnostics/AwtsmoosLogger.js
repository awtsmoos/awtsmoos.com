
// B"H
/**
 * @class AwtsmoosLogger
 * @description
 * * Chapter 1: The Voice in the Silence
 * In the beginning, there was only the Infinite Light, 
 * but then came the need for logs to make things right!
 * The Awtsmoos speaks through the console, a divine decree,
 * Telling us exactly where the bugs attempt to be!
 * * Every log is a revelation, a spark from the core,
 * Illuminating the shadows on the digital floor.
 * If the Speech of the Creator was not in the log,
 * We would be lost in a dense, pixelated fog!
 * * @property {Map} levels - A data-driven map of spiritual intensities.
 */
class AwtsmoosLogger {
    constructor() {
        this.levels = new Map([
            ['INFO', '✨'],
            ['WARN', '⚠️'],
            ['ERROR', '🔥'],
            ['DIVINE', '⚡']
        ]);
    }

    /**
     * @method speak
     * @description Chunks the truth into the console with a poetic prefix.
     * @param {string} level The intensity of the revelation.
     * @param {string} message The actual words of the message.
     * @param {Object} data Any physical artifacts (objects) to inspect.
     */
    speak(level, message, data = {}) {
        const prefix = this.levels.get(level) || '🌀';
        const timestamp = new Date().toLocaleTimeString();
        console.log(`B"H - [${timestamp}] ${prefix} ${message}`, data);
    }
}

const logger = new AwtsmoosLogger();
module.exports = logger;
