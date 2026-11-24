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

  // ---- Coach: a linha de separadores mantém o deslocamento lateral ao trocar de separador ----
  // (o Coach redesenha a página ao tocar num separador; guarda-se o deslocamento antes e repõe-se depois)
  let segX = null;
  document.addEventListener('click', e => { const sg = e.target.closest && e.target.closest('#pg-coach .cseg'); segX = sg ? sg.scrollLeft : null; }, true);
  document.addEventListener('click', () => {
    if(segX==null) return; const sg = document.querySelector('#pg-coach .cseg'), x = segX; segX = null; if(!sg) return;
    sg.scrollLeft = x; const on = sg.querySelector('[aria-pressed="true"]'); if(!on) return;
    const l = on.offsetLeft - sg.offsetLeft, r = l + on.offsetWidth, pad = 16;   // se o escolhido ficar cortado, desliza só o necessário
    if(l < sg.scrollLeft) sg.scrollLeft = Math.max(0, l - pad); else if(r > sg.scrollLeft + sg.clientWidth) sg.scrollLeft = r - sg.clientWidth + pad;
  });

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
  // ---------- 20 detalhes de UX (lista "que fazem uma app parecer cara"): os que fazem sentido numa app de telemóvel sem login ----------
  // Estilos pequenos: números tabulares, títulos equilibrados, áreas de toque maiores, esqueleto enquanto o gráfico desenha, cantos contínuos onde o navegador deixa.
  const css = document.createElement('style');
  css.textContent = [
    // 16. números tabulares: os algarismos ficam alinhados e não "saltam" quando mudam
    '.gv,.gr,.big2,.rs-st b,.tt b,.chip,.tiles,.arow,.mp-card,td,.rk,.gsheet .r1,.gsheet .r4{font-variant-numeric:tabular-nums}',
    // 17. títulos equilibrados: sem uma palavra sozinha na última linha
    'h3,.rt,.cvd,.tag,.mh b{text-wrap:balance}',
    // 13. hit slop: a área de toque é maior do que o desenho
    '.gsheet .bk{position:relative}.gsheet .bk::after{content:"";position:absolute;inset:-6px -10px}',
    '.gsheet .sd button{min-width:44px}',
    // 1. esqueleto: enquanto o gráfico ainda não desenhou, a caixa pulsa em vez de ficar vazia
    '.cbox:has(>canvas:not([style])),.cv:has(>canvas:not([style])){border-radius:12px;animation:ux-sk 1.1s ease-in-out infinite alternate}',
    '@keyframes ux-sk{from{background-color:rgba(127,127,127,.08)}to{background-color:rgba(127,127,127,.2)}}',
    '@media (prefers-reduced-motion: reduce){.cbox,.cv{animation:none!important}}',
    // 18. cantos contínuos (squircle) onde o navegador suporta; no resto fica o canto redondo de sempre
    '@supports (corner-shape: squircle){.card,.chip,.tt,.mp-card,.gsheet .seg button,.seg button,.ctoast{corner-shape:squircle}}',
    // 5. toast com Desfazer
    '.ctoast.ux-undo{display:flex;align-items:center;gap:14px}.ctoast.ux-undo button{min-height:44px;padding:0 14px;border:0;border-radius:999px;background:#fff;color:#0E1A2E;font:700 14px Inter,system-ui,sans-serif}'
  ].join('');
  document.head.appendChild(css);

  // 5. Desfazer depois de apagar: guarda uma cópia dos registos no toque em "Apagar"; se algo mudou, mostra um toast com Desfazer (6 s).
  // Funciona também quando a página recarrega depois de apagar (a cópia fica na sessão durante 15 s).
  const DEL = '[data-del],[data-delb],[data-fdel],[data-jdel],[data-act="cdel"]';
  const snap = () => { const o = {}; try{ for(let i=0;i<localStorage.length;i++){ const k = localStorage.key(i); o[k] = localStorage.getItem(k); } }catch(e){} return o; };
  const differs = a => { const b = snap(); return Object.keys(a).some(k => a[k]!==b[k]) || Object.keys(b).some(k => !(k in a)); };
  const undoToast = () => {
    let u = null; try{ u = JSON.parse(sessionStorage.getItem('ux_undo')||'null'); }catch(e){}
    if(!u || Date.now()-u.t > 15000 || !differs(u.s)){ return; }
    document.querySelectorAll('.ux-undo').forEach(x => x.remove());
    const el = document.createElement('div'); el.className = 'ctoast ux-undo'; el.setAttribute('role','status');
    el.innerHTML = '<span>'+T('Apagado.','Deleted.')+'</span><button type="button">'+T('Desfazer','Undo')+'</button>';
    document.body.appendChild(el);
    const kill = setTimeout(() => { el.remove(); try{ sessionStorage.removeItem('ux_undo'); }catch(e){} }, 6000);
    el.querySelector('button').addEventListener('click', () => { clearTimeout(kill);
      try{ const now = snap(); Object.keys(now).forEach(k => { if(!(k in u.s)) localStorage.removeItem(k); }); Object.keys(u.s).forEach(k => localStorage.setItem(k, u.s[k])); sessionStorage.removeItem('ux_undo'); }catch(e){}
      location.reload(); });
  };
  document.addEventListener('click', e => { const b = e.target.closest && e.target.closest(DEL); if(!b) return;
    // nos botões que pedem confirmação ("Apagar?"), só o segundo toque apaga
    if((b.dataset.fdel || b.dataset.jdel) && b.dataset.sure!=='1') return;
    try{ sessionStorage.setItem('ux_undo', JSON.stringify({t:Date.now(), s:snap()})); }catch(e){}
    setTimeout(undoToast, 120); }, true);
  addEventListener('DOMContentLoaded', () => setTimeout(undoToast, 300));

  // 19. idempotência: um segundo toque em Guardar (antes de a página recarregar) não grava duas vezes
  const lastTap = new WeakMap();
  document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('button.pri,#tgsave'); if(!b) return;
    const t = lastTap.get(b) || 0, now = Date.now();
    if(now - t < 1500){ e.stopImmediatePropagation(); e.preventDefault(); return; }
    lastTap.set(b, now); }, true);
})();
