/*B"H*/

// --- PROFESSIONAL SHEET MUSIC RENDERING ENGINE (COMPLETE & MODULAR) ---

const SCORE_CONFIG = {
    PAGE_WIDTH: 1400,
    STAFF_ROW_HEIGHT: 200, STAFF_TOP_MARGIN: 80, STAFF_LINE_GAP: 15,
    STAFF_LEFT_MARGIN: 40, STAFF_RIGHT_MARGIN: 40,
    NOTE_HEAD_RADIUS_X: 9, NOTE_HEAD_RADIUS_Y: 7, STEM_HEIGHT: 50,
    BEAM_THICKNESS: 6, BEAM_GAP: 8,
    BASE_NOTE_SPACING: 45, // Proportional space for a 16th note
    TITLE_FONT: '48px serif', COMPOSER_FONT: '24px serif',
};

// --- MUSIC THEORY & ANALYSIS HELPERS ---

/**
 * Parses a note string (e.g., "C#4") into a detailed object.
 * This function deciphers the core essence of a note—its name, its place in the great scale of octaves,
 * and any accidental deviation from its pure form, quantifying its unique vibrational identity.
 * @param {string} pitch The note string.
 * @returns {{pitch: string, baseNote: string, octave: number, accidental: string|null, pitchValue: number}}
 */
function getNoteDetails(pitch) {
    const noteName = pitch.slice(0, -1);
    const octave = parseInt(pitch.slice(-1));
    const baseNote = noteName.charAt(0);
    const accidental = noteName.length > 1 ? noteName.charAt(1) : null;
    const pitchValue = octave * 12 + { C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4, F: 5, 'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, B: 11 }[noteName];
    return { pitch, baseNote, octave, accidental, pitchValue };
}

/**
 * Analyzes notes to determine the most likely key signature.
 * It gazes upon the scattered fragments of melody and perceives the underlying harmonic universe,
 * the gravitational center around which all notes orbit, revealing the hidden key that governs their relationship.
 * @param {Array<Object>} notes The array of quantized music items.
 * @returns {{key: string, accidentals: Array<string>}}
 */
function determineKeySignature(notes) {
    const circleOfFifths = {
        'C': [], 'G': ['F#'], 'D': ['F#', 'C#'], 'A': ['F#', 'C#', 'G#'], 'E': ['F#', 'C#', 'G#', 'D#'],
        'B': ['F#', 'C#', 'G#', 'D#', 'A#'], 'F#': ['F#', 'C#', 'G#', 'D#', 'A#', 'E#'],
        'F': ['Bb'], 'Bb': ['Bb', 'Eb'], 'Eb': ['Bb', 'Eb', 'Ab'], 'Ab': ['Bb', 'Eb', 'Ab', 'Db'],
        'Db': ['Bb', 'Eb', 'Ab', 'Db', 'Gb'], 'Gb': ['Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb']
    };
    const accidentalCounts = {};
    notes.forEach(item => {
        if (item.type !== 'note') return;
        const details = getNoteDetails(item.pitch);
        if (details.accidental) {
            const acc = details.baseNote + details.accidental;
            accidentalCounts[acc] = (accidentalCounts[acc] || 0) + 1;
        }
    });
    
    let bestKey = 'C';
    let maxScore = 0;
    for (const [key, accidentals] of Object.entries(circleOfFifths)) {
        let score = 0;
        accidentals.forEach(acc => {
            if (accidentalCounts[acc]) score += accidentalCounts[acc] * 2;
        });
        for (const countedAcc of Object.keys(accidentalCounts)) {
            if (!accidentals.includes(countedAcc)) score--;
        }
        if (score > maxScore) {
            maxScore = score;
            bestKey = key;
        }
    }
    return { key: bestKey, accidentals: circleOfFifths[bestKey] };
}

/**
 * Structures raw note data into measures, chords, and applies accidental rules.
 * This function is the grand architect, taking the linear flow of time and partitioning it into measures,
 * stacking simultaneous sounds into chords, and applying the laws of harmony to each moment.
 * @param {Array<Object>} notes Raw quantized notes.
 * @param {number} beatsPerMeasure The number of beats per measure.
 * @param {Object} keySignature The determined key signature.
 * @returns {Array<Object>} An array of fully structured measures.
 */
function structureMusicData(notes, beatsPerMeasure, keySignature) {
    const measures = [];
    let currentMeasure = { items: [], beats: 0 };
    let measureAccidentals = new Set();

    notes.forEach(item => {
        const beatValue = item.value / (60 / 120);
        if (currentMeasure.beats + beatValue > beatsPerMeasure && currentMeasure.items.length > 0) {
            measures.push(currentMeasure);
            currentMeasure = { items: [], beats: 0 };
            measureAccidentals.clear();
        }

        if (item.type === 'note') {
            const details = getNoteDetails(item.pitch);
            item.details = details;
            const naturalPitch = details.baseNote + details.octave;
            const keyAccidental = keySignature.accidentals.find(a => a.startsWith(details.baseNote));
            item.displayAccidental = null;

            if (details.accidental) {
                const noteWithAcc = details.baseNote + details.accidental;
                if (!keySignature.accidentals.includes(noteWithAcc) && !measureAccidentals.has(item.pitch)) {
                    item.displayAccidental = details.accidental;
                    measureAccidentals.add(item.pitch);
                }
            } else {
                if (keyAccidental && !measureAccidentals.has(naturalPitch)) {
                    item.displayAccidental = '♮';
                    measureAccidentals.add(naturalPitch);
                }
            }
        }
        currentMeasure.items.push(item);
        currentMeasure.beats += beatValue;
    });
    if (currentMeasure.items.length > 0) measures.push(currentMeasure);
    
    measures.forEach(measure => {
        const beatStructure = [];
        let i = 0;
        while (i < measure.items.length) {
            const item = measure.items[i];
            let group = [item];
            for (let j = i + 1; j < measure.items.length; j++) {
                if (measure.items[j].start === item.start) {
                    group.push(measure.items[j]);
                } else { break; }
            }
            if (group[0].type === 'note') {
                group.sort((a,b) => a.details.pitchValue - b.details.pitchValue);
            }
            beatStructure.push(group);
            i += group.length;
        }
        measure.beatStructure = beatStructure;
    });
    return measures;
}

// --- DRAWING PRIMITIVE & COMPOSITE HELPERS ---

function getNoteY(details, yOffset) {
    const noteSteps = { 'C': 0, 'D': 1, 'E': 2, 'F': 3, 'G': 4, 'A': 5, 'B': 6 };
    const step = noteSteps[details.baseNote];
    const y_G4 = yOffset + SCORE_CONFIG.STAFF_LINE_GAP;
    return y_G4 - ((details.octave - 4) * 7 + step - 4) * (SCORE_CONFIG.STAFF_LINE_GAP / 2);
}

function drawStaffSystem(ctx, y) {
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 5; i++) {
        const lineY = y + i * SCORE_CONFIG.STAFF_LINE_GAP;
        ctx.beginPath();
        ctx.moveTo(SCORE_CONFIG.STAFF_LEFT_MARGIN, lineY);
        ctx.lineTo(SCORE_CONFIG.PAGE_WIDTH - SCORE_CONFIG.STAFF_RIGHT_MARGIN, lineY);
        ctx.stroke();
    }
}

function drawClef(ctx, x, y) {
    ctx.font = '80px serif';
    ctx.fillText('𝄞', x, y + SCORE_CONFIG.STAFF_LINE_GAP * 4.5);
    return 60;
}

function drawKeySignature(ctx, x, y, keySig) {
    const sharpPos = [0, 1.5, -0.5, 1, 2.5, 0.5, 2];
    const flatPos = [2, 0.5, 2.5, 1, 3, 1.5, 3.5];
    ctx.font = 'bold 38px serif';
    let width = 0;
    const accidentals = keySig.accidentals;
    if (accidentals.length > 0) {
        const isSharp = accidentals[0].includes('#');
        accidentals.forEach((acc, i) => {
            const posArray = isSharp ? sharpPos : flatPos;
            const accY = (y + 2 * SCORE_CONFIG.STAFF_LINE_GAP) - posArray[i] * SCORE_CONFIG.STAFF_LINE_GAP;
            ctx.fillText(isSharp ? '#' : '♭', x + i * 15, accY);
        });
        width = accidentals.length * 15;
    }
    return width;
}

function drawTimeSignature(ctx, x, y, timeSig) {
    ctx.font = `bold ${SCORE_CONFIG.STAFF_LINE_GAP * 2.8}px serif`;
    ctx.fillText(timeSig.beats, x, y + SCORE_CONFIG.STAFF_LINE_GAP * 1.5);
    ctx.fillText(timeSig.beatType, x, y + SCORE_CONFIG.STAFF_LINE_GAP * 3.5);
    return 30;
}

function drawBarLine(ctx, x, y) {
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + 4 * SCORE_CONFIG.STAFF_LINE_GAP);
    ctx.stroke();
    return 20;
}

function drawNote(ctx, note, x, yOffset, stemDirection) {
    const noteY = getNoteY(note.details, yOffset);
    let stemX = 0;

    ctx.lineWidth = 1;
    if (noteY >= yOffset + 5 * SCORE_CONFIG.STAFF_LINE_GAP) {
        for (let ly = yOffset + 5 * SCORE_CONFIG.STAFF_LINE_GAP; ly <= noteY; ly += SCORE_CONFIG.STAFF_LINE_GAP) {
            ctx.beginPath(); ctx.moveTo(x - 12, ly); ctx.lineTo(x + 12, ly); ctx.stroke();
        }
    } else if (noteY <= yOffset - SCORE_CONFIG.STAFF_LINE_GAP) {
        for (let ly = yOffset - SCORE_CONFIG.STAFF_LINE_GAP; ly >= noteY; ly -= SCORE_CONFIG.STAFF_LINE_GAP) {
            ctx.beginPath(); ctx.moveTo(x - 12, ly); ctx.lineTo(x + 12, ly); ctx.stroke();
        }
    }
    
    if (note.displayAccidental) {
        ctx.font = '28px serif';
        ctx.fillText(note.displayAccidental, x - 22, noteY + 5);
    }

    ctx.beginPath();
    ctx.ellipse(x, noteY, SCORE_CONFIG.NOTE_HEAD_RADIUS_X, SCORE_CONFIG.NOTE_HEAD_RADIUS_Y, Math.PI / 15, 0, 2 * Math.PI);
    const isFilled = note.duration !== 'whole' && note.duration !== 'half';
    ctx.fillStyle = 'black';
    if(isFilled) ctx.fill(); else { ctx.lineWidth=1.5; ctx.stroke(); }
    
    if (note.duration !== 'whole') {
        stemX = stemDirection === 1 ? x + SCORE_CONFIG.NOTE_HEAD_RADIUS_X -1 : x - SCORE_CONFIG.NOTE_HEAD_RADIUS_X + 1;
        const stemYend = noteY - (SCORE_CONFIG.STEM_HEIGHT * stemDirection);
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(stemX, noteY);
        ctx.lineTo(stemX, stemYend);
        ctx.stroke();
        return { stemX, stemYend, noteY };
    }
    return { noteY };
}

function drawRest(ctx, rest, x, yOffset) {
    const middleStaffY = yOffset + 2 * SCORE_CONFIG.STAFF_LINE_GAP;
    ctx.font = 'bold 38px serif';
    ctx.fillStyle = 'black';
    switch (rest.duration) {
        case 'quarter': ctx.fillText('𝄽', x - 8, middleStaffY + 15); break;
        case 'half': ctx.fillRect(x - 8, middleStaffY - 5, 16, 5); break;
        case 'whole': ctx.fillRect(x - 12, yOffset + SCORE_CONFIG.STAFF_LINE_GAP, 24, 5); break;
        case 'eighth': ctx.fillText('𝄾', x - 8, middleStaffY + 8); break;
        case 'sixteenth': ctx.fillText('𝄿', x - 8, middleStaffY + 12); break;
    }
}

function drawFlags(ctx, stemX, stemYend, stemDirection, duration) {
    if (duration !== 'eighth' && duration !== 'sixteenth') return;
    const flagDirection = stemDirection === -1 ? 1 : -1;
    ctx.lineWidth = 2;
    let y_flag_start = stemYend;
    ctx.beginPath();
    ctx.moveTo(stemX, y_flag_start);
    ctx.bezierCurveTo(stemX + 5 * flagDirection, y_flag_start + 10 * stemDirection, stemX + 15 * flagDirection, y_flag_start + 15 * stemDirection, stemX + 20 * flagDirection, y_flag_start + 25 * stemDirection);
    ctx.stroke();
    if (duration === 'sixteenth') {
        y_flag_start += 8 * stemDirection;
        ctx.beginPath();
        ctx.moveTo(stemX, y_flag_start);
        ctx.bezierCurveTo(stemX + 5 * flagDirection, y_flag_start + 10 * stemDirection, stemX + 15 * flagDirection, y_flag_start + 15 * stemDirection, stemX + 20 * flagDirection, y_flag_start + 25 * stemDirection);
        ctx.stroke();
    }
}

function drawBeatGroup(ctx, group, x, yOffset) {
    const midStaffY = yOffset + 2 * SCORE_CONFIG.STAFF_LINE_GAP;
    const furthestNote = group.reduce((furthest, note) => {
        const noteY = getNoteY(note.details, yOffset);
        const furthestY = getNoteY(furthest.details, yOffset);
        return Math.abs(noteY - midStaffY) > Math.abs(furthestY - midStaffY) ? note : furthest;
    });
    const furthestNoteY = getNoteY(furthestNote.details, yOffset);
    const stemDirection = furthestNoteY > midStaffY ? -1 : 1;
    if (group.length > 1) {
        for (let i = 0; i < group.length - 1; i++) {
            const yA = getNoteY(group[i].details, yOffset);
            const yB = getNoteY(group[i + 1].details, yOffset);
            if (Math.abs(yA - yB) < SCORE_CONFIG.STAFF_LINE_GAP - 2) {
                group[i + 1].render_x_offset = SCORE_CONFIG.NOTE_HEAD_RADIUS_X * 2;
                group[i].render_x_offset = 0;
            } else { group[i + 1].render_x_offset = 0; }
        }
    }
    let lastStem = null;
    group.forEach(note => {
        const noteX = x + (stemDirection === 1 ? (note.render_x_offset || 0) : -(note.render_x_offset || 0));
        lastStem = drawNote(ctx, note, noteX, yOffset, stemDirection) || lastStem;
        note.render_x_offset = 0;
    });
    if (group.length === 1 && lastStem) {
        drawFlags(ctx, lastStem.stemX, lastStem.stemYend, stemDirection, group[0].duration);
    }
}

function drawBeamGroup(ctx, groups, x, yOffset, ratio) {
    let notePositions = [];
    let currentX = x;
    groups.forEach(group => {
        const groupWidth = (SCORE_CONFIG.BASE_NOTE_SPACING * 4 * (group[0].value / (60 / 120))) * ratio;
        group.forEach(note => { notePositions.push({ note, x: currentX }); });
        currentX += groupWidth;
    });
    const midStaffY = yOffset + 2 * SCORE_CONFIG.STAFF_LINE_GAP;
    const avgY = notePositions.reduce((sum, pos) => sum + getNoteY(pos.note.details, yOffset), 0) / notePositions.length;
    const stemDirection = avgY > midStaffY ? -1 : 1;
    let stemInfos = notePositions.map(pos => ({ ...drawNote(ctx, pos.note, pos.x, yOffset, stemDirection), note: pos.note }));
    const firstStem = stemInfos[0];
    const lastStem = stemInfos[stemInfos.length - 1];
    let beamY1 = firstStem.stemYend, beamY2 = lastStem.stemYend;
    const slope = (beamY2 - beamY1) / (lastStem.stemX - firstStem.stemX || 1);
    if (Math.abs(slope) > 0.5) { beamY2 = beamY1 + Math.sign(slope) * Math.abs(lastStem.stemX - firstStem.stemX) * 0.5; }
    stemInfos.forEach(info => {
        const beamYatX = beamY1 + (beamY2-beamY1) * ((info.stemX - firstStem.stemX) / (lastStem.stemX - firstStem.stemX || 1));
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(info.stemX, info.noteY);
        ctx.lineTo(info.stemX, beamYatX);
        ctx.stroke();
        info.stemYend = beamYatX;
    });
    ctx.lineWidth = SCORE_CONFIG.BEAM_THICKNESS;
    ctx.beginPath();
    ctx.moveTo(firstStem.stemX, beamY1);
    ctx.lineTo(lastStem.stemX, beamY2);
    ctx.stroke();
    let beamOffset = stemDirection * SCORE_CONFIG.BEAM_GAP;
    for(let i=0; i < stemInfos.length; i++) {
        if (stemInfos[i].note.duration === 'sixteenth') {
            let startIndex = i; let endIndex = i;
            for(let j=i+1; j < stemInfos.length; j++) { if (stemInfos[j].note.duration === 'sixteenth') { endIndex = j; } else { break; } }
            const firstSixteenth = stemInfos[startIndex]; const lastSixteenth = stemInfos[endIndex];
            ctx.beginPath();
            ctx.moveTo(firstSixteenth.stemX, firstSixteenth.stemYend + beamOffset);
            ctx.lineTo(lastSixteenth.stemX, lastSixteenth.stemYend + beamOffset);
            ctx.stroke();
            i = endIndex;
        }
    }
}

function drawMeasure(ctx, measure, x, yOffset, ratio) {
    let currentX = x;
    let beatCount = 0;
    for (let i = 0; i < measure.beatStructure.length; ) {
        const group = measure.beatStructure[i];
        let beamGroup = [];
        const isShortNote = group[0].type === 'note' && (group[0].duration === 'eighth' || group[0].duration === 'sixteenth');
        if (isShortNote) {
            const startBeat = Math.floor(beatCount);
            for(let j = i; j < measure.beatStructure.length; j++) {
                const nextGroup = measure.beatStructure[j];
                const nextBeatVal = nextGroup[0].value / (60/120);
                if (nextGroup[0].type === 'note' && (nextGroup[0].duration === 'eighth' || nextGroup[0].duration === 'sixteenth') && Math.floor(beatCount) === startBeat) {
                    beamGroup.push(nextGroup); beatCount += nextBeatVal;
                } else { break; }
            }
        }
        if (beamGroup.length > 1) {
            drawBeamGroup(ctx, beamGroup, currentX, yOffset, ratio);
            const groupWidth = beamGroup.reduce((s, g) => s + (SCORE_CONFIG.BASE_NOTE_SPACING * 4 * (g[0].value / (60/120))), 0);
            currentX += groupWidth * ratio;
            i += beamGroup.length;
        } else {
            if (group[0].type === 'note') { drawBeatGroup(ctx, group, currentX, yOffset); } else { drawRest(ctx, group[0], currentX, yOffset); }
            const groupWidth = SCORE_CONFIG.BASE_NOTE_SPACING * 4 * (group[0].value / (60/120));
            currentX += groupWidth * ratio;
            beatCount += group[0].value / (60/120);
            i++;
        }
    }
}

/**
 * The main orchestrator function for rendering sheet music.
 * @param {Array<Object>} quantizedMusic The raw note data from recording.
 * @param {HTMLElement} containerEl The DOM element to append the canvas to.
 * @returns {HTMLCanvasElement|null} The rendered canvas element or null on failure.
 */
function renderProfessionalSheetMusic(quantizedMusic, containerEl) {
    if (quantizedMusic.length < 2) {
        alert("Not enough notes to generate sheet music.");
        return null;
    }
    const canvas = document.createElement('canvas');
    containerEl.innerHTML = '';
    containerEl.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    // PASS 1: ANALYSIS & STRUCTURING
    const keySignature = determineKeySignature(quantizedMusic);
    const timeSignature = { beats: 4, beatType: 4 };
    const measures = structureMusicData(quantizedMusic, timeSignature.beats, keySignature);

    // PASS 2: LAYOUT CALCULATION
    const layout = { lines: [] };
    let currentLine = { measures: [], width: 0 };
    measures.forEach(measure => {
        let measureWidth = measure.beatStructure.reduce((w, group) => w + (SCORE_CONFIG.BASE_NOTE_SPACING * 4 * (group[0].value / (60 / 120))), 0);
        const drawableWidth = SCORE_CONFIG.PAGE_WIDTH - SCORE_CONFIG.STAFF_LEFT_MARGIN - SCORE_CONFIG.STAFF_RIGHT_MARGIN;
        const initialOffset = currentLine.width === 0 ? 180 : 0;
        if (currentLine.width + measureWidth + initialOffset > drawableWidth && currentLine.measures.length > 0) {
            layout.lines.push(currentLine);
            currentLine = { measures: [measure], width: measureWidth };
        } else {
            currentLine.measures.push(measure);
            currentLine.width += measureWidth;
        }
    });
    if (currentLine.measures.length > 0) layout.lines.push(currentLine);

    // PASS 3: FINAL RENDERING
    canvas.width = SCORE_CONFIG.PAGE_WIDTH;
    canvas.height = SCORE_CONFIG.STAFF_TOP_MARGIN * 2 + (layout.lines.length * SCORE_CONFIG.STAFF_ROW_HEIGHT);
    ctx.fillStyle = 'white'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'black'; ctx.strokeStyle = 'black'; ctx.textAlign = 'left';
    ctx.textAlign = 'center'; ctx.font = SCORE_CONFIG.TITLE_FONT; ctx.fillText('Awtsmoos Revealed', canvas.width / 2, 60);
    ctx.font = SCORE_CONFIG.COMPOSER_FONT; ctx.fillText('Composed by The Divine Player', canvas.width / 2, 95);
    ctx.textAlign = 'left';

    let yOffset = SCORE_CONFIG.STAFF_TOP_MARGIN + 50;
    layout.lines.forEach((line, lineIndex) => {
        let x = SCORE_CONFIG.STAFF_LEFT_MARGIN;
        drawStaffSystem(ctx, yOffset);
        
        const musicWidthOnLine = line.width;
        const drawableWidth = SCORE_CONFIG.PAGE_WIDTH - SCORE_CONFIG.STAFF_LEFT_MARGIN - SCORE_CONFIG.STAFF_RIGHT_MARGIN;
        const initialOffset = (lineIndex === 0 ? 180 : 80);
        const justificationRatio = lineIndex < layout.lines.length - 1 ? (drawableWidth - initialOffset) / musicWidthOnLine : 1;
        
        if (lineIndex === 0) {
            x += drawClef(ctx, x, yOffset) + 10;
            x += drawKeySignature(ctx, x, yOffset, keySignature) + 15;
            x += drawTimeSignature(ctx, x, yOffset, timeSignature) + 20;
        } else { x += 80; }

        line.measures.forEach(measure => {
            const measureWidth = measure.beatStructure.reduce((w, group) => w + (SCORE_CONFIG.BASE_NOTE_SPACING * 4 * (group[0].value / (60 / 120))), 0);
            drawMeasure(ctx, measure, x, yOffset, justificationRatio);
            x += measureWidth * justificationRatio;
            x += drawBarLine(ctx, x, yOffset);
        });
        yOffset += SCORE_CONFIG.STAFF_ROW_HEIGHT;
    });

    return canvas;
}