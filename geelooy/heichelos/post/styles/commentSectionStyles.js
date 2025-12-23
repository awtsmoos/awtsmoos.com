//B"H
export function injectCommentSectionCSS() {
    var id = "BH-awtsmooStylification";
    var g = document.querySelector("." + id);
    if(g) return;
    
    const style = document.createElement("style");
    style.classList.add(id);
    style.textContent = /*css*/`
        .comment-section {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            max-width: 800px;
            margin: 20px auto;
            background: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
            padding: 20px;
            box-sizing: border-box;
            transition: all 0.3s ease;
        }

        .add-comment-area {
            display: flex;
            flex-direction: column;
            gap: 15px;
        }

        .btn.add-comment {
            padding: 12px 20px;
            background: #f0f2f5;
            color: #65676b;
            border-radius: 20px;
            cursor: pointer;
            font-size: 15px;
            transition: background 0.2s ease, color 0.2s ease;
            text-align: left;
        }

        .btn.add-comment:hover {
            background: #e4e6eb;
            color: #050505;
        }

        .comment-box {
            min-height: 100px;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 12px;
            font-size: 15px;
            color: #333;
            outline: none;
            background: #fafafa;
            transition: border-color 0.3s ease, background 0.3s ease;
            overflow-y: auto;
        }

        .comment-box:focus {
            border-color: #1877f2;
            background: #fff;
            box-shadow: 0 0 0 2px rgba(24, 119, 242, 0.2);
        }

        .comment-box:empty:before {
            content: attr(placeholder);
            color: #aaa;
            pointer-events: none;
            display: block; /* For Firefox */
        }

        .image-upload-icon {
            align-self: flex-start;
            cursor: pointer;
            font-size: 24px;
            color: #65676b;
            transition: transform 0.2s ease, color 0.2s ease;
            margin-left: 5px;
        }

        .image-upload-icon:hover {
            color: #1877f2;
            transform: scale(1.1);
        }

        .image-gallery {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-top: 10px;
        }

        .image-gallery img {
            width: 80px;
            height: 80px;
            object-fit: cover;
            border-radius: 8px;
            cursor: pointer;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
            transition: transform 0.2s ease;
        }

        .image-gallery img:hover {
            transform: scale(1.05);
        }

        .button-container {
            display: none; /* Hidden by default */
            justify-content: flex-end;
            gap: 10px;
            margin-top: 10px;
        }

        .btn.cancel-comment {
            background: transparent;
            color: #65676b;
            border: none;
            padding: 8px 16px;
            font-weight: 600;
        }

        .btn.cancel-comment:hover {
            background: #f0f2f5;
            border-radius: 6px;
            color: #050505;
        }

        .btn.submit-comment {
            background: #1877f2;
            color: white;
            padding: 8px 24px;
            border-radius: 6px;
            font-weight: 600;
            border: none;
            box-shadow: 0 2px 4px rgba(24, 119, 242, 0.2);
        }

        .btn.submit-comment:hover {
            background: #166fe5;
            box-shadow: 0 4px 6px rgba(22, 111, 229, 0.3);
        }

        .btn.submit-comment:disabled {
            background: #e4e6eb;
            color: #bcc0c4;
            cursor: not-allowed;
            box-shadow: none;
        }

        /* Dark Mode Support (Optional) */
        @media (prefers-color-scheme: dark) {
            .comment-section {
                background: #242526;
                color: #e4e6eb;
            }

            .btn.add-comment {
                background: #3a3b3c;
                color: #b0b3b8;
            }

            .btn.add-comment:hover {
                background: #4e4f50;
                color: #e4e6eb;
            }

            .comment-box {
                background: #3a3b3c;
                border-color: #3e4042;
                color: #e4e6eb;
            }

            .comment-box:focus {
                border-color: #1877f2;
                background: #3a3b3c;
            }

            .btn.cancel-comment {
                color: #b0b3b8;
            }

            .btn.cancel-comment:hover {
                background: #3a3b3c;
                color: #e4e6eb;
            }
        }
    `;
    document.head.appendChild(style);
}
