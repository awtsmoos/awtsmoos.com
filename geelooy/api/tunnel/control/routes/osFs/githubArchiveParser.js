//B"H
//Boruch Hashem
//Blessed is He

"use strict";
const zlib=require("node:zlib");
const {TextDecoder}=require("node:util");
const MAX_EXPANDED=12*1024*1024;
const MAX_FILES=150,MAX_TEXT=2*1024*1024,MAX_FILE=300*1024;
const utf8=new TextDecoder("utf-8",{fatal:true});
function textField(buffer,offset,length) {
	const slice=buffer.subarray(offset,offset+length);
	const zero=slice.indexOf(0);
	return slice.subarray(0,zero<0?slice.length:zero).toString("utf8");
}
function octal(buffer,offset,length) {
	const value=textField(buffer,offset,length).trim();
	if(!/^[0-7]+$/.test(value))throw Error("GIT_CLONE_INVALID_TAR_NUMBER");
	return parseInt(value,8);
}
function verifyChecksum(tar,offset) {
	const expected=octal(tar,offset+148,8);
	let sum=0;
	for(let i=0;i<512;i++)sum+=(i>=148&&i<156)?32:tar[offset+i];
	if(sum!==expected)throw Error("GIT_CLONE_TAR_CHECKSUM_FAILURE");
}
function parsePax(value) {
	const metadata={};
	let offset=0;
	while(offset<value.length) {
		const space=value.indexOf(32,offset);
		if(space<0)throw Error("GIT_CLONE_INVALID_PAX");
		const len=Number(value.subarray(offset,space).toString("ascii"));
		if(!Number.isInteger(len)||len<=0||offset+len>value.length)throw Error("GIT_CLONE_INVALID_PAX");
		const line=value.subarray(space+1,offset+len).toString("utf8").trimEnd();
		const equal=line.indexOf("=");
		if(equal>0)metadata[line.slice(0,equal)]=line.slice(equal+1);
		offset+=len;
	}
	return metadata;
}
function safeArchivePath(name) {
	if(!name||name.includes("\\")||/[\x00-\x1f\x7f]/.test(name))throw Error("GIT_CLONE_UNSAFE_ARCHIVE_PATH");
	const parts=name.split("/");
	if(!/^[-._a-zA-Z0-9]+$/.test(parts[0])||parts.slice(1).some(part=>part===".."||part==="."||part.includes(":")))throw Error("GIT_CLONE_UNSAFE_ARCHIVE_PATH");
	const relative=parts.slice(1).filter(Boolean).join("/");
	if(relative.length>300||relative.split("/").some(x=>!x||x==="..")||relative.startsWith(".git/")||relative===".git")throw Error("GIT_CLONE_UNSAFE_ARCHIVE_PATH");
	return relative;
}
/** Gunzip a complete GitHub tarball into bounded UTF-8 source files. */
function parseGithubArchive(archive,{maxFiles=MAX_FILES,maxTextBytes=MAX_TEXT,maxFileBytes=MAX_FILE}={}) {
	if(!Buffer.isBuffer(archive)||archive.length<30)throw Error("GIT_CLONE_INVALID_ARCHIVE");
	let tar;
	try{tar=zlib.gunzipSync(archive,{maxOutputLength:MAX_EXPANDED});}
	catch{throw Error("GIT_CLONE_EXPANSION_LIMIT_OR_INVALID_GZIP");}
	const files=[],skippedBinary=[];
	let offset=0, pendingPath="", scanned=0,totalText=0;
	while(offset+512<=tar.length) {
		const header=tar.subarray(offset,offset+512);
		if(header.every(byte=>byte===0))break;
		verifyChecksum(tar,offset);
		const size=octal(tar,offset+124,12);
		const type=String.fromCharCode(tar[offset+156]);
		const prefix=textField(tar,offset+345,155);
		const name=textField(tar,offset,100);
		const fullName=pendingPath||(prefix?prefix+"/"+name:name);
		pendingPath="";
		const start=offset+512,end=start+size;
		if(!Number.isSafeInteger(size)||end>tar.length)throw Error("GIT_CLONE_TAR_TRUNCATED");
		const data=tar.subarray(start,end);
		offset=start+Math.ceil(size/512)*512;
		if(type==="x"||type==="g"){
			const pax=parsePax(data);
			if(type==="x")pendingPath=pax.path||"";
			continue;
		}
		if(type==="L"){pendingPath=data.toString("utf8").replace(/\0.*$/s,"").trimEnd();continue;}
		if(type==="5")continue;
		if(type!=="0"&&type!=="\0")throw Error("GIT_CLONE_UNSUPPORTED_ARCHIVE_ENTRY");
		const relative=safeArchivePath(fullName);
		if(!relative)continue;
		if(++scanned>Math.min(MAX_FILES,maxFiles))throw Error("GIT_CLONE_TOO_MANY_FILES");
		if(size>Math.min(MAX_FILE,maxFileBytes))throw Error("GIT_CLONE_FILE_TOO_LARGE");
		let content;
		try{if(data.includes(0))throw Error();content=utf8.decode(data);}
		catch {skippedBinary.push(relative);continue;}
		totalText+=size;
		if(totalText>Math.min(MAX_TEXT,maxTextBytes))throw Error("GIT_CLONE_TEXT_QUOTA_EXCEEDED");
		if(files.some(item=>item.path===relative))throw Error("GIT_CLONE_DUPLICATE_PATH");
		files.push({path:relative,content,bytes:size});
	}
	if(!files.length)throw Error("GIT_CLONE_NO_IMPORTABLE_TEXT_FILES");
	return {files,skippedBinary,sourceBytes:archive.length,expandedBytes:tar.length,totalTextBytes:totalText,complete:skippedBinary.length===0};
}
module.exports={parseGithubArchive,MAX_EXPANDED,MAX_FILES,MAX_TEXT,MAX_FILE,safeArchivePath};
