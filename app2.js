">+${fmtD(profit)}</div></div>
          <div><div style="font-size:10px;font-weight:700;text-transform:uppercase;color:var(--gray-400)">Margin</div>
            <div style="font-size:22px;font-weight:800;color:${margin>=0.10?'var(--green)':margin>=0?'var(--amber)':'var(--red)'}">${pct(margin)}</div></div>
        </div>
      </div>`:''}

      <div class="field" style="margin-top:14px"><label>Shifl Ref #</label>
        <input type="text" value="${aq.shiflRef||''}" oninput="S.aq.shiflRef=this.value" placeholder="Assigned after booking"></div>

      <button class="btn blue" onclick="saveAqQuote()" style="width:100%;justify-content:center;padding:11px;margin-top:4px;font-size:14px">
        💾 Save Air Freight Quote
      </button>
    </div>
  </div>
</div>`;
}

async function saveAqQuote(){
  const aq=S.aq;
  if(!aq.customer){alert('Enter customer name.');return;}
  if(!aq.originAirportCode){alert('Select the arrival airport.');return;}
  if(!aq.deliveryZip){alert('Enter delivery ZIP.');return;}
  if(!aq.airFreightCost){alert('Enter the air freight cost.');return;}
  if(!aq.customerRate){alert('Enter the customer rate.');return;}
  const airport=US_AIRPORTS.find(a=>a.code===aq.originAirportCode);
  const airCost=parseFloat(aq.airFreightCost)||0;
  const groundRate=parseFloat(aq.groundRate)||0;
  const custRate=parseFloat(aq.customerRate)||0;
  const totalCost=airCost+groundRate;
  const entry={
    id:uid(),date:localDateStr(),
    fqMode:'Air',
    customer:aq.customer,customerEmail:aq.customerEmail||'',
    originAirportCode:aq.originAirportCode,
    originAirport:airport?`${airport.code} — ${airport.name}`:'',
    originCity:airport?`${airport.city}, ${airport.state}`:'',
    airportZip:airport?.zip||'',
    deliveryZip:aq.deliveryZip,
    awbNumber:aq.awbNumber||'',
    pieces:parseFloat(aq.pieces)||null,
    weight:parseFloat(aq.weightLbs)||null,
    cbm:parseFloat(aq.cbm)||null,
    airFreightCost:airCost,
    groundMode:aq.groundMode||'LTL',
    carrier:aq.groundCarrierName||'—',
    groundRate,
    carrierRate:totalCost,
    customerRate:custRate,
    profit:custRate-totalCost,
    profitPct:custRate>0?(custRate-totalCost)/custRate:0,
    shiflRef:aq.shiflRef||'',
    notes:aq.notes||'',
    status:'Quoted',
    created_by:_currentUser?.id||null,
    created_by_name:_currentUser?.name||null,
  };
  if(!window._aqHistory) window._aqHistory=[];
  window._aqHistory.unshift(entry);
  try{localStorage.setItem('aq_history',JSON.stringify(window._aqHistory));}catch(e){}
  // Auto-flow to TMS
  if(entry.status==='Booked'){const qNum=entry.id?.slice(-6)||Math.random().toString(36).slice(-4).toUpperCase();const bkNum='BK-'+qNum.toUpperCase();if(!getTMSMeta(entry.id).bookingNum){saveTMSMeta(entry.id,{bookingNum:bkNum,mode:'Air',bookedAt:new Date().toISOString()});}setTimeout(()=>showToast('✈️ Air load #'+bkNum+' added to TMS','info',4000),800);}
  try{await dbSaveAqQuote(entry);}catch(e){console.log('Air quote save:',e.message);}
  logAction('quote_created',`Air — ${aq.customer} | ${aq.originAirportCode} → ${aq.deliveryZip} | ${fmtD(custRate)}`,'air_quote',entry.id);
  S.aq=defaultAqState();
  alert(`✅ Air freight quote saved!\n\nTotal cost: ${fmtD(totalCost)}\nCustomer rate: ${fmtD(custRate)}\nProfit: ${fmtD(custRate-totalCost)} (${pct(custRate>0?(custRate-totalCost)/custRate:0)})`);
  S.aqTab='log';
  renderAirFreight();
}

function renderAqLog(){
  $('topbar-right').innerHTML=`<button class="btn blue" onclick="S.aqTab='builder';renderAirFreight()">+ New quote</button>`;
  const all=window._aqHistory||[];
  if(!all.length){
    $('page').innerHTML=`<div class="empty"><div class="empty-ico">✈️</div><div style="font-size:16px;font-weight:700;color:var(--gray-500)">No air freight quotes yet</div><div style="font-size:13px;color:var(--gray-400);margin-top:6px">Build your first air freight quote to get started</div></div>`;
    return;
  }
  const filt=S.aqFilter||'all';
  const shown=filt==='all'?all:all.filter(q=>q.status===filt);
  const totRev=all.filter(q=>q.status==='Booked').reduce((s,q)=>s+(q.customerRate||0),0);
  const kpis=`<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:16px">
    <div class="kpi"><div class="kpi-lbl">Total quotes</div><div class="kpi-val">${all.length}</div></div>
    <div class="kpi"><div class="kpi-lbl">Booked</div><div class="kpi-val b">${all.filter(q=>q.status==='Booked').length}</div></div>
    <div class="kpi"><div class="kpi-lbl">Win rate</div><div class="kpi-val">${all.length>0?pct(all.filter(q=>q.status==='Booked').length/all.filter(q=>['Booked','Lost','Expired'].includes(q.status)).length||0):'—'}</div></div>
    <div class="kpi"><div class="kpi-lbl">Booked revenue</div><div class="kpi-val g">${fmtD(totRev)}</div></div>
  </div>`;
  const tabs=['all','Quoted','Booked','Lost','Cancelled'].map(s=>`<button class="btn btn-sm${filt===s?' blue':''}" onclick="S.aqFilter='${s}';renderAqLog()">${s==='all'?'All ('+all.length+')':s}</button>`).join('');
  const rows=shown.map((q,i)=>`<tr>
    <td class="muted small">${q.date}</td>
    <td class="bold">${q.customer||'—'}</td>
    <td onclick="event.stopPropagation()"><input type="text" value="${q.shiflRef||''}" placeholder="Ref #" onclick="event.stopPropagation()" onchange="saveAqRef('${q.id}',this.value)" style="border:none;background:${q.shiflRef?'var(--blue-bg,#eff6ff)':'transparent'};color:${q.shiflRef?'var(--steel,#2563eb)':'#9ca3af'};font-weight:${q.shiflRef?'600':'400'};font-size:11px;padding:2px 5px;border-radius:4px;width:78px;cursor:text;outline:none" onfocus="this.style.background='var(--blue-bg,#eff6ff)';this.style.border='1px solid var(--steel,#2563eb)'" onblur="this.style.border='none';this.style.background=this.value?'var(--blue-bg,#eff6ff)':'transparent'"></td>
    <td><span style="font-size:11px;font-weight:700;background:#dbeafe;color:#1e40af;padding:2px 8px;border-radius:99px">✈️ ${q.originAirportCode||'—'}</span></td>
    <td class="muted">${q.originCity||'—'} → ${q.deliveryZip||'—'}</td>
    <td class="muted">${q.awbNumber||'—'}</td>
    <td class="money am">${fmtD(q.airFreightCost||0)}</td>
    <td class="muted">${q.carrier||'—'} <span style="font-size:10px;background:#f3f4f6;color:var(--gray-500);padding:1px 5px;border-radius:3px">${q.groundMode||'LTL'}</span></td>
    <td class="money am">${fmtD(q.groundRate||0)}</td>
    <td class="bold money" style="color:var(--steel)">${fmtD(q.customerRate||0)}</td>
    <td style="color:var(--green);font-weight:600">+${fmtD(q.profit||0)}</td>
    <td><span class="badge ${q.status==='Booked'?'g':q.status==='Lost'?'r':'a'}">${q.status||'Quoted'}</span></td>
    <td onclick="event.stopPropagation()">
      <select onchange="updateAqStatus(${i},this.value)" style="font-size:12px;padding:3px 6px;width:110px">
        ${['Quoted','Booked','Lost','Cancelled','Expired'].map(s=>`<option${q.status===s?' selected':''}>${s}</option>`).join('')}
      </select>
    </td>
    <td onclick="event.stopPropagation()">
      ${can('delete_quotes')?`<button class="btn sm ico-btn" onclick="delAqQuote(${i})" title="Delete">🗑️</button>`:''}
    </td>
  </tr>`).join('');
  $('page').innerHTML=kpis+`<div style="display:flex;gap:10px;margin-bottom:16px;flex-wrap:nowrap">${tabs}</div>
  <div class="tbl-wrap"><table><thead><tr>
    <th>Date</th><th>Customer</th><th>Ref #</th><th>Airport</th><th>Lane</th><th>AWB#</th>
    <th>Air Cost</th><th>Ground Carrier</th><th>Ground Rate</th><th>Cust. Rate</th><th>Profit</th><th>Status</th><th></th><th></th>
  </tr></thead><tbody>${rows||'<tr><td colspan="13" style="text-align:center;padding:30px;color:var(--gray-400)">No quotes match filter</td></tr>'}</tbody></table></div>`;
}

async function updateAqStatus(idx,status){
  if(status==='Booked'){if(!requireCan('book_quotes','You cannot book quotes.')) return;}
  else if(!requireCan('update_status','Only Admins can change status.')) return;
  const q=(window._aqHistory||[])[idx];if(!q) return;
  q.status=status;
  try{localStorage.setItem('aq_history',JSON.stringify(window._aqHistory));}catch(e){}
  try{await db.from('fq_quotes').update({data:q}).eq('id',q.id);}catch(e){}
  renderAqLog();
}

async function delAqQuote(idx){
  if(!requireCan('delete_quotes','Only Admins can delete quotes.')) return;
  if(!confirm('Delete this air freight quote?')) return;
  const q=(window._aqHistory||[])[idx];
  window._aqHistory.splice(idx,1);
  try{localStorage.setItem('aq_history',JSON.stringify(window._aqHistory));}catch(e){}
  try{await db.from('fq_quotes').delete().eq('id',q.id);}catch(e){}
  renderAqLog();
}


// ═══════════════════════════════════════════════════════
// WELCOME HOME PAGE + ACCORDION NAV
// ═══════════════════════════════════════════════════════

// View → accordion section mapping
const VIEW_TO_ACC={
  quote:'drayage',log:'drayage',rates:'drayage',customers:'drayage',dash:'drayage',requests:'drayage',
  freight:'freight',
  air:'air',
  transload:'transload',
  tms:null,
  admin:'admin',reports:'admin',activity:'admin',auditlog:'admin',invoicing:null
};

// Sub-link ID → view mapping for active state
const SUBLINK_VIEWS={
  'nav-quote':'quote','nav-log':'log','nav-rates':'rates','nav-requests':'requests','nav-customers':'customers',
  'nav-dash':'dash','nav-active':'active',
  'fqnav-builder':'freight-builder','fqnav-log':'freight-log','fqnav-carriers':'freight-carriers',
  'fqnav-invoicing':'freight-invoicing','fqnav-dash':'freight-dash',
  'aqnav-builder':'air-builder','aqnav-log':'air-log',
  'tlnav-builder':'transload-builder','tlnav-log':'transload-log',
  'tlnav-warehouses':'transload-warehouses','tlnav-dash':'transload-dash',
  'nav-admin':'admin','nav-reports':'reports','nav-activity':'activity',
  'nav-auditlog':'auditlog','nav-carriers':'carriers'
};

function goTo(view,subtab){
  if(subtab){
    if(view==='freight'){setView('freight');setFqTab(subtab);}
    else if(view==='transload'){setView('transload');setTlTab(subtab);}
    else if(view==='air'){setView('air');setAqTab(subtab);}
  } else {
    setView(view);
  }
}

function toggleAcc(id){
  const isOpen=$('acc-sub-'+id)?.classList.contains('open');
  // Close all
  ['drayage','freight','air','transload','admin'].forEach(k=>{
    $('acc-sub-'+k)?.classList.remove('open');
    $('acc-btn-'+k)?.classList.remove('open'); // fallback
    const btn=$('acc-'+k);if(btn) btn.classList.remove('open');
    const icon=$('acc-icon-'+k);if(icon) icon.classList.remove('rotated');
  });
  // Open clicked if was closed
  if(!isOpen){
    $('acc-sub-'+id)?.classList.add('open');
    $('acc-'+id)?.classList.add('open');
    $('acc-icon-'+id)?.classList.add('rotated');
  }
}

function openAccFor(view){
  const section=VIEW_TO_ACC[view];
  if(!section) return;
  ['drayage','freight','air','transload','admin'].forEach(k=>{
    $('acc-sub-'+k)?.classList.remove('open');
    $('acc-'+k)?.classList.remove('open');
    $('acc-icon-'+k)?.classList.remove('rotated');
  });
  $('acc-sub-'+section)?.classList.add('open');
  $('acc-'+section)?.classList.add('open');
  $('acc-icon-'+section)?.classList.add('rotated');
}

function updateSubActive(view,subtab){
  document.querySelectorAll('.sub-link').forEach(b=>b.classList.remove('active'));
  // Determine which sub-link to highlight
  let target=null;
  if(view==='quote') target='nav-quote';
  else if(view==='log') target='nav-log';
  else if(view==='requests') target='nav-requests';
  else if(view==='rates') target='nav-rates';
  else if(view==='customers') target='nav-customers';
  else if(view==='dash') target='nav-dash';
  else if(view==='active') target='nav-active';
  else if(view==='freight'&&subtab) target='fqnav-'+subtab;
  else if(view==='freight') target='fqnav-builder';
  else if(view==='air'&&subtab) target='aqnav-'+subtab;
  else if(view==='air') target='aqnav-builder';
  else if(view==='transload'&&subtab) target='tlnav-'+subtab;
  else if(view==='transload') target='tlnav-builder';
  else if(view==='admin') target='nav-admin';
  else if(view==='reports') target='nav-reports';
  else if(view==='activity') target='nav-activity';
  else if(view==='auditlog') target='nav-auditlog';
  else if(view==='carriers') target='nav-carriers';
  else if(view==='invoicing') target='nav-invoicing';
  else if(view==='tms') target='nav-tms';
  if(target&&$(target)) $(target).classList.add('active');
}

function renderHome(){
  $('topbar-right').innerHTML='';
  document.title='Shifl Quoting Portal';

  const today=localDateStr();
  const yesterday=new Date(Date.now()-864e5).toISOString().slice(0,10);

  const allQ=[
    ...(S.quotes||[]).map(q=>({...q,_type:'drayage',_amount:q.customerRates?.total||0})),
    ...(window._fqHistory||[]).map(q=>({...q,_type:'freight',_amount:q.customerRate||0})),
    ...(window._tlHistory||[]).map(q=>({...q,_type:'transload',_amount:q.totalCustomer||0})),
    ...(window._aqHistory||[]).map(q=>({...q,_type:'air',_amount:q.customerRate||0}))
  ];

  const todayQ=allQ.filter(q=>(q.date||q.created_at||'').startsWith(today));
  const yesterdayQ=allQ.filter(q=>(q.date||q.created_at||'').startsWith(yesterday));
  const todayBooked=todayQ.filter(q=>['Booked','Delivered','Invoiced','Paid'].includes(q.status));
  const bookedToday=todayBooked.reduce((s,q)=>s+q._amount,0);
  const allActive=allQ.filter(q=>q.status==='Booked');
  const urgentCount=allQ.filter(q=>q.status==='Booked'&&(q.tracking?.urgent||q.urgent)).length;
  const allInvoiced=allQ.filter(q=>q.status==='Invoiced');
  const invoicedTotal=allInvoiced.reduce((s,q)=>s+q._amount,0);
  const allDelivered=allQ.filter(q=>q.status==='Delivered');
  const todayDiff=todayQ.length-yesterdayQ.length;

  const greetName=(()=>{
    const p=(_currentUser?.email||'').split('@')[0];
    return p.split(/[._]/).map(w=>w.charAt(0).toUpperCase()+w.slice(1)).join(' ');
  })();

  const hour=new Date().getHours();
  const greetWord=hour<12?'Good morning':'Good afternoon';

  $('page').innerHTML=`
  <!-- Header -->
  <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:28px">
    <div>
      <div style="font-size:22px;font-weight:800;color:#1a2e4a;line-height:1.2">${greetWord}, ${greetName} 👋</div>
      <div style="font-size:13px;color:#8898aa;margin-top:4px">${new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})}</div>
    </div>
    <div style="display:flex;gap:8px">
      <button onclick="openQuickQuote()" style="padding:9px 16px;background:#1a2e4a;color:#fff;border:none;border-radius:9px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;display:flex;align-items:center;gap:6px">⚡ Quick quote</button>
      <button onclick="openGlobalSearch()" style="padding:9px 14px;background:#fff;color:#1a2e4a;border:1.5px solid #dde0e6;border-radius:9px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit">🔍 Search</button>
    </div>
  </div>

  <!-- KPI row -->
  <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:28px">
    <div onclick="goTo('log');openAccFor('quote');updateSubActive('log')" style="background:#fff;border:1px solid #e8f0fb;border-radius:14px;padding:20px;cursor:pointer;transition:box-shadow .15s" onmouseover="this.style.boxShadow='0 4px 20px rgba(26,46,74,.1)'" onmouseout="this.style.boxShadow='none'">
      <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:#8898aa;margin-bottom:10px">Quotes today</div>
      <div style="font-size:32px;font-weight:900;color:#1a2e4a;line-height:1">${todayQ.length}</div>
      <div style="font-size:12px;margin-top:8px;color:${todayDiff>=0?'#16a34a':'#dc2626'};font-weight:600">${todayDiff===0?'Same as yesterday':todayDiff>0?'+'+todayDiff+' vs yesterday':todayDiff+' vs yesterday'}</div>
    </div>

    <div onclick="goTo('active');updateSubActive('active')" style="background:#fff;border:1px solid #e8f0fb;border-radius:14px;padding:20px;cursor:pointer;transition:box-shadow .15s" onmouseover="this.style.boxShadow='0 4px 20px rgba(26,46,74,.1)'" onmouseout="this.style.boxShadow='none'">
      <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:#8898aa;margin-bottom:10px">In transit</div>
      <div style="font-size:32px;font-weight:900;color:${allActive.length>0?'#1a2e4a':'#94a3b8'};line-height:1">${allActive.length}</div>
      <div style="font-size:12px;margin-top:8px;font-weight:600;color:${urgentCount>0?'#dc2626':'#8898aa'}">${urgentCount>0?'🔥 '+urgentCount+' urgent':'All on track'}</div>
    </div>

    <div onclick="goTo('invoicing');updateSubActive('invoicing')" style="background:${allDelivered.length>0?'#fff8f0':'#fff'};border:1px solid ${allDelivered.length>0?'#fed7aa':'#e8f0fb'};border-radius:14px;padding:20px;cursor:pointer;transition:box-shadow .15s" onmouseover="this.style.boxShadow='0 4px 20px rgba(26,46,74,.1)'" onmouseout="this.style.boxShadow='none'">
      <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:#8898aa;margin-bottom:10px">Needs invoicing</div>
      <div style="font-size:32px;font-weight:900;color:${allDelivered.length>0?'#ea580c':'#94a3b8'};line-height:1">${allDelivered.length}</div>
      <div style="font-size:12px;margin-top:8px;font-weight:600;color:#8898aa">${allDelivered.length>0?'Tap to invoice':'Nothing pending'}</div>
    </div>

    <div onclick="goTo('invoicing');updateSubActive('invoicing')" style="background:#fff;border:1px solid #e8f0fb;border-radius:14px;padding:20px;cursor:pointer;transition:box-shadow .15s" onmouseover="this.style.boxShadow='0 4px 20px rgba(26,46,74,.1)'" onmouseout="this.style.boxShadow='none'">
      <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:#8898aa;margin-bottom:10px">Open AR</div>
      <div style="font-size:${invoicedTotal>0?'24':'32'}px;font-weight:900;color:${invoicedTotal>0?'#2e75b6':'#94a3b8'};line-height:1">${invoicedTotal>0?fmtD(invoicedTotal):'—'}</div>
      <div style="font-size:12px;margin-top:8px;font-weight:600;color:#8898aa">${allInvoiced.length} outstanding invoice${allInvoiced.length!==1?'s':''}</div>
    </div>
  </div>

  <!-- Two column: AI brief + Mode shortcuts -->
  <div style="display:grid;grid-template-columns:1fr 320px;gap:20px;margin-bottom:28px">

    <!-- AI Briefing -->
    <div id="ai-brief-wrap" style="background:linear-gradient(135deg,#1e1b4b,#312e81);border-radius:14px;padding:18px 20px;border:1px solid rgba(124,58,237,.2)">
      <div style="display:flex;align-items:center;gap:7px;margin-bottom:10px">
        <div style="width:6px;height:6px;border-radius:50%;background:#818cf8;flex-shrink:0"></div>
        <div style="font-size:11px;font-weight:700;color:#c7d2fe;letter-spacing:.06em">✦ AI OPS BRIEFING</div>
        <div style="margin-left:auto;font-size:10px;color:rgba(199,210,254,.4)">${new Date().toLocaleDateString('en-US',{month:'short',day:'numeric'})}</div>
      </div>
      <div id="ai-insights-list" style="margin-bottom:8px"></div>
      <div id="ai-action-chips" style="display:flex;flex-wrap:wrap;gap:5px"></div>
    </div>

    <!-- Quick jump -->
    <div style="background:#fff;border:1px solid #e8f0fb;border-radius:14px;padding:18px 20px">
      <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:#8898aa;margin-bottom:14px">Quick jump</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
        ${[
          {ico:'🚢',label:'Drayage',fn:"renderQuote()"},
          {ico:'🚛',label:'Freight',fn:"goTo('freight');updateSubActive('freight')"},
          {ico:'✈️',label:'Air',fn:"goTo('air');updateSubActive('air')"},
          {ico:'📦',label:'Transload',fn:"goTo('transload');updateSubActive('transload')"},
          {ico:'📊',label:'Active',fn:"goTo('active');updateSubActive('active')"},
          {ico:'🧾',label:'Invoicing',fn:"goTo('invoicing');updateSubActive('invoicing')"},
        ].map(c=>`<button onclick="${c.fn}" style="display:flex;align-items:center;gap:8px;padding:9px 12px;background:#f7f8fa;border:1px solid #eef0f3;border-radius:9px;cursor:pointer;font-family:inherit;font-size:12px;font-weight:600;color:#1a2e4a;text-align:left;transition:background .12s" onmouseover="this.style.background='#e8f1fa'" onmouseout="this.style.background='#f7f8fa'">
          <span style="font-size:16px">${c.ico}</span>${c.label}
        </button>`).join('')}
      </div>
    </div>
  </div>

  <!-- Streak + quest -->
  <div style="margin-bottom:4px">${getStreakBadge()}</div>
  <div style="width:100%;margin-bottom:8px">${buildQuestWidget()}</div>
  `;

  // Trigger AI briefing
  setTimeout(()=>{
    if(typeof renderAIBriefing==='function') try{renderAIBriefing();}catch(e){}
  },100);
}


// ═══════════════════════════════════════════════════════
// SHIPMENT REVERT + UNIFIED INVOICING
// ═══════════════════════════════════════════════════════

async function revertToActive(type,id){
  if(!requireCan('update_status','Only Admins can change shipment status.')) return;
  if(!confirm('Revert this shipment back to Active (Booked)?')) return;
  if(type==='drayage'){
    const q=S.quotes.find(q=>q.id===id);
    if(q){
      try{
        await dbUpdateQuoteStatus(id,'Booked');
        q.status='Booked';
        try{localStorage.setItem('shifl_quotes_cache',JSON.stringify(S.quotes));}catch(_){}
      }catch(e){alert('Save failed: '+e.message);return;}
    }
  } else if(type==='freight'){
    const q=(window._fqHistory||[]).find(q=>q.id===id);
    if(q){q.status='Booked';try{await dbUpdateFqStatus(id,'Booked');}catch(e){}try{localStorage.setItem('fq_history',JSON.stringify(window._fqHistory));}catch(e){}}
  } else if(type==='transload'){
    const q=(window._tlHistory||[]).find(q=>q.id===id);
    if(q){q.status='Booked';try{dbUpdateTlStatus(id,'Booked');}catch(e){}try{localStorage.setItem('tl_history',JSON.stringify(window._tlHistory));}catch(e){}}
  }
  logAction('status_changed',`Reverted ${type} shipment to Active`,'shipment',id);
  updateActiveBadge();
  S.activeView='active';
  renderActive();
}

function sendInvoiceFromShipment(type,id){
  if(type==='freight'){
    const idx=(window._fqHistory||[]).findIndex(q=>q.id===id);
    if(idx>=0){fqSendInvoice(idx);return;}
  }
  openInvoiceBuilder(type,id);
}

function sendDrayInvoice(type,id){
  let q=null,amount=0,display='';
  if(type==='drayage'){
    q=S.quotes.find(x=>x.id===id);
    amount=q?.customerRates?.total||0;
    display=`${q?.carrier||'—'} · ${q?.port||'—'} → ${q?.zip||'—'}`;
  } else if(type==='transload'){
    q=(window._tlHistory||[]).find(x=>x.id===id);
    amount=q?.totalCustomer||0;
    display=`${q?.warehouseName||'—'} · ${q?.drayPort||'—'} → ${q?.outDeliveryZip||'—'}`;
  }
  if(!q){alert('Shipment not found.');return;}
  const sugInv='INV-'+(type==='drayage'?'DR':'TL')+'-'+Date.now().toString().slice(-5);
  $('modal-root').innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()"><div class="modal" style="max-width:460px">
    <div class="modal-title">🧾 Send Invoice — ${q.customer||'—'}</div>
    <div style="background:var(--gray-50);border-radius:var(--radius);padding:12px 14px;margin-bottom:16px;display:flex;justify-content:space-between;align-items:center">
      <div style="font-size:13px;color:var(--gray-600)">${display}</div>
      <div class="money" style="color:var(--steel);font-size:18px">${fmtD(amount)}</div>
    </div>
    <div class="field"><label>Invoice number *</label><input type="text" id="dinv-num" value="${sugInv}" placeholder="INV-DR-12345"></div>
    <div class="g2">
      <div class="field"><label>Invoice date</label><input type="date" id="dinv-date" value="${localDateStr()}"></div>
      <div class="field"><label>Due date</label><input type="date" id="dinv-due" value="${new Date(Date.now()+30*864e5).toISOString().slice(0,10)}"></div>
    </div>
    <div class="field"><label>Notes</label><input type="text" id="dinv-notes" placeholder="Net 30, factoring, etc."></div>
    <div class="modal-foot">
      <button class="btn" onclick="closeModal()">Cancel</button>
      <button class="btn blue" onclick="confirmDrayInvoice('${type}','${id}')">✅ Mark as Invoiced</button>
    </div>
  </div></div>`;
}

async function confirmDrayInvoice(type,id){
  const num=($('dinv-num')||{}).value?.trim();
  if(!num){alert('Invoice number required.');return;}
  const inv={invoiceNum:num,invoiceDate:($('dinv-date')||{}).value||localDateStr(),
    invoiceDueDate:($('dinv-due')||{}).value||'',invoiceNotes:($('dinv-notes')||{}).value?.trim()||''};
  if(type==='drayage'){
    const q=S.quotes.find(x=>x.id===id);
    if(q){Object.assign(q,inv,{status:'Invoiced'});await dbSaveQuote(q).catch(()=>{});}
  } else if(type==='transload'){
    const q=(window._tlHistory||[]).find(x=>x.id===id);
    if(q){Object.assign(q,inv,{status:'Invoiced'});try{dbUpdateTlStatus(id,'Invoiced');}catch(e){}try{localStorage.setItem('tl_history',JSON.stringify(window._tlHistory));}catch(e){}}
  }
  logAction('invoice_sent',`${type} — ${id} · ${num}`,'shipment',id);
  closeModal();
  S.activeView='invoicing';S.allInvTab='invoiced';
  renderActive();
}

async function markDrayPaid(type,id){
  $('modal-root').innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()"><div class="modal" style="max-width:500px">
    <div class="modal-title">✅ Mark as Paid</div>
    <div class="field"><label>Date payment received</label><input type="date" id="dpaid-date" value="${localDateStr()}"></div>
    <div class="field"><label>Payment notes</label><input type="text" id="dpaid-notes" placeholder="ACH, check #, factored…"></div>
    <div class="modal-foot">
      <button class="btn" onclick="closeModal()">Cancel</button>
      <button class="btn" style="background:var(--green);color:#fff;border-color:var(--green)" onclick="confirmDrayPaid('${type}','${id}')">✅ Confirm</button>
    </div>
  </div></div>`;
}

async function confirmDrayPaid(type,id){
  const paid={paidDate:($('dpaid-date')||{}).value||localDateStr(),paidNotes:($('dpaid-notes')||{}).value?.trim()||'',status:'Paid'};
  if(type==='drayage'){
    const q=S.quotes.find(x=>x.id===id);
    if(q){
      Object.assign(q,paid);
      await dbSaveQuote(q).catch(()=>{});
      try{localStorage.setItem('shifl_quotes_cache',JSON.stringify(S.quotes));}catch(_){}
    }
  } else if(type==='freight'){
    const idx=(window._fqHistory||[]).findIndex(x=>x.id===id);
    if(idx>=0) fqConfirmPaid(idx);return;
  } else if(type==='transload'){
    const q=(window._tlHistory||[]).find(x=>x.id===id);
    if(q){Object.assign(q,paid);try{dbUpdateTlStatus(id,'Paid');}catch(e){}try{localStorage.setItem('tl_history',JSON.stringify(window._tlHistory));}catch(e){}}
  }
  logAction('payment_received',`${type} shipment paid`,'shipment',id);
  closeModal();
  S.view='invoicing';S.invMainTab='customer';S.allInvTab='paid';
  renderFullInvoicing();
}

function renderAllInvoicing(){
  const tab=S.allInvTab||'pending';
  $('topbar-right').innerHTML=`
    <div style="display:flex;gap:6px;background:var(--gray-100);padding:3px;border-radius:var(--radius)">
      <button onclick="S.activeView='active';S.activeFilter='all';renderActive()"
        style="padding:5px 14px;border-radius:4px;border:none;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;background:none;color:var(--gray-500)">
        🟢 Active
      </button>
      <button onclick="S.activeView='completed';S.activeFilter='all';renderActive()"
        style="padding:5px 14px;border-radius:4px;border:none;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;background:none;color:var(--gray-500)">
        ✅ Completed
      </button>
      <button onclick="S.activeView='invoicing';renderActive()"
        style="padding:5px 14px;border-radius:4px;border:none;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;background:#fff;color:var(--navy)">
        🧾 Invoicing
      </button>
    </div>`;

  // Collect all shipments across all modes
  const dray=(S.quotes||[]).map(q=>({id:q.id,type:'drayage',customer:q.customer||'—',detail:`${q.port||'—'} → ${q.zip||'—'}`,carrier:q.carrier||'—',amount:q.customerRates?.total||0,status:q.status,invoiceNum:q.invoiceNum,invoiceDate:q.invoiceDate,invoiceDueDate:q.invoiceDueDate,paidDate:q.paidDate,modeLabel:'Drayage'}));
  const fq=(window._fqHistory||[]).map(q=>({id:q.id,type:'freight',customer:q.customer||'—',detail:`${q.pickupZip||'—'} → ${q.deliveryZip||'—'}`,carrier:q.carrier||'—',amount:q.customerRate||0,status:q.status,invoiceNum:q.invoiceNum,invoiceDate:q.invoiceDate,invoiceDueDate:q.invoiceDueDate,paidDate:q.paidDate,modeLabel:q.fqMode||'Freight'}));
  const tl=(window._tlHistory||[]).map(q=>({id:q.id,type:'transload',customer:q.customer||'—',detail:`${q.drayPort||'—'} → ${q.outDeliveryZip||'—'}`,carrier:q.outCarrier||'—',amount:q.totalCustomer||0,status:q.status,invoiceNum:q.invoiceNum,invoiceDate:q.invoiceDate,invoiceDueDate:q.invoiceDueDate,paidDate:q.paidDate,modeLabel:'Transload'}));
  const all=[...dray,...fq,...tl];

  const pending=all.filter(q=>q.status==='Delivered');
  const invoiced=all.filter(q=>q.status==='Invoiced');
  const paid=all.filter(q=>q.status==='Paid');

  const tabBar=`<div style="display:flex;gap:4px;background:var(--gray-100);padding:3px;border-radius:var(--radius);width:fit-content;margin-bottom:18px">
    ${[{id:'pending',label:`⏳ Pending Invoice (${pending.length})`},{id:'invoiced',label:`📤 Invoiced (${invoiced.length})`},{id:'paid',label:`✅ Paid (${paid.length})`}]
      .map(t=>`<button onclick="S.allInvTab='${t.id}';renderActive()" style="padding:6px 14px;border-radius:5px;border:none;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;background:${tab===t.id?'#fff':'none'};color:${tab===t.id?'var(--navy)':'var(--gray-500)'};box-shadow:${tab===t.id?'0 1px 3px rgba(0,0,0,.08)':'none'}">${t.label}</button>`).join('')}
  </div>`;

  let body='';
  if(tab==='pending'){
    if(!pending.length){$('page').innerHTML=tabBar+`<div class="empty"><div class="empty-ico">✅</div><p>No pending invoices</p></div>`;return;}
    const rows=pending.map(q=>{
      const days=q.status==='Delivered'&&q.paidDate?null:null;
      return `<tr>
        <td><div class="bold">${q.customer}</div><div class="muted" style="font-size:11px">${q.detail}</div></td>
        <td><span class="badge bb" style="font-size:10px">${q.modeLabel}</span></td>
        <td class="muted">${q.carrier}</td>
        <td class="money" style="color:var(--steel)">${fmtD(q.amount)}</td>
        <td onclick="event.stopPropagation()">
          <button class="btn sm blue" onclick="openInvoiceBuilder('${q.type}','${q.id}')">🧾 Create Invoice</button>
          <button class="btn sm" onclick="revertToActive('${q.type}','${q.id}')" style="margin-left:4px;color:#d97706;border-color:#fbbf24">↩️ Revert</button>
        </td>
      </tr>`;}).join('');
    body=`<div class="tbl-wrap"><table><thead><tr><th>Customer</th><th>Type</th><th>Carrier</th><th>Amount</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>`;
  } else if(tab==='invoiced'){
    if(!invoiced.length){$('page').innerHTML=tabBar+`<div class="empty"><div class="empty-ico">📤</div><p>No invoices sent yet</p></div>`;return;}
    const totalOut=invoiced.reduce((s,q)=>s+q.amount,0);
    const overdue=invoiced.filter(q=>q.invoiceDueDate&&new Date(q.invoiceDueDate+'T12:00:00')<new Date());
    const kpis=`<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:16px">
      <div class="kpi"><div class="kpi-lbl">Outstanding</div><div class="kpi-val" style="color:var(--steel)">${fmtD(totalOut)}</div></div>
      <div class="kpi"><div class="kpi-lbl">Invoices sent</div><div class="kpi-val">${invoiced.length}</div></div>
      <div class="kpi"><div class="kpi-lbl">Overdue</div><div class="kpi-val" style="color:var(--red)">${overdue.length}</div></div>
    </div>`;
    const rows=invoiced.map(q=>{
      const dueDate=q.invoiceDueDate;
      const daysOut=dueDate?Math.floor((Date.now()-new Date(dueDate+'T12:00:00'))/864e5):null;
      const isOverdue=daysOut!==null&&daysOut>0;
      return`<tr style="${isOverdue?'background:#fff5f5':''}">
        <td><div class="bold">${q.customer}</div><div class="muted" style="font-size:11px">${q.detail}</div></td>
        <td><span class="badge bb" style="font-size:10px">${q.modeLabel}</span></td>
        <td style="font-family:monospace;font-size:12px;font-weight:600">${q.invoiceNum||getInvoice(q.id)?.invNum||'—'}</td>
        <td class="money" style="color:var(--steel)">${fmtD(getInvoice(q.id)?.grandTotal||q.amount)}</td>
        <td style="color:${isOverdue?'var(--red)':'var(--gray-500)'};font-weight:${isOverdue?'700':'400'}">${dueDate?(isOverdue?`⚠ ${daysOut}d overdue`:daysOut===0?'Due today':`${Math.abs(daysOut)}d left`):'—'}</td>
        <td onclick="event.stopPropagation()" style="white-space:nowrap">
          <button class="btn sm" onclick="openInvoiceBuilder('${q.type}','${q.id}')" style="margin-right:4px">✏️ Customer</button>
          <button class="btn sm" onclick="openCarrierInvoiceBuilder('${q.type}','${q.id}')" style="margin-right:4px;color:#d97706;border-color:#fbbf24">🚛 Carrier</button>
          <button class="btn sm" onclick="markDrayPaid('${q.type}','${q.id}')" style="color:var(--green);border-color:#86efac">✅ Mark Paid</button>
        </td>
      </tr>`;}).join('');
    body=kpis+`<div class="tbl-wrap"><table><thead><tr><th>Customer</th><th>Type</th><th>Invoice #</th><th>Amount</th><th>Due</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>`;
  } else if(tab==='paid'){
    if(!paid.length){$('page').innerHTML=tabBar+`<div class="empty"><div class="empty-ico">💰</div><p>No payments recorded yet</p></div>`;return;}
    const totalCol=paid.reduce((s,q)=>s+q.amount,0);
    body=`<div class="kpi" style="width:200px;margin-bottom:16px"><div class="kpi-lbl">Total Collected</div><div class="kpi-val" style="color:var(--green)">${fmtD(totalCol)}</div></div>
    <div class="tbl-wrap"><table><thead><tr><th>Customer</th><th>Type</th><th>Invoice #</th><th>Amount</th><th>Paid Date</th></tr></thead><tbody>
    ${paid.map(q=>`<tr><td><div class="bold">${q.customer}</div><div class="muted" style="font-size:11px">${q.detail}</div></td><td><span class="badge bb" style="font-size:10px">${q.modeLabel}</span></td><td style="font-family:monospace;font-size:12px;font-weight:600">${q.invoiceNum||'—'}</td><td class="money" style="color:var(--green);font-weight:700">${fmtD(q.amount)}</td><td class="muted">${q.paidDate||'—'}</td></tr>`).join('')}
    </tbody></table></div>`;
  }
  $('page').innerHTML=tabBar+body;
}


// Shifl logo base64 for PDF embedding
const SHIFL_LOGO_B64='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAACYCAYAAACLWb9bAAAoU0lEQVR4nO3df1SU950v8PczEOoUqEAEB4gRSEQxQgg1torUZEVCozbVTWw1tHfbk+P1dg31pOae3aRVkhtze07Snqzp3utJur3Zuxq6ZBdjUy1VvJqgkBCKI6QSMZEhKgyOYdCZcUYy4Xv/MBBAwPnx/Jx5v/6qE3i+n8Iw857P8/0hCSFA6snY/oawu7yKXLuqvBDbygokRS5OpCL/kMD5Ac/Ii5Pr2me44vsMmdO/OuX3xcfFIjVhmiJ/A/4hgYOne8SAd1D2a89Ojkdxdhr/dokoKLFaFxBtlApwAHD64mXFrk2kJFu/W/zx1Hk02Rw4csYe7t/JSPhbX5QNAJibNh13zkhEfnoSLInmkILewdM9YtWrh8Opa0p9z64TSgVQkt/xrovi7//zPQDAfXdY8OJDC6VYE399pC6GOCLShK3fLf5vy1nsOn5asQ831a1dk/0nUVmSh7J5GSibmxHQm68SHbjRPIN+pCo6AsnF1u8WJS/Xjfy7rceJox/bRcsTqxjkSFUmrQsgouhyvOuiKNt1SOQ8V4uqOqui3emp7GzowKpXD6PGauOcEgrKS2933PBYW48Tz9e387lEqmInjohUYet3i6cPnJiqO6aJ2cnxWpdABrOz4cYQBwBVdVb8cGGOyEpJYDuOVMFOHBEpyj8k8JtjH4qc52p1F+AA3HSxBNFoDrdvym7b0wdOqFUKEUMcESnH4faJB1+pF5W1zVqXMil2TSgYnY4rU/736tYuHO+6yNuqpAqGOCJShMPtE3e/8BbqO3u1LmVSlkSz1iWQwZy40H/Tr3nktbfhH2KOI+UxxBGR7I53XRQzt9VotmghUPfPsWhdAhnMHz44d9Ovsbu82NV4mimOFMcQR0Syau91jtl+Qc/mpk3XugQymEA7y5W1zfAM+hWuhqIdQxwRycbh9okHdtVrXUbA7pyRqHUJZCC2fndQ3bWNNU3sxpGiGOKISBb+IYEVuw7p/hbqaPnpSVqXQAZyqi+4U3GqW7vQ3utkkCPFMMQRkSy27msRbT1OrcsIChc2UDBazn0a9Pf8YM8xLnIgxTDEEVHY2nudYrINUPWMZ5VSMI6d7Qv6e9p6nDwVhBTDEEdEYfEPCRhpHtywgoxkrUsggwl1u5yt+1q4yIEUwRBHRGF5vr5dGGke3LC7LElal0AGEuyihtHsLi+e3n+C3TiSHc9OJVKJw+0TnY4rOHGhH002B+amTcfCWbdi/szphj01wDPoR1WdVesyQrI4K1XrEshAGm2OsL5/Z0MHtizL47mqJCuGOCIFeQb9eHr/iUDmi4nS3HT86qGFyE9PNsyL/K+OnjJsdyHnVm4vQoFr7r4U9jW++7sjsG5dLUM1RNfxdiqRQg50XBBzduwNeMJ/fWcv7n7hLWzZ+74wwmo2I3fhAGD+TG70S4E7+rE97Gu09ThxoOOC/v+4yTDYiSOSmWfQj401TaK6tSuk79/Z0IEaq038eVOprrty+z44p+s3o9LcdKQmTBvz2F/tA2jrccKSaObKVAqYf0hAru1zHvt9Iz7Z/jBiTXz6UfgY4ohk5B8SmLNjb9gT/e0uL+5+4S2cfHK10GuQ27qvResSUJqbjqU5M3HnjEQsyUrFbUnxEt8cSW7nBzyyfWCxu7x4vr5dbCsr4BOVwsYQRySjrftaZF2p+cCuel1+ane4fZqtSLUkmvHUinx8rzCL3TRSRbiLGsarqrPihwtzuMiBwsY5cUQyUWLDW7vLi637WnR32/JQiPtlhaMgIxknn1yNnmcekTYvnScxwJFa5FjUMN7GmibZr0nRhyGOSAZKbni7s6FDd5OhX2v+SNXxKkvy0PLEKkmvt5YpstVYbbJfs76zF8e7Lurq75qMhyGOSAY1Vpuitxef2t+q2LVDEerO9cGyJJrR8Hg5XlpzL+e6kSY8g34o9bf9yGtv81xVCgtDHJEM9p86r+j123qcunmxd7h9qhXy502lKM5OY3ojzZz91KXY893u8mJX42l9/GGTITHEEcngyJnw95C6GTlXyIVDrTMg1xdl63qLFYoO7b0Dil6/srZZ1Q9GFFkY4ojCpOTtltHkXiEXqguXryo+hiXRjFfWLWaAI80p3WUHgC1vvq/4GBSZGOKIwqTk7ZbRlFghF4pup0fxMX77/SWIj+MOSKQ9Nbrs1a1daO91shtHQWOIIwqT0rdbhjk8PlXG0YOyuRnswpHm1OqyA8AP9hzTzbxXMg6GOKIwLclKVWWcxSqNo7XS3HTdbW5M0UmtLjtwffFSjdXGFEdBYYgjCpNau67fk5mixjCaW5ozU+sSiAAAb3/cp+p4FbsbVFs4RJGBIY5IBqW56YqPkZv6NcXH0IM7ZyRqXQIRAKBJg8VET+8/wW4cBYwhjkgGanSPeMwUkbqqW7tUH3NnQwds/W4GOQoIQxyRDJbPsSh6/cqSPEWvT0Rjabl323d/d0SroclgGOJUVpCRrHUJpIDi7DRpfVG2Ite2JJqxY+U97MIRqajTcUWzsdt6nHi9tYvdOLophjiV3WVJ0roEUsi/blgqWRLNsl/3jb9bxj3TiFR24kK/puNv3dfCLUfophjiiGQSa5Lw502lsl6zsiSPZ4cSaUCLRQ2j2V1ePF/fzhRHU2KII5JRfnqyVFVeKMu1SnPT8eJDCxngiDSgxaKG8arqrFzkQFNiiCOS2bayAunkk6sRzq3V3RUlOLhphcRNb4nUp6fgtLGmSesSSMcY4ogUkJ+eLH2y/WEp2FWlpbnp6Ht2HTYUZTO9EWnkVN9lrUsYUd/ZiwMdF3QTKklfOFuaSCGxJgkvrblXenpFvjjU2Yvm7ks4+rEdbT3OMV+3vigbi7NScU9mCue/EelAy7lPtS5hjMd+34hPtj/M4+joBgxxRApLTZgmbSjKxoYvtiDxDwmcH/CI+LhYbuBLpEPHzqp73NbN2F1e7Go8LTYvncfXCxqDt1OJVBZrkpCVkiAxwBHpU31nr9Yl3KCytlnTDYhJnxjiiIiIvqCnRQ3jbXnzfa1LIJ1hiCMiIvqCnhY1jFfd2oXjXRd1GzJJfZrOiRueG3Sq7zIGvINo7r4Eh8cH4OZ79BRkJI+cfrBy/m0AgPz0JCR+5RZkpSTwNhUREQXt4Ic9Wpcwpb//z/fQ8sQqLnIgACqHOFu/WzTaHGjuvoQaqw12lzfka7X1OEdW+U0Q+ERBRjLuu8OCRbNnYElWKm5LiueeWyFyuH3C7vKivXcAH11y4fTF659UpwralkQz7p9jwdy06bhzRiLy05OQc2uixOOjiEjPjn5s17qEKbX1OFFjtQluQ0SAwiHOPyTwXrdDvGHtxs6GDiWHusFIyGsYeUiU5qbjOwtmYdkdM5E3M4mhbhKeQT/e/rhP7PnLWRw5Yw8pbNtd3knD9dqC2ViTPwv56cn8BRhQ/9Vrhr4+0WT8Q+KGLYD0qGJ3Ax5aMItnKpMyIa691yn+5d2PVA9uN1Pf2Tt61ZFYX5SNR7+eg2V3zIz6DpHD7RP/brXht++eUfRFbDhcV9VZYUk0i03Fc/HDhTmGvwXuHxJ48JV6ocSqNkuiGSefXB3WdiRb9r4v9Pb3OJnK2mZU1jYrNu+nICMZLU+s4oc4usH5AY9h5pttrGkSeypK+CSOcrIlF/+QQI3VJrbuawnrNqmaqlu7hrtFojQ3HVuWzY+6QHe866J45s8nNVlSb3d5UVVnRVWdFeuLssVPiucadrPb8wMeRQIccP3ndKizd2SfuVAYJcCpoa3HifMDHmH0Dw4kv0aND70PRnVrF3Y8eA+fx1Eu7LRixPA2kVFdOlGam449FSURuxGrHn9nw4G6ICNZvPnj+w3fmSMi42nuvqR1CUH57u+OwLp1tdZlkIbC2mLkeNdFcfsz/yEqdjfoJgzIob6zF4d0uNmjHA50XND176ytx4mc52qxZe/7wjPo17ocIooiel/UMF5bjxOvt3YZ5hYwyS+kEOcZ9OPR3Q2i5OU6XQYBOeSnJ2ldgqxs/W5R+OJbYtWrhw3xO9vZ0IE5O/YKHvxMRGowyqKG8bbuawE/8EavoENce69TzNmxV9xsHzcjsySaI2rl5OutXSLnuVrDvUDZXV6sevUwtux9X/iHmOWISDkdfQOGfJGxu7z41dFThqydwhdUiHu9tUvc/cJbhujkhGNT8VytS5CFZ9CPsl2HRMXuhpt/sY7tbOjAwl//UfDcQCJSSnvvgNYlhKyqzqrr48JIOQGHuGcPthk+DARqTf4srUsIm8PtE3N27FVsxaTa2nqcuPuFt3gANBEpYv+p81qXEJaNNU1al0AaCCjEPXuwTVTVWRUuRR8i4VZqe68zIjumdpcXM7fV8OxAIpLdkTPGWtQwXn1nLziHOPrcNMS93toVNQEOMPat1L/aB3Cg40JEBrjRSl6uY0eOiGTjGfRHxGvmY79vBOcPR5cpQ1x7rzNqbqEOM/Kt1LYeJ1a9eljrMlTBW6tEJJezn7oi4rXE7vLi+fr2iPj/QoGZNMR5Bv14YFe9mrVoLhJupUYLu8uLu194i0vriShsRl7UMF5VnZUfcKPIpCFuY02TiIT2cjCeWpGvdQkUBLvLizW/O8IXKyIKi9EXNYy35c33tS6BVDJhiLP1uyN6H7jJfK8wS+sSKEj1nb34zbEPGeSIKGSR9n5X3drFBWBRYsKzU/W0VNmSaMb9cyyT/vcjZ+yyTEgtyEiO2LNSI11lbTNWzb+NB0ETUdAi9dbjI6+9jU+2P4xYE18WI9kNIa6916nZ3mIFGclYWzAba/JnwZJoDipUeQb9cLh94lTfZZz91IUmmyOoT1ePfXNOSDWTPvAgaCIKRafjitYlKMLu8qLGahMbirKZ4iLYDSHuX979SPUiKkvysGVZHsLppMTHxSI+JUHKSkkAAGxeOg97Kkpg63eLRpsDrzV/hKnCKW+lGtvwQdB8wSKiYJy40K91CYqp2N2AhxbMQnzchDfdKAKM+c36hwR2NnSoNrgl0YyTT65W9DZm1hfBbkNRNjyDfuz74JzYuq9lzC1Y3kqNDFv3tWBdYRZvHxBRwJpsDq1LUNTGmiaxp6KEL4oRaszChve6HarNDVAjwI0XHxeLDUXZ0ifbH5YaHi9HQUYyAOC//80CtUogBQ3fPtC6Dj2yJJq1LkFX+KGNhkXaoobxqlu70N7r5OtihBrTiXvD2q3KoKW56dj74/slrVq8sSYJxdlpknXratj63ZwQP8rwQpLFWam4JzMFmdO/OunXNtoc+OiSC8fO9k15q1pN7MZNrPGn30ajTB2Hm01NCFfD4+Uozk7jL5AUF6mLGsb7wZ5jnDMcocakqKMfq3N2nJYBbjwGuOvB7akV+Vh2x8ygNjsenn8IXL8V/163Q7xh7Vb1lvx4dpcXB0/3iAfzMqP+9zpa1qj5ojJQdPHTVB8ciOQUqYsaxuOc4cg1kqT8QwJtPU7FB6wqL+QkS50oyEjGP//tN/CN2alSuJ2r4e5mcXYadqy8B786ekqzM3ef2t+KB/MyNRmbiIzjsMEPvQ/G1n0tXOQQgUbmxJ0f8KjSVjby2aSRZOfaRWh5YpVUnJ0WdoAbLz4uFtvKCqSzP187Mu9QTW09zqi5TUJEoTt2tk/rElRjd3nx9P4TfF2MMCMh7lTfZVUGTPzKLaqMQxMbXlCyeek82cPbeFkpCVLLE6ukqvJCRceZyP9u7FR9TCIyFr3M5VXLzoYO2PrdDHIGZXP7RWOfT9jcfuHxDwEYdTt1wDuoShG3JcXznrxG1hdl45V1i1WdjxhrkrCtrEBaPsciSl6uU23c2rZubCsrUG08IjKWaA0zG2uacHDTCq3LoCl4/EPocvlFe/8gmh0+HLV70d4/NqNZzDHixJpZEx+7paTzAx6uBtVAaW46tNwrqDg7TWp4vFy1INfW44Rn0M/5H0Q0IbXuPulNfWcvDnRc4OIvHfAPCZy/+rnoGBjE2SufoemiD78/6w7oe+3ez1FxtE/9ENdoc0DGVXIUgNLcdBzYWKr5H2xxdppUVV6o2oIH64V+wa0qiGgiLec+1boEzTz2+0aeq6oyh+9z0ef9HO39g9h/zoO/Dgze0F0L1uEe75chrv/qtbCLDAT38VKXJdGMPRUluvl5bysrkPo914Qa25AcPmNHcXaa4uMQkfFE06KG8ewuL56vbxfbygr08cYQQUZ311ouXcPpgcGAu2vBsphjvgxxKV/9iiKDjGd3ebGr8bTYvHQenzwqaPzpt3W3O/2OlfdIOxs6FJ+PcvpidN4uIaKp+YdE1C1qGK+qzoofLszh9KYwOHyfizOXP0O32y9bdy0YLyya8WWISzLHqTZwZW0z7slM4a0uhVWVF+pyM+P4uFjsrihBxe4GRcepbu3CnooSRccgIuNRa0stvXv6wAm+RgZguLvW1OfDR67PcMzuxeEe782/UUHbi1Kw/o4EaSTEzZ85XdUCSl6uw861i9iRU4gl0Yyf3Tdftz/bdYVZ0tZ9LcLuUvYPwT8kdHMrmYj0Qa4j6IyuurULPymey4bKKDa3X/R4/CPdtaO9Xti9n2td1hjfz0nALwqvn66k6dK9ytpmfORwiRcfWqj4nmXR5sWHFup6ZWasScJTK/JRWdus6DhcDU1E4zV3X9K6BN145LW3o3KRg8c/BIdvSDT1+dDs8OHUwKDm3bVALM8w47VvfRm6R97ls1ISJEuiWfHOyHg7GzpQY7WJN/5uGQ+9lokl0Yx1hVm6/1l+rzBL8RBHRDSeWueEG0E0zFMf7q6d+PQami76dNldC8TyDDP2l6WPaXqNadVsKp4LLc67tLu8KHm5DuuLssWOB+/R5TwuI9lUPNcQn6pSE6ZJBRnJQo0ze4mIAPXOCTeSytpm/GjRnbq+exOIQDbJNaqJAhwwLsStyZ+lSYgbVt3aherWLoa5MP23JblalxCwx745h904IlINFzVMbGNNk9ByQ/hg2dz+kDbJNaL8lLgJAxwwLsTlpydrckt1vEgOc3PTlF1AUpCRrLstRaayav5tDHFEpBouaphYdWsX/mH5ApGfnqyr9w8lNsk1Eos5BgfLMya9u3ZD71SNyeaBGh3mflI8NyLmzN05I1HR6z/2zTmKXl9uX5yly0/GRKSK/afOa12Cbv1gzzG0PLFKk+k4am6SaxQWcwxOrJmF1Gkxk/5Cbghxm5bMlX777hldzVMaDnMFGcni+ZVFKJubwdWsk1g1/zatSwhKrElCQUYy56gQkSqOnOGihsm09ThRY7WJDUXZir7Bar1JrhEEEuCACUJcrEnCmz++HznP1SpXXYjaepxY9ephWBLNYlPxXPzsvvmS0Sdiyu2Lzpah3GVJYogjIsV5Bv3QerqQ3m3d14KHFsySZZGDHjfJNYpAAhwwyT5xWSkJUmVJnirnW4bC7vKiqs6KqjqrqCzJw5ZleRE1by5UBRnJhliVSkSkhbOfujh14ybsLi+e3n9CvLTm3qDeTMZ314y6jYcevLMyM6AAB0yx2e+LDy2UTvUNCL2fL7ezoQM7GzpQmpsutj9wd0TMmwvVXZYkrUsgItKt9t4BrUswhJ0NHdiyLG/CjdKNukmuUbyzMhNLZga+OHHSEBdrknBgY6n04Cv1ug9yAFDf2Yv6zl4UZCSLf/7bb0RlmFN65asRNdocyEpJ0LoMItIBLmoI3HdePYz/tfbr4t0PbXj/4/N4r+0Uzp3+K/Cj/wnJFKN1eREp2AAH3OTYreEgt/DXf9TVQoeptPU4UfJyXVQuglB65SsRkZFxUUPg2nudKNn4j4Bz7M9MOvMXSHMXaVRV5AolwAGA6WZfEGuScLzy21JpbnpolWlkeBHEwl//URzvush5EEREUYyLGoIjmUzAnV+/4XHR8B8QQ5zrJqftRSkhBTgggBAHAPFxsTi4aYVUVV4YyhiaGu7MFb74lrD1uxnmiIiikPVCP1//gyQlpgC3zx/74NUrEGf+ok1BEWh7UQp+URj6BssBhbhh28oKpIbHy2FJNIc6nmbaepzIea4Wj+5uEJ5Bv9blEBGRik5c6Ne6BGO6/a4bHmI3Th7hBjggyBAHAMXZadKZp9dI64uywxlXM9WtXZizY6840HGBn8qIiKJEE4/bCokUNw1Y8K2xD7IbFzY5AhwQQogDrt9e3VNRIp18cjUKMpLDrUF1dpcXq149zK4cEVGUqG7t0roE45oxCzCPXeXPblzolmeY8Y8FSbKsuAwpxA3LT0+WWp5YJe2uKDHkLdbhrhznyhERRS6H28fX+DBIJhMwb/HYB9mNC8nyDDP2l6XLtmtGWCEOuL56dUNRtvTJ9ocNGebsLi9ynqsFV7ASEUWmTscVrUswPCnZAljGTqNiNy44cgc4QIYQN8zoYa7k5To8e7CNQY6IKMJwUYNMsgvH/pvduIApEeAAGUPcsOEw1/PMI1LD4+WGmjNXVWdlkCMiijB/+OCc1iVEBMmccMNtVXbjbs5ijkFtqUWRgwdkD3GjFWenSdatq6WzP1+LypI8JYeSTVWdlbdWiYgiiBGOjjSMmbMB86jTgdiNm5LFHIMTa2YhPlaZuKVoiBuWlZIgvbTmXsn1yw3SzrWLdH+rteTlOgY5IqIIwIVr8pJibgFy7x3zGLtxExsOcKnTYhQ7+1OVEDcsPi4Wm5fOG7nVquejvB557W1w+xEiImM71XdZ6xIijnRrJpA088sHrl6BeP9P2hWkQ2oEOEDlEDdacXaadHDTCunsz9dCj8d52V1ebKxp4ic4IiIDazn3qdYlRKa8JWP+Kd77I8Rn1zQqRn/qyjMUD3CAhiFuWFZKgrStrEBy/XKD7la1Vrd2ob3XySBnYM3dl7QugYhU4h8SsLn9ovpjt/gfVqeoONonqhq4ya8SJHMCcGfRmMdE6yGNqtGXd1ZmYkFynOIBDgBi1RgkEPFxsdhQlC2tK8zCwdM94qn9rWjrcWpdFh7YVY+eZx7RugwKkcPj07oEIlKAw/e5OHP5M3S7/dh/zoOjvV7YvRPMy/LwdqpiMnOBj1pH/ine+yNE0QpIt3xFw6K09c7KTCyZOU2VAAfoKMQNizVJeDAvUyqbm4Eaq01s3dcCu8urWT12lxftvU6Rnx7+GWdERBQc/5DA+aufi6Y+Hz5yfYZjdi8O9wT2niAG+SFOSVLMLRB3/w1w8v+NPCZaD0H6xioNq9KO2gEO0GGIGza839y6wizUWG2iYneDZrXsbT+H/HTj7HdHRGRENrdf9Hj8OPHpNTRd9E3eXQvUVZd8xdHEktOvL3IY6AMQvd24f1s2U/UAB+g4xA0bDnMrctPFil2HNLnFWlVnxVOl+VBioz4iomjj8Q/B4RsSTX0+NDt8ODUwGHB3LRiCIU5xkskEkbcYaHpz5LFo68ZtL0rB+jsSNAkIug9xw1ITpkktT6zC8/XtoqrOqvr473U7RHF2GlMcEVEQbG6/6BgYxNkrn8nTXQsG58OpQjInQtw+H/jkFIDo6sZtL0rBLwq1m25lmBAHXO/KbSsrkACoHuS6nR4UZ9/864iIopHHP4Qul1+09w+i2eHDUbsX7f2DmtUjhACuXdVs/Khz+10jIQ6Ijm6c1gEOMFiIG6ZFkGvuvoQNRUxxREQA0NjnE8Nz135/1q11OTfinmWqkuKmQSz4FvDBOwAivxv3/ZwEzQMcYNAQB1wPcsfO9gm1zsTjVhVERNc9UNcjlJjDJivOh1PfjFmAOQHwXg/1kdqNW55hxmvf0sf0Ks03+w3HK+sWqzbWX+0Dqo1F8qlu5UafRHL60/mr+g9w4KIGLUgmE7Bg2ci/I/EUh+UZZuwvS5f0stDR0CEuKyVBqizJU2UsPWw8TESktYFrQ1qXEBguatCElJgCWL6cehRJpzjoLcABBg9xALBo9gytSyAiClujzaF1CQFJ+or+3zbE0Odc1KCl7MKR/xkp3TiLOUZ3AQ6IgBC3JCtVlXFKc9NVGYeISM9WZJglizlG6zKmxpMaNCWZE4B5X053Mno3zmKOwYk1s3S5V6zhQ1x8nDprM1ITpqkyDhFFp+buS1qXEJBYk4QTa2ZB10HOxy6c5iw51xc5wNjduOEAlzotRn8JDhEQ4jyDfq1LICIKm5FWwKdOi5H0HOSEq1/rEqKeZDIB80tG/m3EbpzeAxwQASHOde0zVcZJjWcnzqgY9MkIjLaSWtdBjosadEGaPuP6uaowZjdO7wEOiIAQt7f9nCrjlM3LUGUckp/D7RNa10AUCKN94NBjkBNDnwN+dT7cUwDyloz8TyN1495Zman7AAdMEOL8QwKvt3YJW79b9298/iGBXcdPqzLW/JnTVRknGi1WeHGKUVb9Eb39cZ/uX3fH012Q46IGXZHMCUBOIQDjdOPeWZmJJTOn6T7AAROEuPe6HaJidwNynqvFo7sbdB3mnq9vF3aXOptOZqUkGOIXakQpX1X2WJbXmj9S9PpEcjn4YY/WJYREV0HOc0XrCmi8WfMAcyIA/XfjjBTggAlC3BvW7pH/Xd3aNRLmjndd1FWYe/Zgm2pnp67nmamGVt/ZC/+Qrp6+ZECzk+MVH6PGalN8DKXoJciJqwxxeiPF3ALk3gtA3924t8rSDRXggAlC3EQvItWtXSh5uQ4Z298Qvzn2odB6jpGaAQ4AHv16jmpjkTJ2NZ5miqOwZE7/quJj2F1e6O0DczB0EeQuG2OrlqiTnP7lIgcdduO2F6Xg27d91VABDhgX4tp7nVPenrS7vKisbcbMbTUofPEt8ZtjH4r2XqdQq8vhGfTj0d0NqgY4ACibm2G4X6yRqNHhqKxtNtykcdKX1AR1PqE/8+eTagyjGC2DnOCCBt2STCYg7/oGwHrrxm0vSsEvCpMN+T4/JsS9/XFfwN/Y1uNEZW0z7n7hLcRt/Tfx6O4G8XprlyKhzuH2iWcPtonEf3hdqL0Mv7IkT5e7NEcSNTocALCxpsmwHQ7Snlobi9d39uJAxwVDP1c1C3LX1JkjTaGRzInA7fMB6KcbZ+QABwBjXpV+++6ZkC9U3do1ep8jUZCRjLssSVg5/zYkmeNGVnfebIGAw+0TnkE/Gm0ONHdfQo3VBrUWL0xky7I8zcaOFl88JxR/06pu7cLctOliW1mBYf9gSVsFGclo63EqPs6qVw/j7M/XCiMvqPoiyIl79p6D3fu5OoP6POqMQ6HLLgA+OXW9G1e0AtItyi5sm4rRAxwwKsQ53D4h54tTW48TbT3OiTawNMwnzPVF2VyVqhK13hyr6qw4drZP7P3x/ZJanRWKHGsLZqvyPAWAJf/0J5x5eo1qHUAlqB3kuKhB/6SYWyAWfAv44B2I1kOQvrFKkzqWZ5jxjwVJhn9/H7md+v65T7WsQ5de+u69WpcQNe6yJKk2Vn1nL+bs2Kv5Ah0ynjX5s1Qby+7yYs6OveL11i7V5h0rQdVbq1zUYAwzZgHmBM3mxi3PMGN/WboUCVOlRkLcnr+c1bIO3dm5dpFqE5lJ/RXAdpcXhzp7VR2TjC9vprqf3O0uLyp2N2DrvhbjpjioE+QEN/k1DMlkAhYsA6D+3LhICnDAFyHOPyQMd26fkkpz07FpydzI+A0bxLI7ZvLnTboXa5JQmpuudRmGpHiQu3ZVmeuSIqTEFOD2+ap24yItwAFfhLj3uh2G/pQnJ0uiGXt/fL9iv+Qkc5wi1zW6+LhYFGQkqzpmfnqSquNRZNj+wN2qjxkpZzenTouRTj9yu7Q8wyz/xb1u+a9JysqcC0CdbpzFHIPd982MuN0mTABw+Ixd6zp0o/Gn31Z0IjHPYJ3cY9+co+p4lkQF3kgo4hVnp0lqP3ci6XUjPtaE/WXpsgc5weO2DEcyJwDzFivejbOYY3BizSxDHGgfLBMA1Q6R17uGx8u5GlVDP1p0p6o/e855pFC9+NBCVceLtNelWJMkf5DzXJbvWqQeS871RQ6Hdytz+QgOcABgcrh9qh0ir1eWRDP6nl2H4uy0iPwlG0V8XCyqygtVGUvtW7cUWdYVZqn2WhGpZzfLGeS4qMG4JJPpejeu832IK/KuLo70AAcApn838IHLcijISMbJJ1ezK6MTP7tvviq/BzW3NKHIE2uSsLuiRJWxVs6/TZVxtCBbkOOiBkOTki1Aeg5E4z5Zr1tXnhHRAQ4ATH/44JzWNWimsiQPLU+skhjg9CM+LlaVN8dIfmMkdWwoypbU6JJF+gIcWYIcFzUYX9bdsnbj3lmZiQXJcRH/3m6qj8K9siyJZjQ8Xo6X1twbUUuNI8WGomxJ6W0cuEqY5PCvG5YqvshB7b3ptBBukBOXuVm90UnmBCCnUJZu3DsrM7FkZnQ0Z0w71y6KqlV6O9cuwifbH5Y4/03f9lSUKPq8jKTVfqSdWJOExp9+W7Hrl+amR9yWCJMJNcgJIXg7NVLMmgdx7sOwunHRFOAAwLR56Typ55lHpJNPrkZVeWHEBrqq8kK4frlB2rx0HrtvBpCaME06+eRqxa5/W1I8nwQki6yUBKnh8XJFrr00Z6Yi19WrkIKcBsc2kTKkmFuA3HtD7sb90zdnRFWAA0Ydu5WfnixtKyuQep55ROp7dh12rl1k+J3JLYlm7K4ogeuXG6RtZQU88NxgUhOmSQ2Pl8v+wcKSaI6a7gapozg7TZEgt3yORfZr6l3QQe6qS9mCSFXSrZkQFz8Juhu3vSgFfz9/etS9sJsmejA1YZq0eek86eCmFZLrlxukhsfLUVmSZ5guXWVJHhoeL8cn2x+WNhRlM7wZWHF2mnTyydWybglyfxS+MZLyirPTpL5n18n6XC3MTIm6NyUguCAnGOIiT95iDB1/M+Av316Ugl8UJkfn38rNviA+LhbF2WlScXYaXlpzLxxun3j/3Kc4+GEPaqw26GGPuYKMZKwtmI3lcyz4xuxU3i6NMKkJ06SWJ1bh+fp2UVVnDft6c9M4H46UMfxc3dV4WlTWNod1LUuiWdHTY/RuOMitPNgrDvdM8T7DTX4jjmROhPB5IK5cgvS1GVN+bTQHOCCAEDdeasI06cG8TDyYl4mX1twLz6Af1gv94sSFfjTZHDhyxq54sCvNTcd3FszCPZkpyE39Gvd4iwKxJgnbygqkHy7MEU8fOIHq1q6Qr3XnjEQZKyMaK9YkYfPSedKPFt2JXx09FfIHj3WFWbLWZUQ3C3Jc1BDBcu7G0LFaxDy4cdIv+X5OQlQHOCCEEDfe6E7d5qXzAACeQT8cbp841XcZA95BNHdfgsPjw1/tA2jrcd70mqW56UhNmAbgy/28lmSlIj4uloEtymWlJEh7KkrwyrrF+D/NH4nfvnsmoOfUaEuyUhWqjuhL8XGx2FZWIP3svvkhPVcj5dD7cE0Z5BjgIpYUcwtE4q2TduOWZ5jx2re4y4Qivfr4uFjEpyRIWSkJAIANEXpsDGknPi4Wm5fOkzYvnQdbv1s02hzYf+p8QB8U+EGA1DT6uepw+8Shzt6AnqvcBudLkwY5H0NcRJuehqH39iNmxX8Z8/DyDDP2l6Vz6hQUCnE0uduS4qXdFSVCiWs/tGBWVD6js774wDD6w4Kt3z3hz1ipg8Sjae7SF+eGKvIcTjLHRdxh76OlJkyTNhRljzxX/UMC5wc8AgCG71wAkf9zCMVEQU64+jWuipQkmUwQCSkYunwJpunXu3EMcGNJQijyWkwUdY53XRTdTo8i115XmMUXLSJcD77DQW7ow2bA/5nWJZHSrl6GadGDsJhjYPvebL4WjsIQR0REhuIfEnjgT+fFkcNHtC6FVCAGfbh1zl3o+K/fjPgD7YPFEEdERIbj8w+hpfcK38CiRM70ryDja2YGuHH+PxSTYGWhOZw9AAAAAElFTkSuQmCC';
// Local date string (avoids UTC midnight off-by-one for US timezones)
function localDateStr(){
  const d=new Date();
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
}
function localDateTimeStr(){
  return new Date().toLocaleString('en-US',{timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}).replace(/(\d+)\/(\d+)\/(\d+),/,'$3-$1-$2');
}

// ── Active Shipment: change carrier ───────────────────────────────────────
function changeShipmentCarrier(type,id,currentCarrier){
  if(!can('update_status')){alert('Only Admins can edit shipment details.');return;}

  let rateRows='',noRates=false;

  if(type==='drayage'){
    const q=S.quotes.find(q=>q.id===id);
    if(q){
      const matches=S.rates.filter(r=>r.active&&r.zip===q.zip&&(r.ld===q.ld||r.ld==='Both'))
        .sort((a,b)=>totMode(a,q.ld)-totMode(b,q.ld));
      if(matches.length){
        rateRows=matches.map(r=>{
          const carrierTotal=totMode(r,q.ld);
          const cuTotal=q.customerRates?.total||0;
          const profit=cuTotal-carrierTotal;
          const margin=cuTotal>0?profit/cuTotal:0;
          const isCurrent=r.carrier===currentCarrier;
          return`<div onclick="selectCarrierChange('drayage','${id}','${r.id}')"
            style="display:flex;align-items:center;justify-content:space-between;padding:12px 14px;
              border:1.5px solid ${isCurrent?'var(--steel)':'var(--gray-200)'};
              background:${isCurrent?'var(--blue-bg)':'#fff'};
              border-radius:var(--radius);cursor:pointer;margin-bottom:8px;transition:border-color .15s"
            onmouseover="this.style.borderColor='var(--steel)'" onmouseout="this.style.borderColor='${isCurrent?'var(--steel)':'var(--gray-200)'}'"
          >
            <div>
              <div style="font-weight:700;color:var(--navy)">${r.carrier}${isCurrent?' (current)':''}</div>
              <div style="font-size:11px;color:var(--gray-400);margin-top:2px">Base: ${fmtD(r.base||0)} · Total: ${fmtD(carrierTotal)}</div>
            </div>
            <div style="text-align:right">
              <div style="color:${profit>=0?'var(--green)':'var(--red)'};font-weight:700">${profit>=0?'+':''}${fmtD(profit)}</div>
              <div style="font-size:11px;color:${margin>=0.10?'var(--green)':'var(--red)'}">${pct(margin)} margin</div>
            </div>
          </div>`;
        }).join('');
      } else {noRates=true;}
    }
  } else if(type==='freight'){
    const q=(window._fqHistory||[]).find(q=>q.id===id);
    if(q){
      const matches=(window._fqRates||[]).filter(r=>r.active&&
        (!r.pickupZip||r.pickupZip===q.pickupZip)&&
        (!r.deliveryZip||r.deliveryZip===q.deliveryZip)&&
        (!r.mode||r.mode===q.fqMode||r.mode==='Both'))
        .sort((a,b)=>(a.rate||0)-(b.rate||0));
      if(matches.length){
        rateRows=matches.map(r=>{
          const carrierRate=parseFloat(r.rate||r.base)||0;
          const cuTotal=parseFloat(q.customerRate)||0;
          const profit=cuTotal-carrierRate;
          const margin=cuTotal>0?profit/cuTotal:0;
          const isCurrent=r.carrier===currentCarrier;
          return`<div onclick="selectCarrierChange('freight','${id}','${r.id}')"
            style="display:flex;align-items:center;justify-content:space-between;padding:12px 14px;
              border:1.5px solid ${isCurrent?'var(--steel)':'var(--gray-200)'};
              background:${isCurrent?'var(--blue-bg)':'#fff'};
              border-radius:var(--radius);cursor:pointer;margin-bottom:8px"
            onmouseover="this.style.borderColor='var(--steel)'" onmouseout="this.style.borderColor='${isCurrent?'var(--steel)':'var(--gray-200)'}'"
          >
            <div>
              <div style="font-weight:700;color:var(--navy)">${r.carrier}${isCurrent?' (current)':''}</div>
              <div style="font-size:11px;color:var(--gray-400);margin-top:2px">${r.mode||'Freight'} · ${fmtD(carrierRate)}</div>
            </div>
            <div style="text-align:right">
              <div style="color:${profit>=0?'var(--green)':'var(--red)'};font-weight:700">${profit>=0?'+':''}${fmtD(profit)}</div>
              <div style="font-size:11px;color:${margin>=0.10?'var(--green)':'var(--red)'}">${pct(margin)} margin</div>
            </div>
          </div>`;
        }).join('');
      } else {noRates=true;}
    }
  }

  $('modal-root').innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()"><div class="modal" style="max-width:480px">
    <div class="modal-title">🚛 Change Carrier</div>
    ${rateRows
      ?`<div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--gray-400);margin-bottom:10px">
          Select from your rate cards — profit shown vs current customer rate
        </div>${rateRows}
        <div style="border-top:1px solid var(--gray-200);margin-top:12px;padding-top:14px">`
      :`<div style="font-size:13px;color:var(--gray-400);margin-bottom:14px">No rate cards found for this lane. Enter a carrier name manually:</div><div>`
    }
      <div class="field" style="margin-bottom:0">
        <label>Or enter manually</label>
        <input type="text" id="new-carrier-input" value="${currentCarrier}" placeholder="Carrier name"
          list="carrier-dl-active">
        <datalist id="carrier-dl-active">
          ${(S.carriers||[]).map(c=>`<option value="${c.name}">`).join('')}
        </datalist>
      </div>
    </div>
    <div class="modal-foot">
      <button class="btn" onclick="closeModal()">Cancel</button>
      <button class="btn blue" onclick="confirmChangeCarrier('${type}','${id}',null)">✅ Update (manual)</button>
    </div>
  </div></div>`;
  setTimeout(()=>$('new-carrier-input')?.focus(),100);
}

async function selectCarrierChange(type,id,rateId){
  if(type==='drayage'){
    const q=S.quotes.find(q=>q.id===id);
    const r=S.rates.find(r=>r.id===rateId);
    if(!q||!r) return;
    const ld=q.ld||'Live';
    // Recalculate carrier rates from new rate card
    const newCarrierRates={};
    let ct=0;
    CHARGES.filter(c=>isApplicable(c,ld)).forEach(c=>{const v=Number(r[c])||0;newCarrierRates[c]=v;ct+=v;});
    newCarrierRates.total=ct;
    q.carrier=r.carrier;
    q.carrierRates={...q.carrierRates,...newCarrierRates,total:ct};
    q.profit=(q.customerRates?.total||0)-ct;
    q.profitPct=(q.customerRates?.total||0)>0?q.profit/(q.customerRates?.total||1):0;
    try{await db.from('quotes').update({carrier:r.carrier}).eq('id',id);}catch(e){}
    logAction('status_changed',`Carrier changed to ${r.carrier} (rate card)`,'shipment',id);
  } else if(type==='freight'){
    const q=(window._fqHistory||[]).find(q=>q.id===id);
    const r=(window._fqRates||[]).find(r=>r.id===rateId);
    if(!q||!r) return;
    q.carrier=r.carrier;
    q.carrierRate=parseFloat(r.rate||r.base)||0;
    q.profit=(parseFloat(q.customerRate)||0)-q.carrierRate;
    q.profitPct=(parseFloat(q.customerRate)||0)>0?q.profit/(parseFloat(q.customerRate)||1):0;
    try{await db.from('fq_quotes').update({data:q}).eq('id',id);}catch(e){}
    try{localStorage.setItem('fq_history',JSON.stringify(window._fqHistory));}catch(e){}
    logAction('status_changed',`Carrier changed to ${r.carrier} (rate card)`,'shipment',id);
  }
  closeModal();
  renderActive();
}

async function confirmChangeCarrier(type,id,rateId){
  const newCarrier=($('new-carrier-input')||{}).value?.trim();
  if(!newCarrier){alert('Enter a carrier name.');return;}
  if(type==='drayage'){
    const q=S.quotes.find(q=>q.id===id);
    if(q){
      q.carrier=newCarrier;
      try{await db.from('quotes').update({carrier:newCarrier}).eq('id',id);}catch(e){alert('Save failed: '+e.message);return;}
    }
  } else if(type==='freight'){
    const q=(window._fqHistory||[]).find(q=>q.id===id);
    if(q){
      q.carrier=newCarrier;
      try{await db.from('fq_quotes').update({data:q}).eq('id',id);}catch(e){}
      try{localStorage.setItem('fq_history',JSON.stringify(window._fqHistory));}catch(e){}
    }
  } else if(type==='transload'){
    const q=(window._tlHistory||[]).find(q=>q.id===id);
    if(q){
      q.outCarrier=newCarrier;q.drayCarrier=newCarrier;
      try{await db.from('tl_quotes').update({data:q}).eq('id',id);}catch(e){}
      try{localStorage.setItem('tl_history',JSON.stringify(window._tlHistory));}catch(e){}
    }
  }
  logAction('status_changed',`Carrier changed to ${newCarrier}`,'shipment',id);
  closeModal();
  renderActive();
}

// ── Active Shipment: delete ────────────────────────────────────────────────
async function deleteShipment(type,id){
  if(!requireCan('delete_quotes','Only Admins can delete shipments.')) return;
  if(!confirm('Delete this shipment? This cannot be undone.')) return;
  if(type==='drayage'){
    S.quotes=S.quotes.filter(q=>q.id!==id);
    try{await db.from('quotes').delete().eq('id',id);}catch(e){alert('Delete failed: '+e.message);return;}
  } else if(type==='freight'){
    window._fqHistory=(window._fqHistory||[]).filter(q=>q.id!==id);
    try{await db.from('fq_quotes').delete().eq('id',id);}catch(e){}
    try{localStorage.setItem('fq_history',JSON.stringify(window._fqHistory));}catch(e){}
  } else if(type==='transload'){
    window._tlHistory=(window._tlHistory||[]).filter(q=>q.id!==id);
    try{await db.from('tl_quotes').delete().eq('id',id);}catch(e){}
    try{localStorage.setItem('tl_history',JSON.stringify(window._tlHistory));}catch(e){}
  }
  logAction('quote_deleted',`${type} shipment deleted`,'shipment',id);
  updateActiveBadge();updateInvNavBadge();
  // Show SA-only nav items
  const pmBtn=$('nav-profit-monitor');
  if(pmBtn) pmBtn.style.display=_currentUser?.role==='super_admin'?'':'none';
  renderActive();
}
// ═══════════════════════════════════════════════════════
// COSMETIC FEATURES
// ═══════════════════════════════════════════════════════

// ── 1. Topbar live clock ──────────────────────────────
function startClock(){
  function tick(){
    const el=$('topbar-clock');if(!el) return;
    const now=new Date();
    const time=now.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit',second:'2-digit',timeZone:'America/New_York'});
    const date=now.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric',timeZone:'America/New_York'});
    el.textContent=date+' · '+time;
  }
  tick();
  setInterval(tick,1000);
}

// ── 2. Skeleton loaders ───────────────────────────────
function skelRow(cols){
  return`<tr>${cols.map(w=>`<td><div class="skel" style="height:14px;width:${w};border-radius:4px"></div></td>`).join('')}</tr>`;
}
function skelTable(rows,cols){
  const r=Array.from({length:rows},()=>skelRow(cols));
  return`<div class="tbl-wrap"><table><tbody>${r.join('')}</tbody></table></div>`;
}
function skelPage(rows=6){
  const cols=['60%','80%','40%','50%','30%','20%'];
  return`<div style="padding:8px 0">${skelTable(rows,cols)}</div>`;
}

// ── 3. Confetti on booking ────────────────────────────
function fireConfetti(){
  const canvas=document.createElement('canvas');
  canvas.style.cssText='position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:99999';
  document.body.appendChild(canvas);
  const ctx=canvas.getContext('2d');
  canvas.width=window.innerWidth;canvas.height=window.innerHeight;
  const colors=['#1a2e4a','#2e75b6','#22c55e','#f59e0b','#7c3aed','#e11d48'];
  const pieces=Array.from({length:120},()=>({
    x:Math.random()*canvas.width,y:-10-Math.random()*canvas.height*0.3,
    w:8+Math.random()*8,h:4+Math.random()*4,
    angle:Math.random()*Math.PI*2,
    vx:(Math.random()-0.5)*6,vy:3+Math.random()*5,
    va:(Math.random()-0.5)*0.2,
    color:colors[Math.floor(Math.random()*colors.length)],
    opacity:1
  }));
  let frame=0;
  function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    pieces.forEach(p=>{
      p.x+=p.vx;p.y+=p.vy;p.angle+=p.va;p.vy+=0.15;
      if(frame>80) p.opacity=Math.max(0,p.opacity-0.02);
      ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.angle);
      ctx.globalAlpha=p.opacity;ctx.fillStyle=p.color;
      ctx.fillRect(-p.w/2,-p.h/2,p.w,p.h);ctx.restore();
    });
    frame++;
    if(frame<120) requestAnimationFrame(draw);
    else document.body.removeChild(canvas);
  }
  draw();
}

// ── 4. Color-coded badge helper ───────────────────────
function modeBadge(mode){
  const map={
    'Drayage':'mode-drayage','drayage':'mode-drayage',
    'FTL':'mode-ftl','ftl':'mode-ftl',
    'LTL':'mode-ltl','ltl':'mode-ltl',
    'LCL':'mode-lcl','lcl':'mode-lcl',
    'Air':'mode-air','air':'mode-air',
    'Transload':'mode-transload','transload':'mode-transload',
  };
  const cls=map[mode]||'b';
  return`<span class="badge ${cls}">${mode}</span>`;
}

// ── 5. Status timeline helper ─────────────────────────
function statusTimeline(status){
  const steps=['Quoted','Booked','Delivered','Invoiced'];
  const idx=steps.indexOf(status);
  let html='<div class="status-timeline">';
  steps.forEach((s,i)=>{
    const done=i<idx,active=i===idx;
    html+=`<div class="pipe-dot ${done?'done':active?'active':''}" title="${s}"></div>`;
    if(i<steps.length-1) html+=`<div class="pipe-step ${done?'done':active?'active':''}"></div>`;
  });
  html+=`</div><div style="display:flex;justify-content:space-between;margin-top:4px">
    ${steps.map((s,i)=>`<div style="font-size:9px;font-weight:${steps.indexOf(status)===i?'700':'400'};color:${steps.indexOf(status)===i?'#1a2e4a':'#bbc8d4'};text-align:center;flex:1">${s}</div>`).join('')}
  </div>`;
  return html;
}


// ═══════════════════════════════════════════════════════
// DARK MODE + TRANSITIONS + NOTIFICATIONS + HOVER PREVIEW
// ═══════════════════════════════════════════════════════

// ── Dark mode ─────────────────────────────────────────
function initDarkMode(){
  if(localStorage.getItem('shifl_dark')==='1') document.body.classList.add('dark');
}
function toggleDarkMode(){
  const on=document.body.classList.toggle('dark');
  localStorage.setItem('shifl_dark',on?'1':'0');
  updateDarkBtn();
}
function updateDarkBtn(){
  const btn=$('dark-toggle');if(!btn) return;
  btn.textContent=document.body.classList.contains('dark')?'☀️ Light mode':'🌙 Dark mode';
}

// ── Smooth page transitions ────────────────────────────
let _transitioning=false;
function fadeIn(el){
  if(!el) return;
  el.style.opacity='0';el.style.transform='translateY(6px)';
  el.style.transition='opacity .18s ease, transform .18s ease';
  requestAnimationFrame(()=>{el.style.opacity='1';el.style.transform='translateY(0)';});
}
// _origRender removed (was null — dead code)
function animPage(){
  const page=$('page');
  if(page){fadeIn(page);}
}

// ── Notifications ──────────────────────────────────────
function getNotifications(){
  const notes=[];
  const today=localDateStr();
  const allQ=[
    ...(S.quotes||[]).map(q=>({...q,_type:'drayage',_amount:q.customerRates?.total||0})),
    ...(window._fqHistory||[]).map(q=>({...q,_type:'freight',_amount:q.customerRate||0})),
    ...(window._tlHistory||[]).map(q=>({...q,_type:'transload',_amount:q.totalCustomer||0})),
    ...(window._aqHistory||[]).map(q=>({...q,_type:'air',_amount:q.customerRate||0}))
  ];

  // Overdue invoices
  const overdue=allQ.filter(q=>q.status==='Invoiced'&&q.invoiceDueDate&&q.invoiceDueDate<today);
  overdue.forEach(q=>notes.push({
    type:'danger',icon:'⚠️',
    title:`Invoice overdue — ${q.customer||'—'}`,
    body:`${fmtD(q._amount)} · ${Math.floor((Date.now()-new Date(q.invoiceDueDate+'T12:00:00'))/864e5)}d past due`,
    action:()=>{S.activeView='invoicing';S.allInvTab='invoiced';goTo('active');}
  }));

  // Stale open quotes (14+ days)
  const stale=allQ.filter(q=>q.status==='Quoted'&&q.date&&Math.floor((Date.now()-new Date(q.date+'T12:00:00'))/864e5)>=14);
  if(stale.length) notes.push({
    type:'warning',icon:'⏳',
    title:`${stale.length} quote${stale.length!==1?'s':''} older than 14 days`,
    body:'These may need a follow-up or close-out',
    action:()=>{S.reportTab='pipeline';S.reportMode='All';goTo('reports');}
  });

  // Expiring soon (7-13 days old, still Quoted)
  const expiring=allQ.filter(q=>{
    if(!(q.status==='Quoted'&&q.date)) return false;
    const d=Math.floor((Date.now()-new Date(q.date+'T12:00:00'))/864e5);
    return d>=7&&d<14;
  });
  if(expiring.length) notes.push({
    type:'info',icon:'📅',
    title:`${expiring.length} quote${expiring.length!==1?'s':''} expiring soon`,
    body:'Open for 7+ days — follow up before they go cold',
    action:()=>{S.reportTab='pipeline';S.reportMode='All';goTo('reports');}
  });

  // Pending invoices
  const pending=allQ.filter(q=>q.status==='Delivered');
  if(pending.length) notes.push({
    type:'info',icon:'🧾',
    title:`${pending.length} shipment${pending.length!==1?'s':''} ready to invoice`,
    body:fmtD(pending.reduce((s,q)=>s+q._amount,0))+' waiting to be invoiced',
    action:()=>{S.activeView='invoicing';S.allInvTab='pending';goTo('active');}
  });

  return notes;
}

function renderNotifDropdown(){
  const notifs=JSON.parse(localStorage.getItem('shifl_notifs')||'[]').slice(0,20);
  const unread=notifs.filter(n=>!n.read);
  // Mark all as read on open
  const marked=notifs.map(n=>({...n,read:true}));
  localStorage.setItem('shifl_notifs',JSON.stringify(marked));
  const badge=document.getElementById('notif-badge');
  if(badge){badge.style.display='none';}

  // Group by type
  const groups={Loads:[],Billing:[],Carriers:[],General:[]};
  notifs.forEach(n=>{
    const t=n.type||'General';
    const g=groups[t]||groups.General;
    g.push(n);
  });
  // Add live system checks
  const loads=JSON.parse(localStorage.getItem('tms_loads')||'[]');
  const lateLoads=loads.filter(l=>{const m=JSON.parse(localStorage.getItem('tms_meta_'+l.id)||'{}');return m.expectedDelivery&&m.expectedDelivery<new Date().toISOString().slice(0,10)&&l.status!=='Delivered';});
  const insKeys=Object.keys(localStorage).filter(k=>k.startsWith('carrier_ins_'));
  const expiring=insKeys.filter(k=>{const d=JSON.parse(localStorage.getItem(k)||'{}');if(!d.expiry) return false;const days=Math.round((new Date(d.expiry)-new Date())/86400000);return days>=0&&days<=30;});

  const systemItems=[
    ...lateLoads.slice(0,3).map(l=>({ico:'⚠',color:'#dc2626',text:`Load <strong>${l.shiflRef||l.id}</strong> is <strong style="color:#dc2626">late</strong>`,time:'',group:'Loads',unread:true})),
    ...expiring.slice(0,2).map(k=>{const name=k.replace('carrier_ins_','');const d=JSON.parse(localStorage.getItem(k)||'{}');const days=Math.round((new Date(d.expiry)-new Date())/86400000);return{ico:'🛡️',color:'#d97706',text:`COI expiring in <strong>${days}d</strong> — ${name}`,time:'',group:'Carriers',unread:days<=7};}),
    ...(notifs.length===0?[{ico:'✓',color:'#9ca3af',text:'No new notifications',time:'',group:'General',unread:false}]:[]),
  ];

  const allItems=[...systemItems,...notifs.map(n=>({ico:n.icon||'🔔',color:n.color||'#6b7280',text:n.message||n.text||'',time:n.at?formatChatTime(n.at):'',group:n.type||'General',unread:!n.read}))];

  const groupOrder=['Loads','Billing','Carriers','General'];
  const grouped={};
  allItems.forEach(item=>{const g=item.group||'General';if(!grouped[g]) grouped[g]=[];grouped[g].push(item);});

  const groupHtml=groupOrder.filter(g=>grouped[g]&&grouped[g].length).map(g=>`
    <div style="padding:5px 12px;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#9ca3af;background:#fafafa;border-bottom:1px solid #f3f4f6;border-top:1px solid #f3f4f6">${g}</div>
    ${grouped[g].map(item=>`
      <div style="padding:9px 12px;border-bottom:1px solid #f9fafb;display:flex;gap:8px;align-items:flex-start;${item.unread?'border-left:3px solid #2563eb;':''};background:${item.unread?'#fafeff':'#fff'}">
        <div style="width:7px;height:7px;border-radius:50%;background:${item.color};margin-top:4px;flex-shrink:0"></div>
        <div style="flex:1;min-width:0">
          <div style="font-size:11.5px;color:#374151;line-height:1.4">${item.text}</div>
          ${item.time?`<div style="font-size:9px;color:#9ca3af;margin-top:2px">${item.time}</div>`:''}
        </div>
      </div>`).join('')}`).join('');

  const html=`<div style="position:fixed;top:54px;left:${$('notif-btn')?.getBoundingClientRect().left||8}px;width:280px;background:#fff;border:1px solid #e5e7eb;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,.12);z-index:9999;overflow:hidden">
    <div style="padding:9px 12px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #f3f4f6;background:#f8f9fa">
      <div style="font-size:12px;font-weight:700;color:#1e3a5f">Notifications ${unread.length>0?`<span style="background:#2563eb;color:#fff;border-radius:99px;font-size:9px;padding:1px 6px;font-weight:700">${unread.length} new</span>`:''}</div>
      <button onclick="this.closest('[style*=fixed]').remove()" style="background:none;border:none;cursor:pointer;font-size:16px;color:#9ca3af;line-height:1">×</button>
    </div>
    ${groupHtml||'<div style="padding:24px;text-align:center;color:#9ca3af;font-size:12px">All clear — no notifications</div>'}
    <div style="padding:8px 12px;background:#f8f9fa;border-top:1px solid #f3f4f6;text-align:center"><button onclick="localStorage.removeItem('shifl_notifs');this.closest('[style*=fixed]').remove()" style="font-size:11px;color:#2563eb;background:none;border:none;cursor:pointer;font-weight:600">Clear all</button></div>
  </div>`;

  // Remove any existing dropdown
  document.querySelectorAll('[style*="position:fixed"][style*="280px"]').forEach(el=>el.remove());
  document.body.insertAdjacentHTML('beforeend',html);
  setTimeout(()=>document.addEventListener('click',function _close(e){if(!e.target.closest('[style*="280px"]')&&e.target.id!=='notif-btn'){document.querySelectorAll('[style*="position:fixed"][style*="280px"]').forEach(el=>el.remove());document.removeEventListener('click',_close);}},{ once:false }),50);
}

function updateNotifBadge(){
  const badge=$('notif-badge');if(!badge) return;
  const count=getNotifications().length;
  badge.textContent=count;
  badge.style.display=count?'flex':'none';
}

// ── Quote hover preview ────────────────────────────────
let _hoverTimeout=null,_hoverEl=null;
function showQuotePreview(e,data){
  clearTimeout(_hoverTimeout);
  _hoverTimeout=setTimeout(()=>{
    hideQuotePreview();
    const preview=document.createElement('div');
    preview.id='quote-preview';
    const x=Math.min(e.clientX+16,window.innerWidth-310);
    const y=Math.min(e.clientY+8,window.innerHeight-220);
    preview.style.cssText=`position:fixed;top:${y}px;left:${x}px;width:290px;background:var(--white);border:1px solid var(--gray-200);border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,.18);z-index:9998;padding:14px 16px;pointer-events:none;animation:fadeInPreview .12s ease`;
    preview.innerHTML=`
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px">
        <div>
          <div style="font-size:13px;font-weight:800;color:var(--navy)">${data.customer||'—'}</div>
          <div style="font-size:11px;color:var(--gray-500);margin-top:2px">${data.lane||'—'}</div>
        </div>
        <span class="badge ${data.statusBadge||'a'}">${data.status||'—'}</span>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px">
        <div style="background:var(--gray-50);border-radius:6px;padding:8px 10px">
          <div style="font-size:10px;font-weight:700;text-transform:uppercase;color:var(--gray-500)">Carrier</div>
          <div style="font-size:12px;font-weight:600;color:var(--navy);margin-top:2px">${data.carrier||'—'}</div>
          <div style="font-size:11px;color:var(--gray-500)">${fmtD(data.carrierRate||0)}</div>
        </div>
        <div style="background:var(--gray-50);border-radius:6px;padding:8px 10px">
          <div style="font-size:10px;font-weight:700;text-transform:uppercase;color:var(--gray-500)">Customer</div>
          <div style="font-size:13px;font-weight:800;color:var(--steel);margin-top:2px">${fmtD(data.customerRate||0)}</div>
        </div>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;padding-top:8px;border-top:1px solid var(--gray-100)">
        <span style="font-size:11px;color:var(--gray-500)">Profit</span>
        <span style="font-size:14px;font-weight:800;color:${(data.profit||0)>=0?'var(--green)':'var(--red)'}">${(data.profit||0)>=0?'+':''}${fmtD(data.profit||0)} <span style="font-size:11px;font-weight:600">${pct(data.margin||0)}</span></span>
      </div>
      ${data.date?`<div style="font-size:10px;color:var(--gray-400);margin-top:6px">Created ${data.date}</div>`:''}
    `;
    document.body.appendChild(preview);
    _hoverEl=preview;
  },350);
}
function hideQuotePreview(){
  clearTimeout(_hoverTimeout);
  const p=$('quote-preview');if(p) p.remove();
  _hoverEl=null;
}



function togglePerContainer(charge){
  if(!S.qi.perContainerFlags) S.qi.perContainerFlags={};
  S.qi.perContainerFlags[charge]=!S.qi.perContainerFlags[charge];
  refreshCarriersAndPreview();
  refreshPricingAndPreview();
  renderQuote();
}
function getMultiplier(charge){
  const n=S.qi.containerCount||1;
  if(n<=1) return 1;
  if(!S.qi.perContainerFlags) return n;
  return S.qi.perContainerFlags[charge]!==false?n:1;
}

// ── PDF disclaimer helper ──────────────────────────────────────────
function addPDFDisclaimer(doc,y,type,W,M){
  const text=type==='drayage'
    ?'Rates exclude per diem, demurrage, detention, chassis overage, pre-pull, storage, and exam fees unless stated. Per diem/demurrage per steamship line tariff is customer responsibility.'
    :'Rates are estimates, valid 7 days, exclusive of accessorials, and subject to reweigh/reclass. Transit times are estimates and not guaranteed. Correct BOL must be tendered at pickup — Shifl is not responsible for rate increases resulting from use of an incorrect BOL. Shifl acts as a broker only.';
  const pageH=doc.internal.pageSize.getHeight();
  if(y>pageH-28) {doc.addPage();y=14;}
  doc.setDrawColor(220,230,240);doc.line(M,y,W-M,y);y+=4;
  doc.setFontSize(6.5);doc.setTextColor(140,150,165);doc.setFont('helvetica','italic');
  const lines=doc.splitTextToSize(text,W-M*2);
  lines.forEach(l=>{doc.text(l,M,y);y+=3.5;});
  doc.setFont('helvetica','normal');
  return y;
}

function countUp(el,target,duration=900,prefix='',suffix=''){
  if(!el) return;
  const start=Date.now();
  const step=()=>{
    const elapsed=Date.now()-start;
    const progress=Math.min(elapsed/duration,1);
    const ease=1-Math.pow(1-progress,3);
    const val=Math.round(target*ease);
    el.textContent=prefix+(typeof target==='number'&&target%1!==0?(val.toLocaleString()):val.toLocaleString())+suffix;
    if(progress<1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
function animateKPIs(){
  document.querySelectorAll('[data-countup]').forEach(el=>{
    const target=parseFloat(el.dataset.countup)||0;
    const prefix=el.dataset.prefix||'';
    const suffix=el.dataset.suffix||'';
    countUp(el,target,900,prefix,suffix);
  });
}
// ══════════════════════════════════════════════════════════════
// FEATURE 4: BULK STATUS UPDATE (Drayage quote log)
// ══════════════════════════════════════════════════════════════
let _bulkSelected = new Set();

function toggleBulkSelect(id, checked) {
  if(checked) _bulkSelected.add(id);
  else _bulkSelected.delete(id);
  updateBulkBar();
}

function toggleSelectAll(checked) {
  const boxes = document.querySelectorAll('.bulk-chk');
  boxes.forEach(b => {
    b.checked = checked;
    if(checked) _bulkSelected.add(b.dataset.id);
    else _bulkSelected.delete(b.dataset.id);
  });
  updateBulkBar();
}

function updateBulkBar() {
  const bar = $('bulk-action-bar');
  if(!bar) return;
  const n = _bulkSelected.size;
  bar.style.display = n > 0 ? 'flex' : 'none';
  const lbl = bar.querySelector('#bulk-count');
  if(lbl) lbl.textContent = `${n} quote${n!==1?'s':''} selected`;
}

async function bulkUpdateStatus(status) {
  if(!_bulkSelected.size) return;
  if(!confirm(`Set ${_bulkSelected.size} quote${_bulkSelected.size!==1?'s':''} to "${status}"?`)) return;
  for(const id of _bulkSelected) {
    const q = S.quotes.find(q=>q.id===id);
    if(q) {
      try { await dbUpdateQuoteStatus(id, status); q.status = status; }
      catch(e) { console.error('Bulk update error:', e); }
    }
  }
  _bulkSelected.clear();
  logAction('status_changed', `Bulk set ${_bulkSelected.size} quotes to ${status}`, 'bulk');
  renderLog();
}

// ══════════════════════════════════════════════════════════════
// FEATURE 5: QUOTE COMMENTS / NOTES THREAD
// ══════════════════════════════════════════════════════════════
function getQuoteComments(quoteId) {
  try { return JSON.parse(localStorage.getItem('qc_'+quoteId)||'[]'); } catch(e) { return []; }
}
function saveQuoteComment(quoteId, text) {
  const comments = getQuoteComments(quoteId);
  comments.push({
    id: uid(), text: text.trim(),
    user: _currentUser?.name || 'Unknown',
    ts: new Date().toLocaleString('en-US',{timeZone:'America/New_York',month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})
  });
  localStorage.setItem('qc_'+quoteId, JSON.stringify(comments));
  return comments;
}
function deleteQuoteComment(quoteId, commentId) {
  const comments = getQuoteComments(quoteId).filter(c=>c.id!==commentId);
  localStorage.setItem('qc_'+quoteId, JSON.stringify(comments));
  return comments;
}
function renderComments(quoteId) {
  const comments = getQuoteComments(quoteId);
  const el = $('comments-thread-'+quoteId);
  if(!el) return;
  el.innerHTML = comments.length ? comments.map(c=>`
    <div style="display:flex;gap:8px;padding:8px 0;border-bottom:1px solid var(--gray-100)">
      <div style="width:24px;height:24px;border-radius:50%;background:var(--steel);color:#fff;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:800;flex-shrink:0">${c.user.slice(0,2).toUpperCase()}</div>
      <div style="flex:1;min-width:0">
        <div style="display:flex;justify-content:space-between;align-items:baseline">
          <span style="font-size:12px;font-weight:700;color:var(--navy)">${c.user}</span>
          <span style="font-size:10px;color:var(--gray-400)">${c.ts}</span>
        </div>
        <div style="font-size:13px;color:var(--gray-700);margin-top:2px">${c.text}</div>
      </div>
      ${can('delete_quotes')?`<button onclick="deleteQuoteComment('${quoteId}','${c.id}');renderComments('${quoteId}')" style="background:none;border:none;color:var(--gray-300);cursor:pointer;font-size:14px;flex-shrink:0">×</button>`:''}
    </div>`).join('')
    : '<div style="font-size:12px;color:var(--gray-400);padding:8px 0">No comments yet</div>';
}
function buildCommentsSection(quoteId) {
  const comments = getQuoteComments(quoteId);
  return `<div style="margin-top:16px;padding-top:16px;border-top:1px solid var(--gray-200)">
    <div style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;color:var(--gray-500);margin-bottom:10px">
      💬 Comments ${comments.length?`<span style="background:var(--steel);color:#fff;border-radius:99px;font-size:9px;font-weight:700;padding:1px 6px;margin-left:4px">${comments.length}</span>`:''}
    </div>
    <div id="comments-thread-${quoteId}">${''}</div>
    <div style="display:flex;gap:8px;margin-top:10px">
      <input type="text" id="comment-input-${quoteId}" placeholder="Add a comment…"
        style="flex:1;padding:7px 10px;border:1px solid var(--gray-200);border-radius:var(--radius);font-size:13px"
        onkeydown="if(event.key==='Enter'){const v=this.value.trim();if(v){saveQuoteComment('${quoteId}',v);this.value='';renderComments('${quoteId}');}}">
      <button class="btn sm blue" onclick="const v=$('comment-input-${quoteId}').value.trim();if(v){saveQuoteComment('${quoteId}',v);$('comment-input-${quoteId}').value='';renderComments('${quoteId}');}">Post</button>
    </div>
  </div>`;
}

// ══════════════════════════════════════════════════════════════
// FEATURE 6: "QUOTED THIS LANE BEFORE" BANNER
// ══════════════════════════════════════════════════════════════
function buildLaneHistoryEnhanced(zip, ld) {
  if(!zip) return '';
  const matches = (S.quotes||[]).filter(q=>q.zip===zip&&q.status!=='Quoted'&&q.status!=='Draft').slice(0,3);
  if(!matches.length) return '';
  const last = matches[0];
  const daysSince = Math.floor((Date.now()-new Date(last.date+'T12:00:00'))/864e5);
  return `<div style="background:#f0f9ff;border:1.5px solid #bae6fd;border-radius:10px;padding:12px 16px">
    <div style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;color:#0369a1;margin-bottom:8px">
      🕐 You've quoted this lane before
    </div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">
      ${matches.map(q=>`
        <div style="background:#fff;border-radius:6px;padding:8px 10px;border:1px solid #e0f2fe">
          <div style="font-size:10px;color:#6b7280">${q.date} · ${q.status}</div>
          <div style="font-size:12px;font-weight:700;color:#1a2e4a;margin-top:2px">${q.carrier||'—'}</div>
          <div style="display:flex;justify-content:space-between;margin-top:4px">
            <span style="font-size:11px;color:#0369a1">${fmtD(q.customerRates?.total||0)}</span>
            <span style="font-size:11px;color:${(q.profitPct||0)>=0.15?'#16a34a':'#d97706'};font-weight:600">${pct(q.profitPct||0)}</span>
          </div>
        </div>`).join('')}
    </div>
  </div>`;
}

// ══════════════════════════════════════════════════════════════
// FEATURE 7: CLEAR DATA ON NAVIGATION (dirty state)
// ══════════════════════════════════════════════════════════════
let _dirtyState = false;
function markDirty() { _dirtyState = true; }
function clearDirty() { _dirtyState = false; }
function checkDirty(callback) {
  if(!_dirtyState) { callback(); return; }
  if(confirm('You have unsaved changes. Leave without saving?')) {
    clearDirty(); callback();
  }
}

// ══════════════════════════════════════════════════════════════
// FEATURE 8: WIN RATE BY CARRIER (added to reports)
// ══════════════════════════════════════════════════════════════
function buildCarrierWinRate() {
  const allQ = [...(S.quotes||[]).map(q=>({...q,_mode:'drayage',_carrier:q.carrier})),
    ...(window._fqHistory||[]).map(q=>({...q,_mode:'freight',_carrier:q.carrier}))];
  const byCarrier = {};
  allQ.forEach(q=>{
    if(!q._carrier) return;
    if(!byCarrier[q._carrier]) byCarrier[q._carrier]={carrier:q._carrier,total:0,booked:0,revenue:0,profit:0};
    byCarrier[q._carrier].total++;
    if(['Booked','Delivered','Invoiced','Paid'].includes(q.status)){
      byCarrier[q._carrier].booked++;
      byCarrier[q._carrier].revenue+=(q.customerRates?.total||q.customerRate||0);
      byCarrier[q._carrier].profit+=(q.profit||0);
    }
  });
  const rows = Object.values(byCarrier).sort((a,b)=>b.booked-a.booked).slice(0,15);
  if(!rows.length) return '<div class="empty"><div class="empty-ico">🚛</div><p>No carrier data yet</p></div>';
  return `<div class="tbl-wrap"><table><thead><tr>
    <th>Carrier</th><th>Quotes</th><th>Booked</th><th>Win rate</th><th>Revenue</th><th>Avg margin</th>
  </tr></thead><tbody>${rows.map(r=>{
    const wr=r.total>0?r.booked/r.total:0;
    const avgMargin=r.revenue>0?r.profit/r.revenue:0;
    return`<tr>
      <td style="font-weight:700;color:var(--navy)">${r.carrier}</td>
      <td class="muted">${r.total}</td>
      <td><span style="font-weight:700;color:var(--steel)">${r.booked}</span></td>
      <td><div style="display:flex;align-items:center;gap:6px">
        <div style="height:6px;width:60px;background:var(--gray-100);border-radius:3px">
          <div style="height:6px;width:${Math.round(wr*60)}px;background:${wr>=0.5?'var(--green)':'var(--amber)'};border-radius:3px"></div>
        </div>
        <span style="font-weight:700;color:${wr>=0.5?'var(--green)':'var(--amber)'}">${pct(wr)}</span>
      </div></td>
      <td class="money">${fmtD(r.revenue)}</td>
      <td style="font-weight:700;color:${avgMargin>=0.15?'var(--green)':'var(--amber)'}">${pct(avgMargin)}</td>
    </tr>`;}).join('')}</tbody></table></div>`;
}

// ══════════════════════════════════════════════════════════════
// FEATURE 9: MARGIN TREND BY CUSTOMER
// ══════════════════════════════════════════════════════════════
function buildCustomerMarginTrend() {
  const allQ = [...(S.quotes||[]).map(q=>({...q,_cust:q.customer,_revenue:q.customerRates?.total||0,_profit:q.profit||0,_margin:q.profitPct||0})),
    ...(window._fqHistory||[]).map(q=>({...q,_cust:q.customer,_revenue:q.customerRate||0,_profit:q.profit||0,_margin:q.profitPct||0}))];
  const byCust = {};
  allQ.forEach(q=>{
    if(!q._cust||!['Booked','Delivered','Invoiced','Paid'].includes(q.status)) return;
    if(!byCust[q._cust]) byCust[q._cust]={cust:q._cust,loads:0,revenue:0,profit:0,margins:[]};
    byCust[q._cust].loads++;
    byCust[q._cust].revenue+=q._revenue;
    byCust[q._cust].profit+=q._profit;
    byCust[q._cust].margins.push({date:q.date,m:q._margin});
  });
  const rows = Object.values(byCust).sort((a,b)=>b.revenue-a.revenue).slice(0,12);
  if(!rows.length) return '<div class="empty"><div class="empty-ico">👥</div><p>No customer data yet</p></div>';
  return `<div class="tbl-wrap"><table><thead><tr>
    <th>Customer</th><th>Loads</th><th>Revenue</th><th>Avg margin</th><th>Trend</th>
  </tr></thead><tbody>${rows.map(r=>{
    const avgM=r.revenue>0?r.profit/r.revenue:0;
    const sorted=r.margins.sort((a,b)=>a.date.localeCompare(b.date));
    const recentAvg=sorted.slice(-3).reduce((s,x)=>s+x.m,0)/Math.max(1,sorted.slice(-3).length);
    const oldAvg=sorted.slice(0,-3).reduce((s,x)=>s+x.m,0)/Math.max(1,sorted.slice(0,-3).length);
    const trend=sorted.length>=4?(recentAvg>oldAvg+0.01?'↑':recentAvg<oldAvg-0.01?'↓':'→'):'—';
    return`<tr>
      <td style="font-weight:700;color:var(--navy)">${r.cust}</td>
      <td class="muted">${r.loads}</td>
      <td class="money">${fmtD(r.revenue)}</td>
      <td style="font-weight:700;color:${avgM>=0.15?'var(--green)':'var(--amber)'}">${pct(avgM)}</td>
      <td style="font-size:18px;font-weight:900;color:${trend==='↑'?'var(--green)':trend==='↓'?'var(--red)':'var(--gray-400)'}">${trend}</td>
    </tr>`;}).join('')}</tbody></table></div>`;
}


// ══════════════════════════════════════════════════════════════
// FEATURE 10: QUOTE TEMPLATES
// ══════════════════════════════════════════════════════════════
function getTemplates(mode) {
  try { return JSON.parse(localStorage.getItem('qtpl_'+mode)||'[]'); } catch(e) { return []; }
}
function saveTemplate(mode, name, data) {
  const tpls = getTemplates(mode);
  tpls.push({id:uid(), name, data, created:localDateStr()});
  localStorage.setItem('qtpl_'+mode, JSON.stringify(tpls));
}
function deleteTemplate(mode, id) {
  const tpls = getTemplates(mode).filter(t=>t.id!==id);
  localStorage.setItem('qtpl_'+mode, JSON.stringify(tpls));
}

function showSaveTemplateModal(mode) {
  $('modal-root').innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()"><div class="modal" style="max-width:500px">
    <div class="modal-title">💾 Save as template</div>
    <div class="field"><label>Template name *</label>
      <input type="text" id="tpl-name" placeholder="e.g. NY/NJ → 07728 Live" autofocus>
    </div>
    <p style="font-size:12px;color:var(--gray-500)">Saves the current lane, carrier markup settings, and flat rates as a reusable template.</p>
    <div class="modal-foot">
      <button class="btn" onclick="closeModal()">Cancel</button>
      <button class="btn blue" onclick="confirmSaveTemplate('${mode}')">Save template</button>
    </div>
  </div></div>`;
  setTimeout(()=>$('tpl-name')?.focus(),100);
}

function confirmSaveTemplate(mode) {
  const name = ($('tpl-name')||{}).value?.trim();
  if(!name) { alert('Enter a template name.'); return; }
  let data = {};
  if(mode==='drayage') data = {port:S.qi.port, zip:S.qi.zip, ld:S.qi.ld, drayType:S.qi.drayType, baseMarkup:{...S.qi.baseMarkup}, flatRates:{...S.qi.flatRates}};
  else if(mode==='freight') data = {fqMode:S.fq.mode, equipment:S.fq.equipment, pickupZip:S.fq.pickupZip, deliveryZip:S.fq.deliveryZip};
  saveTemplate(mode, name, data);
  closeModal();
  alert('✅ Template "'+name+'" saved!');
}

function loadTemplate(mode, id) {
  const tpl = getTemplates(mode).find(t=>t.id===id);
  if(!tpl) return;
  if(mode==='drayage') {
    Object.assign(S.qi, tpl.data);
    clearDirty(); renderQuote();
  } else if(mode==='freight') {
    S.fq.mode = tpl.data.fqMode;
    S.fq.equipment = tpl.data.equipment;
    S.fq.pickupZip = tpl.data.pickupZip;
    S.fq.deliveryZip = tpl.data.deliveryZip;
    renderFreight();
  }
  showToast('Template "'+tpl.name+'" loaded');
}

function renderTemplates(mode) {
  const tpls = getTemplates(mode);
  const modeLabels = {drayage:'🚢 Drayage',freight:'🚛 Freight',air:'✈️ Air',transload:'🔄 Transload'};
  $('topbar-right').innerHTML=`<button class="btn blue" onclick="showSaveTemplateModal('${mode}')">+ Save current as template</button>`;
  $('page').innerHTML=`
    <div style="margin-bottom:16px;display:flex;align-items:center;justify-content:space-between">
      <div>
        <div style="font-size:18px;font-weight:800;color:var(--navy)">${modeLabels[mode]||mode} Templates</div>
        <div style="font-size:13px;color:var(--gray-500);margin-top:2px">Saved quote configurations — one click to load into the quote builder</div>
      </div>
    </div>
    ${tpls.length===0
      ?`<div class="empty"><div class="empty-ico">📋</div>
          <p style="font-size:15px;font-weight:700;color:var(--gray-500)">No templates yet</p>
          <p style="font-size:13px;color:var(--gray-400)">Build a quote and click "+ Save current as template" to save it here</p>
        </div>`
      :`<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px">
          ${tpls.map(t=>`
            <div style="background:#fff;border:1.5px solid var(--gray-200);border-radius:12px;padding:18px 20px">
              <div style="font-size:14px;font-weight:800;color:var(--navy);margin-bottom:4px">${t.name}</div>
              <div style="font-size:11px;color:var(--gray-400);margin-bottom:14px">Saved ${t.created}</div>
              ${t.data.port?`<div style="font-size:12px;color:var(--gray-600);margin-bottom:2px">Port: ${t.data.port}</div>`:''}
              ${t.data.zip?`<div style="font-size:12px;color:var(--gray-600);margin-bottom:2px">ZIP: ${t.data.zip} · ${t.data.ld||''}</div>`:''}
              ${t.data.pickupZip?`<div style="font-size:12px;color:var(--gray-600);margin-bottom:2px">${t.data.pickupZip} → ${t.data.deliveryZip||'—'}</div>`:''}
              <div style="display:flex;gap:8px;margin-top:14px">
                <button class="btn sm blue" onclick="loadTemplate('${mode}','${t.id}');${mode==='drayage'?"setView('quote');openAccFor('quote')":`setView('${mode}');openAccFor('${mode}')`}" style="flex:1">Load →</button>
                <button class="btn sm" onclick="if(confirm('Delete this template?')){deleteTemplate('${mode}','${t.id}');renderTemplates('${mode}')}" style="color:var(--red);border-color:#fca5a5">🗑️</button>
              </div>
            </div>`).join('')}
        </div>`}`;
}

// ══════════════════════════════════════════════════════════════
// FEATURE 11: TOAST NOTIFICATIONS
// ══════════════════════════════════════════════════════════════
// Close coming-soon dropdown on outside click
document.addEventListener('click',function(e){
  const dd=document.getElementById('cs-dropdown-menu');
  const wrap=document.getElementById('cs-dropdown-wrap');
  if(dd&&wrap&&!wrap.contains(e.target)) dd.classList.remove('open');
});

function showToast(msg, type='success', duration=3500){
  const colors={success:'#059669',error:'#dc2626',warn:'#d97706',info:'#2563eb'};
  const bg=colors[type]||colors.success;
  let container=document.getElementById('toast-container');
  if(!container){
    container=document.createElement('div');
    container.id='toast-container';
    container.style.cssText='position:fixed;bottom:20px;right:20px;z-index:99999;display:flex;flex-direction:column;gap:6px;max-width:320px';
    document.body.appendChild(container);
  }
  const t=document.createElement('div');
  t.style.cssText='background:'+bg+';color:#fff;border-radius:10px;padding:10px 14px;font-size:13px;font-family:inherit;display:flex;align-items:center;gap:8px;box-shadow:0 4px 16px rgba(0,0,0,.2);animation:toastIn .2s ease';
  t.innerHTML='<span style="flex:1">'+msg+'</span><button onclick="this.parentElement.remove()" style="background:none;border:none;color:rgba(255,255,255,.7);cursor:pointer;font-size:16px;line-height:1;padding:0">×</button>';
  container.appendChild(t);
  setTimeout(()=>{t.style.opacity='0';t.style.transition='opacity .3s';setTimeout(()=>t.remove(),300);},duration);
}

// ══════════════════════════════════════════════════════════════
// FEATURE 12: LANE HEAT MAP (in reports)
// ══════════════════════════════════════════════════════════════
function buildLaneHeatMap() {
  const allQ = [...(S.quotes||[]).map(q=>({zip:q.zip,port:q.port,revenue:q.customerRates?.total||0,profit:q.profit||0,status:q.status,type:'drayage'}))];
  const byZip = {};
  allQ.forEach(q=>{
    if(!q.zip) return;
    if(!byZip[q.zip]) byZip[q.zip]={zip:q.zip,quotes:0,booked:0,revenue:0,profit:0,ports:new Set()};
    byZip[q.zip].quotes++;
    if(['Booked','Delivered','Invoiced','Paid'].includes(q.status)){
      byZip[q.zip].booked++;
      byZip[q.zip].revenue+=q.revenue;
      byZip[q.zip].profit+=q.profit;
    }
    if(q.port) byZip[q.zip].ports.add(q.port);
  });
  const rows = Object.values(byZip).map(r=>({...r,winRate:r.quotes>0?r.booked/r.quotes:0,avgMargin:r.revenue>0?r.profit/r.revenue:0,ports:[...r.ports]})).sort((a,b)=>b.quotes-a.quotes).slice(0,20);
  if(!rows.length) return '<div class="empty"><div class="empty-ico">🗺️</div><p>No lane data yet</p></div>';
  const maxQ = rows[0].quotes;
  return `<div class="tbl-wrap"><table><thead><tr>
    <th>ZIP</th><th>Ports served</th><th>Activity</th><th>Quotes</th><th>Win rate</th><th>Revenue</th><th>Avg margin</th>
  </tr></thead><tbody>${rows.map(r=>`
    <tr>
      <td style="font-size:15px;font-weight:900;color:var(--navy);font-family:monospace">${r.zip}</td>
      <td style="font-size:11px;color:var(--gray-500)">${r.ports.slice(0,2).join(', ')}</td>
      <td>
        <div style="background:var(--gray-100);border-radius:3px;height:8px;width:100px">
          <div style="background:${r.winRate>=0.5?'var(--steel)':'var(--amber)'};height:8px;border-radius:3px;width:${Math.round((r.quotes/maxQ)*100)}%"></div>
        </div>
      </td>
      <td style="font-weight:700">${r.quotes}</td>
      <td style="font-weight:700;color:${r.winRate>=0.5?'var(--green)':'var(--amber)'}">${pct(r.winRate)}</td>
      <td class="money">${fmtD(r.revenue)}</td>
      <td style="font-weight:700;color:${r.avgMargin>=0.15?'var(--green)':'var(--amber)'}">${pct(r.avgMargin)}</td>
    </tr>`).join('')}</tbody></table></div>`;
}


// ════════════════════════════════════════════════════════════════════
// FULL INVOICING SYSTEM — DRAYAGE + TRANSLOAD
// Only appears after shipment is marked Delivered
// ════════════════════════════════════════════════════════════════════

function getInvoice(id){ return (S.invoices||{})[id]||null; }
function saveInvoice(id, inv){
  if(!S.invoices) S.invoices={};
  S.invoices[id]=inv;
  try{localStorage.setItem('shifl_invoices',JSON.stringify(S.invoices));}catch(e){}
  // Push to Supabase shipment_metadata so it persists across devices
  try{saveTMSMeta(id,{customerInvoice:inv,invNum:inv.invNum,invGrandTotal:inv.grandTotal,invSavedAt:inv.savedAt});}catch(e){}
}
function loadInvoices(){
  try{const d=localStorage.getItem('shifl_invoices');if(d) S.invoices=JSON.parse(d);}catch(e){S.invoices={};}
}

function openInvoiceBuilder(type, id){
  // Freight routes to existing invoice flow
  if(type==='freight'){
    const idx=(window._fqHistory||[]).findIndex(q=>q.id===id);
    if(idx>=0){fqSendInvoice(idx);return;}
    alert('Freight shipment not found.');return;
  }
  // Air — build a synthetic quote object and fall through to the builder
  if(type==='air'){
    const aq=(window._aqHistory||[]).find(x=>x.id===id);
    if(!aq){alert('Air shipment not found.');return;}
    if(aq.status!=='Delivered'){alert('Invoices can only be created after delivery.');return;}
    const existing=getInvoice(id)||{};
    const invNum=existing.invNum||'INV-AIR-'+Date.now().toString().slice(-5);
    const today=localDateStr();
    const due30=new Date(Date.now()+30*864e5).toISOString().slice(0,10);
    const baseAmt=aq.customerRate||0;
    const baseCharges=[{key:'base',label:'Air freight — customer rate',amount:baseAmt,locked:true}];
    const ACC=[
      {key:'prepull',label:'Pre-pull / handling',note:'Flat charge'},
      {key:'toll',label:'Fuel surcharge',note:'If applicable'},
      {key:'det_port',label:'Detention at origin',note:'Per hour'},
      {key:'det_cust',label:'Detention at delivery',note:'Per hour'},
      {key:'storage',label:'Storage',note:'Per day'},
    ];
    const HOURLY=['det_port','det_cust'];
    const DAILY=['storage'];
    const saved=existing.accessorials||{};
    const rows=ACC.map(a=>{
      const sv=saved[a.key]||{};
      const isChecked=sv.enabled||false;
      const isHourly=HOURLY.includes(a.key);
      const isDaily=DAILY.includes(a.key);
      let detail='';
      if(isHourly){const fH=sv.freeHrs??2,tH=sv.totalHrs||0,rH=sv.rate||75;detail=`<div class="inv-acc-detail" id="acc-detail-${a.key}" style="display:${isChecked?'grid':'none'};grid-template-columns:1fr 1fr 1fr;gap:8px;margin-top:8px;padding:10px;background:var(--gray-50);border-radius:6px"><div><div class="inv-sm-lbl">Free hrs</div><input type="number" id="acc-free-${a.key}" value="${fH}" min="0" step="0.5" oninput="calcAccHourly('${a.key}')" style="width:100%;padding:5px 7px;font-size:12px"></div><div><div class="inv-sm-lbl">Total hrs</div><input type="number" id="acc-hrs-${a.key}" value="${tH}" min="0" step="0.5" oninput="calcAccHourly('${a.key}')" style="width:100%;padding:5px 7px;font-size:12px"></div><div><div class="inv-sm-lbl">Rate/hr</div><input type="number" id="acc-rate-${a.key}" value="${rH}" min="0" oninput="calcAccHourly('${a.key}')" style="width:100%;padding:5px 7px;font-size:12px"></div><div style="grid-column:1/-1;font-size:11px;color:var(--amber)" id="acc-calc-${a.key}"></div></div>`;}
      else if(isDaily){const fD=sv.freeDays??0,tD=sv.totalDays||0,rD=sv.rate||50;detail=`<div class="inv-acc-detail" id="acc-detail-${a.key}" style="display:${isChecked?'grid':'none'};grid-template-columns:1fr 1fr 1fr;gap:8px;margin-top:8px;padding:10px;background:var(--gray-50);border-radius:6px"><div><div class="inv-sm-lbl">Free days</div><input type="number" id="acc-free-${a.key}" value="${fD}" min="0" oninput="calcAccDaily('${a.key}')" style="width:100%;padding:5px 7px;font-size:12px"></div><div><div class="inv-sm-lbl">Total days</div><input type="number" id="acc-days-${a.key}" value="${tD}" min="0" oninput="calcAccDaily('${a.key}')" style="width:100%;padding:5px 7px;font-size:12px"></div><div><div class="inv-sm-lbl">Rate/day</div><input type="number" id="acc-rate-${a.key}" value="${rD}" min="0" oninput="calcAccDaily('${a.key}')" style="width:100%;padding:5px 7px;font-size:12px"></div><div style="grid-column:1/-1;font-size:11px;color:var(--amber)" id="acc-calc-${a.key}"></div></div>`;}
      else{const flatAmt=sv.amount||0;}
      return `<div style="padding:10px 0;border-bottom:1px solid var(--gray-100)"><div style="display:flex;align-items:center;gap:10px"><input type="checkbox" id="acc-chk-${a.key}" ${isChecked?'checked':''} onchange="toggleAccRow('${a.key}',this.checked,${isHourly},${isDaily},false)" style="flex-shrink:0"><div style="flex:1"><label for="acc-chk-${a.key}" style="font-size:13px;font-weight:600;color:var(--navy);cursor:pointer">${a.label}</label><div style="font-size:11px;color:var(--gray-400)">${a.note}</div></div>${!isHourly&&!isDaily?`<input type="number" id="acc-flat-${a.key}" value="${isChecked?(sv.amount||''):''}" placeholder="0" min="0" oninput="calcInvTotal()" style="width:80px;padding:5px 7px;font-size:13px;text-align:right;${!isChecked?'opacity:.4':''}" ${!isChecked?'disabled':''}>`:`<span id="acc-amt-${a.key}" style="font-size:13px;font-weight:700;color:var(--navy);min-width:70px;text-align:right">—</span>`}</div>${detail}</div>`;
    }).join('');
    $('modal-root').innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()"><div class="modal" style="max-width:600px;max-height:90vh;overflow-y:auto"><style>.inv-sm-lbl{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--gray-400);margin-bottom:4px}</style><div class="modal-title">🧾 Air freight invoice — ${aq.customer||'—'}</div><div class="modal-body"><div style="background:var(--blue-bg);border-radius:var(--radius);padding:8px 12px;margin-bottom:14px;font-size:12px;color:var(--gray-600)">${aq.originAirport||'—'} → ${aq.deliveryZip||'—'} · ${aq.carrier||'—'}</div><div class="g3" style="margin-bottom:14px"><div class="field"><label>Invoice #</label><input type="text" id="inv-num" value="${invNum}"></div><div class="field"><label>Invoice date</label><input type="date" id="inv-date" value="${today}"></div><div class="field"><label>Due date</label><input type="date" id="inv-due" value="${due30}"></div></div><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--gray-400);margin-bottom:8px">Base charges</div><div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--gray-100);opacity:.8"><span style="font-size:13px;color:var(--navy)">Air freight — customer rate <span style="font-size:10px;background:var(--gray-100);padding:1px 7px;border-radius:99px;color:var(--gray-500)">locked</span></span><span style="font-size:14px;font-weight:700;color:var(--navy)">${fmtD(baseAmt)}</span></div><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--gray-400);margin:14px 0 8px">Additional charges</div>${rows}<div style="margin-top:14px;padding:12px 14px;background:var(--gray-50);border-radius:var(--radius)"><div style="display:flex;justify-content:space-between;margin-bottom:6px;font-size:13px;color:var(--gray-600)"><span>Base</span><span>${fmtD(baseAmt)}</span></div><div style="display:flex;justify-content:space-between;margin-bottom:10px;font-size:13px;color:var(--gray-600)"><span>Additional</span><span id="inv-acc-total">$0.00</span></div><div style="display:flex;justify-content:space-between;padding-top:10px;border-top:1px solid var(--gray-200)"><span style="font-size:16px;font-weight:700;color:var(--navy)">Total due</span><span style="font-size:20px;font-weight:800;color:var(--steel)" id="inv-grand-total">${fmtD(baseAmt)}</span></div></div><div class="field" style="margin-top:14px"><label>Notes</label><input type="text" id="inv-notes" value="${existing.notes||''}" placeholder="Net 30, factoring..."></div></div><div class="modal-foot"><button class="btn" onclick="closeModal()">Cancel</button><button class="btn blue" onclick="saveInvoiceData('air','${id}')">📤 Send to SHIFL</button></div></div></div>`;
    setTimeout(()=>{window._invBaseTotal=baseAmt;window._invType='air';window._invId=id;calcInvTotal();HOURLY.forEach(k=>{if(document.getElementById('acc-chk-'+k)?.checked)calcAccHourly(k);});DAILY.forEach(k=>{if(document.getElementById('acc-chk-'+k)?.checked)calcAccDaily(k);});},50);
    return;
  }

  // Only allow if status is Delivered
  let q=null;
  if(type==='drayage') q=S.quotes.find(x=>x.id===id);
  else if(type==='transload') q=(window._tlHistory||[]).find(x=>x.id===id);
  if(!q){alert('Shipment not found.');return;}
  if(q.status!=='Delivered'){alert('Invoices can only be created after a shipment is marked as Delivered.');return;}

  const existing=getInvoice(id)||{};
  const invNum=existing.invNum||'INV-'+(type==='drayage'?'DR':'TL')+'-'+Date.now().toString().slice(-5);
  const today=localDateStr();
  const due30=new Date(Date.now()+30*864e5).toISOString().slice(0,10);

  // Base charges — ONLY the base rate, not the total
  const baseCharges=type==='drayage'?[
    {key:'base',label:'Base drayage rate',amount:(()=>{
      const cr=q.customerRates||{};
      // Use explicit base if stored, otherwise fall back to total
      if(cr.base && cr.base>0) return cr.base;
      if(cr.total && cr.total>0) return cr.total;
      return q.profitPct>0?(q.profit/q.profitPct)*(1-q.profitPct)||0:0;
    })(),locked:true},
  ]:[
    {key:'tlBase',label:'Transload service',amount:q.totalCustomer||0,locked:true},
  ];

  const qRates=q.customerRates||{};
  const ACC=[
    {key:'chassis',label:'Chassis',note:'Per day'},
    {key:'prepull',label:'Pre-pull',note:'Container staged before appointment'},
    {key:'det_port',label:'Detention — port',note:'Waiting time at port, per hour'},
    {key:'det_cust',label:'Detention — customer',note:'Waiting time at customer, per hour'},
    {key:'storage',label:'Storage',note:'Per day'},
    {key:'ovw43',label:'Overweight (43k lb)',note:'Flat charge'},
    {key:'ovw48',label:'Overweight (48k lb)',note:'Flat charge'},
    {key:'toll',label:'Toll',note:'If applicable'},
    {key:'bobtail',label:'Bobtail',note:'Drop moves — flat'},
    {key:'genset',label:'Genset',note:'Per move — carrier + customer rate'},
    {key:'triaxle',label:'Triaxle',note:'Per move — carrier + customer rate'},
  ];

  const HOURLY=['det_port','det_cust'];
  const DAILY=['storage','chassis'];
  const DUAL=['genset','triaxle','bobtail'];

  const saved=existing.accessorials||{};

  const rows=ACC.map(a=>{
    const quotedCarrier=type==='drayage'?(q.carrierRates?.[a.key]||0):0;
    const quotedAmt=type==='drayage'?qRates[a.key]||0:0;
    const sv=saved[a.key]||{};
    const isChecked=sv.enabled!==undefined?sv.enabled:quotedAmt>0;
    const isHourly=HOURLY.includes(a.key);
    const isDaily=DAILY.includes(a.key);
    const isDual=DUAL.includes(a.key);

    let detail='';
    if(isDual){
      const carrierRate=sv.carrierRate||quotedCarrier||0;
      const customerRate=sv.amount||quotedAmt||0;
      detail=`<div class="inv-acc-detail" id="acc-detail-${a.key}" style="display:${isChecked?'grid':'none'};grid-template-columns:1fr 1fr;gap:8px;margin-top:8px;padding:10px;background:var(--gray-50);border-radius:6px">
        <div><div class="inv-sm-lbl">Carrier rate ($)</div><input type="number" id="acc-carrier-${a.key}" value="${carrierRate}" min="0" placeholder="0" oninput="calcInvTotal()" style="width:100%;padding:5px 7px;font-size:12px"></div>
        <div><div class="inv-sm-lbl">Customer rate ($)</div><input type="number" id="acc-flat-${a.key}" value="${customerRate}" min="0" placeholder="0" oninput="calcInvTotal()" style="width:100%;padding:5px 7px;font-size:12px"></div>
      </div>`;
    } else if(isHourly){
      const freeHrs=sv.freeHrs??2;
      const totalHrs=sv.totalHrs||0;
      const rate=sv.rate||quotedAmt||75;
      detail=`<div class="inv-acc-detail" id="acc-detail-${a.key}" style="display:${isChecked?'grid':'none'};grid-template-columns:1fr 1fr 1fr;gap:8px;margin-top:8px;padding:10px;background:var(--gray-50);border-radius:6px">
        <div><div class="inv-sm-lbl">Free time (hrs)</div><input type="number" id="acc-free-${a.key}" value="${freeHrs}" min="0" step="0.5" oninput="calcAccHourly('${a.key}')" style="width:100%;padding:5px 7px;font-size:12px"></div>
        <div><div class="inv-sm-lbl">Total hours</div><input type="number" id="acc-hrs-${a.key}" value="${totalHrs}" min="0" step="0.5" oninput="calcAccHourly('${a.key}')" style="width:100%;padding:5px 7px;font-size:12px"></div>
        <div><div class="inv-sm-lbl">Rate ($/hr)</div><input type="number" id="acc-rate-${a.key}" value="${rate}" min="0" oninput="calcAccHourly('${a.key}')" style="width:100%;padding:5px 7px;font-size:12px"></div>
        <div style="grid-column:1/-1;font-size:11px;color:var(--amber)" id="acc-calc-${a.key}"></div>
      </div>`;
    } else if(isDaily){
      const freeDays=sv.freeDays??3;
      const totalDays=sv.totalDays||0;
      const rate=sv.rate||quotedAmt||50;
      detail=`<div class="inv-acc-detail" id="acc-detail-${a.key}" style="display:${isChecked?'grid':'none'};grid-template-columns:1fr 1fr 1fr;gap:8px;margin-top:8px;padding:10px;background:var(--gray-50);border-radius:6px">
        <div><div class="inv-sm-lbl">Free days</div><input type="number" id="acc-free-${a.key}" value="${freeDays}" min="0" oninput="calcAccDaily('${a.key}')" style="width:100%;padding:5px 7px;font-size:12px"></div>
        <div><div class="inv-sm-lbl">Total days</div><input type="number" id="acc-days-${a.key}" value="${totalDays}" min="0" oninput="calcAccDaily('${a.key}')" style="width:100%;padding:5px 7px;font-size:12px"></div>
        <div><div class="inv-sm-lbl">Rate ($/day)</div><input type="number" id="acc-rate-${a.key}" value="${rate}" min="0" oninput="calcAccDaily('${a.key}')" style="width:100%;padding:5px 7px;font-size:12px"></div>
        <div style="grid-column:1/-1;font-size:11px;color:var(--amber)" id="acc-calc-${a.key}"></div>
      </div>`;
    }

    const flatAmt=sv.amount!==undefined?sv.amount:quotedAmt;

    return `<div style="padding:10px 0;border-bottom:1px solid var(--gray-100)">
      <div style="display:flex;align-items:center;gap:10px">
        <input type="checkbox" id="acc-chk-${a.key}" ${isChecked?'checked':''} onchange="toggleAccRow('${a.key}',this.checked,${isHourly},${isDaily},${isDual})" style="flex-shrink:0">
        <div style="flex:1">
          <label for="acc-chk-${a.key}" style="font-size:13px;font-weight:600;color:var(--navy);cursor:pointer">${a.label}</label>
          ${quotedAmt>0?`<span style="font-size:10px;background:var(--blue-bg);color:var(--steel);padding:1px 7px;border-radius:99px;margin-left:6px;font-weight:600">Quoted ${fmtD(quotedAmt)}</span>`:''}
          <div style="font-size:11px;color:var(--gray-400)">${a.note}</div>
        </div>
        ${!isHourly&&!isDaily?`<input type="number" id="acc-flat-${a.key}" value="${isChecked?flatAmt:''}" placeholder="0" min="0" oninput="calcInvTotal()" style="width:80px;padding:5px 7px;font-size:13px;text-align:right;${!isChecked?'opacity:.4':''}" ${!isChecked?'disabled':''}>`:
        `<span id="acc-amt-${a.key}" style="font-size:13px;font-weight:700;color:var(--navy);min-width:70px;text-align:right">${isChecked&&quotedAmt>0?fmtD(quotedAmt):'—'}</span>`}
      </div>
      ${detail}
    </div>`;
  }).join('');

  // Custom line item
  const custom=saved.custom||{};
  const baseTotal=baseCharges.reduce((s,c)=>s+c.amount,0);

  $('modal-root').innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()">
  <div class="modal" style="max-width:600px;max-height:90vh;overflow-y:auto">
    <style>
      .inv-sm-lbl{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--gray-400);margin-bottom:4px}
    </style>
    <!-- Invoice type tabs -->
    <div style="display:flex;gap:0;margin-bottom:18px;border-bottom:2px solid var(--gray-100)">
      <div style="padding:10px 20px;font-size:14px;font-weight:700;color:var(--navy);border-bottom:2px solid var(--navy);margin-bottom:-2px">🧾 Customer invoice</div>
      <div style="padding:10px 20px;font-size:14px;font-weight:700;color:var(--gray-400);cursor:pointer" onclick="closeModal();setTimeout(()=>openCarrierInvoiceBuilder('${type}','${id}'),50)">🚛 Carrier invoice (AP)</div>
    </div>
    <div style="font-size:12px;font-weight:600;color:var(--steel);background:var(--blue-bg);padding:6px 12px;border-radius:var(--radius);margin-bottom:14px">📥 Accounts Receivable — what ${q.customer||'customer'} owes Shifl</div>

    <div style="background:var(--blue-bg);border-radius:var(--radius);padding:10px 14px;margin-bottom:16px;display:flex;justify-content:space-between;font-size:12px">
      <span style="color:var(--gray-600)">${type==='drayage'?(q.port||'—')+' → '+(q.zip||'—'):(q.drayPort||'—')+' → '+(q.outDeliveryZip||'—')} · ${q.carrier||q.drayCarrier||'—'}</span>
      <span style="color:var(--steel);font-weight:700">Status: ${q.status}</span>
    </div>

    <div class="g3" style="margin-bottom:14px">
      <div class="field"><label>Invoice # *</label><input type="text" id="inv-num" value="${existing.invNum||invNum}"></div>
      <div class="field"><label>Invoice date</label><input type="date" id="inv-date" value="${existing.invDate||today}"></div>
      <div class="field"><label>Due date</label><input type="date" id="inv-due" value="${existing.invDue||due30}"></div>
    </div>

    <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--gray-400);margin-bottom:8px">Base charges (from quote)</div>
    ${baseCharges.map(c=>`<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--gray-100);opacity:.75">
      <span style="font-size:13px;font-weight:500;color:var(--navy)">${c.label} <span style="font-size:10px;background:var(--gray-100);padding:1px 7px;border-radius:99px;color:var(--gray-500)">locked</span></span>
      <span style="font-size:14px;font-weight:700;color:var(--navy)">${fmtD(c.amount)}</span>
    </div>`).join('')}

    <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--gray-400);margin:16px 0 0">Accessorial charges</div>
    <div style="font-size:11px;color:var(--gray-400);margin-bottom:8px">Check any that apply — items with free time calculate billable amounts automatically</div>
    ${rows}

    <div id="custom-charges-container">
      ${(existing.customCharges||[{desc:'',amount:0,enabled:false}]).map((cc,ci)=>`
      <div style="padding:10px 0;border-bottom:1px solid var(--gray-100)" id="custom-row-${ci}">
        <div style="display:flex;align-items:center;gap:10px">
          <input type="checkbox" id="acc-chk-custom-${ci}" ${cc.enabled?'checked':''} onchange="toggleCustomCharge(${ci},this.checked)" style="flex-shrink:0">
          <input type="text" id="custom-desc-${ci}" value="${cc.desc||''}" placeholder="Charge description (e.g. Exam fee, Per diem...)" style="flex:1;padding:5px 8px;font-size:13px;border:1px solid var(--gray-200);border-radius:var(--radius);${!cc.enabled?'opacity:.4':''}">
          <input type="number" id="acc-flat-custom-${ci}" value="${cc.amount||''}" placeholder="$0" min="0" oninput="calcInvTotal()" style="width:80px;padding:5px 7px;font-size:13px;text-align:right;${!cc.enabled?'opacity:.4':''}">
        </div>
      </div>`).join('')}
    </div>
    <button type="button" onclick="addCustomCharge()" style="width:100%;padding:8px;border:1.5px dashed var(--gray-300);background:transparent;border-radius:var(--radius);font-size:13px;color:var(--gray-500);cursor:pointer;margin-top:6px">+ Add another charge</button>

    <div style="margin-top:14px;padding:12px 14px;background:var(--gray-50);border-radius:var(--radius)">
      <div style="display:flex;justify-content:space-between;margin-bottom:6px;font-size:13px;color:var(--gray-600)">
        <span>Base</span><span>${fmtD(baseTotal)}</span>
      </div>
      <div style="display:flex;justify-content:space-between;margin-bottom:10px;font-size:13px;color:var(--gray-600)">
        <span>Accessorials</span><span id="inv-acc-total">$0.00</span>
      </div>
      <div style="display:flex;justify-content:space-between;padding-top:10px;border-top:1px solid var(--gray-200)">
        <span style="font-size:16px;font-weight:700;color:var(--navy)">Total due</span>
        <span style="font-size:20px;font-weight:800;color:var(--steel)" id="inv-grand-total">${fmtD(baseTotal)}</span>
      </div>
    </div>

    <div class="field" style="margin-top:14px"><label>Notes</label><input type="text" id="inv-notes" value="${existing.notes||''}" placeholder="Net 30, factoring info, etc."></div>
    ${buildAttachmentSection('${id}','customer','${type}')}

    <div class="modal-foot">
      <button class="btn" onclick="closeModal()">Cancel</button>
      <button class="btn" onclick="previewInvoicePDF('${type}','${id}')">📄 Preview PDF</button>
      <button class="btn blue" onclick="saveInvoiceData('${type}','${id}')">📤 ${existing.invNum?'Save changes':'Send to SHIFL'}</button>
    </div>
  </div></div>`;

  // Init calcs after render
  setTimeout(()=>{
    window._invBaseTotal=baseTotal;
    window._invType=type;
    window._invId=id;
    calcInvTotal();
    HOURLY.forEach(k=>{ if(document.getElementById('acc-chk-'+k)?.checked) calcAccHourly(k); });
    DAILY.forEach(k=>{ if(document.getElementById('acc-chk-'+k)?.checked) calcAccDaily(k); });
  },50);
}

function toggleAccRow(key, checked, isHourly, isDaily, isDual){
  const detail=document.getElementById('acc-detail-'+key);
  if(detail) detail.style.display=checked?'grid':'none';
  const flatInput=document.getElementById('acc-flat-'+key);
  if(flatInput){flatInput.disabled=!checked;flatInput.style.opacity=checked?'1':'.4';}
  const carrierInput=document.getElementById('acc-carrier-'+key);
  if(carrierInput){carrierInput.disabled=!checked;carrierInput.style.opacity=checked?'1':'.4';}
  const amtEl=document.getElementById('acc-amt-'+key);
  if(amtEl&&!checked){amtEl.textContent='—';}
  calcInvTotal();
}

function toggleCustomRow(checked){
  const inp=document.getElementById('acc-flat-custom');
  const row=document.getElementById('custom-desc-row');
  if(inp){inp.disabled=!checked;inp.style.opacity=checked?'1':'.4';}
  if(row) row.style.display=checked?'block':'none';
  calcInvTotal();
}

function calcAccHourly(key){
  const free=parseFloat(document.getElementById('acc-free-'+key)?.value)||0;
  const hrs=parseFloat(document.getElementById('acc-hrs-'+key)?.value)||0;
  const rate=parseFloat(document.getElementById('acc-rate-'+key)?.value)||0;
  const billable=Math.max(0,hrs-free);
  const amt=billable*rate;
  const calc=document.getElementById('acc-calc-'+key);
  const amtEl=document.getElementById('acc-amt-'+key);
  if(calc){
    if(hrs<=free) calc.textContent=`${hrs}h used — within ${free}h free time. No charge.`;
    else calc.textContent=`${hrs}h − ${free}h free = ${billable}h billable × $${rate}/hr = $${amt.toFixed(2)}`;
  }
  if(amtEl) amtEl.textContent=amt>0?fmtD(amt):'$0.00';
  calcInvTotal();
}

function calcAccDaily(key){
  const free=parseFloat(document.getElementById('acc-free-'+key)?.value)||0;
  const days=parseFloat(document.getElementById('acc-days-'+key)?.value)||0;
  const rate=parseFloat(document.getElementById('acc-rate-'+key)?.value)||0;
  const billable=Math.max(0,days-free);
  const amt=billable*rate;
  const calc=document.getElementById('acc-calc-'+key);
  const amtEl=document.getElementById('acc-amt-'+key);
  if(calc){
    if(days<=free) calc.textContent=`${days} days — within ${free} free days. No charge.`;
    else calc.textContent=`${days}d − ${free}d free = ${billable}d billable × $${rate}/day = $${amt.toFixed(2)}`;
  }
  if(amtEl) amtEl.textContent=amt>0?fmtD(amt):'$0.00';
  calcInvTotal();
}

function calcInvTotal(){
  const base=window._invBaseTotal||0;
  let acc=0;
  const HOURLY=['det_port','det_cust'];
  const DAILY=['storage','chassis'];
  const ALL_KEYS=['chassis','prepull','det_port','det_cust','storage','ovw43','ovw48','toll','bobtail','genset','triaxle'];
  ALL_KEYS.forEach(k=>{
    if(!document.getElementById('acc-chk-'+k)?.checked) return;
    if(HOURLY.includes(k)||DAILY.includes(k)){
      const amtEl=document.getElementById('acc-amt-'+k);
      acc+=parseFloat(amtEl?.textContent?.replace(/[^0-9.]/g,''))||0;
    } else {
      acc+=parseFloat(document.getElementById('acc-flat-'+k)?.value)||0;
    }
  });
  const customContainer=document.getElementById('custom-charges-container');
  if(customContainer){
    customContainer.querySelectorAll('[id^="acc-flat-custom-"]').forEach((el,i)=>{
      const chk=document.getElementById('acc-chk-custom-'+i);
      if(chk?.checked) acc+=parseFloat(el.value)||0;
    });
  }
  const el=document.getElementById('inv-acc-total');
  const tot=document.getElementById('inv-grand-total');
  if(el) el.textContent=fmtD(acc);
  if(tot) tot.textContent=fmtD(base+acc);
}

async function saveInvoiceData(type, id){
  const num=($('inv-num')||{}).value?.trim();
  if(!num){alert('Invoice number required.');return;}
  const base=window._invBaseTotal||0;
  const HOURLY=['det_port','det_cust'];
  const DAILY=['storage','chassis'];
  const ALL_KEYS=['chassis','prepull','det_port','det_cust','storage','ovw43','ovw48','toll','bobtail','genset','triaxle'];
  const DUAL_KEYS=['genset','triaxle','bobtail'];
  const accessorials={};
  let accTotal=0;
  ALL_KEYS.forEach(k=>{
    const checked=document.getElementById('acc-chk-'+k)?.checked||false;
    if(!checked) return;
    const entry={enabled:true};
    if(DUAL_KEYS.includes(k)){
      entry.carrierRate=parseFloat(document.getElementById('acc-carrier-'+k)?.value)||0;
      entry.amount=parseFloat(document.getElementById('acc-flat-'+k)?.value)||0;
    } else if(HOURLY.includes(k)){
      entry.freeHrs=parseFloat(document.getElementById('acc-free-'+k)?.value)||0;
      entry.totalHrs=parseFloat(document.getElementById('acc-hrs-'+k)?.value)||0;
      entry.rate=parseFloat(document.getElementById('acc-rate-'+k)?.value)||0;
      const billable=Math.max(0,entry.totalHrs-entry.freeHrs);
      entry.amount=billable*entry.rate;
    } else if(DAILY.includes(k)){
      entry.freeDays=parseFloat(document.getElementById('acc-free-'+k)?.value)||0;
      entry.totalDays=parseFloat(document.getElementById('acc-days-'+k)?.value)||0;
      entry.rate=parseFloat(document.getElementById('acc-rate-'+k)?.value)||0;
      const billable=Math.max(0,entry.totalDays-entry.freeDays);
      entry.amount=billable*entry.rate;
    } else {
      entry.amount=parseFloat(document.getElementById('acc-flat-'+k)?.value)||0;
    }
    accessorials[k]=entry;
    accTotal+=entry.amount||0;
  });
  const savedCustomCharges=[];
  const customCont=document.getElementById('custom-charges-container');
  if(customCont){customCont.querySelectorAll('[id^="acc-flat-custom-"]').forEach((el,i)=>{
    const chk=document.getElementById('acc-chk-custom-'+i);
    const desc=document.getElementById('custom-desc-'+i);
    if(chk?.checked&&parseFloat(el.value)>0){
      const amt=parseFloat(el.value)||0;
      savedCustomCharges.push({desc:desc?.value?.trim()||'Custom charge',amount:amt,enabled:true});
      accTotal+=amt;
    }
  });}
  const grandTotal=base+accTotal;
  const inv={invNum:num,invDate:($('inv-date')||{}).value||localDateStr(),invDue:($('inv-due')||{}).value||'',notes:($('inv-notes')||{}).value?.trim()||'',baseTotal:base,accTotal,grandTotal,accessorials,customCharges:savedCustomCharges,type,savedAt:localDateStr()};

  // 1. Save invoice to localStorage + Supabase metadata
  saveInvoice(id,inv);

  // 2. Update quote status + actual revenue so profit monitor reflects real totals
  if(type==='drayage'){
    const q=S.quotes.find(x=>x.id===id);
    if(q){
      q.status='Invoiced';
      q.invoiceNum=num;
      if(!q.customerRates) q.customerRates={};
      q.customerRates.total=grandTotal; // actual invoiced amount
      try{await dbUpdateQuoteStatus(id,'Invoiced');}catch(e){}
      try{await dbSaveQuote(q);}catch(e){}
      try{localStorage.setItem('shifl_quotes_cache',JSON.stringify(S.quotes));}catch(e){}
    }
  } else if(type==='transload'){
    const q=(window._tlHistory||[]).find(x=>x.id===id);
    if(q){
      q.status='Invoiced';
      q.invoiceNum=num;
      q.totalCustomer=grandTotal;
      try{localStorage.setItem('tl_history',JSON.stringify(window._tlHistory));}catch(e){}
    }
  } else if(type==='freight'){
    const q=(window._fqHistory||[]).find(x=>x.id===id);
    if(q){
      q.status='Invoiced';
      q.invoiceNum=num;
      q.customerRate=grandTotal;
      try{localStorage.setItem('fq_history',JSON.stringify(window._fqHistory));}catch(e){}
    }
  } else if(type==='air'){
    const q=(window._aqHistory||[]).find(x=>x.id===id);
    if(q){
      q.status='Invoiced';
      q.invoiceNum=num;
      q.customerRate=grandTotal;
      try{await dbSaveAqQuote(q);}catch(e){}
      try{localStorage.setItem('aq_history',JSON.stringify(window._aqHistory));}catch(e){}
      try{localStorage.setItem('fq_history',JSON.stringify(window._fqHistory));}catch(e){}
    }
  }

  try{logAction('invoice_sent',`${type} invoice ${num} — ${fmtD(grandTotal)}`,'invoice',id);}catch(e){}
  closeModal();
  showToast('✅ Invoice saved — '+num,'success');
  try{updateActiveBadge();updateInvNavBadge();}catch(e){}
  S.view='invoicing';S.invMainTab='customer';S.allInvTab='invoiced';
  renderFullInvoicing();
}

function previewInvoicePDF(type,id){
  showToast('PDF preview coming soon','info',2000);
}



function renderFullInvoicing(){
  const mainTab=S.invMainTab||'customer';
  const subTab=S.allInvTab||'pending';

  // ── Topbar: Customer / Carrier toggle ─────────────────────────────────
  $('topbar-right').innerHTML=`
    <div style="display:flex;gap:0;border:1.5px solid var(--gray-200);border-radius:7px;overflow:hidden">
      <button onclick="S.invMainTab='customer';S.allInvTab='pending';renderFullInvoicing()"
        style="padding:7px 20px;border:none;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;background:${mainTab==='customer'?'#1a2e4a':'#fff'};color:${mainTab==='customer'?'#fff':'var(--gray-500)'}">
        🧾 Customer (AR)
      </button>
      <button onclick="S.invMainTab='carrier';S.allInvTab='pending';renderFullInvoicing()"
        style="padding:7px 20px;border:none;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;background:${mainTab==='carrier'?'#92400e':'#fff'};color:${mainTab==='carrier'?'#fff':'var(--gray-500)'}">
        🚛 Carrier (AP)
      </button>
    </div>`;

  // ── Collect all shipments ─────────────────────────────────────────────
  const dray=(S.quotes||[]).map(q=>({id:q.id,type:'drayage',customer:q.customer||'—',detail:`${q.port||'—'} → ${q.zip||'—'}`,carrier:q.carrier||'—',
    customerAmount:getInvoice(q.id)?.grandTotal||q.customerRates?.total||0,
    carrierAmount:getCarrierInvoice(q.id)?.grandTotal||q.carrierRates?.total||0,
    status:q.status,
    custInv:getInvoice(q.id),carrInv:getCarrierInvoice(q.id),
    invoiceNum:getInvoice(q.id)?.invNum||'',carrierInvNum:getCarrierInvoice(q.id)?.invNum||'',
    invDue:getInvoice(q.id)?.invDue||'',carrInvDue:getCarrierInvoice(q.id)?.invDue||'',
    paidDate:q.paidDate,modeLabel:'Drayage',shiflRef:q.shiflRef||'',date:q.date}));
  const fq=(window._fqHistory||[]).map(q=>({id:q.id,type:'freight',customer:q.customer||'—',detail:`${q.pickupZip||'—'} → ${q.deliveryZip||'—'}`,carrier:q.carrier||'—',
    customerAmount:q.customerRate||0,carrierAmount:q.carrierRate||0,
    status:q.status,custInv:null,carrInv:null,
    invoiceNum:q.invoiceNum||'',carrierInvNum:'',
    invDue:q.invoiceDueDate||'',carrInvDue:'',
    paidDate:q.paidDate,modeLabel:q.fqMode||'Freight',shiflRef:q.shiflRef||'',date:q.date}));
  const tl=(window._tlHistory||[]).map(q=>({id:q.id,type:'transload',customer:q.customer||'—',detail:`${q.drayPort||'—'} → ${q.outDeliveryZip||'—'}`,carrier:q.outCarrier||'—',
    customerAmount:getInvoice(q.id)?.grandTotal||q.totalCustomer||0,
    carrierAmount:getCarrierInvoice(q.id)?.grandTotal||q.drayCarrierCost||0,
    status:q.status,custInv:getInvoice(q.id),carrInv:getCarrierInvoice(q.id),
    invoiceNum:getInvoice(q.id)?.invNum||'',carrierInvNum:getCarrierInvoice(q.id)?.invNum||'',
    invDue:getInvoice(q.id)?.invDue||'',carrInvDue:getCarrierInvoice(q.id)?.invDue||'',
    paidDate:q.paidDate,modeLabel:'Transload',shiflRef:q.shiflRef||'',date:q.date}));
  const all=[...dray,...fq,...tl];

  const delivered=all.filter(q=>q.status==='Delivered');
  const invoicedCust=all.filter(q=>q.status==='Invoiced');
  const invoicedCarr=all.filter(q=>q.status==='Invoiced'||q.status==='Delivered');
  const paid=all.filter(q=>q.status==='Paid');

  // Update nav badge
  const badge=$('inv-nav-badge');
  if(badge){const n=delivered.length;badge.textContent=n;badge.style.display=n?'inline':'none';}

  if(mainTab==='customer'){
    renderCustomerInvoiceTab(all,delivered,invoicedCust,paid,subTab);
  } else {
    renderCarrierInvoiceTab(all,delivered,paid,subTab);
  }
}

function renderCustomerInvoiceTab(all,pending,invoiced,paid,subTab){
  const totalPending=pending.reduce((s,q)=>s+q.customerAmount,0);
  const totalInvoiced=invoiced.reduce((s,q)=>s+q.customerAmount,0);
  const totalPaid=paid.reduce((s,q)=>s+q.customerAmount,0);
  const today=localDateStr();
  const overdue=invoiced.filter(q=>q.invDue&&q.invDue<today);

  // Days since delivered
  function daysPending(q){
    const d=q.date||q.deliveredDate||'';
    if(!d) return 0;
    return Math.floor((new Date()-new Date(d))/86400000);
  }

  // Get carrier phone from carriers list
  function carrierPhone(carrierName){
    if(!carrierName) return '';
    const found=(window._carriersCache||[]).find(c=>c.name&&c.name.toLowerCase()===carrierName.toLowerCase());
    return found?.phone||found?.contact_phone||found?.dispatcher_phone||'';
  }
  // Load carriers into cache if not already
  if(!window._carriersCache && db){
    db.from('carriers').select('name,phone,contact_phone,dispatcher_phone').then(({data})=>{
      window._carriersCache=data||[];
    }).catch(()=>{});
  }

  const kpis=`<div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-bottom:16px">
    <div class="kpi"><div class="kpi-lbl">Pending invoice</div><div class="kpi-val" style="color:var(--amber)">${pending.length}</div><div style="font-size:11px;color:var(--gray-400);margin-top:2px">${fmtD(totalPending)}</div></div>
    <div class="kpi"><div class="kpi-lbl">Outstanding AR</div><div class="kpi-val" style="color:var(--steel)">${fmtD(totalInvoiced)}</div><div style="font-size:11px;color:var(--gray-400);margin-top:2px">${invoiced.length} invoices</div></div>
    <div class="kpi"><div class="kpi-lbl">Overdue</div><div class="kpi-val" style="color:${overdue.length?'var(--red)':'var(--green)'}">${overdue.length}</div><div style="font-size:11px;color:var(--gray-400);margin-top:2px">${overdue.length?fmtD(overdue.reduce((s,q)=>s+q.customerAmount,0))+' past due':'All current'}</div></div>
    <div class="kpi"><div class="kpi-lbl">Collected</div><div class="kpi-val" style="color:var(--green)">${fmtD(totalPaid)}</div><div style="font-size:11px;color:var(--gray-400);margin-top:2px">${paid.length} paid</div></div>
  </div>`;

  const tabBar=buildInvSubTabs(subTab,'customer',pending.length,invoiced.length,paid.length);
  let body='';

  if(subTab==='pending'){
    if(!pending.length){$('page').innerHTML=kpis+tabBar+`<div class="empty"><div class="empty-ico">✅</div><p>No loads pending invoice</p></div>`;return;}
    const pendSearch=(S.invSearch||'').toLowerCase();
    const pendFiltered=pendSearch?pending.filter(q=>(q.customer||'').toLowerCase().includes(pendSearch)||(q.carrier||'').toLowerCase().includes(pendSearch)||(q.shiflRef||'').toLowerCase().includes(pendSearch)||(q.detail||'').toLowerCase().includes(pendSearch)):pending;
    body=`<div style="margin-bottom:12px;position:relative">
      <input type="text" placeholder="Search customer, carrier, ref #..." value="${S.invSearch||''}"
        oninput="S.invSearch=this.value;renderFullInvoicing()"
        style="width:100%;padding:8px 12px 8px 36px;border:0.5px solid var(--gray-200);border-radius:8px;font-size:13px;font-family:inherit;outline:none"
        onfocus="this.style.borderColor='var(--steel)'" onblur="this.style.borderColor='var(--gray-200)'">
      <span style="position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--gray-400);font-size:14px">🔍</span>
    </div>
    <div class="tbl-wrap"><style>
      .inv-row{display:grid;grid-template-columns:1.6fr 1.2fr 1.3fr 0.7fr 0.8fr 0.7fr 120px;align-items:center;padding:10px 14px;border-bottom:0.5px solid var(--gray-50);min-width:0}
      .inv-row>*{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0}
      .inv-row:hover{background:#fafbfc}
      .inv-row.pending-hot{background:#fff8f8;border-left:3px solid #dc2626}
      .inv-row.pending-warn{background:#fffcf0;border-left:3px solid #f59e0b}
      .inv-hd{display:grid;grid-template-columns:1.6fr 1.2fr 1.3fr 0.7fr 0.8fr 0.7fr 120px;padding:8px 14px;background:var(--gray-50);border-bottom:0.5px solid var(--gray-100)}
      .inv-hd span{font-size:10px;font-weight:600;color:var(--gray-500);text-transform:uppercase;letter-spacing:.05em}
      .pending-tag{display:inline-flex;align-items:center;gap:3px;padding:2px 7px;border-radius:4px;font-size:9px;font-weight:700;margin-top:3px}
    </style>
    <div class="inv-hd">
      <span>Customer</span><span>Carrier · Phone</span><span>Lane</span>
      <span>Ref #</span><span>Amount</span><span>Delivered</span><span></span>
    </div>
    ${pendFiltered.map(q=>{
      const days=daysPending(q);
      const phone=carrierPhone(q.carrier);
      const isHot=days>=2;
      const isWarn=days===1;
      return`<div class="inv-row ${isHot?'pending-hot':isWarn?'pending-warn':''}">
        <div>
          <div style="font-weight:600;color:var(--navy);font-size:13px">${q.customer}</div>
          ${isHot?`<span class="pending-tag" style="background:#fef2f2;color:#dc2626">⚠️ ${days} days pending</span>`:isWarn?`<span class="pending-tag" style="background:#fffbeb;color:#d97706">⚡ 1 day pending</span>`:''}
        </div>
        <div>
          <div style="font-size:12px;color:var(--gray-700)">${q.carrier}</div>
          ${phone?`<div style="font-size:11px;color:var(--gray-400);margin-top:1px">📞 ${phone}</div>`:''}
        </div>
        <div style="font-size:12px;color:var(--gray-500)">${q.detail}</div>
        <div style="font-family:monospace;font-size:11px;color:#2563eb;font-weight:600">${q.shiflRef||'—'}</div>
        <div style="font-size:13px;font-weight:700;color:${isHot?'#dc2626':'var(--steel)'}">${fmtD(q.customerAmount)}</div>
        <div style="font-size:11px;color:var(--gray-400)">${q.date||'—'}</div>
        <div style="display:flex;gap:5px">
          <button class="btn sm blue" onclick="openInvoiceBuilder('${q.type}','${q.id}')" style="white-space:nowrap">📤 Invoice</button>
          <button class="btn sm" onclick="revertToActive('${q.type}','${q.id}')" style="color:#d97706;border-color:#fbbf24;white-space:nowrap" title="Revert to active">↩️</button>
        </div>
      </div>`;
    }).join('')}</div>`;

  } else if(subTab==='invoiced'){
    if(!invoiced.length){$('page').innerHTML=kpis+tabBar+`<div class="empty"><div class="empty-ico">📤</div><p>No outstanding invoices</p></div>`;return;}
    body=`<div class="tbl-wrap"><style>
      .inv-row{display:grid;grid-template-columns:2fr 1.1fr 0.9fr 1.1fr 0.9fr 1fr 100px;align-items:center;padding:10px 16px;border-bottom:0.5px solid var(--gray-50)}
      .inv-row:hover{background:#fafbfc}
      .inv-row.overdue-row{background:#fff8f8;border-left:3px solid #dc2626}
      .inv-hd{display:grid;grid-template-columns:2fr 1.1fr 0.9fr 1.1fr 0.9fr 1fr 100px;padding:8px 16px;background:var(--gray-50);border-bottom:0.5px solid var(--gray-100)}
      .inv-hd span{font-size:10px;font-weight:600;color:var(--gray-500);text-transform:uppercase;letter-spacing:.05em}
    </style>
    <div class="inv-hd">
      <span>Customer</span><span>Carrier · Phone</span><span>Ref #</span>
      <span>Invoice #</span><span>Amount</span><span>Due</span><span></span>
    </div>
    ${invoiced.map(q=>{
      const isOverdue=q.invDue&&q.invDue<today;
      const phone=carrierPhone(q.carrier);
      return`<div class="inv-row ${isOverdue?'overdue-row':''}">
        <div>
          <div style="font-weight:600;color:var(--navy);font-size:13px">${q.customer}</div>
          <div style="font-size:11px;color:var(--gray-400);margin-top:1px">${q.date||''}</div>
        </div>
        <div>
          <div style="font-size:12px;color:var(--gray-700)">${q.carrier}</div>
          ${phone?`<div style="font-size:11px;color:var(--gray-400);margin-top:1px">📞 ${phone}</div>`:''}
        </div>
        <div style="font-family:monospace;font-size:11px;color:#2563eb;font-weight:600">${q.shiflRef||'—'}</div>
        <div style="font-family:monospace;font-size:12px;font-weight:600;color:var(--navy)">${q.invoiceNum||'—'}</div>
        <div style="font-size:13px;font-weight:700;color:var(--steel)">${fmtD(q.customerAmount)}</div>
        <div style="font-size:12px;font-weight:${isOverdue?700:400};color:${isOverdue?'#dc2626':'var(--gray-500)'}">
          ${q.invDue?(isOverdue?'⚠ Overdue':'Due '+q.invDue):'—'}
        </div>
        <div style="display:flex;gap:5px">
          <button class="btn sm" onclick="openInvoiceBuilder('${q.type}','${q.id}')" title="Edit invoice">✏️</button>
          <button class="btn sm" onclick="markDrayPaid('${q.type}','${q.id}')" style="color:var(--green);border-color:#86efac">✅ Paid</button>
        </div>
      </div>`;
    }).join('')}</div>`;

  } else {
    if(!paid.length){$('page').innerHTML=kpis+tabBar+`<div class="empty"><div class="empty-ico">💰</div><p>No payments recorded yet</p></div>`;return;}
    body=`<div class="tbl-wrap"><style>
      .inv-row{display:grid;grid-template-columns:2fr 1.2fr 0.9fr 1.1fr 1fr 1fr;align-items:center;padding:10px 16px;border-bottom:0.5px solid var(--gray-50)}
      .inv-row:hover{background:#fafbfc}
      .inv-hd{display:grid;grid-template-columns:2fr 1.2fr 0.9fr 1.1fr 1fr 1fr;padding:8px 16px;background:var(--gray-50);border-bottom:0.5px solid var(--gray-100)}
      .inv-hd span{font-size:10px;font-weight:600;color:var(--gray-500);text-transform:uppercase;letter-spacing:.05em}
    </style>
    <div class="inv-hd">
      <span>Customer</span><span>Carrier</span><span>Ref #</span><span>Invoice #</span><span>Amount</span><span>Paid</span>
    </div>
    ${paid.map(q=>`<div class="inv-row">
      <div style="font-weight:600;color:var(--navy);font-size:13px">${q.customer}</div>
      <div style="font-size:12px;color:var(--gray-600)">${q.carrier}</div>
      <div style="font-family:monospace;font-size:11px;color:#2563eb;font-weight:600">${q.shiflRef||'—'}</div>
      <div style="font-family:monospace;font-size:12px;font-weight:600">${q.invoiceNum||'—'}</div>
      <div style="font-size:13px;font-weight:700;color:var(--green)">${fmtD(q.customerAmount)}</div>
      <div style="font-size:12px;color:var(--gray-500)">${q.paidDate||'—'}</div>
    </div>`).join('')}</div>`;
  }
  $('page').innerHTML=kpis+tabBar+body;
}

function renderCarrierInvoiceTab(all,delivered,paid,subTab){
  const toPay=delivered;
  const totalToPay=toPay.reduce((s,q)=>s+q.carrierAmount,0);
  const totalPaid=paid.reduce((s,q)=>s+q.carrierAmount,0);
  const today=localDateStr();
  const ovrdCarrier=toPay.filter(q=>q.carrInv?.invDue&&q.carrInv.invDue<today);

  function daysSinceDelivered(q){
    const d=q.date||'';
    if(!d) return 0;
    return Math.floor((new Date()-new Date(d))/86400000);
  }
  function carrierPhone(name){
    if(!name) return '';
    const found=(window._carriersCache||[]).find(c=>c.name&&c.name.toLowerCase()===name.toLowerCase());
    return found?.phone||found?.contact_phone||found?.dispatcher_phone||'';
  }

  const kpis=`<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px">
    <div class="kpi"><div class="kpi-lbl">Pending AP</div><div class="kpi-val" style="color:#d97706">${toPay.length}</div><div style="font-size:11px;color:var(--gray-400);margin-top:2px">${fmtD(totalToPay)}</div></div>
    <div class="kpi"><div class="kpi-lbl">Overdue AP</div><div class="kpi-val" style="color:${ovrdCarrier.length?'var(--red)':'var(--green)'}">${ovrdCarrier.length}</div><div style="font-size:11px;color:var(--gray-400);margin-top:2px">${ovrdCarrier.length?'Past due':'All current'}</div></div>
    <div class="kpi"><div class="kpi-lbl">Paid to carriers</div><div class="kpi-val" style="color:var(--green)">${fmtD(totalPaid)}</div><div style="font-size:11px;color:var(--gray-400);margin-top:2px">${paid.length} loads</div></div>
  </div>`;

  const tabBar=buildInvSubTabs(subTab,'carrier',toPay.length,0,paid.length);
  let body='';

  if(subTab==='pending'){
    if(!toPay.length){$('page').innerHTML=kpis+tabBar+`<div class="empty"><div class="empty-ico">✅</div><p>No pending carrier payments</p></div>`;return;}
    body=`<div class="tbl-wrap"><style>
      .carr-row{display:grid;grid-template-columns:1.6fr 1.3fr 1.2fr 0.8fr 0.9fr 110px;align-items:center;padding:10px 14px;border-bottom:0.5px solid var(--gray-100)}
      .carr-row:hover{background:var(--gray-50)}
      .carr-row.overdue-ap{background:#fff8f8;border-left:3px solid #dc2626}
      .carr-row.warn-ap{background:#fffcf0;border-left:3px solid #f59e0b}
      .carr-hd{display:grid;grid-template-columns:1.6fr 1.3fr 1.2fr 0.8fr 0.9fr 110px;padding:8px 14px;background:var(--gray-50);border-bottom:0.5px solid var(--gray-100)}
      .carr-hd span{font-size:10px;font-weight:600;color:var(--gray-500);text-transform:uppercase;letter-spacing:.05em}
    </style>
    <div class="carr-hd">
      <span>Customer</span><span>Carrier · Phone</span><span>Lane</span>
      <span>Ref #</span><span>Amount owed</span><span></span>
    </div>
    ${toPay.map(q=>{
      const days=daysSinceDelivered(q);
      const phone=carrierPhone(q.carrier);
      const isHot=days>=3;
      const isWarn=days===1||days===2;
      const hasCarrInv=!!q.carrInv;
      return`<div class="carr-row ${isHot?'overdue-ap':isWarn?'warn-ap':''}">
        <div>
          <div style="font-weight:600;color:var(--navy);font-size:13px">${q.customer}</div>
          ${isHot?`<span style="display:inline-flex;padding:2px 7px;border-radius:4px;font-size:9px;font-weight:700;background:#fef2f2;color:#dc2626;margin-top:3px">⚠️ ${days} days pending</span>`:isWarn?`<span style="display:inline-flex;padding:2px 7px;border-radius:4px;font-size:9px;font-weight:700;background:#fffbeb;color:#d97706;margin-top:3px">⚡ ${days} day${days>1?'s':''} pending</span>`:''}
        </div>
        <div>
          <div style="font-size:12px;color:var(--gray-700)">${q.carrier}</div>
          ${phone?`<div style="font-size:11px;color:var(--gray-400);margin-top:1px">📞 ${phone}</div>`:''}
        </div>
        <div style="font-size:12px;color:var(--gray-500)">${q.detail}</div>
        <div style="font-family:monospace;font-size:11px;color:#2563eb;font-weight:600">${q.shiflRef||'—'}</div>
        <div style="font-size:13px;font-weight:700;color:${isHot?'#dc2626':'#d97706'}">${fmtD(q.carrierAmount)}</div>
        <div style="display:flex;gap:5px">
          <button class="btn sm" style="color:#d97706;border-color:#fbbf24;white-space:nowrap" onclick="openCarrierInvoiceBuilder('${q.type}','${q.id}')">📤 AP Invoice</button>
        </div>
      </div>`;
    }).join('')}</div>`;
  } else {
    if(!paid.length){$('page').innerHTML=kpis+tabBar+`<div class="empty"><div class="empty-ico">💳</div><p>No carrier payments recorded</p></div>`;return;}
    body=`<div class="tbl-wrap"><style>
      .carr-row{display:grid;grid-template-columns:1.6fr 1.3fr 1.2fr 0.8fr 1fr 1fr;align-items:center;padding:10px 14px;border-bottom:0.5px solid var(--gray-100)}
      .carr-row:hover{background:var(--gray-50)}
      .carr-hd{display:grid;grid-template-columns:1.6fr 1.3fr 1.2fr 0.8fr 1fr 1fr;padding:8px 14px;background:var(--gray-50);border-bottom:0.5px solid var(--gray-100)}
      .carr-hd span{font-size:10px;font-weight:600;color:var(--gray-500);text-transform:uppercase;letter-spacing:.05em}
    </style>
    <div class="carr-hd">
      <span>Customer</span><span>Carrier</span><span>Lane</span><span>Ref #</span><span>Amount paid</span><span>Paid date</span>
    </div>
    ${paid.map(q=>`<div class="carr-row">
      <div style="font-weight:600;color:var(--navy);font-size:13px">${q.customer}</div>
      <div style="font-size:12px;color:var(--gray-700)">${q.carrier}</div>
      <div style="font-size:12px;color:var(--gray-500)">${q.detail}</div>
      <div style="font-family:monospace;font-size:11px;color:#2563eb;font-weight:600">${q.shiflRef||'—'}</div>
      <div style="font-size:13px;font-weight:700;color:var(--green)">${fmtD(q.carrierAmount)}</div>
      <div style="font-size:12px;color:var(--gray-500)">${q.paidDate||'—'}</div>
    </div>`).join('')}</div>`;
  }
  $('page').innerHTML=kpis+tabBar+body;
}

function buildInvSubTabs(active,main,pendingCount,invoicedCount,paidCount){
  const tabs=main==='customer'
    ?[{id:'pending',label:`⏳ Pending (${pendingCount})`},{id:'invoiced',label:`📤 Invoiced (${invoicedCount})`},{id:'paid',label:`✅ Paid (${paidCount})`}]
    :[{id:'pending',label:`⏳ To pay (${pendingCount})`},{id:'paid',label:`✅ Paid (${paidCount})`}];
  return `<div style="display:flex;gap:4px;background:var(--gray-100);padding:3px;border-radius:var(--radius);width:fit-content;margin-bottom:18px">
    ${tabs.map(t=>`<button onclick="S.allInvTab='${t.id}';renderFullInvoicing()" style="padding:6px 14px;border-radius:5px;border:none;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;background:${active===t.id?'#fff':'none'};color:${active===t.id?'var(--navy)':'var(--gray-500)'};box-shadow:${active===t.id?'0 1px 3px rgba(0,0,0,.08)':'none'}">${t.label}</button>`).join('')}
  </div>`;
}


function updateInvNavBadge(){
  const dray=countUninvoicedLoads();
  const fq=(window._fqHistory||[]).filter(q=>q.status==='Delivered').length;
  const tl=(window._tlHistory||[]).filter(q=>q.status==='Delivered').length;
  const invoiced=[...(S.quotes||[]),...(window._fqHistory||[]),...(window._tlHistory||[])].filter(q=>q.status==='Invoiced'&&q.invoiceDueDate&&new Date(q.invoiceDueDate+'T12:00:00')<new Date()).length;
  const n=dray+fq+tl+invoiced;
  const badge=$('inv-nav-badge');
  if(badge){badge.textContent=n;badge.style.display=n?'inline':'none';}
}

function addCustomCharge(){
  const container=document.getElementById('custom-charges-container');
  if(!container) return;
  const ci=container.querySelectorAll('[id^="custom-row-"]').length;
  const div=document.createElement('div');
  div.id='custom-row-'+ci;
  div.style.cssText='padding:10px 0;border-bottom:1px solid var(--gray-100)';
  div.innerHTML=`<div style="display:flex;align-items:center;gap:10px">
    <input type="checkbox" id="acc-chk-custom-${ci}" checked onchange="toggleCustomCharge(${ci},this.checked)" style="flex-shrink:0">
    <input type="text" id="custom-desc-${ci}" placeholder="Charge description (e.g. Exam fee, Per diem...)" style="flex:1;padding:5px 8px;font-size:13px;border:1px solid var(--gray-200);border-radius:var(--radius)">
    <input type="number" id="acc-flat-custom-${ci}" placeholder="$0" min="0" oninput="calcInvTotal()" style="width:80px;padding:5px 7px;font-size:13px;text-align:right">
  </div>`;
  container.appendChild(div);
}
function toggleCustomCharge(i, checked){
  const desc=document.getElementById('custom-desc-'+i);
  const amt=document.getElementById('acc-flat-custom-'+i);
  if(desc) desc.style.opacity=checked?'1':'.4';
  if(amt) amt.style.opacity=checked?'1':'.4';
  calcInvTotal();
}
// ════════════════════════════════════════════════════════════════════
// CARRIER INVOICE (Accounts Payable)
// ════════════════════════════════════════════════════════════════════

function getCarrierInvoice(id){ return ((S.invoices||{})[id+'_carrier'])||null; }
function saveCarrierInvoice(id, inv){
  if(!S.invoices) S.invoices={};
  S.invoices[id+'_carrier']=inv;
  try{localStorage.setItem('shifl_invoices',JSON.stringify(S.invoices));}catch(e){}
  try{saveTMSMeta(id,{carrierInvoice:inv,carrierInvNum:inv.invNum,carrierInvTotal:inv.grandTotal,carrierInvSavedAt:inv.savedAt});}catch(e){}
}

function openCarrierInvoiceBuilder(type, id){
  if(type==='freight'){
    const idx=(window._fqHistory||[]).findIndex(q=>q.id===id);
    if(idx>=0){openFqCarrierInvoice(idx);return;}
    alert('Shipment not found.');return;
  }
  let q=null;
  if(type==='drayage') q=S.quotes.find(x=>x.id===id);
  else if(type==='transload') q=(window._tlHistory||[]).find(x=>x.id===id);
  if(!q){alert('Shipment not found.');return;}
  if(q.status!=='Delivered'&&q.status!=='Invoiced'&&q.status!=='Paid'){alert('Carrier invoices can only be created after a shipment is marked as Delivered.');return;}

  const existing=getCarrierInvoice(id)||{};
  const invNum=existing.invNum||'CINV-'+(type==='drayage'?'DR':'TL')+'-'+Date.now().toString().slice(-5);
  const today=localDateStr();
  const due30=new Date(Date.now()+30*864e5).toISOString().slice(0,10);

  const cRates=q.carrierRates||{};
  const baseCarrier=type==='drayage'?(cRates.base||0):(q.drayCarrierCost||0);
  const carrierName=q.carrier||q.drayCarrier||'—';

  const ACC_C=[
    {key:'chassis',label:'Chassis',note:'Per day'},
    {key:'prepull',label:'Pre-pull',note:'Flat'},
    {key:'det_port',label:'Detention — port',note:'Per hour'},
    {key:'det_cust',label:'Detention — customer',note:'Per hour'},
    {key:'storage',label:'Storage',note:'Per day'},
    {key:'ovw43',label:'Overweight (43k lb)',note:'Flat'},
    {key:'ovw48',label:'Overweight (48k lb)',note:'Flat'},
    {key:'toll',label:'Toll',note:'If applicable'},
    {key:'bobtail',label:'Bobtail',note:'Flat'},
    {key:'genset',label:'Genset',note:'Flat'},
    {key:'triaxle',label:'Triaxle',note:'Flat'},
  ];
  const HOURLY_C=['det_port','det_cust'];
  const DAILY_C=['storage','chassis'];
  const saved=existing.accessorials||{};

  const rows=ACC_C.map(a=>{
    const quotedAmt=type==='drayage'?(cRates[a.key]||0):0;
    const sv=saved[a.key]||{};
    const isChecked=sv.enabled!==undefined?sv.enabled:quotedAmt>0;
    const isHourly=HOURLY_C.includes(a.key);
    const isDaily=DAILY_C.includes(a.key);
    let detail='';
    if(isHourly){
      const freeHrs=sv.freeHrs??2;
      const totalHrs=sv.totalHrs||0;
      const rate=sv.rate||quotedAmt||75;
      detail=`<div id="cacc-detail-${a.key}" style="display:${isChecked?'grid':'none'};grid-template-columns:1fr 1fr 1fr;gap:8px;margin-top:8px;padding:10px;background:var(--gray-50);border-radius:6px">
        <div><div class="inv-sm-lbl">Free time (hrs)</div><input type="number" id="cacc-free-${a.key}" value="${freeHrs}" min="0" step="0.5" oninput="calcCarrierTotal()" style="width:100%;padding:5px 7px;font-size:12px"></div>
        <div><div class="inv-sm-lbl">Total hours</div><input type="number" id="cacc-hrs-${a.key}" value="${totalHrs}" min="0" step="0.5" oninput="calcCarrierTotal()" style="width:100%;padding:5px 7px;font-size:12px"></div>
        <div><div class="inv-sm-lbl">Rate ($/hr)</div><input type="number" id="cacc-rate-${a.key}" value="${rate}" min="0" oninput="calcCarrierTotal()" style="width:100%;padding:5px 7px;font-size:12px"></div>
        <div style="grid-column:1/-1;font-size:11px;color:var(--amber)" id="cacc-calc-${a.key}"></div>
      </div>`;
    } else if(isDaily){
      const freeDays=sv.freeDays??0;
      const totalDays=sv.totalDays||0;
      const rate=sv.rate||quotedAmt||0;
      detail=`<div id="cacc-detail-${a.key}" style="display:${isChecked?'grid':'none'};grid-template-columns:1fr 1fr 1fr;gap:8px;margin-top:8px;padding:10px;background:var(--gray-50);border-radius:6px">
        <div><div class="inv-sm-lbl">Free days</div><input type="number" id="cacc-free-${a.key}" value="${freeDays}" min="0" oninput="calcCarrierTotal()" style="width:100%;padding:5px 7px;font-size:12px"></div>
        <div><div class="inv-sm-lbl">Total days</div><input type="number" id="cacc-days-${a.key}" value="${totalDays}" min="0" oninput="calcCarrierTotal()" style="width:100%;padding:5px 7px;font-size:12px"></div>
        <div><div class="inv-sm-lbl">Rate ($/day)</div><input type="number" id="cacc-rate-${a.key}" value="${rate}" min="0" oninput="calcCarrierTotal()" style="width:100%;padding:5px 7px;font-size:12px"></div>
        <div style="grid-column:1/-1;font-size:11px;color:var(--amber)" id="cacc-calc-${a.key}"></div>
      </div>`;
    }
    const flatAmt=sv.amount!==undefined?sv.amount:quotedAmt;
    return `<div style="padding:10px 0;border-bottom:1px solid var(--gray-100)">
      <div style="display:flex;align-items:center;gap:10px">
        <input type="checkbox" id="cacc-chk-${a.key}" ${isChecked?'checked':''} onchange="toggleCAccRow('${a.key}',this.checked,${isHourly},${isDaily})" style="flex-shrink:0">
        <div style="flex:1">
          <label for="cacc-chk-${a.key}" style="font-size:13px;font-weight:600;color:var(--navy);cursor:pointer">${a.label}</label>
          ${quotedAmt>0?`<span style="font-size:10px;background:var(--blue-bg);color:var(--steel);padding:1px 7px;border-radius:99px;margin-left:6px;font-weight:600">Quoted ${fmtD(quotedAmt)}</span>`:''}
          <div style="font-size:11px;color:var(--gray-400)">${a.note}</div>
        </div>
        ${!isHourly&&!isDaily?`<input type="number" id="cacc-flat-${a.key}" value="${isChecked?flatAmt:''}" placeholder="0" min="0" oninput="calcCarrierTotal()" style="width:80px;padding:5px 7px;font-size:13px;text-align:right;${!isChecked?'opacity:.4':''}" ${!isChecked?'disabled':''}>`:
        `<span id="cacc-amt-${a.key}" style="font-size:13px;font-weight:700;color:var(--navy);min-width:70px;text-align:right">${isChecked&&quotedAmt>0?fmtD(quotedAmt):'—'}</span>`}
      </div>
      ${detail}
    </div>`;
  }).join('');

  $('modal-root').innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()">
  <div class="modal" style="max-width:600px;max-height:90vh;overflow-y:auto">
    <style>.inv-sm-lbl{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--gray-400);margin-bottom:4px}</style>

    <!-- Tab header -->
    <div style="display:flex;gap:0;margin-bottom:18px;border-bottom:2px solid var(--gray-100)">
      <div style="padding:10px 20px;font-size:14px;font-weight:700;color:var(--gray-400);cursor:pointer" onclick="openInvoiceBuilder('${type}','${id}')">🧾 Customer invoice</div>
      <div style="padding:10px 20px;font-size:14px;font-weight:700;color:var(--navy);border-bottom:2px solid var(--navy);margin-bottom:-2px">🚛 Carrier invoice (AP)</div>
    </div>

    <div style="background:#fffbeb;border:1px solid #fbbf24;border-radius:var(--radius);padding:8px 12px;margin-bottom:14px;font-size:12px;color:#92400e;font-weight:600">
      📤 Accounts Payable — what Shifl owes <strong>${carrierName}</strong>
    </div>

    <div class="g3" style="margin-bottom:14px">
      <div class="field"><label>Carrier invoice # *</label><input type="text" id="cinv-num" value="${existing.invNum||invNum}"></div>
      <div class="field"><label>Invoice date</label><input type="date" id="cinv-date" value="${existing.invDate||today}"></div>
      <div class="field"><label>Due date (Pay by)</label><input type="date" id="cinv-due" value="${existing.invDue||due30}"></div>
    </div>

    <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--gray-400);margin-bottom:8px">Base carrier rate</div>
    <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--gray-100);opacity:.75;margin-bottom:14px">
      <span style="font-size:13px;font-weight:500;color:var(--navy)">Base drayage rate <span style="font-size:10px;background:var(--gray-100);padding:1px 7px;border-radius:99px;color:var(--gray-500)">locked</span></span>
      <span style="font-size:14px;font-weight:700;color:var(--navy)">${fmtD(baseCarrier)}</span>
    </div>

    <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--gray-400);margin-bottom:8px">Carrier accessorials</div>
    ${rows}

    <!-- Dynamic custom charges -->
    <div id="carrier-custom-container">
      ${(existing.customCharges||[]).map((cc,ci)=>`
      <div style="padding:10px 0;border-bottom:1px solid var(--gray-100)">
        <div style="display:flex;align-items:center;gap:10px">
          <input type="checkbox" id="cacc-chk-custom-${ci}" checked style="flex-shrink:0">
          <input type="text" id="carrier-desc-${ci}" value="${cc.desc||''}" placeholder="Charge description" style="flex:1;padding:5px 8px;font-size:13px;border:1px solid var(--gray-200);border-radius:var(--radius)">
          <input type="number" id="cacc-flat-custom-${ci}" value="${cc.amount||''}" placeholder="$0" min="0" oninput="calcCarrierTotal()" style="width:80px;padding:5px 7px;font-size:13px;text-align:right">
        </div>
      </div>`).join('')}
    </div>
    <button type="button" onclick="addCarrierCharge()" style="width:100%;padding:8px;border:1.5px dashed var(--gray-300);background:transparent;border-radius:var(--radius);font-size:13px;color:var(--gray-500);cursor:pointer;margin:6px 0 14px">+ Add carrier charge</button>

    <div style="padding:12px 14px;background:var(--gray-50);border-radius:var(--radius)">
      <div style="display:flex;justify-content:space-between;margin-bottom:6px;font-size:13px;color:var(--gray-600)">
        <span>Base carrier cost</span><span>${fmtD(baseCarrier)}</span>
      </div>
      <div style="display:flex;justify-content:space-between;margin-bottom:10px;font-size:13px;color:var(--gray-600)">
        <span>Accessorials</span><span id="cinv-acc-total">$0.00</span>
      </div>
      <div style="display:flex;justify-content:space-between;padding-top:10px;border-top:1px solid var(--gray-200)">
        <span style="font-size:16px;font-weight:700;color:var(--navy)">Total payable</span>
        <span style="font-size:20px;font-weight:800;color:#d97706" id="cinv-grand-total">${fmtD(baseCarrier)}</span>
      </div>
    </div>

    <div class="field" style="margin-top:14px"><label>Notes</label><input type="text" id="cinv-notes" value="${existing.notes||''}" placeholder="Payment terms, factoring, etc."></div>
    ${buildAttachmentSection('${id}','carrier','${type}')}

    <div class="modal-foot">
      <button class="btn" onclick="closeModal()">Cancel</button>
      <button class="btn blue" onclick="saveCarrierInvoiceData('${type}','${id}')">📤 Send to SHIFL</button>
    </div>
  </div></div>`;

  window._cinvBase=baseCarrier;
  setTimeout(()=>calcCarrierTotal(),50);
}

function toggleCAccRow(key,checked,isHourly,isDaily){
  const d=document.getElementById('cacc-detail-'+key);if(d) d.style.display=checked?'grid':'none';
  const f=document.getElementById('cacc-flat-'+key);if(f){f.disabled=!checked;f.style.opacity=checked?'1':'.4';}
  const a=document.getElementById('cacc-amt-'+key);if(a&&!checked) a.textContent='—';
  calcCarrierTotal();
}

function calcCarrierTotal(){
  const base=window._cinvBase||0;
  let acc=0;
  const HOURLY=['det_port','det_cust'];
  const DAILY=['storage','chassis'];
  const ALL=['chassis','prepull','det_port','det_cust','storage','ovw43','ovw48','toll','bobtail','genset','triaxle'];
  ALL.forEach(k=>{
    if(!document.getElementById('cacc-chk-'+k)?.checked) return;
    if(HOURLY.includes(k)){
      const free=parseFloat(document.getElementById('cacc-free-'+k)?.value)||0;
      const hrs=parseFloat(document.getElementById('cacc-hrs-'+k)?.value)||0;
      const rate=parseFloat(document.getElementById('cacc-rate-'+k)?.value)||0;
      const billable=Math.max(0,hrs-free);
      const amt=billable*rate;
      const el=document.getElementById('cacc-amt-'+k);if(el) el.textContent=amt>0?fmtD(amt):'$0.00';
      const calc=document.getElementById('cacc-calc-'+k);
      if(calc) calc.textContent=hrs<=free?`${hrs}h — within free time`:`${billable}h billable × $${rate}/hr = $${amt.toFixed(2)}`;
      acc+=amt;
    } else if(DAILY.includes(k)){
      const free=parseFloat(document.getElementById('cacc-free-'+k)?.value)||0;
      const days=parseFloat(document.getElementById('cacc-days-'+k)?.value)||0;
      const rate=parseFloat(document.getElementById('cacc-rate-'+k)?.value)||0;
      const billable=Math.max(0,days-free);
      const amt=billable*rate;
      const el=document.getElementById('cacc-amt-'+k);if(el) el.textContent=amt>0?fmtD(amt):'$0.00';
      const calc=document.getElementById('cacc-calc-'+k);
      if(calc) calc.textContent=days<=free?`${days}d — within free days`:`${billable}d billable × $${rate}/day = $${amt.toFixed(2)}`;
      acc+=amt;
    } else {
      acc+=parseFloat(document.getElementById('cacc-flat-'+k)?.value)||0;
    }
  });
  const cc=document.getElementById('carrier-custom-container');
  if(cc) cc.querySelectorAll('[id^="cacc-flat-custom-"]').forEach((el,i)=>{
    if(document.getElementById('cacc-chk-custom-'+i)?.checked) acc+=parseFloat(el.value)||0;
  });
  const el=document.getElementById('cinv-acc-total');const tot=document.getElementById('cinv-grand-total');
  if(el) el.textContent=fmtD(acc);
  if(tot) tot.textContent=fmtD(base+acc);
}

function addCarrierCharge(){
  const c=document.getElementById('carrier-custom-container');if(!c) return;
  const ci=c.querySelectorAll('[id^="cacc-flat-custom-"]').length;
  const d=document.createElement('div');d.style.cssText='padding:10px 0;border-bottom:1px solid var(--gray-100)';
  d.innerHTML=`<div style="display:flex;align-items:center;gap:10px">
    <input type="checkbox" id="cacc-chk-custom-${ci}" checked style="flex-shrink:0">
    <input type="text" id="carrier-desc-${ci}" placeholder="Charge description" style="flex:1;padding:5px 8px;font-size:13px;border:1px solid var(--gray-200);border-radius:var(--radius)">
    <input type="number" id="cacc-flat-custom-${ci}" placeholder="$0" min="0" oninput="calcCarrierTotal()" style="width:80px;padding:5px 7px;font-size:13px;text-align:right">
  </div>`;
  c.appendChild(d);
}

async function saveCarrierInvoiceData(type,id){
  const num=($('cinv-num')||{}).value?.trim();
  if(!num){alert('Invoice number required.');return;}
  const base=window._cinvBase||0;
  const HOURLY=['det_port','det_cust'];const DAILY=['storage','chassis'];
  const ALL_K=['chassis','prepull','det_port','det_cust','storage','ovw43','ovw48','toll','bobtail','genset','triaxle'];
  const accessorials={};let accTotal=0;
  ALL_K.forEach(k=>{
    if(!document.getElementById('cacc-chk-'+k)?.checked) return;
    const entry={enabled:true};
    if(HOURLY.includes(k)){entry.freeHrs=parseFloat(document.getElementById('cacc-free-'+k)?.value)||0;entry.totalHrs=parseFloat(document.getElementById('cacc-hrs-'+k)?.value)||0;entry.rate=parseFloat(document.getElementById('cacc-rate-'+k)?.value)||0;const b=Math.max(0,entry.totalHrs-entry.freeHrs);entry.amount=b*entry.rate;}
    else if(DAILY.includes(k)){entry.freeDays=parseFloat(document.getElementById('cacc-free-'+k)?.value)||0;entry.totalDays=parseFloat(document.getElementById('cacc-days-'+k)?.value)||0;entry.rate=parseFloat(document.getElementById('cacc-rate-'+k)?.value)||0;const b=Math.max(0,entry.totalDays-entry.freeDays);entry.amount=b*entry.rate;}
    else{entry.amount=parseFloat(document.getElementById('cacc-flat-'+k)?.value)||0;}
    accessorials[k]=entry;accTotal+=entry.amount||0;
  });
  const customCharges=[];
  const cc=document.getElementById('carrier-custom-container');
  if(cc) cc.querySelectorAll('[id^="cacc-flat-custom-"]').forEach((el,i)=>{
    if(document.getElementById('cacc-chk-custom-'+i)?.checked&&parseFloat(el.value)>0){const amt=parseFloat(el.value)||0;customCharges.push({desc:document.getElementById('carrier-desc-'+i)?.value?.trim()||'Carrier charge',amount:amt,enabled:true});accTotal+=amt;}
  });
  const inv={invNum:num,invDate:($('cinv-date')||{}).value||localDateStr(),invDue:($('cinv-due')||{}).value||'',notes:($('cinv-notes')||{}).value?.trim()||'',baseTotal:base,accTotal,grandTotal:base+accTotal,accessorials,customCharges,type,savedAt:localDateStr()};
  saveCarrierInvoice(id,inv);
  // Update quote with carrier invoice total
  if(type==='drayage'){
    const q=S.quotes.find(x=>x.id===id);
    if(q){
      q.carrierInvNum=num;
      if(!q.carrierRates) q.carrierRates={};
      q.carrierRates.total=inv.grandTotal;
      try{await dbSaveQuote(q);}catch(e){}
      try{localStorage.setItem('shifl_quotes_cache',JSON.stringify(S.quotes));}catch(e){}
    }
  } else if(type==='freight'){
    const q=(window._fqHistory||[]).find(x=>x.id===id);
    if(q){q.carrierInvNum=num;try{localStorage.setItem('fq_history',JSON.stringify(window._fqHistory));}catch(e){}}
  } else if(type==='transload'){
    const q=(window._tlHistory||[]).find(x=>x.id===id);
    if(q){q.carrierInvNum=num;try{localStorage.setItem('tl_history',JSON.stringify(window._tlHistory));}catch(e){}}
  } else if(type==='air'){
    const q=(window._aqHistory||[]).find(x=>x.id===id);
    if(q){q.carrierInvNum=num;try{localStorage.setItem('aq_history',JSON.stringify(window._aqHistory));}catch(e){}}
  }
  try{logAction('invoice_sent',`Carrier invoice ${num} — ${fmtD(base+accTotal)}`,'carrier_invoice',id);}catch(e){}
  closeModal();
  showToast('✅ Carrier invoice saved — '+num,'success');
  S.view='invoicing';S.invMainTab='carrier';S.allInvTab='pending';
  renderFullInvoicing();
}

function openFqCarrierInvoice(idx){
  const q=(window._fqHistory||[])[idx];
  if(!q){alert('Shipment not found.');return;}
  const existing=getCarrierInvoice(q.id)||{};
  const baseCarrier=q.carrierRate||0;
  const invNum=existing.invNum||'CINV-FQ-'+Date.now().toString().slice(-5);
  const today=localDateStr();
  const due30=new Date(Date.now()+30*864e5).toISOString().slice(0,10);
  const saved=existing.accessorials||{};

  const ACC=[
    {key:'fuel',label:'Fuel surcharge',note:'% of linehaul'},
    {key:'liftgate_pu',label:'Liftgate — pickup',note:'Flat'},
    {key:'liftgate_del',label:'Liftgate — delivery',note:'Flat'},
    {key:'residential',label:'Residential delivery',note:'Flat'},
    {key:'detention',label:'Detention',note:'Per hour'},
    {key:'layover',label:'Layover',note:'Per night'},
    {key:'redelivery',label:'Re-delivery',note:'Flat'},
    {key:'inside',label:'Inside delivery',note:'Flat'},
    {key:'toll',label:'Tolls',note:'Flat'},
    {key:'other',label:'Other charge',note:'Flat'},
  ];

  const rows=ACC.map(a=>{
    const sv=saved[a.key]||{};
    const isChecked=sv.enabled||false;
    return`<div style="padding:9px 0;border-bottom:1px solid var(--gray-100)">
      <div style="display:flex;align-items:center;gap:10px">
        <input type="checkbox" id="fq-cacc-${a.key}" ${isChecked?'checked':''} onchange="calcFqCarrierTotal(${idx})" style="flex-shrink:0">
        <div style="flex:1">
          <label for="fq-cacc-${a.key}" style="font-size:13px;font-weight:600;color:var(--navy);cursor:pointer">${a.label}</label>
          <div style="font-size:11px;color:var(--gray-400)">${a.note}</div>
        </div>
        <input type="number" id="fq-cacc-amt-${a.key}" value="${sv.amount||''}" placeholder="0" min="0"
          oninput="calcFqCarrierTotal(${idx})"
          style="width:90px;padding:5px 7px;font-size:13px;text-align:right;${!isChecked?'opacity:.4':''}">
      </div>
    </div>`;}).join('');

  $('modal-root').innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()">
  <div class="modal" style="max-width:580px;max-height:90vh;overflow-y:auto">
    <!-- Tab header -->
    <div style="display:flex;gap:0;margin-bottom:18px;border-bottom:2px solid var(--gray-100)">
      <div style="padding:10px 20px;font-size:14px;font-weight:700;color:var(--gray-400);cursor:pointer" onclick="closeModal();openInvoiceBuilder('freight','${q.id}')">🧾 Customer invoice</div>
      <div style="padding:10px 20px;font-size:14px;font-weight:700;color:var(--navy);border-bottom:2px solid var(--navy);margin-bottom:-2px">🚛 Carrier invoice (AP)</div>
    </div>

    <div style="background:#fffbeb;border:1px solid #fbbf24;border-radius:var(--radius);padding:8px 12px;margin-bottom:14px;font-size:12px;color:#92400e;font-weight:600">
      📤 Accounts Payable — what Shifl owes <strong>${q.carrier||'carrier'}</strong>
    </div>
    <div style="background:var(--blue-bg);border-radius:var(--radius);padding:8px 12px;margin-bottom:14px;font-size:12px;color:var(--steel)">
      ${q.fqMode} · ${q.pickupZip||'—'} → ${q.deliveryZip||'—'} · ${q.date||''}
    </div>

    <div class="g3" style="margin-bottom:14px">
      <div class="field"><label>Carrier invoice # *</label><input type="text" id="fqcinv-num" value="${existing.invNum||invNum}"></div>
      <div class="field"><label>Invoice date</label><input type="date" id="fqcinv-date" value="${existing.invDate||today}"></div>
      <div class="field"><label>Due date</label><input type="date" id="fqcinv-due" value="${existing.invDue||due30}"></div>
    </div>

    <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--gray-100);margin-bottom:8px">
      <span style="font-size:13px;font-weight:600;color:var(--navy)">Base carrier rate <span style="font-size:10px;background:var(--gray-100);padding:1px 6px;border-radius:99px;color:var(--gray-500)">locked</span></span>
      <span style="font-size:15px;font-weight:800;color:var(--navy)">${fmtD(baseCarrier)}</span>
    </div>

    <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--gray-400);margin-bottom:8px">Carrier accessorials</div>
    ${rows}

    <!-- Custom charges -->
    <div id="fq-carrier-custom">
      ${(existing.customCharges||[]).map((cc,ci)=>`
        <div style="padding:9px 0;border-bottom:1px solid var(--gray-100)">
          <div style="display:flex;align-items:center;gap:10px">
            <input type="checkbox" id="fq-cacc-custom-${ci}" checked onchange="calcFqCarrierTotal(${idx})" style="flex-shrink:0">
            <input type="text" id="fq-carrier-desc-${ci}" value="${cc.desc||''}" placeholder="Charge description" style="flex:1;padding:5px 8px;font-size:13px;border:1px solid var(--gray-200);border-radius:var(--radius)">
            <input type="number" id="fq-cacc-amt-custom-${ci}" value="${cc.amount||''}" placeholder="0" oninput="calcFqCarrierTotal(${idx})" style="width:90px;padding:5px 7px;font-size:13px;text-align:right">
          </div>
        </div>`).join('')}
    </div>
    <button onclick="addFqCarrierCharge(${idx})" style="width:100%;padding:8px;border:1.5px dashed var(--gray-300);background:transparent;border-radius:var(--radius);font-size:13px;color:var(--gray-500);cursor:pointer;margin:6px 0 14px">+ Add carrier charge</button>

    <div style="padding:12px 14px;background:var(--gray-50);border-radius:var(--radius)">
      <div style="display:flex;justify-content:space-between;margin-bottom:6px;font-size:13px;color:var(--gray-600)">
        <span>Base carrier rate</span><span>${fmtD(baseCarrier)}</span>
      </div>
      <div style="display:flex;justify-content:space-between;margin-bottom:10px;font-size:13px;color:var(--gray-600)">
        <span>Accessorials</span><span id="fqcinv-acc">$0.00</span>
      </div>
      <div style="display:flex;justify-content:space-between;padding-top:10px;border-top:1px solid var(--gray-200)">
        <span style="font-size:16px;font-weight:700;color:var(--navy)">Total payable</span>
        <span style="font-size:20px;font-weight:800;color:#d97706" id="fqcinv-total">${fmtD(baseCarrier)}</span>
      </div>
    </div>

    <div class="field" style="margin-top:14px"><label>Notes</label><input type="text" id="fqcinv-notes" value="${existing.notes||''}" placeholder="Payment terms, check #, etc."></div>
    ${buildAttachmentSection(q.id,'carrier','freight')}

    <div class="modal-foot">
      <button class="btn" onclick="closeModal()">Cancel</button>
      <button class="btn blue" onclick="saveFqCarrierInvoice(${idx})">📤 Send to SHIFL</button>
    </div>
  </div></div>`;

  window._fqCinvBase=baseCarrier;
  window._fqCinvIdx=idx;
  setTimeout(()=>calcFqCarrierTotal(idx),50);
}

function calcFqCarrierTotal(idx){
  const base=window._fqCinvBase||0;
  const ACC=['fuel','liftgate_pu','liftgate_del','residential','detention','layover','redelivery','inside','toll','other'];
  let acc=0;
  ACC.forEach(k=>{
    if(document.getElementById('fq-cacc-'+k)?.checked)
      acc+=parseFloat(document.getElementById('fq-cacc-amt-'+k)?.value)||0;
  });
  const cc=document.getElementById('fq-carrier-custom');
  if(cc) cc.querySelectorAll('[id^="fq-cacc-amt-custom-"]').forEach((el,i)=>{
    if(document.getElementById('fq-cacc-custom-'+i)?.checked) acc+=parseFloat(el.value)||0;
  });
  const at=document.getElementById('fqcinv-acc');if(at) at.textContent=fmtD(acc);
  const tot=document.getElementById('fqcinv-total');if(tot) tot.textContent=fmtD(base+acc);
}

function addFqCarrierCharge(idx){
  const c=document.getElementById('fq-carrier-custom');if(!c) return;
  const ci=c.querySelectorAll('[id^="fq-cacc-amt-custom-"]').length;
  const d=document.createElement('div');d.style.cssText='padding:9px 0;border-bottom:1px solid var(--gray-100)';
  d.innerHTML=`<div style="display:flex;align-items:center;gap:10px">
    <input type="checkbox" id="fq-cacc-custom-${ci}" checked onchange="calcFqCarrierTotal(${idx})" style="flex-shrink:0">
    <input type="text" id="fq-carrier-desc-${ci}" placeholder="Charge description" style="flex:1;padding:5px 8px;font-size:13px;border:1px solid var(--gray-200);border-radius:var(--radius)">
    <input type="number" id="fq-cacc-amt-custom-${ci}" placeholder="0" oninput="calcFqCarrierTotal(${idx})" style="width:90px;padding:5px 7px;font-size:13px;text-align:right">
  </div>`;
  c.appendChild(d);
}

async function saveFqCarrierInvoice(idx){
  const q=(window._fqHistory||[])[idx];if(!q) return;
  const num=($('fqcinv-num')||{}).value?.trim();
  if(!num){alert('Invoice number required.');return;}
  const base=window._fqCinvBase||0;
  const ACC=['fuel','liftgate_pu','liftgate_del','residential','detention','layover','redelivery','inside','toll','other'];
  const accessorials={};let accTotal=0;
  ACC.forEach(k=>{
    if(!document.getElementById('fq-cacc-'+k)?.checked) return;
    const amt=parseFloat(document.getElementById('fq-cacc-amt-'+k)?.value)||0;
    accessorials[k]={enabled:true,amount:amt};accTotal+=amt;
  });
  const customCharges=[];
  const cc=document.getElementById('fq-carrier-custom');
  if(cc) cc.querySelectorAll('[id^="fq-cacc-amt-custom-"]').forEach((el,i)=>{
    if(document.getElementById('fq-cacc-custom-'+i)?.checked&&parseFloat(el.value)>0){
      const amt=parseFloat(el.value)||0;
      customCharges.push({desc:document.getElementById('fq-carrier-desc-'+i)?.value?.trim()||'Carrier charge',amount:amt,enabled:true});
      accTotal+=amt;
    }
  });
  const inv={invNum:num,invDate:($('fqcinv-date')||{}).value||today,invDue:($('fqcinv-due')||{}).value||'',notes:($('fqcinv-notes')||{}).value?.trim()||'',baseTotal:base,accTotal,grandTotal:base+accTotal,accessorials,customCharges,type:'freight',savedAt:localDateStr()};
  saveCarrierInvoice(q.id,inv);
  closeModal();
  showToast('Carrier invoice saved — '+num,'success');
}



async function saveDrayRef(id, val){
  const q=S.quotes.find(q=>q.id===id);
  if(!q) return;
  q.shiflRef=val.trim();
  try{await db.from('quotes').update({shifl_ref:val.trim()}).eq('id',id);}
  catch(e){console.warn('Failed to save ref#:',e.message);}
}
// ════════════════════════════════════════════════════════════════════
// FILE ATTACHMENTS FOR INVOICES
// ════════════════════════════════════════════════════════════════════

function getInvoiceAttachments(id, invType){
  try{ return JSON.parse(localStorage.getItem('inv_attach_'+invType+'_'+id)||'[]'); }catch(e){ return []; }
}
function saveInvoiceAttachments(id, invType, files){
  try{ localStorage.setItem('inv_attach_'+invType+'_'+id, JSON.stringify(files)); }catch(e){}
}

function buildAttachmentSection(id, invType, shipType){
  const files = getInvoiceAttachments(id, invType);
  const isDrayage = shipType==='drayage';
  const isCarrier = invType==='carrier';

  const types = [
    {key:'pod', label:'📋 POD', desc:'Proof of Delivery', always:true},
    {key:'eir', label:'🎫 EIR Ticket', desc:'Equipment Interchange Receipt', always:isDrayage},
    {key:'carrier_inv', label:'🧾 Carrier Invoice', desc:"Carrier's invoice to Shifl", always:isCarrier},
  ].filter(t=>t.always);

  return `<div style="margin-top:16px;padding-top:16px;border-top:1px solid var(--gray-100)">
    <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--gray-400);margin-bottom:10px">📎 Attachments</div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px">
      ${types.map(t=>`
        <label style="display:flex;align-items:center;gap:6px;padding:6px 12px;border:1.5px dashed var(--gray-200);border-radius:var(--radius);cursor:pointer;font-size:12px;color:var(--gray-500);transition:border-color .15s" onmouseover="this.style.borderColor='var(--steel)'" onmouseout="this.style.borderColor='var(--gray-200)'">
          ${t.label} <span style="font-size:11px">${t.desc}</span>
          <input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" multiple style="display:none" onchange="handleAttachment('${id}','${invType}','${t.key}',this.files)">
        </label>`).join('')}
    </div>
    <div id="attach-list-${invType}-${id}" style="display:flex;flex-wrap:wrap;gap:6px">
      ${files.map((f,i)=>`<div style="display:flex;align-items:center;gap:6px;padding:4px 10px;background:var(--blue-bg);border-radius:var(--radius);font-size:12px;color:var(--steel)">
        <span>${f.name}</span>
        <button onclick="removeAttachment('${id}','${invType}',${i})" style="background:none;border:none;cursor:pointer;color:var(--gray-400);font-size:14px;padding:0;line-height:1">×</button>
      </div>`).join('')}
    </div>
  </div>`;
}

function handleAttachment(id, invType, docType, fileList){
  const files = getInvoiceAttachments(id, invType);
  Array.from(fileList).forEach(file=>{
    const reader = new FileReader();
    reader.onload = e=>{
      files.push({name:file.name, type:docType, size:file.size, data:e.target.result, uploadedAt:localDateStr()});
      saveInvoiceAttachments(id, invType, files);
      const listEl = document.getElementById('attach-list-'+invType+'-'+id);
      if(listEl) listEl.innerHTML = files.map((f,i)=>`<div style="display:flex;align-items:center;gap:6px;padding:4px 10px;background:var(--blue-bg);border-radius:var(--radius);font-size:12px;color:var(--steel)">
        <span>${f.name}</span>
        <button onclick="removeAttachment('${id}','${invType}',${i})" style="background:none;border:none;cursor:pointer;color:var(--gray-400);font-size:14px;padding:0;line-height:1">×</button>
      </div>`).join('');
      showToast(file.name+' attached','success',2000);
    };
    reader.readAsDataURL(file);
  });
}

function removeAttachment(id, invType, idx){
  const files = getInvoiceAttachments(id, invType);
  files.splice(idx,1);
  saveInvoiceAttachments(id, invType, files);
  const listEl = document.getElementById('attach-list-'+invType+'-'+id);
  if(listEl) listEl.innerHTML = files.map((f,i)=>`<div style="display:flex;align-items:center;gap:6px;padding:4px 10px;background:var(--blue-bg);border-radius:var(--radius);font-size:12px;color:var(--steel)">
    <span>${f.name}</span>
    <button onclick="removeAttachment('${id}','${invType}',${i})" style="background:none;border:none;cursor:pointer;color:var(--gray-400);font-size:14px;padding:0;line-height:1">×</button>
  </div>`).join('');
}


// ════════════════════════════════════════════════════════════════════
// REPEAT SHIPMENT — Quote builder + Quote log
// ════════════════════════════════════════════════════════════════════

function repeatDrayageQuote(id){
  const q = S.quotes.find(q=>q.id===id);
  if(!q){ alert('Quote not found.'); return; }

  // Build a review/edit confirmation modal
  const cr = q.carrierRates||{};
  const cu = q.customerRates||{};
  const bm = q.baseMarkup||{};
  const fr = q.flatRates||{};

  $('modal-root').innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()">
  <div class="modal" style="max-width:600px;max-height:90vh;overflow-y:auto">
    <div class="modal-title">🔁 Repeat shipment</div>
    <div style="background:#fffbeb;border:1.5px solid #fbbf24;border-radius:var(--radius);padding:10px 14px;margin-bottom:16px;font-size:13px;color:#92400e;font-weight:600">
      ⚠️ Review all details below before creating. Make any real-time changes needed.
    </div>

    <div class="g2">
      <div class="field"><label>Customer *</label><input type="text" id="rpt-customer" value="${q.customer||''}"></div>
      <div class="field"><label>Shifl Ref # <span style="font-size:10px;color:var(--gray-400)">(new)</span></label><input type="text" id="rpt-shiflref" value="" placeholder="Assign new ref #"></div>
    </div>

    <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--gray-400);margin-bottom:8px">Lane details</div>
    <div class="g3" style="margin-bottom:14px">
      <div class="field"><label>${q.drayType==='export'?'Pickup ZIP':'Port / CFS'}</label><input type="text" id="rpt-port" value="${q.port||'New York / Newark, NJ'}"></div>
      <div class="field"><label>${q.drayType==='export'?'Export Port':'Delivery ZIP'}</label><input type="text" id="rpt-zip" value="${q.zip||''}"></div>
      <div class="field"><label>Move type</label>
        <select id="rpt-ld">
          <option${q.ld==='Live'?' selected':''}>Live</option>
          <option${q.ld==='Drop'?' selected':''}>Drop</option>
          <option${q.ld==='Both'?' selected':''}>Both</option>
        </select>
      </div>
    </div>

    <div class="g2" style="margin-bottom:14px">
      <div class="field"><label>Carrier</label><input type="text" id="rpt-carrier" value="${q.carrier||''}"></div>
      <div class="field"><label># Containers</label>
        <div style="display:flex;align-items:center;gap:8px">
          <button type="button" onclick="let v=parseInt($('rpt-ctrs').textContent||1);if(v>1){$('rpt-ctrs').textContent=v-1;}" style="width:28px;height:28px;border:1px solid var(--gray-200);background:#fff;border-radius:4px;cursor:pointer;font-size:16px">−</button>
          <span id="rpt-ctrs" style="font-size:18px;font-weight:800;color:var(--navy);min-width:24px;text-align:center">${q.containerCount||1}</span>
          <button type="button" onclick="let v=parseInt($('rpt-ctrs').textContent||1);if(v<10){$('rpt-ctrs').textContent=v+1;}" style="width:28px;height:28px;border:1px solid var(--gray-200);background:#fff;border-radius:4px;cursor:pointer;font-size:16px">+</button>
        </div>
      </div>
    </div>

    <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--gray-400);margin-bottom:8px">Pricing</div>
    <div class="g2" style="margin-bottom:8px">
      <div class="field"><label>Base markup mode</label>
        <select id="rpt-bm-mode">
          <option value="pct"${bm.mode==='pct'?' selected':''}>Percentage (%)</option>
          <option value="flat"${bm.mode==='flat'?' selected':''}>Flat ($)</option>
        </select>
      </div>
      <div class="field"><label>Markup amount</label><input type="number" id="rpt-bm-amt" value="${bm.amount||0}" min="0"></div>
    </div>
    <div style="margin-bottom:14px">
      <div style="font-size:12px;font-weight:600;color:var(--gray-500);margin-bottom:6px">Accessorial flat rates (customer)</div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">
        ${['chassis','prepull','det_port','det_cust','storage','ovw43','ovw48','toll','bobtail'].map(c=>`
        <div class="field" style="margin-bottom:0">
          <label style="font-size:10px">${LABELS[c]}</label>
          <input type="number" id="rpt-fr-${c}" value="${fr[c]||0}" min="0" style="padding:5px 7px;font-size:12px">
        </div>`).join('')}
      </div>
    </div>

    <div class="field"><label>Notes</label><input type="text" id="rpt-notes" value="${q.notes||''}"></div>

    <div style="background:var(--gray-50);border-radius:var(--radius);padding:10px 14px;font-size:12px;color:var(--gray-600);margin-bottom:16px">
      A <strong>new quote</strong> will be created with today's date. The original quote (#${q.quoteNum}) is preserved.
    </div>

    <div class="modal-foot">
      <button class="btn" onclick="closeModal()">Cancel</button>
      <button class="btn blue" onclick="confirmRepeatDrayage('${id}')">✅ Create repeated quote</button>
    </div>
  </div></div>`;
}

function confirmRepeatDrayage(originalId){
  const orig = S.quotes.find(q=>q.id===originalId);
  if(!orig) return;

  // Build new quote from modal values
  const bm = {mode:$('rpt-bm-mode').value, amount:parseFloat($('rpt-bm-amt').value)||0};
  const fr = {};
  ['chassis','prepull','det_port','det_cust','storage','ovw43','ovw48','toll','bobtail'].forEach(c=>{
    fr[c]=parseFloat($('rpt-fr-'+c)?.value)||0;
  });

  const customer = ($('rpt-customer')||{}).value?.trim()||orig.customer;
  if(!customer){ alert('Customer name required.'); return; }

  // Copy state into qi
  Object.assign(S.qi, {
    customer,
    customerEmail: orig.customerEmail||'',
    customerId: orig.customerId||null,
    port: ($('rpt-port')||{}).value?.trim()||orig.port,
    zip: ($('rpt-zip')||{}).value?.trim()||orig.zip,
    ld: $('rpt-ld')?.value||orig.ld,
    carrier: ($('rpt-carrier')||{}).value?.trim()||orig.carrier,
    destination: orig.destination||'',
    drayType: orig.drayType||'import',
    containerCount: parseInt($('rpt-ctrs')?.textContent)||1,
    baseMarkup: bm,
    flatRates: fr,
    notes: ($('rpt-notes')||{}).value?.trim()||'',
    shiflRef: ($('rpt-shiflref')||{}).value?.trim()||'',
    commodity: orig.commodity||'',
    pickupZip: orig.pickupZip||'',
    gensetEnabled:orig.gensetEnabled||false,
    gensetScope:orig.gensetScope||'both',
    gensetCarrierRate:orig.gensetCarrierRate||0,
    gensetCustomerRate:orig.gensetCustomerRate||0,
    bobtailEnabled:orig.bobtailEnabled||false,
    bobtailScope:orig.bobtailScope||'both',
    bobtailCarrierRate:orig.bobtailCarrierRate||0,
    bobtailCustomerRate:orig.bobtailCustomerRate||0,
    triaxleEnabled:orig.triaxleEnabled||false,
    triaxleScope:orig.triaxleScope||'both',
    triaxleCarrierRate:orig.triaxleCarrierRate||0,
    triaxleCustomerRate:orig.triaxleCustomerRate||0,
  });
  S.selId = null;

  closeModal();
  goTo('quote');
  openAccFor('quote');
  updateSubActive('quote');

  showToast('Repeat quote loaded — review and save when ready','info',4000);
  // Show confirmation banner in builder
  setTimeout(()=>{
    const page=$('page');if(!page) return;
    const banner=document.createElement('div');
    banner.style.cssText='background:#fffbeb;border:1.5px solid #fbbf24;border-radius:var(--radius);padding:10px 14px;margin-bottom:12px;font-size:13px;color:#92400e;font-weight:600;display:flex;align-items:center;gap:8px';
    banner.innerHTML='⚠️ <span>Repeat shipment — all details pre-filled from Q-#'+orig.quoteNum+'. Review and save as a new quote.</span>';
    const firstCard=page.querySelector('.card');
    if(firstCard) firstCard.parentNode.insertBefore(banner,firstCard);
  },200);
}

// Freight repeat
function repeatFreightQuote(idOrIdx){
  const q = typeof idOrIdx==='string'
    ? (window._fqHistory||[]).find(x=>x.id===idOrIdx)
    : (window._fqHistory||[])[idOrIdx];
  if(!q){ alert('Quote not found.'); return; }
  const isLCL=q.fqMode==='LCL';

  $('modal-root').innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()">
  <div class="modal" style="max-width:580px;max-height:90vh;overflow-y:auto">
    <div class="modal-title">🔁 Duplicate ${q.fqMode} shipment</div>
    <div style="background:#fffbeb;border:1.5px solid #fbbf24;border-radius:var(--radius);padding:10px 14px;margin-bottom:16px;font-size:13px;color:#92400e;font-weight:600">
      ⚠️ Review all details below — make changes as needed before creating.
    </div>

    <div style="background:var(--blue-bg);border-radius:var(--radius);padding:8px 12px;margin-bottom:14px;font-size:12px;color:var(--steel);font-weight:600">
      Mode: <strong>${q.fqMode}</strong>${q.fqEquip?' · '+q.fqEquip:''} · Originally quoted ${q.date||''}
    </div>

    <div class="g2">
      <div class="field"><label>Customer *</label><input type="text" id="frpt-customer" value="${q.customer||''}"></div>
      <div class="field"><label>Shifl Ref # (new)</label><input type="text" id="frpt-shiflref" value="" placeholder="Assign new ref #"></div>
    </div>
    <div class="g2">
      <div class="field"><label>Pickup ZIP</label><input type="text" id="frpt-pickup" value="${q.pickupZip||''}"></div>
      <div class="field"><label>Delivery ZIP</label><input type="text" id="frpt-delivery" value="${q.deliveryZip||''}"></div>
    </div>
    <div class="g2">
      <div class="field"><label>Carrier</label><input type="text" id="frpt-carrier" value="${q.carrier||''}"></div>
      <div class="field"><label>Equipment</label><input type="text" id="frpt-equip" value="${q.fqEquip||''}"></div>
    </div>
    <div class="g2">
      <div class="field"><label>Carrier rate ($)</label><input type="number" id="frpt-carr-rate" value="${q.carrierRate||0}" min="0"></div>
      <div class="field"><label>Customer rate ($)</label><input type="number" id="frpt-cust-rate" value="${q.customerRate||0}" min="0"></div>
    </div>
    <div class="g2">
      <div class="field"><label>Weight (lbs)</label><input type="number" id="frpt-weight" value="${q.weight||''}"></div>
      <div class="field"><label>Pallets</label><input type="number" id="frpt-pallets" value="${q.palletCount||''}"></div>
    </div>

    ${isLCL?`
    <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--gray-400);margin:12px 0 8px">LCL Details</div>
    <div class="g3">
      <div class="field"><label>CBM</label><input type="number" id="frpt-cbm" value="${q.cbm||''}" placeholder="0.00" step="0.01"></div>
      <div class="field"><label>Free time (hrs)</label><input type="number" id="frpt-free-hrs" value="${q.lclFreeHours??2}" min="0"></div>
      <div class="field"><label>Pallet count *</label><input type="number" id="frpt-lcl-pallets" value="${q.lclPalletCount||''}" placeholder="Required"></div>
    </div>
    <div class="g2">
      <div class="field"><label>Customer detention ($/hr)</label><input type="number" id="frpt-cust-det" value="${q.lclCustomerDetRate||0}" min="0"></div>
      <div class="field"><label>Customer pallet rate ($/plt)</label><input type="number" id="frpt-cust-plt" value="${q.lclCustomerPalletRate||0}" min="0"></div>
    </div>`:''}

    <div class="field"><label>Notes</label><input type="text" id="frpt-notes" value="${q.notes||''}"></div>

    <div style="background:var(--gray-50);border-radius:var(--radius);padding:10px 14px;font-size:12px;color:var(--gray-600);margin-bottom:16px">
      Creates a <strong>new quote</strong> with today's date · Status: Quoted · Original is preserved
    </div>

    <div class="modal-foot">
      <button class="btn" onclick="closeModal()">Cancel</button>
      <button class="btn blue" onclick="confirmRepeatFreight('${q.id}')">✅ Create duplicate</button>
    </div>
  </div></div>`;
}

function confirmRepeatFreight(origId){
  const orig = (window._fqHistory||[]).find(x=>x.id===origId);
  if(!orig) return;
  const customer=($('frpt-customer')||{}).value?.trim()||orig.customer;
  if(!customer){alert('Customer required.');return;}

  S.fq.mode=orig.fqMode; // keep same mode
  S.fq.equipment=($('frpt-equip')||{}).value?.trim()||orig.fqEquip||'';
  S.fq.pickupZip=($('frpt-pickup')||{}).value?.trim()||orig.pickupZip;
  S.fq.deliveryZip=($('frpt-delivery')||{}).value?.trim()||orig.deliveryZip;
  S.fq.customer=customer;
  S.fq.customerEmail=orig.customerEmail||'';
  S.fq.customerId=orig.customerId||null;
  S.fq.carrier=($('frpt-carrier')||{}).value?.trim()||orig.carrier;
  S.fq.carrierRate=parseFloat($('frpt-carr-rate')?.value)||orig.carrierRate||0;
  S.fq.customerRate=parseFloat($('frpt-cust-rate')?.value)||orig.customerRate||0;
  S.fq.weight=($('frpt-weight')||{}).value||orig.weight||'';
  S.fq.palletCount=($('frpt-pallets')||{}).value||orig.palletCount||'';
  S.fq.notes=($('frpt-notes')||{}).value?.trim()||orig.notes||'';
  S.fq.shiflRef=($('frpt-shiflref')||{}).value?.trim()||'';
  S.fq.transitTime=orig.transitTime||'';
  // LCL-specific fields
  if(orig.fqMode==='LCL'){
    S.fq.cbm=($('frpt-cbm')||{}).value||orig.cbm||'';
    S.fq.lclFreeHours=parseFloat($('frpt-free-hrs')?.value)??orig.lclFreeHours??2;
    S.fq.lclPalletCount=parseFloat($('frpt-lcl-pallets')?.value)||orig.lclPalletCount||0;
    S.fq.lclCustomerDetRate=parseFloat($('frpt-cust-det')?.value)||orig.lclCustomerDetRate||0;
    S.fq.lclCustomerPalletRate=parseFloat($('frpt-cust-plt')?.value)||orig.lclCustomerPalletRate||0;
    S.fq.lclDetentionHours=0;
    S.fq.lclPalletExchange=0;
  }

  closeModal();
  goTo('freight','builder');
  openAccFor('freight');
  showToast(`${orig.fqMode} quote duplicated — review and save`,'info',4000);
}



function showRepeatPicker(){
  const recent=S.quotes.filter(q=>q.status!=='Draft').slice(0,20);
  $('modal-root').innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()">
  <div class="modal" style="max-width:520px">
    <div class="modal-title">🔁 Repeat a shipment</div>
    <p style="font-size:13px;color:var(--gray-500);margin-bottom:14px">Select a previous quote to pre-fill this builder with its lane, carrier, and pricing.</p>
    <div style="max-height:400px;overflow-y:auto">
      ${recent.length?recent.map(q=>`
        <div onclick="closeModal();repeatDrayageQuote('${q.id}')"
          style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;border-bottom:1px solid var(--gray-100);cursor:pointer;transition:background .12s"
          onmouseover="this.style.background='var(--blue-bg)'" onmouseout="this.style.background=''">
          <div>
            <div style="font-weight:700;color:var(--navy);font-size:13px">${q.customer||'—'}</div>
            <div style="font-size:11px;color:var(--gray-500)">${q.port||'—'} → ${q.zip||'—'} · ${q.ld||'Live'} · ${q.carrier||'—'}</div>
          </div>
          <div style="text-align:right">
            <div style="font-size:12px;font-weight:600;color:var(--steel)">${fmtD(q.customerRates?.total||0)}</div>
            <div style="font-size:10px;color:var(--gray-400)">${q.date} · ${q.status}</div>
          </div>
        </div>`).join('')
      :'<div style="padding:24px;text-align:center;color:var(--gray-400)">No previous quotes found</div>'}
    </div>
    <div class="modal-foot"><button class="btn" onclick="closeModal()">Cancel</button></div>
  </div></div>`;
}

// ════════════════════════════════════════════════════════════════════
// PROFIT MONITOR — Super Admin Only
// ════════════════════════════════════════════════════════════════════
function renderProfitMonitor(){
  if(_currentUser?.role!=='super_admin'){
    $('page').innerHTML='<div class="empty"><p>Super Admin access only.</p></div>';return;
  }
  // PIN check (skip if already verified this session)
  if(!sessionStorage.getItem('pm_pin_ok')){
    const userPin=localStorage.getItem('shifl_pm_pin')||'';
    if(userPin){
      $('page').innerHTML=`<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:60vh">
        <div style="font-size:40px;margin-bottom:12px">🔐</div>
        <div style="font-size:18px;font-weight:700;color:#0a1628;margin-bottom:4px">Profit Monitor</div>
        <div style="font-size:13px;color:#64748b;margin-bottom:20px">Enter PIN to continue</div>
        <input id="pm-pin-input" type="password" maxlength="4" placeholder="••••" style="width:120px;text-align:center;padding:10px;border:2px solid #e2e8f0;border-radius:10px;font-size:24px;letter-spacing:8px;margin-bottom:12px" onkeyup="if(this.value.length===4){if(this.value===localStorage.getItem('shifl_pm_pin')){sessionStorage.setItem('pm_pin_ok','1');renderProfitMonitor();}else{this.value='';this.style.borderColor='#dc2626';setTimeout(()=>this.style.borderColor='#e2e8f0',1000);}}">
        <div style="font-size:11px;color:#94a3b8">Set PIN in Settings or type it above</div>
      </div>`;
      return;
    }
  }

  const commPct = parseFloat(localStorage.getItem('shifl_comm_pct')||'0');
  const modeFilter = S.pmFilter||'all';
  const dateFilter = S.pmDate||'all';
  const tab = S.pmTab||'delivered'; // active | delivered | all

  // Status sets
  const ACTIVE_ST  = ['Booked'];
  const DONE_ST    = ['Delivered','Invoiced','Paid'];
  const ALL_ST     = [...ACTIVE_ST,...DONE_ST];

  function buildRows(statusSet){
    const dray=(S.quotes||[]).filter(q=>statusSet.includes(q.status)).map(q=>({
      id:q.id,type:'drayage',customer:q.customer||'—',shiflRef:q.shiflRef||'—',
      lane:`${q.port||'—'} → ${q.zip||'—'}`,carrier:q.carrier||'—',
      date:q.date,status:q.status,
      carrierCost:(p=>p.cost)(getShipmentProfit(q,'drayage')),
      customerRate:(p=>p.revenue)(getShipmentProfit(q,'drayage')),
      profit:(p=>p.profit)(getShipmentProfit(q,'drayage')),
      margin:(p=>p.margin)(getShipmentProfit(q,'drayage')),
      isActual:(p=>p.isActual)(getShipmentProfit(q,'drayage')),
      modeLabel:'Drayage',
      addedToSheet:localStorage.getItem('pm_sheet_'+q.id)==='1'
    }));
    const fq=(window._fqHistory||[]).filter(q=>statusSet.includes(q.status)).map(q=>({
      id:q.id,type:'freight',customer:q.customer||'—',shiflRef:q.shiflRef||'—',
      lane:`${q.pickupZip||'—'} → ${q.deliveryZip||'—'}`,carrier:q.carrier||'—',
      date:q.date,status:q.status,
      carrierCost:(p=>p.cost)(getShipmentProfit(q,'freight')),
      customerRate:(p=>p.revenue)(getShipmentProfit(q,'freight')),
      profit:(p=>p.profit)(getShipmentProfit(q,'freight')),
      margin:(p=>p.margin)(getShipmentProfit(q,'freight')),
      isActual:(p=>p.isActual)(getShipmentProfit(q,'freight')),
      modeLabel:q.fqMode||'Freight',
      addedToSheet:localStorage.getItem('pm_sheet_'+q.id)==='1'
    }));
    const aq=(window._aqHistory||[]).filter(q=>statusSet.includes(q.status)).map(q=>({
      id:q.id,type:'air',customer:q.customer||'—',shiflRef:q.shiflRef||q.quoteNum||'—',
      lane:`${q.originAirport||'—'} → ${q.destAirport||'—'}`,carrier:q.carrier||'—',
      date:q.date,status:q.status,
      carrierCost:q.carrierRates?.total||0,
      customerRate:q.customerRates?.total||q.customerRate||0,
      profit:(q.customerRates?.total||q.customerRate||0)-(q.carrierRates?.total||0),
      margin:q.customerRates?.total>0?((q.customerRates.total-(q.carrierRates?.total||0))/q.customerRates.total):0,
      isActual:false,modeLabel:'Air',
      addedToSheet:localStorage.getItem('pm_sheet_'+q.id)==='1'
    }));
    const tl=(window._tlHistory||[]).filter(q=>statusSet.includes(q.status)).map(q=>({
      id:q.id,type:'transload',customer:q.customer||'—',shiflRef:q.shiflRef||'—',
      lane:`${q.drayPort||'—'} → ${q.outDeliveryZip||'—'}`,carrier:q.outCarrier||'—',
      date:q.date,status:q.status,
      carrierCost:(p=>p.cost)(getShipmentProfit(q,'transload')),
      customerRate:(p=>p.revenue)(getShipmentProfit(q,'transload')),
      profit:(p=>p.profit)(getShipmentProfit(q,'transload')),
      margin:(p=>p.margin)(getShipmentProfit(q,'transload')),
      isActual:(p=>p.isActual)(getShipmentProfit(q,'transload')),
      modeLabel:'Transload',
      addedToSheet:localStorage.getItem('pm_sheet_'+q.id)==='1'
    }));
    return [...dray,...fq,...tl,...aq];
  }

  const statusSet = tab==='active'?ACTIVE_ST : tab==='delivered'?DONE_ST : ALL_ST;
  let all = buildRows(statusSet);

  // Date filter
  const today=localDateStr();
  const week=new Date(Date.now()-7*864e5).toISOString().slice(0,10);
  const month=new Date(Date.now()-30*864e5).toISOString().slice(0,10);
  if(dateFilter==='week')  all=all.filter(q=>q.date>=week);
  else if(dateFilter==='month') all=all.filter(q=>q.date>=month);
  else if(dateFilter==='today') all=all.filter(q=>q.date===today);

  // Mode filter
  if(modeFilter!=='all') all=all.filter(q=>q.type===modeFilter);

  // Sort newest first
  all.sort((a,b)=>(b.date||'').localeCompare(a.date||''));

  const totalCarrier=all.reduce((s,q)=>s+q.carrierCost,0);
  const totalCustomer=all.reduce((s,q)=>s+q.customerRate,0);
  const totalProfit=all.reduce((s,q)=>s+q.profit,0);
  const totalMargin=totalCustomer>0?totalProfit/totalCustomer:0;
  const myCommission=totalProfit*(commPct/100);

  // Tab counts
  const activeCnt = buildRows(ACTIVE_ST).length;
  const delivCnt  = buildRows(DONE_ST).length;
  const allCnt    = buildRows(ALL_ST).length;

  $('topbar-right').innerHTML=`
    <button onclick="pmDownloadCSV()" style="display:flex;align-items:center;gap:6px;padding:7px 14px;border-radius:8px;border:none;background:linear-gradient(135deg,#059669,#34d399);color:#fff;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;box-shadow:0 2px 8px rgba(5,150,105,.3)">
      📥 Download CSV
    </button>`;

  $('page').style.padding='12px 12px';

  $('page').innerHTML=`
  <!-- Tabs -->
  <div style="display:flex;gap:0;border-bottom:2px solid #e2e8f0;margin-bottom:14px">
    ${[['active','⚡ Active',activeCnt,'#d97706'],['delivered','✅ Delivered',delivCnt,'#059669'],['all','📋 All',allCnt,'#2563eb']].map(([t,lbl,cnt,col])=>`
      <button onclick="S.pmTab='${t}';renderProfitMonitor()" style="padding:10px 22px;border:none;border-bottom:${tab===t?'3px solid '+col:'3px solid transparent'};background:none;font-size:13px;font-weight:${tab===t?'700':'500'};color:${tab===t?col:'#94a3b8'};cursor:pointer;font-family:inherit;display:flex;align-items:center;gap:7px">
        ${lbl} <span style="background:${tab===t?col:'#e2e8f0'};color:${tab===t?'#fff':'#64748b'};border-radius:99px;font-size:10px;font-weight:700;padding:1px 7px">${cnt}</span>
      </button>`).join('')}
    <div style="flex:1"></div>
    <!-- Commission -->
    <div style="display:flex;align-items:center;gap:6px;padding:0 12px">
      <span style="font-size:11px;color:#94a3b8;white-space:nowrap">Commission:</span>
      <input type="number" id="pm-comm" value="${commPct}" min="0" max="100" step="0.5"
        oninput="localStorage.setItem('shifl_comm_pct',this.value);renderProfitMonitor()"
        style="width:56px;padding:4px 8px;font-size:13px;font-weight:700;border:1.5px solid #2563eb;border-radius:6px;text-align:center">
      <span style="font-size:13px;font-weight:700;color:#374151">%</span>
    </div>
    <!-- Mode filter -->
    <div style="display:flex;gap:4px;padding:0 8px;align-items:center">
      <div style="display:flex;gap:4px;padding:0 8px;align-items:center">
      <span style="font-size:11px;color:#94a3b8">Rep:</span>
      ${[['all','All'],[ ...[...new Set([...(S.quotes||[]).map(q=>q.created_by_name||'').filter(Boolean)]) ] .map(r=>[r,r]) ]].flat(0).filter((v,i,a)=>i===0||a[i-1][0]!==v[0]).map(([r,l])=>`<button onclick="S.pmRep='${r}';renderProfitMonitor()" style="padding:4px 8px;border-radius:6px;border:1px solid #e2e8f0;background:${(S.pmRep||'all')===r?'#0a1628':'#fff'};color:${(S.pmRep||'all')===r?'#fff':'#64748b'};font-size:11px;font-weight:600;cursor:pointer;font-family:inherit">${l}</button>`).join('')}
    </div>
    ${['all','drayage','freight','transload'].map(f=>`<button onclick="S.pmFilter='${f}';renderProfitMonitor()"" style="padding:4px 10px;border-radius:6px;border:1px solid #e2e8f0;background:${modeFilter===f?'#0a1628':'#fff'};color:${modeFilter===f?'#fff':'#64748b'};font-size:11px;font-weight:600;cursor:pointer;font-family:inherit">${f==='all'?'All':f.charAt(0).toUpperCase()+f.slice(1)}</button>`).join('')}
    </div>
    <!-- Date filter -->
    <div style="display:flex;gap:4px;padding:0 8px;align-items:center">
      ${['all','today','week','month'].map(d=>`<button onclick="S.pmDate='${d}';renderProfitMonitor()" style="padding:4px 10px;border-radius:6px;border:1px solid #e2e8f0;background:${dateFilter===d?'#0a1628':'#fff'};color:${dateFilter===d?'#fff':'#64748b'};font-size:11px;font-weight:600;cursor:pointer;font-family:inherit">${d==='all'?'All time':d.charAt(0).toUpperCase()+d.slice(1)}</button>`).join('')}
    </div>
  </div>

  <!-- KPI strip -->
  <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin-bottom:14px">
    <div style="background:#fff;border-radius:10px;border:1px solid #e2e8f0;padding:12px 14px">
      <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#94a3b8;margin-bottom:4px">Loads</div>
      <div style="font-size:22px;font-weight:800;color:#0a1628">${all.length}</div>
      <div style="font-size:10px;color:#94a3b8;margin-top:2px">${tab==='active'?'in transit':tab==='delivered'?'completed':'total'}</div>
    </div>
    <div style="background:#fff;border-radius:10px;border:1px solid #e2e8f0;padding:12px 14px">
      <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#94a3b8;margin-bottom:4px">Carrier pay</div>
      <div style="font-size:22px;font-weight:800;color:#dc2626">$${Math.round(totalCarrier).toLocaleString()}</div>
      <div style="font-size:10px;color:#94a3b8;margin-top:2px">${tab==='active'?'est.':''}</div>
    </div>
    <div style="background:#fff;border-radius:10px;border:1px solid #e2e8f0;padding:12px 14px">
      <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#94a3b8;margin-bottom:4px">Sell rate</div>
      <div style="font-size:22px;font-weight:800;color:#2563eb">$${Math.round(totalCustomer).toLocaleString()}</div>
      <div style="font-size:10px;color:#94a3b8;margin-top:2px">${tab==='active'?'est.':''}</div>
    </div>
    <div style="background:#fff;border-radius:10px;border:1px solid #e2e8f0;padding:12px 14px;border-left:3px solid #059669">
      <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#94a3b8;margin-bottom:4px">Gross profit</div>
      <div style="font-size:22px;font-weight:800;color:#059669">$${Math.round(totalProfit).toLocaleString()}</div>
      <div style="font-size:10px;color:#059669;margin-top:2px">${Math.round(totalMargin*100)}% margin${tab==='active'?' · est.':''}</div>
    </div>
    <div style="background:#fff;border-radius:10px;border:1px solid #e2e8f0;padding:12px 14px;border-left:3px solid #7c3aed">
      <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#94a3b8;margin-bottom:4px">My cut (${commPct}%)</div>
      <div style="font-size:22px;font-weight:800;color:#7c3aed">$${Math.round(myCommission).toLocaleString()}</div>
      <div style="font-size:10px;color:#94a3b8;margin-top:2px">${tab==='active'?'est.':''}</div>
    </div>
  </div>

  <!-- Table — full width -->
  ${all.length===0?`<div style="text-align:center;padding:60px;color:#94a3b8"><div style="font-size:36px;margin-bottom:12px">${tab==='active'?'🚛':tab==='delivered'?'✅':'📋'}</div><div style="font-size:15px;font-weight:600;color:#374151;margin-bottom:6px">No ${tab==='active'?'active':'delivered'} loads</div><div style="font-size:12px">${tab==='active'?'Loads marked Booked will appear here':'Loads marked Delivered, Invoiced, or Paid will appear here'}</div></div>`
  :`<div style="overflow-x:auto;border-radius:10px;border:1px solid #e2e8f0;background:#fff">
  <table style="width:100%;border-collapse:collapse;table-layout:fixed">
    <colgroup>
      <col style="width:12%">
      <col style="width:6%">
      <col style="width:6%">
      <col style="width:11%">
      <col style="width:9%">
      <col style="width:6%">
      <col style="width:6%">
      <col style="width:8%">
      <col style="width:8%">
      <col style="width:7%">
      <col style="width:5%">
      <col style="width:6%">
      <col style="width:10%">
    </colgroup>
    <thead>
      <tr style="background:#f8fafc;border-bottom:2px solid #e2e8f0">
        <th style="padding:10px 10px;text-align:left;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#94a3b8">Customer</th>
        <th style="padding:10px 8px;text-align:left;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#94a3b8">Type</th>
        <th style="padding:10px 8px;text-align:left;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#94a3b8">Ref #</th>
        <th style="padding:10px 8px;text-align:left;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#94a3b8">Lane</th>
        <th style="padding:10px 8px;text-align:left;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#94a3b8">Carrier</th>
        <th style="padding:10px 8px;text-align:left;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#94a3b8">Date</th>
        <th style="padding:10px 8px;text-align:center;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#94a3b8">Status</th>
        <th style="padding:10px 8px;text-align:right;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#dc2626">Carrier pay</th>
        <th style="padding:10px 8px;text-align:right;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#2563eb">Sell rate</th>
        <th style="padding:10px 8px;text-align:right;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#059669">Profit</th>
        <th style="padding:10px 8px;text-align:right;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#94a3b8">Margin</th>
        <th style="padding:10px 8px;text-align:right;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#7c3aed">My cut</th>
        <th style="padding:10px 8px;text-align:center;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#94a3b8">📊 Sheet</th>
      </tr>
    </thead>
    <tbody>
      ${all.map(q=>{
        const myCut=q.profit*(commPct/100);
        const mc=Math.round(q.margin*100);
        const margCol=mc>=20?'#059669':mc>=12?'#d97706':'#dc2626';
        const statusCol=q.status==='Delivered'||q.status==='Invoiced'||q.status==='Paid'?'#059669':q.status==='Booked'?'#d97706':'#94a3b8';
        const statusBg=q.status==='Delivered'||q.status==='Invoiced'||q.status==='Paid'?'#d1fae5':q.status==='Booked'?'#fef3c7':'#f1f5f9';
        return `<tr style="border-bottom:1px solid #f1f5f9;transition:background .1s" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background=(()=>{const _m=parseFloat(q.margin||0);return _m<0.05?'#fff5f5':_m<0.12?'#fffbeb':''})();">
          <td style="padding:10px 10px;font-size:12px;font-weight:600;color:#0a1628;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${q.customer}</td>
          <td style="padding:10px 8px"><span style="background:#e2e8f0;color:#374151;border-radius:99px;font-size:10px;font-weight:700;padding:2px 8px;white-space:nowrap">${q.modeLabel}</span></td>
          <td style="padding:10px 8px;font-size:11px;color:#2563eb;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${q.shiflRef||'—'}</td>
          <td style="padding:10px 8px;font-size:11px;color:#374151;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${q.lane}</td>
          <td style="padding:10px 8px;font-size:11px;color:#374151;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${q.carrier}</td>
          <td style="padding:10px 8px;font-size:11px;color:#64748b;white-space:nowrap">${q.date||'—'}</td>
          <td style="padding:10px 8px;text-align:center"><span style="background:${statusBg};color:${statusCol};border-radius:99px;font-size:10px;font-weight:700;padding:3px 9px;white-space:nowrap">${q.status}</span></td>
          <td style="padding:10px 8px;text-align:right;font-size:13px;font-weight:700;color:#dc2626">${['Delivered','Invoiced','Paid'].includes(q.status)?`<input type="number" value="${Math.round(q.carrierCost)}" onchange="pmUpdatePrice('${q.id}','${q.type}','carrier',this.value)" style="width:78px;text-align:right;border:1.5px solid #fecaca;border-radius:6px;padding:3px 5px;font-size:12px;font-weight:700;color:#dc2626;background:#fff5f5;font-family:inherit" title="Click to edit carrier cost">`:('$'+Math.round(q.carrierCost).toLocaleString())}</td>
          <td style="padding:10px 8px;text-align:right;font-size:13px;font-weight:700;color:#2563eb">${['Delivered','Invoiced','Paid'].includes(q.status)?`<input type="number" value="${Math.round(q.customerRate)}" onchange="pmUpdatePrice('${q.id}','${q.type}','sell',this.value)" style="width:78px;text-align:right;border:1.5px solid #bfdbfe;border-radius:6px;padding:3px 5px;font-size:12px;font-weight:700;color:#2563eb;background:#eff6ff;font-family:inherit" title="Click to edit sell rate">`:('$'+Math.round(q.customerRate).toLocaleString())}</td>
          <td style="padding:10px 8px;text-align:right" id="pm-profit-${q.id}">
            <div style="font-size:13px;font-weight:800;color:#059669">$${Math.round(q.profit).toLocaleString()}</div>
            ${q.isActual?'<div style="font-size:9px;color:#059669;font-weight:600">actual</div>':'<div style="font-size:9px;color:#94a3b8">est.</div>'}
          </td>
          <td style="padding:10px 8px;text-align:right;font-size:13px;font-weight:700;color:${margCol}">${mc}%</td>
          <td style="padding:10px 8px;text-align:right;font-size:13px;font-weight:700;color:#7c3aed">$${Math.round(myCut).toLocaleString()}</td>
          <td style="padding:10px 8px;text-align:center"><button onclick="pmToggleSheet('${q.id}',${!q.addedToSheet})" style="width:26px;height:26px;border-radius:6px;border:2px solid ${q.addedToSheet?'#059669':'#e2e8f0'};background:${q.addedToSheet?'#059669':'#fff'};cursor:pointer;display:inline-flex;align-items:center;justify-content:center;font-size:13px" title="${q.addedToSheet?'Remove from sheet':'Mark as added to sheet'}">${q.addedToSheet?'✓':''}</button></td>
        </tr>`;
      }).join('')}
      <tr style="background:#f8fafc;border-top:2px solid #e2e8f0;font-weight:700">
        <td colspan="7" style="padding:10px 10px;font-size:12px;font-weight:700;color:#0a1628">Totals (${all.length} loads)</td>
        <td style="padding:10px 8px;text-align:right;font-size:13px;font-weight:800;color:#dc2626">$${Math.round(totalCarrier).toLocaleString()}</td>
        <td style="padding:10px 8px;text-align:right;font-size:13px;font-weight:800;color:#2563eb">$${Math.round(totalCustomer).toLocaleString()}</td>
        <td style="padding:10px 8px;text-align:right;font-size:13px;font-weight:800;color:#059669">$${Math.round(totalProfit).toLocaleString()}</td>
        <td style="padding:10px 8px;text-align:right;font-size:13px;font-weight:800;color:${Math.round(totalMargin*100)>=12?'#059669':'#dc2626'}">${Math.round(totalMargin*100)}%</td>
        <td style="padding:10px 8px;text-align:right;font-size:13px;font-weight:800;color:#7c3aed">$${Math.round(myCommission).toLocaleString()}</td>
        <td style="padding:10px 8px;text-align:center;font-size:10px;color:#94a3b8">${all.filter(q=>q.addedToSheet).length} ✓</td>
      </tr>
    </tbody>
  </table></div>`}`;
}


function pmToggleSheet(id, addIt){
  if(addIt==='true'||addIt===true){
    localStorage.setItem('pm_sheet_'+id,'1');
    showToast('✅ Marked as added to spreadsheet','success',2000);
  } else {
    localStorage.removeItem('pm_sheet_'+id);
    showToast('Removed from spreadsheet','info',1500);
  }
  renderProfitMonitor();
}

function pmDownloadCSV(){
  const commPct=parseFloat(localStorage.getItem('shifl_comm_pct')||'0');
  const filter=S.pmFilter||'all';
  const dateFilter=S.pmDate||'all';
  const WON=['Delivered','Invoiced','Paid'];
  const dray=(S.quotes||[]).filter(q=>WON.includes(q.status)).map(q=>({
    id:q.id,type:'Drayage',customer:q.customer||'—',shiflRef:q.shiflRef||'—',
    lane:`${q.port||'—'} → ${q.zip||'—'}`,carrier:q.carrier||'—',
    date:q.date,status:q.status,
    carrierCost:getShipmentProfit(q,'drayage').cost,
    customerRate:getShipmentProfit(q,'drayage').revenue,
    profit:getShipmentProfit(q,'drayage').profit,
    margin:getShipmentProfit(q,'drayage').margin,
    addedToSheet:localStorage.getItem('pm_sheet_'+q.id)==='1'
  }));
  const fq=(window._fqHistory||[]).filter(q=>WON.includes(q.status)).map(q=>({
    id:q.id,type:q.fqMode||'Freight',customer:q.customer||'—',shiflRef:q.shiflRef||'—',
    lane:`${q.pickupZip||'—'} → ${q.deliveryZip||'—'}`,carrier:q.carrier||'—',
    date:q.date,status:q.status,
    carrierCost:getShipmentProfit(q,'freight').cost,
    customerRate:getShipmentProfit(q,'freight').revenue,
    profit:getShipmentProfit(q,'freight').profit,
    margin:getShipmentProfit(q,'freight').margin,
    addedToSheet:localStorage.getItem('pm_sheet_'+q.id)==='1'
  }));
  const tl=(window._tlHistory||[]).filter(q=>WON.includes(q.status)).map(q=>({
    id:q.id,type:'Transload',customer:q.customer||'—',shiflRef:q.shiflRef||'—',
    lane:`${q.drayPort||'—'} → ${q.outDeliveryZip||'—'}`,carrier:q.outCarrier||'—',
    date:q.date,status:q.status,
    carrierCost:getShipmentProfit(q,'transload').cost,
    customerRate:getShipmentProfit(q,'transload').revenue,
    profit:getShipmentProfit(q,'transload').profit,
    margin:getShipmentProfit(q,'transload').margin,
    addedToSheet:localStorage.getItem('pm_sheet_'+q.id)==='1'
  }));
  let all=[...dray,...fq,...tl];
  const today=localDateStr();
  const week=new Date(Date.now()-7*864e5).toISOString().slice(0,10);
  const month=new Date(Date.now()-30*864e5).toISOString().slice(0,10);
  if(dateFilter==='week') all=all.filter(q=>q.date>=week);
  else if(dateFilter==='month') all=all.filter(q=>q.date>=month);
  else if(dateFilter==='today') all=all.filter(q=>q.date===today);
  if(filter!=='all') all=all.filter(q=>q.type.toLowerCase()===filter);
  all.sort((a,b)=>b.date.localeCompare(a.date));

  const headers=['Date','Ref #','Customer','Type','Lane','Carrier','Status','Carrier Pay','Customer Rate','Profit','Margin %','My Commission ('+commPct+'%)','Added to Spreadsheet'];
  const rows=all.map(q=>{
    const comm=(q.profit*(commPct/100)).toFixed(2);
    return[
      q.date,
      q.shiflRef||'—',
      q.customer,
      q.type,
      q.lane,
      q.carrier,
      q.status,
      q.carrierCost.toFixed(2),
      q.customerRate.toFixed(2),
      q.profit.toFixed(2),
      (q.margin*100).toFixed(1)+'%',
      comm,
      q.addedToSheet?'Yes':'No'
    ];
  });

  // Summary rows at bottom
  const totalCarrier=all.reduce((s,q)=>s+q.carrierCost,0);
  const totalCustomer=all.reduce((s,q)=>s+q.customerRate,0);
  const totalProfit=all.reduce((s,q)=>s+q.profit,0);
  const totalMargin=totalCustomer>0?totalProfit/totalCustomer:0;
  const totalComm=totalProfit*(commPct/100);
  rows.push(['','','','','','','TOTAL',totalCarrier.toFixed(2),totalCustomer.toFixed(2),totalProfit.toFixed(2),(totalMargin*100).toFixed(1)+'%',totalComm.toFixed(2),'']);

  const csv=[headers,...rows].map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob=new Blob([csv],{type:'text/csv'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url;
  const dateStr=new Date().toISOString().slice(0,10);
  a.download=`Shifl_ProfitMonitor_${dateStr}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('📥 CSV downloaded — '+all.length+' shipments','success',3000);
}


// ════════════════════════════════════════════════════════════════════
// SMART PROFIT CALCULATION
// Before invoiced = estimated (base + 1d chassis / base only / TL base+chassis+WH)
// After invoiced = actual from customer invoice vs carrier invoice
// ════════════════════════════════════════════════════════════════════

function getShipmentProfit(q, type) {
  const custInv = getInvoice(q.id);
  const carrInv = getCarrierInvoice(q.id);

  // Both invoices → full actuals
  if(custInv?.grandTotal && carrInv?.grandTotal) {
    const revenue = custInv.grandTotal;
    const cost = carrInv.grandTotal;
    const profit = revenue - cost;
    return {profit, revenue, cost, margin: revenue>0?profit/revenue:0, isActual:true};
  }

  // Customer invoice only → actual revenue + estimated cost
  if(custInv?.grandTotal) {
    const revenue = custInv.grandTotal;
    const cost = type==='drayage'?(q.carrierRates?.total||0):
                 type==='freight'?(q.carrierRate||0):
                 ((q.drayCarrierCost||0)+(q.warehouseCost||0)+(q.outCarrierCost||0));
    const profit = revenue - cost;
    return {profit, revenue, cost, margin: revenue>0?profit/revenue:0, isActual:'partial'};
  }

  // Estimated from quoted rates
  if(type==='drayage') {
    const cr = q.carrierRates||{};
    const cu = q.customerRates||{};
    if(cu.total && cr.total) {
      const revenue = cu.total, cost = cr.total, profit = revenue - cost;
      return {profit, revenue, cost, margin: revenue>0?profit/revenue:0, isActual:false};
    }
    const KEYS = ['base','chassis','prepull','det_port','det_cust','storage','ovw43','ovw48','bobtail','toll','genset','triaxle'];
    const revenue = KEYS.reduce((s,k)=>s+(Number(cu[k])||0), 0);
    const cost    = KEYS.reduce((s,k)=>s+(Number(cr[k])||0), 0);
    const profit  = revenue - cost;
    return {profit, revenue, cost, margin: revenue>0?profit/revenue:0, isActual:false};
  }

  if(type==='freight') {
    const revenue = q.customerRate||0;
    const cost = q.carrierRate||0;
    const profit = revenue - cost;
    return {profit, revenue, cost, margin: revenue>0?profit/revenue:0, isActual:false};
  }

  if(type==='transload') {
    const revenue = q.totalCustomer||0;
    const cost = (q.drayCarrierCost||0)+(q.warehouseCost||0)+(q.outCarrierCost||0);
    const profit = revenue - cost;
    return {profit, revenue, cost, margin: revenue>0?profit/revenue:0, isActual:false};
  }

  if(type==='air') {
    const revenue = q.customerRate||0;
    const cost = (q.airFreightCost||0)+(q.groundRate||0);
    const profit = revenue - cost;
    return {profit, revenue, cost, margin: revenue>0?profit/revenue:0, isActual:false};
  }

  return {profit:q.profit||0, revenue:q.customerRate||0, cost:0, margin:q.profitPct||0, isActual:false};
}

function profitBadge(isActual) {
  return isActual
    ? `<span style="font-size:9px;background:var(--green-bg,#dcfce7);color:#16a34a;padding:1px 6px;border-radius:99px;font-weight:700;white-space:nowrap">actual</span>`
    : `<span style="font-size:9px;background:#fffbeb;color:#d97706;padding:1px 6px;border-radius:99px;font-weight:700;white-space:nowrap">est.</span>`;
}



function buildPillBar(filterKey, searchKey, counts, searchPlaceholder){
  const f=S[filterKey]||'all';
  const pills=[
    {s:'all',label:'All',color:'#1a2e4a',bg:'#1a2e4a'},
    {s:'Quoted',label:'Quoted',color:'#1a2e4a',bg:'#1a2e4a'},
    {s:'Booked',label:'Booked',color:'#16a34a',bg:'#16a34a'},
    {s:'Delivered',label:'Delivered',color:'#2e75b6',bg:'#2e75b6'},
    {s:'Invoiced',label:'Invoiced',color:'#7c3aed',bg:'#7c3aed'},
    {s:'Lost',label:'Lost',color:'#dc2626',bg:'#dc2626'},
    {s:'Cancelled',label:'Cancelled',color:'#6b7280',bg:'#6b7280'},
    {s:'Expired',label:'Expired',color:'#d97706',bg:'#d97706'},
  ].filter(p=>p.s==='all'||(counts[p.s]||0)>0||(f===p.s));
  return `<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:14px">
    <div style="display:flex;align-items:center;gap:5px;flex-wrap:wrap;flex:1">
      ${pills.map(p=>`<button onclick="S.${filterKey}='${p.s}';S.${searchKey}=S.${searchKey}||'';render()"
        style="padding:5px 13px;border-radius:99px;border:1.5px solid;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;transition:all .12s;${f===p.s?`background:${p.bg};color:#fff;border-color:${p.bg};`:`color:${p.color};border-color:${p.color};background:transparent;`}">
        ${p.label} <span style="font-size:10px;opacity:${f===p.s?'1':'.7'}">${counts[p.s]||0}</span>
      </button>`).join('')}
    </div>
    <div style="position:relative;min-width:200px">
      <span style="position:absolute;left:10px;top:50%;transform:translateY(-50%);font-size:13px;pointer-events:none">🔍</span>
      <input type="text" placeholder="${searchPlaceholder}" value="${S[searchKey]||''}"
        oninput="S['${searchKey}']=this.value;renderSearchResults('${searchKey}')"
        style="padding:7px 12px 7px 32px;border-radius:99px;border:1.5px solid var(--gray-200);font-size:12px;width:100%;box-sizing:border-box">
    </div>
  </div>`;
}
// ════════════════════════════════════════════════════════════════════
// TEAM CHAT — Supabase real-time
// ════════════════════════════════════════════════════════════════════
let _chatOpen=false,_chatChannel='general',_chatSub=null,_chatMsgs=[];

function buildChatPanel(){
  if($('chat-panel')) return;
  const panel=document.createElement('div');
  panel.id='chat-panel';
  panel.style.cssText='position:fixed;top:0;right:0;width:340px;height:100vh;background:var(--white);border-left:1px solid var(--gray-200);z-index:8888;display:flex;flex-direction:column;transform:translateX(100%);transition:transform .25s ease;box-shadow:-4px 0 24px rgba(0,0,0,.12)';
  panel.innerHTML=`
    <div style="background:var(--navy);padding:14px 16px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0">
      <div>
        <div style="color:#fff;font-size:14px;font-weight:800">💬 Team Chat</div>
        <div id="chat-status" style="font-size:10px;color:rgba(255,255,255,.5);margin-top:2px">Connecting…</div>
      </div>
      <button onclick="toggleChat()" style="background:none;border:none;color:rgba(255,255,255,.7);font-size:20px;cursor:pointer;line-height:1">×</button>
    </div>
    <!-- Channel tabs -->
    <div style="display:flex;border-bottom:1px solid var(--gray-100);flex-shrink:0">
      <button id="ch-btn-general" onclick="switchChannel('general')" style="flex:1;padding:8px;font-size:12px;font-weight:700;border:none;cursor:pointer;font-family:inherit;background:var(--blue-bg);color:var(--steel);border-bottom:2px solid var(--steel)">
        # general
      </button>
      <button id="ch-btn-ops" onclick="switchChannel('ops')" style="flex:1;padding:8px;font-size:12px;font-weight:600;border:none;cursor:pointer;font-family:inherit;background:transparent;color:var(--gray-500);border-bottom:2px solid transparent">
        # ops
      </button>
      <button id="ch-btn-rates" onclick="switchChannel('rates')" style="flex:1;padding:8px;font-size:12px;font-weight:600;border:none;cursor:pointer;font-family:inherit;background:transparent;color:var(--gray-500);border-bottom:2px solid transparent">
        # rates
      </button>
    </div>
    <!-- Messages -->
    <div id="chat-messages" style="flex:1;overflow-y:auto;padding:14px 16px;display:flex;flex-direction:column;gap:10px"></div>
    <!-- Input -->
    <div style="padding:12px 14px;border-top:1px solid var(--gray-100);flex-shrink:0;display:flex;gap:8px">
      <input type="text" id="chat-input" placeholder="Message #${_chatChannel}…"
        style="flex:1;padding:8px 12px;border:1.5px solid var(--gray-200);border-radius:20px;font-size:13px;outline:none"
        onfocus="this.style.borderColor='var(--steel)'" onblur="this.style.borderColor='var(--gray-200)'"
        onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();sendChatMessage();}">
      <button onclick="sendChatMessage()" style="width:36px;height:36px;border-radius:50%;background:var(--steel);border:none;cursor:pointer;font-size:16px;color:#fff;flex-shrink:0">↑</button>
    </div>`;
  document.body.appendChild(panel);
}

function toggleChat(){
  buildChatPanel();
  _chatOpen=!_chatOpen;
  const panel=$('chat-panel');
  panel.style.transform=_chatOpen?'translateX(0)':'translateX(100%)';
  const btn=$('chat-nav-btn');
  if(btn){btn.style.background=_chatOpen?'rgba(255,255,255,.12)':'rgba(255,255,255,.07)';btn.style.borderLeft=_chatOpen?'3px solid #2e75b6':'3px solid transparent';}
  if(_chatOpen){loadChatMessages();subscribeToChat();}
  else if(_chatSub){_chatSub.unsubscribe();_chatSub=null;}
}

function switchChannel(ch){
  _chatChannel=ch;
  const p=$('chat-input');if(p) p.placeholder='Message #'+ch+'…';
  ['general','ops','rates'].forEach(c=>{
    const btn=$('ch-btn-'+c);if(!btn) return;
    const active=c===ch;
    btn.style.background=active?'var(--blue-bg)':'transparent';
    btn.style.color=active?'var(--steel)':'var(--gray-500)';
    btn.style.borderBottom=active?'2px solid var(--steel)':'2px solid transparent';
    btn.style.fontWeight=active?'700':'600';
  });
  _chatMsgs=[];
  loadChatMessages();
  if(_chatSub){_chatSub.unsubscribe();_chatSub=null;}
  subscribeToChat();
}

function getChatLocal(channel){try{return JSON.parse(localStorage.getItem('chat_local_'+channel)||'[]');}catch(e){return[];}}
function saveChatLocal(channel,msgs){try{localStorage.setItem('chat_local_'+channel,JSON.stringify(msgs.slice(-200)));}catch(e){}}

async function loadChatMessages(){
  const el=$('chat-messages');if(!el) return;
  el.innerHTML='<div style="text-align:center;color:var(--gray-400);font-size:12px;padding:20px">Loading…</div>';
  // Always load local first for instant display
  const local=getChatLocal(_chatChannel);
  if(local.length){_chatMsgs=local;renderChatMessages();}
  try{
    const{data,error}=await withTimeout(db.from('chat_messages').select('*').eq('channel',_chatChannel).order('created_at',{ascending:true}).limit(100),5000,null);
    if(error||!data) throw new Error(error?.message||'no data');
    _chatMsgs=data;
    saveChatLocal(_chatChannel,data);
    renderChatMessages();
    const status=$('chat-status');if(status) status.textContent='🟢 Connected';
  }catch(e){
    // Fall back to localStorage — chat still works offline/without DB table
    _chatMsgs=getChatLocal(_chatChannel);
    renderChatMessages();
    const s=$('chat-status');if(s) s.textContent='💾 Local mode';
  }
}

function subscribeToChat(){
  if(_chatSub) try{_chatSub.unsubscribe();}catch(e){}
  // Try real-time first, fall back to polling
  try{
    _chatSub=db.channel('public:chat_messages:'+_chatChannel)
      .on('postgres_changes',{event:'INSERT',schema:'public',table:'chat_messages',filter:`channel=eq.${_chatChannel}`},payload=>{
        if(payload.new&&!_chatMsgs.find(m=>m.id===payload.new.id)){_chatMsgs.push(payload.new);renderChatMessages();}
      }).subscribe(status=>{
        if(status==='CHANNEL_ERROR'||status==='CLOSED') startChatPolling();
      });
  }catch(e){startChatPolling();}
}
let _chatPollInterval=null;
function startChatPolling(){
  if(_chatPollInterval) clearInterval(_chatPollInterval);
  _chatPollInterval=setInterval(async()=>{if(_chatOpen) await loadChatMessages();},5000);
}
function stopChatPolling(){if(_chatPollInterval){clearInterval(_chatPollInterval);_chatPollInterval=null;}}

function renderChatMessages(){
  const el=$('chat-messages');if(!el) return;
  if(!_chatMsgs.length){el.innerHTML='<div style="text-align:center;color:var(--gray-400);font-size:13px;padding:40px 20px"><div style="font-size:32px;margin-bottom:10px">💬</div><div style="font-weight:700;margin-bottom:4px">No messages yet</div><div style="font-size:11px">Be the first to say something in #'+_chatChannel+'</div></div>';return;}
  let prev='';
  el.innerHTML=_chatMsgs.map(m=>{
    const d=new Date(m.created_at);
    const time=d.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit',timeZone:'America/New_York'});
    const dateStr=d.toLocaleDateString('en-US',{month:'short',day:'numeric',timeZone:'America/New_York'});
    const isMe=m.user_id===_currentUser?.id;
    const showDate=dateStr!==prev;prev=dateStr;
    const initials=(m.user_name||'?').slice(0,2).toUpperCase();
    const colors=['#1a2e4a','#2e75b6','#16a34a','#7c3aed','#d97706','#dc2626'];
    const color=colors[m.user_name?.charCodeAt(0)%colors.length||0];
    return `${showDate?`<div style="text-align:center;font-size:10px;color:var(--gray-400);margin:8px 0;font-weight:600">${dateStr}</div>`:''}
    <div style="display:flex;gap:8px;align-items:flex-start;${isMe?'flex-direction:row-reverse':''}">
      <div style="width:28px;height:28px;border-radius:50%;background:${color};color:#fff;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;flex-shrink:0">${initials}</div>
      <div style="max-width:75%">
        <div style="display:flex;align-items:baseline;gap:6px;${isMe?'flex-direction:row-reverse':''}">
          <span style="font-size:11px;font-weight:700;color:${color}">${isMe?'You':m.user_name}</span>
          <span style="font-size:10px;color:var(--gray-400)">${time}</span>
        </div>
        <div style="margin-top:3px;padding:8px 12px;border-radius:${isMe?'16px 4px 16px 16px':'4px 16px 16px 16px'};background:${isMe?'var(--steel)':'var(--gray-50)'};color:${isMe?'#fff':'var(--gray-700)'};font-size:13px;line-height:1.45;word-break:break-word">${m.message}</div>
      </div>
    </div>`;}).join('');
  el.scrollTop=el.scrollHeight;
  // Clear unread badge
  const badge=$('chat-badge');if(badge) badge.style.display='none';
}

async function sendChatMessage(){
  const input=$('chat-input');if(!input) return;
  const msg=input.value.trim();if(!msg) return;
  input.value='';
  const userName=_currentUser?.name||_currentUser?.email?.split('@')[0]||localStorage.getItem('shifl_user')||'You';
  const localMsg={
    id:'local-'+Date.now()+'-'+Math.random().toString(36).slice(2),
    user_id:_currentUser?.id||'local',
    user_name:userName,
    user_role:_currentUser?.role||'team_member',
    channel:_chatChannel,
    message:msg,
    created_at:new Date().toISOString()
  };
  // Optimistically add to local storage and render immediately
  _chatMsgs.push(localMsg);
  saveChatLocal(_chatChannel,_chatMsgs);
  renderChatMessages();
  // Try to also persist to Supabase (non-blocking)
  try{
    await withTimeout(db.from('chat_messages').insert({
      user_id:_currentUser?.id||null,
      user_name:userName,
      user_role:_currentUser?.role||'team_member',
      channel:_chatChannel,
      message:msg
    }),4000,null);
  }catch(e){/* local message already shown, Supabase is optional */}
}


// ════════════════════════════════════════════════════════════════════
// SHIFL ACHIEVEMENTS — US STATE TILE MAP
// ════════════════════════════════════════════════════════════════════

// ZIP prefix → state lookup
function zipToState(zip){
  const z=parseInt((zip||'').toString().padStart(5,'0').slice(0,3));
  if(z>=0&&z<=9) return 'PR';
  if(z>=10&&z<=49) return 'NY';
  if(z>=50&&z<=89) return 'NY';
  if(z>=100&&z<=149) return 'NY';
  if(z>=150&&z<=196) return 'PA';
  if(z>=197&&z<=199) return 'DE';
  if(z>=200&&z<=205) return 'DC';
  if(z>=206&&z<=212) return 'MD';
  if(z>=214&&z<=219) return 'MD';
  if(z>=220&&z<=246) return 'VA';
  if(z>=247&&z<=268) return 'WV';
  if(z>=270&&z<=289) return 'NC';
  if(z>=290&&z<=299) return 'SC';
  if(z>=300&&z<=319) return 'GA';
  if(z>=320&&z<=349) return 'FL';
  if(z>=350&&z<=369) return 'AL';
  if(z>=370&&z<=385) return 'TN';
  if(z>=386&&z<=397) return 'MS';
  if(z>=398&&z<=399) return 'GA';
  if(z>=400&&z<=427) return 'KY';
  if(z>=428&&z<=459) return 'OH';
  if(z>=460&&z<=479) return 'IN';
  if(z>=480&&z<=499) return 'MI';
  if(z>=500&&z<=528) return 'IA';
  if(z>=530&&z<=549) return 'WI';
  if(z>=550&&z<=567) return 'MN';
  if(z>=570&&z<=577) return 'SD';
  if(z>=580&&z<=588) return 'ND';
  if(z>=590&&z<=599) return 'MT';
  if(z>=600&&z<=629) return 'IL';
  if(z>=630&&z<=658) return 'MO';
  if(z>=660&&z<=679) return 'KS';
  if(z>=680&&z<=693) return 'NE';
  if(z>=700&&z<=714) return 'LA';
  if(z>=716&&z<=729) return 'AR';
  if(z>=730&&z<=749) return 'OK';
  if(z>=750&&z<=799) return 'TX';
  if(z>=800&&z<=816) return 'CO';
  if(z>=820&&z<=831) return 'WY';
  if(z>=832&&z<=838) return 'ID';
  if(z>=840&&z<=847) return 'UT';
  if(z>=850&&z<=865) return 'AZ';
  if(z>=870&&z<=884) return 'NM';
  if(z>=885&&z<=885) return 'TX';
  if(z>=889&&z<=898) return 'NV';
  if(z>=900&&z<=961) return 'CA';
  if(z>=970&&z<=979) return 'OR';
  if(z>=980&&z<=994) return 'WA';
  if(z>=995&&z<=999) return 'AK';
  if(z>=967&&z<=968) return 'HI';
  return null;
}

// US Tile Grid [col, row]
const STATE_TILES={
  ME:[11,0],NH:[11,1],VT:[10,1],MA:[11,2],RI:[11,3],CT:[10,3],
  NY:[9,2],PA:[8,2],NJ:[10,2],DE:[10,4],MD:[9,3],DC:[10,3],
  WA:[0,2],OR:[0,3],CA:[0,4],
  MT:[2,1],ID:[1,3],NV:[1,4],AZ:[2,5],
  WY:[3,2],UT:[2,4],CO:[3,4],NM:[3,5],
  ND:[4,1],SD:[4,2],NE:[4,3],KS:[4,4],OK:[4,5],TX:[4,6],
  MN:[5,1],IA:[5,2],MO:[5,3],AR:[5,4],LA:[5,5],
  WI:[6,1],IL:[6,2],TN:[6,3],MS:[6,4],AL:[7,4],
  MI:[7,1],IN:[7,2],KY:[7,3],
  OH:[8,1],WV:[8,3],VA:[9,3],NC:[9,4],SC:[10,4],GA:[9,5],FL:[9,6],
  AK:[0,7],HI:[1,7]
};

function getStateLoadCounts(){
  const counts={};
  const addZip=(zip,statField)=>{
    if(!zip) return;
    const st=zipToState(zip);
    if(!st) return;
    if(!counts[st]) counts[st]={picked:0,delivered:0,total:0};
    if(statField==='picked') counts[st].picked++;
    else if(statField==='delivered') counts[st].delivered++;
    counts[st].total=Math.max(counts[st].picked,counts[st].delivered);
  };
  // Drayage
  (S.quotes||[]).filter(q=>['Booked','Delivered','Invoiced','Paid'].includes(q.status)).forEach(q=>{
    addZip(q.port?.match(/\d{5}/)?.[0]||'','picked');
    addZip(q.zip,'delivered');
  });
  // Freight
  (window._fqHistory||[]).filter(q=>['Booked','Delivered','Invoiced','Paid'].includes(q.status)).forEach(q=>{
    addZip(q.pickupZip,'picked');
    addZip(q.deliveryZip,'delivered');
  });
  // Transload
  (window._tlHistory||[]).filter(q=>['Booked','Delivered','Invoiced','Paid'].includes(q.status)).forEach(q=>{
    addZip(q.outDeliveryZip,'delivered');
  });
  return counts;
}

function renderShiflAchievements(){
  const counts=getStateLoadCounts();
  const activeStates=Object.keys(counts).length;
  const totalLoads=Object.values(counts).reduce((s,c)=>s+c.total,0);
  $('topbar-right').innerHTML='';

  const CELL=52;const GAP=3;
  const maxCol=Math.max(...Object.values(STATE_TILES).map(([c])=>c))+1;
  const maxRow=Math.max(...Object.values(STATE_TILES).map(([,r])=>r))+1;
  const W=maxCol*(CELL+GAP);const H=maxRow*(CELL+GAP);

  const cells=Object.entries(STATE_TILES).map(([st,[col,row]])=>{
    const c=counts[st];
    const hasLoad=!!c;
    const x=col*(CELL+GAP);const y=row*(CELL+GAP);
    const intensity=hasLoad?Math.min(1,0.4+c.total*0.1):0;
    const bg=hasLoad?`rgba(220,38,38,${intensity})`:'#f1f5f9';
    const textColor=hasLoad?'#fff':'#94a3b8';
    return `<g transform="translate(${x},${y})" style="cursor:${hasLoad?'pointer':'default'}">
      <rect width="${CELL}" height="${CELL}" rx="6" fill="${bg}" stroke="${hasLoad?'#b91c1c':'#e2e8f0'}" stroke-width="1"/>
      <text x="${CELL/2}" y="${CELL/2-4}" text-anchor="middle" dominant-baseline="middle" font-size="12" font-weight="800" fill="${textColor}" font-family="inherit">${st}</text>
      ${hasLoad?`<text x="${CELL/2}" y="${CELL/2+9}" text-anchor="middle" dominant-baseline="middle" font-size="9" fill="rgba(255,255,255,.8)" font-family="inherit">${c.total}</text>`:''}
      ${hasLoad?`<title>${st}: ${c.picked||0} picked · ${c.delivered||0} delivered · ${c.total} total loads</title>`:''}
    </g>`;
  }).join('');

  $('page').innerHTML=`
  <!-- Header stats -->
  <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:24px">
    <div class="kpi"><div class="kpi-lbl">States covered</div><div class="kpi-val" style="color:var(--red)">${activeStates} / 50</div></div>
    <div class="kpi"><div class="kpi-lbl">Total loads moved</div><div class="kpi-val" style="color:var(--steel)">${totalLoads}</div></div>
    <div class="kpi"><div class="kpi-lbl">Coverage</div><div class="kpi-val">${Math.round(activeStates/50*100)}%</div><div style="margin-top:6px;height:6px;background:var(--gray-100);border-radius:3px"><div style="height:6px;width:${Math.round(activeStates/50*100)}%;background:var(--red);border-radius:3px;transition:width .8s"></div></div></div>
    <div class="kpi"><div class="kpi-lbl">Next goal</div><div class="kpi-val">${activeStates<10?'10':activeStates<25?'25':activeStates<50?'50':'All 50!'} states</div></div>
  </div>

  <!-- Map -->
  <div class="card" style="padding:24px">
    <div style="font-size:16px;font-weight:800;color:var(--navy);margin-bottom:4px">🗺️ Shifl Load Coverage Map</div>
    <div style="font-size:13px;color:var(--gray-500);margin-bottom:20px">States turn red when you move a load there. Hover for details.</div>
    <div style="overflow-x:auto">
      <svg viewBox="0 0 ${W} ${H}" style="width:100%;max-width:${W}px;height:auto;display:block">
        ${cells}
      </svg>
    </div>
    <div style="display:flex;align-items:center;gap:16px;margin-top:16px;font-size:12px;color:var(--gray-500)">
      <div style="display:flex;align-items:center;gap:6px"><div style="width:16px;height:16px;border-radius:3px;background:#f1f5f9;border:1px solid #e2e8f0"></div> No loads yet</div>
      <div style="display:flex;align-items:center;gap:6px"><div style="width:16px;height:16px;border-radius:3px;background:rgba(220,38,38,.5)"></div> Active</div>
      <div style="display:flex;align-items:center;gap:6px"><div style="width:16px;height:16px;border-radius:3px;background:rgba(220,38,38,.9)"></div> High volume</div>
    </div>
  </div>

  <!-- State breakdown table -->
  ${activeStates>0?`
  <div class="card" style="margin-top:16px;padding:0;overflow:hidden">
    <div style="padding:14px 20px;border-bottom:1px solid var(--gray-100);font-size:14px;font-weight:700;color:var(--navy)">State breakdown</div>
    <div class="tbl-wrap"><table>
      <thead><tr><th>State</th><th>Picked up</th><th>Delivered</th><th>Total loads</th></tr></thead>
      <tbody>${Object.entries(counts).sort((a,b)=>b[1].total-a[1].total).map(([st,c])=>`
        <tr><td><strong style="color:var(--red)">${st}</strong></td><td>${c.picked||0}</td><td>${c.delivered||0}</td><td><strong>${c.total}</strong></td></tr>`).join('')}
      </tbody>
    </table></div>
  </div>`:''}`;
}


// ════════════════════════════════════════════════════════════════════
// SCREENSHOT MODE
// ════════════════════════════════════════════════════════════════════
let _screenshotMode=false;
function toggleScreenshotMode(){
  _screenshotMode=!_screenshotMode;
  document.body.classList.toggle('screenshot-mode',_screenshotMode);
  // Show clear banner when ON so user knows why numbers are hidden
  let banner=document.getElementById('screenshot-banner');
  if(_screenshotMode){
    if(!banner){
      banner=document.createElement('div');
      banner.id='screenshot-banner';
      banner.style.cssText='position:fixed;bottom:16px;left:50%;transform:translateX(-50%);background:#1e3a5f;color:#fff;padding:8px 20px;border-radius:99px;font-size:12px;font-weight:700;z-index:99999;display:flex;align-items:center;gap:8px;box-shadow:0 4px 16px rgba(0,0,0,.3)';
      banner.innerHTML='📷 Screenshot mode ON — numbers hidden &nbsp;<button onclick="toggleScreenshotMode()" style="background:rgba(255,255,255,.2);border:none;color:#fff;border-radius:99px;padding:3px 10px;cursor:pointer;font-size:11px;font-weight:700;font-family:inherit">Turn off</button>';
      document.body.appendChild(banner);
    }
    showToast('📷 Screenshot mode ON — numbers hidden','info',2000);
  } else {
    if(banner) banner.remove();
    showToast('📷 Screenshot mode OFF — numbers visible','success',2000);
  }
}

// ════════════════════════════════════════════════════════════════════
// WELCOME BACK MESSAGE (time-of-day)
// ════════════════════════════════════════════════════════════════════
function getGreeting(){
  const h=new Date().toLocaleString('en-US',{timeZone:'America/New_York',hour:'numeric',hour12:false});
  const hour=parseInt(h);
  if(hour>=5&&hour<12) return '☀️ Good morning';
  if(hour>=12&&hour<17) return '🌤 Good afternoon';
  if(hour>=17&&hour<21) return '🌆 Good evening';
  return '🌙 Working late';
}

// ════════════════════════════════════════════════════════════════════
// ACHIEVEMENT BADGES
// ════════════════════════════════════════════════════════════════════
const ACHIEVEMENTS=[
  {id:'first_quote',  icon:'📋',title:'First quote',   desc:'Created your first quote',      check:()=>(S.quotes?.length||0)+(window._fqHistory?.length||0)>=1},
  {id:'first_booking',icon:'🎉',title:'First booking', desc:'Booked your first load',         check:()=>S.quotes?.some(q=>['Booked','Delivered','Invoiced','Paid'].includes(q.status))},
  {id:'ten_loads',    icon:'🚛',title:'10 loads',      desc:'Moved 10 loads',                 check:()=>((S.quotes||[]).filter(q=>['Delivered','Invoiced','Paid'].includes(q.status)).length+(window._fqHistory||[]).filter(q=>['Delivered','Invoiced','Paid'].includes(q.status)).length)>=10},
  {id:'five_states',  icon:'🗺️',title:'Coast to coast',desc:'Covered 5+ states',              check:()=>Object.keys(getStateLoadCounts()).length>=5},
  {id:'first_invoice',icon:'🧾',title:'Cash flow',     desc:'Sent your first invoice',        check:()=>Object.keys(S.invoices||{}).length>=1},
  {id:'perfect_margin',icon:'💰',title:'Big margin',   desc:'Quoted a load over 30% margin',  check:()=>(S.quotes||[]).some(q=>(q.profitPct||0)>=0.30)},
  {id:'multi_mode',   icon:'✈️',title:'Multi-modal',   desc:'Quoted all 4 modes',             check:()=>{const has=new Set([...(S.quotes||[]).map(()=>'drayage'),...(window._fqHistory||[]).map(q=>q.fqMode),...(window._tlHistory||[]).map(()=>'transload'),...(window._aqHistory||[]).map(()=>'air')]);return has.size>=4;}},
  {id:'fifty_quotes', icon:'📈',title:'Quote machine',  desc:'Created 50+ quotes',             check:()=>(S.quotes?.length||0)>=50},
  {id:'all_states',   icon:'🇺🇸',title:'All 50 states', desc:'Moved loads in all 50 states',  check:()=>Object.keys(getStateLoadCounts()).length>=50},
];

function checkAchievements(){
  const unlocked=JSON.parse(localStorage.getItem('shifl_achievements')||'[]');
  const newOnes=ACHIEVEMENTS.filter(a=>!unlocked.includes(a.id)&&a.check());
  if(newOnes.length){
    newOnes.forEach(a=>{
      unlocked.push(a.id);
      setTimeout(()=>{
        const el=document.createElement('div');
        el.style.cssText='position:fixed;top:70px;right:24px;z-index:99999;background:linear-gradient(135deg,#1a2e4a,#2e75b6);color:#fff;border-radius:12px;padding:16px 20px;box-shadow:0 8px 32px rgba(0,0,0,.25);display:flex;align-items:center;gap:12px;animation:fadeInPreview .3s ease;max-width:300px';
        el.innerHTML=`<div style="font-size:32px">${a.icon}</div><div><div style="font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;opacity:.7">Achievement unlocked!</div><div style="font-size:15px;font-weight:800;margin-top:2px">${a.title}</div><div style="font-size:12px;opacity:.8;margin-top:2px">${a.desc}</div></div>`;
        document.body.appendChild(el);
        setTimeout(()=>el.remove(),4000);
      },500);
    });
    localStorage.setItem('shifl_achievements',JSON.stringify(unlocked));
  }
  return unlocked;
}

function renderAchievementsPage(){
  const unlocked=checkAchievements();
  $('topbar-right').innerHTML='';
  $('page').innerHTML=`
    <div style="margin-bottom:20px">
      <div style="font-size:18px;font-weight:800;color:var(--navy)">🏆 Shifl Achievements</div>
      <div style="font-size:13px;color:var(--gray-500);margin-top:4px">${unlocked.length} of ${ACHIEVEMENTS.length} unlocked</div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:14px">
      ${ACHIEVEMENTS.map(a=>{
        const done=unlocked.includes(a.id);
        return`<div class="card" style="text-align:center;padding:24px;${done?'border-color:#86efac;background:#f0fdf4':'opacity:.55'}">
          <div style="font-size:40px;margin-bottom:10px">${done?a.icon:'🔒'}</div>
          <div style="font-size:15px;font-weight:800;color:${done?'var(--navy)':'var(--gray-400)'}">${a.title}</div>
          <div style="font-size:12px;color:${done?'var(--gray-500)':'var(--gray-300)'};margin-top:6px">${a.desc}</div>
          ${done?'<div style="margin-top:10px;font-size:11px;font-weight:700;color:#16a34a">✓ Unlocked</div>':''}
        </div>`;}).join('')}
    </div>`;
}

// ════════════════════════════════════════════════════════════════════
// HEATMAP CALENDAR
// ════════════════════════════════════════════════════════════════════
function renderHeatmapCalendar(containerId){
  const el=$(containerId);if(!el) return;
  const allQ=[...(S.quotes||[]),...(window._fqHistory||[]),...(window._tlHistory||[])];
  const byDate={};
  allQ.forEach(q=>{if(q.date) byDate[q.date]=(byDate[q.date]||0)+1;});
  const today=new Date();
  const weeks=[];
  let d=new Date(today);
  d.setDate(d.getDate()-363); // ~52 weeks back
  d.setDate(d.getDate()-d.getDay()); // start on Sunday
  while(d<=today){
    const week=[];
    for(let i=0;i<7;i++){
      const ds=d.toISOString().slice(0,10);
      week.push({date:ds,count:byDate[ds]||0,future:d>today});
      d.setDate(d.getDate()+1);
    }
    weeks.push(week);
  }
  const max=Math.max(1,...Object.values(byDate));
  const cellSize=14;const gap=2;
  const W=weeks.length*(cellSize+gap);const H=7*(cellSize+gap);
  el.innerHTML=`<svg width="${W}" height="${H}" style="display:block">
    ${weeks.map((week,wi)=>week.map((day,di)=>{
      if(day.future) return '';
      const x=wi*(cellSize+gap);const y=di*(cellSize+gap);
      const intensity=day.count>0?Math.min(1,0.3+day.count/max*0.7):0;
      const fill=day.count>0?`rgba(26,46,74,${intensity})`:'#f1f5f9';
      return`<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" rx="2" fill="${fill}"><title>${day.date}: ${day.count} quote${day.count!==1?'s':''}</title></rect>`;
    }).join('')).join('')}
  </svg>`;
}

// ════════════════════════════════════════════════════════════════════
// UNDO TOAST (wrap delete functions)
// ════════════════════════════════════════════════════════════════════
let _undoQueue=[];
function withUndo(label, undoFn, commitFn){
  let committed=false;
  const container=$('toast-container')||document.createElement('div');
  if(!$('toast-container')){container.id='toast-container';container.style.cssText='position:fixed;bottom:24px;right:24px;z-index:99999;display:flex;flex-direction:column;gap:8px;pointer-events:none';document.body.appendChild(container);}
  const toast=document.createElement('div');
  toast.style.cssText='background:#1a2e4a;color:#fff;padding:12px 18px;border-radius:10px;font-size:13px;font-weight:600;font-family:inherit;box-shadow:0 4px 16px rgba(0,0,0,.25);display:flex;align-items:center;gap:12px;pointer-events:all';
  toast.innerHTML=`<span>${label}</span><button onclick="this.closest('div').remove();committed=false;undoFn&&undoFn();" style="background:rgba(255,255,255,.2);border:none;color:#fff;padding:4px 10px;border-radius:6px;cursor:pointer;font-size:12px;font-weight:700;font-family:inherit">Undo</button>`;
  toast.querySelector('button').onclick=()=>{toast.remove();if(!committed&&undoFn) undoFn();committed=true;};
  container.appendChild(toast);
  setTimeout(()=>{if(!committed){committed=true;if(commitFn) commitFn();}toast.remove();},5000);
}

// ════════════════════════════════════════════════════════════════════
// AUTO-SAVE INDICATOR
// ════════════════════════════════════════════════════════════════════
function showSavingIndicator(text='Saving…'){
  let ind=$('auto-save-ind');
  if(!ind){ind=document.createElement('div');ind.id='auto-save-ind';ind.style.cssText='position:fixed;bottom:16px;left:50%;transform:translateX(-50%);background:var(--navy);color:#fff;padding:6px 16px;border-radius:99px;font-size:12px;font-weight:600;z-index:99998;transition:opacity .3s';document.body.appendChild(ind);}
  ind.textContent=text;ind.style.opacity='1';
}
function showSavedIndicator(){
  showSavingIndicator('✓ Saved');
  setTimeout(()=>{const ind=$('auto-save-ind');if(ind) ind.style.opacity='0';},1500);
}

// ════════════════════════════════════════════════════════════════════
// CARRIER CHECK-IN
// ════════════════════════════════════════════════════════════════════
function showCarrierCheckIn(quoteId){
  const q=S.quotes.find(q=>q.id===quoteId);if(!q) return;
  const carrierEmail=S.rates.find(r=>r.carrier===q.carrier)?.email||'';
  $('modal-root').innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()">
  <div class="modal" style="max-width:500px">
    <div class="modal-title">📱 Carrier check-in — ${q.carrier||'—'}</div>
    <div style="background:var(--blue-bg);border-radius:var(--radius);padding:10px 14px;margin-bottom:14px;font-size:13px;color:var(--steel)">
      ${q.customer||'—'} · ${q.port||'—'} → ${q.zip||'—'} · ${q.date||'—'}
    </div>
    <div class="field"><label>Carrier email</label><input type="email" id="checkin-email" value="${carrierEmail}" placeholder="carrier@example.com"></div>
    <div class="field"><label>Message</label>
      <textarea id="checkin-msg" rows="4" style="width:100%;box-sizing:border-box;resize:vertical">Hi ${q.carrier||'team'},\n\nThis is a friendly check-in for the upcoming pickup:\n• Customer: ${q.customer||'—'}\n• Lane: ${q.port||'—'} → ${q.zip||'—'}\n• Move: ${q.ld||'—'}\n\nPlease confirm you are available and ready. Reply with any questions.\n\nThank you,\nShifl Logistics</textarea>
    </div>
    <div class="modal-foot">
      <button class="btn" onclick="closeModal()">Cancel</button>
      <button class="btn blue" onclick="sendCarrierCheckIn('${quoteId}')">📧 Send check-in</button>
    </div>
  </div></div>`;
}

async function sendCarrierCheckIn(quoteId){
  const email=($('checkin-email')||{}).value?.trim();
  const msg=($('checkin-msg')||{}).value?.trim();
  if(!email){alert('Enter carrier email.');return;}
  const resendKey=localStorage.getItem('shifl_resend_key')||'';
  if(!resendKey){alert('Set your Resend API key in Admin Panel → Email Settings first.');return;}
  try{
    const r=await fetch('https://api.resend.com/emails',{method:'POST',headers:{'Authorization':'Bearer '+resendKey,'Content-Type':'application/json'},
      body:JSON.stringify({from:'Shifl Logistics <onboarding@resend.dev>',to:[email],reply_to:_currentUser?.email||'mk@shifl.com',subject:'Shifl Check-in — Upcoming Pickup',text:msg})});
    if(r.ok){closeModal();showToast('✅ Check-in sent to '+email,'success');}
    else{const d=await r.json();alert('Failed: '+JSON.stringify(d));}
  }catch(e){alert('Error: '+e.message);}
}


// flags replaced by shared_flags module below

// tracking/appts replaced by shared_flags module below

function showTrackingModal(type,id){
  const q=type==='drayage'?S.quotes.find(q=>q.id===id):null;
  const existing=getTrackingLink(id);
  $('modal-root').innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()">
  <div class="modal" style="max-width:460px">
    <div class="modal-title">📍 Load tracking — ${q?.customer||'Shipment'}</div>
    <div class="field"><label>Tracking URL</label>
      <input type="url" id="track-url" value="${existing}" placeholder="https://www.carrier-tracking.com/track/ABC123">
    </div>
    <div class="field"><label>Carrier booking / PRO #</label>
      <input type="text" id="track-ref" value="${q?.bookingNum||''}" placeholder="e.g. MAEU123456789">
    </div>
    ${existing?`<a href="${existing}" target="_blank" rel="noopener" style="display:inline-block;margin-top:6px;font-size:13px;color:var(--steel);font-weight:600">🔗 Open tracking link →</a>`:''}
    <div class="modal-foot">
      <button class="btn" onclick="closeModal()">Cancel</button>
      <button class="btn blue" onclick="saveTrackingLink('${id}',$('track-url').value);saveMeta('${id}',{booking_num:($('track-ref')||{}).value?.trim()||'',type:'${type}'});if(type==='drayage'){const q=S.quotes.find(q=>q.id==='${id}');if(q){q.bookingNum=$('track-ref').value;try{db.from('quotes').update({booking_num:$('track-ref').value}).eq('id','${id}');}catch(e){}}}closeModal()">Save</button>
    </div>
  </div></div>`;
}

// ════════════════════════════════════════════════════════════════════
// GAUGE CHART FOR WIN RATE
// ════════════════════════════════════════════════════════════════════
function buildGaugeChart(winRate,size=140){
  const r=(size/2)-10;const cx=size/2;const cy=size/2+10;
  const startAngle=-Math.PI;const endAngle=0;
  const angle=startAngle+(endAngle-startAngle)*Math.min(1,winRate);
  const toXY=(ang,rad)=>({x:cx+rad*Math.cos(ang),y:cy+rad*Math.sin(ang)});
  const bgStart=toXY(startAngle,r);const bgEnd=toXY(endAngle,r);
  const fgEnd=toXY(angle,r);
  const needle=toXY(angle,r*0.75);
  const color=winRate>=0.5?'#16a34a':winRate>=0.25?'#d97706':'#dc2626';
  return `<svg width="${size}" height="${size/2+20}" viewBox="0 0 ${size} ${size/2+20}" style="display:block;margin:0 auto">
    <path d="M${bgStart.x},${bgStart.y} A${r},${r} 0 0,1 ${bgEnd.x},${bgEnd.y}" fill="none" stroke="#e5e7eb" stroke-width="12" stroke-linecap="round"/>
    <path d="M${bgStart.x},${bgStart.y} A${r},${r} 0 ${winRate>0.5?1:0},1 ${fgEnd.x},${fgEnd.y}" fill="none" stroke="${color}" stroke-width="12" stroke-linecap="round" style="transition:all 1s ease"/>
    <line x1="${cx}" y1="${cy}" x2="${needle.x}" y2="${needle.y}" stroke="#1a2e4a" stroke-width="2.5" stroke-linecap="round"/>
    <circle cx="${cx}" cy="${cy}" r="5" fill="#1a2e4a"/>
    <text x="${cx}" y="${cy+18}" text-anchor="middle" font-size="16" font-weight="800" fill="${color}" font-family="inherit">${Math.round(winRate*100)}%</text>
  </svg>`;
}

// ════════════════════════════════════════════════════════════════════
// BAR CHART RACE — Customer revenue animated
// ════════════════════════════════════════════════════════════════════
function buildBarChartRace(containerId){
  const el=$(containerId);if(!el) return;
  const allQ=[...(S.quotes||[]).map(q=>({customer:q.customer,revenue:q.customerRates?.total||0})),
    ...(window._fqHistory||[]).map(q=>({customer:q.customer,revenue:q.customerRate||0})),
    ...(window._tlHistory||[]).map(q=>({customer:q.customer,revenue:q.totalCustomer||0}))];
  const byCustomer={};
  allQ.filter(q=>q.customer).forEach(q=>{byCustomer[q.customer]=(byCustomer[q.customer]||0)+q.revenue;});
  const entries=Object.entries(byCustomer).sort((a,b)=>b[1]-a[1]).slice(0,8);
  if(!entries.length){el.innerHTML='<div style="text-align:center;color:var(--gray-400);padding:20px;font-size:13px">No data yet</div>';return;}
  const max=entries[0][1];
  const colors=['#1a2e4a','#2e75b6','#16a34a','#7c3aed','#d97706','#dc2626','#0891b2','#059669'];
  let html='';
  entries.forEach(([name,rev],i)=>{
    const pct=rev/max*100;
    const color=colors[i%colors.length];
    html+=`<div style="margin-bottom:10px">
      <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:4px">
        <span style="font-size:12px;font-weight:600;color:var(--navy);max-width:55%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${name}</span>
        <span style="font-size:12px;font-weight:700;color:${color}">${fmtD(rev)}</span>
      </div>
      <div style="height:24px;background:var(--gray-100);border-radius:4px;overflow:hidden">
        <div style="height:24px;width:0%;background:${color};border-radius:4px;transition:width 1s ease;display:flex;align-items:center;padding-left:8px" data-target="${pct}">
          <span style="font-size:10px;font-weight:700;color:#fff;white-space:nowrap">#${i+1}</span>
        </div>
      </div>
    </div>`;
  });
  el.innerHTML=html;
  // Animate bars
  setTimeout(()=>{
    el.querySelectorAll('[data-target]').forEach(bar=>{
      bar.style.width=bar.dataset.target+'%';
    });
  },100);
}

// ════════════════════════════════════════════════════════════════════
// DRAG TO REORDER QUOTE LOG
// ════════════════════════════════════════════════════════════════════
let _dragIdx=null;
function setupDragReorder(tbodyId){
  const tbody=$(tbodyId);if(!tbody) return;
  tbody.querySelectorAll('tr').forEach((row,i)=>{
    row.draggable=true;
    row.style.cursor='grab';
    row.addEventListener('dragstart',e=>{_dragIdx=i;row.style.opacity='.5';e.dataTransfer.effectAllowed='move';});
    row.addEventListener('dragend',()=>{row.style.opacity='1';});
    row.addEventListener('dragover',e=>{e.preventDefault();e.dataTransfer.dropEffect='move';row.style.background='var(--blue-bg)';});
    row.addEventListener('dragleave',()=>{row.style.background='';});
    row.addEventListener('drop',e=>{
      e.preventDefault();row.style.background='';
      if(_dragIdx===null||_dragIdx===i) return;
      // Reorder quotes array
      const moved=S.quotes.splice(_dragIdx,1)[0];
      S.quotes.splice(i,0,moved);
      _dragIdx=null;
      renderLog();
    });
  });
}

// ════════════════════════════════════════════════════════════════════
// ANIMATED TRANSLOAD MAP
// ════════════════════════════════════════════════════════════════════
function buildTransloadMap(port,warehouse,delivery){
  const id='tl-map-'+Date.now();
  const map=`<div class="card" style="margin-bottom:14px;padding:16px 20px">
    <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--gray-400);margin-bottom:14px">Route overview</div>
    <svg id="${id}" viewBox="0 0 500 80" style="width:100%;display:block">
      <!-- Line -->
      <line x1="60" y1="40" x2="440" y2="40" stroke="#e2e8f0" stroke-width="3" stroke-dasharray="6,4"/>
      <!-- Port -->
      <circle cx="60" cy="40" r="18" fill="#1a2e4a"/>
      <text x="60" y="44" text-anchor="middle" font-size="9" fill="#fff" font-weight="700" font-family="sans-serif">PORT</text>
      <text x="60" y="68" text-anchor="middle" font-size="9" fill="#6b7280" font-family="sans-serif">${(port||'').split(',')[0].slice(0,12)}</text>
      <!-- Warehouse -->
      <circle cx="250" cy="40" r="18" fill="#d97706"/>
      <text x="250" y="44" text-anchor="middle" font-size="9" fill="#fff" font-weight="700" font-family="sans-serif">WH</text>
      <text x="250" y="68" text-anchor="middle" font-size="9" fill="#6b7280" font-family="sans-serif">${(warehouse||'').slice(0,12)}</text>
      <!-- Delivery -->
      <circle cx="440" cy="40" r="18" fill="#16a34a"/>
      <text x="440" y="44" text-anchor="middle" font-size="9" fill="#fff" font-weight="700" font-family="sans-serif">DEST</text>
      <text x="440" y="68" text-anchor="middle" font-size="9" fill="#6b7280" font-family="sans-serif">${(delivery||'').slice(0,12)}</text>
      <!-- Animated truck -->
      <circle id="${id}-dot" cx="60" cy="40" r="7" fill="#2e75b6">
        <animate attributeName="cx" values="60;240;440" keyTimes="0;0.45;1" dur="3s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1; 0.4 0 0.6 1"/>
      </circle>
    </svg>
  </div>`;
  return map;
}



async function promptBookingNum(type,id){
  const q=type==='drayage'?S.quotes.find(q=>q.id===id):null;
  const current=q?.bookingNum||(window._tlHistory||[]).find(q=>q.id===id)?.bookingNum||getMeta(id).booking_num||'';
  const val=prompt('Booking / Container #:',current);
  if(val===null) return;
  // Save to shared meta (visible to all users)
  await saveMeta(id,{booking_num:val.trim(),type});
  // Also save to quotes table for drayage
  if(type==='drayage'){
    const q=S.quotes.find(q=>q.id===id);
    if(q){q.bookingNum=val.trim();try{await db.from('quotes').update({booking_num:val.trim()}).eq('id',id);}catch(e){}}
  } else if(type==='transload'){
    const q=(window._tlHistory||[]).find(q=>q.id===id);
    if(q){q.bookingNum=val.trim();try{localStorage.setItem('tl_history',JSON.stringify(window._tlHistory));}catch(e){}}
  }
  showToast('Booking # saved','success',2000);
  renderActive();
}

function withTimeout(promise, ms=8000, fallback=null){
  return Promise.race([
    promise,
    new Promise(resolve=>setTimeout(()=>resolve(fallback),ms))
  ]);
}
// ════════════════════════════════════════════════════════════════════
// STREAK COUNTER
// ════════════════════════════════════════════════════════════════════
function updateStreak(){
  const today=localDateStr();
  const last=localStorage.getItem('shifl_last_login')||'';
  let streak=parseInt(localStorage.getItem('shifl_streak')||'0');
  const yesterday=new Date(Date.now()-864e5).toISOString().slice(0,10);
  if(last===today) return streak; // already counted today
  if(last===yesterday) streak++;  // consecutive
  else if(last!==today) streak=1; // broke streak or first time
  localStorage.setItem('shifl_streak',streak);
  localStorage.setItem('shifl_last_login',today);
  return streak;
}
function getStreakBadge(){
  const s=parseInt(localStorage.getItem('shifl_streak')||'0');
  if(s<=0) return '';
  const fire=s>=30?'🏆':s>=14?'💎':s>=7?'🔥':'⚡';
  return `<div id="streak-badge" title="${s} day streak!" style="display:flex;align-items:center;gap:5px;background:${s>=7?'linear-gradient(135deg,#f97316,#dc2626)':'linear-gradient(135deg,#f59e0b,#f97316)'};color:#fff;border-radius:99px;padding:5px 12px;font-size:12px;font-weight:700;cursor:default;box-shadow:0 2px 8px rgba(249,115,22,.35)">${fire} ${s} day streak</div>`;
}

// ════════════════════════════════════════════════════════════════════
// COMPLIMENT GENERATOR
// ════════════════════════════════════════════════════════════════════
const COMPLIMENTS=[
  "You're moving mountains one container at a time. 🏔️",
  "Every lane you quote is one step closer to the goal. 💪",
  "Your carriers are lucky to work with someone this organized.",
  "The freight doesn't move itself — good thing you're here. 🚛",
  "Another day, another load conquered. You've got this.",
  "Margins looking good? That's because YOU are.",
  "Somewhere a container is on a truck because of you. 🎯",
  "Top-tier broker energy today. Let's get it.",
  "Your hustle is showing. Keep going.",
  "The logistics industry needs more people like you. Facts.",
  "You turned complexity into a rate sheet. Impressive.",
  "Not all heroes wear capes — some send rate confirmations. 📧",
  "Port Newark doesn't run without people like you.",
  "Your attention to detail is someone else's peace of mind.",
  "Every shipment you move is a promise kept. 🤝",
];
function getDailyCompliment(){
  const day=new Date().getDay()+new Date().getDate();
  return COMPLIMENTS[day%COMPLIMENTS.length];
}

// ════════════════════════════════════════════════════════════════════
// DAILY QUESTS — per user
// ════════════════════════════════════════════════════════════════════
const ALL_QUESTS=[
  {id:'quote3',label:'Quote 3 loads today',icon:'📋',target:3,metric:'quotes_today'},
  {id:'book1',label:'Book 1 load today',icon:'✅',target:1,metric:'bookings_today'},
  {id:'invoice1',label:'Send 1 invoice today',icon:'🧾',target:1,metric:'invoices_today'},
  {id:'quote5',label:'Quote 5 loads today',icon:'🔥',target:5,metric:'quotes_today'},
  {id:'deliver1',label:'Mark 1 shipment delivered',icon:'📦',target:1,metric:'delivered_today'},
  {id:'carrier_check',label:'Check in with a carrier',icon:'📱',target:1,metric:'checkins_today'},
  {id:'book2',label:'Book 2 loads today',icon:'🏆',target:2,metric:'bookings_today'},
  {id:'margin20',label:'Quote a load with 20%+ margin',icon:'💰',target:1,metric:'high_margin_today'},
];
function getDailyQuest(){
  const seed=new Date().toDateString()+((_currentUser?.id)||'guest');
  let hash=0;for(let i=0;i<seed.length;i++){hash=(hash*31+seed.charCodeAt(i))&0xffffffff;}
  return ALL_QUESTS[Math.abs(hash)%ALL_QUESTS.length];
}
function getDailyQuestProgress(quest){
  const key='shifl_quest_'+localDateStr()+'_'+(_currentUser?.id||'guest');
  const data=JSON.parse(localStorage.getItem(key)||'{}');
  return data[quest.metric]||0;
}
function incrementQuestMetric(metric){
  const key='shifl_quest_'+localDateStr()+'_'+(_currentUser?.id||'guest');
  const data=JSON.parse(localStorage.getItem(key)||'{}');
  data[metric]=(data[metric]||0)+1;
  localStorage.setItem(key,JSON.stringify(data));
  const quest=getDailyQuest();
  if(quest.metric===metric&&getDailyQuestProgress(quest)>=quest.target){
    showQuestComplete(quest);
  }
}
function showQuestComplete(quest){
  const alreadyShown=localStorage.getItem('quest_shown_'+localDateStr()+'_'+quest.id);
  if(alreadyShown) return;
  localStorage.setItem('quest_shown_'+localDateStr()+'_'+quest.id,'1');
  const el=document.createElement('div');
  el.style.cssText='position:fixed;top:70px;right:24px;z-index:99999;background:linear-gradient(135deg,#16a34a,#15803d);color:#fff;border-radius:12px;padding:18px 22px;box-shadow:0 8px 32px rgba(0,0,0,.25);display:flex;align-items:center;gap:14px;animation:fadeInPreview .3s ease;max-width:320px';
  el.innerHTML=`<div style="font-size:36px">${quest.icon}</div><div><div style="font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;opacity:.8">Quest Complete!</div><div style="font-size:16px;font-weight:800;margin-top:3px">${quest.label}</div><div style="font-size:12px;opacity:.8;margin-top:3px">🏆 Daily goal achieved!</div></div>`;
  document.body.appendChild(el);
  setTimeout(()=>el.remove(),5000);
  if(typeof fireConfetti==='function') fireConfetti();
}
function buildQuestWidget(){
  const quest=getDailyQuest();
  const progress=getDailyQuestProgress(quest);
  const done=progress>=quest.target;
  const pct=Math.min(100,progress/quest.target*100);
  return `<div style="background:${done?'linear-gradient(135deg,#f0fdf4,#dcfce7)':'linear-gradient(135deg,#eff6ff,#dbeafe)'};border:1.5px solid ${done?'#86efac':'#93c5fd'};border-radius:10px;padding:12px 16px;margin-bottom:14px">
    <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:${done?'#15803d':'#1d4ed8'};margin-bottom:6px">⚡ Daily Quest</div>
    <div style="display:flex;align-items:center;gap:10px">
      <span style="font-size:22px">${quest.icon}</span>
      <div style="flex:1">
        <div style="font-size:13px;font-weight:700;color:var(--navy)">${quest.label}</div>
        <div style="margin-top:5px;height:6px;background:rgba(0,0,0,.08);border-radius:3px;overflow:hidden">
          <div style="height:6px;width:${pct}%;background:${done?'#16a34a':'#2563eb'};border-radius:3px;transition:width .6s ease"></div>
        </div>
        <div style="font-size:11px;color:${done?'#15803d':'var(--gray-500)'};margin-top:3px">${done?'✅ Completed!':progress+' / '+quest.target+' done'}</div>
      </div>
    </div>
  </div>`;
}

// ════════════════════════════════════════════════════════════════════
// BOSS MODE — unlocked after 100 loads booked
// ════════════════════════════════════════════════════════════════════
function checkBossMode(){
  const totalBooked=(S.quotes||[]).filter(q=>['Booked','Delivered','Invoiced','Paid'].includes(q.status)).length
    +(window._fqHistory||[]).filter(q=>['Booked','Delivered','Invoiced','Paid'].includes(q.status)).length;
  const isBoss=totalBooked>=100;
  const wasUnlocked=localStorage.getItem('shifl_boss_mode_unlocked');
  if(isBoss&&!wasUnlocked){
    localStorage.setItem('shifl_boss_mode_unlocked','1');
    setTimeout(()=>{
      const el=document.createElement('div');
      el.style.cssText='position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.85);display:flex;align-items:center;justify-content:center;flex-direction:column;animation:fadeInPreview .5s ease';
      el.innerHTML=`<div style="text-align:center;color:#fff"><div style="font-size:80px;margin-bottom:20px;animation:boat-rock 1s ease-in-out infinite">👑</div><div style="font-size:36px;font-weight:900;background:linear-gradient(135deg,#fbbf24,#f59e0b,#d97706);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:8px">BOSS MODE UNLOCKED</div><div style="font-size:18px;color:rgba(255,255,255,.8);margin-bottom:24px">100 loads booked. You're running this port.</div><button onclick="this.closest('div[style*=inset]').remove();activateBossMode()" style="background:linear-gradient(135deg,#fbbf24,#d97706);color:#fff;border:none;padding:14px 32px;border-radius:99px;font-size:16px;font-weight:800;cursor:pointer;font-family:inherit">🚀 Enter Boss Mode</button></div>`;
      document.body.appendChild(el);
      if(typeof fireConfetti==='function'){fireConfetti();setTimeout(fireConfetti,500);setTimeout(fireConfetti,1000);}
    },1000);
  }
  if(isBoss&&localStorage.getItem('shifl_boss_active')==='1') activateBossMode(false);
  return isBoss;
}
function activateBossMode(save=true){
  if(save) localStorage.setItem('shifl_boss_active','1');
  document.documentElement.style.setProperty('--navy','#92400e');
  document.documentElement.style.setProperty('--steel','#b45309');
  document.documentElement.style.setProperty('--blue-bg','#fffbeb');
  // Gold sidebar
  const sidebar=document.querySelector('.sidebar');
  if(sidebar) sidebar.style.background='linear-gradient(180deg,#92400e 0%,#78350f 100%)';
  // Gold crown on user name
  const userEl=document.getElementById('sidebar-username');
  if(userEl&&!userEl.textContent.includes('👑')) userEl.textContent='👑 '+userEl.textContent;
  showToast('👑 Boss Mode active — gold theme enabled','info',3000);
}

// ════════════════════════════════════════════════════════════════════
// FRIDAY ENERGY BAR
// ════════════════════════════════════════════════════════════════════
function buildFridayBar(){
  const isFriday=new Date().toLocaleString('en-US',{timeZone:'America/New_York',weekday:'long'})==='Friday';
  if(!isFriday) return;
  const existing=document.getElementById('friday-bar');
  if(existing) return;
  const bar=document.createElement('div');
  bar.id='friday-bar';
  bar.style.cssText='position:fixed;top:0;left:0;right:0;height:4px;z-index:99999;background:linear-gradient(90deg,#fbbf24,#f97316,#ef4444,#8b5cf6,#06b6d4);background-size:200% 100%;animation:fridayBar 3s linear infinite';
  document.body.prepend(bar);
  // Add Friday banner
  const banner=document.createElement('div');
  banner.id='friday-banner';
  banner.style.cssText='position:fixed;bottom:80px;right:24px;z-index:9999;background:linear-gradient(135deg,#f97316,#dc2626);color:#fff;border-radius:12px;padding:12px 18px;font-size:13px;font-weight:700;box-shadow:0 4px 16px rgba(249,115,22,.4);cursor:pointer';
  banner.innerHTML='🎉 It\'s Friday! Finish strong.';
  banner.onclick=()=>banner.remove();
  document.body.appendChild(banner);
  setTimeout(()=>banner.remove(),8000);
}
// Add CSS for friday bar animation
const fridayStyle=document.createElement('style');
fridayStyle.textContent='@keyframes fridayBar{0%{background-position:0% 50%}100%{background-position:200% 50%}}';
document.head.appendChild(fridayStyle);

// ════════════════════════════════════════════════════════════════════
// LEADERBOARD
// ════════════════════════════════════════════════════════════════════
async function renderLeaderboard(){
  $('topbar-right').innerHTML='';
  const weekAgo=new Date(Date.now()-7*864e5).toISOString().slice(0,10);
  // Count from local data since we don't have per-user tracking in quotes
  const allBooked=[...(S.quotes||[]).filter(q=>['Booked','Delivered','Invoiced','Paid'].includes(q.status)&&q.date>=weekAgo)];
  const byUser={};
  allBooked.forEach(q=>{const u=q.created_by_name||q.created_by||'Unknown';byUser[u]=(byUser[u]||0)+1;});
  const sorted=Object.entries(byUser).sort((a,b)=>b[1]-a[1]);
  const medals=['🥇','🥈','🥉'];
  $('page').innerHTML=`
  <div style="max-width:600px;margin:0 auto">
    <div style="font-size:22px;font-weight:900;color:var(--navy);margin-bottom:4px">🏆 Weekly Leaderboard</div>
    <div style="font-size:13px;color:var(--gray-500);margin-bottom:24px">Loads booked this week · resets every Monday</div>
    ${sorted.length===0?`<div class="empty"><div class="empty-ico">🏆</div><p>No loads booked this week yet — be the first!</p></div>`:`
    <div style="display:flex;flex-direction:column;gap:8px">
      ${sorted.map(([name,count],i)=>{
        const isMe=name===(_currentUser?.name||_currentUser?.email?.split('@')[0]);
        return`<div style="display:flex;align-items:center;gap:14px;background:${isMe?'linear-gradient(135deg,#eff6ff,#dbeafe)':'var(--white)'};border:${isMe?'2px solid var(--steel)':'1px solid var(--gray-100)'};border-radius:12px;padding:14px 18px">
          <div style="font-size:28px;min-width:36px;text-align:center">${medals[i]||'#'+(i+1)}</div>
          <div style="flex:1">
            <div style="font-size:15px;font-weight:800;color:var(--navy)">${name}${isMe?' (you)':''}</div>
            <div style="height:8px;background:var(--gray-100);border-radius:4px;margin-top:6px;overflow:hidden">
              <div style="height:8px;width:${Math.round(count/sorted[0][1]*100)}%;background:${i===0?'linear-gradient(90deg,#fbbf24,#f59e0b)':i===1?'linear-gradient(90deg,#94a3b8,#64748b)':'linear-gradient(90deg,#f97316,#ea580c)'};border-radius:4px;transition:width 1s ease"></div>
            </div>
          </div>
          <div style="font-size:24px;font-weight:900;color:${i===0?'#d97706':i===1?'#64748b':'#ea580c'}">${count}</div>
        </div>`;}).join('')}
    </div>`}
  </div>`;
}

// ════════════════════════════════════════════════════════════════════
// LIQUID LOADING BAR
// ════════════════════════════════════════════════════════════════════
function showLiquidLoader(msg='Loading…'){
  const ls=$('loading-screen');
  if(!ls) return;
  ls.style.display='flex';
  $('loading-msg').textContent=msg;
  // Replace spinner with liquid glass
  const existing=document.getElementById('liquid-loader');
  if(existing) return;
  const spinner=ls.querySelector('.spinner');
  if(spinner){spinner.style.display='none';}
  const loader=document.createElement('div');
  loader.id='liquid-loader';
  loader.style.cssText='position:relative;width:60px;height:80px;border:3px solid #1a2e4a;border-radius:8px 8px 6px 6px;overflow:hidden;margin-bottom:20px;background:#f8fafc';
  loader.innerHTML=`
    <div id="liquid-fill" style="position:absolute;bottom:0;left:0;right:0;height:0%;background:linear-gradient(180deg,#2e75b6,#1a2e4a);transition:height .3s;border-radius:0 0 4px 4px">
      <div style="position:absolute;top:-8px;left:0;right:0;height:16px;background:rgba(255,255,255,.3);border-radius:50%;animation:liquidWave 1s ease-in-out infinite"></div>
    </div>
    <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;color:var(--navy);z-index:1" id="liquid-pct">0%</div>`;
  const style=document.createElement('style');
  style.textContent='@keyframes liquidWave{0%,100%{transform:scaleX(1.1) translateY(0)}50%{transform:scaleX(.9) translateY(-4px)}}';
  document.head.appendChild(style);
  if(spinner) spinner.parentNode.insertBefore(loader,spinner);
  else ls.prepend(loader);
}
function setLiquidProgress(pct){
  const fill=document.getElementById('liquid-fill');
  const label=document.getElementById('liquid-pct');
  if(fill) fill.style.height=pct+'%';
  if(label) label.textContent=Math.round(pct)+'%';
}


// ════════════════════════════════════════════════════════════════════
// DAILY THEMES — Day of week + Special dates (like Google)
// ════════════════════════════════════════════════════════════════════

const DAILY_THEMES = {
  // ── Day of week (0=Sun, 1=Mon, ..., 6=Sat) ──────────────────────
  weekday: {
    0: { // Sunday
      name: 'Sunday Recharge', emoji: '☀️',
      sidebar: 'linear-gradient(180deg,#0c4a6e 0%,#075985 100%)',
      accent: '#0369a1', accentBg: '#e0f2fe', accentText: '#0c4a6e',
      topbarMsg: '☀️ Take it easy — recharge for the week ahead'
    },
    1: { // Monday
      name: 'Monday Grind', emoji: '💪',
      sidebar: 'linear-gradient(180deg,#1a2e4a 0%,#0f1f35 100%)',
      accent: '#1a2e4a', accentBg: '#eff6ff', accentText: '#1a2e4a',
      topbarMsg: '💪 New week, new loads. Let\'s get it.'
    },
    2: { // Tuesday
      name: 'Teal Tuesday', emoji: '🌊',
      sidebar: 'linear-gradient(180deg,#134e4a 0%,#0f3d3a 100%)',
      accent: '#0d9488', accentBg: '#f0fdfa', accentText: '#134e4a',
      topbarMsg: '🌊 Riding the wave — Teal Tuesday'
    },
    3: { // Wednesday
      name: 'Purple Wednesday', emoji: '🔮',
      sidebar: 'linear-gradient(180deg,#3b0764 0%,#2d0a4e 100%)',
      accent: '#7c3aed', accentBg: '#faf5ff', accentText: '#3b0764',
      topbarMsg: '🔮 Hump day magic — keep pushing through'
    },
    4: { // Thursday
      name: 'Golden Thursday', emoji: '✨',
      sidebar: 'linear-gradient(180deg,#78350f 0%,#5c2a0c 100%)',
      accent: '#d97706', accentBg: '#fffbeb', accentText: '#78350f',
      topbarMsg: '✨ Almost there — golden Thursday energy'
    },
    5: { // Friday
      name: 'TGIF', emoji: '🎉',
      sidebar: 'linear-gradient(180deg,#14532d 0%,#0f3d20 100%)',
      accent: '#16a34a', accentBg: '#f0fdf4', accentText: '#14532d',
      topbarMsg: '🎉 IT\'S FRIDAY! Let\'s close the week strong'
    },
    6: { // Saturday
      name: 'Weekend Mode', emoji: '🌸',
      sidebar: 'linear-gradient(180deg,#831843 0%,#6b1535 100%)',
      accent: '#be185d', accentBg: '#fdf2f8', accentText: '#831843',
      topbarMsg: '🌸 Saturday hustle — extra credit loads'
    }
  },

  // ── Special dates (MM-DD format) ─────────────────────────────────
  special: {
    '01-01': {
      name: 'New Year\'s Day 🎆', emoji: '🎆',
      sidebar: 'linear-gradient(180deg,#1a1a2e 0%,#16213e 100%)',
      accent: '#fbbf24', accentBg: '#fffbeb', accentText: '#92400e',
      topbarMsg: '🎆 Happy New Year! New year, new loads, new PBs.',
      decoration: '🎆🎇✨'
    },
    '01-15': {
      name: 'MLK Day 🕊️', emoji: '🕊️',
      sidebar: 'linear-gradient(180deg,#1a2e4a 0%,#2e75b6 100%)',
      accent: '#2e75b6', accentBg: '#eff6ff', accentText: '#1a2e4a',
      topbarMsg: '🕊️ "Injustice anywhere is a threat to justice everywhere." — MLK',
      decoration: '🕊️'
    },
    '02-14': {
      name: 'Valentine\'s Day 💕', emoji: '💕',
      sidebar: 'linear-gradient(180deg,#881337 0%,#9f1239 100%)',
      accent: '#e11d48', accentBg: '#fff1f2', accentText: '#881337',
      topbarMsg: '💕 Happy Valentine\'s Day — we love logistics!',
      decoration: '💕❤️🌹'
    },
    '03-17': {
      name: 'St. Patrick\'s Day ☘️', emoji: '☘️',
      sidebar: 'linear-gradient(180deg,#14532d 0%,#166534 100%)',
      accent: '#16a34a', accentBg: '#f0fdf4', accentText: '#14532d',
      topbarMsg: '☘️ Luck of the Irish — may your margins be green today',
      decoration: '☘️🍀🌈'
    },
    '04-01': {
      name: 'April Fools 🃏', emoji: '🃏',
      sidebar: 'linear-gradient(180deg,#7e22ce 0%,#dc2626 100%)',
      accent: '#dc2626', accentBg: '#fff5f5', accentText: '#7e22ce',
      topbarMsg: '🃏 April Fools! (Your quotes are still real though)',
      decoration: '🃏🎭'
    },
    '05-05': {
      name: 'Cinco de Mayo 🎉', emoji: '🎉',
      sidebar: 'linear-gradient(180deg,#1a6b2a 0%,#7c2d12 100%)',
      accent: '#dc2626', accentBg: '#fff5f5', accentText: '#7c2d12',
      topbarMsg: '🎉 Cinco de Mayo — fiesta mode activated',
      decoration: '🌮🎉💃'
    },
    '07-04': {
      name: 'Independence Day 🇺🇸', emoji: '🇺🇸',
      sidebar: 'linear-gradient(180deg,#1e3a8a 0%,#b91c1c 100%)',
      accent: '#dc2626', accentBg: '#fff5f5', accentText: '#1e3a8a',
      topbarMsg: '🇺🇸 Happy 4th of July! Land of the free, home of the freight.',
      decoration: '🎆🇺🇸🎇'
    },
    '09-01': {
      name: 'Labor Day 🛠️', emoji: '🛠️',
      sidebar: 'linear-gradient(180deg,#1a2e4a 0%,#374151 100%)',
      accent: '#374151', accentBg: '#f9fafb', accentText: '#1a2e4a',
      topbarMsg: '🛠️ Happy Labor Day — you\'ve earned it.',
      decoration: '🛠️💪'
    },
    '10-31': {
      name: 'Halloween 🎃', emoji: '🎃',
      sidebar: 'linear-gradient(180deg,#431407 0%,#1c1917 100%)',
      accent: '#ea580c', accentBg: '#fff7ed', accentText: '#431407',
      topbarMsg: '🎃 BOO! Your freight costs are scary good today.',
      decoration: '🎃👻🕷️🕸️'
    },
    '11-11': {
      name: 'Veterans Day 🎖️', emoji: '🎖️',
      sidebar: 'linear-gradient(180deg,#1e3a8a 0%,#1a2e4a 100%)',
      accent: '#1e3a8a', accentBg: '#eff6ff', accentText: '#1e3a8a',
      topbarMsg: '🎖️ Thank you to all who served.',
      decoration: '🎖️🇺🇸'
    },
    '11-27': { name: 'Thanksgiving 🦃', emoji: '🦃', sidebar: 'linear-gradient(180deg,#78350f 0%,#451a03 100%)', accent: '#b45309', accentBg: '#fffbeb', accentText: '#78350f', topbarMsg: '🦃 Grateful for every load we move together. Happy Thanksgiving!', decoration: '🦃🍂🍁' },
    '11-28': { name: 'Thanksgiving 🦃', emoji: '🦃', sidebar: 'linear-gradient(180deg,#78350f 0%,#451a03 100%)', accent: '#b45309', accentBg: '#fffbeb', accentText: '#78350f', topbarMsg: '🦃 Happy Thanksgiving!', decoration: '🦃🍂' },
    '12-24': {
      name: 'Christmas Eve 🎄', emoji: '🎄',
      sidebar: 'linear-gradient(180deg,#14532d 0%,#7f1d1d 100%)',
      accent: '#16a34a', accentBg: '#f0fdf4', accentText: '#14532d',
      topbarMsg: '🎄 Christmas Eve — Santa\'s supply chain never stops!',
      decoration: '🎄⭐🎅'
    },
    '12-25': {
      name: 'Christmas Day 🎅', emoji: '🎅',
      sidebar: 'linear-gradient(180deg,#7f1d1d 0%,#14532d 100%)',
      accent: '#dc2626', accentBg: '#fff5f5', accentText: '#7f1d1d',
      topbarMsg: '🎅 Merry Christmas! May your margins be merry and bright.',
      decoration: '🎅🎁🎄⭐'
    },
    '12-31': {
      name: 'New Year\'s Eve 🥂', emoji: '🥂',
      sidebar: 'linear-gradient(180deg,#1a1a2e 0%,#7c3aed 100%)',
      accent: '#fbbf24', accentBg: '#fffbeb', accentText: '#92400e',
      topbarMsg: '🥂 Last day of the year — let\'s finish with a bang!',
      decoration: '🥂🎆✨🎇'
    }
  }
};

function getTodayTheme(){
  // Use Eastern time (NJ) for date/day calculation
  const etStr = new Date().toLocaleString('en-US',{timeZone:'America/New_York'});
  const now = new Date(etStr);
  const month = String(now.getMonth()+1).padStart(2,'0');
  const day   = String(now.getDate()).padStart(2,'0');
  const key   = `${month}-${day}`;
  return DAILY_THEMES.special[key] || DAILY_THEMES.weekday[now.getDay()];
}

function applyDailyTheme(){
  const theme = getTodayTheme();
  if(!theme) return;
  // Sidebar background
  const sidebar = document.querySelector('.sidebar');
  if(sidebar) sidebar.style.background = theme.sidebar;
  // CSS variable overrides
  document.documentElement.style.setProperty('--steel', theme.accent);
  document.documentElement.style.setProperty('--blue-bg', theme.accentBg);
  // Topbar theme message
  const existing = document.getElementById('theme-msg');
  if(existing) existing.remove();
  const msg = document.createElement('div');
  msg.id = 'theme-msg';
  msg.style.cssText = `position:fixed;top:0;left:0;right:0;height:26px;background:${theme.accent}18;border-bottom:1px solid ${theme.accent}30;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:600;color:${theme.accentText};z-index:100;letter-spacing:.01em;pointer-events:none`;
  msg.textContent = theme.topbarMsg;
  document.body.prepend(msg);
  // Adjust app/sidebar top margin to account for banner
  const app = document.querySelector('.app-shell') || document.querySelector('.app');
  if(app) app.style.paddingTop='26px';
  // Decorations in topbar on special days
  if(theme.decoration){
    const dec = document.createElement('div');
    dec.style.cssText = 'position:fixed;top:26px;right:16px;font-size:18px;letter-spacing:4px;z-index:99;pointer-events:none;opacity:.6;animation:boat-rock 4s ease-in-out infinite';
    dec.textContent = theme.decoration;
    document.body.appendChild(dec);
    setTimeout(()=>dec.remove(), 12000);
  }
  // Show theme toast only once per day
  const shownKey = 'theme_shown_'+new Date().toDateString();
  if(!localStorage.getItem(shownKey)){
    localStorage.setItem(shownKey,'1');
    setTimeout(()=>showToast(`${theme.emoji} Today\'s theme: ${theme.name}`,'info',3500),2000);
  }
}



function refreshAqPreview(){
  const aq=S.aq;
  const airCost=parseFloat(aq.airFreightCost)||0;
  const groundRate=parseFloat(aq.groundRate)||0;
  const custRate=parseFloat(aq.customerRate)||0;
  const totalCost=airCost+groundRate;
  const profit=custRate-totalCost;
  const margin=custRate>0?profit/custRate:0;
  const el=document.getElementById('aq-preview-profit');
  if(el) el.innerHTML=`<span style="color:${profit>=0?'var(--green)':'var(--red)'}">+${fmtD(profit)}</span> <span style="color:var(--gray-500);font-size:11px">(${pct(margin)})</span>`;
  const costEl=document.getElementById('aq-preview-cost');
  if(costEl) costEl.textContent=fmtD(totalCost);
}
// ════════════════════════════════════════════════════════════════════
// SHARED FLAGS + APPOINTMENTS — stored in Supabase, visible to all users
// ════════════════════════════════════════════════════════════════════

// In-memory cache
window._shipmentMeta = {};

async function loadShipmentMeta(){
  try{
    const{data,error}=await db.from('shipment_metadata').select('*');
    if(error) throw error;
    window._shipmentMeta={};
    (data||[]).forEach(r=>{window._shipmentMeta[r.id]=r;});
    console.log('Loaded '+Object.keys(window._shipmentMeta).length+' shipment meta records from Supabase');
    // Also merge localStorage fallback for any not in DB
    try{const local=JSON.parse(localStorage.getItem('shifl_flags')||'{}');Object.entries(local).forEach(([id,f])=>{if(!window._shipmentMeta[id]) window._shipmentMeta[id]={id,is_flagged:true,flag_note:f.note||'',flagged_by:f.flaggedBy||'',pickup_appt:'',delivery_appt:'',tracking_url:''};});}catch(e){}
  }catch(e){
    // Fallback: use localStorage only
    console.log('shipment_metadata table not set up yet — using localStorage');
    try{const local=JSON.parse(localStorage.getItem('shifl_flags')||'{}');Object.entries(local).forEach(([id,f])=>{window._shipmentMeta[id]={id,is_flagged:true,flag_note:f.note||'',flagged_by:f.flaggedBy||'',pickup_appt:'',delivery_appt:'',tracking_url:''};});}catch(e2){}
  }
}

function getMeta(id){ return window._shipmentMeta?.[id]||{}; }

async function saveMeta(id, updates){
  if(!window._shipmentMeta) window._shipmentMeta={};
  const existing=window._shipmentMeta[id]||{id};
  const merged={...existing,...updates,id,updated_at:new Date().toISOString()};
  window._shipmentMeta[id]=merged;
  try{
    // Try upsert without onConflict for broader Supabase version support
    const{error}=await db.from('shipment_metadata').upsert([merged]);
    if(error) throw error;
    console.log('Meta saved to Supabase OK:', id);
  }catch(e){
    showToast('⚠️ Sync error: '+e.message,'error',4000);
    console.log('Meta save fallback to localStorage:', e.message);
    // Fallback: save flags to localStorage
    if('is_flagged' in updates){
      const flags=JSON.parse(localStorage.getItem('shifl_flags')||'{}');
      if(updates.is_flagged) flags[id]={note:updates.flag_note||'',flaggedBy:updates.flagged_by||''};
      else delete flags[id];
      localStorage.setItem('shifl_flags',JSON.stringify(flags));
    }
    if('tracking_url' in updates){
      const links=JSON.parse(localStorage.getItem('shifl_tracking')||'{}');
      links[id]=updates.tracking_url||'';
      localStorage.setItem('shifl_tracking',JSON.stringify(links));
    }
    if('pickup_appt' in updates||'delivery_appt' in updates){
      const appts=JSON.parse(localStorage.getItem('shifl_appts')||'{}');
      if(!appts[id]) appts[id]={};
      if('pickup_appt' in updates) appts[id].pickup=updates.pickup_appt;
      if('delivery_appt' in updates) appts[id].delivery=updates.delivery_appt;
      localStorage.setItem('shifl_appts',JSON.stringify(appts));
    }
  }
}

// ── Overwrite flag functions to use shared meta ───────────────────
async function toggleFlag(type,id){
  const meta=getMeta(id);
  if(meta.is_flagged){
    await saveMeta(id,{is_flagged:false,flag_note:'',flagged_by:'',type});
    showToast('Flag removed','info',2000);
  } else {
    const note=prompt('🚨 Flag this shipment — add a note (optional):');
    if(note===null) return;
    await saveMeta(id,{
      is_flagged:true,
      flag_note:note.trim(),
      flagged_by:_currentUser?.name||_currentUser?.email?.split('@')[0]||'Unknown',
      flagged_at:new Date().toISOString(),
      type
    });
    showToast('🚨 Shipment flagged','warning',3000);
  }
  renderActive();
}
function isFlagged(id){ return !!(getMeta(id).is_flagged); }
function getFlag(id){ const m=getMeta(id); return m.is_flagged?{note:m.flag_note,flaggedBy:m.flagged_by}:null; }

// ── Tracking link uses shared meta ────────────────────────────────
async function saveTrackingLink(id,url){
  await saveMeta(id,{tracking_url:url});
  showToast('Tracking link saved','success',2000);
}
function getTrackingLink(id){ return getMeta(id).tracking_url||''; }

// ── Appointments use shared meta ──────────────────────────────────
async function saveAppointment(id,type,field,val){
  const updates={};
  updates[field==='pickup'?'pickup_appt':'delivery_appt']=val;
  updates.type=type;
  await saveMeta(id,updates);
  showSavedIndicator();
}
function getAppointments(id){
  const m=getMeta(id);
  return{pickup:m.pickup_appt||'',delivery:m.delivery_appt||''};
}

// ── Poll shipment_metadata every 8 seconds — no real-time config needed ──
let _metaPollInterval=null;
function subscribeToMeta(){
  if(_metaPollInterval) clearInterval(_metaPollInterval);
  _metaPollInterval=setInterval(async()=>{
    try{
      const{data,error}=await db.from('shipment_metadata').select('*');
      if(error||!data) return;
      let changed=false;
      data.forEach(r=>{
        const existing=window._shipmentMeta?.[r.id];
        const existingStr=JSON.stringify(existing);
        const newStr=JSON.stringify(r);
        if(existingStr!==newStr){changed=true;window._shipmentMeta[r.id]=r;}
      });
      if(changed&&S.view==='active') renderActive();
    }catch(e){}
  },8000);
}


// ════════════════════════════════════════════════════════════════════
// TMS — Full FTL/LTL Transportation Management System
// Booked FTL/LTL quotes auto-flow in from freight log
// ════════════════════════════════════════════════════════════════════

// TMS-specific metadata stored per load
function getTMSMeta(id){ return JSON.parse(localStorage.getItem('tms_meta_'+id)||'{}'); }
function saveTMSMeta(id, data){
  const existing=getTMSMeta(id);
  const merged={...existing,...data,updatedAt:new Date().toISOString()};
  localStorage.setItem('tms_meta_'+id,JSON.stringify(merged));
  try{db.from('shipment_metadata').upsert([{id:'tms_'+id,...merged}]);}catch(e){}
  return merged;
}

// Get all TMS loads — FTL/LTL quotes that are Booked or further
function getTMSLoads(){
  const TMS_MODES=['FTL','LTL','LCL','Box Truck','Air'];
  // FQ history (FTL, LTL, LCL, Box Truck)
  const fqLoads=(window._fqHistory||[]).filter(q=>
    (TMS_MODES.includes(q.fqMode)||q.fqEquip==='Box Truck')&&
    ['Booked','Dispatched','In Transit','Out for Delivery','Delivered','Invoiced','Paid'].includes(q.status)
  ).map(q=>({...q,_tmsType:'freight',tmsMeta:getTMSMeta(q.id)}));
  // Air freight (aqHistory)
  const airLoads=(window._aqHistory||[]).filter(q=>
    ['Booked','Dispatched','In Transit','Out for Delivery','Delivered','Invoiced','Paid'].includes(q.status||'')
  ).map(q=>({...q,fqMode:'Air',_tmsType:'air',pickupZip:q.originAirport||q.pickupZip||'',deliveryZip:q.destAirport||q.deliveryZip||'',carrierRate:q.airFreightCost||q.carrierRate||0,tmsMeta:getTMSMeta(q.id)}));
  return [...fqLoads,...airLoads];
}

// TMS STATUS progression
const TMS_STATUSES=['Booked','Dispatched','In Transit','Out for Delivery','Delivered'];
function nextTMSStatus(current){
  const idx=TMS_STATUSES.indexOf(current);
  return idx>=0&&idx<TMS_STATUSES.length-1?TMS_STATUSES[idx+1]:null;
}
function tmsStatusColor(s){
  return s==='Booked'?'#1a2e4a':s==='Dispatched'?'#7c3aed':s==='In Transit'?'#d97706':s==='Out for Delivery'?'#2e75b6':s==='Delivered'?'#16a34a':'#6b7280';
}
function tmsModeColor(mode){
  return mode==='FTL'?'#1d4ed8':mode==='LTL'?'#7c3aed':mode==='LCL'?'#0369a1':mode==='Box Truck'?'#d97706':mode==='Air'?'#dc2626':'#6b7280';
}
function tmsModeBadge(mode){
  const icons={'FTL':'🚛','LTL':'📦','LCL':'🚢','Box Truck':'📦','Air':'✈️'};
  const col=tmsModeColor(mode);
  return`<span style="font-size:10px;background:${col}15;color:${col};padding:1px 7px;border-radius:99px;font-weight:700">${icons[mode]||'🚚'} ${mode||'—'}</span>`;
}

// ── MAIN TMS RENDER ────────────────────────────────────────────────
function renderTMS(){
  const sub=S.tmsTab||'dispatch';
  const loads=getTMSLoads();
  $('topbar-right').innerHTML='';

  const tabs=[
    {id:'dispatch',icon:'ti-layout-kanban',label:'Dispatch'},
    {id:'loads',icon:'ti-list',label:'All loads'},
    {id:'bol',icon:'ti-file-text',label:'BOL & Docs'},
    {id:'invoicing',icon:'ti-receipt',label:'Invoicing'},
    {id:'scorecard',icon:'ti-chart-bar',label:'Scorecards'},
    {id:'tools',icon:'ti-calculator',label:'Tools'},
    {id:'reports',icon:'ti-report-analytics',label:'Reports'},
  ];

  // Load count badge
  const tmsCnt=getTMSLoads().length;
  const badge=document.getElementById('tms-badge');
  if(badge) badge.textContent=tmsCnt>0?tmsCnt+' loads':'FTL/LTL';

  $('topbar-right').innerHTML='';

  const tabBar=`<div style="display:flex;gap:0;border-bottom:2px solid var(--gray-100);margin-bottom:20px;overflow-x:auto">
    ${tabs.map(t=>`<button onclick="S.tmsTab='${t.id}';renderTMS()"
      style="display:flex;align-items:center;gap:6px;padding:11px 18px;border:none;border-bottom:2px solid ${sub===t.id?'var(--steel)':'transparent'};margin-bottom:-2px;font-size:13px;font-weight:${sub===t.id?700:500};cursor:pointer;font-family:inherit;background:transparent;color:${sub===t.id?'var(--steel)':'var(--gray-500)'};white-space:nowrap;transition:color .12s">
      <i class="ti ${t.icon}" style="font-size:15px"></i>${t.label}</button>`).join('')}
  </div>`;

  const inTransit=loads.filter(l=>['Dispatched','In Transit','Out for Delivery'].includes(l.status));
  const needsInvoice=loads.filter(l=>['Delivered','Invoiced'].includes(l.status)&&!getInvoice(l.id));
  const totalRevInTransit=inTransit.reduce((s,l)=>s+(l.customerRate||0),0);
  const weekAgo=new Date(Date.now()-7*864e5).toISOString().slice(0,10);
  const thisWeek=loads.filter(l=>l.date>=weekAgo).length;
  const kpis=`<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin-bottom:16px">
    <div class="kpi"><div class="kpi-lbl">In transit now</div><div class="kpi-val" style="color:#d97706;font-size:20px">${inTransit.length}</div><div style="font-size:11px;color:var(--gray-400)">${fmtD(totalRevInTransit)}</div></div>
    <div class="kpi"><div class="kpi-lbl">This week</div><div class="kpi-val" style="font-size:20px">${thisWeek}</div></div>
    <div class="kpi"><div class="kpi-lbl">Needs invoice</div><div class="kpi-val" style="color:${needsInvoice.length?'var(--red)':'var(--green)'};font-size:20px">${needsInvoice.length}</div></div>
    <div class="kpi"><div class="kpi-lbl">Total loads</div><div class="kpi-val" style="font-size:20px">${loads.length}</div></div>
    <div class="kpi" style="grid-column:span 1"><div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:4px">${TMS_STATUSES.map(s=>{const c=loads.filter(l=>l.status===s).length;return c?`<span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:99px;background:${tmsStatusColor(s)}18;color:${tmsStatusColor(s)}">${s} ${c}</span>`:''}).join('')}</div></div>
  </div>`;

  if(sub==='dispatch') renderTMSDispatch(tabBar,kpis,loads);
  else if(sub==='loads') renderTMSLoads(tabBar,kpis,loads);
  else if(sub==='bol') renderTMSBol(tabBar,loads);
  else if(sub==='invoicing') renderTMSInvoicing(tabBar,loads);
  else if(sub==='scorecard') renderTMSScorecard(tabBar,loads);
  else if(sub==='tools') renderTMSTools(tabBar);
  else if(sub==='reports') renderTMSReports(tabBar,loads);
}

// ── DISPATCH BOARD (KANBAN) ────────────────────────────────────────
function renderTMSDispatch(tabBar,kpis,loads){
  const cols=TMS_STATUSES.map(s=>{
    const colLoads=loads.filter(l=>l.status===s);
    const cards=colLoads.length?colLoads.map(l=>{
      const next=nextTMSStatus(s);
      const sIdx=TMS_STATUSES.indexOf(s);const prev=sIdx>0?TMS_STATUSES[sIdx-1]:null;
      const meta=l.tmsMeta||{};
      const hasCInv=!!getInvoice(l.id);const hasCarrI=!!getCarrierInvoice(l.id);
    return`<div style="background:#fff;border:1px solid var(--gray-100);border-left:3px solid ${tmsStatusColor(l.status)};border-radius:0 10px 10px 0;padding:12px;margin-bottom:8px;box-shadow:0 1px 4px rgba(0,0,0,.06);cursor:pointer" onclick="openTMSLoadDetail('${l.id}')">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
          <span style="font-size:10px;font-weight:700;background:${tmsStatusColor(s)}18;color:${tmsStatusColor(s)};padding:2px 8px;border-radius:99px">${l.fqMode}</span>
          <span style="font-size:10px;color:var(--gray-400)">${l.date}</span>
        </div>
        <div style="font-size:13px;font-weight:700;color:var(--navy);margin-bottom:2px">${l.customer||'—'}</div>
        <div style="font-size:11px;color:var(--gray-500);margin-bottom:6px">${l.pickupZip||'—'} → ${l.deliveryZip||'—'}</div>
        <div style="font-size:11px;color:var(--gray-600);margin-bottom:8px">
          <span style="font-weight:600">${l.carrier||'Unassigned'}</span>
          ${l.weight?` · ${Number(l.weight).toLocaleString()} lbs`:''}
          ${l.customerRate?` · <span style="color:var(--steel);font-weight:700">${fmtD(l.customerRate)}</span>`:''}
        </div>
        ${meta.bookingNum?`<div style="font-size:10px;color:var(--steel);font-weight:700;margin-bottom:2px">${meta.bookingNum}</div>`:''}
        ${meta.arrivalDate?`<div style="margin-bottom:6px">${(()=>{
          const arr=new Date(meta.arrivalDate);const now=new Date();
          const freeDays=parseInt(meta.freeDays||5);
          const lastFreeDay=new Date(arr);lastFreeDay.setDate(lastFreeDay.getDate()+freeDays);
          const daysLeft=Math.ceil((lastFreeDay-now)/(1000*60*60*24));
          const col=daysLeft<=1?'#dc2626':daysLeft<=2?'#d97706':'#059669';
          const bg=daysLeft<=1?'#fee2e2':daysLeft<=2?'#fef3c7':'#d1fae5';
          return `<span style="background:${bg};color:${col};border-radius:7px;padding:3px 8px;font-size:10px;font-weight:700">📅 ${daysLeft>0?daysLeft+' free days left':'⚠ Free days expired'}</span>`;
        })()}</div>`:''}        ${(()=>{
  const _bd=getBolUpload(s.id);
  const _num=meta.bolNum?`<div style="font-size:10px;color:var(--gray-500);margin-bottom:4px">BOL: ${meta.bolNum}</div>`:'';
  const _uploaded=_bd?`<div style="margin-bottom:6px"><a href="${_bd.data}" download="${_bd.name}" style="display:inline-flex;align-items:center;gap:4px;background:#d1fae5;color:#065f46;border-radius:6px;padding:3px 8px;font-size:10px;font-weight:700;text-decoration:none">✅ BOL uploaded — tap to view</a></div>`:'';
  return _num+_uploaded;
})()}
        ${meta.pickupAppt?`<div style="font-size:10px;color:var(--amber);font-weight:600">PU: ${meta.pickupAppt}</div>`:''}
        <div style="display:flex;gap:4px;margin-bottom:4px">${hasCInv?'<span style="font-size:10px;background:#f0fdf4;color:#16a34a;padding:1px 6px;border-radius:99px;font-weight:700">🧾 ✓</span>':'<span style="font-size:10px;background:#f9fafb;color:#9ca3af;padding:1px 6px;border-radius:99px">🧾</span>'}${hasCarrI?'<span style="font-size:10px;background:#fffbeb;color:#d97706;padding:1px 6px;border-radius:99px;font-weight:700">🚛 ✓</span>':'<span style="font-size:10px;background:#f9fafb;color:#9ca3af;padding:1px 6px;border-radius:99px">🚛</span>'}</div>
        <div style="display:flex;gap:4px;margin-top:8px;flex-wrap:wrap">
          ${next?`<button onclick="advanceTMSLoad('${l.id}','${next}')" style="font-size:10px;font-weight:700;padding:4px 8px;border:none;border-radius:5px;background:${tmsStatusColor(next)};color:#fff;cursor:pointer;font-family:inherit">→ ${next}</button>`:''}
          ${prev?`<button onclick="advanceTMSLoad('${l.id}','${prev}')" style="font-size:10px;font-weight:600;padding:4px 8px;border:1px solid var(--gray-300);border-radius:5px;background:transparent;cursor:pointer;font-family:inherit;color:var(--gray-500)">← ${prev}</button>`:''}
          <button onclick="openTMSLoadDetail('${l.id}')" style="font-size:10px;font-weight:600;padding:4px 8px;border:1px solid var(--gray-200);border-radius:5px;background:transparent;cursor:pointer;font-family:inherit;color:var(--gray-600)">Details</button>
          <button onclick="openBOLBuilder('${l.id}')" style="font-size:10px;font-weight:600;padding:4px 8px;border:1px solid var(--gray-200);border-radius:5px;background:transparent;cursor:pointer;font-family:inherit;color:var(--gray-600)">BOL</button>
        </div>
      </div>`;}).join(''):`<div style="padding:20px;text-align:center;color:var(--gray-300);font-size:12px">No loads</div>`;
    return`<div style="flex:1;min-width:180px">
      <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:${tmsStatusColor(s)};margin-bottom:10px;padding-bottom:6px;border-bottom:2px solid ${tmsStatusColor(s)}">${s} (${colLoads.length})</div>
      ${cards}
    </div>`;}).join('');

  $('page').innerHTML=tabBar+kpis+(loads.length?
    `<div style="display:flex;gap:12px;overflow-x:auto;padding-bottom:16px">${cols}</div>`:
    `<div class="empty"><div class="empty-ico">🚚</div><p>No FTL/LTL loads yet — book a freight quote to start</p><button class="btn blue" onclick="goTo('freight','builder')">+ New freight quote</button></div>`);
}

// ── ALL LOADS TABLE ────────────────────────────────────────────────
function tmsInvOpen(id){openInvoiceBuilder('freight',id);}
function tmsGoFreight(){goTo('freight','builder');}
function tmsFilter(s){S.tmsTab='loads';S.tmsLoadsFilt=s||'all';renderTMS();}
function tmsGo(tab){S.tmsTab=tab;renderTMS();}
function renderTMSBolDocs(tabBar,loads){renderTMSBol(tabBar,loads);}
function buildTMSLoadRow(l){
  const id=l.id,meta=getTMSMeta(id);
  const p=getShipmentProfit(l,'freight');
  const hasCInv=!!getInvoice(id),hasCarrI=!!getCarrierInvoice(id);
  const sIdx=TMS_STATUSES.indexOf(l.status);
  const prev=sIdx>0?TMS_STATUSES[sIdx-1]:null;
  const next=nextTMSStatus(l.status);
  const pc=p.isActual?'var(--green)':p.margin>=0.08?'var(--amber)':'var(--red)';
  const sc=tmsStatusColor(l.status);
  const bk=meta.bookingNum?'<div style="font-size:10px;font-weight:700;color:var(--steel)">'+escH(meta.bookingNum)+'</div>':'';
  const acts=[
    prev?'<button data-id="'+id+'" data-s="'+prev+'" onclick="event.stopPropagation();advanceTMSLoad(this.dataset.id,this.dataset.s)" class="tms-act-btn">← '+escH(prev)+'</button>':'',
    next?'<button data-id="'+id+'" data-s="'+next+'" onclick="event.stopPropagation();advanceTMSLoad(this.dataset.id,this.dataset.s)" class="tms-act-btn" style="background:'+tmsStatusColor(next)+';color:#fff;border-color:'+tmsStatusColor(next)+'">→ '+escH(next)+'</button>':'',
    '<button data-id="'+id+'" onclick="event.stopPropagation();tmsInvOpen(this.dataset.id)" class="tms-act-btn" style="border-color:'+(hasCInv?'#86efac':'var(--gray-200)')+';background:'+(hasCInv?'#f0fdf4':'transparent')+';color:'+(hasCInv?'#16a34a':'var(--gray-600)')+'">🧾 '+(hasCInv?'✓':'Invoice')+'</button>',
    '<button data-id="'+id+'" onclick="event.stopPropagation();openFqCarrierInvById(this.dataset.id)" class="tms-act-btn" style="border-color:'+(hasCarrI?'#fbbf24':'var(--gray-200)')+';background:'+(hasCarrI?'#fffbeb':'transparent')+';color:'+(hasCarrI?'#d97706':'var(--gray-600)')+'">🚛 '+(hasCarrI?'✓':'Carrier')+'</button>',
    '<button data-id="'+id+'" onclick="event.stopPropagation();deleteTMSLoad(this.dataset.id)" class="tms-act-btn" style="border-color:#fca5a5;color:#dc2626">🗑️</button>'
  ].join('');
  return '<tr class="tms-row" data-lid="'+id+'" onclick="openTMSLoadDetail(this.dataset.lid)" style="cursor:pointer;border-left:3px solid '+sc+'">'+
    '<td onclick="event.stopPropagation()"><div style="font-size:13px;font-weight:700;color:var(--navy)">'+escH(l.customer||'—')+'</div>'+bk+'</td>'+
    '<td><span style="font-size:11px;font-weight:700;padding:2px 8px;border-radius:99px;background:'+sc+'18;color:'+sc+'">'+escH(l.fqMode||'')+'</span></td>'+
    '<td class="muted" style="font-size:12px">'+escH((l.pickupZip||'—')+' → '+(l.deliveryZip||'—'))+'</td>'+
    '<td style="font-weight:600;color:var(--navy)">'+escH(l.carrier||'—')+'</td>'+
    '<td style="font-family:monospace;font-size:11px;color:var(--gray-500)">'+escH(meta.bolNum||'—')+'</td>'+
    '<td class="money" style="color:var(--steel);font-weight:700">'+fmtD(l.customerRate||0)+'</td>'+
    '<td><span style="font-weight:700;color:'+pc+'">+'+fmtD(p.profit)+'</span> '+profitBadge(p.isActual)+'</td>'+
    '<td><span style="font-size:11px;font-weight:700;padding:2px 8px;border-radius:99px;background:'+sc+'18;color:'+sc+'">'+escH(l.status)+'</span></td>'+
    '<td onclick="event.stopPropagation()" style="min-width:280px"><div style="display:flex;gap:4px;flex-wrap:wrap">'+acts+'</div></td>'+
    '</tr>';
}

function escH(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}

function renderTMSLoads(tabBar,kpis,loads){
  if(!loads.length){
    $('page').innerHTML=tabBar+'<div class="empty"><div class="empty-ico">🚚</div><p>No FTL/LTL loads yet — book a freight quote to start</p><button class="btn blue" onclick="tmsGoFreight()">+ New freight quote</button></div>';
    return;
  }
  const lSrch=(S.tmsLoadsSearch||'').toLowerCase();
  const lFilt=S.tmsLoadsFilt||'all';
  const sorted=loads.slice().sort((a,b)=>b.date.localeCompare(a.date));
  const filtLoads=sorted.filter(l=>{
    if(lFilt!=='all'&&l.status!==lFilt) return false;
    if(!lSrch) return true;
    const m=getTMSMeta(l.id);
    return (l.customer||'').toLowerCase().includes(lSrch)||(m.bookingNum||'').toLowerCase().includes(lSrch)||(l.carrier||'').toLowerCase().includes(lSrch)||(l.pickupZip||'').includes(lSrch)||(l.deliveryZip||'').includes(lSrch)||(m.bolNum||'').toLowerCase().includes(lSrch);
  });
  const filterBar='<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:14px">'+
    '<div style="display:flex;gap:4px;flex-wrap:wrap;flex:1">'+
    ['all',...TMS_STATUSES].map(s=>{
      const cnt=s==='all'?loads.length:loads.filter(l=>l.status===s).length;
      const active=lFilt===s;
      return '<button data-sf="'+s+'" onclick="S.tmsLoadsFilt=this.dataset.sf;renderTMS()" style="padding:4px 12px;border-radius:99px;border:1.5px solid '+(s==='all'?'#1a2e4a':tmsStatusColor(s))+';font-size:11px;font-weight:700;cursor:pointer;font-family:inherit;background:'+(active?(s==='all'?'#1a2e4a':tmsStatusColor(s)):'transparent')+';color:'+(active?'#fff':(s==='all'?'#1a2e4a':tmsStatusColor(s)))+'">'+( s==='all'?'All':s)+' '+cnt+'</button>';
    }).join('')+
    '</div>'+
    '<div style="position:relative;min-width:220px"><span style="position:absolute;left:10px;top:50%;transform:translateY(-50%)">🔍</span>'+
    '<input type="text" placeholder="Customer, booking#, carrier, ZIP…" value="'+(S.tmsLoadsSearch||'')+'" oninput=\"tmsSearch(this.value)\" style="padding:7px 12px 7px 32px;border-radius:99px;border:1.5px solid var(--gray-200);font-size:12px;width:100%;box-sizing:border-box"></div>'+
    '<button onclick="exportTMSLoads()" style="padding:7px 14px;border:1px solid var(--gray-200);border-radius:var(--radius);background:transparent;font-size:12px;cursor:pointer;font-family:inherit;color:var(--gray-600)">📥 CSV</button>'+
    '<button onclick="openBulkAdvance()" style="padding:7px 14px;border:1px solid var(--steel);border-radius:var(--radius);background:transparent;font-size:12px;cursor:pointer;font-family:inherit;color:var(--steel)">☑️ Bulk advance</button>'+
    '<button onclick="openLoadMerge()" style="padding:7px 14px;border:1px solid var(--gray-200);border-radius:var(--radius);background:transparent;font-size:12px;cursor:pointer;font-family:inherit;color:var(--gray-600)">🔀 Merge</button>'+
    '<button onclick="window.print()" style="padding:7px 14px;border:1px solid var(--gray-200);border-radius:var(--radius);background:transparent;font-size:12px;cursor:pointer;font-family:inherit;color:var(--gray-600)">🖨️ Print</button></div>';

  const tableHTML='<div class="tbl-wrap"><table><thead><tr>'+
    '<th>Customer / BK#</th><th>Mode</th><th>Lane</th><th>Carrier</th><th>BOL #</th><th>Revenue</th><th>Profit</th><th>Status</th><th>Actions</th>'+
    '</tr></thead><tbody>'+filtLoads.map(buildTMSLoadRow).join('')+'</tbody></table></div>';

  const emptyHTML='<div class="empty"><div class="empty-ico">'+(lSrch||lFilt!=='all'?'🔍':'🚚')+'</div><p>'+(lSrch||lFilt!=='all'?'No loads match — try a different filter':'No loads yet')+'</p></div>';
  $('page').innerHTML=tabBar+kpis+filterBar+(filtLoads.length?tableHTML:emptyHTML);
}


function deleteTMSLoad(id){
  if(!confirm('Remove this load from TMS? This will revert it to Quoted status.')) return;
  const idx=(window._fqHistory||[]).findIndex(q=>q.id===id);
  if(idx<0) return;
  window._fqHistory[idx].status='Quoted';
  try{localStorage.setItem('fq_history',JSON.stringify(window._fqHistory));dbUpdateFqStatus(id,'Quoted');}catch(e){}
  showToast('Load removed from TMS','info',2500);
  renderTMS();
}

// ── ADVANCE LOAD STATUS ────────────────────────────────────────────
async function advanceTMSLoad(id,newStatus){
  const idx=(window._fqHistory||[]).findIndex(q=>q.id===id);
  if(idx<0) return;
  const prevStatus=window._fqHistory[idx].status;
  window._fqHistory[idx].status=newStatus;
  try{localStorage.setItem('fq_history',JSON.stringify(window._fqHistory));}catch(e){}
  // ★ FIX: Save to Supabase so refresh doesn't revert
  try{await dbUpdateFqStatus(id,newStatus);}catch(e){console.warn('TMS status sync:',e.message);}
  saveTMSMeta(id,{[newStatus.toLowerCase().replace(/ /g,'_')+'_at']:new Date().toISOString()});
  incrementQuestMetric(newStatus==='Delivered'?'delivered_today':'bookings_today');
  // Undo toast
  const container=$('toast-container')||document.createElement('div');
  if(!$('toast-container')){container.id='toast-container';container.style.cssText='position:fixed;bottom:24px;right:24px;z-index:99999;display:flex;flex-direction:column;gap:8px;pointer-events:none';document.body.appendChild(container);}
  const toast=document.createElement('div');
  toast.style.cssText='background:#1a2e4a;color:#fff;padding:12px 18px;border-radius:10px;font-size:13px;font-weight:600;font-family:inherit;box-shadow:0 4px 16px rgba(0,0,0,.25);display:flex;align-items:center;gap:12px;pointer-events:all;min-width:260px';
  toast.innerHTML=`<span>→ <strong>${newStatus}</strong></span><button style="background:rgba(255,255,255,.2);border:none;color:#fff;padding:4px 12px;border-radius:6px;cursor:pointer;font-size:12px;font-weight:700;font-family:inherit;white-space:nowrap">↩ Undo</button>`;
  toast.querySelector('button').onclick=async()=>{
    toast.remove();
    const q=(window._fqHistory||[])[idx];
    if(q){
      q.status=prevStatus;
      try{localStorage.setItem('fq_history',JSON.stringify(window._fqHistory));}catch(e){}
      try{await dbUpdateFqStatus(id,prevStatus);}catch(e){}
    }
    showToast('↩ Reverted to '+prevStatus,'info',2000);
    renderTMS();
  };
  container.appendChild(toast);
  setTimeout(()=>toast.remove(),6000);
  renderTMS();
}

// ── BOL GENERATOR ─────────────────────────────────────────────────
function renderTMSBol(tabBar,loads){
  const bolLoads=loads.filter(l=>['Booked','Dispatched','In Transit'].includes(l.status));
  $('page').innerHTML=tabBar+`
  <div style="font-size:14px;font-weight:700;color:var(--navy);margin-bottom:14px">📄 Bill of Lading — generate for booked loads</div>
  <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px">
    ${bolLoads.length?bolLoads.map(l=>{const meta=getTMSMeta(l.id);return`
      <div class="card">
        <div style="font-size:13px;font-weight:700;color:var(--navy);margin-bottom:4px">${l.customer||'—'}</div>
        <div style="font-size:11px;color:var(--gray-500);margin-bottom:8px">${l.pickupZip||'—'} → ${l.deliveryZip||'—'} · ${l.fqMode} · ${l.carrier||'—'}</div>
        ${meta.bolNum?`<div style="font-size:11px;font-weight:700;color:var(--steel);margin-bottom:8px">BOL # ${meta.bolNum}</div>`:'<div style="font-size:11px;color:var(--gray-400);margin-bottom:8px">No BOL generated yet</div>'}
        <button onclick="openBOLBuilder('${l.id}')" class="btn blue" style="width:100%;font-size:12px">📄 ${meta.bolNum?'Edit':'Create'} BOL</button>
      </div>`;}).join(''):`<div style="grid-column:1/-1;padding:40px;text-align:center;color:var(--gray-400)">No booked loads needing BOL</div>`}
  </div>`;
}

// BOL Builder Modal
function openBOLBuilder(id){
  // Support FQ, TMS, drayage, and air loads
  let q = (window._fqHistory||[]).find(x=>x.id===id);
  if(!q){ const _aq=(window._aqHistory||[]).find(x=>x.id===id); if(_aq) q={id:_aq.id,customer:_aq.customer||'',pickupZip:_aq.originAirport||'',deliveryZip:_aq.destAirport||'',carrier:_aq.carrier||'',fqMode:'Air Freight',weight:_aq.weight||'',palletCount:_aq.pieces||'',commodity:_aq.commodity||''}; }
  if(!q){ const dq=(S.quotes||[]).find(x=>x.id===id); if(dq) q={id:dq.id,customer:dq.customer,pickupZip:dq.port||'',deliveryZip:dq.zip||'',carrier:dq.carrier||'',fqMode:'Drayage',weight:'',palletCount:'',commodity:dq.commodity||'',shiflRef:dq.shiflRef||''}; }
  if(!q){ const tmsLoads=JSON.parse(localStorage.getItem('tms_loads')||'[]'); const tl=tmsLoads.find(x=>x.id===id); if(tl) q={id:tl.id,customer:tl.customer||tl.shipper||'',pickupZip:tl.pickupZip||'',deliveryZip:tl.deliveryZip||'',carrier:tl.carrier||'',fqMode:tl.mode||'Freight',weight:tl.weight||'',palletCount:tl.pallets||'',commodity:tl.commodity||''}; }
  if(!q){ showToast('Load not found — entering manual mode','warn'); q={id,customer:'',pickupZip:'',deliveryZip:'',carrier:'',fqMode:'',weight:'',palletCount:'',commodity:'',shiflRef:''}; }

  const meta=getTMSMeta(id);
  const bolNum=meta.bolNum||('BOL-'+Date.now().toString().slice(-6));
  const uploaded=getBolUpload(id); // existing uploaded BOL if any

  $('modal-root').innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()">
  <div class="modal" style="max-width:640px;max-height:92vh;overflow-y:auto">
    <div class="modal-title" style="display:flex;align-items:center;justify-content:space-between;padding:14px 18px;border-bottom:1px solid var(--gray-100)">
      <span>📄 Bill of Lading — ${q.customer||'—'}</span>
      <button onclick="closeModal()" style="background:none;border:none;font-size:20px;cursor:pointer;color:var(--gray-400);line-height:1">×</button>
    </div>

    <!-- Upload section — always visible at top -->
    <div style="padding:14px 18px;background:${uploaded?'#f0fdf4':'#f8fafc'};border-bottom:1px solid var(--gray-100)">
      <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--gray-400);margin-bottom:8px">Upload your own BOL</div>
      ${uploaded
        ? `<div style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:#fff;border:1px solid #86efac;border-radius:8px">
            <span style="font-size:20px">📎</span>
            <div style="flex:1;min-width:0">
              <div style="font-size:13px;font-weight:600;color:#15803d;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${uploaded.name}</div>
              <div style="font-size:11px;color:var(--gray-400)">Uploaded ${new Date(uploaded.uploaded).toLocaleDateString()}</div>
            </div>
            <button onclick="viewUploadedBOL('${id}')" style="padding:6px 12px;background:#16a34a;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:12px;font-weight:600;font-family:inherit">👁 View</button>
            <button onclick="uploadBOLFromModal('${id}')" style="padding:6px 12px;background:#fff;color:var(--gray-600);border:1px solid var(--gray-200);border-radius:6px;cursor:pointer;font-size:12px;font-family:inherit">Replace</button>
            <button onclick="deleteUploadedBOL('${id}')" style="padding:6px 10px;background:#fff;color:#dc2626;border:1px solid #fecaca;border-radius:6px;cursor:pointer;font-size:12px;font-family:inherit">🗑️</button>
          </div>`
        : `<div style="display:flex;align-items:center;gap:10px">
            <button onclick="uploadBOLFromModal('${id}')" style="padding:8px 16px;background:#fff;border:1.5px dashed var(--gray-300);border-radius:8px;cursor:pointer;font-size:13px;font-family:inherit;color:var(--gray-600);display:flex;align-items:center;gap:7px">
              📎 Upload BOL (PDF, JPG, PNG, DOC)
            </button>
            <span style="font-size:12px;color:var(--gray-400)">or create one below</span>
          </div>`}
    </div>

    <!-- BOL form -->
    <div style="padding:16px 18px">
      <div style="font-size:12px;font-weight:600;color:var(--gray-500);margin-bottom:14px">Or fill in details to generate a BOL</div>
      <div class="g2" style="margin-bottom:12px">
        <div class="field"><label>BOL Number</label><input type="text" id="bol-num" value="${bolNum}"></div>
        <div class="field"><label>Ship date</label><input type="date" id="bol-date" value="${localDateStr()}"></div>
      </div>
      <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--gray-400);margin:10px 0 6px">Shipper</div>
      <div class="g2" style="margin-bottom:12px">
        <div class="field"><label>Company name</label><input type="text" id="bol-ship-name" value="${meta.shipperName||''}" placeholder="Shipper name"></div>
        <div class="field"><label>Address</label><input type="text" id="bol-ship-addr" value="${meta.shipperAddr||''}" placeholder="123 Main St, City, State ZIP"></div>
      </div>
      <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--gray-400);margin:10px 0 6px">Consignee</div>
      <div class="g2" style="margin-bottom:12px">
        <div class="field"><label>Company name</label><input type="text" id="bol-cons-name" value="${meta.consigneeName||q.customer||''}" placeholder="Consignee name"></div>
        <div class="field"><label>Address</label><input type="text" id="bol-cons-addr" value="${meta.consigneeAddr||''}" placeholder="456 Oak Ave, City, State ZIP"></div>
      </div>
      <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--gray-400);margin:10px 0 6px">Carrier</div>
      <div class="g2" style="margin-bottom:12px">
        <div class="field"><label>Carrier name</label><input type="text" id="bol-carrier" value="${meta.carrier||q.carrier||''}"></div>
        <div class="field"><label>Pro / Tracking #</label><input type="text" id="bol-pro" value="${meta.proNum||''}" placeholder="PRO number"></div>
      </div>
      <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--gray-400);margin:10px 0 6px">Freight details</div>
      <div class="g3" style="margin-bottom:12px">
        <div class="field"><label>Pieces</label><input type="number" id="bol-pieces" value="${meta.pieces||q.palletCount||''}"></div>
        <div class="field"><label>Weight (lbs)</label><input type="number" id="bol-weight" value="${meta.weight||q.weight||''}"></div>
        <div class="field"><label>Freight class</label><input type="text" id="bol-class" value="${meta.freightClass||''}" placeholder="e.g. 70"></div>
      </div>
      <div class="g2" style="margin-bottom:12px">
        <div class="field"><label>Commodity</label><input type="text" id="bol-commodity" value="${meta.commodity||q.commodity||''}" placeholder="General freight, no hazmat"></div>
        <div class="field"><label>NMFC #</label><input type="text" id="bol-nmfc" value="${meta.nmfc||''}" placeholder="Optional"></div>
      </div>
      <div class="field" style="margin-bottom:8px"><label>Special instructions</label><textarea id="bol-notes" rows="2" style="width:100%;box-sizing:border-box;resize:vertical;border:1px solid var(--gray-200);border-radius:var(--radius);padding:7px 10px;font-family:inherit;font-size:13px" placeholder="Liftgate required, appointment needed...">${meta.bolNotes||''}</textarea></div>
    </div>

    <div class="modal-foot" style="padding:12px 18px;border-top:1px solid var(--gray-100);display:flex;gap:8px;justify-content:flex-end">
      <button class="btn" onclick="closeModal()">Cancel</button>
      <button class="btn" onclick="saveBOL('${id}');showToast('BOL details saved','success',2000)">💾 Save details</button>
      <button class="btn blue" onclick="saveBOL('${id}');generateBOLPDF('${id}')">📄 Generate & download PDF</button>
    </div>
  </div></div>`;
}

// Upload BOL from within the modal
function uploadBOLFromModal(id){
  var input=document.createElement('input');
  input.type='file';
  input.accept='.pdf,.jpg,.jpeg,.png,.doc,.docx';
  input.onchange=function(){
    var file=input.files[0];
    if(!file) return;
    var reader=new FileReader();
    reader.onload=function(e){
      var key='bol_upload_'+id;
      var data={name:file.name,data:e.target.result,type:file.type,uploaded:new Date().toISOString()};
      localStorage.setItem(key,JSON.stringify(data));
      try{saveTMSMeta(id,{hasBolUpload:true,bolUploadName:file.name,bolUploadDate:new Date().toISOString()});}catch(ex){}
      showToast('✅ BOL uploaded: '+file.name,'success');
      openBOLBuilder(id); // refresh modal to show uploaded state
    };
    reader.readAsDataURL(file);
  };
  input.click();
}

// View uploaded BOL in new tab
function viewUploadedBOL(id){
  var d=getBolUpload(id);
  if(!d){showToast('No uploaded BOL found','warn');return;}
  var win=window.open();
  if(!win){showToast('Pop-up blocked — allow pop-ups to view BOL','warn');return;}
  if(d.type&&d.type.includes('pdf')){
    win.document.write('<html><body style="margin:0"><embed src="'+d.data+'" width="100%" height="100%" type="application/pdf"></body></html>');
  } else {
    win.document.write('<html><body style="margin:0;background:#111;display:flex;align-items:center;justify-content:center;min-height:100vh"><img src="'+d.data+'" style="max-width:100%;max-height:100vh;object-fit:contain"></body></html>');
  }
  win.document.title=d.name||'BOL';
}

// Delete uploaded BOL
function deleteUploadedBOL(id){
  if(!confirm('Remove uploaded BOL?')) return;
  localStorage.removeItem('bol_upload_'+id);
  localStorage.removeItem('bol_upload_tms_'+id);
  try{saveTMSMeta(id,{hasBolUpload:false,bolUploadName:'',bolUploadDate:''});}catch(e){}
  showToast('BOL removed','success',2000);
  openBOLBuilder(id);
}

function saveBOL(id){
  saveTMSMeta(id,{
    bolNum:($('bol-num')||{}).value?.trim()||'',
    bolDate:($('bol-date')||{}).value||'',
    shipperName:($('bol-ship-name')||{}).value?.trim()||'',
    shipperAddr:($('bol-ship-addr')||{}).value?.trim()||'',
    consigneeName:($('bol-cons-name')||{}).value?.trim()||'',
    consigneeAddr:($('bol-cons-addr')||{}).value?.trim()||'',
    carrier:($('bol-carrier')||{}).value?.trim()||'',
    proNum:($('bol-pro')||{}).value?.trim()||'',
    pieces:($('bol-pieces')||{}).value||'',
    weight:($('bol-weight')||{}).value||'',
    freightClass:($('bol-class')||{}).value?.trim()||'',
    commodity:($('bol-commodity')||{}).value?.trim()||'',
    nmfc:($('bol-nmfc')||{}).value?.trim()||'',
    bolNotes:($('bol-notes')||{}).value?.trim()||''
  });
  showToast('BOL saved','success',2000);
}

async function generateBOLPDF(id){
  if(!await loadJsPDF()) return;
  const q=(window._fqHistory||[]).find(q=>q.id===id);
  const meta=getTMSMeta(id);
  if(!q||!meta) return;
  try{
    const{jsPDF}=window.jspdf;
    const doc=new jsPDF({unit:'mm',format:'a4'});
    const W=210,M=14;
    const navy=[26,46,74];
    doc.setFillColor(...navy);doc.rect(0,0,W,28,'F');
    doc.setTextColor(255,255,255);doc.setFont('helvetica','bold');doc.setFontSize(18);
    doc.text('BILL OF LADING',M,12);
    doc.setFontSize(10);doc.setFont('helvetica','normal');
    doc.text('Non-Negotiable',M,20);
    doc.text('BOL #: '+(meta.bolNum||'—'),W-M,12,{align:'right'});
    doc.text('Date: '+(meta.bolDate||localDateStr()),W-M,20,{align:'right'});
    doc.setTextColor(0,0,0);
    let y=36;
    const sec=(title)=>{doc.setFillColor(240,244,248);doc.rect(M,y-4,W-M*2,6,'F');doc.setFont('helvetica','bold');doc.setFontSize(9);doc.setTextColor(...navy);doc.text(title,M+2,y);doc.setTextColor(0,0,0);y+=8;};
    const row=(label,val)=>{doc.setFont('helvetica','bold');doc.setFontSize(9);doc.text(label+':',M,y);doc.setFont('helvetica','normal');doc.text(val||'—',M+40,y);y+=6;};
    sec('SHIPPER');row('Company',meta.shipperName);row('Address',meta.shipperAddr);y+=2;
    sec('CONSIGNEE');row('Company',meta.consigneeName||q.customer);row('Address',meta.consigneeAddr);y+=2;
    sec('CARRIER INFORMATION');row('Carrier',meta.carrier||q.carrier);row('PRO / Tracking #',meta.proNum);y+=2;
    sec('FREIGHT DETAILS');row('Pieces',meta.pieces);row('Weight',meta.weight?(meta.weight+' lbs'):'—');row('Freight class',meta.freightClass);row('Commodity',meta.commodity);row('NMFC #',meta.nmfc);y+=2;
    if(meta.bolNotes){sec('SPECIAL INSTRUCTIONS');doc.setFont('helvetica','normal');doc.setFontSize(9);const lines=doc.splitTextToSize(meta.bolNotes,W-M*2);doc.text(lines,M,y);y+=lines.length*5+4;}
    y+=8;doc.setDrawColor(...navy);doc.setLineWidth(0.5);doc.line(M,y,90,y);doc.line(120,y,W-M,y);
    doc.setFontSize(8);doc.text('Shipper signature',M,y+4);doc.text('Carrier signature',120,y+4);
    doc.setFontSize(7);doc.setTextColor(150,150,150);doc.text('Generated by Shifl Logistics TMS · This is a non-negotiable bill of lading',W/2,285,{align:'center'});
    doc.save('BOL_'+(meta.bolNum||id)+'_'+q.customer?.replace(/\s+/g,'_')+'.pdf');
    closeModal();showToast('BOL PDF downloaded','success',2000);
  }catch(e){showToast('PDF error: '+e.message,'error');}
}

// ── CARRIER SCORECARDS ─────────────────────────────────────────────
function renderTMSScorecard(tabBar,loads){
  const carriers={};
  loads.forEach(l=>{
    const c=l.carrier||'Unknown';
    if(!carriers[c]) carriers[c]={name:c,total:0,delivered:0,onTime:0,revenue:0,profit:0};
    carriers[c].total++;
    if(['Delivered','Invoiced','Paid'].includes(l.status)){carriers[c].delivered++;carriers[c].onTime++;}
    carriers[c].revenue+=(l.customerRate||0);
    carriers[c].profit+=getShipmentProfit(l,'freight').profit;
  });
  const sorted=Object.values(carriers).sort((a,b)=>b.total-a.total);
  $('page').innerHTML=tabBar+`
  <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px">
    ${sorted.length?sorted.map(c=>{
      const onTimeRate=c.delivered>0?Math.round(c.onTime/c.delivered*100):0;
      const color=onTimeRate>=90?'var(--green)':onTimeRate>=70?'var(--amber)':'var(--red)';
      return`<div class="card">
        <div style="font-size:15px;font-weight:800;color:var(--navy);margin-bottom:4px">${c.name}</div>
        <div style="display:flex;justify-content:space-between;margin-bottom:14px">
          <div style="text-align:center"><div style="font-size:22px;font-weight:900;color:${color}">${onTimeRate}%</div><div style="font-size:10px;color:var(--gray-400)">On-time</div></div>
          <div style="text-align:center"><div style="font-size:22px;font-weight:900;color:var(--navy)">${c.total}</div><div style="font-size:10px;color:var(--gray-400)">Loads</div></div>
          <div style="text-align:center"><div style="font-size:18px;font-weight:800;color:var(--steel)">${fmtD(c.revenue)}</div><div style="font-size:10px;color:var(--gray-400)">Revenue</div></div>
        </div>
        <div style="height:6px;background:var(--gray-100);border-radius:3px;overflow:hidden"><div style="height:6px;width:${onTimeRate}%;background:${color};border-radius:3px"></div></div>
        <div style="font-size:11px;color:var(--gray-500);margin-top:6px">${c.delivered} delivered · avg margin ${c.revenue>0?pct(c.profit/c.revenue):'—'}</div>
      </div>`;}).join(''):`<div style="padding:40px;text-align:center;color:var(--gray-400)">No carrier data yet</div>`}
  </div>`;
}

// ── TOOLS — NMFC + DENSITY CALCULATOR ─────────────────────────────
function renderTMSTools(tabBar){
  $('page').innerHTML=tabBar+`
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
    <!-- Density/Class Calculator -->
    <div class="card">
      <div style="font-size:15px;font-weight:800;color:var(--navy);margin-bottom:14px">⚖️ Freight class calculator</div>
      <div class="field"><label>Length (in)</label><input type="number" id="fc-len" placeholder="0" oninput="calcFreightClass()" min="0"></div>
      <div class="field"><label>Width (in)</label><input type="number" id="fc-wid" placeholder="0" oninput="calcFreightClass()" min="0"></div>
      <div class="field"><label>Height (in)</label><input type="number" id="fc-hgt" placeholder="0" oninput="calcFreightClass()" min="0"></div>
      <div class="field"><label>Weight (lbs)</label><input type="number" id="fc-wgt" placeholder="0" oninput="calcFreightClass()" min="0"></div>
      <div id="fc-result" style="margin-top:12px;padding:14px;background:var(--blue-bg);border-radius:var(--radius);display:none">
        <div style="font-size:12px;color:var(--gray-500)">Density</div>
        <div id="fc-density" style="font-size:22px;font-weight:900;color:var(--navy)">—</div>
        <div style="font-size:12px;color:var(--gray-500);margin-top:6px">Freight class</div>
        <div id="fc-class" style="font-size:28px;font-weight:900;color:var(--steel)">—</div>
        <div id="fc-note" style="font-size:11px;color:var(--amber);margin-top:4px"></div>
      </div>
    </div>
    <!-- NMFC Lookup -->
    <div class="card">
      <div style="font-size:15px;font-weight:800;color:var(--navy);margin-bottom:14px">🔍 NMFC class reference</div>
      <div class="field"><label>Search commodity</label><input type="text" id="nmfc-search" placeholder="e.g. furniture, electronics, food..." oninput="searchNMFC(this.value)"></div>
      <div id="nmfc-results" style="margin-top:10px;max-height:280px;overflow-y:auto"></div>
    </div>
  </div>`;
}

function calcFreightClass(){
  const l=parseFloat($('fc-len')?.value)||0;
  const w=parseFloat($('fc-wid')?.value)||0;
  const h=parseFloat($('fc-hgt')?.value)||0;
  const wgt=parseFloat($('fc-wgt')?.value)||0;
  if(!l||!w||!h||!wgt) return;
  const cubicFt=(l*w*h)/1728;
  const density=wgt/cubicFt;
  const cls=densityToClass(density);
  const el=$('fc-result');if(el) el.style.display='block';
  const de=$('fc-density');if(de) de.textContent=density.toFixed(2)+' lbs/ft³';
  const ce=$('fc-class');if(ce) ce.textContent='Class '+cls;
  const ne=$('fc-note');if(ne) ne.textContent='Verify with carrier tariff — commodity type may affect class';
}

function densityToClass(d){
  if(d>=50) return 50;if(d>=35) return 55;if(d>=30) return 60;if(d>=22.5) return 65;
  if(d>=15) return 70;if(d>=13.5) return 77.5;if(d>=12) return 85;if(d>=10.5) return 92.5;
  if(d>=9) return 100;if(d>=8) return 110;if(d>=7) return 125;if(d>=6) return 150;
  if(d>=5) return 175;if(d>=4) return 200;if(d>=3) return 250;if(d>=2) return 300;
  if(d>=1) return 400; return 500;
}

const NMFC_TABLE=[
  {commodity:'Furniture',class:'85–125',nmfc:'40600',note:'Depends on material and packing'},
  {commodity:'Electronics / computers',class:'70–100',nmfc:'34560',note:'Properly packed in original boxes'},
  {commodity:'Clothing / apparel',class:'100–150',nmfc:'22500',note:'Boxed or hanging garments'},
  {commodity:'Auto parts',class:'55–100',nmfc:'10000',note:'Varies by part type'},
  {commodity:'Beverages / liquids',class:'60–85',nmfc:'16580',note:'Canned or bottled'},
  {commodity:'Paper / printed matter',class:'50–100',nmfc:'48440',note:'Depends on density'},
  {commodity:'Food / dry goods',class:'65–85',nmfc:'28520',note:'Canned goods = class 60'},
  {commodity:'Machinery / equipment',class:'55–85',nmfc:'46000',note:'Varies by weight'},
  {commodity:'Building materials',class:'50–70',nmfc:'17440',note:'Lumber, brick, stone'},
  {commodity:'Toys',class:'85–125',nmfc:'54730',note:'Depends on packing'},
  {commodity:'Pharmaceuticals',class:'85–150',nmfc:'43900',note:'Boxed medications'},
  {commodity:'Metal / steel',class:'50–70',nmfc:'42260',note:'Depends on form'},
  {commodity:'Plastic products',class:'85–150',nmfc:'49640',note:'Molded or sheet'},
  {commodity:'Chemicals',class:'60–100',nmfc:'22000',note:'Non-hazardous only'},
  {commodity:'Sporting goods',class:'100–150',nmfc:'51500',note:'Varies by item'},
];
function searchNMFC(q){
  const el=$('nmfc-results');if(!el) return;
  if(!q.trim()){el.innerHTML='';return;}
  const results=NMFC_TABLE.filter(r=>r.commodity.toLowerCase().includes(q.toLowerCase()));
  el.innerHTML=results.length?results.map(r=>`
    <div style="padding:10px;border-bottom:1px solid var(--gray-100)">
      <div style="font-size:13px;font-weight:700;color:var(--navy)">${r.commodity}</div>
      <div style="display:flex;gap:16px;margin-top:4px">
        <span style="font-size:12px;color:var(--gray-500)">Class: <strong style="color:var(--steel)">${r.class}</strong></span>
        <span style="font-size:12px;color:var(--gray-500)">NMFC: <strong>${r.nmfc}</strong></span>
      </div>
      <div style="font-size:11px;color:var(--amber);margin-top:2px">⚠ ${r.note}</div>
    </div>`).join(''):'<div style="padding:20px;text-align:center;color:var(--gray-400);font-size:13px">No matches — consult your carrier tariff</div>';
}

// ── TMS REPORTS ────────────────────────────────────────────────────
function renderTMSReports(tabBar,loads){
  const today=localDateStr();
  const AR_30=loads.filter(l=>l.status==='Invoiced'&&l.date>=new Date(Date.now()-30*864e5).toISOString().slice(0,10));
  const AR_60=loads.filter(l=>l.status==='Invoiced'&&l.date<new Date(Date.now()-30*864e5).toISOString().slice(0,10)&&l.date>=new Date(Date.now()-60*864e5).toISOString().slice(0,10));
  const AR_90=loads.filter(l=>l.status==='Invoiced'&&l.date<new Date(Date.now()-60*864e5).toISOString().slice(0,10));
  const totalRev=loads.reduce((s,l)=>s+(l.customerRate||0),0);
  const totalProfit=loads.reduce((s,l)=>s+getShipmentProfit(l,'freight').profit,0);
  const laneMap={};loads.forEach(l=>{const k=`${l.pickupZip||'?'} → ${l.deliveryZip||'?'}`;if(!laneMap[k]) laneMap[k]={loads:0,revenue:0,profit:0};laneMap[k].loads++;laneMap[k].revenue+=(l.customerRate||0);laneMap[k].profit+=getShipmentProfit(l,'freight').profit;});
  const topLanes=Object.entries(laneMap).sort((a,b)=>b[1].revenue-a[1].revenue).slice(0,8);
  $('page').innerHTML=tabBar+`
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px">
    <!-- AR Aging -->
    <div class="card">
      <div style="font-size:14px;font-weight:800;color:var(--navy);margin-bottom:14px">⏳ AR Aging</div>
      ${[{label:'0–30 days',loads:AR_30,color:'var(--green)'},{label:'31–60 days',loads:AR_60,color:'var(--amber)'},{label:'61+ days',loads:AR_90,color:'var(--red)'}].map(b=>`
        <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--gray-100)">
          <div><div style="font-size:13px;font-weight:600;color:${b.color}">${b.label}</div><div style="font-size:11px;color:var(--gray-400)">${b.loads.length} invoices outstanding</div></div>
          <div style="font-size:15px;font-weight:800;color:${b.color}">${fmtD(b.loads.reduce((s,l)=>s+(l.customerRate||0),0))}</div>
        </div>`).join('')}
    </div>
    <!-- P&L Summary -->
    <div class="card">
      <div style="font-size:14px;font-weight:800;color:var(--navy);margin-bottom:14px">💰 P&L Summary</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <div style="text-align:center;padding:12px;background:var(--gray-50);border-radius:var(--radius)"><div style="font-size:11px;color:var(--gray-500)">Total loads</div><div style="font-size:24px;font-weight:900;color:var(--navy)">${loads.length}</div></div>
        <div style="text-align:center;padding:12px;background:var(--blue-bg);border-radius:var(--radius)"><div style="font-size:11px;color:var(--gray-500)">Total revenue</div><div style="font-size:20px;font-weight:900;color:var(--steel)">${fmtD(totalRev)}</div></div>
        <div style="text-align:center;padding:12px;background:#f0fdf4;border-radius:var(--radius)"><div style="font-size:11px;color:var(--gray-500)">Net profit</div><div style="font-size:20px;font-weight:900;color:var(--green)">${fmtD(totalProfit)}</div></div>
        <div style="text-align:center;padding:12px;background:#faf5ff;border-radius:var(--radius)"><div style="font-size:11px;color:var(--gray-500)">Avg margin</div><div style="font-size:20px;font-weight:900;color:#7c3aed">${totalRev>0?pct(totalProfit/totalRev):'—'}</div></div>
      </div>
    </div>
  </div>
  <!-- Top lanes -->
  <div class="card">
    <div style="font-size:14px;font-weight:800;color:var(--navy);margin-bottom:14px">🗺️ Top lanes by revenue</div>
    ${topLanes.length?topLanes.map(([lane,d],i)=>`
      <div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--gray-100)">
        <div style="font-size:13px;font-weight:700;color:var(--gray-400);min-width:20px">#${i+1}</div>
        <div style="flex:1"><div style="font-size:13px;font-weight:700;color:var(--navy)">${lane}</div><div style="height:5px;background:var(--gray-100);border-radius:3px;margin-top:4px;overflow:hidden"><div style="height:5px;width:${Math.round(d.revenue/topLanes[0][1].revenue*100)}%;background:var(--steel);border-radius:3px"></div></div></div>
        <div style="text-align:right"><div style="font-size:13px;font-weight:700;color:var(--steel)">${fmtD(d.revenue)}</div><div style="font-size:11px;color:var(--gray-400)">${d.loads} loads · ${pct(d.revenue>0?d.profit/d.revenue:0)} margin</div></div>
      </div>`).join(''):'<div style="text-align:center;color:var(--gray-400);padding:20px">No lane data yet</div>'}
  </div>`;
}

// Load detail modal
function openTMSLoadDetail(id){
  const q=(window._fqHistory||[]).find(q=>q.id===id);
  if(!q) return;
  const meta=getTMSMeta(id);
  const statusIdx=TMS_STATUSES.indexOf(q.status);
  const timeline=TMS_STATUSES.map((s,i)=>{
    const done=i<=statusIdx;
    const ts=meta[s.toLowerCase().replace(/ /g,'_')+'_at'];
    return`<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
      <div style="width:20px;height:20px;border-radius:50%;background:${done?tmsStatusColor(s):'var(--gray-100)'};display:flex;align-items:center;justify-content:center;font-size:11px;color:${done?'#fff':'var(--gray-300)'};flex-shrink:0">${done?'✓':'○'}</div>
      <div style="flex:1"><div style="font-size:12px;font-weight:${done?700:400};color:${done?'var(--navy)':'var(--gray-400)'}">${s}</div>${ts?`<div style="font-size:10px;color:var(--gray-400)">${new Date(ts).toLocaleString('en-US',{timeZone:'America/New_York',month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})}</div>`:''}</div>
    </div>`;}).join('');
  $('modal-root').innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()">
  <div class="modal" style="max-width:520px">
    <div class="modal-title">🚚 ${q.customer||'Load'} — ${q.fqMode}</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:16px">
      <div><div style="font-size:11px;color:var(--gray-400)">Lane</div><div style="font-size:13px;font-weight:700;color:var(--navy)">${q.pickupZip||'—'} → ${q.deliveryZip||'—'}</div></div>
      <div><div style="font-size:11px;color:var(--gray-400)">Carrier</div><div style="font-size:13px;font-weight:700;color:var(--navy)">${q.carrier||'—'}</div></div>
      <div><div style="font-size:11px;color:var(--gray-400)">Revenue</div><div style="font-size:13px;font-weight:700;color:var(--steel)">${fmtD(q.customerRate||0)}</div></div>
      <div><div style="font-size:11px;color:var(--gray-400)">BOL #</div><div style="font-size:13px;font-weight:700;color:var(--navy)">${meta.bolNum||'—'}</div></div>
    </div>
    <div style="font-size:12px;font-weight:700;color:var(--gray-500);margin-bottom:10px;text-transform:uppercase;letter-spacing:.05em">Status timeline</div>
    ${timeline}
    <div class="g2" style="margin-top:12px">
      <div class="field"><label>Pickup appointment</label><input type="datetime-local" id="tms-pu-appt" value="${meta.pickupAppt||''}" onchange="saveTMSMeta('${id}',{pickupAppt:this.value});showSavedIndicator()"></div>
      <div class="field"><label>Delivery appointment</label><input type="datetime-local" id="tms-del-appt" value="${meta.deliveryAppt||''}" onchange="saveTMSMeta('${id}',{deliveryAppt:this.value});showSavedIndicator()"></div>
    </div>
    <div class="g2">
      <div class="field"><label>ETA (estimated delivery)</label><input type="date" id="tms-eta" value="${meta.eta||''}" onchange="saveTMSMeta('${id}',{eta:this.value});showSavedIndicator()"></div>
      <div class="field"><label>PRO / Tracking #</label><input type="text" id="tms-pro" value="${meta.proNum||''}" placeholder="Carrier PRO or tracking #" onchange="saveTMSMeta('${id}',{proNum:this.value});showSavedIndicator()"></div>
    </div>
    <div class="field"><label>Load notes <span style="font-size:10px;color:var(--gray-400)">(visible to all team)</span></label>
      <textarea id="tms-notes" rows="3" style="width:100%;box-sizing:border-box;resize:vertical;font-size:13px" placeholder="Special instructions, exceptions, updates..." onchange="saveTMSMeta('${id}',{notes:this.value});showSavedIndicator()">${meta.notes||''}</textarea>
    </div>
    <div class="modal-foot">
      <button class="btn" onclick="closeModal()">Close</button>
      <div style="position:relative;display:inline-block" id="tms-bol-wrap-${id}">
        ${(()=>{
          const _bol=getBolUpload(id);
          if(_bol) return '<div style="display:flex;align-items:center;gap:6px">'
            +'<span style="background:#d1fae5;color:#065f46;border-radius:7px;padding:4px 10px;font-size:11px;font-weight:700">✅ BOL uploaded</span>'
            +'<a href="'+_bol.data+'" download="'+_bol.name+'" style="padding:4px 10px;border-radius:7px;border:1px solid #e2e8f0;background:#fff;font-size:11px;font-weight:600;color:#2563eb;text-decoration:none;cursor:pointer">⬇ View / Download</a>'
            +'<button onclick="if(confirm(\'Remove this BOL?\')){{localStorage.removeItem(\'bol_upload_tms_'+id+'\');document.getElementById(\'tms-bol-wrap-'+id+'\').outerHTML=\'<div style=\"position:relative;display:inline-block\"><button class=\"btn\" onclick=\"showTmsBolMenu(\\\'' +id+ '\\\',this)\">📝 BOL ▾</button></div>\';}}" style="padding:4px 8px;border-radius:7px;border:1px solid #fecaca;background:#fff;font-size:11px;color:#dc2626;cursor:pointer;font-family:inherit">✕</button>'
            +'</div>';
          return '<button class="btn" onclick="showTmsBolMenu(\'${id}\',this)">📝 BOL ▾</button>';
        })()}
      </div>
      ${TMS_STATUSES.indexOf(q.status)<TMS_STATUSES.length-1?`<button class="btn blue" onclick="closeModal();advanceTMSLoad('${id}','${nextTMSStatus(q.status)}')">→ Move to ${nextTMSStatus(q.status)}</button>`:'<button class="btn" style="color:var(--green);border-color:var(--green)" disabled>✓ Delivered</button>'}
    </div>
  </div></div>`;
}



// ════════════════════════════════════════════════════════════════════
// TMS INVOICING — Full AR/AP for FTL/LTL loads
// ════════════════════════════════════════════════════════════════════
function renderTMSInvoicing(tabBar, loads){
  const invTab=S.tmsInvTab||'customer';
  const today=localDateStr();

  const pending=loads.filter(l=>l.status==='Delivered');
  const invoiced=loads.filter(l=>l.status==='Invoiced');
  const paid=loads.filter(l=>l.status==='Paid');

  const custAR_total=invoiced.reduce((s,l)=>s+(getInvoice(l.id)?.grandTotal||l.customerRate||0),0);
  const carrAP_total=loads.filter(l=>['Delivered','Invoiced'].includes(l.status)).reduce((s,l)=>s+(getCarrierInvoice(l.id)?.grandTotal||l.carrierRate||0),0);
  const collected=paid.reduce((s,l)=>s+(l.customerRate||0),0);

  const invTopTabs=`<div style="display:flex;gap:0;margin-bottom:20px;border-bottom:2px solid var(--gray-100)">
    <button onclick="S.tmsInvTab='customer';renderTMS()" style="padding:10px 22px;border:none;border-bottom:2px solid ${invTab==='customer'?'var(--steel)':'transparent'};margin-bottom:-2px;font-size:13px;font-weight:${invTab==='customer'?700:500};cursor:pointer;font-family:inherit;background:transparent;color:${invTab==='customer'?'var(--steel)':'var(--gray-500)'}">🧾 Customer (AR)</button>
    <button onclick="S.tmsInvTab='carrier';renderTMS()" style="padding:10px 22px;border:none;border-bottom:2px solid ${invTab==='carrier'?'#d97706':'transparent'};margin-bottom:-2px;font-size:13px;font-weight:${invTab==='carrier'?700:500};cursor:pointer;font-family:inherit;background:transparent;color:${invTab==='carrier'?'#d97706':'var(--gray-500)'}">🚛 Carrier (AP)</button>
  </div>`;

  if(invTab==='customer'){
    const kpis=`<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:20px">
      <div class="kpi"><div class="kpi-lbl">Pending invoice</div><div class="kpi-val" style="color:var(--amber)">${pending.length}</div><div style="font-size:11px;color:var(--gray-400)">${fmtD(pending.reduce((s,l)=>s+(l.customerRate||0),0))}</div></div>
      <div class="kpi"><div class="kpi-lbl">Outstanding AR</div><div class="kpi-val" style="color:var(--steel);font-size:18px">${fmtD(custAR_total)}</div><div style="font-size:11px;color:var(--gray-400)">${invoiced.length} invoices</div></div>
      <div class="kpi"><div class="kpi-lbl">Collected</div><div class="kpi-val" style="color:var(--green);font-size:18px">${fmtD(collected)}</div></div>
      <div class="kpi"><div class="kpi-lbl">Total FTL/LTL revenue</div><div class="kpi-val" style="color:var(--navy);font-size:16px">${fmtD(loads.reduce((s,l)=>s+(l.customerRate||0),0))}</div></div>
    </div>`;

    const subTabs=`<div style="display:flex;gap:4px;background:var(--gray-100);padding:3px;border-radius:var(--radius);width:fit-content;margin-bottom:16px">
      ${[{id:'pending',label:'⏳ Pending ('+pending.length+')'},{id:'invoiced',label:'📤 Invoiced ('+invoiced.length+')'},{id:'paid',label:'✅ Paid ('+paid.length+')'}].map(t=>`<button onclick="S.tmsInvSubTab='${t.id}';renderTMS()" style="padding:6px 14px;border-radius:5px;border:none;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;background:${(S.tmsInvSubTab||'pending')===t.id?'#fff':'none'};color:${(S.tmsInvSubTab||'pending')===t.id?'var(--navy)':'var(--gray-500)'};box-shadow:${(S.tmsInvSubTab||'pending')===t.id?'0 1px 3px rgba(0,0,0,.08)':'none'}">${t.label}</button>`).join('')}
    </div>`;

    const currentSub=S.tmsInvSubTab||'pending';
    let tableData=currentSub==='pending'?pending:currentSub==='invoiced'?invoiced:paid;
    const emptyMsg=currentSub==='pending'?'No loads pending invoice — mark loads as Delivered to invoice them':currentSub==='invoiced'?'No outstanding customer invoices':'No payments recorded yet';

    const rows=tableData.map(l=>{
      const inv=getInvoice(l.id);
      const p=getShipmentProfit(l,'freight');
      return`<tr>
        <td class="bold">${l.customer||'—'}</td>
        <td><span style="font-size:11px;font-weight:700;padding:2px 8px;border-radius:99px;background:${tmsStatusColor(l.fqMode||'')}18;color:${tmsStatusColor(l.fqMode||'')}">${l.fqMode}</span></td>
        <td class="muted">${l.pickupZip||'—'} → ${l.deliveryZip||'—'}</td>
        <td style="font-family:monospace;font-size:11px;color:var(--steel)">${inv?.invNum||'—'}</td>
        <td class="money" style="color:var(--steel);font-weight:700">${fmtD(inv?.grandTotal||l.customerRate||0)}</td>
        <td style="white-space:nowrap;font-weight:700;color:${p.isActual?'var(--green)':'var(--amber)'}">${fmtD(p.profit)} ${profitBadge(p.isActual)}</td>
        <td onclick="event.stopPropagation()" style="white-space:nowrap">
          ${currentSub==='pending'?`<button class="btn sm blue" onclick="openInvoiceBuilder('freight','${l.id}')">🧾 Invoice</button>`:''}
          ${currentSub==='invoiced'?`<button class="btn sm" onclick="openInvoiceBuilder('freight','${l.id}')">✏️ Edit</button><button class="btn sm" onclick="markFqPaid('${l.id}')" style="color:var(--green);border-color:#86efac">✅ Paid</button>`:''}
        </td>
      </tr>`;}).join('');

    $('page').innerHTML=tabBar+invTopTabs+kpis+subTabs+(tableData.length?`<div class="tbl-wrap"><table><thead><tr><th>Customer</th><th>Mode</th><th>Lane</th><th>Invoice #</th><th>Amount</th><th>Profit</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>`:`<div class="empty"><div class="empty-ico">🧾</div><p>${emptyMsg}</p></div>`);

  } else {
    // CARRIER AP
    const toPay=loads.filter(l=>['Delivered','Invoiced'].includes(l.status));
    const carrPaid=loads.filter(l=>l.status==='Paid');
    const kpis=`<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:20px">
      <div class="kpi" style="border-color:#fca5a5;background:#fff5f5"><div class="kpi-lbl" style="color:#dc2626">To pay carriers</div><div class="kpi-val" style="color:#dc2626;font-size:18px">${fmtD(carrAP_total)}</div><div style="font-size:11px;color:#dc2626">${toPay.length} loads</div></div>
      <div class="kpi"><div class="kpi-lbl">Carrier invoices</div><div class="kpi-val">${toPay.filter(l=>getCarrierInvoice(l.id)).length}</div></div>
      <div class="kpi" style="border-color:#86efac;background:#f0fdf4"><div class="kpi-lbl" style="color:var(--green)">Paid to carriers</div><div class="kpi-val" style="color:var(--green);font-size:18px">${fmtD(carrPaid.reduce((s,l)=>s+(getCarrierInvoice(l.id)?.grandTotal||l.carrierRate||0),0))}</div></div>
    </div>`;

    const rows=toPay.map(l=>{
      const cinv=getCarrierInvoice(l.id);
      return`<tr>
        <td class="bold">${l.customer||'—'}</td>
        <td><span style="font-size:11px;font-weight:700;padding:2px 8px;border-radius:99px;background:#fff7ed;color:#d97706">${l.fqMode}</span></td>
        <td class="muted">${l.pickupZip||'—'} → ${l.deliveryZip||'—'}</td>
        <td class="bold" style="color:var(--navy)">${l.carrier||'—'}</td>
        <td style="font-family:monospace;font-size:11px;color:var(--gray-500)">${cinv?.invNum||'—'}</td>
        <td class="money" style="color:#d97706;font-weight:700">${fmtD(cinv?.grandTotal||l.carrierRate||0)}</td>
        <td onclick="event.stopPropagation()" style="white-space:nowrap">
          <button class="btn sm" onclick="openCarrierInvoiceBuilder('freight','${l.id}')" style="color:#d97706;border-color:#fbbf24">${cinv?'✏️ Edit':'🚛 Enter'}</button>
        </td>
      </tr>`;}).join('');

    $('page').innerHTML=tabBar+invTopTabs+kpis+(toPay.length?`<div class="tbl-wrap"><table><thead><tr><th>Customer</th><th>Mode</th><th>Lane</th><th>Carrier</th><th>Invoice #</th><th>Carrier cost</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>`:`<div class="empty"><div class="empty-ico">🚛</div><p>No pending carrier payments</p></div>`);
  }
}

function markFqPaid(id){
  const idx=(window._fqHistory||[]).findIndex(q=>q.id===id);
  if(idx<0) return;
  window._fqHistory[idx].status='Paid';
  window._fqHistory[idx].paidDate=localDateStr();
  try{localStorage.setItem('fq_history',JSON.stringify(window._fqHistory));}catch(e){}
  showToast('Marked as paid','success',2000);
  renderTMS();
}



function exportTMSLoads(){
  const loads=getTMSLoads();
  const rows=[['Booking#','Customer','Mode','Pickup ZIP','Delivery ZIP','Carrier','BOL#','Revenue','Carrier Cost','Profit','Status','Date'],...loads.map(l=>{const m=getTMSMeta(l.id);const p=getShipmentProfit(l,'freight');return[m.bookingNum||'',l.customer||'',l.fqMode||'',l.pickupZip||'',l.deliveryZip||'',l.carrier||'',m.bolNum||'',l.customerRate||0,l.carrierRate||0,p.profit.toFixed(2),l.status,l.date];})];
  const csv=rows.map(r=>r.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(',')).join('\n');
  const a=document.createElement('a');a.href='data:text/csv;charset=utf-8,'+encodeURIComponent(csv);a.download='TMS_Loads_'+localDateStr()+'.csv';a.click();
  showToast('CSV exported','success',2000);
}

function openFqCarrierInvById(id){
  const idx=(window._fqHistory||[]).findIndex(q=>q.id===id);
  if(idx>=0) openFqCarrierInvoice(idx);
  else showToast('Load not found','error');
}
// ════════════════════════════════════════════════════════════════════
// TMS MEGA BUILD — 19 new features
// ════════════════════════════════════════════════════════════════════

// ── HELPERS ───────────────────────────────────────────────────────
function getTMSCheckcalls(id){return JSON.parse(localStorage.getItem('tms_cc_'+id)||'[]');}
function saveTMSCheckcall(id,entry){const cc=getTMSCheckcalls(id);cc.push({...entry,ts:new Date().toISOString()});localStorage.setItem('tms_cc_'+id,JSON.stringify(cc));}
function getTMSStops(id){return JSON.parse(localStorage.getItem('tms_stops_'+id)||'[]');}
function saveTMSStops(id,stops){localStorage.setItem('tms_stops_'+id,JSON.stringify(stops));}
function getTMSClaims(id){return JSON.parse(localStorage.getItem('tms_claims_'+id)||'[]');}
function saveTMSClaim(id,claim){const c=getTMSClaims(id);c.push({...claim,id:'CLM-'+Date.now(),ts:new Date().toISOString()});localStorage.setItem('tms_claims_'+id,JSON.stringify(c));return c;}
function getTMSCapacity(){return JSON.parse(localStorage.getItem('tms_capacity')||'[]');}
function saveTMSCapacity(list){localStorage.setItem('tms_capacity',JSON.stringify(list));}
function isOverdue(l){const m=getTMSMeta(l.id);if(!m.eta||['Delivered','Paid','Invoiced'].includes(l.status))return false;return new Date(m.eta)<new Date();}
function getOverdueLoads(){return getTMSLoads().filter(isOverdue);}
function updateTMSBadge(){
  const ov=getOverdueLoads().length;
  const btn=document.getElementById('nav-tms');
  if(!btn)return;
  const badge=document.getElementById('tms-badge');
  if(badge)badge.textContent=ov>0?'⚠️ '+ov+' overdue':getTMSLoads().length>0?getTMSLoads().length+' loads':'All modes';
}

// ── Drayage kanban board ────────────────────────────────────────────
function renderTMSDrayage(tabBar){
  const DRAY_STATUSES=['Booked','Out for Pickup','At Port','In Transit','Delivered'];
  const DRAY_COLORS={'Booked':'#6366f1','Out for Pickup':'#f59e0b','At Port':'#0ea5e9','In Transit':'#10b981','Delivered':'#1a2e4a'};
  const loads=(S.quotes||[]).filter(q=>['Booked','Out for Pickup','At Port','In Transit','Delivered','Invoiced','Paid'].includes(q.status));
  const active=loads.filter(q=>['Booked','Out for Pickup','At Port','In Transit'].includes(q.status));
  const delivered=loads.filter(q=>q.status==='Delivered');
  const needsInv=delivered.filter(q=>!getInvoice(q.id));
  const urgent=active.filter(q=>q.tracking?.urgent||q.urgent);
  const kpis=`<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px">
    <div class="kpi"><div class="kpi-lbl">Active</div><div class="kpi-val">${active.length}</div></div>
    <div class="kpi"><div class="kpi-lbl">Urgent</div><div class="kpi-val" style="color:#dc2626">${urgent.length||'—'}</div></div>
    <div class="kpi"><div class="kpi-lbl">Needs invoicing</div><div class="kpi-val" style="color:${needsInv.length?'#ea580c':'#16a34a'}">${needsInv.length||'—'}</div></div>
    <div class="kpi"><div class="kpi-lbl">Delivered this month</div><div class="kpi-val">${loads.filter(q=>q.status==='Delivered'&&(q.date||'').slice(0,7)===localDateStr().slice(0,7)).length}</div></div>
  </div>`;
  if(!loads.length){
    $('page').innerHTML=tabBar+kpis+`<div class="empty"><div class="empty-ico">🚢</div><p>No active drayage loads yet</p><button class="btn blue" onclick="goTo('quote')">+ New drayage quote</button></div>`;
    return;
  }
  const cols=DRAY_STATUSES.map(s=>{
    const col=loads.filter(q=>q.status===s);
    const color=DRAY_COLORS[s]||'#64748b';
    const cards=col.map(q=>{
      const meta=getTMSMeta(q.id)||{};
      const isUrgent=q.tracking?.urgent||q.urgent;
      const hasInv=!!getInvoice(q.id);
      let freeDayBadge='';
      if(meta.arrivalDate){
        const arr=new Date(meta.arrivalDate);
        const free=parseInt(meta.freeDays||5);
        const last=new Date(arr);last.setDate(last.getDate()+free);
        const days=Math.ceil((last-new Date())/86400000);
        const bg=days<=0?'#fee2e2':days<=2?'#fef3c7':'#d1fae5';
        const col2=days<=0?'#dc2626':days<=2?'#d97706':'#059669';
        freeDayBadge=`<div style="margin-bottom:6px"><span style="background:${bg};color:${col2};border-radius:6px;padding:2px 8px;font-size:10px;font-weight:700">${days<=0?'⚠ Free days expired':days+' free days left'}</span></div>`;
      }
      const nextS=DRAY_STATUSES[DRAY_STATUSES.indexOf(s)+1];
      return `<div style="background:#fff;border:1px solid #e8f0fb;border-left:3px solid ${isUrgent?'#ef4444':color};border-radius:0 10px 10px 0;padding:12px;margin-bottom:8px;box-shadow:0 1px 4px rgba(0,0,0,.05);cursor:pointer" onclick="showQuoteModal('${q.id}')" onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,.1)'" onmouseout="this.style.boxShadow='0 1px 4px rgba(0,0,0,.05)'">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
          ${isUrgent?`<span style="background:#fef2f2;color:#dc2626;font-size:9px;font-weight:800;padding:2px 7px;border-radius:99px">🔥 URGENT</span>`:`<span style="font-size:10px;color:#8898aa">${q.date||''}</span>`}
          <span style="font-size:11px;font-weight:700;color:var(--steel)">${fmtD(q.customerRates?.total||0)}</span>
        </div>
        <div style="font-size:13px;font-weight:700;color:#1a2e4a;margin-bottom:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${q.customer||'—'}</div>
        <div style="font-size:11px;color:#64748b;margin-bottom:6px">${q.port||'—'} → ${q.zip||'—'}</div>
        ${meta.booking_num||q.bookingNum?`<div style="font-size:10px;color:#2563eb;font-weight:700;margin-bottom:4px">📦 ${meta.booking_num||q.bookingNum}</div>`:''}
        ${q.carrier?`<div style="font-size:11px;color:#475569;margin-bottom:4px">🚛 ${q.carrier}</div>`:''}
        ${freeDayBadge}
        ${q.shiflRef?`<div style="font-size:10px;color:#8898aa">Ref: ${q.shiflRef}</div>`:''}
        <div style="display:flex;gap:5px;margin-top:8px;flex-wrap:wrap">
          ${nextS&&s!=='Delivered'?`<button onclick="event.stopPropagation();markDrayageStatus('${q.id}','${nextS}')" style="padding:3px 9px;font-size:10px;font-weight:700;border:none;border-radius:5px;background:${color};color:#fff;cursor:pointer;font-family:inherit">→ ${nextS}</button>`:''}
          ${s==='Delivered'&&!hasInv?`<button onclick="event.stopPropagation();openInvoiceBuilder('drayage','${q.id}')" style="padding:3px 9px;font-size:10px;font-weight:700;border:none;border-radius:5px;background:#ea580c;color:#fff;cursor:pointer;font-family:inherit">📤 Invoice</button>`:''}
          ${hasInv?'<span style="font-size:10px;color:#16a34a;font-weight:700">✓ Invoiced</span>':''}
        </div>
      </div>`;
    }).join('');
    return `<div style="flex:0 0 220px;min-width:220px">
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:10px;padding:6px 10px;background:${color}15;border-radius:8px">
        <div style="width:8px;height:8px;border-radius:50%;background:${color};flex-shrink:0"></div>
        <span style="font-size:11px;font-weight:700;color:${color};flex:1">${s}</span>
        <span style="font-size:11px;font-weight:700;color:${color};background:${color}25;padding:1px 7px;border-radius:99px">${col.length}</span>
      </div>
      ${cards||'<div style="font-size:12px;color:#94a3b8;text-align:center;padding:20px 0">Empty</div>'}
    </div>`;
  }).join('');
  $('page').innerHTML=tabBar+kpis+`<div style="display:flex;gap:12px;overflow-x:auto;padding-bottom:16px">${cols}</div>`;
}

async function markDrayageStatus(id,newStatus){
  const q=S.quotes.find(x=>x.id===id);
  if(!q) return;
  if(!confirm('Move to "'+newStatus+'"?')) return;
  q.status=newStatus;
  try{await dbUpdateQuoteStatus(id,newStatus);}catch(e){}
  try{localStorage.setItem('shifl_quotes_cache',JSON.stringify(S.quotes));}catch(e){}
  renderTMS();
}

// ── OVERRIDE renderTMS to add new tabs + dashboard default ─────────
const _origRenderTMS=window.renderTMS;
function renderTMS(){
  const sub=S.tmsTab||'drayage';
  const loads=getTMSLoads();
  $('topbar-right').innerHTML=`<button class="btn" onclick="openRevenueLeakDetector()">💸 Revenue leaks</button><button class="btn" onclick="openLoadDocumentBundle('','')">📦 Doc bundle</button><div style="font-size:12px;font-weight:700;color:var(--steel)">🚚 TMS</div>`;
  updateTMSBadge();

  // Primary tabs — always visible
  const primaryTabs=[
    {id:'drayage',icon:'ti-anchor',label:'Drayage'},
    {id:'dashboard',icon:'ti-home',label:'Dashboard'},
    {id:'dispatch',icon:'ti-layout-kanban',label:'Dispatch'},
    {id:'loads',icon:'ti-list',label:'Loads'},
    {id:'invoicing',icon:'ti-receipt',label:'Invoicing'},
    {id:'bol',icon:'ti-file-text',label:'BOL'},
    {id:'reports',icon:'ti-report-analytics',label:'Reports'},
  ];
  // Secondary tabs — in "More" dropdown
  const secondaryTabs=[
    {id:'scorecard',icon:'ti-chart-bar',label:'Scorecards'},
    {id:'escalation',icon:'ti-alert-triangle',label:'Late loads'},
    {id:'tools',icon:'ti-calculator',label:'Tools'},
    {id:'capacity',icon:'ti-truck',label:'Capacity'},
    {id:'claims',icon:'ti-alert-triangle',label:'Claims'},
    {id:'templates',icon:'ti-template',label:'Templates'},
    {id:'calendar',icon:'ti-calendar',label:'Calendar'},
    {id:'vault',icon:'ti-shield-check',label:'Carrier vault'},
    {id:'map',icon:'ti-map',label:'Map'},
  ];
  const tabs=[...primaryTabs,...secondaryTabs];

  const inTransit=loads.filter(l=>['Dispatched','In Transit','Out for Delivery'].includes(l.status));
  const needsInvoice=loads.filter(l=>['Delivered','Invoiced'].includes(l.status)&&!getInvoice(l.id));
  const weekAgo=new Date(Date.now()-7*864e5).toISOString().slice(0,10);
  const thisWeek=loads.filter(l=>l.date>=weekAgo).length;

  const kpis=`<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin-bottom:16px">
    <div class="kpi" onclick="tmsFilter('In Transit')" style="cursor:pointer;transition:transform .1s" onmouseenter="this.style.transform='translateY(-2px)'" onmouseleave="this.style.transform=''"><div class="kpi-lbl">In transit now</div><div class="kpi-val" style="color:#d97706;font-size:20px">${inTransit.length}</div><div style="font-size:11px;color:var(--gray-400)">${fmtD(inTransit.reduce((s,l)=>s+(l.customerRate||0),0))}</div></div>
    <div class="kpi" onclick="tmsFilter('all')" style="cursor:pointer;transition:transform .1s" onmouseenter="this.style.transform='translateY(-2px)'" onmouseleave="this.style.transform=''"><div class="kpi-lbl">This week</div><div class="kpi-val" style="font-size:20px">${thisWeek}</div></div>
    <div class="kpi" onclick="S.tmsTab='invoicing';S.tmsInvSubTab='pending';renderTMS()" style="cursor:pointer;transition:transform .1s" onmouseenter="this.style.transform='translateY(-2px)'" onmouseleave="this.style.transform=''"><div class="kpi-lbl">Needs invoice</div><div class="kpi-val" style="color:${needsInvoice.length?'var(--red)':'var(--green)'};font-size:20px">${needsInvoice.length}</div></div>
    <div class="kpi" onclick="tmsFilter('all')" style="cursor:pointer;transition:transform .1s" onmouseenter="this.style.transform='translateY(-2px)'" onmouseleave="this.style.transform=''"><div class="kpi-lbl">Overdue</div><div class="kpi-val" style="color:${getOverdueLoads().length?'#dc2626':'var(--green)'};font-size:20px">${getOverdueLoads().length}</div></div>
    <div class="kpi" onclick="tmsFilter('all')" style="cursor:pointer;transition:transform .1s" onmouseenter="this.style.transform='translateY(-2px)'" onmouseleave="this.style.transform=''"><div class="kpi-lbl">Total loads</div><div class="kpi-val" style="font-size:20px">${loads.length}</div></div>
  </div>`;

  const isSecondaryActive=secondaryTabs.some(t=>t.id===sub);
  const tabBar=`<div style="display:flex;align-items:center;gap:0;border-bottom:2px solid var(--gray-100);margin-bottom:20px">
    ${primaryTabs.map(t=>`<button onclick="S.tmsTab='${t.id}';renderTMS()"
      style="display:flex;align-items:center;gap:5px;padding:9px 13px;border:none;border-bottom:2px solid ${sub===t.id?'var(--steel)':'transparent'};margin-bottom:-2px;font-size:12px;font-weight:${sub===t.id?700:500};cursor:pointer;font-family:inherit;background:transparent;color:${sub===t.id?'var(--steel)':'var(--gray-500)'};white-space:nowrap;flex-shrink:0">
      <i class="ti ${t.icon}" style="font-size:13px"></i>${t.label}</button>`).join('')}
    <div style="position:relative;flex-shrink:0;margin-bottom:-2px" id="tms-more-wrap">
      <button onclick="const m=document.getElementById('tms-more-dd');m.style.display=m.style.display==='block'?'none':'block';event.stopPropagation()"
        style="display:flex;align-items:center;gap:4px;padding:9px 13px;border:none;border-bottom:2px solid ${isSecondaryActive?'var(--steel)':'transparent'};font-size:12px;font-weight:${isSecondaryActive?700:500};cursor:pointer;font-family:inherit;background:transparent;color:${isSecondaryActive?'var(--steel)':'var(--gray-500)'};white-space:nowrap">
        More ▾</button>
      <div id="tms-more-dd" style="display:none;position:absolute;top:100%;left:0;background:var(--white);border:1px solid var(--gray-200);border-radius:var(--radius-lg);box-shadow:var(--shadow-md);min-width:160px;padding:4px 0;z-index:500">
        ${secondaryTabs.map(t=>`<button onclick="S.tmsTab='${t.id}';renderTMS();document.getElementById('tms-more-dd').style.display='none'"
          style="display:flex;align-items:center;gap:8px;width:100%;padding:8px 14px;border:none;background:${sub===t.id?'var(--blue-bg)':'transparent'};color:${sub===t.id?'var(--steel)':'var(--gray-700)'};font-size:13px;font-weight:${sub===t.id?700:400};cursor:pointer;font-family:inherit;text-align:left">
          <i class="ti ${t.icon}" style="font-size:14px;color:${sub===t.id?'var(--steel)':'var(--gray-400)'}"></i>${t.label}</button>`).join('')}
      </div>
    </div>
  </div>`;
  // Close More dropdown on outside click
  setTimeout(()=>{document.addEventListener('click',function _tmsClose(e){const w=document.getElementById('tms-more-wrap');if(w&&!w.contains(e.target)){const d=document.getElementById('tms-more-dd');if(d)d.style.display='none';}},{once:true});},0);

  if(sub==='drayage')     renderTMSDrayage(tabBar);
  else if(sub==='dashboard')  renderTMSDashboard(tabBar,kpis,loads);
  else if(sub==='dispatch')   renderTMSDispatch(tabBar,kpis,loads);
  else if(sub==='loads')      renderTMSLoads(tabBar,kpis,loads);
  else if(sub==='bol')        renderTMSBolDocs(tabBar,loads);
  else if(sub==='invoicing')  renderTMSInvoicing(tabBar,loads);
  else if(sub==='scorecard')  renderTMSScorecard(tabBar,loads);
  else if(sub==='calendar')   renderTMSCalendar(tabBar);
  else if(sub==='map')        renderTMSMap(tabBar);
  else if(sub==='escalation') renderLateEscalation(tabBar);
  else if(sub==='templates')  renderTMSTemplates(tabBar);
  else if(sub==='vault')      renderCarrierVault(tabBar);
  else if(sub==='capacity')   renderTMSCapacity(tabBar);
  else if(sub==='claims')     renderTMSClaims(tabBar,loads);
  else if(sub==='tools')      renderTMSTools(tabBar);
  else if(sub==='reports')    renderTMSReports(tabBar,loads);
}

// ── 1. TMS HOME DASHBOARD ─────────────────────────────────────────
function renderTMSDashboard(tabBar,kpis,loads){
  const overdue=getOverdueLoads();
  const needsInv=loads.filter(l=>l.status==='Delivered'&&!getInvoice(l.id));
  const needsPOD=loads.filter(l=>['Dispatched','In Transit','Out for Delivery'].includes(l.status)&&!getTMSMeta(l.id).podUploaded);
  const totalRev=loads.reduce((s,l)=>s+(l.customerRate||0),0);
  const totalProfit=loads.reduce((s,l)=>s+getShipmentProfit(l,'freight').profit,0);

  // Weekly revenue bar
  const weeks=[];for(let i=3;i>=0;i--){const d=new Date(Date.now()-i*7*864e5);weeks.push({label:'Wk '+(4-i),rev:loads.filter(l=>l.date&&l.date>=d.toISOString().slice(0,10)&&l.date<new Date(d.getTime()+7*864e5).toISOString().slice(0,10)).reduce((s,l)=>s+(l.customerRate||0),0)});}
  const maxRev=Math.max(...weeks.map(w=>w.rev),1);

  $('page').innerHTML=tabBar+kpis+`
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px">
    <!-- Urgent items -->
    <div class="card">
      <div style="font-size:14px;font-weight:800;color:var(--navy);margin-bottom:12px">🚨 Needs attention</div>
      ${overdue.length?overdue.map(l=>`<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--gray-100)">
        <div><div style="font-size:12px;font-weight:700;color:var(--navy)">${escH(l.customer||'—')}</div><div style="font-size:11px;color:var(--red)">Overdue · ETA was ${getTMSMeta(l.id).eta||'?'}</div></div>
        <button onclick="S.tmsTab='loads';renderTMS()" style="font-size:10px;padding:3px 8px;border:1px solid var(--red);border-radius:4px;background:transparent;cursor:pointer;color:var(--red)">View</button>
      </div>`).join(''):`<div style="color:var(--gray-400);font-size:13px;padding:12px 0">✅ No overdue loads</div>`}
      ${needsInv.length?`<div style="padding:8px 0;border-bottom:1px solid var(--gray-100);font-size:12px;color:var(--amber);font-weight:600">🧾 ${needsInv.length} delivered load${needsInv.length>1?'s':''} need${needsInv.length===1?'s':''} invoicing</div>`:''}
    </div>
    <!-- Weekly revenue bars -->
    <div class="card">
      <div style="font-size:14px;font-weight:800;color:var(--navy);margin-bottom:12px">📊 Weekly revenue</div>
      <div style="display:flex;align-items:flex-end;gap:8px;height:80px">
        ${weeks.map(w=>`<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px">
          <div style="font-size:10px;font-weight:700;color:var(--steel)">${w.rev>0?fmtD(w.rev):''}</div>
          <div style="width:100%;background:var(--steel);border-radius:3px 3px 0 0;height:${Math.round(w.rev/maxRev*60)+4}px;opacity:.85;min-height:4px"></div>
          <div style="font-size:10px;color:var(--gray-400)">${w.label}</div>
        </div>`).join('')}
      </div>
    </div>
  </div>
  <!-- Status pipeline -->
  <div class="card" style="margin-bottom:16px">
    <div style="font-size:14px;font-weight:800;color:var(--navy);margin-bottom:12px">🚚 Pipeline</div>
    <div style="display:flex;gap:0;align-items:center;border-radius:var(--radius);overflow:hidden">
      ${TMS_STATUSES.map((s,i)=>{const c=loads.filter(l=>l.status===s).length;return`<div style="flex:1;text-align:center;padding:10px 4px;background:${c?tmsStatusColor(s)+'12':'var(--gray-50)'};border-right:${i<TMS_STATUSES.length-1?'1px solid var(--gray-100)':'none'}">
        <div style="font-size:20px;font-weight:900;color:${c?tmsStatusColor(s):'var(--gray-300)'}">${c}</div>
        <div style="font-size:10px;font-weight:600;color:${c?tmsStatusColor(s):'var(--gray-400)'};margin-top:2px">${s}</div>
      </div>`;}).join('')}
    </div>
  </div>
  <!-- Quick actions -->
  <div style="margin-bottom:16px">${renderRealTimeMargin()}</div>
  <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px">
    <button onclick="S.tmsTab='dispatch';renderTMS()" class="card" style="text-align:center;cursor:pointer;border:none;background:var(--white)"><div style="font-size:24px">📋</div><div style="font-size:12px;font-weight:700;color:var(--navy);margin-top:4px">Dispatch board</div></button>
    <button onclick="S.tmsTab='bol';renderTMS()" class="card" style="text-align:center;cursor:pointer;border:none;background:var(--white)"><div style="font-size:24px">📄</div><div style="font-size:12px;font-weight:700;color:var(--navy);margin-top:4px">BOL & Docs</div></button>
    <button onclick="S.tmsTab='invoicing';renderTMS()" class="card" style="text-align:center;cursor:pointer;border:none;background:var(--white)"><div style="font-size:24px">🧾</div><div style="font-size:12px;font-weight:700;color:var(--navy);margin-top:4px">Invoicing</div><div style="font-size:10px;color:var(--amber)">${needsInv.length?needsInv.length+' pending':''}</div></button>
    <button onclick="tmsGoFreight()" class="card" style="text-align:center;cursor:pointer;border:none;background:var(--blue-bg)"><div style="font-size:24px">➕</div><div style="font-size:12px;font-weight:700;color:var(--steel);margin-top:4px">New freight quote</div></button>
  </div>`;
}

// ── 2. DEDICATED LOAD DETAIL PAGE ────────────────────────────────
function openTMSLoadDetail(id){
  const q=(window._fqHistory||[]).find(q=>q.id===id);
  if(!q){showToast('Load not found','error');return;}
  const meta=getTMSMeta(id);
  const checkcalls=getTMSCheckcalls(id);
  const stops=getTMSStops(id);
  const claims=getTMSClaims(id);
  const statusIdx=TMS_STATUSES.indexOf(q.status);
  const p=getShipmentProfit(q,'freight');
  const hasCInv=!!getInvoice(id),hasCarrI=!!getCarrierInvoice(id);

  // Doc checklist
  const _bolUpload=getBolUpload(id);
  const docs=[
    {label:'Rate confirmation',key:'rateCon',icon:'📧'},
    {label:'BOL',key:'bolNum',check:!!meta.bolNum||!!_bolUpload,icon:'📄',uploaded:!!_bolUpload,uploadData:_bolUpload},
    {label:'POD',key:'podUploaded',check:!!meta.podUploaded,icon:'✅'},
    {label:'Customer invoice',key:'custInv',check:hasCInv,icon:'🧾'},
    {label:'Carrier invoice',key:'carrInv',check:hasCarrI,icon:'🚛'},
  ];

  // Timeline
  const timeline=TMS_STATUSES.map((s,i)=>{
    const done=i<=statusIdx;const ts=meta[s.toLowerCase().replace(/ /g,'_')+'_at'];
    return`<div style="display:flex;align-items:flex-start;gap:10px;margin-bottom:10px">
      <div style="width:22px;height:22px;border-radius:50%;flex-shrink:0;background:${done?tmsStatusColor(s):'var(--gray-100)'};display:flex;align-items:center;justify-content:center;font-size:11px;color:${done?'#fff':'var(--gray-300)'};">${done?'✓':'○'}</div>
      <div><div style="font-size:12px;font-weight:${done?700:400};color:${done?'var(--navy)':'var(--gray-400)'}">${s}</div>${ts?`<div style="font-size:10px;color:var(--gray-400)">${new Date(ts).toLocaleString('en-US',{timeZone:'America/New_York',month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})}</div>`:''}</div>
    </div>`;}).join('');

  // Check-call log
  const ccHtml=checkcalls.length?checkcalls.map(c=>`<div style="padding:8px 0;border-bottom:1px solid var(--gray-100)">
    <div style="display:flex;justify-content:space-between"><span style="font-size:12px;font-weight:600;color:var(--navy)">${escH(c.location||'Check call')}</span><span style="font-size:11px;color:var(--gray-400)">${new Date(c.ts).toLocaleString('en-US',{timeZone:'America/New_York',month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})}</span></div>
    ${c.eta?`<div style="font-size:11px;color:var(--amber)">ETA: ${c.eta}</div>`:''}
    ${c.note?`<div style="font-size:11px;color:var(--gray-600)">${escH(c.note)}</div>`:''}
  </div>`).join(''):`<div style="color:var(--gray-400);font-size:12px;padding:8px 0">No check calls logged yet</div>`;

  const next=nextTMSStatus(q.status);
  const prev=statusIdx>0?TMS_STATUSES[statusIdx-1]:null;

  $('page').innerHTML=`
  <div style="display:flex;align-items:center;gap:10px;margin-bottom:20px">
    <button onclick="S.tmsTab='loads';renderTMS()" style="border:none;background:transparent;cursor:pointer;font-size:20px;color:var(--gray-400);padding:4px">←</button>
    <div>
      <div style="font-size:20px;font-weight:900;color:var(--navy)">${escH(q.customer||'—')}</div>
      <div style="display:flex;align-items:center;gap:8px;margin-top:4px;flex-wrap:wrap">
        ${q.shiflRef?`<span style="font-size:12px;font-weight:800;color:#2563eb;background:#eff6ff;padding:2px 10px;border-radius:6px">${escH(q.shiflRef)}</span>`:''}
        ${meta.bookingNum?`<span style="font-size:12px;font-weight:700;color:var(--steel)">${escH(meta.bookingNum)}</span>`:''}
        <span style="font-size:11px;font-weight:700;padding:2px 8px;border-radius:99px;background:${tmsStatusColor(q.status)}18;color:${tmsStatusColor(q.status)}">${q.status}</span>
        <span style="font-size:11px;color:var(--gray-400)">${q.fqMode} · ${q.date}</span>
      </div>
    </div>
    <div style="margin-left:auto;display:flex;gap:6px">
      ${prev?`<button onclick="advanceTMSLoad('${id}','${prev}')" style="padding:7px 14px;border:1px solid var(--gray-300);border-radius:var(--radius);background:transparent;cursor:pointer;font-family:inherit;font-size:12px;font-weight:600;color:var(--gray-600)">← ${escH(prev)}</button>`:''}
      ${next?`<button onclick="advanceTMSLoad('${id}','${next}')" style="padding:7px 14px;border:none;border-radius:var(--radius);background:${tmsStatusColor(next)};cursor:pointer;font-family:inherit;font-size:12px;font-weight:700;color:#fff">→ ${escH(next)}</button>`:''}
    </div>
  </div>

  <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;margin-bottom:16px">
    <!-- Left: Details -->
    <div style="display:flex;flex-direction:column;gap:12px">
      <div class="card">
        <div style="font-size:12px;font-weight:700;color:var(--gray-400);text-transform:uppercase;letter-spacing:.05em;margin-bottom:10px">Load details</div>
        <div class="g2" style="gap:8px">
          <div><div style="font-size:10px;color:var(--gray-400)">Lane</div><div style="font-size:13px;font-weight:700">${escH((q.pickupZip||'—')+' → '+(q.deliveryZip||'—'))}</div></div>
          <div><div style="font-size:10px;color:var(--gray-400)">Carrier</div><div style="font-size:13px;font-weight:700">${escH(q.carrier||'—')}</div></div>
          <div><div style="font-size:10px;color:var(--gray-400)">Mode</div><div style="font-size:13px;font-weight:700">${q.fqMode||'—'}</div></div>
          <div><div style="font-size:10px;color:var(--gray-400)">Weight</div><div style="font-size:13px;font-weight:700">${q.weight?Number(q.weight).toLocaleString()+' lbs':'—'}</div></div>
          <div><div style="font-size:10px;color:var(--gray-400)">Revenue</div><div style="font-size:14px;font-weight:800;color:var(--steel)">${fmtD(q.customerRate||0)}</div></div>
          <div><div style="font-size:10px;color:var(--gray-400)">Profit</div><div style="font-size:14px;font-weight:800;color:${p.profit>=0?'var(--green)':'var(--red)'}">${fmtD(p.profit)}</div></div>
        </div>
      </div>
      <div class="card">
        <div style="font-size:12px;font-weight:700;color:var(--gray-400);text-transform:uppercase;letter-spacing:.05em;margin-bottom:10px">Appointments</div>
        <div class="field" style="margin-bottom:8px"><label style="font-size:11px">Pickup</label><input type="datetime-local" value="${meta.pickupAppt||''}" onchange="saveTMSMeta('${id}',{pickupAppt:this.value});showSavedIndicator()"></div>
        <div class="field" style="margin-bottom:8px"><label style="font-size:11px">Delivery</label><input type="datetime-local" value="${meta.deliveryAppt||''}" onchange="saveTMSMeta('${id}',{deliveryAppt:this.value});showSavedIndicator()"></div>
        <div class="field" style="margin-bottom:8px"><label style="font-size:11px">ETA</label><input type="date" value="${meta.eta||''}" onchange="saveTMSMeta('${id}',{eta:this.value});showSavedIndicator()"></div>
        <div class="field"><label style="font-size:11px">PRO / Tracking #</label><input type="text" value="${escH(meta.proNum||'')}" placeholder="PRO number" onchange="saveTMSMeta('${id}',{proNum:this.value});showSavedIndicator()"></div>
      </div>
    </div>

    <!-- Middle: Timeline + Checklist -->
    <div style="display:flex;flex-direction:column;gap:12px">
      <div class="card">
        <div style="font-size:12px;font-weight:700;color:var(--gray-400);text-transform:uppercase;letter-spacing:.05em;margin-bottom:10px">Status timeline</div>
        ${timeline}
      </div>
      <div class="card">
        <div style="font-size:12px;font-weight:700;color:var(--gray-400);text-transform:uppercase;letter-spacing:.05em;margin-bottom:10px">📋 Document checklist</div>
        ${docs.map(d=>`<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--gray-100)">
          <span style="font-size:14px">${d.icon}</span>
          <span style="font-size:13px;font-weight:600;flex:1;color:var(--navy)">${d.label}</span>
          ${d.uploaded&&d.uploadData?`<a href='${d.uploadData.data}' download='${d.uploadData.name}' style='font-size:11px;font-weight:700;color:#16a34a;text-decoration:none;background:#f0fdf4;border-radius:5px;padding:2px 8px'>⬇ View</a>`:''}\n          <span style="font-size:12px;font-weight:700;color:${d.check?'#16a34a':'var(--gray-300)'}">${d.check?'✓ Done':'—'}</span>
        </div>`).join('')}
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:10px">
          <button onclick="openTMSRateCon('${id}')" style="font-size:11px;padding:5px 10px;border:1px solid var(--gray-200);border-radius:var(--radius);background:transparent;cursor:pointer;font-family:inherit">📧 Rate con</button>
          <button onclick="openDriverContactModal('${id}')" style="font-size:11px;padding:5px 10px;border:1px solid var(--gray-200);border-radius:var(--radius);background:transparent;cursor:pointer;font-family:inherit">🚛 Driver</button>
          <button onclick="openDetentionTimer('${id}')" style="font-size:11px;padding:5px 10px;border:1px solid var(--gray-200);border-radius:var(--radius);background:transparent;cursor:pointer;font-family:inherit">⏰ Detention</button>
          <button onclick="duplicateTMSLoad('${id}')" style="font-size:11px;padding:5px 10px;border:1px solid var(--gray-200);border-radius:var(--radius);background:transparent;cursor:pointer;font-family:inherit">📋 Duplicate</button>
          <button onclick="toggleBlindMode('${id}');openTMSLoadDetail('${id}')" style="font-size:11px;padding:5px 10px;border:1px solid ${meta.isBlind?'#7c3aed':'var(--gray-200)'};border-radius:var(--radius);background:${meta.isBlind?'#f5f3ff':'transparent'};cursor:pointer;font-family:inherit;color:${meta.isBlind?'#7c3aed':'inherit'}">🙈 Blind</button>
          <button onclick="aiMatchCarrier('${id}')" style="font-size:11px;padding:5px 10px;border:1px solid var(--steel);border-radius:var(--radius);background:var(--blue-bg);cursor:pointer;font-family:inherit;color:var(--steel)">🤖 AI match</button>
          <button onclick="noteTemplateMenu('tms-notes-${id}')" style="font-size:11px;padding:5px 10px;border:1px solid var(--gray-200);border-radius:var(--radius);background:transparent;cursor:pointer;font-family:inherit">📝 Templates</button>
          ${_bolUpload?
  `<a href="${_bolUpload.data}" download="${_bolUpload.name}" style="font-size:11px;padding:5px 10px;border:1px solid #86efac;border-radius:var(--radius);background:#f0fdf4;cursor:pointer;font-family:inherit;color:#16a34a;text-decoration:none;display:inline-flex;align-items:center;gap:3px">✅ BOL — View</a>`
  :`<button onclick="showTmsBolMenu('${id}',this)" style="font-size:11px;padding:5px 10px;border:1px solid var(--gray-200);border-radius:var(--radius);background:transparent;cursor:pointer;font-family:inherit">📝 BOL ▾</button>`}
          <button onclick="tmsInvOpen('${id}')" style="font-size:11px;padding:5px 10px;border:1px solid var(--gray-200);border-radius:var(--radius);background:transparent;cursor:pointer;font-family:inherit">🧾 Invoice</button>
          <button onclick="openFqCarrierInvById('${id}')" style="font-size:11px;padding:5px 10px;border:1px solid var(--gray-200);border-radius:var(--radius);background:transparent;cursor:pointer;font-family:inherit">🚛 Carrier inv</button>
          <button onclick="openPODUpload('${id}')" style="font-size:11px;padding:5px 10px;border:1px solid ${meta.podUploaded?'#86efac':'var(--gray-200)'};border-radius:var(--radius);background:${meta.podUploaded?'#f0fdf4':'transparent'};cursor:pointer;font-family:inherit;color:${meta.podUploaded?'#16a34a':'inherit'}">📎 ${meta.podUploaded?'POD ✓':'Upload POD'}</button>
        </div>
      </div>
    </div>

    <!-- Right: Check calls + Notes -->
    <div style="display:flex;flex-direction:column;gap:12px">
      <div class="card">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
          <div style="font-size:12px;font-weight:700;color:var(--gray-400);text-transform:uppercase;letter-spacing:.05em">📞 Check calls</div>
          <button onclick="openCheckcallModal('${id}')" style="font-size:11px;padding:4px 10px;border:1px solid var(--steel);border-radius:var(--radius);color:var(--steel);background:transparent;cursor:pointer;font-family:inherit">+ Log</button>
        </div>
        <div style="max-height:160px;overflow-y:auto">${ccHtml}</div>
      </div>
      <div class="card">
        <div style="font-size:12px;font-weight:700;color:var(--gray-400);text-transform:uppercase;letter-spacing:.05em;margin-bottom:8px">📝 Load notes</div>
        <textarea style="width:100%;box-sizing:border-box;resize:vertical;font-size:12px;min-height:80px;border:1px solid var(--gray-200);border-radius:var(--radius);padding:8px" placeholder="Internal notes visible to all team members..." onchange="saveTMSMeta('${id}',{notes:this.value});showSavedIndicator()">${escH(meta.notes||'')}</textarea>
      </div>
      <div class="card">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
          <div style="font-size:12px;font-weight:700;color:var(--gray-400);text-transform:uppercase;letter-spacing:.05em">⚠️ Claims</div>
          <button onclick="openClaimModal('${id}')" style="font-size:11px;padding:4px 10px;border:1px solid var(--red);border-radius:var(--radius);color:var(--red);background:transparent;cursor:pointer;font-family:inherit">+ File claim</button>
        </div>
        ${claims.length?claims.map(c=>`<div style="padding:6px 0;border-bottom:1px solid var(--gray-100);font-size:12px"><span style="font-weight:700;color:var(--navy)">${escH(c.type||'Claim')}</span> · ${fmtD(c.amount||0)} · <span style="color:${c.status==='Resolved'?'var(--green)':'var(--amber)'}">${c.status||'Open'}</span></div>`).join(''):`<div style="color:var(--gray-400);font-size:12px">No claims filed</div>`}
      </div>
    </div>
  </div>`;
}

// ── 3. CHECK-CALL MODAL ───────────────────────────────────────────
function openCheckcallModal(id){
  $('modal-root').innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()">
  <div class="modal" style="max-width:500px">
    <div class="modal-title">📞 Log check call</div>
    <div class="field"><label>Driver location</label><input type="text" id="cc-loc" placeholder="e.g. Columbus, OH — I-70 westbound"></div>
    <div class="field"><label>New ETA</label><input type="datetime-local" id="cc-eta"></div>
    <div class="field"><label>Notes</label><textarea id="cc-note" rows="2" style="width:100%;box-sizing:border-box;resize:vertical" placeholder="Any updates, issues, exceptions..."></textarea></div>
    <div class="modal-foot">
      <button class="btn" onclick="closeModal()">Cancel</button>
      <button class="btn blue" onclick="logCheckcall('${id}')">Save check call</button>
    </div>
  </div></div>`;
}
function logCheckcall(id){
  const loc=($('cc-loc')||{}).value?.trim();
  const eta=($('cc-eta')||{}).value;
  const note=($('cc-note')||{}).value?.trim();
  saveTMSCheckcall(id,{location:loc,eta,note});
  if(eta) saveTMSMeta(id,{eta:eta.slice(0,10)});
  closeModal();showToast('Check call logged','success',2000);
  openTMSLoadDetail(id);
}

// ── 4. POD UPLOAD ────────────────────────────────────────────────
function openPODUpload(id){
  $('modal-root').innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()">
  <div class="modal" style="max-width:500px">
    <div class="modal-title">📎 Upload Proof of Delivery</div>
    <div style="border:2px dashed var(--gray-200);border-radius:var(--radius);padding:24px;text-align:center;cursor:pointer;margin-bottom:14px" onclick="$('pod-file').click()">
      <div style="font-size:32px;margin-bottom:8px">📎</div>
      <div style="font-size:14px;font-weight:600;color:var(--navy)">Click to upload POD</div>
      <div style="font-size:12px;color:var(--gray-400)">PDF, JPG, or PNG</div>
      <input type="file" id="pod-file" accept=".pdf,.jpg,.jpeg,.png" style="display:none" onchange="podFileSelected(this,'${id}')">
    </div>
    <div id="pod-preview" style="display:none;padding:10px;background:var(--blue-bg);border-radius:var(--radius);font-size:13px;color:var(--steel);font-weight:600;margin-bottom:14px"></div>
    <div class="modal-foot">
      <button class="btn" onclick="closeModal()">Cancel</button>
      <button class="btn blue" onclick="savePOD('${id}')">✅ Confirm POD received</button>
    </div>
  </div></div>`;
}
function podFileSelected(input,id){
  const f=input.files[0];if(!f)return;
  const prev=$('pod-preview');if(prev){prev.style.display='block';prev.textContent='📎 '+f.name+' ('+Math.round(f.size/1024)+'KB)';}
  const reader=new FileReader();
  reader.onload=e=>{window._podData={name:f.name,data:e.target.result};};
  reader.readAsDataURL(f);
}
function savePOD(id){
  const data=window._podData;
  saveTMSMeta(id,{podUploaded:true,podName:data?.name||'POD',podDate:localDateStr()});
  closeModal();showToast('✅ POD uploaded — ready to invoice','success',3000);
  openTMSLoadDetail(id);
}

// ── 5. CLAIMS MODAL ───────────────────────────────────────────────
function openClaimModal(id){
  $('modal-root').innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()">
  <div class="modal" style="max-width:500px">
    <div class="modal-title">⚠️ File a claim</div>
    <div class="g2">
      <div class="field"><label>Claim type</label><select id="clm-type" style="width:100%;padding:8px;border:1px solid var(--gray-200);border-radius:var(--radius)"><option>Damage</option><option>Shortage</option><option>Loss</option><option>Carrier no-show</option><option>Late delivery</option><option>Other</option></select></div>
      <div class="field"><label>Claim amount ($)</label><input type="number" id="clm-amt" placeholder="0" min="0"></div>
    </div>
    <div class="field"><label>Description</label><textarea id="clm-desc" rows="3" style="width:100%;box-sizing:border-box;resize:vertical" placeholder="Describe the issue..."></textarea></div>
    <div class="field"><label>Status</label><select id="clm-status" style="width:100%;padding:8px;border:1px solid var(--gray-200);border-radius:var(--radius)"><option>Open</option><option>Pending carrier</option><option>Resolved</option></select></div>
    <div class="modal-foot">
      <button class="btn" onclick="closeModal()">Cancel</button>
      <button class="btn blue" onclick="fileClaim('${id}')">File claim</button>
    </div>
  </div></div>`;
}
function fileClaim(id){
  saveTMSClaim(id,{type:($('clm-type')||{}).value,amount:parseFloat(($('clm-amt')||{}).value)||0,description:($('clm-desc')||{}).value?.trim(),status:($('clm-status')||{}).value});
  saveTMSMeta(id,{hasClaim:true});
  closeModal();showToast('⚠️ Claim filed','warning',2000);
  openTMSLoadDetail(id);
}

// ── 6. RATE CONFIRMATION PDF ──────────────────────────────────────
async function openTMSRateCon(id){
  const q=(window._fqHistory||[]).find(q=>q.id===id);
  if(!q){showToast('Load not found','error');return;}
  const meta=getTMSMeta(id);
  if(!await loadJsPDF()){showToast('PDF library loading...','info');return;}
  const{jsPDF}=window.jspdf;const doc=new jsPDF({unit:'mm',format:'letter'});
  const W=216,M=14,navy=[26,46,74];
  doc.setFillColor(...navy);doc.rect(0,0,W,32,'F');
  doc.setTextColor(255,255,255);doc.setFont('helvetica','bold');doc.setFontSize(20);
  doc.text('RATE CONFIRMATION',M,14);
  doc.setFontSize(10);doc.setFont('helvetica','normal');
  doc.text('Shifl Logistics · Freight Brokerage',M,22);
  doc.text('Ref: '+(meta.bookingNum||id),W-M,14,{align:'right'});
  doc.text('Date: '+localDateStr(),W-M,22,{align:'right'});
  doc.setTextColor(0);let y=42;
  const sec=t=>{doc.setFillColor(240,244,248);doc.rect(M,y-4,W-M*2,7,'F');doc.setFont('helvetica','bold');doc.setFontSize(9);doc.setTextColor(...navy);doc.text(t,M+2,y);doc.setTextColor(0);y+=10;};
  const row=(l,v)=>{doc.setFont('helvetica','bold');doc.setFontSize(9);doc.text(l+':',M,y);doc.setFont('helvetica','normal');doc.text(v||'—',M+45,y);y+=7;};
  sec('CARRIER INFORMATION');row('Carrier',q.carrier);row('Mode',q.fqMode);y+=3;
  sec('SHIPMENT DETAILS');row('Pickup ZIP',q.pickupZip);row('Delivery ZIP',q.deliveryZip);row('Pickup appointment',meta.pickupAppt||'TBD');row('Delivery appointment',meta.deliveryAppt||'TBD');row('Weight',q.weight?(q.weight+' lbs'):'TBD');row('Commodity',q.commodity||meta.commodity||'General freight, no hazmat');y+=3;
  sec('RATE');doc.setFont('helvetica','bold');doc.setFontSize(16);doc.setTextColor(...navy);doc.text(fmtD(q.carrierRate||0),M,y);doc.setFontSize(9);doc.setTextColor(100);doc.text('All-in rate · Payment terms: Net 30',M+35,y);doc.setTextColor(0);y+=12;
  if(meta.bolNotes){sec('SPECIAL INSTRUCTIONS');doc.setFont('helvetica','normal');doc.setFontSize(9);doc.text(doc.splitTextToSize(meta.bolNotes,W-M*2),M,y);y+=doc.splitTextToSize(meta.bolNotes,W-M*2).length*5+6;}
  y+=8;doc.setDrawColor(...navy);doc.setLineWidth(.5);doc.line(M,y,90,y);doc.line(120,y,W-M,y);
  doc.setFontSize(8);doc.text('Carrier signature / date',M,y+4);doc.text('Broker signature / date',120,y+4);
  doc.setFontSize(7);doc.setTextColor(150);doc.text('By accepting this load, carrier agrees to all terms. Contact: dispatch@shifl.com',W/2,270,{align:'center'});
  doc.save('RateCon_'+(meta.bookingNum||id)+'_'+escH(q.carrier||'carrier').replace(/\s/g,'_')+'.pdf');
  saveTMSMeta(id,{rateConSent:true});
  showToast('Rate confirmation PDF downloaded','success',2000);
}

// ── 7. CARRIER CAPACITY BOARD ─────────────────────────────────────
function renderCarrierVault(tabBar){
  // Pull all carriers from memory
  const allCarriers=[...new Set([
    ...(window._fqHistory||[]).map(q=>q.carrier).filter(Boolean),
    ...(S.quotes||[]).map(q=>q.carrier).filter(Boolean),
    ...(window._carriers||[]).map(c=>c.name)
  ])].sort();

  $('page').innerHTML=tabBar+`
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
    <div style="font-size:16px;font-weight:800;color:var(--navy)">📋 Carrier compliance vault</div>
  </div>
  <div class="tbl-wrap"><table><thead><tr><th>Carrier</th><th>W-9</th><th>EIN</th><th>Certifications</th><th>Pay terms</th><th>Blacklisted</th><th>Actions</th></tr></thead><tbody>
    ${allCarriers.map(name=>{
      const w=getCarrierW9(name);
      return'<tr>'+
        '<td class="bold">'+escH(name)+'</td>'+
        '<td>'+w9Badge(name)+'</td>'+
        '<td style="font-family:monospace;font-size:12px">'+escH(w.ein||'—')+'</td>'+
        '<td>'+certBadges(name)+'</td>'+
        '<td>'+payTermsBadge(name)+'</td>'+
        '<td>'+(isBlacklisted(name)?'<span style="color:var(--red);font-weight:700">🚫 Yes</span>':'<span style="color:var(--gray-400)">No</span>')+'</td>'+
        '<td onclick="event.stopPropagation()" style="white-space:nowrap">'+
          '<button data-n="'+escH(name)+'" onclick="openW9Modal(this.dataset.n)" style="font-size:10px;padding:3px 7px;border:1px solid var(--gray-200);border-radius:4px;background:transparent;cursor:pointer;font-family:inherit">📋 W-9</button> '+
          '<button data-n="'+escH(name)+'" onclick="openCertModal(this.dataset.n)" style="font-size:10px;padding:3px 7px;border:1px solid var(--gray-200);border-radius:4px;background:transparent;cursor:pointer;font-family:inherit">🏆 Certs</button> '+
          '<button data-n="'+escH(name)+'" onclick="showPayTermsModal(this.dataset.n)" style="font-size:10px;padding:3px 7px;border:1px solid var(--gray-200);border-radius:4px;background:transparent;cursor:pointer;font-family:inherit">💳 Terms</button>'+
        '</td>'+
      '</tr>';
    }).join('')}
  </tbody></table></div>
  `;
}

function renderTMSCapacity(tabBar){
  const list=getTMSCapacity();
  const today=localDateStr();
  $('page').innerHTML=tabBar+`
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
    <div style="font-size:16px;font-weight:800;color:var(--navy)">🚚 Available carrier capacity</div>
    <button onclick="openAddCapacity()" class="btn blue">+ Add available truck</button>
  </div>
  ${list.length?`<div class="tbl-wrap"><table><thead><tr><th>Carrier</th><th>Equipment</th><th>Available from</th><th>Origin</th><th>Destination</th><th>Rate</th><th>Contact</th><th></th></tr></thead><tbody>
    ${list.map((c,i)=>`<tr style="opacity:${c.date<today?.5:1}">
      <td class="bold">${escH(c.carrier||'—')}</td>
      <td><span style="font-size:11px;background:var(--blue-bg);color:var(--steel);padding:2px 8px;border-radius:99px;font-weight:700">${escH(c.equip||'FTL')}</span></td>
      <td style="color:${c.date<today?'var(--red)':'var(--navy)'}">${c.date||'—'}${c.date<today?' ⚠️ expired':''}</td>
      <td class="muted">${escH(c.origin||'—')}</td>
      <td class="muted">${escH(c.dest||'Anywhere')}</td>
      <td class="money">${c.rate?fmtD(c.rate):'Negotiable'}</td>
      <td style="font-size:12px">${escH(c.contact||'—')}</td>
      <td><button onclick="removeCapacity(${i})" style="border:none;background:transparent;cursor:pointer;color:var(--red);font-size:13px">🗑️</button></td>
    </tr>`).join('')}
  </tbody></table></div>`:`<div class="empty"><div class="empty-ico">🚚</div><p>No available trucks logged — add carrier capacity to match with loads</p></div>`}`;
}
function openAddCapacity(){
  $('modal-root').innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()">
  <div class="modal" style="max-width:460px">
    <div class="modal-title">+ Add available truck</div>
    <div class="g2">
      <div class="field"><label>Carrier name *</label><input type="text" id="cap-carrier" placeholder="Carrier name"></div>
      <div class="field"><label>Equipment</label><select id="cap-equip" style="width:100%;padding:8px;border:1px solid var(--gray-200);border-radius:var(--radius)"><option>FTL - Dry Van</option><option>FTL - Reefer</option><option>FTL - Flatbed</option><option>LTL</option><option>Box Truck</option><option>Step Deck</option></select></div>
    </div>
    <div class="g3">
      <div class="field"><label>Available date</label><input type="date" id="cap-date" value="${localDateStr()}"></div>
      <div class="field"><label>Origin ZIP / city</label><input type="text" id="cap-origin" placeholder="e.g. Newark, NJ"></div>
      <div class="field"><label>Destination</label><input type="text" id="cap-dest" placeholder="e.g. Chicago, IL"></div>
    </div>
    <div class="g2">
      <div class="field"><label>Target rate ($)</label><input type="number" id="cap-rate" placeholder="Optional"></div>
      <div class="field"><label>Contact / phone</label><input type="text" id="cap-contact" placeholder="Driver or dispatcher"></div>
    </div>
    <div class="modal-foot">
      <button class="btn" onclick="closeModal()">Cancel</button>
      <button class="btn blue" onclick="saveCapacity()">Save</button>
    </div>
  </div></div>`;
}
function saveCapacity(){
  const carrier=($('cap-carrier')||{}).value?.trim();
  if(!carrier){alert('Carrier name required');return;}
  const list=getTMSCapacity();
  list.unshift({carrier,equip:($('cap-equip')||{}).value,date:($('cap-date')||{}).value,origin:($('cap-origin')||{}).value?.trim(),dest:($('cap-dest')||{}).value?.trim(),rate:parseFloat(($('cap-rate')||{}).value)||0,contact:($('cap-contact')||{}).value?.trim(),addedAt:new Date().toISOString()});
  saveTMSCapacity(list);closeModal();showToast('Capacity added','success',2000);renderTMS();
}
function removeCapacity(i){const list=getTMSCapacity();list.splice(i,1);saveTMSCapacity(list);renderTMS();}

// ── 8. CLAIMS PAGE ────────────────────────────────────────────────
function renderTMSClaims(tabBar,loads){
  const allClaims=[];
  loads.forEach(l=>{getTMSClaims(l.id).forEach(c=>allClaims.push({...c,customer:l.customer,loadId:l.id,bookingNum:getTMSMeta(l.id).bookingNum||''}) );});
  allClaims.sort((a,b)=>b.ts.localeCompare(a.ts));
  $('page').innerHTML=tabBar+`
  <div style="font-size:16px;font-weight:800;color:var(--navy);margin-bottom:16px">⚠️ Claims management</div>
  ${allClaims.length?`<div class="tbl-wrap"><table><thead><tr><th>Booking #</th><th>Customer</th><th>Type</th><th>Amount</th><th>Status</th><th>Filed</th><th></th></tr></thead><tbody>
    ${allClaims.map(c=>`<tr>
      <td style="font-family:monospace;font-weight:700;color:var(--steel)">${escH(c.bookingNum||c.loadId.slice(-6))}</td>
      <td class="bold">${escH(c.customer||'—')}</td>
      <td><span style="font-size:11px;background:#fff5f5;color:#dc2626;padding:2px 8px;border-radius:99px;font-weight:700">${escH(c.type||'—')}</span></td>
      <td class="money" style="color:#dc2626;font-weight:700">${fmtD(c.amount||0)}</td>
      <td><span style="font-size:11px;font-weight:700;padding:2px 8px;border-radius:99px;background:${c.status==='Resolved'?'#f0fdf4':c.status==='Pending carrier'?'#fffbeb':'#fff5f5'};color:${c.status==='Resolved'?'#16a34a':c.status==='Pending carrier'?'#d97706':'#dc2626'}">${c.status||'Open'}</span></td>
      <td class="muted">${c.ts?new Date(c.ts).toLocaleDateString():'—'}</td>
      <td><button onclick="openTMSLoadDetail('${c.loadId}')" style="font-size:11px;padding:3px 8px;border:1px solid var(--gray-200);border-radius:4px;background:transparent;cursor:pointer;font-family:inherit">View load</button></td>
    </tr>`).join('')}
  </tbody></table></div>`:`<div class="empty"><div class="empty-ico">✅</div><p>No claims filed — great track record</p></div>`}`;
}

// ── 9. ENHANCED REPORTS (analytics) ──────────────────────────────
function renderTMSReports(tabBar,loads){
  const rTab=S.tmsRptTab||'pl';
  const rTabs=[{id:'pl',label:'P&L'},{id:'ontime',label:'On-time'},{id:'customer',label:'Customer profit'},{id:'lane',label:'Lane trends'},{id:'heatmap',label:'Volume heatmap'},{id:'annual',label:'Annual review'}];
  const rBar=`<div style="display:flex;gap:4px;background:var(--gray-100);padding:3px;border-radius:var(--radius);width:fit-content;margin-bottom:16px">
    ${rTabs.map(t=>`<button onclick="S.tmsRptTab='${t.id}';renderTMS()" style="padding:6px 14px;border-radius:5px;border:none;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;background:${(S.tmsRptTab||'pl')===t.id?'#fff':'none'};color:${(S.tmsRptTab||'pl')===t.id?'var(--navy)':'var(--gray-500)'};box-shadow:${(S.tmsRptTab||'pl')===t.id?'0 1px 3px rgba(0,0,0,.08)':'none'}">${t.label}</button>`).join('')}
  </div>`;

  if(rTab==='pl') renderTMSPL(tabBar,rBar,loads);
  else if(rTab==='ontime') renderTMSOntime(tabBar,rBar,loads);
  else if(rTab==='customer') renderTMSCustomerProfit(tabBar,rBar,loads);
  else if(rTab==='lane') renderTMSLaneTrend(tabBar,rBar,loads);
  else if(rTab==='heatmap') renderTMSHeatmap(tabBar,rBar,loads);
  else if(rTab==='annual') renderAnnualCarrierReview(tabBar+rBar,loads);
}

function renderTMSPL(tabBar,rBar,loads){
  const today=new Date();const mo=today.getMonth();const yr=today.getFullYear();
  const months=[];for(let i=5;i>=0;i--){const d=new Date(yr,mo-i,1);months.push({label:d.toLocaleString('en-US',{month:'short',year:'2-digit'}),key:d.toISOString().slice(0,7)});}
  const byMonth=months.map(m=>{const ml=loads.filter(l=>l.date&&l.date.startsWith(m.key));return{...m,rev:ml.reduce((s,l)=>s+(l.customerRate||0),0),cost:ml.reduce((s,l)=>s+(l.carrierRate||0),0),profit:ml.reduce((s,l)=>s+getShipmentProfit(l,'freight').profit,0),count:ml.length};});
  const totRev=byMonth.reduce((s,m)=>s+m.rev,0);const totProfit=byMonth.reduce((s,m)=>s+m.profit,0);
  const maxRev=Math.max(...byMonth.map(m=>m.rev),1);
  $('page').innerHTML=tabBar+rBar+`
  <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:16px">
    <div class="kpi"><div class="kpi-lbl">6-mo revenue</div><div class="kpi-val" style="color:var(--steel);font-size:18px">${fmtD(totRev)}</div></div>
    <div class="kpi"><div class="kpi-lbl">6-mo profit</div><div class="kpi-val" style="color:var(--green);font-size:18px">${fmtD(totProfit)}</div></div>
    <div class="kpi"><div class="kpi-lbl">Avg margin</div><div class="kpi-val" style="color:#7c3aed;font-size:18px">${totRev>0?pct(totProfit/totRev):'—'}</div></div>
  </div>
  <div class="card" style="margin-bottom:14px">
    <div style="display:flex;align-items:flex-end;gap:6px;height:100px;margin-bottom:8px">
      ${byMonth.map(m=>`<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:2px">
        <div style="font-size:9px;color:var(--gray-400);font-weight:600">${m.rev>0?fmtD(m.rev):''}</div>
        <div style="width:70%;background:var(--steel);border-radius:3px 3px 0 0;height:${Math.round(m.rev/maxRev*70)+2}px;opacity:.8;min-height:2px"></div>
        <div style="width:70%;background:var(--green);border-radius:0;height:${Math.round(m.profit/maxRev*70)+2}px;opacity:.9;min-height:2px;margin-top:1px"></div>
        <div style="font-size:10px;color:var(--gray-500)">${m.label}</div>
      </div>`).join('')}
    </div>
    <div style="display:flex;gap:12px;font-size:11px"><span style="color:var(--steel)">■ Revenue</span><span style="color:var(--green)">■ Profit</span></div>
  </div>
  <div class="tbl-wrap"><table><thead><tr><th>Month</th><th>Loads</th><th>Revenue</th><th>Carrier cost</th><th>Profit</th><th>Margin</th></tr></thead><tbody>
    ${byMonth.map(m=>`<tr><td class="bold">${m.label}</td><td>${m.count}</td><td class="money">${fmtD(m.rev)}</td><td class="money" style="color:#d97706">${fmtD(m.cost)}</td><td class="money" style="color:var(--green);font-weight:700">${fmtD(m.profit)}</td><td style="font-weight:700;color:#7c3aed">${m.rev>0?pct(m.profit/m.rev):'—'}</td></tr>`).join('')}
  </tbody></table></div>
  <div style="margin-top:12px"><button onclick="exportTMSPL()" class="btn">📥 Export monthly P&L (CSV)</button></div>`;
}

function exportTMSPL(){
  const loads=getTMSLoads();
  const rows=[['Date','Booking#','Customer','Mode','Lane','Carrier','Revenue','Carrier Cost','Profit','Margin%','Status'],...loads.map(l=>{const m=getTMSMeta(l.id);const p=getShipmentProfit(l,'freight');return[l.date,m.bookingNum||'',l.customer||'',l.fqMode||'',(l.pickupZip||'')+'→'+(l.deliveryZip||''),l.carrier||'',l.customerRate||0,l.carrierRate||0,p.profit.toFixed(2),(p.margin*100).toFixed(1)+'%',l.status];})];
  const csv=rows.map(r=>r.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(',')).join('\n');
  const a=document.createElement('a');a.href='data:text/csv;charset=utf-8,'+encodeURIComponent(csv);a.download='TMS_PL_'+localDateStr()+'.csv';a.click();
  showToast('P&L exported','success');
}

function renderTMSOntime(tabBar,rBar,loads){
  const delivered=loads.filter(l=>['Delivered','Invoiced','Paid'].includes(l.status));
  const carriers={};
  delivered.forEach(l=>{
    const c=l.carrier||'Unknown';if(!carriers[c]) carriers[c]={total:0,onTime:0,late:0};
    carriers[c].total++;
    const meta=getTMSMeta(l.id);const eta=meta.eta;const delAt=meta['delivered_at'];
    if(!eta||!delAt){carriers[c].onTime++;}
    else if(new Date(delAt)<=new Date(eta)){carriers[c].onTime++;}
    else{carriers[c].late++;}
  });
  const sorted=Object.entries(carriers).sort((a,b)=>b[1].total-a[1].total);
  $('page').innerHTML=tabBar+rBar+`
  <div style="font-size:14px;font-weight:800;color:var(--navy);margin-bottom:12px">On-time delivery by carrier</div>
  <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px">
    ${sorted.map(([name,d])=>{const rate=d.total>0?Math.round(d.onTime/d.total*100):0;const col=rate>=90?'var(--green)':rate>=70?'var(--amber)':'var(--red)';
    return`<div class="card"><div style="font-size:14px;font-weight:800;color:var(--navy);margin-bottom:8px">${escH(name)}</div>
      <div style="font-size:28px;font-weight:900;color:${col}">${rate}%</div>
      <div style="font-size:11px;color:var(--gray-400);margin-bottom:8px">on-time · ${d.total} loads</div>
      <div style="height:6px;background:var(--gray-100);border-radius:3px;overflow:hidden"><div style="height:6px;width:${rate}%;background:${col};border-radius:3px;transition:width 1s"></div></div>
      <div style="font-size:11px;color:var(--gray-500);margin-top:6px">${d.late} late · ${d.onTime} on time</div>
    </div>`;}).join('')||'<div class="empty"><div class="empty-ico">📊</div><p>Mark loads as Delivered to see on-time stats</p></div>'}
  </div>`;
}

function renderTMSCustomerProfit(tabBar,rBar,loads){
  const custs={};
  loads.forEach(l=>{const c=l.customer||'Unknown';if(!custs[c])custs[c]={loads:0,rev:0,profit:0};custs[c].loads++;custs[c].rev+=(l.customerRate||0);custs[c].profit+=getShipmentProfit(l,'freight').profit;});
  const sorted=Object.entries(custs).sort((a,b)=>b[1].profit-a[1].profit);
  const maxR=Math.max(...sorted.map(([,d])=>d.rev),1);
  $('page').innerHTML=tabBar+rBar+`
  <div style="font-size:14px;font-weight:800;color:var(--navy);margin-bottom:12px">Customer profitability ranking</div>
  ${sorted.map(([name,d],i)=>{const margin=d.rev>0?d.profit/d.rev:0;const mc=margin>=.15?'var(--green)':margin>=.05?'var(--amber)':'var(--red)';
  return`<div style="display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid var(--gray-100)">
    <div style="font-size:20px;font-weight:900;color:var(--gray-300);min-width:28px">#${i+1}</div>
    <div style="flex:1">
      <div style="font-size:14px;font-weight:700;color:var(--navy)">${escH(name)}</div>
      <div style="height:6px;background:var(--gray-100);border-radius:3px;margin-top:6px;overflow:hidden"><div style="height:6px;width:${Math.round(d.rev/maxR*100)}%;background:var(--steel);border-radius:3px"></div></div>
    </div>
    <div style="text-align:right;min-width:120px">
      <div style="font-size:14px;font-weight:800;color:var(--steel)">${fmtD(d.rev)}</div>
      <div style="font-size:12px;font-weight:700;color:${mc}">${fmtD(d.profit)} · ${pct(margin)}</div>
      <div style="font-size:11px;color:var(--gray-400)">${d.loads} load${d.loads>1?'s':''}</div>
    </div>
  </div>`;}).join('')||'<div class="empty"><div class="empty-ico">📊</div><p>No load data yet</p></div>'}`;
}

function renderTMSLaneTrend(tabBar,rBar,loads){
  const lanes={};
  loads.forEach(l=>{const k=(l.pickupZip||'?')+'→'+(l.deliveryZip||'?');if(!lanes[k])lanes[k]=[];lanes[k].push(l);});
  const topLanes=Object.entries(lanes).sort((a,b)=>b[1].length-a[1].length).slice(0,6);
  $('page').innerHTML=tabBar+rBar+`
  <div style="font-size:14px;font-weight:800;color:var(--navy);margin-bottom:12px">Top lane performance</div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
    ${topLanes.map(([lane,ls])=>{
      const rev=ls.reduce((s,l)=>s+(l.customerRate||0),0);const profit=ls.reduce((s,l)=>s+getShipmentProfit(l,'freight').profit,0);
      const margin=rev>0?profit/rev:0;const mc=margin>=.15?'var(--green)':margin>=.05?'var(--amber)':'var(--red)';
      const byMo={};ls.forEach(l=>{const mo=l.date?.slice(0,7)||'?';if(!byMo[mo])byMo[mo]=0;byMo[mo]+=(l.customerRate||0);});
      const maxMo=Math.max(...Object.values(byMo),1);
      return`<div class="card"><div style="font-size:14px;font-weight:800;color:var(--navy);margin-bottom:4px">${escH(lane)}</div>
        <div style="display:flex;gap:8px;margin-bottom:8px">
          <span style="font-size:12px;font-weight:700;color:var(--steel)">${fmtD(rev)}</span>
          <span style="font-size:12px;color:${mc};font-weight:700">${pct(margin)}</span>
          <span style="font-size:12px;color:var(--gray-400)">${ls.length} loads</span>
        </div>
        <div style="display:flex;align-items:flex-end;gap:3px;height:40px">
          ${Object.entries(byMo).slice(-6).map(([mo,v])=>`<div style="flex:1;background:var(--steel);border-radius:2px 2px 0 0;height:${Math.round(v/maxMo*36)+2}px;opacity:.75;min-height:2px" title="${mo}: ${fmtD(v)}"></div>`).join('')}
        </div>
      </div>`;}).join('')||'<div style="padding:40px;text-align:center;color:var(--gray-400)">No lane data yet</div>'}
  </div>`;
}

function renderTMSHeatmap(tabBar,rBar,loads){
  const days=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const counts=Array(7).fill(0);const revs=Array(7).fill(0);
  loads.forEach(l=>{if(!l.date)return;const d=new Date(l.date+'T12:00:00').getDay();counts[d]++;revs[d]+=(l.customerRate||0);});
  const maxC=Math.max(...counts,1);
  $('page').innerHTML=tabBar+rBar+`
  <div style="font-size:14px;font-weight:800;color:var(--navy);margin-bottom:16px">Load volume by day of week</div>
  <div class="card" style="margin-bottom:14px">
    <div style="display:flex;align-items:flex-end;gap:10px;height:120px;margin-bottom:8px">
      ${days.map((d,i)=>`<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px">
        <div style="font-size:11px;font-weight:700;color:${counts[i]===Math.max(...counts)?'var(--green)':'var(--gray-500)'};">${counts[i]}</div>
        <div style="width:80%;background:${counts[i]===Math.max(...counts)?'var(--green)':counts[i]>maxC/2?'var(--steel)':'var(--gray-200)'};border-radius:4px 4px 0 0;height:${Math.round(counts[i]/maxC*90)+4}px;min-height:4px;transition:height .5s"></div>
        <div style="font-size:12px;font-weight:600;color:var(--gray-500)">${d}</div>
      </div>`).join('')}
    </div>
  </div>
  <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:8px">
    ${days.map((d,i)=>`<div class="kpi" style="text-align:center"><div class="kpi-lbl">${d}</div><div style="font-size:16px;font-weight:800;color:var(--navy)">${counts[i]}</div><div style="font-size:11px;color:var(--gray-400)">${fmtD(revs[i])}</div></div>`).join('')}
  </div>`;
}



// ════════════════════════════════════════════════════════════════════
// BATCH 1: MAIN APP FEATURES
// ════════════════════════════════════════════════════════════════════

// ── QUOTE EXPIRY COUNTDOWN ────────────────────────────────────────
function getQuoteExpiry(q){return q.expiryDate||null;}
function quoteExpiryBadge(q){
  if(!q.expiryDate) return '';
  const diff=new Date(q.expiryDate)-new Date();
  if(diff<0) return '<span style="font-size:10px;background:#fee2e2;color:#dc2626;padding:1px 7px;border-radius:99px;font-weight:700">Expired</span>';
  const days=Math.floor(diff/864e5);const hrs=Math.floor((diff%864e5)/3600000);
  const col=days<1?'#dc2626':days<3?'#d97706':'#16a34a';
  return `<span style="font-size:10px;background:${col}15;color:${col};padding:1px 7px;border-radius:99px;font-weight:700">⏱ ${days>0?days+'d ':''} ${hrs}h left</span>`;
}

// ── WIN / LOSS REASON TRACKING ────────────────────────────────────
const LOSS_REASONS=['Price too high','Carrier issue','Transit time','Customer went direct','Competitor','Load cancelled','Other'];
function openLostReasonModal(type,id){
  $('modal-root').innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()">
  <div class="modal" style="max-width:500px">
    <div class="modal-title">📉 Why was this quote lost?</div>
    <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px">
      ${LOSS_REASONS.map(r=>`<button onclick="markLostWithReason('${type}','${id}','${r}')" style="padding:10px 14px;border:1.5px solid var(--gray-200);border-radius:var(--radius);background:transparent;cursor:pointer;font-family:inherit;font-size:13px;font-weight:600;color:var(--navy);text-align:left" onmouseenter="this.style.background='var(--blue-bg)'" onmouseleave="this.style.background='transparent'">${r}</button>`).join('')}
    </div>
    <button class="btn" onclick="closeModal()">Cancel</button>
  </div></div>`;
}
function markLostWithReason(type,id,reason){
  closeModal();
  if(type==='drayage'){
    const q=S.quotes.find(q=>q.id===id);
    if(q){q.status='Lost';q.lossReason=reason;q.lostDate=localDateStr();dbSaveQuote(q);logAction('quote_lost',{id,reason});}
    renderLog();
  } else if(type==='freight'){
    const idx=(window._fqHistory||[]).findIndex(q=>q.id===id);
    if(idx>=0){window._fqHistory[idx].status='Lost';window._fqHistory[idx].lossReason=reason;localStorage.setItem('fq_history',JSON.stringify(window._fqHistory));renderFqLog();}
  }
  showToast('Marked lost: '+reason,'info',2000);
}

// ── CARRIER BLACKLIST ─────────────────────────────────────────────
function getBlacklist(){return JSON.parse(localStorage.getItem('carrier_blacklist')||'[]');}
function toggleBlacklist(name){
  const bl=getBlacklist();
  const idx=bl.indexOf(name);
  if(idx>=0){bl.splice(idx,1);showToast(name+' removed from blacklist','info');}
  else{bl.push(name);showToast('🚫 '+name+' blacklisted','warning');}
  localStorage.setItem('carrier_blacklist',JSON.stringify(bl));
}
function isBlacklisted(name){return getBlacklist().includes(name);}
function blacklistBadge(name){return isBlacklisted(name)?'<span style="font-size:10px;background:#fee2e2;color:#dc2626;padding:1px 7px;border-radius:99px;font-weight:700">🚫 Blacklisted</span>':'';}

// ── CUSTOMER TAGS ─────────────────────────────────────────────────
const CUST_TAGS=['Preferred','Enterprise','Spot','Inactive','New','High Volume','At Risk'];
function getCustomerTags(name){return JSON.parse(localStorage.getItem('cust_tags_'+name)||'[]');}
function setCustomerTags(name,tags){localStorage.setItem('cust_tags_'+name,JSON.stringify(tags));}
function custTagBadges(name){
  return getCustomerTags(name).map(t=>{
    const col={Preferred:'#16a34a',Enterprise:'#1d4ed8',Spot:'#d97706',Inactive:'#6b7280','New':'#7c3aed','High Volume':'#0369a1','At Risk':'#dc2626'}[t]||'#6b7280';
    return `<span style="font-size:10px;background:${col}15;color:${col};padding:1px 7px;border-radius:99px;font-weight:700">${t}</span>`;}).join(' ');
}
function openTagModal(customerName){
  const current=getCustomerTags(customerName);
  $('modal-root').innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()">
  <div class="modal" style="max-width:500px">
    <div class="modal-title">🏷️ Tags — ${escH(customerName)}</div>
    <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px">
      ${CUST_TAGS.map(t=>`<button onclick="this.classList.toggle('tag-on')" class="${current.includes(t)?'tag-on':''}" data-tag="${t}" style="padding:7px 14px;border-radius:99px;border:1.5px solid var(--gray-200);background:transparent;cursor:pointer;font-family:inherit;font-size:12px;font-weight:600" onmouseenter="this.style.background='var(--blue-bg)'" onmouseleave="this.style.background=this.classList.contains('tag-on')?'var(--blue-bg)':'transparent'">${t}</button>`).join('')}
    </div>
    <div class="modal-foot">
      <button class="btn" onclick="closeModal()">Cancel</button>
      <button class="btn blue" onclick="saveCustomerTags('${customerName}')">Save tags</button>
    </div>
  </div></div>`;
  document.querySelectorAll('.tag-on').forEach(b=>b.style.background='var(--blue-bg)');
}
function saveCustomerTags(name){
  const tags=[...document.querySelectorAll('[data-tag].tag-on')].map(b=>b.dataset.tag);
  setCustomerTags(name,tags);closeModal();showToast('Tags saved','success',2000);
}

// ── SHIPPER / CONSIGNEE ADDRESS BOOK ──────────────────────────────
function getAddressBook(){return JSON.parse(localStorage.getItem('address_book')||'[]');}
function saveAddressBook(list){localStorage.setItem('address_book',JSON.stringify(list));}
function addAddress(addr){const book=getAddressBook();if(!book.find(a=>a.name===addr.name)){book.unshift(addr);saveAddressBook(book);}return book;}
function openAddressBook(callback){
  const book=getAddressBook();
  $('modal-root').innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()">
  <div class="modal" style="max-width:480px">
    <div class="modal-title">📍 Address book</div>
    <div style="max-height:300px;overflow-y:auto">
      ${book.length?book.map(a=>`<div onclick="selectAddress(${JSON.stringify(JSON.stringify(a))},${callback})" style="padding:10px;border-bottom:1px solid var(--gray-100);cursor:pointer;border-radius:var(--radius)" onmouseenter="this.style.background='var(--blue-bg)'" onmouseleave="this.style.background=''">
        <div style="font-size:13px;font-weight:700;color:var(--navy)">${escH(a.name)}</div>
        <div style="font-size:12px;color:var(--gray-500)">${escH(a.address||'')} ${escH(a.city||'')} ${escH(a.zip||'')}</div>
      </div>`).join(''):'<div style="padding:20px;text-align:center;color:var(--gray-400)">No saved addresses yet</div>'}
    </div>
    <button class="btn" onclick="closeModal()" style="margin-top:12px">Close</button>
  </div></div>`;
}

// ── HAZMAT + OVERWEIGHT FLAGS ─────────────────────────────────────
// These are added as checkboxes on quote forms (applied in renderFqBuilder)
function hazmatBadge(q){return q.isHazmat?'<span style="font-size:10px;background:#fee2e2;color:#dc2626;padding:1px 7px;border-radius:99px;font-weight:700">☢️ HAZMAT</span>':'';}
function odBadge(q){return q.isOD?'<span style="font-size:10px;background:#fef3c7;color:#d97706;padding:1px 7px;border-radius:99px;font-weight:700">⚠️ OD/Overweight</span>':'';}

// ── CONTAINER LAST FREE DAY (LFD) ─────────────────────────────────
function lfdBadge(q){
  if(!q.lfd) return '';
  const diff=new Date(q.lfd)-new Date();
  const days=Math.floor(diff/864e5);
  if(days<0) return '<span style="font-size:10px;background:#fee2e2;color:#dc2626;padding:1px 7px;border-radius:99px;font-weight:700">🚨 LFD PAST</span>';
  if(days<=2) return `<span style="font-size:10px;background:#fee2e2;color:#dc2626;padding:1px 7px;border-radius:99px;font-weight:700">⚠️ LFD: ${q.lfd} (${days}d)</span>`;
  return `<span style="font-size:10px;background:#fef3c7;color:#d97706;padding:1px 7px;border-radius:99px;font-weight:700">📅 LFD: ${q.lfd}</span>`;
}

// ── DRAYAGE PER-DIEM TRACKER ─────────────────────────────────────
function calcPerDiem(q){
  if(!q.freeDays||!q.pickupDate) return 0;
  const dayOut=Math.max(0,Math.floor((new Date()-new Date(q.pickupDate))/864e5)-parseInt(q.freeDays||0));
  return dayOut*(parseFloat(q.perDiemRate)||95);
}
function perDiemBadge(q){
  const pd=calcPerDiem(q);
  if(!pd) return '';
  return `<span style="font-size:10px;background:#fee2e2;color:#dc2626;padding:1px 7px;border-radius:99px;font-weight:700">💰 Per-diem: ${fmtD(pd)}</span>`;
}

// ── QUOTE WIN RATE BY AGENT ────────────────────────────────────────
function getAgentWinRates(){
  const agents={};
  (S.quotes||[]).forEach(q=>{
    const a=q.created_by_name||'Unknown';
    if(!agents[a]) agents[a]={total:0,booked:0,lost:0,lossReasons:{}};
    agents[a].total++;
    if(['Booked','Delivered','Invoiced','Paid'].includes(q.status)){agents[a].booked++;}
    if(q.status==='Lost'){agents[a].lost++;if(q.lossReason)agents[a].lossReasons[q.lossReason]=(agents[a].lossReasons[q.lossReason]||0)+1;}
  });
  return agents;
}

// ── QUOTE ACTIVITY TIMELINE ────────────────────────────────────────
function getQuoteActivity(id){return JSON.parse(localStorage.getItem('qact_'+id)||'[]');}
function addQuoteActivity(id,action,detail){
  const acts=getQuoteActivity(id);
  acts.push({action,detail,user:(_currentUser?.name||'System'),ts:new Date().toISOString()});
  if(acts.length>50) acts.shift();
  localStorage.setItem('qact_'+id,JSON.stringify(acts));
}
function renderQuoteActivity(id){
  const acts=getQuoteActivity(id);
  if(!acts.length) return '<div style="color:var(--gray-400);font-size:12px;padding:8px 0">No activity yet</div>';
  return acts.slice().reverse().map(a=>`<div style="padding:6px 0;border-bottom:1px solid var(--gray-100)">
    <div style="display:flex;justify-content:space-between">
      <span style="font-size:12px;font-weight:600;color:var(--navy)">${escH(a.action)}</span>
      <span style="font-size:11px;color:var(--gray-400)">${new Date(a.ts).toLocaleString('en-US',{timeZone:'America/New_York',month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})}</span>
    </div>
    ${a.detail?`<div style="font-size:11px;color:var(--gray-500)">${escH(a.detail)}</div>`:''}
    <div style="font-size:10px;color:var(--gray-400)">${escH(a.user)}</div>
  </div>`).join('');
}

// ── CUSTOMER CREDIT LIMIT ─────────────────────────────────────────
function getCreditLimit(name){return parseFloat(localStorage.getItem('credit_limit_'+name)||'0');}
function setCreditLimit(name,limit){localStorage.setItem('credit_limit_'+name,limit);}
function getCustomerAR(name){
  return (S.quotes||[]).filter(q=>q.customer===name&&q.status==='Invoiced').reduce((s,q)=>s+(q.customerRate||0),0)
        +(window._fqHistory||[]).filter(q=>q.customer===name&&q.status==='Invoiced').reduce((s,q)=>s+(q.customerRate||0),0);
}
function creditLimitWarning(name){
  const limit=getCreditLimit(name);if(!limit) return '';
  const ar=getCustomerAR(name);const pct2=ar/limit;
  if(pct2>=1) return '<span style="font-size:10px;background:#fee2e2;color:#dc2626;padding:1px 7px;border-radius:99px;font-weight:700">🚫 Credit limit exceeded</span>';
  if(pct2>=0.8) return '<span style="font-size:10px;background:#fef3c7;color:#d97706;padding:1px 7px;border-radius:99px;font-weight:700">⚠️ Near credit limit</span>';
  return '';
}

// ── GOOGLE MAPS LANE DISTANCE ─────────────────────────────────────
async function calcLaneDistance(pickupZip,deliveryZip){
  try{
    const url=`https://nominatim.openstreetmap.org/search?postalcode=${pickupZip}&country=US&format=json&limit=1`;
    const url2=`https://nominatim.openstreetmap.org/search?postalcode=${deliveryZip}&country=US&format=json&limit=1`;
    const [r1,r2]=await Promise.all([fetch(url).then(r=>r.json()),fetch(url2).then(r=>r.json())]);
    if(!r1[0]||!r2[0]) return null;
    const lat1=r1[0].lat,lon1=r1[0].lon,lat2=r2[0].lat,lon2=r2[0].lon;
    // Haversine formula
    const R=3958.8;const dLat=(lat2-lat1)*Math.PI/180;const dLon=(lon2-lon1)*Math.PI/180;
    const a=Math.sin(dLat/2)**2+Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
    const miles=R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
    return Math.round(miles*1.15); // road distance ~15% more than straight line
  }catch(e){return null;}
}

// ── END OF DAY SUMMARY ────────────────────────────────────────────
function generateEODSummary(){
  const today=localDateStr();
  const todayQ=(S.quotes||[]).filter(q=>q.date===today);
  const todayFQ=(window._fqHistory||[]).filter(q=>q.date===today);
  const booked=[...todayQ,...todayFQ].filter(q=>['Booked','Delivered','Invoiced','Paid'].includes(q.status));
  const rev=booked.reduce((s,q)=>s+(q.customerRate||0),0);
  const profit=booked.reduce((s,q)=>s+getShipmentProfit(q,'freight').profit,0);
  $('modal-root').innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()">
  <div class="modal" style="max-width:480px">
    <div class="modal-title">📊 End of day summary — ${today}</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">
      <div class="kpi"><div class="kpi-lbl">Quotes created today</div><div class="kpi-val">${todayQ.length+todayFQ.length}</div></div>
      <div class="kpi"><div class="kpi-lbl">Loads booked today</div><div class="kpi-val" style="color:var(--green)">${booked.length}</div></div>
      <div class="kpi"><div class="kpi-lbl">Revenue booked</div><div class="kpi-val" style="color:var(--steel);font-size:18px">${fmtD(rev)}</div></div>
      <div class="kpi"><div class="kpi-lbl">Profit booked</div><div class="kpi-val" style="color:var(--green);font-size:18px">${fmtD(profit)}</div></div>
    </div>
    <div style="background:var(--gray-50);border-radius:var(--radius);padding:12px;font-size:13px;color:var(--gray-600)">
      ${booked.length?'Today\'s loads: '+booked.map(q=>q.customer||'—').join(', '):'No loads booked today — tomorrow\'s a new day!'}
    </div>
    <div class="modal-foot"><button class="btn" onclick="closeModal()">Close</button></div>
  </div></div>`;
}

// ── BULK INVOICE SEND ─────────────────────────────────────────────
function openBulkInvoice(){
  const eligible=[...(S.quotes||[]),...(window._fqHistory||[])].filter(q=>q.status==='Delivered'&&!getInvoice(q.id));
  $('modal-root').innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()">
  <div class="modal" style="max-width:520px">
    <div class="modal-title">📤 Bulk invoice send</div>
    <div style="font-size:13px;color:var(--gray-500);margin-bottom:12px">${eligible.length} delivered loads without invoices</div>
    ${eligible.length?`<div style="max-height:280px;overflow-y:auto;margin-bottom:14px">
      ${eligible.map(q=>`<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--gray-100)">
        <input type="checkbox" data-id="${q.id}" class="bulk-inv-cb" checked>
        <div><div style="font-size:13px;font-weight:700;color:var(--navy)">${escH(q.customer||'—')}</div>
        <div style="font-size:11px;color:var(--gray-400)">${q.date} · ${fmtD(q.customerRate||0)}</div></div>
      </div>`).join('')}
    </div>
    <div class="modal-foot">
      <button class="btn" onclick="closeModal()">Cancel</button>
      <button class="btn blue" onclick="sendBulkInvoices()">📤 Send selected invoices</button>
    </div>`:`<div class="empty"><div class="empty-ico">✅</div><p>All delivered loads already invoiced</p></div><button class="btn" onclick="closeModal()">Close</button>`}
  </div></div>`;
}
function sendBulkInvoices(){
  const ids=[...document.querySelectorAll('.bulk-inv-cb:checked')].map(cb=>cb.dataset.id);
  ids.forEach(id=>{if(!getInvoice(id)) saveInvoice(id,{invNum:'INV-'+Date.now().toString().slice(-5),invDate:localDateStr(),status:'Invoiced',grandTotal:([...(S.quotes||[]),...(window._fqHistory||[])].find(q=>q.id===id)?.customerRate||0)});});
  closeModal();showToast(`📤 ${ids.length} invoices queued`,'success',3000);
}

// ── CUSTOM FIELDS ON QUOTES ───────────────────────────────────────
function getCustomFields(){return JSON.parse(localStorage.getItem('custom_quote_fields')||'[]');}
function saveCustomFields(fields){localStorage.setItem('custom_quote_fields',JSON.stringify(fields));}
function renderCustomFieldsAdmin(){
  const fields=getCustomFields();
  return `<div class="card" style="margin-bottom:14px">
    <div style="font-size:14px;font-weight:800;color:var(--navy);margin-bottom:12px">🔧 Custom quote fields</div>
    ${fields.map((f,i)=>`<div style="display:flex;align-items:center;gap:8px;padding:7px 0;border-bottom:1px solid var(--gray-100)">
      <span style="font-size:13px;flex:1;color:var(--navy);font-weight:600">${escH(f.label)}</span>
      <span style="font-size:11px;color:var(--gray-400)">${f.type}</span>
      <button onclick="removeCustomField(${i})" style="border:none;background:transparent;cursor:pointer;color:var(--red)">🗑️</button>
    </div>`).join('')}
    <div style="display:flex;gap:8px;margin-top:12px">
      <input type="text" id="cf-label" placeholder="Field name" style="flex:1;padding:7px 10px;border:1px solid var(--gray-200);border-radius:var(--radius);font-size:13px">
      <select id="cf-type" style="padding:7px;border:1px solid var(--gray-200);border-radius:var(--radius);font-size:13px"><option>text</option><option>number</option><option>checkbox</option></select>
      <button onclick="addCustomField()" class="btn blue" style="font-size:12px">+ Add</button>
    </div>
  </div>`;
}
function addCustomField(){const label=($('cf-label')||{}).value?.trim();if(!label) return;const fields=getCustomFields();fields.push({label,type:($('cf-type')||{}).value||'text'});saveCustomFields(fields);if(S.view==='admin') render();}
function removeCustomField(i){const f=getCustomFields();f.splice(i,1);saveCustomFields(f);if(S.view==='admin') render();}
function renderCustomFieldsOnQuote(quoteId){
  const fields=getCustomFields();if(!fields.length) return '';
  const vals=JSON.parse(localStorage.getItem('cfvals_'+quoteId)||'{}');
  return `<div class="card"><div style="font-size:12px;font-weight:700;color:var(--gray-400);text-transform:uppercase;letter-spacing:.05em;margin-bottom:8px">Custom fields</div>
    ${fields.map(f=>`<div class="field"><label style="font-size:12px">${escH(f.label)}</label>
      ${f.type==='checkbox'?`<input type="checkbox" ${vals[f.label]?'checked':''} onchange="saveCFVal('${quoteId}','${f.label}',this.checked)">`:`<input type="${f.type}" value="${escH(vals[f.label]||'')}" placeholder="${escH(f.label)}" onchange="saveCFVal('${quoteId}','${f.label}',this.value)">`}
    </div>`).join('')}
  </div>`;
}
function saveCFVal(id,label,val){const v=JSON.parse(localStorage.getItem('cfvals_'+id)||'{}');v[label]=val;localStorage.setItem('cfvals_'+id,JSON.stringify(v));}

// ── REVENUE LEADERBOARD (AGENTS) ──────────────────────────────────
function renderAgentLeaderboard(){
  const agents=getAgentWinRates();
  const weekAgo=new Date(Date.now()-7*864e5).toISOString().slice(0,10);
  const agentRev={};
  [...(S.quotes||[]),...(window._fqHistory||[])].filter(q=>q.date>=weekAgo&&['Booked','Delivered','Invoiced','Paid'].includes(q.status)).forEach(q=>{
    const a=q.created_by_name||'Unknown';agentRev[a]=(agentRev[a]||0)+(q.customerRate||0);
  });
  const sorted=Object.entries(agentRev).sort((a,b)=>b[1]-a[1]);
  const medals=['🥇','🥈','🥉'];
  return sorted.length?sorted.map(([name,rev],i)=>`<div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--gray-100)">
    <div style="font-size:22px">${medals[i]||'#'+(i+1)}</div>
    <div style="flex:1"><div style="font-size:14px;font-weight:700;color:var(--navy)">${escH(name)}</div>
      <div style="height:5px;background:var(--gray-100);border-radius:3px;margin-top:4px;overflow:hidden"><div style="height:5px;width:${Math.round(rev/sorted[0][1]*100)}%;background:var(--steel);border-radius:3px"></div></div>
    </div>
    <div style="font-size:15px;font-weight:800;color:var(--steel)">${fmtD(rev)}</div>
    <div style="font-size:11px;color:var(--gray-400)">${((agents[name]?.booked||0)/Math.max(agents[name]?.total||1,1)*100).toFixed(0)}% win</div>
  </div>`).join(''):'<div style="color:var(--gray-400);font-size:13px;padding:12px 0">No loads booked this week yet</div>';
}

// ── AI QUOTE ASSISTANT (uses Anthropic API) ────────────────────────
async function openAIQuoteAssistant(){
  $('modal-root').innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()">
  <div class="modal" style="max-width:520px">
    <div class="modal-title">🤖 AI Quote Assistant</div>
    <div style="font-size:13px;color:var(--gray-500);margin-bottom:12px">Describe the load in plain English — I'll fill in the quote details.</div>
    <div class="field">
      <textarea id="ai-prompt" rows="4" style="width:100%;box-sizing:border-box;resize:vertical;font-size:13px" placeholder="e.g. FTL dry van from Newark NJ to Chicago IL, 42000 lbs, tanker trailers, pickup Monday, customer is Advanced Group Corp, we're charging $3800"></textarea>
    </div>
    <div id="ai-result" style="display:none;background:var(--blue-bg);border-radius:var(--radius);padding:12px;margin-top:10px;font-size:13px"></div>
    <div class="modal-foot">
      <button class="btn" onclick="closeModal()">Cancel</button>
      <button class="btn blue" id="ai-btn" onclick="runAIQuote()">🤖 Parse quote</button>
    </div>
  </div></div>`;
}
async function runAIQuote(){
  const prompt=($('ai-prompt')||{}).value?.trim();if(!prompt){alert('Describe the load first.');return;}
  const btn=$('ai-btn');if(btn){btn.textContent='Thinking...';btn.disabled=true;}
  try{
    const res=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:'claude-sonnet-4-6',max_tokens:1000,messages:[{role:'user',content:`Extract freight quote details from this description and return ONLY a JSON object with these fields (use null for unknown): {mode, pickupZip, deliveryZip, customer, weight, pieces, commodity, customerRate, carrierRate, notes}. Description: ${prompt}`}]})});
    const data=await res.json();
    const text=data.content?.[0]?.text||'';
    const json=JSON.parse(text.replace(/```json|```/g,'').trim());
    const result=$('ai-result');
    if(result){
      result.style.display='block';
      result.innerHTML=`<div style="font-weight:700;color:var(--navy);margin-bottom:8px">✅ Parsed — review and apply:</div>`+
        Object.entries(json).filter(([k,v])=>v!=null).map(([k,v])=>`<div style="font-size:12px;margin-bottom:3px"><strong>${k}:</strong> ${v}</div>`).join('');
    }
    window._aiParsed=json;
    if(btn){btn.textContent='Apply to quote →';btn.disabled=false;btn.onclick=applyAIQuote;}
  }catch(e){if(btn){btn.textContent='🤖 Parse quote';btn.disabled=false;}showToast('AI error: '+e.message,'error');}
}
function applyAIQuote(){
  const q=window._aiParsed;if(!q) return;
  if(q.mode) S.fq.fqMode=q.mode;
  if(q.pickupZip) S.fq.pickupZip=q.pickupZip;
  if(q.deliveryZip) S.fq.deliveryZip=q.deliveryZip;
  if(q.customer) S.fq.customer=q.customer;
  if(q.weight) S.fq.weight=q.weight;
  if(q.commodity) S.fq.commodity=q.commodity;
  if(q.customerRate) S.fq.customerRate=q.customerRate;
  if(q.carrierRate) S.fq.carrierRate=q.carrierRate;
  closeModal();S.view='freight';S.fqTab='builder';render();
  showToast('✅ Quote pre-filled by AI — review and save','success',4000);
}

// ── QUOTE COMPARISON TOOL ─────────────────────────────────────────
function openQuoteComparison(ids){
  const quotes=ids.map(id=>[...(S.quotes||[]),...(window._fqHistory||[])].find(q=>q.id===id)).filter(Boolean);
  if(quotes.length<2){showToast('Select at least 2 quotes to compare','info');return;}
  const fields=['customer','pickupZip','deliveryZip','carrierRate','customerRate','carrier','weight','status'];
  $('modal-root').innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()">
  <div class="modal" style="max-width:620px;overflow-x:auto">
    <div class="modal-title">📊 Quote comparison</div>
    <table style="width:100%;border-collapse:collapse;font-size:12px">
      <thead><tr><th style="text-align:left;padding:8px;color:var(--gray-400);font-weight:600">Field</th>
        ${quotes.map(q=>`<th style="text-align:left;padding:8px;color:var(--navy);font-weight:800">${escH(q.customer||q.id.slice(-6))}</th>`).join('')}
      </tr></thead>
      <tbody>${fields.map(f=>`<tr style="border-top:1px solid var(--gray-100)"><td style="padding:8px;font-weight:600;color:var(--gray-500)">${f}</td>
        ${quotes.map(q=>`<td style="padding:8px;color:var(--navy)">${escH(String(q[f]||'—'))}</td>`).join('')}
      </tr>`).join('')}
      <tr style="border-top:2px solid var(--gray-200);background:var(--blue-bg)"><td style="padding:8px;font-weight:700">Profit</td>
        ${quotes.map(q=>{const p=getShipmentProfit(q,'freight');return`<td style="padding:8px;font-weight:800;color:${p.profit>=0?'var(--green)':'var(--red)'}">${fmtD(p.profit)} (${pct(p.margin)})</td>`;}).join('')}
      </tr></tbody>
    </table>
    <div class="modal-foot"><button class="btn" onclick="closeModal()">Close</button></div>
  </div></div>`;
}



// ════════════════════════════════════════════════════════════════════
// BATCH 2: TMS FEATURES
// ════════════════════════════════════════════════════════════════════

// ── AI LOAD MATCHING ──────────────────────────────────────────────
async function aiMatchCarrier(loadId){
  const q=(window._fqHistory||[]).find(q=>q.id===loadId);if(!q) return;
  const carriers=window._carriers||[];
  const history=(window._fqHistory||[]).filter(l=>l.carrier&&['Delivered','Invoiced','Paid'].includes(l.status));
  // Score carriers by lane history + on-time rate
  const scored=carriers.map(c=>{
    const laneLoads=history.filter(l=>l.carrier===c.name&&l.pickupZip===q.pickupZip&&l.deliveryZip===q.deliveryZip);
    const allLoads=history.filter(l=>l.carrier===c.name);
    const onTimeRate=allLoads.length>0?allLoads.filter(l=>!getTMSMeta(l.id).isLate).length/allLoads.length:0.8;
    const laneScore=laneLoads.length*2;
    const score=Math.round((onTimeRate*50)+(laneScore*10));
    const avgRate=laneLoads.length?laneLoads.reduce((s,l)=>s+(l.carrierRate||0),0)/laneLoads.length:0;
    return{name:c.name,score,loads:allLoads.length,lanePairs:laneLoads.length,onTimeRate:Math.round(onTimeRate*100),avgRate};
  }).filter(c=>!isBlacklisted(c.name)).sort((a,b)=>b.score-a.score).slice(0,5);

  $('modal-root').innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()">
  <div class="modal" style="max-width:480px">
    <div class="modal-title">🤖 AI Carrier Match — ${escH(q.pickupZip||'?')} → ${escH(q.deliveryZip||'?')}</div>
    <div style="font-size:12px;color:var(--gray-500);margin-bottom:12px">Ranked by lane history, on-time rate, and availability</div>
    ${scored.length?scored.map((c,i)=>`<div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--gray-100)">
      <div style="font-size:20px">${['🥇','🥈','🥉','4️⃣','5️⃣'][i]}</div>
      <div style="flex:1"><div style="font-size:13px;font-weight:700;color:var(--navy)">${escH(c.name)}</div>
        <div style="font-size:11px;color:var(--gray-500)">${c.lanePairs} lane runs · ${c.onTimeRate}% on-time · ${c.avgRate?fmtD(c.avgRate)+' avg rate':'New on lane'}</div>
      </div>
      <div style="text-align:right">
        <div style="font-size:14px;font-weight:800;color:var(--steel)">${c.score}</div>
        <div style="font-size:10px;color:var(--gray-400)">score</div>
      </div>
      <button onclick="assignCarrierToLoad('${loadId}','${escH(c.name)}');closeModal()" style="font-size:11px;padding:5px 10px;border:1px solid var(--steel);border-radius:var(--radius);background:transparent;cursor:pointer;color:var(--steel);font-family:inherit">Assign</button>
    </div>`).join(''):'<div style="padding:20px;text-align:center;color:var(--gray-400)">No carrier history available — add carriers to your network first</div>'}
    <div class="modal-foot"><button class="btn" onclick="closeModal()">Close</button></div>
  </div></div>`;
}
function assignCarrierToLoad(id,carrier){
  const idx=(window._fqHistory||[]).findIndex(q=>q.id===id);
  if(idx>=0){window._fqHistory[idx].carrier=carrier;try{localStorage.setItem('fq_history',JSON.stringify(window._fqHistory));dbUpdateFqStatus(id,window._fqHistory[idx].status);}catch(e){}}
  showToast('Carrier assigned: '+carrier,'success');if(S.view==='tms') renderTMS();
}

// ── PREDICTIVE ETA ────────────────────────────────────────────────
function calcPredictiveETA(q){
  const history=(window._fqHistory||[]).filter(l=>l.carrier===q.carrier&&['Delivered','Invoiced','Paid'].includes(l.status)&&getTMSMeta(l.id).delivered_at&&getTMSMeta(l.id).dispatched_at);
  if(history.length>0){
    const avgDays=history.slice(-10).reduce((s,l)=>{const m=getTMSMeta(l.id);return s+(new Date(m.delivered_at)-new Date(m.dispatched_at))/(864e5);},0)/Math.min(history.length,10);
    const baseDate=new Date();baseDate.setDate(baseDate.getDate()+Math.ceil(avgDays));
    return{eta:baseDate.toISOString().slice(0,10),source:'historical',days:Math.ceil(avgDays)};
  }
  // Fallback: estimate by distance
  const zip1=q.pickupZip,zip2=q.deliveryZip;
  if(zip1&&zip2){const diff=Math.abs(parseInt(zip1)-parseInt(zip2));const days=diff>200?3:diff>100?2:1;const d=new Date();d.setDate(d.getDate()+days);return{eta:d.toISOString().slice(0,10),source:'estimated',days};}
  return null;
}
function setPredictiveETA(id){
  const q=(window._fqHistory||[]).find(q=>q.id===id);if(!q) return;
  const pred=calcPredictiveETA(q);if(!pred){showToast('Not enough data for prediction','info');return;}
  saveTMSMeta(id,{eta:pred.eta});
  showToast(`📅 ETA set to ${pred.eta} (${pred.source}, ~${pred.days}d)`,'success',3000);
  if(S.view==='tms') openTMSLoadDetail(id);
}

// ── LOAD PROFITABILITY SCORE ──────────────────────────────────────
function calcLoadScore(l){
  const p=getShipmentProfit(l,'freight');
  let score=0;
  // Margin (0-40pts)
  if(p.margin>=.2) score+=40; else if(p.margin>=.15) score+=30; else if(p.margin>=.1) score+=20; else if(p.margin>=.05) score+=10;
  // Carrier reliability (0-30pts)
  const meta=getTMSMeta(l.id);
  const history=(window._fqHistory||[]).filter(h=>h.carrier===l.carrier&&['Delivered','Invoiced','Paid'].includes(h.status));
  const onTime=history.length?history.filter(h=>!getTMSMeta(h.id).isLate).length/history.length:0.8;
  score+=Math.round(onTime*30);
  // Lane familiarity (0-30pts)
  const laneCount=(window._fqHistory||[]).filter(h=>h.pickupZip===l.pickupZip&&h.deliveryZip===l.deliveryZip).length;
  score+=Math.min(laneCount*5,30);
  return Math.min(10,Math.round(score/10));
}
function scoreColor(s){return s>=8?'#16a34a':s>=5?'#d97706':'#dc2626';}
function scoreBadge(l){const s=calcLoadScore(l);return`<span style="font-size:11px;background:${scoreColor(s)}15;color:${scoreColor(s)};padding:2px 8px;border-radius:99px;font-weight:800">${s}/10</span>`;}

// ── LOAD COST PER MILE ────────────────────────────────────────────
function loadCPM(l){
  const meta=getTMSMeta(l.id);const miles=meta.miles||estimateMiles(l.pickupZip,l.deliveryZip);
  if(!miles||!l.carrierRate) return null;
  return {cpm:(l.carrierRate/miles).toFixed(2),miles};
}
function estimateMiles(z1,z2){if(!z1||!z2) return 0;const diff=Math.abs(parseInt(z1||0)-parseInt(z2||0));return diff*0.8;}
function cpmBadge(l){const c=loadCPM(l);return c?`<span style="font-size:10px;color:var(--gray-500)">$${c.cpm}/mi · ~${Math.round(c.miles)}mi</span>`:''}

// ── LOAD DUPLICATION ──────────────────────────────────────────────
function duplicateTMSLoad(id){
  const q=(window._fqHistory||[]).find(q=>q.id===id);if(!q) return;
  const newQ={...q,id:'fq-'+Date.now(),status:'Quoted',date:localDateStr()};
  delete newQ.tmsMeta;
  window._fqHistory=(window._fqHistory||[]);
  window._fqHistory.unshift(newQ);
  try{localStorage.setItem('fq_history',JSON.stringify(window._fqHistory));}catch(e){}
  showToast('Load duplicated — new quote created','success',2000);
  S.tmsTab='loads';renderTMS();
}

// ── SEAL NUMBER + DRIVER CONTACT + PALLET EXCHANGE ───────────────
// These are stored in TMS meta and shown on load detail
function openDriverContactModal(id){
  const meta=getTMSMeta(id);
  $('modal-root').innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()">
  <div class="modal" style="max-width:500px">
    <div class="modal-title">🚛 Driver details</div>
    <div class="field"><label>Driver name</label><input type="text" id="drv-name" value="${escH(meta.driverName||'')}" placeholder="Driver full name"></div>
    <div class="field"><label>Cell number</label><input type="tel" id="drv-phone" value="${escH(meta.driverPhone||'')}" placeholder="+1 (555) 000-0000"></div>
    <div class="field"><label>CDL #</label><input type="text" id="drv-cdl" value="${escH(meta.driverCDL||'')}" placeholder="CDL number"></div>
    <div class="field"><label>Truck # / Trailer #</label><input type="text" id="drv-truck" value="${escH(meta.truckNum||'')}" placeholder="e.g. T-1042 / TR-847"></div>
    <div class="field"><label>Seal #</label><input type="text" id="drv-seal" value="${escH(meta.sealNum||'')}" placeholder="Seal number at pickup"></div>
    <div class="field"><label>Pallets out</label><input type="number" id="drv-pal-out" value="${meta.palletsOut||''}" placeholder="0"></div>
    <div class="field"><label>Pallets returned</label><input type="number" id="drv-pal-in" value="${meta.palletsIn||''}" placeholder="0"></div>
    <div class="modal-foot">
      <button class="btn" onclick="closeModal()">Cancel</button>
      <button class="btn blue" onclick="saveDriverDetails('${id}')">Save</button>
    </div>
  </div></div>`;
}
function saveDriverDetails(id){
  saveTMSMeta(id,{
    driverName:($('drv-name')||{}).value?.trim(),
    driverPhone:($('drv-phone')||{}).value?.trim(),
    driverCDL:($('drv-cdl')||{}).value?.trim(),
    truckNum:($('drv-truck')||{}).value?.trim(),
    sealNum:($('drv-seal')||{}).value?.trim(),
    palletsOut:parseInt(($('drv-pal-out')||{}).value)||0,
    palletsIn:parseInt(($('drv-pal-in')||{}).value)||0,
  });
  closeModal();showToast('Driver details saved','success');
  openTMSLoadDetail(id);
}

// ── CARRIER PAY TERMS ─────────────────────────────────────────────
function getCarrierPayTerms(name){return localStorage.getItem('pay_terms_'+name)||'Net30';}
function setCarrierPayTerms(name,terms){localStorage.setItem('pay_terms_'+name,terms);}
function payTermsBadge(name){const t=getCarrierPayTerms(name);const col=t==='QuickPay'?'#7c3aed':t==='Net15'?'#0369a1':'#6b7280';return`<span style="font-size:10px;background:${col}12;color:${col};padding:1px 7px;border-radius:99px;font-weight:700">${t}</span>`;}

// ── ACCESSORIAL PRE-APPROVAL ──────────────────────────────────────
function getAccLimit(id){return parseFloat(localStorage.getItem('acc_limit_'+id)||'0');}
function setAccLimit(id,limit){localStorage.setItem('acc_limit_'+id,limit);}
function checkAccPreapproval(id,amount){
  const limit=getAccLimit(id);if(!limit) return true;
  if(amount>limit){
    showToast(`⚠️ Accessorial ${fmtD(amount)} exceeds pre-approved ${fmtD(limit)} — manager approval needed`,'warning',5000);
    return false;
  }
  return true;
}

// ── BLIND SHIPMENT MODE ───────────────────────────────────────────
function toggleBlindMode(id){
  const meta=getTMSMeta(id);
  saveTMSMeta(id,{isBlind:!meta.isBlind});
  showToast(meta.isBlind?'Blind mode off':'🙈 Blind shipment mode on','info',2000);
}
function blindBadge(id){return getTMSMeta(id).isBlind?'<span style="font-size:10px;background:#f5f3ff;color:#7c3aed;padding:1px 7px;border-radius:99px;font-weight:700">🙈 Blind</span>':'';}

// ── FREIGHT CLASS DISPUTE ─────────────────────────────────────────
function openFreightClassDispute(id){
  const meta=getTMSMeta(id);
  $('modal-root').innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()">
  <div class="modal" style="max-width:500px">
    <div class="modal-title">⚠️ Freight class dispute</div>
    <div class="g2">
      <div class="field"><label>Quoted class</label><input type="text" id="fc-quoted" value="${escH(meta.freightClass||'')}" placeholder="e.g. 70"></div>
      <div class="field"><label>Carrier billed class</label><input type="text" id="fc-billed" placeholder="e.g. 85"></div>
    </div>
    <div class="field"><label>Dispute note</label><textarea id="fc-note" rows="3" style="width:100%;box-sizing:border-box;resize:vertical" placeholder="Reason for dispute..."></textarea></div>
    <div class="modal-foot">
      <button class="btn" onclick="closeModal()">Cancel</button>
      <button class="btn blue" onclick="saveClassDispute('${id}')">Flag dispute</button>
    </div>
  </div></div>`;
}
function saveClassDispute(id){
  saveTMSMeta(id,{classDispute:true,quotedClass:($('fc-quoted')||{}).value,billedClass:($('fc-billed')||{}).value,disputeNote:($('fc-note')||{}).value?.trim()});
  closeModal();showToast('⚠️ Freight class dispute flagged','warning');
}

// ── CARRIER W-9 VAULT ─────────────────────────────────────────────
function getCarrierW9(name){return JSON.parse(localStorage.getItem('w9_'+name)||'{}');}
function saveCarrierW9(name,data){localStorage.setItem('w9_'+name,JSON.stringify({...data,updatedAt:localDateStr()}));}
function w9Badge(name){const w=getCarrierW9(name);return w.onFile?`<span style="font-size:10px;background:#f0fdf4;color:#16a34a;padding:1px 7px;border-radius:99px;font-weight:700">W-9 ✓</span>`:'<span style="font-size:10px;background:#fff5f5;color:#dc2626;padding:1px 7px;border-radius:99px;font-weight:700">W-9 missing</span>';}
function openW9Modal(carrierName){
  const w=getCarrierW9(carrierName);
  $('modal-root').innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()">
  <div class="modal" style="max-width:500px">
    <div class="modal-title">📋 W-9 — ${escH(carrierName)}</div>
    <div class="field"><label>EIN / Tax ID</label><input type="text" id="w9-ein" value="${escH(w.ein||'')}" placeholder="XX-XXXXXXX"></div>
    <div class="field"><label>Legal business name</label><input type="text" id="w9-name" value="${escH(w.legalName||'')}" placeholder="Legal entity name"></div>
    <div class="field"><label>Address</label><input type="text" id="w9-addr" value="${escH(w.address||'')}" placeholder="Business address"></div>
    <div class="field"><label style="display:flex;align-items:center;gap:8px"><input type="checkbox" id="w9-on" ${w.onFile?'checked':''}> W-9 on file</label></div>
    <div class="modal-foot">
      <button class="btn" onclick="closeModal()">Cancel</button>
      <button class="btn blue" onclick="saveW9('${carrierName}')">Save</button>
    </div>
  </div></div>`;
}
function saveW9(name){
  saveCarrierW9(name,{ein:($('w9-ein')||{}).value?.trim(),legalName:($('w9-name')||{}).value?.trim(),address:($('w9-addr')||{}).value?.trim(),onFile:!!($('w9-on')||{}).checked});
  closeModal();showToast('W-9 saved','success');
}

// ── CARRIER CERTIFICATIONS ────────────────────────────────────────
const CERT_TYPES=['CTPAT','FMCSA Active Authority','SmartWay','ISO 9001','Hazmat Certified','TSA Approved'];
function getCarrierCerts(name){return JSON.parse(localStorage.getItem('certs_'+name)||'[]');}
function saveCarrierCerts(name,certs){localStorage.setItem('certs_'+name,JSON.stringify(certs));}
function certBadges(name){
  return getCarrierCerts(name).map(c=>{
    const expiring=c.expiry&&new Date(c.expiry)<new Date(Date.now()+30*864e5);
    const expired=c.expiry&&new Date(c.expiry)<new Date();
    const col=expired?'#dc2626':expiring?'#d97706':'#16a34a';
    return`<span style="font-size:10px;background:${col}12;color:${col};padding:1px 7px;border-radius:99px;font-weight:700" title="${c.expiry?'Expires: '+c.expiry:''}">${c.type}${expired?' ⚠️':expiring?' ⏱':' ✓'}</span>`;
  }).join(' ');
}
function openCertModal(carrierName){
  const certs=getCarrierCerts(carrierName);
  $('modal-root').innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()">
  <div class="modal" style="max-width:500px">
    <div class="modal-title">🏆 Certifications — ${escH(carrierName)}</div>
    <div style="margin-bottom:14px">
      ${certs.map((c,i)=>`<div style="display:flex;align-items:center;gap:8px;padding:7px 0;border-bottom:1px solid var(--gray-100)">
        <span style="flex:1;font-size:13px;font-weight:600">${escH(c.type)}</span>
        <span style="font-size:12px;color:var(--gray-500)">${c.expiry||'No expiry'}</span>
        <button onclick="removeCert('${carrierName}',${i})" style="border:none;background:transparent;cursor:pointer;color:var(--red)">✕</button>
      </div>`).join('')}
    </div>
    <div class="g2">
      <div class="field"><label>Certification</label><select id="cert-type" style="width:100%;padding:8px;border:1px solid var(--gray-200);border-radius:var(--radius);font-size:13px">${CERT_TYPES.map(t=>`<option>${t}</option>`).join('')}</select></div>
      <div class="field"><label>Expiry date</label><input type="date" id="cert-exp"></div>
    </div>
    <div class="modal-foot">
      <button class="btn" onclick="closeModal()">Done</button>
      <button class="btn blue" onclick="addCert('${carrierName}')">+ Add cert</button>
    </div>
  </div></div>`;
}
function addCert(name){const certs=getCarrierCerts(name);certs.push({type:($('cert-type')||{}).value,expiry:($('cert-exp')||{}).value});saveCarrierCerts(name,certs);openCertModal(name);}
function removeCert(name,i){const certs=getCarrierCerts(name);certs.splice(i,1);saveCarrierCerts(name,certs);openCertModal(name);}

// ── DEDICATED LANE CONTRACTS ──────────────────────────────────────
function getLaneContracts(){return JSON.parse(localStorage.getItem('lane_contracts')||'[]');}
function saveLaneContracts(list){localStorage.setItem('lane_contracts',JSON.stringify(list));}
function laneContractMatch(pickupZip,deliveryZip,carrier){
  return getLaneContracts().find(c=>c.pickupZip===pickupZip&&c.deliveryZip===deliveryZip&&(!c.carrier||c.carrier===carrier));
}
function openLaneContractsPage(){
  const contracts=getLaneContracts();
  $('page').innerHTML=`
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
    <div style="font-size:18px;font-weight:900;color:var(--navy)">📄 Dedicated lane contracts</div>
    <button onclick="openAddLaneContract()" class="btn blue">+ New contract</button>
  </div>
  ${contracts.length?`<div class="tbl-wrap"><table><thead><tr><th>Lane</th><th>Carrier</th><th>Rate</th><th>Volume/mo</th><th>Expiry</th><th></th></tr></thead><tbody>
    ${contracts.map((c,i)=>`<tr>
      <td class="bold">${escH(c.pickupZip)} → ${escH(c.deliveryZip)}</td>
      <td>${escH(c.carrier||'Any')}</td>
      <td class="money">${fmtD(c.rate||0)}</td>
      <td>${c.volume||'—'} loads</td>
      <td style="color:${c.expiry&&new Date(c.expiry)<new Date()?'var(--red)':'var(--navy)'}">${c.expiry||'No expiry'}</td>
      <td><button onclick="removeLaneContract(${i})" style="border:none;background:transparent;cursor:pointer;color:var(--red)">🗑️</button></td>
    </tr>`).join('')}
  </tbody></table></div>`:'<div class="empty"><div class="empty-ico">📄</div><p>No dedicated lane contracts — add contracts to lock in rates and volumes</p></div>'}`;
}
function openAddLaneContract(){
  $('modal-root').innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()">
  <div class="modal" style="max-width:500px">
    <div class="modal-title">+ New lane contract</div>
    <div class="g2">
      <div class="field"><label>Pickup ZIP</label><input type="text" id="lc-pu" placeholder="07102"></div>
      <div class="field"><label>Delivery ZIP</label><input type="text" id="lc-del" placeholder="60601"></div>
    </div>
    <div class="g3">
      <div class="field"><label>Carrier</label><input type="text" id="lc-carrier" placeholder="Any"></div>
      <div class="field"><label>Rate ($)</label><input type="number" id="lc-rate" placeholder="0"></div>
      <div class="field"><label>Volume/mo</label><input type="number" id="lc-vol" placeholder="Loads"></div>
    </div>
    <div class="field"><label>Contract expiry</label><input type="date" id="lc-exp"></div>
    <div class="modal-foot"><button class="btn" onclick="closeModal()">Cancel</button><button class="btn blue" onclick="saveLaneContract()">Save</button></div>
  </div></div>`;
}
function saveLaneContract(){
  const c=getLaneContracts();
  c.push({pickupZip:($('lc-pu')||{}).value?.trim(),deliveryZip:($('lc-del')||{}).value?.trim(),carrier:($('lc-carrier')||{}).value?.trim(),rate:parseFloat(($('lc-rate')||{}).value)||0,volume:parseInt(($('lc-vol')||{}).value)||0,expiry:($('lc-exp')||{}).value});
  saveLaneContracts(c);closeModal();showToast('Contract saved','success');openLaneContractsPage();
}
function removeLaneContract(i){const c=getLaneContracts();c.splice(i,1);saveLaneContracts(c);openLaneContractsPage();}

// ── TRANSIT TIME BENCHMARKING ─────────────────────────────────────
function getTransitBenchmark(pickupZip,deliveryZip){
  const history=(window._fqHistory||[]).filter(l=>l.pickupZip===pickupZip&&l.deliveryZip===deliveryZip&&['Delivered','Invoiced','Paid'].includes(l.status));
  if(!history.length) return null;
  const times=history.map(l=>{const m=getTMSMeta(l.id);if(m.dispatched_at&&m.delivered_at) return (new Date(m.delivered_at)-new Date(m.dispatched_at))/864e5;return null;}).filter(Boolean);
  if(!times.length) return null;
  const avg=times.reduce((s,t)=>s+t,0)/times.length;
  return{avgDays:avg.toFixed(1),minDays:Math.min(...times).toFixed(1),maxDays:Math.max(...times).toFixed(1),loads:history.length};
}

// ── REAL-TIME MARGIN DASHBOARD ────────────────────────────────────
function renderRealTimeMargin(){
  const today=localDateStr();
  const todayLoads=[...(S.quotes||[]),...(window._fqHistory||[])].filter(q=>q.date===today&&['Booked','Delivered','Invoiced','Paid'].includes(q.status));
  const todayRev=todayLoads.reduce((s,q)=>s+(q.customerRate||0),0);
  const todayProfit=todayLoads.reduce((s,q)=>s+getShipmentProfit(q,'freight').profit,0);
  const monthLoads=[...(S.quotes||[]),...(window._fqHistory||[])].filter(q=>q.date&&q.date.startsWith(today.slice(0,7))&&['Booked','Delivered','Invoiced','Paid'].includes(q.status));
  const monthRev=monthLoads.reduce((s,q)=>s+(q.customerRate||0),0);
  const monthProfit=monthLoads.reduce((s,q)=>s+getShipmentProfit(q,'freight').profit,0);
  return `<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
    <div style="background:linear-gradient(135deg,#1a2e4a,#2e75b6);color:#fff;border-radius:12px;padding:16px">
      <div style="font-size:11px;opacity:.7;margin-bottom:4px">TODAY'S REVENUE</div>
      <div style="font-size:28px;font-weight:900">${fmtD(todayRev)}</div>
      <div style="font-size:12px;opacity:.8;margin-top:4px">Profit: ${fmtD(todayProfit)} · ${todayLoads.length} loads</div>
    </div>
    <div style="background:linear-gradient(135deg,#065f46,#059669);color:#fff;border-radius:12px;padding:16px">
      <div style="font-size:11px;opacity:.7;margin-bottom:4px">THIS MONTH</div>
      <div style="font-size:28px;font-weight:900">${fmtD(monthRev)}</div>
      <div style="font-size:12px;opacity:.8;margin-top:4px">Profit: ${fmtD(monthProfit)} · ${monthLoads.length} loads · ${monthRev>0?pct(monthProfit/monthRev):'0%'} margin</div>
    </div>
  </div>`;
}

// ── LOAD NOTE TEMPLATES ───────────────────────────────────────────

function noteTemplateMenu(targetId){
  $('modal-root').innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()">
  <div class="modal" style="max-width:500px">
    <div class="modal-title">📝 Note templates</div>
    <div style="display:flex;flex-direction:column;gap:6px">
      ${NOTE_TEMPLATES.map(t=>`<button onclick="insertNoteTemplate('${targetId}','${t.replace(/'/g,"\\'")}');closeModal()" style="padding:9px 14px;border:1.5px solid var(--gray-200);border-radius:var(--radius);background:transparent;cursor:pointer;font-family:inherit;font-size:12px;text-align:left" onmouseenter="this.style.background='var(--blue-bg)'" onmouseleave="this.style.background='transparent'">${t}</button>`).join('')}
    </div>
    <div class="modal-foot"><button class="btn" onclick="closeModal()">Cancel</button></div>
  </div></div>`;
}
function insertNoteTemplate(targetId,text){
  const el=$(targetId);if(!el) return;
  el.value=(el.value?el.value+'\n':'')+text;
  el.dispatchEvent(new Event('change'));
}

// ── PAYMENT CONFIRMATION TO CARRIER ──────────────────────────────
async function sendCarrierPaymentConfirmation(id){
  const q=(window._fqHistory||[]).find(q=>q.id===id);if(!q) return;
  const meta=getTMSMeta(id);const cinv=getCarrierInvoice(id);
  if(!await loadJsPDF()){showToast('PDF loading...','info');return;}
  const{jsPDF}=window.jspdf;const doc=new jsPDF({unit:'mm',format:'letter'});
  const W=216,M=14,green=[6,95,70];
  doc.setFillColor(...green);doc.rect(0,0,W,32,'F');
  doc.setTextColor(255,255,255);doc.setFont('helvetica','bold');doc.setFontSize(18);doc.text('PAYMENT CONFIRMATION',M,14);
  doc.setFontSize(10);doc.setFont('helvetica','normal');doc.text('Shifl Logistics — Accounts Payable',M,22);
  doc.text('Date: '+localDateStr(),W-M,14,{align:'right'});
  doc.setTextColor(0);let y=44;
  doc.setFont('helvetica','bold');doc.setFontSize(12);doc.text('Payment sent to: '+(q.carrier||'—'),M,y);y+=10;
  doc.setFont('helvetica','normal');doc.setFontSize(10);
  const items=[['Booking #',meta.bookingNum||id],['BOL #',meta.bolNum||'—'],['Lane',(q.pickupZip||'?')+' → '+(q.deliveryZip||'?')],['Invoice #',cinv?.invNum||'—'],['Amount paid',fmtD(cinv?.grandTotal||q.carrierRate||0)],['Payment date',localDateStr()],['Payment method','ACH / Check']];
  items.forEach(([l,v])=>{doc.setFont('helvetica','bold');doc.text(l+':',M,y);doc.setFont('helvetica','normal');doc.text(v,M+50,y);y+=8;});
  doc.setFillColor(240,253,244);doc.rect(M,y,W-M*2,14,'F');doc.setFont('helvetica','bold');doc.setFontSize(13);doc.setTextColor(...green);doc.text('✓ Payment processed',M+4,y+9);
  doc.save('PaymentConf_'+(meta.bookingNum||id)+'.pdf');
  showToast('Payment confirmation PDF downloaded','success');
}

// ── INVOICE AUTO-MATCH ────────────────────────────────────────────
function autoMatchCarrierInvoice(id,invoicedAmount){
  const q=(window._fqHistory||[]).find(q=>q.id===id);if(!q) return null;
  const agreedRate=q.carrierRate||0;
  const diff=invoicedAmount-agreedRate;
  const pctDiff=agreedRate>0?Math.abs(diff)/agreedRate:0;
  return{matched:Math.abs(diff)<5,diff,pctDiff,agreedRate,invoicedAmount,flag:pctDiff>.05};
}

// ── CARRIER ONBOARDING PACKET ─────────────────────────────────────
async function generateCarrierPacket(carrierName){
  if(!await loadJsPDF()){showToast('PDF loading...','info');return;}
  const{jsPDF}=window.jspdf;const doc=new jsPDF({unit:'mm',format:'letter'});
  const W=216,M=14,navy=[26,46,74];
  doc.setFillColor(...navy);doc.rect(0,0,W,36,'F');
  doc.setTextColor(255,255,255);doc.setFont('helvetica','bold');doc.setFontSize(18);doc.text('CARRIER ONBOARDING PACKET',M,14);
  doc.setFontSize(11);doc.setFont('helvetica','normal');doc.text('Shifl Logistics · Freight Brokerage Division',M,24);
  doc.text(localDateStr(),W-M,14,{align:'right'});
  doc.setTextColor(0);let y=48;
  const sections=[
    ['Welcome','Thank you for partnering with Shifl Logistics. Please complete all required documents before your first load.'],
    ['Required Documents','1. Signed Carrier Agreement\n2. Certificate of Insurance (COI) — Shifl must be listed as additional insured\n3. W-9 Form\n4. Voided check or ACH authorization form\n5. Operating authority (MC number active)'],
    ['Insurance Requirements','Auto Liability: $1,000,000 minimum\nCargo Insurance: $100,000 minimum\nGeneral Liability: $1,000,000 minimum'],
    ['Payment Terms','Standard: Net 30 from receipt of invoice + POD\nQuick Pay available: 2% fee, paid within 48 hours\nInvoices must include: BOL#, Booking#, POD'],
    ['Dispatch Contact','dispatch@shifl.com\nPhone: (555) 000-0000\nHours: Mon–Fri 8am–6pm ET'],
  ];
  sections.forEach(([title,body])=>{
    doc.setFillColor(240,244,248);doc.rect(M,y-4,W-M*2,8,'F');
    doc.setFont('helvetica','bold');doc.setFontSize(11);doc.setTextColor(...navy);doc.text(title,M+2,y);
    doc.setTextColor(0);y+=10;doc.setFont('helvetica','normal');doc.setFontSize(9);
    const lines=doc.splitTextToSize(body,W-M*2);doc.text(lines,M,y);y+=lines.length*5+8;
  });
  doc.save('Carrier_Onboarding_'+(carrierName||'Packet').replace(/\s/g,'_')+'.pdf');
  showToast('Carrier onboarding packet downloaded','success');
}

// ── INTERMODAL LOAD SUPPORT ───────────────────────────────────────
function getIntermodalLegs(id){return JSON.parse(localStorage.getItem('intermodal_'+id)||'[]');}
function saveIntermodalLegs(id,legs){localStorage.setItem('intermodal_'+id,JSON.stringify(legs));}
function openIntermodalBuilder(id){
  const legs=getIntermodalLegs(id);
  $('modal-root').innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()">
  <div class="modal" style="max-width:520px">
    <div class="modal-title">🔀 Intermodal legs</div>
    <div id="legs-list" style="margin-bottom:12px">
      ${legs.map((l,i)=>`<div style="padding:8px;border:1px solid var(--gray-200);border-radius:var(--radius);margin-bottom:6px;display:flex;justify-content:space-between;align-items:center">
        <div><span style="font-size:11px;background:var(--blue-bg);color:var(--steel);padding:1px 7px;border-radius:99px;font-weight:700">${l.mode}</span> <span style="font-size:12px;font-weight:600;color:var(--navy)"> ${l.from} → ${l.to}</span> <span style="font-size:11px;color:var(--gray-400)">${l.carrier||''} · ${fmtD(l.cost||0)}</span></div>
        <button onclick="removeLeg(${i})" style="border:none;background:transparent;cursor:pointer;color:var(--red)">✕</button>
      </div>`).join('')}
    </div>
    <div class="g2">
      <div class="field"><label>Mode</label><select id="leg-mode" style="width:100%;padding:8px;border:1px solid var(--gray-200);border-radius:var(--radius)"><option>Drayage</option><option>Rail</option><option>FTL</option><option>LTL</option><option>Air</option></select></div>
      <div class="field"><label>Carrier</label><input type="text" id="leg-carrier" placeholder="Carrier name"></div>
    </div>
    <div class="g3">
      <div class="field"><label>From</label><input type="text" id="leg-from" placeholder="Origin ZIP / city"></div>
      <div class="field"><label>To</label><input type="text" id="leg-to" placeholder="Destination ZIP / city"></div>
      <div class="field"><label>Cost ($)</label><input type="number" id="leg-cost" placeholder="0"></div>
    </div>
    <button onclick="addLeg('${id}')" class="btn" style="width:100%;margin-bottom:14px">+ Add leg</button>
    <div class="modal-foot"><button class="btn" onclick="closeModal()">Done</button></div>
  </div></div>`;
  window._intermodalId=id;
}
function addLeg(id){
  const legs=getIntermodalLegs(id);
  legs.push({mode:($('leg-mode')||{}).value,carrier:($('leg-carrier')||{}).value?.trim(),from:($('leg-from')||{}).value?.trim(),to:($('leg-to')||{}).value?.trim(),cost:parseFloat(($('leg-cost')||{}).value)||0});
  saveIntermodalLegs(id,legs);openIntermodalBuilder(id);
}
function removeLeg(i){const id=window._intermodalId;const legs=getIntermodalLegs(id);legs.splice(i,1);saveIntermodalLegs(id,legs);openIntermodalBuilder(id);}

// ── EXCEPTION ESCALATION RULES ────────────────────────────────────
function getEscalationRules(){return JSON.parse(localStorage.getItem('escalation_rules')||JSON.stringify([{hoursLate:2,action:'Notify dispatcher',active:true},{hoursLate:4,action:'Notify manager',active:true},{hoursLate:8,action:'Notify customer',active:true}]));}
function checkEscalations(){
  const rules=getEscalationRules().filter(r=>r.active);
  const loads=getTMSLoads().filter(l=>['Dispatched','In Transit','Out for Delivery'].includes(l.status));
  loads.forEach(l=>{
    const meta=getTMSMeta(l.id);if(!meta.eta) return;
    const hoursLate=Math.max(0,(new Date()-new Date(meta.eta))/(3600000));
    rules.forEach(r=>{
      if(hoursLate>=r.hoursLate){
        const key='esc_'+l.id+'_'+r.hoursLate;
        if(!localStorage.getItem(key)){localStorage.setItem(key,'1');showToast(`⚠️ ${l.customer||'Load'}: ${r.action} (${Math.round(hoursLate)}h late)`,'warning',8000);}
      }
    });
  });
}

// ── CLAIMS SETTLEMENT ─────────────────────────────────────────────
function updateClaimStatus(loadId,claimId,status,settlementAmt){
  const claims=getTMSClaims(loadId);
  const c=claims.find(c=>c.id===claimId);
  if(c){c.status=status;if(settlementAmt!==undefined) c.settlementAmount=settlementAmt;c.resolvedDate=localDateStr();}
  localStorage.setItem('tms_claims_'+loadId,JSON.stringify(claims));
}

// ── LANE RFP BUILDER ─────────────────────────────────────────────
function openLaneRFP(){
  $('modal-root').innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()">
  <div class="modal" style="max-width:560px">
    <div class="modal-title">📋 Lane RFP Builder</div>
    <div class="field"><label>RFP name / project</label><input type="text" id="rfp-name" placeholder="e.g. Q3 2026 Northeast Lanes RFP"></div>
    <div class="g2">
      <div class="field"><label>Valid from</label><input type="date" id="rfp-from" value="${localDateStr()}"></div>
      <div class="field"><label>Valid to</label><input type="date" id="rfp-to"></div>
    </div>
    <div style="font-size:12px;font-weight:700;color:var(--gray-500);margin:10px 0 6px;text-transform:uppercase;letter-spacing:.05em">Lanes to bid</div>
    <div id="rfp-lanes-list"></div>
    <button onclick="addRFPLane()" style="width:100%;padding:8px;border:1.5px dashed var(--gray-300);background:transparent;border-radius:var(--radius);cursor:pointer;font-size:12px;color:var(--gray-500);margin-bottom:12px">+ Add lane</button>
    <div class="modal-foot">
      <button class="btn" onclick="closeModal()">Cancel</button>
      <button class="btn blue" onclick="generateRFP()">📄 Generate RFP PDF</button>
    </div>
  </div></div>`;
  window._rfpLanes=[];addRFPLane();
}
function addRFPLane(){
  const list=$('rfp-lanes-list');if(!list) return;
  const i=window._rfpLanes.length;window._rfpLanes.push({});
  const row=document.createElement('div');row.style.cssText='display:flex;gap:6px;margin-bottom:6px';
  row.innerHTML=`<input id="rfp-pu-${i}" type="text" placeholder="Origin ZIP" style="flex:1;padding:7px;border:1px solid var(--gray-200);border-radius:var(--radius);font-size:12px">
    <input id="rfp-del-${i}" type="text" placeholder="Dest ZIP" style="flex:1;padding:7px;border:1px solid var(--gray-200);border-radius:var(--radius);font-size:12px">
    <input id="rfp-vol-${i}" type="text" placeholder="Vol/mo" style="width:70px;padding:7px;border:1px solid var(--gray-200);border-radius:var(--radius);font-size:12px">
    <input id="rfp-mode-${i}" type="text" placeholder="Mode" style="width:70px;padding:7px;border:1px solid var(--gray-200);border-radius:var(--radius);font-size:12px">`;
  list.appendChild(row);
}
async function generateRFP(){
  if(!await loadJsPDF()){return;}
  const{jsPDF}=window.jspdf;const doc=new jsPDF({unit:'mm',format:'letter'});
  const W=216,M=14,navy=[26,46,74];
  const name=($('rfp-name')||{}).value||'Lane RFP';
  doc.setFillColor(...navy);doc.rect(0,0,W,36,'F');
  doc.setTextColor(255,255,255);doc.setFont('helvetica','bold');doc.setFontSize(18);doc.text('REQUEST FOR PROPOSAL',M,14);
  doc.setFontSize(11);doc.setFont('helvetica','normal');doc.text(name,M,24);doc.text(localDateStr(),W-M,14,{align:'right'});
  doc.setTextColor(0);let y=48;
  doc.setFont('helvetica','bold');doc.setFontSize(10);doc.text('From: Shifl Logistics · Freight Brokerage Division',M,y);y+=12;
  doc.setFont('helvetica','bold');doc.setFontSize(10);doc.setTextColor(...navy);
  doc.text('Origin ZIP',M,y);doc.text('Dest ZIP',M+35,y);doc.text('Volume/mo',M+70,y);doc.text('Mode',M+105,y);doc.text('Target Rate',M+130,y);
  doc.setDrawColor(200);doc.line(M,y+2,W-M,y+2);y+=8;doc.setTextColor(0);doc.setFont('helvetica','normal');
  for(let i=0;i<window._rfpLanes.length;i++){
    const pu=($('rfp-pu-'+i)||{}).value||'';const del=($('rfp-del-'+i)||{}).value||'';
    const vol=($('rfp-vol-'+i)||{}).value||'';const mode=($('rfp-mode-'+i)||{}).value||'';
    if(!pu&&!del) continue;
    doc.text(pu,M,y);doc.text(del,M+35,y);doc.text(vol,M+70,y);doc.text(mode,M+105,y);doc.text('$_________',M+130,y);
    doc.line(M,y+3,W-M,y+3);y+=10;
  }
  y+=10;doc.setFont('helvetica','bold');doc.text('Submission Instructions:',M,y);y+=7;
  doc.setFont('helvetica','normal');doc.text('Please return completed rates to: rates@shifl.com',M,y);y+=6;
  doc.text('Valid period: '+( ($('rfp-from')||{}).value||'')+' to '+(($('rfp-to')||{}).value||'TBD'),M,y);
  doc.save(name.replace(/\s/g,'_')+'.pdf');
  closeModal();showToast('RFP PDF generated','success');
}

// ── ANNUAL CARRIER REVIEW ─────────────────────────────────────────
function renderAnnualCarrierReview(tabBar,loads){
  const year=new Date().getFullYear();
  const yearLoads=loads.filter(l=>l.date&&l.date.startsWith(year));
  const carriers={};
  yearLoads.forEach(l=>{
    const c=l.carrier||'Unknown';
    if(!carriers[c])carriers[c]={loads:0,rev:0,cost:0,claims:0,onTime:0,total:0};
    carriers[c].loads++;carriers[c].rev+=(l.customerRate||0);carriers[c].cost+=(l.carrierRate||0);
    carriers[c].total++;
    const m=getTMSMeta(l.id);
    if(m.eta&&m.delivered_at&&new Date(m.delivered_at)<=new Date(m.eta)) carriers[c].onTime++;
    carriers[c].claims+=getTMSClaims(l.id).length;
  });
  const sorted=Object.entries(carriers).sort((a,b)=>b[1].loads-a[1].loads);
  if(!tabBar){$('page').innerHTML='';return;}
  $('page').innerHTML=tabBar+`
  <div style="font-size:16px;font-weight:900;color:var(--navy);margin-bottom:4px">📊 Annual carrier review — ${year}</div>
  <div style="font-size:13px;color:var(--gray-400);margin-bottom:16px">Performance summary for contract negotiations</div>
  ${sorted.length?`<div class="tbl-wrap"><table><thead><tr><th>Carrier</th><th>Loads</th><th>Revenue</th><th>Cost paid</th><th>On-time %</th><th>Claims</th><th>Pay terms</th><th>W-9</th><th>Actions</th></tr></thead><tbody>
    ${sorted.map(([name,d])=>{
      const ot=d.total>0?Math.round(d.onTime/d.total*100):0;
      return`<tr>
        <td class="bold">${escH(name)}</td><td>${d.loads}</td>
        <td class="money">${fmtD(d.rev)}</td><td class="money" style="color:#d97706">${fmtD(d.cost)}</td>
        <td style="font-weight:700;color:${ot>=90?'var(--green)':ot>=70?'var(--amber)':'var(--red)'}">${ot}%</td>
        <td style="color:${d.claims?'var(--red)':'var(--green)'}">${d.claims||'0'}</td>
        <td>${payTermsBadge(name)}</td>
        <td>${w9Badge(name)}</td>
        <td style="white-space:nowrap">
          <button onclick="openCertModal('${escH(name)}')" style="font-size:10px;padding:3px 7px;border:1px solid var(--gray-200);border-radius:4px;background:transparent;cursor:pointer;font-family:inherit">🏆 Certs</button>
          <button onclick="openW9Modal('${escH(name)}')" style="font-size:10px;padding:3px 7px;border:1px solid var(--gray-200);border-radius:4px;background:transparent;cursor:pointer;font-family:inherit">📋 W-9</button>
        </td>
      </tr>`;}).join('')}
  </tbody></table></div>`:'<div class="empty"><div class="empty-ico">📊</div><p>No loads this year yet</p></div>'}`;
}



function showPayTermsModal(carrierName){
  const current=getCarrierPayTerms(carrierName);
  $('modal-root').innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()">
  <div class="modal" style="max-width:500px">
    <div class="modal-title">💳 Pay terms — ${escH(carrierName)}</div>
    <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px">
      ${['QuickPay (48h)','Net15','Net30','Net45','Net60'].map(t=>`<button onclick="setCarrierPayTerms('${carrierName}','${t}');closeModal();renderCarriers();showToast('Pay terms updated','success',2000)" style="padding:10px 14px;border:1.5px solid ${current===t?'var(--steel)':'var(--gray-200)'};border-radius:var(--radius);background:${current===t?'var(--blue-bg)':'transparent'};cursor:pointer;font-family:inherit;font-size:13px;font-weight:600;color:${current===t?'var(--steel)':'var(--navy)'};text-align:left">${t}${current===t?' ✓':''}</button>`).join('')}
    </div>
    <button class="btn" onclick="closeModal()">Cancel</button>
  </div></div>`;
}
// ════════════════════════════════════════════════════════════════════
// TMS LOAD MANAGEMENT FEATURES
// ════════════════════════════════════════════════════════════════════

// ── LOAD CALENDAR VIEW ────────────────────────────────────────────
function renderTMSCalendar(tabBar){
  const loads=getTMSLoads();
  const now=new Date();
  const year=now.getFullYear(),month=now.getMonth();
  const firstDay=new Date(year,month,1).getDay();
  const daysInMonth=new Date(year,month+1,0).getDate();
  const monthName=now.toLocaleString('en-US',{month:'long',year:'numeric',timeZone:'America/New_York'});

  const byDate={};
  loads.forEach(l=>{
    const meta=getTMSMeta(l.id);
    const d=meta.pickupAppt?meta.pickupAppt.slice(0,10):l.date;
    if(d&&d.startsWith(String(year)+'-'+String(month+1).padStart(2,'0'))){
      if(!byDate[d]) byDate[d]=[];byDate[d].push(l);
    }
  });

  let cells='';
  for(let i=0;i<firstDay;i++) cells+='<div></div>';
  for(let d=1;d<=daysInMonth;d++){
    const dateStr=year+'-'+String(month+1).padStart(2,'0')+'-'+String(d).padStart(2,'0');
    const dayLoads=byDate[dateStr]||[];
    const isToday=new Date().toISOString().slice(0,10)===dateStr;
    cells+=`<div style="min-height:70px;border:1px solid var(--gray-100);border-radius:6px;padding:4px;background:${isToday?'var(--blue-bg)':'var(--white)'}">
      <div style="font-size:11px;font-weight:700;color:${isToday?'var(--steel)':'var(--gray-400)'};margin-bottom:4px">${d}</div>
      ${dayLoads.slice(0,3).map(l=>`<div onclick="openTMSLoadDetail('${l.id}')" style="font-size:10px;font-weight:600;padding:2px 5px;border-radius:3px;margin-bottom:2px;cursor:pointer;background:${tmsStatusColor(l.status)}18;color:${tmsStatusColor(l.status)};overflow:hidden;white-space:nowrap;text-overflow:ellipsis">${escH(l.customer||'—')}</div>`).join('')}
      ${dayLoads.length>3?`<div style="font-size:10px;color:var(--gray-400)">+${dayLoads.length-3} more</div>`:''}
    </div>`;
  }

  $('page').innerHTML=tabBar+`
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
    <div style="font-size:18px;font-weight:800;color:var(--navy)">${monthName}</div>
    <div style="display:flex;gap:6px">
      <button class="btn" onclick="S.tmsCalMonth=(S.tmsCalMonth||0)-1;renderTMS()">← Prev</button>
      <button class="btn" onclick="S.tmsCalMonth=0;renderTMS()">Today</button>
      <button class="btn" onclick="S.tmsCalMonth=(S.tmsCalMonth||0)+1;renderTMS()">Next →</button>
    </div>
  </div>
  <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px;margin-bottom:6px">
    ${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d=>`<div style="font-size:11px;font-weight:700;color:var(--gray-400);text-align:center;padding:4px">${d}</div>`).join('')}
  </div>
  <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px">${cells}</div>`;
}

// ── LOAD MAP VIEW ─────────────────────────────────────────────────
function renderTMSMap(tabBar){
  const loads=getTMSLoads();
  const stateCounts={};
  loads.filter(l=>['Dispatched','In Transit','Out for Delivery'].includes(l.status)).forEach(l=>{
    const state=zipToState(l.pickupZip||'')||zipToState(l.deliveryZip||'');
    if(state){stateCounts[state]=(stateCounts[state]||0)+1;}
  });
  const maxC=Math.max(...Object.values(stateCounts),1);

  // Simple US state grid (abbreviated)
  const states=['ME','NH','VT','MA','RI','CT','NY','NJ','PA','DE','MD','DC','VA','WV','NC','SC','GA','FL','AL','MS','TN','KY','OH','IN','MI','WI','IL','MO','AR','LA','TX','OK','KS','NE','SD','ND','MN','IA','MO','AK','HI','MT','WY','CO','NM','AZ','UT','NV','ID','OR','WA','CA'];
  const uniq=[...new Set(states)];

  $('page').innerHTML=tabBar+`
  <div style="font-size:14px;font-weight:800;color:var(--navy);margin-bottom:12px">🗺️ Active loads by state</div>
  <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px">
    ${uniq.map(s=>{const c=stateCounts[s]||0;const intensity=c?Math.round(c/maxC*9)+1:0;const col=c?`rgba(46,117,182,${intensity*0.1})`:' var(--gray-50)';const border=c?'var(--steel)':'var(--gray-200)';return`<div onclick="${c?`tmsFilter('all')`:'()'}" title="${s}: ${c} loads" style="width:44px;height:38px;border:1.5px solid ${border};border-radius:6px;background:${col};display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:${c?'pointer':'default'}"><div style="font-size:10px;font-weight:700;color:${c?'var(--steel)':'var(--gray-400)'}">${s}</div>${c?`<div style="font-size:11px;font-weight:900;color:var(--steel)">${c}</div>`:''}</div>`;}).join('')}
  </div>
  <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px">
    ${loads.filter(l=>['Dispatched','In Transit','Out for Delivery'].includes(l.status)).map(l=>`<div onclick="openTMSLoadDetail('${l.id}')" class="card" style="cursor:pointer;border-left:3px solid ${tmsStatusColor(l.status)}">
      <div style="font-size:13px;font-weight:700;color:var(--navy)">${escH(l.customer||'—')}</div>
      <div style="font-size:11px;color:var(--gray-500)">${escH((l.pickupZip||'?')+' → '+(l.deliveryZip||'?'))}</div>
      <div style="font-size:11px;font-weight:600;color:${tmsStatusColor(l.status)};margin-top:4px">${l.status}</div>
    </div>`).join('')||'<div class="empty"><div class="empty-ico">🗺️</div><p>No active loads in transit</p></div>'}
  </div>`;
}

function zipToState(zip){
  const z=parseInt(zip);
  if(!z) return null;
  if(z>=35004&&z<=36925) return 'AL';if(z>=99501&&z<=99950) return 'AK';if(z>=85001&&z<=86556) return 'AZ';
  if(z>=71601&&z<=72959) return 'AR';if(z>=90001&&z<=96162) return 'CA';if(z>=80001&&z<=81658) return 'CO';
  if(z>=6001&&z<=6928) return 'CT';if(z>=19701&&z<=19980) return 'DE';if(z>=32004&&z<=34997) return 'FL';
  if(z>=30001&&z<=31999) return 'GA';if(z>=96701&&z<=96898) return 'HI';if(z>=83201&&z<=83876) return 'ID';
  if(z>=60001&&z<=62999) return 'IL';if(z>=46001&&z<=47997) return 'IN';if(z>=50001&&z<=52809) return 'IA';
  if(z>=66002&&z<=67954) return 'KS';if(z>=40003&&z<=42788) return 'KY';if(z>=70001&&z<=71497) return 'LA';
  if(z>=3901&&z<=4992) return 'ME';if(z>=20601&&z<=21930) return 'MD';if(z>=1001&&z<=2791) return 'MA';
  if(z>=48001&&z<=49971) return 'MI';if(z>=55001&&z<=56763) return 'MN';if(z>=38601&&z<=39776) return 'MS';
  if(z>=63001&&z<=65899) return 'MO';if(z>=59001&&z<=59937) return 'MT';if(z>=68001&&z<=69367) return 'NE';
  if(z>=88901&&z<=89883) return 'NV';if(z>=3031&&z<=3897) return 'NH';if(z>=7001&&z<=8989) return 'NJ';
  if(z>=87001&&z<=88441) return 'NM';if(z>=10001&&z<=14975) return 'NY';if(z>=27006&&z<=28909) return 'NC';
  if(z>=58001&&z<=58856) return 'ND';if(z>=43001&&z<=45999) return 'OH';if(z>=73001&&z<=74966) return 'OK';
  if(z>=97001&&z<=97920) return 'OR';if(z>=15001&&z<=19640) return 'PA';if(z>=2801&&z<=2940) return 'RI';
  if(z>=29001&&z<=29948) return 'SC';if(z>=57001&&z<=57799) return 'SD';if(z>=37010&&z<=38589) return 'TN';
  if(z>=75001&&z<=79999) return 'TX';if(z>=84001&&z<=84784) return 'UT';if(z>=5001&&z<=5907) return 'VT';
  if(z>=20101&&z<=24658) return 'VA';if(z>=98001&&z<=99403) return 'WA';if(z>=24701&&z<=26886) return 'WV';
  if(z>=53001&&z<=54990) return 'WI';if(z>=82001&&z<=83128) return 'WY';
  return null;
}

// ── LOAD PRIORITY RANKING ─────────────────────────────────────────
function getPriorityOrder(){return JSON.parse(localStorage.getItem('tms_priority_order')||'[]');}
function savePriorityOrder(arr){localStorage.setItem('tms_priority_order',JSON.stringify(arr));}
function getLoadPriority(id){const o=getPriorityOrder();const i=o.indexOf(id);return i>=0?i:9999;}
function movePriorityUp(id){const o=getPriorityOrder();const allIds=getTMSLoads().map(l=>l.id);const list=allIds.filter(i=>!o.includes(i));const full=[...o,...list];const i=full.indexOf(id);if(i>0){[full[i-1],full[i]]=[full[i],full[i-1]];savePriorityOrder(full);}renderTMS();}
function movePriorityDown(id){const o=getPriorityOrder();const allIds=getTMSLoads().map(l=>l.id);const list=allIds.filter(i=>!o.includes(i));const full=[...o,...list];const i=full.indexOf(id);if(i<full.length-1){[full[i],full[i+1]]=[full[i+1],full[i]];savePriorityOrder(full);}renderTMS();}

// ── LOAD TEMPLATE LIBRARY ─────────────────────────────────────────
function getLoadTemplates(){return JSON.parse(localStorage.getItem('load_templates')||'[]');}
function saveLoadTemplate(tmpl){const t=getLoadTemplates();t.unshift({...tmpl,id:'tmpl-'+Date.now(),createdAt:localDateStr()});localStorage.setItem('load_templates',JSON.stringify(t));return t;}
function deleteLoadTemplate(id){const t=getLoadTemplates().filter(t=>t.id!==id);localStorage.setItem('load_templates',JSON.stringify(t));renderTMSTemplates();}
function openSaveTemplate(loadId){
  const q=(window._fqHistory||[]).find(q=>q.id===loadId);if(!q) return;
  $('modal-root').innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()">
  <div class="modal" style="max-width:500px">
    <div class="modal-title">💾 Save as template</div>
    <div class="field"><label>Template name</label><input type="text" id="tmpl-name" value="${escH((q.fqMode||'FTL')+' '+q.pickupZip+' → '+q.deliveryZip)}" placeholder="e.g. Weekly Newark to Chicago FTL"></div>
    <div class="modal-foot"><button class="btn" onclick="closeModal()">Cancel</button>
      <button class="btn blue" onclick="saveLoadTemplate({name:$('tmpl-name').value,fqMode:'${q.fqMode}',pickupZip:'${q.pickupZip}',deliveryZip:'${q.deliveryZip}',carrier:'${escH(q.carrier||'')}',customerRate:${q.customerRate||0},carrierRate:${q.carrierRate||0},commodity:'${escH(q.commodity||'')}',weight:'${q.weight||''}'});closeModal();showToast('Template saved','success',2000)">Save</button>
    </div>
  </div></div>`;
}
function renderTMSTemplates(tabBar){
  const templates=getLoadTemplates();
  if(tabBar) $('page').innerHTML=tabBar;
  const section=`<div style="font-size:16px;font-weight:800;color:var(--navy);margin-bottom:12px">📋 Load templates</div>
  <button onclick="openAddTemplate()" class="btn blue" style="margin-bottom:14px">+ New template</button>
  <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px">
    ${templates.length?templates.map(t=>`<div class="card">
      <div style="font-size:14px;font-weight:800;color:var(--navy);margin-bottom:6px">${escH(t.name||'Template')}</div>
      <div style="font-size:12px;color:var(--gray-500);margin-bottom:4px">${t.fqMode||'FTL'} · ${escH(t.pickupZip||'?')} → ${escH(t.deliveryZip||'?')}</div>
      <div style="font-size:12px;color:var(--gray-500);margin-bottom:10px">Carrier: ${escH(t.carrier||'—')} · Rev: ${fmtD(t.customerRate||0)}</div>
      <div style="display:flex;gap:6px">
        <button onclick="applyTemplate('${t.id}')" class="btn blue" style="flex:1;font-size:12px">Use template</button>
        <button onclick="deleteLoadTemplate('${t.id}')" style="padding:6px 10px;border:1px solid #fca5a5;border-radius:var(--radius);background:transparent;cursor:pointer;color:var(--red)">🗑️</button>
      </div>
    </div>`).join(''):'<div class="empty"><div class="empty-ico">📋</div><p>No templates yet — save a load as a template to reuse it quickly</p></div>'}
  </div>`;
  if(tabBar) $('page').innerHTML+= section;
  else{const c=document.createElement('div');c.innerHTML=section;$('page').appendChild(c);}
}
function openAddTemplate(){
  $('modal-root').innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()">
  <div class="modal" style="max-width:500px">
    <div class="modal-title">+ New load template</div>
    <div class="field"><label>Template name *</label><input type="text" id="ta-name" placeholder="e.g. Weekly Chicago FTL"></div>
    <div class="g2"><div class="field"><label>Mode</label><select id="ta-mode" style="width:100%;padding:8px;border:1px solid var(--gray-200);border-radius:var(--radius)"><option>FTL</option><option>LTL</option></select></div><div class="field"><label>Carrier</label><input type="text" id="ta-carrier" placeholder="Default carrier"></div></div>
    <div class="g2"><div class="field"><label>Pickup ZIP</label><input type="text" id="ta-pu" placeholder="07102"></div><div class="field"><label>Delivery ZIP</label><input type="text" id="ta-del" placeholder="60601"></div></div>
    <div class="g2"><div class="field"><label>Customer rate</label><input type="number" id="ta-crev" placeholder="0"></div><div class="field"><label>Carrier rate</label><input type="number" id="ta-cost" placeholder="0"></div></div>
    <div class="field"><label>Commodity</label><input type="text" id="ta-com" placeholder="General freight"></div>
    <div class="modal-foot"><button class="btn" onclick="closeModal()">Cancel</button><button class="btn blue" onclick="saveLoadTemplate({name:($('ta-name')||{}).value,fqMode:($('ta-mode')||{}).value,carrier:($('ta-carrier')||{}).value,pickupZip:($('ta-pu')||{}).value,deliveryZip:($('ta-del')||{}).value,customerRate:parseFloat(($('ta-crev')||{}).value)||0,carrierRate:parseFloat(($('ta-cost')||{}).value)||0,commodity:($('ta-com')||{}).value});closeModal();showToast('Template saved','success');renderTMS()">Save</button></div>
  </div></div>`;
}
function applyTemplate(id){
  const t=getLoadTemplates().find(t=>t.id===id);if(!t) return;
  Object.assign(S.fq,{fqMode:t.fqMode,pickupZip:t.pickupZip,deliveryZip:t.deliveryZip,carrier:t.carrier,customerRate:t.customerRate,carrierRate:t.carrierRate,commodity:t.commodity,weight:t.weight||''});
  S.view='freight';S.fqTab='builder';render();
  showToast('Template applied — review and save','success',3000);
}

// ── DAILY DISPATCH REPORT ─────────────────────────────────────────
function openDailyDispatchReport(){
  const loads=getTMSLoads();
  const today=localDateStr();
  const dispatching=loads.filter(l=>l.status==='Booked');
  const active=loads.filter(l=>['Dispatched','In Transit','Out for Delivery'].includes(l.status));
  const delivering=loads.filter(l=>{const m=getTMSMeta(l.id);return m.deliveryAppt&&m.deliveryAppt.startsWith(today);});
  const overdue=getOverdueLoads();
  $('modal-root').innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()">
  <div class="modal" style="max-width:560px;max-height:85vh;overflow-y:auto">
    <div class="modal-title">📋 Daily dispatch report — ${today}</div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:16px">
      <div class="kpi"><div class="kpi-lbl">To dispatch</div><div class="kpi-val" style="color:var(--amber)">${dispatching.length}</div></div>
      <div class="kpi"><div class="kpi-lbl">Active loads</div><div class="kpi-val">${active.length}</div></div>
      <div class="kpi"><div class="kpi-lbl">Delivering today</div><div class="kpi-val" style="color:var(--green)">${delivering.length}</div></div>
      <div class="kpi"><div class="kpi-lbl">Overdue</div><div class="kpi-val" style="color:${overdue.length?'var(--red)':'var(--green)'}">${overdue.length}</div></div>
    </div>
    ${dispatching.length?`<div style="font-size:12px;font-weight:700;color:var(--gray-400);text-transform:uppercase;margin-bottom:8px">Needs dispatch today</div>
    ${dispatching.map(l=>`<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--gray-100)">
      <div><div style="font-size:13px;font-weight:700;color:var(--navy)">${escH(l.customer||'—')}</div>
      <div style="font-size:11px;color:var(--gray-500)">${escH((l.pickupZip||'?')+'→'+(l.deliveryZip||'?'))} · ${l.fqMode} · ${escH(l.carrier||'Unassigned')}</div></div>
      <span style="font-size:11px;font-weight:700;color:var(--amber)">${getTMSMeta(l.id).bookingNum||''}</span>
    </div>`).join('')}`:''}
    ${overdue.length?`<div style="font-size:12px;font-weight:700;color:var(--red);text-transform:uppercase;margin:12px 0 8px">⚠️ Overdue loads</div>
    ${overdue.map(l=>`<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--gray-100)">
      <div><div style="font-size:13px;font-weight:700;color:var(--navy)">${escH(l.customer||'—')}</div>
      <div style="font-size:11px;color:var(--red)">ETA was ${getTMSMeta(l.id).eta||'unknown'}</div></div>
      <span style="font-size:11px;font-weight:700;color:${tmsStatusColor(l.status)}">${l.status}</span>
    </div>`).join('')}`:''}
    <div class="modal-foot"><button class="btn" onclick="closeModal()">Close</button><button class="btn blue" onclick="closeModal();S.tmsTab='dispatch';renderTMS()">Go to dispatch board</button></div>
  </div></div>`;
}

// ── BULK LOAD ADVANCE ─────────────────────────────────────────────
function openBulkAdvance(){
  const loads=getTMSLoads().filter(l=>nextTMSStatus(l.status));
  $('modal-root').innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()">
  <div class="modal" style="max-width:540px">
    <div class="modal-title">☑️ Bulk status advance</div>
    <div style="font-size:13px;color:var(--gray-500);margin-bottom:12px">Select loads to move to their next status</div>
    <div style="max-height:300px;overflow-y:auto;margin-bottom:14px">
      ${loads.map(l=>`<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--gray-100)">
        <input type="checkbox" data-lid="${l.id}" class="bulk-adv-cb">
        <div style="flex:1"><div style="font-size:13px;font-weight:700;color:var(--navy)">${escH(l.customer||'—')}</div>
        <div style="font-size:11px;color:var(--gray-500)">${l.status} → <strong style="color:${tmsStatusColor(nextTMSStatus(l.status))}">${nextTMSStatus(l.status)}</strong></div></div>
        <span style="font-size:10px;color:var(--gray-400)">${getTMSMeta(l.id).bookingNum||''}</span>
      </div>`).join('')}
    </div>
    <div style="display:flex;gap:8px;margin-bottom:14px">
      <button onclick="document.querySelectorAll('.bulk-adv-cb').forEach(c=>c.checked=true)" class="btn" style="font-size:12px">Select all</button>
      <button onclick="document.querySelectorAll('.bulk-adv-cb').forEach(c=>c.checked=false)" class="btn" style="font-size:12px">Clear</button>
    </div>
    <div class="modal-foot"><button class="btn" onclick="closeModal()">Cancel</button>
      <button class="btn blue" onclick="executeBulkAdvance()">→ Advance selected</button>
    </div>
  </div></div>`;
}
async function executeBulkAdvance(){
  const cbs=[...document.querySelectorAll('.bulk-adv-cb:checked')];
  let count=0;
  for(const cb of cbs){
    const id=cb.dataset.lid;
    const q=(window._fqHistory||[]).find(q=>q.id===id);
    const next=nextTMSStatus(q?.status||'');
    if(q&&next){await advanceTMSLoad(id,next);count++;}
  }
  closeModal();showToast(`✅ ${count} loads advanced`,'success',3000);
}

// ── LOAD ARCHIVE ──────────────────────────────────────────────────
function archiveOldLoads(){
  const cutoff=new Date(Date.now()-90*864e5).toISOString().slice(0,10);
  const toArchive=(window._fqHistory||[]).filter(l=>['Delivered','Invoiced','Paid'].includes(l.status)&&l.date&&l.date<cutoff);
  toArchive.forEach(l=>{saveTMSMeta(l.id,{archived:true});});
  showToast(`📦 ${toArchive.length} loads archived`,'success',2000);renderTMS();
}
function getTMSLoadsActive(){return getTMSLoads().filter(l=>!getTMSMeta(l.id).archived);}
function getTMSLoadsArchived(){return getTMSLoads().filter(l=>getTMSMeta(l.id).archived);}

// ── LATE ESCALATION DASHBOARD ─────────────────────────────────────
function renderLateEscalation(tabBar){
  const loads=getTMSLoads();
  const late=loads.filter(l=>{
    const m=getTMSMeta(l.id);if(!m.eta||['Delivered','Paid','Invoiced'].includes(l.status)) return false;
    return new Date(m.eta)<new Date();
  }).sort((a,b)=>{const ma=getTMSMeta(a.id),mb=getTMSMeta(b.id);return new Date(ma.eta)-new Date(mb.eta);});
  $('page').innerHTML=tabBar+`
  <div style="font-size:16px;font-weight:800;color:var(--red);margin-bottom:12px">⚠️ Late load escalation (${late.length})</div>
  ${late.length?late.map(l=>{const m=getTMSMeta(l.id);const hrs=Math.round((new Date()-new Date(m.eta))/3600000);return`<div onclick="openTMSLoadDetail('${l.id}')" class="card" style="cursor:pointer;border-left:3px solid var(--red);margin-bottom:8px">
    <div style="display:flex;justify-content:space-between;align-items:center">
      <div><div style="font-size:14px;font-weight:800;color:var(--navy)">${escH(l.customer||'—')}</div>
      <div style="font-size:12px;color:var(--gray-500)">${escH((l.pickupZip||'?')+'→'+(l.deliveryZip||'?'))} · ${escH(l.carrier||'—')}</div>
      <div style="font-size:12px;font-weight:700;color:var(--red);margin-top:4px">ETA was ${m.eta} — ${hrs}h overdue</div></div>
      <div style="text-align:right"><span style="font-size:11px;font-weight:700;padding:3px 10px;border-radius:99px;background:${tmsStatusColor(l.status)}18;color:${tmsStatusColor(l.status)}">${l.status}</span></div>
    </div>
  </div>`}).join(''):`<div class="empty"><div class="empty-ico">✅</div><p>No overdue loads — all loads on schedule</p></div>`}`;
}

// ── CARRIER NO-SHOW TRACKER ───────────────────────────────────────
function getNoShows(){return JSON.parse(localStorage.getItem('carrier_noshows')||'[]');}
function logNoShow(loadId,carrier,reason){
  const ns=getNoShows();
  ns.unshift({loadId,carrier,reason,date:localDateStr(),ts:new Date().toISOString()});
  localStorage.setItem('carrier_noshows',JSON.stringify(ns));
  // Reduce carrier score
  const scores=JSON.parse(localStorage.getItem('carrier_noshows_count')||'{}');
  scores[carrier]=(scores[carrier]||0)+1;
  localStorage.setItem('carrier_noshows_count',JSON.stringify(scores));
  showToast('No-show logged for '+carrier,'warning');
}
function getCarrierNoShows(name){return (JSON.parse(localStorage.getItem('carrier_noshows_count')||'{}')[name]||0);}
function openNoShowModal(loadId,carrier){
  $('modal-root').innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()">
  <div class="modal" style="max-width:500px">
    <div class="modal-title">🚫 Log carrier no-show</div>
    <div style="font-size:13px;color:var(--navy);font-weight:700;margin-bottom:12px">${escH(carrier)}</div>
    <div class="field"><label>Reason</label><select id="ns-reason" style="width:100%;padding:8px;border:1px solid var(--gray-200);border-radius:var(--radius)">
      <option>Did not show up at pickup</option><option>Cancelled day of</option><option>No communication</option><option>Wrong equipment</option><option>Double brokered</option><option>Other</option>
    </select></div>
    <div class="modal-foot"><button class="btn" onclick="closeModal()">Cancel</button>
      <button class="btn blue" onclick="logNoShow('${loadId}','${escH(carrier)}',($('ns-reason')||{}).value);closeModal();openLoadRecovery('${loadId}')">Log & find replacement</button>
    </div>
  </div></div>`;
}

// ── LOAD RECOVERY WORKFLOW ────────────────────────────────────────
function openLoadRecovery(loadId){
  const q=(window._fqHistory||[]).find(q=>q.id===loadId);if(!q) return;
  // Find available carriers for this lane
  const history=(window._fqHistory||[]).filter(l=>l.carrier&&['Delivered','Invoiced','Paid'].includes(l.status)&&l.pickupZip===q.pickupZip&&l.deliveryZip===q.deliveryZip);
  const carriers=[...new Set(history.map(l=>l.carrier))].filter(c=>c!==q.carrier&&!isBlacklisted(c));
  $('modal-root').innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()">
  <div class="modal" style="max-width:500px">
    <div class="modal-title">🔄 Load recovery — find replacement carrier</div>
    <div style="background:#fff5f5;border:1px solid #fca5a5;border-radius:var(--radius);padding:8px 12px;margin-bottom:12px;font-size:12px;color:var(--red);font-weight:600">Original carrier cancelled — ${escH(q.carrier||'Unknown')}</div>
    <div style="font-size:13px;font-weight:700;color:var(--navy);margin-bottom:8px">Carriers who ran this lane before:</div>
    ${carriers.length?carriers.map(c=>`<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--gray-100)">
      <div><div style="font-size:13px;font-weight:700">${escH(c)}</div>
      <div style="font-size:11px;color:var(--gray-400)">${history.filter(l=>l.carrier===c).length} runs · ${getCarrierNoShows(c)} no-shows</div></div>
      <button onclick="assignCarrierToLoad('${loadId}','${escH(c)}');closeModal();showToast('Carrier reassigned: ${escH(c)}','success')" style="font-size:11px;padding:5px 12px;border:1px solid var(--steel);border-radius:var(--radius);background:transparent;cursor:pointer;color:var(--steel);font-family:inherit">Assign</button>
    </div>`).join(''):`<div style="color:var(--gray-400);font-size:13px;padding:12px 0">No carrier history on this lane — search your network manually</div>`}
    <div class="field" style="margin-top:12px"><label>Or assign a different carrier</label>
      <input type="text" id="recovery-carrier" placeholder="Carrier name">
    </div>
    <div class="modal-foot"><button class="btn" onclick="closeModal()">Close</button>
      <button class="btn blue" onclick="if(($('recovery-carrier')||{}).value){assignCarrierToLoad('${loadId}',($('recovery-carrier')||{}).value);closeModal();}">Assign</button>
    </div>
  </div></div>`;
}

// ── LOAD COMPLETION CHECKLIST ─────────────────────────────────────
function checkLoadCompletion(id){
  const meta=getTMSMeta(id);const hasCInv=!!getInvoice(id);const hasCarrI=!!getCarrierInvoice(id);
  const checks=[
    {label:'POD uploaded',done:!!meta.podUploaded},
    {label:'BOL generated',done:!!meta.bolNum},
    {label:'Customer invoice created',done:hasCInv},
    {label:'Carrier invoice entered',done:hasCarrI},
    {label:'Notes complete',done:!!(meta.notes||'').trim()},
  ];
  const incomplete=checks.filter(c=>!c.done);
  if(incomplete.length>0){
    $('modal-root').innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()">
    <div class="modal" style="max-width:500px">
      <div class="modal-title">📋 Delivery checklist</div>
      <div style="font-size:13px;color:var(--gray-500);margin-bottom:12px">Complete these before marking delivered:</div>
      ${checks.map(c=>`<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--gray-100)">
        <span style="font-size:16px">${c.done?'✅':'⭕'}</span>
        <span style="font-size:13px;font-weight:600;color:${c.done?'var(--green)':'var(--navy)'}">${c.label}</span>
      </div>`).join('')}
      <div class="modal-foot">
        <button class="btn" onclick="closeModal()">Go back</button>
        <button class="btn blue" onclick="closeModal();advanceTMSLoad('${id}','Delivered')">Mark delivered anyway</button>
      </div>
    </div></div>`;
    return false;
  }
  return true;
}

// ── CARRIER REJECTION LOG ─────────────────────────────────────────
function getRejectionLog(){return JSON.parse(localStorage.getItem('carrier_rejections')||'[]');}
function logCarrierRejection(loadId,carrier,reason){
  const rl=getRejectionLog();
  rl.unshift({loadId,carrier,reason,date:localDateStr(),ts:new Date().toISOString()});
  if(rl.length>200) rl.pop();
  localStorage.setItem('carrier_rejections',JSON.stringify(rl));
}
function openRejectionModal(loadId){
  $('modal-root').innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()">
  <div class="modal" style="max-width:500px">
    <div class="modal-title">📝 Log carrier rejection</div>
    <div class="field"><label>Carrier that declined</label><input type="text" id="rej-carrier" placeholder="Carrier name"></div>
    <div class="field"><label>Reason</label><select id="rej-reason" style="width:100%;padding:8px;border:1px solid var(--gray-200);border-radius:var(--radius)">
      <option>Rate too low</option><option>No capacity on that date</option><option>Lane not in service area</option><option>Equipment not available</option><option>No response</option><option>Other</option>
    </select></div>
    <div class="modal-foot"><button class="btn" onclick="closeModal()">Cancel</button>
      <button class="btn blue" onclick="logCarrierRejection('${loadId}',($('rej-carrier')||{}).value,($('rej-reason')||{}).value);closeModal();showToast('Rejection logged','info',2000)">Log</button>
    </div>
  </div></div>`;
}

// ── TIME IN STATUS ────────────────────────────────────────────────
function timeInStatus(l){
  const meta=getTMSMeta(l.id);
  const statusKey=l.status.toLowerCase().replace(/ /g,'_')+'_at';
  const since=meta[statusKey]||l.date;
  if(!since) return null;
  const hrs=Math.round((new Date()-new Date(since))/3600000);
  const days=Math.floor(hrs/24);
  return days>0?days+'d '+(hrs%24)+'h':hrs+'h';
}
function timeInStatusBadge(l){
  const t=timeInStatus(l);if(!t) return '';
  const hrs=Math.round((new Date()-new Date(getTMSMeta(l.id)[l.status.toLowerCase().replace(/ /g,'_')+'_at']||l.date))/3600000);
  const col=hrs>48?'var(--red)':hrs>24?'var(--amber)':'var(--gray-400)';
  return `<span style="font-size:10px;color:${col};font-weight:600">⏱ ${t}</span>`;
}

// ── LOAD RE-ROUTE TOOL ────────────────────────────────────────────
function openRerouteTool(id){
  const q=(window._fqHistory||[]).find(q=>q.id===id);if(!q) return;
  $('modal-root').innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()">
  <div class="modal" style="max-width:500px">
    <div class="modal-title">🔀 Re-route load</div>
    <div style="background:#fffbeb;border:1px solid #fbbf24;border-radius:var(--radius);padding:8px 12px;margin-bottom:12px;font-size:12px;color:#92400e">⚠️ Original: ${escH(q.pickupZip||'?')} → ${escH(q.deliveryZip||'?')}</div>
    <div class="g2">
      <div class="field"><label>New delivery ZIP</label><input type="text" id="rr-zip" value="${escH(q.deliveryZip||'')}" placeholder="New ZIP"></div>
      <div class="field"><label>New delivery address</label><input type="text" id="rr-addr" placeholder="Street address"></div>
    </div>
    <div class="field"><label>Re-route reason</label><input type="text" id="rr-reason" placeholder="e.g. Customer warehouse change"></div>
    <div class="modal-foot"><button class="btn" onclick="closeModal()">Cancel</button>
      <button class="btn blue" onclick="applyReroute('${id}')">Apply re-route</button>
    </div>
  </div></div>`;
}
function applyReroute(id){
  const idx=(window._fqHistory||[]).findIndex(q=>q.id===id);if(idx<0) return;
  const newZip=($('rr-zip')||{}).value?.trim();
  const reason=($('rr-reason')||{}).value?.trim();
  if(newZip) window._fqHistory[idx].deliveryZip=newZip;
  try{localStorage.setItem('fq_history',JSON.stringify(window._fqHistory));}catch(e){}
  saveTMSMeta(id,{rerouteReason:reason,rerouteDate:localDateStr(),originalDeliveryZip:window._fqHistory[idx].deliveryZip});
  closeModal();showToast('Load re-routed — update BOL','warning',3000);
  openTMSLoadDetail(id);
}

// ── LOAD MERGE ────────────────────────────────────────────────────
function openLoadMerge(){
  const bookedLoads=getTMSLoads().filter(l=>l.status==='Booked');
  if(bookedLoads.length<2){showToast('Need at least 2 booked loads to merge','info');return;}
  $('modal-root').innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()">
  <div class="modal" style="max-width:480px">
    <div class="modal-title">🔀 Merge loads into one FTL</div>
    <div style="font-size:13px;color:var(--gray-500);margin-bottom:12px">Select 2 loads on the same lane to consolidate</div>
    <div style="max-height:260px;overflow-y:auto;margin-bottom:14px">
      ${bookedLoads.map(l=>`<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--gray-100)">
        <input type="checkbox" data-mid="${l.id}" class="merge-cb">
        <div><div style="font-size:13px;font-weight:700;color:var(--navy)">${escH(l.customer||'—')} — ${l.fqMode}</div>
        <div style="font-size:11px;color:var(--gray-500)">${escH((l.pickupZip||'?')+'→'+(l.deliveryZip||'?'))} · ${fmtD(l.customerRate||0)}</div></div>
      </div>`).join('')}
    </div>
    <div class="modal-foot"><button class="btn" onclick="closeModal()">Cancel</button>
      <button class="btn blue" onclick="executeMerge()">Merge selected</button>
    </div>
  </div></div>`;
}
function executeMerge(){
  const ids=[...document.querySelectorAll('.merge-cb:checked')].map(c=>c.dataset.mid);
  if(ids.length<2){showToast('Select at least 2 loads','info');return;}
  const loads=ids.map(id=>(window._fqHistory||[]).find(q=>q.id===id)).filter(Boolean);
  const totalRev=loads.reduce((s,l)=>s+(l.customerRate||0),0);
  const avgCost=loads.reduce((s,l)=>s+(l.carrierRate||0),0)/loads.length;
  const merged={...loads[0],id:'fq-merge-'+Date.now(),customer:loads.map(l=>l.customer).join(' + '),customerRate:totalRev,carrierRate:avgCost,status:'Booked',date:localDateStr(),isMerged:true,mergedFrom:ids};
  window._fqHistory=(window._fqHistory||[]);window._fqHistory.unshift(merged);
  // Archive originals
  ids.forEach(id=>saveTMSMeta(id,{archived:true,mergedInto:merged.id}));
  try{localStorage.setItem('fq_history',JSON.stringify(window._fqHistory));}catch(e){}
  closeModal();showToast('Loads merged — new combined load created','success',3000);renderTMS();
}

// ── ACCESSORIAL AUDIT LOG ─────────────────────────────────────────
function logAccessorialChange(loadId,action,item,amount,user){
  const log=JSON.parse(localStorage.getItem('acc_log_'+loadId)||'[]');
  log.unshift({action,item,amount,user:user||(_currentUser?.name||'System'),ts:new Date().toISOString()});
  localStorage.setItem('acc_log_'+loadId,JSON.stringify(log));
}
function getAccessorialLog(loadId){return JSON.parse(localStorage.getItem('acc_log_'+loadId)||'[]');}

// ── LOAD DEPENDENCY LINKING ───────────────────────────────────────
function getLoadDeps(id){return JSON.parse(localStorage.getItem('load_deps_'+id)||'[]');}
function addLoadDep(id,depId,note){const deps=getLoadDeps(id);if(!deps.find(d=>d.id===depId)){deps.push({id:depId,note:note||'Must complete first',addedAt:localDateStr()});localStorage.setItem('load_deps_'+id,JSON.stringify(deps));}}

// ── LOAD BROKER MARGIN DISPLAY ────────────────────────────────────
let _showBrokerMargin=false;
function toggleBrokerMargin(){_showBrokerMargin=!_showBrokerMargin;renderTMS();}

// ── DELIVERY WINDOW TRACKER ───────────────────────────────────────
function deliveryWindowBadge(l){
  const m=getTMSMeta(l.id);if(!m.deliveryAppt) return '';
  const appt=new Date(m.deliveryAppt);const now=new Date();
  const diff=(appt-now)/3600000;
  if(diff<0&&!['Delivered','Invoiced','Paid'].includes(l.status)) return '<span style="font-size:10px;background:#fee2e2;color:var(--red);padding:1px 7px;border-radius:99px;font-weight:700">⚠️ Window passed</span>';
  if(diff<4) return '<span style="font-size:10px;background:#fef3c7;color:#d97706;padding:1px 7px;border-radius:99px;font-weight:700">🕐 Delivering soon</span>';
  return '';
}

// ── LOAD BOARD VISIBILITY ─────────────────────────────────────────
function getPublicLoads(){return getTMSLoads().filter(l=>getTMSMeta(l.id).isPublic);}
function toggleLoadPublic(id){const m=getTMSMeta(id);saveTMSMeta(id,{isPublic:!m.isPublic});showToast(m.isPublic?'Removed from load board':'Posted to load board','info',2000);}


// ════════════════════════════════════════════════════════════════════
// QUOTING + CARRIER + TEAM + AI + ANALYTICS FEATURES
// ════════════════════════════════════════════════════════════════════

// ── SPOT VS CONTRACT TOGGLE ───────────────────────────────────────
function getSpotContractBadge(q){
  if(!q.rateType) return '';
  const col=q.rateType==='contract'?'#0369a1':'#d97706';
  return `<span style="font-size:10px;background:${col}12;color:${col};padding:1px 7px;border-radius:99px;font-weight:700">${q.rateType==='contract'?'📄 Contract':'⚡ Spot'}</span>`;
}

// ── INSTANT RATE LOOKUP ───────────────────────────────────────────
function getInstantRate(pickupZip,deliveryZip,mode){
  const history=[...(window._fqHistory||[]),...(S.quotes||[])].filter(q=>q.pickupZip===pickupZip&&q.deliveryZip===deliveryZip&&(q.fqMode===mode||q.type===mode)&&q.customerRate>0);
  if(!history.length) return null;
  const recent=history.slice(-10);
  const avg=recent.reduce((s,q)=>s+(q.customerRate||0),0)/recent.length;
  const min=Math.min(...recent.map(q=>q.customerRate||0));
  const max=Math.max(...recent.map(q=>q.customerRate||0));
  return{avg:Math.round(avg),min:Math.round(min),max:Math.round(max),count:recent.length};
}
function showInstantRate(pickupZip,deliveryZip,mode){
  const r=getInstantRate(pickupZip,deliveryZip,mode);
  if(!r) return;
  const el=document.getElementById('instant-rate-hint');
  if(el) el.innerHTML=`<div style="font-size:11px;color:var(--gray-500);padding:4px 8px;background:var(--blue-bg);border-radius:var(--radius);margin-top:4px">📊 Your history: avg ${fmtD(r.avg)} · range ${fmtD(r.min)}–${fmtD(r.max)} · ${r.count} loads</div>`;
}

// ── QUOTE CONFIDENCE SCORE ────────────────────────────────────────
function calcQuoteConfidence(q){
  let score=50;
  const history=[...(window._fqHistory||[])].filter(h=>h.pickupZip===q.pickupZip&&h.deliveryZip===q.deliveryZip&&h.fqMode===q.fqMode&&['Booked','Delivered','Invoiced','Paid'].includes(h.status));
  if(history.length>5) score+=20; else if(history.length>0) score+=10;
  const p=getShipmentProfit(q,'freight');
  if(p.margin>=.15) score+=20; else if(p.margin>=.1) score+=10; else if(p.margin<.05) score-=20;
  if(q.carrier&&!isBlacklisted(q.carrier)) score+=10;
  return Math.max(0,Math.min(100,score));
}
function confidenceBadge(q){
  const s=calcQuoteConfidence(q);
  const col=s>=75?'var(--green)':s>=50?'var(--amber)':'var(--red)';
  const label=s>=75?'High confidence':s>=50?'Medium':'Low confidence';
  return`<span style="font-size:10px;background:${col}12;color:${col};padding:1px 7px;border-radius:99px;font-weight:700">🎯 ${label} (${s}%)</span>`;
}

// ── RATE BAND ALERT ───────────────────────────────────────────────
function rateBandAlert(q){
  const r=getInstantRate(q.pickupZip,q.deliveryZip,q.fqMode);
  if(!r||!q.customerRate) return '';
  const diff=(q.customerRate-r.avg)/r.avg;
  if(diff>0.3) return '<span style="font-size:10px;background:#fef3c7;color:#d97706;padding:1px 7px;border-radius:99px;font-weight:700">📈 30%+ above avg</span>';
  if(diff<-0.2) return '<span style="font-size:10px;background:#fee2e2;color:var(--red);padding:1px 7px;border-radius:99px;font-weight:700">📉 Below avg — check margin</span>';
  return '';
}

// ── MINIMUM MARGIN ENFORCER ───────────────────────────────────────
function getMinMargin(){return parseFloat(localStorage.getItem('min_margin_pct')||'5');}
function setMinMargin(pct){localStorage.setItem('min_margin_pct',pct);}
function checkMinMargin(q){
  const min=getMinMargin();const p=getShipmentProfit(q,'freight');
  if(p.margin*100<min){
    showToast(`⚠️ Margin ${pct(p.margin)} is below minimum ${min}% — manager override required`,'warning',5000);
    return false;
  }
  return true;
}

// ── QUOTE ASSIGNMENT ──────────────────────────────────────────────
function getQuoteAssignee(id){return localStorage.getItem('qassign_'+id)||'';}
function setQuoteAssignee(id,name){localStorage.setItem('qassign_'+id,name);}
function openAssignQuote(type,id){
  const agents=getAgentWinRates?Object.keys(getAgentWinRates()):[];
  $('modal-root').innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()">
  <div class="modal" style="max-width:500px">
    <div class="modal-title">👤 Assign quote</div>
    <div class="field"><label>Assign to</label>
      <select id="assign-agent" style="width:100%;padding:8px;border:1px solid var(--gray-200);border-radius:var(--radius)">
        <option value="">Unassigned</option>
        ${agents.map(a=>`<option ${getQuoteAssignee(id)===a?'selected':''}>${escH(a)}</option>`).join('')}
      </select>
    </div>
    <div class="modal-foot"><button class="btn" onclick="closeModal()">Cancel</button>
      <button class="btn blue" onclick="setQuoteAssignee('${id}',($('assign-agent')||{}).value);closeModal();showToast('Quote assigned','success',2000)">Assign</button>
    </div>
  </div></div>`;
}

// ── QUOTE REMINDER SCHEDULER ──────────────────────────────────────
function getQuoteReminders(){return JSON.parse(localStorage.getItem('quote_reminders')||'[]');}
function addQuoteReminder(id,date,note){
  const r=getQuoteReminders();
  r.push({id:'rem-'+Date.now(),quoteId:id,date,note,createdAt:localDateStr()});
  localStorage.setItem('quote_reminders',JSON.stringify(r));
}
function checkQuoteReminders(){
  const today=localDateStr();
  const due=getQuoteReminders().filter(r=>r.date===today&&!r.shown);
  due.forEach(r=>{r.shown=true;showToast('🔔 Reminder: '+escH(r.note||'Follow up on quote'),'info',8000);});
  if(due.length) localStorage.setItem('quote_reminders',JSON.stringify(getQuoteReminders().map(r=>({...r,shown:r.date===today?true:r.shown}))));
}
function openReminderModal(quoteId){
  $('modal-root').innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()">
  <div class="modal" style="max-width:500px">
    <div class="modal-title">🔔 Set follow-up reminder</div>
    <div class="field"><label>Remind me on</label><input type="date" id="rem-date" value="${localDateStr()}"></div>
    <div class="field"><label>Note</label><input type="text" id="rem-note" placeholder="e.g. Follow up with customer on FTL quote"></div>
    <div class="modal-foot"><button class="btn" onclick="closeModal()">Cancel</button>
      <button class="btn blue" onclick="addQuoteReminder('${quoteId}',($('rem-date')||{}).value,($('rem-note')||{}).value);closeModal();showToast('Reminder set','success',2000)">Save reminder</button>
    </div>
  </div></div>`;
}

// ── NEGOTIATION MODE ──────────────────────────────────────────────
function getNegotiationLog(id){return JSON.parse(localStorage.getItem('neg_'+id)||'[]');}
function addNegotiationEntry(id,party,amount,note){
  const log=getNegotiationLog(id);
  log.push({party,amount,note,ts:new Date().toISOString()});
  localStorage.setItem('neg_'+id,JSON.stringify(log));
}
function openNegotiationModal(id){
  const log=getNegotiationLog(id);
  $('modal-root').innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()">
  <div class="modal" style="max-width:500px">
    <div class="modal-title">🤝 Negotiation log</div>
    <div style="max-height:200px;overflow-y:auto;margin-bottom:12px">
      ${log.length?log.map(e=>`<div style="padding:8px 0;border-bottom:1px solid var(--gray-100)">
        <div style="display:flex;justify-content:space-between"><span style="font-size:12px;font-weight:700;color:${e.party==='Customer'?'var(--steel)':'var(--green)'}">${e.party}</span><span style="font-size:11px;color:var(--gray-400)">${new Date(e.ts).toLocaleDateString()}</span></div>
        <div style="font-size:13px;font-weight:800;color:var(--navy)">${fmtD(e.amount)}</div>
        ${e.note?`<div style="font-size:11px;color:var(--gray-500)">${escH(e.note)}</div>`:''}
      </div>`).join(''):'<div style="color:var(--gray-400);font-size:12px;padding:8px">No negotiation history yet</div>'}
    </div>
    <div class="g3">
      <div class="field"><label>Party</label><select id="neg-party" style="width:100%;padding:8px;border:1px solid var(--gray-200);border-radius:var(--radius)"><option>Customer</option><option>Us (counter)</option></select></div>
      <div class="field"><label>Offered rate</label><input type="number" id="neg-amt" placeholder="0"></div>
      <div class="field"><label>Note</label><input type="text" id="neg-note" placeholder="Optional"></div>
    </div>
    <div class="modal-foot"><button class="btn" onclick="closeModal()">Done</button>
      <button class="btn blue" onclick="addNegotiationEntry('${id}',($('neg-party')||{}).value,parseFloat(($('neg-amt')||{}).value)||0,($('neg-note')||{}).value);openNegotiationModal('${id}')">Add entry</button>
    </div>
  </div></div>`;
}

// ── REBOOKING SHORTCUT ────────────────────────────────────────────
function rebookLoad(id){
  const q=[...(S.quotes||[]),...(window._fqHistory||[])].find(q=>q.id===id);if(!q) return;
  const type=q.fqMode?'freight':'drayage';
  if(type==='freight'){
    Object.assign(S.fq,{fqMode:q.fqMode,pickupZip:q.pickupZip,deliveryZip:q.deliveryZip,customer:q.customer,carrier:q.carrier,commodity:q.commodity,weight:q.weight,customerRate:q.customerRate,carrierRate:q.carrierRate});
    S.view='freight';S.fqTab='builder';render();showToast('Pre-filled from previous load — update rates and save','success',4000);
  }
}

// ── AI RATE SUGGESTION ENGINE ─────────────────────────────────────
async function suggestRate(pickupZip,deliveryZip,mode){
  const history=[...(window._fqHistory||[])].filter(q=>q.pickupZip===pickupZip&&q.deliveryZip===deliveryZip&&q.fqMode===mode&&q.customerRate>0);
  const r=getInstantRate(pickupZip,deliveryZip,mode);
  if(r){
    const suggestion={customerRate:Math.round(r.avg*1.12),carrierRate:Math.round(r.avg*0.82),confidence:Math.min(95,60+history.length*5)};
    return suggestion;
  }
  // Fallback: estimate based on ZIP distance
  const miles=estimateMiles(pickupZip,deliveryZip);
  if(miles){
    const rpmCust=mode==='FTL'?3.2:2.8;const rpmCarr=mode==='FTL'?2.5:2.1;
    return{customerRate:Math.round(miles*rpmCust),carrierRate:Math.round(miles*rpmCarr),confidence:40};
  }
  return null;
}
async function applyRateSuggestion(pickupZip,deliveryZip,mode){
  const s=await suggestRate(pickupZip,deliveryZip,mode);
  if(!s){showToast('Not enough data to suggest rates','info');return;}
  S.fq.customerRate=s.customerRate;S.fq.carrierRate=s.carrierRate;
  renderFqBuilder&&renderFqBuilder();
  showToast(`🤖 Rates suggested (${s.confidence}% confidence) — customer ${fmtD(s.customerRate)}, carrier ${fmtD(s.carrierRate)}`,'info',4000);
}

// ── AI CHAT ASSISTANT ─────────────────────────────────────────────
function openAIChat(){
  $('modal-root').innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()">
  <div class="modal" style="max-width:520px">
    <div class="modal-title">🤖 AI Assistant</div>
    <div id="ai-chat-msgs" style="height:250px;overflow-y:auto;border:1px solid var(--gray-200);border-radius:var(--radius);padding:12px;margin-bottom:12px;background:var(--gray-50)">
      <div style="font-size:12px;color:var(--gray-400);text-align:center">Ask me anything about your loads, revenue, or carriers</div>
    </div>
    <div style="display:flex;gap:8px">
      <input type="text" id="ai-chat-input" placeholder="e.g. What are my top 5 customers this month?" style="flex:1;padding:9px 12px;border:1px solid var(--gray-200);border-radius:var(--radius);font-size:13px;font-family:inherit" onkeydown="if(event.key==='Enter')sendAIChat()">
      <button onclick="sendAIChat()" class="btn blue">Ask</button>
    </div>
    <div style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap">
      ${['Top customers this month','Revenue today','Overdue loads','Best margin lane'].map(q=>`<button onclick="$('ai-chat-input').value='${q}';sendAIChat()" style="font-size:11px;padding:3px 10px;border:1px solid var(--gray-200);border-radius:99px;background:transparent;cursor:pointer;font-family:inherit;color:var(--gray-600)">${q}</button>`).join('')}
    </div>
    <div class="modal-foot"><button class="btn" onclick="closeModal()">Close</button></div>
  </div></div>`;
}
function sendAIChat(){
  const input=$('ai-chat-input');const q=input?.value?.trim();if(!q) return;
  input.value='';
  const msgs=$('ai-chat-msgs');
  if(msgs) msgs.innerHTML+=`<div style="text-align:right;margin-bottom:8px"><span style="background:var(--steel);color:#fff;padding:6px 12px;border-radius:12px 12px 0 12px;font-size:12px;display:inline-block">${escH(q)}</span></div>`;

  // Answer locally from app data — no API call needed
  const answer=localAIAnswer(q.toLowerCase());
  setTimeout(()=>{
    if(msgs){msgs.innerHTML+=`<div style="margin-bottom:8px"><span style="background:#fff;border:1px solid var(--gray-200);padding:6px 12px;border-radius:12px 12px 12px 0;font-size:12px;display:inline-block;color:var(--navy);max-width:90%">${answer}</span></div>`;msgs.scrollTop=msgs.scrollHeight;}
  },400);
}

function localAIAnswer(q){
  const all=[...(S.quotes||[]),...(window._fqHistory||[]),...(window._aqHistory||[])];
  const booked=all.filter(l=>['Booked','Delivered','Invoiced','Paid'].includes(l.status));
  const today=localDateStr();const monthStart=today.slice(0,7)+'-01';
  const weekAgo=new Date(Date.now()-7*864e5).toISOString().slice(0,10);

  // Revenue questions
  if(q.includes('revenue')||q.includes('how much')||q.includes('made')){
    const period=q.includes('today')?'today':q.includes('week')?'week':q.includes('month')?'month':'all time';
    const filtered=period==='today'?booked.filter(l=>l.date===today):period==='week'?booked.filter(l=>l.date>=weekAgo):period==='month'?booked.filter(l=>l.date>=monthStart):booked;
    const rev=filtered.reduce((s,l)=>s+(l.customerRate||0),0);
    const profit=filtered.reduce((s,l)=>s+getShipmentProfit(l,'freight').profit,0);
    return`💰 ${period==='today'?'Today':period==='week'?'This week':period==='month'?'This month':'All time'}: <strong>${fmtD(rev)}</strong> revenue · <strong>${fmtD(profit)}</strong> profit · ${filtered.length} loads`;
  }

  // Customer questions
  if(q.includes('customer')||q.includes('top client')){
    const byCustomer={};booked.forEach(l=>{const c=l.customer||'Unknown';byCustomer[c]=(byCustomer[c]||0)+(l.customerRate||0);});
    const top=Object.entries(byCustomer).sort((a,b)=>b[1]-a[1]).slice(0,5);
    if(!top.length) return 'No booked loads yet to rank customers.';
    return'🏆 Top customers:<br>'+top.map(([n,r],i)=>`${i+1}. <strong>${escH(n)}</strong> — ${fmtD(r)}`).join('<br>');
  }

  // Load count
  if(q.includes('how many load')||q.includes('load count')||q.includes('total load')){
    const active=getTMSLoads().filter(l=>['Dispatched','In Transit','Out for Delivery'].includes(l.status));
    return`📦 Total loads in TMS: <strong>${getTMSLoads().length}</strong> · Active/in transit: <strong>${active.length}</strong> · Delivered: <strong>${booked.filter(l=>['Delivered','Invoiced','Paid'].includes(l.status)).length}</strong>`;
  }

  // Lane questions
  if(q.includes('lane')||q.includes('route')||q.includes('quoted')){
    const lanes=new Set(all.map(l=>(l.pickupZip||'')+'→'+(l.deliveryZip||'')).filter(l=>l!=='→'));
    const topLane=Object.entries(all.reduce((acc,l)=>{const k=(l.pickupZip||'?')+'→'+(l.deliveryZip||'?');acc[k]=(acc[k]||0)+1;return acc;},{})).sort((a,b)=>b[1]-a[1])[0];
    return`🗺️ Unique lanes quoted: <strong>${lanes.size}</strong>${topLane?` · Most frequent: <strong>${topLane[0]}</strong> (${topLane[1]} times)`:''}`;
  }

  // Overdue
  if(q.includes('overdue')||q.includes('late')||q.includes('behind')){
    const ov=getOverdueLoads();
    if(!ov.length) return '✅ No overdue loads — all loads are on schedule!';
    return`⚠️ <strong>${ov.length}</strong> overdue load${ov.length>1?'s':''}:<br>`+ov.slice(0,5).map(l=>`• ${escH(l.customer||'—')} (ETA was ${getTMSMeta(l.id).eta||'unknown'})`).join('<br>');
  }

  // Carrier questions
  if(q.includes('carrier')||q.includes('trucker')){
    const carriers=new Set(booked.map(l=>l.carrier).filter(Boolean));
    const topCarrier=Object.entries(booked.reduce((acc,l)=>{if(l.carrier){acc[l.carrier]=(acc[l.carrier]||0)+1;}return acc;},{})).sort((a,b)=>b[1]-a[1])[0];
    return`🚛 Carriers used: <strong>${carriers.size}</strong>${topCarrier?` · Most used: <strong>${escH(topCarrier[0])}</strong> (${topCarrier[1]} loads)`:''}`;
  }

  // Margin questions
  if(q.includes('margin')||q.includes('profit')||q.includes('best lane')){
    const byLane={};booked.forEach(l=>{const k=(l.pickupZip||'?')+'→'+(l.deliveryZip||'?');if(!byLane[k])byLane[k]={rev:0,profit:0};byLane[k].rev+=(l.customerRate||0);byLane[k].profit+=getShipmentProfit(l,'freight').profit;});
    const best=Object.entries(byLane).filter(([,d])=>d.rev>0).sort((a,b)=>(b[1].profit/b[1].rev)-(a[1].profit/a[1].rev))[0];
    if(!best) return 'Not enough data to calculate margins yet.';
    return`📈 Best margin lane: <strong>${best[0]}</strong> — ${pct(best[1].profit/best[1].rev)} margin (${fmtD(best[1].profit)} profit)`;
  }

  // AR / invoicing
  if(q.includes('invoice')||q.includes('unpaid')||q.includes('ar ')||q.includes('outstanding')){
    const unpaid=all.filter(l=>l.status==='Invoiced').reduce((s,l)=>s+(l.customerRate||0),0);
    const count=all.filter(l=>l.status==='Invoiced').length;
    return`🧾 Outstanding AR: <strong>${fmtD(unpaid)}</strong> across <strong>${count}</strong> unpaid invoice${count!==1?'s':''}`;
  }

  // Active shipments
  if(q.includes('active')||q.includes('in transit')||q.includes('moving')){
    const active=getTMSLoads().filter(l=>['Dispatched','In Transit','Out for Delivery'].includes(l.status));
    if(!active.length) return '📦 No loads currently in transit.';
    return`🚚 <strong>${active.length}</strong> load${active.length>1?'s':''} currently active:<br>`+active.slice(0,5).map(l=>`• ${escH(l.customer||'—')} — ${l.status}`).join('<br>');
  }

  // Help
  if(q.includes('help')||q.includes('what can')){
    return'🤖 I can answer questions about:<br>• <strong>Revenue</strong> — today, this week, this month<br>• <strong>Top customers</strong> by revenue<br>• <strong>Load counts</strong> and active shipments<br>• <strong>Overdue loads</strong><br>• <strong>Best margin lanes</strong><br>• <strong>Outstanding AR</strong><br>• <strong>Carrier usage</strong><br>• <strong>Lane history</strong>';
  }

  // Default — try to give something useful
  const totalRev=booked.reduce((s,l)=>s+(l.customerRate||0),0);
  const totalProfit=booked.reduce((s,l)=>s+getShipmentProfit(l,'freight').profit,0);
  return`📊 Quick summary: <strong>${booked.length}</strong> loads booked · <strong>${fmtD(totalRev)}</strong> total revenue · <strong>${fmtD(totalProfit)}</strong> profit · <strong>${getOverdueLoads().length}</strong> overdue<br><br>Try asking: "top customers", "revenue this month", "overdue loads", or "best margin lane"`;
}

// ── LATE PAYMENT FEE CALCULATOR ───────────────────────────────────
function calcLateFee(invoiceDate,amount,ratePct=1.5){
  const days=Math.floor((new Date()-new Date(invoiceDate))/864e5);
  if(days<=30) return{fee:0,days};
  const overDays=days-30;const fee=amount*(ratePct/100)*(overDays/30);
  return{fee:Math.round(fee*100)/100,days,overDays};
}
function lateFeeDisplay(invoice){
  if(!invoice||!invoice.invDate) return '';
  const l=calcLateFee(invoice.invDate,invoice.grandTotal||0);
  if(!l.fee) return '';
  return`<div style="background:#fff5f5;border:1px solid #fca5a5;border-radius:var(--radius);padding:8px 12px;margin-top:8px;font-size:12px"><strong style="color:var(--red)">Late fee: ${fmtD(l.fee)}</strong> · ${l.overDays} days overdue · Total due: ${fmtD((invoice.grandTotal||0)+l.fee)}</div>`;
}

// ── CARRIER MANAGEMENT FEATURES ───────────────────────────────────

// Carrier rate negotiation log
function getCarrierNegLog(name){return JSON.parse(localStorage.getItem('carrier_neg_'+name)||'[]');}
function addCarrierNegEntry(name,lane,rate,note){
  const log=getCarrierNegLog(name);log.unshift({lane,rate,note,date:localDateStr(),ts:new Date().toISOString()});
  localStorage.setItem('carrier_neg_'+name,JSON.stringify(log.slice(0,50)));
}

// Carrier do-not-use dates
function getCarrierBlockDates(name){return JSON.parse(localStorage.getItem('carrier_block_'+name)||'[]');}
function addCarrierBlockDate(name,date,reason){
  const dates=getCarrierBlockDates(name);dates.push({date,reason});
  localStorage.setItem('carrier_block_'+name,JSON.stringify(dates));
}
function isCarrierBlocked(name,date){return getCarrierBlockDates(name).some(d=>d.date===date);}

// Carrier tender acceptance rate
function getCarrierTenderStats(name){return JSON.parse(localStorage.getItem('carrier_tender_'+name)||'{"tendered":0,"accepted":0}');}
function recordTenderResponse(name,accepted){
  const s=getCarrierTenderStats(name);s.tendered++;if(accepted) s.accepted++;
  localStorage.setItem('carrier_tender_'+name,JSON.stringify(s));
}
function tenderAcceptanceBadge(name){
  const s=getCarrierTenderStats(name);if(!s.tendered) return '';
  const rate=Math.round(s.accepted/s.tendered*100);
  const col=rate>=80?'var(--green)':rate>=50?'var(--amber)':'var(--red)';
  return`<span style="font-size:10px;background:${col}12;color:${col};padding:1px 7px;border-radius:99px;font-weight:700">✉️ ${rate}% acceptance</span>`;
}

// Carrier age & fleet size
function getCarrierProfile(name){return JSON.parse(localStorage.getItem('carrier_profile_'+name)||'{}');}
function saveCarrierProfile(name,data){localStorage.setItem('carrier_profile_'+name,JSON.stringify({...getCarrierProfile(name),...data}));}

// Carrier new authority alert
function isNewCarrier(name){const p=getCarrierProfile(name);if(!p.authorityDate) return false;const months=(new Date()-new Date(p.authorityDate))/(864e5*30);return months<6;}
function newCarrierBadge(name){return isNewCarrier(name)?'<span style="font-size:10px;background:#fef3c7;color:#d97706;padding:1px 7px;border-radius:99px;font-weight:700">⚠️ New authority &lt;6mo</span>':'';}

// Carrier safety rating
function getCarrierSafety(name){return localStorage.getItem('carrier_safety_'+name)||'Unknown';}
function setCarrierSafety(name,rating){localStorage.setItem('carrier_safety_'+name,rating);}
function safetyBadge(name){const r=getCarrierSafety(name);const col={'Satisfactory':'var(--green)','Conditional':'var(--amber)','Unsatisfactory':'var(--red)'}[r]||'var(--gray-400)';return r!=='Unknown'?`<span style="font-size:10px;background:${col}12;color:${col};padding:1px 7px;border-radius:99px;font-weight:700">🛡️ ${r}</span>`:'';}

// Carrier DOT number lookup
async function lookupDOT(dotNumber,targetName){
  showToast('Looking up DOT '+dotNumber+'...','info',2000);
  try{
    const r=await fetch(`https://mobile.fmcsa.dot.gov/qc/services/carriers/${dotNumber}?webKey=your_key`);
    if(!r.ok) throw new Error('FMCSA lookup unavailable');
    const data=await r.json();
    const carrier=data?.content?.carrier;
    if(carrier) saveCarrierProfile(targetName||carrier.legalName,{dotNumber,legalName:carrier.legalName,state:carrier.phyState,authority:carrier.carrierOperation});
  }catch(e){
    showToast('Enter DOT info manually — FMCSA API requires key','info',3000);
  }
}
function openDOTModal(carrierName){
  const p=getCarrierProfile(carrierName);
  $('modal-root').innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()">
  <div class="modal" style="max-width:500px">
    <div class="modal-title">🔍 DOT / Authority info — ${escH(carrierName)}</div>
    <div class="g2">
      <div class="field"><label>DOT number</label><input type="text" id="dot-num" value="${escH(p.dotNumber||'')}" placeholder="12345678"></div>
      <div class="field"><label>MC number</label><input type="text" id="mc-num" value="${escH(p.mcNumber||'')}" placeholder="MC-123456"></div>
    </div>
    <div class="g2">
      <div class="field"><label>Authority date</label><input type="date" id="auth-date" value="${p.authorityDate||''}"></div>
      <div class="field"><label>Safety rating</label><select id="safety-rat" style="width:100%;padding:8px;border:1px solid var(--gray-200);border-radius:var(--radius)"><option ${getCarrierSafety(carrierName)==='Satisfactory'?'selected':''}>Satisfactory</option><option ${getCarrierSafety(carrierName)==='Conditional'?'selected':''}>Conditional</option><option ${getCarrierSafety(carrierName)==='Unsatisfactory'?'selected':''}>Unsatisfactory</option><option>Unknown</option></select></div>
    </div>
    <div class="field"><label>Fleet size</label><input type="number" id="fleet-sz" value="${p.fleetSize||''}" placeholder="Number of trucks"></div>
    <div class="modal-foot"><button class="btn" onclick="closeModal()">Cancel</button>
      <button class="btn blue" onclick="saveCarrierProfile('${escH(carrierName)}',{dotNumber:($('dot-num')||{}).value?.trim(),mcNumber:($('mc-num')||{}).value?.trim(),authorityDate:($('auth-date')||{}).value,fleetSize:parseInt(($('fleet-sz')||{}).value)||0});setCarrierSafety('${escH(carrierName)}',($('safety-rat')||{}).value);closeModal();showToast('DOT info saved','success',2000)">Save</button>
    </div>
  </div></div>`;
}

// Carrier incident report
function getCarrierIncidents(name){return JSON.parse(localStorage.getItem('carrier_incidents_'+name)||'[]');}
function addCarrierIncident(name,type,description,loadId){
  const list=getCarrierIncidents(name);
  list.unshift({type,description,loadId,date:localDateStr(),ts:new Date().toISOString()});
  localStorage.setItem('carrier_incidents_'+name,JSON.stringify(list.slice(0,50)));
}
function incidentBadge(name){const c=getCarrierIncidents(name).length;return c?`<span style="font-size:10px;background:#fee2e2;color:var(--red);padding:1px 7px;border-radius:99px;font-weight:700">⚠️ ${c} incident${c>1?'s':''}</span>`:'';}

// Carrier lane commitment tracker
function getLaneCommitments(carrier){return JSON.parse(localStorage.getItem('lane_commit_'+carrier)||'[]');}
function saveLaneCommitment(carrier,pickupZip,deliveryZip,monthlyVol,rate){
  const list=getLaneCommitments(carrier);
  const existing=list.findIndex(c=>c.pickupZip===pickupZip&&c.deliveryZip===deliveryZip);
  const entry={pickupZip,deliveryZip,monthlyVol,rate,updatedAt:localDateStr()};
  if(existing>=0) list[existing]=entry; else list.push(entry);
  localStorage.setItem('lane_commit_'+carrier,JSON.stringify(list));
}

// ── TEAM FEATURES ─────────────────────────────────────────────────

// User availability status
function getMyStatus(){return localStorage.getItem('my_status_'+(_currentUser?.id||'me'))||'Available';}
function setMyStatus(status){localStorage.setItem('my_status_'+(_currentUser?.id||'me'),status);}
const STATUS_OPTS=['Available','In a call','Away','Do not disturb'];
function statusColor(s){return{'Available':'var(--green)','In a call':'var(--amber)','Away':'var(--gray-400)','Do not disturb':'var(--red)'}[s]||'var(--gray-400)';}
function statusDot(status){return`<span style="width:8px;height:8px;border-radius:50%;background:${statusColor(status)};display:inline-block;margin-right:4px"></span>`;}
function openStatusPicker(){
  $('modal-root').innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()">
  <div class="modal" style="max-width:500px">
    <div class="modal-title">Set your status</div>
    <div style="display:flex;flex-direction:column;gap:8px">
      ${STATUS_OPTS.map(s=>`<button onclick="setMyStatus('${s}');closeModal();render()" style="display:flex;align-items:center;gap:8px;padding:10px 14px;border:1.5px solid ${getMyStatus()===s?statusColor(s):'var(--gray-200)'};border-radius:var(--radius);background:transparent;cursor:pointer;font-family:inherit;font-size:13px;font-weight:600;color:var(--navy)">${statusDot(s)}${s}</button>`).join('')}
    </div>
  </div></div>`;
}

// Team announcements
function getAnnouncements(){return JSON.parse(localStorage.getItem('team_announcements')||'[]');}
function postAnnouncement(text,author){
  const list=getAnnouncements();list.unshift({id:'ann-'+Date.now(),text,author,ts:new Date().toISOString()});
  if(list.length>20) list.pop();
  localStorage.setItem('team_announcements',JSON.stringify(list));
}
function dismissAnnouncement(id){
  const key='ann_dismissed_'+(_currentUser?.id||'me');
  const d=JSON.parse(localStorage.getItem(key)||'[]');d.push(id);
  localStorage.setItem(key,JSON.stringify(d));
}
function getActiveAnnouncements(){
  const dismissed=JSON.parse(localStorage.getItem('ann_dismissed_'+(_currentUser?.id||'me'))||'[]');
  return getAnnouncements().filter(a=>!dismissed.includes(a.id));
}
function announcementBanner(){
  const active=getActiveAnnouncements();if(!active.length) return '';
  const a=active[0];
  return`<div style="background:linear-gradient(135deg,var(--navy),var(--steel));color:#fff;padding:10px 16px;border-radius:var(--radius);margin-bottom:12px;display:flex;align-items:center;justify-content:space-between">
    <div><div style="font-size:11px;opacity:.7">📢 Announcement · ${new Date(a.ts).toLocaleDateString()}</div>
    <div style="font-size:13px;font-weight:700;margin-top:2px">${escH(a.text)}</div></div>
    <button onclick="dismissAnnouncement('${a.id}');render()" style="border:none;background:rgba(255,255,255,.2);color:#fff;border-radius:99px;cursor:pointer;padding:4px 10px;font-size:12px">✕</button>
  </div>`;
}

// Kudos system
function getKudos(){return JSON.parse(localStorage.getItem('team_kudos')||'[]');}
function giveKudos(toUser,loadId,message){
  const list=getKudos();
  list.unshift({to:toUser,from:_currentUser?.name||'Team',loadId,message,ts:new Date().toISOString(),id:'kudo-'+Date.now()});
  localStorage.setItem('team_kudos',JSON.stringify(list.slice(0,100)));
  showToast('🎉 Kudos given to '+toUser,'success',2000);
}
function recentKudos(limit=5){return getKudos().slice(0,limit);}

// Team goals tracker
function getTeamGoals(){return JSON.parse(localStorage.getItem('team_goals')||JSON.stringify({weeklyRev:0,monthlyRev:0,weeklyLoads:0,monthlyLoads:0}));}
function saveTeamGoals(goals){localStorage.setItem('team_goals',JSON.stringify(goals));}
function teamGoalProgress(){
  const goals=getTeamGoals();const today=localDateStr();
  const weekAgo=new Date(Date.now()-7*864e5).toISOString().slice(0,10);
  const monthStart=today.slice(0,7)+'-01';
  const allLoads=[...(S.quotes||[]),...(window._fqHistory||[])].filter(q=>['Booked','Delivered','Invoiced','Paid'].includes(q.status));
  const weekLoads=allLoads.filter(q=>q.date>=weekAgo);
  const monthLoads=allLoads.filter(q=>q.date>=monthStart);
  return{
    weeklyRev:{actual:weekLoads.reduce((s,q)=>s+(q.customerRate||0),0),goal:goals.weeklyRev},
    monthlyRev:{actual:monthLoads.reduce((s,q)=>s+(q.customerRate||0),0),goal:goals.monthlyRev},
    weeklyLoads:{actual:weekLoads.length,goal:goals.weeklyLoads},
    monthlyLoads:{actual:monthLoads.length,goal:goals.monthlyLoads},
  };
}
function renderTeamGoals(){
  const prog=teamGoalProgress();
  const goals=getTeamGoals();
  return`<div class="card" style="margin-bottom:14px">
    <div style="font-size:14px;font-weight:800;color:var(--navy);margin-bottom:12px">🎯 Team goals</div>
    ${[['Weekly revenue',prog.weeklyRev,'weeklyRev',true],['Monthly revenue',prog.monthlyRev,'monthlyRev',true],['Weekly loads',prog.weeklyLoads,'weeklyLoads',false],['Monthly loads',prog.monthlyLoads,'monthlyLoads',false]].map(([label,p,key,isMoney])=>{
      const pct2=p.goal>0?Math.min(1,p.actual/p.goal):0;const col=pct2>=1?'var(--green)':pct2>=.7?'var(--amber)':'var(--steel)';
      return`<div style="margin-bottom:12px">
        <div style="display:flex;justify-content:space-between;margin-bottom:4px">
          <span style="font-size:12px;font-weight:600;color:var(--navy)">${label}</span>
          <span style="font-size:12px;font-weight:700;color:${col}">${isMoney?fmtD(p.actual):p.actual} / ${isMoney?fmtD(p.goal):p.goal}</span>
        </div>
        <div style="height:6px;background:var(--gray-100);border-radius:3px;overflow:hidden">
          <div style="height:6px;width:${Math.round(pct2*100)}%;background:${col};border-radius:3px;transition:width 1s"></div>
        </div>
      </div>`;}).join('')}
    <button onclick="openGoalSetter()" class="btn" style="font-size:12px;width:100%;margin-top:4px">⚙️ Set goals</button>
  </div>`;
}
function openGoalSetter(){
  const g=getTeamGoals();
  $('modal-root').innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()">
  <div class="modal" style="max-width:500px">
    <div class="modal-title">🎯 Set team goals</div>
    <div class="g2">
      <div class="field"><label>Weekly revenue ($)</label><input type="number" id="g-wr" value="${g.weeklyRev||''}"></div>
      <div class="field"><label>Monthly revenue ($)</label><input type="number" id="g-mr" value="${g.monthlyRev||''}"></div>
      <div class="field"><label>Weekly loads</label><input type="number" id="g-wl" value="${g.weeklyLoads||''}"></div>
      <div class="field"><label>Monthly loads</label><input type="number" id="g-ml" value="${g.monthlyLoads||''}"></div>
    </div>
    <div class="modal-foot"><button class="btn" onclick="closeModal()">Cancel</button>
      <button class="btn blue" onclick="saveTeamGoals({weeklyRev:parseFloat(($('g-wr')||{}).value)||0,monthlyRev:parseFloat(($('g-mr')||{}).value)||0,weeklyLoads:parseInt(($('g-wl')||{}).value)||0,monthlyLoads:parseInt(($('g-ml')||{}).value)||0});closeModal();render()">Save goals</button>
    </div>
  </div></div>`;
}

// Training mode
function isTrainingMode(){return localStorage.getItem('training_mode')==='1';}
function toggleTrainingMode(){localStorage.setItem('training_mode',isTrainingMode()?'0':'1');showToast(isTrainingMode()?'🎓 Training mode ON — quotes require approval':'Training mode off','info',3000);}

// Performance review dashboard
function renderPerformanceReview(){
  const agents=getAgentWinRates?getAgentWinRates():{};
  const sorted=Object.entries(agents).sort((a,b)=>b[1].booked-a[1].booked);
  const month=new Date().toLocaleString('en-US',{month:'long',year:'numeric'});
  return`<div style="font-size:16px;font-weight:800;color:var(--navy);margin-bottom:4px">📊 Performance review — ${month}</div>
  <div class="tbl-wrap" style="margin-top:12px"><table><thead><tr><th>Agent</th><th>Quotes</th><th>Booked</th><th>Win rate</th><th>Lost</th><th>Top loss reason</th></tr></thead><tbody>
    ${sorted.map(([name,d])=>{
      const topReason=Object.entries(d.lossReasons||{}).sort((a,b)=>b[1]-a[1])[0];
      return`<tr><td class="bold">${escH(name)}</td><td>${d.total}</td><td style="color:var(--green);font-weight:700">${d.booked}</td>
      <td style="font-weight:700;color:${d.total>0?d.booked/d.total>=.5?'var(--green)':'var(--amber)':'var(--gray-400)'}">${d.total>0?Math.round(d.booked/d.total*100)+'%':'—'}</td>
      <td style="color:var(--red)">${d.lost}</td><td style="font-size:12px;color:var(--gray-500)">${topReason?escH(topReason[0]):'—'}</td></tr>`;
    }).join('')||'<tr><td colspan="6" style="text-align:center;color:var(--gray-400);padding:20px">No data yet</td></tr>'}
  </tbody></table></div>`;
}

// ── EXECUTIVE DASHBOARD ───────────────────────────────────────────
function renderExecutiveDashboard(){
  const all=[...(S.quotes||[]),...(window._fqHistory||[])];
  const booked=all.filter(q=>['Booked','Delivered','Invoiced','Paid'].includes(q.status));
  const today=localDateStr();const monthStart=today.slice(0,7)+'-01';const weekAgo=new Date(Date.now()-7*864e5).toISOString().slice(0,10);
  const mtd=booked.filter(q=>q.date>=monthStart);const wtd=booked.filter(q=>q.date>=weekAgo);
  const mtdRev=mtd.reduce((s,q)=>s+(q.customerRate||0),0);const mtdProfit=mtd.reduce((s,q)=>s+getShipmentProfit(q,'freight').profit,0);
  const wtdRev=wtd.reduce((s,q)=>s+(q.customerRate||0),0);
  const ar=all.filter(q=>q.status==='Invoiced').reduce((s,q)=>s+(q.customerRate||0),0);

  return`<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:16px">
    <div class="kpi" style="background:linear-gradient(135deg,#1a2e4a,#2e75b6);border:none"><div class="kpi-lbl" style="color:rgba(255,255,255,.7)">MTD Revenue</div><div class="kpi-val" style="color:#fff;font-size:20px">${fmtD(mtdRev)}</div><div style="font-size:11px;color:rgba(255,255,255,.6)">${mtd.length} loads</div></div>
    <div class="kpi" style="background:linear-gradient(135deg,#065f46,#059669);border:none"><div class="kpi-lbl" style="color:rgba(255,255,255,.7)">MTD Profit</div><div class="kpi-val" style="color:#fff;font-size:20px">${fmtD(mtdProfit)}</div><div style="font-size:11px;color:rgba(255,255,255,.6)">${mtdRev>0?pct(mtdProfit/mtdRev):0} margin</div></div>
    <div class="kpi" style="background:linear-gradient(135deg,#92400e,#d97706);border:none"><div class="kpi-lbl" style="color:rgba(255,255,255,.7)">WTD Revenue</div><div class="kpi-val" style="color:#fff;font-size:20px">${fmtD(wtdRev)}</div><div style="font-size:11px;color:rgba(255,255,255,.6)">${wtd.length} loads</div></div>
    <div class="kpi" style="background:linear-gradient(135deg,#831843,#be185d);border:none"><div class="kpi-lbl" style="color:rgba(255,255,255,.7)">Outstanding AR</div><div class="kpi-val" style="color:#fff;font-size:20px">${fmtD(ar)}</div></div>
  </div>`;
}

// ── WEEKLY PERFORMANCE REVIEW ─────────────────────────────────────
function generateWeeklyReport(){
  const weekAgo=new Date(Date.now()-7*864e5).toISOString().slice(0,10);
  const loads=[...(S.quotes||[]),...(window._fqHistory||[])].filter(q=>q.date>=weekAgo&&['Booked','Delivered','Invoiced','Paid'].includes(q.status));
  const rev=loads.reduce((s,q)=>s+(q.customerRate||0),0);const profit=loads.reduce((s,q)=>s+getShipmentProfit(q,'freight').profit,0);
  $('modal-root').innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()">
  <div class="modal" style="max-width:500px">
    <div class="modal-title">📊 Weekly performance report</div>
    <div style="font-size:13px;color:var(--gray-500);margin-bottom:14px">Week of ${weekAgo} to ${localDateStr()}</div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:14px">
      <div class="kpi"><div class="kpi-lbl">Loads booked</div><div class="kpi-val" style="font-size:24px">${loads.length}</div></div>
      <div class="kpi"><div class="kpi-lbl">Revenue</div><div class="kpi-val" style="color:var(--steel);font-size:20px">${fmtD(rev)}</div></div>
      <div class="kpi"><div class="kpi-lbl">Profit</div><div class="kpi-val" style="color:var(--green);font-size:20px">${fmtD(profit)}</div></div>
    </div>
    <div style="font-size:12px;font-weight:700;color:var(--gray-400);margin-bottom:8px;text-transform:uppercase">Top customers this week</div>
    ${Object.entries(loads.reduce((acc,q)=>{acc[q.customer||'?']=(acc[q.customer||'?']||0)+(q.customerRate||0);return acc;},{})).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([n,r])=>`<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--gray-100);font-size:13px"><span class="bold">${escH(n)}</span><span style="color:var(--steel);font-weight:700">${fmtD(r)}</span></div>`).join('')}
    <div class="modal-foot"><button class="btn" onclick="closeModal()">Close</button></div>
  </div></div>`;
}

// ── DRAYAGE FEATURES ──────────────────────────────────────────────

// Container size tracker
function containerSizeBadge(q){
  if(!q.containerSize) return '';
  const col={'20ft':'#0369a1','40ft':'#16a34a','40HC':'#7c3aed','45ft':'#d97706','53ft':'#dc2626'}[q.containerSize]||'#6b7280';
  return`<span style="font-size:10px;background:${col}12;color:${col};padding:1px 7px;border-radius:99px;font-weight:700">📦 ${q.containerSize}</span>`;
}

// Pre-pull tracker
function getPrePulls(){return JSON.parse(localStorage.getItem('prepulls')||'[]');}
function addPrePull(containerNum,yard,rate){
  const list=getPrePulls();list.unshift({containerNum,yard,rate:parseFloat(rate)||0,dateIn:localDateStr(),id:'pp-'+Date.now()});
  localStorage.setItem('prepulls',JSON.stringify(list));
  showToast('Pre-pull logged','success',2000);
}
function renderPrePulls(){
  const list=getPrePulls();
  return list.map(p=>{const days=Math.floor((new Date()-new Date(p.dateIn))/864e5);const cost=days*(p.rate||75);
  return`<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--gray-100)">
    <div><div style="font-size:13px;font-weight:700;color:var(--navy)">${escH(p.containerNum)}</div>
    <div style="font-size:11px;color:var(--gray-500)">${escH(p.yard||'—')} · ${days} days in yard</div></div>
    <div style="text-align:right"><div style="font-size:13px;font-weight:800;color:var(--red)">${fmtD(cost)}</div>
    <div style="font-size:10px;color:var(--gray-400)">${fmtD(p.rate||75)}/day</div></div>
  </div>`;}).join('')||'<div style="color:var(--gray-400);font-size:12px;padding:8px">No pre-pulls logged</div>';
}

// CFS delivery order tracker
function getCFSOrders(){return JSON.parse(localStorage.getItem('cfs_orders')||'[]');}
function addCFSOrder(doNumber,cfs,customer,eta){
  const list=getCFSOrders();list.unshift({doNumber,cfs,customer,eta,addedAt:localDateStr(),id:'cfs-'+Date.now(),status:'Pending'});
  localStorage.setItem('cfs_orders',JSON.stringify(list));
}

// Container tracking log
function getContainerLog(){return JSON.parse(localStorage.getItem('container_log')||'[]');}
function logContainer(containerNum,bookingNum,shiflRef,vesselETA,terminal){
  const list=getContainerLog();const existing=list.findIndex(c=>c.containerNum===containerNum);
  const entry={containerNum,bookingNum,shiflRef,vesselETA,terminal,updatedAt:localDateStr()};
  if(existing>=0) list[existing]=entry; else list.unshift(entry);
  localStorage.setItem('container_log',JSON.stringify(list.slice(0,500)));
  showToast('Container logged','success',2000);
}

// ── CUSTOMIZABLE HOME SCREEN ──────────────────────────────────────
function getHomeWidgets(){return JSON.parse(localStorage.getItem('home_widgets')||JSON.stringify(['realtime','streak','quest','pipeline','quickactions']));}
function saveHomeWidgets(list){localStorage.setItem('home_widgets',JSON.stringify(list));}
function openWidgetCustomizer(){
  const current=getHomeWidgets();
  const all=[{id:'realtime',label:'💰 Real-time margin'},{id:'streak',label:'🔥 Streak & compliment'},{id:'quest',label:'⚡ Daily quest'},{id:'pipeline',label:'🚚 Pipeline'},{id:'quickactions',label:'⚡ Quick actions'},{id:'goals',label:'🎯 Team goals'},{id:'announcements',label:'📢 Announcements'},{id:'leaderboard',label:'🏆 Leaderboard preview'},{id:'performance',label:'📊 Performance summary'}];
  $('modal-root').innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()">
  <div class="modal" style="max-width:500px">
    <div class="modal-title">🎨 Customize home screen</div>
    <div style="font-size:12px;color:var(--gray-500);margin-bottom:12px">Choose which widgets appear on your home screen</div>
    <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:14px">
      ${all.map(w=>`<label style="display:flex;align-items:center;gap:10px;padding:8px;border:1px solid var(--gray-200);border-radius:var(--radius);cursor:pointer">
        <input type="checkbox" data-wid="${w.id}" ${current.includes(w.id)?'checked':''}>
        <span style="font-size:13px;font-weight:600;color:var(--navy)">${w.label}</span>
      </label>`).join('')}
    </div>
    <div class="modal-foot"><button class="btn" onclick="closeModal()">Cancel</button>
      <button class="btn blue" onclick="saveHomeWidgets([...document.querySelectorAll('[data-wid]:checked')].map(c=>c.dataset.wid));closeModal();render()">Save layout</button>
    </div>
  </div></div>`;
}

// ── GLOBAL UNDO HISTORY ───────────────────────────────────────────
const _undoStack=[];function pushUndo(action,undoFn){_undoStack.push({action,undoFn,ts:new Date()});if(_undoStack.length>20)_undoStack.shift();}
function globalUndo(){if(!_undoStack.length){showToast('Nothing to undo','info',2000);return;}const item=_undoStack.pop();try{item.undoFn();showToast('↩ Undid: '+item.action,'success',2000);}catch(e){showToast('Could not undo','error');}}
document.addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key==='k'){e.preventDefault();openCommandPalette&&openCommandPalette();}
if((e.metaKey||e.ctrlKey)&&e.key==='z'&&!e.shiftKey){e.preventDefault();globalUndo();}});

// ── APP TOUR REPLAY ───────────────────────────────────────────────
function replayTour(){
  const steps=[
    {title:'🏠 Home dashboard',desc:'Your daily overview — streak, quest, revenue, and quick actions all in one place',target:'nav-home'},
    {title:'🚢 Drayage quoting',desc:'Quote drayage moves — import and export, per-container pricing, chassis, and genset',target:'acc-drayage'},
    {title:'🚛 Freight quoting',desc:'FTL and LTL freight quotes with AI assistance and rate suggestions',target:'acc-freight'},
    {title:'🚚 TMS',desc:'Full transportation management — dispatch board, load tracking, BOL, invoicing, and reports',target:'nav-tms'},
    {title:'🧾 Invoicing',desc:'Customer and carrier invoicing — AR aging, bulk send, and payment tracking',target:'nav-invoicing'},
    {title:'🤝 Carrier network',desc:'Manage carriers — W-9s, certifications, safety ratings, and performance scores',target:'nav-carriers'},
    {title:'📊 Reports',desc:'Analytics, P&L, agent performance, and executive dashboard',target:'nav-reports'},
  ];
  let current=0;
  function showStep(){
    const s=steps[current];
    const existing=document.getElementById('tour-overlay');if(existing) existing.remove();
    const el=document.createElement('div');
    el.id='tour-overlay';
    el.style.cssText='position:fixed;bottom:80px;right:24px;z-index:99999;background:linear-gradient(135deg,var(--navy),var(--steel));color:#fff;border-radius:14px;padding:18px 22px;box-shadow:0 8px 32px rgba(0,0,0,.3);max-width:300px;animation:fadeInPreview .3s ease';
    el.innerHTML=`<div style="font-size:10px;opacity:.7;margin-bottom:4px">Step ${current+1} of ${steps.length}</div>
      <div style="font-size:15px;font-weight:800;margin-bottom:6px">${s.title}</div>
      <div style="font-size:12px;opacity:.85;line-height:1.5;margin-bottom:14px">${s.desc}</div>
      <div style="height:3px;background:rgba(255,255,255,.2);border-radius:2px;margin-bottom:14px"><div style="height:3px;width:${Math.round((current+1)/steps.length*100)}%;background:#fff;border-radius:2px"></div></div>
      <div style="display:flex;justify-content:space-between">
        <button onclick="document.getElementById('tour-overlay').remove()" style="border:1px solid rgba(255,255,255,.3);background:transparent;color:#fff;padding:6px 14px;border-radius:99px;cursor:pointer;font-family:inherit;font-size:12px">Exit tour</button>
        <button onclick="window._tourNext()" style="background:#fff;color:var(--navy);border:none;padding:6px 14px;border-radius:99px;cursor:pointer;font-family:inherit;font-size:12px;font-weight:700">${current<steps.length-1?'Next →':'Finish ✓'}</button>
      </div>`;
    document.body.appendChild(el);
    const target=document.getElementById(s.target);if(target){target.scrollIntoView({behavior:'smooth',block:'center'});}
  }
  window._tourNext=()=>{current++;if(current>=steps.length){document.getElementById('tour-overlay')?.remove();showToast('Tour complete! 🎉','success',3000);}else showStep();};
  showStep();
}



(function(){
  if(localStorage.getItem('shifl_dark')==='true') document.body.classList.add('dark');
  const _lt=parseInt(localStorage.getItem('shifl_login_time')||'0');
  if(_lt&&Date.now()-_lt>28800000){
    localStorage.removeItem('shifl_session');
    localStorage.removeItem('shifl_login_time');
  }
  window.addEventListener('beforeunload',function(){
    localStorage.setItem('shifl_login_time',Date.now().toString());
  });
})();
boot().catch(e=>{$('loading-screen').style.display='none';$('setup-screen').style.display='flex';});
