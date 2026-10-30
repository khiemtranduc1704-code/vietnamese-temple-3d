import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import WebSocket from 'ws';
import {PROTOCOL_VERSION,WORLD_HASH} from '../dist/shared/protocol.js';
const port=Number(process.env.PRODUCTION_TEST_PORT)||2569,base=`http://127.0.0.1:${port}`,origin='https://temple.example';
const server=spawn(process.execPath,['dist/server/src/index.js'],{cwd:new URL('..',import.meta.url),env:{...process.env,NODE_ENV:'production',PORT:String(port),HOST:'127.0.0.1',ALLOWED_ORIGINS:origin},stdio:'ignore'});
try{
 let ready=false;for(let i=0;i<80;i++){try{ready=(await fetch(base+'/health')).ok;}catch{}if(ready)break;await new Promise(r=>setTimeout(r,50));}assert.ok(ready,'Production backend failed to start');
 for(const headers of [{},{Origin:'https://wrong.example'}])assert.equal((await fetch(base+'/matchmake/create/temple',{method:'POST',headers:{...headers,'Content-Type':'application/json'},body:'{}'})).status,403);
 const allowed=await fetch(base+'/matchmake/create/temple',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify({name:'QA',protocol:PROTOCOL_VERSION,worldHash:WORLD_HASH})});assert.equal(allowed.status,200);assert.equal(allowed.headers.get('access-control-allow-origin'),origin);
 assert.equal((await fetch(base+'/matchmake/create/temple',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:'x'.repeat(9000)})).status,413);
 await new Promise((resolve,reject)=>{const ws=new WebSocket(base.replace('http','ws')+'/invalid',{headers:{Origin:'https://wrong.example'}});const timer=setTimeout(()=>{ws.terminate();reject(Error('WebSocket rejection timeout'));},4000);ws.on('unexpected-response',(_req,res)=>{clearTimeout(timer);assert.equal(res.statusCode,403);res.resume();resolve();});ws.on('open',()=>{clearTimeout(timer);ws.close();reject(Error('Untrusted WebSocket origin accepted'));});ws.on('error',()=>{});});
 globalThis.WebSocket=WebSocket;const {Client}=await import('@colyseus/sdk');const c=new Client(base.replace('http','ws'),{headers:{Origin:origin}});const joined=await c.create('temple',{name:'Allowed player',protocol:PROTOCOL_VERSION,worldHash:WORLD_HASH});await joined.leave(true);
 console.log('PASS: authorized SDK WebSocket join, production startup, exact HTTPS origin, missing/wrong origin denial, WebSocket origin denial and request size limit');
}finally{server.kill('SIGTERM');}
