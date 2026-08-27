//B"H
export class InputSystem {
    constructor(game) {
        this.game = game;
        this.touchCount = 0;
        this.x = 0;
        this.y = 0;
        this.isActive = false;
        
        this.bindEvents();
    }
    
    bindEvents() {
        const h = (e) => this.handle(e);
        ['mousedown', 'mousemove', 'mouseup', 'touchstart', 'touchmove', 'touchend'].forEach(evt => {
            window.addEventListener(evt, h, {passive: false});
        });
    }
    
    handle(e) {
        if(this.game.isPaused) return;
        e.preventDefault();
        
        // Start game on interaction
        if(!this.game.isPlaying && (e.type === 'mousedown' || e.type === 'touchstart')) {
            this.game.isPlaying = true;
            document.getElementById('start-message').style.display = 'none';
            this.game.audio.resume();
        }

        if(e.type.includes('touch')) {
            this.touchCount = e.touches.length;
            if(this.touchCount > 0) {
                this.x = e.touches[0].clientX;
                this.y = e.touches[0].clientY;
            }
        } else {
            this.x = e.clientX;
            this.y = e.clientY;
            this.touchCount = e.buttons === 1 ? 1 : 0;
        }
        
        this.isActive = this.touchCount > 0;
        
        // Pass to Game
        this.game.handleInput(this.touchCount, this.x, this.y);
    }
}
