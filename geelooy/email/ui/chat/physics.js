
// B"H
import { chatState, getUiRef } from './state.js';
import { FX } from '../fx.js';
import { notify } from '../../store.js';
import { renderContextMenu } from '../modals.js';

// 1. SONIC BOOM SCROLL
export function handleScroll(e) {
    const el = e.target;
    if(FX.setScroll) FX.setScroll(el.scrollTop);
    
    // Wormhole trigger on pull-down
    if (el.scrollTop < 50) {
        const ui = getUiRef();
        if(ui) {
            const wh = ui.getHtml('wormhole');
            if(wh) {
                wh.classList.remove('hidden');
                // Debounce hide
                clearTimeout(el.whTimer);
                el.whTimer = setTimeout(() => wh.classList.add('hidden'), 1000);
            }
        }
    }
    
    // Calculate Velocity
    const now = Date.now();
    const dt = now - chatState.lastScrollTime;
    
    if (dt > 16) { // ~60fps cap
        const velocity = (el.scrollTop - chatState.lastScrollTop) / dt;
        chatState.scrollSpeed = velocity;
        
        // Sonic Boom Effect
        if (Math.abs(velocity) > 2.5) {
            document.body.classList.add('sonic-distortion');
            // Dynamic skew based on direction
            const skew = Math.min(Math.max(velocity * 2, -10), 10);
            el.style.transform = `skewY(${skew}deg)`;
        } else {
            document.body.classList.remove('sonic-distortion');
            el.style.transform = 'skewY(0deg)';
        }
        
        chatState.lastScrollTop = el.scrollTop;
        chatState.lastScrollTime = now;
    }
}

// 2. HOLOGRAPHIC TILT & MAGNETISM
export function handleMagneticField(e) {
    const rows = document.querySelectorAll('.msg-bubble');
    const mx = e.clientX;
    const my = e.clientY;
    
    // Spotlight logic
    if (chatState.isSpotlightActive) {
        document.body.style.setProperty('--cursor-x', mx + 'px');
        document.body.style.setProperty('--cursor-y', my + 'px');
    }
    
    rows.forEach(row => {
        const rect = row.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        
        const dist = Math.hypot(mx - cx, my - cy);
        
        // 3D Tilt Effect
        if (dist < 300) {
            const dx = mx - cx;
            const dy = my - cy;
            
            // Calculate tilt angles (Max 15 degrees)
            const rotateX = -(dy / 20); 
            const rotateY = (dx / 20);
            
            // Magnetic Pull
            const force = (300 - dist) / 15; 
            const tx = (dx / dist) * force;
            const ty = (dy / dist) * force;

            row.style.transform = `
                perspective(1000px) 
                translate3d(${tx}px, ${ty}px, 0) 
                rotateX(${rotateX}deg) 
                rotateY(${rotateY}deg)
            `;
            
            // Lighting effect
            row.style.filter = `brightness(${1 + (force/40)})`;
        } else {
            row.style.transform = 'perspective(1000px) translate3d(0,0,0) rotateX(0) rotateY(0)';
            row.style.filter = 'brightness(1)';
        }
    });
}

// 3. INERTIAL SWIPE PHYSICS
export function attachSwipePhysics(row, msg) {
    const wrapper = row.querySelector('.swipe-wrapper');
    const bubble = row.querySelector('.msg-bubble');
    const icon = row.querySelector('.swipe-icon');
    
    if(!wrapper || !bubble) return;

    let startX = 0;
    let currentX = 0;
    let isDragging = false;
    let longPressTimer;

    wrapper.style.touchAction = "pan-y"; 

    const start = (x) => {
        startX = x;
        isDragging = true;
        wrapper.classList.add('swiping');
        bubble.style.transition = 'none'; // Disable CSS transition for direct 1:1 physics
        
        longPressTimer = setTimeout(() => {
            if (Math.abs(currentX - startX) < 5) {
                handleRightClick({ preventDefault:()=>{}, clientX: x, clientY: wrapper.getBoundingClientRect().top }, msg, row);
                isDragging = false; 
                wrapper.classList.remove('swiping');
            }
        }, 600);
    };

    const move = (x) => {
        if (!isDragging) return;
        currentX = x;
        const diff = x - startX;
        
        if (Math.abs(diff) > 5) clearTimeout(longPressTimer); 
        
        // Damped Resistance (Logarithmic)
        const resist = Math.sign(diff) * (Math.log10(Math.abs(diff) + 10) * 15);
        
        const isMe = row.classList.contains('me');
        // Only allow swipe in the "reply" direction (Left for me, Right for them)
        if ((isMe && diff < 0) || (!isMe && diff > 0)) {
            bubble.style.transform = `translateX(${resist}px)`;
            
            const abs = Math.abs(resist);
            if (abs > 10) {
                // Scale icon based on pull distance
                const scale = Math.min(1.5, 0.5 + abs/30);
                icon.style.opacity = Math.min(1, abs/30);
                icon.style.transform = `scale(${scale}) translateY(-50%)`;
            }
        }
    };

    const end = (e) => {
        clearTimeout(longPressTimer);
        if (!isDragging) return;
        isDragging = false;
        wrapper.classList.remove('swiping'); 
        
        // Spring Snapback Animation
        bubble.style.transition = 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)'; // Bouncy Bezier
        bubble.style.transform = 'translateX(0)';
        icon.style.opacity = 0;
        icon.style.transform = 'scale(0) translateY(-50%)';
        
        const diff = currentX - startX;
        const isMe = row.classList.contains('me');
        const threshold = 100; // Pixels to trigger

        if ((isMe && diff < -threshold) || (!isMe && diff > threshold)) {
            if(FX.playSound) FX.playSound('hover');
            if (navigator.vibrate) navigator.vibrate([10, 30, 10]); // Haptic feedback
            notify('triggerReply', { msg, name: msg.fromName || (isMe ? "Yourself" : "Them") });
        }
    };

    wrapper.onpointerdown = (e) => { wrapper.setPointerCapture(e.pointerId); start(e.clientX); };
    wrapper.onpointermove = (e) => move(e.clientX);
    wrapper.onpointerup = (e) => end(e);
    wrapper.onpointercancel = (e) => end(e);
}

export function handleRightClick(e, msg, row) {
    if(e.preventDefault) e.preventDefault();
    const ui = getUiRef();
    if(ui) {
        renderContextMenu(ui, e.clientX, e.clientY, msg, row);
    }
}

export function toggleSpotlight() {
    chatState.isSpotlightActive = !chatState.isSpotlightActive;
    document.body.classList.toggle('spotlight-mode', chatState.isSpotlightActive);
    
    if(chatState.isSpotlightActive) {
        // Center initially
        document.body.style.setProperty('--cursor-x', '50vw');
        document.body.style.setProperty('--cursor-y', '50vh');
    }
}
