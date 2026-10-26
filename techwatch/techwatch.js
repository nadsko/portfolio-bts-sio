'use strict';
const els = Object.fromEntries(['articles','search','sort','filters','more','updated','hardware','article-count','source-count'].map(id=>[id,document.getElementById(id)]));
let news=[],category='Toutes',visible=12;
const dateFR = iso=> {if(!iso)return 'Date inconnue'; const d=new Date(iso);return Number.isNaN(d.getTime())?'Date inconnue':new Intl.DateTimeFormat('fr-FR',{day:'numeric',month:'short',year:'numeric'}).format(d)};
const el=(tag,cls,txt)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(txt!==undefined)e.textContent=txt;return e};
function render(){
 const q=els.search.value.trim().toLocaleLowerCase('fr');
 let list=news.filter(a=>(category==='Toutes'||a.category===category)&&[a.title,a.summary,a.source].some(x=>(x||'').toLocaleLowerCase('fr').includes(q)));
 list.sort((a,b)=>(new Date(b.date||0)-new Date(a.date||0))*(els.sort.value==='new'?1:-1));
 els.articles.replaceChildren();
 if(!list.length){els.articles.append(el('div','empty',news.length?'Aucun article ne correspond à cette recherche.':'Aucun article publié pour le moment. Lance la collecte automatique depuis GitHub Actions.'));els.more.hidden=true;return}
 for(const item of list.slice(0,visible)){
  const card=el('article','article');const meta=el('div','meta');meta.append(el('span','chip',item.category||'Actualité'),el('span','',item.source||'Source'),el('span','',dateFR(item.date)));
  card.append(meta,el('h3','',item.title),el('p','',item.summary||'Ouvrir la source pour découvrir l’article complet.'));
  try{const u=new URL(item.url);if(u.protocol==='https:'){const a=el('a','', 'Lire l’article ↗');a.href=u.href;a.target='_blank';a.rel='noopener noreferrer';card.append(a)}}catch(_){}
  els.articles.append(card);
 }
 els.more.hidden=list.length<=visible;
}
els.search.addEventListener('input',()=>{visible=12;render()});els.sort.addEventListener('change',render);
els.filters.addEventListener('click',e=>{const b=e.target.closest('button[data-category]');if(!b)return;category=b.dataset.category;els.filters.querySelectorAll('button').forEach(x=>x.classList.toggle('active',x===b));visible=12;render()});els.more.addEventListener('click',()=>{visible+=12;render()});
async function load(){
 try{const r=await fetch('../data/news.json',{cache:'no-store'});if(!r.ok)throw new Error('HTTP '+r.status);const j=await r.json();news=Array.isArray(j.articles)?j.articles:[];els['article-count'].textContent=news.length;els['source-count'].textContent=Array.isArray(j.sources)?j.sources.length:'—';els.updated.textContent=j.updated_at?'Dernière collecte réussie : '+dateFR(j.updated_at):'Aucune collecte réussie : lance le workflow GitHub Actions.';render()}
 catch(e){els.articles.replaceChildren(el('div','empty','Chargement impossible. Publie le site sur GitHub Pages ou lance un serveur local (python -m http.server).'))}
 try{const r=await fetch('../data/hardware.json',{cache:'no-store'});if(!r.ok)return;const j=await r.json();if(!Array.isArray(j.products)||!j.products.length)return;const grid=el('div','hardware-grid');for(const x of j.products){if(!x.name||!x.source_url||!Number.isFinite(x.price_eur)||!x.checked_at)continue;let u;try{u=new URL(x.source_url);if(u.protocol!=='https:')continue}catch(_){continue}const c=el('article','hardware-item');c.append(el('h3','',x.name),el('strong','',x.price_eur.toLocaleString('fr-FR',{style:'currency',currency:'EUR'})),el('small','',x.stock_status||'Stock non confirmé'),el('small','',`Vérifié : ${dateFR(x.checked_at)}`));const a=el('a','','Consulter la source ↗');a.href=u.href;a.target='_blank';a.rel='noopener noreferrer';c.append(a);grid.append(c)}if(grid.children.length)els.hardware.replaceChildren(grid)}catch(_){}
}
load();
