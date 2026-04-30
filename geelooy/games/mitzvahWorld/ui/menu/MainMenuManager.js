
import SederHishtalshelusNode from '../../core/SederHishtalshelusNode.js';
import MainMenuStyles from './MainMenuStyles.js';

/**
 * B"H
 * @file MainMenuManager.js
 * 
 * Chapter: Constructing the Vessels.
 * With the new vmin-based fluid CSS, we construct the HTML vessels
 * to be deeply resilient. They will never break, never cut off, 
 * perfectly mirroring the infinite adaptability of the Awtsmoos.
 */

export default class MainMenuManager extends SederHishtalshelusNode {
    constructor(rootContainer, onStartGame) {
        super({ worldName: "Asiyah_Nostalgic_Manifestation_Fluid" });
        this.rootContainer = rootContainer;
        this.onStartGame = onStartGame;
        this.styles = new MainMenuStyles();
    }

    manifestMenu() {
        console.log(`B"H - 🌟 Manifesting fluid, unbreakable UI forms...`);
        this.styles.emanateStyles();
        
        this.rootContainer.innerHTML = '';

        // Generate the floating blurred sparks
        let sparksHTML = '';
        for(let i=0; i<20; i++) {
            const size = Math.random() * 8 + 2; // in vmin
            const left = Math.random() * 100; // in vw
            const delay = Math.random() * 15;
            const duration = Math.random() * 15 + 10;
            sparksHTML += `<div class="blurred-spark" style="width:${size}vmin; height:${size}vmin; left:${left}vw; animation-delay:-${delay}s; animation-duration:${duration}s;"></div>`;
        }

        this.rootContainer.innerHTML = `
            ${sparksHTML}
            <div id="awtsmoos-nostalgic-overlay" class="mitzvah-overlay">
                
                <div class="corner-tag">@awtsmoos ▼</div>
                
                <div class="title-group">
                    <h1 class="title-mitzvah">Mitzvah</h1>
                    <div class="small-mitzvah-world-text">Mitzvah</div>
                    <h2 class="title-world">World</h2>
                    <div class="small-mitzvah-world-text">World</div>
                </div>
                
                <div class="mitzvah-button-container">
                    <button id="btn_play_original" class="mitzvah-pill-btn">
                        <span>PLAY: ENTER THE LIVING INFINITE VOID</span>
                        <div class="btn-bubble"></div>
                    </button>
                    
                    <button class="mitzvah-pill-btn" style="opacity:0.6; cursor:not-allowed;">
                        <span>FIND WORLDS BY ALIAS</span>
                        <div class="btn-bubble"></div>
                    </button>

                    <button class="mitzvah-pill-btn" style="opacity:0.6; cursor:not-allowed;">
                        <span>LOAD WORLD FROM FILE</span>
                        <div class="btn-bubble"></div>
                    </button>
                </div>

            </div>
        `;

        this.bindEvents();
    }

    bindEvents() {
        const playBtn = document.getElementById('btn_play_original');
        if (playBtn) {
            playBtn.addEventListener('click', () => {
                console.log(`B"H - ⚡ Transition initiated into the depths!`);
                const overlay = document.getElementById('awtsmoos-nostalgic-overlay');
                if (overlay) {
                    overlay.style.transition = 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                    overlay.style.opacity = '0';
                    playBtn.style.transform = 'scale(1.5)';
                    setTimeout(() => {
                        overlay.remove();
                        // All background sparks will be cleared since rootContainer is reset
                        if (this.onStartGame) this.onStartGame();
                    }, 600);
                }
            });
        }
    }
}
