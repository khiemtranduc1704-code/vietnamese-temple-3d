import 'dotenv/config';
import {Server,matchMaker} from '@colyseus/core';
import {WebSocketTransport} from '@colyseus/ws-transport';
import {originAllowed,production} from './config.js';
import {TempleRoom} from './TempleRoom.js';
import {PROTOCOL_VERSION,MAX_PLAYERS} from '../../shared/protocol.js';
const transport=new WebSocketTransport({maxPayload:8192,pingInterval:5000,pingMaxRetries:3,beforeUpgrade:(req)=>originAllowed(req.headers.get('origin'))?undefined:new Response('Origin not allowed',{status:403})});
matchMaker.controller.exposedMethods=['create','joinById','reconnect'];
matchMaker.controller.getCorsHeaders=headers=>({'Access-Control-Allow-Origin':originAllowed(headers.get('origin'))?(headers.get('origin')||'http://127.0.0.1:5174'):'https://invalid.invalid','Vary':'Origin'});
const server=new Server({transport,greet:false,express:app=>{app.disable('x-powered-by');app.get('/health',(_req,res)=>res.json({ok:true,protocol:PROTOCOL_VERSION,maxPlayers:MAX_PLAYERS}));}});
server.define('temple',TempleRoom);
const port=Number(process.env.PORT)||2567;await server.listen(port,process.env.HOST||(production?'0.0.0.0':'127.0.0.1'));
// Guard every HTTP route, including framework-owned matchmaking routes, before body parsing.
const http=transport.server!;const handlers=http.listeners('request');http.removeAllListeners('request');const attempts=new Map<string,{at:number;count:number}>();
http.on('request',(req,res)=>{res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Cache-Control','no-store');if(req.url?.split('?')[0]!=='/health'&&!originAllowed(req.headers.origin)){res.writeHead(403);res.end('Origin not allowed');return;}if(Number(req.headers['content-length'])>8192){res.writeHead(413);res.end('Request too large');return;}if(req.url?.startsWith('/matchmake')&&req.method==='POST'){const key=req.socket.remoteAddress||'unknown',now=Date.now();if(attempts.size>4096)attempts.clear();let v=attempts.get(key);if(!v||now-v.at>60000){v={at:now,count:0};attempts.set(key,v);}if(++v.count>100){res.writeHead(429);res.end('Too many connection attempts; wait one minute.');return;}}let bytes=0;req.on('data',chunk=>{bytes+=chunk.length;if(bytes>8192)req.destroy();});for(const handler of handlers)handler.call(http,req,res);});
console.log(`An Lac multiplayer listening on port ${port}`);
