
/* B"H */
// piano/modules/audio.js

export const AudioState = {
    context: null,
    masterGain: null,
    compressor: null,
    mediaStreamDestination: null,
    convolver: null,
    wetGain: null,
    lfo: null,
    microphoneSource: null,
    microphoneGain: null,
    micPlaybackGain: null,
    hiddenAudioProxy: null
};

export function initAudio() {
    try {
        AudioState.context = new (window.AudioContext || window.webkitAudioContext)({
            latencyHint: 'interactive',
            sampleRate: 44100
        });
        AudioState.mediaStreamDestination = AudioState.context.createMediaStreamDestination();

        // Hidden proxy for mobile
        AudioState.hiddenAudioProxy = document.createElement('audio');
        AudioState.hiddenAudioProxy.setAttribute('playsinline', 'true');
        AudioState.hiddenAudioProxy.setAttribute('loop', 'true');
        AudioState.hiddenAudioProxy.style.display = 'none';
        document.body.appendChild(AudioState.hiddenAudioProxy);

        // Master Chain
        AudioState.masterGain = AudioState.context.createGain();
        AudioState.compressor = AudioState.context.createDynamicsCompressor();
        
        // Mastering settings
        AudioState.compressor.threshold.value = -16;
        AudioState.compressor.knee.value = 25;
        AudioState.compressor.ratio.value = 10;
        AudioState.compressor.attack.value = 0.003;
        AudioState.compressor.release.value = 0.25;

        AudioState.masterGain.connect(AudioState.compressor);
        AudioState.compressor.connect(AudioState.context.destination);
        AudioState.compressor.connect(AudioState.mediaStreamDestination);

        setupReverb();
        setupLFO();

        if (AudioState.context.state === 'suspended') AudioState.context.resume();
        return true;
    } catch (e) {
        console.error("Audio init failed", e);
        return false;
    }
}

function setupReverb() {
    AudioState.convolver = AudioState.context.createConvolver();
    AudioState.wetGain = AudioState.context.createGain();
    AudioState.wetGain.gain.value = 0;
    AudioState.convolver.connect(AudioState.wetGain);
    AudioState.wetGain.connect(AudioState.masterGain);

    const rate = AudioState.context.sampleRate;
    const length = rate * 1.5;
    const decay = 2.5;
    const buffer = AudioState.context.createBuffer(2, length, rate);
    for (let c = 0; c < 2; c++) {
        const data = buffer.getChannelData(c);
        for (let i = 0; i < length; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
        }
    }
    AudioState.convolver.buffer = buffer;
}

function setupLFO() {
    AudioState.lfo = {
        osc: AudioState.context.createOscillator(),
        gain: AudioState.context.createGain()
    };
    AudioState.lfo.osc.type = 'sine';
    AudioState.lfo.osc.connect(AudioState.lfo.gain);
    AudioState.lfo.osc.start();
}
