//B"H
console.log("B\"H");


import {
	AwtsmoosPrompt,
	addNewEditor
} from "/scripts/awtsmoos/api/utils.js";
import {
	createElement,
	appendElements
} from "/scripts/awtsmoos/ui/basic.js";
import {
	addSubmitButtons,
	removeAdminButtons,
	setupEditorHTML
} from "./editing.js";
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
			window.editors = editors;
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
	
		var desc = root.prateem.description || "";
		if(desc == "undefined") {
			desc = "";
		}
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

		const seriesRq = await fetch(`/api/social/heichelos/${heichelID}/series/${ss}/details`, {
			method: "POST",
			body: new URLSearchParams({ seriesIds: JSON.stringify(subSeries) })
		});
		const sjs = await seriesRq.json();
		if (pjs.length) {
			const postElements = createPostOrSeriesElements(pjs, "post", ss, root);
			appendElements(postsList, postElements);
			if (v !== "series") postsTab.click();
			if (!sjs.length) {
				postsTab.click();
			}
		} else {
			appendElements(postsList, [createElement({ tag: "div", html: "No posts here yet!" })]);
		}
	
		document.querySelector(".loadingPosts").classList.add("hidden");
	
		
	
		
	
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
	
	
	
	function createPostOrSeriesElements(items, type, parentId, root) {
		return items.map((item, index) => {
			if(!item) {
				item = {
					id: "wow",
					name: "LOL",
					description: "",

					prateem: {
						name: "ok",
						description: ""
					}
				}
			}
			if (item.error) return null;
	
			const dt = type === "post" ? item : item.prateem;
			var description = dt.description || "";
			if(description == "undefined") {
				description = "";
			}
			const url = type === "post"
				? `/heichelos/${heichelID}/series/${root.id}/${index}`
				: `${location.pathname}?view=${v}&series=${item.id}`;
	
			const container = createElement({
				tag: "a",
				attributes: { 
					class: `post-card ${type}`, 
					"data-awtsmoosID": item.id,
					href: url
				},
				children: [
					{
						tag: "h2",
						html: dt[type === "post" ? "title" : "name"],
						
					},
					type === "post" ? {
						tag: "div",
						attributes: { class: "post-preview" },
						html: `${item.content?.substring(0, POST_LENGTH) || ""}...`
					} : {
						tag: "div",
						html: description || ""
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
