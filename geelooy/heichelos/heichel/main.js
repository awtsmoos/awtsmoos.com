//B"H
console.log("B\"H");


import {
	AwtsmoosPrompt,
	addNewEditor
} from "/scripts/awtsmoos/api/utils.js";
var heichelID = location.pathname.split("/").filter(Boolean)[1];
var isEditing = false;
window.heichelID = heichelID;
window.heichelId = heichelID;
window.AwtsmoosPrompt = AwtsmoosPrompt
console.log(AwtsmoosPrompt)



var POST_LENGTH = 256;
try {

	var postsTab = document.getElementById('postsTab');
	var seriesTab = document.getElementById('seriesTab');
	var postsList = document.getElementById('postsList');
	var seriesList = document.getElementById('seriesList');
	var v = sp()
		.get("view");
	var pnt = sp()
		.get("path");
	var srss = sp()
		.get("series") || "root";
	if (srss == "null") {
		srss = "root"
	}
	var postLength = 0;
	var seriesLength = 0;
	var p = new DOMParser();
	try {
		load(srss);
	} catch (e) {
		alert("no" + e)

	}

	var firstPost = false;
	var firstSeries = false;
	var editors = null;
	var setupEditors = false;
	async function load(ss) {
		window.heichel = await getH(heichelID);
		if (!editors) {
			editors = await getEditors();
		}
		if (!setupEditors) {
			await setupEditorHTML();
		}
		window.currentSeries = ss;
	
		window.ownsIt = await doesOwn();
		if (ownsIt) {
			addSubmitButtons();
		}
	
		parentS.classList.remove("hidden");
		const reqPars = await fetch(`/api/social/heichelos/${heichelID}/series/${ss}/breadcrumb`);
		const breadcrumb = await reqPars.json();
		window.breadcrumb = breadcrumb;
		parentS.innerHTML = "";
	
		breadcrumb.reverse().forEach(w => {
			const link = createElement({
				tag: "a",
				html: w?.prateem?.name,
				attributes: { href: newPath(v, w.id), onclick: () => goto(newPath(v, w.id)) }
			});
			parentS.appendChild(link);
	
			const separator = createElement({ tag: "span", html: "/" });
			parentS.appendChild(separator);
		});
	
		window.goto = goto;
	
		const rootP = `/api/social/heichelos/${heichelID}/series/${ss}/details`;
		const r = await fetch(rootP);
		const root = await r.json();
	
		if (!root || !Array.isArray(root.posts)) {
			if (ss === "root") return;
			return alert(`Path not found: ${ss} ${JSON.stringify(root)} ${rootP}`);
		}
	
		const desc = root.prateem.description || "";
		seriesNm.textContent = root.prateem.name;
		seriesDesc.textContent = desc;
	
		if (ss !== "root") {
			seriesNameAndInfo.classList.remove("hidden");
		}
	
		const posts = root.posts;
		const subSeries = root.subSeries;
	
		if (!Array.isArray(subSeries)) {
			return alert("No sub-series available");
		}
	
		const bd = new URLSearchParams({
			seriesId: root.id,
			propertyMap: JSON.stringify({
				content: 256,
				title: true,
				postId: true,
				author: true,
				id: true,
				seriesId: true,
				indexInSeries: true
			})
		});
	
		const rq = await fetch(`/api/social/heichelos/${heichelID}/posts/details?${bd}`);
		const pjs = await rq.json();
	
		if (pjs.length) {
			const postElements = createPostOrSeriesElements(pjs, "post", ss, root);
			appendElements(postsList, postElements);
			if (v !== "series") postsTab.click();
		} else {
			appendElements(postsList, [createElement({ tag: "div", html: "No posts here yet!" })]);
		}
	
		document.querySelector(".loadingPosts").classList.add("hidden");
	
		const seriesRq = await fetch(`/api/social/heichelos/${heichelID}/series/${ss}/details`, {
			method: "POST",
			body: new URLSearchParams({ seriesIds: JSON.stringify(subSeries) })
		});
	
		const sjs = await seriesRq.json();
	
		if (sjs.length) {
			const seriesElements = createPostOrSeriesElements(sjs, "series", ss, root);
			appendElements(seriesList, seriesElements);
			if (!pjs.length) {
				seriesTab.click();
			}
		} else {
			appendElements(seriesList, [createElement({ tag: "div", html: "No series here yet!" })]);
		}
	
		document.querySelector(".loadingSeries").classList.add("hidden");
	}
	
	function createElement({ tag, html, attributes, children }) {
		const element = document.createElement(tag);
		if (html) element.innerHTML = html;
		if (attributes) {
			Object.entries(attributes).forEach(([key, value]) => {
				if (key === "onclick" && typeof value === "function") {
					element.onclick = value;
				} else {
					element.setAttribute(key, value);
				}
			});
		}
		if (Array.isArray(children)) {
			children.forEach(child => {
				if (typeof child === "object" && child !== null) {
					element.appendChild(createElement(child));
				} else if (typeof child === "string") {
					element.appendChild(document.createTextNode(child));
				}
			});
		}
		return element;
	}
	
	function appendElements(parent, elements) {
		elements.forEach(element => parent.appendChild(element));
	}
	
	function createPostOrSeriesElements(items, type, parentId, root) {
		return items.map((item, index) => {
			if (item.error) return null;
	
			const dt = type === "post" ? item : item.prateem;
			const description = dt.description || "";
			const url = type === "post"
				? `/heichelos/${heichelID}/series/${root.id}/${index}`
				: `${location.pathname}?view=${v}&series=${item.id}`;
	
			const container = createElement({
				tag: "div",
				attributes: { class: `post-card ${type}`, "data-awtsmoosID": item.id },
				children: [
					{
						tag: "h2",
						children: [
							{
								tag: "a",
								html: dt[type === "post" ? "title" : "name"],
								attributes: { href: url, onclick: type !== "post" ? () => goto(url) : null }
							}
						]
					},
					type === "post" ? {
						tag: "div",
						attributes: { class: "post-preview" },
						html: `${item.content?.substring(0, POST_LENGTH)}...`
					} : {
						tag: "div",
						html: description
					},
					isEditing ? {
						tag: "div",
						attributes: { class: "edit-section" },
						children: [
							{
								tag: "a",
								html: "Edit Content",
								attributes: { href: `/heichelos/${heichelID}/edit?${new URLSearchParams({ type, id: item.id, parentSeriesId: parentId, indexInSeries: index })}` }
							},
							{
								tag: "a",
								html: "Delete",
								attributes: { href: `/heichelos/${heichelID}/delete?${new URLSearchParams({ type, id: item.id, parentSeriesId: parentId, indexInSeries: index })}` }
							}
						]
					} : null
				].filter(Boolean)
			});
	
			return container;
		}).filter(Boolean);
	}
	

	function sp() {
		return new URLSearchParams(location.search);
	}

	function updateSearch(newSearchString) {
		// Get the current pathname
		var pathname = window.location.pathname;

		// Construct the new URL with the updated search string
		var newUrl = pathname + '?' + newSearchString;

		// Change the URL without refreshing
		window.history.replaceState({
			path: newUrl
		}, '', newUrl);
	}

	function setP(nm, vl) {
		var c = sp()
		c.set(nm, vl);
		updateSearch(c + "")

	}

	function goto(url) {
		location.href = url;
		location.reload(true)

	}

	function newPath(view, series) {
		return location.pathname +

			"?" + (isEditing ?
				(new URLSearchParams({
					editingAlias: isEditing

				})) + "&" : "") +

			new URLSearchParams({
				view,
				series



			});
	}
	var c$ = q => document.querySelector(q)
	async function doesOwn() {
		var curAlias = window.curAlias || null;
		if(!curAlias) return false;
		return !!(await (await fetch(`/api/social/alias/${
			curAlias	
		}/heichelos/${
			heichelID
		}/ownership`)).json()).yes;
	}
	addEventListener("awtsmoosAliasChange", async e => {
		window.curAlias = e?.detail?.id;
		var owns = await doesOwn();
		removeAdminButtons();
		if(owns)
			addSubmitButtons();
	});

	function removeAdminButtons() {
		var ab = window.adminBtns;
		if(!ab) return;
		ab.forEach(w => {
			w?.parentNode?.removeChild(w);	
		})
		ab = []
		window.adminBtns = []
		
	}
	function addSubmitButtons() {
		window.hasAdminButtons = true;
		var ps = document.createElement("button")
		ps.innerText = "Submit Post"
		if(!window.adminBtns) {
			window.adminBtns = [];
		}
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
	postsTab.onclick = function () {

		postsTab.classList.add("Active")
		seriesTab.classList.remove("Active")
		var v = sp()
			.get("view");

		// if(v == "posts") return;
		setP("view", "posts");

		c$(".posts")
			.classList.remove("hidden");
		postsList.classList.remove("hidden");



		c$(".series")
			.classList.add("hidden");
		seriesList.classList.add("hidden");
		//  loadCurrent();
	};


	seriesTab.onclick = function () {

		seriesTab.classList.add("Active")
		postsTab.classList.remove("Active")
		var v = sp()
			.get("view");
		//if(v == "series") return;
		setP("view", "series")


		c$(".posts")
			.classList.add("hidden");
		postsList.classList.add("hidden");



		c$(".series")
			.classList.remove("hidden");
		seriesList.classList.remove("hidden");
		// loadCurrent();
	};

	if (v == "series") {
		seriesTab.click()
	} else {
		postsTab.click();

	}

	async function getEditors() {
		return await (await fetch(`/api/social/heichelos/${
			heichelID	
		}/editors`)).json()
	}

	async function setupEditorHTML() {
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


	async function hasHeichelEditAuthority(heichel, alias) {
		return (await (await fetch(`/api/social/alias/${
			alias	
		}/heichelos/${
			heichel	
		}/ownership`)).json()).yes	
	}

	function showSeriesDetails(seriesID) {
		var detailsDiv = document.getElementById(`seriesDetails-${seriesID}`);
		// Toggle display of the series details
		detailsDiv.style.display = detailsDiv.style.display === 'none' ? 'block' : 'none';
		if (detailsDiv.innerHTML === '') {
			// Load series details and posts if not already loaded
			// Use fetchAwtsmoos or similar to load the data
		}
	}


	async function start() {
		if (heichelID == "undefined") {
			var g = await AwtsmoosPrompt.go({
				isAlert: true,
				headerTxt: "That heichel doesn't exist!"
			})
			location.href = "/"
		}
		if (window.submitPgSeries)
			submitPgSeries.onclick = () => {
				var p = new URLSearchParams({
					type: "series",
					returnURL: location.href,
					seriesId: srss

				});
				location.href = "/heichelos/" + heichelID + "/submit?" +
					p;
			};


		if (window.submitPgPost)
			submitPgPost.onclick = () => {


				var p = new URLSearchParams({
					type: "post",
					returnURL: location.href,
					seriesId: srss

				});

				location.href = "/heichelos/" + heichelID + "/submit?" + p
			}
	}

	start();


} catch (e) {
	alert(e + " vh");

}
