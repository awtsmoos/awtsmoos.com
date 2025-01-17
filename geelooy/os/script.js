//B"H
import AwtsmoosOS from "./awtsmoosOs.js";
import menuItems from "./startMenu.js";
var os = new AwtsmoosOS();
window.os = os;
// Function to create a new window and add it to the desktop
function createWindow(title, content) {
    os.addWindow({title, content})
}

// Event listener for creating new files or folders
document.getElementById('desktop').addEventListener('contextmenu', (e) => {
    e.preventDefault();
    const newFile = prompt('Enter file name:');
    if (newFile) {
        createWindow(newFile, `<p>Content of ${newFile}</p>`);
    }
});

// Start button functionality
var selected = false;
document.getElementById('start-button').onclick = async () => {
    
    const menu = document.getElementById('start-menu');
    const menuItemsContainer = document.getElementById('menu-items');
    menuItemsContainer.innerHTML = "";
    if(selected) {
        selected = false;
        menu.style.display = 'none';
        return;
    }
    // Dynamic menu items as an object with functions
 

    // Generate dynamic menu items using map()
    Object.keys(menuItems).map(item => {
        const li = document.createElement('li');
        li.textContent = item;
        li.onclick = () => menuItems[item]?.({os});
        menuItemsContainer.appendChild(li);
    });

    // Display the menu with animation
    menu.classList.remove('hidden');
    menu.style.display = 'block';

    function clickOutside(event) {
        if (!menu.contains(event.target) && event.target !== document.getElementById('start-button')) {
            menu.style.display = 'none';
            
            window.removeEventListener("click",clickOutside)
        }
    }
    // Close the menu when clicked outside
    window.addEventListener('click', clickOutside);
    
};

// Example folder interaction
document.getElementById('desktop').addEventListener('dblclick', (e) => {
    if (e.target.classList.contains('window')) {
        alert(`Opening ${e.target.querySelector('.window-header').textContent}`);
    }
});


const desktop = document.getElementById('desktop');

// Create overlay
const overlay = document.createElement('div');
overlay.id = 'drag-overlay';
overlay.className = 'drag-overlay';
overlay.textContent = 'Drop files here!';
desktop.appendChild(overlay);

// Drag and drop events
desktop.addEventListener('dragover', (event) => {
    event.preventDefault();
    desktop.classList.add('drag-over');
    overlay.classList.add('visible');
});

desktop.addEventListener('dragleave', (event) => {
    desktop.classList.remove('drag-over');
    overlay.classList.remove('visible');
});

desktop.addEventListener('drop', async (event) => {
    event.preventDefault();
    desktop.classList.remove('drag-over');
    overlay.classList.remove('visible');

    const files = Array.from(event.dataTransfer.files);
    if (files.length === 0) return;

    for (const file of files) {
        const content = file.type.startsWith('text/') 
            ? await file.text() 
            : await file.arrayBuffer(); // Handle binary/text files

        // Save each file to the desktop
        await os.createFile("desktop", file.name, content);
    }

    alert(`${files.length} file(s) uploaded successfully!`);
});

(async () => {
    var ut = await import(
        "/scripts/awtsmoos/api/utils.js"
    )
    var k = Object.keys(ut);
    k.forEach(w=> {
        window[w] = ut[w];
    })
    await os.start();
    
})()

