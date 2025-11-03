// B"H

class World {
    constructor(canvas) {
        this.canvas = canvas;
        this.width = canvas.width * 6; 
        this.height = canvas.height;
        // B"H - Restored ground height to give it more presence on screen
        this.groundHeight = 175; 
        this.groundPattern = this.createGroundPattern();

        this.farClouds = this.createClouds(25, 0.2, 80, 120);
        this.nearClouds = this.createClouds(15, 0.5, 150, 200);
        this.mountains = this.createMountains();
    }

    createGroundPattern() {
        const patternCanvas = document.createElement('canvas');
        const pctx = patternCanvas.getContext('2d');
        patternCanvas.width = 64;
        patternCanvas.height = 64;
        pctx.fillStyle = "#1e4620";
        pctx.fillRect(0, 0, 64, 64);
        pctx.fillStyle = "#3a5f0b";
        for (let i = 0; i < 100; i++) {
            pctx.fillRect(Math.random() * 64, Math.random() * 64, 2, 2);
        }
        return pctx.createPattern(patternCanvas, 'repeat');
    }

    createClouds(count, speed, minSize, maxSize) {
        let clouds = [];
        for (let i = 0; i < count; i++) {
            clouds.push({
                x: Math.random() * this.width,
                y: Math.random() * (this.canvas.height / 3),
                size: Math.random() * (maxSize - minSize) + minSize,
                speed: speed
            });
        }
        return clouds;
    }

    createMountains() {
        let mountains = [];
        for (let i = 0; i < 15; i++) { 
            mountains.push({
                x: i * this.width / 14 + Math.random() * 100,
                // B"H - This correctly sets the desired bottom line for the mountains
                y: this.canvas.height - this.groundHeight, 
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
                    item.x = this.width;
                }
            }
        };
        updateLayer(this.farClouds);
        updateLayer(this.nearClouds);
    }
    
    draw(ctx) {
        ctx.fillStyle = '#181d3f';
        ctx.fillRect(0, 0, this.width, this.height);
        
        // --- B"H - THE FIX IS HERE ---
        ctx.save();
        ctx.font = "400px Arial";
        // 1. We align the drawing from the bottom of the emoji
        ctx.textBaseline = 'bottom'; 
        
        for (const mountain of this.mountains) {
             // 2. We draw the mountain exactly at its 'y' position, which is the ground line.
             ctx.fillText("⛰️", mountain.x, mountain.y);
        }
        ctx.restore(); // Restore text baseline to default

        const drawCloudLayer = (layer) => {
            for (const cloud of layer) {
                ctx.font = `${cloud.size}px Arial`;
                ctx.fillText("☁️", cloud.x, cloud.y + cloud.size/2);
            }
        };

        drawCloudLayer(this.farClouds);
        drawCloudLayer(this.nearClouds);

        // Ground is drawn last to appear in front
        ctx.fillStyle = this.groundPattern;
        ctx.fillRect(0, this.canvas.height - this.groundHeight, this.width, this.groundHeight);
    }
}