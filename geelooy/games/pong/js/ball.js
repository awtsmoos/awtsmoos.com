//B"H
// js/ball.js

function createBall(canvas, initialEmoji) {
    return {
        x: canvas.width / 2,
        y: canvas.height / 2,
        size: 24, // Emojis look better a bit larger
        speed: 5, // Start a little faster
        dx: 5,
        dy: -5,
        currentEmoji: initialEmoji,
        rotation: 0,
        rotationSpeed: 0, // Will be changed on hit

        reset(newEmoji) {
            this.x = canvas.width / 2;
            this.y = canvas.height / 2;
            this.speed = 5;
            this.dx = this.dx > 0 ? -this.speed : this.speed; // Keep direction
            this.dy = this.speed * (Math.random() > 0.5 ? 1 : -1);
            this.currentEmoji = newEmoji;
            this.rotation = 0;
            this.rotationSpeed = 0;
        },

        update(canvas) {
            this.x += this.dx;
            this.y += this.dy;
            this.rotation += this.rotationSpeed; // Apply spin

            // Bounce off top and bottom walls
            if (this.y - this.size / 2 < 0 || this.y + this.size / 2 > canvas.height) {
                this.dy *= -1;
                // Add spin on wall bounce for extra flair
                this.rotationSpeed += (this.dx > 0 ? -0.05 : 0.05);
            }
        },

        draw(context) {
            context.save();
            context.translate(this.x, this.y);
            context.rotate(this.rotation);
            context.font = `${this.size}px Arial`;
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillText(this.currentEmoji, 0, 0);
            context.restore();
        }
    };
}