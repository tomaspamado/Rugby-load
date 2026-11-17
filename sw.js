// Service worker. Mude VER ao publicar; index.html vai primeiro à rede, por isso nunca fica desatualizado online.
const VER='carga-v43';
const SHELL=['./','./index.html','./style.css','./balanca.css','./extras.css','./data.js','./app.js','./body.js','./balanca.js','./trofeus.js','./hoje.js','./paginas.js','./movimento.js','./alvos.js','./traducao.js','./grafico.js','./ux.js','./coach-dados.js','./coach.js','./forca.js','./extras.js','./registos.js','./relatorios.js','./manifest.webmanifest','./icon.svg','https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(VER).then(c=>Promise.all(SHELL.map(u=>c.add(u).catch(()=>{})))).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(n=>n!==VER).map(n=>caches.delete(n)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const r=e.request; if(r.method!=='GET')return;
  const u=new URL(r.url), own=u.origin===self.location.origin, cdn=u.hostname==='cdnjs.cloudflare.com',font=/fonts\.(googleapis|gstatic)\.com$/.test(u.hostname);
  if(!own&&!font&&!cdn)return;
  const shell=r.mode==='navigate'||(own&&/(\/|index\.html|sw\.js|app\.js|body\.js|balanca\.js|trofeus\.js|hoje\.js|paginas\.js|movimento\.js|alvos\.js|traducao\.js|grafico\.js|ux\.js|coach-dados\.js|coach\.js|forca\.js|extras\.js|registos\.js|relatorios\.js|data\.js|style\.css|balanca\.css|extras\.css)$/.test(u.pathname));
  if(shell){e.respondWith(fetch(r).then(res=>{if(res.ok){const cp=res.clone();caches.open(VER).then(c=>c.put(r,cp));}return res;}).catch(()=>caches.match(r,{ignoreSearch:true}).then(m=>m||caches.match('./index.html'))));}
  else{e.respondWith(caches.match(r).then(m=>m||fetch(r).then(res=>{if(res.ok||res.type==='opaque'){const cp=res.clone();caches.open(VER).then(c=>c.put(r,cp));}return res;})));}
});
