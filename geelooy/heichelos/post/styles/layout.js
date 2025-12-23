//B"H
export function injectPostLayoutCSS() {
    const id = "BH-postLayoutStyles";
    if (document.getElementById(id)) return;
    
    const style = document.createElement("style");
    style.id = id;
    style.textContent = /*css*/`
        /* --- Post Frame Layout --- */
        .post-frame {
            font-family: 'Georgia', 'Times New Roman', serif;
            font-size: 20px; 
            display: flex;
            flex-direction: row;
            flex: 1;
            height: calc(100vh - 50px); /* Fill remaining height minus header */
            position: relative;
            background: #fff;
            overflow: hidden; 
            transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
        }

        /* Main Content Area */
        div#realPost {
            flex: 1;
            padding: 40px 60px 120px 60px;
            overflow-y: auto;
            overflow-x: hidden;
            line-height: 1.8;
            color: #2a2a2a;
            scroll-behavior: smooth;
            background-color: #ffffff;
            /* Subtle texture or gradient could go here */
            background-image: linear-gradient(to bottom, #ffffff, #fafafa 15%, #ffffff 100%);
        }

        /* Sidebar (Commentary/Tabs) */
        .sidebar {
            width: 420px;
            min-width: 320px;
            max-width: 50vw;
            background: #fdfdfd;
            border-left: 1px solid #e0e0e0;
            display: flex;
            flex-direction: column;
            position: relative;
            transition: transform 0.4s cubic-bezier(0.165, 0.84, 0.44, 1), width 0.3s ease;
            box-shadow: -4px 0 20px rgba(0,0,0,0.03);
            z-index: 100;
        }
        
        .sidebar.hidden-comments {
            display: none;
        }

        /* Scrollbar Styling for Content */
        div#realPost::-webkit-scrollbar {
            width: 8px;
        }
        div#realPost::-webkit-scrollbar-track {
            background: #f1f1f1;
        }
        div#realPost::-webkit-scrollbar-thumb {
            background: #ccc;
            border-radius: 4px;
        }
        div#realPost::-webkit-scrollbar-thumb:hover {
            background: #bbb;
        }

        /* --- Mobile Responsive --- */
        @media only screen and (max-width: 850px) {
            .post-frame {
                flex-direction: column;
                height: auto;
            }

            div#realPost {
                padding: 25px 20px 80px 20px;
                min-height: 60vh;
            }

            .sidebar {
                width: 100%;
                max-width: none;
                height: 70vh;
                border-left: none;
                border-top: 1px solid #ddd;
                position: fixed;
                bottom: 0;
                left: 0;
                box-shadow: 0 -4px 20px rgba(0,0,0,0.08);
                border-radius: 20px 20px 0 0;
            }
            
            .sidebar.hidden-comments { display: none; }
        }
    `;
    document.head.appendChild(style);
}
