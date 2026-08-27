// B"H

import { BALL_RADIUS, BALL_SPEED, INITIAL_PADDLE_WIDTH, PADDLE_HEIGHT } from "./constants.js";

/**
 * The Input Scribe listens for the will of the player and translates it into divine commands.
 * It is the bridge between the user's world and the game world.
 */
export class InputHandler {
    constructor(canvas) {
        this.canvas = canvas;
        this.shooterPos = { x: 0, y: 0 };
        this.aimAngle = -Math.PI / 2;
        this.isAiming = false;
        this.launchFlag = false; // A flag that is true for one frame when a launch is commanded.
        this.recallFlag = false; // A flag for the divine recall command.
        this.isGameShooting = false; // The Scribe's knowledge of the world state.
        this.paddle = { width: INITIAL_PADDLE_WIDTH, height: PADDLE_HEIGHT }; // Start with default

        this.handlePointerDown = this.handlePointerDown.bind(this);
        this.handlePointerMove = this.handlePointerMove.bind(this);
        this.handlePointerUp = this.handlePointerUp.bind(this);
    }

    addEventListeners() {
        this.canvas.addEventListener('pointerdown', this.handlePointerDown);
        this.canvas.addEventListener('pointermove', this.handlePointerMove);
        this.canvas.addEventListener('pointerup', this.handlePointerUp);
        this.canvas.addEventListener('pointerleave', this.handlePointerUp);
    }
    
    removeEventListeners() {
        this.canvas.removeEventListener('pointerdown', this.handlePointerDown);
        this.canvas.removeEventListener('pointermove', this.handlePointerMove);
        this.canvas.removeEventListener('pointerup', this.handlePointerUp);
        this.canvas.removeEventListener('pointerleave', this.handlePointerUp);
    }
    
    /**
     * The High Priest (Game) informs the Scribe of the current state of the world.
     * @param {boolean} isShooting Is the game currently in the shooting phase?
     * @param {{width: number, height: number}} paddle The current form of the paddle.
     */
    updateGameState(isShooting, paddle) {
        this.isGameShooting = isShooting;
        this.paddle = paddle;
    }

    updateShooterPos(pos) {
        this.shooterPos.x = pos.x;
        this.shooterPos.y = pos.y;
    }

    handlePointerDown(e) {
        if (this.isGameShooting) {
            // If balls are in flight, a tap might be a recall command.
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const paddleLeft = this.shooterPos.x - this.paddle.width / 2;
            const paddleRight = this.shooterPos.x + this.paddle.width / 2;
            const paddleTop = this.shooterPos.y - this.paddle.height / 2;
            const paddleBottom = this.shooterPos.y + this.paddle.height / 2;

            if (x >= paddleLeft && x <= paddleRight && y >= paddleTop && y <= paddleBottom) {
                this.recallFlag = true;
            }
        } else {
            // If not shooting, a tap begins the aiming process.
            this.isAiming = true;
            this.updateAim(e);
        }
    }

    handlePointerMove(e) {
        if (!this.isAiming) return;
        this.updateAim(e);
    }

    handlePointerUp() {
        // Only trigger a launch if we were in the aiming state.
        if (this.isAiming) {
            this.isAiming = false;
            this.launchFlag = true;
        }
    }
    
    updateAim(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const dx = x - this.shooterPos.x;
        const dy = y - this.shooterPos.y;
        let angle = Math.atan2(dy, dx);
        
        const constraint = 0.1; 
        if (angle > -constraint) angle = -constraint;
        if (angle < -Math.PI + constraint) angle = -Math.PI + constraint;
        
        this.aimAngle = angle;
    }
    
    shouldLaunch() {
        if (this.launchFlag) {
            this.launchFlag = false; // Reset the flag after it's been read.
            return true;
        }
        return false;
    }

    shouldRecall() {
        if (this.recallFlag) {
            this.recallFlag = false; // Reset the flag after it's been read.
            return true;
        }
        return false;
    }

    createBall() {
        return {
            x: this.shooterPos.x,
            y: this.shooterPos.y,
            vx: Math.cos(this.aimAngle) * BALL_SPEED,
            vy: Math.sin(this.aimAngle) * BALL_SPEED,
            radius: BALL_RADIUS,
            id: `ball-${Date.now()}-${Math.random()}`,
        };
    }
}