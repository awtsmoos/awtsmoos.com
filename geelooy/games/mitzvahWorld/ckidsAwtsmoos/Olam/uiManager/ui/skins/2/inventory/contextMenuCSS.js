
/**
 * B"H
 * @module contextMenuCSS
 * The sacred CSS responsible for the manifestation of the Item Context Menu.
 */

export default /*css*/`
.awtsmoosContextMenu {
    background: rgba(15, 10, 25, 0.98) !important;
    border: 3px solid #00ffed !important;
    border-radius: 12px !important;
    z-index: 60000 !important;
    display: flex !important;
    flex-direction: column !important;
    padding: 10px !important;
    gap: 8px !important;
    min-width: 180px !important;
    max-width: 250px !important;
    box-shadow: 0 10px 40px rgba(0,255,237,0.4), inset 0 0 15px rgba(0,255,237,0.2) !important;
    font-family: 'Fredoka One', cursive !important;
    position: fixed !important; 
    pointer-events: auto !important;
}

.awtsmoosContextMenu.hidden {
    display: none !important;
    visibility: hidden !important;
    pointer-events: none !important;
}

.ctx-title-group {
    display: flex;
    flex-direction: column;
    align-items: center;
    border-bottom: 2px dashed #00ffed;
    padding-bottom: 10px;
    margin-bottom: 5px;
}

.ctx-title {
    color: #ffd700;
    text-align: center;
    font-size: 16px;
    letter-spacing: 1px;
    text-transform: uppercase;
}

.ctx-type {
    color: #ff00ea;
    font-size: 11px;
    font-family: sans-serif;
    letter-spacing: 1px;
    margin: 4px 0;
}

.ctx-desc {
    color: #cccccc;
    font-size: 12px;
    font-family: sans-serif;
    text-align: center;
    line-height: 1.3;
}

.ctx-btn {
    background: linear-gradient(90deg, rgba(0, 255, 237, 0.1), transparent);
    border: 2px solid transparent;
    color: white;
    text-align: left;
    padding: 10px 15px;
    cursor: pointer;
    font-size: 13px;
    border-radius: 6px;
    transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    text-transform: uppercase;
    width: 100%;
    margin: 2px 0;
}

.ctx-btn:hover {
    background: rgba(0, 255, 237, 0.3);
    border-color: #00ffed !important;
    transform: scale(1.05) translateX(5px);
    box-shadow: 0 0 15px rgba(0, 255, 237, 0.5);
    color: #fff;
    font-weight: bold;
}
`;
