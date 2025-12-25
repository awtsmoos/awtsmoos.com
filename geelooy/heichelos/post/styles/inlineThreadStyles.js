//B"H
/**
 * Inline Thread Styles.
 * Designed to provide a focused, nested view of wisdom within the main text flow.
 */
export function injectInlineThreadCSS() {
    const id = "BH-inlineThreadStyles";
    if (document.getElementById(id)) return;
    
    const style = document.createElement("style");
    style.id = id;
    style.textContent = /*css*/`
        .awtsmoos-inline-thread {
            margin: 20px 0;
            padding: 20px;
            background: rgba(255, 255, 255, 0.98);
            border: 1px solid rgba(255, 214, 0, 0.4);
            border-left: 4px solid #ffd600;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.08);
            position: relative;
            animation: threadExpand 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            z-index: 50;
            user-select: text !important;
            pointer-events: auto;
        }

        @keyframes threadExpand {
            from { opacity: 0; transform: translateY(-10px) scale(0.98); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .thread-loading, .thread-empty {
            text-align: center;
            padding: 20px;
            color: #888;
            font-style: italic;
            font-size: 14px;
        }

        .thread-close-btn {
            position: absolute;
            top: 10px;
            right: 12px;
            background: #f0f0f0;
            border: none;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #666;
            font-size: 18px;
            transition: all 0.2s;
        }
        
        .thread-close-btn:hover {
            background: #ff5a5f;
            color: white;
            transform: scale(1.1);
        }

        .thread-alias-group {
            margin-bottom: 25px;
            padding-left: 5px;
        }
        
        .thread-alias-group:last-child {
            margin-bottom: 0;
        }

        .thread-alias-header {
            font-weight: 700;
            font-size: 13px;
            color: #007bff;
            margin-bottom: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .thread-alias-header::after {
            content: '';
            flex: 1;
            height: 1px;
            background: rgba(0, 123, 255, 0.1);
        }

        /* Adjustments for comments inside the thread */
        .awtsmoos-inline-thread .inline-comment {
            margin-bottom: 15px;
            background: #fff;
            border: 1px solid #eee;
            padding: 15px;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.02);
        }

        .awtsmoos-inline-thread .commentTitle {
            font-size: 16px !important;
            margin-bottom: 8px;
            color: #1a202c;
        }

        /* RTL Handling */
        .heb .awtsmoos-inline-thread {
            border-left: 1px solid rgba(255, 214, 0, 0.4);
            border-right: 4px solid #ffd600;
            direction: rtl;
        }
        
        .heb .thread-close-btn {
            right: auto;
            left: 12px;
        }

        .heb .thread-alias-header {
            text-align: right;
        }
    `;
    document.head.appendChild(style);
}
