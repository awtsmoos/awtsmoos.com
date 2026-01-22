//B"H
/**
 * @file visuals.js
 * @description The Aesthetics of Atzilus. Animates the Scroll rollers 
 * and implements the intersection observer that feeds data to the Conductor.
 */

/**
 * @method setupActiveVerseObserver
 * @description The Watchman. Detects which Verse or Paragraph is manifest in the center.
 */
export function setupActiveVerseObserver(scroller) {
    console.log("B\"H - [Visuals] Intersection Watchman Engaged.");
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active-reading-section');
                
                const idx = entry.target.dataset.awtsmoosIdx || entry.target.dataset.idx;
                const sub = entry.target.dataset.awtsmoosSub || entry.target.dataset.sub;
                
                if (idx !== undefined) {
                    // Command the entire application to synchronize with these coordinates
                    window.dispatchEvent(new CustomEvent("awtsmoos index", { 
                        detail: { 
                            idx: parseInt(idx), 
                            sub: sub !== undefined ? parseInt(sub) : null,
                            awtsmoos: "Awtsmoos",
                            time: Date.now()
                        } 
                    }));
                }
            } else {
                entry.target.classList.remove('active-reading-section');
            }
        });
    }, {
        root: scroller,
        rootMargin: "-45% 0px -45% 0px", // Only target the vertical middle
        threshold: 0.1
    });

    const refreshObservationLoop = () => {
        const nodes = document.querySelectorAll('.section, .sub-awtsmoos');
        if (nodes.length > 0) {
            nodes.forEach(n => observer.observe(n));
        } else {
            setTimeout(refreshObservationLoop, 500); 
        }
    };
    refreshObservationLoop();
}

/**
 * @method setupScrollUnrollEffect
 * @description Animates the physical rollers of the Scroll.
 */
export function setupScrollUnrollEffect() {
    const scrollVessel = document.getElementById('realPost');
    const topRoller = document.querySelector('.scroll-roll-top');
    const bottomRoller = document.querySelector('.scroll-roll-bottom');

    if (!scrollVessel || !topRoller || !bottomRoller) return;

    let frameId;
    const updateRollers = () => {
        const pos = scrollVessel.scrollTop;
        const backgroundOffset = `${pos * 0.5}px`;
        topRoller.style.backgroundPositionY = backgroundOffset;
        bottomRoller.style.backgroundPositionY = backgroundOffset;
    };

    scrollVessel.addEventListener('scroll', () => {
        if (frameId) cancelAnimationFrame(frameId);
        frameId = requestAnimationFrame(updateRollers);
    }, { passive: true });

    updateRollers();
    setupActiveVerseObserver(scrollVessel);
}