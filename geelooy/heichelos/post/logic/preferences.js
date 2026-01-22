//B"H
/**
 * @file preferences.js
 * @description 
 * B"H - THE MEMORY OF THE SECTIONS.
 * Synchronizes the font scale and themes.
 */
import { loadFontSize } from "../functions/utils.js";

/**
 * applyUserPreferences
 * @description B"H - Restoring the Seeker's Alchemy.
 */
export function applyUserPreferences() {
    console.log("B\"H - [Preferences] Restoring Alchemy from Memory.");
    const context = document.querySelector('.post-reader-localized-context') || document.body;

    // 1. Font Face Restoration
    const savedFont = localStorage.getItem('awtsmoos-font');
    if (savedFont) {
        document.documentElement.style.setProperty('--font-manuscript', savedFont);
        const fontSelector = document.getElementById('fontSelector');
        if (fontSelector) fontSelector.value = savedFont;
    }

    const fontSelector = document.getElementById('fontSelector');
    if (fontSelector) {
        fontSelector.onchange = (e) => {
            const val = e.target.value;
            document.documentElement.style.setProperty('--font-manuscript', val);
            localStorage.setItem('awtsmoos-font', val);
        };
    }

    // 2. Theme Restoration
    const savedTheme = localStorage.getItem('awtsmoos-theme') || 'light';
    const themeSelector = document.getElementById('themeSelector');
    if (themeSelector) {
        themeSelector.value = savedTheme;
        context.dataset.theme = savedTheme;
        
        themeSelector.onchange = (e) => {
            const val = e.target.value;
            context.dataset.theme = val;
            localStorage.setItem('awtsmoos-theme', val);
            
            const toggleBtn = document.getElementById('themeToggleBtn');
            if(toggleBtn) toggleBtn.innerHTML = (val === 'dark') ? '☀️' : '🌙';
        };
    }

    // 3. Initial Size Scaling
    loadFontSize();
    
    // 4. Theme Button Logic
    const toggleBtn = document.getElementById('themeToggleBtn');
    if(toggleBtn) {
        toggleBtn.innerHTML = (context.dataset.theme === 'dark') ? '☀️' : '🌙';
        toggleBtn.onclick = () => {
            const current = context.dataset.theme || 'light';
            const next = current === 'dark' ? 'light' : 'dark';
            if(themeSelector) {
                themeSelector.value = next;
                themeSelector.dispatchEvent(new Event('change'));
            }
        };
    }
}