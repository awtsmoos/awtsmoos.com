
/* B"H */
// piano/modules/ui.js
import { sendFrameStateToWorker } from './recorder.js';

export const elements = {};

export let scrollState = { x: 0, x2: 0 };
export let activeScroller = { isDragging: false };

export function cacheElements() {
    const ids = [
        'start-button', 'start-screen', 'app-container', 'keyboard-container',
        'top-scrollbars-container', 'middle-scrollbar-container', 'left-ui-container',
        'settings-bar', 'sound-preset-select', 'waveform-select', 'octave-select', 'key-width-slider',
        'play-chords-checkbox', 'always-dual-checkbox', 'independent-scroll-checkbox',
        'advanced-synth-toggle', 'chord-settings-toggle', 'audio-io-toggle',
        'restore-defaults-button', 'visual-effects-menu', 'effect-select',
        'chord-settings-menu', 'audio-io-menu', 'advanced-synth-menu',
        'master-volume-slider', 'mic-volume-slider', 'mic-playback-checkbox',
        'attack-slider', 'decay-slider', 'sustain-slider', 'release-slider',
        'waveform2-select', 'osc-mix-slider', 'detune-slider', 'pitch-depth-slider',
        'pitch-attack-slider', 'filter-cutoff-slider', 'filter-q-slider',
        'lfo-rate-slider', 'lfo-depth-slider', 'effect-mode-select', 'chorus-slider',
        'delay-slider', 'delay-time-slider', 'delay-feedback-slider', 'saturation-slider', 'reverb-slider',
        'chord-mode-select', 'chord-octave-select', 'chord-waveform-select',
        'record-audio-button', 'record-video-button', 'record-sheet-button',
        'mic-button', 'video-progress', 'visual-effects-toggle',
        'custom-scrollbar-container', 'custom-scrollbar-thumb',
        'custom-scrollbar-container-top', 'custom-scrollbar-thumb-top',
        'independent-scroll-label', 'always-dual-label',
        // New elements
        'auto-bass-checkbox', 'desktop-keys-checkbox', 'bass-waveform-select'
    ];
    
    ids.forEach(id => {
        elements[id.replace(/-./g, x => x[1].toUpperCase())] = document.getElementById(id);
    });
    // Manual mapping for classes
    elements.menuIcon = document.querySelector('.menu-icon');
}

// --- Keyboard Mapping Logic for Desktop Labels ---
const KEY_MAP_LOWER = ['a','w','s','e','d','f','t','g','y','h','u','j','k','o','l','p',';',"'"];
const KEY_MAP_UPPER = []; // Logic can be extended

function getShortcutLabel(noteName, octave, startOctave) {
    // Map relative to C4 (startOctave 4) or dynamic?
    // Let's do a simple fixed map starting from the first visible C on the bottom keyboard
    // This is tricky because octaves shift.
    // Simpler: Map 'a'...'j' to the white keys of the currently active "center" octave (usually 4).
    
    const note = noteName.slice(0, -1);
    const oct = parseInt(noteName.slice(-1));
    
    // We map keys A-J to C4-B4 area roughly
    // Specifically C4=a, D4=s, E4=d, F4=f, G4=g, A4=h, B4=j
    // Blacks: C#4=w, D#4=e, F#4=t, G#4=y, A#4=u
    
    if (oct === 4) {
        if (note === 'C') return 'A';
        if (note === 'C#') return 'W';
        if (note === 'D') return 'S';
        if (note === 'D#') return 'E';
        if (note === 'E') return 'D';
        if (note === 'F') return 'F';
        if (note === 'F#') return 'T';
        if (note === 'G') return 'G';
        if (note === 'G#') return 'Y';
        if (note === 'A') return 'H';
        if (note === 'A#') return 'U';
        if (note === 'B') return 'J';
    }
    if (oct === 5) {
        if (note === 'C') return 'K';
        if (note === 'C#') return 'O';
        if (note === 'D') return 'L';
        if (note === 'D#') return 'P';
        if (note === 'E') return ';';
        if (note === 'F') return "'";
    }
    return '';
}

export function generateKeyboard(noteNames) {
    elements.keyboardContainer.innerHTML = '';
    document.documentElement.style.setProperty('--white-key-width', `${parseInt(elements.keyWidthSlider.value)}px`);
    const isVertical = window.innerHeight > window.innerWidth;
    const alwaysDual = elements.alwaysDualCheckbox.checked;
    let isDualView = alwaysDual || isVertical;
    const showShortcuts = elements.desktopKeysCheckbox.checked && !('ontouchstart' in window);

    if (isDualView) {
        const rowTop = document.createElement('div'); rowTop.className = 'keyboard-row';
        const rowBottom = document.createElement('div'); rowBottom.className = 'keyboard-row';

        const isIndependent = elements.independentScrollCheckbox.checked;
        const octaves = isIndependent ? 4 : 8;
        const topStartOctave = isIndependent ? 4 : 0;

        const keyboardBottom = createKeyboardPanel(0, octaves, noteNames, showShortcuts);
        const keyboardTop = createKeyboardPanel(topStartOctave, octaves, noteNames, false); // Only shortcuts on bottom

        keyboardBottom.id = 'keyboard-bottom';
        keyboardTop.id = 'keyboard-top';

        rowBottom.appendChild(keyboardBottom);
        rowTop.appendChild(keyboardTop);
        elements.keyboardContainer.appendChild(rowTop);
        elements.keyboardContainer.appendChild(rowBottom);
        elements.independentScrollLabel.classList.remove('hidden-ui');
    } else {
        const rowSingle = document.createElement('div'); rowSingle.className = 'keyboard-row';
        const keyboard = createKeyboardPanel(0, 8, noteNames, showShortcuts);
        keyboard.id = 'keyboard-bottom';
        rowSingle.appendChild(keyboard);
        elements.keyboardContainer.appendChild(rowSingle);
        elements.independentScrollLabel.classList.add('hidden-ui');
    }
}

function createKeyboardPanel(startOctaveOffset, numOctaves, noteNames, showShortcuts) {
    const keyboardDiv = document.createElement('div');
    keyboardDiv.className = 'piano-keyboard';
    let whiteKeyX = 0;
    const whiteKeyWidth = parseInt(elements.keyWidthSlider.value);
    const blackKeyWidth = whiteKeyWidth * 0.6;
    const baseStartOctave = parseInt(elements.octaveSelect.value);

    for (let oct = baseStartOctave + startOctaveOffset; oct < baseStartOctave + startOctaveOffset + numOctaves; oct++) {
        noteNames.forEach(note => {
            if (oct + (noteNames.indexOf(note) / 12) > 8.5) return;
            const keyElement = document.createElement('div');
            const isBlack = note.includes('#');
            const noteName = note + oct;
            keyElement.className = `key ${isBlack ? 'black-key' : 'white-key'}`;
            keyElement.dataset.note = noteName;
            
            const label = document.createElement('span');
            label.className = 'key-label';
            label.textContent = noteName;
            keyElement.appendChild(label);

            if (showShortcuts) {
                const shortcut = getShortcutLabel(noteName, oct, baseStartOctave);
                if (shortcut) {
                    const scSpan = document.createElement('span');
                    scSpan.className = 'key-shortcut';
                    scSpan.textContent = shortcut;
                    keyElement.appendChild(scSpan);
                }
            }

            if (isBlack) {
                keyElement.style.left = `${whiteKeyX - (blackKeyWidth / 2)}px`;
            } else {
                keyElement.style.left = `${whiteKeyX}px`;
                whiteKeyX += whiteKeyWidth;
            }
            keyboardDiv.appendChild(keyElement);
        });
    }
    keyboardDiv.style.width = `${whiteKeyX}px`;
    return keyboardDiv;
}

export function handleKeyboardResize(noteNames) {
    const oldKb = document.getElementById('keyboard-bottom');
    let scrollPercent = 0;
    if (oldKb) {
        const maxScroll = oldKb.offsetWidth - elements.keyboardContainer.clientWidth;
        if (maxScroll > 0) scrollPercent = scrollState.x / maxScroll;
    }
    generateKeyboard(noteNames);
    const newKb = document.getElementById('keyboard-bottom');
    if (newKb) {
        const newMaxScroll = newKb.offsetWidth - elements.keyboardContainer.clientWidth;
        setScroll(scrollPercent * newMaxScroll, 0, true);
    }
    updateScrollbarThumbs();
}

export function setScroll(newX, logicalIndex, fromResize = false) {
    const kb = logicalIndex === 0 ? document.getElementById('keyboard-bottom') : document.getElementById('keyboard-top');
    if (!kb) return;

    const maxScroll = kb.offsetWidth - elements.keyboardContainer.clientWidth;
    const clampedX = Math.max(0, Math.min(maxScroll > 0 ? maxScroll : 0, newX || 0));

    if (logicalIndex === 0) scrollState.x = clampedX;
    else scrollState.x2 = clampedX;

    const isDual = !!document.getElementById('keyboard-top');
    const isIndependent = elements.independentScrollCheckbox.checked;

    if (isDual && !isIndependent) {
        const topKb = document.getElementById('keyboard-top');
        const rowWidth = elements.keyboardContainer.clientWidth;
        kb.style.transform = `translateX(${-clampedX}px)`;
        topKb.style.transform = `translateX(${rowWidth - clampedX}px)`; 
        if (!fromResize) scrollState.x = scrollState.x2 = clampedX;
    } else {
        kb.style.transform = `translateX(${-clampedX}px)`;
    }

    if (!fromResize) updateScrollbarThumbs();
    sendFrameStateToWorker();
}

export function updateScrollbarThumbs() {
    const setup = (kb, container, thumb, scrollVal) => {
        if (!kb || !container || !thumb) {
            if (container) container.style.display = 'none';
            return;
        }
        const maxScroll = kb.offsetWidth - elements.keyboardContainer.clientWidth;
        if (maxScroll > 0) {
            container.style.display = 'block';
            const thumbW = (elements.keyboardContainer.clientWidth / kb.offsetWidth) * container.clientWidth;
            thumb.style.width = `${thumbW}px`;
            const maxThumbScroll = container.clientWidth - thumbW;
            if (maxThumbScroll > 0) thumb.style.left = `${(scrollVal / maxScroll) * maxThumbScroll}px`;
        } else {
            container.style.display = 'none';
        }
    };

    const kbBottom = document.getElementById('keyboard-bottom');
    const kbTop = document.getElementById('keyboard-top');
    const isIndependent = elements.independentScrollCheckbox.checked;

    if (kbTop && isIndependent) {
        elements.middleScrollbarContainer.style.display = 'block';
        setup(kbBottom, elements.customScrollbarContainerTop, elements.customScrollbarThumbTop, scrollState.x);
        setup(kbTop, elements.customScrollbarContainer, elements.customScrollbarThumb, scrollState.x2);
    } else {
        elements.middleScrollbarContainer.style.display = 'none';
        setup(kbBottom, elements.customScrollbarContainer, elements.customScrollbarThumb, scrollState.x);
        setup(kbTop, null, null, 0); 
    }
}
