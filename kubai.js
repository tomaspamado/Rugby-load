// ---------- Ícones Kubai (MIT, https://icons.kubai.design) na barra de separadores ----------
// Carrega só os 7 ícones da barra a partir do jsDelivr (versão fixa). Sem rede, ficam os ícones antigos.
// Os ícones mexem-se: ao abrir o separador, ao tocar (também no que já está aberto) e ao passar o rato no computador.
(function(){
  const B = 'https://cdn.jsdelivr.net/npm/kubai-icons@0.11.0/dist/';
  const MAP = {hoje:'home', semana:'calendar-week', evol:'chart-line', jogos:'whistle', coach:'heart-pulse', trofeus:'medal', mais:'menu'};
  const go = () => {
    const bar = document.getElementById('tabbar'); if(!bar) return;
    const keys = Object.keys(MAP);
    Promise.all([import(B+'api.js'), ...keys.map(k => import(B+'icons/'+MAP[k]+'.js'))]).then(([api, ...mods]) => {
      const ctl = [];
      keys.forEach((k, i) => {
        const b = bar.querySelector('button[data-p="'+k+'"]'), old = b && b.querySelector('svg'); if(!old) return;
        const svg = api.createIcon(mods[i].default, {size:26, trigger:'none'});
        svg.classList.add('ki'); svg.setAttribute('aria-hidden','true'); old.replaceWith(svg);
        const c = svg.kubai; if(!c) return; ctl.push([b, c]);
        b.addEventListener('pointerdown', () => { c.hover(false, true); requestAnimationFrame(() => requestAnimationFrame(() => c.hover(true))); });
        b.addEventListener('pointerenter', e => { if(e.pointerType==='mouse') c.hover(true); });
        b.addEventListener('pointerleave', e => { if(e.pointerType==='mouse' && !b.classList.contains('on')) c.hover(false); });
      });
      const sync = instant => ctl.forEach(([b, c]) => { const on = b.classList.contains('on'); if(c.hovered!==on) c.hover(on, instant); });
      sync(true); requestAnimationFrame(() => { const a = ctl.find(([b]) => b.classList.contains('on')); if(a){ a[1].hover(false, true); requestAnimationFrame(() => a[1].hover(true)); } });
      new MutationObserver(() => sync(false)).observe(bar, {subtree:true, attributes:true, attributeFilter:['class']});
      bar.classList.add('kubai');
    }).catch(() => {});
  };
  if(document.readyState==='loading') addEventListener('DOMContentLoaded', go); else go();
})();
