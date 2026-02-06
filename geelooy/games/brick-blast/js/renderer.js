// B"H

import { BALL_RADIUS, BALL_SPEED } from "./constants.js";

/**
 * The Renderer Artist is a divine painter who translates the abstract state of the world
 * into a visible, tangible reality upon the canvas. It does not alter the state, it merely
 * gives it form.
 */
export class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
    }

    resize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
    }

    /**
     * The grand act of manifestation, where the entire world is drawn in a single moment.
     * @param {object} state The current state of the world.
     * @param {import('./background.js').Background} background The celestial backdrop.
     * @param {import('./input.js').InputHandler} input The Scribe holding the player's aim.
     * @param {boolean} showForesight Whether to draw the divine foresight aim line.
     */
    draw(state, background, input, showForesight) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        background.draw(this.ctx);
        state.bricks.forEach(brick => brick.draw(this.ctx));

        if (state.golem) this.drawGolem(state.golem);
        if (state.goldenSnitch) this.drawSnitch(state.goldenSnitch);

        // Ratzo v'Shov Pulse: Calculated based on time
        const pulse = Math.sin(Date.now() / 150) * 0.2 + 1; // 0.8 to 1.2

        state.balls.forEach(ball => {
            // Draw Ohr Makif Aura if active
            if (state.ohrMakifActive) {
                const gradient = this.ctx.createRadialGradient(ball.x, ball.y, ball.radius, ball.x, ball.y, ball.radius * 3);
                gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
                gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
                this.ctx.fillStyle = gradient;
                this.ctx.beginPath();
                this.ctx.arc(ball.x, ball.y, ball.radius * 3, 0, Math.PI * 2);
                this.ctx.fill();
            }

            this.ctx.beginPath();
            // Apply Pulse
            this.ctx.arc(ball.x, ball.y, ball.radius * pulse, 0, Math.PI * 2);
            this.ctx.fillStyle = 'white';
            this.ctx.fill();
        });

        state.particles.forEach(p => this.drawParticle(p));

        if (input.isAiming) {
            if (showForesight) {
                this.drawForesightLine(state.shooterPos, input.aimAngle, state.bricks);
            } else {
                this.drawAimLine(state.shooterPos, input.aimAngle);
            }
        }

        this.drawShooter(state.shooterPos, state.paddle);
        this.drawHolyText();
    }
    
    drawSnitch(snitch) {
        const ctx = this.ctx;
        ctx.save();
        ctx.translate(snitch.x, snitch.y);
        
        // Wings
        const wingFlap = Math.sin(Date.now() / 50) * 10;
        ctx.fillStyle = '#e2e8f0';
        ctx.beginPath();
        ctx.ellipse(-10, 0, 15, 5 + wingFlap/3, Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(10, 0, 15, 5 - wingFlap/3, -Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();

        // Body
        ctx.fillStyle = '#fbbf24'; // Gold
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fffbeb';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        ctx.restore();
    }

    drawAimLine(shooterPos, aimAngle) {
        const ctx = this.ctx;
        ctx.beginPath();
        ctx.moveTo(shooterPos.x, shooterPos.y);
        ctx.lineTo(
            shooterPos.x + Math.cos(aimAngle) * 2000,
            shooterPos.y + Math.sin(aimAngle) * 2000
        );
        ctx.setLineDash([5, 10]);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.setLineDash([]);
    }

    /**
     * A sacred vision of the future, this function simulates the path of a single ball
     * to show the player its destiny. This is a read-only simulation and does not affect the world.
     */
    drawForesightLine(shooterPos, aimAngle, bricks) {
        const ctx = this.ctx;
        let simBall = {
            x: shooterPos.x,
            y: shooterPos.y,
            vx: Math.cos(aimAngle) * BALL_SPEED,
            vy: Math.sin(aimAngle) * BALL_SPEED,
            radius: BALL_RADIUS
        };

        ctx.beginPath();
        ctx.moveTo(simBall.x, simBall.y);
        ctx.setLineDash([2, 6]);
        ctx.strokeStyle = 'rgba(34, 211, 238, 0.7)';
        ctx.lineWidth = 2;

        for (let i = 0; i < 200; i++) { // Simulate for a max number of steps
            simBall.x += simBall.vx;
            simBall.y += simBall.vy;

            // Wall collisions
            if (simBall.x - simBall.radius < 0 || simBall.x + simBall.radius > this.canvas.width) {
                simBall.vx *= -1;
                simBall.x = simBall.x - simBall.radius < 0 ? simBall.radius : this.canvas.width - simBall.radius;
                ctx.lineTo(simBall.x, simBall.y);
            }
            if (simBall.y - simBall.radius < 0) {
                simBall.vy *= -1;
                simBall.y = simBall.radius;
                ctx.lineTo(simBall.x, simBall.y);
            }
            if (simBall.y - simBall.radius > this.canvas.height) {
                 break;
            }
            
            // Check for brick collision (simplified check for performance)
            let collision = false;
            for (const brick of bricks) {
                 const closestX = Math.max(brick.x, Math.min(simBall.x, brick.x + brick.width));
                 const closestY = Math.max(brick.y, Math.min(simBall.y, brick.y + brick.height));
                 const dx = simBall.x - closestX;
                 const dy = simBall.y - closestY;
                 if ((dx * dx) + (dy * dy) < (simBall.radius * simBall.radius)) {
                     collision = true;
                     break;
                 }
            }
            if (collision) break;
        }
        ctx.lineTo(simBall.x, simBall.y);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    drawShooter(shooterPos, paddle) {
        const ctx = this.ctx;
        const x = shooterPos.x - paddle.width / 2;
        const y = shooterPos.y - paddle.height / 2;
        const w = paddle.width;
        const h = paddle.height;
        let r = 8;

        if (w < 2 * r) r = w / 2;
        if (h < 2 * r) r = h / 2;

        ctx.fillStyle = '#22d3ee';
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
        ctx.fill();
    }
    
    drawGolem(golem) {
        const ctx = this.ctx;
        const x = golem.x - golem.width / 2;
        const y = golem.y - golem.height / 2;
        const w = golem.width;
        const h = golem.height;
        let r = 6;
        
        ctx.globalAlpha = 0.7;
        ctx.fillStyle = '#a855f7'; // A divine purple
        ctx.strokeStyle = '#f0f9ff';
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, [r]);
        ctx.fill();
        ctx.stroke();
        
        // Draw bounce counter
        ctx.fillStyle = 'white';
        ctx.font = 'bold 12px Inter';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`🤖 ${golem.bouncesLeft}`, golem.x, golem.y);
        
        ctx.globalAlpha = 1.0;
    }
    
    drawParticle(p) {
        const ctx = this.ctx;
        const alpha = p.lifespan / p.initialLifespan;
        ctx.globalAlpha = Math.max(0, alpha);

        if (p.type === 'text') {
            ctx.fillStyle = p.color;
            ctx.font = `${p.size}px Inter`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(p.text, p.x, p.y);
        } else {
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
        }
        
        ctx.globalAlpha = 1.0;
    }
    
    drawHolyText() {
        const ctx = this.ctx;
        ctx.font = 'bold 16px Inter';
        ctx.fillStyle = 'rgba(240, 249, 255, 0.7)';
        ctx.textBaseline = 'top';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 3;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;

        ctx.textAlign = 'left';
        ctx.fillText('B"H', 10, 10);

        ctx.textAlign = 'right';
        ctx.fillText('ב"ה', this.canvas.width - 10, 10);

        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
    }
}