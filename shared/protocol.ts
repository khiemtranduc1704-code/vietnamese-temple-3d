import layout from './world-layout.json' with {type:'json'};
import {MAT_COLUMNS,MAT_ROWS,SCRIPTURE_DESKS} from '../src/navigation.js';
export const PROTOCOL_VERSION=1;
export const MAX_PLAYERS=20;
export const WORLD_OBSTACLES=layout;
export function worldHash(items:readonly {x:number;z:number;w:number;d:number}[]){const normalized=items.map(o=>[o.x,o.z,o.w,o.d].map(n=>Math.round(n*1e6)/1e6)).sort((a,b)=>{const x=JSON.stringify(a),y=JSON.stringify(b);return x<y?-1:x>y?1:0;});let hash=2166136261;for(const c of JSON.stringify(normalized))hash=Math.imul(hash^c.charCodeAt(0),16777619);return (hash>>>0).toString(16);}
export const WORLD_HASH=worldHash(WORLD_OBSTACLES);
export const SEATS=[...MAT_COLUMNS.flatMap((x,i)=>MAT_ROWS.map((z,j)=>({id:`mat-${i}-${j}`,x,z,kind:'mat'}))),...SCRIPTURE_DESKS.map((p,i)=>({id:`book-${i}`,x:p.x,z:p.z+.55,kind:'book'}))];
export const ACTIONS=['stand','palms','kneel','prostrate','meditate','bow','triple'] as const;
export type WorshipAction=typeof ACTIONS[number];
export interface PlayerView{id:string;name:string;x:number;z:number;yaw:number;action:WorshipAction;actionSince:number;revision:number;moving:boolean;seatId:string;connected:boolean;}
export interface WorldView{players:Map<string,PlayerView>;serverTime:number;incenseHall:number;incenseCourtyard:number;stars:number;}
export function cleanText(value:unknown,max:number){return typeof value==='string'?value.replace(/[\u0000-\u001f\u007f<>]/g,'').trim().slice(0,max):'';}
export function validCode(value:string){return /^[A-F0-9]{18}$/.test(value);}
