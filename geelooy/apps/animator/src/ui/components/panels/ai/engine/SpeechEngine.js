// B"H
export class SpeechEngine {
  constructor(inputEl, voiceBtnEl, statusEl) {
    this.input = inputEl;
    this.voiceBtn = voiceBtnEl;
    this.status = statusEl;
    this.recognition = null;
    this.isRecording = false;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';
      this.recognition.onstart = () => {
        this.isRecording = true;
        if (this.voiceBtn) { this.voiceBtn.style.background = 'var(--accent-warn)'; this.voiceBtn.innerHTML = '🛑'; }
        if (this.status) this.status.innerText = 'Listening...';
      };
      this.recognition.onresult = (event) => {
        let final = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) final += event.results[i][0].transcript;
        }
        if (final && this.input) this.input.value += (this.input.value ? ' ' : '') + final;
      };
      this.recognition.onerror = (event) => {
        if (this.status) this.status.innerText = 'Error: ' + event.error;
        this.stopRecording();
      };
      this.recognition.onend = () => this.stopRecording();
    } else {
      if (this.voiceBtn) this.voiceBtn.style.display = 'none';
    }
  }

  stopRecording() {
    if (!this.isRecording) return;
    this.isRecording = false;
    if (this.recognition) this.recognition.stop();
    if (this.voiceBtn) { this.voiceBtn.style.background = 'var(--bg-surface)'; this.voiceBtn.innerHTML = '🎤'; }
    if (this.status) this.status.innerText = '';
  }

  toggle() {
    if (!this.recognition) return;
    if (this.isRecording) this.stopRecording();
    else this.recognition.start();
  }
}