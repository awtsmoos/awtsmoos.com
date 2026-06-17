/* B"H */
import { elements, scrollState } from '../ui.js';

function readPanelLayout(panelId) {
    const panel = document.getElementById(panelId);
    if (!panel) return [];
    return [...panel.querySelectorAll('.key')]
        .map(key => ({ note: key.dataset.note, isBlack: key.classList.contains('black-key'), x: key.offsetLeft, width: key.offsetWidth }))
        .filter(key => key.note && key.width > 0);
}

function readKeyboardLayout() {
    return { bottom: readPanelLayout('keyboard-bottom'), top: readPanelLayout('keyboard-top') };
}

function liveEncoderTuning(fps) {
    return {
        liveRenderBudgetMs: fps > 30 ? 10 : 14,
        liveMaxFramesPerPump: fps > 30 ? 2 : 3,
        livePumpIntervalMs: fps > 30 ? 70 : 90
    };
}

export function makeVideoConfig() {
    const isVertical = window.innerHeight > window.innerWidth;
    const resolution = isVertical ? { width: 1080, height: 1920 } : { width: 1920, height: 1080 };
    const fps = parseInt(document.getElementById('myFPS')?.value, 10) || 30;
    return {
        renderMode: elements.effectSelect.value,
        resolution,
        outputFormat: { quality: 0.8, fps },
        startOctave: elements.octaveSelect.value,
        alwaysDual: elements.alwaysDualCheckbox.checked,
        independentScroll: elements.independentScrollCheckbox.checked,
        isVertical,
        style: { userKeyWidth: parseInt(elements.keyWidthSlider.value, 10), userViewportWidth: elements.keyboardContainer.clientWidth },
        initialScrollX: scrollState.x,
        initialScrollX2: scrollState.x2 || 0,
        keyboardLayout: readKeyboardLayout(),
        ...liveEncoderTuning(fps)
    };
}
