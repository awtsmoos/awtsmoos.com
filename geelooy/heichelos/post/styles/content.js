//B"H
/**
 * Content Styling for the Holy Post.
 * Re-imagined for high contrast, deep readability, and radiant active states.
 * Hardened to reflect the Divine Light of the Torah.
 */
export function injectPostContentCSS() {
    const id = "BH-postContentStyles-V8-Polished";
    if (document.getElementById(id)) return;
    
    const style = document.createElement("style");
    style.id = id;
    style.textContent = /*css*/`
        /* --- Base Text Section --- */
        .section {
            margin-bottom: 6em;
            position: relative;
            padding: 40px 50px;
            border-radius: 24px;
            transition: all 0.7s cubic-bezier(0.19, 1, 0.22, 1);
            border: 2px solid transparent;
            background-color: transparent;
            box-sizing: border-box;
            scroll-margin-top: 15vh; 
        }
        
        .section.active {
            background-color: #ffffff !important;
            border-color: rgba(255, 214, 0, 0.4) !important; 
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.04);
            z-index: 10;
        }

        .toichen {
            display: block;
            font-size: 24px !important;
            color: #1a202c;
            line-height: 2.2;
            font-family: 'SBL Hebrew', 'Georgia', serif;
        }

        /* --- Comment Indicators (The Illuminator) --- */
        .awtsmoos-comment-indicator {
            margin: 15px 0;
            cursor: pointer;
            opacity: 0;
            transform: scale(0.5);
            transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
            display: flex;
            align-items: center;
            justify-content: flex-start;
            width: fit-content;
            height: 28px;
            pointer-events: auto;
            position: relative;
        }

        .awtsmoos-comment-indicator.visible {
            opacity: 1;
            transform: scale(1);
        }

        .awtsmoos-comment-indicator.sub-indicator {
            margin-top: 10px;
            margin-bottom: 5px;
            z-index: 100;
        }

        .awtsmoos-flame {
            font-size: 18px;
            filter: drop-shadow(0 0 5px rgba(255, 214, 0, 0.8));
            animation: flamePulse 2s infinite ease-in-out;
        }

        .awtsmoos-flame.small {
            font-size: 14px;
        }

        @keyframes flamePulse {
            0% { transform: scale(1); opacity: 0.8; }
            50% { transform: scale(1.2); opacity: 1; }
            100% { transform: scale(1); opacity: 0.8; }
        }

        /* --- Sub-sections --- */
        .sub-awtsmoos { 
            display: block; 
            margin: 1.8em 0; 
            padding: 20px 30px;
            border-left: 4px solid #f0f0f0; 
            background: rgba(250, 250, 250, 0.3);
            border-radius: 14px;
            transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
            position: relative;
            opacity: 0.85;
            scroll-margin-top: 15vh;
        }
        
        .sub-awtsmoos.active {
            background-color: #ffffff !important;
            border-left-color: #ffd600 !important; 
            border-left-width: 6px !important;
            transform: translateX(10px);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
            z-index: 20;
            opacity: 1;
        }

        /* --- Hebrew Hardening --- */
        .toichen.heb {
            direction: rtl !important;
            text-align: right !important;
        }

        .toichen.heb .sub-awtsmoos {
            direction: rtl !important;
            text-align: right !important;
            border-left: none !important;
            border-right: 4px solid #f0f0f0 !important;
        }

        .toichen.heb .sub-awtsmoos.active {
            border-right-color: #ffd600 !important;
            border-right-width: 6px !important;
            transform: translateX(-10px); 
        }

        .toichen.heb .awtsmoos-comment-indicator {
            justify-content: flex-start;
        }

        /* --- Verse Badges --- */
        .awtsmoos-section-header {
            display: flex;
            align-items: center;
            margin-bottom: 25px;
            height: 40px;
            pointer-events: none;
        }

        .awtsmoos-verse-number {
            pointer-events: auto;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            background: #2d3748;
            color: #fff;
            font-size: 13px;
            font-weight: 800;
            min-width: 34px;
            height: 28px;
            padding: 0 8px;
            border-radius: 6px;
            cursor: pointer;
            font-family: 'JetBrains Mono', monospace;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        
        .awtsmoos-verse-number:hover {
            background: #ffd600;
            color: #000;
            transform: scale(1.15) translateY(-2px);
        }

        .awtsmoos-verse-number.hidden { display: none; }
        
        /* Scroll Selection Highlight */
        .highlight-new-comment {
            animation: highlightGlow 2s ease;
        }
        
        @keyframes highlightGlow {
            0% { background-color: rgba(255, 214, 0, 0.2); }
            100% { background-color: transparent; }
        }

        /* --- Scrollbar Customization --- */
        #realPost::-webkit-scrollbar { width: 10px; }
        #realPost::-webkit-scrollbar-track { background: #fff; }
        #realPost::-webkit-scrollbar-thumb {
            background: #e2e8f0;
            border-radius: 10px;
            border: 3px solid #fff;
        }
        #realPost::-webkit-scrollbar-thumb:hover { background: #cbd5e0; }

        /* --- Inline Comment Polishing --- */
        .inline-comment {
            position: relative;
            padding: 10px 15px;
            background: #fdfdfd;
            border: 1px solid #eee;
            border-radius: 12px;
            margin: 10px 0;
            box-shadow: 0 2px 5px rgba(0,0,0,0.02);
        }
        .inline-comment .awtsmoosTooltip {
            position: absolute;
            top: 5px;
            right: 10px;
            z-index: 5;
        }
        .heb .inline-comment .awtsmoosTooltip {
            right: auto;
            left: 10px;
        }
    `;
    document.head.appendChild(style);
}
