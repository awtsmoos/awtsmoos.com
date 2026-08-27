//B"H

import { SCALES } from './constants.js';

export class AudioSynth {
  constructor() {
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.enabled = true;
    this.sequencerTime = 0;
    this.noteIndex = 0;
  }

  resume() {
    if (this.ctx.state === 'suspended') this.ctx.resume();
  }

  playMusic(combo, timeScale) {
      if(!this.enabled || this.ctx.state === 'suspended') return;
      
      const currentTime = this.ctx.currentTime;
      if(currentTime < this.sequencerTime) return;
      
      const beatLen = Math.max(0.1, 0.25 - (combo * 0.002));
      this.sequencerTime = currentTime + beatLen / timeScale;
      
      if(Math.random() > 0.3) {
          const scale = SCALES.MINOR_PENT;
          const r = Math.random();
          let offset = 0;
          if(r < 0.3) offset = -1;
          else if(r > 0.7) offset = 1;
          
          this.noteIndex = (this.noteIndex + offset + scale.length) % scale.length;
          const freq = scale[this.noteIndex];
          const octave = combo > 50 ? 2 : (combo > 20 ? 1 : 0.5);
          
          this.playNote(freq * octave, beatLen * 0.8, 'sine');
      }
      
      if(this.noteIndex % 4 === 0) {
          this.playNote(SCALES.MINOR_PENT[0] * 0.25, beatLen * 2, 'triangle');
      }
  }

  playNote(freq, dur, type='sine') {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t);
      
      gain.gain.setValueAtTime(0.05, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + dur);
  }

  play(type) {
    if (!this.enabled) return;
    this.resume();

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    if (type === 'shoot') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, t);
      osc.frequency.exponentialRampToValueAtTime(100, t + 0.1);
      gain.gain.setValueAtTime(0.1, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
      osc.start(t);
      osc.stop(t + 0.1);
    } 
    else if (type === 'explosion') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(100, t);
      osc.frequency.exponentialRampToValueAtTime(10, t + 0.3);
      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
      osc.start(t);
      osc.stop(t + 0.3);
    }
    else if (type === 'hit') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(200, t);
      osc.frequency.exponentialRampToValueAtTime(50, t + 0.05);
      gain.gain.setValueAtTime(0.05, t);
      gain.gain.linearRampToValueAtTime(0, t + 0.05);
      osc.start(t);
      osc.stop(t + 0.05);
    }
    else if (type === 'powerup') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, t);
      osc.frequency.linearRampToValueAtTime(1200, t + 0.2);
      gain.gain.setValueAtTime(0.1, t);
      gain.gain.linearRampToValueAtTime(0, t + 0.2);
      osc.start(t);
      osc.stop(t + 0.2);
    }
    else if (type === 'dash') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(300, t);
      osc.frequency.linearRampToValueAtTime(600, t + 0.1);
      gain.gain.setValueAtTime(0.1, t);
      gain.gain.linearRampToValueAtTime(0, t + 0.1);
      osc.start(t);
      osc.stop(t + 0.1);
    }
    else if (type === 'split') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(600, t);
        osc.frequency.exponentialRampToValueAtTime(300, t + 0.2);
        gain.gain.setValueAtTime(0.1, t);
        gain.gain.linearRampToValueAtTime(0, t + 0.2);
        osc.start(t);
        osc.stop(t + 0.2);
    }
    else if (type === 'bitul') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(100, t);
        osc.frequency.linearRampToValueAtTime(50, t + 0.5);
        gain.gain.setValueAtTime(0.05, t);
        gain.gain.linearRampToValueAtTime(0, t + 0.5);
        osc.start(t);
        osc.stop(t + 0.5);
    }
    else if (type === 'ascend') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, t);
        osc.frequency.linearRampToValueAtTime(880, t + 1.0);
        gain.gain.setValueAtTime(0.0, t);
        gain.gain.linearRampToValueAtTime(0.3, t + 0.5);
        gain.gain.linearRampToValueAtTime(0.0, t + 1.0);
        osc.start(t);
        osc.stop(t + 1.0);
    }
    else if (type === 'time_slow') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, t);
        osc.frequency.linearRampToValueAtTime(100, t + 0.5);
        gain.gain.setValueAtTime(0.1, t);
        gain.gain.linearRampToValueAtTime(0.0, t + 0.5);
        osc.start(t);
        osc.stop(t + 0.5);
    }
    else if (type === 'shofar') {
        osc.type = 'sawtooth';
        // Simple Tekiah
        osc.frequency.setValueAtTime(200, t);
        osc.frequency.linearRampToValueAtTime(300, t + 1.5);
        osc.frequency.exponentialRampToValueAtTime(400, t + 2.0);
        
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.2, t + 0.1);
        gain.gain.linearRampToValueAtTime(0.2, t + 1.5);
        gain.gain.linearRampToValueAtTime(0, t + 2.0);
        
        osc.start(t);
        osc.stop(t + 2.0);
    }
    else if (type === 'redeem') {
        // Harmonic Chord
        [261.63, 329.63, 392.00].forEach(f => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(f, t);
            gain.gain.setValueAtTime(0.1, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 1.5);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(t);
            osc.stop(t + 1.5);
        });
    }
  }
}
