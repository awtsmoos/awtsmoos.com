// B"H
/**
 * @file mainMenu.js
 * @description
 * THE GATEWAY — Aspect-Ratio Protected Main Menu
 */
export default /*css*/`
    .menu {
        width: 100vw;
        height: 100vh;
        position: fixed;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: radial-gradient(circle at center, #1e1e4a 0%, #030311 100%);
        overflow: hidden;
        z-index: 1000;
        font-family: 'Outfit', sans-serif;
    }

    /* 
       B"H: THE VESSEL OF SYMMETRY
       A container that keeps everything centered and scaled.
    */
    .menu-vessel {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-evenly;
        width: 90%;
        height: 85%;
        max-width: 1200px;
        max-height: 900px;
        text-align: center;
        position: relative;
    }

    .mainTitle {
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0;
    }

    .title-word {
        font-size: clamp(2.5rem, 12vw, 8rem);
        font-weight: 900;
        letter-spacing: clamp(4px, 2vw, 20px);
        text-transform: uppercase;
        line-height: 0.9;
        color: #fff;
        text-shadow: 0 0 20px rgba(0, 243, 255, 0.4);
        white-space: nowrap;
    }

    .title-word.gold {
        color: var(--mitzvah-gold, #ffde40);
        text-shadow: 0 0 30px rgba(255, 222, 64, 0.5);
    }

    .menu-actions {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: clamp(15px, 3vh, 40px);
        width: 100%;
        max-width: 500px;
    }

    .mitzvahBtn {
        width: 100%;
        padding: clamp(12px, 2.5vh, 25px);
        border-radius: 20px;
        border: none;
        background: linear-gradient(135deg, #2ecc71, #27ae60);
        color: white;
        font-size: clamp(1rem, 4vw, 1.6rem);
        font-weight: 800;
        cursor: pointer;
        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        box-shadow: 0 10px 30px rgba(46, 204, 113, 0.3), inset 0 2px 4px rgba(255,255,255,0.3);
        position: relative;
        overflow: hidden;
    }

    .mitzvahBtn:hover {
        transform: scale(1.05) translateY(-5px);
        filter: brightness(1.15);
        box-shadow: 0 15px 40px rgba(46, 204, 113, 0.5);
    }

    .mitzvahBtn:active {
        transform: scale(0.95);
    }

    /* B"H: The Skyward Sentinel (Login) */
    .loginHeader {
        position: absolute;
        top: 20px;
        right: 20px;
    }

    @media (max-width: 600px) {
        .title-word { font-size: 15vw; }
        .menu-vessel { height: 95%; }
    }

    @media (max-height: 450px) {
        .menu-vessel { flex-direction: row; gap: 30px; }
        .mainTitle { width: 50%; }
        .menu-actions { width: 40%; }
    }
`;

