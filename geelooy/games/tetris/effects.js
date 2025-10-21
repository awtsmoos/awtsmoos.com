// In gameInstance.js

    /**
     * Moves the current piece horizontally, now with wall slide effects.
     */
    move(dir) {
        if (!this.piece) return;

        if (!this.collides(this.piece, { x: dir })) {
            // Move was successful
            this.piece.x += dir;
        } else {
            // THE FIX: Move failed, so trigger the wall slide effect
            this.effectsEngine.triggerWallSlide(this.piece, dir, this.blockSize, this.viewportTopY);
        }
    }