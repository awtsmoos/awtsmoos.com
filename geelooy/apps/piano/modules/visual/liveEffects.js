/* B"H
Realtime particles are light: DOM vessels that disappear quickly and never enter the encoder.
*/
import { elements } from '../ui.js';
import { realtimeRenderMode } from './effectRouting.js';
const HEBREW = ['א','ב','ג','ד','ה','ו','ז','ח','ט','י','כ','ל','מ','נ','ס','ע','פ','צ','ק','ר','ש','ת'];
const EMOJI = ['🎹','✨','🔥','🌊','🌟','💎','⚡','💫','🎶','💧','👑'];
let liveLayer;
export function showRealtimeEffect(keyElement, noteName, coords = { x: 0, y: 0 }) {
    const mode = realtimeRenderMode();
    if (mode === 'none' || !keyElement) return;
    const box = keyElement.getBoundingClientRect();
    const root = ensureLayer();
    const x = box.left + (coords.x || box.width / 2), y = box.top + (coords.y || box.height / 2);
    if (mode === 'touchpoint') return addParticle(root, x, y, '•', 'touch');
    addParticle(root, x, y - 20, `🎹 ${noteName} ✨`, 'note');
    const density = clamp(parseInt(elements.particleDensity?.value || '9', 10), 2, 18);
    for (let i = 0; i < density; i++) {
        const text = i % 3 === 0 ? HEBREW[Math.floor(Math.random() * HEBREW.length)] : EMOJI[Math.floor(Math.random() * EMOJI.length)];
        addParticle(root, x, y, text, i % 3 === 0 ? 'hebrew' : 'emoji');
    }
}
function ensureLayer() {
    if (liveLayer) return liveLayer;
    liveLayer = document.createElement('div');
    liveLayer.id = 'live-effect-layer';
    document.body.appendChild(liveLayer);
    return liveLayer;
}
function addParticle(root, x, y, text, kind) {
    const el = document.createElement('span');
    const angle = Math.random() * Math.PI * 2, speed = 45 + Math.random() * 120;
    el.className = `live-effect-particle ${kind}`;
    el.textContent = text;
    el.style.left = `${x}px`; el.style.top = `${y}px`;
    el.style.setProperty('--dx', `${Math.cos(angle) * speed}px`);
    el.style.setProperty('--dy', `${Math.sin(angle) * speed - 80}px`);
    root.appendChild(el);
    setTimeout(() => el.remove(), 1100);
}
function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
