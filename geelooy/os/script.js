//B"H
import  createProfileDropdown  from 
    '/scripts/awtsmoos/social/profileDropdown.js';
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
//    e.preventDefault();
    /*const newFile = prompt('Enter file name:');
    if (newFile) {
        createWindow(newFile, `<p>Content of ${newFile}</p>`);
    }*/
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


(async () => {
    var ut = await import(
        "/scripts/awtsmoos/api/utils.js"
    )
    var k = Object.keys(ut);
    k.forEach(w=> {
        window[w] = ut[w];
    })

    // B"H - INJECTING THE CROWN (HEADER)
    // We move the existing loginHolder into a new specialized header container
    // and add the fullscreen toggle to it.
    const mainContainer = document.querySelector('.main');
    const existingLogin = document.getElementById('loginHolder');
    
    // Create the Header Element
    const topHeader = document.createElement('div');
    topHeader.className = 'awtsmoos-top-header';
    
    // Create container for login stuff
    const loginWrapper = document.createElement('div');
    loginWrapper.className = 'login-area-container';
    
    if (existingLogin) {
        // Move the login holder inside our wrapper
        loginWrapper.appendChild(existingLogin);
        // Initialize the profile dropdown logic
       // 
    }
    
    // Create the Fullscreen Toggle Button (The Eye)
    const fsBtn = document.createElement('button');
    fsBtn.className = 'fullscreen-toggle-btn';
    fsBtn.title = "Toggle Infinite Mode (Fullscreen)";
    fsBtn.innerHTML = `
        <svg viewBox="0 0 24 24">
            <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
        </svg>
    `;
    
    fsBtn.onclick = () => {
        os.toggleFullScreen();
        // Visual feedback
        fsBtn.style.transform = "scale(0.9)";
        setTimeout(() => fsBtn.style.transform = "", 150);
    };

    // Assemble the Crown
    topHeader.appendChild(loginWrapper);
    topHeader.appendChild(fsBtn);
    
    // Insert at the very top of .main
    mainContainer.insertBefore(topHeader, mainContainer.firstChild);
	console.log(existingLogin.id,22)
	
	addEventListener("awtsmoosAliasChange", async (e) => {
		await os.start();
	})
	createProfileDropdown(existingLogin);
    
    
})()

