// Efeitos visuais: mochila 3D (three.js), inclinação 3D dos cartões e revelação ao rolar.
(()=>{
const rm=matchMedia('(prefers-reduced-motion: reduce)').matches;
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.15});
document.querySelectorAll('.section-head,.step,.lead-grid>div').forEach(el=>{el.classList.add('rv');io.observe(el)});
if(matchMedia('(pointer:fine)').matches&&!rm)document.querySelectorAll('.product').forEach(el=>{
  el.addEventListener('pointermove',e=>{const b=el.getBoundingClientRect(),x=(e.clientX-b.left)/b.width-.5,y=(e.clientY-b.top)/b.height-.5;el.style.setProperty('--ry',x*14+'deg');el.style.setProperty('--rx',-y*14+'deg')});
  el.addEventListener('pointerleave',()=>{el.style.setProperty('--rx','0deg');el.style.setProperty('--ry','0deg')});
});
const cv=document.getElementById('gl');if(!cv||!window.THREE)return;
let R;try{R=new THREE.WebGLRenderer({canvas:cv,antialias:true,alpha:true})}catch(e){cv.remove();return}
R.setPixelRatio(Math.min(devicePixelRatio,2));
const S=new THREE.Scene(),C=new THREE.PerspectiveCamera(34,1,.1,60);
S.add(new THREE.HemisphereLight(0xd8e4e0,0x0b1413,1));
const key=new THREE.DirectionalLight(0xffffff,1.3);key.position.set(3,5,6);S.add(key);
const rim=new THREE.PointLight(0xd19a68,3,25);rim.position.set(-4,1,-3);S.add(rim);
const rr=(w,h,q)=>{const s=new THREE.Shape(),x=w/2,y=h/2;s.moveTo(-x+q,-y);s.lineTo(x-q,-y);s.quadraticCurveTo(x,-y,x,-y+q);s.lineTo(x,y-q);s.quadraticCurveTo(x,y,x-q,y);s.lineTo(-x+q,y);s.quadraticCurveTo(-x,y,-x,y-q);s.lineTo(-x,-y+q);s.quadraticCurveTo(-x,-y,-x+q,-y);return s};
const part=(w,h,q,d,col,x,y,z)=>{const g=new THREE.ExtrudeGeometry(rr(w,h,q),{depth:d,bevelThickness:.14,bevelSize:.14,bevelSegments:6,curveSegments:20});g.center();const m=new THREE.Mesh(g,new THREE.MeshStandardMaterial({color:col,roughness:.6,metalness:.08}));m.position.set(x,y,z);return m};
const bag=new THREE.Group();
bag.add(part(2,2.7,.75,1,0x24403b,0,0,0),part(1.5,1.1,.4,.25,0x31574f,0,-.75,.62),part(.5,1.2,.25,.45,0x1c332f,-1.15,-.7,.05),part(.5,1.2,.25,.45,0x1c332f,1.15,-.7,.05));
const cuM=new THREE.MeshStandardMaterial({color:0xd19a68,roughness:.3,metalness:.8});
const handle=new THREE.Mesh(new THREE.TorusGeometry(.38,.07,14,28,Math.PI),cuM);handle.position.set(0,1.55,0);bag.add(handle);
const zip=new THREE.Mesh(new THREE.BoxGeometry(1.3,.04,.05),cuM);zip.position.set(0,-.3,.8);bag.add(zip);
const cn=document.createElement('canvas');cn.width=256;cn.height=64;const cx=cn.getContext('2d');cx.fillStyle='#d19a68';cx.fillRect(0,0,256,64);cx.fillStyle='#101716';cx.font='600 28px sans-serif';cx.textAlign='center';cx.fillText('GLOSILY',128,42);
const tag=new THREE.Mesh(new THREE.PlaneGeometry(.7,.175),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(cn)}));tag.position.set(0,-.95,.82);bag.add(tag);
const G=new THREE.Group();G.add(bag);S.add(G);
const ring=(r,o)=>{const m=new THREE.Mesh(new THREE.TorusGeometry(r,.012,8,120),new THREE.MeshBasicMaterial({color:0xd8e4e0,transparent:true,opacity:o}));m.rotation.x=Math.PI/2;m.position.y=-1.9;S.add(m);return m};
const r1=ring(2.1,.5),r2=ring(2.9,.22);
const N=180,pp=new Float32Array(N*3);for(let i=0;i<N*3;i++)pp[i]=(Math.random()-.5)*(i%3==1?9:14);
const pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.BufferAttribute(pp,3));
const pts=new THREE.Points(pg,new THREE.PointsMaterial({color:0xd8e4e0,size:.045,transparent:true,opacity:.6}));S.add(pts);
const hero=cv.parentElement;let mx=0,my=0,vis=true;
addEventListener('pointermove',e=>{mx=e.clientX/innerWidth-.5;my=e.clientY/innerHeight-.5});
const size=()=>{const w=hero.clientWidth,h=hero.clientHeight;R.setSize(w,h,false);C.aspect=w/h;C.position.set(0,.4,10+Math.max(0,1-C.aspect)*7);C.lookAt(0,-.2,0);C.updateProjectionMatrix();G.position.y=w/h<1?-1.9:-1.25;draw()};
const clock=new THREE.Clock();
function draw(){const t=clock.getElapsedTime(),p=Math.min(scrollY/hero.clientHeight,1);
  bag.rotation.y=t*.45+mx*1.2+p*3;bag.rotation.x=my*.25;bag.position.y=Math.sin(t*1.2)*.12;
  G.scale.setScalar(1.15-p*.35);r1.scale.setScalar(1+Math.sin(t)*.03);r2.rotation.z=t*.1;pts.rotation.y=t*.03;R.render(S,C)}
new ResizeObserver(size).observe(hero);
new IntersectionObserver(e=>vis=e[0].isIntersecting).observe(hero);
if(!rm)(function loop(){requestAnimationFrame(loop);if(vis&&!document.hidden)draw()})();
addEventListener('scroll',()=>{if(rm)draw()},{passive:true});
})();
