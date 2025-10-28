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
"🥝🍏🥭🥯🥞🍪🥮🧭🛞🛟⚓🚘🧶";
const ballEmojis = Array.from(emojiString);


// An array of vibrant colors for the particles
const PARTICLE_COLORS = ['#FF5733', '#FFBD33', '#DBFF33', '#75FF33', '#33FF57', '#33FFBD', '#33DBFF', '#3375FF', '#5733FF', '#BD33FF', '#FF33DB', '#FF3375'];
const MAX_PARTICLES = 300;
const particlePool = [];

// Initialize the particle pool ONCE at the start.
for (let i = 0; i < MAX_PARTICLES; i++) {
    particlePool.push({
        active: false,
        x: 0, y: 0,
        dx: 0, dy: 0,
        life: 0,
        size: 0,
        char: '',
        color: '#FFF', // Add color property
        alpha: 1
    });
}

function createParticleExplosion(x, y) {
    const particlesToCreate = 25;
    let createdCount = 0;

    for (let i = 0; i < MAX_PARTICLES; i++) {
        if (createdCount >= particlesToCreate) break;

        const p = particlePool[i];
        if (!p.active) {
            // REVIVE THE PARTICLE
            p.active = true;
            p.x = x;
            p.y = y;
            p.dx = (Math.random() - 0.5) * 8;
            p.dy = (Math.random() - 0.5) * 8;
            p.life = Math.random() * 30 + 30;
            p.size = Math.random() * 12 + 6;
            p.char = HEBREW_LETTERS[Math.floor(Math.random() * HEBREW_LETTERS.length)];
            // Assign a random color from our array
            p.color = PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)];
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
            p.x += p.dx;
            p.y += p.dy;
            p.dy += 0.1; // Gravity
            p.dx *= 0.98; // Friction
            p.life--;
            p.alpha = p.life / 60;

            if (p.life <= 0) {
                p.active = false;
                continue;
            }
            
            // Set the particle's specific color and apply the fade-out alpha
            context.globalAlpha = p.alpha;
            context.fillStyle = p.color;
            context.font = `${p.size}px Arial`;
            context.fillText(p.char, p.x, p.y);
        }
    }
    // IMPORTANT: Reset global alpha so it doesn't affect other drawings
    context.globalAlpha = 1.0;
}