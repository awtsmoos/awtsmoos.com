//B"H
//Boruch Hashem
//Blessed is He

"use strict";
const {cleanPath,splitPath}=require("./path.js");

/** Restrict hosted imports to explicit public GitHub repositories and owned VFS paths. */
function cloneSpecification(payload={}) {
	const source=String(payload.url||payload.repository||"").trim();
	let url;
	try{url=new URL(source);}catch{throw Error("GIT_CLONE_INVALID_REPOSITORY_URL");}
	if(url.protocol!=="https:"||url.hostname!=="github.com"||url.port||
		url.username||url.password||url.search||url.hash)throw Error("GIT_CLONE_PUBLIC_GITHUB_ONLY");
	const parts=url.pathname.replace(/^\/+|\/+$/g,"").split("/");
	if(parts.length!==2)throw Error("GIT_CLONE_PUBLIC_GITHUB_ONLY");
	const owner=parts[0],repo=parts[1].replace(/\.git$/i,"");
	if(!/^[a-zA-Z0-9][a-zA-Z0-9_.-]{0,99}$/.test(owner)||
		!/^[a-zA-Z0-9][a-zA-Z0-9_.-]{0,99}$/.test(repo)||
		owner==="."||owner===".."||repo==="."||repo==="..")throw Error("GIT_CLONE_INVALID_REPOSITORY_NAME");
	const ref=String(payload.ref||payload.branch||"main");
	if(ref.length>130||ref.startsWith("/")||ref.startsWith("-")||ref.endsWith("/")||
		ref.split("/").some(part=>!part||part==="."||part===".."||!(/^[a-zA-Z0-9_.-]+$/).test(part)))throw Error("GIT_CLONE_INVALID_REF");
	const destination=cleanPath(payload.destination||payload.path||"");
	const parsed=splitPath(destination);
	if(parsed.root||!parsed.innerPath)throw Error("GIT_CLONE_DESTINATION_REQUIRED");
	if(destination.split("/").some(p=>p===".git"||p===".awtsmoos-clone.json"))throw Error("GIT_CLONE_RESERVED_DESTINATION");
	const archiveUrl="https://codeload.github.com/"+owner+"/"+repo+"/tar.gz/refs/heads/"+ref.split("/").map(encodeURIComponent).join("/");
	return {source:"https://github.com/"+owner+"/"+repo,owner,repo,ref,destination,aliasId:parsed.aliasId,archiveUrl,kind:"github-public-source-snapshot"};
}
module.exports={cloneSpecification};
