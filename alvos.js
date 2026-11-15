// ---------- Alvos semanais: editáveis em Mais > Definições, com estado claro semana a semana ----------
// Guardados no telemóvel (localStorage 'targets'). A velocidade é uma % do máximo pessoal (app.js lê o mesmo valor em spdPct()).
(function(){
  const EN = document.documentElement.lang === 'en';
  const T = (pt,en) => EN ? en : pt;
  const nfx = (v,d) => (EN ? v.toFixed(d) : v.toFixed(d).replace('.',','));
  const withSep = n => EN ? Math.round(n).toLocaleString('en-US') : Math.round(n).toLocaleString('pt-PT').replace(/\s/g,'.');

  // Sugestões a partir das tuas semanas completas (mediana ~ semana normal, arredondada).
  const DEF = {rd:9500, hsr:2500, accel:160, sp:95};
  const KEYS = [
    {k:'rd',    n:T('Distância','Distance'),         u:'km',   min:2,  max:30,  step:.5, to:v=>v/1000, from:v=>v*1000, fmt:v=>nfx(v/1000,1)},
    {k:'hsr',   n:T('Corrida rápida','Fast running'), u:'m',    min:100,max:8000,step:50, to:v=>v,      from:v=>v,      fmt:v=>withSep(v)},
    {k:'accel', n:T('Acelerações','Accelerations'),   u:'',     min:10, max:500, step:5,  to:v=>v,      from:v=>v,      fmt:v=>String(Math.round(v))},
    {k:'sp',    n:T('Velocidade máx.','Top speed'),   u:'% '+T('do máximo','of max'), min:50, max:100, step:1, to:v=>v, from:v=>v, fmt:v=>String(Math.round(v))}
  ];
  const load = () => { try{ const o = JSON.parse(localStorage.getItem('targets')||'{}'); const r = Object.assign({}, DEF); KEYS.forEach(c => { const v = +o[c.k]; if(v>=c.from(c.min) && v<=c.from(c.max)) r[c.k] = v; }); return r; }catch(e){ return Object.assign({}, DEF); } };
  const save = o => { try{ localStorage.setItem('targets', JSON.stringify(o)); return true; }catch(e){ return false; } };
  const goalKmh = o => MAXREF*o.sp/100;

  // valor da semana até ao mesmo dia (semana corrente) ou semana completa
  function weekVal(w){
    const cut = weekCut(w), t = wkTot(w,cut); if(!t) return null;
    const acc = SESSIONS.filter(x=>x.week===w && dow(x.date)<=cut).reduce((a,x)=>a+x.accel,0);
    return {rd:t.rd, hsr:t.hsr, accel:acc, sp:t.sp, n:t.n, open:w===last.week, gap:SESSIONS.some(x=>x.week===w && x.gpsGap)};
  }
  // estado de um indicador: ok / open (semana em curso) / miss / na (sem GPS completo)
  function status(w, k, tg){
    const v = weekVal(w); if(!v) return null;
    tg = tg || load();
    const val = k==='sp' ? v.sp : v[k], goal = k==='sp' ? goalKmh(tg) : tg[k];
    const ok = val >= goal;
    const st = ok ? 'ok' : v.gap ? 'na' : v.open ? 'open' : 'miss';
    return {st, val, goal, left:Math.max(0, goal-val), pct:Math.min(100, val/goal*100), gap:v.gap};
  }
  const WORD = {ok:T('cumprido','met'), miss:T('não cumprido','not met'), open:T('em curso','in progress'), na:T('sem GPS completo','incomplete GPS')};
  const ICON = {ok:'✓', miss:'✕', open:'…', na:'–'};
  const fmtVal = (c, v) => c.k==='sp' ? nfx(v,1) : c.fmt(v);
  const unitOf = c => c.k==='sp' ? 'km/h' : (c.u||'');
  const goalTxt = (c, tg) => c.k==='sp' ? nfx(goalKmh(tg),1)+' km/h' : c.fmt(tg[c.k])+(c.u?' '+c.u:'');
  const leftTxt = (c, s) => c.k==='sp' ? nfx(s.left,1)+' km/h' : (c.k==='rd' ? nfx(s.left/1000,1)+' km' : Math.round(s.left)+(c.u?' '+c.u:''));

  window.TG = {load, status, weekVal, KEYS, WORD, ICON, DEF, goalKmh};

  const css = document.createElement('style');
  css.textContent = ''
   // estado nos quadrados escuros da semana
   +'.rsp .tg{display:block;margin-top:6px;font-size:12px;font-weight:600;opacity:1;line-height:1.3}.rsp .tg.ok{color:#5CC48A}.rsp .tg.miss{color:#F2B84B}.rsp .tg.open{color:#8FB4E8}.rsp .tg.na{color:rgba(255,255,255,.7)}'
   +'.rsp .tgb{display:block;height:4px;border-radius:2px;background:rgba(255,255,255,.14);margin-top:5px;overflow:hidden}.rsp .tgb u{display:block;height:100%;border-radius:2px;background:#8FB4E8;text-decoration:none}.rsp .tgb.ok u{background:#5CC48A}.rsp .tgb.miss u{background:#F2B84B}.rsp .tgb.na u{background:rgba(255,255,255,.4)}'
   +'.rsp .tgsum{display:block;margin-top:10px;font-size:13px;font-weight:600;opacity:1}.rsp .tgsum.ok{color:#5CC48A}.rsp .tgsum.miss{color:#F2B84B}'
   // quadro semana a semana (superfície clara)
   +'.tgt{width:100%;border-collapse:collapse;font-size:13px}.tgt th,.tgt td{padding:7px 4px;text-align:center;border-bottom:1px solid var(--line,#E3E7EC);white-space:nowrap}.tgt th{font-weight:600;font-size:12px;color:var(--ink-muted)}.tgt th:first-child,.tgt td:first-child{text-align:left}'
   +'.tgt td.ok{color:#1F5A2B;font-weight:600}.tgt td.miss{color:#7A5300;font-weight:600}.tgt td.open{color:#2B4F8A;font-weight:600}.tgt td.na{color:var(--ink-muted)}.tgt tr.cur td:first-child{font-weight:700}.tgt small{display:block;font-weight:400;font-size:11px;color:var(--ink-muted)}'
   +'.tgcap{font-size:12px;color:var(--ink-muted);margin-top:8px}'
   // definições
   +'.defs .tgrow{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:4px 12px;align-items:center;padding:10px 0;border-bottom:1px solid var(--line,#E3E7EC)}.defs .tgrow:last-of-type{border-bottom:0}'
   +'.defs .tgrow label{font-weight:600;font-size:15px;min-width:0}.defs .tgrow .hint{grid-column:1/-1;font-size:12px;color:var(--ink-muted)}'
   +'.defs .inp{display:inline-flex;align-items:center;gap:6px}.defs .inp input{width:92px;min-height:44px;box-sizing:border-box;font:inherit;font-size:16px;font-weight:600;text-align:right;padding:6px 10px;border:1px solid var(--line,#C9D0D9);border-radius:8px;background:var(--surface,#fff);color:var(--ink)}'
   +'.defs .inp input:focus-visible{outline:2px solid #D9981A;outline-offset:1px}.defs .inp span{font-size:13px;color:var(--ink-muted);min-width:36px}'
   +'.defs .tgbtns{display:flex;gap:8px;flex-wrap:wrap;margin-top:6px}.defs .tgbtns button{font:inherit;font-size:14px;font-weight:600;min-height:44px;padding:0 16px;border-radius:8px;cursor:pointer;border:1px solid var(--line,#C9D0D9);background:var(--surface,#fff);color:var(--ink)}'
   +'.defs .tgbtns button.pri{background:#0E1A2E;color:#fff;border-color:#0E1A2E}.defs .tgbtns button:focus-visible{outline:2px solid #D9981A;outline-offset:2px}'
   +'.defs .tgmsg{font-size:13px;font-weight:600;color:#1F5A2B;min-height:18px}.defs .tgmsg.err{color:#7A5300}.defs h3{font-size:16px;margin:14px 0 0}';
  document.body.appendChild(css);

  // ---------- Semana: estado em cada quadrado + resumo + quadro ----------
  const wk = document.getElementById('s-wk');
  function decorate(){
    if(!wk) return;
    const panel = wk.querySelector('.rsp'); if(!panel) return;
    const g = panel.querySelector('.g'); if(!g || g.dataset.tg) return;
    const tiles = g.children; if(tiles.length !== 4) return;
    const w = selWeek, tg = load(); let hit = 0, tot = 0, open = false;
    g.dataset.tg = '1';
    KEYS.forEach((c,i) => {
      const s = status(w, c.k, tg); if(!s) return; tot++; if(s.st==='ok') hit++; if(s.st==='open') open = true;
      const el = tiles[i];
      const txt = s.st==='ok' ? ICON.ok+' '+T('Alvo ','Target ')+goalTxt(c,tg)+' · '+WORD.ok
        : s.st==='open' ? ICON.open+' '+T('Alvo ','Target ')+goalTxt(c,tg)+' · '+T('faltam ','')+leftTxt(c,s)+T('',' to go')
        : s.st==='miss' ? ICON.miss+' '+T('Alvo ','Target ')+goalTxt(c,tg)+' · '+T('faltaram ','missed by ')+leftTxt(c,s)
        : ICON.na+' '+T('Alvo ','Target ')+goalTxt(c,tg)+' · '+WORD.na;
      el.insertAdjacentHTML('beforeend', '<small class="tg '+s.st+'">'+txt+'</small><i class="tgb '+s.st+'" aria-hidden="true"><u style="width:'+s.pct.toFixed(0)+'%"></u></i>');
    });
    if(tot){
      const all = hit===tot, cls = all ? 'ok' : (open ? '' : 'miss');
      const lbl = open ? T('Alvos da semana (em curso): ','Weekly targets (in progress): ')+hit+T(' de ',' of ')+tot+T(' cumpridos até agora',' met so far')
                       : T('Alvos da semana: ','Weekly targets: ')+hit+T(' de ',' of ')+tot+T(' cumpridos',' met');
      g.insertAdjacentHTML('beforebegin', '<small class="tgsum '+cls+'">'+(all?'✓ ':'')+lbl+'</small>');
    }
  }
  function histTable(){
    const tg = load(), weeks = [...new Set(SESSIONS.map(x=>x.week))].sort((a,b)=>a-b).reverse();
    const SH = {rd:T('Dist.','Dist.'), hsr:T('Rápida','Fast'), accel:T('Acel.','Acc.'), sp:T('Vel.','Speed')};
    const th = KEYS.map(c => '<th scope="col" title="'+c.n+'">'+SH[c.k]+'<small>'+T('alvo ','target ')+(c.k==='sp'?nfx(goalKmh(tg),1):c.k==='rd'?nfx(tg.rd/1000,1):c.fmt(tg[c.k]))+'</small></th>').join('');
    const rows = weeks.map(w => {
      if(!weekVal(w)) return '';
      const cells = KEYS.map(c => { const s = status(w,c.k,tg); return '<td class="'+s.st+'" aria-label="'+WORD[s.st]+'">'+ICON[s.st]+' '+fmtVal(c,s.val)+'</td>'; }).join('');
      return '<tr'+(w===last.week?' class="cur"':'')+'><td>'+T('S','W')+w+(w===last.week?'<small>'+T('em curso','in progress')+'</small>':'')+'</td>'+cells+'</tr>';
    }).join('');
    return '<div class="scroll"><table class="tgt"><thead><tr><th scope="col">'+T('Semana','Week')+'</th>'+th+'</tr></thead><tbody>'+rows+'</tbody></table></div>'
      +'<div class="tgcap">'+T('Dist. = distância em km, Rápida = corrida rápida em metros, Acel. = acelerações, Vel. = velocidade máx. em km/h. A semana em curso conta só até ao mesmo dia. ✓ cumprido, ✕ não cumprido, … em curso, – semana com treinos sem GPS.','Dist. = distance in km, Fast = fast running in metres, Acc. = accelerations, Speed = top speed in km/h. The current week only counts up to the same weekday. ✓ met, ✕ not met, … in progress, – week with training that had no GPS.')+'</div>';
  }
  function addHist(){
    if(!wk || document.getElementById('tghist')) return;
    const d = document.createElement('details'); d.className = 'fold'; d.id = 'tghist';
    d.innerHTML = '<summary><span>'+T('Alvos semana a semana','Targets week by week')+'</span></summary><div class="tgbody"></div>';
    d.querySelector('.tgbody').innerHTML = histTable();
    const anchor = wk.querySelector('details.fold'); if(anchor) anchor.after(d); else wk.appendChild(d);
  }
  if(wk){
    decorate(); addHist();
    new MutationObserver(() => decorate()).observe(wk, {childList:true, subtree:true});
  }

  // ---------- legenda do gráfico de velocidade no separador Evolução/Hoje (texto fixo do HTML) ----------
  const cs = document.getElementById('cSpd');
  if(cs){ const p = cs.closest('.card') && cs.closest('.card').querySelector('p'); if(p){ const o = load(); p.textContent = T('km/h. Tracejado: máximo pessoal (~33,4). Linha verde: meta semanal de '+o.sp+'% ('+nfx(goalKmh(o),1)+').','km/h. Dashed: personal max (~33.4). Green line: weekly goal of '+o.sp+'% ('+nfx(goalKmh(o),1)+').'); } }

  // ---------- Mais > Definições (idioma + os meus alvos) ----------
  const mp = document.getElementById('pg-mais');
  function buildDefs(){
    if(!mp || document.getElementById('defs')) return;
    const tg = load();
    const s = document.createElement('section'); s.id = 'defs'; s.className = 'defs';
    s.innerHTML = '<h2>'+T('Definições','Settings')+'</h2>'
      +'<div class="card" style="padding:14px 16px"><h3 style="margin-top:0">'+T('Os meus alvos semanais','My weekly targets')+'</h3>'
      +'<div class="sub">'+T('Muda estes valores se o treinador te der outros. Contam por semana (até ao mesmo dia na semana em curso) e aparecem na página Semana.','Change these if your coach gives you different ones. They count per week (up to the same weekday in the current week) and show on the Week page.')+'</div>'
      +KEYS.map(c => '<div class="tgrow"><label for="tg-'+c.k+'">'+c.n+'</label><span class="inp"><input id="tg-'+c.k+'" type="text" inputmode="decimal" autocomplete="off" value="'+(c.k==='rd'?nfx(c.to(tg.rd),1):String(Math.round(tg[c.k])))+'" aria-describedby="tgh-'+c.k+'"><span>'+(c.k==='sp'?'%':c.u)+'</span></span>'
         +'<div class="hint" id="tgh-'+c.k+'">'+(c.k==='sp' ? T('Percentagem do teu máximo pessoal ('+nfx(MAXREF,1)+' km/h). Agora: ','Percentage of your personal max ('+nfx(MAXREF,1)+' km/h). Now: ')+'<b class="spk">'+nfx(goalKmh(tg),1)+' km/h</b>. '+T('Sugerido: ','Suggested: ')+DEF.sp+'%'
            : T('Sugerido: ','Suggested: ')+(c.k==='rd'?nfx(DEF.rd/1000,1):c.fmt(DEF[c.k]))+' '+c.u+' '+T('(uma semana normal tua).','(a normal week for you).'))+'</div></div>').join('')
      +'<div class="tgbtns"><button type="button" class="pri" id="tgsave">'+T('Guardar alvos','Save targets')+'</button><button type="button" id="tgreset">'+T('Repor sugeridos','Reset to suggested')+'</button></div>'
      +'<div class="tgmsg" id="tgmsg" role="status" aria-live="polite"></div></div>'
      +'<div class="card" id="langcard" style="padding:14px 16px"></div>';
    const foot = mp.querySelector('.foot'); foot ? foot.before(s) : mp.appendChild(s);
    // mover o seletor de idioma (criado em traducao.js) para aqui
    const ls = document.getElementById('langseg');
    if(ls){ const lc = s.querySelector('#langcard'); const h = ls.querySelector('h2'); if(h){ const h3 = document.createElement('h3'); h3.style.marginTop = '0'; h3.textContent = h.textContent; h.replaceWith(h3); } while(ls.firstChild) lc.appendChild(ls.firstChild); ls.remove(); lc.id = 'langseg'; }
    const msg = s.querySelector('#tgmsg');
    // Postel: aceita "9,5", "9.5", "9 500", "9.500", "9,5 km", "2500 m", "95%", "31,7 km/h"
    const num = raw => { let t = String(raw).toLowerCase().replace(/[^\d.,]/g,''); if(/^\d{1,3}([.,]\d{3})+$/.test(t)) t = t.replace(/[.,]/g,''); else t = t.replace(',','.'); return parseFloat(t); };
    const read = c => { let v = num(s.querySelector('#tg-'+c.k).value); if(c.k==='rd' && v>=200) v = v/1000; if(c.k==='sp' && v>=20 && v<50) v = Math.round(v/MAXREF*1000)/10; return isFinite(v) ? c.from(v) : NaN; };
    s.querySelector('#tgsave').addEventListener('click', () => {
      const o = {}; let bad = null;
      KEYS.forEach(c => { const v = read(c); if(!(v >= c.from(c.min) && v <= c.from(c.max))) bad = bad || c; else o[c.k] = v; });
      msg.className = 'tgmsg';
      if(bad){ msg.className = 'tgmsg err'; msg.textContent = T('Valor inválido em '+bad.n+': usa um número entre '+(bad.k==='rd'?bad.min+' e '+bad.max+' km':bad.min+' e '+bad.max)+'.','Invalid value for '+bad.n+': use a number between '+bad.min+' and '+bad.max+(bad.k==='rd'?' km':'')+'.'); s.querySelector('#tg-'+bad.k).focus(); return; }
      if(!save(o)){ msg.className = 'tgmsg err'; msg.textContent = T('Não consegui guardar neste navegador.','Could not save in this browser.'); return; }
      try{ sessionStorage.setItem('goMais','1'); sessionStorage.setItem('goTg','1'); }catch(e){} try{ window.name += ';goMais;goTg'; }catch(e){}
      location.reload();
    });
    s.querySelector('#tgreset').addEventListener('click', () => {
      KEYS.forEach(c => { s.querySelector('#tg-'+c.k).value = c.k==='rd' ? nfx(DEF.rd/1000,1) : String(DEF[c.k]); });
      msg.className = 'tgmsg'; msg.textContent = T('Valores sugeridos postos. Carrega em Guardar alvos para aplicar.','Suggested values filled in. Press Save targets to apply.');
    });
    s.querySelector('#tg-sp').addEventListener('input', e => { const v = parseFloat(e.target.value.replace(',','.')); const k = s.querySelector('.spk'); if(k && v>=50 && v<=100) k.textContent = nfx(MAXREF*v/100,1)+' km/h'; });
  }
  buildDefs();

  // depois de guardar: volta à secção e confirma
  let goTg = false; try{ goTg = sessionStorage.getItem('goTg'); sessionStorage.removeItem('goTg'); }catch(e){}
  if(!goTg && /;goTg/.test(window.name||'')) goTg = true;
  try{ window.name = (window.name||'').replace(/;goTg/g,''); }catch(e){}
  if(goTg) addEventListener('DOMContentLoaded', () => { try{ const d = document.getElementById('defs'); if(d){ d.scrollIntoView({block:'start'}); const m = d.querySelector('#tgmsg'); m.textContent = T('✓ Alvos guardados.','✓ Targets saved.'); } }catch(e){} });
})();
