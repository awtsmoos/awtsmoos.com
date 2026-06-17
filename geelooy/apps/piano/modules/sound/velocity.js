/* B"H
Velocity is the secret handshake between finger and star.
*/

export function createVelocity(inputId = '', coords = null) {
    let base = 0.86 + Math.random() * 0.22;
    if (coords && Number.isFinite(coords.y)) {
        const y = Math.max(0, Math.min(1, coords.y / 180));
        base = 0.72 + y * 0.34;
    }
    if (String(inputId).startsWith('kb-')) base = 0.92 + Math.random() * 0.12;
    return Math.max(0.55, Math.min(1.18, base));
}

export function humanize(preset, velocity) {
    const drift = (Math.random() - 0.5) * preset.driftCents;
    const pan = (Math.random() - 0.5) * preset.stereoSpread;
    const brightness = 0.78 + velocity * 0.35;
    return { drift, pan, brightness };
}
