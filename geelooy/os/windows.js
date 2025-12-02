//B"H
// Define the ResizableWindow class to manage window creation, resizing, and dragging

export default class ResizableWindow {
    GAP=10;
    PADD=6;
    constructor({
        title, 
        content,
        handler,
        hideTitleBar = false,
        isFullscreen = false,
        programId = null
    }={}) {
        this.title = title;
        this.content = content;
        this.minWidth = 100;
        this.minHeight = 100;
        this.handler = handler;
        
        this.hideTitleBar = hideTitleBar;
        this.startFullscreen = isFullscreen;

        if(!window.awtsmoosWindowID) {
            window.awtsmoosWindowID = "BH-"+Date.now();
        }
        
        this.programId = programId || (title.endsWith('.folder') ? 'awtsmoosFileExplorer' : title);
	        
        this.lastDimensions = {}; // To store state before minimizing
        this.mainDiv = window.desktop;
        this.ID = window.awtsmoosWindowID;
        
        this.createWindow();
        
        if(this.startFullscreen) {
            this.toggleFullscreen();
        }

        // Only add UI handles if it's a standard window
        if (!this.hideTitleBar) {
            this.addResizeHandles();
            this.makeDraggable();
        }
        
        this.makeActive();
    }

    // 
close() {
    //  Call the program's onclose method if it exists
    this.programInstance?.onclose?.();

    this.win.parentNode.removeChild(this.win);
    this?.handler?.onclose?.(this);
    delete this;
}
    
    // Add these two new methods inside the ResizableWindow class
minimize() {
    // Save current state
    this.lastDimensions = {
        left: this.win.style.left,
        top: this.win.style.top,
        width: this.win.style.width,
        height: this.win.style.height,
        isFullscreened: this.isFullscreened
    };

    // Hide the window
    this.win.style.display = 'none';

    // Tell the handler to add this to the start bar
    this.handler?.onminimize?.(this);
}

restore() {
    // Restore the last known state
    this.win.style.display = 'block';
    if (this.lastDimensions.isFullscreened) {
        this.toggleFullscreen();
    } else {
        this.win.style.left = this.lastDimensions.left;
        this.win.style.top = this.lastDimensions.top;
        this.win.style.width = this.lastDimensions.width;
        this.win.style.height = this.lastDimensions.height;
    }

    // Make this window active
    this.makeActive();

    // Tell the handler this window has been restored
    this.handler?.onrestore?.(this);
}

    makeActive() {
        this.active = true;
        this?.handler?.onactive?.(this);
        this.win.classList.add("active");
        this.win.classList.remove("inactive");
    }

    makeInactive() {
        this.active = false;
        this.win.classList.remove("active");
        this.win.classList.add("inactive");
    }
    
    toggleFullscreen() {
        
        if(!this.isFullscreened) {
            // Save old dimensions if we have them
            if (this.win.style.width) {
                this.oldDim = Object.assign({}, getComputedStyle(this.win));
            } else {
                this.oldDim = { width: '500px', height: '500px', left: '100px', top: '100px' };
            }
            
            // Fullscreen the window
            this.win.style.left = 0;
            this.win.style.top = 0;
            this.win.style.width="100%";
            // If title bar hidden, take full height. Else leave room for taskbar if desired
            this.win.style.height = "100%"; 
            
            this.isFullscreened = true;
            if(this.fullScreenBtn) this.fullScreenBtn.innerHTML = "o";
        } else {
            var {width, height, left, top} = this.oldDim;
            this.win.style.left = left;
            this.win.style.top = top;
            this.win.style.width=width;
            this.win.style.height=height;
            
            this.isFullscreened = false;
            if(this.fullScreenBtn) this.fullScreenBtn.innerHTML = this.oldFlsBtnH;
        }
    }

    // Create the window element with title and content
    createWindow() {
        // Create main window container
        this.win = document.createElement('div');
        this.win.className = `${this.ID}-window`;
        this.win.style.left = '100px'; // Initial position
        this.win.style.top = '100px';  // Initial position

        var self = this;
        this.win.addEventListener("mousedown", () => {
            if(!self.active) {
                self.makeActive()
            }
        });
        // Create window header (title bar)
        const header = document.createElement('div');
        header.className = 'window-header';
        this.winHeader = header;
        
        var titleSect = document.createElement("div");
        titleSect.className = "header-title"
        header.appendChild(titleSect)

        var textOfTitle = document.createElement("div");
        textOfTitle.className = "header-text"
        textOfTitle.textContent = this.title;
        titleSect.appendChild(textOfTitle);
        this.headerTxt = textOfTitle;
        
        var ctrls = document.createElement("div");
        ctrls.className = "header-ctrls"
        this.winCtrls = ctrls;
        var self = this;
        header.appendChild(ctrls)
        var btns = {
            
            "_": (w,b) => {
                b.classList.add("awtsBtn", "minimize");
                b.onclick = () => self.minimize();
            },
            "O": (win, btn) => {
                btn.onclick = () => self.toggleFullscreen();
                self.fullScreenBtn = btn;
                btn.classList.add("awtsBtn", "maximize");
            },
            "X": (win, btn) => {
                btn.classList.add("x", "awtsBtn", "close");
                btn.onclick = () => self.close();
            },
        }
        Object.keys(btns).forEach(k => {
            var btn = document.createElement("div")
            btn.className="header-btn";
            ctrls.appendChild(btn);
            btn.awtsBtn = true;
            var ac = btns[k];
            if(typeof(ac) == "function") {
                ac(this.win, btn);    
            }
            btn.innerText = k;
        });
        this.win.appendChild(header);

        // HIDE HEADER IF REQUESTED
        if (this.hideTitleBar) {
            header.style.display = 'none';
        }

        this.minWidth = this.winHeader.scrollWidth;
        this.minHeight = this.winHeader.scrollHeight;
        this.maxHeight = "500px";
        
        // Create window body (content area)
        const body = document.createElement('div');
        body.className = 'window-content';
        this.winBody = body
        if(typeof(this.content) == "string") 
            body.innerHTML = this.content;
        else if (this.content instanceof HTMLElement) {
            body.appendChild(this.content);
        } else if(this.content instanceof Blob) {
	        var ty = this.content.type;
	        if(ty.includes("image")) {
		        var url = URL.createObjectURL(this.content);
		        var im = document.createElement("img")
		        im.src = url;
		        body.appendChild(im);
	        }
        }
        
        // Adjust body height if header is hidden
        if (this.hideTitleBar) {
            body.style.height = "100%";
        }

        this.win.appendChild(body);
        this.win.style.height = "500px";
        this.winBody.style.minWidth = `${this.minWidth}px`; // Set minimum width
        this.winBody.style.minHeight = `${this.minHeight}px`; // Set minimum height
        this.winBody.classList.add("windows-body")
        // Append the window to the desktop
        document.getElementById('desktop').appendChild(this.win);
        if(!window.awtsmoosWindowStyleAdded) {
            window.awtsmoosWindowStyleAdded = true;
            this.addStyles()
        }
    }

    // Add resize handles to the window
    addResizeHandles() {
        const handles = [
            { class: 'resize-n', cursor: 'ns-resize' },
            { class: 'resize-s', cursor: 'ns-resize' },
            { class: 'resize-e', cursor: 'ew-resize' },
            { class: 'resize-w', cursor: 'ew-resize' },
            { class: 'resize-ne', cursor: 'ne-resize' },
            { class: 'resize-se', cursor: 'se-resize' },
            { class: 'resize-sw', cursor: 'sw-resize' },
            { class: 'resize-nw', cursor: 'nw-resize' },
        ];

        handles.forEach(handle => {
            const div = document.createElement('div');
            div.className = `window-resizer ${handle.class}`;
            div.style.cursor = handle.cursor;
            this.win.appendChild(div);
            this.addResizeEvent(div, handle.class);
        });
        }

        // Attach resize event to a handle element, with mobile touch support
    addResizeEvent(handleElement, resizeDirection) {
        let startX, startY, startWidth, startHeight, startLeft, startTop;
        resizeDirection = resizeDirection.replace("resize-", "");
        var self = this;

        const onResizeStart = (e) => {
            if (e.target.classList.contains("awtsBtn")) return;
            e.preventDefault();

            const event = e.touches ? e.touches[0] : e;

            this.minWidth = this.winCtrls.scrollWidth + this.headerTxt.scrollWidth + this.GAP + this.PADD * 2;
            this.minHeight = this.winHeader.scrollHeight;
            startX = event.clientX;
            startY = event.clientY;

            startWidth = this.win.offsetWidth;
            startHeight = this.win.offsetHeight;
            startLeft = this.win.offsetLeft;
            startTop = this.win.offsetTop;

            const resize = (e) => {
                const event = e.touches ? e.touches[0] : e;
                const currentX = event.clientX;
                const currentY = event.clientY;
                const deltaX = currentX - startX;
                const deltaY = currentY - startY;

                // Horizontal Resizing (East/West)
                if (resizeDirection.includes('e')) {
                    const newWidth = startWidth + deltaX;
                 
                 
                 
                    this.win.style.width = `${newWidth}px`;
                }
                if (resizeDirection.includes('w')) {
                    const newWidth = startWidth - deltaX;
                 
                    this.win.style.width = `${newWidth}px`;
                    this.win.style.left = `${startLeft + deltaX}px`;
  
                }

                // Vertical Resizing (North/South)
                if (resizeDirection.includes('s')) {
                    const newHeight = startHeight + deltaY;
                    if (newHeight > this.minHeight) this.win.style.height = `${newHeight}px`;
                }
                if (resizeDirection.includes('n')) {
                    const newHeight = startHeight - deltaY;
                    if (newHeight > this.minHeight) {
                        this.win.style.height = `${newHeight}px`;
                        this.win.style.top = `${startTop + deltaY}px`;
                    }
                }

                self?.onresize?.(e);
            };

            const endResize = () => {
                document.removeEventListener('mousemove', resize);
                document.removeEventListener('touchmove', resize);
                document.removeEventListener('mouseup', endResize);
                document.removeEventListener('touchend', endResize);
            };

            document.addEventListener('mousemove', resize);
            document.addEventListener('touchmove', resize, { passive: false });
            document.addEventListener('mouseup', endResize);
            document.addEventListener('touchend', endResize);
        };

        handleElement.addEventListener('mousedown', onResizeStart);
        handleElement.addEventListener('touchstart', onResizeStart, { passive: false });
    }


        // Make the window draggable by attaching events to the title bar, with mobile touch support
    makeDraggable() {
        const header = this.win.querySelector('.window-header');
        if (!header) return; // Safety check
        
        let offsetX, offsetY, rect;

        const onDragStart = (e) => {
            if(e?.target?.classList?.contains("awtsBtn")) {
                return;
            }
            e.preventDefault();

            // Determine if it's a touch event
            const event = e.touches ? e.touches[0] : e;

            if (event.target.awtsBtn) {
                return;
            }

            const offsetTop = document.querySelector("header")?.clientHeight || 0;
            rect = this.win.getBoundingClientRect();
            offsetX = event.clientX - rect.left;
            offsetY = event.clientY - rect.top;

            const xPercent = offsetX / rect.width;

            const onDragMove = (e) => {
                const event = e.touches ? e.touches[0] : e;

                if (this.isFullscreened) {
                    const { width, height } = this.oldDim;
                    this.win.style.width = width;
                    this.win.style.height = height;

                    this.isFullscreened = false;

                    rect = this.win.getBoundingClientRect();
                    offsetX = rect.left + xPercent * rect.width;
                    this.fullScreenBtn.innerHTML = this.oldFlsBtnH;
                }

                let lefted = event.clientX - offsetX;
                let topped = event.clientY - offsetTop - offsetY;

                if (topped < 0) {
                    topped = 0;
                }
                if (topped > this.mainDiv.clientHeight - 50) {
                    topped = this.mainDiv.clientHeight - 50;
                }
                if (lefted > this.mainDiv.clientWidth - 10) {
                    lefted = this.mainDiv.clientWidth - 10;
                }
                if (lefted < -rect.width + 50) {
                    lefted = -rect.width + 50;
                }

                this.win.style.left = `${lefted}px`;
                this.win.style.top = `${topped}px`;
            };

            const onDragEnd = () => {
                document.removeEventListener('mousemove', onDragMove);
                document.removeEventListener('touchmove', onDragMove);
                document.removeEventListener('mouseup', onDragEnd);
                document.removeEventListener('touchend', onDragEnd);
            };

            document.addEventListener('mousemove', onDragMove);
            document.addEventListener('touchmove', onDragMove, { passive: false });
            document.addEventListener('mouseup', onDragEnd);
            document.addEventListener('touchend', onDragEnd);
        };

        header.addEventListener('mousedown', onDragStart);
        header.addEventListener('touchstart', onDragStart, { passive: false });
    }

    addStyles() {
        var sty = document.createElement("style")
        sty.innerHTML = `/*css*/
        /* B"H - Windows XP Style Theme with Mobile-Friendly Resizing */

        .${this.ID}-window {
            position: absolute;
            background: #ece9d8;
            border: 1px solid #082b6b;
            border-radius: 6px 6px 0 0;
            box-shadow: 2px 2px 6px rgba(0, 0, 0, 0.4);
            z-index: 1;
            box-sizing: border-box;
            max-height: 100vh;
            max-width: 100vw;
            font-family: 'Tahoma', sans-serif;
        }
        
        .${this.ID}-window.active { z-index: 4; border-color: #082b6b; }
        
        .${this.ID}-window .window-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 3px 5px;
            border-radius: 5px 5px 0 0;
            cursor: move;
            user-select: none;
            height: 30px;
        }

        .${this.ID}-window.active .window-header { background: linear-gradient(to bottom, #0058ee, #0035d0); }
        .${this.ID}-window.inactive .window-header { background: linear-gradient(to bottom, #bfbfbf, #8e8e8e); }

        .${this.ID}-window .header-title { flex-grow: 1; padding-left: 4px; }
        .${this.ID}-window .header-text { color: white; font-size: 13px; font-weight: bold; text-shadow: 1px 1px 1px rgba(0,0,0,0.3); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .${this.ID}-window .header-ctrls { display: flex; gap: 4px; flex-shrink: 0; }
        
        .${this.ID}-window .header-btn {
            width: 21px; height: 21px; border: 1px solid #0035d0; border-radius: 3px;
            color: white; font-family: 'Marlett', sans-serif; font-size: 14px; font-weight: bold;
            display: flex; align-items: center; justify-content: center;
            cursor: pointer !important; box-shadow: inset 1px 1px 0 rgba(255,255,255,0.4);
        }
        
        .${this.ID}-window .header-btn.minimize, .${this.ID}-window .header-btn.maximize { background: #0058ee; }
        .${this.ID}-window .header-btn.close { background: #d84a38; border-color: #d14130; }
        .${this.ID}-window .header-btn:hover { filter: brightness(1.2); }
        .${this.ID}-window .header-btn:active { filter: brightness(0.9); box-shadow: inset 1px 1px 1px rgba(0,0,0,0.3); }

        .${this.ID}-window .window-content { height: calc(100% - 31px); overflow-y: auto; background: #f0f0f0; padding: 2px; }
            
        /* Enhanced Resize Handles for Mobile */
        .${this.ID}-window .window-resizer {
            position: absolute;
            background: transparent; /* Keep them invisible */
            z-index: 10;
        }
        
        /* Larger touch targets for sides */
        .${this.ID}-window .resize-n { top: -10px; left: 0; width: 100%; height: 20px; cursor: ns-resize; }
        .${this.ID}-window .resize-s { bottom: -10px; left: 0; width: 100%; height: 20px; cursor: ns-resize; }
        .${this.ID}-window .resize-e { right: -10px; top: 0; width: 20px; height: 100%; cursor: ew-resize; }
        .${this.ID}-window .resize-w { left: -10px; top: 0; width: 20px; height: 100%; cursor: ew-resize; }

        /* Larger touch targets for corners */
        .${this.ID}-window .resize-ne { top: -10px; right: -10px; width: 20px; height: 20px; cursor: ne-resize; }
        .${this.ID}-window .resize-se { bottom: -10px; right: -10px; width: 20px; height: 20px; cursor: se-resize; }
        .${this.ID}-window .resize-sw { bottom: -10px; left: -10px; width: 20px; height: 20px; cursor: sw-resize; }
        .${this.ID}-window .resize-nw { top: -10px; left: -10px; width: 20px; height: 20px; cursor: nw-resize; }
        `
        document.head.appendChild(sty);
    }
}