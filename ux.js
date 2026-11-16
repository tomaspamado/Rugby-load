// ---------- Princípios de UX e animação aplicados ----------
// Orçamento de tempo (da referência "nunca os faças esperar"): carregar 0,16 s, revelar até 0,7 s, cena até 1,2 s. Lento = esperam; rápido = não vêem.
// Disney: squash & stretch, antecipação, follow through, slow in/out, secundária, timing, exagero, volume.
// UX: Fitts / áreas grandes, Hick, Miller, Doherty (<400 ms), Postel, Jakob, frequência de uso.
(function(){
  const {en: EN, t: T} = I18N;
  const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const SPRING = 'cubic-bezier(.34,1.56,.64,1)';     // slow in/out com ressalto (follow through)
  const EASE = 'cubic-bezier(.2,.8,.2,1)';

  // estilos: em style.css (secção UX)

  // ---- Squash & stretch no ícone do separador (e Jakob: tocar no separador ativo volta ao topo) ----
  document.querySelectorAll('.tabbar button').forEach(b => b.addEventListener('click', () => {
    const wasOn = b.classList.contains('on');
    const ic = b.querySelector('svg'); if(!ic) return;
    if(wasOn){ scrollTo({top:0, behavior: reduce()?'auto':'smooth'}); }
    if(reduce()) return;
    ic.animate([{transform:'scale(1,1)'},{transform:'scale(1.18,.8)',offset:.22},{transform:'scale(.88,1.22)',offset:.5},{transform:'scale(1.06,.96)',offset:.75},{transform:'scale(1,1)'}], {duration:360, easing:EASE});
  }, true));

  // ---- Barra de baixo no iPhone: depois de saltos de scroll ou do teclado, o Safari às vezes deixa-a a meio do ecrã ----
  const tbar = document.getElementById('tabbar');
  let fixQ = 0;
  window.UXFIX = () => { if(!tbar || fixQ) return; fixQ = requestAnimationFrame(() => { fixQ = 0; tbar.style.display = 'none'; void tbar.offsetHeight; tbar.style.display = ''; }); };
  const typing = el => el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) && !/^(button|checkbox|radio|range)$/.test(el.type||'');
  document.addEventListener('focusin', e => { if(typing(e.target)) document.body.classList.add('kb'); });
  document.addEventListener('focusout', e => { if(typing(e.target)) setTimeout(() => { if(!typing(document.activeElement)){ document.body.classList.remove('kb'); UXFIX(); } }, 60); });
  if(window.visualViewport) visualViewport.addEventListener('resize', () => { if(visualViewport.height > innerHeight*.85 && !typing(document.activeElement)){ document.body.classList.remove('kb'); UXFIX(); } });
  addEventListener('pageshow', UXFIX); addEventListener('orientationchange', UXFIX);
  document.addEventListener('visibilitychange', () => { if(!document.hidden) UXFIX(); });

  // ---- Follow through: barras de progresso crescem com ressalto quando a página aparece ----
  function growBars(root){
    if(reduce()) return;
    root.querySelectorAll('.lbar i,.tgb u').forEach(el => {
      const w = el.style.width; if(!w) return;
      el.animate([{width:'0%'},{width:w}], {duration:520, easing:SPRING, delay:60, fill:'backwards'});
    });
  }
  const pages = document.querySelectorAll('.pg');
  const mo = new MutationObserver(ms => ms.forEach(m => { const pg = m.target; if(pg.classList && pg.classList.contains('on')) growBars(pg); }));
  pages.forEach(pg => mo.observe(pg, {attributes:true, attributeFilter:['class']}));
  const cur = document.querySelector('.pg.on'); if(cur) growBars(cur);

  // ---- Folhas grandes (gráficos, estrada de níveis, detalhes): puxar para baixo fecha (o botão Voltar já existe) ----
  function dress(sheet){
    if(sheet.dataset.ux) return; sheet.dataset.ux = '1';
    const dc = sheet.querySelector('.dc'); if(!dc) return;
    sheet.querySelectorAll('.rv,.lg').forEach((el,i) => { el.style.animationDelay = (80+Math.min(i*30,360))+'ms'; });
    let y0 = null, x0 = 0, dy = 0;
    sheet.addEventListener('touchstart', e => { const t = e.touches[0]; if(sheet.scrollTop>0 || e.target.closest('.cbox')){ y0 = null; return; } y0 = t.clientY; x0 = t.clientX; dy = 0; }, {passive:true});
    sheet.addEventListener('touchmove', e => { if(y0==null) return; const t = e.touches[0]; dy = t.clientY - y0; const dx = Math.abs(t.clientX - x0);
      if(dy<=0 || dx>dy*.7){ sheet.style.transform = ''; return; }
      sheet.style.transform = 'translateY('+(dy*.55)+'px)'; sheet.style.opacity = String(Math.max(.4, 1-dy/700)); }, {passive:true});
    sheet.addEventListener('touchend', () => { if(y0==null) return; const d = dy; y0 = null;
      if(d>110){ sheet.style.transform = ''; sheet.style.opacity = ''; history.back(); return; }
      if(!reduce()) sheet.animate([{transform:sheet.style.transform||'none',opacity:sheet.style.opacity||1},{transform:'none',opacity:1}], {duration:300, easing:SPRING});
      sheet.style.transform = ''; sheet.style.opacity = ''; });
  }
  new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(n => { if(n.nodeType===1 && (n.classList.contains('gsheet') || n.classList.contains('det'))) dress(n); }))).observe(document.body, {childList:true});

  // ---- Menus: os itens entram em cascata curta (30 ms), nunca mais de 0,3 s ----
  new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(n => { if(n.nodeType===1 && n.classList.contains('mmenu')) n.querySelectorAll('button').forEach((b,i) => { b.style.animationDelay = Math.min(i*30,150)+'ms'; }); }))).observe(document.body, {childList:true, subtree:true});

  // ---- Doherty: resposta imediata ao guardar os alvos (a página recarrega logo a seguir) ----
  const sv = document.getElementById('tgsave');
  if(sv) sv.addEventListener('click', () => setTimeout(() => {
    let ok = false; try{ ok = sessionStorage.getItem('goTg') === '1'; }catch(e){}
    if(ok){ sv.classList.add('tgbusy'); sv.textContent = T('A guardar…','Saving…'); }
  }, 0));
})();
