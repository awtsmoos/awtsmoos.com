// B"H

class World {
    // In js/world.js

    constructor(canvas) {
        this.canvas = canvas;
        this.width = canvas.width * 3;
        this.height = canvas.height;
        this.groundHeight = 350; // <-- Increased from 100 to raise the ground
        this.groundPattern = this.createGroundPattern();

        // Parallax background elements
        this.farClouds = this.createClouds(15, 0.2, 80, 120);
        this.nearClouds = this.createClouds(9, 0.5, 150, 200);
        this.mountains = this.createMountains();
    }

    createGroundPattern() {
        const patternCanvas = document.createElement('canvas');
        const pctx = patternCanvas.getContext('2d');
        patternCanvas.width = 64;
        patternCanvas.height = 64;
        pctx.fillStyle = "#1e4620"; // Dark Green
        pctx.fillRect(0, 0, 64, 64);
        pctx.fillStyle = "#3a5f0b"; // Lighter Green
        for (let i = 0; i < 100; i++) {
            pctx.fillRect(Math.random() * 64, Math.random() * 64, 2, 2);
        }
        return pctx.createPattern(patternCanvas, 'repeat');
    }

    createClouds(count, speed, minSize, maxSize) {
        let clouds = [];
        for (let i = 0; i < count; i++) {
            clouds.push({
                x: Math.random() * this.width, // Spawn clouds across the whole world
                y: Math.random() * (this.canvas.height / 3),
                size: Math.random() * (maxSize - minSize) + minSize,
                speed: speed
            });
        }
        return clouds;
    }

    createMountains() {
        let mountains = [];
        // Distribute mountains across the new world width
        for (let i = 0; i < 7; i++) {
            mountains.push({
                x: i * this.width / 6 + Math.random() * 100,
                y: this.canvas.height - this.groundHeight - 100,
                size: 400 + Math.random() * 150
            });
        }
        return mountains;
    }

    update() {
        const updateLayer = (layer) => {
            for (let item of layer) {
                item.x -= item.speed;
                if (item.x + item.size < 0) {
                    item.x = this.width; // Wrap around to the end of the world
                }
            }
        };
        updateLayer(this.farClouds);
        updateLayer(this.nearClouds);
    }
    
    draw(ctx) {
        // Sky
        ctx.fillStyle = '#181d3f'; // Corrected hex code
        ctx.fillRect(0, 0, this.width, this.height); // Draw sky across the whole world width
        
        // Mountains (far back)
        ctx.fillStyle = "#333";
        ctx.font = "400px Arial";
        for (const mountain of this.mountains) {
             ctx.fillText("⛰️", mountain.x, mountain.y + mountain.size*0.7);
        }

        const drawCloudLayer = (layer) => {
            for (const cloud of layer) {
                ctx.font = `${cloud.size}px Arial`;
                ctx.fillText("☁️", cloud.x, cloud.y + cloud.size/2);
            }
        };

        drawCloudLayer(this.farClouds);
        drawCloudLayer(this.nearClouds);

        // Ground
        ctx.fillStyle = this.groundPattern;
        ctx.fillRect(0, this.canvas.height - this.groundHeight, this.width, this.groundHeight);
    }
}