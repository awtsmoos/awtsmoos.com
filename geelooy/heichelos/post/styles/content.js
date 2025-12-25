//B"H
export function injectPostContentCSS() {
    const id = "BH-postContentStyles-Pro-V4";
    if (document.getElementById(id)) return;
    
    const style = document.createElement("style");
    style.id = id;
    style.textContent = /*css*/`
        /* Scope scaling to the reading area - 100% Ratio */
        #realPost, .comment-content, .ai-block-content {
            font-size: var(--awtsmoos-font-size, 18px);
        }

        /* --- Base Text Section --- */
        .section {
            margin-bottom: 2em;
            position: relative;
            padding: 1.5em;
            background: #fff;
            border: 3px solid #000; /* Thicker, bolder border */
            box-shadow: 8px 8px 0px #000; /* Hard, deep shadow */
            transition: transform 0.1s, box-shadow 0.1s;
        }
        
        .section:hover {
            transform: translate(-2px, -2px);
            box-shadow: 10px 10px 0px #000;
        }
        
        /* Highlighted State */
        .section.active {
            background-color: #fff9c4; /* Intense yellow tint */
            border-color: #000;
            box-shadow: 8px 8px 0px #000; /* Keep shadow black for contrast */
        }

        .toichen {
            display: block;
            font-size: 1em; /* Scales 1:1 with #realPost */
            color: #000;
            line-height: 1.6;
            font-family: 'Courier New', Courier, monospace; /* Brutalist choice */
            word-wrap: break-word;
            font-weight: 500;
        }
        
        /* B"H - CRITICAL FIX: Ensure parsed elements inherit font size recursively */
        .toichen p, .toichen li, .toichen blockquote, .toichen pre, .toichen code, 
        .toichen h1, .toichen h2, .toichen h3, .toichen h4, .toichen h5, .toichen h6,
        .ai-block-content p, .ai-block-content li, .ai-block-content code {
            font-size: inherit;
            line-height: 1.6;
            margin-bottom: 1em;
        }
        
        /* --- Verse Header & Number --- */
        .awtsmoos-section-header {
            display: flex;
            align-items: center;
            margin-bottom: 1em;
            border-bottom: 2px solid #000;
            padding-bottom: 0.5em;
            background: #f0f0f0;
            margin: -1.5em -1.5em 1em -1.5em; /* Flush with border */
            padding: 0.5em 1.5em;
        }

        .awtsmoos-verse-number {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            background: #000;
            color: #fff;
            font-size: 0.8em;
            font-weight: 900;
            padding: 0.3em 0.8em;
            cursor: pointer;
            user-select: none;
            box-shadow: 3px 3px 0 rgba(0,0,0,0.2);
        }
        
        .awtsmoos-verse-number:hover {
            background: #ffcc00;
            color: #000;
            box-shadow: 1px 1px 0 #000;
            transform: translate(2px, 2px);
        }
        
        .awtsmoos-verse-number.hidden { display: none; }

        /* --- Comment Indicators --- */
        .awtsmoos-comment-indicator {
            margin-left: auto;
            cursor: pointer;
            font-size: 1.2em;
            color: #000;
        }
        
        .awtsmoos-comment-indicator:hover {
            color: #ffcc00;
            text-shadow: 2px 2px 0 #000;
        }

        /* --- Sub-sections (Paragraphs) --- */
        .sub-awtsmoos { 
            display: block; 
            margin: 1.5em 0; 
            padding: 1em;
            border-left: 6px solid #000; /* Distinct marker */
            background: #fafafa;
        }
        
        .sub-awtsmoos.active {
            background-color: #ffff00; /* Highlight yellow */
            border-left-color: #000;
            color: #000;
        }

        /* --- Hebrew Support --- */
        .toichen.heb {
            direction: rtl;
            text-align: right;
            font-family: 'David', 'Courier New', serif;
            font-size: 1.2em;
        }

        .toichen.heb .sub-awtsmoos {
            border-left: none;
            border-right: 6px solid #000;
        }

        /* --- Markdown Elements --- */
        .toichen h1, .toichen h2, .toichen h3 { 
            font-family: "Courier New", monospace;
            color: #000;
            font-weight: 900;
            text-transform: uppercase;
            border-bottom: 4px solid #000;
            padding-bottom: 0.2em;
            margin-top: 1.5em;
            font-size: 1.4em; /* Relative scale */
        }
        
        .toichen blockquote {
            border: 2px solid #000;
            background: #fff;
            padding: 1em;
            margin: 1em 0;
            font-style: italic;
            box-shadow: 4px 4px 0 #ccc;
        }
        
        .toichen pre {
            background: #000;
            color: #0f0;
            padding: 1em;
            border: 2px solid #000;
            overflow-x: auto;
            font-family: "Courier New", monospace;
            box-shadow: 6px 6px 0 #888;
        }

        .toichen ul, .toichen ol {
            padding-inline-start: 1.5em;
        }

        .toichen a {
            color: #000;
            text-decoration: none;
            border-bottom: 2px solid #000;
            font-weight: 900;
            background: rgba(255, 204, 0, 0.3);
        }
        .toichen a:hover {
            background: #ffcc00;
        }
        
        @media (max-width: 768px) {
            .section { padding: 1em; margin-bottom: 1em; box-shadow: 4px 4px 0 #000; }
            .awtsmoos-section-header { margin: -1em -1em 1em -1em; padding: 0.5em 1em; }
        }
    `;
    document.head.appendChild(style);
}