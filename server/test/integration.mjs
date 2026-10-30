import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {Client} from '@colyseus/sdk';
import {PROTOCOL_VERSION,WORLD_HASH} from '../dist/shared/protocol.js';
const port=Number(process.env.TEST_PORT)||2568,base=`http://127.0.0.1:${port}`;
const processServer=spawn(process.execPath,['dist/server/src/index.js'],{cwd:new URL('..',import.meta.url),env:{...process.env,PORT:String(port),HOST:'127.0.0.1',NODE_ENV:'development'},stdio:['ignore','pipe','pipe']});
let output='';processServer.stdout.on('data',b=>output+=b);processServer.stderr.on('data',b=>output+=b);
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function until(fn,message,timeout=7000){const end=Date.now()+timeout;while(Date.now()<end){if(await fn())return;await wait(50);}throw Error(message);}
const rooms=[],options={name:'QA',protocol:PROTOCOL_VERSION,worldHash:WORLD_HASH};
function configure(r){rooms.push(r);r.reconnection.minUptime=0;r.reconnection.maxRetries=10;r.reconnection.maxDelay=1000;for(const type of ['chat','interaction','correction','seatResult'])r.onMessage(type,()=>{});return r;}
function message(r,type,payload){return new Promise((resolve,reject)=>{const timer=setTimeout(()=>{off();reject(Error(`Missing ${type}`));},4000);const off=r.onMessage(type,m=>{clearTimeout(timer);off();resolve(m);});r.send(type==='seatResult'?'seat':type,payload);});}
try{
 await until(async()=>{try{return (await fetch(base+'/health')).ok;}catch{return false;}},'Backend did not start');
 const client=new Client(base.replace('http:','ws:'));
 const owner=configure(await client.create('temple',options));assert.match(owner.roomId,/^[A-F0-9]{18}$/);
 await assert.rejects(()=>client.joinById('000000000000000000',options));
 await assert.rejects(()=>client.joinById(owner.roomId,{...options,protocol:-1}));
 for(let i=1;i<20;i++)configure(await client.joinById(owner.roomId,{...options,name:`QA ${i}`}));
 await until(()=>rooms.every(r=>r.state.players?.size===20),'20 clients did not synchronize');
 await assert.rejects(()=>client.joinById(owner.roomId,options));
 console.log('PASS: private code, version mismatch, 20-player synchronization and capacity limit');
 const friend=rooms[1];const isolated=configure(await client.create('temple',{...options,name:'Other room'}));await until(()=>isolated.state.players?.size===1,'isolated room missing');
 let leaked=false;isolated.onMessage('chat',()=>leaked=true);const received=new Promise(resolve=>friend.onMessage('chat',resolve));owner.send('chat',{text:'<hello> friends'});assert.equal((await received).text,'hello friends');await wait(150);assert.equal(leaked,false);
 console.log('PASS: room isolation and sanitized shared chat');
 owner.send('travel',{to:'hall'});friend.send('travel',{to:'hall'});await until(()=>owner.state.players.get(owner.sessionId)?.z===-9,'travel failed');await wait(400);
 for(const r of [owner,friend])r.send('move',{x:1,z:-9.6,yaw:Math.PI});await until(()=>Math.abs(owner.state.players.get(friend.sessionId).x-1)<.01,'valid movement rejected');
 const seat={id:'mat-3-0',requestId:1};assert.equal((await message(owner,'seatResult',seat)).ok,true);assert.equal((await message(friend,'seatResult',seat)).ok,false);
 await until(()=>owner.state.players.get(owner.sessionId).action==='meditate','seat did not set meditation');
 owner.send('move',{x:1.8,z:-9.6,yaw:0});await wait(150);assert.ok(Math.abs(owner.state.players.get(owner.sessionId).x-1.7)<1e-5);
 const sid=owner.sessionId;let reconnected=false;owner.onReconnect(()=>reconnected=true);owner.connection.close();await until(()=>reconnected,'Automatic reconnection failed',10000);assert.equal(owner.sessionId,sid);await until(()=>owner.state.players.get(sid)?.seatId===seat.id,'Seat lost during reconnection');
 owner.send('action',{action:'stand'});await until(()=>friend.state.players.get(sid)?.seatId==='','Standing did not release seat');assert.equal((await message(friend,'seatResult',{...seat,requestId:2})).ok,true);
 await wait(900);const before=owner.state.players.get(sid).x;owner.send('move',{x:1000,z:1000,yaw:0});await wait(120);assert.equal(owner.state.players.get(sid).x,before);owner.send('move',{x:NaN,z:0,yaw:Infinity});await wait(120);assert.equal(owner.state.players.get(sid).x,before);
 console.log('PASS: valid movement, exclusive seats, worship movement lock, seat release, reconnect and invalid movement rejection');
 owner.send('action',{action:'bow'});await until(()=>friend.state.players.get(sid).action==='bow','Bow was not shared');await until(()=>friend.state.players.get(sid).action==='stand','Bow did not finish',5000);
 owner.send('interaction',{type:'incense',hall:true,count:3});await until(()=>friend.state.incenseHall===3,'Shared incense missing');assert.equal(isolated.state.incenseHall,0);
 console.log('PASS: shared worship animation completion and shared incense isolated by room');
 const denied=await fetch(base+'/matchmake/create/temple',{method:'POST',headers:{Origin:'https://untrusted.example','Content-Type':'application/json'},body:JSON.stringify(options)});assert.equal(denied.status,403);
 console.log('PASS: disallowed browser origin rejected');
} catch(error){console.error(output.slice(-2500));throw error;}finally{await Promise.allSettled(rooms.map(r=>r.leave(true)));processServer.kill('SIGTERM');}
