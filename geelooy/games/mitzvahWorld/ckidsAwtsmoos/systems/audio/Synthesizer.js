
/**
 * B"H
 * @module Synthesizer
 * @description
 * Takes the raw data blueprints and shapes the oscillators, envelopes, and filters.
 */
export default class Synthesizer {
    static ctx = null;
    static master = null;

    static setContext(context, masterGain) {
        this.ctx = context;
        this.master = masterGain;
    }

    /**
     * Interprets a JSON sound blueprint into audio nodes.
     */
    static manifest(data, options = {}) {
        if (!this.ctx) return;

        const time = this.ctx.currentTime;
        const duration = data.duration || 0.5;
        const volume = (options.volume !== undefined ? options.volume : 1.0) * (data.volume || 1.0);
        
        // Create an envelope for this specific sound
        const gainNode = this.ctx.createGain();
        gainNode.connect(this.master);
        
        // Envelope: Attack, Decay, Sustain, Release
        gainNode.gain.setValueAtTime(0, time);
        gainNode.gain.linearRampToValueAtTime(volume, time + (data.attack || 0.05));
        gainNode.gain.exponentialRampToValueAtTime(0.01, time + duration);
        
        if (data.type === "noise") {
            this._playNoise(data, gainNode, time, duration);
        } else {
            this._playOscillator(data, gainNode, time, duration, options);
        }
    }

    static _playOscillator(data, outputNode, time, duration, options) {
        const osc = this.ctx.createOscillator();
        osc.type = data.type || 'sine'; // sine, square, sawtooth, triangle
        
        const pitchMod = options.pitch || 1.0;
        const freqStart = (data.frequencyStart || 440) * pitchMod;
        const freqEnd = (data.frequencyEnd || freqStart) * pitchMod;

        osc.frequency.setValueAtTime(freqStart, time);
        
        if (data.frequencySweep === 'exponential') {
            osc.frequency.exponentialRampToValueAtTime(Math.max(1, freqEnd), time + duration);
        } else {
            osc.frequency.linearRampToValueAtTime(freqEnd, time + duration);
        }

        osc.connect(outputNode);
        osc.start(time);
        osc.stop(time + duration);
    }

    static _playNoise(data, outputNode, time, duration) {
        // Create a buffer of white noise
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const channelData = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            channelData[i] = Math.random() * 2 - 1;
        }

        const noiseSrc = this.ctx.createBufferSource();
        noiseSrc.buffer = buffer;
        
        // Optional Filter (e.g. for low thuds or high hisses)
        if (data.filterType) {
            const filter = this.ctx.createBiquadFilter();
            filter.type = data.filterType; // lowpass, highpass, bandpass
            filter.frequency.value = data.filterFreq || 1000;
            noiseSrc.connect(filter);
            filter.connect(outputNode);
        } else {
            noiseSrc.connect(outputNode);
        }

        noiseSrc.start(time);
    }
}
