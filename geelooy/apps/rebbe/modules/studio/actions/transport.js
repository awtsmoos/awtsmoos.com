//B"H
// modules/studio/actions/transport.js
import state from '../../state.js';
import { ctx, initAudioContext } from '../context.js';

export async function togglePlay() {
    if (state.studioIsPlaying) stopAudio();
    else await startAudio();
    updateUI();
}

export function seek(time) {
    stopAudio();
    // Find bounds
    let max = 10;
    if (state.audioLayers.length > 0) {
        max = Math.max(...state.audioLayers.map(l => l.end)) + 2;
    }
    state.currentTime = Math.max(0, time);
    updateUI();
    
    // Explicitly update playhead visual immediately
    const p = document.getElementById('timeline-playhead');
    const c = document.getElementById('timeline-tracks');
    const header = document.querySelector('.track-head');
    if (p && c && header) {
        const offsetW = header.offsetWidth;
        const x = state.currentTime * state.studioZoom;
        const scroll = c.scrollLeft;
        p.style.left = (offsetW + x - scroll) + 'px';
    }
}

export async function startAudio() {
    if (!state.sourceAudioBuffer) return;
    initAudioContext();
    if (ctx.audio.state === 'suspended') await ctx.audio.resume();

    // Reset Active Sources Tracker
    ctx.activeSources = [];

    // Mute Logic
    const audioMuted = state.trackSettings.audio.muted;

    // Schedule clips
    if (!audioMuted) {
        state.audioLayers.forEach(clip => {
            if (clip.end > state.currentTime) {
                let delay = 0;
                let offset = clip.offset;
                let duration = clip.end - clip.start;
                
                if (state.currentTime >= clip.start) {
                    const diff = state.currentTime - clip.start;
                    offset += diff;
                    duration -= diff;
                } else {
                    delay = clip.start - state.currentTime;
                }
                
                if (offset < 0) offset = 0;
                if (offset + duration > state.sourceAudioBuffer.duration) {
                    duration = state.sourceAudioBuffer.duration - offset;
                }

                if (duration > 0) {
                    const source = ctx.audio.createBufferSource();
                    source.buffer = state.sourceAudioBuffer;
                    const gain = ctx.audio.createGain();
                    
                    // Apply clip volume AND track volume
                    const trackVol = state.trackSettings.audio.vol !== undefined ? state.trackSettings.audio.vol : 1.0;
                    gain.gain.value = (clip.vol || 1.0) * trackVol;
                    
                    source.connect(gain);
                    gain.connect(ctx.analyser);
                    ctx.analyser.connect(ctx.audio.destination);
                    
                    source.start(ctx.audio.currentTime + delay, offset, duration);
                    ctx.activeSources.push(source);
                }
            }
        });
    }

    state.studioStartTime = ctx.audio.currentTime;
    state.studioOffsetTime = state.currentTime; 
    state.studioIsPlaying = true;
    
    syncMedia(true);
}

export function stopAudio() {
    if (ctx.activeSources) {
        ctx.activeSources.forEach(s => {
            try { s.stop(); } catch(e){}
        });
        ctx.activeSources = [];
    }
    state.studioIsPlaying = false;
    syncMedia(false);
    updateUI();
}

export function setZoom(v) { 
    state.studioZoom = parseInt(v); 
    if(window.Studio && window.Studio.renderTimeline) window.Studio.renderTimeline();
}

function syncMedia(playing) {
    if(state.trackSettings.media.visible === false) return;
    
    Object.values(ctx.mediaCache).forEach(m => {
        if (m.type === 'video' && m.el) {
            if (playing) m.el.play().catch(e=>{});
            else m.el.pause();
        }
    });
}

function updateUI() {
    const b = document.getElementById('st-play');
    if (b) b.textContent = state.studioIsPlaying ? "⏸ PAUSE" : "▶ PLAY";
}