
// B"H
import { chatState, getUiRef } from './state.js';
import { FX } from '../fx.js';
import { notify } from '../../store.js';
import { renderContextMenu } from '../modals.js';

// 0. RESET PHYSICS (Fix for load distortion)
export function resetScrollPhysics(el) {
    if(!el) return;
    chatState.lastScrollTop = el.scrollTop;
    chatState.lastScrollTime = Date.now();
    el.style.setProperty('--scroll-skew', '0deg');
    document.body.classList.remove('sonic-distortion');
}

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
    
    // FIX: Detect programmatic teleportation (Load/Jump to bottom)
    // If distance is huge and time is short, it's not a human scroll.
    const dist = Math.abs(el.scrollTop - chatState.lastScrollTop);
    
    if (dist > 300 && dt < 100) {
        // Reset state and exit to prevent massive skew distortion
        chatState.lastScrollTop = el.scrollTop;
        chatState.lastScrollTime = now;
        el.style.setProperty('--scroll-skew', '0deg');
        document.body.classList.remove('sonic-distortion');
        return;
    }
    
    if (dt > 16) { // ~60fps cap
        const velocity = (el.scrollTop - chatState.lastScrollTop) / dt;
        chatState.scrollSpeed = velocity;
        
        // Sonic Boom Effect
        if (Math.abs(velocity) > 2.5) {
            document.body.classList.add('sonic-distortion');
            // Cap skew to avoid unreadable text
            const skew = Math.min(Math.max(velocity * 1.5, -6), 6); 
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
    // FIXED: Only active if Spotlight Mode is explicitly toggled on
    if (!chatState.isSpotlightActive) return;

    const rows = document.querySelectorAll('.msg-bubble');
    const mx = e.clientX;
    const my = e.clientY;
    
    document.body.style.setProperty('--cursor-x', mx + 'px');
    document.body.style.setProperty('--cursor-y', my + 'px');
    
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
    const wrapper = row.querySelector('.swipe-wrapper');
    const icon = row.querySelector('.swipe-icon');
    
    if(!wrapper) return;

    let startX = 0;
    let currentX = 0;
    let isDragging = false;
    let hasVibrated = false;

    // Critical for touch devices
    wrapper.style.touchAction = "pan-y"; 

    const start = (e) => {
        // Allow touch or left mouse button
        if(e.pointerType === 'mouse' && e.button !== 0) return;

        startX = e.clientX;
        isDragging = true;
        hasVibrated = false;
        
        wrapper.classList.add('swiping');
        wrapper.setPointerCapture(e.pointerId);
        wrapper.style.transition = 'none'; // Instant response
        if(icon) icon.style.transition = 'none';
    };

    const move = (e) => {
        if (!isDragging) return;
        currentX = e.clientX;
        const diff = currentX - startX;
        
        const isMe = row.classList.contains('me');
        // Drag Left (if me), Drag Right (if them)
        // We add a small buffer (5px) to prevent accidental micro-moves
        const allowed = (isMe && diff < -5) || (!isMe && diff > 5);
        
        if (allowed) {
            // Logarithmic resistance
            const resist = Math.sign(diff) * (Math.log10(Math.abs(diff) + 10) * 40);
            wrapper.style.transform = `translateX(${resist}px)`;
            
            const abs = Math.abs(resist);
            if(icon) {
                if (abs > 40) {
                    icon.style.opacity = Math.min(1, (abs-40)/40);
                    icon.style.transform = `translateY(-50%) scale(${Math.min(1.1, abs/60)})`;
                    
                    if (!hasVibrated && abs > 80 && navigator.vibrate) {
                        navigator.vibrate(10);
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
        
        // Spring Snapback
        wrapper.style.transition = 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        wrapper.style.transform = 'translateX(0)';
        
        if(icon) {
            icon.style.transition = 'all 0.3s ease';
            icon.style.opacity = 0;
            icon.style.transform = 'translateY(-50%) scale(0.5)';
        }

        const diff = currentX - startX;
        const isMe = row.classList.contains('me');
        const threshold = 80; // Lower threshold for easier trigger

        if ((isMe && diff < -threshold) || (!isMe && diff > threshold)) {
            triggerReply(msg, isMe);
        }
    };

    wrapper.onpointerdown = start;
    wrapper.onpointermove = move;
    wrapper.onpointerup = end;
    wrapper.onpointercancel = end;
}

export function triggerReply(msg, isMe) {
    if(FX.playSound) FX.playSound('hover');
    const quote = (msg.content || "").substring(0, 50).replace(/\n/g, ' ');
    notify('triggerReply', { msg, name: msg.fromName || (isMe ? "Yourself" : "Them"), quote });
    
    // Focus composer
    const input = document.querySelector('.visual-editor');
    if(input) input.focus();
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
    
    // Reset transforms when turning off
    if(!chatState.isSpotlightActive) {
        document.querySelectorAll('.msg-bubble').forEach(row => {
            row.style.transform = 'none';
            row.style.filter = 'none';
        });
    }
}
