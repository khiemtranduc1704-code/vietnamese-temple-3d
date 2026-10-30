// Run without browser or external test runner: node --experimental-strip-types src/animation.test.ts
import {WorshipController,sample,standing} from './animation.ts';
function assert(ok:boolean,message:string){if(!ok)throw new Error(message);}
const c=new WorshipController();
for(const action of ['palms','kneel','meditate'] as const){c.request(action);for(let i=0;i<180;i++)c.update(1/60);assert(!c.canWalk,action+' must lock walking');assert(c.action===action,action+' must hold');c.request('stand');assert(!c.canWalk,'standing transition locks walking');for(let i=0;i<60;i++)c.update(1/60);assert(c.canWalk,'standing restores walking');}
c.request('triple');let lows=0,wasLow=false;for(let i=0;i<800;i++){const p=c.update(1/60);const low=p.body>1.6;if(low&&!wasLow)lows++;wasLow=low;}assert(lows===3,'three complete bows');assert(c.action==='kneel','sequence returns to kneeling');
c.request('bow');for(let i=0;i<180;i++)c.update(1/60);assert(c.action==='stand','bow returns to standing');
c.request('meditate');c.update(.3);const previous={...c.pose};c.request('palms');const next=c.update(.001);assert(Math.abs(previous.height-next.height)<.01,'interruptions remain smooth');
for(const a of ['stand','palms','kneel','prostrate','meditate','bow','triple'] as const)for(let t=0;t<14;t+=.05){const p=sample(a,t);assert(Object.values(p).every(Number.isFinite),'all samples finite');assert(p.height>0,'pelvis above floor');}
assert(standing.body===0,'upright default');console.log('PASS: holds, movement locks, standing recovery, three cycles, interruptions, finite poses');
