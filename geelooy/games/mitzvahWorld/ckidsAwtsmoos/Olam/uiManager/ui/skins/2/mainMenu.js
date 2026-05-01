
/**
 * B"H
 */
export default /*css*/`
    .menu {
        width: 100%;
        height: 100%;
        position: fixed;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: radial-gradient(circle at 50% 50%, #1a1a3e 0%, #050515 100%);
        overflow: hidden;
        z-index: 1000;
        font-family: 'Outfit', sans-serif;
    }

    .info {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 50px;
        z-index: 10;
        animation: fadeInMenu 1s ease-out;
    }

    @keyframes fadeInMenu {
        from { opacity: 0; transform: translateY(30px); }
        to { opacity: 1; transform: translateY(0); }
    }

    .mainTitle {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: -10px;
    }

    .title-word {
        font-size: 120px;
        font-weight: 900;
        letter-spacing: 15px;
        color: #fff;
        position: relative;
        text-transform: uppercase;
        line-height: 0.9;
        filter: drop-shadow(0 0 20px rgba(0, 243, 255, 0.3));
    }

    .title-word:first-child {
        color: var(--otzar-gold, #ffde40);
        filter: drop-shadow(0 0 25px rgba(255, 222, 64, 0.4));
    }

    .title-word::after {
        content: attr(data-text);
        position: absolute;
        left: 0; top: 0;
        z-index: -1;
        -webkit-text-stroke: 4px rgba(255, 255, 255, 0.1);
        color: transparent;
        transform: translate(4px, 4px);
    }

    .mitzvahBtn {
        position: relative;
        padding: 20px 60px;
        background: linear-gradient(135deg, #44C300 0%, #2e8b57 100%);
        border: none;
        border-radius: 20px;
        color: white;
        font-size: 24px;
        font-weight: 800;
        letter-spacing: 2px;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        box-shadow: 0 10px 0 #2d8000, 0 15px 30px rgba(0,0,0,0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        text-shadow: 0 2px 4px rgba(0,0,0,0.3);
    }

    .mitzvahBtn:hover {
        transform: translateY(-5px);
        box-shadow: 0 15px 0 #2d8000, 0 20px 40px rgba(0,0,0,0.5);
        filter: brightness(1.1);
    }

    .mitzvahBtn:active {
        transform: translateY(5px);
        box-shadow: 0 5px 0 #2d8000, 0 5px 15px rgba(0,0,0,0.3);
    }

    .svgHolder {
        position: absolute;
        inset: 0;
        pointer-events: none;
        opacity: 0.3;
    }

    .mitzvahBtnTxt {
        z-index: 2;
    }

    /* B"H: The login header at the top */
    .loginHeader {
        position: fixed;
        top: 30px;
        right: 30px;
        z-index: 100;
    }
`;

