// ---------- Corpo em 3 separadores: Peso (balança de casa) · Força (ginásio) · Nutricionista (medição ISAK) ----------
// Uma coisa de cada vez em vez de uma página muito comprida. Abre no Peso (o que usas todos os dias).
// Na medição da nutricionista, os quadrados repetidos saem e as barras do Σ8 e do LMI ficam num bloco que abre.
(function(){
  const {t: T} = I18N;
  function setup(){
    const pg = document.getElementById('pg-corpo'); if(!pg) return;
    const $ = id => document.getElementById(id);
    const G = {peso:['s-balanca'], forca:['s-forca'], nutri:['s-corpo','s-isak']};
    const first = $('s-corpo'); if(!first) return;
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
  if(document.readyState==='loading') addEventListener('DOMContentLoaded', setup); else setup();
})();
