//B"H
export function injectImageUploaderCSS() {
    var id = "BH_stylesImg";
    var f = document.querySelector("." + id)
    if(f) return;
    const style = document.createElement("style");
    
    style.classList.add(id);
    style.textContent = `
        /* General Styles */
        .image-upload-popup {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            padding: 20px;
            background: linear-gradient(135deg, #f9f9f9, #ffffff);
            border-radius: 16px;
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
            z-index: 10000;
            width: 100%;
            max-width: 500px;
            box-sizing: border-box;
            font-family: 'Arial', sans-serif;
            overflow: hidden;
        }
        
        .image-upload-popup .btn {
            position: absolute;
            top: 10px;
            right: 10px;
            cursor: pointer;
            font-size: 18px;
            font-weight: bold;
            color: #ff5a5f;
            transition: transform 0.2s ease, color 0.2s ease;
        }
        
        .image-upload-popup .btn:hover {
            color: #ff878a;
            transform: scale(1.1);
        }
        
        /* Dropzone */
        .dropzone {
            border: 2px dashed #ccc;
            padding: 40px;
            text-align: center;
            margin-bottom: 20px;
            color: #555;
            font-size: 16px;
            border-radius: 12px;
            cursor: pointer;
            transition: border-color 0.3s ease, background-color 0.3s ease;
        }
        
        .dropzone:hover {
            border-color: #888;
            background-color: #f6f6f6;
        }
        
        .dropzone.drag-over {
            border-color: #4caf50;
            background-color: #e8f5e9;
        }
        
        /* API Key Input */
        input[type="text"] {
            width: calc(100% - 20px);
            padding: 10px;
            margin-bottom: 20px;
            font-size: 14px;
            border: 1px solid #ddd;
            border-radius: 8px;
            box-sizing: border-box;
            outline: none;
            transition: border-color 0.3s ease;
        }
        
        input[type="text"]:focus {
            border-color: #4caf50;
        }
        
        /* Progress Bar */
        .progress-bar {
            height: 10px;
            background: linear-gradient(to right, #4caf50, #66bb6a);
            border-radius: 5px;
            margin-bottom: 15px;
            width: 0%;
            transition: width 0.4s ease;
            overflow: hidden;
        }
        
        .progress-bar::after {
            content: '';
            display: block;
            height: 100%;
            width: 100%;
            background: rgba(255, 255, 255, 0.2);
            animation: progressShimmer 1.5s infinite;
        }
        
        @keyframes progressShimmer {
            0% {
                transform: translateX(-100%);
            }
            100% {
                transform: translateX(100%);
            }
        }
        
        /* Radial Loader */
        .radial-loader {
            width: 50px;
            height: 50px;
            border: 4px solid #e0e0e0;
            border-top: 4px solid #4caf50;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            display: none;
            margin: 20px auto;
        }
        
        .radial-loader.loading {
            display: block;
            }
        
        @keyframes spin {
            to {
                transform: rotate(360deg);
            }
        }
        
        /* Gallery */
        .gallery {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            margin-top: 20px;
        }
        
        .thumbnail {
            width: 80px;
            height: 80px;
            background-size: cover;
            background-position: center;
            position: relative;
            border: 2px solid #ddd;
            border-radius: 8px;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            cursor: pointer;
        }
        
        .thumbnail:hover {
            transform: scale(1.05);
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        }
        
        .thumbnail .remove-btn {
            position: absolute;
            top: -8px;
            right: -8px;
            background: #ff5a5f;
            color: white;
            font-size: 14px;
            border-radius: 50%;
            padding: 2px 6px;
            cursor: pointer;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
            transition: transform 0.2s ease, background-color 0.2s ease;
        }
        
        .thumbnail .remove-btn:hover {
            background: #ff878a;
            transform: scale(1.2);
        }
        
        /* Full Image Popup */
        .full-popup {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.9);
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
            z-index: 11000;
            max-width: 90%;
            max-height: 90%;
            overflow: auto;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }
        
        .full-popup img {
            max-width: 100%;
            max-height: 100%;
            border-radius: 12px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
        }
        
        .full-popup .close-btn {
            position: absolute;
            top: 10px;
            right: 10px;
            cursor: pointer;
            color: white;
            font-size: 20px;
            font-weight: bold;
            transition: transform 0.3s ease, color 0.3s ease;
        }
        
        .full-popup .close-btn:hover {
            transform: scale(1.2);
            color: #f1f1f1;
        }
        
        /* Buttons */
        button {
            background: #4caf50;
            color: white;
            font-size: 16px;
            padding: 10px 20px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            transition: background-color 0.3s ease, transform 0.2s ease;
            outline: none;
        }
        
        button:hover {
            background: #66bb6a;
            transform: scale(1.05);
        }
        
        button:active {
            transform: scale(0.95);
        }
    `;
    document.head.appendChild(style);
}
