// B"H

class Entity {
    constructor(x, y, speed) {
        // Tile coordinates
        this.tileX = x;
        this.tileY = y;
        // Pixel coordinates
        this.px = this.tileX * TILE_SIZE;
        this.py = this.tileY * TILE_SIZE;
        
        this.speed = speed;
        this.direction = { x: 0, y: 0 };
    }

    
    // B"H

    // Check if entity is aligned with the grid, using a dynamic buffer
    // to prevent floating-point errors from causing it to miss a turn.
    
    isAtTileCenter(deltaTime) {
        // The buffer is half of the distance the entity moves in one frame.
        // This makes it impossible to "step over" the center without being detected.
        const dynamicBuffer = (this.speed * deltaTime) / 2 + 0.1;

        const centerPx = this.tileX * TILE_SIZE;
        const centerPy = this.tileY * TILE_SIZE;
        return (
            Math.abs(this.px - centerPx) < dynamicBuffer &&
            Math.abs(this.py - centerPy) < dynamicBuffer
        );
    }
}

class Neshama extends Entity {
    constructor(x, y, speed) {
        super(x, y, speed);
        this.radius = TILE_SIZE / 2 - 2;
        this.mouthOpen = 0.2;
        this.mouthDirection = 1;
        this.isPoweredUp = false;
        this.powerUpTimer = 0;
        this.drawDirection = { x: 1, y: 0 }; // For visual orientation
    }

    // B"H

    draw(ctx) {
        // Keep track of the last direction of movement for drawing
        if (this.direction.x !== 0 || this.direction.y !== 0) {
            this.drawDirection = { ...this.direction };
        }
        const angle = Math.atan2(this.drawDirection.y, this.drawDirection.x);
        
        // Draw the Neshama Body
        ctx.fillStyle = 'yellow';
        ctx.beginPath();
        ctx.arc(
            this.px + TILE_SIZE / 2, this.py + TILE_SIZE / 2,
            this.radius,
            angle + this.mouthOpen * Math.PI,
            angle - this.mouthOpen * Math.PI
        );
        ctx.lineTo(this.px + TILE_SIZE / 2, this.py + TILE_SIZE / 2);
        ctx.fill();

        // --- START OF YARMULKE FIX ---
        let yarmulkeOffsetX = 0;
        let yarmulkeOffsetY = 0;
        const yarmulkeDistance = this.radius * 0.8;

        // Check if moving horizontally (left or right)
        if (this.drawDirection.y === 0) {
            yarmulkeOffsetX = 0;
            yarmulkeOffsetY = -yarmulkeDistance; // Always position it "up" on the screen
        } 
        // Else, we must be moving vertically (up or down)
        else { 
            yarmulkeOffsetX = this.drawDirection.y * yarmulkeDistance; // Position it to the "top" relative to vertical movement
            yarmulkeOffsetY = 0;
        }
        // --- END OF YARMULKE FIX ---

        // Draw the Yarmulke
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(
            this.px + TILE_SIZE / 2 + yarmulkeOffsetX,
            this.py + TILE_SIZE / 2 + yarmulkeOffsetY,
            this.radius / 2.5, 0, Math.PI * 2
        );
        ctx.fill();
    }

    updateAnimation() {
        // ** FIX: Slowed down animation speed **
        this.mouthOpen += 0.02 * this.mouthDirection; 
        if (this.mouthOpen > 0.4 || this.mouthOpen < 0.05) {
            this.mouthDirection *= -1;
        }
    }
}

class Klipah extends Entity {
    constructor(x, y, speed, color) {
        super(x, y, speed);
        this.color = color;
        this.isVulnerable = false;
        this.vulnerableTimer = 0;
    }

    draw(ctx) {
        const centerX = this.px + TILE_SIZE / 2;
        const centerY = this.py + TILE_SIZE / 2;

        if (this.isVulnerable) {
            ctx.fillStyle = Date.now() % 400 < 200 ? 'blue' : 'white';
        } else {
            ctx.fillStyle = this.color;
        }

        ctx.beginPath();
        ctx.arc(centerX, centerY, TILE_SIZE / 2, Math.PI, 0);
        ctx.lineTo(this.px + TILE_SIZE, this.py + TILE_SIZE);
        ctx.lineTo(this.px, this.py + TILE_SIZE);
        ctx.fill();

        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(centerX - TILE_SIZE / 4, centerY - TILE_SIZE/8, TILE_SIZE / 8, 0, Math.PI * 2);
        ctx.arc(centerX + TILE_SIZE / 4, centerY - TILE_SIZE/8, TILE_SIZE / 8, 0, Math.PI * 2);
        ctx.fill();
    }
}