
/**
 * B"H
 */
export default /*css*/`
:root {
    --base-font-size: 85px;
    --stroke: 12px;
}

.gameMenu {
    display: flex;
    justify-content: start;
    flex-direction: column;
    top: 0;
    padding: 20px;
    height: 100%;
    background: rgba(10, 10, 20, 0.9);
    border-right: 2px solid #00ffed;
    position: absolute;
    z-index: 5000;
    transition: all 0.4s ease;
}

.onscreen { left: 0px !important; opacity: 1; }
.offscreen { left: -500px !important; opacity: 0; pointer-events: none; }

.menu {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0; left: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: radial-gradient(circle at center, #23144F 0%, #0a0a1e 100%);
    overflow: hidden;
}

.mainTitle .lns {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
}

.txt {
    font-family: 'Fredoka One', cursive;
    font-size: var(--base-font-size);
    color: #fff;
    text-shadow: 0 0 20px rgba(0, 255, 237, 0.5);
    margin: 0; padding: 0;
}

.line:first-child .txt { color: #FECB39; }

.mitzvahBtn {
    margin-bottom: 25px;
    border-radius: 50px;
    border-bottom: 6px solid #3C9F00;
    background: #44C300;
    box-shadow: 0px 8px 0px 6px rgba(0, 0, 0, 0.10), 0px 0px 0px 8px #FECB39;
    display: inline-flex;
    padding: 12px 40px;
    cursor: pointer;
    transition: all 0.2s;
}

.mitzvahBtn:hover { transform: scale(1.05); filter: brightness(1.1); }
.mitzvahBtn:active { transform: scale(0.95); border-bottom-width: 2px; }

.rectangle {
    background: #FFF;
    filter: blur(8px);
    position: absolute;
    bottom: 0;
    pointer-events: none;
}
`;
