//B"H
// modules/captions.js

export function parseInputData(text) {
    if (!text) return [];
    text = text.trim();
    
    // Try JSON
    if (text.startsWith('[') || text.startsWith('{')) {
        try {
            return JSON.parse(text);
        } catch(e) {
            // Not valid JSON, try VTT
        }
    }
    
    // Try WebVTT
    if (text.includes('-->')) {
        return parseWebVTT(text);
    }
    
    throw new Error("UNKNOWN FORMAT");
}

function parseWebVTT(vtt) {
    const lines = vtt.split('\n');
    const caps = [];
    let current = null;
    
    lines.forEach(line => {
        line = line.trim();
        if(!line) return;
        if(line.startsWith('WEBVTT')) return;
        
        // 00:00:00.000 --> 00:00:05.000
        const timeMatch = line.match(/(\d{2}:)?\d{2}:\d{2}\.\d{3} --> (\d{2}:)?\d{2}:\d{2}\.\d{3}/);
        
        if (timeMatch) {
            if (current) caps.push(current);
            const [startStr, endStr] = line.split('-->').map(s => s.trim());
            current = {
                start: parseTime(startStr),
                end: parseTime(endStr),
                text: '',
                translation: ''
            };
        } else if (current) {
            current.text += (current.text ? ' ' : '') + line;
        }
    });
    
    if (current) caps.push(current);
    return caps;
}

function parseTime(t) {
    const parts = t.split(':');
    let s = 0;
    if (parts.length === 3) {
        s += parseFloat(parts[0]) * 3600;
        s += parseFloat(parts[1]) * 60;
        s += parseFloat(parts[2]);
    } else {
        s += parseFloat(parts[0]) * 60;
        s += parseFloat(parts[1]);
    }
    return s;
}
