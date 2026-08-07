
// ═══════════════════════════════════════════════════════
// CHARGES
// ═══════════════════════════════════════════════════════
const CHARGES=['base','chassis','prepull','det_port','det_cust','storage','ovw43','ovw48','bobtail','toll','genset','triaxle'];
const LABELS={base:'Base',chassis:'Chassis',prepull:'Pre-pull',det_port:'Detention – Port',det_cust:'Detention – Customer',storage:'Storage',ovw43:'OVW (Over 43k lb)',ovw48:'OVW (Over 48k lb)',bobtail:'Bobtail',toll:'Toll',genset:'Genset',triaxle:'Triaxle'};
const US_PORTS=[
  // ── East Coast Seaports ─────────────────────────────────────
  'New York / Newark, NJ','Port Newark Container Terminal, NJ','APM Terminals Elizabeth, NJ',
  'Maher Terminals, Newark, NJ','PNCT, Port Newark, NJ','Port Liberty, Bayonne, NJ',
  'Port Liberty, New York, NY','Red Hook Terminal, Brooklyn, NY',
  'Port of Baltimore, MD','Seagirt Marine Terminal, Baltimore, MD','Dundalk Marine Terminal, MD',
  'Port of Virginia, VA','Norfolk International Terminals, VA','Virginia International Gateway, VA',
  'APM Terminals Virginia, VA','Portsmouth Marine Terminal, VA','Virginia Inland Port, Front Royal, VA',
  'Port of Savannah, GA','Garden City Terminal, Savannah, GA',
  'Port of Brunswick, GA',
  'Port of Charleston, SC','Wando Welch Terminal, Charleston, SC',
  'Hugh K. Leatherman Terminal, SC','North Charleston Terminal, SC',
  'Port of Jacksonville, FL','Blount Island Marine Terminal, Jacksonville, FL',
  'Talleyrand Marine Terminal, Jacksonville, FL',
  'Port of Miami, FL','PortMiami, FL',
  'Port Everglades, Fort Lauderdale, FL',
  'Port of Tampa, FL','Port of Port Canaveral, FL',
  'Port of Philadelphia, PA','Packer Marine Terminal, Philadelphia, PA',
  'Port of Wilmington, DE',
  'Port of Boston, MA','Conley Container Terminal, Boston, MA',
  'Port of Providence, RI',
  'Port of Wilmington, NC','Port of Morehead City, NC',
  // ── Gulf Coast Seaports ─────────────────────────────────────
  'Port of Houston, TX','Barbours Cut Terminal, Houston, TX','Bayport Container Terminal, Houston, TX',
  'Port of New Orleans, LA','Napoleon Avenue Container Terminal, New Orleans, LA',
  'Port of Mobile, AL','Port of Gulfport, MS',
  'Port of Freeport, TX','Port of Galveston, TX','Port of Corpus Christi, TX',
  // ── West Coast Seaports ─────────────────────────────────────
  'Port of Los Angeles, CA','Port of Long Beach, CA',
  'APM Terminals Los Angeles, CA','TraPac Terminal, Los Angeles, CA',
  'Everport Terminal Services, Los Angeles, CA','Fenix Marine Services, Los Angeles, CA',
  'SSA Marine Terminal, Long Beach, CA','Yang Ming Terminal, Long Beach, CA',
  'Pier T Terminal, Long Beach, CA',
  'Port of Oakland, CA','Oakland International Container Terminal, CA',
  'Ben E. Nutter Terminal, Oakland, CA',
  'Port of Seattle, WA','Terminal 5, Seattle, WA','Terminal 18, Seattle, WA',
  'Port of Tacoma, WA','Port of Portland, OR',
  'Port of San Francisco, CA',
  // ── BNSF Railyards ──────────────────────────────────────────
  'BNSF Logistics Park Chicago (Elgin), IL','BNSF Cicero Intermodal, IL',
  'BNSF Hobart / Commerce, Los Angeles, CA','BNSF San Bernardino Intermodal, CA',
  'BNSF Stockton, CA','BNSF Fresno, CA',
  'BNSF Argentine Yard, Kansas City, MO',
  'BNSF Logistics Park Memphis, TN',
  'BNSF Alliance, Fort Worth, TX','BNSF Southern Plains, Dallas, TX',
  'BNSF Auburn (Seattle), WA','BNSF Portland, OR',
  'BNSF Denver, CO','BNSF Galesburg, IL',
  'BNSF Minneapolis, MN','BNSF Logistics Park Phoenix, AZ',
  'BNSF Murray Yard, Salt Lake City, UT',
  // ── Union Pacific Railyards ──────────────────────────────────
  'UP ICTF, Los Angeles, CA','UP Global I, Chicago, IL','UP Global II, Chicago, IL',
  'UP Global III, Chicago, IL','UP Global IV, Chicago, IL',
  'UP Mesquite, Dallas, TX','UP Englewood, Houston, TX','UP Settegast Yard, Houston, TX',
  'UP Kansas City, MO','UP Memphis, TN','UP New Orleans, LA',
  'UP Denver, CO','UP Portland, OR','UP Argo Yard, Seattle, WA',
  'UP St. Louis, MO','UP Minneapolis, MN','UP Salt Lake City, UT',
  'UP San Antonio, TX','UP Tucson, AZ','UP Reno, NV','UP Ogden, UT',
  // ── Norfolk Southern Railyards ───────────────────────────────
  'NS Austell (Atlanta), GA','NS Landers, Chicago, IL',
  'NS Charlotte, NC','NS Chattanooga, TN',
  'NS Columbus, OH','NS Pittsburgh, PA','NS Detroit, MI',
  'NS Memphis, TN','NS Birmingham, AL','NS Louisville, KY',
  'NS Indianapolis, IN','NS Rutherford Yard, NJ','NS Linwood, Philadelphia, PA',
  // ── CSX Railyards ────────────────────────────────────────────
  'CSX Tilford, Atlanta, GA','CSX Locust Point, Baltimore, MD',
  'CSX Bedford Park, Chicago, IL','CSX Cincinnati, OH',
  'CSX Bowden, Jacksonville, FL','CSX New Orleans, LA',
  'CSX Nashville, TN','CSX Columbus, OH','CSX Detroit, MI',
  'CSX Louisville, KY','CSX Richmond, VA',
  'CSX Albany, NY','CSX Rochester, NY','CSX Syracuse, NY',
  'CSX Buffalo, NY','CSX Pittsburgh, PA',
  // ── CN / CPKC Railyards ──────────────────────────────────────
  'CN Chicago Intermodal, IL','CN Memphis, TN','CN Detroit, MI',
  'CPKC Franklin Park, Chicago, IL','CPKC Kansas City, MO','CPKC Dallas, TX',
,"Port of Felixstowe, UK","Port of Southampton, UK","Port of London (Tilbury), UK","Port of Liverpool, UK","Port of Bristol (Avonmouth), UK","Port of Hull, UK","Port of Immingham, UK","Port of Grimsby, UK"];
function isApplicable(c,ld){
  if((c==='det_port'||c==='det_cust')&&ld==='Drop') return false;
  if(c==='bobtail') return false; // bobtail handled per-quote like genset
  if(c==='genset') return false;   // genset handled per-quote
  if(c==='triaxle') return false;  // triaxle handled per-quote
  return true;
}
const DEFAULT_FLAT_RATES={chassis:45,prepull:175,det_port:100,det_cust:100,storage:60,ovw43:200,ovw48:350,bobtail:0,toll:220,genset:0,triaxle:0};
const DEFAULT_BASE_MARKUP={amount:150,mode:'flat'};
const US_CFS=[
  // ── Los Angeles / Long Beach, CA ──────────────────────────
  'CFS — STG Logistics, Carson, CA','CFS — STG Logistics, Torrance, CA',
  'CFS — CaroTrans, Long Beach, CA','CFS — DSV, Los Angeles, CA',
  'CFS — Yusen Logistics, Torrance, CA','CFS — Phoenix International, Gardena, CA',
  'CFS — Trans Pacific Container, Gardena, CA','CFS — Pacific Container Freight, Wilmington, CA',
  'CFS — SEKO Logistics, Los Angeles, CA','CFS — Vanguard Logistics, Los Angeles, CA',
  // ── New York / New Jersey ──────────────────────────────────
  'CFS — ICT (Intl Cargo Terminals), Kearny, NJ','CFS — CaroTrans, Clark, NJ',
  'CFS — St. George Logistics, South Kearny, NJ','CFS — Trans-Box Systems, South Kearny, NJ',
  'CFS — DSV, Elizabeth, NJ','CFS — STG Logistics, Newark, NJ',
  'CFS — All-Ways Forwarding, Kearny, NJ','CFS — Phoenix International, Elizabeth, NJ',
  'CFS — Vanguard Logistics, Kearny, NJ','CFS — Expeditors, Newark, NJ',
  // ── Chicago, IL ────────────────────────────────────────────
  'CFS — STG Logistics, Elk Grove Village, IL','CFS — ICT, Franklin Park, IL',
  'CFS — Pathway Logistics, Joliet, IL','CFS — DSV, Chicago, IL',
  'CFS — Phoenix International, Chicago, IL','CFS — Vanguard Logistics, Chicago, IL',
  'CFS — CaroTrans, Chicago, IL','CFS — St. George Warehouse, Chicago, IL',
  // ── Houston, TX ────────────────────────────────────────────
  'CFS — CaroTrans, Houston, TX','CFS — Southwest Freight, Houston, TX',
  'CFS — STG Logistics, Houston, TX','CFS — St. George Warehouse, Houston, TX',
  'CFS — DSV, Houston, TX','CFS — Phoenix International, Houston, TX',
  // ── Miami, FL ──────────────────────────────────────────────
  'CFS — CaroTrans, Miami, FL','CFS — ICT, Miami, FL',
  'CFS — STG Logistics, Miami, FL','CFS — DSV, Miami, FL',
  'CFS — Phoenix International, Miami, FL','CFS — St. George Logistics, Miami, FL',
  'CFS — Vanguard Logistics, Miami, FL',
  // ── Savannah, GA ───────────────────────────────────────────
  'CFS — STG Logistics, Savannah, GA','CFS — DSV, Savannah, GA',
  // ── Atlanta, GA ────────────────────────────────────────────
  'CFS — ICT, College Park, GA','CFS — St. George Logistics, Fairburn, GA',
  'CFS — STG Logistics, Atlanta, GA','CFS — DSV, Atlanta, GA',
  // ── Baltimore, MD ──────────────────────────────────────────
  'CFS — STG Logistics, Baltimore, MD','CFS — DSV, Baltimore, MD',
  'CFS — Vanguard Logistics, Baltimore, MD',
  // ── Norfolk / Virginia ─────────────────────────────────────
  'CFS — STG Logistics, Portsmouth, VA','CFS — DSV, Norfolk, VA',
  // ── Charleston, SC ─────────────────────────────────────────
  'CFS — STG Logistics, Charleston, SC','CFS — DSV, Charleston, SC',
  // ── Seattle / Tacoma, WA ───────────────────────────────────
  'CFS — CaroTrans, Kent, WA','CFS — STG Logistics, Tukwila, WA',
  'CFS — DSV, Seattle, WA','CFS — Vanguard Logistics, Seattle, WA',
  // ── Dallas / Fort Worth, TX ────────────────────────────────
  'CFS — STG Logistics, Dallas, TX','CFS — DSV, Dallas, TX',
  // ── Other gateways ─────────────────────────────────────────
  'CFS — STG Logistics, Jacksonville, FL','CFS — STG Logistics, Philadelphia, PA',
  'CFS — STG Logistics, Boston, MA','CFS — STG Logistics, Portland, OR',
  'CFS — CaroTrans, Indianapolis, IN','CFS — STG Logistics, Indianapolis, IN',
  'CFS — STG Logistics, Kansas City, MO','CFS — STG Logistics, Memphis, TN',
  'CFS — STG Logistics, Minneapolis, MN','CFS — STG Logistics, Detroit, MI',
  'CFS — STG Logistics, Charlotte, NC','CFS — STG Logistics, New Orleans, LA',
  'CFS — STG Logistics, Tampa, FL',
];
const NOTE_TEMPLATES=[
  'Chassis: 3-day minimum',
  'Chassis: 5-day minimum',
  'Chassis: 7-day minimum',
  'Detention: billed in 1-hour increments after 2 free hours',
  'Storage: billed per calendar day after 5 free days',
  'Pre-pull: required for empty container return',
  'OVW: overweight permit required — customer responsible for fees',
  'Appointment required for delivery',
  'Rates valid for 30 days from quote date',
  'Subject to fuel surcharge adjustment',
  'Hazmat: additional charges may apply',
];
const REGIONS=['NE','SE','Central','WC','Canada','UK'];
const SEED=[
  {id:'r1',region:'WC',carrier:'Fitted',port:'Los Angeles, CA',destination:'Fontana, CA',zip:'92337',ld:'Live',active:true,base:500,chassis:40,prepull:150,det_port:80,det_cust:80,storage:40,ovw43:0,ovw48:0,bobtail:0,toll:0,notes:'American Stitch LLC'},
  {id:'r2',region:'WC',carrier:'Fitted',port:'Long Beach, CA',destination:'Huntington Beach, CA',zip:'92648',ld:'Drop',active:true,base:365,chassis:40,prepull:150,det_port:0,det_cust:0,storage:40,ovw43:0,ovw48:0,bobtail:300,toll:0,notes:'Migo Trading LLC'},
  {id:'r3',region:'WC',carrier:'Fast Freight',port:'Everport Terminal, CA',destination:'Stockton, CA',zip:'95206',ld:'Live',active:true,base:950,chassis:55,prepull:195,det_port:95,det_cust:80,storage:50,ovw43:0,ovw48:0,bobtail:0,toll:0,notes:'Best at a Glance'},
  {id:'r4',region:'NE',carrier:'Platnum',port:'New York / Newark, NJ',destination:'Florida, NY',zip:'10923',ld:'Live',active:true,base:725,chassis:0,prepull:0,det_port:0,det_cust:0,storage:0,ovw43:0,ovw48:0,bobtail:0,toll:18,notes:''},
  {id:'r5',region:'NE',carrier:'Blitz',port:'New York / Newark, NJ',destination:'Florida, NY',zip:'10923',ld:'Live',active:true,base:825,chassis:25,prepull:0,det_port:0,det_cust:0,storage:0,ovw43:0,ovw48:0,bobtail:0,toll:18,notes:'Bobtail INC'},
  {id:'r6',region:'NE',carrier:'Express',port:'New York / Newark, NJ',destination:'Freehold, NJ',zip:'07728',ld:'Live',active:true,base:650,chassis:30,prepull:150,det_port:80,det_cust:80,storage:40,ovw43:150,ovw48:250,bobtail:0,toll:0,notes:''},
  {id:'r7',region:'NE',carrier:'Platnum',port:'New York / Newark, NJ',destination:'Bayshore, NY',zip:'11706',ld:'Live',active:true,base:1595,chassis:35,prepull:150,det_port:90,det_cust:90,storage:40,ovw43:200,ovw48:300,bobtail:0,toll:25,notes:''},
  {id:'r8',region:'NE',carrier:'Bound',port:'New York / Newark, NJ',destination:'Bayshore, NY',zip:'11706',ld:'Both',active:true,base:1330,chassis:40,prepull:150,det_port:85,det_cust:85,storage:35,ovw43:150,ovw48:250,bobtail:998,toll:25,notes:''},
  {id:'r9',region:'NE',carrier:'Platnum',port:'New York / Newark, NJ',destination:'Wilkes-Barre, PA',zip:'18702',ld:'Live',active:true,base:1410,chassis:35,prepull:150,det_port:90,det_cust:90,storage:40,ovw43:200,ovw48:300,bobtail:0,toll:0,notes:''},
  {id:'r10',region:'NE',carrier:'Bound',port:'New York / Newark, NJ',destination:'Wilkes-Barre, PA',zip:'18702',ld:'Live',active:true,base:1130,chassis:40,prepull:150,det_port:85,det_cust:85,storage:35,ovw43:150,ovw48:250,bobtail:0,toll:0,notes:''},
  {id:'r11',region:'NE',carrier:'Wayz',port:'New York / Newark, NJ',destination:'Wilkes-Barre, PA',zip:'18702',ld:'Drop',active:true,base:1075,chassis:40,prepull:150,det_port:0,det_cust:0,storage:35,ovw43:250,ovw48:400,bobtail:700,toll:0,notes:''},
  {id:'r12',region:'NE',carrier:'Bound',port:'New York / Newark, NJ',destination:'Greensburg, PA',zip:'15601',ld:'Live',active:true,base:2680,chassis:40,prepull:150,det_port:85,det_cust:85,storage:35,ovw43:150,ovw48:250,bobtail:0,toll:0,notes:''},
  {id:'r13',region:'NE',carrier:'Platnum',port:'New York / Newark, NJ',destination:'Paterson, NJ',zip:'07513',ld:'Live',active:true,base:765,chassis:35,prepull:150,det_port:90,det_cust:90,storage:40,ovw43:200,ovw48:300,bobtail:0,toll:18,notes:''},
];

// ═══════════════════════════════════════════════════════
// SUPABASE
// ═══════════════════════════════════════════════════════
let db=null;
let realtimeChannel=null;

function setSyncStatus(state){
  const dot=$('sync-dot'), lbl=$('sync-label');
  if(!dot||!lbl) return;
  dot.className='sync-dot'+(state==='on'?'':state==='loading'?' loading':' off');
  lbl.textContent=state==='on'?'Live sync on':state==='loading'?'Connecting…':'Disconnected';
}

async function connectSupabase(){
  const url=($('sb-url')||{}).value?.trim();
  const key=($('sb-key')||{}).value?.trim();
  const errEl=$('setup-error');
  if(!url||!key){if(errEl){errEl.style.display='block';errEl.textContent='Please enter both URL and key.';}return;}
  if(!url.startsWith('https://')){if(errEl){errEl.style.display='block';errEl.textContent='URL must start with https://';}return;}
  if(errEl) errEl.style.display='none';
  $('loading-screen').style.display='flex';
  $('setup-screen').style.display='none';
  $('loading-msg').textContent='Connecting to database…';
  try{
    const {createClient}=window.supabase;
    db=createClient(url,key);
    // Test connection
    const {error}=await db.from('rates').select('id').limit(1);
    if(error) throw error;
    localStorage.setItem('sb_url',url);
    localStorage.setItem('sb_key',key);
    await initApp();
  }catch(e){
    db=null;
    $('loading-screen').style.display='none';
    $('setup-screen').style.display='flex';
    const errEl=$('setup-error');
    if(errEl){errEl.style.display='block';errEl.textContent='Connection failed: '+(e.message||'Check your URL and key, and make sure you ran the setup SQL.');}
  }
}

function disconnectSupabase(){
  if(!confirm('Disconnect from Supabase? You will need to re-enter your connection details.')) return;
  localStorage.removeItem('sb_url');localStorage.removeItem('sb_key');
  db=null;
  if(realtimeChannel&&db) db.removeChannel(realtimeChannel);
  $('app').style.display='none';
  $('setup-screen').style.display='flex';
}

// ═══════════════════════════════════════════════════════
// DB HELPERS — convert between DB rows and app objects
// ═══════════════════════════════════════════════════════
function dbToRate(r){
  return {id:r.id,region:r.region||'NE',carrier:r.carrier||'',port:r.port||'',destination:r.destination||'',
    zip:r.zip||'',ld:r.ld||'Live',active:r.active!==false,notes:r.notes||'',
    base:+r.base||0,exportBase:+r.export_base||0,chassis:+r.chassis||0,prepull:+r.prepull||0,det_port:+r.det_port||0,det_cust:+r.det_cust||0,
    storage:+r.storage||0,ovw43:+r.ovw43||0,ovw48:+r.ovw48||0,bobtail:+r.bobtail||0,toll:+r.toll||0};
}
function rateToDb(r){
  return {id:r.id,region:r.region,carrier:r.carrier,port:r.port||'',destination:r.destination||'',
    zip:r.zip||'',ld:r.ld,active:r.active,notes:r.notes||'',
    base:r.base||0,export_base:r.exportBase||0,chassis:r.chassis||0,prepull:r.prepull||0,det_port:r.det_port||0,det_cust:r.det_cust||0,
    storage:r.storage||0,ovw43:r.ovw43||0,ovw48:r.ovw48||0,bobtail:r.bobtail||0,toll:r.toll||0};
}
function dbToQuote(r){
  return {id:r.id,quoteNum:r.quote_num,date:r.date,customer:r.customer||'',port:r.port||'',
    zip:r.zip||'',ld:r.ld||'Live',carrier:r.carrier||'',destination:r.destination||'',
    carrierRates:r.carrier_costs||{},customerRates:r.customer_prices||{},
    baseMarkup:r.base_markup||DEFAULT_BASE_MARKUP,flatRates:r.flat_rates||{...DEFAULT_FLAT_RATES},
    profit:+r.profit||0,profitPct:+r.profit_pct||0,status:r.status||'Quoted',notes:r.notes||'',shiflRef:r.shifl_ref||''};
}
function quoteToDb(q){
  return {id:q.id,quote_num:q.quoteNum,date:q.date,customer:q.customer||'',port:q.port||'',
    zip:q.zip||'',ld:q.ld,carrier:q.carrier||'',destination:q.destination||'',
    carrier_costs:q.carrierRates,customer_prices:q.customerRates,
    base_markup:q.baseMarkup,flat_rates:q.flatRates,
    profit:q.profit||0,profit_pct:q.profitPct||0,status:q.status,notes:q.notes||'',shifl_ref:q.shiflRef||''};
}

// ═══════════════════════════════════════════════════════
// DB CRUD
// ═══════════════════════════════════════════════════════
async function dbLoadRates(){
  const {data,error}=await db.from('rates').select('*').order('created_at');
  if(error) throw error;
  return data.map(dbToRate);
}
async function dbLoadQuotes(){
  const {data,error}=await db.from('quotes').select('*').order('created_at',{ascending:false});
  if(error) throw error;
  return data.map(dbToQuote);
}
async function dbSaveRate(r){
  const {error}=await db.from('rates').upsert(rateToDb(r));
  if(error) throw error;
}
async function dbDeleteRate(id){
  const {error}=await db.from('rates').delete().eq('id',id);
  if(error) throw error;
}
async function dbSaveQuote(q){
  const {error}=await db.from('quotes').upsert(quoteToDb(q),{onConflict:'id',ignoreDuplicates:false});
  if(error) throw error;
}
async function dbUpdateQuoteStatus(id,status){
  const {error}=await db.from('quotes').update({status}).eq('id',id);
  if(error) throw error;
}
async function dbDeleteQuote(id){
  const {error}=await db.from('quotes').delete().eq('id',id);
  if(error) throw error;
}
async function dbBulkSaveRates(rates){
  const {error}=await db.from('rates').upsert(rates.map(rateToDb));
  if(error) throw error;
}
async function dbGetNextQuoteNum(){
  const {data}=await db.from('quotes').select('quote_num').order('quote_num',{ascending:false}).limit(1);
  return data&&data.length?(data[0].quote_num||1000)+1:1001;
}
async function dbLoadCustomers(){
  const{data,error}=await db.from('customers').select('*').order('company');
  if(error) throw error; return data||[];
}
async function dbSaveCustomer(c){
  const{error}=await db.from('customers').upsert(c); if(error) throw error;
}
async function dbDeleteCustomer(id){
  const{error}=await db.from('customers').delete().eq('id',id); if(error) throw error;
}

async function dbLoadFqQuotes(){
  const{data,error}=await db.from('fq_quotes').select('*').order('created_at',{ascending:false});
  if(error) throw error;
  return(data||[]).map(r=>typeof r.data==='object'?r.data:JSON.parse(r.data||'{}'));
}
async function dbSaveFqQuote(q){
  const{error}=await db.from('fq_quotes').upsert({id:q.id,date:q.date,customer:q.customer||'',data:q});
  if(error) throw error;
}
async function dbUpdateFqStatus(id,status){
  const q=(window._fqHistory||[]).find(q=>q.id===id);if(!q) return;
  q.status=status;
  const{error}=await db.from('fq_quotes').update({data:q}).eq('id',id);
  if(error) throw error;
}
async function dbDeleteFqQuote(id){
  const{error}=await db.from('fq_quotes').delete().eq('id',id);
  if(error) throw error;
}
async function dbLoadTlQuotes(){
  const{data,error}=await db.from('tl_quotes').select('*').order('created_at',{ascending:false});
  if(error) throw error;
  return(data||[]).map(r=>typeof r.data==='object'?r.data:JSON.parse(r.data||'{}'));
}
async function dbSaveTlQuote(q){
  const{error}=await db.from('tl_quotes').upsert({id:q.id,date:q.date,customer:q.customer||'',data:q});
  if(error) throw error;
}
async function dbUpdateTlStatus(id,status){
  const q=(window._tlHistory||[]).find(q=>q.id===id);if(!q) return;
  q.status=status;
  const{error}=await db.from('tl_quotes').update({data:q}).eq('id',id);
  if(error) throw error;
}
async function dbDeleteTlQuote(id){
  const{error}=await db.from('tl_quotes').delete().eq('id',id);
  if(error) throw error;
}

async function autoExpireQuotes(){
  const cutoff=new Date(Date.now()-30*24*60*60*1000).toISOString().slice(0,10);
  const toExpire=S.quotes.filter(q=>q.status==='Quoted'&&q.date<cutoff);
  if(!toExpire.length) return;
  // Batch update in Supabase
  for(const q of toExpire){
    try{
      await db.from('quotes').update({status:'Expired'}).eq('id',q.id);
      q.status='Expired';
    }catch(e){console.log('Expire error:',e.message);}
  }
  console.log(`Auto-expired ${toExpire.length} quote(s) older than 30 days`);
}

function setSaving(on){
  const t=$('topbar-right');
  if(!t) return;
  const existing=document.getElementById('saving-badge');
  if(on&&!existing){const s=document.createElement('span');s.id='saving-badge';s.className='saving-badge';s.textContent='Saving…';t.prepend(s);}
  if(!on&&existing) existing.remove();
}

// ═══════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════
let S={
  view:'home',rates:[],quotes:[],customers:[],
  qi:{customer:'',customerEmail:'',customerId:null,port:'New York / Newark, NJ',zip:'',ld:'Live',drayType:'import',commodity:'',pickupZip:'',containerCount:1,perContainerFlags:{base:true,chassis:false,prepull:true,det_port:true,det_cust:true,storage:false,ovw43:true,ovw48:true,bobtail:false,toll:false,genset:true,triaxle:true},
      baseMarkup:{...DEFAULT_BASE_MARKUP},flatRates:{...DEFAULT_FLAT_RATES},notes:'',shiflRef:'',
      bookingNum:'',trackingUrl:'',pickupAppt:'',deliveryAppt:'',flagged:false,
      gensetEnabled:false,gensetScope:'both',gensetCarrierRate:0,gensetCustomerRate:0,
      bobtailEnabled:false,bobtailScope:'both',bobtailCarrierRate:0,bobtailCustomerRate:0,
      triaxleScope:'both',
      triaxleEnabled:false,triaxleScope:'both',triaxleCarrierRate:0,triaxleCustomerRate:0},
  selId:null,rSearch:'',logFilter:'all',logSearch:'',fqLogFilter:'all',fqLogSearch:'',tlLogFilter:'all',tlLogSearch:'',dashFilter:'month',cSearch:'',
  fq:{mode:null,equipment:null,pickupZip:'',deliveryZip:'',weight:'',palletCount:'',
      pallets:[{w:'',l:'',h:''}],sameDims:true,singleW:'',singleL:'',singleH:'',
      notes:'',customer:'',customerEmail:'',customerId:null,shiflRef:'',
      carriers:[{name:'',rate:''}], markupMode:'flat', markupAmount:150, selCarrierIdx:0,
      selFqRateId:null, lclDetentionHours:0, lclPalletExchange:0, lclPalletCount:0, lclFreeHours:2, lclCustomerDetRate:0, lclCustomerPalletRate:0,
      lclPriceBy:'pallets', cbm:0, transitTime:'',
      calc:{l:'',w:'',h:'',pieces:'',weightLbs:'',unit:'in'}},
  fqTab:'builder',
  activeFilter:'all',activeView:'active',tmsTab:'dispatch',tmsInvTab:'customer',tmsInvSubTab:'pending',tmsLoadsSearch:'',tmsLoadsFilt:'all',tmsRptTab:'pl',allInvTab:'pending',invMainTab:'customer',rateTab:'import',invoices:{},pmFilter:'all',pmDate:'all',reportTab:'lanes',reportMode:'All',fqInvTab:'pending',aqTab:'builder',aqFilter:'all',_auditDate:'all',
  tl:null, // initialized in boot via defaultTlState()
  tlTab:'builder',
};
let _importRows=[];

// ═══════════════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════════════
async function initApp(){
  showLiquidLoader('Starting…');setLiquidProgress(10);
  try{
    $('loading-msg').textContent='Starting…';
    try{const r=JSON.parse(localStorage.getItem('shifl_rates_cache')||'[]');S.rates=r.length?r:SEED.map((s,i)=>({...s,id:s.id||'seed'+i,active:true}));}catch(e){S.rates=[];}
    setTimeout(async()=>{try{const r=await withTimeout(dbLoadRates(),10000,null);if(r&&r.length>0){S.rates=r;localStorage.setItem('shifl_rates_cache',JSON.stringify(r));if(S.view==='rates')renderRates();if($('carriers-body'))refreshCarriersAndPreview();}}catch(e){}},1200);
    try{S.quotes=JSON.parse(localStorage.getItem('shifl_quotes_cache')||'[]');}catch(e){S.quotes=[];}
    try{S.customers=JSON.parse(localStorage.getItem('shifl_customers_cache')||'[]');}catch(e){S.customers=[];}
    // Create quote_requests table if it doesn't exist
    try{
      await db.rpc('exec_sql', {sql:`
        CREATE TABLE IF NOT EXISTS public.quote_requests (
          id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
          customer text, customer_email text, mode text DEFAULT 'drayage',
          port text, zip text, destination text, size text, ctrs int DEFAULT 1,
          ld text, commodity text, weight text, eta text, booking text,
          pallets int, pieces int, cbm text, dims text, freight_class text,
          service_type text, incoterms text, notes text,
          status text DEFAULT 'new', type text DEFAULT 'quote_request',
          quoted_amount numeric, quote_ref text, quote_message text,
          quoted_at timestamptz, negotiation_status text,
          counter_offer numeric, counter_note text,
          customer_responded_at timestamptz,
          dis_ref text, dis_type text, dis_amount numeric, dis_status text,
          created_at timestamptz DEFAULT now()
        );
        ALTER TABLE public.quote_requests ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS allow_all ON public.quote_requests;
        CREATE POLICY allow_all ON public.quote_requests FOR ALL USING (true) WITH CHECK (true);
      `}).catch(()=>{});
    }catch(e){}
    setLiquidProgress(30);
  // Load FQ quotes from Supabase (shared across all users) + merge with local
  try{
    const dbFq = await dbLoadFqQuotes();
    const localFq = JSON.parse(localStorage.getItem('fq_history')||'[]');
    // Merge: DB is source of truth, local fills any gaps
    const merged = [...dbFq];
    const dbIds = new Set(dbFq.map(q=>q.id));
    localFq.forEach(q=>{ if(!dbIds.has(q.id)) merged.push(q); });
    window._fqHistory = merged.sort((a,b)=>new Date(b.date||0)-new Date(a.date||0));
    // Sync local to match
    try{localStorage.setItem('fq_history',JSON.stringify(window._fqHistory.slice(0,500)));}catch(e){}
  }catch(e){
    try{window._fqHistory=JSON.parse(localStorage.getItem('fq_history')||'[]');}catch(e2){window._fqHistory=[];}
  }
    try{window._fqRates=JSON.parse(localStorage.getItem('fq_rates')||'[]');}catch(e){window._fqRates=[];}
    // Load AQ quotes from Supabase
  try{
    const{data:aqData}=await db.from('aq_history').select('*').order('created_at',{ascending:false});
    const dbAq=(aqData||[]).map(r=>typeof r.data==='object'?r.data:JSON.parse(r.data||'{}'));
    const localAq=JSON.parse(localStorage.getItem('aq_history')||'[]');
    const aqIds=new Set(dbAq.map(q=>q.id));
    window._aqHistory=[...dbAq,...localAq.filter(q=>!aqIds.has(q.id))].sort((a,b)=>new Date(b.date||0)-new Date(a.date||0));
    try{localStorage.setItem('aq_history',JSON.stringify(window._aqHistory.slice(0,500)));}catch(e){}
  }catch(e){
    try{window._aqHistory=JSON.parse(localStorage.getItem('aq_history')||'[]');}catch(e2){window._aqHistory=[];}
  }
    setLiquidProgress(60);
  // Load TL quotes from Supabase
  try{
    const dbTl = await dbLoadTlQuotes();
    const localTl = JSON.parse(localStorage.getItem('tl_history')||'[]');
    const tlIds = new Set(dbTl.map(q=>q.id));
    window._tlHistory=[...dbTl,...localTl.filter(q=>!tlIds.has(q.id))].sort((a,b)=>new Date(b.date||0)-new Date(a.date||0));
    try{localStorage.setItem('tl_history',JSON.stringify(window._tlHistory.slice(0,500)));}catch(e){}
  }catch(e){
    try{window._tlHistory=JSON.parse(localStorage.getItem('tl_history')||'[]');}catch(e2){window._tlHistory=[];}
  }
    try{window._tlWarehouses=JSON.parse(localStorage.getItem('tl_warehouses')||'[]');}catch(e){window._tlWarehouses=[];}
    try{await withTimeout(loadShipmentMeta(),8000,null);}catch(e){}
    try{loadSpecialZips();}catch(e){}
    try{loadCustomCFS();}catch(e){}
    try{loadActiveTracking();}catch(e){}
    try{loadInvoices();}catch(e){}
    try{S.tl=defaultTlState();}catch(e){S.tl={};}
    setTimeout(async()=>{
      try{const q=await withTimeout(dbLoadQuotes(),10000,null);if(q){S.quotes=q;localStorage.setItem('shifl_quotes_cache',JSON.stringify(q));}}catch(e){}
      try{const c=await withTimeout(dbLoadCustomers(),8000,null);if(c){S.customers=c;localStorage.setItem('shifl_customers_cache',JSON.stringify(c));}}catch(e){}
      try{const fq=await withTimeout(dbLoadFqQuotes(),8000,null);if(fq){window._fqHistory=fq;localStorage.setItem('fq_history',JSON.stringify(fq));}}catch(e){}
      try{updateActiveBadge();updateInvNavBadge();}catch(e){}
    },1000);
    try{
      realtimeChannel=db.channel('app-changes')
        .on('postgres_changes',{event:'*',schema:'public',table:'quotes'},async()=>{try{S.quotes=await dbLoadQuotes();if(S.view==='log')renderLog();if(S.view==='dash')renderDash();updateActiveBadge();}catch(e){}})
        .on('postgres_changes',{event:'*',schema:'public',table:'fq_quotes'},async()=>{try{window._fqHistory=await withTimeout(dbLoadFqQuotes(),5000,window._fqHistory);if(S.view==='freight'&&S.fqTab==='log')renderFqLog();updateActiveBadge();}catch(e){}})
        .subscribe(status=>{try{setSyncStatus(status==='SUBSCRIBED'?'on':status==='CLOSED'?'off':'loading');}catch(e){}});
    }catch(e){}
  }catch(e){console.error('initApp:',e);}
  $('loading-screen').style.display='none';
  $('app').style.display='flex';
  try{setSyncStatus('on');}catch(e){}
  try{startClock();}catch(e){}
  try{initDarkMode();updateDarkBtn();}catch(e){}
  try{updateNotifBadge();}catch(e){}
  try{updateInvNavBadge();}catch(e){}
  try{updateActiveBadge();}catch(e){}
  setTimeout(()=>{try{checkAchievements();}catch(e){}},3000);
  try{updateStreak();}catch(e){}
  try{checkQuoteReminders();}catch(e){}
  setInterval(()=>{try{checkEscalations();}catch(e){}},600000);
  setInterval(()=>{try{checkQuoteReminders();}catch(e){}},60000); // check every 10min
  try{checkBossMode();}catch(e){}
  try{buildFridayBar();}catch(e){}
  S.view='home';
  try{render();}catch(e){console.error('render:',e);}
}


// ═══════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════
const uid=()=>Math.random().toString(36).slice(2,9);
const $=id=>document.getElementById(id);
const $v=id=>($('f-'+id)||{}).value||'';
const fmt=v=>(v&&v>0)?'$'+Math.round(v).toLocaleString():'—';
const fmtD=v=>'$'+Number(v).toFixed(2);
const pct=v=>v>0&&v<0.01?'<1%':Math.round(v*100)+'%';
function totAll(r){return CHARGES.reduce((s,c)=>s+(Number(r[c])||0),0);}
function totMode(r,ld){
  let t=CHARGES.reduce((s,c)=>isApplicable(c,ld)?s+(Number(r[c])||0):s,0);
  if(S.qi?.gensetEnabled&&S.qi?.gensetScope!=='customer_only')t+=Number(S.qi.gensetCarrierRate)||0;
  if(S.qi?.bobtailEnabled&&S.qi?.bobtailScope!=='customer_only')t+=Number(S.qi.bobtailCarrierRate)||0;
  if(S.qi?.triaxleEnabled&&S.qi?.triaxleScope!=='customer_only')t+=Number(S.qi.triaxleCarrierRate)||0;
  return t;
}
function cuRate(carrierVal,charge){
  const ld=S.qi.ld;
  if(!isApplicable(charge,ld)) return 0;
  const mult=getMultiplier(charge);
  if(charge==='base'){if(!carrierVal) return 0;const bm=S.qi.baseMarkup;const single=bm.mode==='pct'?carrierVal*(1+bm.amount/100):carrierVal+bm.amount;return single*mult;}
  return carrierVal>0?((S.qi.flatRates[charge]||0)*mult):0;
}
function cuTot(r){
  let t=CHARGES.reduce((s,c)=>s+cuRate(Number(r[c])||0,c),0);
  if(S.qi?.gensetEnabled)t+=Number(S.qi.gensetCustomerRate)||0;
  if(S.qi?.bobtailEnabled)t+=Number(S.qi.bobtailCustomerRate)||0;
  if(S.qi?.triaxleEnabled)t+=Number(S.qi.triaxleCustomerRate)||0;
  return t;
}

// ═══════════════════════════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════════════════════════
function resetQi(){
  S.qi={customer:'',customerEmail:'',customerId:null,port:'New York / Newark, NJ',zip:'',ld:'Live',drayType:'import',commodity:'',pickupZip:'',containerCount:1,
    perContainerFlags:{base:true,chassis:false,prepull:true,det_port:true,det_cust:true,storage:false,ovw43:true,ovw48:true,bobtail:false,toll:false,genset:true,triaxle:true},
    baseMarkup:{...DEFAULT_BASE_MARKUP},flatRates:{...DEFAULT_FLAT_RATES},notes:'',shiflRef:'',
    bookingNum:'',trackingUrl:'',pickupAppt:'',deliveryAppt:'',flagged:false,
    gensetEnabled:false,gensetScope:'both',gensetCarrierRate:0,gensetCustomerRate:0,
    bobtailEnabled:false,bobtailScope:'both',bobtailCarrierRate:0,bobtailCustomerRate:0,
    triaxleEnabled:false,triaxleScope:'both',triaxleCarrierRate:0,triaxleCustomerRate:0,
    fromRequestId:null,fromRequestEmail:''};
  S.selId=null;
}
function setView(v){
  // Reset quote builder if navigating away from it mid-quote (unsaved)
  if(S.view==='quote' && v!=='quote'){
    resetQi();
  }
  S.view=v;
  document.querySelectorAll('.nav-btn,.sub-link').forEach(b=>b.classList.remove('active'));
  const navEl=$('nav-'+v);if(navEl) navEl.classList.add('active');
  const titles={tms:'TMS',quote:'Quote builder',customers:'Customers',rates:'Carrier rates',log:'Quote log',dash:'Dashboard',freight:'Freight Quoting',transload:'Transload Quoting',active:'Active Shipments',admin:'Admin Panel',reports:'Reports',activity:'Activity Log',auditlog:'Audit Log',carriers:'Carrier Network',air:'Air Freight',home:'Home',invoicing:'Invoicing',requests:'Rate Requests'};
  $('view-title').textContent=titles[v]||v;
  openAccFor(v);
  updateSubActive(v);
  render();
}
function render(){
  setTimeout(()=>animPage(),10);
  if(S.view==='quote')      renderQuote();
  else if(S.view==='customers')  renderCustomers();
  else if(S.view==='rates')      renderRates();
  else if(S.view==='log')        renderLog();
  else if(S.view==='dash')       renderDash();
  else if(S.view==='active')     renderActive();
  else if(S.view==='requests')   renderCustomerRequests();
  else if(S.view==='carriers')   renderCarriers();
  else if(S.view==='admin')      renderAdmin();
  else if(S.view==='activity')   renderActivity();
  else if(S.view==='air')         renderAirFreight();
  else if(S.view==='home')        renderHome();
  else if(S.view==='profit')      renderProfitMonitor();
  else if(S.view==='requests')    renderQuoteRequests();
  else if(S.view==='achievements')  renderAchievementsPage();
  else if(S.view==='usmap')         renderShiflAchievements();
  else if(S.view==='tms')           renderTMS();
  else if(S.view==='coverage-map')  renderCoverageMap();
  else if(S.view==='claims')        renderClaims();
  else if(S.view==='broker-tools')  renderBrokerTools();
  else if(S.view==='carrier-score') renderCarrierScore();
  else if(S.view==='lane-bids')     renderLaneBids();
  else if(S.view==='rfp')           renderRFP();
  else if(S.view==='qbr')           renderQBR();
  else if(S.view==='re-engage')     renderReEngage();
  else if(S.view==='invoicing')    renderFullInvoicing();
  else if(S.view==='reports')    renderReports();
  else if(S.view==='auditlog')   renderAuditLog();
  else if(S.view==='freight')    renderFreight();
  else if(S.view==='transload')  renderTransload();
  else if(S.view==='tms')         renderTMS();
  else if(S.view==='exec-dash')    {$('topbar-right').innerHTML=`
    <div style="display:flex;gap:6px;align-items:center">
      <button onclick="exportQuoteLogCSV()" style="display:flex;align-items:center;gap:6px;padding:7px 14px;border-radius:8px;border:none;background:linear-gradient(135deg,#059669,#34d399);color:#fff;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit">📊 Export CSV</button>
      <button onclick="showKeyboardShortcuts()" style="padding:7px 10px;border-radius:8px;border:1px solid #e2e8f0;background:#fff;font-size:12px;cursor:pointer;font-family:inherit" title="Keyboard shortcuts">⌨️</button>
    </div>`;$('page').innerHTML=renderExecutiveDashboard()+renderTeamGoals();}
  else                           renderDash();
}

// ═══════════════════════════════════════════════════════
// QUOTE BUILDER
// ═══════════════════════════════════════════════════════
function getMatches(){
  const qi=S.qi;
  const isExport=qi.drayType==='export';
  const matchZip=isExport?qi.pickupZip:qi.zip;
  return S.rates.filter(r=>{
    if(!r.active) return false;
    if(r.zip!==matchZip) return false;
    if(!(r.ld===qi.ld||r.ld==='Both')) return false;
    if(isExport&&!r.exportBase) return false; // must have export rate
    return true;
  }).sort((a,b)=>{
    const av=isExport?(a.exportBase||0):(totMode(a,qi.ld));
    const bv=isExport?(b.exportBase||0):(totMode(b,qi.ld));
    return av-bv;
  });
}
function buildCarrierComparison(matches){
  const qi=S.qi;
  const searchZip=qi?.drayType==='export'?(qi.pickupZip||qi.zip):qi.zip;
  if(!searchZip) return `<div class="empty"><div class="empty-ico">🔍</div><p>${qi?.drayType==='export'?'Enter pickup ZIP':'Enter a delivery ZIP to see carrier rates'}</p></div>`;
  if(!matches.length){
    const total=S.rates.filter(r=>r.active).length;
    const zipMatches=S.rates.filter(r=>r.active&&r.zip===qi.zip).length;
    return `<div class="empty"><div class="empty-ico">🚚</div>
      <p style="font-weight:700;color:var(--gray-600)">No carriers found</p>
      <p style="font-size:12px;color:var(--gray-400);margin-top:4px">
        Searching: <strong>${searchZip}</strong> · <strong>${qi.ld}</strong>${qi.drayType==='export'?' (Export)':' (Import)'}<br>
        ${total===0
          ?'<span style="color:var(--red)">⚠ No active rates — go to Carrier Rates and add rates</span>'
          :zipMatches===0
          ?`<span style="color:var(--amber)">⚠ ${total} rate${total!==1?'s':''} exist but none for ZIP <strong>${qi.zip}</strong></span>`
          :`<span style="color:var(--amber)">⚠ ${zipMatches} rate${zipMatches!==1?'s':''} for ZIP ${qi.zip} but none match <strong>${qi.ld}</strong></span>`
        }
      </p></div>`;
  }

  const multiPort=[...new Set(matches.map(r=>r.port).filter(Boolean))].length>1;
  const ldBadge=ld=>{
    if(ld==='Live') return '<span style="font-size:9px;font-weight:700;padding:2px 7px;border-radius:99px;background:#dcfce7;color:#15803d">Live</span>';
    if(ld==='Drop') return '<span style="font-size:9px;font-weight:700;padding:2px 7px;border-radius:99px;background:#dbeafe;color:#1d4ed8">Drop</span>';
    return '<span style="font-size:9px;font-weight:700;padding:2px 7px;border-radius:99px;background:#f3f4f6;color:#6b7280">Both</span>';
  };

  return matches.map((r,i)=>{
    const isSel=r.id===S.selId;
    // Carrier cost (what we pay)
    const carrierBase=Number(qi.drayType==='export'?(r.exportBase||r.base):r.base)||0;
    const vis=CHARGES.filter(c=>c!=='base'&&isApplicable(c,qi.ld));
    const carrierAccessorials=vis.reduce((s,c)=>s+(Number(r[c])||0),0);
    const carrierTotal=(carrierBase+carrierAccessorials)*(qi.containerCount||1);
    // Customer rate (what we charge)
    const markup=Number(qi.flatRates?.markup)||Number(qi.markup)||0;
    const isPercent=qi.markupType==='percent';
    const custBase=isPercent?carrierBase*(1+markup/100):carrierBase+markup;
    const custAccessorials=vis.reduce((s,c)=>s+(Number(S.qi.flatRates?.[c]??r[c])||0),0);
    const custTotal=(custBase+custAccessorials)*(qi.containerCount||1);
    const profit=custTotal-carrierTotal;
    const profitColor=profit>100?'#16a34a':profit>0?'#d97706':'#dc2626';
    const profitLabel=profit>=0?'+'+fmtD(profit):fmtD(profit);

    return `<div onclick="selCarrier('${r.id}')"
      style="display:flex;align-items:center;gap:10px;padding:10px 14px;border-bottom:1px solid #f9fafb;cursor:pointer;transition:all .1s;${isSel?'background:#eff6ff;border-left:5px solid #2563eb;box-shadow:inset 0 0 0 1px #bfdbfe;':'border-left:5px solid transparent;'}"
      onmouseenter="if('${r.id}'!==S.selId)this.style.background='#f8faff'"
      onmouseleave="if('${r.id}'!==S.selId)this.style.background=''">
      <div style="width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;flex-shrink:0;background:${isSel?'#2563eb':'#f3f4f6'};color:${isSel?'#fff':'#9ca3af'}">${i+1}</div>
      <div style="flex:1;min-width:0">
        ${(()=>{
          if(!isSel) return '';
          const past=(S.quotes||[]).filter(q=>
            q.carrier===r.carrier && q.zip===(qi.drayType==='export'?qi.pickupZip:qi.zip) &&
            ['Booked','Delivered','Invoiced','Paid'].includes(q.status) &&
            (q.customerRates?.total||0)>0
          ).sort((a,b)=>new Date(b.date||0)-new Date(a.date||0));
          if(!past.length) return '';
          const p=past[0];
          return `<div style="display:flex;align-items:center;gap:8px;padding:6px 10px;background:#eff6ff;border-radius:7px;margin-bottom:8px;flex-wrap:wrap;gap:6px">
            <span>📋</span>
            <span style="font-size:11px;font-weight:600;color:#1d4ed8">Past rates found — ${p.customer||''} · ${p.date||''}</span>
            <span style="font-size:11px;color:#64748b">${fmtD(p.customerRates?.total||0)} customer · ${fmtD(p.carrierRates?.total||0)} carrier</span>
            <button onclick="event.stopPropagation();applyPastQuoteRates('${p.id}')" style="padding:3px 10px;background:#2563eb;color:#fff;border:none;border-radius:5px;font-size:11px;font-weight:700;cursor:pointer;font-family:inherit">📋 Use these rates</button>
          </div>`;
        })()}
        <div style="font-size:13px;font-weight:700;color:#1e3a5f;display:flex;align-items:center;gap:5px">
          ${r.carrier}
          ${i===0?'<span style="font-size:9px;font-weight:700;padding:1px 6px;border-radius:99px;background:#1e3a5f;color:#fff">Best</span>':''}
          ${ldBadge(r.ld)}
        </div>
        <div style="font-size:10px;color:#9ca3af;margin-top:1px">${r.destination||''}${multiPort&&r.port?` · ${r.port}`:''}${r.notes?` · <span style="color:#d97706">${r.notes}</span>`:''}</div>
        ${r.bcoTags&&r.bcoTags.length?`<div style="display:flex;flex-wrap:wrap;gap:3px;margin-top:3px">${r.bcoTags.map(t=>`<span style="font-size:9px;font-weight:700;padding:1px 7px;border-radius:99px;background:#fef3c7;color:#92400e;border:1px solid #fde68a">${t}</span>`).join('')}</div>`:''}
      </div>
      <div style="text-align:right;flex-shrink:0;padding-right:10px;border-right:1px solid #f3f4f6">
        <div style="font-size:14px;font-weight:800;color:#1e3a5f">${fmtD(carrierBase)}</div>
        <div style="font-size:9px;color:#9ca3af">carrier base</div>
      </div>
      <div style="text-align:right;flex-shrink:0;min-width:90px">
        <div style="font-size:15px;font-weight:800;color:${isSel?'#2563eb':'#374151'}">${fmtD(custTotal)}</div>
        <div style="font-size:10px;font-weight:600;color:${profitColor}">${profitLabel} profit</div>
      </div>
    </div>`;
  }).join('');
}

function buildPreviewHTML(sel){
  if(!sel) return `<div class="empty" style="padding:30px"><p>Select a carrier above</p></div>`;
  const ld=S.qi.ld;
  const ctrs=S.qi.containerCount||1;
  const flags=S.qi.perContainerFlags||{};

  // Carrier cost — must also scale by containers using same per-container logic as customer price
  let ctCarrier=0;
  CHARGES.forEach(c=>{
    if(!isApplicable(c,ld)) return;
    const cv=Number(sel[c])||0;
    const mult=(flags[c]!==false)?ctrs:1;
    ctCarrier+=cv*mult;
  });
  if(S.qi?.gensetEnabled&&S.qi?.gensetScope!=='customer_only') ctCarrier+=Number(S.qi.gensetCarrierRate)||0;
  if(S.qi?.bobtailEnabled&&S.qi?.bobtailScope!=='customer_only') ctCarrier+=Number(S.qi.bobtailCarrierRate)||0;
  if(S.qi?.triaxleEnabled&&S.qi?.triaxleScope!=='customer_only') ctCarrier+=Number(S.qi.triaxleCarrierRate)||0;

  const cu=cuTot(sel);

  // ── Guaranteed vs possible profit split ──
  // Guaranteed = Base markup + chassis day 1 markup (these are always billed)
  // Possible = everything else (accessorials that may or may not apply)
  const baseCv=Number(sel.base)||0;
  const baseCuv=cuRate(baseCv,'base');
  const baseCt=baseCv*(flags['base']!==false?ctrs:1);

  const chassisCv=Number(sel.chassis)||0;
  const chassisCuv=cuRate(chassisCv,'chassis');
  const chassisCt=chassisCv*(flags['chassis']!==false?ctrs:1);

  const guaranteedProfit=(baseCuv-baseCt)+(chassisCuv-chassisCt);

  const possibleProfit=(cu-ctCarrier)-guaranteedProfit;
  const totalProfit=cu-ctCarrier;
  const margin=cu>0?totalProfit/cu:0;

  const rows=CHARGES.map(c=>{
    if(!isApplicable(c,ld)) return '';
    const cv=Number(sel[c])||0;const cuv=cuRate(cv,c);
    if(!cv&&!cuv) return '';
    const note=c==='ovw43'?'Over 43,000 lb':c==='ovw48'?'Over 48,000 lb':c==='det_port'?'At port':c==='det_cust'?'At customer':'';
    const mult=(flags[c]!==false)?ctrs:1;
    const ctScaled=cv*mult;
    const isGuaranteed=c==='base'||(c==='chassis'&&chassisCv>0);
    return `<tr class="prev-row"><td>${LABELS[c]}${ctrs>1&&mult>1?`<span style="font-size:10px;color:var(--gray-400)"> ×${ctrs}</span>`:''}${note?`<div class="charge-note">${note}</div>`:''}</td><td class="muted">${fmtD(ctScaled)}</td><td>${fmtD(cuv)}</td><td style="color:${isGuaranteed?'var(--green)':'var(--amber)'}">+${fmtD(cuv-ctScaled)}</td></tr>`;
  }).join('');

  return `<div class="small muted" style="margin-bottom:10px"><strong style="color:var(--navy)">${sel.carrier}</strong> → ${sel.destination}${ctrs>1?` <span class="badge" style="background:#f59e0b;color:#fff">×${ctrs} containers</span>`:''}</div>
  <table style="width:100%"><thead><tr>
    <th style="text-align:left;padding:5px 0;width:150px">Charge</th>
    <th style="text-align:left;padding:5px 0;width:80px;color:var(--gray-400)">Carrier</th>
    <th style="text-align:left;padding:5px 0;width:80px;color:var(--steel)">Your price</th>
    <th style="text-align:right;padding:5px 0;color:var(--green)">Profit</th>
  </tr></thead><tbody>${rows}${(()=>{
    const pqr=[];
    if(S.qi.bobtailEnabled){const ca=S.qi.bobtailScope==='customer_only'?0:(Number(S.qi.bobtailCarrierRate)||0);const cu=Number(S.qi.bobtailCustomerRate)||0;if(ca||cu)pqr.push({label:'Bobtail',ca,cu});}
    if(S.qi.gensetEnabled){const ca=S.qi.gensetScope==='customer_only'?0:(Number(S.qi.gensetCarrierRate)||0);const cu=Number(S.qi.gensetCustomerRate)||0;if(ca||cu)pqr.push({label:'Genset',ca,cu});}
    if(S.qi.triaxleEnabled){const ca=S.qi.triaxleScope==='customer_only'?0:(Number(S.qi.triaxleCarrierRate)||0);const cu=Number(S.qi.triaxleCustomerRate)||0;if(ca||cu)pqr.push({label:'Triaxle',ca,cu});}
    return pqr.map(r=>`<tr class="prev-row"><td>${r.label}</td><td class="muted">${r.ca?fmtD(r.ca):'—'}</td><td>${r.cu?fmtD(r.cu):'—'}</td><td style="color:var(--amber)">+${fmtD(r.cu-r.ca)}</td></tr>`).join('');
  })()}
    <tr class="prev-total"><td>Total</td><td class="muted">${fmtD(ctCarrier)}</td>
      <td style="font-size:18px;color:var(--steel)">${fmtD(cu)}</td>
      <td style="text-align:right"><div style="color:var(--green);font-weight:700">+${fmtD(totalProfit)}</div><span class="badge ${margin>=0.10?'g':'r'}">${pct(margin)}</span></td>
    </tr>
  </tbody></table>
  <div style="margin-top:12px;display:grid;grid-template-columns:1fr 1fr;gap:8px">
    <div style="background:#f0fdf4;border-radius:8px;padding:10px 12px;border-left:3px solid var(--green)">
      <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#166534;margin-bottom:3px">✅ Guaranteed profit</div>
      <div style="font-size:18px;font-weight:800;color:#166534">+${fmtD(guaranteedProfit)}</div>
      <div style="font-size:10px;color:#4ade80;margin-top:2px">Base markup${chassisCv>0?' + chassis day 1':''}</div>
    </div>
    <div style="background:#fffbeb;border-radius:8px;padding:10px 12px;border-left:3px solid var(--amber)">
      <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#92400e;margin-bottom:3px">⚡ Possible profit</div>
      <div style="font-size:18px;font-weight:800;color:#d97706">+${fmtD(Math.max(0,possibleProfit))}</div>
      <div style="font-size:10px;color:#f59e0b;margin-top:2px">If all accessorials apply</div>
    </div>
  </div>
  <div style="display:flex;gap:8px;margin-top:12px">
    <button class="btn blue" onclick="saveQuote()" style="flex:1;justify-content:center">💾 Save</button>
    <button class="btn" onclick="printQuote()">🖨️</button>
    <button class="btn" onclick="downloadPDF()">📄 PDF</button>

  </div>`;
}
function buildPricingSection(){
  const qi=S.qi;const ld=qi.ld;const bm=qi.baseMarkup;const fr=qi.flatRates;
  const ctrs=qi.containerCount||1;
  const flags=qi.perContainerFlags||{};
  const extraRows=CHARGES.filter(c=>c!=='base'&&isApplicable(c,ld)).map(c=>{
    const note=c==='det_port'?'Per hour at port':c==='det_cust'?'Per hour at customer':c==='ovw43'?'Over 43,000 lb':c==='ovw48'?'Over 48,000 lb':c==='toll'?'Only if applicable':c==='bobtail'?'Drop moves':'';
    const isPerCtr=flags[c]!==false;
    const toggleBtn=ctrs>1?`<button onclick="togglePerContainer('${c}')" title="${isPerCtr?'Per container — click to set as per trip':'Per trip — click to set as per container'}"
      style="padding:2px 8px;border-radius:4px;border:1px solid ${isPerCtr?'var(--steel)':'var(--amber)'};background:${isPerCtr?'var(--blue-bg)':'#fff8ed'};color:${isPerCtr?'var(--steel)':'#d97706'};font-size:10px;font-weight:700;cursor:pointer;white-space:nowrap">
      ${isPerCtr?'× per ctr':'flat'}
    </button>`:'';
    return `<div style="background:#fff;border:1px solid var(--gray-200);border-radius:8px;padding:10px 12px;display:flex;align-items:center;gap:10px">
      <div style="flex:1;min-width:0">
        <div style="font-size:12px;font-weight:600;color:#1e3a5f">${LABELS[c]}</div>
        ${note?`<div style="font-size:10px;color:var(--gray-400);margin-top:1px">${note}</div>`:''}
      </div>
      <div style="display:flex;align-items:center;gap:5px;flex-shrink:0">
        ${toggleBtn}
        <span style="color:var(--gray-400);font-size:12px;font-weight:700">$</span>
        <input type="number" value="${fr[c]||0}" min="0" oninput="setFlatRate('${c}',+this.value)" style="width:72px;padding:4px 6px;font-size:13px;font-weight:600;text-align:right;border:1px solid var(--gray-200);border-radius:6px">
        ${ctrs>1&&(fr[c]||0)>0?`<span style="font-size:10px;color:var(--gray-400)">=${fmtD((fr[c]||0)*(isPerCtr?ctrs:1))}</span>`:''}
      </div>
    </div>`;
  }).join('');
  return `<div style="margin-bottom:14px;padding-bottom:14px;border-bottom:1px solid var(--gray-100)">
    <p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--gray-500);margin-bottom:8px">Base markup</p>
    <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
      <div class="toggle-group">
        <button class="tgl${bm.mode==='flat'?' on':''}" data-bmu="flat" onclick="setBaseMarkup('mode','flat')">Flat $</button>
        <button class="tgl${bm.mode==='pct'?' on':''}"  data-bmu="pct"  onclick="setBaseMarkup('mode','pct')">%</button>
      </div>
      <input type="number" value="${bm.amount}" min="0" oninput="setBaseMarkup('amount',+this.value)" style="width:90px;padding:5px 8px;font-size:13px">
      <span class="muted small">${bm.mode==='flat'?'flat $ added over carrier base':'% over carrier base'}</span>
    </div>
  </div>
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px"><p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--gray-500);margin:0">Your flat charges</p><span style="font-size:11px;color:var(--gray-400);background:var(--gray-50);padding:2px 10px;border-radius:99px;border:1px solid var(--gray-200)">${ld==='Live'?'Live mode':ld==='Drop'?'Drop mode':'Both modes'}</span></div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">${extraRows}</div>
  <div style="margin-top:14px">
    <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--gray-500);margin-bottom:8px;margin-top:4px">Per-quote charges</div>

    <!-- GENSET -->
    <div style="border:1px solid var(--gray-200);border-radius:var(--radius);padding:12px 14px;margin-bottom:8px;background:#fafafa">
      <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
        <label style="display:flex;align-items:center;gap:7px;cursor:pointer;font-size:13px;font-weight:700;min-width:140px">
          <input type="checkbox" ${S.qi.gensetEnabled?'checked':''} onchange="S.qi.gensetEnabled=this.checked;if(!S.qi.gensetScope)S.qi.gensetScope='both';document.getElementById('genset-fields').style.display=this.checked?'flex':'none';refreshPreviewOnly()" style="width:16px;height:16px;cursor:pointer;accent-color:var(--navy)">
          ⚡ Genset
        </label>
        <div id="genset-fields" style="display:${S.qi.gensetEnabled?'flex':'none'};align-items:center;gap:10px;flex-wrap:wrap">
          <div style="display:flex;gap:5px">
            <button onclick="S.qi.gensetScope='both';this.style.background='var(--navy)';this.style.color='#fff';this.nextElementSibling.style.background='#fff';this.nextElementSibling.style.color='var(--gray-500)';document.getElementById('genset-carrier-wrap').style.display='flex';refreshPreviewOnly()" style="padding:3px 10px;border-radius:var(--radius);border:1px solid var(--gray-300);background:${S.qi.gensetScope!=='customer_only'?'var(--navy)':'#fff'};color:${S.qi.gensetScope!=='customer_only'?'#fff':'var(--gray-500)'};font-size:11px;font-weight:700;cursor:pointer;font-family:inherit">Carrier + Customer</button>
            <button onclick="S.qi.gensetScope='customer_only';this.style.background='var(--navy)';this.style.color='#fff';this.previousElementSibling.style.background='#fff';this.previousElementSibling.style.color='var(--gray-500)';document.getElementById('genset-carrier-wrap').style.display='none';refreshPreviewOnly()" style="padding:3px 10px;border-radius:var(--radius);border:1px solid var(--gray-300);background:${S.qi.gensetScope==='customer_only'?'var(--navy)':'#fff'};color:${S.qi.gensetScope==='customer_only'?'#fff':'var(--gray-500)'};font-size:11px;font-weight:700;cursor:pointer;font-family:inherit">Customer Only</button>
          </div>
          <div id="genset-carrier-wrap" style="display:${S.qi.gensetScope!=='customer_only'?'flex':'none'};align-items:center;gap:5px"><span style="font-size:11px;font-weight:700;color:var(--gray-400)">CARRIER $</span><input type="number" value="${S.qi.gensetCarrierRate||0}" min="0" oninput="S.qi.gensetCarrierRate=+this.value;refreshPreviewOnly()" style="width:80px;padding:4px 8px;font-size:13px;border:1px solid var(--gray-300);border-radius:var(--radius)"></div>
          <div style="display:flex;align-items:center;gap:5px"><span style="font-size:11px;font-weight:700;color:var(--gray-400)">CUSTOMER $</span><input type="number" value="${S.qi.gensetCustomerRate||0}" min="0" oninput="S.qi.gensetCustomerRate=+this.value;refreshPreviewOnly()" style="width:80px;padding:4px 8px;font-size:13px;border:1px solid var(--gray-300);border-radius:var(--radius)"></div>
        </div>
      </div>
    </div>

    <!-- BOBTAIL -->
    <div style="border:1px solid var(--gray-200);border-radius:var(--radius);padding:12px 14px;background:#fafafa">
      <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
        <label style="display:flex;align-items:center;gap:7px;cursor:pointer;font-size:13px;font-weight:700;min-width:140px">
          <input type="checkbox" ${S.qi.bobtailEnabled?'checked':''} onchange="S.qi.bobtailEnabled=this.checked;if(!S.qi.bobtailScope)S.qi.bobtailScope='both';document.getElementById('bobtail-fields').style.display=this.checked?'flex':'none';refreshPreviewOnly()" style="width:16px;height:16px;cursor:pointer;accent-color:var(--navy)">
          🔁 Bobtail
        </label>
        <div id="bobtail-fields" style="display:${S.qi.bobtailEnabled?'flex':'none'};align-items:center;gap:10px;flex-wrap:wrap">
          <div style="display:flex;gap:5px">
            <button onclick="S.qi.bobtailScope='both';this.style.background='var(--navy)';this.style.color='#fff';this.nextElementSibling.style.background='#fff';this.nextElementSibling.style.color='var(--gray-500)';document.getElementById('bobtail-carrier-wrap').style.display='flex';refreshPreviewOnly()" style="padding:3px 10px;border-radius:var(--radius);border:1px solid var(--gray-300);background:${S.qi.bobtailScope!=='customer_only'?'var(--navy)':'#fff'};color:${S.qi.bobtailScope!=='customer_only'?'#fff':'var(--gray-500)'};font-size:11px;font-weight:700;cursor:pointer;font-family:inherit">Carrier + Customer</button>
            <button onclick="S.qi.bobtailScope='customer_only';this.style.background='var(--navy)';this.style.color='#fff';this.previousElementSibling.style.background='#fff';this.previousElementSibling.style.color='var(--gray-500)';document.getElementById('bobtail-carrier-wrap').style.display='none';refreshPreviewOnly()" style="padding:3px 10px;border-radius:var(--radius);border:1px solid var(--gray-300);background:${S.qi.bobtailScope==='customer_only'?'var(--navy)':'#fff'};color:${S.qi.bobtailScope==='customer_only'?'#fff':'var(--gray-500)'};font-size:11px;font-weight:700;cursor:pointer;font-family:inherit">Customer Only</button>
          </div>
          <div id="bobtail-carrier-wrap" style="display:${S.qi.bobtailScope!=='customer_only'?'flex':'none'};align-items:center;gap:5px">
            <span style="font-size:11px;font-weight:700;color:var(--gray-400)">CARRIER $</span>
            <input type="number" value="${S.qi.bobtailCarrierRate||0}" min="0" oninput="S.qi.bobtailCarrierRate=+this.value;refreshPreviewOnly()" style="width:80px;padding:4px 8px;font-size:13px;border:1px solid var(--gray-300);border-radius:var(--radius)">
          </div>
          <div style="display:flex;align-items:center;gap:5px">
            <span style="font-size:11px;font-weight:700;color:var(--gray-400)">CUSTOMER $</span>
            <input type="number" value="${S.qi.bobtailCustomerRate||0}" min="0" oninput="S.qi.bobtailCustomerRate=+this.value;refreshPreviewOnly()" style="width:80px;padding:4px 8px;font-size:13px;border:1px solid var(--gray-300);border-radius:var(--radius)">
          </div>
        </div>
      </div>
    </div>

    <!-- TRIAXLE -->
    <div style="border:1px solid var(--gray-200);border-radius:var(--radius);padding:12px 14px;background:#fafafa">
      <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
        <label style="display:flex;align-items:center;gap:7px;cursor:pointer;font-size:13px;font-weight:700;min-width:140px">
          <input type="checkbox" ${S.qi.triaxleEnabled?'checked':''} onchange="S.qi.triaxleEnabled=this.checked;if(!S.qi.triaxleScope)S.qi.triaxleScope='both';document.getElementById('triaxle-fields').style.display=this.checked?'flex':'none';refreshPreviewOnly()" style="width:16px;height:16px;cursor:pointer;accent-color:var(--navy)">
          🔺 Triaxle
        </label>
        <div id="triaxle-fields" style="display:${S.qi.triaxleEnabled?'flex':'none'};align-items:center;gap:10px;flex-wrap:wrap">
          <div style="display:flex;gap:5px">
            <button onclick="S.qi.triaxleScope='both';this.style.background='var(--navy)';this.style.color='#fff';this.nextElementSibling.style.background='#fff';this.nextElementSibling.style.color='var(--gray-500)';document.getElementById('triaxle-carrier-wrap').style.display='flex';refreshPreviewOnly()" style="padding:3px 10px;border-radius:var(--radius);border:1px solid var(--gray-300);background:${S.qi.triaxleScope!=='customer_only'?'var(--navy)':'#fff'};color:${S.qi.triaxleScope!=='customer_only'?'#fff':'var(--gray-500)'};font-size:11px;font-weight:700;cursor:pointer;font-family:inherit">Carrier + Customer</button>
            <button onclick="S.qi.triaxleScope='customer_only';this.style.background='var(--navy)';this.style.color='#fff';this.previousElementSibling.style.background='#fff';this.previousElementSibling.style.color='var(--gray-500)';document.getElementById('triaxle-carrier-wrap').style.display='none';refreshPreviewOnly()" style="padding:3px 10px;border-radius:var(--radius);border:1px solid var(--gray-300);background:${S.qi.triaxleScope==='customer_only'?'var(--navy)':'#fff'};color:${S.qi.triaxleScope==='customer_only'?'#fff':'var(--gray-500)'};font-size:11px;font-weight:700;cursor:pointer;font-family:inherit">Customer Only</button>
          </div>
          <div id="triaxle-carrier-wrap" style="display:${S.qi.triaxleScope!=='customer_only'?'flex':'none'};align-items:center;gap:5px"><span style="font-size:11px;font-weight:700;color:var(--gray-400)">CARRIER $</span><input type="number" value="${S.qi.triaxleCarrierRate||0}" min="0" oninput="S.qi.triaxleCarrierRate=+this.value;refreshPreviewOnly()" style="width:80px;padding:4px 8px;font-size:13px;border:1px solid var(--gray-300);border-radius:var(--radius)"></div>
          <div style="display:flex;align-items:center;gap:5px"><span style="font-size:11px;font-weight:700;color:var(--gray-400)">CUSTOMER $</span><input type="number" value="${S.qi.triaxleCustomerRate||0}" min="0" oninput="S.qi.triaxleCustomerRate=+this.value;refreshPreviewOnly()" style="width:80px;padding:4px 8px;font-size:13px;border:1px solid var(--gray-300);border-radius:var(--radius)"></div>
        </div>
      </div>
    </div>

    <!-- Custom accessorials -->
    <div style="margin-top:10px;border-top:1px solid var(--gray-100);padding-top:10px">
      <div style="font-size:11px;font-weight:700;color:var(--gray-500);text-transform:uppercase;letter-spacing:.05em;margin-bottom:8px">Additional charges</div>
      <div id="quote-custom-acc">
        ${(S.qi.customAcc||[]).map((ca,ci)=>`
        <div style="display:grid;grid-template-columns:1fr 75px 75px 24px;gap:5px;margin-bottom:5px;align-items:center">
          <input type="text" value="${ca.label||''}" placeholder="e.g. Scale ticket"
            oninput="if(!S.qi.customAcc)S.qi.customAcc=[];S.qi.customAcc[${ci}]={...S.qi.customAcc[${ci}],label:this.value};refreshPreviewOnly()"
            style="padding:5px 8px;border:1px solid var(--gray-200);border-radius:6px;font-size:12px;font-family:inherit">
          <input type="number" value="${ca.customer||''}" placeholder="Cust $"
            oninput="if(!S.qi.customAcc)S.qi.customAcc=[];S.qi.customAcc[${ci}]={...S.qi.customAcc[${ci}],customer:+this.value};refreshPreviewOnly()"
            style="padding:5px 8px;border:1px solid var(--gray-200);border-radius:6px;font-size:12px;font-family:inherit">
          <input type="number" value="${ca.carrier||''}" placeholder="Carr $"
            oninput="if(!S.qi.customAcc)S.qi.customAcc=[];S.qi.customAcc[${ci}]={...S.qi.customAcc[${ci}],carrier:+this.value};refreshPreviewOnly()"
            style="padding:5px 8px;border:1px solid var(--gray-200);border-radius:6px;font-size:12px;font-family:inherit">
          <button onclick="S.qi.customAcc.splice(${ci},1);document.getElementById('pricing-section').innerHTML=buildPricingSection()"
            style="background:none;border:none;cursor:pointer;color:var(--gray-400);font-size:18px;line-height:1;padding:0">×</button>
        </div>`).join('')}
      </div>
      <button onclick="if(!S.qi.customAcc)S.qi.customAcc=[];S.qi.customAcc.push({label:'',customer:0,carrier:0});document.getElementById('pricing-section').innerHTML=buildPricingSection()"
        style="padding:5px 14px;border:1.5px dashed var(--gray-300);border-radius:7px;background:none;font-size:12px;color:var(--gray-500);cursor:pointer;font-family:inherit">+ Add charge</button>
    </div>

  </div>`;
}

function renderQuote(){
  const qi=S.qi;
  // Ensure scope defaults exist for all per-quote charges
  if(!qi.gensetScope) qi.gensetScope='both';
  if(!qi.bobtailScope) qi.bobtailScope='both';
  if(!qi.triaxleScope) qi.triaxleScope='both';
  const isExport=qi.drayType==='export';const matches=getMatches();
  if(!S.selId&&matches.length) S.selId=matches[0].id;
  const sel=matches.find(r=>r.id===S.selId)||matches[0]||null;
  $('topbar-right').innerHTML='<button class="btn" onclick="showRepeatPicker()" title="Load a previous quote">&#x1F501; Repeat</button><button class="btn" onclick="saveDraft(\'drayage\')">&#x1F4CB; Draft</button><span id="upsell-badge" style="display:none;background:#dc2626;color:#fff;border-radius:99px;font-size:9px;font-weight:800;padding:2px 7px"></span><button class="btn" onclick="printQuote()">&#x1F5A8; Print</button><button class="btn" onclick="downloadPDF()">&#x1F4C4; PDF</button><button class="btn blue" onclick="saveQuote()">&#x1F4BE; Save quote</button><button class="btn" onclick="openPostToPortalFromBuilder()" style="background:linear-gradient(135deg,#059669,#34d399);border-color:#059669;color:#fff">&#x1F4E4; Post to portal</button>';  $('page').innerHTML=draftBanner('drayage','drayage')+`<div class="two-col">
    <div>
      <div class="card">
        <div class="sec-head" style="display:flex;align-items:center;justify-content:space-between">
          <span>Lane details</span>
          <div style="display:flex;gap:0;border:1.5px solid var(--gray-200);border-radius:6px;overflow:hidden">
            <button onclick="S.qi.drayType='import';S.qi.pickupZip='';S.selId=null;renderQuote()" style="padding:4px 14px;border:none;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;background:${qi.drayType!=='export'?'#1a2e4a':'#fff'};color:${qi.drayType!=='export'?'#fff':'var(--gray-500)'}">📥 Import</button>
            <button onclick="S.qi.drayType='export';S.qi.zip='';S.selId=null;renderQuote()" style="padding:4px 14px;border:none;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;background:${qi.drayType==='export'?'#92400e':'#fff'};color:${qi.drayType==='export'?'#fff':'var(--gray-500)'}">📤 Export</button>
          </div>
        </div>
        <div style="display:flex;align-items:flex-start;gap:16px;flex-wrap:wrap">
          <div class="field" style="width:220px;flex-shrink:0;margin-bottom:0">
            <label>Customer</label>
            <input type="text" value="${qi.customer}" oninput="onCustomerInput(this.value)"
              list="cust-dl" placeholder="Customer name" autocomplete="off" style="width:220px">
            <datalist id="cust-dl">${S.customers.map(c=>`<option value="${c.company||c.name}">`).join('')}</datalist>
            <div style="margin-top:5px;min-height:22px">
              ${qi.customerEmail
                ?`<div style="display:flex;align-items:center;gap:8px;font-size:12px;color:var(--gray-500)">
                    <span>📧 ${qi.customerEmail}</span>
                    <button class="btn sm blue" onclick="emailQuote()" style="padding:3px 10px;font-size:11px">Send quote by email</button>
                  </div>`
                :`<span style="font-size:11px;color:var(--gray-400)">Add to <span style="color:var(--steel);cursor:pointer;text-decoration:underline" onclick="setView('customers')">contact book</span> to enable email</span>`}
            </div>
          </div>
          <div class="field" style="width:240px;flex-shrink:0;margin-bottom:0">
            <label>${qi.drayType==='export'?'Pickup ZIP (shipper warehouse)':'Port / Rail origin'}</label>
            ${qi.drayType==='export'
              ?`<input type="text" value="${qi.pickupZip||''}" oninput="S.qi.pickupZip=this.value;onZip(this.value)" placeholder="e.g. 07728" style="width:200px" maxlength="10">`
              :`<input type="text" value="${qi.port}" oninput="S.qi.port=this.value" list="port-dl" placeholder="New York / Newark, NJ" style="width:240px">`}
            <datalist id="port-dl">${US_PORTS.map(p=>`<option value="${p}">`).join('')}</datalist>
          </div>
        </div>
        <div style="display:flex;align-items:flex-start;gap:16px;flex-wrap:wrap">
          <div class="field" style="${isExport?'width:260px':'width:130px'};flex-shrink:0;margin-bottom:0">
            <label>${isExport?'Export port':'Delivery ZIP'}</label>
            ${isExport
              ?`<select onchange="S.qi.port=this.value" style="width:260px">
                  <option value="">Select export port…</option>
                  ${US_PORTS.map(p=>`<option value="${p}"${qi.port===p?' selected':''}>${p}</option>`).join('')}
                </select>`
              :`<input type="text" value="${qi.zip}" oninput="onZip(this.value)" placeholder="07728" maxlength="10" style="width:130px">`}
            ${isExport?'':`${getSpecialZipBadge(qi.zip)}`}
          </div>
          <div class="field" style="width:110px;flex-shrink:0;margin-bottom:0">
            <label>Live or Drop</label>
            <select onchange="onLd(this.value)" style="width:110px"><option${qi.ld==='Live'?' selected':''}>Live</option><option${qi.ld==='Drop'?' selected':''}>Drop</option><option${qi.ld==='Both'?' selected':''}>Both</option></select>
          </div>
          <div class="field" style="width:130px;flex-shrink:0;margin-bottom:0">
            <label>Booking / Container #</label>
            <input type="text" value="${qi.bookingNum||''}" oninput="S.qi.bookingNum=this.value" placeholder="e.g. MAEU123…" style="width:130px;font-size:12px">
          </div>
          <div class="field" style="width:90px;flex-shrink:0;margin-bottom:0">
            <label># Containers</label>
            <div style="display:flex;align-items:center;gap:4px">
              <button onclick="if(S.qi.containerCount>1){S.qi.containerCount--;refreshCarriersAndPreview();refreshPricingAndPreview();renderQuote();}" style="width:26px;height:30px;border:1px solid var(--gray-200);background:#fff;border-radius:4px;cursor:pointer;font-size:16px;line-height:1;color:var(--navy)">−</button>
              <span style="font-size:16px;font-weight:800;color:var(--navy);min-width:20px;text-align:center">${qi.containerCount||1}</span>
              <button onclick="if(S.qi.containerCount<10){S.qi.containerCount=(S.qi.containerCount||1)+1;refreshCarriersAndPreview();refreshPricingAndPreview();renderQuote();}" style="width:26px;height:30px;border:1px solid var(--gray-200);background:#fff;border-radius:4px;cursor:pointer;font-size:16px;line-height:1;color:var(--navy)">+</button>
            </div>
            ${(qi.containerCount||1)>1?`<div style="font-size:10px;color:var(--amber);font-weight:600;margin-top:2px">×${qi.containerCount} containers</div>`:''}
          </div>
        </div>
      </div>
      <div class="card"><div class="sec-head">Pricing</div><div id="pricing-section">${buildPricingSection()}</div></div>
      <div class="card" id="lane-history-card" style="${qi.zip?'':'display:none'}">
        <div id="lane-history-body">${buildLaneHistory(qi.zip,qi.ld)}</div>
      </div>
      <div class="card">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0" id="carriers-head-wrap">
          <div class="sec-head" id="carriers-head" style="margin-bottom:0">Carriers · ${qi.zip||'—'} · ${qi.ld}${(qi.containerCount||1)>1?` <span class="badge" style="background:#f59e0b;color:#fff">×${qi.containerCount}</span>`:''}</div>
          ${matches.length?`<span style="font-size:10px;font-weight:700;padding:2px 9px;border-radius:99px;background:#dbeafe;color:#1d4ed8">${matches.length} match${matches.length!==1?'es':''}</span>`:''}
        </div>
        <div id="carriers-body" style="margin:0 -14px">${buildCarrierComparison(matches)}</div>
      </div>
    </div>
    <div class="sticky-top">
      <div class="card"><div class="sec-head">Customer quote preview</div><div id="preview-body">${buildPreviewHTML(sel)}</div></div>
      <div class="card" style="margin-top:14px">
        <div class="sec-head">Notes for customer <span style="font-weight:400;font-size:11px;text-transform:none;letter-spacing:0;color:var(--gray-400)">— appear on PDF and email</span></div>
        <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px">
          ${NOTE_TEMPLATES.map(t=>`<button class="btn sm" onclick="addNote('${t.replace(/'/g,"\\'")}')">+ ${t}</button>`).join('')}
        </div>
        <textarea id="qi-notes" rows="4" oninput="S.qi.notes=this.value"
          placeholder="Add any special conditions, minimums, or instructions for the customer…"
          style="width:100%;padding:8px 10px;font-size:12px;border:1px solid var(--gray-200);border-radius:var(--radius);resize:vertical;font-family:inherit;line-height:1.6">${S.qi.notes||''}</textarea>
      </div>
    </div>
  </div>`;
}

function refreshCarriersAndPreview(){
  const matches=getMatches();if(!S.selId&&matches.length) S.selId=matches[0].id;
  const sel=matches.find(r=>r.id===S.selId)||matches[0]||null;const qi=S.qi;
  const h=$('carriers-head');if(h) h.innerHTML=`Carriers · ${qi.zip||'—'} · ${qi.ld}${(qi.containerCount||1)>1?` <span class="badge" style="background:#f59e0b;color:#fff">×${qi.containerCount}</span>`:''}`;
  const b=$('carriers-body');if(b) b.innerHTML=buildCarrierComparison(matches);
  const p=$('preview-body');if(p) p.innerHTML=buildPreviewHTML(sel);
}
function refreshPricingAndPreview(){
  const ps=$('pricing-section');if(ps) ps.innerHTML=buildPricingSection();
  refreshPreviewOnly();
}
function refreshPreviewOnly(){
  const matches=getMatches();const sel=matches.find(r=>r.id===S.selId)||matches[0]||null;
  const p=$('preview-body');if(p) p.innerHTML=buildPreviewHTML(sel);
}
function refreshCarrierHighlight(id){
  document.querySelectorAll('.carrier-row').forEach(row=>{
    const isSel=row.dataset.cid===id;row.classList.toggle('sel',isSel);
    const td=row.querySelector('td:first-child');if(td) td.style.color=isSel?'var(--steel)':'var(--gray-300)';
  });
}
function onCustomerInput(v){
  S.qi.customer=v;
  // Match against contact book
  const match=S.customers.find(c=>(c.company||'').toLowerCase()===v.toLowerCase()||(c.name||'').toLowerCase()===v.toLowerCase());
  S.qi.customerId=match?match.id:null;
  S.qi.customerEmail=match?match.email:'';
  // Update just the email display row without touching the input
  const emailDiv=document.getElementById('cust-email-row');
  if(emailDiv){
    emailDiv.innerHTML=S.qi.customerEmail
      ?`<div style="display:flex;align-items:center;gap:8px;font-size:12px;color:var(--gray-500)"><span>📧 ${S.qi.customerEmail}</span><button class="btn sm blue" onclick="emailQuote()" style="padding:3px 10px;font-size:11px">Send quote by email</button></div>`
      :`<span style="font-size:11px;color:var(--gray-400)">Add to <span style="color:var(--steel);cursor:pointer;text-decoration:underline" onclick="setView('customers')">contact book</span> to enable email</span>`;
  }
}

function emailQuote(){
  const qi=S.qi;const sel=S.rates.find(r=>r.id===S.selId);
  if(!qi.customerEmail){alert('No email address found. Select a customer from the contact book first.');return;}
  if(!sel){alert('Please select a carrier first.');return;}
  const ld=qi.ld;
  const lines=[
    'Hi,','',
    'Please find your drayage quote below:','',
    'Pickup: '+(qi.port||'—'),
    'Delivery Zip: '+qi.zip,
    'Destination: '+sel.destination,
    'Mode: '+ld,'',
    'BASE RATE: '+fmtD(cuRate(Number(sel.base)||0,'base')),'',
  ];
  const accessorials=CHARGES.filter(c=>c!=='base'&&isApplicable(c,ld)&&cuRate(Number(sel[c])||0,c)>0);
  // Add genset/triaxle/bobtail if enabled
  const extraCharges=[];
  if(qi.gensetEnabled&&(qi.gensetCustomerRate>0||qi.gensetCarrierRate>0)) extraCharges.push({label:'Genset',cuAmt:qi.gensetCustomerRate||0,caAmt:qi.gensetScope==='customer_only'?0:(qi.gensetCarrierRate||0)});
  if(qi.bobtailEnabled&&(qi.bobtailCustomerRate>0||qi.bobtailCarrierRate>0)) extraCharges.push({label:'Bobtail',cuAmt:qi.bobtailCustomerRate||0,caAmt:qi.bobtailScope==='customer_only'?0:(qi.bobtailCarrierRate||0)});
  if(qi.triaxleEnabled&&(qi.triaxleCustomerRate>0||qi.triaxleCarrierRate>0)) extraCharges.push({label:'Triaxle',cuAmt:qi.triaxleCustomerRate||0,caAmt:qi.triaxleScope==='customer_only'?0:(qi.triaxleCarrierRate||0)});
  if(accessorials.length){
    lines.push('The following charges will apply when applicable:');
    accessorials.forEach(c=>{
      const desc=CHARGE_DESC[c]?` (${CHARGE_DESC[c]})`:'';
      lines.push(`  ${LABELS[c]}: ${fmtD(cuRate(Number(sel[c])||0,c))}${desc}`);
    });
    lines.push('');
  }
  // Per-quote charges (bobtail/genset/triaxle) — customer sees only cuAmt
  if(extraCharges.length){
    lines.push('');
    extraCharges.forEach(function(ec){
      if(ec.cuAmt>0) lines.push('  '+ec.label+': '+fmtD(ec.cuAmt));
    });
    lines.push('');
  }
  lines.push('All rates are per container. Detention: first 2 hours free.','');
  lines.push('Quote valid 30 days. Please don\'t hesitate to reach out with any questions.','','Thank you!','Shifl');
  const subject=encodeURIComponent('Drayage Quote — '+qi.zip+' ('+ld+')');
  const body=encodeURIComponent(lines.join('\n'));
  window.open(`mailto:${qi.customerEmail}?subject=${subject}&body=${body}`);
}

// ═══════════════════════════════════════════════════════
// FREIGHT QUOTING
// ═══════════════════════════════════════════════════════
const FTL_EQUIPMENT=['Dry Van','Reefer','Flatbed','Box Truck'];
const LCL_EQUIPMENT=['Box Truck','LTL'];

const FREIGHT_ICONS={FTL:'🚛',LTL:'📦',LCL:'🌊'};
const FREIGHT_DESC={
  FTL:'Full Truckload — dedicated truck for your shipment',
  LTL:'Less Than Truckload — share space with other shippers',
  LCL:'Less Container Load — ocean freight consolidation',
};
const EQUIP_ICONS={'Dry Van':'🚛','Reefer':'❄️','Flatbed':'🛻','Box Truck':'📦','LTL':'📦'};

function setFreightMode(mode){
  S.fq.mode=mode;S.fq.equipment=null;
  S.fq.pallets=[{w:'',l:'',h:''}];
  S.fq.carriers=[{name:'',rate:''}];
  S.fq.selCarrierIdx=0;
  renderFreight();
}
function setFreightEquip(eq){S.fq.equipment=eq;renderFreight();}
function fqTypeLabel(q){
  if(!q||!q.fqMode) return '';
  if(q.fqMode==='LCL'&&q.fqEquip==='LTL') return 'LTL';
  if(q.fqMode==='LCL'&&q.fqEquip) return 'LCL — '+q.fqEquip;
  return q.fqMode+(q.fqEquip?' — '+q.fqEquip:'');
}
function fqField(key,val){S.fq[key]=val;}
function fqPallet(idx,dim,val){S.fq.pallets[idx][dim]=val;}
function addPallet(){S.fq.pallets.push({w:'',l:'',h:''});renderFreight();}
function removePallet(idx){if(S.fq.pallets.length>1){S.fq.pallets.splice(idx,1);renderFreight();}}
function fqCarrier(idx,key,val){
  if(!S.fq.carriers[idx]) S.fq.carriers[idx]={name:'',rate:''};
  S.fq.carriers[idx][key]=val;
  // Update preview without full re-render
  refreshFreightPreview();
}
function addFqCarrier(){S.fq.carriers.push({name:'',rate:''});renderFreight();}
function removeFqCarrier(idx){if(S.fq.carriers.length>1){S.fq.carriers.splice(idx,1);if(S.fq.selCarrierIdx>=S.fq.carriers.length) S.fq.selCarrierIdx=0;renderFreight();}}
function selFqCarrier(idx){S.fq.selCarrierIdx=idx;refreshFreightPreview();}
function toggleFqSameDims(v){S.fq.sameDims=v;renderFqBuilder();}
function fqSingleDim(dim,val){S.fq['single'+dim.toUpperCase()]=val;refreshFreightPreview();}
function selFqRate(id){S.fq.selFqRateId=id;refreshFreightPreview();}

// Freight carrier rates database (localStorage)
function loadFqRates(){try{window._fqRates=JSON.parse(localStorage.getItem('fq_rates')||'[]');}catch(e){window._fqRates=[];}}
function saveFqRates(){try{localStorage.setItem('fq_rates',JSON.stringify(window._fqRates));}catch(e){}}

function showAddFqRate(){
  $('modal-root').innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()">
    <div class="modal"><div class="modal-title">Add freight carrier rate</div>
    ${fqRateFields(null)}
    <div class="modal-foot"><button class="btn" onclick="closeModal()">Cancel</button>
    <button class="btn blue" onclick="submitAddFqRate()">Save rate</button></div></div></div>`;
}
function fqRateFields(r){
  const mode=r?r.mode:'FTL';
  return `
    <div class="g2">
      <div class="field"><label>Carrier name *</label><input type="text" id="fr-carrier" value="${r?r.carrier:''}" placeholder="e.g. XPO, Echo, Total"></div>
      <div class="field"><label>Mode</label>
        <select id="fr-mode" onchange="document.getElementById('fr-equip-row').style.display=['FTL','LCL'].includes(this.value)?'':'none';document.getElementById('fr-rate-label').textContent=this.value==='LCL'?'Rate per pallet ($)':'Flat rate ($)'">
          <option${mode==='FTL'?' selected':''}>FTL</option>
          <option${mode==='LTL'?' selected':''}>LTL</option>
          <option${mode==='LCL'?' selected':''}>LCL</option>
        </select></div>
    </div>
    <div class="g2" id="fr-equip-row" style="${['FTL','LCL'].includes(mode)?'':'display:none'}">
      <div class="field"><label>Equipment type</label>
        <select id="fr-equip">
          ${(mode==='LCL'?LCL_EQUIPMENT:FTL_EQUIPMENT).map(e=>`<option${r&&r.equipment===e?' selected':''}>${e}</option>`).join('')}
        </select></div>
      <div></div>
    </div>
    <div class="g2">
      <div class="field"><label>Pickup zip</label><input type="text" id="fr-pzip" value="${r?r.pickupZip:''}" placeholder="07728" maxlength="10"></div>
      <div class="field"><label>Delivery zip</label><input type="text" id="fr-dzip" value="${r?r.deliveryZip:''}" placeholder="90210" maxlength="10"></div>
    </div>
    <div class="g2">
      <div class="field"><label id="fr-rate-label">${mode==='LCL'?'Rate per pallet ($)':'Flat rate ($)'}</label>
        <input type="number" id="fr-rate" value="${r?r.rate:''}" placeholder="${mode==='LCL'?'e.g. 150':'e.g. 2500'}" min="0"></div>
      <div class="field"><label>Notes (optional)</label><input type="text" id="fr-notes" value="${r?r.notes:''}" placeholder="e.g. hazmat ok, 53ft only"></div>
    </div>`;
}
function onFqRateModeChange(mode){
  const eqRow=$('fr-equip-row');const lclSec=$('fr-lcl-section');const flatSec=$('fr-flat-section');
  if(eqRow) eqRow.style.display=['FTL','LCL'].includes(mode)?'':'none';
  if(lclSec) lclSec.style.display=mode==='LCL'?'':'none';
  if(flatSec) flatSec.style.display=mode==='LCL'?'none':'';
}
function onFqRateTypeChange(t){
  const ppBtn=$('fr-rt-pp');const cbmBtn=$('fr-rt-cbm');const flBtn=$('fr-rt-fl');const lbl=$('fr-rate-lbl');
  if(ppBtn) ppBtn.classList.toggle('on',t==='perPallet');
  if(cbmBtn) cbmBtn.classList.toggle('on',t==='perCbm');
  if(flBtn) flBtn.classList.toggle('on',t==='flat');
  if(lbl) lbl.textContent=t==='perPallet'?'Rate per pallet ($)':t==='perCbm'?'Rate per CBM ($)':'Flat rate ($)';
  const hf=$('fr-rate-type');if(hf) hf.value=t;
}

// CBM calculator
function calcCbm(){
  const fq=S.fq.calc;
  const l=parseFloat(fq.l)||0,w=parseFloat(fq.w)||0,h=parseFloat(fq.h)||0;
  const pieces=parseInt(fq.pieces)||1;
  const weightLbs=parseFloat(fq.weightLbs)||0;
  if(!l||!w||!h){alert('Enter length, width and height first.');return;}
  let cbm=fq.unit==='in'?(l*w*h*pieces)/61023.7:(l*w*h*pieces)/1000000;
  cbm=Math.round(cbm*100)/100;
  const cbmPerPallet=1.5; // industry standard: 1 pallet ≈ 1.5 CBM
  const weightKg=weightLbs*0.453592;
  const palletsByVol=Math.ceil(cbm/cbmPerPallet);
  const palletsByWt=weightKg>0?Math.ceil(weightKg/1000):0;
  const estPallets=Math.max(palletsByVol,palletsByWt,1);
  const chargeableKg=Math.max(cbm*1000,weightKg);
  const wmRatio=cbm>0?Math.round(weightKg/cbm):0;
  const volWins=palletsByVol>=palletsByWt;
  const driverLabel=volWins?'📐 Volume':'⚖️ Weight';
  const driverColor=volWins?'#1d4ed8':'#d97706';
  const driverBg=volWins?'#dbeafe':'#fef3c7';
  $('cbm-result').innerHTML=`
    <!-- W/M Ratio banner -->
    <div style="background:${driverBg};border-radius:var(--radius);padding:10px 14px;margin-top:12px;display:flex;align-items:center;justify-content:space-between">
      <div>
        <span style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:${driverColor}">W/M Ratio</span>
        <div style="font-size:20px;font-weight:800;color:${driverColor}">${wmRatio} kg/CBM</div>
        <div style="font-size:11px;color:${driverColor};margin-top:2px">
          ${wmRatio>1000?'Weight > 1,000 kg/CBM — <strong>weight drives the bill</strong>':'Weight < 1,000 kg/CBM — <strong>volume drives the bill</strong>'}
        </div>
      </div>
      <div style="text-align:right">
        <div style="font-size:10px;font-weight:700;text-transform:uppercase;color:${driverColor}">Billing driver</div>
        <div style="font-size:22px;font-weight:800;color:${driverColor}">${driverLabel}</div>
        <div style="font-size:11px;color:${driverColor}">determines pallet count</div>
      </div>
    </div>
    <!-- Three columns: CBM / by vol / by weight -->
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-top:8px">
      <div style="background:var(--blue-bg);border-radius:var(--radius);padding:10px;text-align:center">
        <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;color:var(--gray-500);margin-bottom:3px">Total CBM</div>
        <div style="font-size:22px;font-weight:800;color:var(--steel)">${cbm}</div>
        <div style="font-size:10px;color:var(--gray-400)">${Math.round(weightKg).toLocaleString()} kg gross</div>
      </div>
      <div style="background:${volWins?'#dbeafe':'var(--gray-50)'};border-radius:var(--radius);padding:10px;text-align:center;border:${volWins?'2px solid #93c5fd':'1px solid var(--gray-200)'}">
        <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;color:${volWins?'#1d4ed8':'var(--gray-400)'};margin-bottom:3px">By Volume</div>
        <div style="font-size:22px;font-weight:800;color:${volWins?'#1d4ed8':'var(--gray-500)'}">${palletsByVol}</div>
        <div style="font-size:10px;color:${volWins?'#1d4ed8':'var(--gray-400)'}">CBM ÷ 1.5 per pallet${volWins?' ← winner':''}</div>
      </div>
      <div style="background:${!volWins?'#fef3c7':'var(--gray-50)'};border-radius:var(--radius);padding:10px;text-align:center;border:${!volWins?'2px solid #fcd34d':'1px solid var(--gray-200)'}">
        <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;color:${!volWins?'#92400e':'var(--gray-400)'};margin-bottom:3px">By Weight</div>
        <div style="font-size:22px;font-weight:800;color:${!volWins?'#92400e':'var(--gray-500)'}">${palletsByWt}</div>
        <div style="font-size:10px;color:${!volWins?'#92400e':'var(--gray-400)'}">kg ÷ 1,000 per pallet${!volWins?' ← winner':''}</div>
      </div>
    </div>
    <!-- Estimated pallets result -->
    <div style="margin-top:8px;background:#f0fdf4;border:1px solid #86efac;border-radius:var(--radius);padding:10px 14px;display:flex;align-items:center;justify-content:space-between">
      <div>
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#166534">Estimated pallets</div>
        <div style="font-size:28px;font-weight:900;color:#166534;line-height:1.1">${estPallets}</div>
        <div style="font-size:11px;color:#166534">max(${palletsByVol} vol, ${palletsByWt} wt) · ${driverLabel} wins</div>
      </div>
      <div style="text-align:right">
        <div style="font-size:11px;color:#166534">Chargeable weight</div>
        <div style="font-size:16px;font-weight:700;color:#166534">${Math.round(chargeableKg).toLocaleString()} kg</div>
        <div style="font-size:10px;color:#166534">max(CBM×1,000, gross kg)</div>
      </div>
    </div>
    <div style="margin-top:6px;font-size:10px;color:var(--gray-400);text-align:center">
      W/M: if ratio &gt; 1,000 kg/CBM → carrier bills by weight · if &lt; 1,000 → bills by volume · 1.5 CBM = 1 pallet · 1,000 kg = 1 pallet
    </div>
    <button class="btn blue" style="width:100%;margin-top:10px;justify-content:center"
      onclick="S.fq.cbm=${cbm};S.fq.palletCount='${estPallets}';S.fq.weight='${Math.round(weightLbs)}';renderFqBuilder()">
      Use ${estPallets} pallets · ${cbm} CBM in quote ↗
    </button>`;
}
function refreshTlOutPreview(){const el=$('tl-step3-preview');if(el) el.innerHTML=buildTlStep3Preview(S.tl);}
function setCbmCalc(k,v){S.fq.calc[k]=v;}

function getFqRateValue(){
  const mode=($('fr-mode')||{}).value||'FTL';
  if(mode==='LCL'){return parseFloat(($('fr-rate')||{}).value)||0;}
  return parseFloat(($('fr-rate-flat')||{}).value)||0;
}

function fqRateFields(r){
  const mode=r?r.mode:'FTL';
  const rateType=r?r.rateType||'flat':'flat';
  const isLcl=mode==='LCL';
  return `
    <input type="hidden" id="fr-rate-type" value="${rateType}">
    <div class="g2">
      <div class="field"><label>Carrier name *</label>
        <input type="text" id="fr-carrier" value="${r?r.carrier:''}" placeholder="e.g. XPO, Echo, Total"></div>
      <div class="field"><label>Mode</label>
        <select id="fr-mode" onchange="onFqRateModeChange(this.value)">
          <option${mode==='FTL'?' selected':''}>FTL</option>
          <option${mode==='LTL'?' selected':''}>LTL</option>
          <option${mode==='LCL'?' selected':''}>LCL</option>
        </select></div>
    </div>
    <div class="g2" id="fr-equip-row" style="${['FTL','LCL'].includes(mode)?'':'display:none'}">
      <div class="field"><label>Equipment type</label>
        <select id="fr-equip">
          ${(mode==='LCL'?LCL_EQUIPMENT:FTL_EQUIPMENT).map(e=>`<option${r&&r.equipment===e?' selected':''}>${e}</option>`).join('')}
        </select></div>
      <div></div>
    </div>
    <div class="g2">
      <div class="field"><label>Pickup zip</label>
        <input type="text" id="fr-pzip" value="${r?r.pickupZip:''}" placeholder="07728" maxlength="10"></div>
      <div class="field"><label>Delivery zip</label>
        <input type="text" id="fr-dzip" value="${r?r.deliveryZip:''}" placeholder="90210" maxlength="10"></div>
    </div>
    <!-- LCL: per-pallet or flat + accessorials -->
    <div id="fr-lcl-section" style="${isLcl?'':'display:none'}">
      <div class="field"><label>Rate type</label>
        <div class="toggle-group" style="margin-top:4px">
          <button class="tgl${rateType==='perPallet'?' on':''}" id="fr-rt-pp" onclick="onFqRateTypeChange('perPallet')">Per pallet</button>
          <button class="tgl${rateType==='perCbm'?' on':''}"   id="fr-rt-cbm" onclick="onFqRateTypeChange('perCbm')">Per CBM</button>
          <button class="tgl${rateType==='flat'?' on':''}"     id="fr-rt-fl" onclick="onFqRateTypeChange('flat')">Flat rate</button>
        </div>
      </div>
      <div class="g2">
        <div class="field"><label id="fr-rate-lbl">${rateType==='perPallet'?'Rate per pallet ($)':'Flat rate ($)'}</label>
          <input type="number" id="fr-rate" value="${isLcl&&r?r.rate||'':''}" placeholder="${rateType==='perPallet'?'e.g. 150':'e.g. 2500'}" min="0"></div>
        <div></div>
      </div>
      <div class="charge-group-label">LCL accessorials</div>
      <div class="g2">
        <div class="field"><label>Detention ($ / hour)</label>
          <input type="number" id="fr-detention" value="${r?r.detentionRate||'':''}" placeholder="e.g. 75" min="0"></div>
        <div class="field"><label>Pallet exchange ($ / pallet)</label>
          <input type="number" id="fr-pallet-exchange" value="${r?r.palletExchangeRate||'':''}" placeholder="e.g. 25" min="0"></div>
      </div>
    </div>
    <!-- Non-LCL flat rate -->
    <div id="fr-flat-section" style="${isLcl?'display:none':''}">
      <div class="field"><label>Flat rate ($)</label>
        <input type="number" id="fr-rate-flat" value="${!isLcl&&r?r.rate||'':''}" placeholder="e.g. 2500" min="0"></div>
    </div>
    <div class="field"><label>Notes (optional)</label>
      <input type="text" id="fr-notes" value="${r?r.notes:''}" placeholder="e.g. hazmat ok, 53ft only"></div>`;
}

function buildFqRateObj(id){
  const mode=($('fr-mode')||{}).value||'FTL';
  const isLcl=mode==='LCL';
  const rateType=($('fr-rate-type')||{}).value||'flat';
  return {id:id||uid(),carrier:($('fr-carrier')||{}).value?.trim()||'',mode,
    equipment:($('fr-equip')||{}).value||'',
    pickupZip:($('fr-pzip')||{}).value?.trim()||'',
    deliveryZip:($('fr-dzip')||{}).value?.trim()||'',
    rateType:isLcl?rateType:'flat',
    rate:isLcl?parseFloat(($('fr-rate')||{}).value)||0:parseFloat(($('fr-rate-flat')||{}).value)||0,
    detentionRate:parseFloat(($('fr-detention')||{}).value)||0,
    palletExchangeRate:parseFloat(($('fr-pallet-exchange')||{}).value)||0,
    notes:($('fr-notes')||{}).value?.trim()||'',
    active:true,date:localDateStr()};
}
function submitAddFqRate(){
  const carrier=($('fr-carrier')||{}).value?.trim();if(!carrier){alert('Carrier name is required.');return;}
  const rate=buildFqRateObj(uid());
  window._fqRates.push(rate);saveFqRates();closeModal();renderFqCarriers();
}
function editFqRate(id){
  const r=window._fqRates.find(r=>r.id===id);if(!r) return;
  $('modal-root').innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()">
    <div class="modal"><div class="modal-title">Edit — ${r.carrier}</div>
    ${fqRateFields(r)}
    <div class="modal-foot"><button class="btn" onclick="closeModal()">Cancel</button>
    <button class="btn blue" onclick="submitEditFqRate('${id}')">Save changes</button></div></div></div>`;
}
function submitEditFqRate(id){
  const r=window._fqRates.find(r=>r.id===id);if(!r) return;
  const carrier=($('fr-carrier')||{}).value?.trim();if(!carrier){alert('Carrier required.');return;}
  Object.assign(r,buildFqRateObj(id));
  saveFqRates();closeModal();renderFqCarriers();
}
function deleteFqRate(id){
  if(!confirm('Delete this carrier rate?')) return;
  window._fqRates=window._fqRates.filter(r=>r.id!==id);
  saveFqRates();renderFqCarriers();
}

function onFqCustomerInput(v){
  S.fq.customer=v;
  const match=S.customers.find(c=>(c.company||'').toLowerCase()===v.toLowerCase()||(c.name||'').toLowerCase()===v.toLowerCase());
  S.fq.customerId=match?match.id:null;
  S.fq.customerEmail=match?match.email:'';
}
function setFqMarkup(key,val){
  S.fq[key]=val;
  if(key==='markupMode'){
    document.querySelectorAll('[data-fqmu]').forEach(b=>b.classList.toggle('on',b.dataset.fqmu===val));
  }
  refreshFreightPreview();
}
function fqCustomerRate(carrierRate){
  const fq=S.fq;const cr=Number(carrierRate)||0;if(!cr) return 0;
  return fq.markupMode==='pct'?cr*(1+fq.markupAmount/100):cr+Number(fq.markupAmount);
}
function refreshFreightPreview(){
  const el=$('fq-preview');if(el) el.innerHTML=buildFreightPreview();
}

function needsDims(fq){
  // LTL standalone or LCL-LTL: need pallet dimensions
  return fq.mode==='LTL' || (fq.mode==='LCL'&&fq.equipment==='LTL');
}
function needsPalletCount(fq){
  // FTL-Box Truck, LCL-Box Truck: need pallet count
  return (fq.mode==='FTL'&&fq.equipment==='Box Truck') ||
         (fq.mode==='LCL'&&fq.equipment==='Box Truck') ||
         fq.mode==='FTL'; // all FTL modes benefit from pallet count
}

function renderFreight(){
  const tab=S.fqTab||'builder';
  $('topbar-right').innerHTML=tab==='carriers'?`<button class="btn blue" onclick="showAddFqRate()">+ Add rate</button>`:'';
  if(tab==='log')        return renderFqLog();
  if(tab==='carriers')   return renderFqCarriers();
  if(tab==='dash')       return renderFqDashboard();
  if(tab==='invoicing')  return renderFqInvoicing();
  renderFqBuilder();
}

function setFqTab(t){
  S.fqTab=t;
  document.querySelectorAll('.nav-sub,.sub-link').forEach(b=>b.classList.remove('active'));
  const el=$('fqnav-'+t);if(el) el.classList.add('active');
  openAccFor('freight');updateSubActive('freight',t);
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active'));
  const nf=$('nav-freight');if(nf) nf.classList.add('active');
  renderFreight();
}

function renderFqBuilder(){
  const fq=S.fq;
  const showForm=fq.mode==='LTL'||(fq.mode==='FTL'&&fq.equipment)||(fq.mode==='LCL'&&fq.equipment);

  // Mode selector
  const modeCards=['FTL','LTL','LCL'].map(m=>`
    <div onclick="setFreightMode('${m}')" style="flex:1;cursor:pointer;border-radius:var(--radius-lg);padding:20px;text-align:center;border:2px solid ${fq.mode===m?'var(--steel)':'var(--gray-200)'};background:${fq.mode===m?'var(--blue-bg)':'var(--white)'};transition:all .15s;box-shadow:${fq.mode===m?'0 0 0 3px var(--blue-mid)':'var(--shadow-sm)'}">
      <div style="font-size:32px;margin-bottom:8px">${FREIGHT_ICONS[m]}</div>
      <div style="font-size:16px;font-weight:700;color:${fq.mode===m?'var(--navy)':'var(--gray-700)'};margin-bottom:4px">${m}</div>
      <div style="font-size:11px;color:var(--gray-400);line-height:1.4">${FREIGHT_DESC[m]}</div>
    </div>`).join('');

  // Equipment selector
  let equipSection='';
  if(fq.mode==='FTL'||fq.mode==='LCL'){
    const opts=fq.mode==='FTL'?FTL_EQUIPMENT:LCL_EQUIPMENT;
    const cards=opts.map(eq=>`
      <div onclick="setFreightEquip('${eq}')" style="cursor:pointer;border-radius:var(--radius);padding:14px 16px;border:2px solid ${fq.equipment===eq?'var(--steel)':'var(--gray-200)'};background:${fq.equipment===eq?'var(--blue-bg)':'var(--white)'};display:flex;align-items:center;gap:10px;transition:all .15s">
        <span style="font-size:20px">${EQUIP_ICONS[eq]||'🚛'}</span>
        <span style="font-weight:${fq.equipment===eq?'700':'500'};color:${fq.equipment===eq?'var(--navy)':'var(--gray-700)'}">${eq}</span>
        ${fq.equipment===eq?'<span class="badge b" style="margin-left:auto">Selected</span>':''}
      </div>`).join('');
    equipSection=`<div class="card" style="margin-bottom:16px"><div class="sec-head">Select equipment type</div>
      <div style="display:grid;grid-template-columns:repeat(${opts.length},1fr);gap:10px">${cards}</div></div>`;
  }

  // Pallet section — LTL gets same-dims option
  const palletSection=needsDims(fq)?`<div class="field">
    <label>Pallet dimensions — W × L × H (inches)</label>
    <div style="background:var(--gray-50);border-radius:var(--radius);padding:12px;margin-top:4px">
      <label style="display:flex;align-items:center;gap:8px;font-size:13px;font-weight:400;text-transform:none;letter-spacing:0;margin-bottom:10px;cursor:pointer">
        <input type="checkbox" ${fq.sameDims?'checked':''} onchange="toggleFqSameDims(this.checked)" style="width:auto">
        All pallets have the same dimensions
      </label>
      ${fq.sameDims?`
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px">
          <input type="number" value="${fq.singleW}" oninput="fqSingleDim('w',this.value)" placeholder="W" style="width:70px;padding:6px 8px;font-size:13px" min="0">
          <span style="color:var(--gray-400)">×</span>
          <input type="number" value="${fq.singleL}" oninput="fqSingleDim('l',this.value)" placeholder="L" style="width:70px;padding:6px 8px;font-size:13px" min="0">
          <span style="color:var(--gray-400)">×</span>
          <input type="number" value="${fq.singleH}" oninput="fqSingleDim('h',this.value)" placeholder="H" style="width:70px;padding:6px 8px;font-size:13px" min="0">
          <span style="color:var(--gray-400);font-size:11px">inches — applies to all pallets</span>
        </div>`
      :fq.pallets.map((p,i)=>`
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
          <span style="font-size:12px;color:var(--gray-500);width:60px;flex-shrink:0">Pallet ${i+1}</span>
          <input type="number" value="${p.w}" oninput="fqPallet(${i},'w',this.value)" placeholder="W" style="width:70px;padding:6px 8px;font-size:13px" min="0">
          <span style="color:var(--gray-400)">×</span>
          <input type="number" value="${p.l}" oninput="fqPallet(${i},'l',this.value)" placeholder="L" style="width:70px;padding:6px 8px;font-size:13px" min="0">
          <span style="color:var(--gray-400)">×</span>
          <input type="number" value="${p.h}" oninput="fqPallet(${i},'h',this.value)" placeholder="H" style="width:70px;padding:6px 8px;font-size:13px" min="0">
          ${fq.pallets.length>1?`<button class="btn sm ico-btn" onclick="removePallet(${i})">✕</button>`:''}
        </div>`).join('')}
      ${!fq.sameDims?`<button class="btn sm" onclick="addPallet()">+ Add pallet</button>`:''}
    </div></div>`:'';

  // LCL carrier rates — show matching per-pallet rates
  const lclRates=fq.mode==='LCL'?(window._fqRates||[]).filter(r=>r.active&&r.mode==='LCL'&&(r.equipment===fq.equipment||!r.equipment)&&(!r.pickupZip||r.pickupZip===fq.pickupZip)&&(!r.deliveryZip||r.deliveryZip===fq.deliveryZip)):[];
  const lclRateSection=fq.mode==='LCL'&&lclRates.length?`
    <div class="card">
      <div class="sec-head">LCL carrier rates</div>
      ${lclRates.map(r=>{
        const pCount=parseInt(fq.palletCount)||0;
        const cbmQty=parseFloat(fq.cbm)||0;
        const isSelected=fq.selFqRateId===r.id;
        const isCbmRate=r.rateType==='perCbm';
        const baseAmt=isCbmRate?cbmQty*r.rate:r.rateType==='perPallet'?pCount*r.rate:r.rate;
        const detAmt=(fq.lclDetentionHours||0)*(r.detentionRate||0);
        const peAmt=(fq.lclPalletExchange||0)*(r.palletExchangeRate||0);
        const totalCarrier=baseAmt+detAmt+peAmt;
        const rateLabel=isCbmRate?`${fmtD(r.rate)}/CBM`:r.rateType==='perPallet'?`${fmtD(r.rate)}/pallet`:`Flat: ${fmtD(r.rate)}`;
        const qtyLabel=isCbmRate?(cbmQty?`${cbmQty} CBM × ${fmtD(r.rate)}`:''):(pCount?`${pCount} pallets × ${fmtD(r.rate)}`:'');
        return `<div onclick="selFqRate('${r.id}')" style="cursor:pointer;border:2px solid ${isSelected?'var(--steel)':'var(--gray-200)'};background:${isSelected?'var(--blue-bg)':'var(--white)'};border-radius:var(--radius);padding:12px 14px;margin-bottom:8px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:${isSelected?'12':'0'}px">
            <div>
              <div style="font-weight:600;color:var(--navy)">${r.carrier}${r.equipment?' — '+r.equipment:''}</div>
              <div style="font-size:12px;color:var(--gray-500);margin-top:2px">
                ${rateLabel}
                ${r.detentionRate?` · Detention: ${fmtD(r.detentionRate)}/hr`:''}
                ${r.palletExchangeRate?` · Pallet exchange: ${fmtD(r.palletExchangeRate)}/pallet`:''}
              </div>
            </div>
            <div style="text-align:right">
              ${qtyLabel?`<div style="font-size:11px;color:var(--gray-400)">${qtyLabel}</div>`:''}
              <div style="font-size:${isSelected?'11':'18'}px;font-weight:700;color:var(--steel)">${totalCarrier>0?fmtD(totalCarrier):'—'}</div>
            </div>
          </div>
          ${isSelected?`
            <div style="border-top:1px solid var(--blue-mid);padding-top:14px;margin-top:4px">

              <!-- PALLET COUNT (required) -->
              <div style="background:#fffbeb;border:1.5px solid #fbbf24;border-radius:8px;padding:10px 14px;margin-bottom:14px;display:flex;align-items:center;gap:12px">
                <div style="font-size:20px">📦</div>
                <div class="field" style="margin:0;flex:1">
                  <label style="color:#92400e;font-weight:800">Pallet count <span style="color:var(--red)">*</span></label>
                  <input type="number" value="${fq.lclPalletCount||''}" min="1"
                    oninput="S.fq.lclPalletCount=+this.value;refreshFreightPreview()" onclick="event.stopPropagation()"
                    placeholder="Enter # of pallets" style="padding:5px 8px;font-size:13px;border-color:#fbbf24">
                </div>
                ${fq.lclPalletCount?`<div style="font-size:12px;font-weight:700;color:#92400e">${fq.lclPalletCount} pallets</div>`:'<div style="font-size:11px;color:#92400e">Required to save</div>'}
              </div>

              <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">

                <!-- WAITING TIME -->
                <div style="background:var(--gray-50);border-radius:8px;padding:12px 14px">
                  <div style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;color:var(--gray-500);margin-bottom:10px">⏱ Waiting time</div>
                  <div class="field" style="margin-bottom:8px">
                    <label>Free time (hours)</label>
                    <input type="number" value="${fq.lclFreeHours??2}" min="0" step="0.5"
                      oninput="S.fq.lclFreeHours=+this.value;refreshFreightPreview()" onclick="event.stopPropagation()"
                      placeholder="2" style="padding:5px 8px;font-size:13px;width:80px">
                    <div style="font-size:10px;color:var(--gray-400);margin-top:2px">Hours before billing starts</div>
                  </div>
                  <div class="field" style="margin-bottom:8px">
                    <label>Total waiting (hours)</label>
                    <input type="number" value="${fq.lclDetentionHours||0}" min="0" step="0.5"
                      oninput="S.fq.lclDetentionHours=+this.value;refreshFreightPreview()" onclick="event.stopPropagation()"
                      placeholder="0" style="padding:5px 8px;font-size:13px;width:80px">
                    ${(fq.lclDetentionHours||0)>(fq.lclFreeHours??2)?
                      `<div style="font-size:10px;color:var(--amber);font-weight:600;margin-top:2px">
                        ${fmtD((fq.lclDetentionHours||0)-(fq.lclFreeHours??2),1)}h billable (after ${fq.lclFreeHours??2}h free)
                      </div>`
                      :`<div style="font-size:10px;color:var(--green);margin-top:2px">Within free time</div>`}
                  </div>
                  <div style="border-top:1px solid var(--gray-200);padding-top:8px;margin-top:8px">
                    <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--gray-400);margin-bottom:6px">Rates</div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
                      <div>
                        <div style="font-size:10px;color:var(--gray-400)">Carrier ($/hr)</div>
                        <div style="font-size:12px;font-weight:600;color:var(--navy)">${r.detentionRate?fmtD(r.detentionRate):'—'}</div>
                      </div>
                      <div>
                        <div style="font-size:10px;color:var(--gray-400)">Customer ($/hr)</div>
                        <input type="number" value="${fq.lclCustomerDetRate||r.detentionRate||''}" min="0" step="1"
                          oninput="S.fq.lclCustomerDetRate=+this.value;refreshFreightPreview()" onclick="event.stopPropagation()"
                          placeholder="0" style="padding:3px 6px;font-size:12px;width:70px;font-weight:600">
                      </div>
                    </div>
                    ${(fq.lclDetentionHours||0)>(fq.lclFreeHours??2)?`
                    <div style="margin-top:6px;padding:6px 8px;background:#fff;border-radius:5px;display:flex;justify-content:space-between;font-size:11px">
                      <span style="color:var(--gray-500)">Billable:</span>
                      <span style="font-weight:700;color:var(--red)">Carrier ${fmtD(((fq.lclDetentionHours||0)-(fq.lclFreeHours??2))*(r.detentionRate||0))}</span>
                      <span style="font-weight:700;color:var(--steel)">Customer ${fmtD(((fq.lclDetentionHours||0)-(fq.lclFreeHours??2))*(fq.lclCustomerDetRate||0))}</span>
                    </div>`:''}
                  </div>
                </div>

                <!-- PALLET EXCHANGE -->
                <div style="background:var(--gray-50);border-radius:8px;padding:12px 14px">
                  <div style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;color:var(--gray-500);margin-bottom:10px">🔄 Pallet exchange</div>
                  <div class="field" style="margin-bottom:8px">
                    <label>Pallets exchanged</label>
                    <input type="number" value="${fq.lclPalletExchange||0}" min="0"
                      oninput="S.fq.lclPalletExchange=+this.value;refreshFreightPreview()" onclick="event.stopPropagation()"
                      placeholder="0" style="padding:5px 8px;font-size:13px;width:80px">
                    <div style="font-size:10px;color:var(--gray-400);margin-top:2px">Pallets to exchange</div>
                  </div>
                  <div style="border-top:1px solid var(--gray-200);padding-top:8px;margin-top:8px">
                    <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--gray-400);margin-bottom:6px">Rates</div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
                      <div>
                        <div style="font-size:10px;color:var(--gray-400)">Carrier ($/pallet)</div>
                        <div style="font-size:12px;font-weight:600;color:var(--navy)">${r.palletExchangeRate?fmtD(r.palletExchangeRate):'—'}</div>
                      </div>
                      <div>
                        <div style="font-size:10px;color:var(--gray-400)">Customer ($/pallet)</div>
                        <input type="number" value="${fq.lclCustomerPalletRate||r.palletExchangeRate||''}" min="0" step="1"
                          oninput="S.fq.lclCustomerPalletRate=+this.value;refreshFreightPreview()" onclick="event.stopPropagation()"
                          placeholder="0" style="padding:3px 6px;font-size:12px;width:70px;font-weight:600">
                      </div>
                    </div>
                    ${(fq.lclPalletExchange||0)>0?`
                    <div style="margin-top:6px;padding:6px 8px;background:#fff;border-radius:5px;display:flex;justify-content:space-between;font-size:11px">
                      <span style="color:var(--gray-500)">Total:</span>
                      <span style="font-weight:700;color:var(--red)">Carrier ${fmtD((fq.lclPalletExchange||0)*(r.palletExchangeRate||0))}</span>
                      <span style="font-weight:700;color:var(--steel)">Customer ${fmtD((fq.lclPalletExchange||0)*(fq.lclCustomerPalletRate||0))}</span>
                    </div>`:''}
                  </div>
                </div>

              </div>
            </div>`:''}
        </div>`;
      }).join('')}
      ${lclRates.length===0?`<p class="muted small">No LCL carrier rates found for this lane. Add rates in the Carrier rates tab.</p>`:''}
    </div>`:'';

  // Carrier rate rows
  const pastCarriers=S.fq.mode?[...new Set(
    (window._fqHistory||[]).filter(q=>q.fqMode===fq.mode&&q.fqEquip===fq.equipment&&q.pickupZip===fq.pickupZip&&q.deliveryZip===fq.deliveryZip).map(q=>q.carrier)
  )]:[];

  const carrierRows=fq.carriers.map((c,i)=>`
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;padding:10px;background:${i===fq.selCarrierIdx?'var(--blue-bg)':'var(--gray-50)'};border-radius:var(--radius);border:1px solid ${i===fq.selCarrierIdx?'var(--steel)':'var(--gray-200)'};cursor:pointer" onclick="selFqCarrier(${i})">
      <div style="flex:1;display:grid;grid-template-columns:1fr 1fr;gap:8px">
        <div>
          <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;color:var(--gray-400);margin-bottom:3px">Carrier name</div>
          <input type="text" value="${c.name}" oninput="fqCarrier(${i},'name',this.value)" onclick="event.stopPropagation()"
            list="fq-carriers-dl" placeholder="e.g. XPO, Echo, Total" style="font-size:13px;padding:5px 8px">
          <datalist id="fq-carriers-dl">${pastCarriers.map(n=>`<option value="${n}">`).join('')}</datalist>
        </div>
        <div>
          <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;color:var(--gray-400);margin-bottom:3px">Carrier rate (flat $)</div>
          <input type="number" value="${c.rate}" oninput="fqCarrier(${i},'rate',this.value)" onclick="event.stopPropagation()"
            placeholder="e.g. 2500" min="0" style="font-size:13px;padding:5px 8px">
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:4px;align-items:center">
        ${i===fq.selCarrierIdx?'<span class="badge b" style="font-size:10px">Selected</span>':''}
        ${fq.carriers.length>1?`<button class="btn sm ico-btn" onclick="event.stopPropagation();removeFqCarrier(${i})" title="Remove">✕</button>`:''}
      </div>
    </div>`).join('');

  const formSection=showForm?`<div class="two-col">
    <div>
      <!-- Shipment details -->
      <div class="card">
        <div class="sec-head">Shipment details</div>
        <div class="field">
          <label>Customer name</label>
          <input type="text" value="${fq.customer}" oninput="onFqCustomerInput(this.value)"
            list="fq-cust-dl" placeholder="Type or pick from contact book" autocomplete="off">
          <datalist id="fq-cust-dl">${S.customers.map(c=>`<option value="${c.company||c.name}">`).join('')}</datalist>
          ${fq.customerEmail?`<div style="font-size:11px;color:var(--gray-500);margin-top:4px">📧 ${fq.customerEmail}</div>`:''}
        </div>
        <div class="g2">
          <div class="field"><label>Pickup zip / CFS location</label>
            <input type="text" value="${fq.pickupZip}" oninput="fqField('pickupZip',this.value)"
              list="fq-pickup-dl" placeholder="${fq.mode==='LCL'?'e.g. CFS — STG Logistics, Kearny, NJ':'e.g. 07728'}" autocomplete="off">
            <datalist id="fq-pickup-dl">
              ${getAllCFS().map(c=>`<option value="${c}">`).join('')}
            </datalist>
            ${fq.mode==='LCL'?`<button class="btn sm" onclick="showAddCustomCFS()" style="margin-top:5px;font-size:11px">+ Add CFS to list</button>`:''}
            ${fq.mode==='LCL'?'<div style="font-size:11px;color:var(--gray-400);margin-top:4px">Type a city or operator to search CFS locations, or enter a zip code</div>':''}</div>
          <div class="field"><label>Delivery zip</label>
            <input type="text" value="${fq.deliveryZip}" oninput="fqField('deliveryZip',this.value)" placeholder="e.g. 90210" maxlength="10"></div>
        </div>
        <div class="g2">
          <div class="field"><label>Total weight (lbs)</label>
            <input type="number" value="${fq.weight}" oninput="fqField('weight',this.value)" placeholder="e.g. 12000" min="0"></div>
          <div class="field">
            <label>Pallet count <span style="font-weight:400;color:var(--gray-400);text-transform:none;letter-spacing:0">${fq.mode==='FTL'?'(optional)':''}</span></label>
            <input type="number" value="${fq.palletCount}" oninput="fqField('palletCount',this.value)" placeholder="e.g. 10" min="0">
          </div>
        </div>
        ${palletSection}
        ${fq.mode==='LCL'?`
        <div class="field">
          <label>Quote by</label>
          <div class="toggle-group" style="margin-top:4px">
            <button class="tgl${fq.lclPriceBy==='pallets'?' on':''}" onclick="S.fq.lclPriceBy='pallets';renderFqBuilder()">📦 Pallets</button>
            <button class="tgl${fq.lclPriceBy==='cbm'?' on':''}"    onclick="S.fq.lclPriceBy='cbm';renderFqBuilder()">📐 CBM</button>
          </div>
        </div>
        ${fq.lclPriceBy==='cbm'?`<div class="field"><label>Total CBM</label>
          <input type="number" value="${fq.cbm||''}" oninput="S.fq.cbm=+this.value;refreshFreightPreview()"
            placeholder="e.g. 5.4" min="0" step="0.01" style="font-size:15px;font-weight:600"></div>`:''}
        `:''}
        <div class="field"><label>Special instructions (optional)</label>
          <input type="text" value="${fq.notes}" oninput="fqField('notes',this.value)" placeholder="e.g. liftgate, appointment, hazmat"></div>
        <div class="field"><label>Shifl Ref #</label>
          <input type="text" value="${fq.shiflRef||''}" oninput="fqField('shiflRef',this.value)" placeholder="Assigned after booking"></div>
        ${fq.mode==='LTL'||(fq.mode==='LCL'&&fq.equipment==='LTL')||fq.mode==='FTL'?`
        <div class="field"><label>Estimated transit time</label>
          <input type="text" value="${fq.transitTime||''}" oninput="fqField('transitTime',this.value)" placeholder="e.g. 3-5 business days"></div>`:''}
      </div>

      ${fq.mode==='LCL'?`
      <div class="card">
        <div class="sec-head">📐 CBM + Weight calculator <span style="font-weight:400;font-size:11px;text-transform:none;letter-spacing:0;color:var(--gray-400)">— estimate pallets from cargo dimensions</span></div>
        <div class="g2" style="margin-bottom:10px">
          <div class="field" style="margin-bottom:0"><label>Units</label>
            <div class="toggle-group" style="margin-top:4px">
              <button class="tgl${(fq.calc&&fq.calc.unit||'in')==='in'?' on':''}" onclick="setCbmCalc('unit','in');renderFqBuilder()">Inches</button>
              <button class="tgl${(fq.calc&&fq.calc.unit||'in')==='cm'?' on':''}" onclick="setCbmCalc('unit','cm');renderFqBuilder()">CM</button>
            </div></div>
          <div class="field" style="margin-bottom:0"><label>No. of pieces / cartons</label>
            <input type="number" value="${fq.calc&&fq.calc.pieces||''}" oninput="setCbmCalc('pieces',this.value)" placeholder="e.g. 10" min="1"></div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:10px">
          <div class="field" style="margin-bottom:0"><label>Length</label>
            <input type="number" value="${fq.calc&&fq.calc.l||''}" oninput="setCbmCalc('l',this.value)" placeholder="L" min="0"></div>
          <div class="field" style="margin-bottom:0"><label>Width</label>
            <input type="number" value="${fq.calc&&fq.calc.w||''}" oninput="setCbmCalc('w',this.value)" placeholder="W" min="0"></div>
          <div class="field" style="margin-bottom:0"><label>Height</label>
            <input type="number" value="${fq.calc&&fq.calc.h||''}" oninput="setCbmCalc('h',this.value)" placeholder="H" min="0"></div>
        </div>
        <div class="field" style="margin-bottom:10px"><label>Total gross weight (lbs)</label>
          <input type="number" value="${fq.calc&&fq.calc.weightLbs||''}" oninput="setCbmCalc('weightLbs',this.value)" placeholder="e.g. 2200" min="0"></div>
        <button class="btn blue" onclick="calcCbm()" style="width:100%;justify-content:center">📐 Calculate CBM + estimated pallets</button>
        <div id="cbm-result"></div>
      </div>`:''}

      ${lclRateSection}

      <!-- Carriers + pricing -->
      <div class="card">
        <div class="sec-head">Carrier rates</div>
        ${carrierRows}
        <button class="btn sm" onclick="addFqCarrier()" style="margin-top:4px">+ Add carrier</button>

        <hr>
        <div class="sec-head" style="margin-top:14px">Your markup <span style="font-weight:400;font-size:11px;color:var(--gray-400);text-transform:none;letter-spacing:0">— $150 suggested, enter any amount</span></div>
        <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
          <div class="toggle-group">
            <button class="tgl${fq.markupMode==='flat'?' on':''}" data-fqmu="flat" onclick="setFqMarkup('markupMode','flat')">Flat $</button>
            <button class="tgl${fq.markupMode==='pct'?' on':''}"  data-fqmu="pct"  onclick="setFqMarkup('markupMode','pct')">%</button>
          </div>
          <input type="number" value="${fq.markupAmount}" min="0" oninput="setFqMarkup('markupAmount',+this.value)"
            style="width:100px;padding:6px 10px;font-size:13px">
          <span style="font-size:12px;color:var(--gray-400)">${fq.markupMode==='flat'?'flat $ added to carrier rate':'% over carrier rate'}</span>
        </div>
      </div>
    </div>

    <!-- Preview -->
    <div class="sticky-top">
      <div class="card">
        <div class="sec-head">Quote preview</div>
        <div id="fq-preview">${buildFreightPreview()}</div>
      </div>
    </div>
  </div>`:'';

  $('page').innerHTML=`
    <div class="card" style="margin-bottom:16px">
      <div class="sec-head">What type of freight?</div>
      <div style="display:flex;gap:14px">${modeCards}</div>
    </div>
    ${equipSection}
    ${formSection||(!fq.mode
      ?`<div class="empty"><div class="empty-ico">🚛</div><p>Select a freight type above to get started</p></div>`
      :!fq.equipment&&(fq.mode==='FTL'||fq.mode==='LCL')
      ?`<div class="empty"><div class="empty-ico">👆</div><p>Select an equipment type above</p></div>`:'')}`;
}

// ── Freight Quote Log ──────────────────────────────────────────────────────
function updateFqInvBadge(){const pending=(window._fqHistory||[]).filter(q=>q.status==='Delivered').length;const b=$('fq-inv-badge');if(b){b.textContent=pending;b.style.display=pending?'':'none';}}
async function saveFqRef(idx,val){
  const q=(window._fqHistory||[])[idx];if(!q) return;
  q.shiflRef=val.trim();
  try{localStorage.setItem('fq_history',JSON.stringify(window._fqHistory));}catch(e){}
  try{await db.from('fq_quotes').update({data:q}).eq('id',q.id);}catch(e){}
}
function renderFqLog(){
  updateFqInvBadge();
  const history=window._fqHistory||[];
  if(!history.length){
    $('page').innerHTML=`<div class="empty"><div class="empty-ico">📁</div><p>No freight quotes saved yet</p><small>Build a quote on the Quote builder tab and save it</small></div>`;
    return;
  }
  if(!window._fqSelected) window._fqSelected=new Set();
  const sel=window._fqSelected;
  const rows=history.map((q,i)=>`
    <tr style="cursor:pointer" onclick="showFqQuoteModal(${i})" title="Click to view" onmouseenter="showQuotePreview(event,{customer:'${q.customer||''}',lane:'${q.pickupZip||''} → ${q.deliveryZip||''}',carrier:'${q.carrier||''}',carrierRate:${q.carrierRate||0},customerRate:${q.customerRate||0},profit:${q.profit||0},margin:${q.profitPct||0},status:'${q.status}',statusBadge:'${q.status==='Booked'?'g':q.status==='Lost'?'r':'a'}',date:'${q.date||''}'})" onmouseleave="hideQuotePreview()">
      <td onclick="event.stopPropagation()" style="width:32px;text-align:center">
        <input type="checkbox" ${sel.has(i)?'checked':''} onchange="toggleFqSelect(${i},this.checked)" style="width:auto;cursor:pointer"></td>
      <td class="muted small">${q.date}${q.drayType==='export'?'<br><span class="badge" style="font-size:9px;background:#92400e;color:#fff">EXP</span>':''}${(q.containerCount||1)>1?`<br><span class="badge" style="font-size:9px;background:#f59e0b;color:#fff">×${q.containerCount}</span>`:''}</td>
      <td class="bold">${q.customer||'—'}</td>
      <td onclick="event.stopPropagation()" style="min-width:100px">
        <input type="text" value="${q.shiflRef||''}"
          onclick="event.stopPropagation()"
          onchange="saveFqRef(${i},this.value)"
          placeholder="Add ref #"
          style="border:none;background:${q.shiflRef?'var(--blue-bg)':'transparent'};color:${q.shiflRef?'var(--steel)':'var(--gray-300)'};font-weight:${q.shiflRef?'700':'400'};font-size:11px;padding:2px 5px;border-radius:4px;width:68px;cursor:text;outline:none"
          onfocus="this.style.background='var(--blue-bg)';this.style.border='1px solid var(--steel)'"
          onblur="this.style.border='none';this.style.background=this.value?'var(--blue-bg)':'transparent'">
      </td>
      <td>${modeBadge(q.fqMode)}
          ${q.fqEquip?`<span class="badge gr" style="margin-left:4px">${q.fqEquip}</span>`:''}</td>
      <td class="bold">${q.pickupZip} -> ${q.deliveryZip}</td>
      <td>${q.carrier}</td>
      <td class="muted">${fmtD(q.carrierRate)}</td>
      <td class="bold" style="color:var(--steel)">${fmtD(q.customerRate)}</td>
      <td style="white-space:nowrap">${(p=>{const c=p.isActual?'var(--green)':p.margin>=0.08?'var(--amber)':'var(--red)';return`<span style="font-weight:700;color:${c}">+${fmtD(p.profit)}</span> ${profitBadge(p.isActual)}`;})(getShipmentProfit(q,'freight'))}</td>
      <td><span class="badge ${(p=>p.margin>=0.10?'g':'r')(getShipmentProfit(q,'freight'))}">${pct(getShipmentProfit(q,'freight').margin)}</span></td>
      <td style="font-size:11px;color:var(--gray-400);white-space:nowrap">${q.created_by_name||'—'}${q.booked_by_name&&q.booked_by_name!==q.created_by_name?'<div style="color:var(--green);font-size:10px">✅ '+q.booked_by_name+'</div>':''}</td>
      <td onclick="event.stopPropagation()">
        <select onchange="updateFqStatus(${i},this.value)" style="font-size:12px;padding:4px 7px;width:120px">
          <option${q.status==='Quoted'?' selected':''}>Quoted</option>
          <option${q.status==='Booked'?' selected':''}>Booked</option>
          <option${q.status==='Lost'?' selected':''}>Lost</option>
          <option${q.status==='Cancelled'?' selected':''}>Cancelled</option>
          <option${q.status==='Delivered'?' selected':''}>Delivered</option>
          <option${q.status==='Invoiced'?' selected':''}>Invoiced</option>
          <option${q.status==='Paid'?' selected':''}>Paid</option>
        </select>
      </td>
      <td onclick="event.stopPropagation()" style="white-space:nowrap">
        ${q.status==='Booked'?`<button class="btn sm ico-btn" onclick="downloadFqCarrierPDF(${i})" title="Carrier rate sheet" style="color:var(--green)">📋</button>`:''}
        ${q.status==='Delivered'?`<button class="btn sm ico-btn" onclick="fqSendInvoice(${i})" title="Send Invoice" style="color:var(--amber)">🧾</button>`:''}
        <button class="btn sm ico-btn" onclick="showFqQuoteModal(${i})" title="View" style="margin-left:3px">📄</button>
        <button class="btn sm ico-btn" onclick="deleteFqQuote(${i})" title="Delete" style="margin-left:3px">🗑️</button>
      </td>
    </tr>`).join('');

  const selCount=sel.size;
  $('topbar-right').innerHTML=`<div style="display:flex;gap:8px">
    ${selCount>0?`<button class="btn blue" onclick="downloadSelectedFqPDFs()">📄 ${selCount} PDF</button><button class="btn" onclick="window._fqSelected=new Set();renderFqLog()">Clear</button>`:''}
    <button class="btn" onclick="syncQuotesToTeam()">🔄 Sync</button>
  </div>`;

  // Status counts
  const fqCounts={all:history.length};
  ['Quoted','Booked','Delivered','Invoiced','Lost','Cancelled','Expired'].forEach(s=>{fqCounts[s]=history.filter(q=>q.status===s).length;});
  const fqSrch=(S.fqLogSearch||'').toLowerCase();
  const fqFiltered=history.map((q,i)=>({q,i})).filter(({q})=>{
    if((S.fqLogFilter||'all')!=='all'&&q.status!==S.fqLogFilter) return false;
    if(!fqSrch) return true;
    return (q.customer||'').toLowerCase().includes(fqSrch)||(q.shiflRef||'').toLowerCase().includes(fqSrch)||(q.pickupZip||'').includes(fqSrch)||(q.deliveryZip||'').includes(fqSrch)||(q.carrier||'').toLowerCase().includes(fqSrch);
  });
  const fqPillBar=buildPillBar('fqLogFilter','fqLogSearch',fqCounts,'Customer, ref #, ZIP, carrier…');
  const filteredRows=fqFiltered.map(({q,i})=>`
    <tr style="cursor:pointer" onclick="showFqQuoteModal(${i})" title="Click to view" onmouseenter="showQuotePreview(event,{customer:'${q.customer||''}',lane:'${q.pickupZip||''} → ${q.deliveryZip||''}',carrier:'${q.carrier||''}',carrierRate:${q.carrierRate||0},customerRate:${q.customerRate||0},profit:${q.profit||0},margin:${q.profitPct||0},status:'${q.status}',statusBadge:'${q.status==='Booked'?'g':q.status==='Lost'?'r':'a'}',date:'${q.date||''}'  })" onmouseleave="hideQuotePreview()">
      <td onclick="event.stopPropagation()" style="width:32px;text-align:center"><input type="checkbox" ${sel.has(i)?'checked':''} onchange="toggleFqSelect(${i},this.checked)" style="width:auto;cursor:pointer"></td>
      <td class="muted small">${q.date}</td>
      <td class="bold">${q.customer||'—'}</td>
      <td onclick="event.stopPropagation()" style="min-width:100px">
        <input type="text" value="${q.shiflRef||''}" onclick="event.stopPropagation()" onchange="saveFqRef(${i},this.value)" placeholder="Add ref #"
          style="border:none;background:${q.shiflRef?'var(--blue-bg)':'transparent'};color:${q.shiflRef?'var(--steel)':'var(--gray-300)'};font-weight:${q.shiflRef?'700':'400'};font-size:12px;padding:3px 6px;border-radius:4px;width:90px;cursor:text;outline:none"
          onfocus="this.style.background='var(--blue-bg)';this.style.border='1px solid var(--steel)'" onblur="this.style.border='none';this.style.background=this.value?'var(--blue-bg)':'transparent'">
      </td>
      <td>${modeBadge(q.fqMode)}${q.fqEquip?`<span class="badge gr" style="margin-left:4px">${q.fqEquip}</span>`:''}</td>
      <td class="bold">${q.pickupZip} → ${q.deliveryZip}</td>
      <td>${q.carrier}</td>
      <td class="muted">${fmtD(q.carrierRate)}</td>
      <td class="bold" style="color:var(--steel)">${fmtD(q.customerRate)}</td>
      <td style="white-space:nowrap">${(p=>{const c=p.isActual?'var(--green)':p.margin>=0.08?'var(--amber)':'var(--red)';return`<span style="font-weight:700;color:${c}">+${fmtD(p.profit)}</span> ${profitBadge(p.isActual)}`;})(getShipmentProfit(q,'freight'))}</td>
      <td><span class="badge ${(p=>p.margin>=0.10?'g':'r')(getShipmentProfit(q,'freight'))}">${pct(getShipmentProfit(q,'freight').margin)}</span></td>
      <td style="font-size:11px;color:var(--gray-400);white-space:nowrap">${q.created_by_name||'—'}</td>
      <td onclick="event.stopPropagation()">
        <select onchange="updateFqStatus(${i},this.value)" style="font-size:12px;padding:4px 7px;width:120px">
          <option${q.status==='Quoted'?' selected':''}>Quoted</option>
          <option${q.status==='Booked'?' selected':''}>Booked</option>
          <option${q.status==='Lost'?' selected':''}>Lost</option>
          <option${q.status==='Cancelled'?' selected':''}>Cancelled</option>
          <option${q.status==='Delivered'?' selected':''}>Delivered</option>
          <option${q.status==='Invoiced'?' selected':''}>Invoiced</option>
          <option${q.status==='Paid'?' selected':''}>Paid</option>
        </select>
      </td>
      <td onclick="event.stopPropagation()" style="white-space:nowrap">
        ${q.status==='Booked'?`<button class="btn sm ico-btn" onclick="downloadFqCarrierPDF(${i})" style="color:var(--green)">📋</button>`:''}
        ${q.status==='Delivered'?`<button class="btn sm ico-btn" onclick="fqSendInvoice(${i})" style="color:var(--amber)">🧾</button>`:''}
        <button class="btn sm ico-btn" onclick="repeatFreightQuote('${q.id}')" title="Duplicate">🔁</button>
        <button class="btn sm ico-btn" onclick="deleteFqQuote(${i})">🗑️</button>
      </td>
    </tr>`).join('');

  $('page').innerHTML=fqPillBar+`<div class="tbl-wrap"><table>
    <thead><tr>
      <th style="width:32px"><input type="checkbox" ${selCount===history.length&&selCount>0?'checked':''} onchange="toggleFqSelectAll(this.checked)" style="width:auto"></th>
      <th>Date</th><th>Customer</th><th style="color:var(--steel)">Ref #</th><th>Type</th><th>Lane</th><th>Carrier</th>
      <th>Carrier rate</th><th>Customer rate</th><th>Base Profit</th><th>By</th><th>Status</th><th></th>
    </tr></thead>
    <tbody>${filteredRows}</tbody>
  </table></div>`;
}

async function syncQuotesToTeam(){
  const btns=document.querySelectorAll('[onclick="syncQuotesToTeam()"]');
  btns.forEach(b=>{b.textContent='Syncing...';b.disabled=true;});
  try{
    const n=await migrateLocalStorageToSupabase();
    await loadFqHistory();
    await loadTlHistory();
    // Refresh whichever log is currently showing
    if(S.view==='freight'&&S.fqTab==='log') renderFqLog();
    else if(S.view==='transload'&&S.tlTab==='log') renderTlLog();
    else if(S.view==='log') renderLog();
    alert(n>0?`✅ Synced ${n} quote${n!==1?'s':''} to Supabase — your team can now see them.`:'✅ All up to date — no new quotes to sync.');
  }catch(e){
    alert('Sync failed: '+e.message);
  }finally{
    btns.forEach(b=>{b.textContent='🔄 Sync to team';b.disabled=false;});
  }
}

function toggleFqSelect(idx,checked){
  if(!window._fqSelected) window._fqSelected=new Set();
  if(checked) window._fqSelected.add(idx); else window._fqSelected.delete(idx);
  renderFqLog();
}
function toggleFqSelectAll(checked){
  const history=window._fqHistory||[];
  window._fqSelected=checked?new Set(history.map((_,i)=>i)):new Set();
  renderFqLog();
}

async function downloadSelectedFqPDFs(){
  const sel=Array.from(window._fqSelected||[]).sort((a,b)=>a-b);
  if(!sel.length){alert('Select at least one quote first.');return;}
  if(!await loadJsPDF()) return;
  const{jsPDF}=window.jspdf;
  const doc=new jsPDF({orientation:'portrait',unit:'mm',format:'a4'});
  const W=210;const navy=[26,46,74];

  for(let i=0;i<sel.length;i++){
    const q=(window._fqHistory||[])[sel[i]];
    if(!q) continue;
    if(i>0) doc.addPage();
    renderFqQuoteOnDoc(doc,q,W,navy);
  }
  doc.save('Shifl_Freight_Quotes_Combined_'+localDateStr()+'.pdf');
  window._fqSelected=new Set();
  renderFqLog();
}

async function updateFqStatus(idx,status){
  const _fqq=(window._fqHistory||[])[idx];
  const TMS_AUTO_MODES=['FTL','LTL','LCL','Box Truck','Air'];
  if(status==='Booked'&&_fqq&&(TMS_AUTO_MODES.includes(_fqq.fqMode)||(_fqq.fqEquip&&_fqq.fqEquip.includes('Box Truck')))){
    const qNum=_fqq.id?.slice(-6)||Math.random().toString(36).slice(-4).toUpperCase();
    const bkNum='BK-'+qNum.toUpperCase();
    if(!getTMSMeta(_fqq.id).bookingNum){
      saveTMSMeta(_fqq.id,{bookingNum:bkNum,quoteRef:_fqq.id,mode:_fqq.fqMode,bookedAt:new Date().toISOString()});
    }
    const modeIcon={'FTL':'🚛','LTL':'📦','LCL':'🚢','Box Truck':'📦','Air':'✈️'}[_fqq.fqMode]||'🚚';
    setTimeout(()=>showToast(modeIcon+' '+(_fqq.fqMode||'Load')+' #'+bkNum+' added to TMS','info',4000),800);
  }
  // Auto-flow booked FTL/LTL to TMS
  if(status==='Booked'){
    const q=(window._fqHistory||[])[idx];
    if(q&&(q.fqMode==='FTL'||q.fqMode==='LTL')){
      setTimeout(()=>showToast('🚚 Load added to TMS — check Dispatch Board','info',4000),500);
    }
  }
  if(status==='Booked'){if(!requireCan('book_quotes','You do not have permission to book quotes.')) return;}
  else if(!requireCan('update_status','Only Admins can change quote status.')) return;
  if(status==='Booked'){setTimeout(fireConfetti,200);showToast('🎉 Quote booked!','success',4000);}
  const _fq=(window._fqHistory||[])[idx];if(_fq) logAction('status_changed',`${_fq.fqMode||'Freight'} — ${_fq.customer||'—'} | ${_fq.pickupZip||'—'} → ${_fq.deliveryZip||'—'} → ${status}`,'fq_quote',_fq.id);
  if(!window._fqHistory||!window._fqHistory[idx]) return;
  if(status==='Booked'){showFqBookingModal(idx);return;}
  const q=window._fqHistory[idx];
  q.status=status;
  try{localStorage.setItem('fq_history',JSON.stringify(window._fqHistory));}catch(e){}
  try{await dbUpdateFqStatus(q.id,status);}catch(e){console.warn('fq status:',e.message);}
  updateActiveBadge();
  if(S.fqTab==='log') renderFqLog();
  if(S.fqTab==='dash') renderFqDashboard();
}
function deleteFqQuote(idx){
  if(!confirm('Delete this freight quote?')) return;
  const q=window._fqHistory[idx];
  window._fqHistory.splice(idx,1);
  try{localStorage.setItem('fq_history',JSON.stringify(window._fqHistory));}catch(e){}
  try{dbDeleteFqQuote(q.id);}catch(e){}
  renderFqLog();
}

function showFqBookingModal(idx){
  const q=(window._fqHistory||[])[idx];if(!q) return;
  $('modal-root').innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()">
    <div class="modal" style="width:660px">
      <div style="background:var(--green);border-radius:10px;padding:16px 20px;margin-bottom:20px;display:flex;align-items:center;gap:12px">
        <span style="font-size:28px">✅</span>
        <div>
          <div style="font-size:16px;font-weight:700;color:#fff">Confirm Freight Booking</div>
          <div style="font-size:12px;color:rgba(255,255,255,.75)">${q.customer||'—'} · ${q.pickupZip} → ${q.deliveryZip} · ${q.fqMode}${q.fqEquip?' '+q.fqEquip:''}</div>
        </div>
      </div>
      <div class="g2" style="margin-bottom:16px">
        <div style="background:var(--gray-50);border-radius:var(--radius);padding:12px">
          <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--gray-400);margin-bottom:4px">Customer rate</div>
          <div style="font-size:20px;font-weight:700;color:var(--steel)">${fmtD(q.customerRate)}</div>
        </div>
        <div style="background:var(--green-bg);border-radius:var(--radius);padding:12px">
          <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--gray-400);margin-bottom:4px">Profit</div>
          <div style="font-size:20px;font-weight:700;color:var(--green)">${(p=>fmtD(p.profit)+' <span style="font-size:13px">('+pct(p.margin)+')</span> '+profitBadge(p.isActual))(getShipmentProfit(q,'freight'))}</div>
        </div>
      </div>
      <div class="alert info" style="margin-bottom:0">
        <strong>Carrier:</strong> ${q.carrier} · <strong>Carrier cost:</strong> ${fmtD(q.carrierRate)}
      </div>
      <div class="modal-foot">
        <button class="btn" onclick="closeModal()">Cancel</button>
        <button class="btn" onclick="confirmFqBooking(${idx},false)">Confirm only</button>
        <button class="btn blue" onclick="confirmFqBooking(${idx},true)">✅ Confirm + Download rate sheet</button>
      </div>
    </div></div>`;
}

async function confirmFqBooking(idx, downloadSheet){
  setTimeout(fireConfetti,400);
  showToast('🎉 Quote booked!','success',4000);
  const q=(window._fqHistory||[])[idx];if(!q) return;
  q.status='Booked';
  q.bookedDate=localDateStr();
  q.booked_by=_currentUser?.id||null;
  q.booked_by_name=_currentUser?.name||null;
  try{localStorage.setItem('fq_history',JSON.stringify(window._fqHistory));}catch(e){}
  try{await dbUpdateFqStatus(q.id,'Booked');}catch(e){console.warn('fq status save:',e.message);}
  closeModal();
  updateActiveBadge();
  if(S.fqTab==='log') renderFqLog();
  if(S.fqTab==='dash') renderFqDashboard();
  if(downloadSheet) downloadFqCarrierPDF(idx);
}

// ── Freight Carrier Rate Sheet PDF ────────────────────────────────────────
async function downloadFqCarrierPDF(idx){
  const q=(window._fqHistory||[])[idx];if(!q) return;
  if(typeof window.jspdf==='undefined'){
    try{await new Promise((res,rej)=>{const s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';s.onload=res;s.onerror=rej;document.head.appendChild(s);});}
    catch(e){alert('PDF library failed to load.');return;}
  }
  const{jsPDF}=window.jspdf;
  const doc=new jsPDF({orientation:'portrait',unit:'mm',format:'a4'});
  const W=210;const navy=[26,46,74];const green=[45,125,70];

  // ── Header ──────────────────────────────────────────────────────────────
  doc.setFillColor(...navy);doc.rect(0,0,W,32,'F');
  doc.setFillColor(59,142,208);doc.roundedRect(10,5,22,22,3,3,'F');
  const bx=10,by=5,bs=22,sc=v=>v/60*bs;
  doc.setFillColor(255,255,255);doc.triangle(bx+sc(10),by+sc(50),bx+sc(25),by+sc(14),bx+sc(44),by+sc(45),'F');
  doc.setFillColor(220,235,255);doc.triangle(bx+sc(25),by+sc(14),bx+sc(44),by+sc(45),bx+sc(53),by+sc(37),'F');
  doc.setFillColor(255,255,255);doc.triangle(bx+sc(10),by+sc(50),bx+sc(44),by+sc(45),bx+sc(53),by+sc(50),'F');
  doc.setDrawColor(59,142,208);doc.setLineWidth(.3);doc.line(bx+sc(25),by+sc(14),bx+sc(44),by+sc(50));
  doc.setTextColor(255,255,255);doc.setFont('helvetica','bold');doc.setFontSize(18);doc.text('SHIFL',36,19);
  doc.setFontSize(9);doc.setFont('helvetica','normal');doc.setTextColor(255,255,255,.65);doc.text('Freight Carrier Rate Sheet',36,26);
  // INTERNAL USE ONLY — centered
  const badgeW=54;doc.setFillColor(200,40,40);doc.roundedRect((W-badgeW)/2,9,badgeW,13,3,3,'F');
  doc.setFont('helvetica','bold');doc.setFontSize(8);doc.setTextColor(255,255,255);
  doc.text('INTERNAL USE ONLY',W/2,17,{align:'center'});

  // ── Info bar ────────────────────────────────────────────────────────────
  const bookedDate=q.bookedDate||localDateStr();
  doc.setFillColor(240,244,248);doc.rect(0,32,W,16,'F');
  doc.setFont('helvetica','bold');doc.setFontSize(9);doc.setTextColor(...navy);
  doc.text('Customer: '+q.customer,12,42);
  doc.setFont('helvetica','normal');doc.setTextColor(100,115,130);
  doc.text('Quoted: '+q.date,12,48);
  doc.setFont('helvetica','bold');doc.setTextColor(...green);
  doc.text('Booked: '+bookedDate,150,42);
  doc.setFont('helvetica','normal');doc.setTextColor(100,115,130);
  doc.text('Status: BOOKED',150,48);

  // ── Carrier section ─────────────────────────────────────────────────────
  let y=62;
  doc.setFillColor(...navy);doc.rect(12,y,W-24,8,'F');
  doc.setFont('helvetica','bold');doc.setFontSize(8);doc.setTextColor(255,255,255);
  doc.text('CARRIER',16,y+5.5);y+=16;
  doc.setFont('helvetica','bold');doc.setFontSize(18);doc.setTextColor(...navy);
  doc.text(q.carrier,16,y);y+=14;

  // Lane details
  const laneItems=[['Pickup zip',q.pickupZip],['Delivery zip',q.deliveryZip],
    ['Mode',fqTypeLabel(q)],['Weight',q.weight?Number(q.weight).toLocaleString()+' lbs':'—']];
  laneItems.forEach(([lbl,val],i)=>{
    const x=i%2===0?16:110;if(i===2) y+=12;
    doc.setFont('helvetica','bold');doc.setFontSize(7);doc.setTextColor(150,160,175);doc.text(lbl.toUpperCase(),x,y);
    doc.setFont('helvetica','normal');doc.setFontSize(10);doc.setTextColor(50,60,75);doc.text(String(val),x,y+5);
  });
  y+=18;

  // ── Rate table ──────────────────────────────────────────────────────────
  doc.setDrawColor(200,210,220);doc.setLineWidth(.3);doc.line(12,y,W-12,y);y+=8;
  doc.setFillColor(...navy);doc.rect(12,y,W-24,8,'F');
  doc.setFont('helvetica','bold');doc.setFontSize(8);doc.setTextColor(255,255,255);
  doc.text('DESCRIPTION',16,y+5.5);
  doc.text('CARRIER COST',120,y+5.5,{align:'right'});
  doc.text('CUSTOMER RATE',W-14,y+5.5,{align:'right'});
  y+=12;

  // Main freight rate row
  doc.setFillColor(248,250,252);doc.rect(12,y-4,W-24,8,'F');
  doc.setFont('helvetica','normal');doc.setFontSize(10);doc.setTextColor(55,65,80);
  doc.text(fqTypeLabel(q)+' Freight',16,y);
  doc.setFont('helvetica','normal');doc.setTextColor(140,150,165);doc.setFontSize(9);
  doc.text(fmtD(q.carrierRate),120,y,{align:'right'});
  doc.setFont('helvetica','bold');doc.setTextColor(...navy);doc.setFontSize(10);
  doc.text(fmtD(q.customerRate),W-14,y,{align:'right'});
  doc.setDrawColor(235,238,242);doc.setLineWidth(.2);doc.line(12,y+4,W-12,y+4);
  y+=14;

  // Total row
  doc.setFillColor(...navy);doc.rect(12,y-3,W-24,13,'F');
  doc.setFont('helvetica','bold');doc.setFontSize(11);doc.setTextColor(255,255,255);
  doc.text('TOTAL',16,y+5);
  doc.setFontSize(9);doc.setTextColor(255,255,255);
  doc.text(fmtD(q.carrierRate),120,y+5,{align:'right'});
  doc.setFontSize(14);doc.setTextColor(255,255,255);
  doc.text(fmtD(q.customerRate),W-14,y+5,{align:'right'});
  y+=18;

  // ── Billing summary ─────────────────────────────────────────────────────
  doc.setDrawColor(200,210,220);doc.setLineWidth(.3);doc.line(12,y,W-12,y);y+=8;
  doc.setFont('helvetica','bold');doc.setFontSize(8);doc.setTextColor(100,115,130);
  doc.text('BILLING SUMMARY',12,y);y+=8;
  const profitAmt=q.customerRate-q.carrierRate;
  const marginAmt=q.customerRate>0?profitAmt/q.customerRate:0;
  [['Customer Invoice',fmtD(q.customerRate),[0,100,160]],
   ['Carrier Cost',fmtD(q.carrierRate),[80,90,105]],
   ['Profit',fmtD(profitAmt),[...green]],
   ['Margin',pct(marginAmt),[...green]]
  ].forEach(([l,v,col])=>{
    doc.setFont('helvetica','normal');doc.setFontSize(10);doc.setTextColor(80,90,105);doc.text(l,16,y);
    doc.setFont('helvetica','bold');doc.setTextColor(...col);doc.text(v,W-14,y,{align:'right'});
    doc.setDrawColor(235,238,242);doc.setLineWidth(.2);doc.line(12,y+3,W-12,y+3);y+=9;
  });

  doc.setFontSize(8);doc.setFont('helvetica','italic');doc.setTextColor(180,185,195);
  doc.text('Confidential - do not share with carriers or customers.',12,275);
  doc.text('Generated by Shifl Trucking Quoting · '+localDateStr(),12,280);
  doc.save('Shifl_FreightCarrierSheet_'+q.carrier.replace(/\s+/g,'_')+'_'+q.pickupZip+'_'+q.date+'.pdf');
}

function showFqQuoteModal(idx){
  const q=(window._fqHistory||[])[idx];if(!q) return;
  const statusColors={Quoted:'a',Booked:'g',Lost:'gr',Cancelled:'gr','Container Returned':'b',Delivered:'b'};
  // Pre-compute conditionals to avoid nested template literals
  const carrierBtn=q.status==='Booked'
    ?'<button class="btn green" onclick="downloadFqCarrierPDF('+idx+')">📋 Carrier rate sheet</button>':'';
  const bolBtn=(q.status==='Booked'&&(q.fqMode==='FTL'||(q.fqMode==='LCL'&&q.fqEquip==='Box Truck')))
    ?'<div class="split-btn-wrap" style="position:relative;display:inline-block">'
      +'<button class="btn" onclick="showBolOptions('+idx+',\'fq\',this)">📝 BOL ▾</button>'
      +'</div>':'';
  const notesHtml=q.notes
    ?'<div style="background:var(--gray-50);border-radius:var(--radius);padding:10px 14px;margin-bottom:14px;font-size:13px;color:var(--gray-600)"><strong>Notes:</strong> '+q.notes+'</div>':'';
  $('modal-root').innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()">
    <div class="modal" style="width:720px">
      <div style="background:var(--navy);border-radius:10px;padding:16px 20px;margin-bottom:20px;display:flex;align-items:center;justify-content:space-between">
        <div style="display:flex;align-items:center;gap:12px">
          <svg width="36" height="36" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><rect width="60" height="60" rx="10" fill="rgba(255,255,255,.15)"/><polygon points="10,50 25,14 44,45" fill="white"/><polygon points="25,14 44,45 53,37" fill="rgba(255,255,255,.72)"/><polygon points="10,50 44,45 53,37 53,50" fill="rgba(255,255,255,.90)"/><line x1="25" y1="14" x2="44" y2="50" stroke="rgba(59,142,208,.5)" stroke-width="1.8"/></svg>
          <div>
            <div style="font-size:17px;font-weight:800;color:#fff">SHIFL</div>
            <div style="font-size:11px;color:rgba(255,255,255,.5)">Freight Quote · ${q.date}</div>
          </div>
        </div>
        <span class="badge ${statusColors[q.status]||'gr'}" style="font-size:13px;padding:4px 12px">${q.status}</span>
      </div>
      <div class="g3" style="margin-bottom:18px">
        <div><div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--gray-400);margin-bottom:3px">Customer</div><div style="font-weight:600;color:var(--navy)">${q.customer||'—'}</div></div>
        <div><div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--gray-400);margin-bottom:3px">Type</div><div><span class="badge ${q.fqMode==='FTL'?'b':q.fqMode==='LTL'?'p':'t'}">${q.fqMode}</span> ${q.fqEquip||''}</div></div>
        <div><div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--gray-400);margin-bottom:3px">Carrier</div><div style="font-weight:600">${q.carrier}</div></div>
        <div><div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--gray-400);margin-bottom:3px">Pickup zip</div><div style="font-weight:600">${q.pickupZip}</div></div>
        <div><div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--gray-400);margin-bottom:3px">Delivery zip</div><div style="font-weight:600">${q.deliveryZip}</div></div>
        <div><div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--gray-400);margin-bottom:3px">Weight</div><div>${q.weight?Number(q.weight).toLocaleString()+' lbs':'—'}</div></div>
      </div>
      <div style="border:1px solid var(--gray-200);border-radius:var(--radius);overflow:hidden;margin-bottom:16px">
        <table style="width:100%;font-size:13px;border-collapse:collapse">
          <thead><tr style="background:var(--gray-50)">
            <th style="padding:8px 14px;text-align:left;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--gray-500)">Description</th>
            <th style="padding:8px 14px;text-align:right;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--gray-400)">Carrier cost</th>
            <th style="padding:8px 14px;text-align:right;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--steel)">Customer rate</th>
            <th style="padding:8px 14px;text-align:right;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--green)">Profit</th>
          </tr></thead>
          <tbody>
            <tr>
              <td style="padding:12px 14px;font-weight:600">${fqTypeLabel(q)} Freight</td>
              <td style="padding:12px 14px;text-align:right;color:var(--gray-400)">${fmtD(q.carrierRate)}</td>
              <td style="padding:12px 14px;text-align:right;font-weight:800;font-size:18px;color:var(--steel)">${fmtD(q.customerRate)}</td>
              <td style="padding:12px 14px;text-align:right"><div style="color:var(--green);font-weight:700">+${fmtD(q.profit)}</div><span class="badge ${q.profitPct>=0.10?'g':'r'}">${pct(q.profitPct)}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
      ${notesHtml}
      <div class="modal-foot">
        <button class="btn" onclick="closeModal()">Close</button>
        ${carrierBtn}
        ${bolBtn}
        <button class="btn" onclick="duplicateFqQuote(${idx})">⧉ Duplicate</button>
        <button class="btn" onclick="printFqQuote(${idx})">🖨️ Print</button>
        <button class="btn blue" onclick="downloadFqPDF(${idx})">📄 Download PDF</button>
      </div>
    </div></div>`;
}

function printFqQuote(idx){
  const q=(window._fqHistory||[])[idx];if(!q) return;
  const date=new Date(q.date).toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'});
  const win=window.open('','_blank');
  win.document.write(`<!DOCTYPE html><html><head><title>Shifl Freight Quote</title>
  <style>body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:560px;margin:40px auto;font-size:14px;color:#1a2e4a}
  .header{background:#1a2e4a;padding:16px 20px;border-radius:8px;margin-bottom:24px;display:flex;align-items:center;gap:14px}
  .header h1{color:#fff;font-size:20px;font-weight:800;margin-bottom:2px}.header-sub{color:rgba(255,255,255,.55);font-size:12px}
  .meta{display:grid;grid-template-columns:1fr 1fr;gap:6px 20px;margin-bottom:22px}
  .meta-item label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#888;display:block;margin-bottom:2px}
  .meta-item span{font-size:13px;font-weight:500;color:#1a2e4a}
  .rate-box{background:#eef4fc;border:1px solid #c5d9f0;border-radius:10px;padding:18px 22px;margin-bottom:20px;display:flex;align-items:center;justify-content:space-between}
  .rate-box .lbl{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#5b8ab8;margin-bottom:4px}
  .rate-box .amt{font-size:36px;font-weight:800;color:#1a2e4a}
  .notes{background:#f9fafb;border-radius:8px;padding:12px 16px;margin-bottom:18px;font-size:12px;color:#6b7280}
  .footer{margin-top:24px;padding-top:14px;border-top:1px solid #e5e7eb;font-size:11px;color:#9ca3af}
  @media print{@page{margin:18mm}body{margin:0}}</style></head><body>
  <div class="header">
    <svg width="40" height="40" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><rect width="60" height="60" rx="10" fill="rgba(255,255,255,.12)"/><polygon points="10,50 25,14 44,45" fill="white"/><polygon points="25,14 44,45 53,37" fill="rgba(255,255,255,.7)"/><polygon points="10,50 44,45 53,37 53,50" fill="rgba(255,255,255,.88)"/><line x1="25" y1="14" x2="44" y2="50" stroke="rgba(59,142,208,.45)" stroke-width="1.8"/></svg>
    <div><h1>SHIFL</h1><div class="header-sub">Freight Quote · ${date}</div></div>
  </div>
  <div class="meta">
    <div class="meta-item"><label>Customer</label><span>${q.customer||'—'}</span></div>
    <div class="meta-item"><label>Carrier</label><span>Shifl</span></div>
    <div class="meta-item"><label>Freight type</label><span>${fqTypeLabel(q)}</span></div>
    <div class="meta-item"><label>Weight</label><span>${q.weight?Number(q.weight).toLocaleString()+' lbs':'—'}</span></div>
    <div class="meta-item"><label>Pickup zip</label><span>${q.pickupZip}</span></div>
    <div class="meta-item"><label>Delivery zip</label><span>${q.deliveryZip}</span></div>
  </div>
  <div class="rate-box">
    <div><div class="lbl">Freight Rate</div><div class="amt">${fmtD(q.customerRate)}</div></div>
  </div>
  ${q.notes?`<div class="notes"><strong>Notes:</strong> ${q.notes}</div>`:''}
  <div class="footer">Quote valid 30 days · Rates subject to change · mk@shifl.com</div>
  <script>window.onload=function(){window.print()}<\/script></body></html>`);
  win.document.close();
}

function renderFqQuoteOnDoc(doc,q,W,navy){
  const bx=10,by=5,bs=22,sc=v=>v/60*bs;
  doc.setFillColor(...navy);doc.rect(0,0,W,32,'F');
  doc.setFillColor(59,142,208);doc.roundedRect(bx,by,bs,bs,3,3,'F');
  doc.setFillColor(255,255,255);doc.triangle(bx+sc(10),by+sc(50),bx+sc(25),by+sc(14),bx+sc(44),by+sc(45),'F');
  doc.setFillColor(220,235,255);doc.triangle(bx+sc(25),by+sc(14),bx+sc(44),by+sc(45),bx+sc(53),by+sc(37),'F');
  doc.setFillColor(255,255,255);doc.triangle(bx+sc(10),by+sc(50),bx+sc(44),by+sc(45),bx+sc(53),by+sc(50),'F');
  doc.setDrawColor(59,142,208);doc.setLineWidth(.3);doc.line(bx+sc(25),by+sc(14),bx+sc(44),by+sc(50));
  doc.setTextColor(255,255,255);doc.setFont('helvetica','bold');doc.setFontSize(20);doc.text('SHIFL',36,20);
  doc.setFontSize(9);doc.setFont('helvetica','normal');doc.setTextColor(255,255,255,.6);doc.text('Freight Quote',36,27);
  doc.setFontSize(9);doc.setTextColor(255,255,255);doc.text(q.date,W-12,20,{align:'right'});
  const meta=[['Customer',q.customer||'-'],['Carrier','Shifl'],['Freight type',fqTypeLabel(q)],['Weight',q.weight?Number(q.weight).toLocaleString()+' lbs':'-'],['Pickup zip',q.pickupZip],['Delivery zip',q.deliveryZip],...(q.transitTime?[['Est. transit time',q.transitTime]]:[])];
  let y=44;
  meta.forEach(([lbl,val],i)=>{const x=i%2===0?12:110;if(i%2===0&&i>0) y+=13;doc.setFontSize(7);doc.setFont('helvetica','bold');doc.setTextColor(150,150,150);doc.text(lbl.toUpperCase(),x,y);doc.setFontSize(10);doc.setFont('helvetica','normal');doc.setTextColor(30,50,74);doc.text(String(val||'-'),x,y+5);});
  y+=20;
  doc.setFillColor(232,241,252);doc.roundedRect(12,y,W-24,28,3,3,'F');
  doc.setDrawColor(197,217,240);doc.setLineWidth(.5);doc.roundedRect(12,y,W-24,28,3,3,'S');
  doc.setFont('helvetica','bold');doc.setFontSize(8);doc.setTextColor(91,138,184);doc.text('FREIGHT RATE',16,y+10);
  doc.setFontSize(28);doc.setTextColor(...navy);doc.text(fmtD(q.customerRate),W-16,y+22,{align:'right'});
  y+=36;
  if(q.notes){doc.setFillColor(249,250,251);doc.roundedRect(12,y,W-24,14,2,2,'F');doc.setFont('helvetica','bold');doc.setFontSize(9);doc.setTextColor(80,90,105);doc.text('Notes: ',16,y+9);doc.setFont('helvetica','normal');const nl=doc.splitTextToSize(q.notes,W-50);doc.text(nl[0],36,y+9);y+=18;}
  doc.setFontSize(8);doc.setFont('helvetica','normal');doc.setTextColor(190,195,200);doc.text('Quote valid 30 days - Rates subject to change - mk@shifl.com',12,278);
}
async function downloadFqPDF(idx){
  if(!await loadJsPDF()) return;
  const q=(window._fqHistory||[])[idx];if(!q) return;
  const{jsPDF}=window.jspdf;
  const doc=new jsPDF({orientation:'portrait',unit:'mm',format:'a4'});
  const W=210;const navy=[26,46,74];
  renderFqQuoteOnDoc(doc,q,W,navy);
  doc.save('Shifl_FreightQuote_'+q.pickupZip+'_'+q.deliveryZip+'_'+q.date+'.pdf');
}

// ── Freight Carrier Rates ─────────────────────────────────────────────────
function renderFqCarriers(){
  $('page').innerHTML=''; // clear first
  const rates=window._fqRates||[];
  const modeColors={FTL:'b',LTL:'p',LCL:'t'};
  const rateRows=rates.length?rates.map(r=>`
    <tr>
      <td class="bold">${r.carrier}</td>
      <td><span class="badge ${modeColors[r.mode]||'gr'}">${r.mode}</span>${r.equipment?` <span class="badge gr">${r.equipment}</span>`:''}</td>
      <td>${r.pickupZip||'Any'} → ${r.deliveryZip||'Any'}</td>
      <td class="bold" style="color:var(--steel)">${fmtD(r.rate)} ${r.mode==='LCL'?'<span style="font-size:11px;color:var(--gray-400);font-weight:400">per pallet</span>':''}</td>
      <td class="muted small">${r.notes||'—'}</td>
      <td class="muted small">${r.date||'—'}</td>
      <td style="white-space:nowrap">
        <button class="btn sm ico-btn" onclick="editFqRate('${r.id}')" title="Edit">✏️</button>
        <button class="btn sm ico-btn" onclick="deleteFqRate('${r.id}')" title="Delete" style="margin-left:3px">🗑️</button>
      </td>
    </tr>`).join('')
  :`<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--gray-400)">No freight carrier rates yet — click + Add rate to get started</td></tr>`;

  $('page').innerHTML=`
    <div class="tbl-wrap" style="margin-bottom:20px"><table>
      <thead><tr><th>Carrier</th><th>Mode</th><th>Lane</th><th>Rate</th><th>Notes</th><th>Added</th><th></th></tr></thead>
      <tbody>${rateRows}</tbody>
    </table></div>

    <!-- Historical quotes summary -->
    ${(window._fqHistory||[]).length?`
    <div class="card" style="margin-bottom:0">
      <div class="sec-head">Historical rates from saved quotes</div>
      <div class="tbl-wrap" style="box-shadow:none;border:none"><table>
        <thead><tr><th>Carrier</th><th>Mode</th><th>Lane</th><th>Weight</th><th>Rate paid</th><th>Date</th><th>Status</th></tr></thead>
        <tbody>${(window._fqHistory||[]).map(q=>`<tr>
          <td class="bold">${q.carrier}</td>
          <td><span class="badge ${modeColors[q.fqMode]||'gr'}">${q.fqMode}</span> ${q.fqEquip||''}</td>
          <td>${q.pickupZip} → ${q.deliveryZip}</td>
          <td>${q.weight?Number(q.weight).toLocaleString()+' lbs':'—'}</td>
          <td class="bold">${fmtD(q.carrierRate)}</td>
          <td class="muted small">${q.date}${q.drayType==='export'?'<br><span class="badge" style="font-size:9px;background:#92400e;color:#fff">EXP</span>':''}${(q.containerCount||1)>1?`<br><span class="badge" style="font-size:9px;background:#f59e0b;color:#fff">×${q.containerCount}</span>`:''}</td>
          <td><span class="badge ${q.status==='Booked'?'g':q.status==='Lost'?'gr':'a'}">${q.status}</span></td>
        </tr>`).join('')}</tbody>
      </table></div>
    </div>`:''}`;
}

function buildFreightPreview(){
  const fq=S.fq;

  // LCL: use selFqRateId if set
  const lclRate=fq.mode==='LCL'&&fq.selFqRateId?(window._fqRates||[]).find(r=>r.id===fq.selFqRateId):null;
  let carrierRate=0;
  if(lclRate){
    const pCount=parseInt(fq.palletCount)||0;
    const cbmQty=parseFloat(fq.cbm)||0;
    const isCbmRate=lclRate.rateType==='perCbm';
    const base=isCbmRate?cbmQty*lclRate.rate:lclRate.rateType==='perPallet'?pCount*lclRate.rate:lclRate.rate;
    const billableHours=Math.max(0,(fq.lclDetentionHours||0)-(fq.lclFreeHours??2));
    const det=billableHours*(lclRate.detentionRate||0);
    const pe=(fq.lclPalletExchange||0)*(lclRate.palletExchangeRate||0);
    const detCu=billableHours*(fq.lclCustomerDetRate||lclRate.detentionRate||0);
    const peCu=(fq.lclPalletExchange||0)*(fq.lclCustomerPalletRate||lclRate.palletExchangeRate||0);
    carrierRate=base+det+pe;
  } else {
    const sel=fq.carriers[fq.selCarrierIdx]||{};
    carrierRate=Number(sel.rate)||0;
  }

  const carrierName=lclRate?lclRate.carrier:(fq.carriers[fq.selCarrierIdx]||{}).name||'';
  const customerRate=fqCustomerRate(carrierRate);
  const profit=customerRate-carrierRate;
  const margin=customerRate>0?profit/customerRate:0;
  const hasLane=fq.pickupZip&&fq.deliveryZip;
  const hasCarrier=carrierName&&carrierRate>0;
  if(!hasLane&&!hasCarrier) return `<div style="font-size:12px;color:var(--gray-400);text-align:center;padding:20px 0">Fill in the lane details and carrier rate to see your quote</div>`;
  const history=(window._fqHistory||[]).filter(q=>q.pickupZip===fq.pickupZip&&q.deliveryZip===fq.deliveryZip&&q.fqMode===fq.mode&&q.fqEquip===fq.equipment).slice(0,3);
  return `
    <!-- Lane summary -->
    <div style="margin-bottom:16px;padding-bottom:14px;border-bottom:1px solid var(--gray-100)">
      <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--gray-500);margin-bottom:8px">Lane</div>
      <div style="display:flex;align-items:center;justify-content:space-between">
        <div>
          <div style="font-weight:700;color:var(--navy)">${fq.pickupZip||'—'}</div>
          <div style="font-size:11px;color:var(--gray-400)">Pickup</div>
        </div>
        <div style="color:var(--gray-300);font-size:18px">→</div>
        <div style="text-align:right">
          <div style="font-weight:700;color:var(--navy)">${fq.deliveryZip||'—'}</div>
          <div style="font-size:11px;color:var(--gray-400)">Delivery</div>
        </div>
      </div>
      ${fq.weight?`<div style="margin-top:8px;font-size:12px;color:var(--gray-500)">${Number(fq.weight).toLocaleString()} lbs${fq.palletCount?' · '+fq.palletCount+' pallets':''}</div>`:''}
    </div>

    <!-- Pricing -->
    ${hasCarrier?`
    <div style="margin-bottom:14px;padding-bottom:14px;border-bottom:1px solid var(--gray-100)">
      <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--gray-500);margin-bottom:10px">Pricing — ${carrierName||'Carrier'}</div>
      <table style="width:100%;font-size:13px">
        <tr><td style="padding:5px 0;color:var(--gray-500)">Carrier rate</td><td style="text-align:right;font-weight:500">${fmtD(carrierRate)}</td></tr>
        <tr><td style="padding:5px 0;color:var(--gray-500)">Markup</td><td style="text-align:right;color:var(--gray-500)">+${fq.markupMode==='flat'?fmtD(Number(fq.markupAmount)):(fq.markupAmount+'%')}</td></tr>
        <tr style="border-top:2px solid var(--gray-200)">
          <td style="padding:10px 0;font-weight:700;font-size:15px">Customer rate</td>
          <td style="padding:10px 0;text-align:right;font-size:20px;font-weight:800;color:var(--steel)">${fmtD(customerRate)}</td>
        </tr>
        <tr><td style="padding:4px 0;color:var(--green);font-weight:600">Profit</td><td style="text-align:right;color:var(--green);font-weight:600">+${fmtD(profit)}</td></tr>
      </table>
      <div style="margin-top:8px"><span class="badge ${margin>=0.10?'g':'r'}">${pct(margin)} margin</span></div>
    </div>
    <div style="display:flex;gap:8px">
      <button type="button" onclick="showFtlLtlCompare()" style="padding:10px 18px;border-radius:8px;border:1px solid #e2e8f0;background:#fff;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit">⚖️ FTL vs LTL</button>
    <button class="btn blue" onclick="saveFqQuote()" style="flex:1;justify-content:center">💾 Save quote</button>
    </div>`
    :`<div style="font-size:12px;color:var(--gray-400);text-align:center;padding:10px 0">Enter a carrier name and rate to see pricing</div>`}

    <!-- Lane history -->
    ${history.length?`
    <div style="margin-top:16px;padding-top:14px;border-top:1px solid var(--gray-100)">
      <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--gray-500);margin-bottom:8px">Past quotes on this lane</div>
      ${history.map(q=>`<div style="display:flex;justify-content:space-between;padding:5px 0;font-size:12px;border-bottom:1px solid var(--gray-100)">
        <span style="color:var(--gray-600)">${q.carrier}</span>
        <span style="font-weight:600;color:var(--steel)">${fmtD(q.customerRate)}</span>
        <span style="color:${q.status==='Booked'?'var(--green)':'var(--gray-400)'}">${q.status}</span>
      </div>`).join('')}
    </div>`:''}`;
}

async function saveFqQuote(){
  const fq=S.fq;
  if(!fq.mode){alert('Please select a freight mode (FTL, LTL, or LCL).');return;}
  if(!fq.pickupZip||!fq.deliveryZip){alert('Please enter pickup and delivery zip codes.');return;}

  // Resolve carrier and rate depending on mode
  let carrierName='',carrierRate=0,customerRate=0;
  const lclRate=fq.mode==='LCL'&&fq.selFqRateId?(window._fqRates||[]).find(r=>r.id===fq.selFqRateId):null;

  if(lclRate){
    carrierName=lclRate.carrier||'';
    const pCount=parseInt(fq.palletCount)||0;
    const cbmQty=parseFloat(fq.cbm)||0;
    const isCbm=lclRate.rateType==='perCbm';
    const base=isCbm?cbmQty*lclRate.rate:lclRate.rateType==='perPallet'?pCount*lclRate.rate:lclRate.rate;
    const billableHours=Math.max(0,(fq.lclDetentionHours||0)-(fq.lclFreeHours??2));
    const det=billableHours*(lclRate.detentionRate||0);
    const pe=(fq.lclPalletExchange||0)*(lclRate.palletExchangeRate||0);
    const detCu=billableHours*(fq.lclCustomerDetRate||lclRate.detentionRate||0);
    const peCu=(fq.lclPalletExchange||0)*(fq.lclCustomerPalletRate||lclRate.palletExchangeRate||0);
    carrierRate=base+det+pe;
    customerRate=fqCustomerRate(carrierRate);
  } else {
    const sel=fq.carriers[fq.selCarrierIdx]||{};
    carrierName=sel.name||'';
    carrierRate=Number(sel.rate)||0;
    customerRate=fqCustomerRate(carrierRate);
  }

  if(!carrierName){alert('Please enter or select a carrier.');return;}
  if(!carrierRate){alert('Please enter a carrier rate.');return;}

  const entry={
    id:uid(),date:localDateStr(),
    customer:fq.customer||'—',customerEmail:fq.customerEmail||'',
    fqMode:fq.mode,fqEquip:fq.equipment||'',
    pickupZip:fq.pickupZip,deliveryZip:fq.deliveryZip,
    weight:fq.weight,palletCount:fq.palletCount,
    carrier:carrierName,carrierRate,customerRate,
    markupMode:fq.markupMode,markupAmount:fq.markupAmount,
    profit:customerRate-carrierRate,
    profitPct:customerRate>0?(customerRate-carrierRate)/customerRate:0,
    status:'Quoted',notes:fq.notes,transitTime:fq.transitTime||'',shiflRef:fq.shiflRef||'',
    created_by:_currentUser?.id||null,created_by_name:_currentUser?.name||null,
  };
  if(!window._fqHistory) window._fqHistory=[];
  window._fqHistory.unshift(entry);
  if(!checkMargin(entry.customerRate, entry.carrierRate, `${fq.mode} — ${fq.customer}`)) return;
  try{await dbSaveFqQuote(entry);}catch(e){console.log('Supabase fq save error:',e.message);}
  upsertCarrier(carrierName, fq.mode);
  logAction('quote_created',`${fq.mode||'Freight'} — ${fq.customer||'—'} | ${fq.pickupZip||'—'} → ${fq.deliveryZip||'—'} | $${(entry.customerRate||0).toFixed(2)}`,'fq_quote',entry.id);
  try{const existing=JSON.parse(localStorage.getItem('fq_history')||'[]');existing.unshift(entry);localStorage.setItem('fq_history',JSON.stringify(existing.slice(0,500)));}catch(e){}
  alert(`✅ Freight quote saved!\n\n${carrierName}: ${fmtD(carrierRate)}\nCustomer: ${fmtD(customerRate)}\nProfit: ${fmtD(entry.profit)} (${pct(entry.profitPct)})`);
  refreshFreightPreview();
}

// ── Freight Dashboard ──────────────────────────────────────────────────────
function renderFqDashboard(){
  const all=window._fqHistory||[];
  const booked=all.filter(q=>q.status==='Booked');
  const won=all.filter(q=>['Booked','Delivered','Invoiced','Paid'].includes(q.status));
  const countable=all.filter(q=>q.status!=='Cancelled');
  const rev=won.reduce((s,q)=>s+getShipmentProfit(q,'freight').revenue,0);
  const prof=won.reduce((s,q)=>s+getShipmentProfit(q,'freight').profit,0);
  const winRate=countable.length>0?won.length/countable.length:0;

  // Bar chart race section added below
  // Mode breakdown
  const modes=['FTL','LTL','LCL'];
  const modeStats=modes.map(m=>({
    mode:m,
    total:all.filter(q=>q.fqMode===m).length,
    booked:won.filter(q=>q.fqMode===m).length,
    revenue:won.filter(q=>q.fqMode===m).reduce((s,q)=>s+(q.customerRate||0),0),
  }));

  // Top carriers
  const cMap={};
  won.forEach(q=>{if(!cMap[q.carrier])cMap[q.carrier]={n:0,rev:0,profit:0};cMap[q.carrier].n++;cMap[q.carrier].rev+=(q.customerRate||0);cMap[q.carrier].profit+=(q.profit||0);});
  const topC=Object.entries(cMap).sort((a,b)=>b[1].n-a[1].n).slice(0,5);

  // Top customers
  const custMap={};
  won.forEach(q=>{const k=q.customer||'—';if(!custMap[k])custMap[k]={n:0,rev:0};custMap[k].n++;custMap[k].rev+=(q.customerRate||0);});
  const topCust=Object.entries(custMap).sort((a,b)=>b[1].rev-a[1].rev).slice(0,5);

  // Recent 5 quotes
  const recent=all.slice(0,5);

  $('page').innerHTML=`
    <!-- KPIs -->
    <div class="kpi-grid" style="margin-bottom:16px">
      <div class="kpi"><div class="kpi-lbl">Total quotes</div><div class="kpi-val">${all.length}</div><div style="font-size:11px;color:var(--gray-400);margin-top:4px">${booked.length} booked</div></div>
      <div class="kpi"><div class="kpi-lbl">Win rate</div><div class="kpi-val b">${all.length>0?pct(winRate):'—'}</div><div style="font-size:11px;color:var(--gray-400);margin-top:4px">of all quotes</div></div>
      <div class="kpi"><div class="kpi-lbl">Revenue</div><div class="kpi-val g">${rev>0?fmtD(rev):'—'}</div><div style="font-size:11px;color:var(--gray-400);margin-top:4px">booked + delivered</div></div>
      <div class="kpi"><div class="kpi-lbl">Profit</div><div class="kpi-val g">${prof>0?fmtD(prof):'—'}</div><div style="font-size:11px;color:${prof>0?'var(--green)':'var(--gray-400)'};margin-top:4px">${booked.length>0?'avg '+(booked.length>0?Math.round(booked.reduce((s,q)=>s+(q.profitPct||0),0)/booked.length):0)+'% margin':'—'}</div></div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;margin-bottom:14px">
      <!-- Mode breakdown -->
      <div class="card" style="margin-bottom:0">
        <div class="sec-head">By freight type</div>
        <table style="width:100%;font-size:13px">
          <thead><tr><th style="text-align:left;padding:4px 0;font-size:10px">Mode</th><th style="text-align:center">Quotes</th><th style="text-align:center">Booked</th><th style="text-align:right">Revenue</th></tr></thead>
          <tbody>${modeStats.map(m=>`<tr>
            <td style="padding:7px 0"><span class="badge ${m.mode==='FTL'?'b':m.mode==='LTL'?'p':'t'}">${m.mode}</span></td>
            <td style="text-align:center;font-weight:600">${m.total}</td>
            <td style="text-align:center"><span class="badge g">${m.booked}</span></td>
            <td style="text-align:right;color:var(--steel);font-weight:600">${m.revenue>0?fmtD(m.revenue):'—'}</td>
          </tr>`).join('')}</tbody>
        </table>
      </div>

      <!-- Top carriers -->
      <div class="card" style="margin-bottom:0">
        <div class="sec-head">Top carriers</div>
        ${topC.length?`<table style="width:100%;font-size:12px">
          <thead><tr><th style="text-align:left;padding:4px 0;font-size:10px">Carrier</th><th style="text-align:center">Loads</th><th style="text-align:right">Profit</th></tr></thead>
          <tbody>${topC.map(([c,s])=>`<tr>
            <td style="padding:6px 0;font-weight:600">${c}</td>
            <td style="text-align:center"><span class="badge b">${s.n}</span></td>
            <td style="text-align:right;color:var(--green);font-weight:600">${fmtD(s.profit)}</td>
          </tr>`).join('')}</tbody></table>`
        :`<p class="muted small" style="margin-top:8px">No completed loads yet — book and deliver loads to see carrier stats</p>`}
      </div>

      <!-- Top customers -->
      <div class="card" style="margin-bottom:0">
        <div class="sec-head">Top customers</div>
        ${topCust.length?`<table style="width:100%;font-size:12px">
          <thead><tr><th style="text-align:left;padding:4px 0;font-size:10px">Customer</th><th style="text-align:center">Loads</th><th style="text-align:right">Revenue</th></tr></thead>
          <tbody>${topCust.map(([c,s])=>`<tr>
            <td style="padding:6px 0;font-weight:600">${c}</td>
            <td style="text-align:center"><span class="badge b">${s.n}</span></td>
            <td style="text-align:right;color:var(--steel);font-weight:600">${fmtD(s.rev)}</td>
          </tr>`).join('')}</tbody></table>`
        :`<p class="muted small" style="margin-top:8px">No completed loads yet — book and deliver loads to see customer stats</p>`}
      </div>
    </div>

    <!-- Recent quotes -->
    <div class="card" style="margin-bottom:0">
      <div class="sec-head" style="display:flex;align-items:center;justify-content:space-between">
        <span>Recent freight quotes</span>
        <button class="btn sm" onclick="setFqTab('log')">View all →</button>
      </div>
      ${recent.length?`<div class="tbl-wrap" style="box-shadow:none;border:none"><table>
        <thead><tr><th>Date</th><th>Customer</th><th>Type</th><th>Lane</th><th>Carrier</th><th>Customer rate</th><th>Profit</th><th>Status</th></tr></thead>
        <tbody>${recent.map((q,i)=>`<tr>
          <td class="muted small">${q.date}${q.drayType==='export'?'<br><span class="badge" style="font-size:9px;background:#92400e;color:#fff">EXP</span>':''}${(q.containerCount||1)>1?`<br><span class="badge" style="font-size:9px;background:#f59e0b;color:#fff">×${q.containerCount}</span>`:''}</td>
          <td class="bold">${q.customer||'—'}</td>
          <td>${modeBadge(q.fqMode)}</td>
          <td>${q.pickupZip} → ${q.deliveryZip}</td>
          <td>${q.carrier}</td>
          <td class="bold" style="color:var(--steel)">${fmtD(q.customerRate)}</td>
          <td style="color:var(--green);font-weight:600">${(p=>`${p.isActual?'':'~'}+${fmtD(p.profit)}`)(getShipmentProfit(q,'freight'))}</td>
          <td><select onchange="updateFqStatus(${i},this.value)" style="font-size:11px;padding:3px 5px;width:110px">
            <option${q.status==='Quoted'?' selected':''}>Quoted</option>
            <option${q.status==='Booked'?' selected':''}>Booked</option>
            <option${q.status==='Lost'?' selected':''}>Lost</option>
            <option${q.status==='Cancelled'?' selected':''}>Cancelled</option>
          </select></td>
        </tr>`).join('')}</tbody>
      </table></div>`
      :`<div class="empty" style="padding:30px"><p>No freight quotes yet — build one on the Quote builder tab</p></div>`}
    </div>`;
}

// Load freight history on init
async function migrateLocalStorageToSupabase(){
  let migrated=0;
  // Migrate freight quotes
  try{
    const local=JSON.parse(localStorage.getItem('fq_history')||'[]');
    if(local.length){
      const{data:existing}=await db.from('fq_quotes').select('id');
      const existingIds=new Set((existing||[]).map(r=>r.id));
      const toMigrate=local.filter(q=>q.id&&!existingIds.has(q.id));
      for(const q of toMigrate){
        await db.from('fq_quotes').insert({id:q.id,date:q.date,customer:q.customer||'',data:q});
        migrated++;
      }
    }
  }catch(e){console.log('FQ migration error:',e.message);}
  // Migrate transload quotes
  try{
    const local=JSON.parse(localStorage.getItem('tl_history')||'[]');
    if(local.length){
      const{data:existing}=await db.from('tl_quotes').select('id');
      const existingIds=new Set((existing||[]).map(r=>r.id));
      const toMigrate=local.filter(q=>q.id&&!existingIds.has(q.id));
      for(const q of toMigrate){
        await db.from('tl_quotes').insert({id:q.id,date:q.date,customer:q.customer||'',data:q});
        migrated++;
      }
    }
  }catch(e){console.log('TL migration error:',e.message);}
  if(migrated>0) console.log(`Migrated ${migrated} quotes from localStorage to Supabase`);
  return migrated;
}

async function loadFqHistory(){
  // Load from localStorage immediately (fast)
  setLiquidProgress(30);
  try{window._fqHistory=JSON.parse(localStorage.getItem('fq_history')||'[]');}catch(e){window._fqHistory=[];}
  loadFqRates();
  // Sync from Supabase in background (non-blocking)
  setTimeout(async()=>{
    try{
      const fresh=await withTimeout(dbLoadFqQuotes(),8000,null);
      if(fresh){window._fqHistory=fresh;localStorage.setItem('fq_history',JSON.stringify(fresh));}
    }catch(e){console.log('fq sync:',e.message);}
  },500);
}
// ═══════════════════════════════════════════════════════
function buildCustomerRows(){
  const s=S.cSearch.toLowerCase();
  const filtered=S.customers.filter(c=>!s||(c.company+c.name+c.email+c.phone).toLowerCase().includes(s));
  if(!filtered.length) return `<div style="text-align:center;padding:40px"><div style="font-size:32px;margin-bottom:10px">👥</div><div style="font-size:14px;font-weight:600;color:#374151;margin-bottom:4px">No customers yet</div><div style="font-size:12px;color:#9ca3af;margin-bottom:14px">Add your first customer to get started</div><button class="btn blue" onclick="showAddCustomer()">+ Add customer</button></div>`;
  const avatarColors=['linear-gradient(135deg,#1e3a5f,#2563eb)','linear-gradient(135deg,#065f46,#059669)','linear-gradient(135deg,#92400e,#d97706)','linear-gradient(135deg,#6d28d9,#8b5cf6)','linear-gradient(135deg,#991b1b,#dc2626)','linear-gradient(135deg,#0c4a6e,#0284c7)'];
  return filtered.map((c,i)=>{
    const initials=(c.company||'?').split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase();
    const color=avatarColors[i%avatarColors.length];
    const ytdRev=S.quotes.filter(q=>q.customer===c.company&&(q.status==='Booked'||q.status==='Delivered')).reduce((s,q)=>s+(q.customerRates?.total||0),0);
    return `<div onclick="openCustomerDetail('${c.id}')" style="background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:10px 14px;margin-bottom:6px;display:flex;align-items:center;gap:10px;cursor:pointer;transition:box-shadow .12s" onmouseenter="this.style.boxShadow='0 2px 12px rgba(30,58,95,.1)'" onmouseleave="this.style.boxShadow='none'">
      <div style="width:36px;height:36px;border-radius:50%;background:${color};display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:#fff;flex-shrink:0">${initials}</div>
      <div style="flex:1;min-width:0">
        <div style="font-size:13px;font-weight:700;color:#1e3a5f;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${c.company||'—'}</div>
        <div style="font-size:11px;color:#6b7280;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${c.name||''}${c.email?' · '+c.email:''}</div>
      </div>
      ${ytdRev>0?`<div style="text-align:right;flex-shrink:0"><div style="font-size:13px;font-weight:700;color:#2563eb">${fmtD(ytdRev)}</div><div style="font-size:9px;color:#9ca3af">YTD revenue</div></div>`:''}
      <div onclick="event.stopPropagation()" style="display:flex;gap:4px;flex-shrink:0">
        <button class="btn sm" onclick="editCustomer('${c.id}')" style="padding:4px 8px">✏️</button>
        <button class="btn sm" onclick="deleteCustomer('${c.id}')" style="padding:4px 8px;color:#dc2626;border-color:#fca5a5">🗑️</button>
      </div>
    </div>`;
  }).join('');
}

function renderCustomers(){
  $('topbar-right').innerHTML=`
    <input type="text" id="cust-search" placeholder="Search customers…" value="${S.cSearch}"
      oninput="onCustSearch(this.value)" style="width:200px">
    <button class="btn blue" onclick="showAddCustomer()">+ Add customer</button><button class="btn" onclick="openVIPSpendAlert()">⚠️ VIP alerts</button><button class="btn" onclick="openCustomerHealthDashboard()">💚 Health</button>`;
  const custCount=S.customers.length;
  $('page').innerHTML=`
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
      <div style="font-size:13px;font-weight:600;color:#1e3a5f">${custCount} customer${custCount!==1?'s':''}</div>
    </div>
    <div id="cust-tbody">${buildCustomerRows()}</div>`;
}

function onCustSearch(v){S.cSearch=v;const t=$('cust-tbody');if(t) t.innerHTML=buildCustomerRows();}

function customerFields(c){
  return `
    <div class="g2">
      <div class="field"><label>Company name *</label><input type="text" id="f-company" value="${c?c.company:''}" placeholder="e.g. Acme Imports"></div>
      <div class="field"><label>Contact name</label><input type="text" id="f-cname" value="${c?c.name:''}" placeholder="e.g. John Smith"></div>
    </div>
    <div class="g2">
      <div class="field"><label>Email address</label><input type="text" id="f-cemail" value="${c?c.email:''}" placeholder="john@acme.com"></div>
      <div class="field"><label>Phone</label><input type="text" id="f-cphone" value="${c?c.phone:''}" placeholder="+1 (555) 000-0000"></div>
    </div>
    <div class="field"><label>Notes (optional)</label><input type="text" id="f-cnotes" value="${c?c.notes:''}" placeholder="e.g. prefers email, Net 30"></div>`;
}

function showAddCustomer(){
  $('modal-root').innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()">
    <div class="modal"><div class="modal-title">Add customer</div>
    ${customerFields(null)}
    <div class="modal-foot"><button class="btn" onclick="closeModal()">Cancel</button>
    <button class="btn blue" onclick="submitAddCustomer()">Save customer</button></div></div></div>`;
}

async function submitAddCustomer(){
  const company=($('f-company')||{}).value?.trim();
  if(!company){alert('Company name is required.');return;}
  const c={id:uid(),company,name:($('f-cname')||{}).value?.trim()||'',
    email:($('f-cemail')||{}).value?.trim()||'',phone:($('f-cphone')||{}).value?.trim()||'',
    notes:($('f-cnotes')||{}).value?.trim()||''};
  setSaving(true);
  try{await dbSaveCustomer(c);S.customers.push(c);S.customers.sort((a,b)=>(a.company||'').localeCompare(b.company||''));
    closeModal();const t=$('cust-tbody');if(t) t.innerHTML=buildCustomerRows();
  }catch(e){alert('Error: '+e.message);}finally{setSaving(false);}
}

function editCustomer(id){
  const c=S.customers.find(c=>c.id===id);if(!c) return;
  $('modal-root').innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()">
    <div class="modal"><div class="modal-title">Edit — ${c.company}</div>
    ${customerFields(c)}
    <div class="modal-foot"><button class="btn" onclick="closeModal()">Cancel</button>
    <button class="btn blue" onclick="submitEditCustomer('${id}')">Save changes</button></div></div></div>`;
}

async function submitEditCustomer(id){
  const c=S.customers.find(c=>c.id===id);if(!c) return;
  const company=($('f-company')||{}).value?.trim();if(!company){alert('Company name is required.');return;}
  Object.assign(c,{company,name:($('f-cname')||{}).value?.trim()||'',
    email:($('f-cemail')||{}).value?.trim()||'',phone:($('f-cphone')||{}).value?.trim()||'',
    notes:($('f-cnotes')||{}).value?.trim()||''});
  setSaving(true);
  try{await dbSaveCustomer(c);closeModal();const t=$('cust-tbody');if(t) t.innerHTML=buildCustomerRows();
  }catch(e){alert('Error: '+e.message);}finally{setSaving(false);}
}

async function delCustomer(id){
  if(!requireCan('delete_customers','Only Admins can delete customers.')) return;
  if(!confirm('Delete this customer?')) return;
  setSaving(true);
  try{await dbDeleteCustomer(id);S.customers=S.customers.filter(c=>c.id!==id);
    const t=$('cust-tbody');if(t) t.innerHTML=buildCustomerRows();
  }catch(e){alert('Error: '+e.message);}finally{setSaving(false);}
}
function buildLaneHistory(zip, ld){
  if(!zip) return '';
  // All past quotes for this zip regardless of mode, sorted newest first
  const past=S.quotes
    .filter(q=>q.zip===zip)
    .sort((a,b)=>new Date(b.date)-new Date(a.date))
    .slice(0,5);
  if(!past.length) return `<div style="font-size:12px;color:var(--gray-400);padding:2px 0">No previous quotes found for zip ${zip} — this would be a new lane.</div>`;

  const won=past.filter(q=>q.status==='Booked').length;
  const lost=past.filter(q=>q.status==='Lost').length;
  const avgCustomer=past.filter(q=>q.customerRates?.total>0).reduce((s,q,_,a)=>s+(q.customerRates.total/a.length),0);
  const lastWon=past.find(q=>q.status==='Booked');

  const rows=past.map(q=>{
    const statusColor={Booked:'var(--green)',Lost:'var(--gray-400)',Quoted:'var(--amber)',Expired:'var(--gray-300)'}[q.status]||'var(--gray-400)';
    return `<tr style="font-size:12px;border-bottom:1px solid var(--gray-100)">
      <td style="padding:5px 0;color:var(--gray-500)">${q.date}</td>
      <td style="padding:5px 0;font-weight:500">${q.customer}</td>
      <td style="padding:5px 0;color:var(--gray-500)">${q.carrier}</td>
      <td style="padding:5px 0;text-align:right;font-weight:600;color:var(--steel)">${fmtD(q.customerRates?.total||0)}</td>
      <td style="padding:5px 0;text-align:right"><span style="font-size:11px;font-weight:600;color:${statusColor}">${q.status}</span></td>
    </tr>`;
  }).join('');

  return `<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
    <span style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--gray-500)">Lane history — zip ${zip}</span>
    <div style="display:flex;gap:10px;font-size:12px">
      ${won>0?`<span style="color:var(--green);font-weight:600">✓ ${won} won</span>`:''}
      ${lost>0?`<span style="color:var(--gray-400)">✗ ${lost} lost</span>`:''}
      ${avgCustomer>0?`<span style="color:var(--steel);font-weight:600">Avg ${fmtD(avgCustomer)}</span>`:''}
      ${lastWon?`<span style="color:var(--green)">Last won at ${fmtD(lastWon.customerRates?.total||0)}</span>`:''}
    </div>
  </div>
  <table style="width:100%"><tbody>${rows}</tbody></table>`;
}

function addNote(text){
  const ta=$('qi-notes');
  if(ta){
    ta.value=(ta.value.trim()?ta.value.trim()+'\n':'')+text;
    S.qi.notes=ta.value;
  }
}
// ── Special ZIPs (Residential / Free Drop) ───────────────────────────────
function loadSpecialZips(){try{window._specialZips=JSON.parse(localStorage.getItem('special_zips')||'[]');}catch(e){window._specialZips=[];}}
function saveSpecialZips(){try{localStorage.setItem('special_zips',JSON.stringify(window._specialZips));}catch(e){}}
function getSpecialZip(zip){return(window._specialZips||[]).find(z=>z.zip===String(zip||'').trim());}
function getSpecialZipBadge(zip){
  const sz=getSpecialZip(zip);if(!sz||!zip) return '';
  const cfg={residential:{color:'#d97706',bg:'#fffbeb',icon:'Residential',label:'Residential delivery'},
    freeDrop:{color:'#2d7d46',bg:'#f0fdf4',icon:'Free Drop',label:'Free Drop zone'}};
  const c=cfg[sz.type]||{color:'#6b7280',bg:'#f9fafb',icon:'',label:sz.type};
  return `<div style="margin-top:5px;display:inline-flex;align-items:center;gap:5px;background:${c.bg};border:1px solid ${c.color}44;border-radius:6px;padding:3px 10px;font-size:11px;font-weight:700;color:${c.color}">${c.icon} — ${c.label}${sz.notes?' ('+sz.notes+')':''}</div>`;
}
function showManageSpecialZips(){
  const zips=window._specialZips||[];
  const rows=zips.map((z,i)=>`<tr>
    <td class="bold">${z.zip}</td>
    <td><span class="badge ${z.type==='residential'?'a':'g'}">${z.type==='residential'?'Residential':'Free Drop'}</span></td>
    <td class="muted small">${z.notes||'—'}</td>
    <td><button class="btn sm ico-btn" onclick="deleteSpecialZip(${i})">🗑️</button></td>
  </tr>`).join('');
  $('modal-root').innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()">
    <div class="modal" style="width:660px">
      <div class="modal-title">Special ZIP Codes</div>
      <p style="font-size:12px;color:var(--gray-500);margin-bottom:12px">Tag zips as Residential or Free Drop — a badge appears in the quote builder and on PDFs.</p>
      <table style="width:100%;margin-bottom:16px"><thead><tr><th style="text-align:left;font-size:10px;font-weight:700;text-transform:uppercase;color:var(--gray-400)">ZIP</th><th>Type</th><th>Notes</th><th></th></tr></thead>
      <tbody id="special-zip-rows">${rows||'<tr><td colspan="4" style="text-align:center;padding:20px;color:var(--gray-400)">No special zips yet</td></tr>'}</tbody></table>
      <div style="border-top:1px solid var(--gray-100);padding-top:14px">
        <div style="font-size:12px;font-weight:600;margin-bottom:8px">Add new</div>
        <div class="g3">
          <div class="field" style="margin-bottom:0"><label>ZIP code</label><input type="text" id="sz-zip" placeholder="07728" maxlength="10"></div>
          <div class="field" style="margin-bottom:0"><label>Type</label>
            <select id="sz-type"><option value="residential">Residential</option><option value="freeDrop">Free Drop</option></select></div>
          <div class="field" style="margin-bottom:0"><label>Notes (optional)</label><input type="text" id="sz-notes" placeholder="e.g. +$75 surcharge"></div>
        </div>
        <button class="btn blue" onclick="addSpecialZip()" style="margin-top:10px">+ Add ZIP</button>
      </div>
      <div class="modal-foot"><button class="btn" onclick="closeModal()">Done</button></div>
    </div></div>`;
}
function addSpecialZip(){
  const zip=($('sz-zip')||{}).value?.trim();
  if(!zip){alert('Enter a zip code.');return;}
  if(!window._specialZips) window._specialZips=[];
  window._specialZips.push({zip,type:($('sz-type')||{}).value||'residential',notes:($('sz-notes')||{}).value?.trim()||''});
  saveSpecialZips();
  showManageSpecialZips();
}
function deleteSpecialZip(idx){
  window._specialZips.splice(idx,1);saveSpecialZips();showManageSpecialZips();
}

// ── Custom CFS ────────────────────────────────────────────────────────────
function loadCustomCFS(){try{window._customCFS=JSON.parse(localStorage.getItem('custom_cfs')||'[]');}catch(e){window._customCFS=[];}}
function saveCustomCFS(){try{localStorage.setItem('custom_cfs',JSON.stringify(window._customCFS));}catch(e){}}
function getAllCFS(){return[...US_CFS,...(window._customCFS||[])];}
function showAddCustomCFS(){
  $('modal-root').innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()">
    <div class="modal"><div class="modal-title">Add CFS location</div>
    <div class="field"><label>CFS / Warehouse name *</label>
      <input type="text" id="cfs-name" placeholder="e.g. XYZ Warehouse"></div>
    <div class="g2">
      <div class="field"><label>City</label><input type="text" id="cfs-city" placeholder="Newark"></div>
      <div class="field"><label>State</label><input type="text" id="cfs-state" placeholder="NJ" maxlength="2"></div>
    </div>
    <div class="modal-foot"><button class="btn" onclick="closeModal()">Cancel</button>
    <button class="btn blue" onclick="submitAddCustomCFS()">Save CFS</button></div>
    </div></div>`;
}
function submitAddCustomCFS(){
  const name=($('cfs-name')||{}).value?.trim();
  const city=($('cfs-city')||{}).value?.trim();
  const state=($('cfs-state')||{}).value?.trim();
  if(!name){alert('CFS name is required.');return;}
  const entry=city&&state?`CFS — ${name}, ${city}, ${state}`:name;
  if(!window._customCFS) window._customCFS=[];
  window._customCFS.push(entry);
  saveCustomCFS();closeModal();
  alert('✅ "'+entry+'" added to your CFS list.');
}

// ── Draft Quotes ──────────────────────────────────────────────────────────
function saveDraft(type){
  try{
    if(type==='drayage') localStorage.setItem('draft_drayage',JSON.stringify({qi:S.qi,selId:S.selId}));
    if(type==='freight')  localStorage.setItem('draft_freight',JSON.stringify(S.fq));
    if(type==='transload') localStorage.setItem('draft_transload',JSON.stringify(S.tl));
    alert('✅ Draft saved! Come back anytime to resume.');
  }catch(e){alert('Could not save draft: '+e.message);}
}
function getDraft(type){
  try{const d=localStorage.getItem('draft_'+type);return d?JSON.parse(d):null;}catch(e){return null;}
}
function clearDraft(type){try{localStorage.removeItem('draft_'+type);}catch(e){}}
function resumeDraft(type){
  const d=getDraft(type);if(!d) return;
  if(type==='drayage'){S.qi={...S.qi,...d.qi};S.selId=d.selId||null;clearDraft('drayage');renderQuote();}
  if(type==='freight'){S.fq={...S.fq,...d};clearDraft('freight');renderFreight();}
  if(type==='transload'){S.tl={...defaultTlState(),...d};clearDraft('transload');renderTransload();}
}
function discardDraft(type){
  if(!confirm('Discard saved draft and start fresh?')) return;
  clearDraft(type);
  if(type==='drayage') renderQuote();
  if(type==='freight') renderFreight();
  if(type==='transload'){S.tl=defaultTlState();renderTransload();}
}
function draftBanner(type,label){
  const d=getDraft(type);if(!d) return '';
  const savedAt=d.savedAt?new Date(d.savedAt).toLocaleString():'recently';
  const preview=type==='drayage'?(d.qi?.customer?`Customer: ${d.qi.customer}`:'')
    :type==='freight'?(d.mode?`Mode: ${d.mode}`:'')
    :(d.step?`Step ${d.step}/4`:'');
  return `<div style="background:#fffbeb;border:1px solid #fbbf24;border-radius:var(--radius);padding:10px 14px;margin-bottom:14px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px">
    <div>
      <div style="font-size:12px;font-weight:700;color:#92400e">📋 You have a saved ${label} draft</div>
      ${preview?`<div style="font-size:11px;color:#a16207;margin-top:2px">${preview}</div>`:''}
    </div>
    <div style="display:flex;gap:8px">
      <button class="btn blue" onclick="resumeDraft('${type}')">Resume draft</button>
      <button class="btn" onclick="discardDraft('${type}')">Start fresh</button>
    </div>
  </div>`;
}

function onZip(v){
  S.qi.zip=v.trim();S.selId=null;
  if($('carriers-body')) refreshCarriersAndPreview();
  // Update lane history panel
  const card=$('lane-history-card');
  const body=$('lane-history-body');
  if(card) card.style.display=S.qi.zip?'':'none';
  if(body) body.innerHTML=buildLaneHistoryEnhanced(S.qi.zip,S.qi.ld)||buildLaneHistory(S.qi.zip,S.qi.ld);
}
function onLd(v){S.qi.ld=v;S.selId=null;if($('carriers-body')){refreshCarriersAndPreview();refreshPricingAndPreview();}}
function selCarrier(id){S.selId=id;refreshCarrierHighlight(id);refreshPreviewOnly();}
function setFlatRate(c,v){S.qi.flatRates[c]=v;refreshPreviewOnly();}
function setBaseMarkup(k,v){
  S.qi.baseMarkup[k]=v;
  if(k==='mode'){document.querySelectorAll('[data-bmu]').forEach(b=>b.classList.toggle('on',b.dataset.bmu===v));}
  refreshPreviewOnly();
}

async function saveQuote(){
  const qi=S.qi;const sel=S.rates.find(r=>r.id===S.selId);
  if(!qi.zip||!sel){alert('Enter a zip code and select a carrier first.');return;}
  const ct=totMode(sel,qi.ld);
  const cuRates=CHARGES.reduce((o,c)=>{o[c]=cuRate(Number(sel[c])||0,c);return o;},{});
  if(qi.gensetEnabled){cuRates.genset=Number(qi.gensetCustomerRate)||0;}
  if(qi.bobtailEnabled){cuRates.bobtail=Number(qi.bobtailCustomerRate)||0;}
  if(qi.triaxleEnabled){cuRates.triaxle=Number(qi.triaxleCustomerRate)||0;}
  const cu=Object.values(cuRates).reduce((s,v)=>s+v,0);
  const profit=cu-ct;
  setSaving(true);
  try{
    const qn=await dbGetNextQuoteNum();
    const q={id:uid(),quoteNum:qn,date:localDateStr(),
      customer:qi.customer||'—',port:qi.port,zip:qi.zip,ld:qi.ld,carrier:sel.carrier,destination:sel.destination,
      customAcc:qi.customAcc||[],
      carrierRates:{...CHARGES.reduce((o,c)=>{o[c]=sel[c]||0;return o;},{}),genset:qi.gensetEnabled&&qi.gensetScope!=='customer_only'?(Number(qi.gensetCarrierRate)||0):0,bobtail:qi.bobtailEnabled&&qi.bobtailScope!=='customer_only'?(Number(qi.bobtailCarrierRate)||0):0,triaxle:qi.triaxleEnabled&&qi.triaxleScope!=='customer_only'?(Number(qi.triaxleCarrierRate)||0):0,total:ct},
      customerRates:{...cuRates,total:cu},baseMarkup:{...qi.baseMarkup},flatRates:{...qi.flatRates},
      profit,profitPct:cu>0?profit/cu:0,status:'Quoted',notes:qi.notes||'',shiflRef:qi.shiflRef||'',
      created_by:_currentUser?.id||null,created_by_name:_currentUser?.name||null};
    await dbSaveQuote(q);
    upsertCarrier(sel.carrier,'Drayage');
    S.quotes.unshift(q);
    // Show success modal with option to post to portal
    const fromReq = S.qi&&S.qi.fromRequestId ? S.qi.fromRequestId : '';
    const fromEmail = S.qi&&S.qi.fromRequestEmail ? S.qi.fromRequestEmail : '';
    window._savedQuote = q;
    window._pReqId = fromReq;
    // Auto-post charges to portal when opened from customer request
    if(fromReq){
      var _s2=S.selId?(S.rates||[]).find(function(r){return r.id===S.selId;}):null;
      var _c2={};
      if(_s2){['base','chassis','prepull','det_port','det_cust','storage','ovw43','ovw48','bobtail','toll','genset','triaxle'].forEach(function(k){if(_s2[k]) _c2[k]=cuRate(Number(_s2[k])||0,k);});}
      var qi3=S.qi||{};
      if(qi3.gensetEnabled) _c2.genset=Number(qi3.gensetCustomerRate)||0;
      if(qi3.bobtailEnabled) _c2.bobtail=Number(qi3.bobtailCustomerRate)||0;
      if(qi3.triaxleEnabled) _c2.triaxle=Number(qi3.triaxleCustomerRate)||0;
      db.from('quote_requests').update({status:'quoted',quoted_amount:cu,quote_charges:JSON.stringify(_c2),carrier:_s2?_s2.carrier:'',quoted_at:new Date().toISOString(),negotiation_status:'pending'}).eq('id',fromReq).then(function(){});
    }
    var html = '<div style="min-width:420px">'
      + '<div class="modal-title">Quote #' + q.quoteNum + ' saved!</div>'
      + '<div class="modal-body">'
      + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px">'
      + '<div style="background:#f0fdf4;border-radius:8px;padding:12px;text-align:center"><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;color:#16a34a;margin-bottom:4px">Customer total</div><div style="font-size:22px;font-weight:800;color:#15803d">' + fmtD(cu) + '</div></div>'
      + '<div style="background:#eff6ff;border-radius:8px;padding:12px;text-align:center"><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;color:#2563eb;margin-bottom:4px">Profit</div><div style="font-size:22px;font-weight:800;color:#1d4ed8">' + fmtD(profit) + ' <span style="font-size:13px">(' + pct(q.profitPct) + ')</span></div></div>'
      + '</div>'
      + '<div style="background:#faf5ff;border:1px solid #ddd6fe;border-radius:10px;padding:14px">'
      + '<div style="font-size:12px;font-weight:700;color:#5b21b6;margin-bottom:8px">📤 Post to customer portal?</div>'
      + '<div style="font-size:11px;color:#6b7280;margin-bottom:10px">Let the customer approve, deny, or negotiate this quote directly on their portal.</div>'
      + '<div class="field" style="margin-bottom:8px"><label style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;color:#94a3b8;display:block;margin-bottom:3px">Customer email</label>'
      + '<input type="email" id="pqemail" value="' + fromEmail + '" placeholder="customer@company.com" style="width:100%;padding:7px 10px;border:1.5px solid #e2e8f0;border-radius:7px;font-size:12px">'
      + '</div>'
      + '<div class="field" style="margin-bottom:8px"><label style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;color:#94a3b8;display:block;margin-bottom:3px">Message to customer (optional)</label>'
      + '<textarea id="pqmsg" rows="2" placeholder="Rate valid 30 days. Includes chassis." style="width:100%;padding:7px 10px;border:1.5px solid #e2e8f0;border-radius:7px;font-size:12px;resize:none;font-family:inherit"></textarea>'
      + '</div>'
      + '</div>'
      + '</div>'
      + '<div class="modal-foot">'
      + '<button class="btn" onclick="closeModal()">Skip for now</button>'
      + '<button class="btn" onclick="downloadPDF();closeModal()" style="margin-left:auto">📄 PDF only</button>'
      + '<button class="btn" style="background:linear-gradient(135deg,#059669,#34d399);border-color:#059669;color:#fff;font-weight:700" onclick="doPostToPortal()">📤 Post to portal</button>'
      + '</div></div>';
    openModal(html);
  }catch(e){alert('Error saving quote: '+e.message);}finally{setSaving(false);}
}

// ═══════════════════════════════════════════════════════
// PRINT & PDF
// ═══════════════════════════════════════════════════════
function getQuoteData(){const qi=S.qi;const sel=S.rates.find(r=>r.id===S.selId);if(!qi.zip||!sel){alert('Enter a zip and select a carrier first.');return null;}return{qi,sel,cu:cuTot(sel),ct:totMode(sel,qi.ld)};}

function buildPrintHTML(customer, carrier, port, zip, destination, ld, date, quoteNum, customerRates, notes, perQuote){
  const baseAmt = customerRates?.base||0;
  const isBoth = ld==='Both';
  const liveOnly=['det_port','det_cust'];
  const dropOnly=['bobtail'];

  function makeRow(c){
    const desc=CHARGE_DESC[c]||'';
    return `<tr><td>${LABELS[c]}</td><td style="text-align:right;font-weight:700;color:#1a2e4a">${fmtD(customerRates[c])}</td><td class="desc">${desc}</td></tr>`;
  }

  let chargesHtml='';
  if(isBoth){
    const shared=CHARGES.filter(c=>c!=='base'&&!liveOnly.includes(c)&&!dropOnly.includes(c)&&(customerRates?.[c]||0)>0);
    const live=CHARGES.filter(c=>liveOnly.includes(c)&&(customerRates?.[c]||0)>0);
    const drop=CHARGES.filter(c=>dropOnly.includes(c)&&(customerRates?.[c]||0)>0);
    if(shared.length||live.length||drop.length){
      chargesHtml+=`<div class="section-title">The following charges will apply when applicable:</div>`;
      if(shared.length) chargesHtml+=`<table><tbody>${shared.map(makeRow).join('')}</tbody></table>`;
      if(live.length) chargesHtml+=`<div style="background:#eef4fc;border-radius:6px;padding:6px 10px;margin-bottom:8px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#3b6ea5">Live Move</div><table><tbody>${live.map(makeRow).join('')}</tbody></table>`;
      if(drop.length) chargesHtml+=`<div style="background:#f0f4f8;border-radius:6px;padding:6px 10px;margin-bottom:8px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#2d5a7a">Drop Move</div><table><tbody>${drop.map(makeRow).join('')}</tbody></table>`;
    }
  } else {
    const accessorials=CHARGES.filter(c=>c!=='base'&&isApplicable(c,ld)&&(customerRates?.[c]||0)>0);
    if(accessorials.length) chargesHtml=`<div class="section-title">The following charges will apply when applicable:</div><table><tbody>${accessorials.map(makeRow).join('')}</tbody></table>`;
  }
  return `<!DOCTYPE html><html><head><title>Shifl Quote${quoteNum?` #${quoteNum}`:''}</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:580px;margin:40px auto;font-size:14px;color:#1a2e4a;background:#fff}
    .header{background:#1a2e4a;padding:18px 22px;border-radius:10px;margin-bottom:26px;display:flex;align-items:center;justify-content:space-between}
    .header-left{display:flex;align-items:center;gap:14px}
    .header h1{color:#fff;font-size:22px;font-weight:800;letter-spacing:.5px;margin-bottom:2px}
    .header-sub{color:rgba(255,255,255,.5);font-size:12px}
    .header-qnum{text-align:right;color:#fff;font-size:12px;font-weight:600}
    .meta{display:grid;grid-template-columns:1fr 1fr;gap:8px 24px;margin-bottom:26px}
    .meta-item label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#9ca3af;display:block;margin-bottom:3px}
    .meta-item span{font-size:13px;font-weight:500;color:#1a2e4a}
    .base-box{background:#eef4fc;border:1px solid #c5d9f0;border-radius:10px;padding:18px 22px;margin-bottom:24px;display:flex;align-items:center;justify-content:space-between}
    .base-box .lbl{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#5b8ab8;margin-bottom:4px}
    .base-box .amt{font-size:32px;font-weight:800;color:#1a2e4a}
    .section-title{font-size:13px;font-style:italic;color:#6b7280;margin-bottom:14px;padding-top:4px;border-top:1px solid #e5e7eb}
    table{width:100%;border-collapse:collapse;margin-bottom:20px}
    td{padding:9px 0;border-bottom:1px solid #f0f2f5;font-size:13px;vertical-align:top}
    td:first-child{color:#374151;width:45%}
    td:nth-child(2){width:25%;text-align:right}
    td.desc{color:#9ca3af;font-size:11px;font-style:italic;padding-left:12px;padding-top:11px}
    .notes-box{background:#f9fafb;border-radius:8px;padding:14px 16px;margin-bottom:20px;font-size:12px;color:#6b7280;line-height:1.7}
    .footer{margin-top:24px;padding-top:14px;border-top:1px solid #e5e7eb;font-size:11px;color:#9ca3af}
    @media print{@page{margin:18mm}body{margin:0}}
  </style></head><body>
  <div class="header">
    <div class="header-left">
      <svg width="42" height="42" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><rect width="60" height="60" rx="10" fill="rgba(255,255,255,.12)"/><polygon points="10,50 25,14 44,45" fill="white"/><polygon points="25,14 44,45 53,37" fill="rgba(255,255,255,.7)"/><polygon points="10,50 44,45 53,37 53,50" fill="rgba(255,255,255,.88)"/><line x1="25" y1="14" x2="44" y2="50" stroke="rgba(59,142,208,.45)" stroke-width="1.8"/></svg>
      <div><h1>SHIFL</h1><div class="header-sub">Drayage Quote · ${date}</div></div>
    </div>
    <div class="header-qnum">${quoteNum?`Quote #${quoteNum}`:'Quote'}</div>
  </div>
  <div class="meta">
    <div class="meta-item"><label>Customer</label><span>${customer||'—'}</span></div>
    <div class="meta-item"><label>Carrier</label><span>Shifl</span></div>
    <div class="meta-item"><label>Pickup</label><span>${port||'—'}</span></div>
    <div class="meta-item"><label>Delivery Zip</label><span>${zip}</span></div>
    <div class="meta-item"><label>Destination</label><span>${destination||'—'}</span></div>
    <div class="meta-item"><label>Mode</label><span>${ld}</span></div>
  </div>
  <div class="base-box">
    <div><div class="lbl">Base Rate</div><div class="amt">${fmtD(baseAmt)}</div></div>
  </div>
  ${chargesHtml}${(perQuote&&perQuote.length)?`<div style="margin-bottom:16px"><div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#6b7280;margin-bottom:8px">Per-shipment charges</div><table style="width:100%"><tbody>${perQuote.map(r=>`<tr><td style="padding:5px 0;font-size:13px">${r.label}</td><td style="text-align:right;font-weight:700;color:#1a2e4a;font-size:13px">${fmtD(r.amount)}</td><td></td></tr>`).join('')}</tbody></table></div>`:''}
  ${notes&&notes.trim()?`<div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:14px 16px;margin-bottom:16px;font-size:12px;color:#1e3a5f;line-height:1.7">
    <strong style="color:#1d4ed8;text-transform:uppercase;letter-spacing:.04em;font-size:10px">Notes &amp; Conditions</strong><br>
    ${notes.trim().split('\n').map(l=>`· ${l}`).join('<br>')}
  </div>`:''}
  <div class="notes-box">
    <strong>Notes:</strong><br>
    · All rates are per container<br>
    · Detention: first 2 hours are free, billed in 1-hour increments after<br>
    · Chassis and storage are billed per calendar day<br>
    · Accessorial charges are only billed when the service is used
  </div>
  <div class="footer">Quote valid 30 days · Rates subject to change · mk@shifl.com</div>
  <script>window.onload=function(){window.print()}<\/script>
  </body></html>`;
}

function printQuote(){
  const d=getQuoteData();if(!d) return;const{qi,sel,cu,ct}=d;
  const date=new Date().toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'});
  const cuRates=CHARGES.reduce((o,c)=>{o[c]=cuRate(Number(sel[c])||0,c);return o;},{});
  const win=window.open('','_blank');
  win.document.write(buildPrintHTML(qi.customer,sel.carrier,qi.port,qi.zip,sel.destination,qi.ld,date,'',cuRates,qi.notes||''));
  win.document.close();
}

async function downloadPDF(){
  const d=getQuoteData();if(!d) return;const{qi,sel,cu,ct}=d;
  if(typeof window.jspdf==='undefined'){try{await new Promise((res,rej)=>{const s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';s.onload=res;s.onerror=rej;document.head.appendChild(s);});}catch(e){printQuote();return;}}
  _generatePDF({quoteNum:'—',date:localDateStr(),customer:qi.customer,port:qi.port,zip:qi.zip,destination:sel.destination,ld:qi.ld,carrier:sel.carrier,status:'Quote',notes:qi.notes||'',carrierRates:{...CHARGES.reduce((o,c)=>{o[c]=sel[c]||0;return o;},{}),total:ct},customerRates:{...CHARGES.reduce((o,c)=>{o[c]=cuRate(Number(sel[c])||0,c);return o;},{}),total:cu},profit:cu-ct,profitPct:cu>0?(cu-ct)/cu:0,
    bobtailEnabled:qi.bobtailEnabled,bobtailCustomerRate:qi.bobtailCustomerRate,
    gensetEnabled:qi.gensetEnabled,gensetCustomerRate:qi.gensetCustomerRate,
    triaxleEnabled:qi.triaxleEnabled,triaxleCustomerRate:qi.triaxleCustomerRate,
    customAcc:qi.customAcc||[]});
}

const CHARGE_DESC={
  chassis:'per day',prepull:'',
  det_port:'after 2 free hours (at port)',det_cust:'after 2 free hours (at customer)',
  storage:'per day',ovw43:'over 43,000 lb',ovw48:'over 48,000 lb',
  bobtail:'',toll:'when applicable'
};

function _generatePDF(q, existingDoc){
  const{jsPDF}=window.jspdf;const doc=existingDoc||new jsPDF({orientation:'portrait',unit:'mm',format:'a4'});
  const W=210;const navy=[26,46,74];const steel=[46,117,182];

  // ── Header band ──────────────────────────────────────
  doc.setFillColor(...navy);doc.rect(0,0,W,32,'F');
  doc.setFillColor(59,142,208);doc.roundedRect(10,5,22,22,3,3,'F');
  const bx=10,by=5,bs=22,sc=v=>v/60*bs;
  doc.setFillColor(255,255,255);doc.triangle(bx+sc(10),by+sc(50),bx+sc(25),by+sc(14),bx+sc(44),by+sc(45),'F');
  doc.setFillColor(220,235,255);doc.triangle(bx+sc(25),by+sc(14),bx+sc(44),by+sc(45),bx+sc(53),by+sc(37),'F');
  doc.setFillColor(255,255,255);doc.triangle(bx+sc(10),by+sc(50),bx+sc(44),by+sc(45),bx+sc(53),by+sc(50),'F');
  doc.setDrawColor(59,142,208);doc.setLineWidth(.3);doc.line(bx+sc(25),by+sc(14),bx+sc(44),by+sc(50));
  doc.setTextColor(255,255,255);doc.setFont('helvetica','bold');doc.setFontSize(20);doc.text('SHIFL',36,20);
  doc.setFontSize(9);doc.setFont('helvetica','normal');doc.setTextColor(255,255,255,.6);doc.text('Drayage Quote',36,27);
  doc.setFontSize(9);doc.setTextColor(255,255,255);doc.text('Quote #'+q.quoteNum+' · '+q.date,W-12,12,{align:'right'});
  if(q.shiflRef) doc.text('Ref: '+q.shiflRef,W-12,18,{align:'right'});

  // ── Lane details ──────────────────────────────────────
  const meta=[['Customer',q.customer||'—'],['Carrier','Shifl'],['Pickup',q.port||'—'],['Delivery Zip',q.zip],['Destination',q.destination||'—'],['Mode',q.ld]];
  let y=44;
  meta.forEach(([lbl,val],i)=>{
    const x=i%2===0?12:110;if(i%2===0&&i>0) y+=13;
    doc.setFontSize(7);doc.setFont('helvetica','bold');doc.setTextColor(150,150,150);doc.text(lbl.toUpperCase(),x,y);
    doc.setFontSize(10);doc.setFont('helvetica','normal');doc.setTextColor(30,50,74);doc.text(String(val),x,y+5);
  });
  y+=18;

  // ── Base rate — prominent box ─────────────────────────
  doc.setDrawColor(200,215,235);doc.setLineWidth(.3);doc.line(12,y,W-12,y);y+=8;
  doc.setFillColor(232,241,252);doc.roundedRect(12,y,W-24,22,3,3,'F');
  doc.setFont('helvetica','bold');doc.setFontSize(8);doc.setTextColor(100,130,170);
  doc.text('BASE RATE',16,y+8);
  doc.setFontSize(22);doc.setTextColor(...navy);
  doc.text(fmtD(q.customerRates?.base||0),W-16,y+16,{align:'right'});
  y+=30;

  // ── Accessorial charges section ───────────────────────
  const isBoth=q.ld==='Both';
  // For Both mode: split into shared, live-only, drop-only
  const liveOnlyCharges=['det_port','det_cust'];
  const dropOnlyCharges=['bobtail'];

  function drawChargeRows(charges){
    charges.forEach((c,i)=>{
      const cuv=q.customerRates?.[c]||0;if(!cuv) return;
      const desc=CHARGE_DESC[c]||'';
      if(i%2===0){doc.setFillColor(248,250,252);doc.rect(12,y-4,W-24,9,'F');}
      doc.setFont('helvetica','normal');doc.setFontSize(10);doc.setTextColor(55,65,81);doc.text(LABELS[c],16,y);
      doc.setFont('helvetica','bold');doc.setFontSize(10);doc.setTextColor(...navy);doc.text(fmtD(cuv),140,y,{align:'right'});
      if(desc){doc.setFont('helvetica','italic');doc.setFontSize(8);doc.setTextColor(150,158,170);doc.text(desc,145,y);}
      doc.setDrawColor(235,238,242);doc.setLineWidth(.2);doc.line(12,y+5,W-12,y+5);
      y+=9;
    });
  }

  if(isBoth){
    // Shared charges (neither live-only nor drop-only)
    const sharedCharges=CHARGES.filter(c=>c!=='base'&&!liveOnlyCharges.includes(c)&&!dropOnlyCharges.includes(c)&&(q.customerRates?.[c]||0)>0);
    const liveCharges=CHARGES.filter(c=>liveOnlyCharges.includes(c)&&(q.customerRates?.[c]||0)>0);
    const dropCharges=CHARGES.filter(c=>dropOnlyCharges.includes(c)&&(q.customerRates?.[c]||0)>0);

    if(sharedCharges.length||liveCharges.length||dropCharges.length){
      doc.setDrawColor(200,215,235);doc.setLineWidth(.3);doc.line(12,y,W-12,y);y+=8;
      doc.setFont('helvetica','italic');doc.setFontSize(9);doc.setTextColor(100,110,125);
      doc.text('The following charges will apply when applicable:',12,y);y+=10;
      drawChargeRows(sharedCharges);
    }
    if(liveCharges.length){
      y+=4;
      doc.setFillColor(232,241,252);doc.roundedRect(12,y-3,W-24,9,2,2,'F');
      doc.setFont('helvetica','bold');doc.setFontSize(8);doc.setTextColor(46,117,182);
      doc.text('LIVE MOVE',16,y+3);y+=10;
      drawChargeRows(liveCharges);
    }
    if(dropCharges.length){
      y+=4;
      doc.setFillColor(240,245,250);doc.roundedRect(12,y-3,W-24,9,2,2,'F');
      doc.setFont('helvetica','bold');doc.setFontSize(8);doc.setTextColor(46,90,130);
      doc.text('DROP MOVE',16,y+3);y+=10;
      drawChargeRows(dropCharges);
    }
  } else {
    const accessorials=CHARGES.filter(c=>c!=='base'&&isApplicable(c,q.ld)&&(q.customerRates?.[c]||0)>0);
    if(accessorials.length>0){
      doc.setDrawColor(200,215,235);doc.setLineWidth(.3);doc.line(12,y,W-12,y);y+=8;
      doc.setFont('helvetica','italic');doc.setFontSize(9);doc.setTextColor(100,110,125);
      doc.text('The following charges will apply when applicable:',12,y);y+=10;
      drawChargeRows(accessorials);
    }
  }

  // ── Custom accessorials (user-defined) ────────────────
  const customAcc=(q.customAcc||[]).filter(ca=>ca.label&&(ca.customer||0)>0);
  if(customAcc.length>0){
    const stdAccCount=(isBoth
      ? (CHARGES.filter(c=>c!=='base'&&(q.customerRates?.[c]||0)>0).length)
      : (CHARGES.filter(c=>c!=='base'&&isApplicable(c,q.ld)&&(q.customerRates?.[c]||0)>0).length));
    if(stdAccCount===0){
      doc.setDrawColor(200,215,235);doc.setLineWidth(.3);doc.line(12,y,W-12,y);y+=8;
      doc.setFont('helvetica','italic');doc.setFontSize(9);doc.setTextColor(100,110,125);
      doc.text('The following charges will apply when applicable:',12,y);y+=10;
    }
    customAcc.forEach((ca,i)=>{
      if((i+stdAccCount)%2===0){doc.setFillColor(248,250,252);doc.rect(12,y-4,W-24,9,'F');}
      doc.setFont('helvetica','normal');doc.setFontSize(10);doc.setTextColor(55,65,81);
      doc.text(ca.label,16,y);
      doc.setFont('helvetica','bold');doc.setFontSize(10);doc.setTextColor(...navy);
      doc.text(fmtD(ca.customer||0),140,y,{align:'right'});
      doc.setDrawColor(235,238,242);doc.setLineWidth(.2);doc.line(12,y+5,W-12,y+5);
      y+=9;
    });
  }

  // ── Customer notes ────────────────────────────────────
  if(q.notes&&q.notes.trim()){
    y+=8;
    const noteLines=doc.splitTextToSize(q.notes.trim(),W-32);
    const boxH=noteLines.length*5+14;
    doc.setFillColor(240,246,255);doc.roundedRect(12,y,W-24,boxH,3,3,'F');
    doc.setDrawColor(180,210,240);doc.setLineWidth(.3);doc.roundedRect(12,y,W-24,boxH,3,3,'S');
    doc.setFont('helvetica','bold');doc.setFontSize(7.5);doc.setTextColor(46,117,182);
    doc.text('NOTES & CONDITIONS',16,y+7);
    doc.setFont('helvetica','normal');doc.setFontSize(8.5);doc.setTextColor(55,70,90);
    noteLines.forEach((line,i)=>{doc.text(line,16,y+13+(i*5));});
    y+=boxH+4;
  }

  // ── Footer note ───────────────────────────────────────
  y+=6;
  doc.setDrawColor(200,215,235);doc.setLineWidth(.3);doc.line(12,y,W-12,y);y+=7;
  doc.setFont('helvetica','italic');doc.setFontSize(8);doc.setTextColor(140,150,165);
  doc.text('All rates are per container. Accessorial charges are billed only when the service is used.',12,y);y+=5;
  doc.text('Detention: first 2 hours are free. Storage and chassis are billed per calendar day.',12,y);y+=10;

  // ─── Per-shipment charges (bobtail/genset/triaxle) — customer price only ───
  const _pqc=[];
  if(q.bobtailEnabled&&q.bobtailCustomerRate>0) _pqc.push({label:'Bobtail',amount:q.bobtailCustomerRate});
  if(q.gensetEnabled&&q.gensetCustomerRate>0) _pqc.push({label:'Genset',amount:q.gensetCustomerRate});
  if(q.triaxleEnabled&&q.triaxleCustomerRate>0) _pqc.push({label:'Triaxle',amount:q.triaxleCustomerRate});
  if(_pqc.length){
    doc.setFont('helvetica','bold');doc.setFontSize(9);doc.setTextColor(107,114,128);
    doc.text('PER-SHIPMENT CHARGES',12,y);y+=7;
    _pqc.forEach(function(r,i){
      if(i%2===0){doc.setFillColor(248,250,252);doc.rect(11,y-4,W-22,8,'F');}
      doc.setFont('helvetica','normal');doc.setFontSize(10);doc.setTextColor(55,65,81);
      doc.text(r.label,15,y);
      doc.setFont('helvetica','bold');doc.setTextColor(26,46,74);
      doc.text(fmtD(r.amount),W-15,y,{align:'right'});
      y+=8;
    });
  }

  // ── Page footer ───────────────────────────────────────
  doc.setFontSize(8);doc.setFont('helvetica','normal');doc.setTextColor(190,195,200);
  doc.text('Quote valid 30 days · Rates subject to change · mk@shifl.com',12,278);
  if(!existingDoc) doc.save('Shifl_Quote_'+(q.quoteNum||'draft')+'_'+q.zip+'_'+q.date+'.pdf');
}

// ═══════════════════════════════════════════════════════
// BILL OF LADING
// ═══════════════════════════════════════════════════════
function showBolModal(idx, source){
  let q = null;
  if(source==='fq') q = (window._fqHistory||[])[idx];
  else if(source==='drayage') q = (S.quotes||[])[idx];
  else if(source==='tms') q = (JSON.parse(localStorage.getItem('tms_loads')||'[]'))[idx];
  if(!q) return;
  // Normalize fields across quote types
  if(!q.shipper && q.customer) q = {...q, shipper:q.customer};
  if(!q.originCity && q.port) q = {...q, originCity:q.port};
  if(!q.destCity && (q.destination||q.zip)) q = {...q, destCity:q.destination||q.zip};
  if(!q.commodityDesc && q.commodity) q = {...q, commodityDesc:q.commodity};
  const bolNum='BOL-'+localDateStr().replace(/-/g,'')+'-'+(idx+1).toString().padStart(3,'0');
  $('modal-root').innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()">
    <div class="modal" style="width:740px">
      <div class="modal-title">📝 Generate Bill of Lading</div>
      <div style="background:var(--blue-bg);border-radius:var(--radius);padding:12px 14px;margin-bottom:16px;font-size:12px;color:var(--gray-600)">
        <strong>Booking party:</strong> SHIFL · 343 Spook Rock Road, Suffern, NY 10901<br>
        <strong>Carrier:</strong> ${q.carrier} &nbsp;|&nbsp; <strong>Mode:</strong> ${q.fqMode} ${q.fqEquip||''} &nbsp;|&nbsp; <strong>Customer:</strong> ${q.customer||'—'}
      </div>
      <div class="g2">
        <div class="field"><label>BOL Number</label>
          <input type="text" id="bol-num" value="${bolNum}" placeholder="BOL-20260709-001"></div>
        <div class="field"><label>Shipment Date</label>
          <input type="date" id="bol-date" value="${localDateStr()}"></div>
      </div>
      <div class="charge-group-label" style="margin-bottom:10px">Pickup address (Ship From)</div>
      <div class="field"><label>Pickup company / CFS name</label>
        <input type="text" id="bol-pickup-name" value="" placeholder="e.g. CFS — STG Logistics, Carson, CA"></div>
      <div class="field"><label>Pickup street address</label>
        <input type="text" id="bol-pickup-addr" placeholder="e.g. 2401 E Dominguez St"></div>
      <div class="g3">
        <div class="field"><label>City</label>
          <input type="text" id="bol-pickup-city" placeholder="City"></div>
        <div class="field"><label>State</label>
          <input type="text" id="bol-pickup-state" placeholder="CA" maxlength="2"></div>
        <div class="field"><label>Zip</label>
          <input type="text" id="bol-pickup-zip" value="${q.pickupZip||''}" placeholder="90810" maxlength="10"></div>
      </div>
      <div class="charge-group-label" style="margin-bottom:10px">Delivery address (Ship To)</div>
      <div class="field"><label>Company / Consignee name *</label>
        <input type="text" id="bol-consignee" value="${q.customer||''}" placeholder="e.g. Acme Imports Inc."></div>
      <div class="field"><label>Street address</label>
        <input type="text" id="bol-addr" placeholder="e.g. 100 Commerce Drive"></div>
      <div class="g3">
        <div class="field"><label>City</label>
          <input type="text" id="bol-city" placeholder="City"></div>
        <div class="field"><label>State</label>
          <input type="text" id="bol-state" placeholder="NY" maxlength="2"></div>
        <div class="field"><label>Zip</label>
          <input type="text" id="bol-zip" value="${q.deliveryZip||''}" placeholder="10952" maxlength="10"></div>
      </div>
      <div class="charge-group-label" style="margin-bottom:10px">Shipment details</div>
      <div class="g2">
        <div class="field"><label>No. of pallets / units</label>
          <input type="number" id="bol-pallets" value="${q.palletCount||''}" placeholder="e.g. 20" min="0"></div>
        <div class="field"><label>Total weight (lbs)</label>
          <input type="number" id="bol-weight" value="${q.weight||''}" placeholder="e.g. 40000" min="0"></div>
      </div>
      <div class="g2">
        <div class="field"><label>Commodity / Description</label>
          <input type="text" id="bol-commodity" value="${q.notes?q.notes.split('\n')[0]:''}" placeholder="e.g. Consumer goods, General freight"></div>
        <div class="field"><label>Freight charge terms</label>
          <select id="bol-terms">
            <option value="Prepaid">Prepaid</option>
            <option value="Collect">Collect</option>
            <option value="3rd Party">3rd Party</option>
          </select></div>
      </div>
      <div class="field"><label>Special instructions (optional)</label>
        <input type="text" id="bol-instructions" placeholder="e.g. Appointment required, fragile items"></div>
      <div class="modal-foot">
        <button class="btn" onclick="closeModal()">Cancel</button>
        <button class="btn blue" onclick="downloadBOL(${idx},'${source}')">📝 Download BOL</button>
      </div>
    </div></div>`;
}

async function downloadBOL(idx, source){
  if(!await loadJsPDF()) return;
  let q = null;
  if(source==='fq') q=(window._fqHistory||[])[idx];
  else if(source==='drayage') q=(S.quotes||[])[idx];
  else if(source==='tms') q=(JSON.parse(localStorage.getItem('tms_loads')||'[]'))[idx];
  if(!q) return;

  const bolNum=($('bol-num')||{}).value?.trim()||'BOL-'+Date.now();
  const bolDate=($('bol-date')||{}).value||localDateStr();
  const pickupName=($('bol-pickup-name')||{}).value?.trim()||q.pickupZip||'—';
  const pickupAddr=($('bol-pickup-addr')||{}).value?.trim()||'';
  const pickupCity=($('bol-pickup-city')||{}).value?.trim()||'';
  const pickupState=($('bol-pickup-state')||{}).value?.trim()||'';
  const pickupZip=($('bol-pickup-zip')||{}).value?.trim()||q.pickupZip||'';
  const consignee=($('bol-consignee')||{}).value?.trim()||q.customer||'—';
  const addr=($('bol-addr')||{}).value?.trim()||'';
  const city=($('bol-city')||{}).value?.trim()||'';
  const state=($('bol-state')||{}).value?.trim()||'';
  const zip=($('bol-zip')||{}).value?.trim()||q.deliveryZip||'';
  const pallets=($('bol-pallets')||{}).value||q.palletCount||'';
  const weight=($('bol-weight')||{}).value||q.weight||'';
  const commodity=($('bol-commodity')||{}).value?.trim()||'General Freight';
  const terms=($('bol-terms')||{}).value||'Prepaid';
  const instructions=($('bol-instructions')||{}).value?.trim()||'';

  const{jsPDF}=window.jspdf;
  const doc=new jsPDF({orientation:'portrait',unit:'mm',format:'a4'});
  const W=210;const M=10;const IW=W-M*2;const navy=[26,46,74];

  function rect(x,y,w,h){doc.setDrawColor(160,175,195);doc.setLineWidth(.3);doc.rect(x,y,w,h);}
  function hline(x1,y,x2){doc.setDrawColor(160,175,195);doc.setLineWidth(.25);doc.line(x1,y,x2,y);}
  function vline(x,y1,y2){doc.setDrawColor(160,175,195);doc.setLineWidth(.25);doc.line(x,y1,x,y2);}
  function lbl(x,y,txt){doc.setFont('helvetica','bold');doc.setFontSize(6.5);doc.setTextColor(90,105,125);doc.text(txt,x,y);}
  function val(x,y,txt,size){doc.setFont('helvetica',size>9?'bold':'normal');doc.setFontSize(size||9.5);doc.setTextColor(15,25,45);doc.text(txt,x,y);}

  // ── HEADER ────────────────────────────────────────────
  doc.setFillColor(...navy);doc.rect(M,M,IW,14,'F');
  doc.setFont('helvetica','bold');doc.setFontSize(18);doc.setTextColor(255,255,255);
  doc.text('BILL OF LADING',W/2,M+9.5,{align:'center'});
  doc.setFontSize(7.5);doc.setFont('helvetica','normal');doc.setTextColor(255,255,255,.55);
  doc.text('STRAIGHT BILL - NOT NEGOTIABLE',W/2,M+13,{align:'center'});

  // BOL# and Date — top right of header area
  doc.setFillColor(240,244,250);rect(130,M,W-M-130,14);
  lbl(132,M+4,'BOL NUMBER');val(132,M+10,bolNum,8.5);
  lbl(165,M+4,'DATE');val(165,M+10,bolDate,8.5);

  let y=M+16; // start below header

  // ── BOOKING PARTY / BILL TO (always SHIFL) ────────────
  const billH=14;
  rect(M,y,IW,billH);
  lbl(M+2,y+5,'THIRD PARTY FREIGHT CHARGES — BILL TO (BOOKING PARTY)');
  hline(M,y+7,W-M);
  doc.setFont('helvetica','bold');doc.setFontSize(10);doc.setTextColor(...navy);
  doc.text('SHIFL  |  343 Spook Rock Road, Suffern, NY 10901',M+3,y+12);
  y+=billH+2;

  // ── SHIP FROM / SHIP TO ───────────────────────────────
  const rowH1=30;
  // Ship From (pickup)
  rect(M,y,95,rowH1);
  lbl(M+2,y+5,'SHIP FROM (PICKUP LOCATION)');
  hline(M,y+7,M+95);
  val(M+3,y+14,pickupName,10);
  doc.setFont('helvetica','normal');doc.setFontSize(9);doc.setTextColor(35,45,65);
  if(pickupAddr) doc.text(pickupAddr,M+3,y+20);
  const pickupCityStr=[pickupCity,pickupState,pickupZip].filter(Boolean).join(', ');
  if(pickupCityStr) doc.text(pickupCityStr,M+3,pickupAddr?y+26:y+20);
  // Ship To
  rect(M+97,y,IW-97,rowH1);
  lbl(M+99,y+5,'SHIP TO / CONSIGNEE');
  hline(M+97,y+7,W-M);
  val(M+100,y+14,consignee,10);
  doc.setFont('helvetica','normal');doc.setFontSize(9);doc.setTextColor(35,45,65);
  if(addr) doc.text(addr,M+100,y+20);
  const cityStr=[city,state,zip].filter(Boolean).join(', ');
  if(cityStr) doc.text(cityStr,M+100,addr?y+26:y+20);

  // ── CARRIER ROW ───────────────────────────────────────
  y+=rowH1+2;
  const rowH2=20;
  rect(M,y,IW,rowH2);
  lbl(M+2,y+5,'CARRIER INFORMATION');
  hline(M,y+7,W-M);
  // Carrier name
  lbl(M+3,y+13,'CARRIER NAME:');
  val(M+28,y+13,q.carrier||'—',9.5);
  // Pro No
  vline(M+110,y+7,y+rowH2);
  lbl(M+112,y+13,'PRO NO:');val(M+126,y+13,'___________________',9);
  // Mode
  lbl(M+3,y+19,'MODE / EQUIPMENT:');
  val(M+36,y+19,(q.fqMode||'')+(q.fqEquip?' — '+q.fqEquip:''),9);
  // Trailer
  lbl(M+112,y+19,'TRAILER NO:');val(M+132,y+19,'___________________',9);

  // ── FREIGHT TERMS ─────────────────────────────────────
  y+=rowH2+2;
  const rowH3=14;
  rect(M,y,IW,rowH3);
  lbl(M+2,y+5,'FREIGHT CHARGE TERMS');
  hline(M,y+7,W-M);
  const termsOpts=[{lbl:'Prepaid',x:M+5},{lbl:'Collect',x:M+45},{lbl:'3rd Party',x:M+85}];
  termsOpts.forEach(t=>{
    doc.setDrawColor(60,75,95);doc.setLineWidth(.4);doc.rect(t.x,y+8,4,4);
    if(terms===t.lbl){doc.setFont('helvetica','bold');doc.setFontSize(8);doc.setTextColor(...navy);doc.text('X',t.x+0.8,y+11.5);}
    doc.setFont('helvetica','normal');doc.setFontSize(8.5);doc.setTextColor(25,35,55);
    doc.text(t.lbl,t.x+6,y+11.5);
  });
  lbl(M+125,y+11.5,'Master BOL');
  doc.setDrawColor(60,75,95);doc.setLineWidth(.4);doc.rect(M+140,y+8,4,4);

  // ── COMMODITY TABLE ───────────────────────────────────
  y+=rowH3+2;
  // Col definitions
  const COLS=[
    {x:M,    w:16, lbl:'QTY'},
    {x:M+16, w:18, lbl:'TYPE'},
    {x:M+34, w:28, lbl:'WEIGHT (LBS)'},
    {x:M+62, w:72, lbl:'COMMODITY DESCRIPTION'},
    {x:M+134,w:24, lbl:'NMFC NO.'},
    {x:M+158,w:16, lbl:'CLASS'},
    {x:M+174,w:W-M-174,lbl:'H.M.'},
  ];
  // Header row
  doc.setFillColor(225,232,244);doc.rect(M,y,IW,9,'F');rect(M,y,IW,9);
  COLS.forEach(c=>{vline(c.x,y,y+9);lbl(c.x+1.5,y+6,c.lbl);});
  vline(W-M,y,y+9);
  // Data rows (3)
  const dataRows=[
    {qty:pallets?String(pallets):'',type:'PLT',wt:weight?Number(weight).toLocaleString():'',desc:commodity},
    {qty:'',type:'',wt:'',desc:''},
    {qty:'',type:'',wt:'',desc:''},
  ];
  dataRows.forEach((r,i)=>{
    const ry=y+9+(i*11);
    doc.setFillColor(i%2===0?255:249,i%2===0?255:251,i%2===0?255:255);
    doc.rect(M,ry,IW,11,'FD');
    COLS.forEach(c=>vline(c.x,ry,ry+11));vline(W-M,ry,ry+11);
    doc.setFont('helvetica','normal');doc.setFontSize(9.5);doc.setTextColor(15,25,45);
    if(r.qty) doc.text(r.qty,COLS[0].x+2,ry+7.5);
    if(r.type) doc.text(r.type,COLS[1].x+2,ry+7.5);
    if(r.wt) doc.text(r.wt,COLS[2].x+2,ry+7.5);
    if(r.desc){const dlines=doc.splitTextToSize(r.desc,COLS[3].w-3);doc.text(dlines[0],COLS[3].x+2,ry+7.5);}
  });
  // Totals row
  const ty=y+9+33;
  doc.setFillColor(235,240,250);doc.rect(M,ty,IW,9,'F');rect(M,ty,IW,9);
  COLS.forEach(c=>vline(c.x,ty,ty+9));vline(W-M,ty,ty+9);
  doc.setFont('helvetica','bold');doc.setFontSize(8);doc.setTextColor(40,50,70);
  doc.text('TOTALS',M+2,ty+6);
  if(pallets) doc.text(String(pallets)+' PLT',COLS[1].x+2,ty+6);
  if(weight) doc.text(Number(weight).toLocaleString()+' LBS',COLS[2].x+2,ty+6);

  // ── SPECIAL INSTRUCTIONS ──────────────────────────────
  y+=9+33+9+4;
  rect(M,y,IW,18);
  lbl(M+2,y+5,'SPECIAL INSTRUCTIONS:');
  hline(M,y+7,W-M);
  if(instructions){doc.setFont('helvetica','normal');doc.setFontSize(9);doc.setTextColor(25,35,55);doc.text(instructions,M+3,y+13);}

  // ── CERTIFICATION TEXT ────────────────────────────────
  y+=20;
  doc.setFont('helvetica','normal');doc.setFontSize(7);doc.setTextColor(70,80,95);
  const cert='RECEIVED, subject to individually determined rates or contracts agreed upon in writing between the carrier and shipper, if applicable, otherwise to the rates, classifications and rules established by the carrier and available to the shipper on request, and to all applicable state and federal regulations. Shipper certifies that the above named materials are properly classified, packaged, marked and labeled, and are in proper condition for transportation according to applicable DOT regulations.';
  const certLines=doc.splitTextToSize(cert,IW);
  doc.text(certLines,M,y);
  y+=certLines.length*3.5+4;

  // ── SIGNATURES ───────────────────────────────────────
  const sigW=(IW-4)/2;
  rect(M,y,sigW,26);
  lbl(M+2,y+5,'SHIPPER SIGNATURE & DATE');hline(M,y+7,M+sigW);
  lbl(M+3,y+15,'Signature:');hline(M+20,y+15,M+sigW-3);
  lbl(M+3,y+23,'Date:');hline(M+15,y+23,M+sigW-3);

  rect(M+sigW+4,y,sigW,26);
  lbl(M+sigW+6,y+5,'CARRIER SIGNATURE & PICKUP DATE');hline(M+sigW+4,y+7,M+sigW*2+4);
  lbl(M+sigW+6,y+15,'Signature:');hline(M+sigW+23,y+15,M+sigW*2+1);
  lbl(M+sigW+6,y+23,'Pickup Date:');hline(M+sigW+26,y+23,M+sigW*2+1);

  // Trailer loaded / Freight counted
  y+=28;
  rect(M,y,sigW,12);
  lbl(M+2,y+5,'TRAILER LOADED:');
  doc.setDrawColor(60,75,95);doc.setLineWidth(.4);
  doc.rect(M+3,y+7,3.5,3.5);lbl(M+8,y+10,'By Shipper',7.5);
  doc.rect(M+sigW/2,y+7,3.5,3.5);lbl(M+sigW/2+5,y+10,'By Driver',7.5);

  rect(M+sigW+4,y,sigW,12);
  lbl(M+sigW+6,y+5,'FREIGHT COUNTED:');
  doc.rect(M+sigW+7,y+7,3.5,3.5);lbl(M+sigW+13,y+10,'By Shipper',7.5);
  doc.rect(M+sigW+4+sigW/2,y+7,3.5,3.5);lbl(M+sigW+4+sigW/2+5,y+10,'By Driver',7.5);

  // ── FOOTER ────────────────────────────────────────────
  doc.setFont('helvetica','italic');doc.setFontSize(6.5);doc.setTextColor(150,158,170);
  doc.text('NOTE: Liability Limitation for loss or damage may apply. See 49 U.S.C. 14706(c)(1)(A) and (B).',W/2,284,{align:'center'});
  doc.text('SHIFL  |  343 Spook Rock Road, Suffern, NY 10901  |  Generated '+localDateStr(),W/2,289,{align:'center'});

  closeModal();
  doc.save('Shifl_BOL_'+bolNum+'_'+consignee.replace(/\s+/g,'_')+'.pdf');
}
// ═══════════════════════════════════════════════════════
const TL_CONTAINER_SIZES=["20' Standard","40' Standard","40' High Cube","45' High Cube","20' Reefer","40' Reefer","40' High Cube Reefer","20' Open Top","40' Open Top","20' Flat Rack","40' Flat Rack"];
const TL_ITEMS_DEF={
  unload:   {label:'Unloading',          icon:'📦',unit:'flat',      unitLabel:'per container'},
  palletize:{label:'Palletizing',        icon:'🏗️',unit:'perPallet', unitLabel:'per pallet'},
  wrap:     {label:'Stretch Wrapping',   icon:'🌀',unit:'perPallet', unitLabel:'per pallet'},
  restack:  {label:'Restacking',         icon:'📚',unit:'perPallet', unitLabel:'per pallet'},
  labeling: {label:'Relabeling',         icon:'🏷️',unit:'perPallet', unitLabel:'per pallet'},
  sorting:  {label:'Sorting/Segregating',icon:'🗂️',unit:'perPallet', unitLabel:'per pallet'},
  outbound: {label:'Outbound Loading',   icon:'🚛',unit:'flat',      unitLabel:'per load'},
  storage:  {label:'Storage',            icon:'🏭',unit:'perPalletPerDay',unitLabel:'per pallet/day',hasdays:true},
};

function defaultTlItems(){
  return{unload:{included:true,carrierCost:'',customerPrice:'',days:0},
    palletize:{included:false,carrierCost:'',customerPrice:'',days:0},
    wrap:{included:false,carrierCost:'',customerPrice:'',days:0},
    restack:{included:false,carrierCost:'',customerPrice:'',days:0},
    labeling:{included:false,carrierCost:'',customerPrice:'',days:0},
    sorting:{included:false,carrierCost:'',customerPrice:'',days:0},
    outbound:{included:false,carrierCost:'',customerPrice:'',days:0},
    storage:{included:false,carrierCost:'',customerPrice:'',days:0}};
}
function defaultTlState(){
  return{step:1,
    customer:'',customerEmail:'',customerId:null,
    drayPort:'',drayZip:'',selDrayId:null,drayLd:'Live',drayMarkupMode:'flat',drayMarkupAmount:150,
    drayFlatRates:{...DEFAULT_FLAT_RATES},
    warehouseId:null,useManual:false,
    warehouseManual:{name:'',address:'',city:'',state:'',zip:''},
    cargoType:'palletized',chargeMode:'byItem',
    tlFlatCarrier:'',tlFlatCustomer:'',
    tlItems:defaultTlItems(),palletCount:'',pieces:'',
    outDeliveryZip:'',outEquipment:'Dry Van',outMode:'FTL',
    selFtlId:null,outManualCarrier:'',outManualRate:'',outManualCustomer:'',
    outMarkupMode:'flat',outMarkupAmount:200,
    outMultiStop:false,outStops:[{zip:'',address:'',carrier:'',carrierRate:'',customerRate:''}],
    notes:'',shiflRef:''};
}

// Warehouses DB
function loadTlWarehouses(){try{window._tlWarehouses=JSON.parse(localStorage.getItem('tl_warehouses')||'[]');}catch(e){window._tlWarehouses=[];}}
async function loadTlHistory(){
  loadTlWarehouses();
  try{
    window._tlHistory=await dbLoadTlQuotes();
    localStorage.setItem('tl_history',JSON.stringify(window._tlHistory));
  }catch(e){
    console.log('Supabase tl load failed, using localStorage:',e.message);
    setLiquidProgress(60);
  try{window._tlHistory=JSON.parse(localStorage.getItem('tl_history')||'[]');}catch(e2){window._tlHistory=[];}
  }
}
function saveTlWarehouses(){try{localStorage.setItem('tl_warehouses',JSON.stringify(window._tlWarehouses));}catch(e){}}

function tlCuRate(carrierVal, charge, tl){
  if(charge==='base'){
    const cr=Number(carrierVal)||0;
    return tl.drayMarkupMode==='pct'?cr*(1+tl.drayMarkupAmount/100):cr+Number(tl.drayMarkupAmount);
  }
  return Number(tl.drayFlatRates[charge])||0;
}
function tlSetFlatRate(c,v){S.tl.drayFlatRates[c]=v;refreshTlDrayPreview();}
function tlSetBaseMarkup(k,v){S.tl['drayMarkup'+k.charAt(0).toUpperCase()+k.slice(1)]=v;refreshTlDrayPreview();}
function refreshTlDrayPreview(){const el=$('tl-step1-preview');if(el) el.innerHTML=buildTlStep1Preview(S.tl);}

function buildTlDrayPricing(tl, sel){
  if(!sel) return '';
  const ld=tl.drayLd;
  const bm={mode:tl.drayMarkupMode,amount:tl.drayMarkupAmount};
  const fr=tl.drayFlatRates;
  const extraRows=CHARGES.filter(c=>c!=='base'&&isApplicable(c,ld)).map(c=>{
    const note=c==='det_port'?'Per hour at port':c==='det_cust'?'Per hour at customer':
      c==='ovw43'?'Over 43,000 lb':c==='ovw48'?'Over 48,000 lb':
      c==='toll'?'Only if applicable':c==='bobtail'?'Drop moves':'';
    const carrierVal=Number(sel[c])||0;
    return `<tr>
      <td style="color:var(--gray-600);font-weight:500;padding:5px 0;width:140px">${LABELS[c]}${note?`<div class="cond-note">${note}</div>`:''}</td>
      <td style="padding:5px 0;color:var(--gray-400);font-size:12px;width:80px">${carrierVal>0?fmtD(carrierVal):'—'}</td>
      <td style="padding:5px 0"><div style="display:flex;align-items:center;gap:5px"><span style="color:var(--gray-400)">$</span>
        <input type="number" value="${fr[c]||0}" min="0" oninput="tlSetFlatRate('${c}',+this.value)" style="width:85px;padding:5px 8px;font-size:13px"></div></td>
    </tr>`;
  }).join('');
  return `<div class="card">
    <div class="sec-head">Drayage pricing</div>
    <div style="margin-bottom:14px;padding-bottom:14px;border-bottom:1px solid var(--gray-100)">
      <p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--gray-500);margin-bottom:8px">Base markup</p>
      <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
        <div class="toggle-group">
          <button class="tgl${bm.mode==='flat'?' on':''}" onclick="S.tl.drayMarkupMode='flat';refreshTlDrayPreview()">Flat $</button>
          <button class="tgl${bm.mode==='pct'?' on':''}"  onclick="S.tl.drayMarkupMode='pct';refreshTlDrayPreview()">%</button>
        </div>
        <input type="number" value="${bm.amount}" min="0" oninput="S.tl.drayMarkupAmount=+this.value;refreshTlDrayPreview()" style="width:90px;padding:5px 8px;font-size:13px">
        <span class="muted small">${bm.mode==='flat'?'added over carrier base':'% over carrier base'}</span>
      </div>
    </div>
    <p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--gray-500);margin-bottom:2px">Accessorial charges</p>
    <p class="cond-note" style="margin-bottom:8px;font-size:11px">Carrier cost shown · Enter full customer charge · ${ld==='Live'?'Live mode':ld==='Drop'?'Drop mode':'All charges'}</p>
    <table style="width:100%">
      <thead><tr><th style="text-align:left;font-size:10px;font-weight:700;text-transform:uppercase;color:var(--gray-400);padding-bottom:6px;width:140px">Charge</th>
        <th style="text-align:left;font-size:10px;font-weight:700;text-transform:uppercase;color:var(--gray-400);padding-bottom:6px;width:80px">Carrier</th>
        <th style="text-align:left;font-size:10px;font-weight:700;text-transform:uppercase;color:var(--steel);padding-bottom:6px">Customer</th></tr></thead>
      <tbody>${extraRows}</tbody>
    </table>
  </div>`;
}
function setTlTab(t){
  S.tlTab=t;
  document.querySelectorAll('.nav-sub,.sub-link').forEach(b=>b.classList.remove('active'));
  const el=$('tlnav-'+t);if(el) el.classList.add('active');
  openAccFor('transload');updateSubActive('transload',t);
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active'));
  const nt=$('nav-transload');if(nt) nt.classList.add('active');
  renderTransload();
}
function renderTransload(){
  const tab=S.tlTab||'builder';
  const topBtns={builder:`<button class="btn" onclick="saveDraft('transload')">📋 Save draft</button><button class="btn blue" onclick="S.tl=defaultTlState();clearDraft('transload');renderTransload()">+ New quote</button>`,
    warehouses:'<button class="btn blue" onclick="showAddTlWarehouse()">+ Add warehouse</button>',
    log:'',dash:''};
  $('topbar-right').innerHTML=topBtns[tab]||'';
  if(tab==='log')        return renderTlLog();
  if(tab==='warehouses') return renderTlWarehouses();
  if(tab==='dash')       return renderTlDashboard();
  renderTlBuilder();
}

// ── Totals calculator ─────────────────────────────────────────────────────
function calcTlTotals(tl){
  const sel=S.rates.find(r=>r.id===tl.selDrayId);
  let drayCarrier=0,drayCustomer=0;
  if(sel){
    drayCarrier=CHARGES.filter(c=>isApplicable(c,tl.drayLd)).reduce((s,c)=>s+(Number(sel[c])||0),0);
    drayCustomer=CHARGES.filter(c=>isApplicable(c,tl.drayLd)).reduce((s,c)=>s+tlCuRate(Number(sel[c])||0,c,tl),0);
  }
  let tlCarrier=0,tlCustomer=0;
  if(tl.chargeMode==='flat'){
    tlCarrier=parseFloat(tl.tlFlatCarrier)||0;
    tlCustomer=parseFloat(tl.tlFlatCustomer)||0;
  } else {
    const pCount=parseInt(tl.palletCount)||1;
    Object.entries(tl.tlItems).forEach(([k,item])=>{
      if(!item.included) return;
      const def=TL_ITEMS_DEF[k];
      let qty=1;
      if(def.unit==='perPallet') qty=pCount;
      if(def.unit==='perPalletPerDay') qty=pCount*(parseInt(item.days)||0);
      tlCarrier+=(parseFloat(item.carrierCost)||0)*qty;
      tlCustomer+=(parseFloat(item.customerPrice)||0)*qty;
    });
  }
  const ftlRate=window._fqRates?.find(r=>r.id===tl.selFtlId);
  let outCarrier=0,outCustomer=0;
  if(tl.outMultiStop&&tl.outMode==='LTL'&&tl.outStops?.length){
    // Each LTL stop has its own carrier cost + customer rate
    tl.outStops.forEach(s=>{outCarrier+=parseFloat(s.carrierRate)||0;outCustomer+=parseFloat(s.customerRate)||0;});
  } else if(ftlRate){
    outCarrier=ftlRate.rate;
    outCustomer=tl.outMarkupMode==='pct'?outCarrier*(1+tl.outMarkupAmount/100):outCarrier+Number(tl.outMarkupAmount);
  } else if(tl.outManualRate){
    outCarrier=parseFloat(tl.outManualRate)||0;
    outCustomer=parseFloat(tl.outManualCustomer)||outCarrier+Number(tl.outMarkupAmount);
  }
  const totalCarrier=drayCarrier+tlCarrier+outCarrier;
  const totalCustomer=drayCustomer+tlCustomer+outCustomer;
  const totalProfit=totalCustomer-totalCarrier;
  const margin=totalCustomer>0?totalProfit/totalCustomer:0;
  return{drayCarrier,drayCustomer,drayProfit:drayCustomer-drayCarrier,
    tlCarrier,tlCustomer,tlProfit:tlCustomer-tlCarrier,
    outCarrier,outCustomer,outProfit:outCustomer-outCarrier,
    totalCarrier,totalCustomer,totalProfit,margin};
}

// ── Step stepper UI ───────────────────────────────────────────────────────
function buildTlStepper(step){
  const steps=[{n:1,label:'Inbound\nDrayage'},{n:2,label:'Transload\nServices'},{n:3,label:'Outbound\nFTL'},{n:4,label:'Review\n& Save'}];
  const skipped=S.tl._skipped||{};
  return `<div class="tl-stepper">${steps.map((s,i)=>{
    const isDone=step>s.n&&!skipped[s.n];
    const isSkipped=skipped[s.n];
    const cls=isDone?'done':isSkipped?'skipped':step===s.n?'active':'';
    const clickable=`onclick="S.tl.step=${s.n};renderTlBuilder()"`;
    return `<div class="tl-step ${cls}" ${clickable} style="cursor:pointer">
      ${i<steps.length-1?'<div class="tl-step-line"></div>':''}
      <div class="tl-step-num">${isDone?'✓':isSkipped?'—':s.n}</div>
      <div class="tl-step-label">${s.label.replace('\n','<br>')}</div>
    </div>`;
  }).join('')}</div>`;
}

// ── Quote Builder ─────────────────────────────────────────────────────────
function renderTlBuilder(){
  const tl=S.tl;
  $('page').innerHTML=`<div id="tl-builder-inner">${draftBanner('transload','transload')}${buildTlStepHTML(tl)}</div>`;
}
function buildTlStepHTML(tl){
  const stepper=buildTlStepper(tl.step);
  let content='';
  if(tl.step===1) content=buildTlStep1(tl);
  else if(tl.step===2) content=buildTlStep2(tl);
  else if(tl.step===3) content=buildTlStep3(tl);
  else content=buildTlStep4(tl);
  return stepper+content;
}

// ── STEP 1: Inbound Drayage ───────────────────────────────────────────────
function buildTlStep1(tl){
  // Find matching drayage carriers
  const matches=S.rates.filter(r=>r.active&&r.zip===tl.drayZip&&(r.ld===tl.drayLd||r.ld==='Both')).sort((a,b)=>totMode(a,tl.drayLd)-totMode(b,tl.drayLd));
  const sel=S.rates.find(r=>r.id===tl.selDrayId);
  const carrierCards=matches.map(r=>{
    const isSelected=tl.selDrayId===r.id;
    const ct=totMode(r,tl.drayLd);
    return `<div onclick="S.tl.selDrayId='${r.id}';refreshTlStep1()" style="cursor:pointer;border:2px solid ${isSelected?'var(--steel)':'var(--gray-200)'};background:${isSelected?'var(--blue-bg)':'var(--white)'};border-radius:var(--radius);padding:12px 14px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center">
      <div>
        <div style="font-weight:700;color:var(--navy)">${r.carrier}</div>
        <div style="font-size:12px;color:var(--gray-500)">${r.destination||r.zip} · ${r.ld}</div>
      </div>
      <div style="text-align:right">
        <div style="font-size:18px;font-weight:800;color:var(--steel)">${fmtD(ct)}</div>
        <div style="font-size:11px;color:var(--gray-400)">carrier cost</div>
      </div>
    </div>`;
  }).join('');

  return `<div class="two-col">
    <div>
      <div class="card">
        <div class="sec-head">Customer</div>
        <div class="field">
          <input type="text" value="${tl.customer}" oninput="S.tl.customer=this.value"
            list="tl-cust-dl" placeholder="Type or pick from contact book" autocomplete="off">
          <datalist id="tl-cust-dl">${S.customers.map(c=>`<option value="${c.company||c.name}">`).join('')}</datalist>
        </div>
      </div>
      <div class="card">
        <div class="sec-head">🚢 Inbound drayage details</div>
        <div class="field"><label>Origin port / CFS</label>
          <input type="text" value="${tl.drayPort}" oninput="S.tl.drayPort=this.value" list="tl1-port-dl" placeholder="e.g. Port of Los Angeles, CA">
          <datalist id="tl1-port-dl">${US_PORTS.map(p=>`<option value="${p}">`).join('')}${getAllCFS().map(c=>`<option value="${c}">`).join('')}</datalist>
        </div>
        <div class="g2">
          <div class="field"><label>Delivery zip <span style="font-weight:400;color:var(--gray-400)">(warehouse area)</span></label>
            <input type="text" value="${tl.drayZip}" oninput="S.tl.drayZip=this.value" onblur="refreshTlStep1()" placeholder="e.g. 90248" maxlength="10"></div>
          <div class="field"><label>Move type</label>
            <div class="toggle-group" style="margin-top:4px">
              <button class="tgl${tl.drayLd==='Live'?' on':''}" onclick="S.tl.drayLd='Live';refreshTlStep1()">Live</button>
              <button class="tgl${tl.drayLd==='Drop'?' on':''}" onclick="S.tl.drayLd='Drop';refreshTlStep1()">Drop</button>
            </div>
          </div>
        </div>
      </div>
      ${tl.drayZip?`<div class="card">
        <div class="sec-head">Select drayage carrier <span style="font-weight:400;font-size:11px;color:${matches.length?'var(--green)':'var(--amber)'}">${matches.length?'✓ '+matches.length+' on file':'No carriers on file for this zip'}</span></div>
        ${carrierCards}
        ${!matches.length||!tl.selDrayId?`<div class="field" style="margin-top:${matches.length?'12':'0'}px"><label>${matches.length?'Or enter manually:':'Carrier name'}</label>
          <input type="text" value="${tl.drayManualCarrier||''}" oninput="S.tl.drayManualCarrier=this.value" placeholder="Enter carrier name"></div>`:''}
      </div>`:''}
      ${sel?buildTlDrayPricing(tl,sel):''}
    </div>
    <!-- Preview -->
    <div class="sticky-top">
      <div class="card" id="tl-step1-preview">
        ${buildTlStep1Preview(tl)}
      </div>
    </div>
  </div>
  <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:16px">
    <button class="btn" onclick="if(!S.tl._skipped)S.tl._skipped={};S.tl._skipped[1]=true;S.tl.step=2;renderTlBuilder()" style="color:var(--gray-500)">Skip inbound dray</button>
    <button class="btn blue" onclick="tlNext(1)">Next: Transload Services →</button>
  </div>`;
}
function refreshTlStep1(){
  const el=$('tl-step1-preview');if(el) el.innerHTML=buildTlStep1Preview(S.tl);
  // Re-render if dray zip/ld changed to update carrier list
  const b=$('tl-builder-inner');if(b) b.innerHTML=buildTlStepHTML(S.tl);
}
function buildTlStep1Preview(tl){
  const sel=S.rates.find(r=>r.id===tl.selDrayId);
  if(!sel&&!tl.drayPort) return `<div style="font-size:12px;color:var(--gray-400);padding:12px 0">Enter port and zip to see drayage quote</div>`;
  if(!sel) return `<div style="font-size:12px;color:var(--gray-500)">📍 ${tl.drayPort||'—'} → ${tl.drayZip||'—'}<br><span style="color:var(--gray-400)">Select a carrier to see pricing</span></div>`;
  const ld=tl.drayLd;
  const charges=CHARGES.filter(c=>isApplicable(c,ld)).map(c=>{
    const cv=Number(sel[c])||0;
    const cuv=tlCuRate(cv,c,tl);
    if(!cuv&&!cv) return '';
    return `<tr style="border-bottom:1px solid var(--gray-100)">
      <td style="padding:4px 0;font-size:12px;color:var(--gray-600)">${LABELS[c]}</td>
      <td style="padding:4px 0;font-size:12px;text-align:right;color:var(--gray-400)">${cv>0?fmtD(cv):'—'}</td>
      <td style="padding:4px 0;font-size:12px;text-align:right;font-weight:600;color:var(--navy)">${cuv>0?fmtD(cuv):'—'}</td>
    </tr>`;
  }).join('');
  const totalCarrier=CHARGES.filter(c=>isApplicable(c,ld)).reduce((s,c)=>s+(Number(sel[c])||0),0);
  const totalCustomer=CHARGES.filter(c=>isApplicable(c,ld)).reduce((s,c)=>s+tlCuRate(Number(sel[c])||0,c,tl),0);
  return `<div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#3b6ea5;margin-bottom:8px">🚢 Inbound Drayage Preview</div>
  <div style="font-size:13px;font-weight:600;color:var(--navy);margin-bottom:2px">${sel.carrier}</div>
  <div style="font-size:12px;color:var(--gray-500);margin-bottom:10px">${tl.drayPort||'—'} → ${tl.drayZip} (${ld})</div>
  <table style="width:100%;margin-bottom:8px">
    <thead><tr>
      <th style="text-align:left;font-size:10px;color:var(--gray-400);padding-bottom:4px">Charge</th>
      <th style="text-align:right;font-size:10px;color:var(--gray-400);padding-bottom:4px">Carrier</th>
      <th style="text-align:right;font-size:10px;color:var(--steel);padding-bottom:4px">Customer</th>
    </tr></thead>
    <tbody>${charges}</tbody>
    <tfoot><tr style="border-top:2px solid var(--gray-200)">
      <td style="padding:7px 0;font-weight:700">Total</td>
      <td style="padding:7px 0;text-align:right;font-weight:600;color:var(--gray-500)">${fmtD(totalCarrier)}</td>
      <td style="padding:7px 0;text-align:right;font-weight:800;font-size:15px;color:var(--steel)">${fmtD(totalCustomer)}</td>
    </tfoot>
  </table>
  <div style="display:flex;align-items:center;gap:8px">
    <span style="color:var(--green);font-weight:600;font-size:13px">Profit: +${fmtD(totalCustomer-totalCarrier)}</span>
    <span class="badge ${totalCarrier>0&&(totalCustomer-totalCarrier)/totalCustomer>=0.10?'g':'r'}">${totalCarrier>0?pct((totalCustomer-totalCarrier)/totalCustomer):'—'}</span>
  </div>`;
}

// ── STEP 2: Transload Services ────────────────────────────────────────────
function buildTlStep2(tl){
  const warehouses=window._tlWarehouses||[];
  const nearbyWH=warehouses; // could filter by zip proximity
  const activeWH=tl.warehouseId?warehouses.find(w=>w.id===tl.warehouseId):null;
  const pCount=parseInt(tl.palletCount)||0;

  const whCards=nearbyWH.map(w=>`
    <div onclick="S.tl.warehouseId='${w.id}';S.tl.useManual=false;renderTlBuilder()" style="cursor:pointer;border:2px solid ${tl.warehouseId===w.id?'var(--steel)':'var(--gray-200)'};background:${tl.warehouseId===w.id?'var(--blue-bg)':'var(--white)'};border-radius:var(--radius);padding:12px 14px;margin-bottom:8px">
      <div style="font-weight:700;color:var(--navy)">${w.name}</div>
      <div style="font-size:12px;color:var(--gray-500)">${w.address}, ${w.city}, ${w.state} ${w.zip}</div>
    </div>`).join('');

  const itemRows=Object.entries(TL_ITEMS_DEF).map(([k,def])=>{
    const item=tl.tlItems[k];
    const pricedQty=def.unit==='perPallet'?pCount:def.unit==='perPalletPerDay'?pCount*(parseInt(item.days)||0):1;
    return `<div style="padding:10px 0;border-bottom:1px solid var(--gray-100)">
      <label style="display:flex;align-items:center;gap:10px;cursor:pointer;margin-bottom:${item.included?'10':'0'}px">
        <input type="checkbox" ${item.included?'checked':''} onchange="S.tl.tlItems['${k}'].included=this.checked;renderTlBuilder()" style="width:auto">
        <span style="font-size:13px;font-weight:600">${def.icon} ${def.label}</span>
        <span style="font-size:11px;color:var(--gray-400)">${def.unitLabel}</span>
      </label>
      ${item.included?`<div class="charge-row">
        <div style="font-size:12px;color:var(--gray-500)">
          ${def.hasdays?`<div style="display:flex;align-items:center;gap:6px"><input type="number" value="${item.days||0}" min="0" oninput="S.tl.tlItems['${k}'].days=+this.value" style="width:60px;padding:4px 6px;font-size:12px"> days</div>`:''}
        </div>
        <div>
          <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;color:var(--gray-400);margin-bottom:3px">Warehouse cost</div>
          <div style="display:flex;align-items:center;gap:4px">
            <span style="color:var(--gray-400);font-size:13px">$</span>
            <input type="number" value="${item.carrierCost}" min="0" oninput="S.tl.tlItems['${k}'].carrierCost=this.value" style="width:100px;padding:5px 8px;font-size:13px">
            <span style="font-size:11px;color:var(--gray-400)">${def.unit!=='flat'&&pCount>0?'× '+pricedQty:'flat'}</span>
          </div>
        </div>
        <div>
          <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;color:var(--steel);margin-bottom:3px">Customer price</div>
          <div style="display:flex;align-items:center;gap:4px">
            <span style="color:var(--gray-400);font-size:13px">$</span>
            <input type="number" value="${item.customerPrice}" min="0" oninput="S.tl.tlItems['${k}'].customerPrice=this.value" style="width:100px;padding:5px 8px;font-size:13px;border-color:var(--steel)">
            <span style="font-size:11px;color:var(--gray-400)">${def.unit!=='flat'&&pCount>0?'× '+pricedQty:'flat'}</span>
          </div>
        </div>
      </div>`:''}
    </div>`;
  }).join('');

  return `<div class="two-col">
    <div>
      <!-- Warehouse -->
      <div class="card">
        <div class="sec-head">🏭 Transload warehouse</div>
        ${whCards}
        <button class="btn sm" onclick="S.tl.useManual=!S.tl.useManual;S.tl.warehouseId=null;renderTlBuilder()" style="margin-bottom:${tl.useManual?'12':'0'}px">
          ${tl.useManual?'← Select from list':'+ Enter warehouse manually / Add new'}
        </button>
        ${tl.useManual?`<div class="g2">
          <div class="field"><label>Warehouse name *</label>
            <input type="text" value="${tl.warehouseManual.name}" oninput="S.tl.warehouseManual.name=this.value" placeholder="e.g. XYZ Logistics"></div>
          <div class="field"><label>Zip code *</label>
            <input type="text" value="${tl.warehouseManual.zip}" oninput="S.tl.warehouseManual.zip=this.value" placeholder="e.g. 90248" maxlength="10"></div>
        </div>
        <div class="field"><label>Address</label>
          <input type="text" value="${tl.warehouseManual.address}" oninput="S.tl.warehouseManual.address=this.value" placeholder="Street address"></div>
        <div class="g2">
          <div class="field"><label>City</label>
            <input type="text" value="${tl.warehouseManual.city}" oninput="S.tl.warehouseManual.city=this.value" placeholder="City"></div>
          <div class="field"><label>State</label>
            <input type="text" value="${tl.warehouseManual.state}" oninput="S.tl.warehouseManual.state=this.value" placeholder="CA" maxlength="2"></div>
        </div>
        <button class="btn sm" onclick="saveTlWarehouseFromQuote()" style="margin-top:6px">💾 Save to warehouse list</button>`:''}
      </div>

      <!-- Cargo type -->
      <div class="card">
        <div class="sec-head">Cargo details</div>
        <div class="g2">
          <div class="field"><label>Cargo type</label>
            <div class="toggle-group" style="margin-top:4px">
              <button class="tgl${tl.cargoType==='palletized'?' on':''}" onclick="S.tl.cargoType='palletized';S.tl.tlItems.palletize.included=false;renderTlBuilder()">📦 Palletized</button>
              <button class="tgl${tl.cargoType==='floorLoaded'?' on':''}" onclick="S.tl.cargoType='floorLoaded';S.tl.tlItems.palletize.included=true;renderTlBuilder()">🏗️ Floor Loaded</button>
            </div>
            ${tl.cargoType==='floorLoaded'?'<div style="font-size:11px;color:var(--amber,#d97706);margin-top:4px">⚠️ Palletizing auto-added for floor loaded cargo</div>':''}
          </div>
          <div class="field"><label>Pallet count <span style="font-weight:400;color:var(--gray-400)">(for pricing)</span></label>
            <input type="number" value="${tl.palletCount}" min="0" oninput="S.tl.palletCount=this.value" onblur="renderTlBuilder()" placeholder="e.g. 20"></div>
        </div>
      </div>

      <!-- Charge mode -->
      <div class="card">
        <div class="sec-head">Transload pricing</div>
        <div class="field">
          <label>Charge method</label>
          <div class="toggle-group" style="margin-top:4px">
            <button class="tgl${tl.chargeMode==='byItem'?' on':''}" onclick="S.tl.chargeMode='byItem';renderTlBuilder()">📋 By service item</button>
            <button class="tgl${tl.chargeMode==='flat'?' on':''}"   onclick="S.tl.chargeMode='flat';renderTlBuilder()">💰 Flat fee</button>
          </div>
        </div>
        ${tl.chargeMode==='flat'?`<div style="margin-top:2px">
          <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;color:var(--gray-500);margin-bottom:10px;display:grid;grid-template-columns:1fr 140px 140px;gap:10px"><span></span><span>Warehouse cost</span><span style="color:var(--steel)">Customer price</span></div>
          <div class="charge-row">
            <span style="font-weight:600">Full transload service</span>
            <div style="display:flex;align-items:center;gap:4px"><span style="color:var(--gray-400)">$</span>
              <input type="number" value="${tl.tlFlatCarrier}" min="0" oninput="S.tl.tlFlatCarrier=this.value" placeholder="0" style="width:100px;padding:5px 8px;font-size:13px"></div>
            <div style="display:flex;align-items:center;gap:4px"><span style="color:var(--gray-400)">$</span>
              <input type="number" value="${tl.tlFlatCustomer}" min="0" oninput="S.tl.tlFlatCustomer=this.value" placeholder="0" style="width:100px;padding:5px 8px;font-size:13px;border-color:var(--steel)"></div>
          </div>
        </div>`:`
        <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;color:var(--gray-500);margin:8px 0;display:grid;grid-template-columns:1fr 140px 140px;gap:10px"><span>Service</span><span>Warehouse cost</span><span style="color:var(--steel)">Customer price</span></div>
        ${itemRows}`}
      </div>
    </div>

    <!-- Preview -->
    <div class="sticky-top">
      <div class="card">${buildTlStep2Preview(tl)}</div>
    </div>
  </div>
  <div style="display:flex;justify-content:space-between;margin-top:16px">
    <button class="btn" onclick="S.tl.step=1;renderTlBuilder()">← Back</button>
    <div style="display:flex;gap:8px">
      <button class="btn" onclick="if(!S.tl._skipped)S.tl._skipped={};S.tl._skipped[2]=true;S.tl.step=3;renderTlBuilder()" style="color:var(--gray-500)">Skip transload services</button>
      <button class="btn blue" onclick="tlNext(2)">Next: Outbound FTL →</button>
    </div>
  </div>`;
}
function buildTlStep2Preview(tl){
  let tlCarrier=0,tlCustomer=0;
  const pCount=parseInt(tl.palletCount)||1;
  if(tl.chargeMode==='flat'){
    tlCarrier=parseFloat(tl.tlFlatCarrier)||0;tlCustomer=parseFloat(tl.tlFlatCustomer)||0;
  } else {
    Object.entries(tl.tlItems).forEach(([k,item])=>{
      if(!item.included) return;
      const def=TL_ITEMS_DEF[k];
      let qty=def.unit==='perPallet'?pCount:def.unit==='perPalletPerDay'?pCount*(parseInt(item.days)||0):1;
      tlCarrier+=(parseFloat(item.carrierCost)||0)*qty;
      tlCustomer+=(parseFloat(item.customerPrice)||0)*qty;
    });
  }
  const wh=tl.warehouseId?(window._tlWarehouses||[]).find(w=>w.id===tl.warehouseId):null;
  const whName=wh?wh.name:tl.useManual?tl.warehouseManual.name||'Manual warehouse':'—';
  return `<div style="margin-bottom:12px">
    <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#2d7d46;margin-bottom:6px">🏭 Transload Services</div>
    <div style="font-size:13px;font-weight:600;color:var(--navy);margin-bottom:4px">${whName}</div>
    <div style="font-size:12px;color:var(--gray-500)">${tl.cargoType==='floorLoaded'?'Floor Loaded':'Palletized'}${tl.palletCount?' · '+tl.palletCount+' pallets':''}</div>
  </div>
  ${tlCustomer>0||tlCarrier>0?`<table style="width:100%;font-size:12px">
    <tr><td style="padding:4px 0;color:var(--gray-500)">Warehouse cost</td><td style="text-align:right">${fmtD(tlCarrier)}</td></tr>
    <tr style="border-top:2px solid var(--gray-200)"><td style="padding:8px 0;font-weight:700">Customer price</td><td style="text-align:right;font-weight:800;font-size:16px;color:var(--steel)">${fmtD(tlCustomer)}</td></tr>
    <tr><td style="color:var(--green);font-weight:600">Profit</td><td style="text-align:right;color:var(--green);font-weight:600">+${fmtD(tlCustomer-tlCarrier)}</td></tr>
  </table>`:'<div style="font-size:12px;color:var(--gray-400)">Enter pricing above to see preview</div>'}`;
}

// ── STEP 3: Outbound FTL ──────────────────────────────────────────────────
function buildTlStep3(tl){
  const wh=tl.warehouseId?(window._tlWarehouses||[]).find(w=>w.id===tl.warehouseId):null;
  const pickupZip=wh?wh.zip:tl.useManual?tl.warehouseManual.zip:'';
  const pickupName=wh?wh.name:tl.useManual?tl.warehouseManual.name:'Transload warehouse';
  // Search _fqRates for matching FTL
  const ftlMatches=(window._fqRates||[]).filter(r=>r.active&&r.mode==='FTL'&&r.equipment===tl.outEquipment&&(!r.pickupZip||r.pickupZip===pickupZip)&&(!r.deliveryZip||r.deliveryZip===tl.outDeliveryZip));
  const selFtl=window._fqRates?.find(r=>r.id===tl.selFtlId);

  const ftlCards=ftlMatches.map(r=>`
    <div onclick="S.tl.selFtlId='${r.id}';renderTlBuilder()" style="cursor:pointer;border:2px solid ${tl.selFtlId===r.id?'var(--steel)':'var(--gray-200)'};background:${tl.selFtlId===r.id?'var(--blue-bg)':'var(--white)'};border-radius:var(--radius);padding:12px 14px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center">
      <div>
        <div style="font-weight:700;color:var(--navy)">${r.carrier}</div>
        <div style="font-size:12px;color:var(--gray-500)">${r.pickupZip||'Any'} → ${r.deliveryZip||'Any'}</div>
      </div>
      <div style="text-align:right">
        <div style="font-size:18px;font-weight:800;color:var(--steel)">${fmtD(r.rate)}</div>
        <div style="font-size:11px;color:var(--gray-400)">carrier cost</div>
      </div>
    </div>`).join('');

  return `<div class="two-col">
    <div>
      <div class="card">
        <div class="sec-head">🚛 Outbound freight details</div>
        <div style="background:var(--gray-50);border-radius:var(--radius);padding:12px;margin-bottom:14px">
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--gray-400);margin-bottom:4px">Pickup (auto-filled from transload warehouse)</div>
          <div style="font-weight:600;color:var(--navy)">${pickupName}</div>
          ${pickupZip?`<div style="font-size:12px;color:var(--gray-500)">Zip: ${pickupZip}</div>`:''}
        </div>
        <div class="field" style="margin-bottom:12px">
          <label>Outbound mode</label>
          <div class="toggle-group" style="margin-top:4px">
            <button class="tgl${(tl.outMode||'FTL')==='FTL'?' on':''}" onclick="S.tl.outMode='FTL';renderTlBuilder()">🚛 FTL</button>
            <button class="tgl${(tl.outMode||'FTL')==='LTL'?' on':''}" onclick="S.tl.outMode='LTL';renderTlBuilder()">📦 LTL</button>
          </div>
        </div>
        <div class="g2">
          ${!(tl.outMultiStop&&(tl.outMode||'FTL')==='LTL')?`<div class="field"><label>Delivery zip *</label>
            <input type="text" value="${tl.outDeliveryZip}" oninput="S.tl.outDeliveryZip=this.value" onblur="renderTlBuilder()" placeholder="e.g. 75201" maxlength="10"></div>`
          :`<div class="field"><label style="color:var(--gray-400)">Delivery zip</label><div style="font-size:12px;color:var(--gray-400);padding:8px 0">Set per delivery below</div></div>`}
          ${(tl.outMode||'FTL')==='FTL'?`<div class="field"><label>Equipment type</label>
            <div class="toggle-group" style="margin-top:4px">
              ${['Dry Van','Reefer','Flatbed','Box Truck'].map(e=>`<button class="tgl${tl.outEquipment===e?' on':''}" onclick="S.tl.outEquipment='${e}';renderTlBuilder()">${e}</button>`).join('')}
            </div></div>`:`<div class="field"><label>LTL Carrier (primary)</label>
            <input type="text" value="${tl.outLtlCarrier||''}" oninput="S.tl.outLtlCarrier=this.value" placeholder="e.g. XPO, FedEx Freight, Estes"></div>`}
        </div>

        <!-- Multi-stop / Multi-zip toggle -->
        <div style="margin-top:4px;padding:10px 12px;background:var(--gray-50);border-radius:var(--radius);border:1px solid var(--gray-200)">
          <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:13px;font-weight:600;color:var(--navy)">
            <input type="checkbox" ${tl.outMultiStop?'checked':''} onchange="S.tl.outMultiStop=this.checked;if(!S.tl.outStops?.length)S.tl.outStops=[{zip:'',address:'',carrier:'',carrierRate:'',customerRate:''}];renderTlBuilder()" style="width:auto">
            ${(tl.outMode||'FTL')==='LTL'?'Multiple deliveries — different carriers & rates':'Multiple stops (same carrier, single rate)'}
          </label>
          ${tl.outMultiStop?`
          <div style="margin-top:10px">
            ${(tl.outMode||'FTL')==='LTL'?`
            <div style="display:grid;grid-template-columns:80px 1fr 1fr 90px 90px 24px;gap:6px;margin-bottom:4px;padding-bottom:4px;border-bottom:1px solid var(--gray-200)">
              <div style="font-size:10px;font-weight:700;text-transform:uppercase;color:var(--gray-400)">ZIP</div>
              <div style="font-size:10px;font-weight:700;text-transform:uppercase;color:var(--gray-400)">LTL Carrier</div>
              <div style="font-size:10px;font-weight:700;text-transform:uppercase;color:var(--gray-400)">Notes</div>
              <div style="font-size:10px;font-weight:700;text-transform:uppercase;color:var(--gray-400)">Carrier $</div>
              <div style="font-size:10px;font-weight:700;text-transform:uppercase;color:var(--steel)">Customer $</div>
              <div></div>
            </div>
            ${(tl.outStops||[]).map((stop,i)=>`
              <div style="display:grid;grid-template-columns:80px 1fr 1fr 90px 90px 24px;gap:6px;margin-bottom:8px;align-items:center">
                <div style="display:flex;align-items:center;gap:5px">
                  <div style="width:18px;height:18px;border-radius:50%;background:var(--navy);color:#fff;font-size:9px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0">${i+1}</div>
                  <input type="text" value="${stop.zip||''}" oninput="S.tl.outStops[${i}].zip=this.value" placeholder="Zip" maxlength="10" style="width:100%;padding:4px 6px;font-size:12px">
                </div>
                <input type="text" value="${stop.carrier||''}" oninput="S.tl.outStops[${i}].carrier=this.value" placeholder="e.g. XPO" style="padding:4px 6px;font-size:12px">
                <input type="text" value="${stop.address||''}" oninput="S.tl.outStops[${i}].address=this.value" placeholder="Notes (optional)" style="padding:4px 6px;font-size:12px">
                <input type="number" value="${stop.carrierRate||''}" oninput="S.tl.outStops[${i}].carrierRate=this.value" placeholder="$0" min="0" style="padding:4px 6px;font-size:12px">
                <input type="number" value="${stop.customerRate||''}" oninput="S.tl.outStops[${i}].customerRate=this.value" placeholder="$0" min="0" style="padding:4px 6px;font-size:12px;border-color:var(--steel)">
                ${(tl.outStops||[]).length>1?`<button onclick="S.tl.outStops.splice(${i},1);renderTlBuilder()" style="background:none;border:none;cursor:pointer;color:var(--gray-400);font-size:18px;line-height:1">×</button>`:'<div></div>'}
              </div>`).join('')}`:`
            ${(tl.outStops||[]).map((stop,i)=>`
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
                <div style="width:20px;height:20px;border-radius:50%;background:var(--navy);color:#fff;font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0">${i+1}</div>
                <input type="text" value="${stop.zip||''}" oninput="S.tl.outStops[${i}].zip=this.value" placeholder="Zip code" maxlength="10" style="width:90px;padding:5px 8px;font-size:12px">
                <input type="text" value="${stop.address||''}" oninput="S.tl.outStops[${i}].address=this.value" placeholder="Address / notes (optional)" style="flex:1;padding:5px 8px;font-size:12px">
                ${(tl.outStops||[]).length>1?`<button onclick="S.tl.outStops.splice(${i},1);renderTlBuilder()" style="background:none;border:none;cursor:pointer;color:var(--gray-400);font-size:16px;padding:0 4px">×</button>`:''}
              </div>`).join('')}`}
            <button class="btn sm" onclick="S.tl.outStops.push({zip:'',address:'',carrier:'',carrierRate:'',customerRate:''});renderTlBuilder()" style="margin-top:6px">
              + Add ${(tl.outMode||'FTL')==='LTL'?'delivery':'stop'}
            </button>
          </div>`:''}
        </div>
      </div>
      <div class="card">
        <div class="sec-head">Select ${(tl.outMode||'FTL')==='LTL'?'LTL carrier':'FTL carrier'}
          <span style="font-weight:400;font-size:11px;color:${ftlMatches.length?'var(--green)':'var(--amber)'}">${ftlMatches.length?'✓ '+ftlMatches.length+' on file':'No carriers on file for this lane'}</span>
        </div>
        ${ftlCards}
        ${!ftlMatches.length||!tl.selFtlId?`<div class="g2" style="margin-top:${ftlMatches.length?'12':'0'}px">
          <div class="field"><label>Carrier name</label>
            <input type="text" value="${tl.outManualCarrier}" oninput="S.tl.outManualCarrier=this.value" placeholder="e.g. Echo Logistics"></div>
          <div class="field"><label>Carrier rate (flat)</label>
            <input type="number" value="${tl.outManualRate}" min="0" oninput="S.tl.outManualRate=this.value" onblur="refreshTlOutPreview()" placeholder="e.g. 1800"></div>
        </div>`:''}
        <div style="margin-top:14px;padding-top:14px;border-top:1px solid var(--gray-100)">
          <div class="sec-head" style="margin-bottom:8px">Your markup on outbound</div>
          <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
            <div class="toggle-group">
              <button class="tgl${tl.outMarkupMode==='flat'?' on':''}" onclick="S.tl.outMarkupMode='flat';refreshTlOutPreview()">Flat $</button>
              <button class="tgl${tl.outMarkupMode==='pct'?' on':''}"  onclick="S.tl.outMarkupMode='pct';refreshTlOutPreview()">%</button>
            </div>
            <input type="number" value="${tl.outMarkupAmount}" min="0"
              oninput="S.tl.outMarkupAmount=+this.value" onblur="refreshTlOutPreview()"
              style="width:100px;padding:6px 10px;font-size:13px">
            <span style="font-size:12px;color:var(--gray-400)">${tl.outMarkupMode==='flat'?'flat $ over carrier rate':'% over carrier rate'}</span>
          </div>
        </div>
    </div>
    <div class="sticky-top">
      <div class="card" id="tl-step3-preview">${buildTlStep3Preview(tl)}</div>
    </div>
  </div>
  <div style="display:flex;justify-content:space-between;margin-top:16px">
    <button class="btn" onclick="S.tl.step=2;renderTlBuilder()">← Back</button>
    <div style="display:flex;gap:8px">
      <button class="btn" onclick="if(!S.tl._skipped)S.tl._skipped={};S.tl._skipped[3]=true;S.tl.step=4;renderTlBuilder()" style="color:var(--gray-500)">Skip outbound FTL</button>
      <button class="btn blue" onclick="tlNext(3)">Next: Review & Save →</button>
    </div>
  </div>`;
}
function buildTlStep3Preview(tl){
  const selFtl=window._fqRates?.find(r=>r.id===tl.selFtlId);
  const outCarrier=selFtl?selFtl.rate:parseFloat(tl.outManualRate)||0;
  const outCustomer=tl.outMarkupMode==='pct'?outCarrier*(1+tl.outMarkupAmount/100):outCarrier+Number(tl.outMarkupAmount);
  if(!outCarrier) return `<div style="font-size:12px;color:var(--gray-400);padding:12px 0">Enter carrier rate to see pricing</div>`;
  return `<div style="margin-bottom:12px">
    <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#d97706;margin-bottom:6px">🚛 Outbound FTL</div>
    <div style="font-size:13px;font-weight:600;color:var(--navy);margin-bottom:4px">${selFtl?selFtl.carrier:tl.outManualCarrier||'—'}</div>
    <div style="font-size:12px;color:var(--gray-500)">${tl.outEquipment} · → ${tl.outDeliveryZip||'—'}</div>
  </div>
  <table style="width:100%;font-size:12px">
    <tr><td style="padding:4px 0;color:var(--gray-500)">Carrier cost</td><td style="text-align:right">${fmtD(outCarrier)}</td></tr>
    <tr><td style="padding:4px 0;color:var(--gray-500)">Markup</td><td style="text-align:right">+${tl.outMarkupMode==='flat'?fmtD(tl.outMarkupAmount):tl.outMarkupAmount+'%'}</td></tr>
    <tr style="border-top:2px solid var(--gray-200)"><td style="padding:8px 0;font-weight:700">Customer price</td><td style="text-align:right;font-weight:800;font-size:16px;color:var(--steel)">${fmtD(outCustomer)}</td></tr>
    <tr><td style="color:var(--green);font-weight:600">Profit</td><td style="text-align:right;color:var(--green);font-weight:600">+${fmtD(outCustomer-outCarrier)}</td></tr>
  </table>`;
}

// ── STEP 4: Review & Save ─────────────────────────────────────────────────
function buildTlStep4(tl){
  const t=calcTlTotals(tl);
  const wh=tl.warehouseId?(window._tlWarehouses||[]).find(w=>w.id===tl.warehouseId):null;
  const whName=wh?wh.name:tl.useManual?tl.warehouseManual.name:'—';
  const selDray=S.rates.find(r=>r.id===tl.selDrayId);
  const selFtl=window._fqRates?.find(r=>r.id===tl.selFtlId);

  function sectionTable(rows,carrierTotal,customerTotal){
    return `<div style="border:1px solid var(--gray-200);border-radius:var(--radius);overflow:hidden;margin-bottom:4px">
      <table style="width:100%;font-size:12px;border-collapse:collapse">
        <thead><tr style="background:var(--gray-50)">
          <th style="padding:6px 12px;text-align:left;font-size:10px;font-weight:700;text-transform:uppercase;color:var(--gray-500)">Service</th>
          <th style="padding:6px 12px;text-align:right;font-size:10px;font-weight:700;color:var(--gray-400)">Carrier cost</th>
          <th style="padding:6px 12px;text-align:right;font-size:10px;font-weight:700;color:var(--steel)">Customer price</th>
          <th style="padding:6px 12px;text-align:right;font-size:10px;font-weight:700;color:var(--green)">Profit</th>
        </tr></thead>
        <tbody>${rows}</tbody>
        <tfoot><tr style="background:var(--gray-100)">
          <td style="padding:8px 12px;font-weight:700">Section total</td>
          <td style="padding:8px 12px;text-align:right;font-weight:600">${fmtD(carrierTotal)}</td>
          <td style="padding:8px 12px;text-align:right;font-weight:700;color:var(--steel)">${fmtD(customerTotal)}</td>
          <td style="padding:8px 12px;text-align:right;font-weight:700;color:var(--green)">+${fmtD(customerTotal-carrierTotal)}</td>
        </tr></tfoot>
      </table>
    </div>`;
  }

  function row(label,carrier,customer){
    return `<tr style="border-bottom:1px solid var(--gray-100)">
      <td style="padding:7px 12px">${label}</td>
      <td style="padding:7px 12px;text-align:right;color:var(--gray-500)">${carrier>0?fmtD(carrier):'—'}</td>
      <td style="padding:7px 12px;text-align:right;font-weight:600;color:var(--navy)">${customer>0?fmtD(customer):'—'}</td>
      <td style="padding:7px 12px;text-align:right;color:var(--green)">${customer>0&&carrier>0?'+'+fmtD(customer-carrier):'—'}</td>
    </tr>`;
  }

  // Drayage rows
  const drayRow=row(`Drayage — ${selDray?selDray.carrier:tl.drayManualCarrier||'—'}<br><span style="font-size:11px;color:var(--gray-400)">${tl.drayPort||'—'} → ${tl.drayZip||'—'} (${tl.drayLd})</span>`,t.drayCarrier,t.drayCustomer);

  // Transload rows
  let tlRows='';
  if(tl.chargeMode==='flat'){
    tlRows=row('Full transload service',parseFloat(tl.tlFlatCarrier)||0,parseFloat(tl.tlFlatCustomer)||0);
  } else {
    const pCount=parseInt(tl.palletCount)||1;
    Object.entries(tl.tlItems).forEach(([k,item])=>{
      if(!item.included) return;
      const def=TL_ITEMS_DEF[k];
      let qty=def.unit==='perPallet'?pCount:def.unit==='perPalletPerDay'?pCount*(parseInt(item.days)||0):1;
      tlRows+=row(`${def.icon} ${def.label}${qty>1?' × '+qty:''}`,
        (parseFloat(item.carrierCost)||0)*qty,(parseFloat(item.customerPrice)||0)*qty);
    });
  }

  // Outbound row
  const outCarrier=selFtl?selFtl.rate:parseFloat(tl.outManualRate)||0;
  const outCustomer=tl.outMarkupMode==='pct'?outCarrier*(1+tl.outMarkupAmount/100):outCarrier+Number(tl.outMarkupAmount);
  // Outbound rows
  let outRows='';
  if(tl.outMultiStop&&tl.outMode==='LTL'&&tl.outStops?.length){
    tl.outStops.forEach((s,i)=>{
      const cr=parseFloat(s.carrierRate)||0;const cu=parseFloat(s.customerRate)||0;
      outRows+=row(`LTL Stop ${i+1} — ${s.carrier||'—'}<br><span style="font-size:11px;color:var(--gray-400)">→ ${s.zip||'—'}${s.address?' ('+s.address+')':''}</span>`,cr,cu);
    });
  } else {
    outRows=row(`${tl.outMode==='LTL'?'LTL':'FTL'} — ${selFtl?selFtl.carrier:tl.outManualCarrier||tl.outLtlCarrier||'—'}<br><span style="font-size:11px;color:var(--gray-400)">${tl.outEquipment||tl.outMode}${tl.outMultiStop&&tl.outStops?.length?'<br>'+tl.outStops.map((s,i)=>`Stop ${i+1}: ${s.zip||'—'}${s.address?' — '+s.address:''}`).join('<br>'):' → '+(tl.outDeliveryZip||'—')}</span>`,outCarrier,outCustomer);
  }

  return `<div class="card">
    <div class="sec-head">📋 Quote summary — ${tl.customer||'Customer'}</div>
    <div style="font-size:12px;color:var(--gray-500);margin-bottom:16px">${tl.cargoType==='floorLoaded'?'Floor Loaded':'Palletized'} · ${tl.palletCount||'?'} pallets · ${wh?(wh.name):tl.useManual?tl.warehouseManual.name:'—'}</div>

    <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#3b6ea5;padding:8px 12px;background:#eff6ff;border-radius:6px 6px 0 0">🚢 Inbound Drayage</div>
    ${sectionTable(drayRow,t.drayCarrier,t.drayCustomer)}

    <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#2d7d46;padding:8px 12px;background:#f0fdf4;border-radius:6px 6px 0 0;margin-top:12px">🏭 Transload Services — ${whName}</div>
    ${sectionTable(tlRows,t.tlCarrier,t.tlCustomer)}

    <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#d97706;padding:8px 12px;background:#fffbeb;border-radius:6px 6px 0 0;margin-top:12px">🚛 Outbound ${tl.outMode||'FTL'}</div>
    ${sectionTable(outRows,outCarrier,outCustomer)}

    <!-- Grand total -->
    <div style="background:var(--navy);border-radius:var(--radius);padding:16px 20px;margin-top:16px;display:flex;justify-content:space-between;align-items:center">
      <div>
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:rgba(255,255,255,.5);margin-bottom:4px">Grand total — customer invoice</div>
        <div style="font-size:30px;font-weight:800;color:#fff">${fmtD(t.totalCustomer)}</div>
      </div>
      <div style="text-align:right">
        <div style="color:rgba(255,255,255,.6);font-size:12px">Carrier cost: ${fmtD(t.totalCarrier)}</div>
        <div style="color:#86efac;font-weight:700;font-size:15px">Profit: +${fmtD(t.totalProfit)}</div>
        <span class="badge ${t.margin>=0.10?'g':'r'}" style="margin-top:4px">${pct(t.margin)} margin</span>
      </div>
    </div>

    <!-- Notes -->
    <div class="field" style="margin-top:16px">
      <label>Notes for customer (optional)</label>
      <textarea rows="3" oninput="S.tl.notes=this.value" placeholder="Add any conditions or instructions…"
        style="width:100%;padding:8px 10px;font-size:12px;border:1px solid var(--gray-200);border-radius:var(--radius);resize:vertical;font-family:inherit">${tl.notes}</textarea>
    </div>
    <div class="field" style="margin-top:12px">
      <label>Shifl Ref #</label>
      <input type="text" value="${tl.shiflRef||''}" oninput="S.tl.shiflRef=this.value" placeholder="Assigned after booking"
        style="width:100%;padding:8px 10px;font-size:13px;border:1px solid var(--gray-200);border-radius:var(--radius);font-family:inherit">
    </div>
  </div>
  <div style="display:flex;justify-content:space-between;margin-top:16px;gap:10px">
    <button class="btn" onclick="S.tl.step=3;renderTlBuilder()">← Back</button>
    <div style="display:flex;gap:10px">
      <button class="btn" onclick="downloadTlCustomerPDF(null,S.tl)">📄 Customer PDF</button>
      <button class="btn blue" onclick="saveTlQuote()">💾 Save quote</button>
    </div>
  </div>`;
}

// Step navigation
function tlNext(from){
  if(from===1){
    if(!S.tl.drayPort){alert('Please enter the origin port.');return;}
    if(!S.tl.drayZip){alert('Please enter the delivery zip code.');return;}
    S.tl.step=2;
  } else if(from===2){
    if(!S.tl.warehouseId&&!S.tl.useManual&&!window._tlWarehouses?.length){S.tl.useManual=true;}
    if(S.tl.useManual&&!S.tl.warehouseManual.name){alert('Please enter the warehouse name.');return;}
    S.tl.step=3;
  } else if(from===3){
    const hasMainZip=S.tl.outDeliveryZip;
    const hasMultiStopZips=S.tl.outMultiStop&&(S.tl.outStops||[]).some(s=>s.zip);
    if(!hasMainZip&&!hasMultiStopZips){alert('Please enter at least one delivery zip code.');return;}
    S.tl.step=4;
  }
  renderTlBuilder();
}

// ── Save quote ────────────────────────────────────────────────────────────
// ── Transload Quote Log ───────────────────────────────────────────────────
function renderTlLog(){
  const history=window._tlHistory||[];
  if(!history.length){$('page').innerHTML=`<div class="empty"><div class="empty-ico">📁</div><p>No transload quotes yet</p><small>Build a quote on the Quote builder tab and save it</small></div>`;return;}
  if(!window._tlSelected) window._tlSelected=new Set();
  const sel=window._tlSelected;
  const selCount=sel.size;
  $('topbar-right').innerHTML=`<div style="display:flex;gap:8px">
    ${selCount>0?`<button class="btn blue" onclick="downloadSelectedTlPDFs()">📄 ${selCount} PDF</button><button class="btn" onclick="window._tlSelected=new Set();renderTlLog()">Clear</button>`:''}
    <button class="btn" onclick="syncQuotesToTeam()">🔄 Sync</button>
  </div>`;
  const tlCounts={all:history.length};
  ['Quoted','Booked','Delivered','Invoiced','Lost','Cancelled'].forEach(s=>{tlCounts[s]=history.filter(q=>q.status===s).length;});
  const tlSrch=(S.tlLogSearch||'').toLowerCase();
  const tlFiltered=history.map((q,i)=>({q,i})).filter(({q})=>{
    if((S.tlLogFilter||'all')!=='all'&&q.status!==S.tlLogFilter) return false;
    if(!tlSrch) return true;
    return (q.customer||'').toLowerCase().includes(tlSrch)||(q.shiflRef||'').toLowerCase().includes(tlSrch)||(q.drayPort||'').toLowerCase().includes(tlSrch)||(q.outDeliveryZip||'').includes(tlSrch)||(q.warehouseName||'').toLowerCase().includes(tlSrch);
  });
  const tlPillBar=buildPillBar('tlLogFilter','tlLogSearch',tlCounts,'Customer, ref #, ZIP, warehouse…');
  const rows=tlFiltered.map(({q,i})=>`<tr onclick="showTlQuoteModal(${i})" style="cursor:pointer">
    <td onclick="event.stopPropagation()" style="width:32px;text-align:center">
      <input type="checkbox" ${sel.has(i)?'checked':''} onchange="toggleTlSelect(${i},this.checked)" style="width:auto;cursor:pointer"></td>
    <td class="muted small">${q.date}</td>
    <td class="bold">${q.customer}</td>
    <td class="muted small">${q.drayPort?q.drayPort.split(',')[0]:'—'}</td>
    <td class="muted small">${q.warehouseName||'—'}</td>
    <td class="muted small">${q.outDeliveryZip||'—'}</td>
    <td>${q.palletCount||'—'} pallets</td>
    <td class="bold" style="color:var(--steel)">${fmtD(q.totalCustomer)}</td>
    <td style="white-space:nowrap">${(p=>{const c=p.isActual?'var(--green)':p.margin>=0.08?'var(--amber)':'var(--red)';return`<span style='font-weight:600;color:${c}'>+${fmtD(p.profit)}</span><br>${profitBadge(p.isActual)}`;})(getShipmentProfit(q,'transload'))}</td>
    <td><span class="badge ${(p=>p.margin>=0.10?'g':'r')(getShipmentProfit(q,'transload'))}">${pct(getShipmentProfit(q,'transload').margin)}</span></td>
    <td style="font-size:11px;color:var(--gray-400);white-space:nowrap">${q.created_by_name||'—'}</td>
    <td onclick="event.stopPropagation()">
      <select onchange="updateTlStatus(${i},this.value)" style="font-size:12px;padding:4px 7px;width:110px">
        <option${q.status==='Quoted'?' selected':''}>Quoted</option>
        <option${q.status==='Booked'?' selected':''}>Booked</option>
        <option${q.status==='Lost'?' selected':''}>Lost</option>
        <option${q.status==='Cancelled'?' selected':''}>Cancelled</option>
      </select>
    </td>
    <td onclick="event.stopPropagation()" style="white-space:nowrap">
      <button class="btn sm ico-btn" onclick="showTlQuoteModal(${i})" title="View">📄</button>
      <button class="btn sm ico-btn" onclick="deleteTlQuote(${i})" title="Delete" style="margin-left:3px">🗑️</button>
    </td>
  </tr>`).join('');
  $('page').innerHTML=tlPillBar+`<div class="tbl-wrap"><table>
    <thead><tr><th style="width:32px"><input type="checkbox" ${selCount===history.length&&selCount>0?'checked':''} onchange="if(this.checked){window._tlSelected=new Set(Array.from({length:${history.length}},(_,i)=>i));}else{window._tlSelected=new Set();}renderTlLog()" style="width:auto"></th><th>Date</th><th>Customer</th><th>Origin</th><th>Warehouse</th><th>Delivery</th><th>Pallets</th><th>Total</th><th>Base Profit</th><th>By</th><th>Status</th><th></th></tr></thead>
    <tbody>${rows}</tbody>
  </table></div>`;
}
function toggleTlSelect(idx,checked){
  if(!window._tlSelected) window._tlSelected=new Set();
  if(checked) window._tlSelected.add(idx); else window._tlSelected.delete(idx);
  renderTlLog();
}
async function downloadSelectedTlPDFs(){
  const indices=Array.from(window._tlSelected||[]).sort((a,b)=>a-b);
  if(!indices.length){alert('Select at least one quote first.');return;}
  if(!await loadJsPDF()) return;
  const{jsPDF}=window.jspdf;
  const doc=new jsPDF({orientation:'portrait',unit:'mm',format:'a4'});
  indices.forEach((idx,i)=>{
    const q=(window._tlHistory||[])[idx];if(!q) return;
    if(i>0) doc.addPage();
    downloadTlCustomerPDF(idx,null,doc); // pass doc to avoid saving
  });
  doc.save('Shifl_Transload_Quotes_Combined_'+localDateStr()+'.pdf');
  window._tlSelected=new Set();
  renderTlLog();
}
function updateTlStatus(idx,status){
  if(!requireCan('update_status','Only Admins can change quote status.')) return;
  if(!window._tlHistory?.[idx]) return;
  const q=window._tlHistory[idx];q.status=status;
  try{localStorage.setItem('tl_history',JSON.stringify(window._tlHistory));}catch(e){}
  try{dbUpdateTlStatus(q.id,status);}catch(e){}
  updateActiveBadge();
}
function deleteTlQuote(idx){
  if(!confirm('Delete this quote?')) return;
  const q=window._tlHistory[idx];
  window._tlHistory.splice(idx,1);
  try{localStorage.setItem('tl_history',JSON.stringify(window._tlHistory));}catch(e){}
  try{dbDeleteTlQuote(q.id);}catch(e){}
  renderTlLog();
}

function showTlQuoteModal(idx){
  const q=(window._tlHistory||[])[idx];if(!q) return;
  const statusColors={Quoted:'a',Booked:'g',Lost:'gr',Cancelled:'gr'};
  function secRow(lbl,carrier,customer){return `<tr><td style="padding:8px 12px">${lbl}</td><td style="padding:8px 12px;text-align:right;color:var(--gray-400)">${carrier>0?fmtD(carrier):'—'}</td><td style="padding:8px 12px;text-align:right;font-weight:600;color:var(--navy)">${customer>0?fmtD(customer):'—'}</td><td style="padding:8px 12px;text-align:right;color:var(--green)">${carrier>0&&customer>0?'+'+fmtD(customer-carrier):'—'}</td></tr>`;}
  let tlRows='';
  if(q.chargeMode==='byItem'&&q.tlItems){
    const pCount=parseInt(q.palletCount)||1;
    Object.entries(q.tlItems).forEach(([k,item])=>{
      if(!item.included) return;const def=TL_ITEMS_DEF[k];if(!def) return;
      let qty=def.unit==='perPallet'?pCount:def.unit==='perPalletPerDay'?pCount*(parseInt(item.days)||0):1;
      tlRows+=secRow(def.label+(qty>1?' x '+qty:''),(parseFloat(item.carrierCost)||0)*qty,(parseFloat(item.customerPrice)||0)*qty);
    });
  } else {tlRows=secRow('Full transload service',parseFloat(q.tlFlatCarrier)||0,parseFloat(q.tlFlatCustomer)||0);}
  $('modal-root').innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()">
    <div class="modal" style="width:680px">
      <div style="background:var(--navy);border-radius:10px;padding:16px 20px;margin-bottom:20px;display:flex;justify-content:space-between;align-items:center">
        <div><div style="font-size:17px;font-weight:800;color:#fff">Transload Quote</div>
        <div style="font-size:11px;color:rgba(255,255,255,.5)">${q.date} · ${q.customer}</div></div>
        <span class="badge ${statusColors[q.status]||'gr'}" style="font-size:13px;padding:4px 12px">${q.status}</span>
      </div>
      <div class="g3" style="margin-bottom:18px">
        <div><div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--gray-400);margin-bottom:3px">Customer</div><div style="font-weight:600">${q.customer}</div></div>
        <div><div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--gray-400);margin-bottom:3px">Pallets</div><div>${q.palletCount||'—'} (${q.cargoType==='floorLoaded'?'Floor Loaded':'Palletized'})</div></div>
        <div><div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--gray-400);margin-bottom:3px">Warehouse</div><div>${q.warehouseName||'—'}</div></div>
        <div><div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--gray-400);margin-bottom:3px">Origin</div><div>${q.drayPort||'—'}</div></div>
        <div><div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--gray-400);margin-bottom:3px">Delivery</div><div>${q.outDeliveryZip||'—'}</div></div>
        <div><div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--gray-400);margin-bottom:3px">Equipment</div><div>${q.outEquipment||'—'}</div></div>
      </div>
      ${[
        {color:'#3b6ea5',bg:'#eff6ff',label:'INBOUND DRAYAGE — '+q.drayCarrier,rows:secRow(q.drayPort+' to '+q.drayZip+' ('+q.drayLd+')',q.drayCarrierCost,q.drayCustomerPrice),ct:q.drayCarrierCost,cu:q.drayCustomerPrice},
        {color:'#2d7d46',bg:'#f0fdf4',label:'TRANSLOAD — '+q.warehouseName,rows:tlRows,ct:q.tlCarrierCost,cu:q.tlCustomerPrice},
        {color:'#d97706',bg:'#fffbeb',label:'OUTBOUND FTL — '+q.outCarrier+' ('+q.outEquipment+')',rows:secRow('To '+q.outDeliveryZip,q.outCarrierCost,q.outCustomerPrice),ct:q.outCarrierCost,cu:q.outCustomerPrice},
      ].map(s=>`
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;color:${s.color};padding:6px 12px;background:${s.bg};border-radius:6px 6px 0 0">${s.label}</div>
        <div style="border:1px solid var(--gray-200);border-radius:0 0 6px 6px;overflow:hidden;margin-bottom:10px">
          <table style="width:100%;font-size:12px;border-collapse:collapse">
            <thead><tr style="background:var(--gray-50)">
              <th style="padding:5px 12px;text-align:left;font-size:10px;font-weight:700;color:var(--gray-500)">Service</th>
              <th style="padding:5px 12px;text-align:right;font-size:10px;font-weight:700;color:var(--gray-400)">Carrier cost</th>
              <th style="padding:5px 12px;text-align:right;font-size:10px;font-weight:700;color:var(--steel)">Customer price</th>
              <th style="padding:5px 12px;text-align:right;font-size:10px;font-weight:700;color:var(--green)">Profit</th>
            </tr></thead>
            <tbody>${s.rows}</tbody>
            <tfoot><tr style="background:var(--gray-50)">
              <td style="padding:7px 12px;font-weight:700">Section total</td>
              <td style="padding:7px 12px;text-align:right;font-weight:600">${fmtD(s.ct)}</td>
              <td style="padding:7px 12px;text-align:right;font-weight:700;color:var(--steel)">${fmtD(s.cu)}</td>
              <td style="padding:7px 12px;text-align:right;font-weight:700;color:var(--green)">+${fmtD(s.cu-s.ct)}</td>
            </tr></tfoot>
          </table>
        </div>`).join('')}
      <div style="background:var(--navy);border-radius:var(--radius);padding:12px 16px;display:flex;justify-content:space-between;align-items:center">
        <div style="font-size:15px;font-weight:700;color:#fff">GRAND TOTAL</div>
        <div style="text-align:right"><div style="font-size:20px;font-weight:800;color:#fff">${fmtD(q.totalCustomer)}</div>
        <div style="color:#86efac;font-size:12px">${(p=>`${p.isActual?'':'~'}+${fmtD(p.profit)} profit · ${pct(p.margin)} margin ${p.isActual?'✓ actual':'est.'}`)(getShipmentProfit(q,'transload'))}</div></div>
      </div>
      <div class="modal-foot">
        <button class="btn" onclick="closeModal()">Close</button>
        <button class="btn" onclick="downloadTlCustomerPDF(${idx},null)">📄 Customer PDF</button>
        <button class="btn green" onclick="downloadTlInternalPDF(${idx})">📋 Rate sheet</button>
      </div>
    </div></div>`;
}

// ── Warehouses ─────────────────────────────────────────────────────────────
function renderTlWarehouses(){
  const whs=window._tlWarehouses||[];
  const rows=whs.map(w=>`<tr>
    <td class="bold">${w.name}</td><td>${w.address||'—'}</td>
    <td>${w.city||'—'}, ${w.state||'—'}</td><td>${w.zip}</td>
    <td class="muted small">${w.phone||'—'}</td><td class="muted small">${w.contact||'—'}</td>
    <td style="white-space:nowrap">
      <button class="btn sm ico-btn" onclick="editTlWarehouse('${w.id}')">✏️</button>
      <button class="btn sm ico-btn" onclick="deleteTlWarehouse('${w.id}')" style="margin-left:3px">🗑️</button>
    </td>
  </tr>`).join('');
  $('page').innerHTML=`<div class="tbl-wrap"><table>
    <thead><tr><th>Name</th><th>Address</th><th>City/State</th><th>Zip</th><th>Phone</th><th>Contact</th><th></th></tr></thead>
    <tbody>${rows||'<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--gray-400)">No warehouses yet — click + Add warehouse</td></tr>'}</tbody>
  </table></div>`;
}
function showAddTlWarehouse(prefill){
  const p=prefill||{};
  $('modal-root').innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()">
    <div class="modal"><div class="modal-title">Add warehouse</div>
    <div class="g2">
      <div class="field"><label>Warehouse name *</label><input type="text" id="wh-name" value="${p.name||''}" placeholder="e.g. XYZ Logistics"></div>
      <div class="field"><label>Zip code *</label><input type="text" id="wh-zip" value="${p.zip||''}" placeholder="90248" maxlength="10"></div>
    </div>
    <div class="field"><label>Address</label><input type="text" id="wh-addr" value="${p.address||''}" placeholder="Street address"></div>
    <div class="g2">
      <div class="field"><label>City</label><input type="text" id="wh-city" value="${p.city||''}" placeholder="City"></div>
      <div class="field"><label>State</label><input type="text" id="wh-state" value="${p.state||''}" placeholder="CA" maxlength="2"></div>
    </div>
    <div class="g2">
      <div class="field"><label>Phone (optional)</label><input type="text" id="wh-phone" value="${p.phone||''}" placeholder="+1 (555) 000-0000"></div>
      <div class="field"><label>Contact name (optional)</label><input type="text" id="wh-contact" value="${p.contact||''}" placeholder="John Smith"></div>
    </div>
    <div class="modal-foot"><button class="btn" onclick="closeModal()">Cancel</button>
    <button class="btn blue" onclick="submitAddTlWarehouse('${p.editId||''}')">Save warehouse</button></div>
    </div></div>`;
}
function submitAddTlWarehouse(editId){
  const name=($('wh-name')||{}).value?.trim();const zip=($('wh-zip')||{}).value?.trim();
  if(!name||!zip){alert('Name and zip are required.');return;}
  const w={id:editId||uid(),name,zip,address:($('wh-addr')||{}).value?.trim()||'',
    city:($('wh-city')||{}).value?.trim()||'',state:($('wh-state')||{}).value?.trim()||'',
    phone:($('wh-phone')||{}).value?.trim()||'',contact:($('wh-contact')||{}).value?.trim()||''};
  if(editId){const idx=(window._tlWarehouses||[]).findIndex(x=>x.id===editId);if(idx>=0) window._tlWarehouses[idx]=w;}
  else{if(!window._tlWarehouses) window._tlWarehouses=[];window._tlWarehouses.push(w);}
  saveTlWarehouses();closeModal();renderTlWarehouses();
}
function editTlWarehouse(id){const w=(window._tlWarehouses||[]).find(x=>x.id===id);if(!w) return;showAddTlWarehouse({...w,editId:id});}
function deleteTlWarehouse(id){if(!confirm('Delete this warehouse?')) return;window._tlWarehouses=(window._tlWarehouses||[]).filter(w=>w.id!==id);saveTlWarehouses();renderTlWarehouses();}
function saveTlWarehouseFromQuote(){
  const m=S.tl.warehouseManual;if(!m.name||!m.zip){alert('Enter warehouse name and zip first.');return;}
  const w={id:uid(),name:m.name,zip:m.zip,address:m.address||'',city:m.city||'',state:m.state||'',phone:'',contact:''};
  if(!window._tlWarehouses) window._tlWarehouses=[];
  window._tlWarehouses.push(w);saveTlWarehouses();
  S.tl.warehouseId=w.id;S.tl.useManual=false;
  alert('✅ "'+m.name+'" saved to warehouse list.');renderTlBuilder();
}

// ── Dashboard ─────────────────────────────────────────────────────────────
function renderTlDashboard(){
  const all=window._tlHistory||[];
  const booked=all.filter(q=>q.status==='Booked');
  const won=all.filter(q=>['Booked','Delivered','Invoiced','Paid'].includes(q.status));
  const rev=booked.reduce((s,q)=>s+(q.totalCustomer||0),0);
  const prof=booked.reduce((s,q)=>s+getShipmentProfit(q,'freight').profit,0);
  const winRate=decided.length>0?booked.length/decided.length:0;
  $('page').innerHTML=`
    <div class="kpi-grid" style="margin-bottom:16px">
      <div class="kpi"><div class="kpi-lbl">Total quotes</div><div class="kpi-val">${all.length}</div><div style="font-size:11px;color:var(--gray-400);margin-top:4px">${booked.length} booked</div></div>
      <div class="kpi"><div class="kpi-lbl">Win rate</div><div class="kpi-val b">${all.length>0?pct(winRate):'—'}</div><div style="font-size:11px;color:var(--gray-400);margin-top:4px">of all quotes</div></div>
      <div class="kpi"><div class="kpi-lbl">Revenue</div><div class="kpi-val g">${rev>0?fmtD(rev):'—'}</div><div style="font-size:11px;color:var(--gray-400);margin-top:4px">booked only</div></div>
      <div class="kpi"><div class="kpi-lbl">Profit</div><div class="kpi-val g">${prof>0?fmtD(prof):'—'}</div></div>
    </div>
    ${all.length?`<div class="card"><div class="sec-head">Recent transload quotes</div>
      <div class="tbl-wrap" style="box-shadow:none;border:none"><table>
        <thead><tr><th>Date</th><th>Customer</th><th>Origin</th><th>Warehouse</th><th>Total</th><th>Status</th></tr></thead>
        <tbody>${all.slice(0,8).map(q=>`<tr>
          <td class="muted small">${q.date}${q.drayType==='export'?'<br><span class="badge" style="font-size:9px;background:#92400e;color:#fff">EXP</span>':''}${(q.containerCount||1)>1?`<br><span class="badge" style="font-size:9px;background:#f59e0b;color:#fff">×${q.containerCount}</span>`:''}</td><td class="bold">${q.customer}</td>
          <td class="muted small">${q.drayPort?q.drayPort.split(',')[0]:'—'}</td>
          <td class="muted small">${q.warehouseName||'—'}</td>
          <td class="bold" style="color:var(--steel)">${fmtD(q.totalCustomer)}</td>
          <td><span class="badge ${q.status==='Booked'?'g':q.status==='Lost'?'gr':'a'}">${q.status}</span></td>
        </tr>`).join('')}</tbody>
      </table></div></div>`:'<div class="empty"><div class="empty-ico">📊</div><p>No transload quotes yet — save a quote to see stats here</p></div>'}`;
}

async function saveTlQuote(){
  const tl=S.tl;const t=calcTlTotals(tl);
  // Step validation removed — each step is optional
  if(t.totalCustomer===0&&t.totalCost===0){alert('Please enter at least one rate.');return;}
  const wh=tl.warehouseId?(window._tlWarehouses||[]).find(w=>w.id===tl.warehouseId):null;
  const selDray=S.rates.find(r=>r.id===tl.selDrayId);
  const selFtl=window._fqRates?.find(r=>r.id===tl.selFtlId);
  const entry={
    id:uid(),date:localDateStr(),
    customer:tl.customer||'—',
    drayPort:tl.drayPort,drayZip:tl.drayZip,drayLd:tl.drayLd,
    drayCarrier:selDray?selDray.carrier:tl.drayManualCarrier||'—',
    drayCarrierCost:t.drayCarrier,drayCustomerPrice:t.drayCustomer,
    warehouseName:wh?wh.name:tl.useManual?tl.warehouseManual.name:'—',
    warehouseAddress:wh?`${wh.address}, ${wh.city}, ${wh.state} ${wh.zip}`:tl.useManual?`${tl.warehouseManual.address}, ${tl.warehouseManual.city}, ${tl.warehouseManual.state} ${tl.warehouseManual.zip}`:'—',
    cargoType:tl.cargoType,chargeMode:tl.chargeMode,palletCount:tl.palletCount,
    tlItems:JSON.parse(JSON.stringify(tl.tlItems)),tlFlatCarrier:tl.tlFlatCarrier,tlFlatCustomer:tl.tlFlatCustomer,
    tlCarrierCost:t.tlCarrier,tlCustomerPrice:t.tlCustomer,
    outDeliveryZip:tl.outDeliveryZip,outEquipment:tl.outEquipment,outMode:tl.outMode||'FTL',
    outMultiStop:tl.outMultiStop||false,outStops:tl.outMultiStop?[...(tl.outStops||[])]:null,
    outCarrier:selFtl?selFtl.carrier:tl.outManualCarrier||tl.outLtlCarrier||'—',
    outCarrierCost:t.outCarrier,outCustomerPrice:t.outCustomer,
    totalCarrier:t.totalCarrier,totalCustomer:t.totalCustomer,
    profit:t.totalProfit,profitPct:t.margin,
    notes:tl.notes,shiflRef:tl.shiflRef||'',status:'Quoted',
    rawTl:JSON.parse(JSON.stringify(tl))
  };
  if(!window._tlHistory) window._tlHistory=[];
  window._tlHistory.unshift(entry);
  try{await dbSaveTlQuote(entry);}catch(e){console.log('Supabase tl save error:',e.message);}
  logAction('quote_created',`Transload — ${tl.customer||'—'} | $${(entry.totalCustomer||0).toFixed(2)}`,'tl_quote',entry.id);
  try{localStorage.setItem('tl_history',JSON.stringify(window._tlHistory.slice(0,500)));}catch(e){}
  alert(`✅ Transload quote saved!\n\nCustomer total: ${fmtD(t.totalCustomer)}\nProfit: ${fmtD(t.totalProfit)} (${pct(t.margin)})`);
  S.tl=defaultTlState();
  setTlTab('log');
}

// PDF placeholder (will be fleshed out)
// ── Transload PDFs ────────────────────────────────────────────────────────
async function loadJsPDF(){
  if(typeof window.jspdf!=='undefined') return true;
  try{await new Promise((res,rej)=>{const s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';s.onload=res;s.onerror=rej;document.head.appendChild(s);});return true;}
  catch(e){alert('PDF library failed to load.');return false;}
}

async function downloadTlCustomerPDF(idx, rawTl, existingDoc){
  if(!existingDoc&&!await loadJsPDF()) return;
  const q=idx!==null&&idx!==undefined?(window._tlHistory||[])[idx]:null;
  const tl=rawTl||(q?q.rawTl:null);
  if(!tl&&!q){alert('No quote data.');return;}
  const{jsPDF}=window.jspdf;
  const doc=existingDoc||new jsPDF({orientation:'portrait',unit:'mm',format:'a4'});
  const W=210,M=14,CW=W-M*2;
  const navy=[26,46,74],steel=[46,92,150],green=[30,110,60];
  const date=q?q.date:localDateStr();
  const customer=q?q.customer:(tl?.customer||'—');
  let y=0;

  // Header
  doc.setFillColor(...navy);doc.rect(0,0,W,36,'F');
  doc.addImage(SHIFL_LOGO_B64,'PNG',10,10,60,15);
  doc.setTextColor(180,200,230);doc.setFont('helvetica','normal');doc.setFontSize(9);doc.text('Transload Service Quote',W-M,22,{align:'right'});
  doc.setFontSize(9);doc.setTextColor(255,255,255);doc.text(date,W-M,22,{align:'right'});

  // Meta bar
  doc.setFillColor(240,244,250);doc.rect(0,36,W,20,'F');
  doc.setFont('helvetica','bold');doc.setFontSize(10);doc.setTextColor(...navy);
  doc.text('Customer: '+customer,M,47);
  if(q?.palletCount){
    const cargo=(q.cargoType==='floorLoaded'?'Floor Loaded':'Palletized');
    doc.setFont('helvetica','normal');doc.setFontSize(8.5);doc.setTextColor(90,110,135);
    doc.text(q.palletCount+' pallets  ·  '+cargo,M,54);
  }
  doc.setFont('helvetica','bold');doc.setFontSize(9);doc.setTextColor(...steel);
  doc.text('QUOTE',W-M,47,{align:'right'});
  y=64;

  function checkPageC(){if(y>252){doc.addPage();y=16;}}
  function section(colorArr,title,subLines,rows,subtotal){
    checkPageC();
    doc.setFillColor(...colorArr);doc.roundedRect(M,y,CW,10,1,1,'F');
    doc.setFont('helvetica','bold');doc.setFontSize(9.5);doc.setTextColor(255,255,255);
    doc.text(doc.splitTextToSize(title,CW-8)[0],M+4,y+7.5);
    y+=13;
    subLines.filter(l=>l&&l.trim()).forEach(line=>{
      const wrapped=doc.splitTextToSize(line.trim(),CW-8);
      doc.setFont('helvetica','normal');doc.setFontSize(8);doc.setTextColor(90,110,135);
      wrapped.slice(0,2).forEach(wl=>{doc.text(wl,M+4,y);y+=5;});
    });
    if(subLines.some(l=>l&&l.trim())) y+=2;
    // Column headers
    doc.setFillColor(243,246,251);doc.rect(M,y,CW,7,'F');
    doc.setFont('helvetica','bold');doc.setFontSize(7);doc.setTextColor(130,140,160);
    doc.text('SERVICE',M+4,y+5);doc.text('AMOUNT',W-M-2,y+5,{align:'right'});
    y+=9;
    // Rows
    rows.forEach(([label,amount],ri)=>{
      if(amount<=0) return;
      if(ri%2===0){doc.setFillColor(250,252,255);doc.rect(M,y,CW,10,'F');}
      doc.setFont('helvetica','normal');doc.setFontSize(9);doc.setTextColor(45,58,78);
      doc.text(doc.splitTextToSize(label,CW-55)[0],M+4,y+7);
      doc.setFont('helvetica','bold');doc.setTextColor(...navy);
      doc.text(fmtD(amount),W-M-2,y+7,{align:'right'});
      doc.setDrawColor(230,234,242);doc.setLineWidth(0.2);doc.line(M,y+10,W-M,y+10);
      y+=10;
    });
    // Subtotal
    y+=2;
    doc.setFillColor(230,237,250);doc.roundedRect(M,y,CW,11,1,1,'F');
    doc.setFont('helvetica','bold');doc.setFontSize(9);doc.setTextColor(...navy);
    doc.text('Section total',M+4,y+8);
    doc.setFontSize(11);doc.text(fmtD(subtotal),W-M-2,y+8,{align:'right'});
    y+=16;
  }

  // Drayage
  const sel=tl?S.rates.find(r=>r.id===tl.selDrayId):null;
  let drayRows=[],drayTotal=0;
  if(sel&&tl){
    CHARGES.filter(c=>isApplicable(c,tl.drayLd)).forEach(c=>{
      const cuv=tlCuRate(Number(sel[c])||0,c,tl);
      if(cuv>0){drayRows.push([LABELS[c],cuv]);drayTotal+=cuv;}
    });
  } else if(q?.drayCustomerPrice>0){
    drayRows.push(['Drayage',q.drayCustomerPrice]);drayTotal=q.drayCustomerPrice;
  }
  if(drayTotal>0){
    section([26,80,150],'INBOUND DRAYAGE',
      ['Origin: '+(q?q.drayPort:tl?.drayPort||'—')+' to '+(q?q.drayZip:tl?.drayZip||'—')+' ('+(q?q.drayLd:tl?.drayLd||'Live')+')'],
      drayRows,drayTotal);
  }

  // Transload
  let tlRows=[],tlTotal=0;
  const pCount=parseInt(q?.palletCount||tl?.palletCount)||1;
  const chargeMode=q?.chargeMode||tl?.chargeMode;
  if(chargeMode==='flat'){
    const cuv=parseFloat(q?.tlFlatCustomer||tl?.tlFlatCustomer)||0;
    if(cuv>0){tlRows.push(['Full transload service',cuv]);tlTotal=cuv;}
  } else {
    const items=q?.tlItems||tl?.tlItems;
    if(items) Object.entries(items).forEach(([k,item])=>{
      if(!item.included) return;const def=TL_ITEMS_DEF[k];if(!def) return;
      let qty=def.unit==='perPallet'?pCount:def.unit==='perPalletPerDay'?pCount*(parseInt(item.days)||0):1;
      const cuv=(parseFloat(item.customerPrice)||0)*qty;
      if(cuv>0){tlRows.push([def.label+(qty>1?' × '+qty:''),cuv]);tlTotal+=cuv;}
    });
  }
  if(tlTotal>0){
    section([30,110,65],'TRANSLOAD SERVICES',
      ['Warehouse: '+((q?.warehouseAddress||'').split(' ').pop()||'—')+' area'],  // customer PDF — ZIP only
      tlRows,tlTotal);
  }

  // Outbound
  const outMode=q?.outMode||tl?.outMode||'FTL';
  let outTotal=0,outRows=[];
  if(q){outTotal=q.outCustomerPrice||0;}
  else if(tl){
    const b=parseFloat(tl.outManualRate)||0;
    outTotal=tl.outMarkupMode==='pct'?b*(1+(tl.outMarkupAmount||0)/100):b+(Number(tl.outMarkupAmount)||0);
  }
  // Always show outbound section if we have any info
  {
    const multiStop=q?.outMultiStop||tl?.outMultiStop;
    const stops=q?.outStops||tl?.outStops;
    const outZip=q?.outDeliveryZip||tl?.outDeliveryZip||'—';
    const outEquip=q?.outEquipment||tl?.outEquipment||'';
    if(multiStop&&stops?.length&&outMode==='LTL'){
      stops.filter(s=>s.zip).forEach((s,i)=>outRows.push(['LTL Stop '+(i+1)+' → '+s.zip+(s.carrier?' ('+s.carrier+')':''),parseFloat(s.customerRate)||0]));
    } else if(outTotal>0){outRows=[['Freight rate',outTotal]];}
    else {outRows=[['Freight rate — TBD',0]];}
    const delivLine=(multiStop&&stops?.length)?stops.filter(s=>s.zip).map((s,i)=>'Stop '+(i+1)+': '+s.zip).join('  ·  '):'Delivery ZIP: '+outZip;
    if(outTotal>0||outZip!=='—'){
      section([160,90,10],'OUTBOUND '+outMode,[outEquip||'',delivLine],outRows.filter(r=>r[1]>0),outTotal);
    }
  }

  // Grand total
  const grandTotal=drayTotal+tlTotal+outTotal;
  y+=2;
  doc.setFillColor(...navy);doc.roundedRect(M,y,CW,18,2,2,'F');
  doc.setFont('helvetica','bold');doc.setFontSize(12);doc.setTextColor(255,255,255);
  doc.text('GRAND TOTAL',M+6,y+12);
  doc.setFontSize(20);doc.text(fmtD(grandTotal),W-M-4,y+13,{align:'right'});
  y+=24;

  // Notes
  const notes=q?.notes||tl?.notes;
  if(notes&&notes.trim()){
    const nl=doc.splitTextToSize(notes.trim(),CW-12);
    const bh=nl.length*5+16;
    if(y+bh>272){doc.addPage();y=16;}
    doc.setFillColor(240,247,255);doc.roundedRect(M,y,CW,bh,2,2,'F');
    doc.setDrawColor(180,210,240);doc.setLineWidth(0.3);doc.roundedRect(M,y,CW,bh,2,2,'S');
    doc.setFont('helvetica','bold');doc.setFontSize(7.5);doc.setTextColor(...steel);
    doc.text('NOTES & CONDITIONS',M+5,y+9);
    doc.setFont('helvetica','normal');doc.setFontSize(8.5);doc.setTextColor(55,70,90);
    nl.forEach((l,i)=>doc.text(l,M+5,y+16+(i*5)));
  }

  doc.setFontSize(7.5);doc.setFont('helvetica','italic');doc.setTextColor(180,188,200);
  doc.text('Quote valid 30 days  |  Rates subject to change  |  mk@shifl.com',M,285);
  if(!existingDoc) doc.save('Shifl_Transload_'+customer.replace(/\s+/g,'_')+'_'+date+'.pdf');
}

async function downloadTlInternalPDF(idx){
  if(!await loadJsPDF()) return;
  const q=(window._tlHistory||[])[idx];if(!q){showToast('Quote not found','error');return;}
  try{
  const{jsPDF}=window.jspdf;
  const doc=new jsPDF({orientation:'portrait',unit:'mm',format:'a4'});
  const W=210,M=14,CW=W-M*2;
  const navy=[26,46,74],green=[30,110,60],steel=[46,92,150];
  const LMAX=85,CX=M+LMAX+5,CU=162,CP=W-M;
  let y=0;
  function checkPage(){if(y>255){doc.addPage();y=16;}}

  // Header
  doc.setFillColor(...navy);doc.rect(0,0,W,36,'F');
  doc.addImage(SHIFL_LOGO_B64,'PNG',10,10,60,15);
  doc.setTextColor(180,200,230);doc.setFont('helvetica','normal');doc.setFontSize(9);doc.text('Transload Rate Sheet',W-M,22,{align:'right'});
  doc.setFillColor(200,35,35);doc.roundedRect(W-62,9,47,13,2,2,'F');
  doc.setFont('helvetica','bold');doc.setFontSize(8);doc.setTextColor(255,255,255);
  doc.text('INTERNAL USE ONLY',W-38.5,17.5,{align:'center'});

  // Meta bar (taller — 24mm)
  doc.setFillColor(240,244,250);doc.rect(0,36,W,24,'F');
  doc.setFont('helvetica','bold');doc.setFontSize(10);doc.setTextColor(...navy);
  doc.text('Customer: '+q.customer,M,47);
  doc.setFont('helvetica','normal');doc.setFontSize(8.5);doc.setTextColor(90,110,135);
  doc.text('Date: '+q.date,M,55);
  doc.setFont('helvetica','bold');doc.setFontSize(9);doc.setTextColor(...navy);
  doc.text('Status: '+q.status,W/2,47,{align:'center'});
  if(q.bookedDate){doc.setTextColor(...green);doc.text('Booked: '+q.bookedDate,W/2,55,{align:'center'});}
  if(q.palletCount){
    doc.setFont('helvetica','normal');doc.setFontSize(9);doc.setTextColor(90,110,135);
    doc.text(q.palletCount+' pallets',W-M,47,{align:'right'});
  }
  y=68;

  function checkPage(){
    if(y>252){doc.addPage();y=16;
      doc.setFillColor(255,255,255);doc.rect(0,0,W,H,'F');
    }
  }
  function secHeader(colorArr,title,subInfo){
    checkPage();
    doc.setFillColor(...colorArr);doc.roundedRect(M,y,CW,10,1,1,'F');
    doc.setFont('helvetica','bold');doc.setFontSize(9.5);doc.setTextColor(255,255,255);
    doc.text(doc.splitTextToSize(title,CW-8)[0],M+4,y+7.5);
    y+=13;
    if(subInfo&&subInfo.trim()){
      const wrapped=doc.splitTextToSize(subInfo.trim(),CW-8);
      doc.setFont('helvetica','normal');doc.setFontSize(8);doc.setTextColor(90,110,135);
      wrapped.slice(0,2).forEach(l=>{doc.text(l,M+4,y);y+=5;});
      y+=2;
    }
    doc.setFillColor(240,243,249);doc.rect(M,y,CW,8,'F');
    doc.setFont('helvetica','bold');doc.setFontSize(7);doc.setTextColor(120,130,150);
    doc.text('SERVICE',M+4,y+5.5);
    doc.text('CARRIER COST',CX,y+5.5,{align:'right'});
    doc.text('CUSTOMER PRICE',CU,y+5.5,{align:'right'});
    doc.text('PROFIT',CP,y+5.5,{align:'right'});
    y+=10;
  }

  function dataRow(label,carrier,customer){
    checkPage();
    const profit=customer-carrier;
    doc.setFillColor(250,252,255);doc.rect(M,y,CW,11,'F');
    doc.setFont('helvetica','normal');doc.setFontSize(9);doc.setTextColor(45,58,78);
    doc.text(doc.splitTextToSize(String(label),LMAX)[0],M+4,y+8);
    doc.setTextColor(100,115,135);doc.text(carrier>0?fmtD(carrier):'—',CX,y+8,{align:'right'});
    doc.setFont('helvetica','bold');doc.setTextColor(...navy);doc.text(customer>0?fmtD(customer):'—',CU,y+8,{align:'right'});
    const pc=profit>0?green:[180,40,40];
    doc.setTextColor(...pc);doc.text(profit!==0?(profit>0?'+':'')+fmtD(profit):'—',CP,y+8,{align:'right'});
    doc.setDrawColor(228,234,244);doc.setLineWidth(0.2);doc.line(M,y+11,W-M,y+11);
    y+=11;
  }

  function secTotal(carrier,customer){
    checkPage();
    const profit=customer-carrier;
    y+=2;
    doc.setFillColor(228,235,248);doc.roundedRect(M,y,CW,12,1,1,'F');
    doc.setFont('helvetica','bold');doc.setFontSize(9);doc.setTextColor(...navy);
    doc.text('Section total',M+4,y+9);
    doc.setTextColor(80,95,120);doc.text(fmtD(carrier),CX,y+9,{align:'right'});
    doc.setTextColor(...navy);doc.text(fmtD(customer),CU,y+9,{align:'right'});
    doc.setTextColor(...green);doc.text((profit>=0?'+':'')+fmtD(profit),CP,y+9,{align:'right'});
    y+=18;
  }

  // Drayage
  secHeader([26,80,150],
    (q.drayType==='export'?'OUTBOUND DRAYAGE  |  Carrier: ':'INBOUND DRAYAGE  |  Carrier: ')+(q.drayCarrier||'—'),
    'Origin: '+q.drayPort+' → '+q.drayZip+' ('+q.drayLd+')');
  const tl=q.rawTl;const sel=tl?S.rates.find(r=>r.id===tl.selDrayId):null;
  if(sel&&tl){
    CHARGES.filter(c=>isApplicable(c,tl.drayLd)).forEach(c=>{
      const cv=Number(sel[c])||0;const cuv=tlCuRate(cv,c,tl);
      if(!cuv&&!cv) return;dataRow(LABELS[c],cv,cuv);
    });
  } else {dataRow('Drayage',q.drayCarrierCost||0,q.drayCustomerPrice||0);}
  secTotal(q.drayCarrierCost||0,q.drayCustomerPrice||0);

  // Transload
  secHeader([30,100,60],
    'TRANSLOAD SERVICES  |  Warehouse: '+(q.warehouseName||'—'),
    q.warehouseAddress||'');
  const pCount=parseInt(q.palletCount)||1;
  if(q.chargeMode==='byItem'&&q.tlItems){
    Object.entries(q.tlItems).forEach(([k,item])=>{
      if(!item.included) return;const def=TL_ITEMS_DEF[k];if(!def) return;
      let qty=def.unit==='perPallet'?pCount:def.unit==='perPalletPerDay'?pCount*(parseInt(item.days)||0):1;
      dataRow(def.label+(qty>1?' × '+qty:''),(parseFloat(item.carrierCost)||0)*qty,(parseFloat(item.customerPrice)||0)*qty);
    });
  } else {dataRow('Full transload service',parseFloat(q.tlFlatCarrier)||0,parseFloat(q.tlFlatCustomer)||0);}
  secTotal(q.tlCarrierCost||0,q.tlCustomerPrice||0);

  // Outbound
  const outMode=q.outMode||'FTL';
  const outCarrierLabel=(q.outMultiStop&&q.outMode==='LTL')?'Multiple LTL':'Carrier: '+(q.outCarrier||'—');
  let outDeliv=(q.outEquipment&&outMode==='FTL'?q.outEquipment+' | ':'');
  if(q.outMultiStop&&q.outStops?.length){
    outDeliv+=q.outStops.filter(s=>s.zip).map((s,i)=>'Stop '+(i+1)+': '+s.zip).join('  ·  ');
  } else {outDeliv+='Delivery: '+(q.outDeliveryZip||'—');}
  secHeader([155,85,10],'OUTBOUND '+outMode+'  |  '+outCarrierLabel,outDeliv);
  if(q.outMultiStop&&q.outMode==='LTL'&&q.outStops?.length){
    q.outStops.forEach((s,i)=>dataRow('Stop '+(i+1)+': '+(s.carrier||'—')+' → '+(s.zip||'—'),parseFloat(s.carrierRate)||0,parseFloat(s.customerRate)||0));
  } else {dataRow('Freight rate',q.outCarrierCost||0,q.outCustomerPrice||0);}
  secTotal(q.outCarrierCost||0,q.outCustomerPrice||0);

  // Grand total
  doc.setFillColor(...navy);doc.roundedRect(M,y,CW,18,2,2,'F');
  doc.setFont('helvetica','bold');doc.setFontSize(12);doc.setTextColor(255,255,255);
  doc.text('GRAND TOTAL',M+6,y+12);
  doc.setFontSize(8.5);doc.setTextColor(200,210,230);
  doc.text(fmtD(q.totalCarrier||0),CX,y+12,{align:'right'});
  doc.setFontSize(18);doc.setTextColor(255,255,255);
  doc.text(fmtD(q.totalCustomer||0),CU,y+12,{align:'right'});
  doc.setFontSize(10);doc.setTextColor(120,255,160);
  doc.text('+'+(fmtD(q.profit||0)),CP,y+12,{align:'right'});
  y+=24;

  // Billing summary
  if(y>255){doc.addPage();y=16;}
  doc.setDrawColor(210,220,235);doc.setLineWidth(0.4);doc.line(M,y,W-M,y);y+=8;
  doc.setFont('helvetica','bold');doc.setFontSize(8);doc.setTextColor(120,135,155);
  doc.text('BILLING SUMMARY',M,y);y+=9;
  [['Customer Invoice Total',fmtD(q.totalCustomer||0),[0,90,160]],
   ['Carrier Cost',fmtD(q.totalCarrier||0),[90,100,120]],
   ['Profit',fmtD(q.profit||0),[...green]],
   ['Margin',pct(q.profitPct||0),[...green]]
  ].forEach(([l,v,col])=>{
    doc.setFont('helvetica','normal');doc.setFontSize(9.5);doc.setTextColor(70,85,105);
    doc.text(l,M+4,y);
    doc.setFont('helvetica','bold');doc.setTextColor(...col);
    doc.text(v,W-M,y,{align:'right'});
    doc.setDrawColor(230,236,245);doc.setLineWidth(0.2);doc.line(M,y+4,W-M,y+4);
    y+=11;
  });

  doc.setFontSize(7.5);doc.setFont('helvetica','italic');doc.setTextColor(175,182,195);
  doc.text('Confidential — do not share with carriers or customers.',M,282);
  doc.text('Generated by Shifl Logistics  |  '+localDateStr(),M,287);
  doc.save('Shifl_TL_RateSheet_'+q.customer.replace(/\s+/g,'_')+'_'+q.date+'.pdf');
  }catch(e){console.error('TL PDF error:',e);showToast('PDF error: '+e.message,'error');}
}

// ACTIVE SHIPMENTS
// ═══════════════════════════════════════════════════════
const CARRIER_TRACK_URLS={
  'xpo':           'https://www.xpo.com/en-us/tracking?trackingNumber={pro}',
  'fedex':         'https://www.fedex.com/fedextrack/?tracknumbers={pro}',
  'fedex freight': 'https://www.fedex.com/fedextrack/?tracknumbers={pro}',
  'old dominion':  'https://www.odfl.com/us/en/tools/tracking.html?proNumber={pro}',
  'odfl':          'https://www.odfl.com/us/en/tools/tracking.html?proNumber={pro}',
  'estes':         'https://www.estes-express.com/myestes/shipment-tracking/?search={pro}',
  'abf':           'https://arcb.com/tools/tracking.html?pro={pro}',
  'saia':          'https://www.saia.com/track/details?pro={pro}',
  'r+l':           'https://www.rlcarriers.com/freight/shipping/r-l-carriers-tracking/?pro={pro}',
  'r&l':           'https://www.rlcarriers.com/freight/shipping/r-l-carriers-tracking/?pro={pro}',
  'averitt':       'https://www.averittexpress.com/tools/track-a-shipment.jsf?trackValues={pro}',
  'southeastern':  'https://www.sefl.com/freight-tracking/?proNumber={pro}',
  'sefl':          'https://www.sefl.com/freight-tracking/?proNumber={pro}',
  'ups':           'https://www.ups.com/track?tracknum={pro}',
  'forward air':   'https://www.forwardair.com/en/tracing/pro-trace?proNumber={pro}',
  'pilot':         'https://www.pilotdelivers.com/track/?tracknumber={pro}',
};
function getCarrierTrackUrl(carrier,pro){
  if(!carrier||!pro) return null;
  const key=carrier.toLowerCase().trim();
  for(const[name,url]of Object.entries(CARRIER_TRACK_URLS)){
    if(key.includes(name)) return url.replace('{pro}',encodeURIComponent(pro));
  }
  return null;
}
function loadActiveTracking(){try{window._activeTracking=JSON.parse(localStorage.getItem('active_tracking')||'{}');}catch(e){window._activeTracking={};}}
function saveActiveTracking(){try{localStorage.setItem('active_tracking',JSON.stringify(window._activeTracking));}catch(e){}}
function setActiveTracking(id,key,val){
  if(!window._activeTracking) window._activeTracking={};
  if(!window._activeTracking[id]) window._activeTracking[id]={};
  window._activeTracking[id][key]=val;
  saveActiveTracking();
  renderActive();
}
function getAllShipmentsByStatus(statuses){
  const items=[];
  // 'Container Returned' is legacy name for Delivered on drayage
  const drayStatuses=statuses.map(s=>s==='Delivered'?['Delivered','Container Returned']:[s]).flat();
  (S.quotes||[]).filter(q=>drayStatuses.includes(q.status)).forEach(q=>{
    items.push({type:'drayage',id:q.id,customer:q.customer,carrier:q.carrier,bookingNum:q.bookingNum||'',
      date:q.date,bookedDate:q.baseMarkup?.bookedDate||q.date,
      from:q.port,to:q.zip,mode:q.ld,destination:q.destination,
      total:q.customerRates?.total||0,shiflRef:q.shiflRef,status:q.status});
  });
  (window._fqHistory||[]).filter(q=>statuses.includes(q.status)).forEach(q=>{
    items.push({type:'freight',id:q.id,customer:q.customer,carrier:q.carrier,
      date:q.date,bookedDate:q.bookedDate||q.date,
      fqMode:q.fqMode,fqEquip:q.fqEquip,
      from:q.pickupZip,to:q.deliveryZip,total:q.customerRate||0,
      weight:q.weight,palletCount:q.palletCount,transitTime:q.transitTime,shiflRef:q.shiflRef||'',status:q.status});
  });
  (window._tlHistory||[]).filter(q=>statuses.includes(q.status)).forEach(q=>{
    items.push({type:'transload',id:q.id,customer:q.customer,
      carrier:q.outCarrier,date:q.date,bookedDate:q.bookedDate||q.date,
      from:q.drayPort,warehouse:q.warehouseName,to:q.outDeliveryZip,
      outMode:q.outMode,total:q.totalCustomer||0,shiflRef:q.shiflRef||'',status:q.status});
  });
  return items.sort((a,b)=>(b.bookedDate||b.date).localeCompare(a.bookedDate||a.date));
}
function getAllActiveShipments(){ return getAllShipmentsByStatus(['Booked']); }
function updateActiveBadge(){
  const count=getAllActiveShipments().length;
  const badge=$('active-badge');
  if(badge){badge.textContent=count;badge.style.display=count>0?'':'none';}
}
async function markShipmentClosed(type,id,closeStatus){
  // Require Shifl Ref# before marking as Delivered
  if(closeStatus==='Delivered'){
    let ref='';
    if(type==='drayage'){const q=S.quotes.find(q=>q.id===id);ref=q?.shiflRef||'';}
    else if(type==='freight'){const q=(window._fqHistory||[]).find(q=>q.id===id);ref=q?.shiflRef||'';}
    else if(type==='transload'){const q=(window._tlHistory||[]).find(q=>q.id===id);ref=q?.shiflRef||'';}
    else if(type==='air'){const q=(window._aqHistory||[]).find(q=>q.id===id);ref=q?.shiflRef||'';}
    if(!ref.trim()){
      const entered=prompt('⚠️ A Shifl Ref # is required before marking as Delivered.\n\nEnter Shifl Ref # to continue:');
      if(!entered||!entered.trim()){alert('Shifl Ref # is required. Shipment not updated.');return;}
      // Save the ref# to the shipment
      if(type==='drayage'){const q=S.quotes.find(q=>q.id===id);if(q){q.shiflRef=entered.trim();try{await db.from('quotes').update({shifl_ref:entered.trim()}).eq('id',id);}catch(e){}}}
      else if(type==='freight'){const q=(window._fqHistory||[]).find(q=>q.id===id);if(q){q.shiflRef=entered.trim();try{localStorage.setItem('fq_history',JSON.stringify(window._fqHistory));}catch(e){}}}
      else if(type==='transload'){const q=(window._tlHistory||[]).find(q=>q.id===id);if(q){q.shiflRef=entered.trim();try{localStorage.setItem('tl_history',JSON.stringify(window._tlHistory));}catch(e){}}}
      else if(type==='air'){const q=(window._aqHistory||[]).find(q=>q.id===id);if(q){q.shiflRef=entered.trim();try{localStorage.setItem('aq_history',JSON.stringify(window._aqHistory));}catch(e){}}}
    }
  }
  if(!confirm('Mark as "'+closeStatus+'"? This will move it to the Completed tab.')) return;
  if(type==='drayage'){
    const q=S.quotes.find(q=>q.id===id);
    if(q){
      try{
        await dbUpdateQuoteStatus(id,closeStatus);
        q.status=closeStatus;
        q.bookedDate=q.bookedDate||localDateStr();
        try{localStorage.setItem('shifl_quotes_cache',JSON.stringify(S.quotes));}catch(_){}
      }catch(e){alert('Save failed: '+e.message);return;}
    }
  } else if(type==='freight'){
    const q=(window._fqHistory||[]).find(q=>q.id===id);
    if(q){q.status=closeStatus;try{await dbUpdateFqStatus(id,closeStatus);}catch(e){alert('Save failed: '+e.message);q.status='Booked';return;}
    try{localStorage.setItem('fq_history',JSON.stringify(window._fqHistory));}catch(e){}}
  } else if(type==='transload'){
    const q=(window._tlHistory||[]).find(q=>q.id===id);
    if(q){q.status=closeStatus;try{await dbUpdateTlStatus(id,closeStatus);}catch(e){}try{localStorage.setItem('tl_history',JSON.stringify(window._tlHistory));}catch(e){}}
  } else if(type==='air'){
    const q=(window._aqHistory||[]).find(q=>q.id===id);
    if(q){
      q.status=closeStatus;
      try{await dbSaveAqQuote(q);}catch(e){}
      try{localStorage.setItem('aq_history',JSON.stringify(window._aqHistory));}catch(e){}
    }
  }
  logAction('status_changed',`${type} shipment marked ${closeStatus}`,'shipment',id);
  updateActiveBadge();renderActive();
}
function renderActive(){
  /* ── v2 rebuild: 2-col draggable cards + search ── */
  if(!window._activeTracking) window._activeTracking={};
  if(S.activeView==='invoicing') S.activeView='active';
  const isCompleted = S.activeView==='completed';
  const statuses = isCompleted ? ['Delivered'] : ['Booked'];
  const all = getAllShipmentsByStatus(statuses);
  const activeCount = getAllActiveShipments().length;
  const search = (S.activeSearch||'').toLowerCase();

  // topbar
  $('topbar-right').innerHTML=`
    <div style="display:flex;align-items:center;gap:7px">
      <div style="display:flex;align-items:center;gap:6px;border:1px solid var(--gray-200);border-radius:7px;padding:0 10px;height:32px;background:#fff;min-width:200px">
        <span style="color:var(--gray-400);font-size:14px">🔍</span>
        <input id="active-search-input" placeholder="Customer, carrier, ref #..." value="${S.activeSearch||''}"
          oninput="S.activeSearch=this.value;filterActiveCards()"
          style="border:none;outline:none;font-size:12px;font-family:inherit;width:100%;color:var(--navy);background:transparent">
      </div>
      <div style="display:flex;background:var(--gray-100);border-radius:6px;padding:3px;gap:2px">
        <button onclick="S.activeView='active';S.activeFilter='all';S.activeSearch='';renderActive()"
          style="padding:4px 12px;border-radius:4px;border:none;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;background:${!isCompleted?'#fff':'none'};color:${!isCompleted?'var(--navy)':'var(--gray-500)'}">
          🟢 Active (${activeCount})
        </button>
        <button onclick="S.activeView='completed';S.activeFilter='all';S.activeSearch='';renderActive()"
          style="padding:4px 12px;border-radius:4px;border:none;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;background:${isCompleted?'#fff':'none'};color:${isCompleted?'var(--navy)':'var(--gray-500)'}">
          ✅ Delivered (${getAllShipmentsByStatus(['Delivered']).length})
        </button>
      </div>
      <button onclick="updateActiveBadge();renderActive()" title="Refresh"
        style="padding:5px 8px;background:none;border:1px solid var(--gray-200);border-radius:6px;cursor:pointer;font-size:13px">⟳</button>
    </div>`;

  // mode counts
  const counts={
    all:all.length,
    drayage:all.filter(s=>s.type==='drayage').length,
    ftl:all.filter(s=>s.type==='freight'&&s.fqMode==='FTL').length,
    ltl:all.filter(s=>s.type==='freight'&&(s.fqMode==='LTL'||(s.fqMode==='LCL'&&s.fqEquip==='LTL'))).length,
    lcl:all.filter(s=>s.type==='freight'&&s.fqMode==='LCL'&&s.fqEquip!=='LTL').length,
    transload:all.filter(s=>s.type==='transload').length,
  };
  const urgent = all.filter(s=>window._activeTracking[s.id]?.urgent);

  // filter + search
  let filtered = all.filter(s=>{
    if(S.activeFilter==='drayage') return s.type==='drayage';
    if(S.activeFilter==='ftl') return s.type==='freight'&&s.fqMode==='FTL';
    if(S.activeFilter==='ltl') return s.type==='freight'&&(s.fqMode==='LTL'||(s.fqMode==='LCL'&&s.fqEquip==='LTL'));
    if(S.activeFilter==='lcl') return s.type==='freight'&&s.fqMode==='LCL'&&s.fqEquip!=='LTL';
    if(S.activeFilter==='transload') return s.type==='transload';
    return true;
  });
  if(search) filtered = filtered.filter(s=>
    (s.customer+s.carrier+(s.shiflRef||'')+(s.to||s.zip||'')+(s.bookingNum||'')).toLowerCase().includes(search)
  );

  // restore saved order
  const savedOrder = JSON.parse(localStorage.getItem('tms_priority_order')||'[]');
  if(savedOrder.length) filtered.sort((a,b)=>{
    const ai=savedOrder.indexOf(a.id), bi=savedOrder.indexOf(b.id);
    if(ai===-1&&bi===-1) return 0;
    if(ai===-1) return 1; if(bi===-1) return -1;
    return ai-bi;
  });
  // urgent always float to top
  filtered.sort((a,b)=>{
    const au=window._activeTracking[a.id]?.urgent?1:0;
    const bu=window._activeTracking[b.id]?.urgent?1:0;
    return bu-au;
  });

  function daysAgo(d){return Math.floor((new Date()-new Date(d))/(86400000));}
  function countdown(exp){
    if(!exp) return null;
    const diff=Math.floor((new Date(exp).setHours(0,0,0,0)-new Date().setHours(0,0,0,0))/86400000);
    if(diff>1)  return{label:`Due in ${diff} days`,cls:'due-ok'};
    if(diff===1)return{label:'Due tomorrow',cls:'due-warn'};
    if(diff===0)return{label:'Due TODAY',cls:'due-hot'};
    return{label:`Overdue ${Math.abs(diff)}d`,cls:'due-hot'};
  }
  const modeColor={
    drayage:{bg:'#eff6ff',badge:'🚢 Drayage',bc:'#dbeafe',tc:'#1e40af'},
    freight:{bg:'#f5f3ff',badge:'🚛 Freight',bc:'#ede9fe',tc:'#5b21b6'},
    transload:{bg:'#fffbeb',badge:'🔄 Transload',bc:'#fef3c7',tc:'#92400e'},
  };

  const filterBar=`
    <div style="display:flex;gap:6px;margin-bottom:10px;flex-wrap:wrap;align-items:center">
      ${[['all','All',counts.all],['drayage','🚢 Drayage',counts.drayage],['ftl','🚛 FTL',counts.ftl],['ltl','📦 LTL',counts.ltl],['lcl','🌊 LCL',counts.lcl],['transload','🔄 Transload',counts.transload]].map(([id,label,n])=>`
      <button onclick="S.activeFilter='${id}';renderActive()"
        style="padding:4px 12px;border-radius:99px;font-size:11px;font-weight:500;cursor:pointer;border:1px solid ${S.activeFilter===id?'#0f172a':'var(--gray-200)'};background:${S.activeFilter===id?'#0f172a':'#fff'};color:${S.activeFilter===id?'#fff':'var(--gray-500)'};font-family:inherit">
        ${label} · ${n}
      </button>`).join('')}
      <span style="margin-left:auto;font-size:11px;color:var(--gray-400);display:flex;align-items:center;gap:4px">⠿ Drag to reorder</span>
    </div>
    ${urgent.length?`<div style="background:#fff0f0;border:1px solid #fca5a5;border-radius:7px;padding:7px 12px;margin-bottom:10px;display:flex;align-items:center;gap:7px;font-size:12px;font-weight:600;color:#dc2626">
      🔥 ${urgent.length} urgent — ${urgent.map(s=>s.customer).join(', ')}
    </div>`:''}`;

  if(!all.length){
    $('page').innerHTML=`<div style="padding:16px">${filterBar}<div class="empty">
      <div style="font-size:48px;margin-bottom:12px">🟢</div>
      <p style="font-size:16px;font-weight:600;color:var(--navy)">No ${isCompleted?'completed':'active'} shipments</p>
      <small style="color:var(--gray-400)">Mark any quote as Booked and it will appear here</small>
    </div></div>`;return;
  }
  if(!filtered.length){
    $('page').innerHTML=`<div style="padding:16px">${filterBar}<div class="empty">
      <div style="font-size:36px;margin-bottom:10px">🔍</div>
      <p style="font-weight:600;color:var(--navy)">No results</p>
      <small style="color:var(--gray-400)">Try a different search or filter</small>
    </div></div>`;return;
  }

  const cards = filtered.map(s=>{
    const mc = modeColor[s.type]||modeColor.freight;
    const tracking = window._activeTracking[s.id]||{};
    const isUrgent = !!tracking.urgent;
    const cd = countdown(tracking.expectedDate);
    const daysActive = daysAgo(s.bookedDate||s.date);
    const trackUrl = tracking.trackingUrl||getCarrierTrackUrl(s.carrier,tracking.pro)||'';
    const flagged = isFlagged(s.id);
    const fqMode = s.fqMode||'';
    const modeLabel = s.type==='drayage'?'🚢 Drayage':s.type==='transload'?'🔄 Transload':`🚛 ${fqMode||'Freight'}`;
    const headBg = isUrgent?'#fff8f8':mc.bg;
    const borderCol = isUrgent?'#fca5a5':'var(--gray-200)';

    // per-type extra fields
    const drayMeta = s.type==='drayage' ? getMeta(s.id) : {};
    const eta = drayMeta.containerETA || '';
    const etaDays = eta ? Math.ceil((new Date(eta)-new Date())/86400000) : null;
    const etaBadge = eta ? `<span onclick="event.stopPropagation();setContainerETA('${s.id}')" style="display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:99px;font-size:10px;font-weight:700;cursor:pointer;${etaDays<=0?'background:#fee2e2;color:#dc2626':etaDays<=2?'background:#fef3c7;color:#d97706':'background:#d1fae5;color:#059669'}" title="Click to edit ETA">
        🚢 ${etaDays<=0?'Arrived':etaDays===1?'ETA tomorrow':'ETA '+etaDays+'d'}
      </span>` : `<span onclick="event.stopPropagation();setContainerETA('${s.id}')" style="display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:99px;font-size:10px;font-weight:600;cursor:pointer;background:var(--gray-100);color:var(--gray-500)" title="Set container ETA">+ ETA</span>`;
    const extraFields = s.type==='drayage'
      ? `<div class="af"><div class="afl">Container</div><div class="afv">${s.bookingNum||getMeta(s.id).booking_num||'—'}</div></div>
         <div class="af"><div class="afl">Mode</div><div class="afv">${s.mode||s.ld||'—'}</div></div>
         <div class="af"><div class="afl">ETA</div><div class="afv">${eta?eta:'—'}</div></div>`
      : s.type==='freight'
      ? `<div class="af"><div class="afl">PRO #</div><div class="afv" style="color:${tracking.pro?'#2563eb':'var(--gray-400)'};">${tracking.pro||'—'}</div></div>
         <div class="af"><div class="afl">Weight</div><div class="afv">${s.weight||s.totalWeight||'—'}</div></div>`
      : `<div class="af"><div class="afl">Warehouse</div><div class="afv">${s.warehouse||'—'}</div></div>
         <div class="af"><div class="afl">Out carrier</div><div class="afv">${s.outCarrier||'—'}</div></div>`;

    return `<div class="active-card-v2" id="acard-${s.id}" draggable="true" data-id="${s.id}"
      style="background:#fff;border:1.5px solid ${borderCol};border-radius:12px;overflow:hidden;cursor:grab"
      ondragstart="acDragStart(event)" ondragover="acDragOver(event)" ondrop="acDrop(event)" ondragleave="acDragLeave(event)" ondragend="acDragEnd(event)">
      <div style="background:${headBg};padding:10px 13px;border-bottom:1px solid ${borderCol};display:flex;align-items:center;gap:7px">
        <span style="color:var(--gray-300);font-size:16px;cursor:grab">⠿</span>
        <span style="font-size:10px;font-weight:700;padding:2px 7px;border-radius:99px;text-transform:uppercase;letter-spacing:.04em;background:${mc.bc};color:${mc.tc};flex-shrink:0">${modeLabel}</span>
        ${isUrgent?'<span style="background:#ef4444;color:#fff;font-size:9px;font-weight:700;padding:2px 6px;border-radius:4px;flex-shrink:0">URGENT</span>':''}
        <span style="font-size:13px;font-weight:700;color:var(--navy);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${s.customer}</span>
        <button onclick="setActiveTracking('${s.id}','urgent',${!isUrgent});renderActive()"
          style="flex-shrink:0;padding:3px 9px;border-radius:99px;border:1px solid ${isUrgent?'#ef4444':'var(--gray-200)'};background:${isUrgent?'#ef4444':'transparent'};color:${isUrgent?'#fff':'var(--gray-400)'};font-size:11px;font-weight:600;cursor:pointer;font-family:inherit">
          🔥 ${isUrgent?'Hot':'Flag'}
        </button>
        <span style="font-size:13px;font-weight:700;color:#2563eb;flex-shrink:0">${fmtD(s.total)}</span>
      </div>
      <div style="padding:10px 13px">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:5px 12px;margin-bottom:9px">
          <div class="af"><div class="afl">Carrier</div><div class="afv">${s.carrier||'—'}</div></div>
          <div class="af"><div class="afl">Delivery</div><div class="afv">${s.to||s.zip||'—'}</div></div>
          <div class="af"><div class="afl">Shifl ref</div><div class="afv" style="color:#2563eb;font-family:monospace;font-size:11px">${s.shiflRef||'—'}</div></div>
          <div class="af"><div class="afl">Day</div><div class="afv">Day ${daysActive}</div></div>
          ${extraFields}
        </div>
        ${s.type==='drayage'?`<div style="margin-bottom:7px">${etaBadge}</div>`:''}
        ${cd?`<div;align-items:center;gap:4px;padding:4px 9px;border-radius:5px;font-size:11px;font-weight:600;margin-bottom:9px;${cd.cls==='due-ok'?'background:#f0fdf4;color:#15803d':cd.cls==='due-warn'?'background:#fffbeb;color:#92400e':'background:#fef2f2;color:#991b1b'}">
          ${cd.cls==='due-ok'?'✓':cd.cls==='due-warn'?'⚡':'⚠️'} ${cd.label}
        </div>`:''}
        <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;flex-wrap:wrap">
          <div style="display:flex;gap:4px;flex-wrap:wrap">
            <button onclick="${s.type==='drayage'?`setView('log');render();setTimeout(()=>showQuoteModal('${s.id}'),100)`:s.type==='freight'?`setView('freight');setFqTab('log');setTimeout(()=>{const idx=(window._fqHistory||[]).findIndex(q=>q.id==='${s.id}');if(idx>=0)showFqQuoteModal(idx);},100)`:`setView('transload');setTlTab('log');setTimeout(()=>{const idx=(window._tlHistory||[]).findIndex(q=>q.id==='${s.id}');if(idx>=0)showTlQuoteModal(idx);},100)`}"
              class="acbtn">📄 Quote</button>
            <button onclick="changeShipmentCarrier('${s.type}','${s.id}','${(s.carrier||'').replace(/'/g,'')}')" class="acbtn">🚛 Carrier</button>
            <button onclick="toggleFlag('${s.type}','${s.id}')" class="acbtn${flagged?' acbtn-red':''}" title="${flagged?'Remove flag':'Flag issue'}">🚨</button>
            <button onclick="showTrackingModal('${s.type}','${s.id}')" class="acbtn${trackUrl?' acbtn-blue':''}" title="Tracking">${trackUrl?'📍':'🔗'}</button>
            <button onclick="promptBookingNum('${s.type}','${s.id}')" class="acbtn${s.bookingNum?' acbtn-blue':''}" title="Booking #">📦</button>
            ${can('delete_quotes')?`<button onclick="deleteShipment('${s.type}','${s.id}')" class="acbtn acbtn-red" title="Delete">🗑️</button>`:''}
          </div>
          ${!isCompleted
            ?`<button onclick="markShipmentClosed('${s.type}','${s.id}','Delivered')"
                style="padding:5px 14px;background:#16a34a;color:#fff;border:none;border-radius:6px;font-size:11px;font-weight:700;cursor:pointer;font-family:inherit;white-space:nowrap">
                ✅ Delivered
              </button>`
            :`<div style="display:flex;gap:6px">
                <button onclick="revertToActive('${s.type}','${s.id}')"
                  style="padding:5px 12px;background:#fff;color:#d97706;border:1.5px solid #fbbf24;border-radius:6px;cursor:pointer;font-size:11px;font-weight:700;font-family:inherit">
                  ↩️ Revert
                </button>
                <button onclick="sendInvoiceFromShipment('${s.type}','${s.id}')"
                  style="padding:5px 12px;background:#fff;color:var(--steel);border:1.5px solid var(--steel);border-radius:6px;cursor:pointer;font-size:11px;font-weight:700;font-family:inherit">
                  🧾 Invoice
                </button>
              </div>`}
        </div>
      </div>
    </div>`;
  }).join('');

  $('page').innerHTML=`
    <style>
      .af{} .afl{font-size:9px;font-weight:600;color:var(--gray-400);text-transform:uppercase;letter-spacing:.05em;margin-bottom:2px} .afv{font-size:12px;font-weight:500;color:var(--navy);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .acbtn{padding:5px 8px;background:none;border:1px solid var(--gray-200);border-radius:5px;font-size:12px;cursor:pointer;font-family:inherit;color:var(--gray-500)}
      .acbtn:hover{background:var(--gray-50)}
      .acbtn-red{color:#dc2626;border-color:#fecaca;background:#fff8f8}
      .acbtn-blue{color:#2563eb;border-color:#bfdbfe;background:#eff6ff}
      .active-card-v2.ac-drag-over{outline:2px dashed #2563eb;outline-offset:2px}
      .active-card-v2.ac-dragging{opacity:.35}
    </style>
    <div style="padding:14px 18px">
      ${filterBar}
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px" id="active-grid">
        ${cards}
      </div>
    </div>`;
  return; // end of v2 — original code replaced

  // ── drag-and-drop helpers (defined once, outside renderActive) ──
}

// Apply rates from a past quote to the current quote builder
function renderCoverageMap(){
  var allQ=(S.quotes||[]).concat(window._fqHistory||[]).concat(window._aqHistory||[]);
  var sc={};
  allQ.forEach(function(q){
    var z=q.zip||q.deliveryZip||q.destZip||'';
    var st=zipToState(z);
    if(st&&st.length===2) sc[st]=(sc[st]||0)+1;
  });
  var covered=Object.keys(sc);
  var SN={AL:'Alabama',AK:'Alaska',AZ:'Arizona',AR:'Arkansas',CA:'California',CO:'Colorado',CT:'Connecticut',DE:'Delaware',DC:'DC',FL:'Florida',GA:'Georgia',HI:'Hawaii',ID:'Idaho',IL:'Illinois',IN:'Indiana',IA:'Iowa',KS:'Kansas',KY:'Kentucky',LA:'Louisiana',ME:'Maine',MD:'Maryland',MA:'Massachusetts',MI:'Michigan',MN:'Minnesota',MS:'Mississippi',MO:'Missouri',MT:'Montana',NE:'Nebraska',NV:'Nevada',NH:'New Hampshire',NJ:'New Jersey',NM:'New Mexico',NY:'New York',NC:'North Carolina',ND:'North Dakota',OH:'Ohio',OK:'Oklahoma',OR:'Oregon',PA:'Pennsylvania',RI:'Rhode Island',SC:'South Carolina',SD:'South Dakota',TN:'Tennessee',TX:'Texas',UT:'Utah',VT:'Vermont',VA:'Virginia',WA:'Washington',WV:'West Virginia',WI:'Wisconsin',WY:'Wyoming'};
  function col(n){if(!n)return'#f1f5f9';if(n<=3)return'#bfdbfe';if(n<=10)return'#3b82f6';return'#1d4ed8';}

  $('topbar-right').innerHTML='<button class="btn" onclick="renderCoverageMap()">Refresh</button>';

  var gridHTML='';
  if(covered.length){
    Object.entries(sc).sort(function(a,b){return b[1]-a[1];}).forEach(function(e){
      var st=e[0],n=e[1];
      gridHTML+='<div style="display:flex;align-items:center;justify-content:space-between;padding:7px 10px;background:#f8fafc;border-radius:8px;border:0.5px solid #e8eaed">'
        +'<div><div style="font-size:12px;font-weight:600;color:#0d1117">'+(SN[st]||st)+'</div><div style="font-size:10px;color:#9ca3af">'+st+'</div></div>'
        +'<div style="font-size:15px;font-weight:600;color:#2563eb">'+n+'</div></div>';
    });
  } else {
    gridHTML='<div style="color:var(--gray-400);font-size:13px;padding:8px">No delivery ZIP codes on quotes yet.</div>';
  }

  $('page').innerHTML=
    '<div style="margin-bottom:16px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px">'
    +'<div><h2 style="font-size:20px;font-weight:700;color:var(--navy);margin:0 0 4px">Coverage map</h2>'
    +'<p style="font-size:13px;color:var(--gray-500);margin:0">'+covered.length+' states covered</p></div>'
    +'<div style="display:flex;align-items:center;gap:12px;font-size:12px;color:var(--gray-500)">'
    +'<span style="display:flex;align-items:center;gap:5px"><span style="width:12px;height:12px;border-radius:2px;background:#bfdbfe;display:inline-block;border:1px solid #93c5fd"></span>1-3</span>'
    +'<span style="display:flex;align-items:center;gap:5px"><span style="width:12px;height:12px;border-radius:2px;background:#3b82f6;display:inline-block"></span>4-10</span>'
    +'<span style="display:flex;align-items:center;gap:5px"><span style="width:12px;height:12px;border-radius:2px;background:#1d4ed8;display:inline-block"></span>10+</span>'
    +'<span style="display:flex;align-items:center;gap:5px"><span style="width:12px;height:12px;border-radius:2px;background:#f1f5f9;border:1px solid #e2e8f0;display:inline-block"></span>None</span>'
    +'</div></div>'
    +'<div style="background:#fff;border:0.5px solid #e8eaed;border-radius:12px;overflow:hidden;margin-bottom:14px">'
    +'<svg id="cov-map" style="width:100%;height:540px;display:block"></svg>'
    +'<div id="cov-tip" style="display:none;position:fixed;background:#fff;border:0.5px solid #e8eaed;border-radius:8px;padding:8px 12px;font-size:13px;color:#0d1117;pointer-events:none;z-index:9999;box-shadow:0 4px 12px rgba(0,0,0,.1)"></div>'
    +'</div>'
    +'<div style="background:#fff;border:0.5px solid #e8eaed;border-radius:12px;padding:14px">'
    +'<div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;color:var(--gray-400);margin-bottom:10px">State breakdown</div>'
    +'<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(145px,1fr));gap:6px">'+gridHTML+'</div>'
    +'</div>';

  var stMap={'01':'AL','02':'AK','04':'AZ','05':'AR','06':'CA','08':'CO','09':'CT','10':'DE','11':'DC','12':'FL','13':'GA','15':'HI','16':'ID','17':'IL','18':'IN','19':'IA','20':'KS','21':'KY','22':'LA','23':'ME','24':'MD','25':'MA','26':'MI','27':'MN','28':'MS','29':'MO','30':'MT','31':'NE','32':'NV','33':'NH','34':'NJ','35':'NM','36':'NY','37':'NC','38':'ND','39':'OH','40':'OK','41':'OR','42':'PA','44':'RI','45':'SC','46':'SD','47':'TN','48':'TX','49':'UT','50':'VT','51':'VA','53':'WA','54':'WV','55':'WI','56':'WY'};

  function drawMap(){
    if(!window.d3||!window.topojson){setTimeout(drawMap,200);return;}
    var d3=window.d3,topo=window.topojson;
    var svg=d3.select('#cov-map');
    if(!svg.node())return;
    var W=svg.node().getBoundingClientRect().width||800,H=540;
    svg.attr('viewBox','0 0 '+W+' '+H);
    var proj=d3.geoAlbersUsa().scale(W*0.65).translate([W/2,H/2]);
    var path=d3.geoPath().projection(proj);
    var tip=document.getElementById('cov-tip');
    d3.json('https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json').then(function(us){
      var states=topo.feature(us,us.objects.states);
      var mesh=topo.mesh(us,us.objects.states,function(a,b){return a!==b;});
      svg.selectAll('.st').data(states.features).enter().append('path').attr('class','st')
        .attr('d',path)
        .attr('fill',function(d){var ab=stMap[String(d.id).padStart(2,'0')];return col(sc[ab]||0);})
        .attr('stroke','#fff').attr('stroke-width',0.8)
        .on('mousemove',function(ev,d){
          var ab=stMap[String(d.id).padStart(2,'0')];
          var n=sc[ab]||0;
          if(!tip)return;
          tip.style.display='block';tip.style.left=(ev.clientX+14)+'px';tip.style.top=(ev.clientY-10)+'px';
          tip.innerHTML='<strong>'+(SN[ab]||ab)+'</strong><br><span style="color:#2563eb">'+n+' quote'+(n!==1?'s':'')+'</span>';
          d3.select(this).attr('opacity',0.75);
        })
        .on('mouseleave',function(){if(tip)tip.style.display='none';d3.select(this).attr('opacity',1);});
      svg.append('path').datum(mesh).attr('fill','none').attr('stroke','#e2e8f0').attr('stroke-width',0.5).attr('d',path);
    }).catch(function(){
      if(svg.node()) svg.append('text').attr('x',W/2).attr('y',H/2).attr('text-anchor','middle').attr('fill','#9ca3af').attr('font-size',14).text('Map unavailable — check internet connection');
    });
  }

  function loadScript(src,cb){var s=document.createElement('script');s.src=src;s.onload=cb;document.head.appendChild(s);}
  if(window.d3&&window.topojson){drawMap();}
  else if(window.d3){loadScript('https://cdn.jsdelivr.net/npm/topojson-client@3/dist/topojson-client.min.js',drawMap);}
  else{loadScript('https://cdnjs.cloudflare.com/ajax/libs/d3/7.9.0/d3.min.js',function(){loadScript('https://cdn.jsdelivr.net/npm/topojson-client@3/dist/topojson-client.min.js',drawMap);});}
}


function applyPastQuoteRates(pastId){
  const past=S.quotes.find(q=>q.id===pastId);
  if(!past) return;
  // Apply carrier rates as markup baseline
  const cr=past.carrierRates||{};
  const cu=past.customerRates||{};
  const RATE_KEYS=['base','chassis','prepull','det_port','det_cust','storage','ovw43','ovw48','bobtail','toll','genset','triaxle'];
  // Set flat rates to match past quote customer rates
  if(!S.qi.flatRates) S.qi.flatRates={};
  RATE_KEYS.forEach(k=>{
    if(cu[k]!=null) S.qi.flatRates[k]=cu[k];
  });
  // Show customer + carrier total as markup
  if(cu.total && cr.total){
    const diff=cu.total-cr.total;
    S.qi.markup=diff;
    S.qi.markupType='flat';
  }
  showToast('✅ Rates applied from past quote','success',2000);
  renderQuote();
}

// Add custom accessorial row to carrier rate form
function addCustomAcc(){
  const rows=document.getElementById('custom-acc-rows');
  if(!rows) return;
  const ci=(rows.querySelectorAll('.g2').length);
  const div=document.createElement('div');
  div.className='g2';
  div.style.marginBottom='6px';
  div.innerHTML=`<div class="field"><input type="text" placeholder="Accessorial name e.g. Scale ticket" style="width:100%"></div>
    <div class="g2">
      <div class="field"><input type="number" placeholder="Carrier $" style="width:100%"></div>
      <div class="field"><input type="number" placeholder="Customer $" style="width:100%"></div>
    </div>`;
  rows.appendChild(div);
}

// Collect custom accessorials from rate form
function collectCustomAcc(){
  const rows=document.getElementById('custom-acc-rows');
  if(!rows) return [];
  return [...rows.querySelectorAll('div[style*="grid"]')].map(row=>{
    const inputs=row.querySelectorAll('input');
    const label=(inputs[0]?.value||'').trim();
    const carrier=parseFloat(inputs[1]?.value)||0;
    const customer=parseFloat(inputs[2]?.value)||0;
    return {label,carrier,customer};
  }).filter(a=>a.label);
}

// Edit customer name on a drayage quote
async function editQuoteCustomer(id){
  const q=S.quotes.find(x=>x.id===id);
  if(!q){showToast('Quote not found','warn');return;}
  const newName=prompt('Edit customer name:',q.customer||'');
  if(newName===null) return;
  q.customer=newName.trim();
  try{await dbSaveQuote(q);}catch(e){}
  try{localStorage.setItem('shifl_quotes_cache',JSON.stringify(S.quotes));}catch(e){}
  const tbody=document.getElementById('log-tbody');
  if(tbody) tbody.innerHTML=buildLogRows();
  showToast('✅ Customer name updated','success',2000);
}

// Set container ETA from active card
function setContainerETA(id){
  const meta=getMeta(id);
  const current=meta.containerETA||'';
  const val=prompt('Container ETA (vessel arrival date):', current);
  if(val===null) return; // cancelled
  saveTMSMeta(id,{containerETA:val.trim()});
  showToast('✅ ETA saved','success',1500);
  renderActive();
}

// Filter active cards without rebuilding the page — keeps search input focused
function filterActiveCards(){
  const search = (S.activeSearch||'').toLowerCase();
  const grid = document.getElementById('active-grid');
  if(!grid) return;
  let any = false;
  grid.querySelectorAll('.active-card-v2').forEach(card => {
    const text = card.textContent.toLowerCase();
    const show = !search || text.includes(search);
    card.style.display = show ? '' : 'none';
    if(show) any = true;
  });
  // update subhead count
  const sub = document.getElementById('topbar-sub');
  if(sub){
    const total = grid.querySelectorAll('.active-card-v2').length;
    const shown = [...grid.querySelectorAll('.active-card-v2')].filter(c=>c.style.display!=='none').length;
    sub.textContent = search ? shown+' of '+total+' shown' : total+' in transit';
  }
}

// Active shipments drag-drop
let _acDragged = null;
function acDragStart(e){ _acDragged=e.currentTarget; e.currentTarget.classList.add('ac-dragging'); }
function acDragOver(e){ e.preventDefault(); e.currentTarget.classList.add('ac-drag-over'); }
function acDragLeave(e){ e.currentTarget.classList.remove('ac-drag-over'); }
function acDragEnd(e){ document.querySelectorAll('.active-card-v2').forEach(c=>{c.classList.remove('ac-dragging','ac-drag-over');}); _acDragged=null; }
function acDrop(e){
  e.preventDefault();
  const target=e.currentTarget; target.classList.remove('ac-drag-over');
  if(!_acDragged||_acDragged===target) return;
  const grid=document.getElementById('active-grid');
  if(!grid) return;
  const kids=[...grid.children];
  const di=kids.indexOf(_acDragged), ti=kids.indexOf(target);
  if(di<ti) grid.insertBefore(_acDragged,target.nextSibling);
  else grid.insertBefore(_acDragged,target);
  _acDragged.classList.remove('ac-dragging');
  // save order
  const order=[...grid.querySelectorAll('.active-card-v2')].map(c=>c.dataset.id);
  try{localStorage.setItem('tms_priority_order',JSON.stringify(order));}catch(ex){}
  _acDragged=null;
}

// placeholder to satisfy any leftover references
function _renderActiveOld(){
}
const regCol={NE:'g',WC:'b',SE:'a',Central:'p'};const ldCol={Live:'b',Drop:'gr',Both:'t'};
function buildRateRows(){
  const s=S.rSearch.toLowerCase();
  const isExportTab=S.rateTab==='export';
  const filtered=S.rates
    .filter(r=>{
      if(s&&!(r.carrier+r.zip+r.destination+r.region+r.notes).toLowerCase().includes(s)) return false;
      if(isExportTab&&!r.exportBase) return false;
      return true;
    })
    .sort((a,b)=>{
      const z=(a.zip||'').localeCompare(b.zip||'');
      if(z!==0) return z;
      return (a.carrier||'').localeCompare(b.carrier||'');
    });
  if(!filtered.length) return `<div style="text-align:center;padding:40px;color:var(--gray-400);font-size:13px">No rates found</div>`;

  const ldCol={Live:'live',Drop:'drop',Both:'both'};
  const ldBadge=ld=>{
    const map={Live:'background:#dcfce7;color:#15803d',Drop:'background:#dbeafe;color:#1d4ed8',Both:'background:#f3f4f6;color:#6b7280'};
    return `<span style="font-size:9px;font-weight:700;padding:2px 7px;border-radius:99px;${map[ld]||map.Both}">${ld||'—'}</span>`;
  };
  const money=v=>v?`<span style="font-weight:700;color:#1e3a5f">$${Number(v).toLocaleString()}</span>`:`<span style="color:#d1d5db">—</span>`;
  const chip=(lbl,v)=>`<div style="background:#fff;border:1px solid #e5e7eb;border-radius:7px;padding:7px 10px;text-align:center">
    <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;color:#9ca3af;margin-bottom:3px">${lbl}</div>
    <div style="font-size:13px;font-weight:700;color:${v?'#1e3a5f':'#d1d5db'}">${v?'$'+Number(v).toLocaleString():'—'}</div>
  </div>`;

  return filtered.map((r,i)=>{
    const total=totAll(r);
    const rid=r.id.replace(/[^a-z0-9]/gi,'_');
    const regBadge=r.region?`<span style="font-size:9px;font-weight:700;padding:1px 5px;border-radius:3px;background:#dbeafe;color:#1d4ed8">${r.region}</span>`:'';
    return `<div style="border-bottom:1px solid #f3f4f6">
      <div onclick="toggleRateRow('${rid}')" style="display:grid;grid-template-columns:30px 28px 1fr 110px 58px 50px 80px 70px 80px 80px;gap:0;padding:10px 12px;align-items:center;cursor:pointer;transition:background .1s" onmouseenter="this.style.background='#f0f6ff'" onmouseleave="this.style.background=''">
        <div style="text-align:center;font-size:11px;color:#9ca3af;font-weight:600">${i+1}</div>
        <div>${regBadge}</div>
        <div>
          <div style="font-size:12px;font-weight:700;color:#1e3a5f">${r.carrier}</div>
          ${r.destination?`<div style="font-size:10px;color:#9ca3af">${r.destination}</div>`:''}
          ${r.notes?`<div style="font-size:10px;color:#d97706">${r.notes}</div>`:''}
        </div>
        <div style="font-size:12px;color:#374151">${r.zip||'—'}</div>
        <div>${ldBadge(r.ld)}</div>
        <div style="text-align:right;font-size:13px;font-weight:800;color:#1e3a5f">$${Number(r.base||0).toLocaleString()}</div>
        <div style="text-align:right;font-size:12px;font-weight:600;color:#374151">${r.chassis?'$'+Number(r.chassis).toLocaleString():'<span style="color:#d1d5db">—</span>'}</div>
        <div style="text-align:right;font-size:12px;font-weight:600;color:#374151">${r.prepull?'$'+Number(r.prepull).toLocaleString():'<span style="color:#d1d5db">—</span>'}</div>
        <div style="text-align:right;font-size:13px;font-weight:800;color:#2563eb">$${Number(total||0).toLocaleString()}</div>
        <div id="arr_${rid}" style="text-align:right;font-size:11px;color:#9ca3af">▼ expand</div>
      </div>
      <div id="det_${rid}" style="display:none;padding:10px 14px 14px 70px;background:#fafbfc;border-top:1px solid #f3f4f6">
        ${r.bcoTags&&r.bcoTags.length?`<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:8px">
          <span style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#92400e;align-self:center">BCO:</span>
          ${r.bcoTags.map(tag=>`<span style="font-size:10px;font-weight:700;padding:2px 10px;border-radius:99px;background:#fef3c7;color:#92400e;border:1px solid #fde68a">${tag}</span>`).join('')}
        </div>`:''}
        <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin-bottom:10px">
          ${chip('Det. Port',r.det_port)}
          ${chip('Det. Cust',r.det_cust)}
          ${chip('Storage',r.storage)}
          ${chip('OW 43k',r.ovw43)}
          ${chip('OW 48k',r.ovw48)}
          ${chip('Bobtail',r.bobtail)}
          ${chip('Toll',r.toll)}
          ${chip('Genset',r.genset)}
          ${chip('Triaxle',r.triaxle)}
          ${r.exportBase?chip('Export base',r.exportBase):''}
        </div>
        <div style="display:flex;align-items:center;gap:6px">
          <button class="btn sm" onclick="event.stopPropagation();toggleActive('${r.id}','${r.active}')" style="${r.active?'color:#16a34a;border-color:#bbf7d0':'color:#6b7280'}">${r.active?'✅ Active':'○ Inactive'}</button>
          <button class="btn sm ico-btn" onclick="event.stopPropagation();editRate('${r.id}')" title="Edit">✏️ Edit</button>
          <button class="btn sm ico-btn" onclick="event.stopPropagation();duplicateRate('${r.id}')" title="Duplicate">📋 Duplicate</button>
          <button class="btn sm ico-btn" onclick="event.stopPropagation();deleteRate('${r.id}')" style="color:#dc2626;border-color:#fca5a5" title="Delete">🗑️ Delete</button>
        </div>
      </div>
    </div>`;
  }).join('');
}

function toggleRateRow(rid){
  const det=document.getElementById('det_'+rid);
  const arr=document.getElementById('arr_'+rid);
  if(!det||!arr) return;
  const isOpen=det.style.display!=='none';
  det.style.display=isOpen?'none':'block';
  arr.textContent=isOpen?'▼ expand':'▲ collapse';
  arr.style.color=isOpen?'#9ca3af':'#2563eb';
}


function renderRates(){
  const matchCount=S.rSearch?S.rates.filter(r=>(r.carrier+r.zip+r.destination+r.region+r.notes).toLowerCase().includes(S.rSearch.toLowerCase())).length:S.rates.length;
  $('topbar-right').innerHTML=`
    <div style="position:relative;display:flex;align-items:center">
      <span style="position:absolute;left:10px;color:var(--gray-400);font-size:13px">🔍</span>
      <input type="text" id="rate-search" placeholder="Search carrier, zip, destination…" value="${S.rSearch}"
        oninput="onRateSearch(this.value)"
        style="width:260px;padding:7px 10px 7px 32px;border-radius:var(--radius);border:1px solid var(--gray-200);font-size:13px">
      ${S.rSearch?`<span style="position:absolute;right:10px;font-size:11px;color:var(--gray-400)">${matchCount} result${matchCount!==1?'s':''}</span>`:''}
    </div>
    ${S.rSearch&&matchCount>0?`<button class="btn" onclick="showBulkEdit()" title="Edit accessorials on all ${matchCount} matching rates at once">✏️ Bulk edit (${matchCount})</button>`:''}
    <button class="btn" onclick="downloadTemplate()">📥 Template</button>
    <button class="btn" onclick="triggerImport()">📤 Import CSV</button>
    <input type="file" id="csv-fi" accept=".csv" style="display:none" onchange="handleCSVFile(this)">
    <button class="btn" onclick="showManageSpecialZips()">🏠 Special ZIPs</button>
    <div style="display:flex;gap:0;border:1.5px solid var(--gray-200);border-radius:6px;overflow:hidden;margin-right:4px">
      <button onclick="S.rateTab='import';renderRates()" style="padding:6px 14px;border:none;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;background:${S.rateTab!=='export'?'#1a2e4a':'#fff'};color:${S.rateTab!=='export'?'#fff':'var(--gray-500)'}">📥 Import</button>
      <button onclick="S.rateTab='export';renderRates()" style="padding:6px 14px;border:none;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;background:${S.rateTab==='export'?'#92400e':'#fff'};color:${S.rateTab==='export'?'#fff':'var(--gray-500)'}">📤 Export</button>
    </div>
    <button class="btn blue" onclick="showAddRate()">+ Add rate</button>`;
  $('page').innerHTML=`
    <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
      <div style="display:grid;grid-template-columns:30px 28px 1fr 110px 58px 50px 80px 70px 80px 80px;gap:0;padding:8px 12px;background:#f8f9fa;border-bottom:1px solid #e5e7eb;align-items:center">
        <div style="font-size:9px;font-weight:700;text-transform:uppercase;color:#9ca3af;text-align:center">#</div>
        <div style="font-size:9px;font-weight:700;text-transform:uppercase;color:#9ca3af">Reg</div>
        <div style="font-size:9px;font-weight:700;text-transform:uppercase;color:#9ca3af">Carrier · Destination</div>
        <div style="font-size:9px;font-weight:700;text-transform:uppercase;color:#9ca3af">ZIP</div>
        <div style="font-size:9px;font-weight:700;text-transform:uppercase;color:#9ca3af">Mode</div>
        <div style="font-size:9px;font-weight:700;text-transform:uppercase;color:#9ca3af;text-align:right">Base</div>
        <div style="font-size:9px;font-weight:700;text-transform:uppercase;color:#9ca3af;text-align:right">Chassis</div>
        <div style="font-size:9px;font-weight:700;text-transform:uppercase;color:#9ca3af;text-align:right">Pre-pull</div>
        <div style="font-size:9px;font-weight:700;text-transform:uppercase;color:#9ca3af;text-align:right">Total</div>
        <div style="font-size:9px;font-weight:700;text-transform:uppercase;color:#9ca3af;text-align:right">▼ Details</div>
      </div>
      <div id="rates-tbody">${buildRateRows()}</div>
    </div>`;
}
function onRateSearch(v){
  S.rSearch=v;
  const matchCount=v?S.rates.filter(r=>(r.carrier+r.zip+r.destination+r.region+r.notes).toLowerCase().includes(v.toLowerCase())).length:S.rates.length;
  const t=$('rates-tbody');if(t) t.innerHTML=buildRateRows();
  // Update bulk edit button and count live
  const existing=document.querySelector('[onclick="showBulkEdit()"]');
  const topR=$('topbar-right');
  if(topR){
    const countSpan=topR.querySelector('span[style*="right:10px"]');
    if(countSpan) countSpan.textContent=v?`${matchCount} result${matchCount!==1?'s':''}` :'';
    if(existing) existing.textContent=`✏️ Bulk edit (${matchCount})`;
    if(!existing&&v&&matchCount>0){
      const tmpl=document.createElement('button');
      tmpl.className='btn';tmpl.title=`Edit accessorials on all ${matchCount} matching rates at once`;
      tmpl.textContent=`✏️ Bulk edit (${matchCount})`;
      tmpl.setAttribute('onclick','showBulkEdit()');
      topR.insertBefore(tmpl,topR.children[1]);
    } else if(existing&&(!v||matchCount===0)){
      existing.remove();
    }
  }
}

function showBulkEdit(){
  const s=S.rSearch.toLowerCase();
  const matches=S.rates.filter(r=>(r.carrier+r.zip+r.destination+r.region+r.notes).toLowerCase().includes(s));
  if(!matches.length) return;

  // Pre-fill with the first match's current values as defaults
  const first=matches[0];
  const chargeFields=CHARGES.filter(c=>c!=='base').map(c=>`
    <div class="field">
      <label style="display:flex;align-items:center;gap:8px">
        <input type="checkbox" id="bulk-chk-${c}" onchange="document.getElementById('bulk-${c}').disabled=!this.checked">
        ${LABELS[c]}
      </label>
      <input type="number" id="bulk-${c}" value="${first[c]||0}" min="0"
        disabled style="padding:5px 8px;font-size:13px;opacity:.5"
        oninput="" onfocus="document.getElementById('bulk-chk-${c}').checked=true;this.style.opacity=1;this.disabled=false">
    </div>`).join('');

  $('modal-root').innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()">
    <div class="modal" style="width:720px">
      <div class="modal-title">Bulk edit accessorials</div>
      <div style="background:var(--amber-bg,#fffbeb);border:1px solid #fbbf24;border-radius:var(--radius);padding:10px 14px;margin-bottom:16px;font-size:13px">
        ✏️ Editing <strong>${matches.length} rate${matches.length!==1?'s':''}</strong> matching <em>"${S.rSearch}"</em>
        — <span style="color:var(--gray-500)">check a field to update it on all matching rates</span>
      </div>
      <div class="g3">${chargeFields}</div>
      <div class="modal-foot">
        <button class="btn" onclick="closeModal()">Cancel</button>
        <button class="btn blue" onclick="applyBulkEdit()">Apply to all ${matches.length} rates</button>
      </div>
    </div></div>`;
}

async function applyBulkEdit(){
  const s=S.rSearch.toLowerCase();
  const matches=S.rates.filter(r=>(r.carrier+r.zip+r.destination+r.region+r.notes).toLowerCase().includes(s));
  const changes={};
  CHARGES.filter(c=>c!=='base').forEach(c=>{
    const chk=$(`bulk-chk-${c}`);const inp=$(`bulk-${c}`);
    if(chk&&chk.checked&&inp) changes[c]=parseFloat(inp.value)||0;
  });
  if(!Object.keys(changes).length){alert('Check at least one field to update.');return;}
  if(!confirm(`Apply changes to ${matches.length} rate${matches.length!==1?'s':''}? This cannot be undone.`)) return;
  setSaving(true);
  try{
    for(const r of matches){
      Object.assign(r,changes);
      await dbSaveRate(r);
    }
    closeModal();
    const t=$('rates-tbody');if(t) t.innerHTML=buildRateRows();
    alert(`✅ Updated ${matches.length} rate${matches.length!==1?'s':''} successfully.`);
  }catch(e){alert('Error: '+e.message);}finally{setSaving(false);}
}
async function toggleActive(id,currentActive){
  setSaving(true);try{const r=S.rates.find(r=>r.id===id);if(r){r.active=!(currentActive==='true'||currentActive===true);await dbSaveRate(r);}const t=$('rates-tbody');if(t) t.innerHTML=buildRateRows();}catch(e){alert('Error: '+e.message);}finally{setSaving(false);}
}
async function delRate(id){
  if(!requireCan('delete_rates','Only Admins can delete carrier rates.')) return;
  if(!confirm('Delete this rate? This cannot be undone.')) return;
  const _dr=S.rates.find(r=>r.id===id);logAction('rate_deleted',`${_dr?.carrier||'—'} | ${_dr?.port||'—'} → ${_dr?.zip||'—'}`,'rate',id);
  setSaving(true);try{await dbDeleteRate(id);S.rates=S.rates.filter(r=>r.id!==id);const t=$('rates-tbody');if(t) t.innerHTML=buildRateRows();}catch(e){alert('Error: '+e.message);}finally{setSaving(false);}
}
async function duplicateRate(id){
  const r=S.rates.find(r=>r.id===id);if(!r) return;
  const copy={...r,id:uid(),notes:(r.notes?r.notes+' (copy)':'copy')};
  setSaving(true);try{await dbSaveRate(copy);S.rates.push(copy);const t=$('rates-tbody');if(t) t.innerHTML=buildRateRows();}catch(e){alert('Error: '+e.message);}finally{setSaving(false);}
}
function toggleRateType(type){
  const imp=$('rf-type-import');const exp=$('rf-type-export');const both=$('rf-type-both');
  const impFld=$('rf-import-wrap');const expFld=$('rf-export-wrap');
  [imp,exp,both].forEach(b=>{if(b){b.style.background='#fff';b.style.color='var(--gray-500)';}});
  if(type==='import'&&imp){imp.style.background='#1a2e4a';imp.style.color='#fff';}
  if(type==='export'&&exp){exp.style.background='#92400e';exp.style.color='#fff';}
  if(type==='both'&&both){both.style.background='#1e40af';both.style.color='#fff';}
  if(impFld) impFld.style.display=(type==='import'||type==='both')?'':'none';
  if(expFld) expFld.style.display=(type==='export'||type==='both')?'':'none';
  const hidden=$('rf-rate-type');if(hidden) hidden.value=type;
}
function rateFields(r){
  const fld=(id,lbl,v,note)=>`<div class="field"><label>${lbl}${note?`<span class="cond-note" style="margin-left:4px">${note}</span>`:''}</label><input type="number" id="f-${id}" value="${r?(r[id]||r[id.replace(/([A-Z])/g,'_$1').toLowerCase()]||0):0}" min="0" placeholder="0"></div>`;
  // Determine initial rate type from existing rate
  const initType=r?(r.base&&r.exportBase?'both':r.exportBase?'export':'import'):'import';
  return `
  <!-- Rate type selector -->
  <input type="hidden" id="rf-rate-type" value="${initType}">
  <div class="charge-group-label">Rate type</div>
  <div style="display:flex;gap:0;border:1.5px solid var(--gray-200);border-radius:7px;overflow:hidden;margin-bottom:16px;width:fit-content">
    <button type="button" id="rf-type-import" onclick="toggleRateType('import')"
      style="padding:7px 18px;border:none;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;background:${initType==='import'?'#1a2e4a':'#fff'};color:${initType==='import'?'#fff':'var(--gray-500)'}">
      📥 Import
    </button>
    <button type="button" id="rf-type-export" onclick="toggleRateType('export')"
      style="padding:7px 18px;border:none;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;background:${initType==='export'?'#92400e':'#fff'};color:${initType==='export'?'#fff':'var(--gray-500)'}">
      📤 Export
    </button>
    <button type="button" id="rf-type-both" onclick="toggleRateType('both')"
      style="padding:7px 18px;border:none;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;background:${initType==='both'?'#1e40af':'#fff'};color:${initType==='both'?'#fff':'var(--gray-500)'}">
      ↔️ Both
    </button>
  </div>
  <div class="g3">
    <div class="field"><label>Region</label><select id="f-region">${REGIONS.map(rg=>`<option${(r?r.region===rg:rg==='NE')?' selected':''}>${rg}</option>`).join('')}</select></div>
    <div class="field"><label>Carrier name *</label><input type="text" id="f-carrier" value="${r?r.carrier:''}" placeholder="e.g. Platnum"></div>
    <div class="field"><label>${initType==='export'?'Export Port':'Port / Rail'}</label><input type="text" id="f-port" value="${r?r.port:''}" placeholder="e.g. New York / Newark, NJ"></div>
  </div>
  <div class="g3">
    <div class="field"><label>${initType==='export'?'Pickup ZIP (shipper)':'Destination'}</label><input type="text" id="f-destination" value="${r?r.destination:''}" placeholder="${initType==='export'?'e.g. Bayshore, NY':'e.g. Bayshore, NY'}"></div>
    <div class="field"><label>${initType==='export'?'Pickup ZIP *':'ZIP *'}</label><input type="text" id="f-zip" value="${r?r.zip:''}" placeholder="07706" maxlength="10"></div>
    <div class="field"><label>Move type</label><select id="f-ld"><option${!r||r.ld==='Live'?' selected':''}>Live</option><option${r&&r.ld==='Drop'?' selected':''}>Drop</option><option${r&&r.ld==='Both'?' selected':''}>Both</option></select><div class="cond-note" style="margin-top:3px">"Both" = carrier does Live or Drop</div></div>
  </div>
  <div class="charge-group-label">Base rate</div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px">
    <div id="rf-import-wrap" style="display:${initType==='export'?'none':''}">
      <div class="field"><label>Import base ($)</label><input type="number" id="f-base" value="${r?r.base||0:0}" min="0" placeholder="0"></div>
    </div>
    <div id="rf-export-wrap" style="display:${initType==='import'?'none':''}">
      <div class="field"><label>Export base ($)</label><input type="number" id="f-exportBase" value="${r?r.exportBase||0:0}" min="0" placeholder="0"></div>
    </div>
  </div>
  <div class="charge-group-label">Accessorials</div>
  <div class="g4">${fld('chassis','Chassis')}${fld('prepull','Pre-pull')}${fld('storage','Storage')}</div>
  <div class="charge-group-label">Detention <span class="cond-note">(Live only)</span></div>
  <div class="g2">${fld('det_port','Detention – Port',null,'at port')}${fld('det_cust','Detention – Customer',null,'at customer')}</div>
  <div class="charge-group-label">Overweight</div>
  <div class="g2">${fld('ovw43','OVW (Over 43,000 lb)')}${fld('ovw48','OVW (Over 48,000 lb)')}</div>
  <div class="charge-group-label">Drop moves</div>
  <div class="g2">${fld('bobtail','Bobtail',null,'Drop moves only')}</div>
  <div class="charge-group-label">Toll <span class="cond-note">(enter only if applicable — e.g. PLBNY, bridge)</span></div>
  <div class="g2">${fld('toll','Toll',null,'leave $0 if no toll on this lane')}${fld('genset','Genset',null,'reefer/temp-controlled only')}</div>
  <div class="field" style="margin-top:8px"><label>Notes (optional)</label><input type="text" id="f-notes" value="${r?r.notes:''}" placeholder="e.g. customer name"></div>
  <div class="field" style="margin-top:8px">
    <div style="font-size:11px;font-weight:700;color:var(--gray-500);text-transform:uppercase;letter-spacing:.05em;margin-bottom:6px">Custom accessorials <span style="font-weight:400;text-transform:none;letter-spacing:0;color:var(--gray-400)">— add any not listed above</span></div>
    <div id="custom-acc-rows">${(r&&r.customAcc||[]).map((ca,ci)=>`<div style="display:grid;grid-template-columns:1fr 80px 80px 24px;gap:6px;margin-bottom:6px;align-items:end"><input type="text" value="${ca.label||''}" placeholder="Name e.g. Scale ticket" id="cust-acc-lbl-${ci}" style="padding:6px 8px;border:1px solid var(--gray-200);border-radius:6px;font-size:12px;font-family:inherit"><input type="number" value="${ca.carrier||''}" placeholder="Carrier" id="cust-acc-car-${ci}" style="padding:6px 8px;border:1px solid var(--gray-200);border-radius:6px;font-size:12px;font-family:inherit"><input type="number" value="${ca.customer||''}" placeholder="Customer" id="cust-acc-cus-${ci}" style="padding:6px 8px;border:1px solid var(--gray-200);border-radius:6px;font-size:12px;font-family:inherit"><button type="button" onclick="this.closest('div').remove()" style="padding:0;border:none;background:none;cursor:pointer;color:var(--gray-400);font-size:16px">×</button></div>`).join('')}</div>
    <button type="button" onclick="addCustomAcc()" style="padding:5px 12px;border:1.5px dashed var(--gray-300);border-radius:7px;background:none;font-size:12px;color:var(--gray-500);cursor:pointer;font-family:inherit;margin-bottom:10px">+ Add accessorial</button>
    <label>BCO / Special customer tags <span class="cond-note">Select all that apply</span></label>
    <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:4px" id="bco-tags-wrap">
      ${['Menards','Amazon','Walmart','Target','Home Depot','Costco','IKEA','Dollar General','Wayfair','Other BCO'].map(tag=>{
        const sel=(r&&r.bcoTags&&r.bcoTags.includes(tag));
        return `<button type="button" onclick="toggleBCOTag(this,'${tag}')" data-tag="${tag}"
          style="padding:4px 12px;border-radius:99px;border:1.5px solid ${sel?'#1a2e4a':'var(--gray-300)'};background:${sel?'#1a2e4a':'#fff'};color:${sel?'#fff':'var(--gray-500)'};font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;transition:all .12s">${tag}</button>`;
      }).join('')}
    </div>
  </div>
`;
}
const _modalXBtn='<button onclick="closeRateModal()" style="position:absolute;top:12px;right:14px;background:none;border:none;font-size:22px;cursor:pointer;color:var(--gray-400);line-height:1" title="Close">×</button>';
function showAddRate(){
  $('modal-root').innerHTML=`<div class="overlay" onclick="if(event.target===this)closeRateModal()"><div class="modal" style="position:relative">${_modalXBtn}<div class="modal-title">Add carrier rate</div>${rateFields(null)}<div class="modal-foot"><button class="btn" onclick="closeRateModal()">Cancel</button><button class="btn blue" onclick="submitAdd()">Save rate</button></div></div></div>`;
  setTimeout(captureModalState,50);
}
async function submitAdd(){
  const carrier=$v('carrier');if(!carrier){alert('Carrier name required.');return;}
  const _rt=($('rf-rate-type')||{}).value||'import';
  const _bcoTagsAdd=[...document.querySelectorAll('#bco-tags-wrap button[data-tag]')].filter(b=>b.style.background.includes('1a2e4a')||b.style.background==='#1a2e4a').map(b=>b.dataset.tag);
  const nr={id:uid(),region:$v('region'),carrier,port:$v('port'),destination:$v('destination'),zip:$v('zip'),ld:$v('ld'),active:true,notes:$v('notes'),bcoTags:_bcoTagsAdd,base:_rt==='export'?0:parseFloat($v('base'))||0,exportBase:_rt==='import'?0:parseFloat($v('exportBase'))||0,customAcc:collectCustomAcc()};
  CHARGES.filter(c=>c!=='base').forEach(c=>{nr[c]=parseFloat($v(c))||0;});
  setSaving(true);try{await dbSaveRate(nr);S.rates.push(nr);logAction('rate_added',`${nr.carrier||'—'} | ${nr.port||'—'} → ${nr.zip||'—'}`,'rate',nr.id);closeModal();renderRates();}catch(e){alert('Error: '+e.message);}finally{setSaving(false);}
}
function editRate(id){
  if(!requireCan('edit_rates','Only Admins can edit carrier rates.')) return;const r=S.rates.find(r=>r.id===id);if(!r) return;
  $('modal-root').innerHTML=`<div class="overlay" onclick="if(event.target===this)closeRateModal()"><div class="modal" style="position:relative">${_modalXBtn}<div class="modal-title">Edit rate — ${r.carrier}</div>${rateFields(r)}<div class="modal-foot"><button class="btn" onclick="closeRateModal()">Cancel</button><button class="btn blue" onclick="submitEdit('${id}')">Save changes</button></div></div></div>`;
  setTimeout(captureModalState,50);
}
async function submitEdit(id){
  const r=S.rates.find(r=>r.id===id);if(!r) return;const carrier=$v('carrier');if(!carrier){alert('Carrier name required.');return;}
  const _bcoTags=[...document.querySelectorAll('#bco-tags-wrap button[data-tag]')].filter(b=>b.style.background.includes('1a2e4a')||b.style.background==='#1a2e4a').map(b=>b.dataset.tag);
  const _rtE=($('rf-rate-type')||{}).value||'import';
  Object.assign(r,{region:$v('region'),carrier,port:$v('port'),destination:$v('destination'),zip:$v('zip'),ld:$v('ld'),notes:$v('notes'),bcoTags:_bcoTags||[],customAcc:collectCustomAcc(),base:_rtE==='export'?0:parseFloat($v('base'))||0,exportBase:_rtE==='import'?0:parseFloat($v('exportBase'))||0});
  CHARGES.filter(c=>c!=='base').forEach(c=>{r[c]=parseFloat($v(c))||0;});
  setSaving(true);try{await dbSaveRate(r);logAction('rate_edited',`${r.carrier||'—'} | ${r.port||'—'} → ${r.zip||'—'}`,'rate',r.id);closeModal();renderRates();}catch(e){alert('Error: '+e.message);}finally{setSaving(false);}
}

// CSV import/export
function downloadTemplate(){const hdrs=['Region','Carrier','Port','Destination','Zip','Live_or_Drop','Active','Base','Chassis','Prepull','Det_Port','Det_Cust','Storage','OVW_43k','OVW_48k','Bobtail','Toll','Notes'];const note=['(NE/SE/Central/WC)','','','','','(Live/Drop/Both)','(Y/N)','','','','det at port','det at cust','','over 43k lb','over 48k lb','drop only','when applicable',''];const ex=[['NE','Platnum','New York / Newark, NJ','Bayshore, NY','11706','Live','Y',1595,35,150,90,90,40,200,300,0,25,''],['NE','Bound','New York / Newark, NJ','Bayshore, NY','11706','Both','Y',1330,40,150,85,85,35,150,250,998,25,'Live or Drop']];const esc=v=>{const s=String(v);return s.includes(',')?`"${s}"`:s;};const csv=[hdrs,note,...ex].map(r=>r.map(esc).join(',')).join('\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download='carrier_rates_template.csv';a.click();URL.revokeObjectURL(a.href);}
function triggerImport(){$('csv-fi').value='';$('csv-fi').click();}
function handleCSVFile(input){const file=input.files[0];if(!file) return;const reader=new FileReader();reader.onload=e=>{try{const rows=parseCSV(e.target.result);if(!rows.length){alert('No data rows found.');return;}showImportPreview(rows);}catch(err){alert('Could not read CSV: '+err.message);}};reader.readAsText(file);}
function parseCSV(text){const lines=text.trim().split(/\r?\n/);if(lines.length<2) return [];function parseLine(line){const cols=[];let cur='';let inQ=false;for(let i=0;i<line.length;i++){const ch=line[i];if(ch==='"'){inQ=!inQ;}else if(ch===','&&!inQ){cols.push(cur.trim());cur='';}else{cur+=ch;}}cols.push(cur.trim());return cols;}const headers=parseLine(lines[0]).map(h=>h.toLowerCase().replace(/[^a-z0-9]/g,''));const MAP={region:'region',carrier:'carrier',port:'port',destination:'destination',dest:'destination',zip:'zip',liveordrop:'ld',mode:'ld',ld:'ld',active:'active',base:'base',chassis:'chassis',prepull:'prepull',detport:'det_port',detentioncust:'det_cust',detcust:'det_cust',storage:'storage',ovw43k:'ovw43',ovw43:'ovw43',ovw48k:'ovw48',ovw48:'ovw48',bobtail:'bobtail',toll:'toll',notes:'notes'};return lines.slice(1).map(line=>{const l2=line.trim();if(!l2) return null;const cols=parseLine(l2);const row={};headers.forEach((h,idx)=>{const f=MAP[h];if(f) row[f]=cols[idx]||'';});return row.carrier?row:null;}).filter(Boolean);}
function showImportPreview(rows){_importRows=rows;$('modal-root').innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()"><div class="modal"><div class="modal-title">Import preview — ${rows.length} rate${rows.length!==1?'s':''} found</div><div style="overflow-x:auto;max-height:280px;overflow-y:auto;border:1px solid var(--gray-200);border-radius:var(--radius)"><table style="width:100%;font-size:12px"><thead style="position:sticky;top:0;background:var(--gray-50)"><tr><th>Carrier</th><th>Destination</th><th>Zip</th><th>Mode</th><th>Import</th><th>Export</th><th>Chassis</th></tr></thead><tbody>${rows.slice(0,25).map(r=>`<tr><td class="bold">${r.carrier}</td><td>${r.destination||'—'}</td><td>${r.zip||'—'}</td><td>${r.ld||'Live'}</td><td>${r.base||0}</td><td>${r.chassis||0}</td></tr>`).join('')}</tbody></table></div>${rows.length>25?`<p class="muted small" style="margin-top:6px">…and ${rows.length-25} more</p>`:''}<div style="margin-top:12px;padding:10px;background:var(--gray-50);border-radius:var(--radius);font-size:13px"><label style="display:flex;align-items:center;gap:8px;cursor:pointer"><input type="checkbox" id="import-replace" style="width:auto"><span>⚠️ <strong>Replace all existing rates</strong> — deletes everything first (leave unchecked to add alongside)</span></label></div><div class="modal-foot"><button class="btn" onclick="closeModal()">Cancel</button><button class="btn blue" onclick="confirmImport()">Import ${rows.length} rate${rows.length!==1?'s':''}</button></div></div></div>`;}
async function confirmImport(){
  const rows=_importRows;if(!rows?.length){alert('Nothing to import.');return;}
  const replace=$('import-replace')&&$('import-replace').checked;

  // Filter out the template example rows (carrier name contains "Example" or destination is a placeholder)
  const realRows=rows.filter(r=>r.carrier&&!r.carrier.toLowerCase().includes('example'));
  if(!realRows.length){alert('No real carrier rates found — the file may only contain template example rows. Fill in your actual carrier data and import again.');return;}

  const newRates=realRows.map(r=>({id:uid(),region:(r.region||'NE').trim(),carrier:(r.carrier||'').trim(),port:(r.port||'').trim(),destination:(r.destination||'').trim(),zip:(r.zip||'').trim(),ld:/both/i.test(r.ld||'')?'Both':/drop/i.test(r.ld||'')?'Drop':'Live',active:(r.active||'Y').trim().toUpperCase()!=='N',notes:(r.notes||'').trim(),base:parseFloat(r.base)||0,chassis:parseFloat(r.chassis)||0,prepull:parseFloat(r.prepull)||0,det_port:parseFloat(r.det_port)||0,det_cust:parseFloat(r.det_cust)||0,storage:parseFloat(r.storage)||0,ovw43:parseFloat(r.ovw43)||0,ovw48:parseFloat(r.ovw48)||0,bobtail:parseFloat(r.bobtail)||0,toll:parseFloat(r.toll)||0}));

  setSaving(true);
  try{
    if(replace){
      const confirmed=confirm(`⚠️ This will DELETE all ${S.rates.length} existing carrier rates and replace them with the ${newRates.length} rates from your file. Are you absolutely sure?`);
      if(!confirmed){setSaving(false);return;}
      await db.from('rates').delete().neq('id','__none__');
      S.rates=[];
    }
    await dbBulkSaveRates(newRates);
    S.rates=[...S.rates,...newRates];
    closeModal();renderRates();
    alert(`✅ Imported ${newRates.length} carrier rate${newRates.length!==1?'s':''} successfully.${replace?'\n\nAll previous rates were replaced.':'\n\nAdded alongside your existing rates.'}`);
  }catch(e){alert('Error importing: '+e.message);}finally{setSaving(false);}
}

// ═══════════════════════════════════════════════════════
// QUOTE LOG
// ═══════════════════════════════════════════════════════
function buildLogRows(){
  const f=S.logFilter;const srch=(S.logSearch||'').toLowerCase();
  if(!window._expandedRows) window._expandedRows=new Set();
  const sel=window._draySelected||new Set();
  const filtered=S.quotes.filter(q=>{
    if(f!=='all'&&q.status!==f) return false;
    if(!srch) return true;
    return (q.customer||'').toLowerCase().includes(srch)
      ||(q.shiflRef||'').toLowerCase().includes(srch)
      ||(q.zip||'').includes(srch)
      ||(q.port||'').toLowerCase().includes(srch)
      ||(q.carrier||'').toLowerCase().includes(srch)
      ||(q.destination||'').toLowerCase().includes(srch)
      ||('#'+(q.quoteNum||'')).includes(srch);
  });
  if(!filtered.length) return `<tr><td colspan="9" style="text-align:center;padding:32px;color:var(--gray-400)">No quotes found</td></tr>`;
  return filtered.map(q=>{
    const exp = window._expandedRows.has(q.id);
    const sp = baseSplit(q);
    const pc = sp.isActual?'var(--green)':sp.baseP>=0?'var(--amber)':'var(--red)';
    const statusSel = can('update_status')
      ?`<select onchange="updateStatus('${q.id}',this.value)" onclick="event.stopPropagation()" style="font-size:11px;padding:2px 4px;width:100%;border-radius:4px;border:1px solid var(--gray-200)">
          <option${q.status==='Quoted'?' selected':''}>Quoted</option>
          <option${q.status==='Booked'?' selected':''}>Booked</option>
          <option${q.status==='Lost'?' selected':''}>Lost</option>
          <option${q.status==='Cancelled'?' selected':''}>Cancelled</option>
          <option${q.status==='Expired'?' selected':''}>Expired</option>
          <option${q.status==='Delivered'?' selected':''}>Delivered</option>
        </select>`
      :`<span class="badge a" style="font-size:10px">${q.status}</span>`;

    const mainRow = `<tr onclick="toggleLogRow('${q.id}')" style="cursor:pointer;background:${exp?'var(--blue-bg)':''}">
      <td onclick="event.stopPropagation()" style="padding:6px;text-align:center">
        <input type="checkbox" ${sel.has(q.id)?'checked':''} onchange="toggleDraySelect('${q.id}',this.checked)" style="width:auto;cursor:pointer"></td>
      <td style="font-size:11px;color:var(--gray-400);padding:8px 6px">
        <span style="color:${exp?'var(--steel)':'var(--gray-400)'}">${exp?'▼':'▶'}</span> #${q.quoteNum}</td>
      <td style="font-size:12px;padding:8px 6px;white-space:nowrap">${q.date}</td>
      <td onclick="event.stopPropagation()" style="padding:8px 6px">
        <input type="text" value="${q.shiflRef||''}" onclick="event.stopPropagation()" onchange="saveDrayRef('${q.id}',this.value)"
          placeholder="Ref #"
          style="border:none;background:${q.shiflRef?'var(--blue-bg)':'transparent'};color:${q.shiflRef?'var(--steel)':'var(--gray-300)'};font-weight:${q.shiflRef?'600':'400'};font-size:11px;padding:2px 4px;border-radius:4px;width:100%;cursor:text;outline:none"
          onfocus="this.style.background='var(--blue-bg)';this.style.border='1px solid var(--steel)'" onblur="this.style.border='none';this.style.background=this.value?'var(--blue-bg)':'transparent'">
      </td>
      <td style="font-weight:600;padding:8px 8px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${q.customer||'<span style="color:var(--gray-400);font-style:italic">Add name</span>'} <button onclick="event.stopPropagation();editQuoteCustomer('${q.id}')" title="Edit customer name" style="background:none;border:none;cursor:pointer;font-size:11px;color:var(--gray-400);padding:0 2px" onmouseover="this.style.color='var(--steel)'" onmouseout="this.style.color='var(--gray-400)'">✏️</button></td>
      <td style="padding:8px 6px;overflow:hidden"><div style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px">${q.zip} · ${q.ld}</div><div style="font-size:10px;color:var(--gray-400);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${q.destination||''}</div></td>
      <td style="padding:8px 6px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px">${q.carrier}</td>
      <td style="font-weight:600;color:var(--steel);padding:8px 6px;font-size:13px">${fmtD(q.customerRates?.total||0)}</td>
      <td style="padding:8px 6px"><div style="color:${pc};font-weight:600;font-size:13px">${sp.isActual?'':'+'}${fmtD(sp.baseP)}</div><div style="font-size:10px;color:${pc}">${pct(sp.baseM)}</div></td>
      <td onclick="event.stopPropagation()" style="padding:8px 6px">${statusSel}</td>
    </tr>`;

    if(!exp) return mainRow;

    // Expanded detail row
    const detailRow = `<tr style="background:#f0f6ff">
      <td colspan="9" style="padding:10px 16px;border-bottom:2px solid var(--steel)">
        <div style="display:flex;flex-wrap:wrap;gap:16px;align-items:center">

          <div style="font-size:11px;color:var(--gray-600)"><span style="font-weight:600">Cost:</span> ${fmtD(q.carrierRates?.total||0)}</div>
          <div style="margin-top:4px;display:flex;gap:4px;align-items:center;flex-wrap:wrap">
            ${(q.tags||[]).map(t=>`<span style="background:${t==='urgent'?'#fee2e2':t==='hazmat'?'#fef3c7':t==='reefer'?'#dbeafe':'#f0fdf4'};color:${t==='urgent'?'#991b1b':t==='hazmat'?'#92400e':t==='reefer'?'#1d4ed8':'#065f46'};border-radius:99px;padding:2px 7px;font-size:10px;font-weight:600">#${t}</span>`).join('')}
            <button onclick="event.stopPropagation();addTagToQuote('${q.id}')" style="padding:2px 7px;border-radius:99px;border:1px dashed #e2e8f0;background:transparent;font-size:10px;cursor:pointer;font-family:inherit">+ tag</button>
          </div>
          ${q.email?`<div style="font-size:11px;color:var(--gray-600)"><span style="font-weight:600">Email:</span> <a href="mailto:${q.email}" style="color:#2563eb">${q.email}</a></div>`:''}
          <div style="font-size:11px;color:var(--gray-600)"><span style="font-weight:600">Port:</span> ${q.port||'—'}</div>
          <div style="font-size:11px;color:var(--gray-600)"><span style="font-weight:600">Containers:</span> ${q.containerCount||1}×${q.containerSize||'40HC'}</div>
          <div style="flex:1"></div>
          <div style="display:flex;gap:6px;flex-wrap:wrap">
            ${q.status==='Booked'?`<button class="btn sm" onclick="event.stopPropagation();downloadCarrierRateSheet(S.quotes.find(x=>x.id==='${q.id}'),null)" title="Carrier rate sheet" style="color:var(--green);font-size:11px">📋 Rate sheet</button>`:''}
            <button class="btn sm" onclick="event.stopPropagation();downloadSavedPDF('${q.id}')" style="font-size:11px">📄 PDF</button>
            <button class="btn sm" onclick="event.stopPropagation();repeatDrayageQuote('${q.id}')" style="font-size:11px">🔁 Repeat</button>
            <button class="btn sm" onclick="event.stopPropagation();showQuoteModal('${q.id}')" style="font-size:11px">✏️ Edit</button>
            <button onclick="event.stopPropagation();if(confirm('Delete quote #${q.quoteNum}? This cannot be undone.')){S.quotes=S.quotes.filter(x=>x.id!=='${q.id}');try{localStorage.setItem('shifl_quotes_cache',JSON.stringify(S.quotes));localStorage.setItem('drayage_quotes',JSON.stringify(S.quotes));}catch(e){}dbDeleteQuote('${q.id}').catch(e=>console.warn('DB delete:',e.message));const _t=document.getElementById('log-tbody');if(_t)_t.innerHTML=buildLogRows();showToast('Quote #${q.quoteNum} deleted','success',3000);}" style="font-size:11px;color:#dc2626;border-color:#fecaca">🗑 Delete</button>
            <div style="position:relative;display:inline-block">${(()=>{const _b=getBolUpload(q.id);return _b?'<a href="'+_b.data+'" download="'+_b.name+'" style="display:inline-flex;align-items:center;gap:4px;padding:5px 10px;border-radius:7px;border:1px solid #86efac;background:#f0fdf4;font-size:11px;font-weight:700;color:#16a34a;text-decoration:none">✅ BOL</a>':'<button class="btn sm" onclick="event.stopPropagation();showBolOptions(S.quotes.findIndex(x=>x.id===\''+q.id+'\'),\'drayage\',this)" style="font-size:11px">📝 BOL ▾</button>';})()}</div>
          </div>
        </div>
      </td>
    </tr>`;
    return mainRow + detailRow;
  }).join('');
}

function toggleLogRow(id){
  if(!window._expandedRows) window._expandedRows=new Set();
  if(window._expandedRows.has(id)) window._expandedRows.delete(id);
  else window._expandedRows.add(id);
  const t=$('log-tbody');
  if(t) t.innerHTML=buildLogRows();
}


function toggleDraySelect(id,checked){
  if(!window._draySelected) window._draySelected=new Set();
  if(checked) window._draySelected.add(id); else window._draySelected.delete(id);
  renderLog();
}
async function downloadSelectedDrayPDFs(){
  const ids=Array.from(window._draySelected||[]);
  if(!ids.length){alert('Select at least one quote first.');return;}
  if(!await loadJsPDF()) return;
  const{jsPDF}=window.jspdf;
  const quotes=ids.map(id=>S.quotes.find(q=>q.id===id)).filter(Boolean);
  const doc=new jsPDF({orientation:'portrait',unit:'mm',format:'a4'});
  for(let i=0;i<quotes.length;i++){
    if(i>0) doc.addPage();
    await _renderSavedQuoteOnDoc(doc,quotes[i]);
  }
  doc.save('Shifl_Drayage_Quotes_Combined_'+localDateStr()+'.pdf');
  window._draySelected=new Set();
  renderLog();
}
function renderLog(){
  if(!window._draySelected) window._draySelected=new Set();
  const selCount=window._draySelected.size;
  // Count by status
  const statCounts={all:S.quotes.length};
  ['Quoted','Booked','Delivered','Invoiced','Lost','Cancelled','Expired'].forEach(s=>{statCounts[s]=S.quotes.filter(q=>q.status===s).length;});
  const pillStyle=(s,color,bg)=>S.logFilter===s
    ?`background:${bg};color:#fff;border-color:${bg};`
    :`color:${color};border-color:${color};background:transparent;`;
  $('topbar-right').innerHTML=`
    <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
      ${selCount>0?`<button class="btn blue" onclick="downloadSelectedDrayPDFs()">📄 Download ${selCount} PDF</button>
        <button class="btn" onclick="window._draySelected=new Set();renderLog()">Clear</button>`:''}
      <button class="btn" onclick="exportQuoteLog()">📥 CSV</button>
      <button class="btn" onclick="syncQuotesToTeam()">🔄 Sync</button>
    </div>`;

  // Build pill filter bar above the table
  const pillBar=`<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:14px">
    <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;flex:1">
      ${[
        {s:'all',    label:'All',   activeBg:'#1e3a5f', inactiveBg:'#f3f4f6', inactiveColor:'#374151'},
        {s:'Quoted', label:'Quoted', activeBg:'#2563eb', inactiveBg:'#dbeafe', inactiveColor:'#1d4ed8'},
        {s:'Booked', label:'Booked', activeBg:'#16a34a', inactiveBg:'#dcfce7', inactiveColor:'#15803d'},
        {s:'Delivered',label:'Delivered',activeBg:'#0d9488',inactiveBg:'#f0fdf4',inactiveColor:'#0f766e'},
        {s:'Invoiced',label:'Invoiced',activeBg:'#7c3aed',inactiveBg:'#ede9fe',inactiveColor:'#6d28d9'},
        {s:'Lost',   label:'Lost',  activeBg:'#dc2626', inactiveBg:'#fee2e2', inactiveColor:'#dc2626'},
        {s:'Cancelled',label:'Cancelled',activeBg:'#6b7280',inactiveBg:'#f3f4f6',inactiveColor:'#6b7280'},
        {s:'Expired',label:'Expired',activeBg:'#d97706',inactiveBg:'#fef3c7',inactiveColor:'#92400e'},
      ].map(p=>`<button onclick="onLogFilter('${p.s}')"
        style="padding:5px 13px;border-radius:99px;border:none;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;transition:all .12s;background:${S.logFilter===p.s?p.activeBg:p.inactiveBg};color:${S.logFilter===p.s?'#fff':p.inactiveColor}">
        ${p.label} <span style="font-size:10px;opacity:.8">${statCounts[p.s]||0}</span>
      </button>`).join('')}
    </div>
    <div style="position:relative;min-width:200px">
      <span style="position:absolute;left:10px;top:50%;transform:translateY(-50%);font-size:13px;pointer-events:none">🔍</span>
      <input type="text" id="log-search" placeholder="Customer, ref #, ZIP, carrier…" value="${S.logSearch||''}"
        oninput="S.logSearch=this.value;const t=$('log-tbody');if(t) t.innerHTML=buildLogRows()"
        style="padding:7px 12px 7px 32px;border-radius:99px;border:1.5px solid var(--gray-200);font-size:12px;width:100%;box-sizing:border-box">
    </div>
  </div>`;
  $('page').innerHTML=pillBar+`<div class="tbl-wrap" id="dray-log-wrap" style="overflow-x:hidden"><div id="tag-filter-bar" style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:10px;align-items:center">
      <span style="font-size:11px;color:#94a3b8">Filter by tag:</span>
      ${[...new Set((S.quotes||[]).flatMap(q=>q.tags||[]))].map(t=>`<button onclick="filterByTag('${t}')" style="padding:2px 9px;border-radius:99px;border:1px solid #e2e8f0;background:${window._activeTagFilter===t?'#0a1628':'#fff'};color:${window._activeTagFilter===t?'#fff':'#374151'};font-size:10px;font-weight:600;cursor:pointer;font-family:inherit">#${t}</button>`).join('')}
      ${window._activeTagFilter?`<button onclick="window._activeTagFilter='';const tb=document.getElementById('log-tbody');if(tb)tb.innerHTML=buildLogRows()" style="padding:2px 9px;border-radius:99px;border:1px solid #fecaca;background:#fff;color:#dc2626;font-size:10px;cursor:pointer;font-family:inherit">✕ Clear</button>`:''}
    </div>
    <table style="width:100%;table-layout:fixed"><colgroup>
  <col style="width:2%">
  <col style="width:4%">
  <col style="width:8%">
  <col style="width:8%">
  <col style="width:18%">
  <col style="width:16%">
  <col style="width:12%">
  <col style="width:9%">
  <col style="width:9%">
  <col style="width:14%">
</colgroup><thead><tr>
  <th style="padding:8px 6px;width:2%"><input type="checkbox" ${selCount===S.quotes.length&&selCount>0?'checked':''} onchange="if(this.checked){window._draySelected=new Set(S.quotes.map(q=>q.id));}else{window._draySelected=new Set();}renderLog()" style="width:auto"></th>
  <th style="padding:8px 8px">#</th>
  <th style="padding:8px 8px">Date</th>
  <th style="padding:8px 8px">Shifl Ref #</th>
  <th style="padding:8px 8px">Customer</th>
  <th style="padding:8px 8px">Lane</th>
  <th style="padding:8px 8px">Carrier</th>
  <th style="padding:8px 8px">Revenue</th>
  <th style="padding:8px 8px">Profit</th>
  <th style="padding:8px 8px">Status</th>
</tr></thead><tbody id="log-tbody">${buildLogRows()}</tbody></table></div>`;
}
function onLogFilter(v){S.logFilter=v;const t=$('log-tbody');if(t){t.innerHTML=buildLogRows();setTimeout(()=>setupDragReorder('log-tbody'),100);}}
async function updateStatus(id,status){
  // Intercept Booked — show carrier confirmation modal first
  if(status==='Booked'){showBookingModal(id);return;}
  setSaving(true);try{await dbUpdateQuoteStatus(id,status);const q=S.quotes.find(q=>q.id===id);if(q) q.status=status;const t=$('log-tbody');if(t) t.innerHTML=buildLogRows();updateActiveBadge();}catch(e){alert('Error: '+e.message);}finally{setSaving(false);}
}

// ── Booking confirmation modal ─────────────────────────────────────────────
function showBookingModal(id){
  const q=S.quotes.find(q=>q.id===id);if(!q) return;
  // All active carriers on this zip so user can switch if needed
  const carriersOnZip=S.rates.filter(r=>r.active&&r.zip===q.zip&&(r.ld===q.ld||r.ld==='Both'))
    .sort((a,b)=>totMode(a,q.ld)-totMode(b,q.ld));
  const opts=carriersOnZip.map(r=>`<option value="${r.id}"${r.carrier===q.carrier?' selected':''}>${r.carrier} — carrier total: ${fmt(totMode(r,q.ld))}</option>`).join('');

  $('modal-root').innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()">
    <div class="modal" style="width:720px">
      <div style="background:var(--green);border-radius:10px;padding:16px 20px;margin-bottom:20px;display:flex;align-items:center;gap:12px">
        <span style="font-size:28px">✅</span>
        <div>
          <div style="font-size:16px;font-weight:700;color:#fff">Confirm Booking</div>
          <div style="font-size:12px;color:rgba(255,255,255,.75)">Quote #${q.quoteNum} · ${q.customer} · ${q.zip} (${q.ld})</div>
        </div>
      </div>

      <div class="g2" style="margin-bottom:16px">
        <div style="background:var(--gray-50);border-radius:var(--radius);padding:12px">
          <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--gray-400);margin-bottom:4px">Customer invoice</div>
          <div style="font-size:20px;font-weight:700;color:var(--steel)">${fmtD(q.customerRates?.total||0)}</div>
        </div>
        <div style="background:var(--green-bg);border-radius:var(--radius);padding:12px">
          <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--gray-400);margin-bottom:4px">Profit</div>
          <div style="font-size:20px;font-weight:700;color:var(--green)">${fmtD(q.profit||0)} <span style="font-size:13px">(${pct(q.profitPct||0)})</span></div>
        </div>
      </div>

      <div class="field">
        <label>Carrier being used ${carriersOnZip.length===0?'<span style="color:var(--amber);font-weight:400">— no rates on file for this zip</span>':''}</label>
        ${carriersOnZip.length>0
          ?`<select id="booking-carrier-sel">${opts}</select>
             <div style="font-size:11px;color:var(--gray-400);margin-top:4px">Switch carrier if you booked with someone different from the original quote</div>`
          :`<input type="text" id="booking-carrier-text" value="${q.carrier}" placeholder="Enter carrier name">`}
      </div>

      <div class="alert info" style="margin-bottom:0">
        Clicking <strong>Confirm + Download</strong> marks this as Booked and downloads the internal carrier rate sheet for your records.
      </div>

      <div class="modal-foot">
        <button class="btn" onclick="closeModal()">Cancel</button>
        <button class="btn" onclick="confirmBooking('${id}',false)">Confirm only</button>
        <button class="btn blue" onclick="confirmBooking('${id}',true)">✅ Confirm + Download rate sheet</button>
      </div>
    </div></div>`;
}

async function confirmBooking(id, downloadSheet){
  const q=S.quotes.find(q=>q.id===id);if(!q) return;
  const sel=$('booking-carrier-sel');
  const txt=$('booking-carrier-text');
  const selRate=sel?S.rates.find(r=>r.id===sel.value):null;
  const carrierName=selRate?selRate.carrier:(txt?txt.value.trim():q.carrier)||q.carrier;

  setSaving(true);
  try{
    const bookedDate=localDateStr();
    // Store booked date inside baseMarkup JSONB — no schema change needed
    q.baseMarkup={...q.baseMarkup, bookedDate};
    // If carrier changed, update the carrier rates on the quote
    if(selRate&&selRate.carrier!==q.carrier){
      const ct=totMode(selRate,q.ld);
      const cu=q.customerRates?.total||0;
      const newCarrierRates={...CHARGES.reduce((o,c)=>{o[c]=selRate[c]||0;return o;},{}),total:ct};
      q.carrier=selRate.carrier;
      q.carrierRates=newCarrierRates;
      q.profit=cu-ct;
      q.profitPct=cu>0?(cu-ct)/cu:0;
      await db.from('quotes').update({...quoteToDb(q),status:'Booked'}).eq('id',id);
    } else {
      await db.from('quotes').update({status:'Booked',base_markup:q.baseMarkup}).eq('id',id);
    }
    q.status='Booked';
    q.booked_by=_currentUser?.id||null;
    q.booked_by_name=_currentUser?.name||null;
    closeModal();
    setTimeout(fireConfetti,200);
    showToast('🎉 Quote booked!','success',4000);
    const t=$('log-tbody');if(t) t.innerHTML=buildLogRows();
    updateActiveBadge();
    if(downloadSheet) await downloadCarrierRateSheet(q,selRate);
  }catch(e){alert('Error: '+e.message);}finally{setSaving(false);}
}

// ── Carrier rate sheet PDF (internal) ────────────────────────────────────
async function downloadCarrierRateSheet(q,overrideRate){
  if(typeof window.jspdf==='undefined'){
    try{await new Promise((res,rej)=>{const s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';s.onload=res;s.onerror=rej;document.head.appendChild(s);});}
    catch(e){alert('PDF library failed to load. Check internet connection.');return;}
  }
  const{jsPDF}=window.jspdf;
  const doc=new jsPDF({orientation:'portrait',unit:'mm',format:'a4'});
  const W=210;const navy=[26,46,74];const green=[45,125,70];

  // Use override carrier rates if carrier was switched, otherwise use saved quote rates
  const carrierRates=overrideRate
    ?{...CHARGES.reduce((o,c)=>{o[c]=overrideRate[c]||0;return o;},{}),total:totMode(overrideRate,q.ld)}
    :q.carrierRates||{};
  const carrierName=overrideRate?overrideRate.carrier:q.carrier;

  // ── Header ────────────────────────────────────────────────────────────
  doc.setFillColor(...navy);doc.rect(0,0,W,32,'F');
  // Logo
  doc.setFillColor(59,142,208);doc.roundedRect(10,5,22,22,3,3,'F');
  const bx=10,by=5,bs=22,sc=v=>v/60*bs;
  doc.setFillColor(255,255,255);doc.triangle(bx+sc(10),by+sc(50),bx+sc(25),by+sc(14),bx+sc(44),by+sc(45),'F');
  doc.setFillColor(220,235,255);doc.triangle(bx+sc(25),by+sc(14),bx+sc(44),by+sc(45),bx+sc(53),by+sc(37),'F');
  doc.setFillColor(255,255,255);doc.triangle(bx+sc(10),by+sc(50),bx+sc(44),by+sc(45),bx+sc(53),by+sc(50),'F');
  doc.setDrawColor(59,142,208);doc.setLineWidth(.3);doc.line(bx+sc(25),by+sc(14),bx+sc(44),by+sc(50));
  doc.setTextColor(255,255,255);doc.setFont('helvetica','bold');doc.setFontSize(18);doc.text('SHIFL',36,19);
  doc.setFontSize(9);doc.setFont('helvetica','normal');doc.setTextColor(255,255,255,.65);doc.text('Carrier Rate Sheet',36,26);
  // INTERNAL USE ONLY — centered on page
  const badgeW=54;const badgeX=(W-badgeW)/2;
  doc.setFillColor(200,40,40);doc.roundedRect(badgeX,9,badgeW,13,3,3,'F');
  doc.setFont('helvetica','bold');doc.setFontSize(8);doc.setTextColor(255,255,255);
  doc.text('INTERNAL USE ONLY',W/2,17,{align:'center'});

  // ── Quote info bar ────────────────────────────────────────────────────
  const bookedDate=q.baseMarkup?.bookedDate||localDateStr();
  doc.setFillColor(240,244,248);doc.rect(0,32,W,16,'F');
  doc.setFont('helvetica','bold');doc.setFontSize(9);doc.setTextColor(...navy);
  doc.text('Quote #'+q.quoteNum+(q.shiflRef?' · Ref: '+q.shiflRef:''),12,42);
  doc.setFont('helvetica','normal');doc.setTextColor(100,115,130);
  doc.text('Quoted: '+q.date,12,48);
  doc.text('Customer: '+q.customer,70,42);
  doc.text('Status: BOOKED',70,48);
  doc.setFont('helvetica','bold');doc.setTextColor(...green);
  doc.text('Booked: '+bookedDate,150,42);
  doc.setFont('helvetica','normal');doc.setTextColor(100,115,130);

  // ── Carrier section ───────────────────────────────────────────────────
  let y=62;
  doc.setFillColor(...navy);doc.rect(12,y,W-24,8,'F');
  doc.setFont('helvetica','bold');doc.setFontSize(8);doc.setTextColor(255,255,255);
  doc.text('CARRIER',16,y+5.5);y+=16;

  doc.setFont('helvetica','bold');doc.setFontSize(18);doc.setTextColor(...navy);
  doc.text(carrierName,16,y);y+=14;

  // Lane details under carrier
  const laneItems=[['Pickup',q.port||'—'],['Destination',q.destination||'—'],['Delivery Zip',q.zip],['Mode',q.ld]];
  laneItems.forEach(([l,v],i)=>{
    const x=i%2===0?16:110;if(i===2) y+=12;
    doc.setFont('helvetica','bold');doc.setFontSize(7);doc.setTextColor(150,160,175);doc.text(l.toUpperCase(),x,y);
    doc.setFont('helvetica','normal');doc.setFontSize(10);doc.setTextColor(50,60,75);doc.text(String(v),x,y+5);
  });
  y+=18;

  // ── Carrier rates table ───────────────────────────────────────────────
  doc.setDrawColor(200,210,220);doc.setLineWidth(.3);doc.line(12,y,W-12,y);y+=8;
  doc.setFillColor(...navy);doc.rect(12,y,W-24,8,'F');
  doc.setFont('helvetica','bold');doc.setFontSize(8);doc.setTextColor(255,255,255);
  doc.text('CHARGE',16,y+5.5);
  doc.text('CARRIER RATE',95,y+5.5,{align:'right'});
  doc.text('CUSTOMER RATE',140,y+5.5,{align:'right'});
  doc.text('PROFIT',W-14,y+5.5,{align:'right'});
  y+=12;

  let even=true;
  CHARGES.forEach(c=>{
    if(!isApplicable(c,q.ld)) return;
    const cv=carrierRates[c]||0;
    const cuv=q.customerRates?.[c]||0;
    if(!cv&&!cuv) return;
    const lineProfit=cuv-cv;
    if(even){doc.setFillColor(248,250,252);doc.rect(12,y-4,W-24,8,'F');}
    // Charge name
    doc.setFont('helvetica','normal');doc.setFontSize(10);doc.setTextColor(55,65,80);
    doc.text(LABELS[c],16,y);
    // Carrier rate
    doc.setFont('helvetica','normal');doc.setTextColor(100,115,130);
    doc.text(cv>0?fmtD(cv):'-',95,y,{align:'right'});
    // Customer rate
    doc.setFont('helvetica','bold');doc.setTextColor(...navy);
    doc.text(cuv>0?fmtD(cuv):'-',140,y,{align:'right'});
    // Profit per line
    doc.setFont('helvetica','bold');doc.setTextColor(...green);
    doc.text(cv>0&&cuv>0?'+'+fmtD(lineProfit):'-',W-14,y,{align:'right'});
    doc.setDrawColor(235,238,242);doc.setLineWidth(.2);doc.line(12,y+4,W-12,y+4);
    y+=8;even=!even;
  });

  // Total row
  y+=2;
  doc.setFillColor(...navy);doc.rect(12,y-3,W-24,13,'F');
  doc.setFont('helvetica','bold');doc.setFontSize(10);doc.setTextColor(255,255,255);
  doc.text('TOTAL',16,y+5);
  // Carrier total
  doc.setFontSize(10);doc.setTextColor(255,255,255);
  doc.text(fmtD(carrierRates.total||0),95,y+5,{align:'right'});
  // Customer total
  doc.setFontSize(13);doc.setTextColor(255,255,255);
  doc.text(fmtD(q.customerRates?.total||0),140,y+5,{align:'right'});
  // Total profit
  doc.setTextColor(100,255,150);
  doc.text('+'+fmtD((q.customerRates?.total||0)-(carrierRates.total||0)),W-14,y+5,{align:'right'});
  y+=18;

  // ── Billing summary ───────────────────────────────────────────────────
  doc.setDrawColor(200,210,220);doc.setLineWidth(.3);doc.line(12,y,W-12,y);y+=8;
  doc.setFont('helvetica','bold');doc.setFontSize(8);doc.setTextColor(100,115,130);
  doc.text('BILLING SUMMARY',12,y);y+=8;

  const cuTotal=q.customerRates?.total||0;
  const profit=cuTotal-(carrierRates.total||0);
  const margin=cuTotal>0?profit/cuTotal:0;
  const summaryRows=[
    ['Customer Invoice Total',fmtD(cuTotal),[0,100,160]],
    ['Carrier Cost',fmtD(carrierRates.total||0),[80,90,105]],
    ['Profit',fmtD(profit),[...green]],
    ['Margin',pct(margin),[...green]],
  ];
  summaryRows.forEach(([l,v,col])=>{
    doc.setFont('helvetica','normal');doc.setFontSize(10);doc.setTextColor(80,90,105);doc.text(l,16,y);
    doc.setFont('helvetica','bold');doc.setTextColor(...col);doc.text(v,W-14,y,{align:'right'});
    doc.setDrawColor(235,238,242);doc.setLineWidth(.2);doc.line(12,y+3,W-12,y+3);y+=9;
  });

  // ── Customer notes (internal reference) ──────────────────────────────────
  if(q.notes&&q.notes.trim()){
    y+=6;
    const noteLines=doc.splitTextToSize(q.notes.trim(),W-32);
    const boxH=noteLines.length*5+14;
    doc.setFillColor(240,246,255);doc.roundedRect(12,y,W-24,boxH,3,3,'F');
    doc.setDrawColor(180,210,240);doc.setLineWidth(.3);doc.roundedRect(12,y,W-24,boxH,3,3,'S');
    doc.setFont('helvetica','bold');doc.setFontSize(7.5);doc.setTextColor(46,117,182);
    doc.text('CUSTOMER NOTES',16,y+7);
    doc.setFont('helvetica','normal');doc.setFontSize(8.5);doc.setTextColor(55,70,90);
    noteLines.forEach((line,i)=>{doc.text(line,16,y+13+(i*5));});
    y+=boxH+4;
  }

  // ── Footer ────────────────────────────────────────────────────────────
  doc.setFontSize(8);doc.setFont('helvetica','italic');doc.setTextColor(180,185,195);
  doc.text('This document is confidential and for internal use only. Do not share with carriers or customers.',12,275);
  doc.text('Generated by Shifl Trucking Quoting · '+localDateStr(),12,280);

  doc.save('Shifl_CarrierRateSheet_'+q.quoteNum+'_'+carrierName.replace(/\s+/g,'_')+'_'+q.date+'.pdf');
}

async function delQuote(id){
  if(!requireCan('delete_quotes','Only Admins can delete quotes.')) return;
  if(!confirm('Delete this quote? This cannot be undone.')) return;
  setSaving(true);try{await dbDeleteQuote(id);S.quotes=S.quotes.filter(q=>q.id!==id);const t=$('log-tbody');if(t) t.innerHTML=buildLogRows();}catch(e){alert('Error: '+e.message);}finally{setSaving(false);}
}

// Track unsaved changes in rate modals
let _modalOriginal = null;
function captureModalState(){
  const fields=['r-carrier','r-port','r-dest','r-zip','r-ld','r-region','r-base','r-chassis','r-prepull','r-det_port','r-det_cust','r-storage','r-ovw43','r-ovw48','r-bobtail','r-toll','r-notes'];
  _modalOriginal=fields.map(id=>{const el=$(id);return el?el.value:null;}).join('|');
}
function currentModalState(){
  const fields=['r-carrier','r-port','r-dest','r-zip','r-ld','r-region','r-base','r-chassis','r-prepull','r-det_port','r-det_cust','r-storage','r-ovw43','r-ovw48','r-bobtail','r-toll','r-notes'];
  return fields.map(id=>{const el=$(id);return el?el.value:null;}).join('|');
}
function rateModalChanged(){return _modalOriginal!==null&&_modalOriginal!==currentModalState();}
function closeRateModal(){
  if(rateModalChanged()){
    if(!confirm('You have unsaved changes. Close anyway and discard them?')) return;
  }
  _modalOriginal=null;closeModal();
}
function showQuoteModal(id){
  const q=S.quotes.find(q=>q.id===id);if(!q) return;
  const ld=q.ld;const statusColors={Quoted:'a',Booked:'g',Lost:'gr',Cancelled:'gr'};
  const chargeRows=CHARGES.map(c=>{if(!isApplicable(c,ld)) return '';const cuv=q.customerRates?.[c]||0;const cv=q.carrierRates?.[c]||0;if(!cuv&&!cv) return '';const note=c==='ovw43'?'Over 43,000 lb':c==='ovw48'?'Over 48,000 lb':c==='det_port'?'At port':c==='det_cust'?'At customer':'';return `<tr style="border-bottom:1px solid var(--gray-100)"><td style="padding:8px 12px;color:var(--gray-600)">${LABELS[c]}${note?`<div class="charge-note">${note}</div>`:''}</td><td style="padding:8px 12px;text-align:right;color:var(--gray-400);font-size:12px">${cv>0?fmtD(cv):'—'}</td><td style="padding:8px 12px;text-align:right;font-weight:600;color:var(--steel)">${cuv>0?fmtD(cuv):'—'}</td><td style="padding:8px 12px;text-align:right;font-size:12px;color:var(--green)">${cuv>0&&cv>0?'+'+fmtD(cuv-cv):''}</td></tr>`;}).join('');
  const cuTotal=q.customerRates?.total||0;const cvTotal=q.carrierRates?.total||0;const profit=q.profit||0;const margin=q.profitPct||0;
  $('modal-root').innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()"><div class="modal" style="width:740px">
    <div style="background:var(--navy);border-radius:10px;padding:16px 20px;margin-bottom:20px;display:flex;align-items:center;justify-content:space-between">
      <div style="display:flex;align-items:center;gap:12px">
        <svg width="36" height="36" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><rect width="60" height="60" rx="10" fill="rgba(255,255,255,.15)"/><polygon points="10,50 25,14 44,45" fill="white"/><polygon points="25,14 44,45 53,37" fill="rgba(255,255,255,.72)"/><polygon points="10,50 44,45 53,37 53,50" fill="rgba(255,255,255,.90)"/><line x1="25" y1="14" x2="44" y2="50" stroke="rgba(59,142,208,.5)" stroke-width="1.8"/></svg>
        <div><div style="font-size:18px;font-weight:800;color:#fff;letter-spacing:.5px">SHIFL</div><div style="font-size:11px;color:rgba(255,255,255,.5)">Quote #${q.quoteNum} · ${q.date}</div></div>
      </div>
      <span class="badge ${statusColors[q.status]||'gr'}" style="font-size:13px;padding:4px 12px">${q.status}</span>
    </div>
    <div class="g3" style="margin-bottom:18px">
      <div><div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--gray-400);margin-bottom:3px">Customer</div><div style="font-weight:600;color:var(--navy)">${q.customer}</div></div>
      <div><div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--gray-400);margin-bottom:3px">Carrier</div><div style="font-weight:600">${q.carrier}</div></div>
      <div><div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--gray-400);margin-bottom:3px">Mode</div><div><span class="badge ${ld==='Live'?'b':ld==='Both'?'t':'gr'}">${ld}</span></div></div>
      <div><div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--gray-400);margin-bottom:3px">Pickup</div><div style="font-size:13px">${q.port||'—'}</div></div>
      <div><div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--gray-400);margin-bottom:3px">Delivery zip</div><div style="font-weight:600">${q.zip}${getSpecialZipBadge(q.zip)}</div></div>
      <div><div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--gray-400);margin-bottom:3px">Destination</div><div style="font-size:13px">${q.destination||'—'}</div></div>
    </div>
    <div style="margin-bottom:14px;padding:10px 14px;background:${q.status==='Booked'?'#f0fdf4;border:1px solid #86efac':'var(--blue-bg)'};border-radius:var(--radius);display:flex;align-items:center;gap:12px">
      <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:${q.status==='Booked'?'#2d7d46':'var(--gray-500)'}">Shifl Ref #${q.status==='Booked'?' ✱':''}</div>
      <input type="text" value="${q.shiflRef||''}" placeholder="${q.status==='Booked'?'Assign reference number…':'Only assigned after booking'}"
        ${q.status!=='Booked'?'disabled':''} 
        oninput="S.quotes.find(q=>q.id==='${id}').shiflRef=this.value"
        onblur="dbSaveQuote(S.quotes.find(q=>q.id==='${id}'))"
        style="flex:1;padding:5px 10px;font-size:13px;font-weight:600;border:1px solid ${q.status==='Booked'?'#86efac':'var(--gray-200)'};border-radius:var(--radius);font-family:inherit;background:${q.status==='Booked'?'#fff':'var(--gray-50)'}">
      <span style="font-size:11px;color:${q.status==='Booked'?'#2d7d46':'var(--gray-400)'}">
        ${q.status==='Booked'?'Type to assign — auto-saves':'Mark as Booked to assign ref#'}
      </span>
    </div>
    ${attrLine(q)}
    <div style="border:1px solid var(--gray-200);border-radius:var(--radius);overflow:hidden;margin-bottom:16px">
      <table style="width:100%;font-size:13px;border-collapse:collapse">
        <thead><tr style="background:var(--gray-50)"><th style="padding:8px 12px;text-align:left;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--gray-500)">Charge</th><th style="padding:8px 12px;text-align:right;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--gray-400)">Carrier cost</th><th style="padding:8px 12px;text-align:right;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--steel)">Customer price</th><th style="padding:8px 12px;text-align:right;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--green)">Profit</th></tr></thead>
        <tbody>${chargeRows}<tr style="background:#f0fdf4;border-top:1px solid #86efac"><td style="padding:8px 12px;font-weight:600;color:#166534">Base rate</td><td style="padding:8px 12px;text-align:right;color:#166534">${fmtD(q.carrierRates?.base||0)}</td><td style="padding:8px 12px;text-align:right;font-weight:600;color:#166534">${fmtD(q.customerRates?.base||0)}</td><td style="padding:8px 12px;text-align:right"><span style="color:#166534;font-weight:700">+${fmtD((q.customerRates?.base||0)-(q.carrierRates?.base||0))}</span> <span style="font-size:10px;background:#dcfce7;color:#166534;padding:2px 6px;border-radius:4px">${pct((q.customerRates?.base||0)>0?((q.customerRates?.base||0)-(q.carrierRates?.base||0))/(q.customerRates?.base||1):0)}</span></td></tr>
<tr style="background:var(--navy)"><td style="padding:10px 12px;font-weight:700;color:#fff;font-size:14px">Total</td><td style="padding:10px 12px;text-align:right;color:rgba(255,255,255,.6);font-size:13px">${fmtD(cvTotal)}</td><td style="padding:10px 12px;text-align:right;font-weight:800;color:#fff;font-size:18px">${fmtD(cuTotal)}</td><td style="padding:10px 12px;text-align:right"><div style="color:#4ade80;font-weight:700">+${fmtD(profit)}</div><span class="badge ${margin>=0.10?'g':'r'}" style="margin-top:3px">${pct(margin)}</span></td></tr></tbody>
      </table>
    </div>
    <div class="modal-foot"><button class="btn" onclick="closeModal()">Close</button>
      <button class="btn" onclick="openEditQuoteModal('${id}')" style="font-weight:600">✏️ Edit quote</button>
      ${q.status==='Booked'?`<button class="btn green" onclick="downloadCarrierRateSheet(S.quotes.find(q=>q.id==='${id}'),null)">📋 Carrier rate sheet</button>`:''}
      <button class="btn" onclick="printSavedQuote('${id}')">🖨️ Print</button>
      <button class="btn blue" onclick="downloadSavedPDF('${id}')">📄 Download PDF</button></div>
  </div></div>`;
}
async function downloadSelectedDrayPDFs(){
  const ids=Array.from(window._draySelected||[]);
  if(!ids.length){alert('Select at least one quote first.');return;}
  if(!await loadJsPDF()) return;
  const{jsPDF}=window.jspdf;
  const quotes=ids.map(id=>S.quotes.find(q=>q.id===id)).filter(Boolean);
  if(!quotes.length) return;
  const doc=new jsPDF({orientation:'portrait',unit:'mm',format:'a4'});
  quotes.forEach((q,i)=>{
    if(i>0) doc.addPage();
    _generatePDF(q,doc);
  });
  doc.save('Shifl_Drayage_Quotes_Combined_'+localDateStr()+'.pdf');
  window._draySelected=new Set();
  renderLog();
}
async function downloadSavedPDF(id){
  const q=S.quotes.find(q=>q.id===id);if(!q) return;
  if(!await loadJsPDF()) return;
  _generatePDF(q);
}
function printSavedQuote(id){
  const q=S.quotes.find(q=>q.id===id);if(!q) return;
  const date=new Date(q.date).toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'});
  const win=window.open('','_blank');
  win.document.write(buildPrintHTML(q.customer,q.carrier,q.port,q.zip,q.destination,q.ld,date,q.quoteNum,q.customerRates,q.notes||''));
  win.document.close();
}
function exportQuoteLog(){if(!requireCan('export_csv','Only Admins can export the quote log.')) return;if(!S.quotes.length){alert('No quotes to export.');return;}const hdrs=['Quote #','Date','Customer','Port','Zip','Mode','Carrier','Destination','Carrier Total','Customer Total','Profit $','Profit %','Status'];const esc=v=>{const s=String(v==null?'':v);return s.includes(',')||s.includes('"')?`"${s.replace(/"/g,'""')}"`:s;};const rows=S.quotes.map(q=>[q.quoteNum,q.date,q.customer,q.port,q.zip,q.ld,q.carrier,q.destination||'',(q.carrierRates?.total||0).toFixed(2),(q.customerRates?.total||0).toFixed(2),(q.profit||0).toFixed(2),((q.profitPct||0)*100).toFixed(1)+'%',q.status].map(esc).join(','));const csv=[hdrs.join(','),...rows].join('\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download=`shifl_quotes_${localDateStr()}.csv`;a.click();URL.revokeObjectURL(a.href);}

// ═══════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════
function filterByRange(quotes,range){const now=new Date();const m=now.getMonth();const y=now.getFullYear();if(range==='week'){const ago=new Date(now-7*24*60*60*1000);return quotes.filter(q=>new Date(q.date)>=ago);}if(range==='month'){const s=new Date(y,m,1);return quotes.filter(q=>new Date(q.date)>=s);}if(range==='lastmonth'){const s=new Date(y,m-1,1);const e=new Date(y,m,1);return quotes.filter(q=>new Date(q.date)>=s&&new Date(q.date)<e);}return quotes;}
function buildBarChart(months){if(!months.length) return '';const w=280,h=100,pad=28,bw=Math.floor((w-pad)/months.length)-6;const maxV=Math.max(...months.map(m=>m.total),1);const bars=months.map((m,i)=>{const x=pad+i*Math.floor((w-pad)/months.length)+2;const bh=Math.max((m.booked/maxV)*(h-pad),0);const th=Math.max((m.total/maxV)*(h-pad),0);return `<rect x="${x}" y="${h-pad-th}" width="${bw}" height="${th}" fill="#dbeafe" rx="2"/><rect x="${x}" y="${h-pad-bh}" width="${bw}" height="${bh}" fill="#2e75b6" rx="2"/><text x="${x+bw/2}" y="${h-4}" text-anchor="middle" font-size="8" fill="#9ca3af">${m.label}</text>`;}).join('');const yLines=[0,.5,1].map(v=>{const y=h-pad-(v*(h-pad));return `<line x1="${pad}" y1="${y}" x2="${w}" y2="${y}" stroke="#f3f4f6" stroke-width="1"/><text x="${pad-2}" y="${y+3}" text-anchor="end" font-size="7" fill="#d1d5db">${Math.round(v*maxV)}</text>`;}).join('');return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${yLines}${bars}<line x1="${pad}" y1="0" x2="${pad}" y2="${h-pad}" stroke="#e5e7eb" stroke-width="1"/><line x1="${pad}" y1="${h-pad}" x2="${w}" y2="${h-pad}" stroke="#e5e7eb" stroke-width="1"/></svg><div style="display:flex;gap:12px;margin-top:6px;font-size:11px;color:var(--gray-500)"><span><span style="display:inline-block;width:10px;height:10px;background:#2e75b6;border-radius:2px;margin-right:4px;vertical-align:middle"></span>Booked</span><span><span style="display:inline-block;width:10px;height:10px;background:#dbeafe;border-radius:2px;margin-right:4px;vertical-align:middle"></span>All quotes</span></div>`;}
function buildDonut(slices){const cx=54,cy=54,r=40,ir=26;const total=slices.reduce((s,d)=>s+d.v,0);if(!total) return `<div style="text-align:center;padding:20px;color:var(--gray-400);font-size:13px">No data yet</div>`;let angle=-Math.PI/2;const paths=slices.filter(d=>d.v>0).map(d=>{const pct=d.v/total;const sweep=pct*2*Math.PI;const x1=cx+r*Math.cos(angle),y1=cy+r*Math.sin(angle);angle+=sweep;const x2=cx+r*Math.cos(angle),y2=cy+r*Math.sin(angle);const lg=pct>0.5?1:0;return `<path d="M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${lg},1 ${x2},${y2} Z" fill="${d.color}"/>`;}).join('');return `<svg width="108" height="108" viewBox="0 0 108 108">${paths}<circle cx="${cx}" cy="${cy}" r="${ir}" fill="white"/><text x="${cx}" y="${cy+4}" text-anchor="middle" font-size="14" font-weight="700" fill="#1a2e4a">${total}</text><text x="${cx}" y="${cy+14}" text-anchor="middle" font-size="8" fill="#9ca3af">quotes</text></svg>`;}
function renderDash(){
  $('topbar-right').innerHTML='';const range=S.dashFilter||'month';const all=S.quotes;const filtered=filterByRange(all,range);const booked=filtered.filter(q=>q.status==='Booked');const allBooked=all.filter(q=>q.status==='Booked');const rev=booked.reduce((s,q)=>s+(q.customerRates?.total||0),0);const prof=booked.reduce((s,q)=>s+(q.profit||0),0);
  const baseRev=booked.reduce((s,q)=>s+(q.customerRates?.base||0),0);const baseProf=booked.reduce((s,q)=>s+((q.customerRates?.base||0)-(q.carrierRates?.base||0)),0);const baseMarginAvg=baseRev>0?baseProf/baseRev:0;
  const accRev=rev-baseRev;const accProf=prof-baseProf;const now=new Date();const months=Array.from({length:6},(_,i)=>{const d=new Date(now.getFullYear(),now.getMonth()-5+i,1);const next=new Date(now.getFullYear(),now.getMonth()-5+i+1,1);const inM=all.filter(q=>{const qd=new Date(q.date);return qd>=d&&qd<next;});return{label:d.toLocaleString('default',{month:'short'}),total:inM.length,booked:inM.filter(q=>q.status==='Booked').length};});
  const donutData=[
    {v:filtered.filter(q=>q.status==='Quoted').length,color:'#fbbf24',lbl:'Quoted'},
    {v:booked.length,color:'#2d7d46',lbl:'Booked'},
    {v:filtered.filter(q=>q.status==='Lost').length,color:'#d1d5db',lbl:'Lost'},
    {v:filtered.filter(q=>q.status==='Expired').length,color:'#f87171',lbl:'Expired'},
    {v:filtered.filter(q=>q.status==='Cancelled').length,color:'#f3f4f6',lbl:'Cancelled'},
  ];
  // Win rate only counts decided quotes (Booked + Lost + Expired), not pending
  const won=filtered.filter(q=>['Booked','Delivered','Invoiced','Paid'].includes(q.status));
  const winRate=filtered.length>0?won.length/filtered.length:0;
  const cMap={};allBooked.forEach(q=>{if(!cMap[q.carrier])cMap[q.carrier]={n:0,p:0,rev:0};cMap[q.carrier].n++;cMap[q.carrier].p+=(q.profit||0);cMap[q.carrier].rev+=(q.customerRates?.total||0);});const topC=Object.entries(cMap).sort((a,b)=>b[1].n-a[1].n).slice(0,6);const recent=all.slice(0,8);const rangeLabel={week:'This week',month:'This month',lastmonth:'Last month',all:'All time'}[range];
  const todayStr=new Date().toISOString().slice(0,10);
  const todayLoads=all.filter(q=>q.date===todayStr||(q.created_at||'').startsWith(todayStr));
  const todayRev=todayLoads.reduce((s,q)=>s+(q.customerRates?.total||0),0);
  const todayProfit=todayLoads.reduce((s,q)=>s+(q.profit||0),0);
  const lateLoads=all.filter(q=>q.status==='Booked'&&q.eta&&new Date(q.eta)<new Date());
  const activeTMS=(JSON.parse(localStorage.getItem('tms_loads')||'[]')).filter(l=>l.status!=='Delivered');
  $('page').innerHTML=`
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
      <div style="font-size:13px;color:var(--gray-500)">${rangeLabel} · ${filtered.length} quote${filtered.length!==1?'s':''}</div>
      <div class="toggle-group"><button class="tgl${range==='week'?' on':''}" onclick="setDashFilter('week')">This week</button><button class="tgl${range==='month'?' on':''}" onclick="setDashFilter('month')">This month</button><button class="tgl${range==='lastmonth'?' on':''}" onclick="setDashFilter('lastmonth')">Last month</button><button class="tgl${range==='all'?' on':''}" onclick="setDashFilter('all')">All time</button></div>
    </div>
    <!-- Live margin ticker -->
    <div style="display:flex;gap:8px;margin-bottom:12px;overflow-x:auto;padding-bottom:2px">
      <div style="background:#fff;border:1px solid #e2e8f0;border-radius:9px;padding:9px 14px;text-align:center;flex:1;min-width:100px;box-shadow:0 1px 3px rgba(0,0,0,.06)"><div style="font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#94a3b8;margin-bottom:3px">Today's Revenue</div><div style="font-size:16px;font-weight:800;color:#2563eb">${fmtD(todayRev)}</div><div style="font-size:9px;color:#16a34a;margin-top:2px">${todayLoads.length} load${todayLoads.length!==1?'s':''}</div></div>
      <div style="background:#fff;border:1px solid #e2e8f0;border-radius:9px;padding:9px 14px;text-align:center;flex:1;min-width:100px;box-shadow:0 1px 3px rgba(0,0,0,.06)"><div style="font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#94a3b8;margin-bottom:3px">Today's Profit</div><div style="font-size:16px;font-weight:800;color:#059669">${fmtD(todayProfit)}</div><div style="font-size:9px;color:#94a3b8;margin-top:2px">${todayRev>0?Math.round(todayProfit/todayRev*100)+'% margin':'—'}</div></div>
      <div style="background:#fff;border:1px solid #e2e8f0;border-radius:9px;padding:9px 14px;text-align:center;flex:1;min-width:100px;box-shadow:0 1px 3px rgba(0,0,0,.06)"><div style="font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#94a3b8;margin-bottom:3px">Win Rate</div><div style="font-size:16px;font-weight:800;color:#7c3aed">${pct(winRate)}</div><div style="font-size:9px;color:#94a3b8;margin-top:2px">${booked.length} booked</div></div>
      <div style="background:#fff;border:1px solid #e2e8f0;border-radius:9px;padding:9px 14px;text-align:center;flex:1;min-width:100px;box-shadow:0 1px 3px rgba(0,0,0,.06)"><div style="font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#94a3b8;margin-bottom:3px">Active Loads</div><div style="font-size:16px;font-weight:800;color:#0f1f35">${activeTMS.length}</div><div style="font-size:9px;color:${lateLoads.length>0?'#dc2626':'#16a34a'};margin-top:2px">${lateLoads.length>0?lateLoads.length+' late ⚠':'all on track'}</div></div>
    </div>

    <div class="kpi-grid">
      <div class="kpi kpi-navy" style="cursor:pointer" onclick="setView('log');S.logFilter='all';render()"><div class="kpi-lbl">Quotes built</div><div class="kpi-val">${filtered.length}</div><div class="kpi-delta">click to view all →</div></div>
      <div class="kpi kpi-green" style="cursor:pointer" onclick="setView('log');S.logFilter='Booked';render()"><div class="kpi-lbl">Booked</div><div class="kpi-val b">${booked.length}</div><div class="kpi-delta up">${pct(winRate)} win rate</div></div>
      <div class="kpi kpi-green"><div class="kpi-lbl">Total revenue</div><div class="kpi-val g">${rev>0?fmtD(rev):'—'}</div><div class="kpi-delta">booked loads only</div></div>
      <div class="kpi kpi-amber"><div class="kpi-lbl">Total profit</div><div class="kpi-val g">${prof>0?fmtD(prof):'—'}</div><div class="kpi-delta ${prof>0?'up':''}">${booked.length>0?'avg '+pct(booked.reduce((s,q)=>s+getShipmentProfit(q,'freight').margin,0)/booked.length)+' margin':'—'}</div></div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:14px">
      <div class="kpi" style="border-left:3px solid var(--green)"><div class="kpi-lbl">Base Revenue</div><div class="kpi-val g" style="font-size:18px">${baseRev>0?fmtD(baseRev):'—'}</div><div style="font-size:11px;color:var(--gray-400);margin-top:4px">core freight only</div></div>
      <div class="kpi" style="border-left:3px solid var(--green)"><div class="kpi-lbl">Base Profit</div><div class="kpi-val g" style="font-size:18px">${baseProf>0?fmtD(baseProf):'—'}</div><div style="font-size:11px;color:var(--green);margin-top:4px">${baseRev>0?pct(baseMarginAvg)+' avg margin':'—'}</div></div>
      <div class="kpi" style="border-left:3px solid var(--steel)"><div class="kpi-lbl">Accessorial Revenue</div><div class="kpi-val" style="font-size:18px;color:var(--steel)">${accRev>0?fmtD(accRev):'—'}</div><div style="font-size:11px;color:var(--gray-400);margin-top:4px">chassis · detention · tolls</div></div>
      <div class="kpi" style="border-left:3px solid var(--steel)"><div class="kpi-lbl">Accessorial Profit</div><div class="kpi-val" style="font-size:18px;color:var(--steel)">${accProf>0?fmtD(accProf):'—'}</div><div style="font-size:11px;color:var(--gray-400);margin-top:4px">markup on pass-throughs</div></div>
    </div>
    <div style="display:grid;grid-template-columns:1fr auto 1fr;gap:14px;margin-bottom:14px">
      <div class="card" style="margin-bottom:0"><div class="sec-head">Activity — last 6 months</div>${buildBarChart(months)}</div>
      <div class="card" style="margin-bottom:0;min-width:200px"><div class="sec-head">Status breakdown</div><div style="display:flex;align-items:center;gap:12px;margin-top:4px">${buildDonut(donutData)}<div style="font-size:12px">${donutData.filter(d=>d.v>0).map(d=>`<div style="display:flex;align-items:center;gap:6px;margin-bottom:6px"><span style="width:10px;height:10px;border-radius:50%;background:${d.color};flex-shrink:0;display:inline-block;border:1px solid #e5e7eb"></span><span style="color:var(--gray-600)">${d.lbl}</span><span class="bold" style="margin-left:auto;padding-left:8px">${d.v}</span></div>`).join('')}</div></div></div>
      <div class="card" style="margin-bottom:0"><div class="sec-head">Top carriers <span class="muted" style="font-weight:400;text-transform:none;letter-spacing:0">all time</span></div>${topC.length?`<table style="width:100%;font-size:12px"><thead><tr><th style="text-align:left;padding:4px 0;font-size:10px">Carrier</th><th style="text-align:center">Booked</th><th style="text-align:right">Revenue</th><th style="text-align:right">Profit</th></tr></thead><tbody>${topC.map(([c,s])=>`<tr><td style="padding:5px 0;font-weight:600">${c}</td><td style="text-align:center"><span class="badge b">${s.n}</span></td><td style="text-align:right;color:var(--steel)">${fmtD(s.rev)}</td><td style="text-align:right;color:var(--green)">${fmtD(s.p)}</td></tr>`).join('')}</tbody></table>`:`<p class="muted small" style="margin-top:8px">Mark quotes as Booked to see carrier stats</p>`}</div>
    </div>
    <div class="card" style="margin-bottom:0">
      <div class="sec-head" style="display:flex;align-items:center;justify-content:space-between"><span>Recent quotes</span><button class="btn sm" onclick="setView('log');render()">View all →</button></div>
      ${recent.length?`<div class="tbl-wrap" style="box-shadow:none;border:none"><table><thead><tr><th>#</th><th>Date</th><th>Customer</th><th>Lane</th><th>Carrier</th><th>Customer total</th><th>Profit</th><th>Margin</th><th>Status</th></tr></thead><tbody>${recent.map(q=>`<tr onclick="showQuoteModal('${q.id}')" style="cursor:pointer"><td class="muted small">#${q.quoteNum}</td><td class="small">${q.date}</td><td class="bold">${q.customer}</td><td class="small">${q.zip} · ${q.ld}<div class="subtext">${q.destination||''}</div></td><td class="small">${q.carrier}</td><td class="bold" style="color:var(--steel)">${fmtD(q.customerRates?.total||0)}</td><td style="color:var(--green);font-weight:600">+${fmtD(q.profit||0)}</td><td><span class="badge ${(q.profitPct||0)>=0.10?'g':'r'}">${pct(q.profitPct||0)}</span></td><td onclick="event.stopPropagation()"><select onchange="updateStatus('${q.id}',this.value)" style="font-size:11px;padding:3px 5px;width:110px"><option${q.status==='Quoted'?' selected':''}>Quoted</option><option${q.status==='Booked'?' selected':''}>Booked</option><option${q.status==='Lost'?' selected':''}>Lost</option><option${q.status==='Cancelled'?' selected':''}>Cancelled</option></select></td></tr>`).join('')}</tbody></table></div>`:`<div class="empty" style="padding:30px"><p>No quotes yet</p></div>`}
    </div>`;
}
function setDashFilter(f){S.dashFilter=f;renderDash();}

// ═══════════════════════════════════════════════════════
// SHARED
// ═══════════════════════════════════════════════════════
function closeModal(){$('modal-root').innerHTML='';}
document.addEventListener('keydown',e=>{if(e.key==='Escape') closeModal();});

// ═══════════════════════════════════════════════════════
// BOOT — load Supabase client then check for saved config
// ═══════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════
// AUTH SYSTEM v2
// Root cause of v1 failure: db was shown to be null when doLogin() ran,
// because boot() called showLoginScreen() BEFORE confirming Supabase 
// connection was working. Fix: always confirm db works BEFORE login screen.
// ═══════════════════════════════════════════════════════
let _currentUser = null;

async function hashPassword(email, pw){
  const data = email.toLowerCase().trim() + ':' + pw;
  const encoded = new TextEncoder().encode(data);
  const hash = await crypto.subtle.digest('SHA-256', encoded);
  return Array.from(new Uint8Array(hash)).map(b=>b.toString(16).padStart(2,'0')).join('');
}

function getSession(){
  try{
    const s = localStorage.getItem('shifl_session');
    if(!s) return null;
    const p = JSON.parse(s);
    if(Date.now() - p.loginTime > 7*24*60*60*1000){localStorage.removeItem('shifl_session');return null;}
    return p;
  }catch(e){return null;}
}
function setSession(user){
  _currentUser = user;
  localStorage.setItem('shifl_session',JSON.stringify({...user,loginTime:Date.now()}));
  updateUserUI();
}
function clearSession(){
  _currentUser = null;
  localStorage.removeItem('shifl_session');
  updateUserUI();
}
function updateUserUI(){
  const nameEl=$('user-name-display'),roleEl=$('user-role-display'),infoEl=$('user-info'),adminNav=$('admin-nav-section');
  const ROLE_LABELS={super_admin:'Admin',admin:'Admin',team_member:'Team Member',user:'Team Member'};
  if(_currentUser){
    if(nameEl) nameEl.textContent=_currentUser.name;
    if(roleEl) roleEl.textContent=ROLE_LABELS[_currentUser.role]||_currentUser.role;
    if(infoEl) infoEl.style.display='';
    if(adminNav) adminNav.style.display=can('view_admin')?'':'none';
    // Show/hide dashboard nav for TM
    const dn=$('nav-dash');if(dn) dn.style.display=can('view_dashboard')?'':'none';
    const fdn=$('fqnav-dash');if(fdn) fdn.style.display=can('view_dashboard')?'':'none';
    const tdn=$('tlnav-dash');if(tdn) tdn.style.display=can('view_dashboard')?'':'none';
  }else{
    if(infoEl) infoEl.style.display='none';
    if(adminNav) adminNav.style.display='none';
    ['drayage','freight','air','transload','admin'].forEach(k=>{$('acc-sub-'+k)?.classList.remove('open');$('acc-'+k)?.classList.remove('open');$('acc-icon-'+k)?.classList.remove('rotated');});
  }
}

// KEY FIX v2: only call this AFTER db is confirmed working
async function checkAuthAndProceed(){
  const session = getSession();
  if(session){
    try{
      const{data:user}=await withTimeout(db.from('app_users').select('*').eq('id',session.id).single(),6000,{data:null}).then(r=>r).catch(()=>({data:null}));
      if(user && user.active){
        // Update last_login silently
        db.from('app_users').update({last_login:new Date().toISOString()}).eq('id',user.id).then(()=>{});
        setSession({id:user.id,name:user.name,email:user.email,role:user.role});
        await initApp();
        return;
      }
    }catch(e){console.log('Session check failed:',e.message);}
    clearSession();
  }
  await showLoginScreen();
}

async function showLoginScreen(){
  $('loading-screen').style.display='none';
  $('login-screen').style.display='flex';
  // Check if first user — do this in background, non-blocking
  // db is confirmed working at this point so this is safe
  try{
    const{data}=await withTimeout(db.from('app_users').select('id').limit(1),6000,{data:[]}).then(r=>r).catch(()=>({data:[]}));
    if(!data||!data.length){
      // Only show first-user setup if truly no users exist
      $('first-user-banner').style.display='';
      $('login-name-field').style.display='';
      $('login-btn').textContent='Create admin account';
    } else {
      // Users exist — ensure sign-in only mode
      $('first-user-banner').style.display='none';
      $('login-name-field').style.display='none';
      $('login-btn').textContent='Sign in';
    }
  }catch(e){/* table might not exist yet */}
  setTimeout(()=>{const el=$('login-email');if(el)el.focus();},100);
}

async function doLogin(){
  // Safety check — this should never be null now (boot confirms db first)
  if(!db){
    showLoginErr('No database connection. Please refresh the page.');return;
  }
  const nameEl=$('login-name'),emailEl=$('login-email'),pwEl=$('login-password');
  const email=(emailEl?.value||'').trim().toLowerCase();
  const pw = pwEl?.value||'';
  const name=(nameEl?.value||'').trim();
  if(!email||!pw){showLoginErr('Please enter your email and password.');return;}

  const btn=$('login-btn');
  const origText=btn.textContent;
  btn.textContent='Signing in...';btn.disabled=true;

  try{
    const hash = await hashPassword(email, pw);

    // Check if first user
    const{data:existing}=await db.from('app_users').select('id').limit(1);
    if(!existing||!existing.length){
      if(!name){showLoginErr('Please enter your name.');btn.textContent='Create admin account';btn.disabled=false;return;}
      const id=uid();
      const{error}=await db.from('app_users').insert({id,name,email,password_hash:hash,role:'super_admin',active:true});
      if(error) throw error;
      setSession({id,name,email,role:'super_admin'});
      await finishLogin();
      return;
    }

    // Normal login
    const{data:user,error}=await withTimeout(db.from('app_users').select('*').eq('email',email).single(),8000,{data:null,error:new Error('timeout')}).then(r=>r).catch(e=>({data:null,error:e}));
    if(error||!user){showLoginErr('No account found with that email.');btn.textContent=origText;btn.disabled=false;return;}
    if(!user.active){showLoginErr('Your account has been deactivated. Contact your admin.');btn.textContent=origText;btn.disabled=false;return;}
    if(user.password_hash!==hash){showLoginErr('Incorrect password. Try again.');btn.textContent=origText;btn.disabled=false;return;}

    db.from('app_users').update({last_login:new Date().toISOString()}).eq('id',user.id).then(()=>{});
    setSession({id:user.id,name:user.name,email:user.email,role:user.role});
    await finishLogin();

  }catch(e){
    showLoginErr('Error: '+e.message);
    btn.textContent=origText;btn.disabled=false;
  }
}
function showLoginErr(msg){const el=$('login-error');if(el){el.textContent=msg;el.style.display='';}}
async function finishLogin(){
  $('login-screen').style.display='none';
  $('loading-screen').style.display='flex';
  $('loading-msg').textContent='Loading your workspace...';
  await initApp();
}
function logout(){
  if(!confirm('Sign out of Shifl?')) return;
  clearSession();
  $('app').style.display='none';
  $('login-screen').style.display='flex';
  const err=$('login-error');if(err)err.style.display='none';
  const pw=$('login-password');if(pw)pw.value='';
  const btn=$('login-btn');if(btn){btn.textContent='Sign in';btn.disabled=false;}
  setTimeout(()=>{const el=$('login-email');if(el)el.focus();},100);
}

// ── Edit own profile ──────────────────────────────────────────────────────
function showEditMyProfile(){
  if(!_currentUser) return;
  $('modal-root').innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()">
    <div class="modal"><div class="modal-title">My profile</div>
    <div class="field"><label>Your name</label>
      <input type="text" id="mp-name" value="${_currentUser.name}" placeholder="Your name"></div>
    <div class="field"><label>New password <span style="font-weight:400;color:var(--gray-400)">(leave blank to keep current)</span></label>
      <input type="password" id="mp-pw" placeholder="New password"></div>
    <div class="field"><label>Confirm new password</label>
      <input type="password" id="mp-pw2" placeholder="Confirm password"></div>
    <div class="modal-foot">
      <button class="btn" onclick="closeModal()">Cancel</button>
      <button class="btn blue" onclick="saveMyProfile()">Save changes</button>
    </div></div></div>`;
}
async function saveMyProfile(){
  const name=($('mp-name')||{}).value?.trim();
  const pw=$('mp-pw')?.value;
  const pw2=$('mp-pw2')?.value;
  if(!name){alert('Name is required.');return;}
  if(pw&&pw!==pw2){alert('Passwords do not match.');return;}
  try{
    const updates={name};
    if(pw) updates.password_hash=await hashPassword(_currentUser.email,pw);
    const{error}=await db.from('app_users').update(updates).eq('id',_currentUser.id);
    if(error) throw error;
    _currentUser.name=name;
    setSession({..._currentUser});
    closeModal();updateUserUI();
    alert('✅ Profile updated!');
  }catch(e){alert('Error: '+e.message);}
}

// ── Admin panel ───────────────────────────────────────────────────────────
async function renderActivity(){
  if(!can('view_activity')){$('page').innerHTML='<div style="padding:40px;color:var(--gray-400);text-align:center">Admin access required</div>';return;}
  $('topbar-right').innerHTML='';
  $('page').innerHTML='<div class="loading-page"><div class="spin" style="margin:0 auto"></div></div>';
  try{
    // Combine all quotes with user attribution
    const dray=(S.quotes||[]).map(q=>({type:'Drayage',date:q.date,customer:q.customer||'—',detail:q.carrier+' → '+q.zip,amount:q.customerRates?.total||0,profit:q.profit||0,status:q.status,created_by:q.created_by_name||'—',booked_by:q.booked_by_name||null,quoteNum:q.quoteNum}));
    const fq=(window._fqHistory||[]).map(q=>({type:q.fqMode||'Freight',date:q.date,customer:q.customer||'—',detail:q.pickupZip+' → '+q.deliveryZip,amount:q.customerRate||0,profit:q.profit||0,status:q.status,created_by:q.created_by_name||'—',booked_by:q.booked_by_name||null}));
    const tl=(window._tlHistory||[]).map(q=>({type:'Transload',date:q.date,customer:q.customer||'—',detail:(q.drayPort||'—')+' → '+q.outDeliveryZip,amount:q.totalCustomer||0,profit:q.profit||0,status:q.status,created_by:q.created_by_name||'—',booked_by:null}));
    const all=[...dray,...fq,...tl].sort((a,b)=>(b.date||'').localeCompare(a.date||''));

    // Group by user
    const byUser={};all.forEach(q=>{const u=q.created_by||'Unknown';if(!byUser[u])byUser[u]={quotes:0,booked:0,revenue:0,profit:0};byUser[u].quotes++;if(q.status==='Booked'||q.status==='Delivered')byUser[u].booked++;byUser[u].revenue+=q.amount;byUser[u].profit+=q.profit;});

    let h='<div class="g3" style="margin-bottom:20px">';
    h+=Object.entries(byUser).sort((a,b)=>b[1].revenue-a[1].revenue).map(([name,s])=>`
      <div class="card" style="padding:16px">
        <div style="font-size:14px;font-weight:800;color:var(--navy);margin-bottom:10px">👤 ${name}</div>
        <div style="display:flex;gap:14px;flex-wrap:wrap">
          <div><div style="font-size:10px;font-weight:700;text-transform:uppercase;color:var(--gray-400)">Quotes</div><div style="font-size:22px;font-weight:800;color:var(--navy)">${s.quotes}</div></div>
          <div><div style="font-size:10px;font-weight:700;text-transform:uppercase;color:var(--gray-400)">Booked</div><div style="font-size:22px;font-weight:800;color:var(--green)">${s.booked}</div></div>
          <div><div style="font-size:10px;font-weight:700;text-transform:uppercase;color:var(--gray-400)">Win Rate</div><div style="font-size:22px;font-weight:800;color:var(--navy)">${s.quotes>0?(s.booked/s.quotes*100).toFixed(0)+'%':'—'}</div></div>
          <div><div style="font-size:10px;font-weight:700;text-transform:uppercase;color:var(--gray-400)">Revenue</div><div style="font-size:18px;font-weight:800;color:var(--steel)">${fmtD(s.revenue)}</div></div>
        </div>
      </div>`).join('');
    h+='</div>';

    // Full activity table
    h+='<div class="tbl-wrap"><table><thead><tr><th>Date</th><th>User</th><th>Type</th><th>Customer</th><th>Lane / Detail</th><th>Amount</th><th>Profit</th><th>Booked by</th><th>Status</th></tr></thead><tbody>';
    h+=all.slice(0,100).map(q=>`<tr>
      <td class="muted">${q.date||'—'}</td>
      <td style="font-weight:600;font-size:12px">${q.created_by}</td>
      <td><span class="badge bb" style="font-size:10px">${q.type}</span></td>
      <td class="bold">${q.customer}</td>
      <td class="muted" style="font-size:12px">${q.detail}</td>
      <td class="money" style="color:var(--steel)">${fmtD(q.amount)}</td>
      <td style="color:var(--green);font-weight:600">${q.profit?'+'+fmtD(q.profit):'—'}</td>
      <td style="font-size:11px;color:var(--green)">${q.booked_by||'—'}</td>
      <td><span class="badge ${q.status==='Booked'||q.status==='Delivered'?'g':q.status==='Lost'||q.status==='Cancelled'?'r':'a'}">${q.status}</span></td>
    </tr>`).join('');
    h+='</tbody></table></div>';
    $('page').innerHTML=h;
  }catch(e){$('page').innerHTML='<div class="alert r">Error: '+e.message+'</div>';}
}
async function renderAdmin(){
  if(!can('view_admin')){
    $('page').innerHTML='<div class="empty"><p>Admin access only.</p></div>';return;
  }
  // Store portal link in a global so the button can access it safely
  window._adminPortalLink = (function(){
    const u=localStorage.getItem('sb_url')||'';
    const k=localStorage.getItem('sb_key')||'';
    const base='https://mkshifl.github.io/shifl-quoting/portal.html';
    return u&&k ? base+'?su='+encodeURIComponent(u)+'&sk='+encodeURIComponent(k) : base+'?setup=1';
  })();
  $('topbar-right').innerHTML='<button class="btn" onclick="copyPortalLink()" title="Copy pre-configured portal link to send to customers">🔗 Copy portal link</button> <button class="btn blue" onclick="showCreateUser()" style="margin-left:6px">+ Add user</button>';
  const{data:users}=await db.from('app_users').select('*').order('created_at',{ascending:true});
  const rows=(users||[]).map(u=>`<tr>
    <td class="bold">${u.name}</td>
    <td class="muted">${u.email}</td>
    <td>${u.role==='customer'?`<span class="badge" style="background:#dbeafe;color:#1d4ed8">🌐 Customer${u.company?' · '+u.company:''}</span>`:u.role==='super_admin'?'<span class="badge" style="background:#ede9fe;color:#5b21b6">Super Admin</span>':u.role==='admin'?'<span class="badge b">Admin</span>':'<span class="badge gr">Team Member</span>'}</td>
    <td><span class="badge ${u.active?'g':'r'}">${u.active?'Active':'Inactive'}</span></td>
    <td class="muted small">${u.last_login?new Date(u.last_login).toLocaleDateString():'Never'}</td>
    <td style="white-space:nowrap">
      <button class="btn sm" onclick="showEditUser('${u.id}')">✏️ Edit</button>
      ${u.id!==_currentUser.id?`
        <button class="btn sm" onclick="showResetPassword('${u.id}','${u.name.replace(/'/g,'')}')" style="margin-left:4px">🔑 Reset PW</button>
        <button class="btn sm" onclick="toggleUserActive('${u.id}',${u.active})" style="margin-left:4px">${u.active?'Deactivate':'Activate'}</button>
        <button class="btn sm" onclick="deleteUser('${u.id}','${u.name.replace(/'/g,'')}')" style="margin-left:4px;color:#dc2626;border-color:#fca5a5">🗑️ Delete</button>
      `:'<span class="muted small" style="margin-left:6px">(you)</span>'}
    </td>
  </tr>`).join('');
  const resendKey = localStorage.getItem('shifl_resend_key')||'';
  $('page').innerHTML=`<div class="card">
    <div class="sec-head">Team members</div>
    <div class="tbl-wrap" style="box-shadow:none;border:none;margin:0">
      <table><thead><tr><th>Name</th><th>Email</th><th>Role / Company</th><th>Status</th><th>Last login</th><th></th></tr></thead>
      <tbody>${rows||'<tr><td colspan="6" style="text-align:center;padding:30px;color:var(--gray-400)">No users yet</td></tr>'}</tbody>
      </table>
    </div>
  </div>
  <div class="card" style="margin-top:14px">
    <div class="sec-head">Email Settings</div>
    <p style="font-size:13px;color:var(--gray-500);margin-bottom:14px">
      Shifl uses <strong>Resend</strong> to send rate confirmation emails with PDF attachments directly from trucking@shifl.com.<br>
      Get your API key at <a href="https://resend.com" target="_blank" style="color:var(--steel)">resend.com</a> and verify the shifl.com domain.
    </p>
    <div style="display:flex;align-items:flex-end;gap:10px;max-width:520px">
      <div class="field" style="flex:1;margin:0">
        <label>Resend API key</label>
        <input type="password" id="resend-key-input" value="${resendKey}" placeholder="re_xxxxxxxxxxxxxxxxxx" style="font-family:monospace">
      </div>
      <button class="btn blue" onclick="saveResendKey()" style="flex-shrink:0;padding:8px 18px">Save</button>
      <button class="btn" onclick="testResendKey()" style="flex-shrink:0;padding:8px 18px">🔬 Test</button>
    </div>
    ${resendKey?'<div style="font-size:12px;color:var(--green);margin-top:8px;font-weight:600">✓ Resend API key saved — <a href="#" onclick="testResendKey();return false" style="color:var(--steel)">Send test email →</a></div>':''}
  </div>`;
}

function copyPortalLink(){
  const link = window._adminPortalLink || 'https://mkshifl.github.io/shifl-quoting/portal.html?setup=1';
  navigator.clipboard.writeText(link).then(()=>{
    showToast('✓ Portal link copied! Send this to your customer.');
  }).catch(()=>{
    prompt('Copy this link and send to your customer:', link);
  });
}
function showCreateUser(){
  if(_currentUser?.role!=='super_admin'){alert('Only a Super Admin can create new users.');return;}
  $('modal-root').innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()">
    <div class="modal"><div class="modal-title">Add team member</div>
    <div class="g2">
      <div class="field"><label>Full name *</label><input type="text" id="nu-name" placeholder="e.g. Julianny Garcia"></div>
      <div class="field"><label>Email *</label><input type="email" id="nu-email" placeholder="julianny@shifl.com"></div>
    </div>
    <div class="g2">
      <div class="field"><label>Password *</label><input type="password" id="nu-pw" placeholder="Set a temporary password"></div>
      <div class="field"><label>Role</label>
        <select id="nu-role" onchange="toggleCustomerFields(this.value)">
          <option value="team_member">Team Member</option>
          <option value="admin">Admin</option>
          <option value="super_admin">Super Admin</option>
          <option value="customer">🌐 Customer (portal access)</option>
        </select>
      </div>
    </div>
    <div id="customer-fields" style="display:none;background:#f0f6ff;border:1px solid #bfdbfe;border-radius:8px;padding:12px 14px;margin-top:4px">
      <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#1d4ed8;margin-bottom:10px">Customer portal settings</div>
      <div class="field"><label>Company name *</label><input type="text" id="nu-company" placeholder="e.g. TJB Linens Corp"></div>
      <div class="field" style="margin-top:8px"><label>Portal access level</label>
        <select id="nu-portal-level">
          <option value="full">Full access — quotes, tracking, invoices, disputes</option>
          <option value="quotes_only">Quotes only — can only request freight quotes</option>
        </select>
      </div>
      <div style="font-size:11px;color:#3b82f6;margin-top:8px">
        ✓ Customer will log in at <strong>portal.html</strong> with the email + password above<br>
        ✓ They will only see their own company's data
      </div>
    </div>
    <div class="modal-foot">
      <button class="btn" onclick="closeModal()">Cancel</button>
      <button class="btn blue" onclick="createUser()">Create account</button>
    </div></div></div>`;
}
async function createUser(){
  if(_currentUser?.role!=='super_admin'){alert('Only a Super Admin can create new users.');return;}
  const name=($('nu-name')||{}).value?.trim();
  const email=($('nu-email')||{}).value?.trim().toLowerCase();
  const pw=($('nu-pw')||{}).value;
  const role=($('nu-role')||{}).value||'user';
  if(!name||!email||!pw){alert('Name, email and password are all required.');return;}
  const company = ($('nu-company')||{}).value?.trim()||'';
  const portalLevel = ($('nu-portal-level')||{}).value||'full';
  if(role==='customer'&&!company){alert('Company name is required for customer accounts.');return;}
  try{
    const hash=await hashPassword(email,pw);
    const newUserId = uid();
    const{error}=await db.from('app_users').insert({id:newUserId,name,email,password_hash:hash,role,active:true});
    if(error) throw error;
    // For customer accounts, store company + portal_level in customers table
    if(role==='customer' && company){
      await db.from('customers').upsert({id:newUserId,company,email,contact:name,portal_level:portalLevel,portal_user:true});
    }
    logAction('user_added',`${name} (${email}) — Role: ${role}${company?' | '+company:''}`);
    closeModal();renderAdmin();
    // Email credentials via mailto
    const isCustomer = role==='customer';
    const loginUrl = isCustomer ? 'https://mkshifl.github.io/shifl-quoting/portal.html' : 'https://mkshifl.github.io/shifl-quoting/';
    const subj=encodeURIComponent(isCustomer?'Your Shifl customer portal is ready':'Your Shifl account is ready');
    const body=encodeURIComponent('Hi '+name+','+(isCustomer?'\n\nYour '+company+' customer portal account has been set up.\n\nPortal: '+loginUrl:'\n\nYour Shifl Freight Quoting account has been created.\n\nLogin: '+loginUrl)+'\nEmail: '+email+'\nPassword: '+pw+'\n\nPlease change your password after first login.\n\nThanks,\nShifl Team');
    window.open('mailto:'+email+'?subject='+subj+'&body='+body);
  }catch(e){alert('Error creating user: '+e.message);}
}
async function showEditUser(id){
  if(!can('edit_users')){alert('You do not have permission to edit users.');return;}
  const{data:u}=await db.from('app_users').select('*').eq('id',id).single();
  if(!u) return;
  $('modal-root').innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()">
    <div class="modal"><div class="modal-title">Edit user — ${u.name}</div>
    <div class="g2">
      <div class="field"><label>Full name</label><input type="text" id="eu-name" value="${u.name}" placeholder="Full name"></div>
      <div class="field"><label>Email</label><input type="email" id="eu-email" value="${u.email}" placeholder="email@company.com"></div>
    </div>
    <div class="field"><label>Role</label>
      <select id="eu-role" onchange="toggleCustomerFields(this.value,'eu-')">
        <option value="team_member" ${u.role==='team_member'||u.role==='user'?'selected':''}>Team Member</option>
        <option value="admin" ${u.role==='admin'?'selected':''}>Admin</option>
        <option value="super_admin" ${u.role==='super_admin'?'selected':''}>Super Admin</option>
        <option value="customer" ${u.role==='customer'?'selected':''}>🌐 Customer (portal access)</option>
      </select>
    </div>
    <div id="customer-fields" style="display:${u.role==='customer'?'block':'none'};background:#f0f6ff;border:1px solid #bfdbfe;border-radius:8px;padding:12px 14px;margin-top:4px">
      <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#1d4ed8;margin-bottom:10px">Customer portal settings</div>
      <div class="field"><label>Company name *</label><input type="text" id="eu-company" value="${u.company||''}" placeholder="e.g. TJB Linens Corp"></div>
      <div class="field" style="margin-top:8px"><label>Portal access level</label>
        <select id="eu-portal-level">
          <option value="full" ${(u.portal_level||'full')==='full'?'selected':''}>Full access — quotes, tracking, invoices, disputes</option>
          <option value="quotes_only" ${u.portal_level==='quotes_only'?'selected':''}>Quotes only — can only request freight quotes</option>
        </select>
      </div>
    </div>
    <div class="modal-foot">
      <button class="btn" onclick="closeModal()">Cancel</button>
      <button class="btn blue" onclick="saveEditUser('${id}')">Save changes</button>
    </div></div></div>`;
}
async function saveEditUser(id){
  if(!can('edit_users')){alert('You do not have permission to edit users.');return;}
  const name=($('eu-name')||{}).value?.trim();
  const email=($('eu-email')||{}).value?.trim().toLowerCase();
  const role=($('eu-role')||{}).value||'user';
  if(!name||!email){alert('Name and email are required.');return;}
  const company2 = ($('eu-company')||{}).value?.trim()||null;
  const portalLevel2 = ($('eu-portal-level')||{}).value||'full';
  try{
    const{error}=await db.from('app_users').update({name,email,role}).eq('id',id);
    if(error) throw error;
    // Update company + portal_level in customers table
    if(role==='customer' && company2){
      await db.from('customers').upsert({id,company:company2,email,contact:name,portal_level:portalLevel2,portal_user:true});
    }
    closeModal();renderAdmin();showToast('✅ User updated.');
  }catch(e){alert('Error: '+e.message);}
}
async function toggleUserActive(id,currentActive){
  if(!confirm((currentActive?'Deactivate':'Activate')+' this user?')) return;
  await db.from('app_users').update({active:!currentActive}).eq('id',id);
  renderAdmin();
}
async function deleteUser(id,name){
  if(_currentUser?.role!=='super_admin'){alert('Only a Super Admin can delete users.');return;}
  if(!confirm('Permanently delete "'+name+'"? This cannot be undone.')) return;
  if(!confirm('Are you 100% sure? '+name+'\'s access will be removed immediately.')) return;
  try{
    const{error}=await db.from('app_users').delete().eq('id',id);
    if(error) throw error;
    renderAdmin();alert('✅ User deleted.');
  }catch(e){alert('Error: '+e.message);}
}
function showResetPassword(id,name){
  $('modal-root').innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()">
    <div class="modal"><div class="modal-title">Reset password — ${name}</div>
    <div class="field"><label>New password</label><input type="password" id="rp-pw" placeholder="Enter new password"></div>
    <div class="modal-foot">
      <button class="btn" onclick="closeModal()">Cancel</button>
      <button class="btn blue" onclick="doResetPassword('${id}')">Reset & email</button>
    </div></div></div>`;
}
async function doResetPassword(id){
  const pw=($('rp-pw')||{}).value;
  if(!pw){alert('Enter a new password.');return;}
  const{data:user}=await db.from('app_users').select('email,name').eq('id',id).single();
  if(!user){alert('User not found.');return;}
  const hash=await hashPassword(user.email,pw);
  await db.from('app_users').update({password_hash:hash}).eq('id',id);
  closeModal();
  const subj=encodeURIComponent('Your Shifl password has been reset');
  const body=encodeURIComponent('Hi '+user.name+',\n\nYour Shifl password has been reset.\n\nLogin: https://mkshifl.github.io/shifl-quoting/\nEmail: '+user.email+'\nNew password: '+pw+'\n\nThanks,\nShifl Team');
  window.open('mailto:'+user.email+'?subject='+subj+'&body='+body);
}

// ── Quote attribution helpers ──────────────────────────────────────────────
function attrLine(q){
  const p=[];
  if(q&&q.created_by_name) p.push('✍️ Created by <strong>'+q.created_by_name+'</strong>');
  if(q&&q.booked_by_name) p.push('✅ Booked by <strong>'+q.booked_by_name+'</strong>');
  return p.length?'<div style="font-size:11px;color:var(--gray-500);padding:6px 2px;display:flex;gap:16px;margin-bottom:8px">'+p.join(' · ')+'</div>':'';
}

async function boot(){
  const tmout=ms=>new Promise((_,rej)=>setTimeout(()=>rej(new Error('timeout')),ms));
  // Step 1: Load Supabase CDN
  try{
    await Promise.race([
      new Promise((res,rej)=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';s.onload=res;s.onerror=()=>rej(new Error('CDN failed'));document.head.appendChild(s);}),
      tmout(12000)
    ]);
  }catch(e){
    $('loading-screen').style.display='none';$('setup-screen').style.display='flex';
    const er=$('setup-error');if(er){er.style.display='block';er.textContent='Could not load database library. Check your internet connection.';}
    return;
  }
  const url=localStorage.getItem('sb_url'),key=localStorage.getItem('sb_key');
  if(!url||!key){$('loading-screen').style.display='none';$('setup-screen').style.display='flex';return;}
  // Step 2: Create client
  try{const{createClient}=window.supabase;db=createClient(url,key);}catch(e){db=null;$('loading-screen').style.display='none';$('setup-screen').style.display='flex';return;}
  // Step 3: CONFIRM connection — MUST happen before auth to prevent null db bug
  try{
    await Promise.race([db.from('rates').select('id').limit(1),tmout(5000)]);
  }catch(e){
    db=null;$('loading-screen').style.display='none';$('setup-screen').style.display='flex';
    const er=$('setup-error');if(er){er.style.display='block';er.textContent='Could not connect to database. Check your credentials.';}
    return;
  }
  // Step 4: db confirmed working — safe to authenticate
  await checkAuthAndProceed();
}

// ═══════════════════════════════════════════════════════
// CARRIER NETWORK
// ═══════════════════════════════════════════════════════
const CARRIER_MODES = ['Drayage','Box Truck','FTL','LTL','LCL'];
let _carrierSearch='';
let _carrierModeFilter='All';

async function upsertCarrier(name, mode) {
  if(!name||!db||name==='—') return;
  try {
    const{data:existing}=await db.from('carriers').select('id,modes').eq('name',name).limit(1);
    const found=existing&&existing[0];
    if(found){
      const modes=found.modes||[];
      if(!modes.includes(mode)){
        await db.from('carriers').update({modes:[...modes,mode],updated_at:new Date().toISOString()}).eq('id',found.id);
      }
    } else {
      await db.from('carriers').insert({id:uid(),name,modes:[mode],created_at:new Date().toISOString(),updated_at:new Date().toISOString()});
    }
  } catch(e){ console.log('Carrier upsert:',e.message); }
}

async function renderCarriers(){
  $('topbar-right').innerHTML=`<button class="btn" onclick="openCarrierFraudDetector()">🚨 Fraud check</button><button class="btn" onclick="openInsuranceLapseTracker()">🔔 Insurance</button><button class="btn blue" onclick="showCarrierModal()">+ Add carrier</button>`;
  $('page').innerHTML='<div style="text-align:center;padding:40px"><div class="loading-spin" style="margin:0 auto 12px"></div><div style="color:var(--gray-400);font-size:13px">Loading carriers...</div></div>';
  try{
    const{data:carriers}=await db.from('carriers').select('*').order('name');
    const all=carriers||[];
    let shown=all;
    if(_carrierModeFilter!=='All') shown=shown.filter(c=>(c.modes||[]).includes(_carrierModeFilter));
    if(_carrierSearch) shown=shown.filter(c=>c.name.toLowerCase().includes(_carrierSearch.toLowerCase())||(c.contact_name||'').toLowerCase().includes(_carrierSearch.toLowerCase()));
    const modeTabs=['All',...CARRIER_MODES].map(m=>{const active=_carrierModeFilter===m?' blue':'';const cnt=m==='All'?' ('+all.length+')':'';return '<button class="btn'+active+' btn-sm" onclick="_carrierModeFilter=\''+m+'\';renderCarriers()">'+m+cnt+'</button>';}).join('');

    if(!all.length){
      $('page').innerHTML=`<div style="text-align:center;padding:60px 20px">
        <div style="font-size:48px;margin-bottom:14px;opacity:.4">🤝</div>
        <div style="font-size:16px;font-weight:700;color:var(--gray-500);margin-bottom:6px">No carriers yet</div>
        <div style="font-size:13px;color:var(--gray-400);max-width:340px;margin:0 auto 20px;line-height:1.6">Carriers are added automatically every time you save a quote. You can also add them manually.</div>
        <button class="btn blue" onclick="showCarrierModal()">+ Add carrier manually</button>
      </div>`;
      return;
    }
    const rows=shown.map(c=>{
      const onb=getCarrierOnboardData(c.name);
      const isOnboarded=isCarrierOnboarded(c.name);
      const obStatus=getOnboardStatus(c.name);
      const insExpiry=onb.insExpiry?new Date(onb.insExpiry):null;
      const today=new Date();
      const insExpired=insExpiry&&insExpiry<today;
      const insExpiring=insExpiry&&!insExpired&&(insExpiry-today)<30*86400000;
      const statusDot=isOnboarded
        ?'<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#16a34a;margin-right:6px" title="Onboarded"></span>'
        :'<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#f59e0b;margin-right:6px" title="Incomplete onboarding"></span>';
      return `<tr class="carrier-row" onclick="showCarrierDetail('${c.id}')" style="cursor:pointer">
        <td style="min-width:180px">
          <div style="display:flex;align-items:center">
            ${statusDot}
            <div>
              <div style="font-weight:600;color:var(--navy);font-size:13px">${c.name}</div>
              ${onb.mc?`<div style="font-size:10px;color:var(--gray-400)">MC-${onb.mc}${onb.dot?' · DOT '+onb.dot:''}</div>`:''}
            </div>
          </div>
        </td>
        <td style="min-width:120px">${(c.modes||[]).map(m=>`<span style="display:inline-flex;padding:1px 6px;border-radius:99px;font-size:10px;font-weight:700;background:#dbeafe;color:#1e40af;margin-right:2px;margin-bottom:2px">${m}</span>`).join('')||'<span style="color:var(--gray-400);font-size:12px">—</span>'}</td>
        <td style="min-width:130px;font-size:13px">${c.contact_name||'<span style="color:var(--gray-400)">—</span>'}</td>
        <td style="min-width:120px;font-size:12px;color:var(--gray-500)">${c.phone||'—'}</td>
        <td style="min-width:160px;font-size:12px;color:var(--gray-500)">${c.email||'—'}</td>
        <td style="min-width:100px">
          <div style="display:flex;flex-direction:column;gap:2px">
            <span style="font-size:10px;font-weight:700;padding:1px 7px;border-radius:99px;display:inline-block;width:fit-content;background:${isOnboarded?'#dcfce7':'#fef3c7'};color:${isOnboarded?'#16a34a':'#92400e'}">${obStatus.icon} ${obStatus.label}</span>
            ${onb.insurance?`<span style="font-size:10px;padding:1px 6px;border-radius:99px;display:inline-block;width:fit-content;background:${insExpired?'#fee2e2':insExpiring?'#fef3c7':'#f0fdf4'};color:${insExpired?'#dc2626':insExpiring?'#d97706':'#16a34a'}">${insExpired?'⚠ COI expired':insExpiring?'⚠ COI expiring':'✓ COI on file'}</span>`:'<span style="font-size:10px;color:#9ca3af">No COI</span>'}
            ${onb.w9?'<span style="font-size:10px;color:#16a34a">✓ W-9</span>':'<span style="font-size:10px;color:#9ca3af">No W-9</span>'}
          </div>
        </td>
        <td onclick="event.stopPropagation()" style="min-width:180px;white-space:nowrap">
          <div style="display:flex;gap:3px;align-items:center;flex-wrap:nowrap">
            <button class="btn btn-sm" onclick="openCarrierOnboarding('${c.name.replace(/'/g,"\'")}'); event.stopPropagation()" title="${isOnboarded?'Onboarded — view file':'Complete onboarding'}" style="${isOnboarded?'color:#16a34a;border-color:#bbf7d0':''}">
              ${isOnboarded?'✅ Onboarded':'📋 Onboard'}
            </button>
            <button class="btn btn-sm" onclick="event.stopPropagation();showCarrierModal('${c.id}')" title="Edit">✏️</button>
            <button class="btn btn-sm" onclick="event.stopPropagation();openCarrierRateChart('${c.name.replace(/'/g,"\'")}')" title="Rate history">📈</button>
            <button class="btn btn-sm" onclick="event.stopPropagation();toggleBlacklist('${c.name.replace(/'/g,"\'") }');renderCarriers()" style="color:${isBlacklisted(c.name)?'var(--red)':'var(--gray-400)'}" title="Blacklist">🚫</button>
            <button class="btn btn-sm" data-cid="${c.id}" data-cname="${c.name}" onclick="event.stopPropagation();confirmDeleteCarrier(this.dataset.cid,this.dataset.cname)" style="color:#dc2626;border-color:#fca5a5" title="Delete">🗑️</button>
          </div>
        </td>
      </tr>`;
    }).join('');

    $('page').innerHTML=`
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;flex-wrap:wrap">
        <div style="display:flex;align-items:center;gap:6px;background:#fff;border:1px solid var(--gray-200);border-radius:var(--radius);padding:6px 12px;flex:1;max-width:280px">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="8" stroke="var(--gray-400)" stroke-width="2"/><path d="m21 21-4.35-4.35" stroke="var(--gray-400)" stroke-width="2" stroke-linecap="round"/></svg>
          <input type="text" placeholder="Search by name or contact..." value="${_carrierSearch}" oninput="_carrierSearch=this.value;filterCarrierRows()" style="border:none;outline:none;font-size:13px;font-family:inherit;color:var(--navy);background:none;width:100%">
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap">${modeTabs}</div>
      </div>
      ${shown.length===0?'<div style="text-align:center;padding:40px;color:var(--gray-400)">No carriers match your filter</div>':`
      <div class="tbl-wrap">
        <table style="width:100%;border-collapse:collapse">
          <thead><tr>
            <th style="min-width:180px">Carrier</th>
            <th style="min-width:120px">Modes</th>
            <th style="min-width:130px">Contact</th>
            <th style="min-width:120px">Phone</th>
            <th style="min-width:160px">Email</th>
            <th style="min-width:100px">Status</th>
            <th style="min-width:180px">Actions</th>
          </tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`}`;
  } catch(e) { $('page').innerHTML=`<div class="card" style="color:var(--red)">Error: ${e.message}</div>`; }
}

async function showCarrierModal(id) {
  let c={};
  if(id){ const{data}=await db.from('carriers').select('*').eq('id',id).single(); c=data||{}; }
  $('modal-root').innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()">
    <div class="modal" style="max-width:500px">
      <div class="modal-title">${id?'Edit carrier':'Add carrier'}</div>
      <div class="field"><label>Carrier name *</label><input type="text" id="car-name" value="${c.name||''}" placeholder="e.g. Eagle Express Freight"></div>
      <div class="field"><label>Modes they serve</label>
        <div style="display:flex;flex-wrap:wrap;gap:10px;margin-top:6px">
          ${CARRIER_MODES.map(m=>`<label style="display:flex;align-items:center;gap:5px;font-size:13px;cursor:pointer;font-weight:400">
            <input type="checkbox" value="${m}" ${(c.modes||[]).includes(m)?'checked':''} style="width:auto"> ${m}
          </label>`).join('')}
        </div>
      </div>
      <div class="field"><label>Point of contact name</label><input type="text" id="car-poc" value="${c.contact_name||''}" placeholder="Dispatcher or sales contact"></div>
      <div class="g2">
        <div class="field"><label>Phone</label><input type="text" id="car-ph" value="${c.phone||''}" placeholder="(555) 123-4567"></div>
        <div class="field"><label>Email</label><input type="email" id="car-em" value="${c.email||''}" placeholder="dispatch@carrier.com"></div>
      </div>
      <div class="field"><label>Notes</label><textarea id="car-notes" rows="2" style="width:100%;padding:8px;border:1px solid var(--gray-300);border-radius:var(--radius);font-size:13px;font-family:inherit;resize:vertical">${c.notes||''}</textarea></div>
      <div class="modal-foot">
        ${id?`<button class="btn" onclick="delCarrier('${id}','${(c.name||'').replace(/'/g,'')}')" style="margin-right:auto;color:var(--red);border-color:#fca5a5">🗑️ Delete</button>`:''}
        <button class="btn" onclick="closeModal()">Cancel</button>
        <button class="btn blue" onclick="saveCarrier('${id||''}')">Save carrier</button>
      </div>
    </div></div>`;
}

async function saveCarrier(id){
  const name=($('car-name')||{}).value?.trim();
  if(!name){alert('Carrier name is required.');return;}
  const modes=Array.from($('modal-root').querySelectorAll('input[type=checkbox]:checked')).map(e=>e.value);
  const d={name,modes,contact_name:$('car-poc')?.value?.trim()||null,phone:$('car-ph')?.value?.trim()||null,email:$('car-em')?.value?.trim().toLowerCase()||null,notes:$('car-notes')?.value?.trim()||null,updated_at:new Date().toISOString()};
  try{
    if(id){const{error}=await db.from('carriers').update(d).eq('id',id);if(error)throw error;}
    else{const{error}=await db.from('carriers').insert({...d,id:uid(),created_at:new Date().toISOString()});if(error)throw error;}
    closeModal();renderCarriers();
  }catch(e){alert('Error: '+e.message);}
}

async function delCarrier(id,name){
  if(!confirm(`Delete "${name}" from your carrier network?`))return;
  await db.from('carriers').delete().eq('id',id);
  closeModal();renderCarriers();
}

async function showCarrierDetail(id){
  const{data:c}=await db.from('carriers').select('*').eq('id',id).single();if(!c)return;
  const[drayR,fqR]=await Promise.all([
    db.from('quotes').select('quoteNum,date,customer,port,zip,status,carrierRates,customerRates').eq('carrier',c.name).order('date',{ascending:false}).limit(25),
    db.from('fq_quotes').select('date,customer,fqMode,pickupZip,deliveryZip,carrierRate,customerRate,profit,status').eq('carrier',c.name).order('date',{ascending:false}).limit(25),
  ]);
  const drayQ=drayR.data||[],fqQ=fqR.data||[];
  const totalQuotes=drayQ.length+fqQ.length;

  function statusPill(s){const colors={Quoted:'#fef9c3|#854d0e',Booked:'#dcfce7|#166534',Lost:'#fee2e2|#991b1b',Expired:'#f3f4f6|#6b7280'};const[bg,fg]=(colors[s]||'#f3f4f6|#6b7280').split('|');return `<span style="background:${bg};color:${fg};padding:2px 8px;border-radius:99px;font-size:11px;font-weight:700">${s||'—'}</span>`;}

  const drayRows=drayQ.map(q=>`<tr>
    <td style="font-size:12px;color:var(--gray-500);padding:9px 12px">${q.date||'—'}</td>
    <td style="font-weight:600;font-size:13px;padding:9px 12px">${q.customer||'—'}</td>
    <td style="padding:9px 12px"><span style="background:#dbeafe;color:#1e40af;padding:2px 7px;border-radius:99px;font-size:10px;font-weight:700">Drayage</span></td>
    <td style="font-size:12px;color:var(--gray-500);padding:9px 12px">${q.port||'—'} → ${q.zip||'—'}</td>
    <td style="font-weight:700;font-family:monospace;font-size:13px;color:#166534;padding:9px 12px">$${((q.customerRates?.total||0)).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}</td>
    <td style="padding:9px 12px">${statusPill(q.status)}</td>
  </tr>`).join('');

  const fqRows=fqQ.map(q=>`<tr>
    <td style="font-size:12px;color:var(--gray-500);padding:9px 12px">${q.date||'—'}</td>
    <td style="font-weight:600;font-size:13px;padding:9px 12px">${q.customer||'—'}</td>
    <td style="padding:9px 12px"><span style="background:#dcfce7;color:#166534;padding:2px 7px;border-radius:99px;font-size:10px;font-weight:700">${q.fqMode||'Freight'}</span></td>
    <td style="font-size:12px;color:var(--gray-500);padding:9px 12px">${q.pickupZip||'—'} → ${q.deliveryZip||'—'}</td>
    <td style="font-weight:700;font-family:monospace;font-size:13px;color:#166534;padding:9px 12px">$${(q.customerRate||0).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}</td>
    <td style="padding:9px 12px">${statusPill(q.status)}</td>
  </tr>`).join('');

  $('modal-root').innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()">
    <div class="modal" style="max-width:700px;max-height:88vh;overflow-y:auto">
      <div class="modal-title" style="display:flex;align-items:center;justify-content:space-between">
        <span>${c.name}</span>
        <button style="background:none;border:none;font-size:22px;cursor:pointer;color:var(--gray-400)" onclick="closeModal()">×</button>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:18px">
        <div style="background:var(--gray-50);border-radius:var(--radius);padding:16px">
          <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--gray-400);margin-bottom:10px">Contact info</div>
          ${c.contact_name?`<div style="font-weight:600;font-size:14px;margin-bottom:6px">${c.contact_name}</div>`:''} 
          ${c.phone?`<div style="font-size:13px;color:var(--gray-600);margin-bottom:4px">📞 ${c.phone}</div>`:''} 
          ${c.email?`<div style="font-size:13px;color:var(--gray-600)">✉️ ${c.email}</div>`:''} 
          ${!c.contact_name&&!c.phone&&!c.email?`<div style="font-size:12px;color:var(--gray-400);font-style:italic">No contact info yet</div>`:''}
        </div>
        <div style="background:var(--gray-50);border-radius:var(--radius);padding:16px">
          <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--gray-400);margin-bottom:10px">Modes · ${totalQuotes} quotes total</div>
          <div>${(c.modes||[]).map(m=>`<span style="display:inline-flex;padding:3px 9px;border-radius:99px;font-size:11px;font-weight:700;background:#dbeafe;color:#1e40af;margin-right:4px;margin-bottom:4px">${m}</span>`).join('')||'<span style="color:var(--gray-400);font-size:12px">No modes set</span>'}</div>
          ${c.notes?`<div style="font-size:12px;color:var(--gray-500);margin-top:8px">${c.notes}</div>`:''}
        </div>
      </div>
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
        <div style="font-size:13px;font-weight:700;color:var(--navy)">Quote history</div>
        <button class="btn btn-sm" onclick="closeModal();showCarrierModal('${c.id}')">✏️ Edit carrier</button>
      </div>
      ${totalQuotes===0?`<div style="text-align:center;padding:30px;color:var(--gray-400);font-size:13px;background:var(--gray-50);border-radius:var(--radius)">No quotes found for this carrier yet</div>`:`
      <div class="tbl-wrap">
        <table style="width:100%;border-collapse:collapse">
          <thead><tr style="background:var(--gray-50);border-bottom:1px solid var(--gray-200)">
            <th style="padding:9px 12px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--gray-500)">Date</th>
            <th style="padding:9px 12px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--gray-500)">Customer</th>
            <th style="padding:9px 12px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--gray-500)">Mode</th>
            <th style="padding:9px 12px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--gray-500)">Lane</th>
            <th style="padding:9px 12px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--gray-500)">Customer rate</th>
            <th style="padding:9px 12px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--gray-500)">Status</th>
          </tr></thead>
          <tbody style="background:#fff">${drayRows+fqRows}</tbody>
        </table>
      </div>`}
      <div class="modal-foot"><button class="btn" onclick="closeModal()">Close</button></div>
    </div></div>`;
}



// ── Send Quote to Carrier via Email via Resend ───────────────────────────

// Get drayage quote PDF as base64 string (for email attachment)
async function getQuotePDFBase64(q){
  if(!await loadJsPDF()) throw new Error('jsPDF not loaded');
  const{jsPDF}=window.jspdf;
  // Temporarily patch doc.save so _generatePDF doesn't trigger download
  const origSave = jsPDF.prototype.save;
  let pdfBase64 = null;
  jsPDF.prototype.save = function(){ pdfBase64 = this.output('datauristring').split(',')[1]; };
  try{ _generatePDF(q); } finally { jsPDF.prototype.save = origSave; }
  return pdfBase64;
}

async function sendQuoteToCarrier(quoteId){
  if(!requireCan('email_carrier','Only Admins can send emails to carriers.')) return;
  const q = S.quotes.find(x => x.id === quoteId);
  if(!q){ alert('Quote not found.'); return; }

  // Get Resend API key from settings
  const resendKey = localStorage.getItem('shifl_resend_key')||'';

  // Try to find carrier email from carrier network
  let carrierEmail = '';
  let carrierContact = '';
  try{
    const{data:carr} = await db.from('carriers').select('email,contact_name').eq('name', q.carrier).limit(1);
    if(carr && carr[0]){ carrierEmail = carr[0].email||''; carrierContact = carr[0].contact_name||''; }
  }catch(e){}

  const userEmail = _currentUser?.email||'';
  const userName  = _currentUser?.name||'Shifl Team';

  $('modal-root').innerHTML = `<div class="overlay" onclick="if(event.target===this)closeModal()">
    <div class="modal" style="max-width:500px">
      <div class="modal-title">📧 Email quote to carrier</div>
      ${!resendKey?`<div style="background:#fffbeb;border:1px solid #fbbf24;border-radius:var(--radius);padding:12px 14px;margin-bottom:14px;font-size:13px;color:#92400e">
        ⚠️ <strong>Resend API key not set.</strong> Go to Admin Panel → Settings → Resend API key to enable email sending.
      </div>`:''}
      <div class="field">
        <label>To — Carrier email *</label>
        <input type="email" id="send-to-em" value="${carrierEmail}" placeholder="dispatch@carrier.com">
        ${carrierEmail?'<div style="font-size:11px;color:var(--green);margin-top:3px">✓ Found in carrier network</div>':'<div style="font-size:11px;color:var(--gray-400);margin-top:3px">Not saved in carrier network — enter manually and it will be saved</div>'}
      </div>
      <div class="field">
        <label>CC — Your email</label>
        <input type="email" id="send-cc-em" value="${userEmail}" placeholder="you@shifl.com">
      </div>
      <div style="background:var(--gray-50);border-radius:var(--radius);padding:12px 14px;margin-bottom:4px;font-size:13px">
        <div style="font-weight:700;color:var(--navy);margin-bottom:3px">Quote #${q.quoteNum} — ${q.carrier}</div>
        <div style="color:var(--gray-500)">${q.port||'—'} → ${q.zip||'—'} · ${q.ld} · $${(q.customerRates?.total||0).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}</div>
        <div style="color:var(--gray-500);margin-top:2px;font-size:12px">📎 Customer rate sheet PDF will be attached</div>
      </div>
      <div class="modal-foot">
        <button class="btn" onclick="closeModal()">Cancel</button>
        <button class="btn blue" id="send-email-btn" onclick="doSendCarrierEmail('${quoteId}')">📧 Send email</button>
      </div>
    </div></div>`;
}

async function doSendCarrierEmail(quoteId){
  const toEmail = ($('send-to-em')||{}).value?.trim();
  const ccEmail = ($('send-cc-em')||{}).value?.trim();
  if(!toEmail){ alert('Enter the carrier email address.'); return; }

  const resendKey = localStorage.getItem('shifl_resend_key')||'';
  if(!resendKey){ alert('Resend API key not set. Go to Admin Panel → Settings to add it.'); return; }

  const btn = $('send-email-btn');
  if(btn){ btn.textContent='Sending...'; btn.disabled=true; }

  const q = S.quotes.find(x => x.id === quoteId);
  if(!q){ alert('Quote not found.'); return; }

  const userName = _currentUser?.name||'Shifl Team';
  const ct = q.carrierRates?.total||0;

  // Build itemized charges HTML
  const LABEL_MAP={base:'Base Rate',det_port:'Port Detention',det_cust:'Customer Detention',
    chassis:'Chassis','chassis_split':'Chassis Split',prepull:'Pre-Pull',bobtail:'Bobtail',
    ovw:'Overweight',yard:'Yard Storage',plny:'PLNY Toll',exam:'Exam/ISF',flexi:'Flexitank',oog:'OOG Fee',genset:'Genset',triaxle:'Triaxle'};
  const chargesHtml = Object.entries(q.carrierRates||{})
    .filter(([k,v])=>k!=='total'&&Number(v)>0)
    .map(([k,v])=>`<tr><td style="padding:5px 12px;color:#374151">${LABEL_MAP[k]||k}</td><td style="padding:5px 12px;text-align:right;font-weight:700;color:#1a2e4a">$${Number(v).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}</td></tr>`)
    .join('');

  const htmlBody = `<!DOCTYPE html><html><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#1a2e4a">
    <div style="background:#1a2e4a;border-radius:10px;padding:18px 24px;margin-bottom:24px;display:flex;align-items:center;justify-content:space-between">
      <div style="color:#fff;font-size:22px;font-weight:900;letter-spacing:.5px">SHIFL</div>
      <div style="color:rgba(255,255,255,.6);font-size:12px">Quote #${q.quoteNum} · ${q.date}</div>
    </div>
    <p style="font-size:15px;margin-bottom:18px">Hi${q.carrier?' '+q.carrier+',':','}</p>
    <p style="margin-bottom:18px">Please see the rate confirmation below. The customer quote PDF is attached for your records.</p>
    <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
      <tr style="background:#f8fafc"><td style="padding:8px 12px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#6b7280">Customer</td><td style="padding:8px 12px;font-weight:600">${q.customer||'—'}</td></tr>
      <tr><td style="padding:8px 12px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#6b7280">Origin</td><td style="padding:8px 12px">${q.port||'—'}</td></tr>
      <tr style="background:#f8fafc"><td style="padding:8px 12px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#6b7280">Destination</td><td style="padding:8px 12px">${q.zip||'—'}${q.destination?' — '+q.destination:''}</td></tr>
      <tr><td style="padding:8px 12px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#6b7280">Load type</td><td style="padding:8px 12px">${q.ld||'—'}</td></tr>
      ${q.shiflRef?`<tr style="background:#f8fafc"><td style="padding:8px 12px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#6b7280">Shifl Ref #</td><td style="padding:8px 12px;font-weight:700;color:#1d4ed8">${q.shiflRef}</td></tr>`:''}
    </table>
    <div style="background:#f8fafc;border-radius:8px;padding:16px;margin-bottom:24px">
      <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#6b7280;margin-bottom:10px">Carrier Rate Breakdown</div>
      <table style="width:100%;border-collapse:collapse">${chargesHtml}
        <tr style="border-top:2px solid #e5e7eb"><td style="padding:8px 12px;font-weight:700">Total</td><td style="padding:8px 12px;text-align:right;font-size:17px;font-weight:800;color:#1a2e4a">$${ct.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}</td></tr>
      </table>
    </div>
    <p style="margin-bottom:24px">Please reply to confirm acceptance of this rate.</p>
    <p style="color:#6b7280;font-size:13px">Thank you,<br><strong>${userName}</strong><br>Shifl Logistics<br>trucking@shifl.com</p>
    <div style="border-top:1px solid #e5e7eb;margin-top:28px;padding-top:14px;font-size:11px;color:#9ca3af">This email was sent from the Shifl Quoting Platform. The customer rate sheet PDF is attached.</div>
  </body></html>`;

  try{
    // Generate PDF as base64
    let pdfB64 = null;
    try{ pdfB64 = await getQuotePDFBase64(q); }catch(e){ console.warn('PDF gen failed:',e.message); }

    const payload = {
      from: 'Shifl Logistics <onboarding@resend.dev>',
      to: [toEmail],
      cc: ccEmail ? [ccEmail] : [],
      reply_to: _currentUser?.email||'mk@shifl.com',
      subject: 'Rate Confirmation — ' + (q.customer||'') + ' | ' + (q.port||'') + ' → ' + (q.zip||'') + ' | Quote #' + q.quoteNum,
      html: htmlBody,
    };
    if(pdfB64){
      payload.attachments = [{
        filename: 'Shifl_Quote_' + q.quoteNum + '_' + q.zip + '_' + q.date + '.pdf',
        content: pdfB64,
      }];
    }

    const resp = await fetch('https://api.resend.com/emails',{
      method:'POST',
      headers:{'Authorization':'Bearer '+resendKey,'Content-Type':'application/json'},
      body:JSON.stringify(payload),
    });
    const result = await resp.json();
    console.log('Resend response:', resp.status, JSON.stringify(result));
    if(!resp.ok) throw new Error(`${resp.status}: ${JSON.stringify(result)}`);

    // Save carrier email back to network
    if(toEmail && q.carrier){
      db.from('carriers').select('id').eq('name',q.carrier).limit(1).then(({data})=>{
        if(data&&data[0]) db.from('carriers').update({email:toEmail,updated_at:new Date().toISOString()}).eq('id',data[0].id).then(()=>{});
      });
    }

    closeModal();
    alert('✅ Email sent to '+toEmail+(pdfB64?' with PDF attached':'')+'!');
  }catch(e){
    if(btn){ btn.textContent='📧 Send email'; btn.disabled=false; }
    alert("Send failed: " + e.message + "\n\nCheck your Resend API key and confirm trucking@shifl.com is verified in Resend.");
  }
}




async function testResendKey(){
  const k=localStorage.getItem('shifl_resend_key')||'';
  if(!k){alert('Save a Resend API key first.');return;}

  // Show modal to enter test destination
  $('modal-root').innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()"><div class="modal" style="max-width:500px">
    <div class="modal-title">🔬 Test Email Connection</div>
    <p style="font-size:13px;color:var(--gray-500);margin-bottom:16px">Enter the email address to send the test to. Use the email address you signed up to Resend with for best results.</p>
    <div class="field"><label>Send test to *</label>
      <input type="email" id="test-email-to" value="${_currentUser?.email||''}" placeholder="your@email.com">
    </div>
    <div style="background:var(--gray-50);border-radius:var(--radius);padding:10px 12px;font-size:12px;color:var(--gray-500);margin-bottom:14px">
      API key: <code style="font-family:monospace">${k.slice(0,8)}••••••••</code>
    </div>
    <div class="modal-foot">
      <button class="btn" onclick="closeModal()">Cancel</button>
      <button class="btn blue" id="test-send-btn" onclick="doTestEmail()">📧 Send test</button>
    </div>
  </div></div>`;
}

async function doTestEmail(){
  const k=localStorage.getItem('shifl_resend_key')||'';
  const toEmail=($('test-email-to')||{}).value?.trim();
  if(!toEmail){alert('Enter an email address.');return;}
  const btn=$('test-send-btn');
  if(btn){btn.textContent='Sending...';btn.disabled=true;}
  try{
    const r=await fetch('https://api.resend.com/emails',{
      method:'POST',
      headers:{'Authorization':'Bearer '+k,'Content-Type':'application/json'},
      body:JSON.stringify({
        from:'Shifl Logistics <onboarding@resend.dev>',
        to:[toEmail],
        subject:'✅ Shifl Email Test — '+new Date().toLocaleTimeString(),
        html:'<div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:24px"><div style="background:#1a2e4a;border-radius:10px;padding:16px 20px;margin-bottom:20px"><div style="color:#fff;font-size:20px;font-weight:900">SHIFL</div></div><h2 style="color:#1a2e4a">Email connection is working! ✅</h2><p style="color:#6b7280">Your Resend API key is configured correctly. The Shifl Quoting Portal can now send rate confirmation emails to carriers.</p><hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0"><p style="font-size:12px;color:#9ca3af">Sent from Shifl Quoting Portal</p></div>'
      })
    });
    const result=await r.json();
    console.log('Resend test:',r.status,JSON.stringify(result));
    if(r.ok){
      closeModal();
      alert('✅ Test email sent to '+toEmail+'!\n\nCheck your inbox — if it arrives, everything is working and you can email quotes to carriers.');
    } else {
      const msg=result.message||result.error||JSON.stringify(result);
      if(btn){btn.textContent='📧 Send test';btn.disabled=false;}
      alert('❌ Failed ('+r.status+'): '+msg+'\n\n'+
        (r.status===403?'Your API key may not have permission to send emails. Check it in Resend dashboard → API Keys.':
         r.status===422?'The email address or from address may be invalid.':
         r.status===429?'Rate limit hit — try again in a minute.':
         'Check your Resend dashboard for more details.'));
    }
  }catch(e){
    if(btn){btn.textContent='📧 Send test';btn.disabled=false;}
    alert('❌ Network error: '+e.message+'\n\nThis may be a browser CORS issue. Try refreshing and testing again.');
  }
}
function saveResendKey(){
  const k = ($('resend-key-input')||{}).value?.trim();
  if(!k){ alert('Enter a Resend API key.'); return; }
  localStorage.setItem('shifl_resend_key', k);
  renderAdmin();
  alert('✅ Resend API key saved!');
}

// ═══════════════════════════════════════════════════════
// ROLE PERMISSIONS
// ═══════════════════════════════════════════════════════
const PERMS = {
  super_admin: null, // null = all permissions
  admin: new Set([
    'create_quotes','book_quotes','assign_ref','download_pdf','delete_quotes','update_status','email_carrier',
    'view_rates','add_rates','edit_rates','delete_rates','import_rates',
    'view_carriers','add_carriers','edit_carriers','delete_carriers',
    'view_active','mark_delivered','set_urgent','update_tracking',
    'view_customers','edit_customers','delete_customers',
    'view_admin','edit_users','reset_passwords',
    'view_dashboard','view_activity','export_csv'
  ]),
  team_member: new Set([
    'create_quotes','book_quotes','assign_ref','download_pdf',
    'view_rates','add_rates','import_rates',
    'view_carriers','add_carriers','edit_carriers','delete_carriers',
    'view_active','mark_delivered','set_urgent','update_tracking',
    'view_customers','edit_customers'
  ]),
  user: new Set([ // legacy role = team_member
    'create_quotes','book_quotes','assign_ref','download_pdf',
    'view_rates','add_rates','import_rates',
    'view_carriers','add_carriers','edit_carriers','delete_carriers',
    'view_active','mark_delivered','set_urgent','update_tracking',
    'view_customers','edit_customers'
  ])
};

function can(perm){
  if(!_currentUser) return false;
  const r=_currentUser.role;
  if(r==='super_admin') return true;
  return PERMS[r]?.has(perm)||false;
}

function requireCan(perm,msg='You do not have permission to do that.'){
  if(!can(perm)){alert(msg);return false;}
  return true;
}


// ═══════════════════════════════════════════════════════
// AUDIT LOG + MARGIN GUARDRAILS
// ═══════════════════════════════════════════════════════

// ── Audit Log ─────────────────────────────────────────
const ACTION_LABELS={
  login:'🔑 Logged in',logout:'🚪 Logged out',
  quote_created:'📝 Quote created',quote_deleted:'🗑️ Quote deleted',quote_booked:'✅ Quote booked',
  status_changed:'🔄 Status changed',
  rate_added:'➕ Rate added',rate_edited:'✏️ Rate edited',rate_deleted:'🗑️ Rate deleted',
  carrier_added:'🤝 Carrier added',carrier_edited:'✏️ Carrier edited',carrier_deleted:'🗑️ Carrier deleted',
  user_added:'👤 User added',user_edited:'✏️ User edited',user_deleted:'🗑️ User deleted',
  email_sent:'📧 Email sent to carrier',
  invoice_sent:'🧾 Invoice sent',
  payment_received:'💰 Payment received',
  margin_override:'⚠️ Low margin override',
};

async function logAction(action, details='', entityType='', entityId=''){
  const _lu = _currentUser || JSON.parse(localStorage.getItem('shifl_session')||'null');
  if(!db||!_lu) return;
  try{
    await db.from('audit_log').insert({
      id:uid(), user_id:_lu.id, user_name:_lu.name,
      action, details, entity_type:entityType, entity_id:entityId,
      created_at:new Date().toISOString()
    });
  }catch(e){ console.log('Audit log:',e.message); } // silent fail
}

async function renderAuditLog(){
  if(!can('view_admin')){$('page').innerHTML='<div style="padding:40px;text-align:center;color:var(--gray-400)">Admin access required</div>';return;}
  $('page').innerHTML='<div class="loading-page"><div class="spin" style="margin:0 auto 12px"></div><div style="color:var(--gray-400);font-size:13px">Loading audit log...</div></div>';
  try{
    // Fetch audit log AND all users simultaneously
    const [{data:logs},{data:allUsers}]=await Promise.all([
      db.from('audit_log').select('*').order('created_at',{ascending:false}).limit(1000),
      db.from('app_users').select('id,name,email,role,active,last_login').order('name')
    ]);
    const all=logs||[];
    const users=allUsers||[];

    // Stats
    const today=localDateStr();
    const todayCount=all.filter(l=>l.created_at?.startsWith(today)).length;
    const week=new Date(Date.now()-7*864e5).toISOString();
    const weekCount=all.filter(l=>l.created_at>=week).length;
    const activeUserIds=[...new Set(all.map(l=>l.user_id).filter(Boolean))];

    // Filters
    const filterUser=S._auditUser||'all';
    const filterAction=S._auditAction||'all';
    const filterDate=S._auditDate||'all';

    let shown=all.filter(l=>{
      if(filterUser!=='all'&&l.user_id!==filterUser&&l.user_name!==filterUser) return false;
      if(filterAction!=='all'&&l.action!==filterAction) return false;
      if(filterDate==='today'&&!l.created_at?.startsWith(today)) return false;
      if(filterDate==='week'&&l.created_at<week) return false;
      if(filterDate==='month'&&l.created_at<new Date(Date.now()-30*864e5).toISOString()) return false;
      return true;
    });

    // ── KPI row ───────────────────────────────────────────────────────────
    let h=`<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:18px">
      <div class="kpi"><div class="kpi-lbl">Total entries</div><div class="kpi-val">${all.length.toLocaleString()}</div></div>
      <div class="kpi"><div class="kpi-lbl">Today</div><div class="kpi-val" style="color:var(--steel)">${todayCount}</div></div>
      <div class="kpi"><div class="kpi-lbl">Last 7 days</div><div class="kpi-val">${weekCount}</div></div>
      <div class="kpi"><div class="kpi-lbl">Active users</div><div class="kpi-val" style="color:var(--green)">${activeUserIds.length} / ${users.length}</div></div>
    </div>`;

    // ── User activity cards ────────────────────────────────────────────────
    h+=`<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:8px;margin-bottom:18px">`;
    users.forEach(u=>{
      const uLogs=all.filter(l=>l.user_id===u.id||l.user_name===u.name);
      const lastLog=uLogs[0];
      const lastLogin=all.filter(l=>(l.user_id===u.id||l.user_name===u.name)&&l.action==='login')[0];
      const ROLE_LABELS={super_admin:'Super Admin',admin:'Admin',team_member:'Team Member',user:'Team Member'};
      const hasActivity=uLogs.length>0;
      const isFiltered=filterUser!=='all'&&(filterUser===u.id||filterUser===u.name);
      h+=`<div onclick="S._auditUser=S._auditUser===u.id?'all':'${u.id}';renderAuditLog()"
        style="background:${isFiltered?'var(--blue-bg)':'#fff'};border:1.5px solid ${isFiltered?'var(--steel)':'var(--gray-200)'};border-radius:10px;padding:12px;cursor:pointer;transition:border-color .15s"
        onmouseover="this.style.borderColor='var(--steel)'" onmouseout="this.style.borderColor='${isFiltered?'var(--steel)':'var(--gray-200)'}'"
      >
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
          <div style="width:28px;height:28px;border-radius:50%;background:${u.active?'var(--steel)':'var(--gray-300)'};color:#fff;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0">${u.name.slice(0,2).toUpperCase()}</div>
          <div style="min-width:0">
            <div style="font-size:12px;font-weight:700;color:var(--navy);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${u.name}</div>
            <div style="font-size:10px;color:var(--gray-400)">${ROLE_LABELS[u.role]||u.role}${u.active?'':' · Inactive'}</div>
          </div>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:10px">
          <span style="color:${hasActivity?'var(--steel)':'var(--gray-300)'};font-weight:600">${uLogs.length} actions</span>
          <span style="color:var(--gray-400)">${lastLogin?new Date(lastLogin.created_at).toLocaleDateString('en-US',{month:'short',day:'numeric'}):'Never logged in'}</span>
        </div>
      </div>`;
    });
    h+=`</div>`;

    // ── Filter bar ─────────────────────────────────────────────────────────
    const userOpts=users.map(u=>`<option value="${u.id}"${filterUser===u.id?' selected':''}>${u.name}${all.filter(l=>l.user_id===u.id||l.user_name===u.name).length===0?' (no activity)':''}</option>`).join('');
    const actionGroups={
      'Logins':['login','logout'],
      'Quotes':['quote_created','quote_deleted','quote_booked','status_changed'],
      'Rates':['rate_added','rate_edited','rate_deleted'],
      'Carriers':['carrier_added','carrier_edited','carrier_deleted'],
      'Users':['user_added','user_edited','user_deleted'],
      'Finance':['invoice_sent','payment_received','margin_override'],
      'Email':['email_sent'],
    };
    const allActions=[...new Set(all.map(l=>l.action))];
    let actionOpts='';
    Object.entries(actionGroups).forEach(([grp,acts])=>{
      const matching=acts.filter(a=>allActions.includes(a));
      if(matching.length){
        actionOpts+=`<optgroup label="${grp}">`;
        matching.forEach(a=>actionOpts+=`<option value="${a}"${filterAction===a?' selected':''}>${ACTION_LABELS[a]||a}</option>`);
        actionOpts+=`</optgroup>`;
      }
    });

    h+=`<div style="display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap;align-items:center">
      <select onchange="S._auditUser=this.value;renderAuditLog()" style="padding:7px 10px;border:1px solid var(--gray-200);border-radius:var(--radius);font-size:13px;font-family:inherit;min-width:160px">
        <option value="all">All users</option>${userOpts}
      </select>
      <select onchange="S._auditAction=this.value;renderAuditLog()" style="padding:7px 10px;border:1px solid var(--gray-200);border-radius:var(--radius);font-size:13px;font-family:inherit">
        <option value="all">All actions</option>${actionOpts}
      </select>
      <select onchange="S._auditDate=this.value;renderAuditLog()" style="padding:7px 10px;border:1px solid var(--gray-200);border-radius:var(--radius);font-size:13px;font-family:inherit">
        <option value="all"${filterDate==='all'?' selected':''}>All time</option>
        <option value="today"${filterDate==='today'?' selected':''}>Today</option>
        <option value="week"${filterDate==='week'?' selected':''}>Last 7 days</option>
        <option value="month"${filterDate==='month'?' selected':''}>Last 30 days</option>
      </select>
      ${filterUser!=='all'||filterAction!=='all'||filterDate!=='all'?`<button class="btn sm" onclick="S._auditUser='all';S._auditAction='all';S._auditDate='all';renderAuditLog()">✕ Clear filters</button>`:''}
      <span style="font-size:12px;color:var(--gray-400)">${shown.length.toLocaleString()} entries</span>
      <button class="btn sm" onclick="exportAuditLog()" style="margin-left:auto">📥 Export CSV</button>
    </div>`;

    // ── Table ──────────────────────────────────────────────────────────────
    const ACTION_COLORS={
      login:'#dbeafe',logout:'#f3f4f6',
      quote_created:'#dcfce7',quote_deleted:'#fee2e2',quote_booked:'#d1fae5',status_changed:'#fef3c7',
      rate_added:'#e0f2fe',rate_edited:'#e0e7ff',rate_deleted:'#fee2e2',
      carrier_added:'#f0fdf4',carrier_edited:'#e0e7ff',carrier_deleted:'#fee2e2',
      user_added:'#fef9c3',user_edited:'#e0e7ff',user_deleted:'#fee2e2',
      invoice_sent:'#fef3c7',payment_received:'#dcfce7',margin_override:'#fef3c7',
      email_sent:'#e0e7ff',
    };
    const ACTION_TEXT={
      login:'#1e40af',logout:'#6b7280',
      quote_created:'#166534',quote_deleted:'#b91c1c',quote_booked:'#065f46',status_changed:'#92400e',
      rate_added:'#0c4a6e',rate_edited:'#3730a3',rate_deleted:'#b91c1c',
      carrier_added:'#14532d',carrier_edited:'#3730a3',carrier_deleted:'#b91c1c',
      user_added:'#713f12',user_edited:'#3730a3',user_deleted:'#b91c1c',
      invoice_sent:'#92400e',payment_received:'#166534',margin_override:'#92400e',
      email_sent:'#3730a3',
    };

    if(!shown.length){
      h+='<div class="empty"><div class="empty-ico">🔍</div><div style="font-size:15px;font-weight:700;color:var(--gray-500)">No entries match filters</div></div>';
    } else {
      h+=`<div class="tbl-wrap"><table><thead><tr>
        <th style="width:130px">Date &amp; Time</th>
        <th style="width:130px">User</th>
        <th style="width:160px">Action</th>
        <th>Details</th>
        <th style="width:90px">Type</th>
      </tr></thead><tbody>`;

      h+=shown.slice(0,300).map(l=>{
        const dt=new Date(l.created_at);
        const dateStr=dt.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
        const timeStr=dt.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit',second:'2-digit'});
        const bg=ACTION_COLORS[l.action]||'#f1f5f9';
        const col=ACTION_TEXT[l.action]||'var(--gray-600)';
        const user=users.find(u=>u.id===l.user_id);
        const ROLE_LABELS={super_admin:'SA',admin:'Admin',team_member:'TM',user:'TM'};
        const roleLabel=user?ROLE_LABELS[user.role]||'':'' ;
        return `<tr>
          <td style="white-space:nowrap">
            <div style="font-size:11px;font-weight:600;color:var(--gray-600)">${dateStr}</div>
            <div style="font-size:10px;color:var(--gray-400)">${timeStr}</div>
          </td>
          <td>
            <div style="font-size:12px;font-weight:700;color:var(--navy)">${l.user_name||'System'}</div>
            ${roleLabel?`<div style="font-size:10px;color:var(--gray-400)">${roleLabel}</div>`:''}
          </td>
          <td>
            <span style="display:inline-block;font-size:11px;background:${bg};color:${col};padding:3px 9px;border-radius:5px;font-weight:700;white-space:nowrap">
              ${ACTION_LABELS[l.action]||l.action}
            </span>
          </td>
          <td style="font-size:12px;color:var(--gray-600);max-width:320px">${l.details||'—'}</td>
          <td style="font-size:10px;color:var(--gray-400);white-space:nowrap">${l.entity_type?`<span style="background:var(--gray-100);padding:2px 6px;border-radius:4px">${l.entity_type}</span>`:''}</td>
        </tr>`;
      }).join('');
      h+='</tbody></table></div>';
      if(shown.length>300) h+=`<div style="text-align:center;padding:12px;font-size:12px;color:var(--gray-400)">Showing 300 of ${shown.length} entries — export CSV for full data</div>`;
    }
    $('page').innerHTML=h;
  }catch(e){
    $('page').innerHTML=`<div style="padding:20px;color:var(--red)">Error loading audit log: ${e.message}</div>
    <div style="padding:0 20px;font-size:13px;color:var(--gray-500);margin-top:8px">Make sure you've run the audit_log setup SQL in Supabase.</div>`;
  }
}

function exportAuditLog(){
  db.from('audit_log').select('*').order('created_at',{ascending:false}).then(({data})=>{
    if(!data?.length){alert('No audit log data.');return;}
    const rows=[['Time','User','Action','Details','Entity Type','Entity ID'],...data.map(l=>[l.created_at,l.user_name,l.action,l.details,l.entity_type,l.entity_id])];
    const csv=rows.map(r=>r.map(c=>`"${(c||'').toString().replace(/"/g,'""')}"`).join(',')).join('\n');
    const a=document.createElement('a');a.href='data:text/csv;charset=utf-8,'+encodeURIComponent(csv);a.download='shifl_audit_log_'+localDateStr()+'.csv';a.click();
  });
}

// ── Margin Guardrails ──────────────────────────────────
function getMinMargin(){ return parseFloat(localStorage.getItem('shifl_min_margin'))||0; }
function setMinMargin(v){ localStorage.setItem('shifl_min_margin',String(parseFloat(v)||0)); }

function checkMargin(customerRate, carrierRate, quoteName){
  const min=getMinMargin();
  if(!min||!customerRate) return true;
  const margin=customerRate>0?((customerRate-carrierRate)/customerRate)*100:0;
  if(margin>=min) return true;
  const role=_currentUser?.role;
  const msg=`⚠️ Low Margin Warning\n\nThis quote has a ${margin.toFixed(1)}% margin, which is below the minimum of ${min}%.\n\n${role==='team_member'||role==='user'?'You do not have permission to save below-minimum quotes. Ask an Admin to approve.':'As an Admin you can override — continue anyway?'}`;
  if(role==='team_member'||role==='user'){
    alert(msg);
    return false;
  }
  if(confirm(msg)){
    logAction('margin_override',`${quoteName} — ${margin.toFixed(1)}% margin (min: ${min}%)`);
    return true;
  }
  return false;
}



function baseSplit(q){
  const cb=q.carrierRates?.base||0,cu=q.customerRates?.base||0;
  const ctTot=q.carrierRates?.total||0,cuTot=q.customerRates?.total||0;
  const baseP=cu-cb,baseM=cu>0?baseP/cu:0;
  const accC=ctTot-cb,accCu=cuTot-cu,accP=accCu-accC;
  return{baseP,baseM,accC,accCu,accP};
}
// ═══════════════════════════════════════════════════════
// REPORTS MODULE — 8 report types
// ═══════════════════════════════════════════════════════

function allQ(){
  const dray=(S.quotes||[]).map(q=>({
    type:'Drayage',date:q.date||'',customer:q.customer||'—',carrier:q.carrier||'—',
    lane:`${q.port||'—'} → ${q.zip||'—'}`,
    customerRate:q.customerRates?.total||0,carrierRate:q.carrierRates?.total||0,
    baseCustomer:q.customerRates?.base||0,baseCarrier:q.carrierRates?.base||0,
    accCustomer:(q.customerRates?.total||0)-(q.customerRates?.base||0),
    accCarrier:(q.carrierRates?.total||0)-(q.carrierRates?.base||0),
    accBreakdown:q.carrierRates||{},
    profit:q.profit||0,profitPct:q.profitPct||0,status:q.status||'',
    quoteNum:q.quoteNum||'',createdAt:q.created_at||q.date||''
  }));
  const fq=(window._fqHistory||[]).map(q=>({
    type:q.fqMode||'Freight',date:q.date||'',customer:q.customer||'—',carrier:q.carrier||'—',
    lane:`${q.pickupZip||'—'} → ${q.deliveryZip||'—'}`,
    customerRate:q.customerRate||0,carrierRate:q.carrierRate||0,
    baseCustomer:q.customerRate||0,baseCarrier:q.carrierRate||0,
    accCustomer:0,accCarrier:0,accBreakdown:{},
    profit:q.profit||0,profitPct:q.profitPct||0,status:q.status||'',
    quoteNum:'',createdAt:q.date||''
  }));
  const tl=(window._tlHistory||[]).map(q=>({
    type:'Transload',date:q.date||'',customer:q.customer||'—',carrier:q.outCarrier||'—',
    lane:`${q.drayPort||'—'} → ${q.outDeliveryZip||'—'}`,
    customerRate:q.totalCustomer||0,carrierRate:q.totalCarrier||0,
    baseCustomer:q.totalCustomer||0,baseCarrier:q.totalCarrier||0,
    accCustomer:0,accCarrier:0,accBreakdown:{},
    profit:q.profit||0,profitPct:q.profitPct||0,status:q.status||'',
    quoteNum:'',createdAt:q.date||''
  }));
  return[...dray,...fq,...tl].sort((a,b)=>(b.date||'').localeCompare(a.date||''));
}

function daysSince(dateStr){
  if(!dateStr)return null;
  try{const d=new Date(dateStr+'T12:00:00');return Math.floor((Date.now()-d)/864e5);}catch(e){return null;}
}

function group(arr,key){
  const m={};arr.forEach(r=>{const k=typeof key==='function'?key(r):r[key];if(!m[k])m[k]=[];m[k].push(r);});return m;
}

function svgLineChart(data,color='#2e75b6'){
  if(!data.length)return '';
  const w=420,h=80,pad=28,maxV=Math.max(...data.map(d=>d.v),0.001);
  const pts=data.map((d,i)=>{const x=pad+i*(w-pad)/(data.length-1||1);const y=h-pad-(d.v/maxV)*(h-pad-4);return`${x},${y}`;}).join(' ');
  const labels=data.map((d,i)=>{const x=pad+i*(w-pad)/(data.length-1||1);return`<text x="${x}" y="${h-2}" text-anchor="middle" font-size="8" fill="#9ca3af">${d.label}</text>`;}).join('');
  const dots=data.map((d,i)=>{const x=pad+i*(w-pad)/(data.length-1||1);const y=h-pad-(d.v/maxV)*(h-pad-4);return`<circle cx="${x}" cy="${y}" r="3" fill="${color}"><title>${d.label}: ${d.pct?d.v.toFixed(1)+'%':fmtD(d.v)}</title></circle>`;}).join('');
  return`<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    <polyline points="${pts}" fill="none" stroke="${color}" stroke-width="2" stroke-linejoin="round"/>
    ${dots}${labels}
    <line x1="${pad}" y1="0" x2="${pad}" y2="${h-pad}" stroke="#e5e7eb" stroke-width="1"/>
    <line x1="${pad}" y1="${h-pad}" x2="${w}" y2="${h-pad}" stroke="#e5e7eb" stroke-width="1"/>
  </svg>`;
}

function renderReports(){
  if(!can('view_dashboard')){$('page').innerHTML='<div style="padding:40px;text-align:center;color:var(--gray-400)">Admin access required</div>';return;}
  const tab=S.reportTab||'lanes';
  const tabs=[
    {id:'lanes',label:'🛣️ Lanes'},
    {id:'customers',label:'🏢 Customers'},
    {id:'carriers',label:'🚛 Carriers'},
    {id:'winloss',label:'📊 Win / Loss'},
    {id:'margin',label:'📈 Margin Trend'},
    {id:'pipeline',label:'⏳ Pipeline'},
    {id:'accessorials',label:'➕ Accessorials'},
    {id:'pl',label:'📥 P&L Export'},
  ];
  const modeFilter=S.reportMode||'All';
  const modeFilters=['All','Drayage','FTL','LTL','LCL','Transload'];
  const tabBar=`<div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:10px;background:var(--gray-100);padding:4px;border-radius:var(--radius);width:fit-content">
    ${tabs.map(t=>`<button onclick="S.reportTab='${t.id}';renderReports()" style="padding:6px 12px;border-radius:5px;border:none;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;background:${tab===t.id?'#fff':'none'};color:${tab===t.id?'var(--navy)':'var(--gray-500)'};box-shadow:${tab===t.id?'0 1px 3px rgba(0,0,0,.08)':'none'}">${t.label}</button>`).join('')}
  </div>
  <div style="display:flex;gap:5px;margin-bottom:18px;align-items:center">
    <span style="font-size:11px;font-weight:700;color:var(--gray-400);text-transform:uppercase;letter-spacing:.05em;margin-right:4px">Mode:</span>
    ${modeFilters.map(m=>`<button onclick="S.reportMode='${m}';renderReports()" style="padding:4px 10px;border-radius:var(--radius);border:1px solid ${modeFilter===m?'var(--navy)':'var(--gray-200)'};background:${modeFilter===m?'var(--navy)':'#fff'};color:${modeFilter===m?'#fff':'var(--gray-500)'};font-size:11px;font-weight:600;cursor:pointer;font-family:inherit">${m}</button>`).join('')}
  </div>`;
  const allQs=allQ();
  const qs=modeFilter==='All'?allQs:allQs.filter(q=>q.type===modeFilter);
  if(!qs.length){$('page').innerHTML=tabBar+'<div class="empty"><div class="empty-ico">📈</div><div style="font-size:16px;font-weight:700;color:var(--gray-500)">No quote data yet</div><div style="font-size:13px;color:var(--gray-400);margin-top:6px">Save some quotes to see reports</div></div>';return;}
  let content='';

  if(tab==='lanes'){
    const grp=group(qs.filter(q=>q.status==='Booked'),'lane');
    const rows=Object.entries(grp).sort((a,b)=>b[1].length-a[1].length).map(([lane,arr])=>{
      const rev=arr.reduce((s,q)=>s+q.customerRate,0);
      const baseProf=arr.reduce((s,q)=>s+(q.baseCustomer-q.baseCarrier),0);
      const baseRev=arr.reduce((s,q)=>s+q.baseCustomer,0);
      const margin=baseRev>0?baseProf/baseRev:0;
      const avgRate=rev/arr.length;
      const types=[...new Set(arr.map(q=>q.type))].join(', ');
      return`<tr><td class="bold">${lane}</td><td style="font-size:11px;color:var(--gray-400)">${types}</td><td class="muted" style="text-align:center">${arr.length}</td><td class="money" style="color:var(--steel)">${fmtD(avgRate)}</td><td class="money" style="color:var(--green)">${fmtD(baseProf)}</td><td><span class="badge ${margin>=0.15?'g':margin>=0.08?'a':'r'}">${pct(margin)}</span></td><td class="money" style="color:var(--steel)">${fmtD(rev)}</td></tr>`;
    }).join('');
    content=`<div style="font-size:13px;color:var(--gray-400);margin-bottom:12px">${modeFilter==='All'?'All modes':'Mode: '+modeFilter} · ${qs.filter(q=>q.status==='Booked').length} booked · ${Object.keys(grp).length} lanes</div>
    <div class="tbl-wrap"><table><thead><tr><th>Lane</th><th>Type</th><th style="text-align:center">Loads</th><th>Avg Cust. Rate</th><th>Base Profit</th><th>Base Margin</th><th>Total Revenue</th></tr></thead><tbody>${rows||'<tr><td colspan="6" style="text-align:center;padding:30px;color:var(--gray-400)">No booked drayage quotes yet</td></tr>'}</tbody></table></div>`;
  }

  else if(tab==='customers'){
    const grp=group(qs,'customer');
    const rows=Object.entries(grp).sort((a,b)=>b[1].reduce((s,q)=>s+q.customerRate,0)-a[1].reduce((s,q)=>s+q.customerRate,0)).map(([cust,arr])=>{
      const booked=arr.filter(q=>q.status==='Booked');
      const wonA=arr.filter(q=>['Booked','Delivered','Invoiced','Paid'].includes(q.status));
      const winRate=arr.length>0?wonA.length/arr.length:null;
      const rev=booked.reduce((s,q)=>s+q.customerRate,0);
      const baseProf=booked.reduce((s,q)=>s+(q.baseCustomer-q.baseCarrier),0);
      const baseRev=booked.reduce((s,q)=>s+q.baseCustomer,0);
      const margin=baseRev>0?baseProf/baseRev:0;
      return`<tr><td class="bold">${cust}</td><td class="muted" style="text-align:center">${arr.length}</td><td class="muted" style="text-align:center">${booked.length}</td><td>${winRate!==null?`<span class="badge ${winRate>=0.5?'g':'a'}">${pct(winRate)}</span>`:'—'}</td><td class="money" style="color:var(--steel)">${rev>0?fmtD(rev):'—'}</td><td class="money" style="color:var(--green)">${baseProf>0?'+'+fmtD(baseProf):'—'}</td><td><span class="badge ${margin>=0.15?'g':margin>=0.08?'a':'r'}">${baseRev>0?pct(margin):'—'}</span></td></tr>`;
    }).join('');
    content=`<div style="font-size:13px;color:var(--gray-400);margin-bottom:12px">${Object.keys(grp).length} customers · all quote types</div>
    <div class="tbl-wrap"><table><thead><tr><th>Customer</th><th style="text-align:center">Quotes</th><th style="text-align:center">Booked</th><th>Win Rate</th><th>Booked Revenue</th><th>Base Profit</th><th>Base Margin</th></tr></thead><tbody>${rows}</tbody></table></div>`;
  }

  else if(tab==='carriers'){
    const grp=group(qs.filter(q=>q.carrier&&q.carrier!=='—'),'carrier');
    const rows=Object.entries(grp).sort((a,b)=>b[1].length-a[1].length).map(([carrier,arr])=>{
      const booked=arr.filter(q=>q.status==='Booked');
      const wonA=arr.filter(q=>['Booked','Delivered','Invoiced','Paid'].includes(q.status));
      const winRate=arr.length>0?wonA.length/arr.length:null;
      const totalCarrierCost=booked.reduce((s,q)=>s+q.carrierRate,0);
      const totalCustRev=booked.reduce((s,q)=>s+q.customerRate,0);
      const baseProf=booked.reduce((s,q)=>s+(q.baseCustomer-q.baseCarrier),0);
      const baseRev=booked.reduce((s,q)=>s+q.baseCustomer,0);
      const margin=baseRev>0?baseProf/baseRev:0;
      return`<tr><td class="bold">${carrier}</td><td class="muted" style="text-align:center">${arr.length}</td><td class="muted" style="text-align:center">${booked.length}</td><td>${winRate!==null?`<span class="badge ${winRate>=0.5?'g':'a'}">${pct(winRate)}</span>`:'—'}</td><td class="money am">${totalCarrierCost>0?fmtD(totalCarrierCost):'—'}</td><td class="money" style="color:var(--steel)">${totalCustRev>0?fmtD(totalCustRev):'—'}</td><td><span class="badge ${margin>=0.15?'g':margin>=0.08?'a':'r'}">${baseRev>0?pct(margin):'—'}</span></td></tr>`;
    }).join('');
    content=`<div style="font-size:13px;color:var(--gray-400);margin-bottom:12px">${Object.keys(grp).length} carriers · all quote types</div>
    <div class="tbl-wrap"><table><thead><tr><th>Carrier</th><th style="text-align:center">Quoted</th><th style="text-align:center">Booked</th><th>Book Rate</th><th>Total Cost Paid</th><th>Revenue Generated</th><th>Base Margin</th></tr></thead><tbody>${rows}</tbody></table></div>`;
  }

  else if(tab==='winloss'){
    const lost=qs.filter(q=>['Lost','Cancelled','Expired'].includes(q.status));
    const booked=qs.filter(q=>q.status==='Booked');
    const total=qs.length;
    const kpis=`<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:18px">
      <div class="kpi"><div class="kpi-lbl">Total Quotes</div><div class="kpi-val">${total}</div></div>
      <div class="kpi"><div class="kpi-lbl">Booked</div><div class="kpi-val b">${booked.length}</div><div style="font-size:11px;color:var(--green);margin-top:4px">${pct(total>0?booked.length/total:0)}</div></div>
      <div class="kpi"><div class="kpi-lbl">Lost / Expired</div><div class="kpi-val r">${lost.length}</div><div style="font-size:11px;color:var(--red);margin-top:4px">${pct(total>0?lost.length/total:0)}</div></div>
      <div class="kpi"><div class="kpi-lbl">Still Open</div><div class="kpi-val a">${qs.filter(q=>q.status==='Quoted').length}</div></div>
    </div>`;
    // Lost by carrier
    const byCarrier=group(lost.filter(q=>q.carrier&&q.carrier!=='—'),'carrier');
    const carrierRows=Object.entries(byCarrier).sort((a,b)=>b[1].length-a[1].length).slice(0,8).map(([c,arr])=>`<tr><td class="bold">${c}</td><td class="muted" style="text-align:center">${arr.length}</td><td class="money">${fmtD(arr.reduce((s,q)=>s+q.customerRate,0)/arr.length)}</td></tr>`).join('');
    // Lost by customer
    const byCustomer=group(lost,'customer');
    const custRows=Object.entries(byCustomer).sort((a,b)=>b[1].length-a[1].length).slice(0,8).map(([c,arr])=>`<tr><td class="bold">${c}</td><td class="muted" style="text-align:center">${arr.length}</td></tr>`).join('');
    content=kpis+`<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
      <div><div class="sec-head" style="margin-bottom:10px">Lost by carrier</div><div class="tbl-wrap"><table><thead><tr><th>Carrier</th><th style="text-align:center">Lost quotes</th><th>Avg rate quoted</th></tr></thead><tbody>${carrierRows||'<tr><td colspan="3" style="text-align:center;padding:20px;color:var(--gray-400)">No data</td></tr>'}</tbody></table></div></div>
      <div><div class="sec-head" style="margin-bottom:10px">Lost by customer</div><div class="tbl-wrap"><table><thead><tr><th>Customer</th><th style="text-align:center">Lost quotes</th></tr></thead><tbody>${custRows||'<tr><td colspan="2" style="text-align:center;padding:20px;color:var(--gray-400)">No data</td></tr>'}</tbody></table></div></div>
    </div>`;
  }

  else if(tab==='margin'){
    const booked=qs.filter(q=>q.status==='Booked'&&q.date);
    const now=new Date();
    const months=Array.from({length:12},(_,i)=>{
      const d=new Date(now.getFullYear(),now.getMonth()-11+i,1);
      const next=new Date(now.getFullYear(),now.getMonth()-11+i+1,1);
      const inM=booked.filter(q=>{try{const qd=new Date(q.date+'T12:00:00');return qd>=d&&qd<next;}catch(e){return false;}});
      const baseRev=inM.reduce((s,q)=>s+q.baseCustomer,0);
      const baseProf=inM.reduce((s,q)=>s+(q.baseCustomer-q.baseCarrier),0);
      const totRev=inM.reduce((s,q)=>s+q.customerRate,0);
      const totProf=inM.reduce((s,q)=>s+q.profit,0);
      const margin=baseRev>0?baseProf/baseRev*100:0;
      const totMargin=totRev>0?totProf/totRev*100:0;
      return{label:d.toLocaleString('default',{month:'short'}),v:parseFloat(margin.toFixed(1)),totV:parseFloat(totMargin.toFixed(1)),baseRev,baseProf,totRev,totProf,cnt:inM.length};
    });
    const rows=months.map(m=>`<tr><td class="bold">${m.label}</td><td class="muted" style="text-align:center">${m.cnt}</td><td class="money" style="color:var(--steel)">${m.baseRev>0?fmtD(m.baseRev):'—'}</td><td class="money" style="color:var(--green)">${m.baseProf>0?'+'+fmtD(m.baseProf):'—'}</td><td><span class="badge ${m.v>=15?'g':m.v>=8?'a':'r'}">${m.baseRev>0?m.v.toFixed(1)+'%':'—'}</span></td><td class="money" style="color:var(--steel)">${m.totRev>0?fmtD(m.totRev):'—'}</td><td class="money" style="color:var(--green)">${m.totProf>0?'+'+fmtD(m.totProf):'—'}</td></tr>`).join('');
    const chartData=months.map(m=>({...m,pct:true}));
    content=`<div style="margin-bottom:18px;padding:16px;background:#fff;border:1px solid var(--gray-200);border-radius:var(--radius)">
      <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--gray-500);margin-bottom:10px">Base margin % — last 12 months</div>
      ${svgLineChart(chartData,'#2d7d46')}
    </div>
    <div class="tbl-wrap"><table><thead><tr><th>Month</th><th style="text-align:center">Loads</th><th>Base Revenue</th><th>Base Profit</th><th>Base Margin %</th><th>Total Revenue</th><th>Total Profit</th></tr></thead><tbody>${rows}</tbody></table></div>`;
  }

  else if(tab==='pipeline'){
    const open=qs.filter(q=>q.status==='Quoted').sort((a,b)=>(a.date||'').localeCompare(b.date||''));
    const aged7=open.filter(q=>(daysSince(q.date)||0)>=7);
    const aged14=open.filter(q=>(daysSince(q.date)||0)>=14);
    const kpis=`<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:18px">
      <div class="kpi"><div class="kpi-lbl">Open quotes</div><div class="kpi-val">${open.length}</div></div>
      <div class="kpi"><div class="kpi-lbl">7+ days old</div><div class="kpi-val a">${aged7.length}</div><div style="font-size:11px;color:var(--amber);margin-top:4px">need follow-up</div></div>
      <div class="kpi"><div class="kpi-lbl">14+ days old</div><div class="kpi-val r">${aged14.length}</div><div style="font-size:11px;color:var(--red);margin-top:4px">stale pipeline</div></div>
    </div>`;
    if(!open.length){content=kpis+'<div class="empty"><div class="empty-ico">✅</div><div style="font-size:15px;font-weight:700;color:var(--gray-500)">No open quotes</div></div>';return $('page').innerHTML=tabBar+content;}
    const rows=open.map(q=>{const days=daysSince(q.date)||0;const urg=days>=14?'rd':days>=7?'am':'';return`<tr style="${urg==='rd'?'background:#fff5f5':urg==='am'?'background:#fffbeb':''}"><td class="bold">${q.type}</td><td class="bold">${q.customer}</td><td class="muted">${q.lane}</td><td class="muted">${q.carrier}</td><td class="money" style="color:var(--steel)">${fmtD(q.customerRate)}</td><td class="${urg}" style="font-weight:700;text-align:center">${days}d ago</td><td style="font-size:11px;color:var(--gray-400)">${q.quoteNum||'—'}</td></tr>`;}).join('');
    content=kpis+`<div class="tbl-wrap"><table><thead><tr><th>Type</th><th>Customer</th><th>Lane</th><th>Carrier</th><th>Rate</th><th style="text-align:center">Age</th><th>Ref</th></tr></thead><tbody>${rows}</tbody></table></div>`;
  }

  else if(tab==='accessorials'){
    const drayBooked=(modeFilter==='All'||modeFilter==='Drayage')?(S.quotes||[]).filter(q=>q.status==='Booked'):[];
    if(!drayBooked.length){content='<div class="empty"><div class="empty-ico">➕</div><div style="font-size:15px;font-weight:700;color:var(--gray-500)">No booked drayage quotes — accessorial breakdown is drayage only</div></div>';return $('page').innerHTML=tabBar+content;}
    const ACC_KEYS=CHARGES.filter(c=>c!=='base');
    const totals=ACC_KEYS.map(c=>({
      name:LABELS[c]||c,
      carrierCost:drayBooked.reduce((s,q)=>s+(q.carrierRates?.[c]||0),0),
      custRev:drayBooked.reduce((s,q)=>s+(q.customerRates?.[c]||0),0),
      cnt:drayBooked.filter(q=>(q.carrierRates?.[c]||0)>0).length
    })).filter(r=>r.custRev>0||r.carrierCost>0).sort((a,b)=>b.custRev-a.custRev);
    const maxRev=Math.max(...totals.map(t=>t.custRev),1);
    const bars=totals.map(t=>`<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
      <div style="width:120px;font-size:12px;font-weight:600;color:var(--navy);text-align:right;flex-shrink:0">${t.name}</div>
      <div style="flex:1;height:22px;background:var(--gray-100);border-radius:3px;overflow:hidden">
        <div style="width:${(t.custRev/maxRev*100).toFixed(1)}%;height:100%;background:#2e75b6;display:flex;align-items:center;padding-left:8px">
          ${t.custRev>maxRev*0.2?`<span style="font-size:10px;color:#fff;font-weight:700">${fmtD(t.custRev)}</span>`:''}
        </div>
      </div>
      <div style="width:80px;font-size:12px;text-align:right;color:var(--gray-500);flex-shrink:0">${fmtD(t.custRev)}</div>
    </div>`).join('');
    const rows=totals.map(t=>`<tr><td class="bold">${t.name}</td><td class="muted" style="text-align:center">${t.cnt}</td><td class="money am">${fmtD(t.carrierCost)}</td><td class="money" style="color:var(--steel)">${fmtD(t.custRev)}</td><td class="money" style="color:var(--green)">${fmtD(t.custRev-t.carrierCost)}</td><td><span class="badge ${(t.custRev-t.carrierCost)/t.custRev>=0.15?'g':(t.custRev-t.carrierCost)/t.custRev>=0.05?'a':'r'}">${t.custRev>0?pct((t.custRev-t.carrierCost)/t.custRev):'—'}</span></td></tr>`).join('');
    content=`<div style="display:grid;grid-template-columns:1fr 1fr;gap:18px">
      <div><div class="sec-head" style="margin-bottom:14px">Customer revenue by type</div>${bars}</div>
      <div><div class="sec-head" style="margin-bottom:10px">Detailed breakdown</div><div class="tbl-wrap"><table><thead><tr><th>Accessorial</th><th style="text-align:center">Loads</th><th>Carrier Cost</th><th>Customer Rev.</th><th>Profit</th><th>Margin</th></tr></thead><tbody>${rows}</tbody></table></div></div>
    </div>`;
  }

  else if(tab==='pl'){
    const booked=qs.filter(q=>q.status==='Booked'&&q.date);
    const byMonth={};booked.forEach(q=>{const m=(q.date||'').slice(0,7);if(!m)return;if(!byMonth[m])byMonth[m]={baseRev:0,baseProf:0,accRev:0,accProf:0,totRev:0,totCarrier:0,totProf:0,cnt:0};byMonth[m].baseRev+=q.baseCustomer;byMonth[m].baseProf+=(q.baseCustomer-q.baseCarrier);byMonth[m].accRev+=q.accCustomer;byMonth[m].accProf+=(q.accCustomer-q.accCarrier);byMonth[m].totRev+=q.customerRate;byMonth[m].totCarrier+=q.carrierRate;byMonth[m].totProf+=q.profit;byMonth[m].cnt++;});
    const months=Object.keys(byMonth).sort().reverse();
    const rows=months.map(m=>{const d=byMonth[m];return`<tr><td class="bold">${m}</td><td class="muted" style="text-align:center">${d.cnt}</td><td class="money" style="color:var(--steel)">${fmtD(d.baseRev)}</td><td class="money" style="color:var(--green)">${fmtD(d.baseProf)}</td><td><span class="badge ${d.baseRev>0&&d.baseProf/d.baseRev>=0.15?'g':d.baseRev>0&&d.baseProf/d.baseRev>=0.08?'a':'r'}">${d.baseRev>0?pct(d.baseProf/d.baseRev):'—'}</span></td><td class="money" style="color:var(--steel)">${fmtD(d.accRev)}</td><td class="money" style="color:var(--green)">${fmtD(d.accProf)}</td><td class="money am">${fmtD(d.totCarrier)}</td><td class="money" style="color:var(--steel)">${fmtD(d.totRev)}</td><td class="money" style="color:var(--green);font-weight:700">+${fmtD(d.totProf)}</td></tr>`;}).join('');
    content=`<div style="margin-bottom:14px"><button class="btn blue" onclick="exportPL()">📥 Export P&L CSV</button></div>
    <div class="tbl-wrap"><table><thead>
      <tr style="background:var(--gray-50)">
        <th rowspan="2">Month</th><th rowspan="2" style="text-align:center">Loads</th>
        <th colspan="3" style="text-align:center;border-bottom:1px solid var(--gray-200);color:var(--green)">Base</th>
        <th colspan="2" style="text-align:center;border-bottom:1px solid var(--gray-200);color:var(--steel)">Accessorials</th>
        <th colspan="3" style="text-align:center;border-bottom:1px solid var(--gray-200)">Total</th>
      </tr>
      <tr style="background:var(--gray-50)">
        <th>Revenue</th><th>Profit</th><th>Margin</th>
        <th>Revenue</th><th>Profit</th>
        <th>Carrier Cost</th><th>Revenue</th><th>Profit</th>
      </tr>
    </thead><tbody>${rows||'<tr><td colspan="10" style="text-align:center;padding:30px;color:var(--gray-400)">No booked quotes yet</td></tr>'}</tbody></table></div>`;
  }

  $('page').innerHTML=tabBar+content;
}

function exportPL(){
  const qs2=allQ();
  const booked=qs2.filter(q=>q.status==='Booked'&&q.date);
  const byMonth={};booked.forEach(q=>{const m=(q.date||'').slice(0,7);if(!m)return;if(!byMonth[m])byMonth[m]={baseRev:0,baseProf:0,accRev:0,accProf:0,totRev:0,totCarrier:0,totProf:0,cnt:0};byMonth[m].baseRev+=q.baseCustomer;byMonth[m].baseProf+=(q.baseCustomer-q.baseCarrier);byMonth[m].accRev+=q.accCustomer;byMonth[m].accProf+=(q.accCustomer-q.accCarrier);byMonth[m].totRev+=q.customerRate;byMonth[m].totCarrier+=q.carrierRate;byMonth[m].totProf+=q.profit;byMonth[m].cnt++;});
  const hdrs=['Month','Loads','Base Revenue','Base Profit','Base Margin %','Accessorial Revenue','Accessorial Profit','Total Carrier Cost','Total Revenue','Total Profit'];
  const rows=Object.keys(byMonth).sort().reverse().map(m=>{const d=byMonth[m];return[m,d.cnt,d.baseRev.toFixed(2),d.baseProf.toFixed(2),d.baseRev>0?(d.baseProf/d.baseRev*100).toFixed(1)+'%':'0%',d.accRev.toFixed(2),d.accProf.toFixed(2),d.totCarrier.toFixed(2),d.totRev.toFixed(2),d.totProf.toFixed(2)];});
  const csv=[hdrs,...rows].map(r=>r.join(',')).join('\n');
  const a=document.createElement('a');a.href='data:text/csv;charset=utf-8,'+encodeURIComponent(csv);a.download='shifl_pl_'+localDateStr()+'.csv';a.click();
}


// ═══════════════════════════════════════════════════════
// FREIGHT INVOICING MODULE
// ═══════════════════════════════════════════════════════

function renderFqInvoicing(){
  updateFqInvBadge();
  const subtab=S.fqInvTab||'pending';
  const all=window._fqHistory||[];
  const pending=all.filter(q=>q.status==='Delivered');
  const invoiced=all.filter(q=>q.status==='Invoiced');
  const paid=all.filter(q=>q.status==='Paid');

  $('topbar-right').innerHTML='';

  const tabBar=`<div style="display:flex;gap:4px;background:var(--gray-100);padding:3px;border-radius:var(--radius);width:fit-content;margin-bottom:18px">
    ${[
      {id:'pending',label:`⏳ Pending Invoice (${pending.length})`},
      {id:'invoiced',label:`📤 Invoiced (${invoiced.length})`},
      {id:'paid',label:`✅ Paid (${paid.length})`}
    ].map(t=>`<button onclick="S.fqInvTab='${t.id}';renderFqInvoicing()" style="padding:6px 14px;border-radius:5px;border:none;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;background:${subtab===t.id?'#fff':'none'};color:${subtab===t.id?'var(--navy)':'var(--gray-500)'};box-shadow:${subtab===t.id?'0 1px 3px rgba(0,0,0,.08)':'none'}">${t.label}</button>`).join('')}
  </div>`;

  if(subtab==='pending'){
    if(!pending.length){
      $('page').innerHTML=tabBar+`<div class="empty"><div class="empty-ico">✅</div><div style="font-size:16px;font-weight:700;color:var(--gray-500)">No pending invoices</div><div style="font-size:13px;color:var(--gray-400);margin-top:6px">Mark a freight shipment as Delivered to start the invoicing process</div></div>`;
      return;
    }
    const rows=pending.map((q,i)=>{
      const idx=all.indexOf(q);
      const days=q.deliveredDate?Math.floor((Date.now()-new Date(q.deliveredDate+'T12:00:00'))/864e5):null;
      const urg=days!==null&&days>=3;
      return`<tr style="${urg?'background:#fffbeb':''}">
        <td><div class="bold">${q.customer||'—'}</div><div class="muted">${q.fqMode||'Freight'} · ${q.pickupZip||'—'} → ${q.deliveryZip||'—'}</div></td>
        <td class="muted">${q.carrier||'—'}</td>
        <td class="money" style="color:var(--steel)">${fmtD(q.customerRate||0)}</td>
        <td class="muted">${q.bookedDate||q.date||'—'}</td>
        <td style="color:${urg?'var(--amber)':'var(--gray-500)'};font-weight:${urg?'700':'400'}">${days!==null?days+'d ago':'—'}</td>
        <td style="white-space:nowrap">
          <button class="btn sm blue" onclick="fqSendInvoice(${idx})">🧾 Send Invoice</button>
        </td>
      </tr>`;
    }).join('');
    const carrRows=filtLoads.map(l=>{
      const meta=getTMSMeta(l.id);
      const cinv=getCarrierInvoice(l.id);
      const waitDays=l.date?Math.floor((Date.now()-new Date(l.date).getTime())/864e5):0;
      return '<tr>'+
        '<td><div style="font-size:13px;font-weight:700;color:var(--navy)">'+escH(l.customer||'—')+'</div>'+
        '<div style="font-size:11px;color:var(--gray-400)">'+(l.pickupZip||'—')+' → '+(l.deliveryZip||'—')+'</div></td>'+
        '<td style="font-weight:600">'+escH(l.carrier||'—')+'</td>'+
        '<td class="money" style="color:#d97706;font-weight:700">'+fmtD(cinv?cinv.grandTotal:(l.carrierRate||0))+'</td>'+
        '<td class="muted">'+escH(l.date||'—')+'</td>'+
        '<td><span style="color:'+(waitDays>30?'var(--red)':waitDays>14?'var(--amber)':'var(--green)')+';font-weight:700">'+waitDays+' days</span></td>'+
        '<td onclick="event.stopPropagation()">'+
          '<button data-lid="'+l.id+'" onclick="openFqCarrierInvById(this.dataset.lid)" style="font-size:11px;padding:4px 10px;border:1px solid '+(cinv?'#fbbf24':'var(--gray-200)')+';border-radius:4px;background:'+(cinv?'#fffbeb':'transparent')+';cursor:pointer;font-family:inherit;color:'+(cinv?'#d97706':'var(--gray-600)')+'">'+
          '🚛 '+(cinv?'Edit':'Enter')+'</button>'+
        '</td></tr>';
    }).join('');
    $('page').innerHTML=tabBar+'<div class="tbl-wrap"><table><thead><tr>'+
      '<th>Customer / Lane</th><th>Carrier</th><th>Invoice Amount</th><th>Date</th><th>Waiting</th><th></th>'+
      '</tr></thead><tbody>'+carrRows+'</tbody></table></div>';
  }

  else if(subtab==='invoiced'){
    if(!invoiced.length){
      $('page').innerHTML=tabBar+`<div class="empty"><div class="empty-ico">📤</div><div style="font-size:16px;font-weight:700;color:var(--gray-500)">No invoices sent yet</div></div>`;
      return;
    }
    const totalOut=invoiced.reduce((s,q)=>s+(q.customerRate||0),0);
    const overdue=invoiced.filter(q=>q.invoiceDueDate&&new Date(q.invoiceDueDate+'T12:00:00')<new Date());
    const kpis=`<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:16px">
      <div class="kpi"><div class="kpi-lbl">Outstanding</div><div class="kpi-val" style="color:var(--steel)">${fmtD(totalOut)}</div></div>
      <div class="kpi"><div class="kpi-lbl">Invoices sent</div><div class="kpi-val">${invoiced.length}</div></div>
      <div class="kpi"><div class="kpi-lbl">Overdue</div><div class="kpi-val" style="color:var(--red)">${overdue.length}</div>${overdue.length?`<div style="font-size:11px;color:var(--red);margin-top:4px">${fmtD(overdue.reduce((s,q)=>s+(q.customerRate||0),0))}</div>`:''}</div>
    </div>`;
    const rows=invoiced.map((q,i)=>{
      const idx=all.indexOf(q);
      const dueDate=q.invoiceDueDate;
      const daysOut=dueDate?Math.floor((Date.now()-new Date(dueDate+'T12:00:00'))/864e5):null;
      const isOverdue=daysOut!==null&&daysOut>0;
      const daysSent=q.invoiceDate?Math.floor((Date.now()-new Date(q.invoiceDate+'T12:00:00'))/864e5):null;
      return`<tr style="${isOverdue?'background:#fff5f5':''}">
        <td><div class="bold">${q.customer||'—'}</div><div class="muted">${q.fqMode||'Freight'} · ${q.pickupZip||'—'} → ${q.deliveryZip||'—'}</div></td>
        <td><div class="bold" style="font-family:monospace;font-size:13px">${q.invoiceNum||'—'}</div><div class="muted">${q.invoiceDate||'—'}</div></td>
        <td class="money" style="color:var(--steel)">${fmtD(q.customerRate||0)}</td>
        <td style="color:${isOverdue?'var(--red)':'var(--gray-500)'};font-weight:${isOverdue?'700':'400'}">
          ${dueDate?(isOverdue?`⚠ ${daysOut}d overdue`:daysOut===0?'Due today':`${Math.abs(daysOut)}d left`):'No due date'}
        </td>
        <td class="muted">${daysSent!==null?daysSent+'d ago':'—'}</td>
        <td style="white-space:nowrap">
          <button class="btn sm" onclick="fqMarkPaid(${idx})" style="color:var(--green);border-color:#86efac">✅ Mark Paid</button>
        </td>
      </tr>`;
    }).sort((a,b)=>a.localeCompare?0:0).join('');
    $('page').innerHTML=tabBar+kpis+`<div class="tbl-wrap"><table><thead><tr>
      <th>Customer / Lane</th><th>Invoice #</th><th>Amount</th><th>Due Date</th><th>Days Since Sent</th><th></th>
    </tr></thead><tbody>${rows}</tbody></table></div>`;
  }

  else if(subtab==='paid'){
    if(!paid.length){
      $('page').innerHTML=tabBar+`<div class="empty"><div class="empty-ico">💰</div><div style="font-size:16px;font-weight:700;color:var(--gray-500)">No payments recorded yet</div></div>`;
      return;
    }
    const totalCollected=paid.reduce((s,q)=>s+(q.customerRate||0),0);
    const avgDays=paid.filter(q=>q.invoiceDate&&q.paidDate).reduce((s,q)=>s+Math.floor((new Date(q.paidDate+'T12:00:00')-new Date(q.invoiceDate+'T12:00:00'))/864e5),0)/(paid.filter(q=>q.invoiceDate&&q.paidDate).length||1);
    const kpis=`<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-bottom:16px">
      <div class="kpi"><div class="kpi-lbl">Total Collected</div><div class="kpi-val" style="color:var(--green)">${fmtD(totalCollected)}</div></div>
      <div class="kpi"><div class="kpi-lbl">Avg Days to Pay</div><div class="kpi-val">${avgDays.toFixed(0)}d</div></div>
    </div>`;
    const rows=paid.map(q=>{
      const daysToPay=q.invoiceDate&&q.paidDate?Math.floor((new Date(q.paidDate+'T12:00:00')-new Date(q.invoiceDate+'T12:00:00'))/864e5):null;
      return`<tr>
        <td><div class="bold">${q.customer||'—'}</div><div class="muted">${q.fqMode||'Freight'} · ${q.pickupZip||'—'} → ${q.deliveryZip||'—'}</div></td>
        <td style="font-family:monospace;font-size:13px;font-weight:600">${q.invoiceNum||'—'}</td>
        <td class="money" style="color:var(--green);font-weight:700">${fmtD(q.customerRate||0)}</td>
        <td class="muted">${q.invoiceDate||'—'}</td>
        <td class="muted">${q.paidDate||'—'}</td>
        <td class="muted" style="text-align:center">${daysToPay!==null?daysToPay+'d':'—'}</td>
      </tr>`;
    }).join('');
    $('page').innerHTML=tabBar+kpis+`<div class="tbl-wrap"><table><thead><tr>
      <th>Customer / Lane</th><th>Invoice #</th><th>Amount</th><th>Invoice Date</th><th>Paid Date</th><th style="text-align:center">Days to Pay</th>
    </tr></thead><tbody>${rows}</tbody></table></div>`;
  }
}

function fqSendInvoice(idx){
  const q=(window._fqHistory||[])[idx];if(!q) return;
  const suggestedInv='INV-FQ-'+Date.now().toString().slice(-5);
  $('modal-root').innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()"><div class="modal" style="max-width:460px">
    <div class="modal-title">🧾 Send Invoice — ${q.customer||'—'}</div>
    <div style="background:var(--gray-50);border-radius:var(--radius);padding:12px 14px;margin-bottom:16px">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div style="font-size:13px;color:var(--gray-600)">${q.fqMode||'Freight'} · ${q.pickupZip||'—'} → ${q.deliveryZip||'—'}</div>
        <div class="money" style="color:var(--steel);font-size:18px">${fmtD(q.customerRate||0)}</div>
      </div>
    </div>
    <div class="field"><label>Invoice number *</label><input type="text" id="inv-num" value="${suggestedInv}" placeholder="INV-FQ-12345"></div>
    <div class="g2">
      <div class="field"><label>Invoice date</label><input type="date" id="inv-date" value="${localDateStr()}"></div>
      <div class="field"><label>Due date</label><input type="date" id="inv-due" value="${new Date(Date.now()+30*864e5).toISOString().slice(0,10)}"></div>
    </div>
    <div class="field"><label>Notes</label><input type="text" id="inv-notes" placeholder="e.g. Net 30, factoring, etc."></div>
    <div class="modal-foot">
      <button class="btn" onclick="closeModal()">Cancel</button>
      <button class="btn blue" onclick="fqConfirmInvoice(${idx})">✅ Mark as Invoiced</button>
    </div>
  </div></div>`;
}

async function fqConfirmInvoice(idx){
  const q=(window._fqHistory||[])[idx];if(!q) return;
  const num=($('inv-num')||{}).value?.trim();
  if(!num){alert('Invoice number required.');return;}
  q.invoiceNum=num;
  q.invoiceDate=($('inv-date')||{}).value||localDateStr();
  q.invoiceDueDate=($('inv-due')||{}).value||'';
  q.invoiceNotes=($('inv-notes')||{}).value?.trim()||'';
  q.status='Invoiced';
  try{localStorage.setItem('fq_history',JSON.stringify(window._fqHistory));}catch(e){}
  try{await dbUpdateFqStatus(q.id,'Invoiced');}catch(e){}
  logAction('invoice_sent',`${q.customer||'—'} · ${fmtD(q.customerRate||0)} · ${num}`,'fq_quote',q.id);
  closeModal();
  S.fqInvTab='invoiced';
  renderFqInvoicing();
  updateFqInvBadge();
}

function fqMarkPaid(idx){
  const q=(window._fqHistory||[])[idx];if(!q) return;
  $('modal-root').innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()"><div class="modal" style="max-width:500px">
    <div class="modal-title">✅ Mark as Paid — ${q.customer||'—'}</div>
    <div style="background:var(--gray-50);border-radius:var(--radius);padding:12px 14px;margin-bottom:16px;display:flex;justify-content:space-between">
      <div><div style="font-size:11px;font-weight:700;text-transform:uppercase;color:var(--gray-400)">Invoice ${q.invoiceNum||'—'}</div><div style="font-size:13px;color:var(--gray-600)">${q.customer}</div></div>
      <div class="money" style="color:var(--steel);font-size:20px">${fmtD(q.customerRate||0)}</div>
    </div>
    <div class="field"><label>Date payment received</label><input type="date" id="paid-date" value="${localDateStr()}"></div>
    <div class="field"><label>Payment notes</label><input type="text" id="paid-notes" placeholder="e.g. ACH, check #1234, factored"></div>
    <div class="modal-foot">
      <button class="btn" onclick="closeModal()">Cancel</button>
      <button class="btn" style="background:var(--green);color:#fff;border-color:var(--green)" onclick="fqConfirmPaid(${idx})">✅ Confirm Payment</button>
    </div>
  </div></div>`;
}

async function fqConfirmPaid(idx){
  const q=(window._fqHistory||[])[idx];if(!q) return;
  q.paidDate=($('paid-date')||{}).value||localDateStr();
  q.paidNotes=($('paid-notes')||{}).value?.trim()||'';
  q.status='Paid';
  try{localStorage.setItem('fq_history',JSON.stringify(window._fqHistory));}catch(e){}
  try{await dbUpdateFqStatus(q.id,'Paid');}catch(e){}
  logAction('payment_received',`${q.customer||'—'} · ${fmtD(q.customerRate||0)} · ${q.invoiceNum||'—'}`,'fq_quote',q.id);
  closeModal();
  S.fqInvTab='paid';
  renderFqInvoicing();
  updateFqInvBadge();
}


// ═══════════════════════════════════════════════════════
// AIR FREIGHT QUOTING
// ═══════════════════════════════════════════════════════

const US_AIRPORTS=[
  {code:'JFK',name:'John F. Kennedy International',city:'New York',state:'NY',zip:'11430'},
  {code:'EWR',name:'Newark Liberty International',city:'Newark',state:'NJ',zip:'07114'},
  {code:'LAX',name:'Los Angeles International',city:'Los Angeles',state:'CA',zip:'90045'},
  {code:'ORD',name:"O'Hare International",city:'Chicago',state:'IL',zip:'60666'},
  {code:'ATL',name:'Hartsfield-Jackson Atlanta International',city:'Atlanta',state:'GA',zip:'30320'},
  {code:'DFW',name:'Dallas/Fort Worth International',city:'Dallas',state:'TX',zip:'75261'},
  {code:'MIA',name:'Miami International',city:'Miami',state:'FL',zip:'33126'},
  {code:'SFO',name:'San Francisco International',city:'San Francisco',state:'CA',zip:'94128'},
  {code:'BOS',name:'Logan International',city:'Boston',state:'MA',zip:'02128'},
  {code:'IAH',name:'George Bush Intercontinental',city:'Houston',state:'TX',zip:'77032'},
  {code:'SEA',name:'Seattle-Tacoma International',city:'Seattle',state:'WA',zip:'98188'},
  {code:'PHX',name:'Phoenix Sky Harbor International',city:'Phoenix',state:'AZ',zip:'85034'},
  {code:'DEN',name:'Denver International',city:'Denver',state:'CO',zip:'80249'},
  {code:'DTW',name:'Detroit Metropolitan Wayne County',city:'Detroit',state:'MI',zip:'48242'},
  {code:'MSP',name:'Minneapolis-Saint Paul International',city:'Minneapolis',state:'MN',zip:'55111'},
  {code:'PHL',name:'Philadelphia International',city:'Philadelphia',state:'PA',zip:'19153'},
  {code:'CLT',name:'Charlotte Douglas International',city:'Charlotte',state:'NC',zip:'28208'},
  {code:'LAS',name:'Harry Reid International (Las Vegas)',city:'Las Vegas',state:'NV',zip:'89119'},
  {code:'MCO',name:'Orlando International',city:'Orlando',state:'FL',zip:'32827'},
  {code:'SAN',name:'San Diego International',city:'San Diego',state:'CA',zip:'92101'},
  {code:'BWI',name:'Baltimore/Washington International',city:'Baltimore',state:'MD',zip:'21240'},
  {code:'IAD',name:'Washington Dulles International',city:'Dulles',state:'VA',zip:'20166'},
  {code:'DCA',name:'Ronald Reagan Washington National',city:'Arlington',state:'VA',zip:'22202'},
  {code:'MEM',name:'Memphis International',city:'Memphis',state:'TN',zip:'38118'},
  {code:'CVG',name:'Cincinnati/Northern Kentucky International',city:'Hebron',state:'KY',zip:'41018'},
  {code:'SDF',name:'Louisville Muhammad Ali International',city:'Louisville',state:'KY',zip:'40213'},
  {code:'OAK',name:'Oakland International',city:'Oakland',state:'CA',zip:'94621'},
  {code:'LGB',name:'Long Beach Airport',city:'Long Beach',state:'CA',zip:'90810'},
  {code:'ONT',name:'Ontario International',city:'Ontario',state:'CA',zip:'91761'},
  {code:'MDW',name:'Chicago Midway International',city:'Chicago',state:'IL',zip:'60638'},
  {code:'TPA',name:'Tampa International',city:'Tampa',state:'FL',zip:'33607'},
  {code:'FLL',name:'Fort Lauderdale-Hollywood International',city:'Fort Lauderdale',state:'FL',zip:'33315'},
  {code:'MSY',name:'Louis Armstrong New Orleans International',city:'New Orleans',state:'LA',zip:'70032'},
  {code:'STL',name:'St. Louis Lambert International',city:'St. Louis',state:'MO',zip:'63145'},
  {code:'CMH',name:'John Glenn Columbus International',city:'Columbus',state:'OH',zip:'43219'},
  {code:'CLE',name:'Cleveland Hopkins International',city:'Cleveland',state:'OH',zip:'44135'},
  {code:'PIT',name:'Pittsburgh International',city:'Pittsburgh',state:'PA',zip:'15231'},
  {code:'BDL',name:'Bradley International',city:'Windsor Locks',state:'CT',zip:'06096'},
  {code:'RDU',name:'Raleigh-Durham International',city:'Raleigh',state:'NC',zip:'27623'},
  {code:'TUS',name:'Tucson International',city:'Tucson',state:'AZ',zip:'85706'},
  {code:'ABQ',name:'Albuquerque International Sunport',city:'Albuquerque',state:'NM',zip:'87106'},
  {code:'SLC',name:'Salt Lake City International',city:'Salt Lake City',state:'UT',zip:'84116'},
  {code:'PDX',name:'Portland International',city:'Portland',state:'OR',zip:'97218'},
  {code:'BNA',name:'Nashville International',city:'Nashville',state:'TN',zip:'37217'},
  {code:'IND',name:'Indianapolis International',city:'Indianapolis',state:'IN',zip:'46241'},
  {code:'MKE',name:'Milwaukee Mitchell International',city:'Milwaukee',state:'WI',zip:'53207'},
  {code:'MCI',name:'Kansas City International',city:'Kansas City',state:'MO',zip:'64153'},
  {code:'AUS',name:'Austin-Bergstrom International',city:'Austin',state:'TX',zip:'78719'},
  {code:'SAT',name:'San Antonio International',city:'San Antonio',state:'TX',zip:'78216'},
  {code:'HOU',name:'William P. Hobby Airport',city:'Houston',state:'TX',zip:'77061'},
  {code:'DAL',name:'Dallas Love Field',city:'Dallas',state:'TX',zip:'75235'},
  {code:'BUR',name:'Hollywood Burbank Airport',city:'Burbank',state:'CA',zip:'91505'},
  {code:'SNA',name:'John Wayne Airport (Orange County)',city:'Santa Ana',state:'CA',zip:'92707'},
  {code:'SMF',name:'Sacramento International',city:'Sacramento',state:'CA',zip:'95837'},
  {code:'SJC',name:'Norman Y. Mineta San Jose International',city:'San Jose',state:'CA',zip:'95110'},
  {code:'HNL',name:'Daniel K. Inouye International (Honolulu)',city:'Honolulu',state:'HI',zip:'96819'},
  {code:'ANC',name:'Ted Stevens Anchorage International',city:'Anchorage',state:'AK',zip:'99502'},
];

// Default air quote state
function defaultAqState(){
  return{
    customer:'',customerEmail:'',customerId:null,
    originAirportCode:'',deliveryZip:'',
    pieces:'',weightLbs:'',cbm:'',
    awbNumber:'',airFreightCost:'',
    groundMode:'LTL',
    groundCarrierName:'',groundRate:'',groundSelId:null,
    markupMode:'flat',markupAmount:200,
    customerRate:'',
    notes:'',shiflRef:'',
    created_by:null,created_by_name:null
  };
}

if(!S.aq) S.aq=defaultAqState();
if(!window._aqHistory) window._aqHistory=[];

// Load/save air quotes
async function dbLoadAqQuotes(){
  try{
    const{data,error}=await db.from('fq_quotes').select('*')
      .order('created_at',{ascending:false});
    if(error) throw error;
    const all=(data||[]).map(r=>typeof r.data==='object'?r.data:JSON.parse(r.data||'{}'));
    return all.filter(q=>q.fqMode==='Air');
  }catch(e){
    return JSON.parse(localStorage.getItem('aq_history')||'[]');
  }
}
async function dbSaveAqQuote(q){
  const{error}=await db.from('fq_quotes').upsert({id:q.id,date:q.date,customer:q.customer||'',data:q});
  if(error) throw error;
}

function renderAirFreight(){
  const tab=S.aqTab||'builder';
  if(tab==='log') return renderAqLog();
  renderAqBuilder();
}

function setAqTab(t){
  S.aqTab=t;
  document.querySelectorAll('.nav-sub,.sub-link').forEach(b=>b.classList.remove('active'));
  const el=$('aqnav-'+t);if(el) el.classList.add('active');
  openAccFor('air');updateSubActive('air',t);
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active'));
  const nf=$('nav-air');if(nf) nf.classList.add('active');
  renderAirFreight();
}

function renderAqBuilder(){
  const aq=S.aq;
  const airport=US_AIRPORTS.find(a=>a.code===aq.originAirportCode);
  const airCost=parseFloat(aq.airFreightCost)||0;
  const groundRate=parseFloat(aq.groundRate)||0;
  const totalCost=airCost+groundRate;
  const custRate=parseFloat(aq.customerRate)||0;
  const profit=custRate-totalCost;
  const margin=custRate>0?profit/custRate:0;

  // Ground leg — find matching carrier rates
  const airZip=airport?.zip||'';
  const groundMatches=airZip&&aq.deliveryZip?
    S.fqRates.filter(r=>r.active&&
      (r.pickupZip===airZip||r.pickupZip===airZip.slice(0,3)+'00')&&
      r.deliveryZip===aq.deliveryZip&&
      (aq.groundMode==='LTL'?r.mode==='LTL'||r.equipment==='Box Truck':(r.equipment==='Box Truck'||r.mode==='FTL'))
    ):[];

  // Build carrier options for ground leg
  const carrierOptions=groundMatches.length?`
    <div style="margin-bottom:12px">
      <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--gray-500);margin-bottom:8px">Available carriers — ${airZip} → ${aq.deliveryZip}</div>
      ${groundMatches.map(r=>`
        <div onclick="S.aq.groundCarrierName='${r.carrier.replace(/'/g,"\\'")}';S.aq.groundRate='${r.rate||r.base||0}';S.aq.groundSelId='${r.id}';renderAqBuilder()"
          style="display:flex;align-items:center;justify-content:space-between;padding:10px 12px;margin-bottom:6px;border-radius:var(--radius);border:1px solid ${aq.groundSelId===r.id?'var(--steel)':'var(--gray-200)'};background:${aq.groundSelId===r.id?'var(--blue-bg)':'#fff'};cursor:pointer">
          <div><span class="bold">${r.carrier}</span> <span class="badge ${aq.groundSelId===r.id?'b':'gr'}" style="margin-left:6px">${r.mode||r.equipment||'LTL'}</span></div>
          <span class="money" style="color:var(--steel)">${fmtD(r.rate||r.base||0)}</span>
        </div>`).join('')}
    </div>`:'';

  $('topbar-right').innerHTML=`<button class="btn blue" onclick="saveAqQuote()">💾 Save quote</button>`;
  $('page').innerHTML=`<div style="display:grid;grid-template-columns:1fr 380px;gap:16px;align-items:start">
  <div>

    <!-- Customer -->
    <div class="card">
      <div class="sec-head">Customer</div>
      <div class="g2">
        <div class="field"><label>Customer name *</label>
          <input type="text" value="${aq.customer}" oninput="S.aq.customer=this.value" placeholder="Customer name"
            list="cust-list-aq">
          <datalist id="cust-list-aq">${(S.customers||[]).map(c=>`<option value="${c.company}">`).join('')}</datalist>
        </div>
        <div class="field"><label>Customer email</label>
          <input type="email" value="${aq.customerEmail}" oninput="S.aq.customerEmail=this.value" placeholder="customer@email.com"></div>
      </div>
    </div>

    <!-- Air Leg -->
    <div class="card">
      <div class="sec-head">✈️ Air leg — origin airport</div>
      <div class="g2">
        <div class="field"><label>Arrival airport *</label>
          <select onchange="S.aq.originAirportCode=this.value;S.aq.groundSelId=null;S.aq.groundCarrierName='';S.aq.groundRate='';renderAqBuilder()" style="font-size:13px">
            <option value="">Select airport...</option>
            ${US_AIRPORTS.map(a=>`<option value="${a.code}"${aq.originAirportCode===a.code?' selected':''}>
              ${a.code} — ${a.name} (${a.city}, ${a.state})
            </option>`).join('')}
          </select>
          ${airport?`<div style="font-size:11px;color:var(--gray-400);margin-top:4px">📍 Airport ZIP for ground pickup: <strong>${airport.zip}</strong></div>`:''}
        </div>
        <div class="field"><label>Air waybill (AWB#)</label>
          <input type="text" value="${aq.awbNumber}" oninput="S.aq.awbNumber=this.value" placeholder="123-12345678"></div>
      </div>
      <div class="field"><label>Air freight cost ($) * <span style="font-weight:400;color:var(--gray-400)">— what you paid the airline / forwarder</span></label>
        <input type="number" value="${aq.airFreightCost}" oninput="S.aq.airFreightCost=this.value;refreshAqPreview()"
          placeholder="0.00" step="0.01" min="0" style="max-width:220px;font-size:15px;font-weight:700">
      </div>
    </div>

    <!-- Cargo -->
    <div class="card">
      <div class="sec-head">📦 Cargo details</div>
      <div class="g3">
        <div class="field"><label>Pieces</label>
          <input type="number" value="${aq.pieces}" oninput="S.aq.pieces=this.value" placeholder="e.g. 10" min="0"></div>
        <div class="field"><label>Weight (lbs)</label>
          <input type="number" value="${aq.weightLbs}" oninput="S.aq.weightLbs=this.value" placeholder="e.g. 500" min="0"></div>
        <div class="field"><label>CBM</label>
          <input type="number" value="${aq.cbm}" oninput="S.aq.cbm=this.value" placeholder="e.g. 2.5" min="0" step="0.01"></div>
      </div>
    </div>

    <!-- Ground Leg -->
    <div class="card">
      <div class="sec-head">🚛 Ground leg — airport → delivery</div>
      <div class="g2" style="margin-bottom:12px">
        <div class="field"><label>Delivery ZIP *</label>
          <input type="text" value="${aq.deliveryZip}" oninput="S.aq.deliveryZip=this.value;S.aq.groundSelId=null;renderAqBuilder()"
            placeholder="e.g. 07728" maxlength="10"></div>
        <div class="field"><label>Ground transit method</label>
          <div class="toggle-group" style="margin-top:4px">
            <button class="tgl${aq.groundMode==='LTL'?' on':''}" onclick="S.aq.groundMode='LTL';S.aq.groundSelId=null;renderAqBuilder()">LTL</button>
            <button class="tgl${aq.groundMode==='Box Truck'?' on':''}" onclick="S.aq.groundMode='Box Truck';S.aq.groundSelId=null;renderAqBuilder()">Box Truck</button>
          </div>
        </div>
      </div>
      ${carrierOptions}
      <div class="g2">
        <div class="field"><label>Ground carrier</label>
          <input type="text" value="${aq.groundCarrierName}" oninput="S.aq.groundCarrierName=this.value"
            placeholder="${groundMatches.length?'Or type manually':'e.g. XPO, UPS Freight'}"></div>
        <div class="field"><label>Ground rate ($)</label>
          <input type="number" value="${aq.groundRate}" oninput="S.aq.groundRate=this.value;refreshAqPreview()"
            placeholder="0.00" step="0.01" min="0"></div>
      </div>
    </div>

    <!-- Notes -->
    <div class="card">
      <div class="sec-head">Notes</div>
      <textarea rows="2" oninput="S.aq.notes=this.value" placeholder="Special instructions, commodity, incoterms…"
        style="width:100%;padding:8px;font-size:13px;border:1px solid var(--gray-200);border-radius:var(--radius);resize:vertical;font-family:inherit">${aq.notes}</textarea>
    </div>

  </div>

  <!-- Right panel — pricing -->
  <div style="position:sticky;top:16px">
    <div class="card">
      <div class="sec-head">💰 Pricing</div>

      ${airport?`
      <div style="background:var(--blue-bg);border-radius:var(--radius);padding:12px 14px;margin-bottom:14px;font-size:12px;color:var(--steel)">
        <div class="bold" style="margin-bottom:4px">✈️ ${airport.code} — ${airport.city}, ${airport.state}</div>
        <div>${airport.name}</div>
        <div style="margin-top:4px;color:var(--gray-400)">Ground pickup ZIP: ${airport.zip}</div>
      </div>`:''}

      <!-- Cost breakdown -->
      <div style="border:1px solid var(--gray-200);border-radius:var(--radius);overflow:hidden;margin-bottom:14px">
        <div style="padding:10px 14px;display:flex;justify-content:space-between;border-bottom:1px solid var(--gray-100)">
          <span style="font-size:13px;color:var(--gray-600)">✈️ Air freight cost</span>
          <span class="money am">${fmtD(airCost)}</span>
        </div>
        <div style="padding:10px 14px;display:flex;justify-content:space-between;border-bottom:1px solid var(--gray-100)">
          <span style="font-size:13px;color:var(--gray-600)">🚛 Ground delivery (${aq.groundMode||'LTL'})</span>
          <span class="money am">${fmtD(groundRate)}</span>
        </div>
        <div style="padding:10px 14px;display:flex;justify-content:space-between;background:var(--gray-50)">
          <span style="font-size:13px;font-weight:700">Total cost</span>
          <span class="money rd">${fmtD(totalCost)}</span>
        </div>
      </div>

      <div class="field"><label>Customer rate ($) *</label>
        <input type="number" value="${aq.customerRate}" oninput="S.aq.customerRate=this.value;refreshAqPreview()"
          placeholder="0.00" step="0.01" min="0" style="font-size:18px;font-weight:700;border-color:var(--steel)"></div>

      ${custRate>0&&totalCost>0?`
      <div style="background:${profit>=0?'#f0fdf4':'#fff5f5'};border-radius:var(--radius);padding:14px;text-align:center;margin-top:4px">
        <div style="display:flex;justify-content:space-around">
          <div><div style="font-size:10px;font-weight:700;text-transform:uppercase;color:var(--gray-400)">Profit</div>
            <div style="font-size:22px;font-weight:800;color:${profit>=0?'var(--green)':'var(--red)'}