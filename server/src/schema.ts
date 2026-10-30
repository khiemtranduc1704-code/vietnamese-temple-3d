import {Schema,MapSchema,defineTypes} from '@colyseus/schema';
export class Player extends Schema {
 id='';name='';x=0;z=-7;yaw=Math.PI;action='stand';actionSince=0;revision=0;moving=false;seatId='';connected=true;
}
defineTypes(Player,{id:'string',name:'string',x:'number',z:'number',yaw:'number',action:'string',actionSince:'number',revision:'number',moving:'boolean',seatId:'string',connected:'boolean'});
export class TempleState extends Schema {players=new MapSchema<Player>();serverTime=0;incenseHall=0;incenseCourtyard=0;stars=0;}
defineTypes(TempleState,{players:{map:Player},serverTime:'number',incenseHall:'number',incenseCourtyard:'number',stars:'number'});
