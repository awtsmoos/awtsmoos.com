
/**
 * @file MatrixStyle.js
 * @description
 * * Chapter 3: The Empty Space
 * In the beginning, the screen was a chaotic void.
 * We have established the laws of Tiferet (Beauty/Balance)!
 * This style ensures all elements gravitate toward the center, 
 * the point of Singularity from which all Mitzvah World emanates.
 * * The 'menu' is now a fixed sanctuary, spanning the entire horizon,
 * providing a stable base for the soul's journey to begin.
 */

export default /*css*/`
    .menu {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        background: radial-gradient(circle at center, #23144F 0%, #0a0a1e 100%);
        overflow: hidden !important;
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
        justify-content: center !important;
        z-index: 100;
        box-sizing: border-box;
    }

    /* The Drifting Sparks of the Void */
    .rectangle {
        position: absolute;
        background: white;
        filter: blur(12px);
        border-radius: 6px;
        opacity: 0.4;
        pointer-events: none;
        z-index: 0;
    }

    /* The login header - The Gate of Entry */
    .loginHeader {
        position: fixed;
        top: 30px;
        right: 30px;
        z-index: 1000;
        pointer-events: auto !important;
    }

    .info {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 10;
        width: 100%;
        max-width: 800px;
        height: auto;
        /* B"H: Centering the entire info cluster through the heart */
        margin: auto;
        padding: 40px;
        box-sizing: border-box;
    }
    
    @media (max-width: 600px) {
        .info {
            padding: 20px;
        }
        .loginHeader {
            top: 15px;
            right: 15px;
        }
    }
`;
