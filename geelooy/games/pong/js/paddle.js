//B"H

function createPaddle(x, y, width, height, color, isAI = false) {
    return {
        x,
        y,
        width,
        height,
        color,
        dy: 0,
        score: 0,
        speed: isAI ? 3 : 8, // AI speed is now its tracking speed

        update(canvas, ball) {
            if (isAI) {
                this.aiMove(canvas, ball);
            } else {
                this.playerMove(canvas);
            }
        },

        playerMove(canvas) {
            // This logic remains for keyboard controls
            this.y += this.dy;

            // Clamp paddle position to stay within the canvas
            if (this.y < 0) this.y = 0;
            if (this.y + this.height > canvas.height) this.y = canvas.height - this.height;
        },

        aiMove(canvas, ball) {
            const paddleCenter = this.y + this.height / 2;
            const ballCenter = ball.y + ball.size / 2;

            // A "dead zone" to prevent the paddle from jittering when it's aligned with the ball
            const deadZone = 5;

            // Move the paddle towards the ball's vertical position
            if (paddleCenter < ballCenter - deadZone) {
                this.y += this.speed;
            } else if (paddleCenter > ballCenter + deadZone) {
                this.y -= this.speed;
            }

            // Clamp paddle position to stay within the canvas
            if (this.y < 0) this.y = 0;
            if (this.y + this.height > canvas.height) this.y = canvas.height - this.height;
        },

        draw(context) {
            context.fillStyle = this.color;
            context.fillRect(this.x, this.y, this.width, this.height);
        }
    };
}