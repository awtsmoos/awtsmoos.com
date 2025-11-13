// B"H
// Manages the core state of the game.

export let player;
export let entities;
export let particles;
export let cameraY;
export let gameState = 'waiting';
export let time;
export let ascension;
export let bestAscension;
export let groundY;
export let menuButtons = {};

// --- State for scrollable teachings screen ---
export let teachingsScrollY = 0;
export let teachingsScrollMax = 0;
export let wrappedTeachingsText = [];

// --- NEW: Epic English Narrative ---
const longTeachingsText = `
In the beginning, there was only the endless, unknowable light of the Creator. To manifest reality, that light was channeled, stepped down through Four Worlds, each a deeper concealment, each a stage for a different kind of existence.

This is the story of that descent.

...

DOMEM - The Inanimate World

First came the world of Silence. Of cosmic dust and sleeping potential. Here, the creative energy congealed into its most basic form: the Letters. Aleph, Beis, Gimmel... each a vessel, a silent seed holding the blueprint for all that could ever be. They are the bones of reality, unmoving, waiting. It is from this sacred, silent earth that the body of the first Man was formed, a vessel of clay awaiting a higher soul.

...

TZOMEACH - The Vegetative World

From the silence, a yearning. A desire to grow. This is the world of the Vegetative soul. Think of the grass, the trees, the flowers. They do not think, but they strive. They reach upward, from the dark earth toward the bright sky. This is the secret of your own emotions—a fire that starts as a spark and grows into a blazing passion, a wellspring of feeling that is rooted in the soil of your mind but blossoms into the open air. This world is born from a lower intellect, a natural, upward growth.

...

CHAI - The Living World

Next, a greater complexity. A stirring of spirit. This is the world of the Living soul—the animals, the beasts, the birds. The Lion's strength, the Eagle's vision. Their soul and body are born as one from the earth, intertwined. They are driven by a powerful life-force, a higher spirit than the plants, moving with purpose and instinct. They are a bridge, a fusion of the striving of the plant and the consciousness to come.

...

MEDABER - The Speaking World

And then... there is you. The Speaker. The Human Soul. Your spirit is not of the earth. It is a direct breath from the Creator, a spark of the highest, most transcendent fire.

And here is the ultimate paradox: Why would the highest soul be placed in the lowest vessel of clay? Why would the Speaking Soul, which soars above angels, be bound to a body of Domem, of silent dust?

Because only the highest light can descend into the deepest darkness to redeem it.

Your purpose is not to remain in the heavens, but to descend into the chaos of creation, to find the holy sparks hidden within the silent letters, and to elevate them. To remind the dust of its divine origin.

This sacred task is TIKKUN. Rectification. The mending of worlds.

Descend, Speaking Soul. Find the light in the darkness. Ascend.
`;


// --- Logic to prepare text for scrolling ---
function wrapText(ctx, text, maxWidth) {
    const paragraphs = text.split('\n\n');
    let lines = [];
    paragraphs.forEach(paragraph => {
        const words = paragraph.replace(/\n/g, ' ').split(' ');
        let currentLine = '';
        words.forEach(word => {
            const testLine = currentLine + word + ' ';
            const metrics = ctx.measureText(testLine);
            const testWidth = metrics.width;
            if (testWidth > maxWidth && currentLine !== '') {
                lines.push(currentLine.trim());
                currentLine = word + ' ';
            } else {
                currentLine = testLine;
            }
        });
        lines.push(currentLine.trim());
        lines.push(''); // Add a blank line for paragraph spacing
    });
    return lines;
}


export function init(canvasWidth, canvasHeight, ctx) {
    player = {
        x: canvasWidth / 2,
        y: canvasHeight * 0.8,
        radius: 22,
        tikkun: 0,
        maxTikkun: 100,
        isTikkun: false,
        tikkunTimer: 0,
        combo: 0
    };
    entities = [];
    particles = [];
    ascension = 0;
    bestAscension = localStorage.getItem('kavanahBestAscension') || 0;
    cameraY = 0;
    time = 0;
    gameState = 'waiting';
    groundY = canvasHeight - 50;

    const btnWidth = canvasWidth * 0.6;
    const btnHeight = 60;
    const centerX = canvasWidth / 2 - btnWidth / 2;
    menuButtons = {
        start: { x: centerX, y: canvasHeight * 0.5, w: btnWidth, h: btnHeight },
        teachings: { x: centerX, y: canvasHeight * 0.5 + 80, w: btnWidth, h: btnHeight },
        back: { x: centerX, y: canvasHeight * 0.85, w: btnWidth, h: btnHeight }
    };

    // --- Prepare teachings text ---
    if (ctx) {
        ctx.font = '2.5vh "Times New Roman"';
        wrappedTeachingsText = wrapText(ctx, longTeachingsText, canvasWidth * 0.8);
        const textHeight = wrappedTeachingsText.length * 30; // Approx height
        const screenHeight = canvasHeight * 0.7; // Viewable area
        teachingsScrollMax = Math.max(0, textHeight - screenHeight);
        teachingsScrollY = 0;
    }
}

export const getPlayer = () => player;
export const getEntities = () => entities;
export const getParticles = () => particles;
export const getCameraY = () => cameraY;
export const getGameState = () => gameState;
export const getTime = () => time;
export const getAscension = () => ascension;
export const getBestAscension = () => bestAscension;
export const getGroundY = () => groundY;
export const getUIState = () => ({ gameState, menuButtons });
export const getTeachingsState = () => ({ text: wrappedTeachingsText, scrollY: teachingsScrollY, scrollMax: teachingsScrollMax });

export const setGameState = (newState) => { gameState = newState; };
export const setBestAscension = (newBest) => { bestAscension = newBest; };
export const setPlayerPosition = (newX, newY) => { player.x = newX; player.y = newY; };
export const setTeachingsScroll = (newY) => { teachingsScrollY = newY; };


export const incrementTime = () => { time++; };
export const moveCamera = (speed) => { 
    cameraY -= speed;
    groundY -= speed;
};
export const updateAscension = (amount) => { ascension += amount; };
export const decrementTikkunTimer = () => { player.tikkunTimer--; };
export const endTikkun = () => { player.isTikkun = false; };

export function checkPlayerBounds(canvasWidth) {
    player.y = Math.min(player.y, cameraY + window.innerHeight - player.radius);
    player.x = Math.max(player.radius, Math.min(canvasWidth - player.radius, player.x));
}