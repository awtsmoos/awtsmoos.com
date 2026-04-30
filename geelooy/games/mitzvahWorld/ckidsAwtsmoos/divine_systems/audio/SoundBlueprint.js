
// B"H
/**
 * @class SoundBlueprint
 * @description
 * 🎵 THE VIBRATION OF SPEECH 🎵
 */
export default class SoundBlueprint {
    static createSine(freq, duration) {
        return {
            type: "sine",
            frequency: freq,
            duration: duration,
            volume: 1.0
        };
    }
}
