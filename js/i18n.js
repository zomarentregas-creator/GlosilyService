// Idioma (PT/EN), modo claro/escuro e efeitos 3D. Preferências guardadas no próprio navegador.
(()=>{
const D={
'Saltar para o conteúdo':'Skip to content','Acompanhar pedido':'Track order','Área de gestão ↗':'Admin area ↗','Solicitar cotação':'Request a quote',
'O produto certo. Do mundo até si.':'The right product. From the world to you.','Importação simplificada, do pedido à entrega.':'Simplified importing, from request to delivery.',
'Mochilas, pastas e acessórios de qualidade. Tratamos da importação e acompanhamos o seu pedido.':'Quality backpacks, folders and accessories. We handle the import and follow your order.',
'Pedir uma cotação':'Ask for a quote','Explorar produtos':'Explore products','Urbana':'Urban','Dia-a-dia e estudo':'Everyday and study','Executiva':'Executive','Portátil e documentos':'Laptop and documents','Pastas':'Folders','Organizar e transportar':'Organise and carry',
'Catálogo em destaque':'Featured catalogue','Escolha o que precisa.':'Choose what you need.','Estes são exemplos de produtos. Envie-nos o modelo, quantidade ou referência que procura para receber uma cotação personalizada.':'These are sample products. Send us the model, quantity or reference you are looking for to get a personalised quote.',
'Mochila urbana':'Urban backpack','Mochila executiva':'Executive backpack','Pastas e acessórios':'Folders and accessories','Outro produto / pedido personalizado':'Other product / custom request',
'Processo simples':'Simple process','Da pesquisa à entrega.':'From search to delivery.','Um processo acompanhado pela nossa equipa, com comunicação clara em cada etapa.':'A process guided by our team, with clear communication at every step.',
'Conte-nos o que procura':'Tell us what you need','Indique o produto, modelo, quantidade e quaisquer referências que tenha.':'Give us the product, model, quantity and any references you have.',
'Receba a sua cotação':'Get your quote','Analisamos o pedido e entramos em contacto com preço estimado, prazo e condições.':'We review the request and get back to you with estimated price, lead time and terms.',
'Acompanhe o pedido':'Follow your order','Após a confirmação, mantemos comunicação sobre o progresso da importação.':'After confirmation, we keep you updated on the progress of the import.',
'Acompanhamento':'Tracking','Onde está o seu pedido?':'Where is your order?','Introduza o código recebido ao fazer o pedido e os 4 últimos dígitos do seu telefone.':'Enter the code you received when ordering and the last 4 digits of your phone.',
'Código do pedido':'Order code','Últimos 4 dígitos do telefone':'Last 4 digits of your phone','Últimos 4 dígitos do telefone ':'Last 4 digits of your phone','Consultar':'Check',
'Opiniões':'Reviews','Quem já pediu connosco.':'Those who already ordered with us.','Perguntas frequentes':'FAQ','Tire as suas dúvidas.':'Get your questions answered.','Não encontrou a resposta? Escreva-nos pelo formulário ou pelo WhatsApp.':'Did not find the answer? Write to us through the form or WhatsApp.',
'Vamos conversar':'Let\'s talk','Tem um produto em mente?':'Have a product in mind?','Preencha o formulário. A nossa equipa recebe o seu pedido, organiza as informações e dá seguimento pelo canal mais conveniente.':'Fill in the form. Our team receives your request, organises the details and follows up through the most convenient channel.',
'Também pode pedir produtos que não estejam no catálogo.':'You can also request products that are not in the catalogue.','Solicitar atendimento':'Request assistance',
'Pedido registado. A nossa equipa poderá dar seguimento pelo canal escolhido.':'Request registered. Our team can follow up through the chosen channel.',
'Nome completo *':'Full name *','Como se chama?':'What is your name?','WhatsApp / telefone *':'WhatsApp / phone *','E-mail':'E-mail','Produto de interesse *':'Product of interest *','Seleccione uma opção':'Select an option',
'Quantidade estimada':'Estimated quantity','1 unidade':'1 unit','2 a 5 unidades':'2 to 5 units','6 a 20 unidades':'6 to 20 units','Mais de 20 unidades':'More than 20 units','Ainda não definido':'Not defined yet',
'Detalhes do pedido':'Request details','Modelo, cor, orçamento, link de referência...':'Model, colour, budget, reference link...','Como prefere ser contactado?':'How would you like to be contacted?',
'Enviar pedido':'Send request','Ao enviar, autoriza a nossa equipa a utilizar os dados fornecidos exclusivamente para responder ao seu pedido.':'By sending, you allow our team to use the data provided only to answer your request.',
'Todos os direitos reservados.':'All rights reserved.','Importação · Atendimento · Acompanhamento':'Import · Support · Tracking','Falar no WhatsApp':'Chat on WhatsApp',
'Mudar idioma':'Change language','Alternar modo claro/escuro':'Toggle light/dark mode','Ligar ou desligar efeitos 3D':'Turn 3D effects on or off','Preferências':'Preferences',
// mensagens e fases (JS)
'Aguarde alguns segundos antes de enviar novamente.':'Please wait a few seconds before sending again.','Não foi possível enviar o pedido. Tente novamente ou contacte-nos por WhatsApp.':'We could not send the request. Try again or contact us on WhatsApp.',
'Pedido registado. O seu código é ':'Request registered. Your code is ','. Guarde-o: com os últimos 4 dígitos do seu telefone, permite acompanhar o pedido.':'. Keep it: with the last 4 digits of your phone, it lets you track the order.',
'Não foi possível consultar agora. Tente novamente em instantes.':'We could not check right now. Please try again shortly.','Não encontrámos nenhum pedido com esses dados. Confirme o código e os 4 últimos dígitos do telefone.':'We found no order with those details. Check the code and the last 4 digits of the phone.',
'Pedido de ':'Order of ',' · actualizado a ':' · updated on ','Este pedido foi cancelado. Contacte-nos para mais informação.':'This order was cancelled. Contact us for more information.',
'Pedido recebido':'Order received','Cotação enviada':'Quote sent','Confirmado':'Confirmed','Em trânsito':'In transit','Desalfandegamento':'Customs clearance','Pronto para levantar':'Ready for pickup','Entregue':'Delivered'};
const get=(k,d)=>{try{return localStorage.getItem(k)}catch(e){return d}},put=(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}};
let lang=get('lang')==='en'?'en':'pt';
window.glosilyT=s=>(lang==='en'&&D[s])||s;
document.querySelectorAll('select option').forEach(o=>{if(!o.hasAttribute('value'))o.value=o.textContent.trim()});
const SC='header,main,footer,.dock,.skip',DYN='#catalog,#filters,#faqList,#quotes,#estimate,#trackResult,#pBody';
const orig=new WeakMap(),T=document.title,M=document.querySelector('meta[name=description]'),MD=M&&M.content;
function walk(){
  document.querySelectorAll(SC).forEach(root=>{
    const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let n;
    while(n=w.nextNode()){
      if(n.parentElement.closest(DYN)||/^(SCRIPT|STYLE)$/.test(n.parentElement.tagName))continue;
      if(!orig.has(n)){const k=n.nodeValue.trim();if(!D[k])continue;orig.set(n,n.nodeValue)}
      const o=orig.get(n),k=o.trim();
      n.nodeValue=lang==='en'?o.replace(k,D[k]):o;
    }
    root.querySelectorAll('[placeholder],[aria-label]').forEach(el=>{
      if(el.closest(DYN))return;
      ['placeholder','aria-label'].forEach(a=>{
        if(!el.hasAttribute(a))return;const ds='data-o-'+a;
        if(!el.hasAttribute(ds)){if(!D[el.getAttribute(a)])return;el.setAttribute(ds,el.getAttribute(a))}
        const o=el.getAttribute(ds);el.setAttribute(a,lang==='en'?D[o]:o);
      });
    });
  });
}
function apply(){
  document.documentElement.lang=lang;walk();
  document.title=lang==='en'?'GlosilyService — Backpacks and accessories':T;
  if(M)M.content=lang==='en'?'Import of backpacks, folders and accessories. Request a quote or talk to our team.':MD;
  $b.textContent=lang==='en'?'PT':'EN';
  document.dispatchEvent(new Event('glosily:lang'));
  walk();
}
const $b=document.getElementById('langBtn'),$t=document.getElementById('themeBtn'),$f=document.getElementById('fxBtn');
function theme(t){document.documentElement.dataset.theme=t;$t.textContent=t==='light'?'☾':'☀';put('theme',t)}
theme(get('theme')==='light'?'light':'dark');
let fxOff=get('fx3d')==='off';$f.classList.toggle('off',fxOff);$f.setAttribute('aria-pressed',String(!fxOff));
$b.onclick=()=>{lang=lang==='en'?'pt':'en';put('lang',lang);apply()};
$t.onclick=()=>theme(document.documentElement.dataset.theme==='light'?'dark':'light');
$f.onclick=()=>{put('fx3d',fxOff?'on':'off');location.reload()};
apply();
})();
