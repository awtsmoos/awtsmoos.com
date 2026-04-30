
// B"H
/**
 * @class AudioPlayerSignal
 * @description
 * 📡 THE VOICE OF THE ANGEL 📡
 * 
 * Creates the JSON payload instructing the Main Thread to synthesize audio.
 */
export default class AudioPlayerSignal {
    static generate(blueprint) {
        return {
            type: "PLAY_AUDIO",
            blueprint: blueprint
        };
    }
}
