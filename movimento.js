// ---------- Movimento: "Don't cut. Carry." ----------
// 1) O cartão torna-se a página (o mosaico em que tocas expande para o ecrã que abre).
// 2) Voltar volta mesmo atrás: o botão/gesto de voltar do telemóvel desfaz o movimento e devolve-te ao cartão de onde saíste.
// 3) Os menus nascem do botão que os abriu.
// Respeita "reduzir movimento" do sistema (sem animações).
(function(){
  const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const EASE = 'cubic-bezier(.2,.8,.2,1)';
  const ORDER = ['hoje','semana','evol','jogos','corpo','trofeus','mais'];
  const pgOf = n => document.getElementById('pg-'+n);
  const _show = showTab;
  let cur = ((document.querySelector('.pg.on')||{}).id||'pg-hoje').slice(3);
  const hist = [{p:cur, origin:null, y:0}]; let idx = 0;
  let pendingOrigin = null, detail = null;
  try{ history.replaceState({n:0}, ''); }catch(e){}

  // ---------- CSS ----------
  // estilos: em style.css (secção Movimento)

  // ---------- transições entre páginas ----------
  const clean = () => document.querySelectorAll('.mov').forEach(e=>e.remove());
  const vw = () => innerWidth, vh = () => innerHeight;
  function slide(pg, dir){
    pg.animate([{opacity:0, transform:'translateX('+(dir*28)+'px)'},{opacity:1, transform:'none'}], {duration:240, easing:EASE});
  }
  function bgOf(el){ const c = getComputedStyle(el).backgroundColor; return (!c || c==='rgba(0, 0, 0, 0)' || c==='transparent') ? '#fff' : c; }
  function morphForward(origin, pg){
    const r = origin.getBoundingClientRect(), cs = getComputedStyle(origin);
    const ov = document.createElement('div'); ov.className = 'mov';
    ov.style.cssText = 'left:'+r.left+'px;top:'+r.top+'px;width:'+r.width+'px;height:'+r.height+'px;border-radius:'+cs.borderRadius+';background:'+bgOf(origin);
    document.body.appendChild(ov);
    pg.animate([{opacity:0},{opacity:1}], {duration:260, delay:140, easing:'ease-out', fill:'backwards'});
    const a = ov.animate([{left:r.left+'px',top:r.top+'px',width:r.width+'px',height:r.height+'px',borderRadius:cs.borderRadius,opacity:1},{left:'0px',top:'0px',width:vw()+'px',height:vh()+'px',borderRadius:'0px',opacity:1}], {duration:320, easing:EASE, fill:'forwards'});
    a.onfinish = () => { ov.animate([{opacity:1},{opacity:0}], {duration:160, fill:'forwards'}).onfinish = () => ov.remove(); };
  }
  function morphBack(origin, pg, bg){
    pg.animate([{opacity:0},{opacity:1}], {duration:200, easing:'ease-out', fill:'backwards'});
    const ov = document.createElement('div'); ov.className = 'mov';
    ov.style.cssText = 'left:0;top:0;width:'+vw()+'px;height:'+vh()+'px;background:'+bg;
    document.body.appendChild(ov);
    const r = origin && origin.isConnected ? origin.getBoundingClientRect() : null;
    if(!r || r.bottom < 0 || r.top > vh()){ ov.animate([{opacity:1},{opacity:0}], {duration:200, fill:'forwards'}).onfinish = () => ov.remove(); return; }
    const rad = getComputedStyle(origin).borderRadius;
    const a = ov.animate([{left:'0px',top:'0px',width:vw()+'px',height:vh()+'px',borderRadius:'0px',opacity:1},{left:r.left+'px',top:r.top+'px',width:r.width+'px',height:r.height+'px',borderRadius:rad,opacity:1}], {duration:300, easing:EASE, fill:'forwards'});
    a.onfinish = () => { ov.animate([{opacity:1},{opacity:0}], {duration:140, fill:'forwards'}).onfinish = () => ov.remove(); };
  }

  function nav(name, mode, o){
    if(!pgOf(name) || name===cur) return;
    closeMenus(); clean();
    const from = cur, dir = ORDER.indexOf(name) > ORDER.indexOf(from) ? 1 : -1;
    hist[idx].y = scrollY;
    let origin = null, y = 0;
    if(mode==='push'){
      origin = o && o.origin || null;
      hist.length = idx+1; hist.push({p:name, origin, y:0}); idx++;
      try{ history.pushState({n:idx}, ''); }catch(e){}
    }
    _show(name); cur = name;
    const pg = pgOf(name);
    if(mode==='pop'){ origin = o.origin; y = o.y||0; if(y) scrollTo(0, y); }
    if(reduce()) return;
    if(mode==='push' && origin && origin.isConnected) morphForward(origin, pg);
    else if(mode==='pop' && o.back && origin) morphBack(origin, pg, o.bg || '#fff');
    else slide(pg, dir);
  }
  // quem chama showTab (separadores e atalhos) passa a usar o movimento
  showTab = function(n){ const o = pendingOrigin; pendingOrigin = null; nav(n, 'push', {origin:o}); };
  document.addEventListener('click', e => { const t = e.target.closest && e.target.closest('[data-go]'); if(t) pendingOrigin = t; setTimeout(()=>{ pendingOrigin = null; }, 0); }, true);

  addEventListener('popstate', e => {
    if(detail){ closeDetail(); return; }
    const s = e.state; if(!s || s.n==null || s.n===idx) return;
    const leaving = hist[idx], target = hist[s.n], back = s.n < idx;
    const bg = leaving.origin ? bgOf(leaving.origin) : '#fff';
    idx = s.n;
    nav2(target.p, back, leaving.origin, target.y, bg);
  });
  function nav2(name, back, origin, y, bg){
    // voltar/avançar no histórico do browser: não cria entradas novas
    if(!pgOf(name) || name===cur) return;
    closeMenus(); clean();
    const dir = ORDER.indexOf(name) > ORDER.indexOf(cur) ? 1 : -1;
    _show(name); cur = name;
    const pg = pgOf(name);
    if(y) scrollTo(0, y);
    if(reduce()) return;
    if(back && origin) morphBack(origin, pg, bg); else slide(pg, dir);
  }

  // ---------- atalhos: mosaicos que viram página ----------
  function opener(el, to, label){
    if(!el || el.dataset.go) return;
    el.dataset.go = to; el.classList.add('go'); el.setAttribute('role','link'); el.tabIndex = 0; el.setAttribute('aria-label', label);
    const open = () => { pendingOrigin = el; showTab(to); };
    el.addEventListener('click', open);
    el.addEventListener('keydown', e => { if(e.key==='Enter' || e.key===' '){ e.preventDefault(); open(); } });
  }
  const rs = document.querySelectorAll('#s-resumo .rs-st > div');
  opener(rs[0], 'semana', 'Ver a semana');
  opener(rs[1], 'evol', 'Ver a evolução');
  const mm = document.querySelectorAll('#pg-mais .rsp .g > div');
  opener(mm[2], 'trofeus', 'Ver troféus');

  // ---------- medalha: o cartão vira a página da medalha ----------
  const KEYS = ['speed','four','nine','load'], TN = {gold:'Ouro',silver:'Prata',bronze:'Bronze',base:''};
  function openDetail(card, k){
    if(detail) return;
    const T = window.TROFEUS || {medals:[],streaks:{}};
    const title = card.querySelector('b').textContent, desc = (card.querySelector('p')||{}).textContent || '';
    const ms = T.medals.filter(m=>m.k===k).sort((a,b)=>b.date.localeCompare(a.date));
    const stk = T.streaks && T.streaks[k];
    const svg = card.querySelector('svg.mdl'), big = svg ? svg.cloneNode(true) : document.createElement('span');
    const d = document.createElement('div'); d.className = 'det mov'; d.setAttribute('role','dialog'); d.setAttribute('aria-modal','true'); d.setAttribute('aria-label', title); d.style.pointerEvents = 'auto';
    d.innerHTML = '<div class="dc"><button type="button" class="bk" aria-label="Voltar aos troféus">‹ Troféus</button><div class="hd"><span class="bm"></span><div><h2>'+title+'</h2><div class="sub2">'+(ms.length?ms.length+(ms.length===1?' vez conquistada':' vezes conquistada'):'Ainda por conquistar')+'</div></div></div><p>'+desc+'</p>'
      +(stk?'<div class="st"><b>'+stk.cur+'</b>'+(stk.cur===1?'semana seguida':'semanas seguidas')+(stk.best>stk.cur?' · a tua melhor série foi '+stk.best:'')+'</div>':'')
      +(ms.length?ms.map(m=>'<div class="oc"><b>'+dshort(m.date)+'</b><span>'+(m.note||'')+'<small>Semana '+m.week+'</small></span>'+(TN[m.tier]?'<em>'+TN[m.tier]+'</em>':'<span></span>')+'</div>').join(''):'<div class="oc"><span></span><span>Quando a conquistares, aparece aqui com a data.</span><span></span></div>')+'</div>';
    d.querySelector('.bm').replaceWith(big);
    document.body.appendChild(d); document.body.style.overflow = 'hidden';
    detail = {el:d, card};
    try{ history.pushState({n:idx, d:1}, ''); }catch(e){}
    const content = d.querySelector('.dc');
    if(!reduce()){
      const r = card.getBoundingClientRect(), rad = '12px';
      content.animate([{opacity:0},{opacity:1}], {duration:200, delay:140, fill:'backwards'});
      const a = d.animate([{left:r.left+'px',top:r.top+'px',width:r.width+'px',height:r.height+'px',borderRadius:rad,right:'auto',bottom:'auto'},{left:'0px',top:'0px',width:vw()+'px',height:vh()+'px',borderRadius:'0px',right:'auto',bottom:'auto'}], {duration:320, easing:EASE});
      d.style.left = '0'; d.style.top = '0';
      a.onfinish = () => { d.style.cssText = 'pointer-events:auto'; };
    } else d.style.cssText = 'pointer-events:auto';
    d.querySelector('.bk').focus({preventScroll:true});
    d.querySelector('.bk').addEventListener('click', () => history.back());
  }
  function closeDetail(){
    if(!detail) return;
    const {el, card} = detail; detail = null; document.body.style.overflow = '';
    const done = () => { el.remove(); try{ card.focus({preventScroll:true}); }catch(e){} };
    const r = card.isConnected ? card.getBoundingClientRect() : null;
    if(reduce() || !r || r.bottom < 0 || r.top > vh()){ el.animate([{opacity:1},{opacity:0}], {duration:160, fill:'forwards'}).onfinish = done; return; }
    el.querySelector('.dc').animate([{opacity:1},{opacity:0}], {duration:120, fill:'forwards'});
    el.style.cssText = 'pointer-events:none;left:0;top:0;width:'+vw()+'px;height:'+vh()+'px';
    el.animate([{left:'0px',top:'0px',width:vw()+'px',height:vh()+'px',borderRadius:'0px',opacity:1},{left:r.left+'px',top:r.top+'px',width:r.width+'px',height:r.height+'px',borderRadius:'12px',opacity:1}], {duration:300, easing:EASE, fill:'forwards'}).onfinish = () => { el.animate([{opacity:1},{opacity:0}], {duration:120, fill:'forwards'}).onfinish = done; };
  }
  document.querySelectorAll('#pg-trofeus .md').forEach((card,i)=>{
    const k = card.dataset.k; if(!k) return;
    card.tabIndex = 0; card.setAttribute('role','button'); card.setAttribute('aria-label', 'Abrir '+card.querySelector('b').textContent);
    card.addEventListener('click', () => openDetail(card, k));
    card.addEventListener('keydown', e => { if(e.key==='Enter' || e.key===' '){ e.preventDefault(); openDetail(card, k); } });
  });
  addEventListener('keydown', e => { if(e.key==='Escape'){ if(detail) history.back(); else closeMenus(); } });

  // ---------- menus que nascem do botão ----------
  let openMenu = null;
  function closeMenus(instant){
    if(!openMenu) return;
    const {menu, btn} = openMenu; openMenu = null; btn.setAttribute('aria-expanded','false');
    if(instant || reduce()){ menu.remove(); return; }
    menu.animate([{opacity:1, transform:'scale(1)'},{opacity:0, transform:'scale(.9)'}], {duration:120, easing:'ease-in', fill:'forwards'}).onfinish = () => menu.remove();
  }
  function menuify(sel){
    if(!sel || sel.dataset.menu) return; sel.dataset.menu = '1';
    const wrap = sel.parentNode, btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'mbtn'; btn.setAttribute('aria-haspopup','listbox'); btn.setAttribute('aria-expanded','false');
    const lab = wrap.querySelector('label'); if(lab){ btn.setAttribute('aria-label', lab.textContent+': '+'escolher'); lab.addEventListener('click', ev => { ev.preventDefault(); btn.click(); }); }
    const upd = () => { const o = sel.options[sel.selectedIndex]; btn.innerHTML = '<span>'+(o?o.text:'')+'</span><i>▾</i>'; };
    upd(); sel.classList.add('mhid'); sel.tabIndex = -1; sel.setAttribute('aria-hidden','true'); sel.after(btn);
    sel.addEventListener('change', upd);
    btn.addEventListener('click', () => {
      if(openMenu && openMenu.btn===btn){ closeMenus(); return; }
      closeMenus(true);
      const menu = document.createElement('div'); menu.className = 'mmenu'; menu.setAttribute('role','listbox');
      [...sel.options].forEach((o,i) => { const b = document.createElement('button'); b.type='button'; b.setAttribute('role','option'); b.setAttribute('aria-selected', i===sel.selectedIndex?'true':'false'); b.textContent = o.text; b.addEventListener('click', () => { sel.selectedIndex = i; sel.dispatchEvent(new Event('change',{bubbles:true})); closeMenus(); btn.focus({preventScroll:true}); }); menu.appendChild(b); });
      const top = btn.offsetTop + btn.offsetHeight + 6;
      menu.style.left = btn.offsetLeft+'px'; menu.style.top = top+'px'; menu.style.minWidth = btn.offsetWidth+'px'; menu.style.maxWidth = 'calc(100% - '+btn.offsetLeft+'px)';
      wrap.appendChild(menu); btn.setAttribute('aria-expanded','true'); openMenu = {menu, btn};
      const sc = menu.querySelector('[aria-selected=true]'); if(sc) menu.scrollTop = Math.max(0, sc.offsetTop - 60);
      if(!reduce()) menu.animate([{opacity:0, transform:'scale(.86)'},{opacity:1, transform:'scale(1)'}], {duration:180, easing:EASE});
      (sc || menu.firstElementChild).focus({preventScroll:true});
    });
    wrap.addEventListener('keydown', e => {
      if(!openMenu || openMenu.btn!==btn) return;
      const items = [...openMenu.menu.querySelectorAll('button')], i = items.indexOf(document.activeElement);
      if(e.key==='ArrowDown'){ e.preventDefault(); (items[i+1]||items[0]).focus(); }
      else if(e.key==='ArrowUp'){ e.preventDefault(); (items[i-1]||items[items.length-1]).focus(); }
    });
  }
  menuify(document.getElementById('pick')); menuify(document.getElementById('wkpick'));
  document.addEventListener('pointerdown', e => { if(openMenu && !openMenu.menu.contains(e.target) && !openMenu.btn.contains(e.target)) closeMenus(); });
})();
