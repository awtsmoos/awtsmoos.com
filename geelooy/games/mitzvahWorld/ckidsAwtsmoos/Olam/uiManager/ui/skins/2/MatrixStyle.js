
/**
 * @file MatrixStyle.js
 * @description
 * THE FOUNDATION OF THE VOID
 * 
 * Chapter 3: The Empty Space.
 * This style creates a deep, infinite background. No excessive glows, 
 * just the sharp contrast of white sparks against the abyss, 
 * perfectly illustrating the "Ayin" from which the "Yesh" (existence) emerges.
 */

export default /*css*/`
    .menu {
        background: #0a0a1e; /* Absolute Cosmic Deep Blue */
        overflow: hidden;
        width: 100vw;
        height: 100vh;
        position: fixed;
        top: 0; left: 0;
    }

    /* The Sharp Sparks - No Blur, Pure Intent */
    .rectangle {
        position: absolute;
        background: rgba(255, 255, 255, 0.8);
        border: 1px solid rgba(255, 255, 255, 0.2);
        box-sizing: border-box;
        pointer-events: none;
        z-index: 1;
        /* Slight rounding to suggest the letters of the soul */
        border-radius: 4px;
    }

    .info {
        position: relative;
        z-index: 100;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        padding-bottom: 10vh;
    }

    .loginHeader {
        position: fixed;
        top: 3vmin;
        right: 4vmin;
        z-index: 1000;
    }
`;
