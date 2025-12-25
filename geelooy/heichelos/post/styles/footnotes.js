
//B"H
export function injectFootnoteCSS() {
    const id = "BH-footnoteStyles-Intense-V1";
    if (document.getElementById(id)) return;
    
    const style = document.createElement("style");
    style.id = id;
    style.textContent = /*css*/`
        /* --- Footnote Reference in Text (sup) --- */
        sup.footnote-ref, .active-footnote-ref {
            font-weight: 900;
            color: #0066cc;
            cursor: pointer;
            padding: 2px 6px;
            margin: 0 2px;
            transition: all 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55);
            display: inline-block;
            font-size: 0.85em;
            border-radius: 4px;
            background: rgba(0, 102, 204, 0.05);
            border: 1px solid transparent;
            vertical-align: super;
            line-height: 1;
        }
        
        /* Hover State */
        sup.footnote-ref:hover, .active-footnote-ref:hover {
            color: #fff; 
            background-color: #ff0055; /* Intense Neon Red */
            border-color: #ff0055;
            transform: scale(1.5) translateY(-5px);
            box-shadow: 0 5px 15px rgba(255, 0, 85, 0.4);
            z-index: 100;
            text-shadow: 0 1px 2px rgba(0,0,0,0.2);
        }

        /* Active State (Synced from Sidebar) */
        sup.footnote-ref.active-footnote-match {
            background-color: #ffea00; /* Intense Yellow */
            color: #000;
            border: 2px solid #000;
            transform: scale(1.8);
            box-shadow: 0 0 20px rgba(255, 234, 0, 0.8);
            z-index: 50;
            animation: pulse-footnote 1.5s infinite;
        }

        /* --- Sidebar Footnote Item --- */
        .footnote-item {
            border-left: 4px solid transparent;
            transition: all 0.2s;
        }

        .footnote-item.active {
            background-color: #fffde7 !important;
            border-left-color: #ffea00 !important;
            box-shadow: inset 0 0 10px rgba(255, 234, 0, 0.1);
        }

        .footnote-item .footnote-id {
            font-weight: 900;
            color: #0066cc;
            font-family: monospace;
            font-size: 1.1em;
        }
        
        /* Make the * look bigger if it's an asterisk */
        .footnote-item[data-footnote-id="*"] .footnote-id,
        sup.footnote-ref[data-footnote-id="*"] {
            font-size: 1.2em;
            vertical-align: middle;
        }

        /* --- Footnote Overlay --- */
        #footnote-overlay {
            position: fixed;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%);
            width: 90%;
            max-width: 600px;
            background: #111;
            color: #00ff00; /* Neon Green */
            padding: 25px;
            border: 2px solid #00ff00;
            box-shadow: 0 0 50px rgba(0, 255, 0, 0.2);
            z-index: 10000;
            font-family: 'Courier New', monospace;
            font-size: 1.1rem;
            animation: slideUpFootsie 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28);
            cursor: pointer;
            border-radius: 8px;
        }
        
        #footnote-overlay strong { color: #fff; }
        
        #footnote-overlay::after {
            content: 'TAP TO DISMISS';
            display: block;
            font-size: 0.7em;
            color: #666;
            margin-top: 15px;
            text-align: right;
            font-weight: bold;
            letter-spacing: 2px;
        }
        
        @keyframes slideUpFootsie {
            from { transform: translate(-50%, 120%); opacity: 0; }
            to { transform: translate(-50%, 0); opacity: 1; }
        }
        
        @keyframes pulse-footnote {
            0% { box-shadow: 0 0 0 0 rgba(255, 234, 0, 0.7); }
            70% { box-shadow: 0 0 0 10px rgba(255, 234, 0, 0); }
            100% { box-shadow: 0 0 0 0 rgba(255, 234, 0, 0); }
        }
    `;
    document.head.appendChild(style);
}
