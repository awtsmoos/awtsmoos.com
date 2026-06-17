/* B"H
UI: the keyboard is a map of vessels. Each visible desktop key can reveal the physical key that awakens it.
*/
import { sendFrameStateToWorker } from './recorder.js';
export const elements = {};
export let scrollState = { x: 0, x2: 0 };
export let activeScroller = { isDragging: false };
const ids = ['start-button','start-screen','app-container','keyboard-container','top-scrollbars-container','middle-scrollbar-container','left-ui-container','settings-bar','sound-preset-select','waveform-select','octave-select','key-width-slider','play-chords-checkbox','always-dual-checkbox','independent-scroll-checkbox','advanced-synth-toggle','chord-settings-toggle','audio-io-toggle','restore-defaults-button','visual-effects-menu','effect-route-select','effect-select','chord-settings-menu','audio-io-menu','advanced-synth-menu','master-volume-slider','mic-volume-slider','mic-playback-checkbox','attack-slider','decay-slider','sustain-slider','release-slider','waveform2-select','osc-mix-slider','detune-slider','pitch-depth-slider','pitch-attack-slider','filter-cutoff-slider','filter-q-slider','lfo-rate-slider','lfo-depth-slider','effect-mode-select','chorus-slider','delay-slider','delay-time-slider','delay-feedback-slider','saturation-slider','reverb-slider','chord-mode-select','chord-octave-select','chord-waveform-select','record-audio-button','record-video-button','record-sheet-button','record-text-button','mic-button','video-progress','visual-effects-toggle','custom-scrollbar-container','custom-scrollbar-thumb','custom-scrollbar-container-top','custom-scrollbar-thumb-top','independent-scroll-label','always-dual-label','auto-bass-checkbox','desktop-keys-checkbox','bass-waveform-select'];
const KEY_MAP = [ ['a','C',0], ['w','C#',0], ['s','D',0], ['e','D#',0], ['d','E',0], ['f','F',0], ['t','F#',0], ['g','G',0], ['y','G#',0], ['h','A',0], ['u','A#',0], ['j','B',0], ['k','C',1], ['o','C#',1], ['l','D',1], ['p','D#',1], [';','E',1], ["'",'F',1] ];
export function cacheElements() {
    ids.forEach(id => elements[id.replace(/-./g, x => x[1].toUpperCase())] = document.getElementById(id));
    elements.menuIcon = document.querySelector('.menu-icon');
}
function shortcutFor(noteName) {
    const start = parseInt(elements.octaveSelect?.value || '0', 10);
    const note = noteName.replace(/\d/g, ''), oct = parseInt(noteName.match(/\d+/)?.[0] || '0', 10);
    const row = KEY_MAP.find(([, n, off]) => n === note && start + off === oct);
    return row ? row[0].toUpperCase() : '';
}
export function generateKeyboard(noteNames) {
    elements.keyboardContainer.innerHTML = '';
    document.documentElement.style.setProperty('--white-key-width', `${parseInt(elements.keyWidthSlider.value)}px`);
    const isDual = elements.alwaysDualCheckbox.checked || window.innerHeight > window.innerWidth;
    const showShortcuts = !!elements.desktopKeysCheckbox?.checked;
    if (isDual) {
        const top = row(), bottom = row(), independent = elements.independentScrollCheckbox.checked;
        const octaves = independent ? 4 : 8, topStart = independent ? 4 : 0;
        const bottomPanel = createKeyboardPanel(0, octaves, noteNames, showShortcuts), topPanel = createKeyboardPanel(topStart, octaves, noteNames, showShortcuts);
        bottomPanel.id = 'keyboard-bottom'; topPanel.id = 'keyboard-top';
        bottom.appendChild(bottomPanel); top.appendChild(topPanel); elements.keyboardContainer.append(top, bottom);
        elements.independentScrollLabel.classList.remove('hidden-ui');
    } else {
        const single = row(), panel = createKeyboardPanel(0, 8, noteNames, showShortcuts);
        panel.id = 'keyboard-bottom'; single.appendChild(panel); elements.keyboardContainer.appendChild(single);
        elements.independentScrollLabel.classList.add('hidden-ui');
    }
}
function row() { const el = document.createElement('div'); el.className = 'keyboard-row'; return el; }
function createKeyboardPanel(startOctaveOffset, numOctaves, noteNames, showShortcuts) {
    const keyboard = document.createElement('div'); keyboard.className = 'piano-keyboard';
    let whiteX = 0; const whiteW = parseInt(elements.keyWidthSlider.value), blackW = whiteW * .6, start = parseInt(elements.octaveSelect.value);
    for (let oct = start + startOctaveOffset; oct < start + startOctaveOffset + numOctaves; oct++) noteNames.forEach(note => {
        if (oct + noteNames.indexOf(note) / 12 > 8.5) return;
        const isBlack = note.includes('#'), noteName = note + oct, key = document.createElement('div');
        key.className = `key ${isBlack ? 'black-key' : 'white-key'}`; key.dataset.note = noteName;
        key.appendChild(span('key-label', noteName));
        const shortcut = showShortcuts ? shortcutFor(noteName) : '';
        if (shortcut) key.appendChild(span('key-shortcut', shortcut));
        key.style.left = `${isBlack ? whiteX - blackW / 2 : whiteX}px`; if (!isBlack) whiteX += whiteW;
        keyboard.appendChild(key);
    });
    keyboard.style.width = `${whiteX}px`; return keyboard;
}
function span(className, text) { const el = document.createElement('span'); el.className = className; el.textContent = text; return el; }
export function handleKeyboardResize(noteNames) {
    const oldKb = document.getElementById('keyboard-bottom');
    const max = oldKb ? oldKb.offsetWidth - elements.keyboardContainer.clientWidth : 0;
    const percent = max > 0 ? scrollState.x / max : 0;
    generateKeyboard(noteNames);
    const newKb = document.getElementById('keyboard-bottom');
    const nextMax = newKb ? newKb.offsetWidth - elements.keyboardContainer.clientWidth : 0;
    setScroll(percent * Math.max(0, nextMax), 0, true); updateScrollbarThumbs();
}
export function setScroll(newX, logicalIndex, fromResize = false) {
    const kb = logicalIndex === 0 ? document.getElementById('keyboard-bottom') : document.getElementById('keyboard-top'); if (!kb) return;
    const max = Math.max(0, kb.offsetWidth - elements.keyboardContainer.clientWidth), x = Math.max(0, Math.min(max, newX || 0));
    if (logicalIndex === 0) scrollState.x = x; else scrollState.x2 = x;
    const isDual = !!document.getElementById('keyboard-top'), independent = elements.independentScrollCheckbox.checked;
    if (isDual && !independent) { const top = document.getElementById('keyboard-top'), rowW = elements.keyboardContainer.clientWidth; kb.style.transform = `translateX(${-x}px)`; top.style.transform = `translateX(${rowW - x}px)`; if (!fromResize) scrollState.x = scrollState.x2 = x; }
    else kb.style.transform = `translateX(${-x}px)`;
    if (!fromResize) updateScrollbarThumbs(); sendFrameStateToWorker();
}
export function updateScrollbarThumbs() {
    const kbBottom = document.getElementById('keyboard-bottom'), kbTop = document.getElementById('keyboard-top'), independent = elements.independentScrollCheckbox.checked;
    if (kbTop && independent) { elements.middleScrollbarContainer.style.display = 'block'; setupThumb(kbBottom, elements.customScrollbarContainerTop, elements.customScrollbarThumbTop, scrollState.x); setupThumb(kbTop, elements.customScrollbarContainer, elements.customScrollbarThumb, scrollState.x2); }
    else { elements.middleScrollbarContainer.style.display = 'none'; setupThumb(kbBottom, elements.customScrollbarContainer, elements.customScrollbarThumb, scrollState.x); setupThumb(kbTop, null, null, 0); }
}
function setupThumb(kb, container, thumb, scrollVal) {
    if (!kb || !container || !thumb) { if (container) container.style.display = 'none'; return; }
    const max = kb.offsetWidth - elements.keyboardContainer.clientWidth;
    if (max <= 0) { container.style.display = 'none'; return; }
    container.style.display = 'block'; const thumbW = (elements.keyboardContainer.clientWidth / kb.offsetWidth) * container.clientWidth;
    thumb.style.width = `${thumbW}px`; const maxThumb = container.clientWidth - thumbW; if (maxThumb > 0) thumb.style.left = `${(scrollVal / max) * maxThumb}px`;
}

