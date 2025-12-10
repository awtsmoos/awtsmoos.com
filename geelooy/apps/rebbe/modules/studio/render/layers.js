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

        const scale = layer.scale || 1.0;
        const x = (layer.x || 0.5) * w;
        const y = (layer.y || 0.5) * h;
        
        g.translate(x, y);
        g.scale(scale, scale);
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
                 g.drawImage(media.el, -w/2, -h/2, w, h);
            }
        } else {
            g.drawImage(media.el, -w/2, -h/2, w, h);
        }
        
        if (f.hologram) {
            g.fillStyle = 'rgba(0, 255, 255, 0.1)';
            for(let i=-h/2; i<h/2; i+=10) g.fillRect(-w/2, i, w, 2);
        }
        g.restore();
    }
}