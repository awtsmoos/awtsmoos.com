
/*B"H*/

// --- PROFESSIONAL SHEET MUSIC RENDERING ENGINE ---

const SCORE_CONFIG = {
    PAGE_WIDTH: 1400,
    STAFF_ROW_HEIGHT: 200, STAFF_TOP_MARGIN: 80, STAFF_LINE_GAP: 15,
    STAFF_LEFT_MARGIN: 40, STAFF_RIGHT_MARGIN: 40,
    NOTE_HEAD_RADIUS_X: 9, NOTE_HEAD_RADIUS_Y: 7, STEM_HEIGHT: 50,
    BEAM_THICKNESS: 6, BEAM_GAP: 8,
    BASE_NOTE_SPACING: 45, 
    TITLE_FONT: '48px serif', COMPOSER_FONT: '24px serif',
};

// Expose these globally for the main app to use
window.getNoteDetails = getNoteDetails;
window.quantizeNotes = quantizeNotes;
window.renderProfessionalSheetMusic = renderProfessionalSheetMusic;

/**
 * Parses a note string (e.g., "C#4") into a detailed object.
 */
function getNoteDetails(pitch) {
    const noteName = pitch.slice(0, -1);
    const octave = parseInt(pitch.slice(-1));
    const baseNote = noteName.charAt(0);
    const accidental = noteName.length > 1 ? noteName.charAt(1) : null;
    const pitchValue = octave * 12 + { C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4, F: 5, 'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, B: 11 }[noteName];
    return { pitch, baseNote, octave, accidental, pitchValue };
}

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

function quantizeNotes(notes) {
    const tempo = 120; // Assume 120 BPM
    const quarterNoteDuration = 60 / tempo;
    const durations = [
        { name: 'sixteenth', duration: quarterNoteDuration / 4 },
        { name: 'eighth', duration: quarterNoteDuration / 2 },
        { name: 'eighth-dotted', duration: (quarterNoteDuration / 2) * 1.5 },
        { name: 'quarter', duration: quarterNoteDuration },
        { name: 'quarter-dotted', duration: quarterNoteDuration * 1.5 },
        { name: 'half', duration: quarterNoteDuration * 2 },
        { name: 'half-dotted', duration: quarterNoteDuration * 3 },
        { name: 'whole', duration: quarterNoteDuration * 4 },
    ].sort((a, b) => a.duration - b.duration);

    if (notes.length === 0) return [];
    
    // Sort notes by start time
    notes.sort((a, b) => a.start - b.start);

    const result = [];
    let lastEndTime = notes[0].start; // Start from first note

    notes.forEach(note => {
        // Gap detection (Rest)
        const restDuration = note.start - lastEndTime;
        if (restDuration > durations[0].duration * 0.8) { // Tolerance
            let remainingRest = restDuration;
            let restStartTime = lastEndTime;
            // Greedily fill rest
            while (remainingRest >= durations[0].duration * 0.9) {
                // Find largest fitting rest
                let chosenRest = durations[0];
                for (let i = durations.length - 1; i >= 0; i--) {
                    if (durations[i].duration <= remainingRest * 1.1) {
                        chosenRest = durations[i];
                        break;
                    }
                }
                result.push({ type: 'rest', duration: chosenRest.name, value: chosenRest.duration, start: restStartTime });
                remainingRest -= chosenRest.duration;
                restStartTime += chosenRest.duration;
            }
        }

        const closestNote = durations.reduce((prev, curr) =>
            Math.abs(curr.duration - note.duration) < Math.abs(prev.duration - note.duration) ? curr : prev
        );

        let articulation = null;
        if (note.duration < closestNote.duration * 0.6 && closestNote.duration > quarterNoteDuration / 4) {
            articulation = 'staccato';
        }

        result.push({
            type: 'note',
            pitch: note.note,
            start: note.start,
            duration: closestNote.name,
            value: closestNote.duration,
            articulation: articulation
        });

        lastEndTime = Math.max(lastEndTime, note.start + closestNote.duration);
    });
    return result;
}

function structureMusicData(notes, beatsPerMeasure, keySignature) {
    const splitPoint = getNoteDetails('C4').pitchValue; 

    const trebleNotes = notes.filter(item => item.type === 'rest' || getNoteDetails(item.pitch).pitchValue >= splitPoint);
    const bassNotes = notes.filter(item => item.type === 'rest' || getNoteDetails(item.pitch).pitchValue < splitPoint);

    const processVoice = (voiceNotes) => {
        const measures = [];
        let currentMeasure = { items: [], beats: 0 };
        let measureAccidentals = new Set();

        voiceNotes.forEach(item => {
            const beatValue = item.value / (60 / 120); 
            if (currentMeasure.beats + beatValue > beatsPerMeasure + 0.1 && currentMeasure.items.length > 0) { // Tolerance
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
                } else if (keyAccidental && !measureAccidentals.has(naturalPitch)) {
                    item.displayAccidental = '♮';
                    measureAccidentals.add(naturalPitch);
                }
            }
            currentMeasure.items.push(item);
            currentMeasure.beats += beatValue;
        });
        if (currentMeasure.items.length > 0) measures.push(currentMeasure);
        
        // Grouping
        measures.forEach(measure => {
            const beatStructure = [];
            let i = 0;
            while (i < measure.items.length) {
                const currentItem = measure.items[i];
                let group = [currentItem];
                if (currentItem.type === 'note') {
                    for (let j = i + 1; j < measure.items.length; j++) {
                        // Group if start times align (chord) or simply sequential
                        // For rendering, we want chords grouped.
                        // However, simpler logic: treat distinct start times as distinct groups.
                        if (measure.items[j].type === 'note' && Math.abs(measure.items[j].start - currentItem.start) < 0.05) {
                            group.push(measure.items[j]);
                        } else {
                            break;
                        }
                    }
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
    };

    return {
        treble: processVoice(trebleNotes),
        bass: processVoice(bassNotes)
    };
}

function drawClefAndBrace(ctx, x, yTreble, yBass) {
    ctx.font = '150px serif';
    ctx.fillText('{', x - 15, yBass + SCORE_CONFIG.STAFF_LINE_GAP * 3.2);
    ctx.font = '80px serif';
    ctx.fillText('𝄞', x + 20, yTreble + SCORE_CONFIG.STAFF_LINE_GAP * 4.5);
    ctx.font = '70px serif';
    ctx.fillText('𝄢', x + 25, yBass + SCORE_CONFIG.STAFF_LINE_GAP * 1.5);
    return 80;
}

function getNoteY(details, yOffset, clef) {
    const noteSteps = { 'C': 0, 'D': 1, 'E': 2, 'F': 3, 'G': 4, 'A': 5, 'B': 6 };
    const step = noteSteps[details.baseNote];

    if (clef === 'treble') {
        const y_G4 = yOffset + SCORE_CONFIG.STAFF_LINE_GAP * 3; // Corrected line ref
        // G4 is 2nd line from bottom (index 3 from top 0-4)
        // Staff lines indices: 0,1,2,3,4
        // G4 is on line index 3 (counting from top 0) -> Actually G4 is 2nd line from bottom.
        // E4 (bottom line) -> F4 -> G4.
        const y_E4 = yOffset + 4 * SCORE_CONFIG.STAFF_LINE_GAP;
        // Calculation from C4 (middle C)
        // C4 is one ledger line below treble.
        const c4_steps = 0; // C
        const steps = (details.octave - 4) * 7 + step;
        // C4 is below E4 by 2 steps (C, D, E).
        // Let's anchor to F5 (top line). F5 is octave 5 step 3.
        // Better: Anchor to top line (F5).
        const y_TopLine = yOffset;
        // Steps from F5
        const f5_val = 5 * 7 + 3; // 38
        const note_val = details.octave * 7 + step;
        const diff = f5_val - note_val;
        return y_TopLine + diff * (SCORE_CONFIG.STAFF_LINE_GAP / 2);
    } else {
        // Bass Clef: Top line is A3.
        const y_TopLine = yOffset;
        const a3_val = 3 * 7 + 5; // 26
        const note_val = details.octave * 7 + step;
        const diff = a3_val - note_val;
        return y_TopLine + diff * (SCORE_CONFIG.STAFF_LINE_GAP / 2);
    }
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

function drawNote(ctx, note, x, yOffset, stemDirection, clef) {
    const noteY = getNoteY(note.details, yOffset, clef);

    ctx.lineWidth = 1;
    const staffTop = yOffset;
    const staffBottom = yOffset + 4 * SCORE_CONFIG.STAFF_LINE_GAP;
    if (noteY > staffBottom) {
        for (let ly = staffBottom + SCORE_CONFIG.STAFF_LINE_GAP; ly <= noteY; ly += SCORE_CONFIG.STAFF_LINE_GAP) {
            ctx.beginPath(); ctx.moveTo(x - 12, ly); ctx.lineTo(x + 12, ly); ctx.stroke();
        }
    } else if (noteY < staffTop) {
        for (let ly = staffTop - SCORE_CONFIG.STAFF_LINE_GAP; ly >= noteY; ly -= SCORE_CONFIG.STAFF_LINE_GAP) {
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
    if (isFilled) ctx.fill(); else { ctx.lineWidth = 1.5; ctx.stroke(); }

    if (note.duration !== 'whole') {
        const stemX = stemDirection === 1 ? x + SCORE_CONFIG.NOTE_HEAD_RADIUS_X - 1 : x - SCORE_CONFIG.NOTE_HEAD_RADIUS_X + 1;
        const stemYend = noteY - (SCORE_CONFIG.STEM_HEIGHT * stemDirection);
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(stemX, noteY);
        ctx.lineTo(stemX, stemYend);
        ctx.stroke();

        if (note.articulation === 'staccato') {
            const dotOffset = SCORE_CONFIG.NOTE_HEAD_RADIUS_Y + 12;
            const dotY = stemDirection === 1 ? noteY - dotOffset : noteY + dotOffset;
            ctx.beginPath();
            ctx.arc(x, dotY, 2.5, 0, 2 * Math.PI);
            ctx.fillStyle = 'black';
            ctx.fill();
        }
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

function drawBeatGroup(ctx, group, x, yOffset, clef) {
    const midStaffY = yOffset + 2 * SCORE_CONFIG.STAFF_LINE_GAP;
    const furthestNote = group.reduce((furthest, note) => {
        const noteY = getNoteY(note.details, yOffset, clef);
        const furthestY = getNoteY(furthest.details, yOffset, clef);
        return Math.abs(noteY - midStaffY) > Math.abs(furthestY - midStaffY) ? note : furthest;
    });
    const furthestNoteY = getNoteY(furthestNote.details, yOffset, clef);
    const stemDirection = furthestNoteY > midStaffY ? -1 : 1;
    
    if (group.length > 1) {
        for (let i = 0; i < group.length - 1; i++) {
            const yA = getNoteY(group[i].details, yOffset, clef);
            const yB = getNoteY(group[i + 1].details, yOffset, clef);
            if (Math.abs(yA - yB) < SCORE_CONFIG.STAFF_LINE_GAP - 2) {
                group[i + 1].render_x_offset = SCORE_CONFIG.NOTE_HEAD_RADIUS_X * 2;
                group[i].render_x_offset = 0;
            } else { group[i + 1].render_x_offset = 0; }
        }
    }
    let lastStem = null;
    group.forEach(note => {
        const noteX = x + (stemDirection === 1 ? (note.render_x_offset || 0) : -(note.render_x_offset || 0));
        const res = drawNote(ctx, note, noteX, yOffset, stemDirection, clef);
        if (res) lastStem = res;
        note.render_x_offset = 0;
    });
    if (group.length === 1 && lastStem) {
        drawFlags(ctx, lastStem.stemX, lastStem.stemYend, stemDirection, group[0].duration);
    }
}

function drawBeamGroup(ctx, groups, x, yOffset, ratio, clef) {
    let notePositions = [];
    let currentX = x;
    groups.forEach(group => {
        const groupWidth = (SCORE_CONFIG.BASE_NOTE_SPACING * 4 * (group[0].value / (60 / 120))) * ratio;
        group.forEach(note => {
            notePositions.push({ note, x: currentX });
        });
        currentX += groupWidth;
    });

    const midStaffY = yOffset + 2 * SCORE_CONFIG.STAFF_LINE_GAP;
    const avgY = notePositions.reduce((sum, pos) => sum + getNoteY(pos.note.details, yOffset, clef), 0) / notePositions.length;
    const stemDirection = avgY > midStaffY ? -1 : 1;

    let stemInfos = notePositions.map(pos => {
        return { ...drawNote(ctx, pos.note, pos.x, yOffset, stemDirection, clef), note: pos.note };
    });

    const firstStem = stemInfos[0];
    const lastStem = stemInfos[stemInfos.length - 1];

    let beamY1 = firstStem.stemYend;
    let beamY2 = lastStem.stemYend;
    const slope = (beamY2 - beamY1) / (lastStem.stemX - firstStem.stemX || 1);
    if (Math.abs(slope) > 0.6) {
        beamY2 = beamY1 + Math.sign(slope) * Math.abs(lastStem.stemX - firstStem.stemX) * 0.6;
    }

    ctx.lineWidth = SCORE_CONFIG.BEAM_THICKNESS;
    ctx.beginPath();
    ctx.moveTo(firstStem.stemX, beamY1);
    ctx.lineTo(lastStem.stemX, beamY2);
    ctx.stroke();

    stemInfos.forEach(info => {
        const beamYatX = beamY1 + (beamY2-beamY1) * ((info.stemX - firstStem.stemX) / (lastStem.stemX - firstStem.stemX || 1));
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(info.stemX, info.noteY);
        ctx.lineTo(info.stemX, beamYatX);
        ctx.stroke();
        info.stemYend = beamYatX;
    });
}

function drawMeasure(ctx, measure, x, yOffset, ratio, clef) {
    let currentX = x;
    let beatCount = 0;

    for (let i = 0; i < measure.beatStructure.length; ) {
        const group = measure.beatStructure[i];
        const isBeamable = group[0].type === 'note' && (group[0].duration.includes('eighth') || group[0].duration.includes('sixteenth'));
        
        let beamGroup = [];
        if (isBeamable) {
            const startBeat = Math.floor(beatCount);
            for(let j = i; j < measure.beatStructure.length; j++) {
                const nextGroup = measure.beatStructure[j];
                const nextBeatVal = nextGroup[0].value / (60 / 120);
                const isNextBeamable = nextGroup[0].type === 'note' && (nextGroup[0].duration.includes('eighth') || nextGroup[0].duration.includes('sixteenth'));

                if (isNextBeamable && Math.floor(beatCount) === startBeat) {
                    beamGroup.push(nextGroup);
                    beatCount += nextBeatVal;
                } else {
                    break;
                }
            }
        }

        if (beamGroup.length > 1) {
            drawBeamGroup(ctx, beamGroup, currentX, yOffset, ratio, clef);
            const groupWidth = beamGroup.reduce((sum, g) => sum + (SCORE_CONFIG.BASE_NOTE_SPACING * 4 * (g[0].value / (60/120))), 0);
            currentX += groupWidth * ratio;
            i += beamGroup.length;
        } else {
            if (group[0].type === 'note') {
                drawBeatGroup(ctx, group, currentX, yOffset, clef);
            } else {
                drawRest(ctx, group[0], currentX, yOffset);
            }
            const groupWidth = SCORE_CONFIG.BASE_NOTE_SPACING * 4 * (group[0].value / (60/120));
            currentX += groupWidth * ratio;
            beatCount += group[0].value / (60/120);
            i++;
        }
    }
}

function renderProfessionalSheetMusic(quantizedMusic, containerEl) {
    if (quantizedMusic.length < 2) {
        alert("Not enough notes to generate sheet music.");
        return null;
    }
    const canvas = document.createElement('canvas');
    containerEl.innerHTML = '';
    containerEl.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    const keySignature = determineKeySignature(quantizedMusic);
    const timeSignature = { beats: 4, beatType: 4 };
    const music = structureMusicData(quantizedMusic, timeSignature.beats, keySignature);
    const totalMeasures = Math.max(music.treble.length, music.bass.length);

    const layout = { lines: [] };
    let currentLine = { measureIndices: [], width: 0 };
    const drawableWidth = SCORE_CONFIG.PAGE_WIDTH - SCORE_CONFIG.STAFF_LEFT_MARGIN - SCORE_CONFIG.STAFF_RIGHT_MARGIN;
    const defaultMeasureWidth = timeSignature.beats * (SCORE_CONFIG.BASE_NOTE_SPACING * 4);

    for(let i = 0; i < totalMeasures; i++) {
        const trebleMeasure = music.treble[i] || { beatStructure: [] };
        const bassMeasure = music.bass[i] || { beatStructure: [] };
        const trebleWidth = trebleMeasure.beatStructure.reduce((w, g) => w + (SCORE_CONFIG.BASE_NOTE_SPACING * 4 * (g[0].value / (60/120))), 0);
        const bassWidth = bassMeasure.beatStructure.reduce((w, g) => w + (SCORE_CONFIG.BASE_NOTE_SPACING * 4 * (g[0].value / (60/120))), 0);
        const measureWidth = Math.max(trebleWidth, bassWidth, defaultMeasureWidth * 0.7);

        const initialOffset = currentLine.width === 0 ? 180 : 0;
        if (currentLine.width + measureWidth + initialOffset > drawableWidth && currentLine.measureIndices.length > 0) {
            layout.lines.push(currentLine);
            currentLine = { measureIndices: [], width: 0 };
        }
        currentLine.measureIndices.push(i);
        currentLine.width += measureWidth;
    }
    if (currentLine.measureIndices.length > 0) layout.lines.push(currentLine);

    canvas.width = SCORE_CONFIG.PAGE_WIDTH;
    canvas.height = SCORE_CONFIG.STAFF_TOP_MARGIN * 2 + (layout.lines.length * (SCORE_CONFIG.STAFF_ROW_HEIGHT * 2));
    ctx.fillStyle = 'white'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'black'; ctx.strokeStyle = 'black';
    ctx.textAlign = 'center'; ctx.font = SCORE_CONFIG.TITLE_FONT; ctx.fillText('Awtsmoos Revealed', canvas.width / 2, 60);
    ctx.font = SCORE_CONFIG.COMPOSER_FONT; ctx.fillText('Composed by The Divine Player', canvas.width / 2, 95);
    ctx.textAlign = 'left';

    let yOffset = SCORE_CONFIG.STAFF_TOP_MARGIN + 50;
    layout.lines.forEach((line, lineIndex) => {
        let x = SCORE_CONFIG.STAFF_LEFT_MARGIN;
        const yTreble = yOffset;
        const yBass = yOffset + SCORE_CONFIG.STAFF_ROW_HEIGHT;
        
        drawStaffSystem(ctx, yTreble);
        drawStaffSystem(ctx, yBass);
        x += drawClefAndBrace(ctx, x, yTreble, yBass) + 10;
        
        if (lineIndex === 0) {
            let keySigWidth = drawKeySignature(ctx, x, yTreble, keySignature);
            drawKeySignature(ctx, x, yBass, keySignature);
            x += keySigWidth + 15;
            let timeSigWidth = drawTimeSignature(ctx, x, yTreble, timeSignature);
            drawTimeSignature(ctx, x, yBass, timeSignature);
            x += timeSigWidth + 20;
        }

        line.measureIndices.forEach(measureIndex => {
            const trebleMeasure = music.treble[measureIndex] || { beatStructure: [] };
            const bassMeasure = music.bass[measureIndex] || { beatStructure: [] };
            
            const trebleWidth = trebleMeasure.beatStructure.reduce((w, g) => w + (SCORE_CONFIG.BASE_NOTE_SPACING * 4 * (g[0].value / (60/120))), 0);
            const bassWidth = bassMeasure.beatStructure.reduce((w, g) => w + (SCORE_CONFIG.BASE_NOTE_SPACING * 4 * (g[0].value / (60/120))), 0);
            const measureWidth = Math.max(trebleWidth, bassWidth, defaultMeasureWidth * 0.7);

            if (trebleMeasure.beatStructure.length === 0) {
                drawRest(ctx, { duration: 'whole' }, x + measureWidth / 2, yTreble);
            } else {
                drawMeasure(ctx, trebleMeasure, x, yTreble, 1, 'treble');
            }

            if (bassMeasure.beatStructure.length === 0) {
                drawRest(ctx, { duration: 'whole' }, x + measureWidth / 2, yBass);
            } else {
                drawMeasure(ctx, bassMeasure, x, yBass, 1, 'bass');
            }
            
            x += measureWidth;
            drawBarLine(ctx, x, yTreble);
            drawBarLine(ctx, x, yBass);
            x += 20;
        });

        yOffset += SCORE_CONFIG.STAFF_ROW_HEIGHT * 2;
    });

    return canvas;
}
