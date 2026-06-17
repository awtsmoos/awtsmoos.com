/* B"H */
import { elements, scrollState } from '../ui.js';

export function makeVideoConfig() {
    const isVertical = window.innerHeight > window.innerWidth;
    const resolution = isVertical ? { width: 1080, height: 1920 } : { width: 1920, height: 1080 };
    const fps = parseInt(document.getElementById('myFPS')?.value) || 30;
    return {
        renderMode: elements.effectSelect.value,
        resolution,
        outputFormat: { quality: 0.8, fps },
        startOctave: elements.octaveSelect.value,
        alwaysDual: elements.alwaysDualCheckbox.checked,
        independentScroll: elements.independentScrollCheckbox.checked,
        isVertical,
        style: { userKeyWidth: parseInt(elements.keyWidthSlider.value), userViewportWidth: elements.keyboardContainer.clientWidth },
        initialScrollX: scrollState.x,
        initialScrollX2: scrollState.x2 || 0
    };
}
