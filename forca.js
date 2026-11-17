// ---------- Força relativa: cargas do ginásio vs. os teus objetivos (múltiplos do peso) ----------
// Objetivos que deste: power clean 1,5×, single-leg squat 1,5×, front squat 2,0×, clean pull 2,2× o peso.
// Cada série guarda kg e repetições; o máximo (1RM) é estimado pela fórmula de Epley: kg × (1 + reps/30), exato com 1 repetição.
// O peso é a média de 7 dias da balança (se houver pesagens recentes), senão a última medição da nutricionista.
// Guarda só no telemóvel ('strength_log', 'strength_goals'); entra na cópia de segurança.
(function(){
  const {en: EN, t: T} = I18N;
  const KEY = 'strength_log', GKEY = 'strength_goals';
  const LIFTS = [
    {k:'pc',  n:T('Power clean','Power clean'),             g:1.5},
    {k:'sls', n:T('Agachamento a 1 perna','Single-leg squat'), g:1.5},
    {k:'fs',  n:T('Front squat','Front squat'),             g:2.0},
    {k:'cp',  n:T('Clean pull','Clean pull'),               g:2.2}
  ];
  const ld = (k,d) => { try{ const v = JSON.parse(localStorage.getItem(k)); return v==null ? d : v; }catch(e){ return d; } };
  const sv = (k,v) => { try{ localStorage.setItem(k, JSON.stringify(v)); return true; }catch(e){ return false; } };
  if(window.REG && REG.KEYS) [KEY, GKEY].forEach(k => { if(!REG.KEYS.includes(k)) REG.KEYS.push(k); });
  const load = () => (ld(KEY, [])||[]).filter(x => x && x.date && x.kg>0 && x.reps>0 && LIFTS.some(l=>l.k===x.l));
  const goals = () => { const g = ld(GKEY, {}) || {}; return Object.fromEntries(LIFTS.map(l => [l.k, +g[l.k] > 0 ? +g[l.k] : l.g])); };
  const iso = d => d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  const nfx = (v,d) => v==null || isNaN(v) ? '–' : (EN ? v.toFixed(d) : v.toFixed(d).replace('.',','));
  const num = v => { const n = parseFloat(String(v).replace(/\s/g,'').replace(',','.')); return isFinite(n) ? n : NaN; };
  const e1rm = x => x.reps===1 ? x.kg : x.kg*(1+x.reps/30);
  const bw = () => (window.SCALE && SCALE.weight()) || ((typeof BODY!=='undefined' && BODY.length) ? BODY[BODY.length-1].weight : 80);
  const bwSrc = () => (window.SCALE && SCALE.weight()) ? T('média de 7 dias da balança','7-day scale average') : T('última medição da nutricionista','last nutritionist measurement');

  const corpo = document.getElementById('pg-corpo'); if(!corpo) return;
  const wrap = document.createElement('section'); wrap.id = 's-forca';
  (document.getElementById('s-balanca') || document.getElementById('s-corpo')).after(wrap);
  let lift = 'pc';

  function render(){
    const L = load(), G = goals(), W = bw(), today = iso(new Date());
    const cut = new Date(); cut.setDate(cut.getDate()-90); const c90 = iso(cut);
    const best = k => { const xs = L.filter(x => x.l===k && x.date>=c90 && x.reps<=10); if(!xs.length) return null; return xs.reduce((a,x) => e1rm(x)>e1rm(a) ? x : a); };
    const rows = LIFTS.map(l => { const b = best(l.k), r = b ? e1rm(b)/W : null; return {l, b, r, g:G[l.k], gap: b ? Math.max(0, G[l.k]*W - e1rm(b)) : null}; });
    const done = rows.filter(x => x.r!=null && x.r>=x.g).length, have = rows.filter(x => x.r!=null).length;
    let h = '<h2>'+T('Força relativa','Relative strength')+'</h2><div class="sub">'+T('O teu máximo estimado a dividir pelo peso, contra os teus objetivos. Peso usado: ','Your estimated max divided by bodyweight, against your goals. Weight used: ')+nfx(W,1)+' kg ('+bwSrc()+').</div>';
    h += '<div class="rsp"><small>'+(have ? T('Últimos 90 dias','Last 90 days') : T('Ainda sem séries registadas','No sets logged yet'))+'</small><div class="rt">'+(have ? done+T(' de 4 objetivos',' of 4 goals') : T('Regista a primeira série','Log your first set'))+'</div>'
      +'<div class="g fc-g">'+rows.map(x => '<div><small>'+x.l.n+'</small><b>'+(x.r!=null ? nfx(x.r,2)+'<em>×</em>' : '–')+'</b>'
        +'<div class="fc-bar" role="img" aria-label="'+x.l.n+': '+(x.r!=null?nfx(x.r,2):'–')+' de '+nfx(x.g,1)+'"><i style="width:'+(x.r!=null?Math.min(100, x.r/x.g*100).toFixed(1):0)+'%"></i></div>'
        +'<small class="'+(x.r!=null && x.r>=x.g ? 'up' : '')+'">'+(x.r==null ? T('alvo ','goal ')+nfx(x.g,1)+'×' : x.r>=x.g ? T('✓ alvo ','✓ goal ')+nfx(x.g,1)+'×' : T('alvo ','goal ')+nfx(x.g,1)+'× · '+T('faltam ~','~')+Math.ceil(x.gap)+' kg'+T('',' to go'))+'</small></div>').join('')+'</div>'
      +'<small>'+T('Máximo estimado a partir de séries até 10 repetições (fórmula de Epley); com 1 a 5 repetições é mais fiável.','Max estimated from sets of up to 10 reps (Epley formula); 1 to 5 reps is more reliable.')+'</small></div>';
    // registar
    h += '<details class="fold" id="fc-add"'+(L.length?'':' open')+'><summary><span>'+T('Registar uma série','Log a set')+'</span></summary><div class="card frm">'
      +'<div class="seg fc-lifts" role="group" aria-label="'+T('Exercício','Lift')+'">'+LIFTS.map(l => '<button type="button" data-fl="'+l.k+'" aria-pressed="'+(lift===l.k)+'">'+l.n+'</button>').join('')+'</div>'
      +'<div class="fr2"><label>'+T('Carga (kg)','Load (kg)')+'<input id="fc-kg" inputmode="decimal" autocomplete="off"></label><label>'+T('Repetições','Reps')+'<input id="fc-reps" inputmode="numeric" value="1" autocomplete="off"></label></div>'
      +'<div class="fr2"><label>'+T('Data','Date')+'<input type="date" id="fc-date" value="'+today+'" max="'+today+'"></label><span></span></div>'
      +'<div class="tgbtns"><button type="button" class="pri" id="fc-save">'+T('Guardar série','Save set')+'</button></div><div class="tgmsg" id="fc-msg" role="status" aria-live="polite"></div></div></details>';
    // objetivos e histórico
    h += '<details class="fold"><summary><span>'+T('Objetivos (× o peso)','Goals (× bodyweight)')+'</span></summary><div class="card frm">'
      +'<div class="fr2">'+LIFTS.map(l => '<label>'+l.n+'<input data-fg="'+l.k+'" inputmode="decimal" value="'+nfx(G[l.k],1)+'"></label>').join('')+'</div>'
      +'<div class="tgbtns"><button type="button" class="pri" id="fc-gsave">'+T('Guardar objetivos','Save goals')+'</button></div><div class="tgmsg" id="fc-gmsg" role="status" aria-live="polite"></div></div></details>';
    if(L.length){
      const rs = L.slice().sort((a,b) => b.date.localeCompare(a.date)).slice(0, 40);
      h += '<details class="fold" id="fc-hist"><summary><span>'+T('Séries registadas','Logged sets')+' ('+L.length+')</span></summary><div class="card"><div class="scroll"><table class="bt"><tr><th>'+T('Data','Date')+'</th><th>'+T('Exercício','Lift')+'</th><th>kg × reps</th><th>'+T('Máx. est.','Est. max')+'</th><th></th></tr>'
        +rs.map(x => '<tr><td>'+dshort(x.date)+'</td><td>'+LIFTS.find(l=>l.k===x.l).n+'</td><td>'+nfx(x.kg,1)+' × '+x.reps+'</td><td>'+Math.round(e1rm(x))+' kg</td><td><button type="button" class="bal-del" data-fdel="'+x.id+'" aria-label="'+T('Apagar série','Delete set')+'">✕</button></td></tr>').join('')
        +'</table></div></div></details>';
    }
    wrap.innerHTML = h;
  }

  wrap.addEventListener('click', e => {
    const fl = e.target.closest('[data-fl]'); if(fl){ lift = fl.dataset.fl; wrap.querySelectorAll('[data-fl]').forEach(b => b.setAttribute('aria-pressed', b===fl)); return; }
    const del = e.target.closest('[data-fdel]'); if(del){ if(del.dataset.sure!=='1'){ del.dataset.sure = '1'; del.textContent = T('Apagar?','Delete?'); return; }
      sv(KEY, load().filter(x => String(x.id)!==del.dataset.fdel)); render(); const hh = document.getElementById('fc-hist'); if(hh) hh.open = true; return; }
    if(e.target.closest('#fc-save')){
      const q = id => wrap.querySelector('#fc-'+id), msg = q('msg'), kg = num(q('kg').value), reps = Math.round(num(q('reps').value)), date = q('date').value;
      if(!(kg>0 && kg<=400)){ msg.className = 'tgmsg err'; msg.textContent = T('Põe a carga em kg (até 400).','Enter the load in kg (up to 400).'); return; }
      if(!(reps>=1 && reps<=20)){ msg.className = 'tgmsg err'; msg.textContent = T('Repetições entre 1 e 20.','Reps between 1 and 20.'); return; }
      if(!date){ msg.className = 'tgmsg err'; msg.textContent = T('Escolhe a data.','Pick the date.'); return; }
      const L = load(); L.push({id:Date.now(), date, l:lift, kg, reps});
      if(!sv(KEY, L)){ msg.className = 'tgmsg err'; msg.textContent = T('Não consegui guardar neste navegador.','Could not save in this browser.'); return; }
      render(); const a = document.getElementById('fc-add'); if(a){ a.open = true; const m = a.querySelector('#fc-msg'); m.className = 'tgmsg'; m.textContent = T('✓ Série guardada. Máximo estimado: ','✓ Set saved. Estimated max: ')+Math.round(e1rm({kg, reps}))+' kg'+(reps>10?T(' (com mais de 10 repetições não entra no máximo)',' (over 10 reps it does not count for the max)'):'')+'.'; }
      return;
    }
    if(e.target.closest('#fc-gsave')){
      const g = {}; let bad = false;
      wrap.querySelectorAll('[data-fg]').forEach(i => { const v = num(i.value); if(v>0.3 && v<5) g[i.dataset.fg] = v; else bad = true; });
      const msg = wrap.querySelector('#fc-gmsg');
      if(bad){ msg.className = 'tgmsg err'; msg.textContent = T('Cada objetivo entre 0,3 e 5 vezes o peso.','Each goal between 0.3 and 5 times bodyweight.'); return; }
      sv(GKEY, g); render(); const m = wrap.querySelector('#fc-gmsg'); if(m){ m.closest('details').open = true; m.className = 'tgmsg'; m.textContent = T('✓ Objetivos guardados.','✓ Goals saved.'); }
    }
  });
  render();
  window.FORCA = {render};
})();
