// /BH/awtsmoos.com/geelooy/heichelos/post/functions/interaction/scrolling.js
//B"H
/**
 * @file scrolling.js
 * The Navigator of Coordinates.
 */

export function scrollToActiveEl() {
    const params = new URLSearchParams(location.search);
    const idx = params.get("idx");
    const sub = params.get("sub");

    if (idx === null) return;
    
    console.log(`B"H - [Interaction] Targetting coordinates: Verse ${idx}, Sub ${sub}`);
    
    const tryScroll = (attempts = 0) => {
        // Give up after 30 attempts (approx 3 seconds)
        if (attempts > 30) return; 

        // 1. Find the Verse (Section)
        // Checks both data attributes for robustness
        const section = document.querySelector(`.section[data-awtsmoos-idx="${idx}"], .section[data-idx="${idx}"]`);
        
        if (section) {
            let target = section;
            let foundSub = false;
            
            // 2. Find the Paragraph (Sub-section) if requested
            if (sub !== null && sub !== "null") {
                const paragraph = section.querySelector(`.sub-awtsmoos[data-awtsmoos-sub="${sub}"], .sub-awtsmoos[data-idx="${sub}"]`);
                if (paragraph) {
                    target = paragraph;
                    foundSub = true;
                    console.log("B\"H - Found Sub-section target.");
                } else {
                    console.warn("B\"H - Sub-section not found (yet?), scrolling to Verse.");
                }
            }
            
            // 3. The Scroll Command
            target.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // 4. Visual Confirmation (The Flash)
            if (foundSub) {
                target.classList.add('active-reading-sub');
            } else {
                target.classList.add('active-reading-section'); 
            }
            
            return; 
        }
        
        // Retry if the Scribe is still working
        setTimeout(() => tryScroll(attempts + 1), 100);
    };
    
    tryScroll();
}