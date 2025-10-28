//B"H

// js/particles.js

const HEBREW_LETTERS = Array.from("אבגדהוזחטיכלמנסעפצקרשת");
// Create the emoji array correctly using Array.from()
const emojiString = "🥎⚽⚾🏀🎱🏉🏐😀😃😄"+
"😁😆😅😂🤣😭🙃🙂🫠😊🥹"+
"☺️😌🙂‍↕️😏🙂‍↔️🥴🤪😐😑🥺🫡🤔"+
"🤫🫢🤭🤗🫣😱😡🤬😠😤🧐🤨😨"+
"😰😟😥😢🙁🫤😕😯😦😦🤯😳😫"+
"😩😖😵‍💫🥶🫩🤢🤥😇🤠🤓😎🥸🤒"+
"🤧🌚🌝🌼🌿🌸💮🌍🌎🌏🌜🌚🌝🌞"+
"☀️🌑🌒🌓🌕🌖🌗🌘🐯🐵🙈🙈🐻"+
"🐻‍❄️🐨🐼🐭🦊🦝🦝🐲🫎🦄🦓🐗"+
"🐮🦎🐉🦖🐢🐊🐸🐖🐕‍🦺🐩🐈‍⬛🐈🐶"+
"🐺🐶🦣🐘🦘🦙🦌🦣🦛🦒🐿️🐿️🐪🦧🐒"+
"🐅🐆🐓🐣🐥🦜🐧🦃🐦‍🔥🪿🦤🦭🦈"+
"🐠🐡🪸🦟🐌🐚🍎🍅🍓🍑🍊🍈🍐"+
"🥝🍏🥭🥯🍔🥞🍪🥮🧭🛞🛟⚓🚘🧶";
const ballEmojis = Array.from(emojiString);

const MAX_PARTICLES = 300; // The maximum number of particles on screen at once
const particlePool = []; // Our object pool

// Initialize the particle pool ONCE at the start.
for (let i = 0; i < MAX_PARTICLES; i++) {
    particlePool.push({
        active: false,
        x: 0, y: 0,
        dx: 0, dy: 0,
        life: 0,
        size: 0,
        char: '',
        alpha: 1
    });
}

function createParticleExplosion(x, y) {
    const particlesToCreate = 25;
    let createdCount = 0;

    for (let i = 0; i < MAX_PARTICLES; i++) {
        if (createdCount >= particlesToCreate) break; // Stop when we've created enough

        const p = particlePool[i];
        if (!p.active) {
            // --- REVIVE THE PARTICLE ---
            p.active = true;
            p.x = x;
            p.y = y;
            p.dx = (Math.random() - 0.5) * 8; // Horizontal velocity
            p.dy = (Math.random() - 0.5) * 8; // Vertical velocity
            p.life = Math.random() * 30 + 30; // Lifespan in frames
            p.size = Math.random() * 12 + 6;
            p.char = HEBREW_LETTERS[Math.floor(Math.random() * HEBREW_LETTERS.length)];
            p.alpha = 1;
            createdCount++;
        }
    }
}

function updateAndDrawParticles(context) {
    context.textAlign = 'center';
    context.textBaseline = 'middle';

    for (let i = 0; i < MAX_PARTICLES; i++) {
        const p = particlePool[i];

        if (p.active) {
            // Update physics
            p.x += p.dx;
            p.y += p.dy;
            p.dy += 0.1; // A little gravity
            p.dx *= 0.98; // Air friction
            p.life--;
            p.alpha = p.life / 60; // Fade out

            // Deactivate if life is over
            if (p.life <= 0) {
                p.active = false;
                continue;
            }

            // Draw the particle
            context.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
            context.font = `${p.size}px Arial`;
            context.fillText(p.char, p.x, p.y);
        }
    }
}