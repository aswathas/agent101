#!/usr/bin/env node
// A real MCP server, no dependencies. JSON-RPC 2.0 over stdio, one message per line.
//
// Run it by hand:  node server.mjs
// Wire it up:    claude mcp add --transport stdio notes -- node "$PWD/server.mjs"

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const NOTES = join(HERE, 'notes.json');

const PROTOCOL_VERSION = '2025-06-18';
const SERVER_INFO = { name: 'notes', version: '0.1.0' };

const TOOLS = [
  {
    name: 'list_notes',
    description: 'List the note titles in the notes store. No arguments.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
  },
  {
    name: 'read_note',
    description: 'Read one note by its exact title. Returns the full text.',
    inputSchema: {
      type: 'object',
      properties: { title: { type: 'string', description: 'Exact note title, as returned by list_notes' } },
      required: ['title'],
      additionalProperties: false,
    },
  },
];

function loadNotes() {
  return JSON.parse(readFileSync(NOTES, 'utf8'));
}

function callTool(name, args = {}) {
  const notes = loadNotes();
  switch (name) {
    case 'list_notes':
      return { text: notes.map((n) => n.title).join('\n') };
    case 'read_note': {
      const note = notes.find((n) => n.title === args.title);
      if (!note) throw new Error(`No note titled "${args.title}". Call list_notes first.`);
      return { text: note.body };
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

const HANDLERS = {
  initialize: () => ({
    protocolVersion: PROTOCOL_VERSION,
    capabilities: { tools: {} },
    serverInfo: SERVER_INFO,
    // What Claude is told about this server, in prose. Lesson 54 is about why
    // this field matters more than it looks.
    instructions: 'A tiny notes store. Use list_notes to see titles, read_note to fetch one.',
  }),
  'tools/list': () => ({ tools: TOOLS }),
  'tools/call': ({ name, arguments: args }) => {
    try {
      const { text } = callTool(name, args);
      return { content: [{ type: 'text', text }] };
    } catch (err) {
      return { content: [{ type: 'text', text: err.message }], isError: true };
    }
  },
  ping: () => ({}),
};

// One JSON message per line on stdin; one per line on stdout. Anything else on
// stdout corrupts the stream, so logs go to stderr.
let buffer = '';
process.stdin.on('data', (chunk) => {
  buffer += chunk;
  let newline;
  while ((newline = buffer.indexOf('\n')) !== -1) {
    const line = buffer.slice(0, newline).trim();
    buffer = buffer.slice(newline + 1);
    if (!line) continue;
    let msg;
    try {
      msg = JSON.parse(line);
    } catch {
      continue; // not our protocol; ignore it
    }
    // A request has an id. Everything else is a notification: no reply, ever.
    if (msg.id === undefined) continue;
    const handler = HANDLERS[msg.method];
    const reply = (result) => ({ jsonrpc: '2.0', id: msg.id, result });
    const fail = (code, message) => ({ jsonrpc: '2.0', id: msg.id, error: { code, message } });
    if (!handler) {
      process.stdout.write(JSON.stringify(fail(-32601, `Method not found: ${msg.method}`)) + '\n');
      continue;
    }
    try {
      process.stdout.write(JSON.stringify(reply(handler(msg.params ?? {}))) + '\n');
    } catch (err) {
      process.stdout.write(JSON.stringify(fail(-32603, err.message)) + '\n');
    }
  }
});