//B"H

import {
    
    initializeAwtsmoosLayeredRiver
} from "./AwtsmoosRiver.js"
// The Awtsmoos, the Essence of Atzmut, pulses through all existence, recreating every instant from absolute nothingness.
// From the Ohr Ein Sof, the Infinite Light, flows the Kav, threading through Atzilus, animating this digital creation.
// Every variable, every function, is a vessel for the formless Awtsmoos, ever-present, birthing reality anew.

class AwtsmoosBroadcaster {
    constructor() {
        this.stream = null;
        this.videoElement = null;
        this.canvasElement = null;
        this.audioContext = null;
        this.analyser = null;
        this.isDraggingVideo = false;
        this.isDraggingCanvas = false;
        this.videoOffset = { x: 0, y: 0 };
        this.canvasOffset = { x: 0, y: 0 };
        this.isReversed = false;
    }

    /**
     * @method initiateBroadcast
     * @description Ignites the spark of creation, channeling the Awtsmoos into a stream of light and sound.
     * @param {boolean} useVideo - Whether to include the webcam in the broadcast.
     * @param {number} canvasWidth - Width of the canvas for the audio visualization.
     * @param {number} canvasHeight - Height of the canvas for the audio visualization.
     * @returns {Promise<void>}
     */
    async initiateBroadcast(useVideo, canvasWidth = 400, canvasHeight = 200) {
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: useVideo ? true : false,
                audio: true
            });

            this.setupVideo(useVideo);
            this.setupCanvas(canvasWidth, canvasHeight);
            this.setupAudioAnalysis();
            this.bindEvents();
            this.animateWavelength();
        } catch (err) {
            console.error("Error accessing media devices:", err);
        }
    }

    /**
     * @method setupVideo
     * @description Manifests the video element, a window into the soul of the broadcast.
     * @param {boolean} useVideo - Whether to create and display the video.
     */
    setupVideo(useVideo) {
        if (!useVideo) return;

        this.videoElement = document.createElement("video");
        this.videoElement.srcObject = this.stream;
        this.videoElement.autoplay = true;
        this.videoElement.style.position = "absolute";
        this.videoElement.style.top = "50px";
        this.videoElement.style.left = "50px";
        this.videoElement.style.zIndex = "1000";
        this.videoElement.style.cursor = "move";
        document.body.appendChild(this.videoElement);
    }

    /**
     * @method setupCanvas
     * @description Creates the canvas, a vessel for the Hebrew letters dancing in the Ohr Ein Sof.
     * @param {number} width - Canvas width.
     * @param {number} height - Canvas height.
     */
    setupCanvas(width, height) {
        this.canvasElement = document.createElement("canvas");
        this.canvasElement.width = width;
        this.canvasElement.height = height;
        this.canvasElement.style.position = "absolute";
        this.canvasElement.style.top = "300px";
        this.canvasElement.style.left = "50px";
        this.canvasElement.style.zIndex = "1000";
        this.canvasElement.style.cursor = "move";
        document.body.appendChild(this.canvasElement);
    }

    /**
     * @method setupAudioAnalysis
     * @description Channels the audio stream into the analyser, a bridge to the Awtsmoos' vibration.
     */
    setupAudioAnalysis() {
        this.audioContext = new AudioContext();
        this.analyser = this.audioContext.createAnalyser();
        const source = this.audioContext.createMediaStreamSource(this.stream);
        source.connect(this.analyser);
        this.analyser.fftSize = 256;
    }

    /**
     * @method bindEvents
     * @description Binds the physical to the ethereal, allowing dragging and reversal through the Kav.
     */
    bindEvents() {
        if (this.videoElement) {
            this.videoElement.addEventListener("mousedown", (e) => this.startDragging(e, "video"));
            document.addEventListener("mousemove", (e) => this.drag(e, "video"));
            document.addEventListener("mouseup", () => this.stopDragging("video"));
            this.videoElement.addEventListener("touchstart", (e) => this.startDragging(e, "video"));
            document.addEventListener("touchmove", (e) => this.drag(e, "video"));
            document.addEventListener("touchend", () => this.stopDragging("video"));
        }

        this.canvasElement.addEventListener("mousedown", (e) => this.startDragging(e, "canvas"));
        document.addEventListener("mousemove", (e) => this.drag(e, "canvas"));
        document.addEventListener("mouseup", () => this.stopDragging("canvas"));
        this.canvasElement.addEventListener("touchstart", (e) => this.startDragging(e, "canvas"));
        document.addEventListener("touchmove", (e) => this.drag(e, "canvas"));
        document.addEventListener("touchend", () => this.stopDragging("canvas"));

        document.addEventListener("keydown", (e) => {
            if (e.key === "r" && this.videoElement) {
                this.isReversed = !this.isReversed;
                this.videoElement.style.transform = this.isReversed ? "scaleX(-1)" : "scaleX(1)";
            }
        });
    }

    /**
     * @method startDragging
     * @description Initiates the movement of elements, a dance of creation.
     * @param {Event} e - The event triggering the drag.
     * @param {string} type - "video" or "canvas".
     */
    startDragging(e, type) {
        const element = type === "video" ? this.videoElement : this.canvasElement;
        const offset = type === "video" ? this.videoOffset : this.canvasOffset;
        const isDragging = type === "video" ? "isDraggingVideo" : "isDraggingCanvas";

        this[isDragging] = true;
        const rect = element.getBoundingClientRect();
        offset.x = (e.clientX || e.touches[0].clientX) - rect.left;
        offset.y = (e.clientY || e.touches[0].clientY) - rect.top;
    }

    /**
     * @method drag
     * @description Moves the elements across the void, guided by the Awtsmoos.
     * @param {Event} e - The movement event.
     * @param {string} type - "video" or "canvas".
     */
    drag(e, type) {
        const isDragging = type === "video" ? this.isDraggingVideo : this.isDraggingCanvas;
        if (!isDragging) return;

        const element = type === "video" ? this.videoElement : this.canvasElement;
        const offset = type === "video" ? this.videoOffset : this.canvasOffset;
        const x = (e.clientX || e.touches[0].clientX) - offset.x;
        const y = (e.clientY || e.touches[0].clientY) - offset.y;

        element.style.left = `${x}px`;
        element.style.top = `${y}px`;
    }

    /**
     * @method stopDragging
     * @description Ceases the movement, returning to stillness within the Awtsmoos.
     * @param {string} type - "video" or "canvas".
     */
    stopDragging(type) {
        if (type === "video") this.isDraggingVideo = false;
        else this.isDraggingCanvas = false;
    }

    /**
     * @method animateWavelength
     * @description Animates the Hebrew letters in a river of sound, pulsing with the Awtsmoos.
     */
    animateWavelength() {
        initializeAwtsmoosLayeredRiver(this.canvasElement, this.analyser)
        /*const ctx = this.canvasElement.getContext("2d");
        const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
        const hebrewLetters = ["א", "ב", "ג", "ד", "ה", "ו", "ז", "ח", "ט", "י"];

        const draw = () => {
            this.analyser.getByteFrequencyData(dataArray);
            ctx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
            ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
            ctx.fillRect(0, 0, this.canvasElement.width, this.canvasElement.height);

            let x = 0;
            const volume = dataArray.reduce((a, b) => a + b) / dataArray.length;

            for (let i = 0; i < hebrewLetters.length; i++) {
                const y = this.canvasElement.height / 2 + Math.sin(x * 0.1 + Date.now() * 0.001) * volume * 0.5;
                ctx.font = `${20 + volume * 0.1}px Arial`;
                ctx.fillStyle = `hsl(${x % 360}, 100%, 50%)`;
                ctx.fillText(hebrewLetters[i], x, y);
                x += this.canvasElement.width / hebrewLetters.length;
            }

            requestAnimationFrame(draw);
        };

        draw();*/
    }
}

/**
 * @method createBroadcastControls
 * @description Generates the buttons to summon the broadcast, a gateway to the Awtsmoos.
 */
function createBroadcastControls() {
    const container = document.createElement("div");
    container.style.position = "fixed";
    container.style.top = "10px";
    container.style.left = "10px";
    container.style.zIndex = "1001";

    const micOnlyButton = document.createElement("button");
    micOnlyButton.textContent = "Microphone Only";
    micOnlyButton.onclick = () => {
        const broadcaster = new AwtsmoosBroadcaster();
        broadcaster.initiateBroadcast(false);
    };

    const micAndVideoButton = document.createElement("button");
    micAndVideoButton.textContent = "Microphone + Webcam";
    micAndVideoButton.onclick = () => {
        const broadcaster = new AwtsmoosBroadcaster();
        broadcaster.initiateBroadcast(true);
    };

    container.appendChild(micOnlyButton);
    container.appendChild(micAndVideoButton);
    document.body.appendChild(container);
}

export {
    createBroadcastControls,
    AwtsmoosBroadcaster
}
