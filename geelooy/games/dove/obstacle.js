//B"H
import * as C from './constants.js';

export let obstacles = [];

export function reset() {
    obstacles = [];
}

export function spawn() {
    const emoji = C.OBSTACLE_EMOJIS[Math.floor(Math.random() * C.OBSTACLE_EMOJIS.length)];
    const topHeight = Math.random() * (C.CANVAS_HEIGHT - C.OBSTACLE_GAP - 100) + 50;

    obstacles.push({
        x: -C.OBSTACLE_WIDTH,
        topHeight: topHeight,
        bottomY: topHeight + C.OBSTACLE_GAP,
        emoji: emoji,
        passed: false
    });
}

export function update() {
    obstacles.forEach(obs => {
        obs.x += C.OBSTACLE_SPEED;
    });

    // Remove obstacles that have gone off-screen
    if (obstacles.length > 0 && obstacles[0].x > C.CANVAS_WIDTH) {
        obstacles.shift();
    }
}

//B"H
export function draw(ctx) {
    ctx.font = '40px sans-serif';
    ctx.textAlign = 'center';
    
    obstacles.forEach(obs => {
        const emojiSize = 40;

        // Draw top obstacle, aligning the bottom of the emojis
        ctx.textBaseline = 'bottom';
        for (let y = obs.topHeight; y > 0; y -= emojiSize) {
            ctx.fillText(obs.emoji, obs.x + C.OBSTACLE_WIDTH / 2, y);
        }

        // Draw bottom obstacle, aligning the top of the emojis
        ctx.textBaseline = 'top';
        for (let y = obs.bottomY; y < C.CANVAS_HEIGHT; y += emojiSize) {
            ctx.fillText(obs.emoji, obs.x + C.OBSTACLE_WIDTH / 2, y);
        }
    });

    // Reset textBaseline so it doesn't affect other text like the score
    ctx.textBaseline = 'alphabetic';
}
