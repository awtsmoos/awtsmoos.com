//B"H
// modules/studio/render/layers.js
import { ctx } from '../context.js';
import state from '../../state.js';

export function drawMedia(g, layer, w, h) {
    let media = ctx.mediaCache[layer.src];
    if (!media) {
        if (layer.type === 'image') {
            const img = new Image();
            img.src = layer.src;
            media = { el: img, type: 'image', ready: false };
            img.onload = () => media.ready = true;
        } else if (layer.type === 'video') {
            const vid = document.createElement('video');
            vid.src = layer.src;
            vid.muted = true;
            vid.playsInline = true;
            vid.loop = true; 
            media = { el: vid, type: 'video', ready: false };
            vid.onloadeddata = () => media.ready = true;
        }
        ctx.mediaCache[layer.src] = media;
    }

    if (media.ready) {
        g.save();
        g.globalAlpha = layer.opacity !== undefined ? layer.opacity : 1.0;
        g.globalCompositeOperation = layer.blendMode || 'source-over';
        
        const f = layer.filter || {};
        g.filter = `brightness(${f.brightness || 100}%) blur(${f.blur || 0}px)`;

        // --- ASPECT RATIO FIX ---
        // Do NOT stretch to w/h. Use native dimensions scaled.
        let drawW, drawH;
        if (media.type === 'image') {
            drawW = media.el.naturalWidth;
            drawH = media.el.naturalHeight;
        } else {
            drawW = media.el.videoWidth;
            drawH = media.el.videoHeight;
        }

        const scale = layer.scale || 1.0;
        drawW *= scale;
        drawH *= scale;

        // Coordinates: Center of Image at (layer.x * canvasW, layer.y * canvasH)
        const x = (layer.x !== undefined ? layer.x : 0.5) * w;
        const y = (layer.y !== undefined ? layer.y : 0.5) * h;
        
        g.translate(x, y);
        g.rotate((layer.rotation || 0) * Math.PI / 180);
        
        if (f.hologram) {
            g.globalAlpha *= 0.8;
            g.filter += ` hue-rotate(180deg) contrast(150%)`;
        }

        if (media.type === 'video') {
            if (media.el.readyState >= 2) {
                 const trackTime = state.currentTime - layer.start;
                 const vidTime = trackTime * (layer.speed || 1.0);
                 if (!state.studioIsPlaying && Math.abs(media.el.currentTime - vidTime) > 0.1) {
                     media.el.currentTime = vidTime;
                 }
                 g.drawImage(media.el, -drawW/2, -drawH/2, drawW, drawH);
            }
        } else {
            g.drawImage(media.el, -drawW/2, -drawH/2, drawW, drawH);
        }
        
        if (f.hologram) {
            g.fillStyle = 'rgba(0, 255, 255, 0.1)';
            for(let i=-drawH/2; i<drawH/2; i+=10) g.fillRect(-drawW/2, i, drawW, 2);
        }
        g.restore();
    }
}