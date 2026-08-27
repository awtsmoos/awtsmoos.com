/*
ב"ה
B"H
*/

self.utils = {};
self.utils.MIN_SEGMENT = 1e-6;

self.utils.createTimeEvents = function(captionData, audioBuffer) {
    const timeSet = new Set([0]);
    [...captionData.primary, ...captionData.translation].forEach(cap => {
        timeSet.add(cap.startTime);
        timeSet.add(cap.endTime);
    });

    let lastTime = 0;
    if (timeSet.size > 1) lastTime = Math.max(...timeSet);
    if (audioBuffer && audioBuffer.duration > lastTime) {
        lastTime = audioBuffer.duration;
        timeSet.add(lastTime);
    }

    const events = Array.from(timeSet).sort((a, b) => a - b);
    return {
        timeEvents: events.filter((t, i) => i === 0 || t > events[i - 1] + 1e-6),
        lastTime
    };
};

self.utils.findCaption = function(time, captions) {
    return captions.find(c => time >= c.startTime && time < c.endTime);
};

self.utils.resolveSettings = function(settings, isDynamic = false) {
    const res = {};
    for (const key in settings) {
        const val = settings[key];
        if (val && typeof val === 'object' && val.randomize) {
            if (val.type === 'color') {
                res[key] = '#' + ('000000' + Math.floor(Math.random() * 0xFFFFFF).toString(16)).slice(-6);
            } else {
                const min = Math.min(val.min, val.max);
                const max = Math.max(val.min, val.max);
                res[key] = val.isFloat ? (min + Math.random() * (max - min)) : Math.floor(min + Math.random() * (max - min + 1));
            }
        } else {
            res[key] = (val && typeof val === 'object') ? val.value : val;
        }
    }
    if (isDynamic) res.time = performance.now();
    
    // COMPATIBILITY FIX: Replaced ?? with standard checks
    res.enableTextGlitch = (res.enableTextGlitch !== undefined) ? res.enableTextGlitch : false;
    res.enableWaveform = (res.enableWaveform !== undefined) ? res.enableWaveform : false;
    res.cinematicBarHeight = (res.cinematicBarHeight !== undefined) ? res.cinematicBarHeight : 0; 
    res.particleSpeed = (res.particleSpeed !== undefined) ? res.particleSpeed : 1.0;
    res.enableVCRStamp = (res.enableVCRStamp !== undefined) ? res.enableVCRStamp : false;
    
    return res;
};