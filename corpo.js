// ---------- Corpo em 3 separadores: Peso (balança de casa) · Força (ginásio) · Nutricionista (medição ISAK) ----------
// Uma coisa de cada vez em vez de uma página muito comprida. Abre no Peso (o que usas todos os dias).
// Na medição da nutricionista, os quadrados repetidos saem e as barras do Σ8 e do LMI ficam num bloco que abre.
(function(){
  const {t: T} = I18N;
  function setup(){
    const pg = document.getElementById('pg-corpo'); if(!pg) return;
    const $ = id => document.getElementById(id);
    const G = {peso:['s-balanca'], forca:['s-forca','s-salto'], nutri:['s-corpo','s-isak']};
    const first = $('s-corpo'); if(!first) return;
    salto();
    // medição da nutricionista: menos repetição
    const bc = $('bodycard');
    if(bc && !bc.dataset.slim){
      bc.dataset.slim = '1';
      bc.querySelectorAll(':scope > .tag, :scope > .btiles').forEach(e => e.hidden = true);
      const bz = [...bc.querySelectorAll(':scope > .bz')];
      if(bz.length){ const d = document.createElement('details'); d.className = 'more'; d.innerHTML = '<summary>'+T('Ver Σ8 e LMI em detalhe','See Σ8 and LMI in detail')+'</summary>';
        bz[0].before(d); bz.forEach(e => d.appendChild(e)); }
      const todo = bc.querySelector(':scope > .todo'); if(todo){ const t = bc.querySelector(':scope > details'); if(t) t.before(todo); }
      if(todo) bc.insertBefore(todo, bc.firstChild);
    }
    const seg = document.createElement('div'); seg.className = 'seg corpo-tabs'; seg.setAttribute('role','tablist'); seg.setAttribute('aria-label', T('Corpo','Body'));
    seg.innerHTML = [['peso',T('Peso','Weight')],['forca',T('Força','Strength')],['nutri',T('Nutricionista','Nutritionist')]]
      .map(([k,l]) => '<button type="button" role="tab" data-ct="'+k+'">'+l+'</button>').join('');
    first.before(seg);
    let cur = 'peso'; try{ cur = sessionStorage.getItem('corpoTab') || 'peso'; }catch(e){}
    const show = k => { cur = k; Object.entries(G).forEach(([g, ids]) => ids.forEach(id => { const el = $(id); if(el) el.hidden = g!==k; }));
      seg.querySelectorAll('[data-ct]').forEach(b => { b.setAttribute('aria-selected', b.dataset.ct===k); b.setAttribute('aria-pressed', b.dataset.ct===k); });
      try{ sessionStorage.setItem('corpoTab', k); }catch(e){} };
    seg.addEventListener('click', e => { const b = e.target.closest('[data-ct]'); if(b) show(b.dataset.ct); });
    show(cur);
    // ligações de outras páginas (ex.: "ver na balança" depois da pesagem da manhã) abrem primeiro o separador certo
    const tabOf = el => Object.keys(G).find(g => G[g].some(id => { const s = $(id); return s && (s===el || s.contains(el)); }));
    const orig = Element.prototype.scrollIntoView;
    Element.prototype.scrollIntoView = function(){ try{ if(pg.contains(this)){ const k = tabOf(this); if(k && k!==cur) show(k); } }catch(e){} return orig.apply(this, arguments); };
    window.CORPO_TAB = show;
  }
  // ---------- Salto vertical (CMJ nas plataformas de força), no separador Força ----------
  // Guarda 'jump_log' [{id,date,cm}] e 'jump_goal' (cm, por defeito 55). Primeiro registo: 51,7 cm a 18/11/2026.
  function salto(){
    const {en: EN} = I18N;
    if(document.getElementById('s-salto')) return;
    const KEY = 'jump_log', GK = 'jump_goal';
    const ld = (k,d) => { try{ const v = JSON.parse(localStorage.getItem(k)); return v==null ? d : v; }catch(e){ return d; } };
    const sv = (k,v) => { try{ localStorage.setItem(k, JSON.stringify(v)); return true; }catch(e){ return false; } };
    if(window.REG && REG.KEYS) [KEY, GK].forEach(k => { if(!REG.KEYS.includes(k)) REG.KEYS.push(k); });
    try{ if(!localStorage.getItem('jump_seed1')){ const L = ld(KEY, []) || []; if(!L.some(x => x.date==='2026-11-18' && +x.cm===51.7)) L.push({id:1763467200001, date:'2026-11-18', cm:51.7}); sv(KEY, L); localStorage.setItem('jump_seed1','1'); } }catch(e){}
    const nfx = (v,d) => v==null || isNaN(v) ? '–' : (EN ? v.toFixed(d) : v.toFixed(d).replace('.',','));
    const num = v => { const n = parseFloat(String(v).replace(/\s/g,'').replace(',','.')); return isFinite(n) ? n : NaN; };
    const iso = d => d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
    const load = () => (ld(KEY, []) || []).filter(x => x && x.date && x.cm>0).sort((a,b) => a.date.localeCompare(b.date));
    const goal = () => { const g = +ld(GK, 55); return g>10 && g<120 ? g : 55; };
    const anchor = document.getElementById('s-forca'); if(!anchor) return;
    const sec = document.createElement('section'); sec.id = 's-salto'; anchor.after(sec);
    const spark = L => { if(L.length < 2) return ''; const W = 300, H = 50, vs = L.map(x => x.cm), g = goal(), mn = Math.min(...vs, g)-1, mx = Math.max(...vs, g)+1, X = i => 6+i*(W-12)/(L.length-1), Y = v => H-4-(v-mn)/(mx-mn)*(H-8);
      return '<svg class="sj-sp" viewBox="0 0 '+W+' '+H+'" preserveAspectRatio="none" role="img" aria-label="'+T('Evolução do salto','Jump trend')+'"><line x1="0" x2="'+W+'" y1="'+Y(g).toFixed(1)+'" y2="'+Y(g).toFixed(1)+'" stroke="rgba(255,255,255,.4)" stroke-dasharray="4 4"/><path d="'+L.map((x,i)=>(i?'L':'M')+X(i).toFixed(1)+' '+Y(x.cm).toFixed(1)).join(' ')+'" fill="none" stroke="#fff" stroke-width="2" vector-effect="non-scaling-stroke"/>'+L.map((x,i)=>'<circle cx="'+X(i).toFixed(1)+'" cy="'+Y(x.cm).toFixed(1)+'" r="3" fill="'+(i===L.length-1?'#D9981A':'#fff')+'"/>').join('')+'</svg>'; };
    function render(){
      const L = load(), g = goal(), last = L[L.length-1], best = L.length ? Math.max(...L.map(x => x.cm)) : null, prev = L[L.length-2];
      const pct = last ? Math.min(100, last.cm/g*100) : 0;
      let h = '<h2>'+T('Salto (CMJ)','Jump (CMJ)')+'</h2><div class="sub">'+T('Salto com contramovimento nas plataformas de força.','Countermovement jump on the force plates.')+'</div>'
        +'<div class="rsp"><small>'+(last ? T('Último · ','Latest · ')+dshort(last.date) : T('Ainda sem saltos registados','No jumps logged yet'))+'</small>'
        +'<div class="sj-big"><b>'+(last ? nfx(last.cm,1) : '–')+'</b><em>cm</em>'+(prev ? '<span class="'+(last.cm>=prev.cm?'up':'dn')+'">'+(last.cm>=prev.cm?'+':'−')+nfx(Math.abs(last.cm-prev.cm),1)+' cm</span>' : '')+'</div>'
        +'<div class="fc-bar" role="img" aria-label="'+(last?nfx(last.cm,1):'–')+' de '+nfx(g,1)+' cm"><i style="width:'+pct.toFixed(1)+'%"></i></div>'
        +'<small class="'+(last && last.cm>=g ? 'up' : '')+'">'+(last ? (last.cm>=g ? T('✓ alvo ','✓ goal ')+nfx(g,1)+' cm' : T('alvo ','goal ')+nfx(g,1)+' cm · '+T('faltam ','')+nfx(g-last.cm,1)+' cm'+T('',' to go')) : T('alvo ','goal ')+nfx(g,1)+' cm')+(best && L.length>1 ? ' · '+T('melhor ','best ')+nfx(best,1)+' cm' : '')+'</small>'
        +spark(L)+'</div>'
        +'<details class="fold" id="sj-add"><summary><span>'+T('Registar um salto','Log a jump')+'</span></summary><div class="card frm">'
        +'<div class="fr2"><label>'+T('Altura (cm)','Height (cm)')+'<input id="sj-cm" inputmode="decimal" autocomplete="off"></label><label>'+T('Data','Date')+'<input type="date" id="sj-date" value="'+iso(new Date())+'" max="'+iso(new Date())+'"></label></div>'
        +'<div class="fr2"><label>'+T('Alvo (cm)','Goal (cm)')+'<input id="sj-goal" inputmode="decimal" value="'+nfx(g,1)+'"></label><span></span></div>'
        +'<div class="tgbtns"><button type="button" class="pri" id="sj-save">'+T('Guardar','Save')+'</button></div><div class="tgmsg" id="sj-msg" role="status" aria-live="polite"></div></div></details>'
        +(L.length ? '<details class="fold" id="sj-hist"><summary><span>'+T('Saltos registados','Logged jumps')+' ('+L.length+')</span></summary><div class="card"><div class="scroll"><table class="bt"><tr><th>'+T('Data','Date')+'</th><th>cm</th><th></th></tr>'
          +L.slice().reverse().map(x => '<tr><td>'+dshort(x.date)+'</td><td>'+nfx(x.cm,1)+'</td><td><button type="button" class="bal-del" data-jdel="'+x.id+'" aria-label="'+T('Apagar salto','Delete jump')+'">✕</button></td></tr>').join('')+'</table></div></div></details>' : '');
      sec.innerHTML = h;
    }
    sec.addEventListener('click', e => {
      const del = e.target.closest('[data-jdel]'); if(del){ if(del.dataset.sure!=='1'){ del.dataset.sure = '1'; del.textContent = T('Apagar?','Delete?'); return; }
        sv(KEY, load().filter(x => String(x.id)!==del.dataset.jdel)); render(); const hh = document.getElementById('sj-hist'); if(hh) hh.open = true; return; }
      if(!e.target.closest('#sj-save')) return;
      const q = id => sec.querySelector('#sj-'+id), msg = q('msg'), cm = num(q('cm').value), date = q('date').value, g = num(q('goal').value);
      if(!(g>10 && g<120)){ msg.className = 'tgmsg err'; msg.textContent = T('Alvo entre 10 e 120 cm.','Goal between 10 and 120 cm.'); return; }
      const hasCm = q('cm').value.trim()!=='';
      if(hasCm && !(cm>5 && cm<120)){ msg.className = 'tgmsg err'; msg.textContent = T('Altura entre 5 e 120 cm.','Height between 5 and 120 cm.'); return; }
      if(hasCm && !date){ msg.className = 'tgmsg err'; msg.textContent = T('Escolhe a data.','Pick the date.'); return; }
      sv(GK, g); if(hasCm){ const L = load(); L.push({id:Date.now(), date, cm}); sv(KEY, L); }
      render(); const a = document.getElementById('sj-add'); if(a){ a.open = true; const m = a.querySelector('#sj-msg'); m.className = 'tgmsg'; m.textContent = hasCm ? T('✓ Salto guardado.','✓ Jump saved.') : T('✓ Alvo guardado.','✓ Goal saved.'); }
    });
    render();
  }
  if(document.readyState==='loading') addEventListener('DOMContentLoaded', setup); else setup();
})();
