// ---------- helpers ----------
const MAXREF = 33.4; // personal top speed reference (km/h)
const nf = new Intl.NumberFormat('pt-PT');
const f0 = v => nf.format(Math.round(v));
const f1 = v => new Intl.NumberFormat('pt-PT',{minimumFractionDigits:1,maximumFractionDigits:1}).format(v);
const dshort = d => new Date(d+'T00:00:00').toLocaleDateString('pt-PT',{day:'2-digit',month:'short'}).replace('.','');
const dlong = d => new Date(d+'T00:00:00').toLocaleDateString('pt-PT',{weekday:'long',day:'numeric',month:'long'});
const approx = s => /approx/i.test(s.notes||'');
const avgSpeed = s => s.avgMaxPct * (s.maxSpeed / s.maxPct);
const DAY = 86400000;
const last = SESSIONS[SESSIONS.length-1];
const HEAVY = 3500;
const teamOf = s => s.team || 'Seleção';
const TEAMS = ['Seleção','Lusitanos'];

function meanRd(days, ref){
  const end = new Date(ref.date+'T00:00:00').getTime();
  const xs = SESSIONS.filter(s=>{const t=new Date(s.date+'T00:00:00').getTime();return end-t < days*DAY && t<=end});
  return xs.length ? xs.reduce((a,s)=>a+s.rd,0)/xs.length : null;
}

function status(v, avg){
  const r = v/avg;
  if (r >= 1.10) return {k:'good', icon:'▲', txt:'Acima'};
  if (r <= 0.90) return {k:'warn', icon:'▼', txt:'Abaixo'};
  return {k:'info', icon:'●', txt:'Na média'};
}

// ---------- latest session ----------
function cmpBars(a,b,c){
  const m = Math.max(a,b||0,c||0);
  const bar = (v,col,n)=>v==null?'':'<i title="'+n+'" style="width:'+Math.max(2,v/m*100).toFixed(1)+'%;background:'+col+'"></i>';
  return '<div class="cmp" aria-hidden="true">'+bar(a,'var(--maroon)','Tu')+bar(b,'var(--maroon-soft)','Tua média')+bar(c,'var(--ink-muted)','Média Backs')+'</div>';
}
function perMinute(s){
  if (s.type!=='Match' || !s.fieldTimeMin) return '';
  const pm = SESSIONS.slice(0,SESSIONS.indexOf(s)).filter(x=>x.type==='Match' && x.fieldTimeMin);
  const d = s.rd/s.fieldTimeMin, h = s.hsr/s.fieldTimeMin;
  const dm = pm.length ? pm.reduce((a,x)=>a+x.rd/x.fieldTimeMin,0)/pm.length : null;
  const hm = pm.length ? pm.reduce((a,x)=>a+x.hsr/x.fieldTimeMin,0)/pm.length : null;
  const blk = (n,v,a,u)=>'<div><small>'+n+'</small><span class="num">'+(approx(s)&&n==='Distância'?'~':'')+v+' <small class="sub" style="display:inline">'+u+'</small></span>'+(a!=null?'<small>Média dos teus jogos anteriores: '+(n==='Distância'?f0(a):f1(a))+' '+delta(parseFloat(String(v).replace(',','.')),a).replace('<small class="d','<small style="display:inline" class="d')+'</small>':'')+'</div>';
  return '<div class="pm" style="margin-top:16px">'+blk('Distância',f0(d),dm,'m/min')+blk('Corrida rápida',f1(h),hm,'m/min')+'</div>'
    + '<div class="sub" style="margin-top:6px">Comparação justa do jogo: por minuto em campo ('+Math.floor(s.fieldTimeMin)+' min). Os Backs jogam tempos diferentes, por isso aqui comparas só contigo.</div>';
}
function speedGoal(s){
  const goal = MAXREF*0.95, wk = SESSIONS.filter(x=>x.week===s.week);
  const best = wk.reduce((a,x)=>x.maxSpeed>a.maxSpeed?x:a, wk[0]);
  const done = best.maxSpeed >= goal;
  const pct = Math.min(100, best.maxSpeed/MAXREF/1*100);
  return '<div class="goal"><b>Meta de velocidade da semana</b>'
    + '<div><span class="num">'+f1(best.maxSpeed)+' km/h</span> <span class="sub">('+Math.round(best.maxSpeed/MAXREF*100)+'% do teu máximo)</span> · <span class="'+(done?'t-good':'t-warn')+'" style="font-weight:600">'+(done?'✓ Meta cumprida':'Ainda não cumprida')+'</span></div>'
    + '<div class="gbar"><i style="width:'+pct.toFixed(1)+'%"></i><u style="left:'+(goal/MAXREF*100).toFixed(1)+'%"></u></div>'
    + '<div class="sub">Meta: chegar a 95% do máximo ('+f1(goal)+' km/h) pelo menos uma vez por semana. A marca verde é a meta.'+(done?'':' Faltam '+f1(goal-best.maxSpeed)+' km/h.')+'</div></div>';
}
function prevSame(s, n){
  const i = SESSIONS.indexOf(s);
  return SESSIONS.slice(0,i).filter(x=>x.type===s.type && !x.combined).slice(-n);
}
const mean = (xs,k) => xs.length ? xs.reduce((a,x)=>a+x[k],0)/xs.length : null;
function delta(v, a){
  if (a==null) return '';
  const p = (v/a-1)*100, c = p>=5?'good':p<=-5?'warn':'info';
  return '<small class="d t-'+c+'">'+(p>=0?'+':'')+Math.round(p)+'%</small>';
}
function renderLatest(s){
  const ap = approx(s) ? '~' : '';
  const prev = prevSame(s,5);
  const match = s.type === 'Match';
  const rows = [
    {n:'Distância', k:'rd', d:'Metros corridos', v:s.rd, a:s.avgRd, f:f0, u:' m', ap:ap},
    {n:'Corrida rápida', k:'hsr', d:'Metros acima de 18 km/h', v:s.hsr, a:s.avgHsr, f:f0, u:' m', ap:''},
    {n:'Acelerações', k:'accel', d:'Arranques fortes', v:s.accel, a:s.avgAccel, f:f0, u:'', ap:''},
    {n:'Velocidade máxima', k:'maxSpeed', d:'Ponta mais alta', v:s.maxSpeed, a:avgSpeed(s), f:f1, u:' km/h', ap:'', aap:'~'}
  ].map(r=>({...r, st:status(r.v,r.a)}));
  const above = rows.filter(r=>r.st.k==='good').length, below = rows.filter(r=>r.st.k==='warn').length;
  let verdict;
  if (above>=3) verdict = 'Muito bom: acima da média dos Backs em '+above+' de 4 métricas.';
  else if (above>=2 && below===0) verdict = 'Boa sessão: acima da média dos Backs em '+above+' de 4 métricas.';
  else if (below>=3) verdict = 'Sessão leve: abaixo da média dos Backs em '+below+' de 4 métricas.';
  else verdict = 'Sessão normal: perto da média dos Backs.';
  if (s.shortSession) {
    const g = rows.filter(r=>r.st.k==='good').map(r=>r.n.toLowerCase());
    verdict = 'Sessão encurtada (saíste mais cedo), por isso a distância ficou baixa.' + (g.length ? ' Ficaste acima da média dos Backs em '+g.join(' e ')+'.' : '');
  }
  if (match && s.fieldTimeMin) {
    if (s.fieldTimeMin < 60 && below>=2) verdict = 'Jogaste só '+Math.floor(s.fieldTimeMin)+' min, por isso os totais ficam abaixo da média dos Backs.';
    else verdict += ' Jogaste '+Math.floor(s.fieldTimeMin)+' min.';
  }

  const heavy = s.rd > HEAVY;
  const load = heavy ? {k:'bad', b:'Dia pesado', t:'Mais de ~3500 m'} : s.rd > 3000 ? {k:'warn', b:'Carga alta', t:'Entre 3000 e 3500 m'} : {k:'good', b:'Carga normal', t:'Abaixo de 3000 m'};
  const ac = meanRd(7,s), ch = meanRd(28,s), ratio = ac/ch;
  let wk = ratio > 1.3 ? {k:'warn', b:'Mais pesada', t:'Semana acima do teu habitual'} : ratio < 0.8 ? {k:'info', b:'Mais leve', t:'Semana abaixo do teu habitual'} : {k:'good', b:'Habitual', t:'Semana dentro do teu normal'};
  if (SESSIONS.filter(x=>x.week===s.week && x.date<=s.date).length===1) wk = {k:'info', b:'Semana a começar', t:'Ainda só 1 sessão com GPS esta semana'};
  const gapNear = SESSIONS.some(x=>x.gpsGap && (new Date(s.date)-new Date(x.date))/DAY>=0 && (new Date(s.date)-new Date(x.date))/DAY<=7);
  if (gapNear) wk = {k:'info', b:'Dados incompletos', t:'Treinos da semana sem GPS (Agronomia)'};
  const rec = (match || heavy) ? {k:'warn', b:'Recuperação completa', t:match ? 'Dia de jogo' : 'Dia pesado'} : {k:'good', b:'Recuperação normal', t:'Sem protocolo extra'};
  const todo = (match || heavy)
    ? 'Protocolo de recuperação completo e carb-up de 7–8 g/kg (560–640 g de hidratos de carbono no teu peso).'
    : 'Recuperação normal e refeições habituais. Sem carb-up extra.';

  const L = (name, o) => '<div class="light s-'+o.k+'"><small>'+name+'</small><b class="t-'+o.k+'">'+o.b+'</b><span>'+o.t+'</span></div>';
  const M = r => '<div class="mrow"><div class="mname">'+r.n+'<small>'+r.d+'</small></div>'
    + '<div class="num">'+r.ap+r.f(r.v)+'<small class="sub">'+r.u+'</small></div>'
    + '<div class="num avg">'+(prev.length?r.f(mean(prev,r.k)):'-')+delta(r.v,mean(prev,r.k))+'</div>'
    + '<div class="num avg">'+(r.aap||'')+r.f(r.a)+'</div>'
    + '<div class="pillcell"><span class="pill s-'+r.st.k+' t-'+r.st.k+'">'+r.st.icon+' '+r.st.txt+'</span></div>'
    + cmpBars(r.v, prev.length?mean(prev,r.k):null, r.a)+'</div>';

  let LH =
    '<div class="card"><span class="tag">'+(s===last?'Última sessão':'Sessão')+' · '+dlong(s.date)+' · '+(match?'Jogo vs '+s.opponent:'Treino')+(teamOf(s)!=='Seleção'?'<span class="tbadge">'+teamOf(s)+'</span>':'<span class="tbadge">Seleção</span>')+'</span>'
    + '<p class="verdict">'+verdict+'</p>'
    + '<div class="lights">'+L('Carga da sessão',load)+L('Esta semana vs. último mês',wk)+L('Recuperação',rec)+'</div>'
    + '<div class="todo"><b>O que fazer</b>'+todo+'</div>'
    + (s.extra ? '<div class="sub" style="margin-top:10px"><b>Também nesse dia:</b> '+s.extra+'</div>' : '')
    + (s.combined ? '<div class="sub" style="margin-top:10px"><b>Dia com 2 sessões juntas.</b> Os números são do dia todo, por isso compara só com a média dos Backs e não com as tuas sessões individuais.</div>' : '')
    + '<details class="more"><summary>Ver detalhe: números, comparações e meta</summary>'
    + '<div class="cl"><span><i style="background:var(--maroon)"></i>Tu</span><span><i style="background:var(--maroon-soft)"></i>Tua média</span><span><i style="background:var(--ink-muted)"></i>Média dos Backs</span></div>'
    + '<div class="metrics"><div class="mrow mh"><div class="mh-n">Métrica</div><div>Tu</div><div>Tua média*</div><div>Média Backs</div><div class="pillcell"></div></div>'+rows.map(M).join('')+'</div><div class="sub" style="margin-top:6px">* '+(match?'Média dos teus '+prev.length+' jogos anteriores.':'Média das tuas '+prev.length+' sessões de treino anteriores.')+' A percentagem mostra se estás acima ou abaixo de ti.</div>'
    + perMinute(s) + speedGoal(s) + '</details></div>';
  if (s.groupLabel) LH = LH.replace(/Backs/g, s.groupLabel);
  document.getElementById('latest').innerHTML = LH;
  document.getElementById('updated').textContent = 'Atualizado a '+dshort(last.date)+' · '+SESSIONS.length+' sessões';
  renderTrend(s);
}

// ---------- charts ----------
const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
let range = 12, charts = [], typeFilter = 'all', teamFilter = 'all';
function build(){
  charts.forEach(c=>c.destroy()); charts = [];
  const pool = SESSIONS.filter(s=>(teamFilter==='all'||teamOf(s)===teamFilter)&&(typeFilter==='all'||(typeFilter==='match'?s.type==='Match':s.type!=='Match'))), src = range===0 ? pool : pool.slice(-range);
  const labels = src.map(s=>dshort(s.date));
  const ink = css('--ink-muted'), grid = css('--line');
  const pr=css('--maroon'), mc=css('--red'), ms=css('--maroon-soft'), gold=css('--gold'), pit=css('--pitch-2'), surf=css('--surface'), inkc=css('--ink'), bgc=css('--bg');
  Chart.defaults.font.family = "Inter, system-ui, sans-serif";
  const grad = (c1,c2) => ctx => { const a=ctx.chart.chartArea; if(!a) return c1; const g=ctx.chart.ctx.createLinearGradient(0,a.top,0,a.bottom); g.addColorStop(0,c1); g.addColorStop(1,c2); return g; };
  const barFill = ctx => { const m = src[ctx.dataIndex] && src[ctx.dataIndex].type==='Match'; return m ? grad(mc, mc+'AA')(ctx) : grad(ms, ms+'AA')(ctx); };
  const peak = {id:'peak', afterDatasetsDraw(ch){ const d=ch.data.datasets[0], m=ch.getDatasetMeta(0); if(!m.data.length) return;
      const vals=d.data.map(v=>v==null?-1:v), mi=vals.indexOf(Math.max(...vals)), li=vals.length-1, c=ch.ctx; c.save(); c.font='600 11px Inter, sans-serif'; c.textAlign='center';
      [mi,li].filter((v,i,a)=>a.indexOf(v)===i).forEach(i=>{ const el=m.data[i]; if(!el||d.data[i]==null) return; const t=nf.format(Math.round(d.data[i]*10)/10);
        c.fillStyle=i===mi?pr:ink; c.fillText(t, el.x, el.y-6); }); c.restore(); }};
  const tip = {backgroundColor:inkc, titleColor:bgc, bodyColor:bgc, cornerRadius:10, padding:10, boxPadding:4, titleFont:{weight:'600'}, usePointStyle:true};
  const opts = (unit, min) => ({responsive:true, maintainAspectRatio:false, animation:{duration:500}, layout:{padding:{top:16}},
    interaction:{mode:'index', intersect:false},
    plugins:{legend:{display:false}, tooltip:Object.assign({}, tip, {callbacks:{
      title:i=>{const s=src[i[0].dataIndex]; return dshort(s.date)+' · '+(s.type==='Match'?'Jogo vs '+s.opponent:'Treino');},
      label:c=>c.dataset.label+': '+(c.parsed.y==null?'-':nf.format(Math.round(c.parsed.y*10)/10))+unit}})},
    scales:{x:{ticks:{color:ink,maxRotation:(innerWidth<520?0:60),autoSkip:true,maxTicksLimit:(innerWidth<520?6:(range===0?14:12)),font:{size:11}},grid:{display:false},border:{color:grid}},
            y:{beginAtZero:min===undefined, min:min, ticks:{color:ink,font:{size:11},maxTicksLimit:6}, grid:{color:grid+'99',drawTicks:false}, border:{display:false}}}});
  const mk = (id, label, key, avgKey, unit, avgFn) => {
    const ds = [{type:'bar', label:label, data:src.map(s=>s[key]), backgroundColor:barFill, borderRadius:{topLeft:8,topRight:8}, borderSkipped:'bottom', maxBarThickness:26, order:2}];
    if (avgKey) ds.push({type:'line', label:'Média Backs', data:src.map(s=>avgFn?avgFn(s):s[avgKey]), borderColor:gold, backgroundColor:surf, borderWidth:2.5, pointRadius:3.5, pointBorderWidth:2, pointBorderColor:gold, pointHoverRadius:6, cubicInterpolationMode:'monotone', order:1});
    charts.push(new Chart(document.getElementById(id), {data:{labels, datasets:ds}, options:opts(unit), plugins:[peak]}));
  };
  mk('cDist','Tu','rd','avgRd',' m');
  mk('cHsr','Tu','hsr','avgHsr',' m');
  mk('cAcc','Tu','accel','avgAccel','');
  // speed: bars green once they reach the weekly 95% goal
  const goal = MAXREF*0.95, spFill = ctx => { const v=src[ctx.dataIndex].maxSpeed; return v>=goal ? grad(pit,pit+'99')(ctx) : barFill(ctx); };
  const sd = [{type:'bar', label:'Tu', data:src.map(s=>s.maxSpeed), backgroundColor:spFill, borderRadius:{topLeft:8,topRight:8}, borderSkipped:'bottom', maxBarThickness:26, order:2},
              {type:'line', label:'Máximo pessoal', data:src.map(()=>MAXREF), borderColor:ink, borderDash:[3,5], borderWidth:1.5, pointRadius:0, pointHoverRadius:0, order:1},
              {type:'line', label:'Meta 95%', data:src.map(()=>goal), borderColor:pit, borderWidth:2.5, pointRadius:0, pointHoverRadius:0, order:1}];
  const so = opts(' km/h'); so.scales.y.max = 36;
  charts.push(new Chart(document.getElementById('cSpd'), {data:{labels, datasets:sd}, options:so, plugins:[peak]}));
  drawWeekChart(); buildGames({mc,ms,pit,ink,grid,tip,pr});
}
function setRange(n){
  range = n;
  document.getElementById('r12').setAttribute('aria-pressed', n===12);
  document.getElementById('rAll').setAttribute('aria-pressed', n===0);
  build();
}
document.getElementById('r12').onclick = ()=>setRange(12);
document.getElementById('rAll').onclick = ()=>setRange(0);
function setType(t){ typeFilter=t; [['fAll','all'],['fTr','train'],['fMa','match']].forEach(([id,k])=>document.getElementById(id).setAttribute('aria-pressed',t===k)); build(); }
function setTeam(t){ teamFilter=t; [['tAll','all'],['tSel','Seleção'],['tLus','Lusitanos']].forEach(([id,k])=>document.getElementById(id).setAttribute('aria-pressed',t===k)); build(); }
document.getElementById('tAll').onclick=()=>setTeam('all'); document.getElementById('tSel').onclick=()=>setTeam('Seleção'); document.getElementById('tLus').onclick=()=>setTeam('Lusitanos');
document.getElementById('fAll').onclick=()=>setType('all'); document.getElementById('fTr').onclick=()=>setType('train'); document.getElementById('fMa').onclick=()=>setType('match');

// ---------- weeks ----------
const DOWN = ['domingo','segunda-feira','terça-feira','quarta-feira','quinta-feira','sexta-feira','sábado'];
function dow(d){ const n = new Date(d).getUTCDay(); return n===0 ? 7 : n; }   // seg=1 ... dom=7
// Cada semana conta só até ao mesmo dia da semana (cut), para comparar o mesmo pedaço de semana.
function weekData(cut){
  cut = cut || dow(last.date);
  const w = {};
  SESSIONS.forEach(s=>{(w[s.week] ||= {k:s.week,n:0, rd:0, hsr:0, d0:s.date, d1:s.date, gap:false, sp:null}); const o=w[s.week]; if(s.gpsGap) o.gap=true; if(dow(s.date)>cut) return; o.n++; o.rd+=s.rd; o.hsr+=s.hsr; o.d1=s.date; o.sp=Math.max(o.sp||0,s.maxSpeed);});
  return Object.values(w).sort((a,b)=>a.k-b.k).slice(-10);
}
function renderWeeks(){}
function buildWeeks(opts,P){
  const ws = weekData(), lab = ws.map(o=>dshort(o.d0)), cur = last.week;
  const goal = MAXREF*0.95;
  const base = (unit)=>{const o=opts(unit); o.layout={padding:{top:18}}; o.plugins.tooltip=Object.assign({},P.tip,{callbacks:{title:i=>{const o=ws[i[0].dataIndex];return 'Semana '+o.k+(o.n?' · '+dshort(o.d0)+' – '+dshort(o.d1):' · sem sessões até '+DOWN[dow(last.date)])},label:c=>c.dataset.label+': '+nf.format(Math.round(c.parsed.y*10)/10)+unit,afterBody:i=>{const o=ws[i[0].dataIndex];return o.n+(o.n===1?' sessão':' sessões')+(o.gap?' · treinos sem GPS':'')+(o.k===cur?' · semana em curso':'')}}}); o.scales.x.ticks.maxRotation=0; return o;};
  const lbl = {id:'lbl',afterDatasetsDraw(ch){const m=ch.getDatasetMeta(0),c=ch.ctx;c.save();c.font='600 11px Inter, sans-serif';c.textAlign='center';c.fillStyle=P.ink;m.data.forEach((e,i)=>{const v=ch.data.datasets[0].data[i];if(v!=null)c.fillText(nf.format(Math.round(v*10)/10),e.x,e.y-6)});c.restore()}};
  const part = i => ws[i].gap || ws[i].k===cur;
  const o1 = base(' km'); o1.scales.y.ticks.display=false; o1.scales.y.grid.display=false;
  charts.push(new Chart(document.getElementById('cWk'),{type:'bar',data:{labels:lab,datasets:[{label:'Distância',data:ws.map(o=>o.n?o.rd/1000:null),backgroundColor:ctx=>part(ctx.dataIndex)?P.mc+'55':P.grad(P.mc,P.mc+'AA')(ctx),borderRadius:{topLeft:8,topRight:8},borderSkipped:'bottom',maxBarThickness:34}]},options:o1,plugins:[lbl]}));
  const o2 = base(' km/h'); o2.scales.y.min=24; o2.scales.y.max=34; o2.scales.y.beginAtZero=false; o2.interaction={mode:'index',intersect:false};
  charts.push(new Chart(document.getElementById('cWs'),{type:'line',data:{labels:lab,datasets:[
    {label:'Velocidade mais alta',data:ws.map(o=>o.sp),borderColor:P.mc,backgroundColor:P.mc+'22',fill:true,borderWidth:2.5,cubicInterpolationMode:'monotone',pointRadius:5,pointHoverRadius:7,pointBorderWidth:2.5,pointBorderColor:ws.map(o=>o.sp>=goal?P.pit:P.mc),pointBackgroundColor:ws.map(o=>o.sp>=goal?P.pit:P.surf)},
    {label:'Meta 95%',data:ws.map(()=>goal),borderColor:P.pit,borderWidth:2,borderDash:[6,4],pointRadius:0,pointHoverRadius:0,fill:false}]},options:o2}));
}


// ---------- week view (escolher a semana; semana atual só até ao dia atual) ----------
let selWeek = last.week, wkChart = null;
const DS = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
function weekList(){ return [...new Set(SESSIONS.map(x=>x.week))].sort((a,b)=>b-a); }
function weekCut(w){ return w===last.week ? dow(last.date) : 7; }
function weekSessions(w){ const c=weekCut(w); return SESSIONS.filter(x=>x.week===w && dow(x.date)<=c); }
function initWkPick(){
  const sel=document.getElementById('wkpick');
  sel.innerHTML=weekList().map(w=>{const xs=SESSIONS.filter(x=>x.week===w), a=xs[0].date, b=xs[xs.length-1].date;
    return '<option value="'+w+'">Semana '+w+' · '+dshort(a)+(a!==b?' – '+dshort(b):'')+(w===last.week?' · atual':'')+'</option>';}).join('');
  sel.value=String(selWeek);
  sel.addEventListener('change',()=>{selWeek=+sel.value; renderWeekView(); renderPos();});
}
function renderWeekView(){
  const el=document.getElementById('wkview'); if(!el) return;
  const w=selWeek, cut=weekCut(w), cur=wkTot(w,cut), cutName=DOWN[cut%7];
  const xs=weekSessions(w), weeks=[...new Set(SESSIONS.map(x=>x.week))].sort((a,b)=>a-b), pw=weeks[weeks.indexOf(w)-1], prv=pw?wkTot(pw,cut):null;
  const accT=ww=>SESSIONS.filter(x=>x.week===ww && dow(x.date)<=cut).reduce((a,x)=>a+x.accel,0);
  let h='<div class="card"><span class="tag">Semana '+w+(w===last.week?' · até '+cutName:' · semana completa')+'</span>';
  h+='<div class="sub" style="margin-top:8px">'+(w===last.week?'A semana atual só conta até à '+cutName+'. ':'')+(prv&&prv.n?'Comparada com a semana '+pw+', também só '+(cut<7?'de segunda a '+cutName.replace('-feira',''):'completa')+'.':'')+'</div>';
  if(!cur){ h+='<div class="sub" style="margin-top:8px">Sem sessões com GPS neste período.</div></div>'; el.innerHTML=h; return; }
  const gap=SESSIONS.some(x=>x.gpsGap && (x.week===w || x.week===pw));
  const T=(n,v,pv,fmt,u)=>{ let d=''; if(prv&&prv.n&&!gap&&pv>0){const p=(v/pv-1)*100,c=Math.abs(p)<5?'info':(p>0?'good':'info'); d=' <span class="t-'+c+'" style="font-weight:600;font-size:13px">'+(p>=5?'▲':p<=-5?'▼':'●')+' '+(p>=0?'+':'')+Math.round(p)+'%</span><small>Semana '+pw+': '+fmt(pv)+u+'</small>';}
    return '<div><small>'+n+'</small><span class="num">'+fmt(v)+u+'</span>'+d+'</div>'; };
  h+='<div class="tr" style="margin-top:10px">'+T('Distância total',cur.rd/1000,prv?prv.rd/1000:0,f1,' km')+T('Corrida rápida',cur.hsr,prv?prv.hsr:0,f0,' m')+T('Acelerações',accT(w),pw?accT(pw):0,f0,'')+T('Velocidade mais alta',cur.sp,prv?prv.sp:0,f1,' km/h')+'</div>';
  if(gap) h+='<div class="sub" style="margin-top:8px">Esta semana ou a anterior tiveram treinos sem GPS (Agronomia), por isso não pondero a comparação.</div>';
  h+='<div class="sub" style="margin-top:8px">'+cur.n+(cur.n===1?' sessão':' sessões')+(prv&&prv.n?' · '+prv.n+' na semana '+pw:'')+(cur.n!==(prv&&prv.n)&&prv&&prv.n?'. Com número de sessões diferente, os totais não são diretamente comparáveis.':'')+'</div></div>';
  h+='<div class="card"><b>Dia a dia</b><div class="sub">Metros por dia · vermelho = jogo</div><div class="cv"><canvas id="cWd"></canvas></div><div class="wkleg"><span><i style="background:var(--maroon-soft)"></i>Distância</span><span><i style="background:var(--red)"></i>Distância (jogo)</span><span><i style="background:var(--gold)"></i>Corrida rápida (>18 km/h)</span></div>'
   +'<div class="scroll" style="margin-top:10px"><table><tr><th>Dia</th><th>Tipo</th><th>Dist.</th><th>Rápida</th><th>Acel.</th><th>Vel.</th></tr>'
   +xs.map(x=>'<tr><td>'+DS[dow(x.date)%7]+' '+dshort(x.date)+'</td><td>'+(x.type==='Match'?'Jogo':x.combined?'2 sessões':'Treino')+'</td><td>'+f0(x.rd)+(approx(x)?' ~':'')+'</td><td>'+f0(x.hsr)+'</td><td>'+f0(x.accel)+'</td><td>'+f1(x.maxSpeed)+'</td></tr>').join('')+'</table></div></div>';
  el.innerHTML=h; drawWeekChart();
}
function drawWeekChart(){
  const cv=document.getElementById('cWd'); if(wkChart){wkChart.destroy(); wkChart=null;} if(!cv||!window.Chart) return;
  const xs=weekSessions(selWeek), cut=weekCut(selWeek), days=[1,2,3,4,5,6,7].filter(d=>selWeek!==last.week||d<=cut);
  const ink=css('--ink-muted'), grid=css('--line'), ms=css('--maroon-soft'), mc=css('--red'), gold=css('--gold'), inkc=css('--ink'), bgc=css('--bg');
  const by=d=>xs.filter(x=>dow(x.date)===d);
  const sum=(d,k)=>{const a=by(d); return a.length?a.reduce((t,x)=>t+x[k],0):null;};
  const isM=d=>by(d).some(x=>x.type==='Match');
  const lbl={id:'lbl',afterDatasetsDraw(ch){const c=ch.ctx;c.save();c.font='600 11px Inter, sans-serif';c.textAlign='center';c.fillStyle=inkc;ch.getDatasetMeta(0).data.forEach((e,i)=>{const v=ch.data.datasets[0].data[i];if(v!=null)c.fillText(nf.format(Math.round(v)),e.x,e.y-6)});c.restore()}};
  Chart.defaults.font.family="Inter, system-ui, sans-serif";
  wkChart=new Chart(cv,{type:'bar',data:{labels:days.map(d=>DS[d%7]),datasets:[
    {label:'Distância',data:days.map(d=>sum(d,'rd')),backgroundColor:days.map(d=>isM(d)?mc:ms),borderRadius:{topLeft:6,topRight:6},borderSkipped:'bottom',maxBarThickness:30},
    {label:'Corrida rápida',data:days.map(d=>sum(d,'hsr')),backgroundColor:gold,borderRadius:{topLeft:6,topRight:6},borderSkipped:'bottom',maxBarThickness:30}]},
    options:{responsive:true,maintainAspectRatio:false,animation:{duration:400},layout:{padding:{top:18}},
      plugins:{legend:{display:false},tooltip:{backgroundColor:inkc,titleColor:bgc,bodyColor:bgc,cornerRadius:10,padding:10,callbacks:{label:c=>c.dataset.label+': '+(c.parsed.y==null?'-':nf.format(Math.round(c.parsed.y))+' m')}}},
      scales:{x:{ticks:{color:ink,font:{size:11}},grid:{display:false},border:{color:grid}},y:{beginAtZero:true,ticks:{color:ink,font:{size:11},maxTicksLimit:5},grid:{color:grid+'99',drawTicks:false},border:{display:false}}}},plugins:[lbl]});
}

// ---------- matches ----------
function renderGames(){
  const g = SESSIONS.filter(s=>s.type==='Match' && s.fieldTimeMin).slice().reverse();
  document.getElementById('games').innerHTML = '<div class="card gch"><b>Intensidade por jogo</b><div class="sub">Metros por minuto em campo · vermelho = corrida rápida (>18 km/h)</div><div class="cv"><canvas id="cGm"></canvas></div></div>' + g.map(s=>{
    const dpm = s.rd/s.fieldTimeMin, h = s.hsr/s.fieldTimeMin;
    const before = SESSIONS.slice(0,SESSIONS.indexOf(s)).filter(x=>x.type==='Match' && x.fieldTimeMin);
    const bm = before.length ? before.reduce((a,x)=>a+x.rd/x.fieldTimeMin,0)/before.length : null;
    return '<div class="card game"><b>vs '+s.opponent+'</b><div class="sub">'+dshort(s.date)+' · '+Math.floor(s.fieldTimeMin)+' min em campo</div>'
      + '<div class="big">'+f0(dpm)+' <small>m/min'+(approx(s)?' ~':'')+'</small></div>'
      + '<div class="sub">Corrida rápida: '+f1(h)+' m/min</div>'+(bm?'<div class="sub">vs jogos anteriores: '+delta(dpm,bm).replace('<small class="d','<small style="display:inline" class="d')+'</div>':'')+'</div>';}).join('');
}

function buildGames(P){
  const g = SESSIONS.filter(x=>x.type==='Match' && x.fieldTimeMin); if(!document.getElementById('cGm')||!g.length) return;
  const tt = Object.assign({},P.tip,{callbacks:{title:i=>'vs '+g[i[0].dataIndex].opponent+' · '+dshort(g[i[0].dataIndex].date),label:c=>c.dataset.label+': '+nf.format(Math.round(c.parsed.y*10)/10)+' m/min',afterBody:i=>Math.floor(g[i[0].dataIndex].fieldTimeMin)+' min em campo'}});
  charts.push(new Chart(document.getElementById('cGm'),{type:'bar',data:{labels:g.map(x=>x.opponent),datasets:[
    {label:'Distância',data:g.map(x=>x.rd/x.fieldTimeMin),backgroundColor:P.pr,borderRadius:{topLeft:8,topRight:8},borderSkipped:'bottom',maxBarThickness:34},
    {label:'Corrida rápida',data:g.map(x=>x.hsr/x.fieldTimeMin),backgroundColor:P.mc,borderRadius:{topLeft:8,topRight:8},borderSkipped:'bottom',maxBarThickness:34}]},
    options:{responsive:true,maintainAspectRatio:false,layout:{padding:{top:8}},plugins:{legend:{display:false},tooltip:tt},interaction:{mode:'index',intersect:false},
      scales:{x:{grid:{display:false},ticks:{color:P.ink,font:{size:11}},border:{color:P.grid}},y:{beginAtZero:true,ticks:{color:P.ink,font:{size:11},maxTicksLimit:5},grid:{color:P.grid+'99',drawTicks:false},border:{display:false}}}}}));
}
// ---------- log ----------
function renderLog(){
  const body = document.getElementById('logBody');
  body.innerHTML = SESSIONS.slice().reverse().map((s,i)=>{
    const m = s.type==='Match', ap = approx(s)?'~':'';
    return '<tr class="row" tabindex="0" data-i="'+i+'"><td class="'+(m?'m dj':'')+'">'+dshort(s.date)+(m?' · J':'')+(teamOf(s)==='Lusitanos'?' · LUS':'')+'</td><td class="'+(m?'m':'')+'">'+(m?'Jogo':'Treino')+'</td><td>'+ap+f0(s.rd)+'</td><td>'+f0(s.hsr)+'</td><td>'+s.accel+'</td><td>'+f1(s.maxSpeed)+'</td></tr>'
      + '<tr class="note" hidden><td colspan="6">'+(s.notes||'Sem nota.')+'</td></tr>';}).join('');
  body.querySelectorAll('tr.row').forEach((tr,i)=>{ if(i>=10){tr.classList.add('x'); tr.nextElementSibling.classList.add('x');} });
  const mb=document.getElementById('logMore'); if(mb) mb.onclick=()=>{const sh=body.classList.toggle('short'); mb.textContent=sh?'Ver todas as sessões ('+SESSIONS.length+')':'Mostrar só as 10 últimas';}; if(mb) mb.textContent='Ver todas as sessões ('+SESSIONS.length+')';
  const toggle = tr => {const n = tr.nextElementSibling; n.hidden = !n.hidden;};
  body.querySelectorAll('tr.row').forEach(tr=>{
    tr.addEventListener('click',()=>toggle(tr));
    tr.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();toggle(tr);}});
  });
}

function wkTot(w,cut){
  const xs = SESSIONS.filter(x=>x.week===w && (!cut || dow(x.date)<=cut));
  return xs.length ? {n:xs.length, rd:xs.reduce((a,x)=>a+x.rd,0), hsr:xs.reduce((a,x)=>a+x.hsr,0), sp:Math.max(...xs.map(x=>x.maxSpeed))} : null;
}
function renderTrend(s){
  const cut = dow(s.date), cur = wkTot(s.week,cut), weeks = [...new Set(SESSIONS.map(x=>x.week))].sort((a,b)=>a-b);
  const pw = weeks[weeks.indexOf(s.week)-1], prv = pw ? wkTot(pw,cut) : null;
  const el = document.getElementById('wktrend');
  if (!prv || !prv.n){ el.innerHTML=''; return; }
  if (SESSIONS.some(x=>x.gpsGap && (x.week===s.week || x.week===pw))){ el.innerHTML='<div class="card" style="margin-top:12px"><span class="tag">Esta semana vs. a anterior · semana '+s.week+'</span><div class="sub" style="margin-top:8px">Esta semana ou a anterior tiveram treinos sem GPS (Agronomia), por isso não comparo as semanas.</div></div>'; return; }
  const T = (n,v,pv,fmt,u,watchUp) => {
    const p = (v/pv-1)*100, c = Math.abs(p)<5?'info':(p>0?(watchUp&&p>30?'warn':'good'):'info');
    return '<div><small>'+n+'</small><span class="num">'+fmt(v)+u+'</span> <span class="t-'+c+'" style="font-weight:600;font-size:13px">'+(p>=5?'▲':p<=-5?'▼':'●')+' '+(p>=0?'+':'')+Math.round(p)+'%</span><small>Semana anterior até '+DOWN[cut%7].replace('-feira','')+': '+fmt(pv)+u+'</small></div>';
  };
  const same = cur.n===prv.n;
  el.innerHTML = '<div class="card" style="margin-top:12px"><span class="tag">Esta semana vs. a anterior · semana '+s.week+'</span>'
    + '<div class="tr" style="margin-top:10px">'
    + T('Distância total',cur.rd/1000,prv.rd/1000,f1,' km',true)
    + T('Corrida rápida',cur.hsr,prv.hsr,f0,' m',false)
    + T('Velocidade mais alta',cur.sp,prv.sp,f1,' km/h',false)
    + '</div><div class="sub" style="margin-top:8px">'+'Comparação justa: as duas semanas contadas só até à '+DOWN[cut%7]+' (segunda a '+DOWN[cut%7].replace('-feira','')+'). '+cur.n+(cur.n===1?' sessão':' sessões')+' esta semana, '+prv.n+' na anterior'+(same?'.':'. Com número de sessões diferente, os totais não são diretamente comparáveis.')+'</div></div>';
}
const pick = document.getElementById('pick');
pick.innerHTML = SESSIONS.map((x,i)=>'<option value="'+i+'">'+dshort(x.date)+' · '+(x.type==='Match'?'Jogo vs '+x.opponent:'Treino')+(teamOf(x)==='Lusitanos'?' · Lusitanos':'')+'</option>').reverse().join('');
pick.value = String(SESSIONS.length-1);
pick.addEventListener('change',()=>renderLatest(SESSIONS[+pick.value]));

const POSWK = {week:45, final:false,
  note:"Semana 45, parcial: os teus números são de 02–04/11 (3 sessões); os dos 3/4 incluem a semana toda e o jogo. Domingo fecho com os relatórios finais.",
  /* g: 'in' = 3/4 da equipa de jogo (média oficial), 'n23' = Non 23, me = tu; rd arredondado a 100 m nos outros */
  rows:[
  {n:"Simão Bento",p:"Defesa",g:"in",rd:8815,hsr:1515,acc:120,sp:30.4,pc:92.2},
  {n:"Raffaele Storti",p:"Ponta",g:"in",rd:8203,hsr:1779,acc:144,sp:31.2,pc:90.3},
  {n:"Manuel Vareiro",p:"Abertura",g:"in",rd:7999,hsr:1439,acc:145,sp:28.9,pc:86.7},
  {n:"Domingos Cabral",p:"Abertura",g:"in",rd:7900,hsr:1251,acc:176,sp:26.8,pc:82.9},
  {n:"Manuel Cardoso-Pinto",p:"Ponta",g:"in",rd:7800,hsr:1653,acc:118,sp:28.9,pc:81.1},
  {n:"Samuel Marques",p:"9",sh:1,g:"in",rd:7700,hsr:1666,acc:119,sp:26.6,pc:80.4},
  {n:"Hugo Camacho",p:"9",sh:1,g:"in",rd:6900,hsr:1213,acc:103,sp:30.0,pc:95.3},
  {n:"Vincent Pinto",p:"Defesa",g:"in",rd:6900,hsr:1117,acc:105,sp:30.0,pc:89.1},
  {n:"Jordan Lee Bacon",p:"Centro",g:"n23",rd:7100,hsr:1085,acc:125,sp:31.5,pc:92.8},
  {n:"Joris Moura",p:"Abertura",g:"n23",rd:7000,hsr:1253,acc:85,sp:29.8,pc:93.2},
  {n:"Hugo Aubry",p:"Abertura",g:"n23",rd:6900,hsr:936,acc:119,sp:27.8,pc:88.8},
  {n:"Vasco Durao",p:"Centro",g:"n23",rd:6500,hsr:912,acc:132,sp:26.8,pc:83.9},
  {n:"Tomás Amado",p:"9",sh:1,me:1,g:"n23",rd:6800,hsr:1382,acc:131,sp:31.2,pc:93.5}],
  game:{date:"07/11 vs Chile",avg:{rd:2653,hsr:588,acc:34,pc:86},
    sh:[{n:"Samuel Marques",min:"1:20:50",rd:3600,hsr:672,acc:34,sp:27.1},{n:"Hugo Camacho",min:"0:13:06",rd:800,hsr:100,acc:4,sp:24.8}]}
};
function spark(vals,hi){
  const mn=Math.min(...vals),mx=Math.max(...vals),W=120,H=30,p=3,n=vals.length;
  const pts=vals.map((v,k)=>[p+k*(W-2*p)/Math.max(n-1,1),H-p-(mx===mn?.5:(v-mn)/(mx-mn))*(H-2*p)]);
  const d=pts.map((q,k)=>(k?'L':'M')+q[0].toFixed(1)+' '+q[1].toFixed(1)).join(' ');
  const a=hi!=null?pts[hi]:pts[n-1];
  return '<svg viewBox="0 0 '+W+' '+H+'" preserveAspectRatio="none"><path d="'+d+'" fill="none" stroke="rgba(255,255,255,.85)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke"/><circle cx="'+a[0]+'" cy="'+a[1]+'" r="3" fill="#fff"/></svg>';
}
function renderKpis(){
  const wp=document.getElementById('wkpill'); if(wp) wp.textContent='Semana '+last.week;
  const el=document.getElementById('kpis'); if(!el) return;
  const L=SESSIONS.slice(-14), sp=SESSIONS.map(x=>x.maxSpeed), bi=sp.indexOf(Math.max(...sp));
  const wk=[...new Set(SESSIONS.map(x=>x.week))].sort((a,b)=>a-b).slice(-8).map(w=>wkTot(w).rd/1000);
  const cw=wkTot(last.week), games=SESSIONS.filter(x=>x.type==='Match');
  const T=(l,v,u,sv,sub)=>'<div class="kpi"><small>'+l+'</small><b>'+v+'<em>'+u+'</em></b>'+sv+'<span>'+sub+'</span></div>';
  el.innerHTML=T('Velocidade máx. época',sp[bi].toFixed(1).replace('.',','),'km/h',spark(SESSIONS.slice(-14).map(x=>x.maxSpeed)),dshort(SESSIONS[bi].date)+' · recorde pessoal ~33,4')
   +T('Semana '+last.week,(cw.rd/1000).toFixed(1).replace('.',','),'km',spark(wk),cw.n+' sessões até agora')
   +T('Sessões registadas',SESSIONS.length,'',spark(L.map(x=>x.rd)),'distância das últimas 14')
   +T('Jogos',games.length,'',spark(games.map(x=>x.hsr)),'corrida rápida por jogo');
}
function renderPos(){
  const el=document.getElementById('pos'); if(!el) return;
  if(selWeek!==POSWK.week){ el.innerHTML='<div class="sub">Comparação com os outros scrum-halves e com os 3/4 só existe para a semana '+POSWK.week+', a partir dos relatórios semanais. Escolhe a semana '+POSWK.week+' acima para ver.</div>'; return; }
  const R=POSWK.rows, me=R.find(r=>r.me), shs=R.filter(r=>r.sh), inn=R.filter(r=>r.g==='in'), oth=shs.filter(r=>!r.me);
  const M=[['rd','Distância','m',0],['hsr','Corrida rápida','m >18 km/h',0],['acc','Acelerações','',0],['sp','Velocidade máxima','km/h',1]];
  const fm=(v,d)=>v.toLocaleString('pt-PT',{minimumFractionDigits:d,maximumFractionDigits:d});
  const rank=(arr,k)=>1+arr.filter(r=>r[k]>me[k]).length;
  const avg=(arr,k)=>arr.reduce((a,r)=>a+r[k],0)/arr.length;
  const cs=getComputedStyle(document.documentElement), C=n=>cs.getPropertyValue(n).trim();
  let h='<div><span class="tag">Parcial</span> <span class="sub">'+POSWK.note+'</span></div>';
  h+='<div class="radarbox"><div class="chips">'
   +M.map(([k,t,u,d])=>{const pd=(me[k]/avg(inn,k)-1)*100,c=Math.abs(pd)<10?'info':(pd>0?'good':'warn'),lab=Math.abs(pd)<10?'Na média':(pd>0?'Acima':'Abaixo');
     const mx=Math.max(...R.map(r=>r[k])), cls=pd>=10?'up':(pd<=-10?'dn':'');
     return '<div class="chip '+cls+'"><div class="lf"><div class="t">'+t+'</div><div class="big2">'+fm(me[k],d)+'<small>'+(u||'')+'</small></div>'
       +'<div class="pb '+c+'"><i style="width:'+(me[k]/mx*100).toFixed(1)+'%"></i><u style="left:'+(avg(inn,k)/mx*100).toFixed(1)+'%" title="Média 3/4"></u></div>'
       +'<div class="sub" style="margin-top:6px">Média 3/4 '+fm(avg(inn,k),d)+' <span class="pillr '+c+'">'+lab+' '+(pd>=0?'+':'')+Math.round(pd)+'%</span></div></div>'
       +'<div class="rk">#'+rank(shs,k)+'<small> /3 nos 9</small><br>#'+rank(R,k)+'<small> /'+R.length+' nos 3/4</small></div></div>';}).join('')
   +'</div>';
  h+='<div class="dp">'+M.map(([k,t,u,d])=>{
    const vs=R.map(r=>r[k]), lo=Math.min(...vs), hi=Math.max(...vs), pad=(hi-lo)*.06, a=lo-pad, b=hi+pad, X=v=>((v-a)/(b-a)*100).toFixed(2)+'%', ai=avg(inn,k);
    return '<div class="row"><div class="rl">'+t+'<small>'+(u||'nº')+'</small></div><div class="trk">'
     +'<div class="av" style="left:'+X(ai)+'" title="Média 3/4 da equipa de jogo: '+fm(ai,d)+'"><i>média</i></div>'
     +R.filter(r=>!r.me).map(r=>'<div class="d'+(r.sh?' sh':'')+'" style="left:'+X(r[k])+'" title="'+r.n+': '+fm(r[k],d)+'"></div>').join('')
     +'<div class="d me" style="left:'+X(me[k])+'" title="Tu: '+fm(me[k],d)+'"></div><div class="mv" style="left:'+X(me[k])+'">'+fm(me[k],d)+'</div>'
     +'<span class="ax" style="left:0">'+fm(lo,d)+'</span><span class="ax" style="right:0">'+fm(hi,d)+'</span></div></div>';}).join('')+'</div>';
  h+='<div class="leg2"><span><i style="background:var(--maroon);width:12px;height:12px"></i>Tu</span><span><i style="background:var(--ink-muted);width:10px;height:10px"></i>Outros 9 (Marques, Camacho)</span><span><i style="background:var(--line);width:9px;height:9px"></i>Restantes 3/4</span><span><i style="background:var(--pitch-2);width:3px;height:12px;border-radius:1px"></i>Média 3/4 da equipa de jogo</span></div>';
  h+='<details><summary>Ver tabela completa por jogador</summary>';
  M.forEach(([k,t,u,d])=>{const rs=[...R].sort((a,b)=>b[k]-a[k]),mx=rs[0][k];
    h+='<div class="mb"><b>'+t+'</b>'+rs.map(r=>'<div class="pr '+(r.me?'me':r.sh?'sh':'')+'"><span class="nm">'+r.n+' <small>'+r.p+(r.g==='n23'&&!r.me?' · Non 23':'')+'</small></span><span class="bar"><i style="width:'+(r[k]/mx*100)+'%"></i></span><span class="v">'+fm(r[k],d)+'</span></div>').join('')+'</div>';});
  h+='</details>';
  const g=POSWK.game;
  h+='<div class="mb"><div class="mh"><b>Jogo '+g.date+' · formações de jogo</b><span class="sub">Tu não estavas na lista de 23</span></div><div class="scroll"><table><tr><th>Jogador</th><th>Tempo</th><th>Dist. (m)</th><th>Rápida</th><th>Acel.</th><th>Vel. máx</th></tr>'
   +g.sh.map(r=>'<tr><td>'+r.n+'</td><td>'+r.min+'</td><td>~'+fm(r.rd,0)+'</td><td>'+r.hsr+'</td><td>'+r.acc+'</td><td>'+fm(r.sp,1)+'</td></tr>').join('')
   +'<tr><td>Média 3/4 (jogo)</td><td></td><td>'+fm(g.avg.rd,0)+'</td><td>'+g.avg.hsr+'</td><td>'+g.avg.acc+'</td><td>'+g.avg.pc+'%</td></tr></table></div></div>';
  el.innerHTML=h;
}


function showTab(n){
  document.querySelectorAll('.pg').forEach(p=>p.classList.toggle('on',p.id==='pg-'+n));
  document.querySelectorAll('#tabbar button').forEach(b=>b.classList.toggle('on',b.dataset.p===n));
  window.scrollTo(0,0);
  requestAnimationFrame(()=>{ if(typeof charts!=="undefined") charts.forEach(c=>{try{c.resize();c.update('none');}catch(e){}}); });
}
document.querySelectorAll('#tabbar button').forEach(b=>b.addEventListener('click',()=>showTab(b.dataset.p)));

// ---------- Seleção vs. Lusitanos ----------
function renderTeamCmp(){
  const el=document.getElementById('teamcmp'); if(!el) return;
  const ok=s=>s.type!=='Match' && !s.combined && !s.shortSession;
  const T=TEAMS.map(n=>{const xs=SESSIONS.filter(s=>teamOf(s)===n&&ok(s)), all=SESSIONS.filter(s=>teamOf(s)===n);
    const av=k=>xs.length?xs.reduce((t,x)=>t+x[k],0)/xs.length:null;
    const vs=k=>{const q=xs.filter(x=>x['avg'+k[0].toUpperCase()+k.slice(1)]>0); return q.length?q.reduce((t,x)=>t+x[k]/x['avg'+k[0].toUpperCase()+k.slice(1)],0)/q.length-1:null;};
    return {n,xs,all,rd:av('rd'),hsr:av('hsr'),accel:av('accel'),sp:av('maxSpeed'),vrd:vs('rd'),vhsr:vs('hsr'),vaccel:vs('accel'),matches:all.filter(x=>x.type==='Match').length};});
  const [A,B]=T;
  let h='<b style="font:800 18px var(--font-display);letter-spacing:.04em;text-transform:uppercase">Seleção vs. Lusitanos</b><div class="sub" style="margin-top:2px">Média por treino (sem jogos, dias de 2 sessões nem sessões encurtadas). Cada equipa tem a sua média de grupo, por isso também comparo contigo face ao grupo.</div>';
  if(!B.xs.length){
    h+='<div class="empty" style="margin-top:10px">Ainda não há treinos dos Lusitanos na app ('+A.xs.length+' treinos da Seleção registados). Manda-me os relatórios GPS dos Lusitanos e eu marco-os como <b>Lusitanos</b>: a comparação aparece aqui sozinha e os gráficos passam a poder ser filtrados por equipa.</div>'; el.innerHTML=h; return; }
  const f=(v,fn)=>v==null?'-':fn(v), pc=v=>v==null?'-':(v>=0?'+':'')+Math.round(v*100)+'%';
  const dl=(a,b)=>{ if(a==null||b==null||!a) return '<td></td>'; const p=(b/a-1)*100, c=Math.abs(p)<5?'info':p>0?'good':'warn'; return '<td class="dl t-'+c+'">'+(p>=0?'+':'')+Math.round(p)+'%</td>'; };
  const row=(n,ka,fn,kv)=>'<tr><td>'+n+'</td><td class="v">'+f(A[ka],fn)+'</td><td class="v">'+f(B[ka],fn)+'</td>'+dl(A[ka],B[ka])+'</tr>';
  h+='<div class="scroll" style="margin-top:10px"><table><tr><th>Treino médio</th><th>Seleção</th><th>Lusitanos</th><th>Lus vs. Sel</th></tr>'
   +row('Distância (m)','rd',f0)+row('Corrida rápida (m)','hsr',f0)+row('Acelerações','accel',f0)+row('Vel. máxima (km/h)','sp',f1)
   +'<tr><td>Treinos contados</td><td>'+A.xs.length+'</td><td>'+B.xs.length+'</td><td></td></tr>'
   +'<tr><td>Jogos</td><td>'+A.matches+'</td><td>'+B.matches+'</td><td></td></tr></table></div>'
   +'<div class="sub" style="margin-top:10px"><b>Tu vs. a média do grupo</b> (o mesmo treino, comparado com os colegas)</div>'
   +'<div class="scroll"><table><tr><th>Métrica</th><th>Seleção</th><th>Lusitanos</th></tr>'
   +'<tr><td>Distância</td><td>'+pc(A.vrd)+'</td><td>'+pc(B.vrd)+'</td></tr><tr><td>Corrida rápida</td><td>'+pc(A.vhsr)+'</td><td>'+pc(B.vhsr)+'</td></tr><tr><td>Acelerações</td><td>'+pc(A.vaccel)+'</td><td>'+pc(B.vaccel)+'</td></tr></table></div>';
  el.innerHTML=h;
}

// ---------- carga e recuperação (Hoje) ----------
function renderLoad(){
  const el=document.getElementById('loadcard'); if(!el) return;
  const end=new Date(last.date+'T00:00:00').getTime(), within=d=>SESSIONS.filter(x=>{const t=new Date(x.date+'T00:00:00').getTime();return t<=end && end-t<d*DAY;});
  const a7=within(7), c28=within(28);
  const sum=(xs,k)=>xs.reduce((t,x)=>t+x[k],0);
  const ac=sum(a7,'rd'), ch=sum(c28,'rd')/4, ratio=ch?ac/ch:null;
  const gap=SESSIONS.some(x=>x.gpsGap && end-new Date(x.date+'T00:00:00').getTime()<28*DAY);
  let z; if(ratio==null) z={k:'info',b:'Sem dados',t:''}; else if(ratio>1.5) z={k:'bad',b:'Carga a subir demasiado',t:'Semana muito acima do teu habitual: poupa o próximo treino e recupera bem.'}; else if(ratio>1.3) z={k:'warn',b:'Carga alta',t:'Acima do teu habitual: cuida do sono, da comida e da recuperação.'}; else if(ratio>=0.8) z={k:'good',b:'Zona segura',t:'Carga dentro do que o teu corpo está habituado.'}; else z={k:'info',b:'Carga baixa',t:'Abaixo do habitual: há margem para treinar mais, se te sentires bem.'};
  if(gap) z.t+=' Atenção: houve treinos sem GPS (Agronomia), por isso o valor pode estar subestimado.';
  const heavy=a7.filter(x=>x.rd>HEAVY).length, matches=a7.filter(x=>x.type==='Match').length;
  const goal=MAXREF*0.95, sp=SESSIONS.filter(x=>x.maxSpeed>=goal), lastSp=sp.length?sp[sp.length-1]:null;
  const dsp=lastSp?Math.round((end-new Date(lastSp.date+'T00:00:00').getTime())/DAY):null;
  const wkSp=Math.max(...SESSIONS.filter(x=>x.week===last.week).map(x=>x.maxSpeed));
  const pos=ratio==null?0:Math.max(0,Math.min(100,ratio/1.5*100));
  const dd=Math.round((end-new Date(last.date+'T00:00:00').getTime())/DAY);
  el.innerHTML='<div><span class="tag">7 dias até '+dshort(last.date)+' vs. média semanal das últimas 4 semanas</span></div>'
   +'<div class="light s-'+z.k+'" style="margin-top:0"><small>Estado</small><b class="t-'+z.k+'">'+z.b+(ratio?' · '+ratio.toFixed(2).replace('.',','):'')+'</b><span>'+z.t+'</span></div>'
   +'<div><div class="zone"><i style="left:'+pos.toFixed(1)+'%"></i></div><div class="zl" style="position:relative;height:14px"><span style="position:absolute;left:0">0</span><span style="position:absolute;left:53.3%;transform:translateX(-50%)">0,8</span><span style="position:absolute;left:86.7%;transform:translateX(-50%)">1,3</span><span style="position:absolute;right:0">1,5+</span></div></div>'
   +'<div class="tiles">'
   +'<div><small>Distância nos últimos 7 dias</small><span class="num">'+f1(ac/1000)+' km</span><small>Teu habitual: '+f1(ch/1000)+' km/semana</small></div>'
   +'<div><small>Dias pesados (>3500 m)</small><span class="num">'+heavy+'</span><small>'+(matches?matches+(matches===1?' jogo':' jogos')+' nesta janela':'Sem jogos nesta janela')+'</small></div>'
   +'<div><small>Velocidade máx. da semana</small><span class="num">'+f1(wkSp)+' km/h</span><small>Meta 95%: '+f1(goal)+'</small></div>'
   +'<div><small>Último sprint ≥95%</small><span class="num">'+(lastSp?(dsp===0?'hoje':dsp+' d'):'-')+'</span><small>'+(lastSp?f1(lastSp.maxSpeed)+' km/h · '+dshort(lastSp.date):'ainda nenhum')+'</small></div></div>'
   +'<div class="sub">Como ler: compara a carga dos últimos 7 dias com o que costumas fazer. Entre 0,8 e 1,3 é a zona segura; acima de 1,5 o risco de lesão sobe. É um guia, não uma regra: manda o que sentes e o que o teu S&amp;C decidir.'+(dd>0?' Último GPS há '+dd+' d.':'')+'</div>';
}

renderTeamCmp(); renderLoad(); renderLatest(last); renderKpis(); renderPos(); initWkPick(); renderWeekView(); renderGames(); renderLog();
if (window.Chart) build();
