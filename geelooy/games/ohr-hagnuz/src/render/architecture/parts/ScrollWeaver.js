
/**
 * B"H
 * @class ScrollWeaver
 * @chapter The Pillars of Intellect
 * @description
 * In Beriah, physical walls do not exist. Boundaries are formed by massive, rolled parchment scrolls.
 */
export class ScrollWeaver {
    static draw(ctx, size, seed) {
        // Base Parchment Color
        ctx.fillStyle = '#fff9c4';
        ctx.fillRect(0, 0, size, size);

        // The wooden roller (Etz Chaim) at the edges
        ctx.fillStyle = '#5d4037';
        ctx.fillRect(0, 0, size * 0.1, size);
        ctx.fillRect(size * 0.9, 0, size * 0.1, size);

        // Wooden handles
        ctx.fillStyle = '#3e2723';
        ctx.beginPath(); ctx.arc(size * 0.05, 0, size * 0.08, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(size * 0.95, 0, size * 0.08, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(size * 0.05, size, size * 0.08, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(size * 0.95, size, size * 0.08, 0, Math.PI * 2); ctx.fill();

        // Dark text blocks representing Torah columns
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        const numLines = 6;
        const lineH = size / (numLines + 2);
        for(let i=1; i<=numLines; i++) {
            const y = i * lineH;
            ctx.fillRect(size * 0.2, y, size * 0.25, lineH * 0.6);
            ctx.fillRect(size * 0.55, y, size * 0.25, lineH * 0.6);
        }
    }
}
