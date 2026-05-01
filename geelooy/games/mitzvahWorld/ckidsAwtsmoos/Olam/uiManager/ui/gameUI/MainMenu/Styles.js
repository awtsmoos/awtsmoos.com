/**
 * B"H
 * @module MainMenuStyles
 * @description
 * THE AESTHETIC DECREE OF THE CENTER
 */
export default /*css*/`
    .gameMenu {
        position: fixed;
        inset: 0;
        z-index: 20000;
        display: flex;
        align-items: center;
        justify-content: center;
        pointer-events: auto !important;
        transition: all 0.5s cubic-bezier(0.22, 1, 0.36, 1);
    }

    .gameMenu.offscreen {
        opacity: 0;
        pointer-events: none !important;
        transform: scale(1.1) blur(20px);
    }

    .gameMenu.onscreen {
        opacity: 1;
        transform: scale(1) blur(0);
    }

    .main-menu-overlay {
        width: 100%;
        height: 100%;
        background: radial-gradient(circle at center, rgba(36, 21, 80, 0.7) 0%, rgba(0, 0, 0, 0.9) 100%);
        backdrop-filter: blur(10px);
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .main-menu-content {
        width: 100%;
        max-width: 500px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 60px;
        padding: 40px;
    }

    .main-menu-header {
        text-align: center;
    }

    .main-menu-header h1 {
        color: #fff;
        font-family: 'Outfit', sans-serif;
        font-size: 64px;
        font-weight: 900;
        letter-spacing: 12px;
        margin: 0;
        background: linear-gradient(to bottom, #fff 0%, var(--otzar-gold, #ffde40) 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        filter: drop-shadow(0 0 20px rgba(255, 222, 64, 0.2));
    }

    .menu-subtitle {
        color: rgba(255, 255, 255, 0.5);
        font-family: 'Outfit', sans-serif;
        font-size: 16px;
        font-weight: 500;
        letter-spacing: 8px;
        margin-top: 10px;
    }

    .menu-items-container {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 20px;
    }

    .main-menu-btn {
        width: 100%;
        height: 70px;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 20px;
        position: relative;
        overflow: hidden;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .main-menu-btn .btn-text {
        color: rgba(255, 255, 255, 0.8);
        font-family: 'Outfit', sans-serif;
        font-size: 20px;
        font-weight: 700;
        letter-spacing: 4px;
        z-index: 2;
        transition: all 0.3s;
    }

    .main-menu-btn .btn-glow {
        position: absolute;
        inset: 0;
        background: linear-gradient(90deg, transparent, rgba(0, 243, 255, 0.1), transparent);
        transform: translateX(-100%);
        transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
        z-index: 1;
    }

    .main-menu-btn:hover {
        background: rgba(255, 255, 255, 0.08);
        border-color: rgba(0, 243, 255, 0.4);
        transform: scale(1.05);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    }

    .main-menu-btn:hover .btn-text {
        color: #fff;
        letter-spacing: 6px;
        text-shadow: 0 0 15px rgba(0, 243, 255, 0.5);
    }

    .main-menu-btn:hover .btn-glow {
        transform: translateX(100%);
    }

    .main-menu-btn:active {
        transform: scale(0.98);
    }
`;
