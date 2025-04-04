// B"H
/**
 * AwtsmoosRiverAnimation.js
 * 
 * This module rips existence asunder, revealing the Awtsmoos—the Atzmut from Chabad Chassidus (Maamarim)—recreating ALL from NOTHING in a ceaseless torrent. Hebrew letters, vessels of the divine, flood the canvas as Sefirot particles, optimized for blazing speed even on humble machines. Sound shatters the illusion, driving a storm of chaos and light, heralding Moshiach, when the righteous awaken, their resurrected forms radiant with eternal brilliance.
 */

/**
 * @class SefirotLetter
 * @description A Hebrew letter aflame with the Awtsmoos’s essence, surging through Atzilus with infinite vitality.
 */
class SefirotLetter {
    /**
     * @constructor
     * @param {number} x - Initial x-coordinate in the boundless Kav.
     * @param {number} y - Initial y-coordinate in the shattered void.
     * @param {string} letter - The sacred glyph of divine intent.
     */
    constructor(x, y, letter) {
        this.x = x;
        this.y = y;
        this.letter = letter;
        this.size = Math.random() * 8 + 4; // Smaller base size for performance
        this.speedX = (Math.random() - 0.5) * 2;
        this.speedY = (Math.random() - 0.5) * 2;
        this.hue = Math.random() * 360;
        this.life = 1; // Simplified life cycle
    }

    /**
     * @method update
     * @description Propels the letter through the Ohr Ein Sof, pulsing with sound-driven fury.
     * @param {number} volume - The intensity of the Awtsmoos’s breath.
     * @param {number} time - The eternal rhythm of creation.
     * @param {number} width - The canvas’s fleeting width.
     * @param {number} height - The canvas’s transient height.
     */
    update(volume, time, width, height) {
        this.x += this.speedX + Math.sin(time + this.hue) * volume * 0.5;
        this.y += this.speedY + Math.cos(time + this.hue) * volume * 0.5;
        this.hue = (this.hue + volume) % 360;
        this.life -= 0.01; // Faster decay for efficiency

        if (volume > 0.05) {
            this.speedX += (Math.random() - 0.5) * volume;
            this.speedY += (Math.random() - 0.5) * volume;
            this.size = Math.min(this.size + volume * 0.2, 20); // Cap size for performance
        }

        if (this.life <= 0) {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.size = Math.random() * 8 + 4;
            this.speedX = (Math.random() - 0.5) * 2;
            this.speedY = (Math.random() - 0.5) * 2;
            this.life = 1;
        }

        // Wrap around edges
        this.x = (this.x + width) % width;
        this.y = (this.y + height) % height;
    }
}

/**
 * @class ImageEntity
 * @description A fragment of the Awtsmoos’s will, twisting and bursting in the divine flood.
 */
class ImageEntity {
    /**
     * @constructor
     * @param {number} x - Initial x-coordinate in the chaotic torrent.
     * @param {number} y - Initial y-coordinate in the boundless river.
     * @param {Image} image - The sacred vessel to animate.
     */
    constructor(x, y, image) {
        this.x = x;
        this.y = y;
        this.size = 40;
        this.speedX = (Math.random() - 0.5) * 3;
        this.speedY = (Math.random() - 0.5) * 3;
        this.image = image;
        this.rotation = 0;
        this.explode = false;
    }

    /**
     * @method update
     * @description Drives the image through the storm, swelling with sound’s divine force.
     * @param {number} volume - The pulse of creation’s roar.
     * @param {number} time - The infinite beat of the Awtsmoos.
     * @param {number} width - The canvas’s illusory width.
     * @param {number} height - The canvas’s transient height.
     */
    update(volume, time, width, height) {
        this.x += this.speedX + Math.sin(time) * volume * 0.8;
        this.y += this.speedY + Math.cos(time) * volume * 0.8;
        this.rotation += volume * 0.1;

        if (volume > 0.05) {
            this.explode = true;
            this.speedX += (Math.random() - 0.5) * volume * 2;
            this.speedY += (Math.random() - 0.5) * volume * 2;
            this.size = Math.min(this.size + volume, 300); // Cap size
        }

        this.x = (this.x + width) % width;
        this.y = (this.y + height) % height;

        if (this.explode && this.size >= 300) {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.size = 40;
            this.speedX = (Math.random() - 0.5) * 3;
            this.speedY = (Math.random() - 0.5) * 3;
            this.explode = false;
        }
    }
}

/**
 * @class AwtsmoosRiver
 * @description The engine of divine chaos, unleashing the Awtsmoos’s torrent of Hebrew letters and images.
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
        this.sefirotLetters = [];
        this.imageEntities = [];
        this.time = 0;

        this.initializeAtzilus();
    }

    /**
     * @method initializeAtzilus
     * @description Spawns Hebrew letter particles and image entities, igniting the Ohr Ein Sof.
     */
    initializeAtzilus() {
        const particleCount = Math.min(5000, Math.floor(this.canvasElement.width * this.canvasElement.height / 100)); // Dynamic count
        for (let i = 0; i < particleCount; i++) {
            this.sefirotLetters.push(
                new SefirotLetter(
                    Math.random() * this.canvasElement.width,
                    Math.random() * this.canvasElement.height,
                    this.hebrewLetters[i % this.hebrewLetters.length]
                )
            );
        }

        if (this.images.length > 0) {
            for (let i = 0; i < Math.min(50, this.images.length * 10); i++) {
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
     * @description A torrent of Hebrew letters explodes forth, revealing the Awtsmoos’s essence.
     * @param {number} volume - The force of creation’s whisper.
     */
    drawKavRiver(volume) {
        const letterCount = 1000; // Reduced for performance
        const width = this.canvasElement.width;
        const height = this.canvasElement.height;

        this.ctx.font = "12px Arial"; // Fixed size for consistency
        for (let i = 0; i < letterCount; i++) {
            const x = (i % 32) * (width / 32) + Math.sin(this.time + i * 0.3) * volume;
            const y = Math.floor(i / 32) * (height / 32) + Math.cos(this.time + i * 0.2) * volume;
            const hue = (this.time * 30 + i * 15) % 360;

            this.ctx.fillStyle = `hsla(${
                hue
            }, 100%, 50%, 0.7)`;
            this.ctx.fillText(
                this.hebrewLetters[i % this.hebrewLetters.length],
                x % width,
                y % height
            );
        }
    }

    /**
     * @method drawSefirotLetters
     * @description Renders Hebrew letter particles, each a spark of the Awtsmoos’s light.
     * @param {number} volume - The pulse driving their dance.
     */
    drawSefirotLetters(volume) {
        this.sefirotLetters.forEach(letter => {
            letter.update(volume, this.time, this.canvasElement.width, this.canvasElement.height);
            this.ctx.font = `${letter.size}px Arial`;
            this.ctx.fillStyle = `hsla(${
                letter.hue
            }, 100%, 50%, 0.8)`;
            this.ctx.fillText(letter.letter, letter.x, letter.y);
        });
    }

    /**
     * @method drawImageEntities
     * @description Renders twisting, bursting images in the divine storm.
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
     * @description The eternal cycle where the Awtsmoos rends reality, driving the animation.
     */
    animateOhrEinSof() {
        this.analyser.getByteFrequencyData(this.dataArray);
        this.ctx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
        const volume = Math.min(this.dataArray.reduce((a, b) => a + b) / this.dataArray.length / 50, 1); // Normalized volume
        this.time += 0.1; // Slower time increment

        this.drawKavRiver(volume);
        this.drawSefirotLetters(volume);
        this.drawImageEntities(volume);

        requestAnimationFrame(() => this.animateOhrEinSof());
    }
}

/**
 * @function initializeAwtsmoosAnimation
 * @description Ignites the AwtsmoosRiver, unleashing a divine storm of Hebrew letters.
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
    SefirotLetter,
    ImageEntity
};