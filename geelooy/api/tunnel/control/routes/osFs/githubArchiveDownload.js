//B"H
//Boruch Hashem
//Blessed is He

"use strict";
const https=require("node:https");
const {parsePublicUrl,pinAddress}=require("./secureHttpGet.js");
const MAX_ARCHIVE_BYTES=4*1024*1024;

/** Pinned-DNS, public-HTTPS, bounded download. No shell, credentials, or redirects. */
async function downloadGithubArchive(address,{timeoutMs=9000,maxBytes=MAX_ARCHIVE_BYTES,lookup,pin,requestImpl}={}) {
	const parsed=parsePublicUrl(address);
	if(parsed.protocol!=="https:"||parsed.hostname!=="codeload.github.com"||parsed.search||parsed.hash){
		throw Error("GIT_CLONE_ARCHIVE_HOST_DENIED");
	}
	const resolved=await (pin||pinAddress)(parsed,lookup);
	const budget=Math.max(1000,Math.min(12000,Number(timeoutMs)||9000));
	const cap=Math.max(1024,Math.min(MAX_ARCHIVE_BYTES,Number(maxBytes)||MAX_ARCHIVE_BYTES));
	const fetcher=requestImpl||https.request;
	return await new Promise((resolve,reject)=>{
		let finished=false,total=0;
		const done=(err,data)=>{
			if(finished)return;
			finished=true;clearTimeout(watchdog);
			if(err)reject(err);else resolve(data);
		};
		const request=fetcher(parsed,{
			method:"GET",agent:false,
			headers:{"Accept":"application/gzip","User-Agent":"Awtsmoos-Virtual-OS-GitHub-Importer"},
			lookup(host,options,callback) {
				if(host!==parsed.hostname)return callback(Error("GIT_CLONE_DNS_HOST_CHANGED"));
				if(options?.all)return callback(null,[resolved]);
				callback(null,resolved.address,resolved.family);
			}
		},response=>{
			if(response.statusCode!==200){
				response.resume();return done(Error("GIT_CLONE_REMOTE_HTTP_"+response.statusCode));
			}
			if(Number(response.headers["content-length"]||0)>cap){
				response.resume();return done(Error("GIT_CLONE_ARCHIVE_TOO_LARGE"));
			}
			const chunks=[];
			response.on("data",chunk=>{
				total+=chunk.length;
				if(total>cap){response.destroy();return done(Error("GIT_CLONE_ARCHIVE_TOO_LARGE"));}
				chunks.push(chunk);
			});
			response.on("end",()=>done(null,Buffer.concat(chunks)));
			response.on("error",error=>done(error));
		});
		const watchdog=setTimeout(()=>{
			request.destroy();done(Error("GIT_CLONE_DOWNLOAD_TIMEOUT"));
		},budget);
		request.on("error",error=>done(error));
		request.end();
	});
}
module.exports={downloadGithubArchive,MAX_ARCHIVE_BYTES};
