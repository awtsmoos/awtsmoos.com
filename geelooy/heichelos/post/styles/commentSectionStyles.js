//B"H
export function injectCommentSectionCSS() {
    var id = "BH-awtsmooStylification";
    var g = document.querySelector("." + id);
    if(g) return;
    
    const style = document.createElement("style");
    style.classList.add(id);
    style.textContent = /*css*/`
        .comment-section {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background: #fff;
            padding: 16px;
            border-bottom: 1px solid #eee;
            font-size: 1em; /* B"H - Inherit */
        }
        
        /* B"H - New Visible Toolbar for Standard Comments */
        .comment-toolbar {
            display: flex;
            gap: 10px;
            margin-top: 8px;
            border-top: 1px dashed #eee;
            padding-top: 8px;
            align-items: center;
        }

        .comment-tool-btn {
            background: transparent;
            border: 1px solid #ddd;
            color: #666;
            font-size: 0.85em;
            padding: 4px 8px;
            cursor: pointer;
            border-radius: 4px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 4px;
        }

        .comment-tool-btn:hover {
            background: #f0f0f0;
            color: #000;
            border-color: #999;
        }
        
        .comment-tool-btn.reply {
            color: #0066cc;
            border-color: #cce5ff;
        }
        .comment-tool-btn.reply:hover {
            background: #e6f2ff;
        }

        .add-comment-area {
            display: flex;
            flex-direction: column;
            gap: 12px;
            font-size: 1em;
        }

        /* The initial fake input button */
        .btn.add-comment {
            padding: 12px 16px;
            background: #f9fafb;
            color: #6b7280;
            border: 1px solid #e5e7eb;
            border-radius: 20px;
            cursor: text;
            font-size: 1em; /* Relative sizing */
            transition: all 0.2s ease;
            text-align: left;
        }

        .btn.add-comment:hover {
            background: #f3f4f6;
            border-color: #d1d5db;
            color: #374151;
        }

        /* The actual editable box */
        .comment-box {
            min-height: 80px;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            padding: 12px;
            font-size: 1em; /* Relative sizing */
            color: #111;
            outline: none;
            background: #fff;
            transition: all 0.2s ease;
            overflow-y: auto;
            line-height: 1.5;
        }

        .comment-box:focus {
            border-color: #0066cc;
            box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
        }

        .comment-box:empty:before {
            content: attr(placeholder);
            color: #9ca3af;
            pointer-events: none;
            display: block; 
        }

        .image-upload-icon {
            align-self: flex-start;
            cursor: pointer;
            font-size: 1.25em; /* Larger icon relative to text */
            color: #6b7280;
            transition: color 0.2s ease;
            margin-left: 4px;
            padding: 4px;
            border-radius: 4px;
        }

        .image-upload-icon:hover {
            color: #111;
            background: #f3f4f6;
        }

        .image-gallery {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-top: 8px;
        }

        .image-gallery img {
            width: 64px;
            height: 64px;
            object-fit: cover;
            border-radius: 6px;
            cursor: pointer;
            box-shadow: 0 1px 2px rgba(0,0,0,0.1);
            border: 1px solid #eee;
        }

        /* Button Container */
        .button-container {
            display: none; /* Hidden by default, toggled via JS */
            justify-content: flex-end;
            gap: 8px;
            margin-top: 8px;
        }

        .btn.cancel-comment {
            background: transparent;
            color: #555;
            border: none;
            padding: 8px 16px;
            font-weight: 600;
            font-size: 0.9em;
            cursor: pointer;
            border-radius: 6px;
        }

        .btn.cancel-comment:hover {
            background: #f3f4f6;
            color: #111;
        }

        .btn.submit-comment {
            background: #0066cc;
            color: white;
            padding: 8px 20px;
            border-radius: 6px;
            font-weight: 600;
            font-size: 0.9em;
            border: none;
            cursor: pointer;
            transition: background 0.2s;
        }

        .btn.submit-comment:hover {
            background: #0052a3;
        }

        .btn.submit-comment:disabled {
            background: #e5e7eb;
            color: #9ca3af;
            cursor: not-allowed;
        }

        /* --- Intense Reply Box Styles --- */
        .awtsmoos-reply-box {
            margin-top: 15px;
            margin-left: 20px;
            padding: 10px;
            background: #000;
            border: 2px solid #00ff00; /* Neon Green */
            box-shadow: 4px 4px 0 #005500;
            color: #00ff00;
            font-family: monospace;
            position: relative;
            animation: slideDown 0.2s ease-out;
            font-size: 1em; /* B"H - Inherit */
        }

        .reply-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 0.8em;
            text-transform: uppercase;
            font-weight: bold;
            border-bottom: 1px dashed #00ff00;
            padding-bottom: 4px;
        }

        .reply-input {
            width: 100%;
            background: #111;
            color: #fff;
            border: 1px solid #333;
            padding: 8px;
            box-sizing: border-box;
            min-height: 60px;
            font-family: inherit;
            resize: vertical;
            font-size: 1em;
        }
        
        .reply-input:focus {
            outline: none;
            border-color: #00ff00;
        }

        .reply-submit {
            margin-top: 8px;
            background: #00ff00;
            color: #000;
            border: none;
            padding: 6px 12px;
            font-weight: bold;
            cursor: pointer;
            text-transform: uppercase;
            width: 100%;
            font-size: 1em;
        }
        .reply-submit:hover {
            background: #fff;
        }

        .close-reply {
            background: transparent;
            border: none;
            color: #ff0000;
            cursor: pointer;
            font-weight: bold;
            font-size: 1.2em;
        }
    `;
    document.head.appendChild(style);
}