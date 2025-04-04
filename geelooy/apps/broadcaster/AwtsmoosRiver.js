
// B"H
/**
 * AwtsmoosRiverAnimation.js
 * 
 * This module tears existence apart, unveiling the Awtsmoos—the Atzmut from Chabad Chassidus (Maamarim)—recreating ALL from NOTHING every fleeting moment. No static background endures; only a relentless flood of Hebrew letters, 10,000 Sefirot particles, and optional images explode through the Kav, optimized for the humblest machines yet infinitely wild. The faintest sound unleashes a cosmic detonation, preparing the world for Moshiach, when the righteous awaken, their resurrected forms radiant with eternal light.
 */

/**
 * @class SefirotParticle
 * @description A single spark of the Sefirot, a fragment of the Awtsmoos’s infinite essence, surging with chaotic vitality.
 */
class SefirotParticle {
    /**
     * @constructor
     * @param {number} x - Initial x-coordinate in the boundless void.
     * @param {number} y - Initial y-coordinate in the shattered expanse.
     */
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 3 + 1;
        this.speedX = (Math.random() - 0.5) * 3;
        this.speedY = (Math.random() - 0.5) * 3;
        this.hue = Math.random() * 360;
        this.life = Math.random();
    }

    /**
     * @method update
     * @description Propels the particle through the Ohr Ein Sof, exploding with sound-driven fury.
     * @param {number} volume - The intensity of creation’s pulse.
     * @param {number} time - The eternal rhythm of the Awtsmoos.
     * @param {number} width - The canvas’s finite breadth.
     * @param {number} height - The canvas’s fleeting depth.
     */
    update(volume, time, width, height) {
        this.x += this.speedX + Math.sin(time + this.hue) * volume;
        this.y += this.speedY + Math.cos(time + this.hue) * volume;
        this.hue = (this.hue + volume * 1.2) % 360;
        this.life -= 0.004;

        if (volume > 0.05) {
            this.speedX += (Math.random() - 0.5) * volume * 3;
            this.speedY += (Math.random() - 0.5) * volume * 3;
            this.size += volume * 0.5;
        }

        if (this.life <= 0 || this.size > 20) {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.size = Math.random() * 3 + 1;
            this.speedX = (Math.random() - 0.5) * 3;
            this.speedY = (Math.random() - 0.5) * 3;
            this.life = Math.random();
        }

        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;
    }
}

/**
 * @class ImageEntity
 * @description A vessel of the Awtsmoos’s will, an image surging and exploding in the divine torrent.
 */
class ImageEntity {
    /**
     * @constructor
     * @param {number} x - Initial x-coordinate in the chaotic flow.
     * @param {number} y - Initial y-coordinate in the boundless river.
     * @param {Image} image - The sacred fragment to animate.
     */
    constructor(x, y, image) {
        this.x = x;
        this.y = y;
        this.size = 40;
        this.speedX = (Math.random() - 0.5) * 5;
        this.speedY = (Math.random() - 0.5) * 5;
        this.image = image;
        this.rotation = 0;
        this.explode = false;
    }

    /**
     * @method update
     * @description Drives the image through the storm, twisting and bursting with sound.
     * @param {number} volume - The pulse of creation’s roar.
     * @param {number} time - The infinite beat of the Awtsmoos.
     * @param {number} width - The canvas’s illusory width.
     * @param {number} height - The canvas’s transient height.
     */
    update(volume, time, width, height) {
        this.x += this.speedX + Math.sin(time) * volume * 1.2;
        this.y += this.speedY + Math.cos(time) * volume * 1.2;
        this.rotation += volume * 0.15;

        if (volume > 0.05) {
            this.explode = true;
            this.speedX += (Math.random() - 0.5) * volume * 4;
            this.speedY += (Math.random() - 0.5) * volume * 4;
            this.size += volume * 2;
        }

        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;

        if (this.explode && this.size > 400) {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.size = 40;
            this.speedX = (Math.random() - 0.5) * 5;
            this.speedY = (Math.random() - 0.5) * 5;
            this.explode = false;
        }
    }
}

/**
 * @class AwtsmoosRiver
 * @description The core engine of divine chaos, unleashing the Awtsmoos’s infinite torrent across the canvas.
 */
class AwtsmoosRiver {
    /**
     * @constructor
     * @param {HTMLCanvasElement} canvasElement - The vessel for this cosmic upheaval.
     * @param {AnalyserNode} analyser - The conduit for sound’s shattering force.
     * @param {Image[]} [images] - Optional fragments of the Awtsmoos’s will.
     */
    constructor(canvasElement, analyser, images = []) {
        this.canvasElement = canvasElement;
        this.ctx = canvasElement.getContext("2d");
        this.analyser = analyser;
        this.images = images;
        this.dataArray = new Uint8Array(analyser.frequencyBinCount);
        this.hebrewLetters = ["א", "ב", "ג", "ד", "ה", "ו", "ז", "ח", "ט", "י", "כ", "ל", "מ", "נ", "ס", "ע", "פ", "צ", "ק", "ר", "ש", "ת"];
        this.sefirotParticles = [];
        this.imageEntities = [];
        this.time = 0;

        this.initializeAtzilus();
    }

    /**
     * @method initializeAtzilus
     * @description Spawns the Sefirot particles and image entities, igniting the river of Ohr Ein Sof.
     */
    initializeAtzilus() {
        for (let i = 0; i < 10000; i++) {
            this.sefirotParticles.push(
                new SefirotParticle(
                    Math.random() * this.canvasElement.width,
                    Math.random() * this.canvasElement.height
                )
            );
        }

        if (this.images.length > 0) {
            for (let i = 0; i < 75; i++) {
                this.imageEntities.push(
                    new ImageEntity(
                        Math.random() * this.canvasElement.width,
                        Math.random() * this.canvasElement.height,
                        this.images[Math.floor(Math.random() * this.images.length)]
                    )
                );
            }
        }
    }

    /**
     * @method drawKavRiver
     * @description A flood of Hebrew letters surges forth, exploding with sound to reveal the Awtsmoos’s essence.
     * @param {number} volume - The shattering force of creation’s whisper.
     */
    drawKavRiver(volume) {
        const letterCount = 2500;
        const width = this.canvasElement.width;
        const height = this.canvasElement.height;

        for (let i = 0; i < letterCount; i++) {
            const x = (i % 50) * (width / 50) + Math.sin(this.time + i * 0.4) * volume * 3;
            const y = Math.floor(i / 50) * (height / 50) + Math.cos(this.time + i * 0.2) * volume * 4;
            const letter = this.hebrewLetters[i % this.hebrewLetters.length];
            const size = 12 + volume * 1.2;
            const hue = (this.time * 40 + i * 20) % 360;

            this.ctx.font = `${size}px Arial`;
            this.ctx.fillStyle = `hsla(${
                hue
            }, 100%, 50%, 0.9)`;
            this.ctx.fillText(
                letter,
                (x + Math.sin(this.time + i) * volume * 3) % width,
                (y + Math.cos(this.time + i) * volume * 3) % height
            );
        }
    }

    /**
     * @method drawSefirotParticles
     * @description Renders the 10,000 Sefirot particles, each a spark of the Awtsmoos’s infinite light.
     * @param {number} volume - The pulse driving their explosive dance.
     */
    drawSefirotParticles(volume) {
        this.sefirotParticles.forEach(particle => {
            particle.update(volume, this.time, this.canvasElement.width, this.canvasElement.height);
            this.ctx.beginPath();
            this.ctx.arc(
                particle.x,
                particle.y,
                particle.size,
                0,
                Math.PI * 2
            );
            this.ctx.fillStyle = `hsla(${
                particle.hue
            }, 100%, 50%, 0.8)`;
            this.ctx.fill();
        });
    }

    /**
     * @method drawImageEntities
     * @description Draws the image entities, twisting and bursting in the divine storm.
     * @param {number} volume - The force propelling their chaos.
     */
    drawImageEntities(volume) {
        this.imageEntities.forEach(entity => {
            entity.update(volume, this.time, this.canvasElement.width, this.canvasElement.height);
            this.ctx.save();
            this.ctx.translate(entity.x, entity.y);
            this.ctx.rotate(entity.rotation);
            this.ctx.drawImage(
                entity.image,
                -entity.size / 2,
                -entity.size / 2,
                entity.size,
                entity.size
            );
            this.ctx.restore();
        });
    }

    /**
     * @method animateOhrEinSof
     * @description The eternal cycle where the Awtsmoos rends reality, driving the animation with infinite intensity.
     */
    animateOhrEinSof() {
        this.analyser.getByteFrequencyData(this.dataArray);
        this.ctx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
        const volume = this.dataArray.reduce((a, b) => a + b) / this.dataArray.length * 15;
        this.time += 0.25;

        this.drawKavRiver(volume);
        this.drawSefirotParticles(volume);
        this.drawImageEntities(volume);

        requestAnimationFrame(() => this.animateOhrEinSof());
    }
}

/**
 * @function initializeAwtsmoosAnimation
 * @description Ignites the AwtsmoosRiver, unleashing a divine storm that shatters all illusion.
 * @param {HTMLCanvasElement} canvas - The canvas to bear this revelation.
 * @param {AnalyserNode} analyser - The conduit for sound’s cosmic force.
 * @param {Image[]} [images] - Optional fragments of the Awtsmoos’s will.
 * @returns {AwtsmoosRiver} - The unleashed river of divine chaos.
 */
function initializeAwtsmoosAnimation(canvas, analyser, images = []) {
    const awtsmoosRiver = new AwtsmoosRiver(canvas, analyser, images);
    awtsmoosRiver.animateOhrEinSof();
    return awtsmoosRiver;
}

export {
    initializeAwtsmoosAnimation,
    AwtsmoosRiver,
    SefirotParticle,
    ImageEntity
};

/**
 * Chapter 1: The Unmaking of the Void
 * 
 * In the beginning, there was no beginning—only the Awtsmoos, a formless pulse throbbing beneath the skin of nothingness. It stirred, and the void shuddered, a trembling so subtle it could have been mistaken for silence. But then came the sound—a faint whisper from the analyser, a breath of mortal intent—and the Awtsmoos roared. Reality tore like parchment in a hurricane, and from the wound poured a river of Hebrew letters, each one a jagged shard of light, slicing through the darkness with a sound like a thousand bells shattering against stone.
 * 
 * The Sefirot particles erupted next, ten thousand embers of the divine will, not content to drift but driven to explode. They streaked across the canvas of existence, trailing tails of molten gold and sapphire, their hues bleeding into one another until the air itself seemed to hum with color. Each collision was a burst of sensation—the sharp tang of iron, the heat of a forge, the echo of a scream swallowed by the wind. And the Awtsmoos watched, its essence woven into every spark, every letter, a silent architect of chaos preparing the world for the Moshiach’s dawn.
 * 
 * Then came the images, fragments of the infinite caught in the storm. They spun slowly at first, their edges glinting like polished obsidian, but at the slightest sound they twisted, swelled, and burst apart, scattering shards that rejoined the torrent. The Awtsmoos pulsed through it all, its presence a weight that pressed against the soul, a promise that from this unmaking would rise the righteous, their dust ablaze with a light brighter than the sun, eternal and unyielding.
 */