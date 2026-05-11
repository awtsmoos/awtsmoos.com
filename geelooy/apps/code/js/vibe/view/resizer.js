// B"H
/**
 * @file resizer.js
 * @brief The Engine of Proportion.
 */
export const VibeResizer = {
    bind(container) {
        const vHandle = container.querySelector('#vibe-resizer-vertical');
        const hHandle = container.querySelector('#vibe-resizer-horizontal');
        const iHandle = container.querySelector('#vibe-resizer-input'); // Input Resizer
        
        const wrapper = container.querySelector('.vibe-container');
        if (!wrapper) return;

        let activeResizeType = null; // 'vertical', 'horizontal', or 'input'

        const onMove = (e) => {
            const clientX = e.clientX ?? e.touches?.[0]?.clientX;
            const clientY = e.clientY ?? e.touches?.[0]?.clientY;
            if (clientX === undefined || clientY === undefined) return;
            
            const rect = wrapper.getBoundingClientRect();

            if (activeResizeType === 'horizontal') {
                // Stacked view: resizing the height of the chat panel
                const percent = ((clientY - rect.top) / rect.height) * 100;
                wrapper.style.setProperty('--chat-panel-height', `${Math.max(10, Math.min(90, percent))}%`);
            } else if (activeResizeType === 'vertical') {
                // Side-by-side view: resizing the width of the side panel
                const width = rect.right - clientX;
                wrapper.style.setProperty('--side-panel-width', `${Math.max(50, Math.min(width, rect.width - 50))}px`);
            } else if (activeResizeType === 'input') {
                // Resizing the height of the input area itself
                const height = rect.bottom - clientY;
                wrapper.style.setProperty('--input-panel-height', `${Math.max(50, Math.min(height, rect.height * 0.7))}px`);
            }
        };

        const onEnd = () => {
            document.body.classList.remove('is-resizing');
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onEnd);
            window.removeEventListener('touchmove', onMove);
            window.removeEventListener('touchend', onEnd);
        };

        const onStart = (e, type) => {
            e.preventDefault(); e.stopPropagation();
            activeResizeType = type;
            document.body.classList.add('is-resizing');
            window.addEventListener('mousemove', onMove);
            window.addEventListener('mouseup', onEnd);
            window.addEventListener('touchmove', onMove, { passive: false });
            window.addEventListener('touchend', onEnd);
        };

        if (vHandle) {
            vHandle.onmousedown = (e) => onStart(e, 'vertical');
            vHandle.ontouchstart = (e) => onStart(e, 'vertical');
        }
        if (hHandle) {
            hHandle.onmousedown = (e) => onStart(e, 'horizontal');
            hHandle.ontouchstart = (e) => onStart(e, 'horizontal');
        }
        if (iHandle) {
            iHandle.onmousedown = (e) => onStart(e, 'input');
            iHandle.ontouchstart = (e) => onStart(e, 'input');
        }
    }
};