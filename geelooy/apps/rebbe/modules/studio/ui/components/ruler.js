//B"H
// modules/studio/ui/components/ruler.js
import state from '../../../state.js';

export function renderRuler(ruler, dur, zoom) {
    ruler.innerHTML = '';
    const step = zoom > 150 ? 0.5 : 1;
    for(let i=0; i<=Math.ceil(dur); i+=step) {
        const mark = document.createElement('div');
        mark.className = 'ruler-mark';
        mark.style.left = (i * zoom) + 'px';
        if (Number.isInteger(i)) {
            if(i%5===0) {
                 mark.classList.add('major');
                 mark.textContent = i + 's';
            } else {
                 mark.style.height = '30%';
            }
        } else {
            mark.style.height = '15%';
        }
        ruler.appendChild(mark);
    }
    
    // Beat Markers
    state.studioBeats.forEach(beat => {
        const b = document.createElement('div');
        b.style.position = 'absolute';
        b.style.left = (beat * zoom) + 'px';
        b.style.top = '0';
        b.style.height = '100%';
        b.style.width = '1px';
        b.style.background = 'var(--c-lime)';
        b.style.opacity = '0.5';
        b.style.pointerEvents = 'none';
        ruler.appendChild(b);
    });
}