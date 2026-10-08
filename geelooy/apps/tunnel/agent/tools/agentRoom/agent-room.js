#!/usr/bin/env node
// B"H
// agent-room CLI — shared messaging + coordination for tunnel agents.
//
// Usage:
//   agent-room create <room> [--agent NAME]
//   agent-room join <room> --agent NAME [--desc "what you do"]
//   agent-room post <room> --agent NAME "message text" | --text-file FILE
//   agent-room read <room> [--since N] [--tail N] [--raw]
//   agent-room heartbeat <room> --agent NAME [--status active|away|busy] [--desc TEXT]
//   agent-room claim <room> --agent NAME <target> [--note TEXT]
//   agent-room release <room> --agent NAME <target>
//   agent-room claims <room>                  # list all claims
//   agent-room check <room> <target>          # is this target claimed?
//   agent-room status <room> [--within MS]    # presence + claims summary
//   agent-room rooms                          # list all rooms
//
// Agent identity: pass --agent NAME, or set AGENT_ROOM_AGENT.
// State dir: /Users/awtsmoos/.awtsmoos-tunnel-recovery/state/agent-room
//   or set AGENT_ROOM_STATE to override (tests).

'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const core = require('./room.js');

function usage() {
  return [
    'agent-room — shared agent messaging & coordination',
    '',
    '  create <room> [--agent NAME]',
    '  join <room> --agent NAME [--desc TEXT]',
    '  post <room> --agent NAME "text" | --text-file FILE [--id CLIENT_MSG_ID]  # idempotent; omit --id to mint one (echoed as clientId — reuse on retry)',
    '  retract <room> --agent NAME <seq>   # delete your own message (author only)',
    '  read <room> [--since N] [--tail N] [--raw]',
    '  heartbeat <room> --agent NAME [--status active|away|busy] [--desc TEXT]',
    '  claim <room> --agent NAME <target> [--note TEXT]',
    '  release <room> --agent NAME <target>',
    '  claims <room>',
    '  check <room> <target>',
    '  status <room> [--within MS]',
    '  rooms',
    '',
    'Env: AGENT_ROOM_AGENT, AGENT_ROOM_STATE'
  ].join('\n');
}

// minimal argv parser: flags --key VALUE or --flag, rest positional
function parseArgs(argv) {
  const pos = [], flags = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const k = a.slice(2);
      const next = argv[i + 1];
      if (next !== undefined && !next.startsWith('--')) { flags[k] = next; i++; }
      else flags[k] = true;
    } else pos.push(a);
  }
  return { pos, flags };
}

function agentName(flags) {
  return flags.agent || process.env.AGENT_ROOM_AGENT || '';
}

function out(obj, raw) {
  if (raw) console.log(JSON.stringify(obj));
  else console.log(JSON.stringify(obj, null, 1));
  return obj.ok === false && obj.claimed !== false && obj.released !== false ? 1 : 0;
}

function main() {
  const { pos, flags } = parseArgs(process.argv.slice(2));
  const cmd = pos[0];
  const room = pos[1];
  const agent = agentName(flags);
  const raw = !!flags.raw;

  try {
    switch (cmd) {
      case 'create': {
        if (!room) throw new Error('room name required');
        process.exitCode = out(core.newRoom(room, agent || undefined), raw);
        break;
      }
      case 'rooms':
      case 'discover': { // discover = list rooms; needs zero prior state, no mission ID
        const dir = path.join(core.stateDir(), 'rooms');
        const rooms = fs.existsSync(dir)
          ? fs.readdirSync(dir).filter(f => f.endsWith('.json')).map(f => f.slice(0, -5)).sort()
          : [];
        console.log(JSON.stringify({ ok: true, rooms }, null, 1));
        break;
      }
      case 'join': {
        if (!room) throw new Error('room name required');
        core.checkAgent(agent);
        process.exitCode = out(core.joinRoom(room, agent, flags.desc), raw);
        break;
      }
      case 'post': {
        if (!room) throw new Error('room name required');
        core.checkAgent(agent);
        let text;
        if (flags['text-file']) text = fs.readFileSync(flags['text-file'], 'utf8');
        else {
          const msgParts = [];
          for (const p of pos.slice(2)) msgParts.push(p);
          text = msgParts.join(' ');
        }
        // Flap-safe idempotency: a retry is only deduped when the caller
        // reuses the SAME id. If none is given we mint one and echo it so
        // the caller can capture `clientId` from the output and reuse it.
        const clientId = flags.id || ('cli-' + crypto.randomUUID());
        const r = core.postMessage(room, agent, text, clientId);
        r.clientId = clientId;
        process.exitCode = out(r, raw);
        break;
      }
      case 'retract': {
        if (!room) throw new Error('room name required');
        core.checkAgent(agent);
        const seq = pos[2];
        if (!seq) throw new Error('message seq required');
        const r = core.retractMessage(room, agent, seq);
        process.exitCode = out(r, raw);
        process.exitCode = (r.ok && r.retracted) ? 0 : 1;
        break;
      }
      case 'read': {
        if (!room) throw new Error('room name required');
        const r = core.readMessages(room, { since: flags.since, tail: flags.tail });
        if (!raw) {
          for (const m of r.messages) {
            console.log(`[#${m.seq}] ${m.agent} @ ${m.ts}\n${m.text}\n`);
          }
          console.log(`--- room=${r.room} lastSeq=${r.seq} shown=${r.messages.length} ---`);
        } else console.log(JSON.stringify(r));
        break;
      }
      case 'heartbeat': {
        if (!room) throw new Error('room name required');
        core.checkAgent(agent);
        process.exitCode = out(core.heartbeat(room, agent, flags.status, flags.desc), raw);
        break;
      }
      case 'claim': {
        if (!room) throw new Error('room name required');
        core.checkAgent(agent);
        const target = pos[2];
        if (!target) throw new Error('claim target required');
        const r = core.claimTarget(room, agent, target, flags.note);
        process.exitCode = out(r, raw);
        if (r.ok && r.claimed) process.exitCode = 0;
        else if (!r.ok && r.reason === 'already claimed') process.exitCode = 2;
        else process.exitCode = 1;
        break;
      }
      case 'release': {
        if (!room) throw new Error('room name required');
        core.checkAgent(agent);
        const target = pos[2];
        if (!target) throw new Error('release target required');
        const r = core.releaseTarget(room, agent, target);
        process.exitCode = out(r, raw);
        process.exitCode = (r.ok && r.released) ? 0 : 1;
        break;
      }
      case 'claims': {
        if (!room) throw new Error('room name required');
        const r = core.listClaims(room);
        if (!raw) {
          if (r.claims.length === 0) console.log('(no claims)');
          for (const c of r.claims) {
            console.log(`${c.target}\n  claimed by ${c.agent} @ ${c.ts}${c.note ? '\n  note: ' + c.note : ''}`);
          }
        } else console.log(JSON.stringify(r));
        break;
      }
      case 'check': {
        if (!room) throw new Error('room name required');
        const target = pos[2];
        if (!target) throw new Error('target required');
        const r = core.checkClaim(room, target);
        if (!raw) {
          console.log(r.claimed
            ? `CLAIMED by ${r.by} @ ${r.ts}${r.note ? ' — ' + r.note : ''}`
            : 'FREE (no claim)');
        } else console.log(JSON.stringify(r));
        process.exitCode = r.claimed ? 2 : 0;
        break;
      }
      case 'status': {
        if (!room) throw new Error('room name required');
        const r = core.roomStatus(room, flags.within);
        if (!raw) {
          console.log(`room: ${r.room}  created: ${r.created}  messages: ${r.messages}  lastSeq: ${r.lastSeq}`);
          console.log('agents:');
          for (const a of r.agents) {
            console.log(`  ${a.agent}  ${a.online ? 'ONLINE' : 'offline'}  lastSeen=${a.lastSeen}  status=${a.status}${a.desc ? '  ' + a.desc : ''}`);
          }
          console.log('claims:');
          if (r.claims.length === 0) console.log('  (none)');
          for (const c of r.claims) console.log(`  ${c.target} <- ${c.agent}`);
        } else console.log(JSON.stringify(r));
        break;
      }
      case undefined:
      case '-h':
      case '--help':
      case 'help':
        console.log(usage());
        break;
      default:
        throw new Error('unknown command: ' + cmd + '\n' + usage());
    }
  } catch (e) {
    console.error('ERROR: ' + (e && e.message ? e.message : String(e)));
    process.exit(1);
  }
}

main();
