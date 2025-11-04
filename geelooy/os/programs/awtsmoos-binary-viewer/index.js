//B"H

import awtsmoosStyle from "./style.js";
export default ({
	fileName, 
	content,
	system,
	extension,
	path
} = {}) => {
	var id = "awtsmoosBinaryViewer";
	var self = {
	    id,
	    content: () => content,
	    fileName: () => fileName,
	    init: () => {},
	    onresize() {}
	};
	
	// Create the root container for the viewer
	const viewerContainer = document.createElement('div');
	viewerContainer.classList.add('awtsmoos-viewer-container');
	self.div = viewerContainer;
	
	// Create the menu bar
	const menuBar = document.createElement('div');
	menuBar.classList.add('menu-bar');
	
	// Define Awtsmoos menu functions
	var awtsmoosFuncs = new Map([
	    ['Get Public URL', async () => {
	        if (!window.curAlias) {
	            await system.makeToast("Not logged in with alias!");
	            return;
	        }
	
	        var base = location.origin +
	            `/api/social/aliases/${
	          curAlias
	        }/fileSystem/readFile?${
	          new URLSearchParams({
	            path: path + "/" + fileName
	          })
	        }`;
	        await navigator.clipboard.writeText(base);
	
	        await system.makeToast("Copied public URL to clipboard!");
	    }],
	    ['Download', () => {
	        const blob = (content instanceof Blob) ? content : new Blob([content]);
	        var u = URL.createObjectURL(blob);
	        var a = document.createElement("a");
	        a.href = u;
	        a.download = fileName;
	        a.click();
	        URL.revokeObjectURL(u);
	    }]
	]);
	
	// Create the Awtsmoos menu
	var awtsmoosMenu = createMenu("Awtsmoos", awtsmoosFuncs);
	menuBar.appendChild(awtsmoosMenu);
	
	// Create the filename header
	const fileNameHeader = document.createElement('div');
	fileNameHeader.classList.add('file-name-header');
	fileNameHeader.textContent = fileName;
	
	// Create the content holder
	const contentHolder = document.createElement('div');
	contentHolder.classList.add('content-holder');
	
	// Check content type and create appropriate viewer
	if (content instanceof Blob) {
	    const url = URL.createObjectURL(content);
	    if (content.type.startsWith('image/')) {
	        const img = document.createElement('img');
	        img.src = url;
	        img.style.maxWidth = '100%';
	        img.style.maxHeight = '100%';
	        img.style.objectFit = 'contain';
	        contentHolder.appendChild(img);
	    } else if (content.type === 'application/pdf') {
	        const pdfEmbed = document.createElement('iframe');
	        pdfEmbed.src = url;
	        pdfEmbed.style.width = '100%';
	        pdfEmbed.style.height = '100%';
	        pdfEmbed.style.border = 'none';
	        contentHolder.appendChild(pdfEmbed);
	    } else if (content.type.startsWith('video/')) {
	        const video = document.createElement('video');
	        video.src = url;
	        video.controls = true;
	        video.style.maxWidth = '100%';
	        video.style.maxHeight = '100%';
	        contentHolder.appendChild(video);
	    } else if (content.type.startsWith('audio/')) {
	        const audio = document.createElement('audio');
	        audio.src = url;
	        audio.controls = true;
	        contentHolder.appendChild(audio);
	    } else {
	        // Fallback for other binary types
	        const pre = document.createElement('pre');
	        const reader = new FileReader();
	        reader.onload = function(e) {
	            pre.textContent = e.target.result;
	        };
	        reader.readAsText(content);
	        contentHolder.appendChild(pre);
	    }
	} else {
	    // Fallback for non-blob content
	    const pre = document.createElement('pre');
	    pre.textContent = "Raw Text Display:\n\n" + content;
	    contentHolder.appendChild(pre);
	}
	
	
	// Append elements to the viewer container
	viewerContainer.appendChild(menuBar);
	viewerContainer.appendChild(fileNameHeader);
	viewerContainer.appendChild(contentHolder);
	
	// Add CSS styles dynamically
	const style = document.createElement('style');
	style.textContent = awtsmoosStyle;
	style.classList.add(id);
	var sty = document.querySelector("." + id);
	if (!sty)
	    document.head.appendChild(style);
	
	// Calculate content height
	var fileHeaderHeight = fileNameHeader.offsetHeight;
	var menuBarHeight = menuBar.offsetHeight;
	
	function calculateContentHeight() {
	    var heightAmount = fileHeaderHeight + menuBarHeight;
	    var heightStr = `calc(100% - ${heightAmount}px)`;
	    contentHolder.style.height = heightStr;
	}
	
	// Run after elements are in the DOM to get correct heights
	setTimeout(calculateContentHeight, 0);
	
	
	// Utility function to create a menu dynamically
	function createMenu(menuName, actionsMap) {
	    const menu = document.createElement('div');
	    menu.classList.add('menu-item');
	    menu.textContent = menuName;
	
	    const menuOptions = document.createElement('div');
	    menuOptions.classList.add(`awtsmoos-options`);
	    actionsMap.forEach((func, action) => {
	        const menuOption = document.createElement('div');
	        menuOption.textContent = action;
	        menuOption.addEventListener('click', func);
	        menuOptions.appendChild(menuOption);
	    });
	
	    menu.addEventListener('click', function(e) {
	        e.stopPropagation();
	        const isVisible = menuOptions.style.display === 'block';
	        menuOptions.style.display = isVisible ? 'none' : 'block';
	    });
	
	    menu.appendChild(menuOptions);
	    return menu;
	}
	
	return self;
}