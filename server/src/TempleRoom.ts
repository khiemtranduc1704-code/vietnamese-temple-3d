import {randomBytes} from 'node:crypto';
import {Room,ServerError,type Client,type AuthContext} from '@colyseus/core';
import {Player,TempleState} from './schema.js';
import {ACTIONS,MAX_PLAYERS,PROTOCOL_VERSION,WORLD_HASH,WORLD_OBSTACLES,SEATS,cleanText,type WorshipAction} from '../../shared/protocol.js';
import {isBlocked,hasWorshipClearance} from '../../src/navigation.js';
import {originAllowed,maxRooms} from './config.js';
const activeRooms=new Set<string>();
export class TempleRoom extends Room<{state:TempleState}> {
 maxClients=MAX_PLAYERS;state=new TempleState();patchRate=50;
 private limits=new Map<string,{start:number;count:number}>();private lastMove=new Map<string,number>();private lastInteraction=new Map<string,number>();
 static async onAuth(_token:string,options:any,context:AuthContext){if(!originAllowed(context.headers.get('origin')))throw new ServerError(403,'Origin not allowed');if(options?.protocol!==PROTOCOL_VERSION||options?.worldHash!==WORLD_HASH)throw new ServerError(400,'Game version mismatch; reload the page.');if(!cleanText(options?.name,24))throw new ServerError(400,'A display name is required.');return true;}
 async onCreate(options:any){
  if(options?.protocol!==PROTOCOL_VERSION||options?.worldHash!==WORLD_HASH)throw new ServerError(400,'Game version mismatch.');
  if(activeRooms.size>=maxRooms)throw new ServerError(503,'Server is busy; try again later.');
  this.roomId=randomBytes(9).toString('hex').toUpperCase();activeRooms.add(this.roomId);await this.setPrivate(true);
  this.onMessage('move',(c,m)=>this.move(c,m));this.onMessage('action',(c,m)=>this.action(c,m));this.onMessage('seat',(c,m)=>this.seat(c,m));this.onMessage('travel',(c,m)=>this.travel(c,m));
  this.onMessage('chat',(c,m)=>{if(!this.rate(c,'chat',5))return;const text=cleanText(m?.text,200);if(text)this.broadcast('chat',{name:this.state.players.get(c.sessionId)?.name||'Guest',text});});
  this.onMessage('interaction',(c,m)=>this.interaction(c,m));
  this.setSimulationInterval(()=>{const now=Date.now();for(const p of this.state.players.values()){const duration=p.action==='triple'?13200:p.action==='prostrate'?4400:p.action==='bow'?2600:Infinity;if(now-p.actionSince>=duration)this.setAction(p,p.action==='bow'?'stand':'kneel');}if(now-this.state.serverTime>=500)this.state.serverTime=now;},50);
 }
 onJoin(client:Client,options:any){const p=new Player();p.id=client.sessionId;p.name=cleanText(options?.name,24)||'Phật tử';let slot=0;const used=[...this.state.players.values()];while(used.some(o=>Math.hypot(o.x-((slot%5)-2)*.8,o.z-(-7+Math.floor(slot/5)*.8))<.6)&&slot<20)slot++;p.x=((slot%5)-2)*.8;p.z=-7+Math.floor(slot/5)*.8;p.actionSince=Date.now()-1000;this.state.players.set(client.sessionId,p);this.lastMove.set(client.sessionId,Date.now());}
 async onDrop(client:Client){const p=this.state.players.get(client.sessionId);if(p){p.connected=false;p.moving=false;}try{await this.allowReconnection(client,20);}catch{/* onLeave releases the seat after the reservation expires. */}}
 onReconnect(client:Client){const p=this.state.players.get(client.sessionId);if(p)p.connected=true;this.lastMove.set(client.sessionId,Date.now());}
 onLeave(client:Client){this.state.players.delete(client.sessionId);this.lastMove.delete(client.sessionId);this.lastInteraction.delete(client.sessionId);for(const k of this.limits.keys())if(k.startsWith(client.sessionId+':'))this.limits.delete(k);}
 onDispose(){activeRooms.delete(this.roomId);}
 private rate(c:Client,type:string,max:number){const key=c.sessionId+':'+type,now=Date.now(),value=this.limits.get(key);if(!value||now-value.start>1000){this.limits.set(key,{start:now,count:1});return true;}return ++value.count<=max;}
 private correction(c:Client,reason:string){const p=this.state.players.get(c.sessionId);if(p)c.send('correction',{x:p.x,z:p.z,yaw:p.yaw,action:p.action,reason});}
 private setAction(p:Player,action:WorshipAction){if(p.action===action)return;p.action=action;p.actionSince=Date.now();p.revision++;p.moving=false;if(action==='stand')p.seatId='';}
 private occupied(x:number,z:number,id:string){return [...this.state.players.values()].some(p=>p.id!==id&&p.seatId&&Math.hypot(x-p.x,z-p.z)<.65);}
 private move(c:Client,m:any){if(!this.rate(c,'move',25))return;const p=this.state.players.get(c.sessionId);if(!p||!m||![m.x,m.z,m.yaw].every(Number.isFinite))return;const now=Date.now(),dt=Math.min(.35,(now-(this.lastMove.get(c.sessionId)||now))/1000);this.lastMove.set(c.sessionId,now);const distance=Math.hypot(m.x-p.x,m.z-p.z);
  if(p.action!=='stand'||now-p.actionSince<850){if(distance>.02)this.correction(c,'Standing required.');return;}
  if(distance>3.4*dt+.16){this.correction(c,'Movement corrected.');return;}
  const steps=Math.max(1,Math.ceil(distance/.12));for(let i=1;i<=steps;i++){const t=i/steps,x=p.x+(m.x-p.x)*t,z=p.z+(m.z-p.z)*t;if(isBlocked(x,z,WORLD_OBSTACLES)||this.occupied(x,z,p.id)){this.correction(c,'Path blocked.');return;}}
  p.x=m.x;p.z=m.z;p.yaw=Math.atan2(Math.sin(m.yaw),Math.cos(m.yaw));p.moving=distance>.005;
 }
 private action(c:Client,m:any){if(!this.rate(c,'action',8))return;const p=this.state.players.get(c.sessionId);if(!p||!ACTIONS.includes(m?.action))return;const action=m.action as WorshipAction;if(action!=='stand'&&!hasWorshipClearance(p.x,p.z,p.yaw,WORLD_OBSTACLES,action==='meditate'?0:action==='palms'?.45:1.15)){this.correction(c,'Not enough space for this action.');return;}this.setAction(p,action);}
 private seat(c:Client,m:any){if(!this.rate(c,'seat',5))return;const p=this.state.players.get(c.sessionId),seat=SEATS.find(s=>s.id===m?.id);const reply=(ok:boolean,reason='')=>c.send('seatResult',{requestId:m?.requestId,ok,reason,seat});if(!p||!seat||Math.hypot(p.x-seat.x,p.z-seat.z)>1.6){reply(false,'Approach the cushion first.');return;}if([...this.state.players.values()].some(other=>other.id!==p.id&&other.seatId===seat.id)){reply(false,'This cushion is already occupied.');return;}if(!hasWorshipClearance(seat.x,seat.z,Math.PI,WORLD_OBSTACLES,0)){reply(false,'This seat is not accessible.');return;}p.x=seat.x;p.z=seat.z;p.yaw=Math.PI;this.setAction(p,'meditate');p.seatId=seat.id;reply(true);}
 private travel(c:Client,m:any){if(!this.rate(c,'travel',2))return;const p=this.state.players.get(c.sessionId);if(!p||!['hall','courtyard'].includes(m?.to))return;this.setAction(p,'stand');p.actionSince=Date.now()-1000;p.x=0;p.z=m.to==='hall'?-9:17;p.yaw=Math.PI;p.seatId='';c.send('correction',{x:p.x,z:p.z,yaw:p.yaw,action:p.action,reason:'travel'});}
 private interaction(c:Client,m:any){if(!this.rate(c,'interaction',5))return;const p=this.state.players.get(c.sessionId);if(!p)return;const type=m?.type;if(!['bell','mok','incense','stars','donation','fortune'].includes(type))return;const now=Date.now();if(now-(this.lastInteraction.get(c.sessionId)||0)<150)return;this.lastInteraction.set(c.sessionId,now);
  // These activities already have local menus. Only live sound/visual effects and a room notice are shared.
  if(type==='incense'){if(m.hall)this.state.incenseHall+=m.count===1?1:3;else this.state.incenseCourtyard+=m.count===1?1:3;}
  if(type==='stars')this.state.stars++;
  this.broadcast('interaction',{id:c.sessionId,name:p.name,type,hall:!!m.hall,count:m.count===1?1:3});
 }
}
