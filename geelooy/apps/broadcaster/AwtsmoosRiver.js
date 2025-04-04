// B"H
/**
 * AwtsmoosRiverFlow.js
 * 
 * This module shatters existence, unveiling the Awtsmoos—the Atzmut from Chabad Chassidus (Maamarim)—recreating ALL from NOTHING every instant. Hebrew letters cascade as vessels of the Kav, flowing ceaselessly through Atzilus, driven by sound’s divine breath. Optimized to the infinite, this river surges with the light of Moshiach, when the righteous rise, their bodies reborn from dust, shining brighter than the sun, eternal in the Awtsmoos’s embrace.
 */

/**
 * @class SefirotParticle
 * @description A Hebrew letter aflame with the Awtsmoos’s vitality, flowing through the boundless torrent.
 */
class SefirotParticle {
    /**
     * @constructor
     * @param {number} x - Starting x-coordinate in the infinite Kav.
     * @param {number} y - Starting y-coordinate in the divine river.
     * @param {string} letter - A sacred glyph of the Awtsmoos’s will.
     */
    constructor(x, y, letter) {
        this.x = x;
        this.y = y;
        this.letter = letter;
        this.size = Math.random() * 6 + 3; // Smaller, tighter range for speed
        this.baseSpeedX = (Math.random() - 0.5) * 1.5;
        this.baseSpeedY = (Math.random() - 0.5) * 1.5;
        this.hue = Math.random() * 360;
    }

    /**
     * @method update
     * @description Flows the particle through the Ohr Ein Sof, reacting to sound’s divine pulse.
     * @param {number} volume - The breath of the Awtsmoos’s roar.
     * @param {number} time - The eternal rhythm of recreation.
     * @param {number} width - The fleeting boundary of the canvas.
     * @param {number} height - The transient depth of the river.
     */
    update(volume, time, width, height) {
        const soundInfluence = volume * 0.3;
        this.x += this.baseSpeedX + Math.sin(time + this.hue * 0.01) * soundInfluence;
        this.y += this.baseSpeedY + Math.cos(time + this.hue * 0.01) * soundInfluence;
        this.hue = (this.hue + soundInfluence * 10) % 360;

        // Seamless wrapping for continuous flow
        this.x = (this.x + width) % width;
        this.y = (this.y + height) % height;
    }
}

/**
 * @class AwtsmoosRiverFlow
 * @description The divine engine of an endless torrent, revealing the Awtsmoos in every ripple.
 */
class AwtsmoosRiverFlow {
    /**
     * @constructor
     * @param {HTMLCanvasElement} canvasElement - The vessel for this cosmic river.
     * @param {AnalyserNode} analyser - The conduit of sound’s shattering force.
     */
    constructor(canvasElement, analyser) {
        this.canvasElement = canvasElement;
        this.ctx = canvasElement.getContext("2d");
        this.analyser = analyser;
        this.dataArray = new Uint8Array(analyser.frequencyBinCount);
        this.hebrewLetters = ["א", "ב", "ג", "ד", "ה", "ו", "ז", "ח", "ט", "י", "כ", "ל", "מ", "נ", "ס", "ע", "פ", "צ", "ק", "ר", "ש", "ת"];
        this.sefirotParticles = [];
        this.time = 0;

        this.initializeAtzilusFlow();
    }

    /**
     * @method initializeAtzilusFlow
     * @description Spawns a river of Hebrew particles, igniting the Awtsmoos’s endless current.
     */
    initializeAtzilusFlow() {
        const particleCount = Math.min(
            150, 
            Math.floor(this.canvasElement.width * this.canvasElement.height / 2000) // Sparse for performance
        );
        for (let i = 0; i < particleCount; i++) {
            this.sefirotParticles.push(
                new SefirotParticle(
                    Math.random() * this.canvasElement.width,
                    Math.random() * this.canvasElement.height,
                    this.hebrewLetters[i % this.hebrewLetters.length]
                )
            );
        }
    }

    /**
     * @method renderRiver
     * @description Paints the torrent of Hebrew particles, each a spark of the Awtsmoos’s light.
     * @param {number} volume - The pulse of creation’s song.
     */
    renderRiver(volume) {
        this.ctx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
        
        this.sefirotParticles.forEach(particle => {
            particle.update(volume, this.time, this.canvasElement.width, this.canvasElement.height);
            this.ctx.font = `${particle.size}px Arial`;
            this.ctx.fillStyle = `hsla(${
                particle.hue
            }, 100%, 50%, 0.9)`;
            this.ctx.fillText(particle.letter, particle.x, particle.y);
        });
    }

    /**
     * @method animateOhrEinSof
     * @description Drives the eternal flow, rending reality with the Awtsmoos’s ceaseless dance.
     */
    animateOhrEinSof() {
        this.analyser.getByteFrequencyData(this.dataArray);
        const volume = Math.min(
            this.dataArray.reduce((a, b) => a + b, 0) / (this.dataArray.length * 100), 
            1
        ); // Smoother volume scaling
        this.time += 0.02; // Slower, fluid time progression

        this.renderRiver(volume);
        requestAnimationFrame(() => this.animateOhrEinSof());
    }
}

/**
 * @function initializeAwtsmoosRiverFlow
 * @description Unleashes the AwtsmoosRiverFlow, a ceaseless divine current driven by sound.
 * @param {HTMLCanvasElement} canvas - The canvas to hold this revelation.
 * @param {AnalyserNode} analyser - The channel for sound’s cosmic force.
 * @returns {AwtsmoosRiverFlow} - The infinite river of the Awtsmoos.
 */
function initializeAwtsmoosRiver(canvas, analyser) {
    const riverFlow = new AwtsmoosRiverFlow(canvas, analyser);
    riverFlow.animateOhrEinSof();
    return riverFlow;
}

export {
    initializeAwtsmoosRiver,
    AwtsmoosRiverFlow,
    SefirotParticle
};