const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

// ---------------------------------------------------------------------------
// Supabase
// ---------------------------------------------------------------------------
const CFG=window.GLOSILY_CONFIG||{};
const configured=!!(CFG.SUPABASE_URL&&CFG.SUPABASE_ANON_KEY&&window.supabase);
const db=configured?window.supabase.createClient(CFG.SUPABASE_URL,CFG.SUPABASE_ANON_KEY,{auth:{persistSession:true,autoRefreshToken:true}}):null;

let leads=[];
let settings={whatsapp:'',email:''};

$('year').textContent=new Date().getFullYear();

function toast(msg){
  $('toast').textContent=msg;
  $('toast').style.display='block';
  clearTimeout(toast.t);
  toast.t=setTimeout(()=>$('toast').style.display='none',3200);
}
function showError(el,msg){el.textContent=msg;el.style.display=msg?'block':'none'}
function notConfigured(){return !db&&(toast('Serviço indisponível: base de dados não configurada.'),true)}

// ---------------------------------------------------------------------------
// Site público
// ---------------------------------------------------------------------------
function selectProduct(p){
  $('product').value=p;
  $('contacto').scrollIntoView({behavior:'smooth'});
}

async function loadPublicSettings(){
  if(!db)return;
  const {data}=await db.from('settings').select('whatsapp,email').eq('id',true).maybeSingle();
  if(!data)return;
  settings={whatsapp:data.whatsapp||'',email:data.email||''};
  if(settings.whatsapp){
    const a=$('waFloat');
    a.href=`https://wa.me/${settings.whatsapp}?text=${encodeURIComponent('Olá! Gostaria de pedir uma cotação.')}`;
    a.hidden=false;
  }
}

const CODE_ALPHA='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function newCode(){const a=new Uint8Array(6);crypto.getRandomValues(a);return 'GLS-'+[...a].map(n=>CODE_ALPHA[n%32]).join('')}
let lastSubmit=0;
// Acompanhamento de pedido (código + 4 últimos dígitos do telefone)
const STAGES=['Pedido recebido','Cotação enviada','Confirmado','Em trânsito','Desalfandegamento','Pronto para levantar','Entregue'];
let lastTrack=0;
$('trackForm').addEventListener('submit',async e=>{
  e.preventDefault();
  showError($('trackError'),'');$('trackResult').hidden=true;
  if(notConfigured())return;
  if(Date.now()-lastTrack<3000)return;
  lastTrack=Date.now();
  const {data,error}=await db.rpc('track_order',{p_code:$('trackCode').value.trim(),p_phone4:$('trackPhone').value.trim()});
  if(error){showError($('trackError'),'Não foi possível consultar agora. Tente novamente em instantes.');return}
  const d=Array.isArray(data)?data[0]:data;
  if(!d){showError($('trackError'),'Não encontrámos nenhum pedido com esses dados. Confirme o código e os 4 últimos dígitos do telefone.');return}
  const i=STAGES.indexOf(d.stage),fmt=t=>new Date(t).toLocaleDateString('pt-PT');
  $('trackResult').innerHTML=`<div class="tr-head"><b>${esc(d.product)}</b><span>Pedido de ${fmt(d.created_at)} · actualizado a ${fmt(d.updated_at)}</span></div>`
    +(d.stage==='Cancelado'?'<p class="tr-note">Este pedido foi cancelado. Contacte-nos para mais informação.</p>'
      :`<ol class="tl">${STAGES.map((s,k)=>`<li class="${k<i?'done':k===i?'now':''}"><i></i><span>${s}</span></li>`).join('')}</ol>`)
    +(d.public_note?`<p class="tr-note">${esc(d.public_note)}</p>`:'');
  $('trackResult').hidden=false;
});
$('leadForm').addEventListener('submit',async e=>{
  e.preventDefault();
  showError($('errorMsg'),'');
  if($('website').value)return;                       // honeypot: bots preenchem este campo
  if(notConfigured())return;
  if(Date.now()-lastSubmit<15000){showError($('errorMsg'),'Aguarde alguns segundos antes de enviar novamente.');return}
  const btn=$('submitBtn');
  btn.disabled=true;
  const row={
    name:$('name').value.trim(),
    phone:$('phone').value.trim(),
    email:$('email').value.trim()||null,
    product:$('product').value,
    quantity:$('quantity').value,
    message:$('message').value.trim()||null,
    channel:$('channel').value
  };
  let code=newCode();
  let {error}=await db.from('leads').insert({...row,track_code:code});
  if(error&&error.code==='23505'){code=newCode();({error}=await db.from('leads').insert({...row,track_code:code}))}
  if(error&&/track_code|column/i.test(error.message||'')){code=null;({error}=await db.from('leads').insert(row))}   // base ainda sem a migração de acompanhamento
  btn.disabled=false;
  if(error){showError($('errorMsg'),'Não foi possível enviar o pedido. Tente novamente ou contacte-nos por WhatsApp.');return}
  lastSubmit=Date.now();
  $('leadForm').reset();
  const ok=$('successMsg');
  ok.textContent=code?`Pedido registado. O seu código é ${code}. Guarde-o: com os últimos 4 dígitos do seu telefone, permite acompanhar o pedido.`:'Pedido registado. A nossa equipa poderá dar seguimento pelo canal escolhido.';
  ok.style.display='block';
  if(code)$('trackCode').value=code;
  setTimeout(()=>ok.style.display='none',code?45000:6000);
});

// ---------------------------------------------------------------------------
// Autenticação da equipa
// ---------------------------------------------------------------------------
async function isStaff(){
  const {data:{user}}=await db.auth.getUser();
  if(!user)return false;
  const {data}=await db.from('staff').select('user_id').eq('user_id',user.id).maybeSingle();
  return !!data;
}

async function openAdmin(){
  if(notConfigured())return;
  const {data:{session}}=await db.auth.getSession();
  if(session&&await isStaff()){enterAdmin();return}
  if(session)await db.auth.signOut();
  showError($('loginError'),'');
  $('loginModal').classList.add('show');
}
function closeLogin(){$('loginModal').classList.remove('show')}

$('loginForm').addEventListener('submit',async e=>{
  e.preventDefault();
  showError($('loginError'),'');
  $('loginBtn').disabled=true;
  const {error}=await db.auth.signInWithPassword({email:$('loginEmail').value.trim(),password:$('loginPass').value});
  $('loginBtn').disabled=false;
  if(error){showError($('loginError'),'E-mail ou palavra-passe incorrectos.');return}
  if(!await isStaff()){
    await db.auth.signOut();
    showError($('loginError'),'Esta conta não tem acesso à gestão.');
    return;
  }
  $('loginForm').reset();
  closeLogin();
  enterAdmin();
});

async function enterAdmin(){
  $('admin').classList.add('show');
  await Promise.all([loadLeads(),loadAdminSettings()]);
}
function closeAdmin(){$('admin').classList.remove('show')}
async function logout(){
  await db.auth.signOut();
  leads=[];
  closeAdmin();
  toast('Sessão terminada.');
}
if(db)db.auth.onAuthStateChange(ev=>{if(ev==='SIGNED_OUT')closeAdmin()});

// ---------------------------------------------------------------------------
// Área de gestão
// ---------------------------------------------------------------------------
function showTab(tab,btn){
  ['Leads','Overview','Settings'].forEach(x=>$('tab'+x).style.display='none');
  $('tab'+tab[0].toUpperCase()+tab.slice(1)).style.display='block';
  document.querySelectorAll('.sidebtn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  $('adminTitle').textContent=tab==='leads'?'Clientes e pedidos':tab==='overview'?'Visão geral':'Configurações';
  if(tab==='overview')renderOverview();
}

async function loadLeads(){
  const {data,error}=await db.from('leads').select('*').order('created_at',{ascending:false}).limit(1000);
  if(error){toast('Erro ao carregar clientes.');return}
  leads=data;
  renderLeads();
}

function updateStats(){
  $('statTotal').textContent=leads.length;
  $('statNew').textContent=leads.filter(x=>x.status==='Novo').length;
  $('statActive').textContent=leads.filter(x=>['Contactado','Qualificado'].includes(x.status)).length;
  $('statWon').textContent=leads.filter(x=>x.status==='Fechado').length;
}

function renderLeads(){
  const q=($('search')?.value||'').toLowerCase(),st=$('filterStatus')?.value||'';
  const data=leads.filter(x=>(!st||x.status===st)&&[x.name,x.phone,x.email,x.product].join(' ').toLowerCase().includes(q));
  $('leadRows').innerHTML=data.length?data.map(x=>`<tr><td><b>${esc(x.name)}</b><br><span style="color:#87918a">${esc(x.email||'Sem e-mail')}</span><br><span style=\"color:#87918a;font-size:11px\">${esc(x.track_code||'')}</span></td><td>${esc(x.product)}${x.quantity?`<br><span style="color:#87918a">${esc(x.quantity)}</span>`:''}</td><td>${esc(x.phone)}</td><td><span class="status ${esc(x.status)}">${esc(x.status)}</span></td><td>${new Date(x.created_at).toLocaleDateString('pt-PT')}</td><td><div class="row-actions"><button class="iconbtn" onclick="editLead('${esc(x.id)}')">Editar</button><button class="iconbtn" onclick="routeLead('${esc(x.id)}')">Contactar</button><button class="iconbtn" onclick="deleteLead('${esc(x.id)}')">Apagar</button></div></td></tr>`).join(''):'<tr><td colspan="6" class="empty">Ainda não existem clientes com estes critérios.</td></tr>';
  updateStats();
}

function openLeadModal(){
  $('crmForm').reset();
  $('editId').value='';
  $('modalTitle').textContent='Novo cliente';
  $('leadModal').classList.add('show');
}
function closeLeadModal(){$('leadModal').classList.remove('show')}

function editLead(id){
  const x=leads.find(l=>l.id===id);
  if(!x)return;
  $('editId').value=x.id;
  $('crmName').value=x.name;
  $('crmPhone').value=x.phone;
  $('crmEmail').value=x.email||'';
  $('crmProduct').value=x.product;
  $('crmQty').value=x.quantity||'';
  $('crmStatus').value=x.status;
  $('crmNotes').value=x.notes||'';
  $('crmStage').value=x.stage||'Pedido recebido';
  $('crmPublic').value=x.public_note||'';
  $('modalTitle').textContent='Editar cliente';
  $('leadModal').classList.add('show');
}

$('crmForm').addEventListener('submit',async e=>{
  e.preventDefault();
  const id=$('editId').value;
  const row={
    name:$('crmName').value.trim(),
    phone:$('crmPhone').value.trim(),
    email:$('crmEmail').value.trim()||null,
    product:$('crmProduct').value.trim(),
    quantity:$('crmQty').value.trim()||null,
    status:$('crmStatus').value,
    notes:$('crmNotes').value.trim()||null,
    stage:$('crmStage').value,
    public_note:$('crmPublic').value.trim()||null
  };
  const {error}=id?await db.from('leads').update(row).eq('id',id):await db.from('leads').insert({...row,source:'manual'});
  if(error){toast('Erro ao guardar o cliente.');return}
  closeLeadModal();
  await loadLeads();
  toast('Cliente guardado com sucesso.');
});

async function deleteLead(id){
  const x=leads.find(l=>l.id===id);
  if(!x||!confirm(`Apagar o cliente "${x.name}"? Esta acção não pode ser desfeita.`))return;
  const {error}=await db.from('leads').delete().eq('id',id);
  if(error){toast('Erro ao apagar o cliente.');return}
  await loadLeads();
  toast('Cliente apagado.');
}

// Encaminhamento por WhatsApp ou e-mail (para o cliente)
async function routeLead(id){
  const x=leads.find(l=>l.id===id);
  if(!x)return;
  const msg=`Olá ${x.name}, recebemos o seu pedido de ${x.product}${x.quantity?' ('+x.quantity+')':''}. Gostaríamos de dar seguimento ao seu atendimento.`;
  const prefersEmail=x.channel==='E-mail'&&x.email;
  const digits=x.phone.replace(/\D/g,'');
  if(prefersEmail){
    window.location.href=`mailto:${x.email}?subject=${encodeURIComponent('Seguimento do seu pedido — GlosilyService')}&body=${encodeURIComponent(msg)}`;
  }else if(digits){
    window.open(`https://wa.me/${digits}?text=${encodeURIComponent(msg)}`,'_blank','noopener');
  }else{toast('Este cliente não tem contacto válido.');return}
  if(x.status==='Novo'){
    const {error}=await db.from('leads').update({status:'Contactado'}).eq('id',id);
    if(!error)await loadLeads();
  }
}

// Configurações da empresa
async function loadAdminSettings(){
  await loadPublicSettings();
  $('settingWa').value=settings.whatsapp;
  $('settingEmail').value=settings.email;
}
async function saveSettings(){
  const whatsapp=$('settingWa').value.replace(/\D/g,'');
  const email=$('settingEmail').value.trim();
  const {error}=await db.from('settings').update({whatsapp,email}).eq('id',true);
  if(error){toast('Erro ao guardar as configurações.');return}
  settings={whatsapp,email};
  await loadPublicSettings();
  toast('Configurações guardadas.');
}

function renderOverview(){
  const count=s=>leads.filter(x=>x.status===s).length;
  $('overviewText').innerHTML=`<div class="stats" style="margin-top:20px"><div class="stat"><span>Contactados</span><strong>${count('Contactado')}</strong></div><div class="stat"><span>Qualificados</span><strong>${count('Qualificado')}</strong></div><div class="stat"><span>Fechados</span><strong>${count('Fechado')}</strong></div><div class="stat"><span>Perdidos</span><strong>${count('Perdido')}</strong></div></div><p style="font-size:12px;color:#68736f">Dica operacional: registe sempre o resultado do contacto nas notas e actualize o estado para manter o pipeline fiável.</p>`;
}

loadPublicSettings();
