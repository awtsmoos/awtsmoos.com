
// B"H
export const VibeResizers = {
    bind(container) {
        const verticalResizer = container.querySelector('#vibe-resizer-vertical');
        const horizontalResizer = container.querySelector('#vibe-resizer-horizontal');
        const vibeContainer = container.querySelector('.vibe-container');

        const handleMove = (e) => {
            const clientX = e.clientX ?? e.touches?.[0]?.clientX;
            const clientY = e.clientY ?? e.touches?.[0]?.clientY;
            if (clientX === undefined || clientY === undefined) return;
            
            const rect = vibeContainer.getBoundingClientRect();
            const isMobile = window.innerWidth <= 768;

            if (isMobile) {
                let newChatHeight = clientY - rect.top;
                if (newChatHeight < 50) newChatHeight = 50;
                if (newChatHeight > rect.height - 50) newChatHeight = rect.height - 50;
                vibeContainer.style.setProperty('--chat-panel-basis', `${newChatHeight}px`);
            } else {
                let newSideWidth = rect.right - clientX;
                if (newSideWidth < 40) newSideWidth = 40;
                if (newSideWidth > rect.width - 50) newSideWidth = rect.width - 50;
                vibeContainer.style.setProperty('--side-panel-width', `${newSideWidth}px`);
            }
        };

        const stopResize = () => {
            document.body.classList.remove('is-resizing');
            document.removeEventListener('mousemove', handleMove);
            document.removeEventListener('mouseup', stopResize);
            document.removeEventListener('touchmove', handleMove);
            document.removeEventListener('touchend', stopResize);
        };

        const startResize = (e) => {
            e.preventDefault();
            document.body.classList.add('is-resizing');
            document.addEventListener('mousemove', handleMove);
            document.addEventListener('mouseup', stopResize);
            document.addEventListener('touchmove', handleMove, { passive: false });
            document.addEventListener('touchend', stopResize);
        };

        if (verticalResizer) {
            verticalResizer.addEventListener('mousedown', startResize);
            verticalResizer.addEventListener('touchstart', startResize);
        }
        if (horizontalResizer) {
            horizontalResizer.addEventListener('mousedown', startResize);
            horizontalResizer.addEventListener('touchstart', startResize);
        }
    }
};
