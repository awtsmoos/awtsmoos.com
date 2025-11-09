//B"H
import System from "./system.js"
import ResizableWindow from "./windows.js"
import {
    programs,
    defaultPrograms,
    getDefaultProgram
} from "./basicPrograms.js"

export default class WindowHandler {
    windows = [];
    constructor() {
    
	    this.windows = [];
	    
	    this.taskArea = document.getElementById('task-area');
	    this.minimizedGroups = new Map();
	
    }
    getExtension(title) {
        var l = title.lastIndexOf(".")
        if(l > -1) {
            return title.substring(l)
        }
        return ".js";
    }
    
    // Add these three methods inside the WindowHandler class

onminimize(window) {
    const programId = window.programId;

    if (!this.minimizedGroups.has(programId)) {
        // First time this program is minimized: create a new group
        const taskItem = document.createElement('div');
        taskItem.className = 'task-item';
        taskItem.textContent = window.title.replace('.folder', '');

        const group = {
            element: taskItem,
            windows: [window]
        };

        taskItem.onclick = (e) => this.handleTaskClick(e, programId);

        this.minimizedGroups.set(programId, group);
        this.taskArea.appendChild(taskItem);
    } else {
        // Program already has a minimized group: add to stack
        const group = this.minimizedGroups.get(programId);
        if (!group.windows.includes(window)) {
            group.windows.push(window);
        }
        group.element.classList.add('stacked');
        group.element.dataset.count = group.windows.length;
    }
}

onrestore(window) {
    const programId = window.programId;
    if (!this.minimizedGroups.has(programId)) return;

    const group = this.minimizedGroups.get(programId);
    group.windows = group.windows.filter(w => w !== window);

    if (group.windows.length === 0) {
        // Last window was restored, remove the group
        group.element.remove();
        this.minimizedGroups.delete(programId);
    } else if (group.windows.length === 1) {
        // Only one window left, un-stack
        group.element.classList.remove('stacked');
        group.element.removeAttribute('data-count');
        group.element.textContent = group.windows[0].title.replace('.folder', '');
    } else {
        // Multiple windows still minimized, just update count
        group.element.dataset.count = group.windows.length;
    }
}


    
    // In windowHandler.js, replace the entire addWindow method
addWindow({title, content, path, os, programName = null}) {
    var ext = this.getExtension(title);
    
    var program;
    if (programName && programs[programName]) {
        program = programs[programName];
    } else {
        program = getDefaultProgram(ext);
    }
    
    if(program) {
        var system = new System({path, os})
        var programInstance = program({
            os:system.os,
            path,
            title,
            fileName: title, 
            content, 
            system,
            extension:ext
        })
        content = programInstance?.div;
    }
    
    var wind = new ResizableWindow({
        title, content,
        handler: this,
        // THE FIX IS HERE: Use the correct 'defaultPrograms' variable
        programId: programName || defaultPrograms[ext] || 'awtsmoosBinaryViewer'
    });
    
    wind.programInstance = programInstance;
    
    wind.onresize = e => {
        programInstance?.onresize?.(e)
    }
    
    programInstance?.init?.();
    this.windows.push(wind);
}

    onactive(w)  {
        console.log("ACTIVATING",w)
        this.windows.forEach(wn => {
            if(w == wn) return console.log("SELF")
            wn?.makeInactive?.();
        });
    }

    onclose(w) {
	    console.log("CLOSED window", w);
	    // Also remove it from any minimized groups
	    this.onrestore(w);
	    
	    var ind = this.windows.indexOf(w);
	    if (ind > -1) {
	        this.windows.splice(ind, 1);
	    }
	}
	
	// Add this method inside the WindowHandler class

	handleTaskClick(event, programId) {
	    event.stopPropagation();
	    const group = this.minimizedGroups.get(programId);
	    if (!group) return;
	
	    // Clean up any other popups
	    document.querySelector('.task-group-popup')?.remove();
	
	    if (group.windows.length === 1) {
	        // If only one, restore it
	        group.windows[0].restore();
	    } else {
	        // If stacked, show a popup menu
	        const popup = document.createElement('div');
	        popup.className = 'task-group-popup';
	
	        group.windows.forEach(win => {
	            const item = document.createElement('div');
	            item.className = 'task-group-popup-item';
	            item.textContent = win.title;
	            item.onclick = () => {
	                win.restore();
	                popup.remove();
	            };
	            popup.appendChild(item);
	        });
	
	        // Position and display the popup
	        const rect = group.element.getBoundingClientRect();
	        popup.style.left = `${rect.left}px`;
	        document.body.appendChild(popup);
	
	        // Click outside to close
	        const clickOutsideHandler = (e) => {
	            if (!popup.contains(e.target)) {
	                popup.remove();
	                document.removeEventListener('click', clickOutsideHandler);
	            }
	        };
	        setTimeout(() => document.addEventListener('click', clickOutsideHandler), 0);
	    }
	}

}
