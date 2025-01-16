//B"H
import awtsmoosStyle from "./style.js";
import codeify from "/scripts/awtsmoos/coding/make.js"; 
export default ({
    fileName, 
    content,
    system,
    extension
  } = {}) => {
    
    var id = "awtsmoosText";
    var coded = null
    var self = {
      id,
      content: () => contentDiv.innerText,
      fileName: () => fileName,
      init: () => {
        coded?.init?.();
      },
      onresize() {
        coded?.init()
      }
    }
    console.log(fileName,self.fileName())
    
    var map = {
      ".js": "javascript",
      ".html":"html",
      ".css":"css"
    }
    var type = map[extension];
    
    
    // Create the root container for the editor
    const editorContainer = document.createElement('div');
    editorContainer.classList.add('awtsmoos-editor-container');
    self.div = editorContainer;
    
    // Create the menu bar
    const menuBar = document.createElement('div');
    menuBar.classList.add('menu-bar');
    window.customSaveFunction = () => system?.save(self);
    // Functionality map for File and Edit menus
    const fileFunctions = new Map([
      ['New', () => system?.newFile(self)],
      ['Open', () => system?.open(self)],
      ['Save', () => system?.save(self)]
    ]);
  
    const editFunctions = new Map([
      ['Undo', () => document.execCommand('undo')],
      ['Redo', () => document.execCommand('redo')],
      ['Cut', () => document.execCommand('cut')],
      ['Copy', () => document.execCommand('copy')],
      ['Paste', () => document.execCommand('paste')]
    ]);

      const editFunctions2 = new Map([
      ['Undo', () => document.execCommand('undo')],
      ['asdf', () => document.execCommand('redo')],
      ['Cut', () => document.execCommand('cut')],
      ['Copy', () => document.execCommand('copy')],
      ['Paste', () => document.execCommand('paste')]
    ]);

    var awtsmoosFuncs = new Map([
      ['Import', () => {}],
      ['Export', () => {}]
    ]);
    
    
  
    // Create the File menu
    const fileMenu = createMenu('File', fileFunctions);
  
    // Create the Edit menu
    const editMenu = createMenu('Edit', editFunctions);
    
    
    menuBar.appendChild(fileMenu);
    menuBar.appendChild(editMenu);
    
    if(extension == ".js") {
      var run = async () => {
        var code = self.content();
        try {
          eval(`//B"H
          (async () => {
            ${code}  
          })()`);
        } catch(e) {

        }
      };
      window.customRunFunction = run;
      awtsmoosFuncs.set("Run", run)
    }

    var awtsmoosMenu = createMenu("Awtsmoos", awtsmoosFuncs);
    
    menuBar.appendChild(awtsmoosMenu);
    
  
    // Create the filename header
    const fileNameHeader = document.createElement('div');
    fileNameHeader.classList.add('file-name-header');
    fileNameHeader.textContent = fileName;


  const contentDiv = document.createElement('div');
  // Create the content editable div
  contentDiv.classList.add('content-editable');
  contentDiv.setAttribute('contenteditable', 'true');
  contentDiv.innerText = content;

  const contentHolder = document.createElement('div');
  // Create the content editable div
  contentHolder.classList.add('content-holder');
  contentHolder.appendChild(contentDiv)
    
    // Append elements to the editor container
    editorContainer.appendChild(menuBar);
    editorContainer.appendChild(fileNameHeader);
    editorContainer.appendChild(contentHolder);

    
    if(type) {
      coded =codeify(contentDiv, type)
     // console.log(coded,"Coded",contentDiv);
      window.coded=coded;
      coded?.parent?.focus()
      contentDiv?.focus()
    }
    
    // Add CSS styles dynamically
    const style = document.createElement('style');
    style.textContent = getCSS();
    style.classList.add(id);
    var sty = document.querySelector("."+id);
    if(!sty) 
      document.head.appendChild(style);
  
  
    document.body.appendChild(editorContainer)
    var fileHeaderHeight = fileNameHeader.offsetHeight;
    var menuBarHeight = menuBar.offsetHeight;
    editorContainer.parentNode.removeChild(editorContainer);
    function calculateContentHeight() {
      var heightAmount = fileHeaderHeight + 
            menuBarHeight;
      var heightStr = `calc(100% - ${
            heightAmount
          }px);`
      contentHolder.style.cssText = "height:"+heightStr;
    }
    calculateContentHeight()
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
    
      let isMenuVisible = true;  // Track the visibility state
    
      menu.addEventListener('click', function (e) {
        e.stopPropagation(); // Prevent the click event from propagating to the document
        if (isMenuVisible) {
          menuOptions.style.display = 'none';  // Hide the menu
          isMenuVisible = false;
        } else {
          menuOptions.style.display = 'block'; // Show the menu again
          isMenuVisible = true;
        }
      });
    
      // Show menu when hovering
      menu.addEventListener('mouseover', function () {
        if (!isMenuVisible) {
          menuOptions.style.display = 'block'; // Show it again when hovering over
          isMenuVisible = true;
        }
      });
    
      // Hide menu when mouse leaves
      menu.addEventListener('mouseleave', function () {
        if (isMenuVisible) {
          menuOptions.style.display = 'none'; // Hide the menu if it's still visible
          isMenuVisible = false;
        }
      });
    
      menu.appendChild(menuOptions);
      return menu;
    }
  
    // Returns the refined CSS as a string
    function getCSS() {
      return awtsmoosStyle
    }
    return self;
}