
/* B”H */

/**
 * @class SpeechSynth
 * @description
 * The Digital Ruach (Spirit).
 * 
 * RECTIFICATION: If the timeline is being scrubbed, we immediately reject 
 * the promise and cancel the browser's speech queue. The voice only manifests 
 * during true linear time progression.
 */
export class SpeechSynth {
  static speak(text, options = {}) {
    return new Promise((resolve, reject) => {
      if (!('speechSynthesis' in window)) {
        return reject(new Error("The vessel lacks the organ of synthesis."));
      }

      // B"H - MUTE DURING TIME TRAVEL
      if (window.AWTSMOOS_IS_SCRUBBING) {
        window.speechSynthesis.cancel();
        return reject(new Error("Time is fractured. Silence is mandated."));
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.pitch = options.pitch || 1;
      utterance.rate = options.rate || 1;
      utterance.volume = options.volume || 1;

      if (options.voiceURI) {
        const voices = window.speechSynthesis.getVoices();
        const selected = voices.find(v => v.voiceURI === options.voiceURI);
        if (selected) utterance.voice = selected;
      }

      utterance.onend = () => resolve();
      utterance.onerror = (e) => reject(e);

      window.speechSynthesis.speak(utterance);
    });
  }

  static async getVoices() {
    return new Promise((resolve) => {
      let voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        resolve(voices);
      } else {
        window.speechSynthesis.onvoiceschanged = () => {
          resolve(window.speechSynthesis.getVoices());
        };
      }
    });
  }
}
