import * as T from 'three';
import {SCRIPTURE_DESKS} from './navigation';
export function addDetails(scene:T.Scene, solid:(x:number,z:number,w:number,d:number)=>void){
 const materials=new Map<string,T.MeshStandardMaterial>();
 const material=(c:string)=>{if(!materials.has(c))materials.set(c,new T.MeshStandardMaterial({color:c,roughness:.65}));return materials.get(c)!;};
 function add(g:T.BufferGeometry,c:string,x:number,y:number,z:number,p:T.Object3D=scene){const m=new T.Mesh(g,material(c));m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;p.add(m);return m;}
 const box=(x:number,y:number,z:number,w:number,h:number,d:number,c:string,p:T.Object3D=scene)=>add(new T.BoxGeometry(w,h,d),c,x,y,z,p);
 const sphere=(x:number,y:number,z:number,r:number,c:string,p:T.Object3D=scene)=>add(new T.SphereGeometry(r,20,14),c,x,y,z,p);
 const cylinder=(x:number,y:number,z:number,r:number,h:number,c:string,p:T.Object3D=scene,r2=r)=>add(new T.CylinderGeometry(r,r2,h,24),c,x,y,z,p);
 function link(a:T.Vector3,b:T.Vector3,r:number,c:string,p:T.Object3D){const d=b.clone().sub(a);const m=add(new T.CylinderGeometry(r,r,d.length(),16),c,0,0,0,p);m.position.copy(a).add(b).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());}
 function lotus(x:number,y:number,z:number,r:number,c:string,p:T.Object3D=scene){cylinder(x,y,z,r,.16,c,p);for(let i=0;i<20;i++){const a=i*Math.PI/10;const petal=sphere(x+Math.sin(a)*r*.8,y+.12,z+Math.cos(a)*r*.8,r*.24,c,p);petal.scale.set(.65,1.5,.65);petal.rotation.z=-Math.sin(a)*.5;}}
 // A larger seated Shakyamuni: robe, lotus throne, ears, curled hair and dhyana hands.
 const b=new T.Group();b.position.set(0,.85,-19.7);b.scale.setScalar(1.42);scene.add(b);const g='#d8aa46',shade='#b9812e';
 lotus(0,.25,0,1.4,g,b);const lap=sphere(0,.7,.1,1.1,g,b);lap.scale.set(1,.38,.67);
 const torso=sphere(0,1.45,0,.77,g,b);torso.scale.set(.8,1.2,.65);
 cylinder(0,2.12,0,.19,.25,g,b);const head=sphere(0,2.56,0,.43,g,b);head.scale.set(.85,1.12,.87);
 for(const s of [-1,1]){const ear=sphere(s*.37,2.5,0,.12,g,b);ear.scale.set(.7,1.9,.7);if(s===1){link(new T.Vector3(.52,1.9,0),new T.Vector3(.73,1.05,.2),.16,g,b);link(new T.Vector3(.73,1.05,.2),new T.Vector3(.16,.93,.55),.13,g,b);const hand=sphere(.12,.97,.59,.18,g,b);hand.scale.set(1,.4,.8);}else{link(new T.Vector3(-.52,1.9,0),new T.Vector3(-.78,1.5,.25),.16,g,b);link(new T.Vector3(-.78,1.5,.25),new T.Vector3(-.8,2.12,.44),.12,g,b);const hand=sphere(-.8,2.22,.45,.17,g,b);hand.scale.set(.72,1.25,.5);for(let finger=0;finger<4;finger++)cylinder(-.92+finger*.07,2.4,.45,.035,.23,g,b);}const eye=box(s*.145,2.59,.36,.15,.025,.025,shade,b);eye.rotation.z=s*.12;}
 sphere(0,2.52,.4,.065,g,b);const lips=sphere(0,2.36,.375,.08,shade,b);lips.scale.set(1,.2,.25);sphere(0,2.72,.39,.025,'#f9e9ad',b);
 for(let row=0;row<5;row++)for(let i=0;i<18;i++){const a=i*Math.PI/9,r=.38*Math.cos(row*.23);sphere(Math.sin(a)*r,2.85+row*.055,Math.cos(a)*r,.062,shade,b);}sphere(0,3.16,0,.15,g,b);
 const halo=add(new T.TorusGeometry(1.24,.045,10,72),g,0,2.2,-.55,b);for(let i=0;i<32;i++){const a=i*Math.PI/16;sphere(Math.sin(a)*1.25,2.2+Math.cos(a)*1.25,-.55,.035,g,b);}
 for(let i=0;i<11;i++){const fold=box(-.48+i*.09,1.3,.46,.018,.8,.015,shade,b);fold.rotation.z=-.35;}

 // Dark timber sanctuary, inspired by the supplied reference photograph.
 box(0,.075,-15,19.5,.12,14.4,'#2c2220');
 for(let x=-9.6;x<9.7;x+=.65){box(x,.141,-15,.025,.006,14.2,'#171314');for(let z=-21.5;z<-8;z+=2.8)box(x+.31,.143,z,.62,.005,.018,'#1d1717');}
 box(0,3.25,-22.02,19.3,6.2,.13,'#211918');
 for(const x of [-9.55,9.55]){box(x,3.3,-18.7,.12,6.3,6.8,'#33221e');for(let z=-21.5;z<-15.2;z+=.7)box(x,3.3,z,.15,6.2,.035,'#513328');}
 box(0,6.52,-15,19.6,.16,14.6,'#211a18');
 for(let x=-9;x<=9;x+=1.5)box(x,6.32,-15,.16,.22,14,'#402b24');
 // Painterly mural drawn as a local canvas texture: burgundy clouds, lotus mandala and two guardians.
 const canvas=document.createElement('canvas');canvas.width=2048;canvas.height=1024;const ctx=canvas.getContext('2d')!;
 ctx.fillStyle='#261c1c';ctx.fillRect(0,0,2048,1024);
 let seed=73;function rand(){seed=(seed*16807)%2147483647;return(seed-1)/2147483646;}
 for(let i=0;i<230;i++){ctx.beginPath();ctx.strokeStyle=i%2?'#59362e':'#48503c';ctx.lineWidth=3+rand()*7;const x=rand()*2048,y=rand()*1024;ctx.ellipse(x,y,30+rand()*80,10+rand()*25,-.4,0,Math.PI*1.8);ctx.stroke();}
 const cx=1024,cy=410;ctx.fillStyle='#325448';ctx.beginPath();ctx.arc(cx,cy,350,0,Math.PI*2);ctx.fill();
 for(let i=0;i<16;i++){const a=i*Math.PI/8;ctx.save();ctx.translate(cx+Math.cos(a)*260,cy+Math.sin(a)*260);ctx.rotate(a);ctx.fillStyle=i%2?'#997345':'#af8949';ctx.beginPath();ctx.ellipse(0,0,77,48,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#614631';ctx.lineWidth=5;ctx.stroke();ctx.restore();}
 for(const rad of [350,330,180,160]){ctx.beginPath();ctx.arc(cx,cy,rad,0,Math.PI*2);ctx.strokeStyle='#b28a4c';ctx.lineWidth=9;ctx.stroke();}
 function guardian(x:number){ctx.save();ctx.translate(x,0);ctx.strokeStyle='#b3a078';ctx.lineWidth=6;ctx.fillStyle='#555849';ctx.beginPath();ctx.moveTo(-35,340);ctx.bezierCurveTo(-130,490,-105,730,-170,820);ctx.quadraticCurveTo(0,890,170,820);ctx.bezierCurveTo(110,690,120,450,35,340);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#b39765';ctx.beginPath();ctx.ellipse(0,290,42,60,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#93794c';ctx.beginPath();ctx.ellipse(0,290,100,116,0,0,Math.PI*2);ctx.stroke();for(let i=-2;i<=2;i++){ctx.beginPath();ctx.moveTo(i*18,410);ctx.quadraticCurveTo(i*25,650,i*42,810);ctx.stroke();}ctx.restore();}
 guardian(350);guardian(1698);
 // Fine grain avoids a flat digital poster appearance.
 for(let i=0;i<17000;i++){ctx.fillStyle=i%2?'#ffffff08':'#00000018';ctx.fillRect(rand()*2048,rand()*1024,2,2);}
 const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;const mural=new T.Mesh(new T.PlaneGeometry(17.8,5.8),new T.MeshStandardMaterial({map:texture,roughness:1}));mural.position.set(0,3.4,-21.9);scene.add(mural);
 for(const x of [-9,9])box(x,3.4,-21.82,.13,5.9,.09,'#98723f');for(const y of [.48,6.32])box(0,y,-21.82,18.1,.12,.09,'#98723f');
 // Altar light emphasizes the golden Buddha while the timber hall stays subdued.
 const altarLight=new T.SpotLight('#ffdd98',55,13,.62,.6,1.4);altarLight.position.set(0,6.1,-16);altarLight.target.position.set(0,3,-19.7);scene.add(altarLight,altarLight.target);
 const hallFill=new T.PointLight('#ffecd0',20,20,1.3);hallFill.position.set(0,4.4,-9.5);scene.add(hallFill);
 for(const x of [-2.4,2.4]){const light=new T.PointLight('#ffd391',3,4,2);light.position.set(x,1.45,-18);scene.add(light);}
 // Carved altar front and offering tables.
 for(const x of [-2.2,-1.1,0,1.1,2.2]){box(x,.5,-17.96,.85,.45,.08,'#9a632d');const ring=add(new T.TorusGeometry(.14,.025,8,24),'#d8aa46',x,.5,-17.9);ring.rotation.z=Math.PI/4;}
 for(const x of [-2.3,2.3]){cylinder(x,1,-18,.2,.22,g);for(let i=0;i<7;i++){const flower=sphere(x+Math.sin(i*2.4)*.18,1.45+(i%3)*.12,-18+Math.cos(i*2.4)*.18,.14,i%2?'#dcaba2':'#f5d8bd');flower.scale.y=.6;cylinder(flower.position.x,1.2,flower.position.z,.012,.4,'#556b39');}}
 function burner(x:number,z:number,r:number){const bronze='#796143';cylinder(x,.55,z,r,.65,bronze,scene,r*.8);cylinder(x,.9,z,r*1.1,.12,'#b59a57');cylinder(x,.97,z,r*.88,.025,'#a29b81');for(const s of [-1,1]){const handle=add(new T.TorusGeometry(r*.4,.055,8,24),bronze,x+s*r, .65,z);handle.rotation.y=0;for(const zz of [-.25,.25])cylinder(x+s*r*.6,.23,z+zz,.07,.4,bronze);}for(const xx of [-.15,0,.15]){cylinder(x+xx,1.3,z,.013,.7,'#79452f');sphere(x+xx,1.66,z,.025,'#e58752');}solid(x,z,r*2.5,r*2.5);}
 burner(0,-16.1,.55);
 // Raised side rails, window lattices, column bands and exposed timber beams.
 for(const x of [-9.55,9.55])for(const z of [-20,-17]){box(x,2.3,z,.12,1.8,1.7,'#5a3826');for(let k=0;k<6;k++)box(x,2.3,z-.7+k*.28,.18,1.6,.045,'#c49a55');for(let k=0;k<5;k++)box(x,1.6+k*.32,z,.18,.045,1.5,'#c49a55');}
 for(const x of [-8.8,-4.4,4.4,8.8]){for(const y of [.5,3.8,4.15])cylinder(x,y,-8,.22,.09,g);box(x,3.25,-7.79,.24,.85,.05,'#b18a41');}
 for(const z of [-10,-13,-16,-19])box(0,6.35,z,19,.22,.25,'#291e1b');
 for(const x of [-20.8,20.8])for(let z=-24;z<26;z+=2){cylinder(x,.45,z,.13,.8,'#c5bba1');box(x,.75,z,.35,.12,.35,'#e1d5b6');if(z<24)box(x,.58,z+1,.13,.15,2,'#d4c7a9');}
 // Additional outdoor Bodhisattva, with crown, hands, staff and lotus pedestal.
 const q=new T.Group();q.position.set(10,0,6);scene.add(q);const ivory='#e7dfcb';lotus(0,.35,0,1.1,ivory,q);cylinder(0,1.55,0,.32,2,ivory,q,.68);sphere(0,2.9,0,.32,ivory,q);cylinder(0,3.23,0,.28,.22,'#c8a458',q,.22);
 for(let i=0;i<7;i++){const a=i*Math.PI*2/7;add(new T.ConeGeometry(.08,.3,10),'#c8a458',Math.sin(a)*.24,3.45,Math.cos(a)*.24,q);}
 for(const s of [-1,1]){link(new T.Vector3(s*.37,2.4,0),new T.Vector3(s*.55,1.85,.12),.13,ivory,q);link(new T.Vector3(s*.55,1.85,.12),new T.Vector3(s*.35,2,.42),.1,ivory,q);sphere(s*.35,2,.42,.11,ivory,q);}
 cylinder(.6,1.9,.2,.025,2.8,'#a58c4c',q);add(new T.TorusGeometry(.18,.025,8,32),'#a58c4c',.6,3.35,.2,q);
 for(let i=0;i<12;i++){const a=i*Math.PI/6;const fold=box(Math.sin(a)*.45,1.35,Math.cos(a)*.45,.025,1.3,.025,'#cec5b1',q);fold.rotation.z=Math.sin(a)*.12;}solid(10,6,2.4,2.4);
 // Low scripture desks, open books and cushions. Seat sits well behind desk collision.
 const desks=[];
 for(const {x,z} of SCRIPTURE_DESKS){box(x,.67,z-.9,1.7,.14,.85,'#6a402a');for(const s of [-1,1])box(x+s*.65,.4,z-.9,.12,.55,.65,'#573522');solid(x,z-.9,1.7,.85);box(x,.18,z+.55,1.2,.2,1,'#454641');
 for(const s of [-1,1]){const page=box(x+s*.22,.77,z-.9,.44,.025,.6,'#f2e4bc');page.rotation.z=-s*.10;for(let j=0;j<8;j++)box(x+s*.22,.793,z-1.12+j*.06,.32,.006,.008,'#8e7961');}cylinder(x+.65,.82,z-.7,.08,.14,'#b9ac87');desks.push({x,z:z+.55,radius:1.2,label:'Bàn đọc kinh · E để ngồi đọc',action:'meditate' as const,kind:'scripture'});}

 // All 18 meditation cushions remain free for real players in the next milestone.
 // Small wooden-fish table near the altar; animated instrument is added after static batching.
 box(-3.1,.63,-15.8,1.3,.16,1,'#593b29');for(const x of [-3.6,-2.6])box(x,.35,-15.8,.12,.6,.65,'#432c20');solid(-3.1,-15.8,1.3,1);
 return {desks,statue:{x:10,z:8,radius:1.6,label:'Bồ Tát · E để chắp tay',action:'palms' as const}};
}
