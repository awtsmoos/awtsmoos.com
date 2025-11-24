//B"H

import * as C from './constants.js';

export let y = C.DOVE_START_Y;
export let velocity = 0;

const doveImage = new Image();
doveImage.src = 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🕊️</text></svg>';



export function flap() {
    velocity = C.LIFT;
}

//B"H
export function reset() {
    y = C.DOVE_START_Y(); // This is now a function
    velocity = 0;
}

export function update() {
    velocity += C.GRAVITY;
    y += velocity;

    // Prevent going above the screen using the new radius
    if (y < C.DOVE_RADIUS) {
        y = C.DOVE_RADIUS;
        velocity = 0;
    }
}

export function draw(ctx) {
    const maxRotation = Math.PI / 4;
    const minRotation = -Math.PI / 6;
    let rotation = velocity * 0.05;

    if (rotation > maxRotation) rotation = maxRotation;
    if (rotation < minRotation) rotation = minRotation;

    ctx.save();
    ctx.translate(C.DOVE_START_X(), y);
    ctx.rotate(rotation);
    
    
    ctx.drawImage(doveImage, -C.DOVE_WIDTH / 2, -C.DOVE_HEIGHT / 2, C.DOVE_WIDTH, C.DOVE_HEIGHT);
    ctx.restore();
}