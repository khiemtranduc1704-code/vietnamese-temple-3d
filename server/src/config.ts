export const production=process.env.NODE_ENV==='production';
export const allowedOrigins=new Set((process.env.ALLOWED_ORIGINS||(!production?'http://127.0.0.1:5174,http://localhost:5174,http://127.0.0.1:4174':'')).split(',').map(v=>v.trim()).filter(Boolean));
if(production&&(allowedOrigins.size===0||[...allowedOrigins].some(v=>{try{const u=new URL(v);return u.protocol!=='https:'||u.origin!==v;}catch{return true;}})))throw new Error('Set ALLOWED_ORIGINS to exact HTTPS frontend origins before production start.');
export const originAllowed=(origin:string|null|undefined)=>!origin?!production:allowedOrigins.has(origin);
export const maxRooms=Math.min(50,Math.max(1,Number(process.env.MAX_ROOMS)||10));
