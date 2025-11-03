// B"H

class InputHandler {
    constructor() {
        this.direction = { x: 1, y: 0 }; // Start moving right
        this.nextDirection = { x: 1, y: 0 };
        this.touchStartX = 0;
        this.touchStartY = 0;

        window.addEventListener('keydown', (e) => this.handleKey(e));
        window.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
        window.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: false });
    }

    handleKey(e) {
        switch (e.key) {
            case 'ArrowUp': case 'w': this.nextDirection = { x: 0, y: -1 }; break;
            case 'ArrowDown': case 's': this.nextDirection = { x: 0, y: 1 }; break;
            case 'ArrowLeft': case 'a': this.nextDirection = { x: -1, y: 0 }; break;
            case 'ArrowRight': case 'd': this.nextDirection = { x: 1, y: 0 }; break;
        }
    }

    handleTouchStart(e) {
        e.preventDefault();
        this.touchStartX = e.changedTouches[0].screenX;
        this.touchStartY = e.changedTouches[0].screenY;
    }

    handleTouchEnd(e) {
        e.preventDefault();
        const touchEndX = e.changedTouches[0].screenX;
        const touchEndY = e.changedTouches[0].screenY;
        const xDiff = touchEndX - this.touchStartX;
        const yDiff = touchEndY - this.touchStartY;

        if (Math.abs(xDiff) > Math.abs(yDiff)) {
            this.nextDirection = { x: xDiff > 0 ? 1 : -1, y: 0 };
        } else {
            this.nextDirection = { x: 0, y: yDiff > 0 ? 1 : -1 };
        }
    }
}