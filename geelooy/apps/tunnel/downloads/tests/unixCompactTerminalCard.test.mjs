//B"H
//Boruch Hashem
//Blessed is He

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const file=path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../unix.sh');
const source=fs.readFileSync(file,'utf8');
function functionSource(name) {
	const match=source.match(new RegExp('^'+name+'\\(\\) \\{[\\s\\S]*?^\\}', 'm'));
	assert(match, `missing ${name}`);
	return match[0];
}
function render(command) {
	const functions=['awt_compact_card','awt_intro_box','awt_banner'].map(functionSource).join('\n\n');
	const result=spawnSync('bash',['-c',`${functions}\nAWT_C_OFF=''\nAWT_C_PURPLE=''\nAWT_C_BOLD=''\nAWT_C_CYAN=''\nAWT_C_DIM=''\n${command}`],{encoding:'utf8',timeout:5000});
	assert.equal(result.status,0,result.stderr);
	return result.stderr;
}

test('Termux-compatible banner has strictly 40-column borders and no emoji width drift',()=>{
	const rendered=render('awt_banner');
	const lines=rendered.split('\n').filter(row=>/^[╭│╰]/.test(row));
	assert.equal(lines.length,4);
	assert(lines.every(row=>Array.from(row).length===40),JSON.stringify(lines.map(row=>row.length)));
	assert.match(rendered,/AWTSMOOS TUNNEL/);
});

test('installer mode card remains 40 columns for full and agent-only',()=>{
	for(const mode of ['full','agent-only']) {
		const rendered=render(`awt_intro_box ${mode}`);
		const lines=rendered.split('\n').filter(row=>/^[╭│╰]/.test(row));
		assert.equal(lines.length,4);
		assert(lines.every(row=>Array.from(row).length===40));
		assert.match(rendered, new RegExp('Mode: '+mode));
	}
});

test('full mode is idempotent; explicit reinstall and stripped modes remain distinct flags',()=>{
	const parser=functionSource('parse_installer_args');
	function parse(options) {
		const shell = `${parser}
awt_warn(){ :; }
AWTSMOOS_INSTALL_MODE=''
AWTSMOOS_EXPLICIT_REINSTALL=0
AWTSMOOS_REUSE_IDENTITY=0
AWTSMOOS_KEEP_OLD_TUNNELS=0
parse_installer_args "$@"
printf '%s,%s,%s,%s' "$AWTSMOOS_INSTALL_MODE" "$AWTSMOOS_EXPLICIT_REINSTALL" "$AWTSMOOS_REUSE_IDENTITY" "$AWTSMOOS_KEEP_OLD_TUNNELS"
`;
		const r=spawnSync('bash',['-c',shell,'--',...options],{encoding:'utf8',timeout:4000});
		assert.equal(r.status,0,r.stderr);
		return r.stdout;
	}
	assert.equal(parse(['--full','--yes']),'full,0,0,0');
	assert.equal(parse(['--mode=full','--yes']),'full,0,0,0');
	assert.equal(parse(['--reinstall','--full','--yes']),'full,1,0,0');
	assert.equal(parse(['--minimal','--yes']),'minimal,1,0,0');
	assert.equal(parse(['--full','--yes','--keep-old-tunnels']),'full,0,0,1');
	assert.equal(parse(['--full','--reuse-identity','--keep-old-tunnels']),'full,0,1,1');
	assert.equal(parse(['--no-login','--yes']),',0,0,0');
});

test('first installer banner shrinks for 24 and 32 column Termux terminals',()=>{
  for (const cols of [24,32]) {
    const rendered=render(`COLUMNS=${cols}; awt_banner`);
    const lines=rendered.split('\n').filter(row=>/^[╭│╰]/.test(row));
    assert.equal(lines.length,4);
    assert(lines.every(row=>Array.from(row).length===cols),JSON.stringify(lines));
  }
});

test('installer never leaks credentials through ERR diagnostics or ANSI in non-TTY output',()=>{
  assert.equal(source.includes('$BASH_COMMAND'),false,'raw failed commands may contain secrets');
  assert.match(source,/\[ -t 2 \] && \[ -z "\$\{NO_COLOR\+x\}" \]/);
});
