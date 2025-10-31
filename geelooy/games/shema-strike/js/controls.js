//B"H
class Controls {
    constructor(isTouchDevice) {
        this.left = false;
        this.right = false;
        this.jump = false;
        this.strike = false;
        this.strikePressed = false;

        if (isTouchDevice) {
            document.getElementById('mobile-controls').style.display = 'block';
            this.setupMobileControls();
        } else {
            this.addKeyboardListeners();
        }
    }

    addKeyboardListeners() {
        window.addEventListener('keydown', e => {
            switch(e.code) {
                case 'KeyA': case 'ArrowLeft': this.left = true; break;
                case 'KeyD': case 'ArrowRight': this.right = true; break;
                case 'KeyW': case 'ArrowUp': this.jump = true; break;
                case 'Space': 
                    e.preventDefault();
                    if (!this.strike) this.strikePressed = true;
                    this.strike = true; 
                    break;
            }
        });
        window.addEventListener('keyup', e => {
            switch(e.code) {
                case 'KeyA': case 'ArrowLeft': this.left = false; break;
                case 'KeyD': case 'ArrowRight': this.right = false; break;
                case 'KeyW': case 'ArrowUp': this.jump = false; break;
                case 'Space': this.strike = false; break;
            }
        });
    }

    setupMobileControls() {
        const joyArea = document.getElementById('joystick-area');
        const joyThumb = document.getElementById('joystick-thumb');
        const actionBtn = document.getElementById('action-button');

        let joyTouchId = null;
        const radius = joyArea.offsetWidth / 2;
        const maxDist = radius - joyThumb.offsetWidth / 2;

        joyArea.addEventListener('touchstart', e => {
            e.preventDefault();
            if (joyTouchId === null) joyTouchId = e.changedTouches[0].identifier;
        }, { passive: false });

        joyArea.addEventListener('touchmove', e => {
            e.preventDefault();
            for (let touch of e.changedTouches) {
                if (touch.identifier === joyTouchId) {
                    const rect = joyArea.getBoundingClientRect();
                    const x = touch.clientX - rect.left - radius;
                    const y = touch.clientY - rect.top - radius;
                    const dist = Math.min(Math.sqrt(x*x + y*y), maxDist);
                    const angle = Math.atan2(y, x);

                    joyThumb.style.transform = `translate(${Math.cos(angle) * dist + radius - joyThumb.offsetWidth/2}px, ${Math.sin(angle) * dist + radius - joyThumb.offsetHeight/2}px)`;

                    this.left = Math.cos(angle) * (dist/maxDist) < -0.3;
                    this.right = Math.cos(angle) * (dist/maxDist) > 0.3;
                    this.jump = Math.sin(angle) * (dist/maxDist) < -0.5;
                }
            }
        }, { passive: false });

        const endJoy = e => {
            for (let touch of e.changedTouches) {
                if (touch.identifier === joyTouchId) {
                    joyTouchId = null;
                    joyThumb.style.transform = `translate(-50%, -50%)`;
                    this.left = this.right = this.jump = false;
                    break;
                }
            }
        };
        joyArea.addEventListener('touchend', endJoy);
        joyArea.addEventListener('touchcancel', endJoy);

        actionBtn.addEventListener('touchstart', e => {
            e.preventDefault();
            if (!this.strike) this.strikePressed = true;
            this.strike = true;
        }, { passive: false });
        actionBtn.addEventListener('touchend', e => {
            e.preventDefault();
            this.strike = false;
        });
    }
    
    resetPress() {
        this.strikePressed = false;
    }
}