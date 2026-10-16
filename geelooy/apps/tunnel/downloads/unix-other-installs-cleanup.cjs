//B"H
//Boruch Hashem
//Blessed is He

"use strict";

/**
 * @file Retire separate historical Awtsmoos native installations after success.
 * @description Restrict deletion to verified Awtsmoos-owned runtime directories
 * inside the invoking account's HOME. Never delete projects, other users' files,
 * or the newly verified root. Fail closed on active processes that cannot stop.
 */
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const cp = require('node:child_process');

function insideHome(candidate, home) {
	const relative = path.relative(home, candidate);
	return relative && relative !== '..' && !relative.startsWith('..' + path.sep) && !path.isAbsolute(relative);
}
function exactRoot(candidate, active, home) {
	const root = path.resolve(candidate);
	if (!insideHome(root, home) || root === active || active.startsWith(root + path.sep) || root.startsWith(active + path.sep)) return false;
	if (!fs.existsSync(root) || fs.lstatSync(root).isSymbolicLink() || !fs.statSync(root).isDirectory()) return false;
	const markers = ['main.js','awtsmoos-supervisor.sh','install-state.txt'];
	return markers.every(name => fs.existsSync(path.join(root, name)) && !fs.lstatSync(path.join(root, name)).isSymbolicLink());
}
function candidates(home, active) {
	const paths = new Set([
		path.join(home, '.awtsmoos', 'tunnel'),
		path.join(home, '.awtsmoos-tunnel-old'),
		path.join(home, '.awtsmoos-tunnel-legacy'),
	]);
	for (const name of fs.readdirSync(home)) {
		if (/^\.awtsmoos-tunnel-[A-Za-z0-9._-]+$/.test(name) && name !== '.awtsmoos-tunnel-recovery') paths.add(path.join(home,name));
	}
	return [...paths].filter(p=>exactRoot(p,active,home));
}
function commandLines() {
	try {return cp.execFileSync('ps',['-axo','pid=,command='],{encoding:'utf8',timeout:4000}).split('\n')} catch {return []}
}
function ownedPids(root, rows) {
	const markers=[path.join(root,'main.js'),path.join(root,'awtsmoos-supervisor.sh'),path.join(root,'awtsmoos-agent-launcher.cjs')];
	return rows.flatMap(row=>{
		const m=row.trim().match(/^(\d+)\s+(.*)$/);
		return m && markers.some(marker=>m[2].split(/\s+/).includes(marker)) ? [Number(m[1])] : [];
	}).filter(pid=>pid!==process.pid && pid!==process.ppid);
}
function stopOwned(root, dryRun) {
	let pids=ownedPids(root,commandLines());
	if (dryRun) return {pids,stopped:0};
	for (const pid of pids) {try {process.kill(pid,'SIGTERM')} catch {}}
	const start=Date.now();
	while (Date.now()-start<3000 && ownedPids(root,commandLines()).length) {
		try {cp.execFileSync('sleep',['0.2'])} catch {}
	}
	pids=ownedPids(root,commandLines());
	if (pids.length) throw new Error('old_install_process_still_running');
	return {pids:[],stopped:0};
}
function stopMacServices(root,dryRun,home) {
	if (process.platform!=='darwin') return;
	const dir=path.join(home,'Library','LaunchAgents');
	if (!fs.existsSync(dir)) return;
	for(const name of fs.readdirSync(dir).filter(s=>/^com\.awtsmoos\.tunnel(?:\.[a-z0-9]+)?\.plist$/.test(s))){
		const file=path.join(dir,name);if(fs.lstatSync(file).isSymbolicLink())continue;
		const contents=fs.readFileSync(file,'utf8');
		if(!contents.includes(path.join(root,'awtsmoos-supervisor.sh')) && !contents.includes(`<string>${root}</string>`))continue;
		if(dryRun)continue;
		const label=name.slice(0,-6);
		try{cp.execFileSync('launchctl',['bootout',`gui/${process.getuid()}/${label}`],{stdio:'ignore',timeout:5000})}catch{}
		fs.rmSync(file,{force:true});
	}
}
function stopLinuxServices(root,dryRun,home) {
	if(process.platform!=='linux')return;
	const dir=path.join(home,'.config/systemd/user');if(!fs.existsSync(dir))return;
	for(const name of fs.readdirSync(dir).filter(s=>/^awtsmoos-tunnel(?:-[a-z0-9._-]+)?\.service$/.test(s))){
		const file=path.join(dir,name);if(fs.lstatSync(file).isSymbolicLink())continue;
		const contents=fs.readFileSync(file,'utf8');
		if(!contents.includes(path.join(root,'awtsmoos-supervisor.sh')) && !contents.includes(`AWTSMOOS_INSTALL_ROOT=${root}`))continue;
		if(dryRun)continue;
		try{cp.execFileSync('systemctl',['--user','disable','--now',name],{stdio:'ignore',timeout:5500})}catch{}
		fs.rmSync(file,{force:true});
	}
}
function run({home=process.env.HOME||os.homedir(),active=process.argv[2],dryRun=false}={}) {
	if(!active)throw new Error('active_root_required');
	home=fs.realpathSync(home);active=fs.realpathSync(active);
	if(!insideHome(active,home)||!fs.existsSync(active)||fs.lstatSync(active).isSymbolicLink())throw new Error('invalid_active_root');
	const results=[];
	for(const root of candidates(home,active)) {
		const record={root,removed:false};
		try {
			stopMacServices(root,dryRun,home);
			stopLinuxServices(root,dryRun,home);
			stopOwned(root,dryRun);
			if(!dryRun) fs.rmSync(root,{recursive:true,force:false});
			record.removed=!dryRun;
		} catch(error) {record.error=error.message;}
		results.push(record);
	}
	return {ok:results.every(x=>!x.error),checked:results.length,results};
}
if(require.main===module){try{const answer=run({dryRun:process.argv.includes('--dry-run')});console.log(JSON.stringify(answer));if(!answer.ok)process.exitCode=1;}catch(error){console.error(JSON.stringify({ok:false,error:error.message}));process.exitCode=1;}}
module.exports={run,candidates,exactRoot,insideHome,ownedPids};
