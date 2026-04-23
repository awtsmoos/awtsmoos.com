
// B"H
/**
 * @file resizer.js
 * @brief The Engine of Proportion.
 */
export const VibeResizer = {
    bind(container) {
        const vHandle = container.querySelector('#vibe-resizer-vertical');
        const hHandle = container.querySelector('#vibe-resizer-horizontal');
        const wrapper = container.querySelector('.vibe-container');
        if (!vHandle || !hHandle || !wrapper) return;

        let isVerticalResize = false;

        const onMove = (e) => {
            const clientX = e.clientX ?? e.touches?.[0]?.clientX;
            const clientY = e.clientY ?? e.touches?.[0]?.clientY;
            if (clientX === undefined || clientY === undefined) return;
            
            const rect = wrapper.getBoundingClientRect();

            if (isVerticalResize) {
                // Mobile/Stacked view: resizing the height of the chat panel
                const percent = ((clientY - rect.top) / rect.height) * 100;
                wrapper.style.setProperty('--chat-panel-height', `${Math.max(10, Math.min(90, percent))}%`);
            } else {
                // Desktop/Side-by-side view: resizing the width of the side panel
                const width = rect.right - clientX;
                wrapper.style.setProperty('--side-panel-width', `${Math.max(50, Math.min(width, rect.width - 50))}px`);
            }
        };

        const onEnd = () => {
            document.body.classList.remove('is-resizing');
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onEnd);
            window.removeEventListener('touchmove', onMove);
            window.removeEventListener('touchend', onEnd);
        };

        const onStart = (e, isVert) => {
            e.preventDefault(); e.stopPropagation();
            isVerticalResize = isVert;
            document.body.classList.add('is-resizing');
            window.addEventListener('mousemove', onMove);
            window.addEventListener('mouseup', onEnd);
            window.addEventListener('touchmove', onMove, { passive: false });
            window.addEventListener('touchend', onEnd);
        };

        if (vHandle) {
            vHandle.onmousedown = (e) => onStart(e, false);
            vHandle.ontouchstart = (e) => onStart(e, false);
        }
        if (hHandle) {
            hHandle.onmousedown = (e) => onStart(e, true);
            hHandle.ontouchstart = (e) => onStart(e, true);
        }
    }
};
