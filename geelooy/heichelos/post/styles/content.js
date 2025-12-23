//B"H
export function injectPostContentCSS() {
    const id = "BH-postContentStyles";
    if (document.getElementById(id)) return;
    
    const style = document.createElement("style");
    style.id = id;
    style.textContent = /*css*/`
        /* --- Comments Styling --- */
        .commentors {
            padding: 15px;
            background-color: #fcfcfc;
            min-height: 100%;
        }

        .comment-content {
            background: #fff;
            border-radius: 12px;
            padding: 16px;
            margin-bottom: 16px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.03), 0 1px 1px rgba(0,0,0,0.02);
            border: 1px solid #f0f0f0;
            transition: transform 0.2s, box-shadow 0.2s;
            position: relative;
        }

        .comment-content:hover {
            box-shadow: 0 8px 16px rgba(0,0,0,0.06);
            transform: translateY(-1px);
        }

        .commentTitle {
            font-weight: 700;
            font-size: 1.1em;
            margin-bottom: 8px;
            color: #1c1e21;
            letter-spacing: -0.01em;
        }

        .comment-text {
            font-size: 15px;
            line-height: 1.6;
            color: #050505;
            word-wrap: break-word;
        }
        
        .awtsmoos-comment-section {
            margin-top: 12px;
            padding-top: 12px;
            border-top: 1px dashed #eee;
            font-size: 0.95em;
            color: #444;
        }

        /* --- Comment Menu --- */
        .menu-container {
            position: absolute;
            top: 12px;
            right: 12px;
        }

        .menu-button {
            cursor: pointer;
            padding: 4px 6px;
            font-size: 18px;
            color: #aaa;
            border-radius: 4px;
            transition: all 0.2s;
            line-height: 1;
        }
        
        .menu-button:hover { 
            background: #f0f2f5; 
            color: #333;
        }

        .menu-options {
            position: absolute;
            right: 0;
            top: 25px;
            background: #fff;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            border: 1px solid #ebebeb;
            min-width: 140px;
            z-index: 100;
            display: none;
            overflow: hidden;
            animation: fadeInMenu 0.1s ease-out;
        }
        
        @keyframes fadeInMenu {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
        }

        .menu-item {
            padding: 10px 16px;
            font-size: 14px;
            color: #333;
            cursor: pointer;
            transition: background 0.2s;
            display: flex;
            align-items: center;
        }
        
        .menu-item:hover { background: #f7f7f7; }

        /* --- Inline Comments in Main Text --- */
        .commentator.inline {
            background-color: #fffcf5;
            border-left: 3px solid #ffcc00;
            padding: 12px 16px;
            margin: 20px 0;
            border-radius: 0 8px 8px 0;
            font-family: 'Segoe UI', sans-serif;
            font-size: 0.95rem;
            box-shadow: 0 2px 6px rgba(0,0,0,0.02);
        }

        .alias-name {
            font-weight: 700;
            margin-bottom: 8px;
            color: #333;
            font-size: 0.9em;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        
        .alias-name a { text-decoration: none; color: #d35400; }
        .alias-name a:hover { text-decoration: underline; }

        .inline-comment {
            background: white;
            padding: 12px;
            border-radius: 8px;
            margin-top: 8px;
            border: 1px solid #eee;
            box-shadow: 0 1px 3px rgba(0,0,0,0.02);
        }

        /* --- Text Sections & Verses --- */
        .section {
            margin-bottom: 1.8em;
            position: relative;
        }

        .awtsmoos-section-header {
            display: inline-block;
            margin-right: 8px;
            vertical-align: middle;
            position: relative;
        }

        .awtsmoos-verse-number {
            display: inline-block;
            background: #f0f0f0;
            color: #777;
            font-size: 0.75em;
            padding: 2px 6px;
            border-radius: 4px;
            margin-right: 4px;
            vertical-align: super;
            cursor: pointer;
            user-select: none;
            transition: all 0.2s;
        }
        
        .awtsmoos-verse-number:hover { 
            background: #333; 
            color: #fff; 
        }
        
        .awtsmoos-verse-number.hidden { display: none; }

        .toichen { display: inline; }
        
        .sub-awtsmoos { 
            display: block; 
            margin-top: 0.8em; 
            padding-left: 1.2em; 
            border-left: 3px solid #f5f5f5; 
            margin-left: 0.5em;
        }

        /* --- Post Info & Navigation --- */
        .post-info-container {
            padding: 25px;
            font-family: 'Segoe UI', sans-serif;
            color: #444;
            background: #fff;
        }
        
        .post-info-container .label {
            font-weight: 700;
            color: #999;
            font-size: 11px;
            text-transform: uppercase;
            margin-bottom: 4px;
            letter-spacing: 0.05em;
        }
        
        .post-info-container .value {
            margin-bottom: 20px;
            font-size: 15px;
            color: #222;
        }
        
        .post-navigation-container {
            display: flex;
            gap: 10px;
            align-items: center;
            margin-top: 20px;
            flex-wrap: wrap;
        }
        
        .nav-button {
            display: inline-flex;
            align-items: center;
            padding: 8px 16px;
            background: #007bff;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 600;
            transition: background 0.2s;
        }
        
        .nav-button:hover { background: #0056b3; }
        .nav-button.prev::before { content: "←"; margin-right: 5px; }
        .nav-button.next::after { content: "→"; margin-left: 5px; }

        .series-chapter-select {
            padding: 8px 12px;
            border-radius: 6px;
            border: 1px solid #ccc;
            font-size: 14px;
            margin: 5px 0;
            max-width: 100%;
            background-color: #f8f9fa;
        }
    `;
    document.head.appendChild(style);
}
