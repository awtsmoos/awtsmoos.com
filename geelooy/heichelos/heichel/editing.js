//B"H
function addSubmitButtons() {
    window.hasAdminButtons = true;
    var ps = document.createElement("button")
    ps.innerText = "Submit Post"
    if(!window.adminBtns) {
        window.adminBtns = [];
    }
    var curAlias = window.curAlias || null;
	if(!curAlias) return false;
    var heichelID =  window.heichelID;
    if(!heichelID) return false;
    var adminBtns = window.adminBtns;
    document.querySelector(".posts")?.appendChild(ps);
    adminBtns.push(ps);
    ps.onclick = () => {


        var p = new URLSearchParams({
            type: "post",
            returnURL: location.href,
            seriesId: srss

        });

        location.href = "/heichelos/" + heichelID + "/submit?" + p
    }
    var s = document.createElement("button")
    s.innerText = "Submit New Series"
    document.querySelector(".series")?.appendChild(s);
    adminBtns.push(s)

    s.onclick = () => {
        var p = new URLSearchParams({
            type: "series",
            returnURL: location.href,
            seriesId: srss

        });
        location.href = "/heichelos/" + heichelID + "/submit?" +
            p;
    };

    var ss = document.createElement("button")
    ss.innerText = "Edit Series"
    window?.seriesControls?.appendChild(ss);

    adminBtns.push(ss);
    ss.onclick = () => {
        var p = new URLSearchParams({
            type: "series",
            returnURL: location.href,
            id: srss
            

        });
        location.href = "/heichelos/" + heichelID + "/edit?" +
            p;
    };

    var heichelDetailsBtn = document.createElement("a");
    heichelDetailsBtn.innerText = "Edit Heichel Details";
                
    var k = new URL("https://awtsmoos.com/heichelos/manage-alias-heichelos")
    var pr = new URLSearchParams({
        alias: curAlias,
        returnURL: location.href,
        heichel: heichelID,
        action: "update"
    })
    k.search=pr;
    heichelDetailsBtn.href = k +"";	
    document.querySelector(".heichelDetails")?.appendChild(heichelDetailsBtn);
    adminBtns.push(heichelDetailsBtn);
    makeEditorBtn(".posts .editor-info");
    makeEditorBtn(".series .editor-info", {
        type: "series"	
    });
    function makeEditorBtn(selector, {
        type="post"	
    }={}) {
        var ei = document.querySelector(selector)
        if(!ei) return console.log("couldn't find it",ei);
        var d = document.createElement("div")
        ei.appendChild(d);
        d.classList.add("btn")
        d.innerHTML = "Edit "+type+"s";
        adminBtns.push(d);

        var isEditing = false;
        
        d.onclick = () => {
            /*toggling editor mode*/
            isEditing = toggleEditable(type=="post" ? 
               window.postsList :
               window.seriesList, 
            (child, ie) => {
                if(ie/*isEditing*/) {
                    var id = child.dataset.awtsmoosid;
                    var sid = currentSeries;
                    
                    var returnURL = location.href;
                    var obj = {
                        type,
                        id,
                        parentSeriesId: sid,
                        returnURL
                    }
                    var editParams = new URLSearchParams(obj)
                    var details = document.createElement("div")
                    details.className = ("editor-details")
                    child.appendChild(details);

                    var moveBtn = document.createElement("div");
                    moveBtn.classList.add("moveBtn");
                    moveBtn.innerText = "move"
                    details.appendChild(moveBtn)
                    var started = false;
                    var start = {x:0,y:0}
                    var startDrag = {x:0,y:0}
                    moveBtn.addEventListener("mousedown", e => {
                        e.preventDefault();
                        if(!started) {
                            started = true;
                            start.x=child .clientLeft;
                            start.y=child .clientTop;

                            startDrag.x=e.clientX;
                            startDrag.y=e.clientY;
                            child.style.position="absolute"
                        }
                    });
                    moveBtn.addEventListener("mousemove", e => {
                        e.preventDefault()
                       
                        if(started) {
                            var diff = {
                                x: e.clientX - startDrag.x,
                                
                                y: e.clientY - startDrag.y,
                            }
                            console.log("movin",startDrag,start,started,diff)
                            child.style.left = start.x - diff.x + "px";
                            
                            child.style.top = start.y - diff.y+ "px";
                        }
                    });
                    function mouseUp(){
                        started = false;
                        start = {x:0,y:0};
                        startDrag = {x:0,y:0};
                        child.style.position="";
                        window.removeEventListener("mouseup", mouseUp)
                    }
                    window.addEventListener("mouseup", mouseUp)
                    var editBtn =  document.createElement("a")
                    editBtn.classList.add("btn")
                    editBtn.style.backgroundColor = "yellow";
                    editBtn.innerText = "Edit details"
                    editBtn.href = location.origin + `/heichelos/${
                        heichelId	
                    }/edit?${
                        editParams	
                    }`
                    details.appendChild(editBtn);
                    
                    var deleteBtn = document.createElement("div")
                    deleteBtn.classList.add("btn")
                    deleteBtn.style.backgroundColor = "red";
                    deleteBtn.innerText = "delete"
                    details.appendChild(deleteBtn);
                    
                    deleteBtn.onclick = async () => {
                        try {
                            var r = await fetch(
                            `/api/social/heichelos/${
                                heichelId
                            }/deleteContentFromSeries`, {
                                method: "POST",
                                body: new URLSearchParams({
                                aliasId: window.curAlias,
                                seriesId:currentSeries,
                                contentType: type,
                                contentId: id,
                                deleteOriginal: true,
                                returnURL
                                })
                            });
                            if(r.error) {
                                await AwtsmoosPrompt.go({
                                    isAlert: true,
                                    headerTxt: "Did NOT delete, error: "+JSON.stringify(r.error)
                                });
                                console.log(r);
                                return;
                            }
                            await AwtsmoosPrompt.go({
                                isAlert: true,
                                headerTxt: "Deleted post successfully"
                            });
                            child.parentNode.removeChild(child);
                        } catch(e) {
                            alert("Error deleting")
                            console.log(e)
                        }

                        
                    };
                } else {
                    var ed = child.querySelector(".editor-details")
                    if(ed) {
                        ed.parentNode.removeChild(ed)	
                    }
                }
            })
            if(isEditing) {
                d.innerHTML = "Done"
                isEditing = false;
            } else {
                d.innerHTML = "Edit "+type+"s";
                isEditing = true;
            }
        }
    }
    

    var editorSection = document.querySelector(".editorSection")
    if(!editorSection) return console.log("Can't find editor section");
    var author = window?.heichel?.author;
    
    if(!author) return console.log("Can't find author")
    
    var addEditor = document.createElement("div")
    addEditor.classList.add("btn");
    adminBtns.push(addEditor);
    addEditor.innerText = "Add New Editor";
    editorSection.appendChild(addEditor);
    
    addEditor.onclick = async () => {
        var p = await AwtsmoosPrompt.go({
            headerTxt: "Enter an editor's alias"
        })
        if (p) {
            var r = await addNewEditor({
                aliasId: author,
                editorAliasId: p,
                heichelId: heichelID
            })
            if (r.success) {
                await AwtsmoosPrompt.go({
                    isAlert: true,
                    headerTxt: "Editor " + p + " added successfully"
                });
            } else {
                await AwtsmoosPrompt.go({
                    isAlert: true,
                    headerTxt: "Problem adding " + p + ". Check console."
                });
                console.log("ISsue adding alias editor", p, "Details:", r)
            }
            location.reload()
        }
        console.log(p)
    }

    
}

function removeAdminButtons() {
    var ab = window.adminBtns;
    if(!ab) return;
    ab.forEach(w => {
        w?.parentNode?.removeChild(w);	
    })
    ab = []
    window.adminBtns = []
    
}


function toggleEditable(parent, callbackChild) {
    var wasEditing = parent.isAwtsmoosEditing;
    var isEditing = !wasEditing; // Toggle editing state
    parent.isAwtsmoosEditing = isEditing; // Set the new state

    var children = Array.from(parent.children);
        if (!children || !children.length) {
        return console.log("No child found", parent);
    }

    children.forEach(child => {
    if (typeof callbackChild === "function") {
        callbackChild(child, isEditing);
    }


    })
    return isEditing;
}

async function setupEditorHTML() {
    var editors = window.editors;

    if(!Array.isArray(editors)) {
        return console.log("NO editors")	
    }
    var author = window?.heichel?.author;
    if(!author) return console.log("Author",author);
    //return JSON.stringify(editors)

    var editorSection = document.querySelector(".editorSection");
    if(!editorSection) return console.log("Couldn't find editor section");
    

    
    // Assuming `author` and `editors` variables are already defined
    const tooBig = editors && editors.length > 10; // Example condition for "tooBig"
    
    // Create authorHolder div
    const authorHolder = document.createElement('div');
    authorHolder.className = 'authorHolder';

    editorSection.appendChild(authorHolder);
    console.log("Added",editorSection,authorHolder);
    // Create author label
    const authorLabel = document.createElement('div');
    authorLabel.className = 'author-label';
    authorLabel.textContent = 'Author: ';
    authorHolder.appendChild(authorLabel);
    
    // Create author link
    const authorLink = document.createElement('div');
    authorLink.className = 'author-link';
    const authorAnchor = document.createElement('a');
    authorAnchor.href = `https://awtsmoos.com/@${author}`;
    authorAnchor.textContent = "@"+author;
    authorLink.appendChild(authorAnchor);
    authorHolder.appendChild(authorLink);
    
    // Create editorsHolder div
    const editorsHolder = document.createElement('div');
    editorsHolder.className = 'editorsHolder';
    editorSection.appendChild(editorsHolder);
    if (editors && editors.length) {
        // Create label for editors
        const labelEditors = document.createElement('div');
        labelEditors.className = 'label-editors';
        labelEditors.textContent = 'Editors:';
        editorsHolder.appendChild(labelEditors);
    
        // Create editor-holder div
        const editorHolder = document.createElement('div');
        editorHolder.className = 'editor-holder';
    
        // Determine which editors to display
        const editorsToShow = tooBig ? editors.slice(0, 10) : editors;
        
        editorsToShow.forEach(ed => {
            const editorName = document.createElement('div');
            editorName.className = 'editor-name';
            const editorAnchor = document.createElement('a');
            editorAnchor.href = `/@${ed}`;
            editorAnchor.textContent = `@${ed}`;
            editorName.appendChild(editorAnchor);
            editorHolder.appendChild(editorName);
        });
    
        // If too big, append ellipsis
        if (tooBig) {
            const ellipsis = document.createTextNode('...');
            editorHolder.appendChild(ellipsis);
        }
    
        editorsHolder.appendChild(editorHolder);
    } else {
        editorsHolder.textContent = 'No editors here!';
    }

    
    
}

export {
    setupEditorHTML,
    removeAdminButtons,
    addSubmitButtons
}