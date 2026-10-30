import {isBlocked,hasWorshipClearance,MAT_COLUMNS,MAT_ROWS,SCRIPTURE_DESKS} from './navigation.ts';
function ok(v:boolean,m:string){if(!v)throw Error(m);}
const oldDesk={x:5.8,z:-11.9,w:1.7,d:.85};ok(!hasWorshipClearance(7,-12.25,Math.PI,[oldDesk],0),'reproduce old desk blocking meditation');
const desks=SCRIPTURE_DESKS.map(p=>({x:p.x,z:p.z-.9,w:1.7,d:.85}));
for(const x of MAT_COLUMNS)for(const z of MAT_ROWS)ok(hasWorshipClearance(x,z,Math.PI,desks,0),'all 18 mats clear of desks');
for(const p of SCRIPTURE_DESKS)ok(hasWorshipClearance(p.x,p.z+.55,Math.PI,desks,0),'reading cushion accessible');
const wall={x:0,z:0,w:.4,d:10};ok(isBlocked(.25,0,[wall]),'wall collision radius');ok(!isBlocked(.6,0,[wall]),'free space alongside wall');ok(isBlocked(22,4,[])&&isBlocked(0,-26,[])&&isBlocked(0,31,[]),'world boundaries');
let x=1,z=0;for(let i=0;i<40;i++){const nx=x-.15;if(!isBlocked(nx,z,[wall]))x=nx;const nz=z+.1;if(!isBlocked(x,nz,[wall]))z=nz;}ok(x>=.5&&z>3.9,'slide along wall without crossing it');
const altar={x:0,z:-2,w:1,d:1};ok(!hasWorshipClearance(0,0,Math.PI,[altar]),'bow requires forward clearance');ok(hasWorshipClearance(0,0,Math.PI,[altar],0),'seated clearance has no prostration reach');
ok(isBlocked(NaN,0,[]),'invalid coordinates rejected');console.log('PASS: desk regression, 18 mats, seats, walls, sliding, bounds and worship clearance');
