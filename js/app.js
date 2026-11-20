const $=id=>document.getElementById(id);

// Dados guardados no navegador (localStorage)
let leads=JSON.parse(localStorage.getItem('glosilyservice_leads')||'[]');
let settings=JSON.parse(localStorage.getItem('glosilyservice_settings')||'{"wa":"","email":""}');
const persist=()=>localStorage.setItem('glosilyservice_leads',JSON.stringify(leads));
const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

$('year').textContent=new Date().getFullYear();
$('settingWa').value=settings.wa;
$('settingEmail').value=settings.email;

function toast(msg){
  $('toast').textContent=msg;
  $('toast').style.display='block';
  setTimeout(()=>$('toast').style.display='none',2600);
}

function selectProduct(p){
  $('product').value=p;
  $('contacto').scrollIntoView({behavior:'smooth'});
}

// Formulário público de pedido
$('leadForm').addEventListener('submit',e=>{
  e.preventDefault();
  const lead={
    id:Date.now(),
    name:$('name').value.trim(),
    phone:$('phone').value.trim(),
    email:$('email').value.trim(),
    product:$('product').value,
    qty:$('quantity').value,
    notes:$('message').value.trim(),
    channel:$('channel').value,
    status:'Novo',
    date:new Date().toISOString()
  };
  leads.unshift(lead);
  persist();
  $('leadForm').reset();
  $('successMsg').style.display='block';
  setTimeout(()=>$('successMsg').style.display='none',6000);
});

// Área de gestão
function openAdmin(){$('admin').classList.add('show');renderLeads();updateStats()}
function closeAdmin(){$('admin').classList.remove('show')}

function showTab(tab,btn){
  ['Leads','Overview','Settings'].forEach(x=>$('tab'+x).style.display='none');
  $('tab'+tab[0].toUpperCase()+tab.slice(1)).style.display='block';
  document.querySelectorAll('.sidebtn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  $('adminTitle').textContent=tab==='leads'?'Clientes e pedidos':tab==='overview'?'Visão geral':'Configurações';
  if(tab==='overview')renderOverview();
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
  $('leadRows').innerHTML=data.length?data.map(x=>`<tr><td><b>${esc(x.name)}</b><br><span style="color:#87918a">${esc(x.email||'Sem e-mail')}</span></td><td>${esc(x.product)}</td><td>${esc(x.phone)}</td><td><span class="status ${esc(x.status)}">${esc(x.status)}</span></td><td>${new Date(x.date).toLocaleDateString('pt-PT')}</td><td><div class="row-actions"><button class="iconbtn" onclick="editLead(${x.id})">Editar</button><button class="iconbtn" onclick="routeLead(${x.id})">Contactar</button></div></td></tr>`).join(''):'<tr><td colspan="6" class="empty">Ainda não existem clientes com estes critérios.</td></tr>';
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
  $('crmQty').value=x.qty||'';
  $('crmStatus').value=x.status;
  $('crmNotes').value=x.notes||'';
  $('modalTitle').textContent='Editar cliente';
  $('leadModal').classList.add('show');
}

$('crmForm').addEventListener('submit',e=>{
  e.preventDefault();
  const id=Number($('editId').value);
  const old=leads.find(x=>x.id===id);
  const item={
    id:id||Date.now(),
    name:$('crmName').value.trim(),
    phone:$('crmPhone').value.trim(),
    email:$('crmEmail').value.trim(),
    product:$('crmProduct').value.trim(),
    qty:$('crmQty').value,
    status:$('crmStatus').value,
    notes:$('crmNotes').value,
    date:old?.date||new Date().toISOString(),
    updated:new Date().toISOString()
  };
  if(id)leads=leads.map(x=>x.id===id?item:x);else leads.unshift(item);
  persist();
  closeLeadModal();
  renderLeads();
  toast('Cliente guardado com sucesso.');
});

// Encaminhamento por WhatsApp ou e-mail
function routeLead(id){
  const x=leads.find(l=>l.id===id);
  if(!x)return;
  const msg=`Olá ${x.name}, recebemos o seu pedido de ${x.product}${x.qty?' ('+x.qty+')':''}. Gostaríamos de dar seguimento ao seu atendimento.`;
  const wa=settings.wa||x.phone.replace(/\D/g,'');
  const email=settings.email||x.email;
  if(wa){
    window.open(`https://wa.me/${wa}?text=${encodeURIComponent(msg)}`,'_blank');
  }else if(email){
    window.location.href=`mailto:${email}?subject=${encodeURIComponent('Seguimento do pedido — '+x.name)}&body=${encodeURIComponent(msg)}`;
  }else{
    toast('Configure o WhatsApp ou e-mail nas configurações.');
    return;
  }
  if(x.status==='Novo'){x.status='Contactado';persist();renderLeads()}
}

function saveSettings(){
  settings={wa:$('settingWa').value.replace(/\D/g,''),email:$('settingEmail').value.trim()};
  localStorage.setItem('glosilyservice_settings',JSON.stringify(settings));
  toast('Configurações guardadas.');
}

function renderOverview(){
  const count=s=>leads.filter(x=>x.status===s).length;
  $('overviewText').innerHTML=`<div class="stats" style="margin-top:20px"><div class="stat"><span>Contactados</span><strong>${count('Contactado')}</strong></div><div class="stat"><span>Qualificados</span><strong>${count('Qualificado')}</strong></div><div class="stat"><span>Fechados</span><strong>${count('Fechado')}</strong></div><div class="stat"><span>Perdidos</span><strong>${count('Perdido')}</strong></div></div><p style="font-size:12px;color:#68736f">Dica operacional: registe sempre o resultado do contacto nas notas e actualize o estado para manter o pipeline fiável.</p>`;
}
