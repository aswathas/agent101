#!/usr/bin/env node
// Self-check for server.mjs. Run: node test-server.mjs
// Spawns the server, sends real JSON-RPC over stdio, asserts on real replies.

import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import assert from 'node:assert/strict';

const SERVER = join(dirname(fileURLToPath(import.meta.url)), 'server.mjs');

function ask(lines) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [SERVER], { stdio: ['pipe', 'pipe', 'inherit'] });
    let out = '';
    child.stdout.on('data', (c) => { out += c; });
    child.on('error', reject);
    child.on('close', () => {
      try {
        resolve(out.split('\n').filter(Boolean).map((l) => JSON.parse(l)));
      } catch (err) {
        reject(new Error(`unparseable reply: ${out}\n${err.message}`));
      }
    });
    child.stdin.write(lines.map((l) => JSON.stringify(l)).join('\n') + '\n');
    child.stdin.end();
  });
}

const req = (id, method, params = {}) => ({ jsonrpc: '2.0', id, method, params });

const replies = await ask([
  req(1, 'initialize', { protocolVersion: '2025-06-18', capabilities: {} }),
  { jsonrpc: '2.0', method: 'notifications/initialized' }, // notification: no reply expected
  req(2, 'tools/list'),
  req(3, 'tools/call', { name: 'list_notes', arguments: {} }),
  req(4, 'tools/call', { name: 'read_note', arguments: { title: 'kettle' } }),
  req(5, 'tools/call', { name: 'read_note', arguments: { title: 'nope' } }),
  req(6, 'no/such/method'),
]);

assert.equal(replies.length, 6, 'notifications must not get a reply');
assert.equal(replies[0].result.serverInfo.name, 'notes');
assert.deepEqual(replies[1].result.tools.map((t) => t.name), ['list_notes', 'read_note']);
assert.match(replies[2].result.content[0].text, /kettle/);
assert.match(replies[3].result.content[0].text, /4\. Not the whistle one/);
assert.equal(replies[4].result.isError, true, 'unknown note is a tool error, not a crash');
assert.equal(replies[5].error.code, -32601);

console.log('ok: 6 replies, notification ignored, tool error contained, unknown method rejected');