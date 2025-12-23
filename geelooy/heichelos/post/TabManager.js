//B"H
/*
Awtsmoos Powered tab manager
*/ 
import { appendHTML } from "/heichelos/post/functions/utils.js"
import { makeDraggable } from "./tabs/draggable.js";

var allTabs = [];
function hideAllTabs() {
   allTabs.forEach(w=>w.hide())
}

function makeTabContent({
	parent, headerTxt, btnTxt = "Back", content, onclose=(()=>{})
}) {
	var par = parent;
	var tab = document.createElement("div");

	tab.className = "tab-container";
	par.appendChild(tab);

	var info = document.createElement("div")
	info.className = "post-info";
	tab.appendChild(info)

	var commentHeader = document.createElement("div")
	commentHeader.classList.add("comment-header")
	info.appendChild(commentHeader);

	var bck = document.createElement("div");
	bck.className = "back-btn";
	bck.textContent = btnTxt;
	commentHeader.appendChild(bck);

	if(onclose) {
		bck.addEventListener("click", () => {
			onclose?.();
		})
	}
	var hdr = document.createElement("div");
	hdr.className = "info-header";
	hdr.textContent = headerTxt;
	commentHeader.appendChild(hdr);
	
	tab.awtsHeader = hdr;

	var actualTab = document.createElement("div");
	actualTab.className = "tab-content";
	tab.actual = actualTab;
	if (content) appendHTML(content, actualTab);

	info.appendChild(actualTab);
	makeDraggable({
		header:commentHeader,
		onclose,
		tabContent: actualTab
	})
	return { info, actualTab, tab, hdr, backBtn: bck }
}

class TabManager {
	constructor({
		parent, headerTxt = "Awtsmoos Info", onclose = ()=>{}
	}={}) {
		if (!parent) return;
		this.tabHolder = document.createElement("div")
		this.tabHolder.classList.add("all-tabs");
		this.parentEl = parent;

		var btnsRoot = document.createElement("div");
		btnsRoot.classList.add("tab-buttons");
		var { actualTab, tab } = makeTabContent({
			parent: btnsRoot, btnTxt:"Close", headerTxt, onclose
		})
		this.rootTabBtns = actualTab
		tab.classList.add("active")
		this.rootTab = tab;

		parent.appendChild(btnsRoot);
		parent.appendChild(this.tabHolder);
	}
	
	getTabs() { return allTabs; }

	addTab({
		header, content, append, addClasses = false, parent = null,
		btnParent = null, tabParent = null, onswitch, onopen, onclose, oninit
	}) {
		if (!parent) parent = this.tabHolder;
		if (!btnParent) btnParent = this.rootTabBtns;
		if(!tabParent) tabParent = this.rootTab;
		if (!parent || !btnParent) return console.log("Need to supply 'parent' and 'btnParent' params");

		var par = parent;
		var btnPar = btnParent;

		var btn = document.createElement("div");
		btn.className = "tab-button"
		btnPar.appendChild(btn);
		btn.textContent = header;

		var tabParent = (tabParent || btnPar);
		btn.onclick = async () => {
			hideAllTabs()
			tabParent.classList.add("backScreen")
			if (!addClasses) btnPar.classList.remove("active")
			par.classList.add("active");

			if (!addClasses) Array.from(par.children).forEach(n => { n.classList.remove("active") });
			tab.classList.add("active");
			if (typeof(onopen) == "function") await onopen({ tab, actualTab })
		}

		var { actualTab, tab, backBtn } = makeTabContent({ parent, content, headerTxt: header });
		tab.awtsTabBtn = btn;
		var bck = backBtn;

		bck.onclick = async () => {
         	hideAllTabs()
			tabParent.classList.remove("backScreen");
			tabParent.classList.add("active");
			onswitch?.({ tab: tabParent })
			tab.classList.remove("active")
			if (typeof(onclose) == "function") await onclose({ tab, actualTab })
			actualTab.innerHTML = "";
		}
        
		if (typeof(append) == "function") append(actualTab);
		oninit?.(tab);
		tab.awtsRefresh = () => {
			actualTab.innerHTML = "";
			onopen?.({ tab, actualTab });
		};
		tab.onUpdateHeader = (header) => {
			tab.awtsHeader.innerText = header;
			tab.awtsTabBtn.innerText = header;
		}
		tab.onopen = onopen;
		tab.onswitch = onswitch;
		tab.onclose = onclose;

		tab.open = async () => { btn.click(); };
        tab.hide = () => {
            tab.classList.remove("active");
            par.classList.remove("active");
        }
        allTabs.push(tab);
		return tab;
	}
}

export default TabManager;
