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
