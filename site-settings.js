/* Réglages généraux du site (admin > Gestion des médias > « Réglages du site »).
   - ville   : remplace « Cergy » partout (titre, descriptions, textes marqués data-city / data-city-replace)
   - adresse : remplace l'adresse affichée (éléments data-site-address : Accueil, Contact)
   Sans réglage enregistré, le texte d'origine reste affiché. */
(function(){
  if(!window.fetch) return;
  var RE = /Cergy(?: \(95\))?/gi;
  function rep(str, v){
    return str.replace(RE, function(m){ return m === m.toUpperCase() && m.length > 1 ? v.toUpperCase() : v; });
  }
  fetch('https://haymfuvlbogtiempezto.supabase.co/rest/v1/page_content?select=block_key,content&page_slug=eq.site', {
    headers: { apikey: 'sb_publishable_koY3vqHccqd5gugGwZJm6g__9Jahr1K' }
  }).then(function(r){ return r.ok ? r.json() : []; }).then(function(rows){
    var s = {};
    (rows || []).forEach(function(r){ if(r && typeof r.content === 'string' && r.content.trim()) s[r.block_key] = r.content.trim(); });
    function apply(){
      if(s.ville){
        var v = s.ville;
        Array.prototype.forEach.call(document.querySelectorAll('[data-city]'), function(e){ e.textContent = v; });
        document.title = rep(document.title, v);
        Array.prototype.forEach.call(document.querySelectorAll('meta[name="description"],meta[property="og:title"],meta[property="og:description"]'), function(m){
          var c = m.getAttribute('content'); if(c) m.setAttribute('content', rep(c, v));
        });
        Array.prototype.forEach.call(document.querySelectorAll('[data-city-replace]'), function(e){
          function run(){
            var t = e.textContent, n = rep(t, v);
            if(n !== t){ if(obs) obs.disconnect(); e.textContent = n; if(obs) obs.observe(e, { childList: true, characterData: true, subtree: true }); }
          }
          var obs = window.MutationObserver ? new MutationObserver(run) : null;
          run(); if(obs) obs.observe(e, { childList: true, characterData: true, subtree: true });
        });
      }
      if(s.adresse){
        var a = s.adresse;
        Array.prototype.forEach.call(document.querySelectorAll('[data-site-address]'), function(e){ e.textContent = a; });
      }
    }
    apply();
  }).catch(function(){});
})();

/* Prix du financement CPF : modifiable depuis l'admin (Gestion des médias > page concernée > « Prix CPF »).
   data-cpf-price="clé"  : le texte de l'élément est remplacé par le prix saisi (clé = prix_cpf, prix_cpf_module1…,
                           ou « page.clé » pour lire le prix d'une autre page).
   data-cpf-show="clé"   : élément masqué (hidden) tant qu'aucun prix n'est saisi.
   data-cpf-option="clé" + data-cpf-label : option de liste « libellé — prix ».
   Sans prix saisi, le texte d'origine reste affiché. */
(function(){
  if(!window.fetch) return;
  var nodes = document.querySelectorAll('[data-cpf-price],[data-cpf-show],[data-cpf-option]');
  if(!nodes.length) return;
  var here = (location.pathname.split('/').pop() || 'index').replace(/\.html$/, '') || 'index';
  function ref(k){ var i = k.indexOf('.'); return i > 0 ? { slug: k.slice(0, i), key: k.slice(i + 1) } : { slug: here, key: k }; }
  var slugs = {};
  Array.prototype.forEach.call(nodes, function(n){
    var k = n.getAttribute('data-cpf-price') || n.getAttribute('data-cpf-show') || n.getAttribute('data-cpf-option');
    if(k) slugs[ref(k).slug] = 1;
  });
  fetch('https://haymfuvlbogtiempezto.supabase.co/rest/v1/page_content?select=page_slug,block_key,content&page_slug=in.(' + Object.keys(slugs).join(',') + ')&block_key=like.prix_cpf*', {
    headers: { apikey: 'sb_publishable_koY3vqHccqd5gugGwZJm6g__9Jahr1K' }
  }).then(function(r){ return r.ok ? r.json() : []; }).then(function(rows){
    var map = {};
    (rows || []).forEach(function(r){ if(r && typeof r.content === 'string' && r.content.trim()) map[r.page_slug + '.' + r.block_key] = r.content.trim(); });
    function val(k){ var r = ref(k); return map[r.slug + '.' + r.key] || ''; }
    Array.prototype.forEach.call(nodes, function(n){
      var k;
      if((k = n.getAttribute('data-cpf-price')) !== null){ var v = val(k); if(v) n.textContent = v; }
      if((k = n.getAttribute('data-cpf-show')) !== null){ if(val(k)) n.removeAttribute('hidden'); }
      if((k = n.getAttribute('data-cpf-option')) !== null){ var w = val(k); if(w) n.textContent = (n.getAttribute('data-cpf-label') || 'Financement CPF') + ' — ' + w; }
    });
  }).catch(function(){});
})();
