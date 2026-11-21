// Catálogo com filtros, detalhes, estimativa de preço, testemunhos e FAQ (dados em js/content.js).
(()=>{
const C=window.GLOSILY_CONTENT||{},P=C.products||[],$=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const en=()=>document.documentElement.lang==='en';
const L=(o,k)=>(en()&&o.en&&o.en[k])||o[k]||'';
const money=n=>String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g,' ')+' '+(C.currency||'MT');
let cat='';
const sel=$('product');
if(sel)P.forEach(p=>{if(![...sel.options].some(o=>o.value===p.name))sel.add(new Option(p.name,p.name),sel.options.length-1)});
const QTY={'1 unidade':[1,1],'2 a 5 unidades':[2,5],'6 a 20 unidades':[6,20],'Mais de 20 unidades':[21,null]};
function estimate(){
  const el=$('estimate');if(!el||!sel)return;
  const p=P.find(x=>x.name===sel.value),q=QTY[$('quantity').value];
  if(!p||!p.from||!q){el.hidden=true;return}
  const lo=p.from*q[0],hi=q[1]?(p.to||p.from)*q[1]:null;
  el.textContent=(en()?'Indicative estimate: ':'Estimativa indicativa: ')+(hi?(lo===hi?money(lo):money(lo)+' – '+money(hi)):(en()?'from ':'a partir de ')+money(lo))+(en()?'. Final price confirmed in the quote.':'. O valor final é confirmado na cotação.');
  el.hidden=false;
}
function quote(p,color){
  window.selectProduct&&selectProduct(p.name);
  const m=$('message');if(color&&m&&!m.value)m.value=(en()?'Preferred colour: ':'Cor preferida: ')+color;
  estimate();
}
function draw(){
  const box=$('catalog');if(!box||!P.length)return;
  const cats=[...new Set(P.map(p=>p.cat))],f=$('filters');
  if(f){f.hidden=cats.length<2;f.innerHTML=['',...cats].map(c=>`<button type="button" class="chip${c===cat?' on':''}" data-c="${esc(c)}">${c?esc(L(P.find(p=>p.cat===c),'cat')):(en()?'All':'Todos')}</button>`).join('')}
  box.innerHTML=P.filter(p=>!cat||p.cat===cat).map(p=>{
    const art=p.img?`<div class="product-art"><img src="${esc(p.img)}" alt="${esc(L(p,'name'))}" loading="lazy"></div>`:`<div class="product-art ${esc(p.art||'')}"><div class="mini-bag ${p.art?esc(p.art)+'-bag':''}"></div></div>`;
    const price=p.from?(en()?'From ':'A partir de ')+money(p.from):(en()?'On request':'Sob cotação');
    return `<article class="product">${art}<div class="product-info"><h3>${esc(L(p,'name'))}</h3><p>${esc(L(p,'desc'))}</p><div class="product-bottom"><span class="price">${price}</span><span class="pbtns"><button type="button" class="small-btn" data-d="${esc(p.id)}">${en()?'Details':'Detalhes'}</button><button type="button" class="small-btn" data-q="${esc(p.id)}">${en()?'I\'m interested ↗':'Tenho interesse ↗'}</button></span></div></div></article>`}).join('');
  const T=C.testimonials||[],qs=$('provas');
  if(qs){qs.hidden=!T.length;$('quotes').innerHTML=T.map(t=>`<figure class="quote"><blockquote>“${esc(L(t,'text'))}”</blockquote><figcaption><b>${esc(t.name)}</b>${t.role?' · '+esc(t.role):''}</figcaption></figure>`).join('')}
  const fq=$('faqList');if(fq)fq.innerHTML=(C.faq||[]).map(x=>`<details><summary>${esc(L(x,'q'))}</summary><p>${esc(L(x,'a'))}</p></details>`).join('');
}
function openDlg(p){
  const d=$('pDlg');if(!d||!d.showModal)return quote(p);
  let col='';
  const body=()=>{$('pBody').innerHTML=`<h3>${esc(L(p,'name'))}</h3><p>${esc(L(p,'desc'))}</p>`
    +(p.features&&p.features.length?`<ul>${p.features.map(f=>`<li>${esc(f)}</li>`).join('')}</ul>`:'')
    +(p.colors&&p.colors.length?`<div class="cols">${p.colors.map(c=>`<button type="button" class="chip${c===col?' on':''}" data-col="${esc(c)}">${esc(c)}</button>`).join('')}</div>`:'')
    +`<p class="price">${p.from?(en()?'From ':'A partir de ')+money(p.from):(en()?'Price on request':'Preço sob cotação')}</p><button type="button" class="btn" data-go>${en()?'Request a quote':'Pedir cotação'}</button>`};
  body();
  $('pBody').onclick=e=>{const c=e.target.closest('[data-col]');if(c){col=c.dataset.col;body();return}if(e.target.closest('[data-go]')){d.close();quote(p,col)}};
  window.track&&track('product_view',p.id);
  d.showModal();
}
document.addEventListener('click',e=>{
  const f=e.target.closest('#filters .chip');if(f){cat=f.dataset.c;draw();return}
  const d=e.target.closest('[data-d]'),q=e.target.closest('[data-q]');
  if(d)openDlg(P.find(p=>p.id===d.dataset.d));else if(q)quote(P.find(p=>p.id===q.dataset.q));
});
const dlg=$('pDlg');if(dlg)dlg.addEventListener('click',e=>{if(e.target===dlg||e.target.closest('.x'))dlg.close()});
if(sel){sel.addEventListener('change',estimate);$('quantity').addEventListener('change',estimate)}
document.addEventListener('glosily:lang',()=>{draw();estimate()});
draw();
})();
