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
        speed: isAI ? 4 : 8,
        reactionTime: 0.1, // AI reaction time delay
        lastAiUpdateTime: 0,

        update(canvas, ball) {
            if (isAI) {
                this.aiMove(canvas, ball);
            } else {
                this.playerMove(canvas);
            }
        },

        playerMove(canvas) {
            this.y += this.dy;

            if (this.y < 0) this.y = 0;
            if (this.y + this.height > canvas.height) this.y = canvas.height - this.height;
        },

        aiMove(canvas, ball) {
            const now = Date.now();
            if (now - this.lastAiUpdateTime > this.reactionTime * 1000) {
                this.lastAiUpdateTime = now;

                // AI Difficulty Levels
                const difficulty = 'hard'; // Options: 'easy', 'medium', 'hard'
                let targetY = ball.y - this.height / 2;

                switch (difficulty) {
                    case 'easy':
                        // Slower and less precise
                        this.speed = 3;
                        this.y += (targetY - this.y) * 0.05;
                        break;
                    case 'medium':
                        // Faster and more responsive
                        this.speed = 4.5;
                        this.y += (targetY - this.y) * 0.08;
                        break;
                    case 'hard':
                        // Tracks the ball almost perfectly
                        this.speed = 5;
                        this.y += (targetY - this.y) * 0.1;
                        break;
                }
            }

            if (this.y < 0) this.y = 0;
            if (this.y + this.height > canvas.height) this.y = canvas.height - this.height;
        },

        draw(context) {
            context.fillStyle = this.color;
            context.fillRect(this.x, this.y, this.width, this.height);
        }
    };
}