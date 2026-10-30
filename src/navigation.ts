export type Obstacle={x:number;z:number;w:number;d:number};
export const WORLD_LIMITS={left:-21.3,right:21.3,back:-25.3,front:30};
export const MAT_COLUMNS=[-7,-4.3,-1.7,1.7,4.3,7];
export const MAT_ROWS=[-9.6,-12.25,-14.9];
// Keep tables between mat rows; their old position intersected the middle row's sitting clearance.
export const SCRIPTURE_DESKS=[{x:-5.65,z:-10.1},{x:5.65,z:-10.1}];
export function isBlocked(x:number,z:number,obstacles:readonly Obstacle[],radius=.3){
 if(!Number.isFinite(x)||!Number.isFinite(z))return true;
 return x<WORLD_LIMITS.left||x>WORLD_LIMITS.right||z<WORLD_LIMITS.back||z>WORLD_LIMITS.front||obstacles.some(o=>Math.abs(x-o.x)<o.w/2+radius&&Math.abs(z-o.z)<o.d/2+radius);
}
export function hasWorshipClearance(x:number,z:number,yaw:number,obstacles:readonly Obstacle[],reach=1.15){
 for(let i=0;i<=5;i++){const d=i*reach/5;if(isBlocked(x+Math.sin(yaw)*d,z+Math.cos(yaw)*d,obstacles,.42))return false;}return true;
}
