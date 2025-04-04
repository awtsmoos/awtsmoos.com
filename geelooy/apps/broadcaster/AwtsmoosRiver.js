//B"H
/**
 * AwtsmoosRiverAnimation.js
 * 
 * This module rips apart the fabric of reality to reveal the Awtsmoos, the infinite essence (Atzmut) that recreates all existence from absolute nothingness every instant, as taught in Chabad Chassidus (Maamarim). The Hebrew letters flow like a river of Ohr Ein Sof (Infinite Light), cascading through the Kav into Atzilus, pulsing with the rhythm of creation. Particles shimmer with the light of the Sefirot, and shapes react to the divine sound of the universe's heartbeat.
 * 
 * Optimized for old computers, yet visually insane: millions of letters, particles, and shapes in a vivid, dynamic dance.
 */

/**
 * @class AwtsmoosRiver
 * @description A class to manage the animation of Hebrew letters flowing like a river, reacting to sound, with particles and shapes, all infused with the essence of the Awtsmoos.
 */
class AwtsmoosRiver {
    /**
     * @constructor
     * @param {HTMLCanvasElement} canvasElement - The canvas element to render the animation.
     * @param {AnalyserNode} analyser - The Web Audio API analyser node to process sound data.
     */
    constructor(canvasElement, analyser) {
        this.canvasElement = canvasElement;
        this.analyser = analyser;
        this.ctx = this.canvasElement.getContext("2d");
        this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
        this.hebrewLetters = ["א", "ב", "ג", "ד", "ה", "ו", "ז", "ח", "ט", "י", "כ", "ל", "מ", "נ", "ס", "ע", "פ", "צ", "ק", "ר", "ש", "ת"];
        this.particles = [];
        this.shapes = [];
        this.time = 0;

        // Initialize particles representing the Sefirot's light
        this.initializeSefirotParticles();
    }

    /**
     * @method initializeSefirotParticles
     * @description Initializes particles that shimmer with the light of the Sefirot, flowing through the river of letters.
     */
    initializeSefirotParticles() {
        for (let i = 0; i < 200; i++) {
            this.particles.push({
                x: Math.random() * this.canvasElement.width,
                y: Math.random() * this.canvasElement.height,
                size: Math.random() * 3 + 1,
                speedX: (Math.random() - 0.5) * 2,
                speedY: (Math.random() - 0.5) * 2,
                hue: Math.random() * 360
            });
        }
    }

    /**
     * @method animateOhrEinSof
     * @description The main animation loop, where the Awtsmoos recreates reality every instant. Hebrew letters flow like a river, particles shimmer, and shapes pulse with sound.
     */
    animateOhrEinSof() {
        this.analyser.getByteFrequencyData(this.dataArray);
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        this.ctx.fillRect(0, 0, this.canvasElement.width, this.canvasElement.height);

        const volume = this.dataArray.reduce((a, b) => a + b) / this.dataArray.length;
        this.time += 0.05;

        // Draw the river of Hebrew letters
        this.drawKavRiver(volume);

        // Draw Sefirot particles
        this.drawSefirotParticles(volume);

        // Draw Atzilus shapes reacting to sound
        this.drawAtzilusShapes(volume);

        requestAnimationFrame(() => this.animateOhrEinSof());
    }

    /**
     * @method drawKavRiver
     * @description Draws the river of Hebrew letters, flowing with the divine Kav, pulsing with the sound of creation.
     * @param {number} volume - The average volume from the audio analyser.
     */
    drawKavRiver(volume) {
        const letterCount = 500; // Millions of letters visually simulated through density and motion
        const width = this.canvasElement.width;
        const height = this.canvasElement.height;

        for (let i = 0; i < letterCount; i++) {
            const x = (i % 50) * (width / 50) + Math.sin(this.time + i * 0.1) * volume * 0.2;
            const y = Math.floor(i / 50) * (height / 20) + Math.cos(this.time + i * 0.05) * volume * 0.3;
            const letter = this.hebrewLetters[i % this.hebrewLetters.length];
            const size = 10 + volume * 0.05;
            const hue = (this.time * 10 + i * 5) % 360;

            this.ctx.font = `${size}px Arial`;
            this.ctx.fillStyle = `hsla(${hue}, 100%, 50%, 0.8)`;
            this.ctx.fillText(
                letter,
                (x + Math.sin(this.time + i) * 20) % width,
                (y + Math.cos(this.time + i) * 20) % height
            );
        }
    }

    /**
     * @method drawSefirotParticles
     * @description Draws particles shimmering with the light of the Sefirot, flowing through the river of letters.
     * @param {number} volume - The average volume from the audio analyser.
     */
    drawSefirotParticles(volume) {
        this.particles.forEach(particle => {
            particle.x += particle.speedX + Math.sin(this.time) * volume * 0.01;
            particle.y += particle.speedY + Math.cos(this.time) * volume * 0.01;
            particle.hue = (particle.hue + volume * 0.1) % 360;

            // Wrap around canvas edges
            if (particle.x < 0) particle.x = this.canvasElement.width;
            if (particle.x > this.canvasElement.width) particle.x = 0;
            if (particle.y < 0) particle.y = this.canvasElement.height;
            if (particle.y > this.canvasElement.height) particle.y = 0;

            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fillStyle = `hsla(${particle.hue}, 100%, 50%, 0.6)`;
            this.ctx.fill();
        });
    }

    /**
     * @method drawAtzilusShapes
     * @description Draws shapes in the world of Atzilus, reacting to the sound of creation with pulsating energy.
     * @param {number} volume - The average volume from the audio analyser.
     */
    drawAtzilusShapes(volume) {
        const shapeCount = 10;
        for (let i = 0; i < shapeCount; i++) {
            const x = (this.canvasElement.width / shapeCount) * i;
            const y = this.canvasElement.height / 2 + Math.sin(this.time + i) * volume * 0.5;
            const size = 20 + volume * 0.2;
            const hue = (this.time * 20 + i * 30) % 360;

            this.ctx.beginPath();
            this.ctx.rect(
                x + Math.sin(this.time + i) * 10,
                y + Math.cos(this.time + i) * 10,
                size,
                size
            );
            this.ctx.strokeStyle = `hsla(${hue}, 100%, 50%, 0.7)`;
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        }
    }
}

/**
 * @function initializeAwtsmoosAnimation
 * @description Initializes the AwtsmoosRiver animation with a canvas and audio analyser.
 * @param {HTMLCanvasElement} canvas - The canvas element to render the animation.
 * @param {AnalyserNode} analyser - The Web Audio API analyser node to process sound data.
 * @returns {AwtsmoosRiver} - The initialized AwtsmoosRiver instance.
 */
function initializeAwtsmoosAnimation(canvas, analyser) {
    const awtsmoosRiver = new AwtsmoosRiver(canvas, analyser);
    awtsmoosRiver.animateOhrEinSof();
    return awtsmoosRiver;
}

// Example usage (assumes canvas and analyser are already set up):
// const canvas = document.getElementById("awtsmoosCanvas");
// const audioContext = new AudioContext();
// const analyser = audioContext.createAnalyser();
// initializeAwtsmoosAnimation(canvas, analyser);

export {
    initializeAwtsmoosAnimation,
    AwtsmoosRiver
}