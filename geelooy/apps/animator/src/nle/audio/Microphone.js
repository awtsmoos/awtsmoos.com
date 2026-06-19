// B"H

/**
 * @class Microphone
 * @description Captures microphone audio into a Blob while failing safely when
 * device APIs or permissions are unavailable.
 */
export class Microphone {
  constructor() {
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.stream = null;
    this.error = '';
  }

  /**
   * Requests permission to open the channel of hearing.
   *
   * @returns {Promise<boolean>} True when access is granted.
   */
  async requestAccess() {
    if (!navigator?.mediaDevices?.getUserMedia) {
      this.error = 'Microphone capture is unavailable on this device.';
      return false;
    }

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.error = '';
      return true;
    } catch (error) {
      this.error = error?.message || 'Microphone permission was denied.';
      return false;
    }
  }

  /**
   * Begins gathering auditory sparks.
   *
   * @returns {{ok:boolean,error?:string}} Start result.
   */
  startRecording() {
    if (!this.stream) return { ok: false, error: 'Microphone stream is not initialized.' };
    if (typeof MediaRecorder === 'undefined') return { ok: false, error: 'MediaRecorder is unavailable in this browser.' };

    this.audioChunks = [];

    try {
      this.mediaRecorder = new MediaRecorder(this.stream);
    } catch (error) {
      return { ok: false, error: `Microphone recording could not start: ${error?.message || error}` };
    }

    this.mediaRecorder.ondataavailable = event => {
      if (event.data.size > 0) this.audioChunks.push(event.data);
    };

    this.mediaRecorder.start();
    return { ok: true };
  }

  /**
   * Seals the gathering and returns the unified auditory vessel.
   *
   * @returns {Promise<{blob: Blob, url: string} | null>} Recorded audio.
   */
  stopRecording() {
    return new Promise(resolve => {
      if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') return resolve(null);

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        resolve({ blob: audioBlob, url: audioUrl });
      };

      this.mediaRecorder.stop();
    });
  }

  /**
   * Releases hardware tracks.
   *
   * @returns {void}
   */
  release() {
    if (!this.stream) return;
    this.stream.getTracks().forEach(track => track.stop());
    this.stream = null;
  }
}
