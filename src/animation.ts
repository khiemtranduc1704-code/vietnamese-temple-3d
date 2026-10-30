// Serializable action state: send action + elapsed + repeats alongside transform in a future server.
export type Action = 'stand'|'palms'|'kneel'|'prostrate'|'meditate'|'bow'|'triple';
export type Pose = {height:number; body:number; head:number; hip:number; knee:number; spread:number; shoulder:number; elbow:number; armSpread:number};
export const standing:Pose={height:0.98,body:0,head:0,hip:0,knee:0,spread:0,shoulder:0.05,elbow:0.08,armSpread:0.05};
const prayer:Pose={...standing,head:0.12,shoulder:-0.65,elbow:-1.75,armSpread:0.60};
const kneeling:Pose={...prayer,height:0.49,hip:-0.15,knee:1.72};
const low:Pose={...kneeling,height:0.49,body:1.65,head:0.25,shoulder:-2.65,elbow:-0.12,armSpread:0.08};
const seated:Pose={...standing,height:0.36,hip:-1.25,knee:2.1,spread:0.85,shoulder:-0.5,elbow:-1.15,armSpread:0.15};
export function blend(a:Pose,b:Pose,t:number):Pose { const out={...a};t=Math.max(0,Math.min(1,t)); t=t*t*(3-2*t);for(const k of Object.keys(a) as (keyof Pose)[])out[k]=a[k]+(b[k]-a[k])*t;return out; }
export function sample(action:Action,t:number):Pose {
 if(action==='stand')return standing;if(action==='palms')return prayer;if(action==='kneel')return kneeling;if(action==='meditate')return seated;
 if(action==='bow') return blend(prayer,{...prayer,body:0.55},t<1.3?t/1.3:1-(t-1.3)/1.3);
 const phase=t%4.4;
 if(phase<0.8)return kneeling;
 if(phase<2.1)return blend(kneeling,low,(phase-0.8)/1.3);
 if(phase<2.8)return low;
 return blend(low,kneeling,(phase-2.8)/1.3);
}
export class WorshipController {
 action:Action='stand'; elapsed=0; transition=1; from={...standing};pose={...standing};completed=0;
 get canWalk(){return this.action==='stand'&&this.transition>=1;}
 request(action:Action){this.from={...this.pose};this.action=action;this.elapsed=0;this.transition=0;this.completed=0;}
 update(dt:number){this.elapsed+=dt;this.transition=Math.min(1,this.transition+dt/0.85);const duration=this.action==='triple'?13.2:this.action==='prostrate'?4.4:this.action==='bow'?2.6:Infinity;
 this.completed=this.action==='triple'?Math.min(3,Math.floor(this.elapsed/4.4)):0;
 if(this.elapsed>=duration){this.request(this.action==='bow'?'stand':'kneel');}
 this.pose=blend(this.from,sample(this.action,this.elapsed),this.transition);return this.pose;}
 snapshot(){return {action:this.action,elapsed:this.elapsed,completed:this.completed};}
}
