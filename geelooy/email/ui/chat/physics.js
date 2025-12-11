
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
            const skew = Math.min(Math.max(velocity * 1.5, -8), 8);
            el.style.setProperty('--scroll-skew', `${skew}deg`);
        } else {
            document.body.classList.remove('sonic-distortion');
            el.style.setProperty('--scroll-skew', '0deg');
        }
        
        chatState.lastScrollTop = el.scrollTop;
        chatState.lastScrollTime = now;
    } else {
        // Debounce reset for stop
        clearTimeout(el.skewResetTimer);
        el.skewResetTimer = setTimeout(() => {
             el.style.setProperty('--scroll-skew', '0deg');
             document.body.classList.remove('sonic-distortion');
        }, 100);
    }
}

// 2. HOLOGRAPHIC TILT & MAGNETISM
export function handleMagneticField(e) {
    const rows = document.querySelectorAll('.msg-bubble');
    const mx = e.clientX;
    const my = e.clientY;
    
    if (chatState.isSpotlightActive) {
        document.body.style.setProperty('--cursor-x', mx + 'px');
        document.body.style.setProperty('--cursor-y', my + 'px');
    }
    
    rows.forEach(row => {
        const rect = row.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        
        const dist = Math.hypot(mx - cx, my - cy);
        
        if (dist < 300) {
            const dx = mx - cx;
            const dy = my - cy;
            const rotateX = -(dy / 20); 
            const rotateY = (dx / 20);
            const force = (300 - dist) / 15; 
            const tx = (dx / dist) * force;
            const ty = (dy / dist) * force;

            row.style.transform = `perspective(1000px) translate3d(${tx}px, ${ty}px, 0) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            row.style.filter = `brightness(${1 + (force/40)})`;
        } else {
            row.style.transform = 'perspective(1000px) translate3d(0,0,0) rotateX(0) rotateY(0)';
            row.style.filter = 'brightness(1)';
        }
    });
}

// 3. INERTIAL SWIPE PHYSICS (ENHANCED)
export function attachSwipePhysics(row, msg) {
    // IMPORTANT: We now swipe the WRAPPER to move everything, and prevent selection
    const wrapper = row.querySelector('.swipe-wrapper');
    const icon = row.querySelector('.swipe-icon');
    
    if(!wrapper) return;

    let startX = 0;
    let currentX = 0;
    let isDragging = false;
    let hasVibrated = false;

    // Disable default touch actions to allow our physics
    wrapper.style.touchAction = "pan-y"; 

    const start = (e) => {
        // Only allow primary button
        if(e.button !== 0 && e.pointerType === 'mouse') return;
        
        startX = e.clientX;
        isDragging = true;
        hasVibrated = false;
        
        // Lock selection
        wrapper.classList.add('swiping');
        wrapper.style.userSelect = 'none';
        
        // Remove transitions for instant tracking
        wrapper.style.transition = 'none';
        if(icon) icon.style.transition = 'none';
    };

    const move = (e) => {
        if (!isDragging) return;
        currentX = e.clientX;
        const diff = currentX - startX;
        
        // Determine direction based on message type
        const isMe = row.classList.contains('me');
        const allowed = (isMe && diff < 0) || (!isMe && diff > 0);
        
        if (allowed) {
            // Logarithmic resistance
            const resist = Math.sign(diff) * (Math.log10(Math.abs(diff) + 10) * 35);
            
            // Apply transform to the ENTIRE wrapper
            wrapper.style.transform = `translateX(${resist}px)`;
            
            const abs = Math.abs(resist);
            
            // Icon Logic
            if(icon) {
                if (abs > 50) {
                    icon.style.opacity = Math.min(1, (abs-50)/50);
                    icon.style.transform = `translateY(-50%) scale(${Math.min(1.2, abs/70)})`;
                    
                    // Haptic Snap
                    if (!hasVibrated && abs > 100 && navigator.vibrate) {
                        navigator.vibrate(15);
                        hasVibrated = true;
                    }
                } else {
                    icon.style.opacity = 0;
                }
            }
        }
    };

    const end = (e) => {
        if (!isDragging) return;
        isDragging = false;
        
        wrapper.classList.remove('swiping');
        wrapper.style.userSelect = '';
        
        // Spring Snapback
        wrapper.style.transition = 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        wrapper.style.transform = 'translateX(0)';
        
        if(icon) {
            icon.style.transition = 'all 0.3s ease';
            icon.style.opacity = 0;
            icon.style.transform = 'translateY(-50%) scale(0.5)';
        }

        const diff = currentX - startX;
        const isMe = row.classList.contains('me');
        const threshold = 100; // Activation distance

        if ((isMe && diff < -threshold) || (!isMe && diff > threshold)) {
            if(FX.playSound) FX.playSound('hover');
            // Trigger Reply Action
            const quote = (msg.content || "").substring(0, 50).replace(/\n/g, ' ');
            notify('triggerReply', { msg, name: msg.fromName || (isMe ? "Yourself" : "Them"), quote });
        }
    };

    wrapper.onpointerdown = (e) => {
        // Only capture if not clicking a button
        if(e.target.tagName === 'BUTTON') return;
        wrapper.setPointerCapture(e.pointerId); 
        start(e); 
    };
    wrapper.onpointermove = (e) => move(e);
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
        document.body.style.setProperty('--cursor-x', '50vw');
        document.body.style.setProperty('--cursor-y', '50vh');
    }
}
