/*
ב"ה
B"H
*/
import { dom } from './ui_helpers.js';

export function getSettings() {
    const settings = {};
    
    // Collect standard inputs
    document.querySelectorAll('[id]').forEach(el => {
        if (el.type === 'checkbox') {
            settings[el.id] = el.checked;
        } else if (el.type !== 'file' && !el.readOnly && el.value !== undefined && el.tagName !== 'TEXTAREA') {
            settings[el.id] = el.value;
        }
    });

    // Handle Randomized Control Groups
    document.querySelectorAll('.control-group[data-control-name]').forEach(group => {
        const name = group.dataset.controlName;
        const input = group.querySelector('input');
        const isRandom = group.classList.contains('randomize-active');
        
        if (isRandom) {
            const minEl = group.querySelector('.rand-min');
            const maxEl = group.querySelector('.rand-max');
            const step = input.step || 1;
            const isFloat = step < 1;
            
            settings[name] = { 
                randomize: true, 
                min: parseFloat(minEl ? minEl.value : 0), 
                max: parseFloat(maxEl ? maxEl.value : 100),
                isFloat: isFloat,
                type: input.type
            };
        } else {
            settings[name] = (input.type === 'range' || input.type === 'number') 
                ? parseFloat(input.value) 
                : input.value;
        }
    });
    
    return settings;
}

export function resolveSettings(settings) {
    // For local logic, we mostly pass through, 
    // but useful if we need to resolve randomization immediately on main thread (usually done in worker)
    return settings; 
}

export async function getCaptionData(appState) {
    const duration = parseFloat(document.getElementById('captionDuration').value) || 2.5;
    
    let primary = [];
    let translation = [];

    // Parse Helper
    const parseSimple = (text) => text.trim() ? text.split(/\n\s*\n/).map((t,i) => ({ 
        startTime: i*duration, 
        endTime: (i+1)*duration, 
        text: t.trim() 
    })) : [];

    const parseSRT = (srt) => {
        const caps = []; 
        if(!srt) return []; 
        srt.trim().replace(/\r/g, '').split(/\n\n/).forEach(b => { 
            const l = b.split('\n'); 
            if(l.length < 2) return; 
            const m = l[1]?.match(/(\d{2}):(\d{2}):(\d{2})[,.](\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2})[,.](\d{3})/); 
            const t = l.slice(2).join('\n').trim(); 
            if (m&&t){ 
                const p = (h,m,s,ms) => parseInt(h,10)*3600+parseInt(m,10)*60+parseInt(s,10)+parseInt(ms,10)/1000; 
                caps.push({startTime:p(m[1],m[2],m[3],m[4]), endTime:p(m[5],m[6],m[7],m[8]), text:t});
            }
        }); 
        return caps; 
    };

    if (dom.captionSource.value === 'srt') {
        primary = parseSRT(appState.srtCaptions.main);
        if (document.getElementById('dualCaptionToggle').checked) {
            translation = parseSRT(appState.srtCaptions.translation);
        }
    } else {
        primary = parseSimple(dom.mainCaptions.value);
        if (document.getElementById('dualCaptionToggle').checked) {
            translation = parseSimple(dom.translationCaptions.value);
        }
    }

    // Audio Buffer
    let plainAudioBuffer = null;
    const aFile = document.getElementById('audioFile').files[0];
    if (aFile) {
        try {
            const ac = new (window.AudioContext || window.webkitAudioContext)();
            const ab = await ac.decodeAudioData(await aFile.arrayBuffer());
            plainAudioBuffer = { 
                channels: [ab.getChannelData(0)], // Send mono for waveform visualization
                sampleRate: ab.sampleRate, 
                duration: ab.duration 
            };
            ac.close();
        } catch(e) {
            console.error("Audio Decode Error", e);
        }
    }

    return { primary, translation, plainAudioBuffer };
}