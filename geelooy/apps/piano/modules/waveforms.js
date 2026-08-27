
/* B"H */
// piano/modules/waveforms.js

export const ALL_WAVEFORMS = [
    'triangle', 'sine', 'sawtooth', 'square',
    'wet-electric-keys', 'pulse', 'detuned-saw', 'wobble', 'crystalline', 'tonewheel',
    'super-fm', 'pluck', 'formant', 'rave-lead', 'hard-bass',
    'acid-pulse', 'hyper-saw', 'growl-bass', 'neuro-bass',
    'trance-gate', 'hardstyle', 'reese-bass', 'digital-hoover',
    'bell-ep', 'organ-drawbar', 'metal-hit', 'soft-pad',
    'sub-osc', 'fifths-saw', 'shimmer-sine',
    // New Sounds
    'violin', 'flute', '8-bit', 'chiptune', 'angel', 'demon', 
    'drops', 'vox', 'harmonica', 'accordion', 'sitar', 'koto', 'steel-drum',
    'brass-ensemble', 'clarinette'
];

export const customWaves = {};

export function createCustomWaves(audioContext) {
    const n = 4096;
    const real = new Float32Array(n).fill(0);
    const imag = {};

    ALL_WAVEFORMS.forEach(name => imag[name] = new Float32Array(n).fill(0));

    for (let i = 1; i < n; i++) {
        // --- EXISTING WAVES ---
        if (i % 2 !== 0) imag.pulse[i] = 4 / (Math.PI * i);
        imag['detuned-saw'][i] = (2 / (Math.PI * i)) * (1 + 0.5 * Math.cos(20 * i / n));
        imag.wobble[i] = (1 / i) * (0.3 + 0.7 * Math.sin(100 * i / n) * Math.sin(30 * i / n));
        
        const freq = i * (audioContext.sampleRate / (2 * n));
        imag.formant[i] = (Math.exp(-Math.pow((freq - 700) / 150, 2)) + 0.5 * Math.exp(-Math.pow((freq - 1200) / 200, 2))) / (i * 0.5 + 1);
        
        for (let k = 1; k <= 10; k++) imag['rave-lead'][i] += (1 / (i * k)) * 0.1;
        if (i % 2 !== 0) imag['hard-bass'][i] = (1 / (i * i)) + 0.2 / i;
        if (i % 2 !== 0) imag['acid-pulse'][i] = 0.8 / i + 0.2 / (i * 1.5);
        for (let k = 0; k < 7; k++) imag['hyper-saw'][i] += (1 / (i + k * 0.1)) * (2 / (Math.PI * (i + k * 0.1)));
        imag['growl-bass'][i] = (1 / i) * Math.sin((i * Math.PI) / 2.5 + Math.sin(i * 0.05));
        imag['neuro-bass'][i] = (1 / i) * (0.4 * Math.sin(i * 0.1) + 0.6 * Math.sin(i * 0.03));
        for (let k = 1; k <= 8; k += 2) imag['trance-gate'][i] += (1 / (i * k)) * (0.5 + 0.5 * Math.cos(i * 0.01));
        if (i % 2 !== 0) imag['hardstyle'][i] = (1 / i) + (0.5 / (i * i)) * Math.sin(i * 0.01);
        for (let k = 0; k < 2; k++) imag['reese-bass'][i] += (1 / (i + k * 0.05)) * (2 / (Math.PI * (i + k * 0.05)));
        for (let k = 1; k < 8; k++) imag['digital-hoover'][i] += 1 / (i * k * 1.02);

        // Pre-defined harmonic weights
        if(i===1) {
            imag.crystalline[1] = 1; imag.tonewheel[1] = 1; imag.pluck[1] = 1; imag['super-fm'][1] = 0.8;
            imag['bell-ep'][1] = 2.0; imag['organ-drawbar'][1] = 0.8; imag['metal-hit'][1] = 1.2;
            imag['sub-osc'][1] = 1.0; imag['fifths-saw'][1] = 1.0; imag['shimmer-sine'][1] = 2.0;
            imag['wet-electric-keys'][1] = 1.65;
        }

        // --- EXISTING EXTENSIONS ---
        imag.crystalline[4] = 0.5; imag.crystalline[9] = 0.3; imag.crystalline[16] = 0.2;
        imag.tonewheel[2] = 0.8; imag.tonewheel[3] = 0.6; imag.tonewheel[4] = 0.4; imag.tonewheel[6] = 0.2;
        imag.pluck[2] = 0.1; imag.pluck[3] = 0.5; imag.pluck[4] = 0.1;
        imag['super-fm'][3] = 0.6; imag['super-fm'][5] = 0.4; imag['super-fm'][7] = 0.2;
        if (i === 4 || i === 7 || i === 12) imag['bell-ep'][i] = 1 / (i * 0.5);
        if (i === 2) imag['organ-drawbar'][i] = 0.6; if (i === 4) imag['organ-drawbar'][i] = 0.4;
        if (i === 3 || i === 5 || i === 10 || i === 11) imag['metal-hit'][i] = 1 / (i * 0.8);
        imag['soft-pad'][i] = (1 / i) * Math.exp(-i / 15);
        if (i === 3) imag['sub-osc'][i] = 0.5; if (i === 5) imag['sub-osc'][i] = 0.1;
        if (i % 3 === 0 && i !== 0) imag['fifths-saw'][i] = (2 / (Math.PI * i)) * 0.7; 
        if (i === 3 || i === 5 || i === 7 || i === 11) imag['shimmer-sine'][i] = 1 / (i * 0.5);
        if (i === 2) imag['wet-electric-keys'][i] = 0.34;
        if (i === 3) imag['wet-electric-keys'][i] = 0.82;
        if (i === 4) imag['wet-electric-keys'][i] = 0.52;
        if (i === 6) imag['wet-electric-keys'][i] = 0.31;
        if (i === 9 || i === 13) imag['wet-electric-keys'][i] = 0.22;
        if (i > 16 && i < 42) imag['wet-electric-keys'][i] += (0.13 / i) * (1 + Math.sin(i * 0.7));

        // --- NEW SOUNDS ---
        
        // Violin: Sawtooth-like but with specific formants boosted
        imag['violin'][i] = (2 / (Math.PI * i)); 
        if(i > 5 && i < 15) imag['violin'][i] *= 1.5; // Body resonance
        
        // Flute: Sine with breath noise (high random harmonics)
        if (i === 1) imag['flute'][i] = 1.0;
        if (i === 2) imag['flute'][i] = 0.3;
        if (i > 10) imag['flute'][i] = (Math.random() * 0.1) / i; // Breath

        // 8-Bit: Staircase approximation logic (filtering high harmonics abruptly)
        if (i < 16 && i % 2 !== 0) imag['8-bit'][i] = 4 / (Math.PI * i); 

        // Chiptune: High pulse with 12.5% duty cycle feel
        // Simple approximation: strong harmonics at specific intervals
        if (i % 8 !== 0) imag['chiptune'][i] = 2 / (Math.PI * i);

        // Angel: Very high harmonics, airy, no mid-lows except fundamental
        if (i === 1) imag['angel'][i] = 0.5;
        if (i > 8) imag['angel'][i] = (1/i) * 1.5;

        // Demon: Sub-heavy, detuned saw feel (random phase in calc would help, but here magnitude)
        if (i < 5) imag['demon'][i] = 1 / Math.sqrt(i);
        if (i > 5 && i % 2 !== 0) imag['demon'][i] = 0.5 / i;

        // Drops: Watery, few non-integer harmonics simulated by adjacent bins
        if (i === 1) imag['drops'][i] = 1;
        if (i === 6) imag['drops'][i] = 0.8;
        if (i === 11) imag['drops'][i] = 0.4;

        // Vox: Vocal formants (Ah/Oh)
        // Formants around 500Hz, 1000Hz, 2500Hz. Approximated by bin indices roughly.
        let isFormant = (i > 3 && i < 6) || (i > 15 && i < 20);
        imag['vox'][i] = isFormant ? (2 / (Math.PI * i)) * 2 : (0.1 / i);

        // Harmonica: Odd harmonics strongly decayed
        if (i % 2 !== 0) imag['harmonica'][i] = 1 / Math.pow(i, 1.2);

        // Accordion: Rich saw/square mix
        imag['accordion'][i] = (1/i) * (Math.sin(i) > 0 ? 1 : 0.2);

        // Sitar: Buzzing, metallic
        imag['sitar'][i] = (1/i) * Math.cos(i/3);

        // Koto: Plucked, quick decay in high freq
        if (i === 1) imag['koto'][i] = 1;
        if (i > 1) imag['koto'][i] = Math.exp(-i/4) * Math.cos(i);

        // Steel Drum: Inharmonic partials approx
        if (i===1) imag['steel-drum'][i] = 1;
        if (i===2.4*2) { /* skip, can't do non-integer index */ }
        if (i===2) imag['steel-drum'][i] = 0.6; // Octave
        if (i===5) imag['steel-drum'][i] = 0.3; // Major 3rd + Octave approx

        // Brass Ensemble: Bright Saw
        imag['brass-ensemble'][i] = (1/i);
        if (i > 5 && i < 10) imag['brass-ensemble'][i] *= 1.5;

        // Clarinette: Square-ish (odd harmonics)
        if (i % 2 !== 0) imag['clarinette'][i] = (1/i) * 0.8;
        if (i % 2 === 0) imag['clarinette'][i] = (1/i) * 0.1;
    }

    // Final generation for all custom waves
    Object.keys(imag).forEach(name => {
        // Only create PeriodicWave for non-standard types
        if (!['triangle', 'sine', 'sawtooth', 'square'].includes(name)) {
            customWaves[name] = audioContext.createPeriodicWave(real, imag[name], {
                disableNormalization: true
            });
        }
    });
}
