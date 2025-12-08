/* B"H */
import { DOM } from './config.js';

export function getSettings() {
    const settings = {};
    
    // 1. Standard Inputs
    // Scan all IDs in the controls area
    if (DOM.controlsDiv) {
        DOM.controlsDiv.querySelectorAll('[id]').forEach(el => {
            if (el.type === 'checkbox') {
                settings[el.id] = el.checked;
            } else if (el.type !== 'file' && el.value !== undefined) {
                // Parse numbers for range/number inputs
                if (el.type === 'range' || el.type === 'number') {
                    settings[el.id] = parseFloat(el.value) || 0;
                } else {
                    settings[el.id] = el.value;
                }
            }
        });
    }

    // 2. Randomized Groups
    document.querySelectorAll('.control-group[data-control-name]').forEach(group => {
        const name = group.dataset.controlName;
        const input = group.querySelector('input');
        const isRandom = group.classList.contains('randomize-active');
        
        if (isRandom) {
            settings[name] = { 
                randomize: true, 
                // For a real implementation, you'd have min/max inputs in the UI
                // Here we mock reasonable defaults or read hidden inputs if you added them
                min: 0, 
                max: 100, 
                isFloat: (input.step && input.step < 1)
            };
        } else {
            // Already handled by standard loop, but ensures specific overrides
            settings[name] = (input.type === 'number' || input.type === 'range') 
                ? parseFloat(input.value) 
                : input.value;
        }
    });

    return settings;
}

export async function getCaptionData() {
    const duration = parseFloat(DOM.captionDuration ? DOM.captionDuration.value : 2.5);
    
    // Helper: Parse text block
    const parseSimple = (text) => text.trim() ? text.split(/\n\s*\n/).map((t, i) => ({
        startTime: i * duration,
        endTime: (i + 1) * duration,
        text: t.trim()
    })) : [];

    // Helper: Parse SRT
    const parseSRT = (srtText) => {
        const caps = [];
        if (!srtText) return [];
        srtText.replace(/\r/g, '').split(/\n\n/).forEach(block => {
            const lines = block.split('\n');
            if (lines.length < 2) return;
            // Regex to match timestamp: 00:00:00,000 --> 00:00:02,000
            const m = lines[1]?.match(/(\d{2}):(\d{2}):(\d{2})[,.](\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2})[,.](\d{3})/);
            const text = lines.slice(2).join('\n').trim();
            if (m && text) {
                const toSec = (h,m,s,ms) => parseInt(h)*3600 + parseInt(m)*60 + parseInt(s) + parseInt(ms)/1000;
                caps.push({
                    startTime: toSec(m[1], m[2], m[3], m[4]),
                    endTime: toSec(m[5], m[6], m[7], m[8]),
                    text
                });
            }
        });
        return caps;
    };

    const isSrt = DOM.captionSource && DOM.captionSource.value === 'srt';
    const isDual = DOM.dualCaptionToggle && DOM.dualCaptionToggle.checked;

    let primary = [], translation = [];

    if (isSrt) {
        // Read from file inputs (async)
        if (DOM.srtFile.files[0]) {
            const txt = await DOM.srtFile.files[0].text();
            primary = parseSRT(txt);
        }
        if (isDual && DOM.translationSrtFile.files[0]) {
            const txt = await DOM.translationSrtFile.files[0].text();
            translation = parseSRT(txt);
        }
    } else {
        primary = parseSimple(DOM.mainCaptions.value);
        if (isDual) translation = parseSimple(DOM.translationCaptions.value);
    }

    // Audio Processing
    let plainAudioBuffer = null;
    if (DOM.audioFile && DOM.audioFile.files[0]) {
        try {
            const ac = new (window.AudioContext || window.webkitAudioContext)();
            const ab = await ac.decodeAudioData(await DOM.audioFile.files[0].arrayBuffer());
            plainAudioBuffer = {
                channels: [ab.getChannelData(0)], // Send Mono for visualizer
                sampleRate: ab.sampleRate,
                duration: ab.duration
            };
            ac.close();
        } catch (e) {
            console.error("Audio Decode Error:", e);
        }
    }

    return { primary, translation, plainAudioBuffer };
}

export async function prepareBitmaps() {
    // Load fresh bitmaps from FileInputs
    const bgFile = DOM.backgroundImageInput?.files[0];
    const portalFileList = DOM.portalImagesInput?.files;

    let bgBitmap = null;
    if (bgFile) bgBitmap = await createImageBitmap(bgFile);

    const portalBitmaps = [];
    if (portalFileList && portalFileList.length > 0) {
        for (const file of Array.from(portalFileList)) {
            portalBitmaps.push(await createImageBitmap(file));
        }
    }

    // Prepare Array: [BG, ...Portals]
    const bitmaps = [bgBitmap, ...portalBitmaps];
    
    // Filter non-nulls for transfer
    const transferables = bitmaps.filter(b => b instanceof ImageBitmap);

    return { bitmaps, transferables };
}