/**
 * B"H
 * @module MainMenuStyles
 * @description
 * THE AESTHETIC DECREE OF THE CENTER — Premium & Responsive
 */
export default /*css*/`
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;500;700;900&display=swap');

    :root {
        --menu-primary: #00f3ff;
        --menu-secondary: #ffde40;
        --menu-bg: rgba(10, 10, 20, 0.85);
        --menu-accent: rgba(0, 243, 255, 0.3);
        --menu-font: 'Outfit', sans-serif;
    }

    .gameMenu {
        position: fixed;
        inset: 0;
        z-index: 20000;
        display: flex;
        align-items: center;
        justify-content: center;
        pointer-events: auto !important;
        transition: all 0.6s cubic-bezier(0.22, 1, 0.36, 1);
        font-family: var(--menu-font);
    }

    .gameMenu.offscreen {
        opacity: 0;
        pointer-events: none !important;
        visibility: hidden;
        transform: scale(1.1);
        filter: blur(20px);
    }

    .gameMenu.onscreen {
        opacity: 1;
        transform: scale(1);
        filter: blur(0);
    }

    .main-menu-overlay {
        width: 100%;
        height: 100%;
        background: radial-gradient(circle at center, rgba(30, 20, 60, 0.6) 0%, rgba(5, 5, 10, 0.95) 100%);
        backdrop-filter: blur(15px);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        box-sizing: border-box;
    }

    .main-menu-content {
        width: 100%;
        max-width: 600px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: clamp(30px, 8vh, 80px);
        background: var(--menu-bg);
        padding: clamp(30px, 10vw, 60px);
        border-radius: 40px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        box-shadow: 
            0 25px 50px -12px rgba(0, 0, 0, 0.5),
            0 0 40px rgba(0, 243, 255, 0.1);
        position: relative;
        overflow: hidden;
    }

    .main-menu-content::before {
        content: '';
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background: conic-gradient(
            from 0deg,
            transparent,
            rgba(0, 243, 255, 0.05),
            transparent 20%
        );
        animation: rotateGlow 10s linear infinite;
        pointer-events: none;
    }

    @keyframes rotateGlow {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }

    .main-menu-header {
        text-align: center;
        width: 100%;
        position: relative;
        z-index: 2;
    }

    .main-menu-header h1 {
        color: #fff;
        font-size: clamp(40px, 10vw, 72px);
        font-weight: 900;
        letter-spacing: clamp(6px, 2vw, 16px);
        margin: 0;
        text-transform: uppercase;
        background: linear-gradient(135deg, #fff 30%, var(--menu-secondary) 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        filter: drop-shadow(0 0 15px rgba(255, 222, 64, 0.3));
        line-height: 1;
    }

    .menu-subtitle {
        color: rgba(255, 255, 255, 0.4);
        font-size: clamp(12px, 3vw, 14px);
        font-weight: 500;
        letter-spacing: clamp(8px, 2vw, 14px);
        margin-top: 15px;
        text-transform: uppercase;
    }

    .menu-items-container {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 20px;
        position: relative;
        z-index: 2;
    }

    .main-menu-btn {
        width: 100%;
        height: clamp(55px, 9vh, 80px);
        background: rgba(255, 255, 255, 0.02);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 20px;
        position: relative;
        overflow: hidden;
        cursor: pointer;
        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 30px;
        outline: none;
        box-sizing: border-box;
    }

    .main-menu-btn .btn-text {
        color: rgba(255, 255, 255, 0.7);
        font-size: clamp(18px, 4vw, 24px);
        font-weight: 700;
        letter-spacing: 4px;
        z-index: 3;
        transition: all 0.4s;
    }

    .main-menu-btn .btn-glow {
        position: absolute;
        inset: 0;
        background: linear-gradient(90deg, 
            transparent, 
            rgba(0, 243, 255, 0.15), 
            transparent
        );
        transform: translateX(-100%);
        transition: transform 0.6s ease;
        z-index: 1;
    }

    .main-menu-btn::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        width: 0;
        height: 2px;
        background: var(--menu-primary);
        transition: all 0.4s ease;
        transform: translateX(-50%);
        box-shadow: 0 0 10px var(--menu-primary);
    }

    .main-menu-btn:hover {
        background: rgba(255, 255, 255, 0.05);
        border-color: rgba(0, 243, 255, 0.3);
        transform: translateY(-5px);
        box-shadow: 0 15px 30px rgba(0, 0, 0, 0.4);
    }

    .main-menu-btn:hover .btn-text {
        color: #fff;
        letter-spacing: 8px;
        text-shadow: 0 0 20px var(--menu-primary);
    }

    .main-menu-btn:hover .btn-glow {
        transform: translateX(100%);
    }

    .main-menu-btn:hover::after {
        width: 60%;
    }

    .main-menu-btn:active {
        transform: translateY(-2px) scale(0.98);
    }

    /* B"H: Mobile Optimization */
    @media (max-width: 480px) {
        .main-menu-content {
            padding: 40px 20px;
            gap: 40px;
            border-radius: 30px;
        }
        
        .main-menu-btn {
            border-radius: 15px;
        }

        .main-menu-btn:hover {
            transform: translateY(-3px);
        }
    }
`;
