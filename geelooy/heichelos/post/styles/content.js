
//B"H
export function injectPostContentCSS() {
    const id = "BH-postContentStyles-Pro-V5";
    if (document.getElementById(id)) return;
    
    const style = document.createElement("style");
    style.id = id;
    style.textContent = /*css*/`
        /* Scope scaling to the reading area - 100% Ratio */
        #realPost {
            /* The parent uses the global variable, so we use ems/rems to scale relative to it */
            font-size: 1rem; 
            max-width: 900px;
            margin: 0 auto;
        }

        /* --- Base Text Section --- */
        .section {
            margin-bottom: 2.5rem;
            position: relative;
            padding: 0 0 2rem 0; /* Cleaner look, no box */
            background: transparent;
            border-bottom: 1px solid #e0e0e0;
            transition: opacity 0.2s;
        }
        
        /* Highlighted State */
        .section.active {
            background: linear-gradient(to right, rgba(255, 249, 196, 0.3), transparent);
            border-left: 4px solid #ffcc00;
            padding-left: 1rem;
        }

        /* The Main Content Text */
        .toichen {
            display: block;
            font-size: 1.25em; /* 25% larger than base UI for readability */
            color: #111;
            line-height: 1.7;
            font-family: var(--font-content, serif); 
            word-wrap: break-word;
            font-weight: 400;
        }
        
        /* Ensure inner elements scale with .toichen */
        .toichen p { margin-bottom: 1em; font-size: inherit; }
        
        /* --- Verse Header & Number --- */
        .awtsmoos-section-header {
            display: flex;
            align-items: center;
            margin-bottom: 0.8rem;
            font-family: var(--font-ui);
            font-size: 0.9rem; /* Keep metadata small */
            color: #888;
        }

        .awtsmoos-verse-number {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            margin-right: 10px;
            color: #aaa;
            cursor: pointer;
            user-select: none;
            transition: color 0.2s;
        }
        
        .awtsmoos-verse-number:hover {
            color: #000;
        }
        
        .awtsmoos-verse-number.hidden { display: none; }

        /* --- Comment Indicators --- */
        .awtsmoos-comment-indicator {
            margin-left: auto;
            cursor: pointer;
            font-size: 1.2rem;
            color: #ddd;
            transition: all 0.2s;
            opacity: 0; /* Hidden until hover or active */
        }
        
        .section:hover .awtsmoos-comment-indicator,
        .awtsmoos-comment-indicator.visible {
            opacity: 1;
        }
        
        .awtsmoos-comment-indicator:hover {
            color: #ffcc00;
            transform: scale(1.2);
        }

        /* --- Sub-sections (Paragraphs) --- */
        .sub-awtsmoos { 
            display: block; 
            margin: 1.5em 0; 
            padding: 1em;
            background: #fff;
            border-radius: 8px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.03);
            border: 1px solid transparent;
            transition: all 0.2s;
        }
        
        .sub-awtsmoos:hover {
            box-shadow: 0 4px 12px rgba(0,0,0,0.08);
            border-color: #eee;
        }
        
        .sub-awtsmoos.active {
            background-color: #fffde7; 
            border-color: #ffcc00;
            color: #000;
        }

        /* --- Hebrew Support --- */
        .toichen.heb {
            direction: rtl;
            text-align: right;
            font-family: 'David', serif;
            font-size: 1.35em; /* Hebrew needs to be slightly larger */
            line-height: 1.5;
        }
        
        .toichen.heb p { font-size: inherit; }

        /* --- Markdown Elements --- */
        .toichen h1, .toichen h2, .toichen h3 { 
            font-family: var(--font-ui);
            color: #000;
            font-weight: 800;
            margin-top: 1.5em;
            margin-bottom: 0.5em;
            line-height: 1.2;
        }
        .toichen h1 { font-size: 1.8em; border-bottom: 2px solid #000; padding-bottom: 0.2em; }
        .toichen h2 { font-size: 1.5em; }
        .toichen h3 { font-size: 1.3em; }
        
        .toichen blockquote {
            border-left: 4px solid #000;
            background: #f9f9f9;
            padding: 0.5em 1em;
            margin: 1em 0;
            font-style: italic;
            color: #555;
        }
        
        .toichen pre {
            background: #2d2d2d;
            color: #f8f8f2;
            padding: 1em;
            border-radius: 4px;
            overflow-x: auto;
            font-family: monospace;
            font-size: 0.85em; /* Code usually looks huge if 1em */
        }

        .toichen a {
            color: #0066cc;
            text-decoration: none;
            border-bottom: 1px solid rgba(0,102,204,0.3);
            font-weight: 600;
        }
        .toichen a:hover {
            background: rgba(0, 102, 204, 0.1);
            border-bottom-color: #0066cc;
        }
        
        /* Flash Animation for Scrolling to Footnote */
        @keyframes flash-yellow {
            0% { background-color: #ffff00; transform: scale(1.5); }
            50% { background-color: #ff0000; transform: scale(1.2); color: white; }
            100% { background-color: transparent; transform: scale(1); }
        }
        
        .highlight-flash {
            animation: flash-yellow 1.5s ease-out;
        }

        @media (max-width: 768px) {
            .section { margin-bottom: 1.5rem; }
            .toichen { font-size: 1.1em; } /* Slightly smaller on mobile */
        }
    `;
    document.head.appendChild(style);
}
