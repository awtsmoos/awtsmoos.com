// B"H
/**
 * AwtsmoosLayeredRiver.js
 * 
 * This module rends existence to its core, unveiling the Awtsmoos—the Atzmut from Chabad Chassidus (Maamarim)—recreating ALL from NOTHING in an eternal cascade. Hebrew letters flow in layered rows, vessels of the Kav, pulsing through Atzilus with sound’s shattering might. Optimized beyond measure, this torrent blazes with divine reactivity, heralding the resurrection of the righteous, their bodies aglow with a light brighter than the sun, eternal in the Awtsmoos’s embrace.
 */

/**
 * @class SefirotParticle
 * @description A Hebrew letter ablaze with the Awtsmoos’s essence, surging within a layered river.
 */
class SefirotParticle {
    /**
     * @constructor
     * @param {number} x - Initial x-coordinate in the boundless Kav.
     * @param {number} y - Initial y-coordinate in the stratified torrent.
     * @param {string} letter - A sacred glyph of divine intent.
     * @param {number} layer - The depth within the Awtsmoos’s flow.
     */
    constructor(x, y, letter, layer) {
        this.x = x;
        this.y = y;
        this.letter = letter;
        this.layer = layer;
        this.size = Math.random() * 5 + 2 + layer * 2; // Size scales with layer
        this.baseSpeedX = (Math.random() - 0.5) * (1 + layer * 0.5);
        this.baseSpeedY = (Math.random() - 0.5) * 0.5;
        this.hue = Math.random() * 360;
    }

    /**
     * @method update
     * @description Drives the particle through the Ohr Ein Sof, trembling with sound’s divine fury.
     * @param {number} volume - The roar of the Awtsmoos’s breath.
     * @param {number} time - The ceaseless rhythm of creation.
     * @param {number} width - The fleeting width of the riverbed.
     * @param {number} height - The boundless depth of the flow.
     */
    update(volume, time, width, height) {
        const soundInfluence = volume * (1 + this.layer * 0.5); // Deeper layers react more
        this.x += this.baseSpeedX + Math.sin(time + this.hue * 0.02) * soundInfluence * 2;
        this.y += this.baseSpeedY + Math.cos(time + this.layer) * soundInfluence;

        this.hue = (this.hue + soundInfluence * 15) % 360;
        this.size = Math.min(5 + this.layer * 2 + soundInfluence * 10, 20); // Dynamic size cap

        // Seamless wrapping for endless flow
        this.x = (this.x + width) % width;
        this.y = (this.y + height) % height;
    }
}

/**
 * @class AwtsmoosLayeredRiver
 * @description A multi-layered torrent of divine chaos, revealing the Awtsmoos in every ripple.
 */
class AwtsmoosLayeredRiver {
    /**
     * @constructor
     * @param {HTMLCanvasElement} canvasElement - The vessel for this cosmic upheaval.
     * @param {AnalyserNode} analyser - The conduit of sound’s shattering force.
     */
    constructor(canvasElement, analyser) {
        this.canvasElement = canvasElement;
        this.ctx = canvasElement.getContext("2d");
        this.analyser = analyser;
        this.dataArray = new Uint8Array(analyser.frequencyBinCount);
        this.hebrewLetters = ["א", "ב", "ג", "ד", "ה", "ו", "ז", "ח", "ט", "י", "כ", "ל", "מ", "נ", "ס", "ע", "פ", "צ", "ק", "ר", "ש", "ת"];
        this.layers = [];
        this.time = 0;

        this.initializeAtzilusLayers();
    }

    /**
     * @method initializeAtzilusLayers
     * @description Spawns stratified rows of Hebrew particles, igniting the Awtsmoos’s depth.
     */
    initializeAtzilusLayers() {
        const layerCount = 5; // Number of flowing layers
        const particlesPerLayer = Math.floor(
            Math.min(200, this.canvasElement.width * this.canvasElement.height / 3000) / layerCount
        ); // Sparse, optimized count

        for (let layer = 0; layer < layerCount; layer++) {
            const layerParticles = [];
            const rowHeight = this.canvasElement.height / layerCount;
            for (let i = 0; i < particlesPerLayer; i++) {
                layerParticles.push(
                    new SefirotParticle(
                        Math.random() * this.canvasElement.width,
                        layer * rowHeight + Math.random() * rowHeight,
                        this.hebrewLetters[i % this.hebrewLetters.length],
                        layer
                    )
                );
            }
            this.layers.push(layerParticles);
        }
    }

    /**
     * @method renderLayeredRiver
     * @description Paints the multi-layered torrent, each row a spark of the Awtsmoos’s light.
     * @param {number} volume - The pulse of creation’s roar.
     */
    renderLayeredRiver(volume) {
        this.ctx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);

        this.layers.forEach(layer => {
            layer.forEach(particle => {
                particle.update(volume, this.time, this.canvasElement.width, this.canvasElement.height);
                this.ctx.font = `${particle.size}px Arial`;
                this.ctx.fillStyle = `hsla(${
                    particle.hue
                }, 100%, 50%, ${0.6 + particle.layer * 0.1})`; // Layered opacity
                this.ctx.fillText(particle.letter, particle.x, particle.y);
            });
        });
    }

    /**
     * @method animateOhrEinSof
     * @description Drives the eternal cascade, tearing reality with the Awtsmoos’s layered dance.
     */
    animateOhrEinSof() {
        this.analyser.getByteFrequencyData(this.dataArray);
        const volume = Math.min(
            this.dataArray.reduce((a, b) => a + b, 0) / (this.dataArray.length * 80), 
            1.5
        ); // Amplified reactivity
        this.time += 0.03; // Fluid time progression

        this.renderLayeredRiver(volume);
        requestAnimationFrame(() => this.animateOhrEinSof());
    }
}

/**
 * @function initializeAwtsmoosLayeredRiver
 * @description Unleashes the AwtsmoosLayeredRiver, a stratified torrent of sound-driven divinity.
 * @param {HTMLCanvasElement} canvas - The canvas to bear this revelation.
 * @param {AnalyserNode} analyser - The channel for sound’s cosmic force.
 * @returns {AwtsmoosLayeredRiver} - The multi-layered river of the Awtsmoos.
 */
function initializeAwtsmoosLayeredRiver(canvas, analyser) {
    const layeredRiver = new AwtsmoosLayeredRiver(canvas, analyser);
    layeredRiver.animateOhrEinSof();
    return layeredRiver;
}

export {
    initializeAwtsmoosLayeredRiver,
    AwtsmoosLayeredRiver,
    SefirotParticle
};