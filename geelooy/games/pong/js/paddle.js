//B"H

function createPaddle(x, y, width, height, color, isAI = false) {
	return {
		x,
		y,
		width,
		height,
		baseHeight: height,
		color,
		dy: 0,
		score: 0,
		sizeTimer: 0, // frames of active grow/shrink
		sizeFactor: 1,
		speed: isAI ? 3 : 8, // AI speed is now its tracking speed

		update(canvas, ball) {
			if (this.sizeTimer > 0) {
				this.sizeTimer -= 1;
				if (this.sizeTimer === 0) {
					const center = this.y + this.height / 2;
					this.height = this.baseHeight;
					this.sizeFactor = 1;
					this.y = Math.max(0, Math.min(canvas.height - this.height, center - this.height / 2));
				}
			}
			if (isAI) {
				this.aiMove(canvas, ball);
			} else {
				this.playerMove(canvas);
			}
		},

		/** Grow or shrink the paddle for a number of frames (power-up). */
		setSize(factor, frames, canvas) {
			const center = this.y + this.height / 2;
			this.height = Math.max(30, Math.min(canvas.height * 0.7, this.baseHeight * factor));
			this.sizeFactor = factor;
			this.sizeTimer = frames;
			this.y = Math.max(0, Math.min(canvas.height - this.height, center - this.height / 2));
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
			const gold = isAI ? '#e8b4f0' : '#f5d97e';
			const core = isAI ? '#f7dcff' : '#fff3c4';
			context.save();
			context.shadowColor = gold;
			context.shadowBlur = 18;
			const g = context.createLinearGradient(this.x, 0, this.x + this.width, 0);
			g.addColorStop(0, gold);
			g.addColorStop(0.5, core);
			g.addColorStop(1, gold);
			context.fillStyle = g;
			const r = Math.min(6, this.width / 2);
			context.beginPath();
			context.roundRect(this.x, this.y, this.width, this.height, r);
			context.fill();
			context.restore();
		}
	};
}
