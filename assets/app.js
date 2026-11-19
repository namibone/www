import {services,departments,initialApplications,messages,notices,invoices,money} from './data.js';
document.documentElement.classList.add('has-js');
const $=selector=>document.querySelector(selector);
const all=selector=>[...document.querySelectorAll(selector)];
const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const serviceFor=id=>services.find(s=>s.id===id);
const departmentFor=id=>departments.find(d=>d.id===id);
const statuses=['Received','In review','Action needed','Completed'];
const types=['New request','Renewal','Information enquiry'];
const channels=['Portal inbox','Sample email notification','Sample SMS notification'];
const methods=['Demo bank transfer','Demo card'];
const key='onenam-demo-v2';
const fresh=()=>({applications:structuredClone(initialApplications),read:[],replies:{},payments:[],notices:[]});
let state=fresh();
let storage=true;
try{
 const saved=JSON.parse(sessionStorage.getItem(key)||'null');
 if(saved){
  if(!Array.isArray(saved.applications)||saved.applications.length>20||!saved.applications.every(a=>/^DEMO-\d{4,10}$/.test(a.id)&&serviceFor(a.service)&&statuses.includes(a.status)&&types.includes(a.type)&&channels.includes(a.channel)&&/^\d{4}-\d{2}-\d{2}$/.test(a.date)))throw Error('Invalid sample state');
  state.applications=saved.applications.map(({id,service,status,date,type,channel})=>({id,service,status,date,type,channel}));
  state.read=Array.isArray(saved.read)?saved.read.filter(id=>messages.some(m=>m.id===id)):[];
  state.payments=Array.isArray(saved.payments)?saved.payments.filter(p=>invoices.some(i=>i.id===p.invoice)&&methods.includes(p.method)&&/^\d{4}-\d{2}-\d{2}$/.test(p.date)).map(({invoice,method,date})=>({invoice,method,date})):[];
  state.replies=Object.fromEntries(Object.entries(saved.replies||{}).filter(([id,text])=>messages.some(m=>m.id===id)&&['Thank you for the update.','I will review the sample request.'].includes(text)));
  state.notices=Array.isArray(saved.notices)?saved.notices.filter(n=>['progress','maintenance','guidance'].includes(n.template)&&['All sample citizens','Sample transport applicants','Sample department team'].includes(n.audience)).slice(0,10):[];
 }
}catch{try{sessionStorage.removeItem(key);}catch{storage=false;}}
const toast=text=>{const el=$('#toast');el.textContent=text;el.hidden=false;clearTimeout(toast.timer);toast.timer=setTimeout(()=>{el.hidden=true;},5000);};
const save=()=>{try{sessionStorage.setItem(key,JSON.stringify(state));storage=true;return true;}catch{storage=false;toast('Browser storage is unavailable. Sample changes may be lost when you leave this page.');return false;}};
const dateLabel=date=>new Date(`${date}T12:00:00Z`).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'});
const today=()=>new Date().toISOString().slice(0,10);
const badge=status=>`<span class="badge ${status==='Completed'?'success':status==='Action needed'?'warning':'info'}">${esc(status)}</span>`;
const empty=(title,body,url,label)=>`<div class="empty"><h2>${title}</h2><p>${body}</p>${url?`<a class="button secondary" href="${url}">${label}</a>`:''}</div>`;
const details=entries=>`<dl class="detail-list">${entries.map(([label,value])=>`<div><dt>${label}</dt><dd>${esc(value)}</dd></div>`).join('')}</dl>`;
const query=new URLSearchParams(location.search||location.hash.slice(1));
// A restored page must reload its tab-local state before any further mutation.
addEventListener('pageshow',event=>{if(event.persisted){$('#main').inert=true;location.reload();}});

// Public navigation remains visible on small screens without JavaScript.
const toggle=$('.mobile-toggle');
toggle?.addEventListener('click',()=>{
 const open=!document.documentElement.classList.contains('menu-open');
 document.documentElement.classList.toggle('menu-open',open);
 toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Close navigation':'Open navigation');
});
addEventListener('keydown',event=>{if(event.key==='Escape'&&document.documentElement.classList.contains('menu-open')){document.documentElement.classList.remove('menu-open');toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','Open navigation');toggle.focus();}});

let category='all';
const serviceInput=$('#service-search');
function filterServices(){
 if(!serviceInput)return;
 const term=serviceInput.value.trim().toLowerCase();
 let count=0;
 all('[data-service-card]').forEach(card=>{const match=(category==='all'||card.dataset.category===category)&&card.dataset.name.includes(term);card.hidden=!match;if(match)count++;});
 $('#service-count').textContent=`${count} sample service ${count===1?'journey':'journeys'} found`;
 $('#service-empty').hidden=count>0;
}
all('[data-search-form]').forEach(form=>form.addEventListener('submit',event=>{
 event.preventDefault();const input=form.querySelector('input');
 if(serviceInput){filterServices();return;}
 location.href=`/services.html#q=${encodeURIComponent(input.value.trim())}`;
}));
if(serviceInput){serviceInput.value=(query.get('q')||'').slice(0,80);serviceInput.addEventListener('input',filterServices);filterServices();}
all('[data-category-filter]').forEach(button=>button.addEventListener('click',()=>{category=button.dataset.categoryFilter;all('[data-category-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));filterServices();}));
$('#reset-search')?.addEventListener('click',()=>{serviceInput.value='';category='all';all('[data-category-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.categoryFilter==='all')));filterServices();serviceInput.focus();});

function refreshMetrics(){
 const values={open:state.applications.filter(a=>a.status!=='Completed').length,action:state.applications.filter(a=>a.status==='Action needed').length,completed:state.applications.filter(a=>a.status==='Completed').length,unread:messages.filter(m=>!state.read.includes(m.id)).length,balance:money(invoices.filter(i=>!state.payments.some(p=>p.invoice===i.id)).reduce((sum,i)=>sum+i.amount,0)),invoices:invoices.filter(i=>!state.payments.some(p=>p.invoice===i.id)).length,paid:state.payments.length};
 for(const [name,value]of Object.entries(values)){const el=$(`#metric-${name}`);if(el)el.textContent=value;}
}
function renderApplications(){
 all('[data-app-list]').forEach(el=>{
  const staff=el.dataset.appList.startsWith('staff');
  let list=[...state.applications].sort((a,b)=>b.date.localeCompare(a.date)||Number(b.id.split('-')[1])-Number(a.id.split('-')[1]));
  const status=$('#status-filter')?.value||'all';const department=$('#department-filter')?.value||'all';
  list=list.filter(a=>(status==='all'||a.status===status)&&(department==='all'||serviceFor(a.service).department===department));
  if(el.dataset.appList.includes('recent'))list=list.slice(0,3);
  if($('#case-count'))$('#case-count').textContent=`${list.length} sample ${staff?'cases':'applications'} found`;
  el.innerHTML=list.length?`<div class="table-wrap" tabindex="0" role="region" aria-label="${staff?'Sample case queue':'Sample applications'}"><table><thead><tr><th scope="col">${staff?'Case':'Application'}</th><th scope="col">Status</th><th scope="col">Created</th><th scope="col">Action</th></tr></thead><tbody>${list.map(a=>`<tr><td><a href="/${staff?'staff-case':'citizen-application'}.html?id=${a.id}">${esc(serviceFor(a.service).name)}</a><small>${esc(a.id)}</small></td><td>${badge(a.status)}</td><td>${dateLabel(a.date)}</td><td><a href="/${staff?'staff-case':'citizen-application'}.html?id=${a.id}">View <span class="sr-only">${a.id}</span>→</a></td></tr>`).join('')}</tbody></table></div>`:empty('No matching requests','Try a different status or department.','/citizen-new-application.html','Start a sample request');
 });refreshMetrics();
}
$('#status-filter')?.addEventListener('change',renderApplications);$('#department-filter')?.addEventListener('change',renderApplications);
$('#clear-filters')?.addEventListener('click',()=>{$('#status-filter').value='all';$('#department-filter').value='all';renderApplications();});
renderApplications();

function renderCase(staff){
 const host=$(staff?'#staff-case-detail':'#application-detail');if(!host)return;
 const id=query.get('id')||'DEMO-1001';const a=state.applications.find(a=>a.id===id);
 if(!a){host.innerHTML=empty('Sample request not found','The request may have been reset or belongs to a different browser tab.',staff?'/staff-cases.html':'/citizen-applications.html','Return to requests');return;}
 const s=serviceFor(a.service);
 host.innerHTML=`<div class="split"><div class="stack"><section class="panel"><div class="section-head"><h2>${esc(s.name)}</h2>${badge(a.status)}</div>${details([['Reference',a.id],['Department',departmentFor(s.department).name],['Created',dateLabel(a.date)],['Request type',a.type],['Profile','Sample citizen'],['Update preference',a.channel]])}</section><section class="panel"><h2>Request activity</h2><ol class="timeline"><li><strong>Sample request created</strong><p>${dateLabel(a.date)} · Stored in this tab only</p></li><li><strong>${esc(a.status)}</strong><p>${a.status==='Completed'?'The example case is complete. No official outcome has been issued.':a.status==='Action needed'?'Review the sample service guidance or illustrative payment.':'The request is visible in the sample department queue.'}</p></li></ol></section></div><aside class="panel">${staff?`<h2>Update sample case</h2><p class="small muted">This changes the citizen view in this tab. It does not update a government system or notify anyone.</p><form id="case-update"><label class="field">New status<select id="case-status">${statuses.map(status=>`<option${status===a.status?' selected':''}>${status}</option>`).join('')}</select></label><button class="button section" type="submit">Save sample status</button><p class="status-region" id="case-update-status" role="status"></p></form>`:`<h2>Your next step</h2><p class="small muted">${a.status==='Completed'?'This sample journey is complete. Explore another service or review your inbox.':'Review the service guidance and your messages for the next sample step.'}</p><div class="stack"><a class="button" href="/service-${s.id}.html">View service guidance →</a><a class="button secondary" href="/citizen-messages.html">Open sample inbox →</a></div>`}</aside></div>`;
 $('#case-update')?.addEventListener('submit',event=>{
  event.preventDefault();a.status=$('#case-status').value;save();
  const statusBadge=host.querySelector('.badge');statusBadge.textContent=a.status;statusBadge.className=`badge ${a.status==='Completed'?'success':a.status==='Action needed'?'warning':'info'}`;
  host.querySelector('.timeline li:last-child strong').textContent=a.status;
  host.querySelector('.timeline li:last-child p').textContent=a.status==='Completed'?'The example case is complete. No official outcome has been issued.':a.status==='Action needed'?'Review the sample service guidance or illustrative payment.':'The request is visible in the sample department queue.';
  $('#case-update-status').textContent=storage?'Sample status updated. The citizen view in this tab now reflects this change.':'Sample status changed on this page only. Browser storage is unavailable, so it will not carry to another page.';
 });
}
renderCase(false);renderCase(true);

if($('#application-form')){
 let step=0;
 if(serviceFor(query.get('service')))$('#request-service').value=query.get('service');
 const showStep=()=>{all('[data-step]').forEach(el=>el.hidden=Number(el.dataset.step)!==step);all('[data-step-indicator]').forEach(el=>{if(Number(el.dataset.stepIndicator)===step)el.setAttribute('aria-current','step');else el.removeAttribute('aria-current');});$('#step-back').disabled=step===0;$('#step-next').textContent=step===2?'Create sample request':'Continue →';$('#wizard-actions').hidden=step===3;$('#wizard-status').textContent='';if(step===2)$('#request-review').innerHTML=details([['Service',serviceFor($('#request-service').value).name],['Request type',$('#request-type').value],['Update preference',$('#request-channel').value],['Profile','Sample citizen — no personal data']]);const target=$(`[data-step="${step}"] legend`)||$(`[data-step="${step}"] h2`);target.setAttribute('tabindex','-1');target.focus();};
 $('#application-form').addEventListener('submit',event=>event.preventDefault());
 $('#step-back').addEventListener('click',()=>{if(step>0){step--;showStep();}});
 $('#step-next').addEventListener('click',()=>{
  if(step===2){
   if(!$('#request-confirm').checked){$('#wizard-status').textContent='Confirm that this is a sample request before continuing.';$('#request-confirm').focus();return;}
   if(state.applications.length>=20){$('#wizard-status').textContent='This demo supports 20 sample requests. Reset the sample workspace to start again.';return;}
   const number=Math.max(...state.applications.map(a=>Number(a.id.split('-')[1])))+1;
   const id=`DEMO-${number}`;state.applications.push({id,service:$('#request-service').value,status:'Received',date:today(),type:$('#request-type').value,channel:$('#request-channel').value});save();$('#request-reference').textContent=`Your sample reference: ${id}`;$('#request-result-link').href=`/citizen-application.html?id=${id}`;
  }
  step=Math.min(step+1,3);showStep();
  if(step===3&&!storage){$('#request-result-link').hidden=true;$('#wizard-status').textContent='Browser storage is unavailable. This temporary sample request exists on this page only and cannot be tracked after leaving. No official request was sent.';}
 });
}

let inboxFilter='all';
function renderMessages(){
 all('[data-message-list]').forEach(el=>{
  let list=messages.filter(m=>inboxFilter==='all'||!state.read.includes(m.id));if(el.dataset.messageList==='recent')list=list.slice(0,2);
  if($('#message-count'))$('#message-count').textContent=`${list.length} sample messages`;
  el.innerHTML=list.length?list.map(m=>`<a class="list-row${state.read.includes(m.id)?'':' unread'}" href="/citizen-message.html?id=${m.id}"><div><strong>${m.title}</strong><p>${m.department} · ${m.date}</p></div><span class="trailing">${state.read.includes(m.id)?'Read':'Unread'} →</span></a>`).join(''):empty('You’re all caught up','No unread sample messages.');
 });refreshMetrics();
}
all('[data-inbox-filter]').forEach(b=>b.addEventListener('click',()=>{inboxFilter=b.dataset.inboxFilter;all('[data-inbox-filter]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));renderMessages();}));
function renderMessage(){
 const host=$('#message-detail');if(!host)return;
 const m=messages.find(m=>m.id===(query.get('id')||'MSG-01'));
 if(!m){host.innerHTML=empty('Message not found','Choose one of the sample messages in your inbox.','/citizen-messages.html','Back to inbox');return;}
 if(!state.read.includes(m.id)){state.read.push(m.id);save();}
 host.innerHTML=`<article class="panel prose"><h2>${m.title}</h2><p class="notice-date">${m.department} · ${m.date} · Sample message</p><p class="notice-body">${m.body}</p>${m.application?`<a class="button secondary" href="/citizen-application.html?id=${m.application}">View sample request →</a>`:''}<hr class="divider"><h3>Try a preset reply</h3><p class="small muted">Saved locally only. No message is sent.</p><form id="reply-form"><label class="field">Sample reply<select id="reply-choice"><option>Thank you for the update.</option><option>I will review the sample request.</option></select></label><button class="button section" type="submit">Save local sample reply</button></form><div id="reply-result" role="status">${state.replies[m.id]?`<p class="reply">Local sample reply: ${esc(state.replies[m.id])}</p>`:''}</div></article>`;
 $('#reply-form').addEventListener('submit',event=>{event.preventDefault();state.replies[m.id]=$('#reply-choice').value;save();$('#reply-result').textContent=`Local sample reply saved: ${state.replies[m.id]} Nothing was sent.`;});
}
renderMessage();renderMessages();

function renderPayments(){
 const host=$('#invoice-list');
 if(host)host.innerHTML=invoices.map(i=>{const paid=state.payments.some(p=>p.invoice===i.id);return `<div class="list-row"><div><strong>${i.title}</strong><p>${i.id} · ${i.department}</p></div><div class="trailing"><strong>${money(i.amount)}</strong><br><a href="/${paid?'receipt':'payment-review'}.html?id=${i.id}">${paid?'View simulated receipt':'Review simulation'} →</a></div></div>`;}).join('');
 const history=$('#payment-history');if(history)history.innerHTML=state.payments.length?state.payments.map(p=>{const i=invoices.find(i=>i.id===p.invoice);return `<a class="list-row" href="/receipt.html?id=${i.id}"><div><strong>${i.title}</strong><p>${dateLabel(p.date)} · ${p.method}</p></div><div class="trailing"><strong>${money(i.amount)}</strong><br><span class="badge success">Simulated only</span></div></a>`;}).join(''):empty('No simulations yet','Complete a sample payment to see how the history works.','/payments.html','Review sample balances');
 refreshMetrics();
}
if($('#payment-review')){
 const host=$('#payment-review');const i=invoices.find(i=>i.id===(query.get('id')||'INV-101'));
 if(!i)host.innerHTML=empty('Sample invoice not found','Choose a balance from the payment workspace.','/payments.html','Back to balances');
 else if(state.payments.some(p=>p.invoice===i.id))host.innerHTML=empty('This sample payment is already simulated','A second simulation has not been created.',`/receipt.html?id=${i.id}`,'View simulation receipt');
 else{
  host.innerHTML=`<div class="split"><section class="panel"><h2>${i.title}</h2><p class="small muted">${i.department} · ${i.id}</p><div class="amount">${money(i.amount)}</div><p class="small muted">Illustrative amount, not an official fee</p><hr class="divider">${details([['Sample reference',i.reference],['Processing fee','N$0.00 (sample)'],['Actual funds transferred','N$0.00'],['Payment provider','Not connected']])}</section><section class="panel"><h2>Choose a simulation</h2><form id="payment-form"><label class="field section">Sample payment method<select id="payment-method">${methods.map(m=>`<option>${m}</option>`).join('')}</select></label><label class="choice"><input id="payment-confirm" type="checkbox">I understand this is a simulation and no money will move.</label><button class="button section" type="submit">Simulate payment</button><p class="status-region" id="payment-status" role="status"></p></form></section></div>`;
  $('#payment-form').addEventListener('submit',event=>{event.preventDefault();if(!$('#payment-confirm').checked){$('#payment-status').textContent='Confirm the simulation notice to continue.';$('#payment-confirm').focus();return;}if(!state.payments.some(p=>p.invoice===i.id)){state.payments.push({invoice:i.id,method:$('#payment-method').value,date:today()});save();}if(!storage){$('#payment-status').textContent='Simulation completed on this page only. Browser storage is unavailable, so no receipt or history can be saved. No money moved.';$('#payment-form button').disabled=true;return;}location.href=`/receipt.html?id=${i.id}`;});
 }
}
if($('#receipt-detail')){
 const host=$('#receipt-detail');const i=invoices.find(i=>i.id===(query.get('id')||'INV-101'));const p=state.payments.find(p=>p.invoice===i?.id);
 if(!i||!p)host.innerHTML=empty('No simulated receipt found','Receipts appear only after completing a simulation in this browser tab.','/payments.html','Review sample balances');
 else host.innerHTML=`<article class="panel prose"><span class="badge warning">DEMONSTRATION · NOT PROOF OF PAYMENT</span><h2 class="section">Sample payment simulated</h2><p class="muted">No funds were transferred and no account was charged.</p><div class="amount">${money(i.amount)}</div><hr class="divider">${details([['Simulation reference',`SIM-${i.id}`],['Service',i.title],['Date',dateLabel(p.date)],['Method',p.method],['Actual amount paid','N$0.00'],['Provider','None — local simulation']])}<hr class="divider"><div class="action-row"><button class="button secondary" type="button" id="print-receipt">Print sample receipt</button><a class="button" href="/payment-history.html">View history →</a></div></article>`;
 $('#print-receipt')?.addEventListener('click',()=>print());
}
renderPayments();

const templates={progress:['Application progress update','Sample cases can be followed from the citizen workspace. No real application has been submitted.'],maintenance:['Sample maintenance notice','This is a fictional maintenance announcement for demonstrating a department communication workflow. No actual outage is scheduled.'],guidance:['Using the pilot safely','Use only the preset sample choices. Do not enter real identity documents or financial information.']};
function previewNotice(){const choice=$('#notice-template')?.value;if(!choice)return;const[title,body]=templates[choice];$('#notice-preview').innerHTML=`<h2>${title}</h2><p class="muted">${body}</p><span class="badge info">${esc($('#notice-audience').value)}</span>`;}
function renderLocalNotices(){const host=$('#local-notices');if(host)host.innerHTML=state.notices.length?state.notices.map(n=>`<div class="list-row"><div><strong>${templates[n.template][0]}</strong><p>${esc(n.audience)} · Local sample · Not sent</p></div></div>`).join(''):'<p class="small muted">No local sample notices saved yet.</p>';}
$('#preview-notice')?.addEventListener('click',previewNotice);
$('#notice-form')?.addEventListener('submit',event=>{event.preventDefault();if(state.notices.length>=10){$('#notice-status').textContent='The demo limit is 10 notices. Reset the sample workspace to start again.';return;}previewNotice();state.notices.unshift({template:$('#notice-template').value,audience:$('#notice-audience').value});save();renderLocalNotices();$('#notice-status').textContent='Sample notice saved in this tab. Nothing was published or sent.';});renderLocalNotices();
$('#reset-confirm')?.addEventListener('change',()=>{$('#reset-demo').disabled=!$('#reset-confirm').checked;});
$('#reset-demo')?.addEventListener('click',()=>{state=fresh();try{sessionStorage.removeItem(key);}catch{storage=false;}$('#reset-status').textContent='Sample workspace reset. No external records were affected.';$('#reset-confirm').checked=false;$('#reset-demo').disabled=true;});

const connection=$('#connection-banner');
const updateConnection=()=>{connection.hidden=navigator.onLine;};updateConnection();addEventListener('online',updateConnection);addEventListener('offline',updateConnection);
const offlineStatus=$('#offline-status');const unavailable=()=>{if(offlineStatus)offlineStatus.textContent='Offline saving is unavailable in this browser. Public pages remain readable online.';};
if('serviceWorker'in navigator){navigator.serviceWorker.register('/sw.js',{updateViaCache:'none'}).then(registration=>{const watch=()=>{const worker=registration.installing;if(worker){const check=()=>{if(worker.state==='redundant'&&!registration.active)unavailable();};worker.addEventListener('statechange',check);check();}};registration.addEventListener('updatefound',watch);watch();return navigator.serviceWorker.ready;}).then(()=>{if(offlineStatus)offlineStatus.textContent='Public guidance saved for offline reading. Workspaces are not included.';}).catch(unavailable);}else unavailable();
