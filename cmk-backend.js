/* CMAKEUP BEAUTY — branchement du nouveau design sur le backend existant (Supabase, Stripe, Calendly).
   Chargé sur toutes les pages (après la librairie supabase-js).
   - Textes / photos / vidéos / dates de sessions pilotés depuis l'admin (table page_content)
   - Formulaires : <form data-cmk="formation|amc|contact|waitlist|audit|business|candidature|mariee">
   - Calendly : <div class="cal-slot" data-cal-url="…"> (préremplissage nom / e-mail)
   Sans réponse du serveur, le texte d'origine de la page reste affiché. */
(function(){
  'use strict';
  var SB_URL = 'https://haymfuvlbogtiempezto.supabase.co';
  var SB_KEY = 'sb_publishable_koY3vqHccqd5gugGwZJm6g__9Jahr1K';
  var sb = (window.supabase && window.supabase.createClient) ? window.supabase.createClient(SB_URL, SB_KEY) : null;
  var PAGE = document.body.getAttribute('data-page') || '';
  var ERR = '#B33A3A';
  var MAIL_ACADEMY = 'academy@cmakeupbeauty.fr';
  var WA = 'https://wa.me/33749865895';

  function $(id){ return document.getElementById(id); }
  function v(id){ var e = $(id); return e ? (e.value || '').trim() : ''; }
  function uuid(){
    try{ if(window.crypto && crypto.randomUUID) return crypto.randomUUID(); }catch(e){}
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c){
      var r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }
  function contactErr(){
    return "Un problème est survenu lors de l'envoi. Écris-nous à <a href=\"mailto:" + MAIL_ACADEMY + "\" style=\"border-bottom:1px solid currentColor\">" + MAIL_ACADEMY + "</a> ou sur <a href=\"" + WA + "\" target=\"_blank\" rel=\"noopener\" style=\"border-bottom:1px solid currentColor\">WhatsApp</a>.";
  }
  function statusEl(form){
    var s = form.querySelector('.fst');
    if(!s){
      s = document.createElement('p');
      s.className = 'fst'; s.setAttribute('role', 'status'); s.setAttribute('aria-live', 'polite');
      s.style.cssText = 'grid-column:1/-1;text-align:center;font-size:13px;line-height:1.7;color:#6d6455;margin-top:6px';
      form.appendChild(s);
    }
    return s;
  }
  function say(form, html, isErr){
    var s = statusEl(form);
    s.style.color = isErr ? ERR : '#6d6455';
    s.innerHTML = html || '';
  }
  function submitBtn(form){ return form.querySelector('button[type=submit]'); }

  /* ================= CMS (admin > Gestion des médias) ================= */
  function embedVideo(container, url){
    if(!url) return;
    var yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([A-Za-z0-9_-]{6,})/);
    var vim = url.match(/vimeo\.com\/(\d+)/);
    var frame = 'position:absolute;top:0;left:0;width:100%;height:100%;border:0;';
    if(yt) container.innerHTML = '<div style="position:relative;padding-top:56.25%"><iframe src="https://www.youtube.com/embed/' + yt[1] + '" style="' + frame + '" allowfullscreen loading="lazy"></iframe></div>';
    else if(vim) container.innerHTML = '<div style="position:relative;padding-top:56.25%"><iframe src="https://player.vimeo.com/video/' + vim[1] + '" style="' + frame + '" allowfullscreen loading="lazy"></iframe></div>';
    else container.innerHTML = '<video src="' + url.replace(/"/g, '&quot;') + '" controls style="width:100%;height:auto;display:block"></video>';
    container.hidden = false; container.style.display = 'block';
  }

  // Dates de sessions : puces (.chips[data-sessions]) + choix du formulaire (#session)
  function applySessions(list){
    if(!Array.isArray(list)) return;
    list = list.filter(function(s){ return s && typeof s.d === 'string' && s.d.trim(); });
    var chips = document.querySelector('.chips[data-sessions]');
    if(chips){
      chips.innerHTML = '';
      if(!list.length){
        var e = document.createElement('span'); e.textContent = 'Prochaines dates à venir'; chips.appendChild(e);
      }
      list.forEach(function(s){
        var full = /complet/i.test(s.s || '');
        var sp = document.createElement('span');
        sp.textContent = s.d.trim() + (s.s && s.s !== 'Places disponibles' ? ' · ' + s.s : '');
        if(full){ sp.style.opacity = '.5'; sp.style.textDecoration = 'line-through'; }
        chips.appendChild(sp);
      });
    }
    var sel = $('session');
    if(sel){
      var anchor = null;
      Array.prototype.slice.call(sel.options).forEach(function(o){
        if(o.hasAttribute('data-sess')) sel.removeChild(o);
        else if(o.value && !anchor) anchor = o;
      });
      list.forEach(function(s){
        var full = /complet/i.test(s.s || '');
        var o = document.createElement('option');
        o.value = s.d.trim(); o.setAttribute('data-sess', '1');
        o.textContent = s.d.trim() + (full ? ' (complet)' : '');
        if(full) o.disabled = true;
        sel.insertBefore(o, anchor);
      });
      sel.value = '';
    }
  }

  // Page Académie : dates reprises des sessions gérées dans l'admin de chaque formation
  function loadSessionsOf(){
    var els = document.querySelectorAll('[data-sessions-of]');
    if(!sb || !els.length) return;
    var slugs = {};
    Array.prototype.forEach.call(els, function(e){ slugs[e.getAttribute('data-sessions-of')] = 1; });
    sb.from('page_content').select('page_slug,content').eq('block_key', 'sessions_list').in('page_slug', Object.keys(slugs)).then(function(res){
      if(res.error || !res.data) return;
      var map = {};
      res.data.forEach(function(r){ try{ map[r.page_slug] = JSON.parse(r.content); }catch(e){} });
      Array.prototype.forEach.call(els, function(e){
        var list = map[e.getAttribute('data-sessions-of')];
        if(!Array.isArray(list)) return;
        var open = list.filter(function(s){ return s && s.d && s.d.trim() && !/complet/i.test(s.s || ''); }).map(function(s){ return s.d.trim(); });
        e.textContent = open.length ? open.join(' · ') : 'Prochaines dates à venir';
      });
    });
  }

  function loadCms(){
    if(!sb || !PAGE) return;
    sb.from('page_content').select('block_key,block_type,content').eq('page_slug', PAGE).then(function(res){
      if(res.error || !res.data) return;
      res.data.forEach(function(row){
        if(row.block_key === 'sessions_list' && row.content){ try{ applySessions(JSON.parse(row.content)); }catch(e){} }
      });
      res.data.forEach(function(row){
        if(!row.content || row.block_key === 'sessions_list') return;
        if(row.block_type === 'video'){
          var vc = document.querySelector('[data-editable-video="' + PAGE + '"]');
          if(vc) embedVideo(vc, row.content);
          return;
        }
        var els = document.querySelectorAll('[data-editable="' + PAGE + '.' + row.block_key + '"]');
        Array.prototype.forEach.call(els, function(el){
          if(row.block_type === 'image'){
            if(el.tagName === 'IMG') el.setAttribute('src', row.content);
            else el.style.backgroundImage = 'url("' + row.content.replace(/"/g, '%22') + '")';
          } else {
            el.textContent = row.content;
            if(el.hasAttribute('data-editable-nl')) el.style.whiteSpace = 'pre-line';
          }
        });
      });
    });
  }

  /* ================= Calendly ================= */
  var calReady = null;
  function loadCalendly(cb){
    if(window.Calendly){ cb(); return; }
    if(!calReady){
      calReady = [];
      var s = document.createElement('script');
      s.src = 'https://assets.calendly.com/assets/external/widget.js'; s.async = true;
      s.onload = function(){ var q = calReady; calReady = null; q.forEach(function(f){ f(); }); };
      document.head.appendChild(s);
      var l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'https://assets.calendly.com/assets/external/widget.css'; document.head.appendChild(l);
    }
    calReady.push(cb);
  }
  function calUrl(base, prefill){
    var p = [];
    if(prefill && prefill.name) p.push('name=' + encodeURIComponent(prefill.name));
    if(prefill && prefill.email) p.push('email=' + encodeURIComponent(prefill.email));
    if(base.indexOf('hide_gdpr_banner') < 0) p.push('hide_gdpr_banner=1');
    return base + (p.length ? (base.indexOf('?') < 0 ? '?' : '&') + p.join('&') : '');
  }
  function mountCalendly(el, prefill){
    var base = el.getAttribute('data-cal-url');
    if(!base) return;
    el.innerHTML = '';
    loadCalendly(function(){
      window.Calendly.initInlineWidget({ url: calUrl(base, prefill), parentElement: el });
    });
  }
  function urlPrefill(){
    var q = new URLSearchParams(location.search);
    var name = ((q.get('prenom') || '') + ' ' + (q.get('nom') || '')).trim();
    return { name: name, email: q.get('email') || '' };
  }
  function initCalSlots(){
    Array.prototype.forEach.call(document.querySelectorAll('.cal-slot[data-cal-url]:not([data-cal-lazy])'), function(el){
      mountCalendly(el, urlPrefill());
    });
  }
  function onCalScheduled(cb){
    window.addEventListener('message', function(e){
      if(!e.data || e.data.event !== 'calendly.event_scheduled') return;
      var pl = e.data.payload || {};
      cb({ event: pl.event && pl.event.uri || null, invitee: pl.invitee && pl.invitee.uri || null });
    });
  }

  /* ================= Pièces d'identité CPF ================= */
  var MAX_BYTES = 10 * 1024 * 1024;
  function uploadCpf(file, folder, label){
    if(!file) return Promise.resolve(null);
    if(file.size > MAX_BYTES) return Promise.resolve(false);
    var ext = (file.name.split('.').pop() || 'bin').toLowerCase().replace(/[^a-z0-9]/g, '') || 'bin';
    var path = folder + '/' + label + '.' + ext;
    return sb.storage.from('documents-cpf').upload(path, file, { upsert: false, contentType: file.type || undefined }).then(function(r){
      return r.error ? false : path;
    }).catch(function(){ return false; });
  }
  function bindCpfBlock(form, onChange){
    var fin = $('fin'), block = form.querySelector('[data-cpf-block]');
    function sync(){
      var cpf = fin && fin.value === 'cpf';
      if(block) block.hidden = !cpf;
      if(onChange) onChange(cpf);
    }
    if(fin) fin.addEventListener('change', sync);
    sync();
  }

  /* ================= Inscriptions formations / Auto Makeup Class ================= */
  function initFormation(form){
    if(!sb) return;
    var isAmc = form.getAttribute('data-cmk') === 'amc';
    var table = isAmc ? 'auto_makeup_class_demandes' : 'formation_inscriptions';
    var source = form.getAttribute('data-source') || PAGE;
    var pay = form.getAttribute('data-pay') === '1';
    var payDesc = form.getAttribute('data-pay-desc') || 'Acompte';
    var calUrlBase = form.getAttribute('data-calendly') || '';
    var btn = submitBtn(form), sess = $('session');

    function label(cpf, waitlist){
      if(cpf) return 'Envoyer ma demande CPF';
      if(pay && !waitlist) return 'Continuer vers le paiement';
      return 'Envoyer ma demande';
    }
    function sync(){
      if(btn && !btn.disabled) btn.textContent = label($('fin') && $('fin').value === 'cpf', sess && sess.value === 'liste-attente');
    }
    bindCpfBlock(form, sync);
    if(sess) sess.addEventListener('change', sync);

    // Retour de Stripe (Auto Makeup Class : la page se recharge avec ?paid=1&session_id=…)
    var q = new URLSearchParams(location.search);
    if(isAmc && q.get('paid') === '1' && q.get('session_id')){
      form.hidden = true;
      var lead = form.parentNode.querySelector('.lead'); if(lead) lead.hidden = true;
      var box = document.createElement('div');
      box.className = 'note'; box.style.textAlign = 'center';
      box.innerHTML = '<b>Vérification du paiement…</b><br>Merci de patienter quelques secondes.';
      form.parentNode.insertBefore(box, form);
      sb.functions.invoke('confirm-checkout-session', { body: { session_id: q.get('session_id') } }).then(function(r){
        if(r.data && r.data.paid) box.innerHTML = '<b>Réservation confirmée !</b><br>Merci, ton acompte a bien été reçu. Nous te recontactons rapidement pour finaliser les détails de ta place.';
        else box.innerHTML = "<b>Paiement non confirmé</b><br>Nous n'avons pas pu confirmer ton paiement. Si la somme a bien été débitée, écris-nous à <a href=\"mailto:" + MAIL_ACADEMY + "\" style=\"border-bottom:1px solid currentColor\">" + MAIL_ACADEMY + "</a> avec une capture de ta confirmation.";
      }).catch(function(){ box.innerHTML = "Nous n'avons pas pu vérifier ton paiement. Écris-nous à " + MAIL_ACADEMY + "."; });
      var sec = document.getElementById('inscription'); if(sec) sec.scrollIntoView();
      return;
    }

    form.addEventListener('submit', function(e){
      e.preventDefault();
      var fin = $('fin') ? $('fin').value : 'classique';
      var cpf = fin === 'cpf';
      var sessionVal = sess ? sess.value : '';
      var waitlist = sessionVal === 'liste-attente';
      var needsPay = pay && !cpf && !waitlist;
      var before = btn ? btn.textContent : '';
      if(btn){ btn.disabled = true; btn.textContent = 'Envoi en cours...'; }
      say(form, '');
      var id = uuid();
      var recto = cpf && $('idr') ? $('idr').files[0] : null;
      var verso = cpf && $('idv') ? $('idv').files[0] : null;
      Promise.all([ uploadCpf(recto, id, 'recto'), uploadCpf(verso, id, 'verso') ]).then(function(paths){
        if(paths[0] === false || paths[1] === false){
          if(btn){ btn.disabled = false; btn.textContent = before; }
          say(form, "Ta pièce d'identité n'a pas pu être envoyée (10 Mo maximum, formats JPG, PNG, WEBP, HEIC ou PDF). Vérifie le fichier et réessaie, ou envoie-la à <a href=\"mailto:" + MAIL_ACADEMY + "\" style=\"border-bottom:1px solid currentColor\">" + MAIL_ACADEMY + "</a>.", true);
          return;
        }
        var row = {
          id: id,
          prenom: v('prenom'), nom: v('nom'), email: v('email'), telephone: v('tel'),
          session: sessionVal,
          financement: fin,
          message: v('msg'),
          rgpd_consent: !!($('ins-ck') && $('ins-ck').checked),
          solde_cpf: cpf ? v('solde') : '',
          adresse_postale: cpf ? v('adr') : '',
          piece_identite_recto_path: paths[0],
          piece_identite_verso_path: paths[1]
        };
        if(isAmc){ row.statut = 'nouveau'; }
        else {
          row.source_page = source;
          if($('module')) row.formation = v('module');
          if($('dates')) row.dates_souhaitees = v('dates');
        }
        return sb.from(table).insert(row).then(function(res){
          if(btn){ btn.disabled = false; }
          if(res.error){
            if(btn) btn.textContent = before;
            say(form, contactErr(), true);
            return;
          }
          if(needsPay){ startCheckout(id); return; }
          if(calUrlBase && !cpf){ showCalendar(row); return; }
          location.href = 'merci-formation.html';
        });
      }).catch(function(){
        if(btn){ btn.disabled = false; btn.textContent = before; }
        say(form, contactErr(), true);
      });

      function startCheckout(recordId){
        if(btn){ btn.disabled = true; btn.textContent = 'Redirection vers le paiement sécurisé...'; }
        var base = location.origin + location.pathname.replace(/[^\/]*$/, '');
        var body = isAmc ? {
          table: 'auto_makeup_class_demandes', record_id: recordId, description: payDesc,
          success_url: location.origin + location.pathname + '?paid=1&session_id={CHECKOUT_SESSION_ID}#inscription',
          cancel_url: location.origin + location.pathname + '#inscription'
        } : {
          table: 'formation_inscriptions_acompte', record_id: recordId, description: payDesc,
          success_url: base + 'merci-acompte.html?session_id={CHECKOUT_SESSION_ID}',
          cancel_url: location.origin + location.pathname
        };
        if(isAmc){
          var el = document.querySelector('[data-editable="' + PAGE + '.prix_acompte"]');
          var amount = el ? parseFloat((el.textContent || '').replace(',', '.')) : NaN;
          body.amount_cents = (isFinite(amount) && amount > 0) ? Math.round(amount * 100) : 10000;
        }
        sb.functions.invoke('create-checkout-session', { body: body }).then(function(pay){
          if(pay.error || !pay.data || !pay.data.url){
            if(btn){ btn.disabled = false; btn.textContent = before; }
            say(form, "Ton inscription est bien enregistrée, mais le paiement en ligne n'a pas pu démarrer. Écris-nous à <a href=\"mailto:" + MAIL_ACADEMY + "\" style=\"border-bottom:1px solid currentColor\">" + MAIL_ACADEMY + "</a> ou sur <a href=\"" + WA + "\" target=\"_blank\" rel=\"noopener\" style=\"border-bottom:1px solid currentColor\">WhatsApp</a>.", true);
            return;
          }
          location.href = pay.data.url;
        }).catch(function(){
          if(btn){ btn.disabled = false; btn.textContent = before; }
          say(form, "Ton inscription est bien enregistrée, mais le paiement en ligne n'a pas pu démarrer. Écris-nous à " + MAIL_ACADEMY + ".", true);
        });
      }

      function showCalendar(row){
        var step = $('calstep');
        say(form, 'Merci ! Ta demande a bien été envoyée. Choisis maintenant ton créneau juste en dessous.');
        if(btn) btn.textContent = before;
        if(!step){ location.href = 'merci-formation.html'; return; }
        var slot = step.querySelector('.cal-slot');
        step.hidden = false;
        slot.setAttribute('data-cal-url', calUrlBase);
        mountCalendly(slot, { name: (row.prenom + ' ' + row.nom).trim(), email: row.email });
        step.scrollIntoView({ behavior: 'smooth', block: 'start' });
        form.reset(); sync();
      }
    });
  }

  /* ================= Contact (accueil + page contact) ================= */
  function initContact(form){
    if(!sb) return;
    var btn = submitBtn(form);
    form.addEventListener('submit', function(e){
      e.preventDefault();
      var before = btn.textContent; btn.disabled = true; btn.textContent = 'Envoi en cours...';
      sb.from('contacts').insert({
        prenom: v('cf-p'), nom: v('cf-n'), email: v('cf-e'), telephone: v('cf-t'), sujet: v('cf-s'), message: v('cf-m'),
        rgpd_consent: !!($('cf-c') && $('cf-c').checked)
      }).then(function(res){
        btn.disabled = false; btn.textContent = before;
        if(res.error){ say(form, contactErr(), true); return; }
        say(form, 'Merci ! Votre message a bien été envoyé, nous vous répondons rapidement.');
        form.reset();
      }).catch(function(){ btn.disabled = false; btn.textContent = before; say(form, contactErr(), true); });
    });
  }

  /* ================= Liste d'attente formation en ligne ================= */
  function initWaitlist(form){
    if(!sb) return;
    var btn = submitBtn(form);
    form.addEventListener('submit', function(e){
      e.preventDefault();
      var before = btn.textContent; btn.disabled = true; btn.textContent = 'Envoi en cours...';
      sb.from('waitlist_formation_en_ligne').insert({ email: v('email') }).then(function(res){
        btn.disabled = false; btn.textContent = before;
        if(res.error){ say(form, contactErr(), true); return; }
        say(form, "Merci ! Nous te préviendrons dès l'ouverture de la formation.");
        form.reset();
      }).catch(function(){ btn.disabled = false; btn.textContent = before; say(form, contactErr(), true); });
    });
  }

  /* ================= Coaching : audit / business / candidature ================= */
  function simpleInsert(form, table, build, done){
    if(!sb) return;
    var btn = submitBtn(form);
    form.addEventListener('submit', function(e){
      e.preventDefault();
      var before = btn.textContent; btn.disabled = true; btn.textContent = 'Envoi en cours...';
      var row = build();
      sb.from(table).insert(row).then(function(res){
        btn.disabled = false; btn.textContent = before;
        if(res.error){ say(form, contactErr(), true); return; }
        done(row);
      }).catch(function(){ btn.disabled = false; btn.textContent = before; say(form, contactErr(), true); });
    });
  }
  function initAudit(form){
    simpleInsert(form, 'questionnaires_audit', function(){
      return {
        nom_prenom: v('nom'), email: v('email'), telephone: v('tel'), ville: v('ville'),
        anciennete: v('anc'), statut_pro: v('statut'),
        prestations_actuelles: v('presta'), tarifs: v('tarifs'),
        instagram_nom: v('insta'), instagram_abonnes: v('abo'),
        objectifs: v('obj'), difficultes: v('frein'), disponibilites: v('dispo'),
        rgpd_consent: !!($('q-ck') && $('q-ck').checked)
      };
    }, function(row){
      location.href = 'reservation-coaching-audit.html?' + new URLSearchParams({ nom: row.nom_prenom, email: row.email }).toString();
    });
  }
  function initBusiness(form){
    simpleInsert(form, 'questionnaires_business', function(){
      return {
        nom_prenom: v('nom'), email: v('email'), whatsapp: v('wa'),
        adresse_facturation: v('fact'), siret: v('siret'), date_debut_souhaitee: v('debut') || null,
        jour_prefere: v('jour'), creneau_prefere: v('cren'), adresse_visite: v('visite'),
        prestations_tarifs: v('presta'), clientes_par_mois: v('cli'),
        priorites: v('prio') ? [v('prio')] : [], complement: v('mot'),
        rgpd_consent: !!($('q-ck') && $('q-ck').checked)
      };
    }, function(){
      say(form, 'Merci ! Colleen planifie tes 4 séances et te confirme les créneaux par email et WhatsApp.');
      form.reset();
    });
  }
  function initCandidature(form){
    simpleInsert(form, 'candidatures_coaching', function(){
      return {
        nom_prenom: v('nom'), email: v('email'), telephone: v('tel'), ville: v('ville'), pack: v('pack'),
        instagram_lien: v('insta'), instagram_abonnes: v('abo'), anciennete: v('anc'), type_activite: v('act'),
        tarifs: v('tarifs'), objectifs: v('obj'), problematique: v('frein'),
        rgpd_consent: !!($('q-ck') && $('q-ck').checked)
      };
    }, function(){
      say(form, 'Merci ! Ta candidature a bien été envoyée. Colleen revient vers toi sous quelques jours.');
      form.reset();
    });
  }

  /* ================= Appel découverte mariée + Calendly ================= */
  function initMariee(form){
    if(!sb) return;
    var btn = submitBtn(form), photos = $('photos'), n = $('n');
    var PHOTO_MAX = 10 * 1024 * 1024;
    var slot = $('cal-mariee'), hint = $('cal-hint'), wrap = $('cal-wrap');
    var savedId = null, pending = null;
    if(photos) photos.addEventListener('change', function(){
      var c = photos.files.length;
      if(n) n.textContent = c ? c + ' photo' + (c > 1 ? 's' : '') + ' choisie' + (c > 1 ? 's' : '') : 'Aucune photo choisie';
    });

    function uploadPhotos(){
      var files = photos && photos.files ? Array.prototype.slice.call(photos.files) : [];
      if(!files.length) return Promise.resolve([]);
      for(var i = 0; i < files.length; i++){
        if(files[i].size > PHOTO_MAX){ var er = new Error('size'); er.code = 'size'; er.fileName = files[i].name; return Promise.reject(er); }
      }
      var folder = 'appel-mariee/' + Date.now() + '-' + Math.random().toString(36).slice(2, 8);
      return Promise.all(files.map(function(file, idx){
        var path = folder + '/' + (idx + 1) + '-' + file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        return sb.storage.from('uploads-appel-mariee').upload(path, file, { upsert: false, contentType: file.type || undefined }).then(function(r){
          if(r.error) throw r.error;
          return sb.storage.from('uploads-appel-mariee').getPublicUrl(path).data.publicUrl;
        });
      }));
    }
    function showCal(prefill){
      if(hint) hint.hidden = true;
      if(wrap) wrap.hidden = false;
      if(slot){ slot.setAttribute('data-cal-url', slot.getAttribute('data-cal-base')); mountCalendly(slot, prefill); }
      if(wrap) wrap.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    function confirmBox(html){
      if(wrap) wrap.innerHTML = '<p class="note2" style="margin:0 auto">' + html + '</p>';
    }

    form.addEventListener('submit', function(e){
      e.preventDefault();
      var before = btn.textContent; btn.disabled = true; btn.textContent = 'Envoi en cours...';
      say(form, 'Envoi de vos informations et de vos photos…');
      var prenom = v('prenom'), nom = v('nom'), email = v('email');
      uploadPhotos().then(function(urls){
        var id = uuid();
        var row = {
          id: id, prenom: prenom, nom: nom, email: email, telephone: v('tel'),
          ville: v('lieu'), lieu_preparation: v('lieu'),
          date_mariage: v('date') || null, heure_ceremonie: v('heure') || null,
          pack_interesse: v('pack'), photos_inspiration_urls: urls,
          autres_infos: v('infos'),
          rgpd_consent: !!($('f-ck') && $('f-ck').checked)
        };
        return sb.from('appels_decouverte_mariee').insert(row).then(function(res){
          btn.disabled = false; btn.textContent = before;
          if(res.error){ pending = row; savedId = null; say(form, "Vos informations n'ont pas pu être enregistrées pour le moment. Vous pouvez tout de même choisir votre créneau ci-dessous ; vous pouvez aussi nous écrire en message privé sur Instagram <a href=\"https://instagram.com/c_makeup_\" target=\"_blank\" rel=\"noopener\" style=\"border-bottom:1px solid currentColor\">@c_makeup_</a>.", true); }
          else { savedId = id; pending = null; say(form, 'Merci ! Vos informations sont bien enregistrées. Choisissez maintenant votre créneau juste en dessous.'); }
          showCal({ name: (prenom + ' ' + nom).trim(), email: email });
        });
      }).catch(function(err){
        btn.disabled = false; btn.textContent = before;
        say(form, (err && err.code === 'size')
          ? 'Une de vos photos dépasse 10 Mo (' + err.fileName + '). Réduisez-la ou retirez-la, puis réessayez.'
          : "Vos photos n'ont pas pu être envoyées (JPG, PNG, WEBP ou HEIC, 10 Mo maximum par photo). Réessayez ou retirez-les ; vous pouvez aussi nous les envoyer en message privé sur Instagram <a href=\"https://instagram.com/c_makeup_\" target=\"_blank\" rel=\"noopener\" style=\"border-bottom:1px solid currentColor\">@c_makeup_</a>.", true);
      });
    });

    onCalScheduled(function(slotInfo){
      if(savedId){
        var id = savedId; savedId = null;
        Promise.resolve(sb.rpc('attach_mariee_rdv', { p_id: id, p_event: slotInfo.event, p_invitee: slotInfo.invitee })).catch(function(){});
        confirmBox('Merci ! Votre rendez-vous est confirmé, à très vite.');
      } else if(pending){
        var row = pending; pending = null;
        row.calendly_event_uri = slotInfo.event; row.calendly_invitee_uri = slotInfo.invitee;
        sb.from('appels_decouverte_mariee').insert(row).then(function(res){
          confirmBox(res.error
            ? "Votre rendez-vous est bien confirmé, mais vos informations n'ont pas pu être enregistrées. Écrivez-nous en message privé sur Instagram <a href=\"https://instagram.com/c_makeup_\" target=\"_blank\" rel=\"noopener\">@c_makeup_</a> pour nous les transmettre."
            : 'Merci ! Votre rendez-vous est confirmé, à très vite.');
        });
      } else {
        confirmBox('Merci ! Votre rendez-vous est confirmé, à très vite.');
      }
    });
  }

  /* ================= Page « merci » après paiement de l'acompte ================= */
  function initThanksPay(){
    var box = $('payResult'); if(!box || !sb) return;
    var sid = new URLSearchParams(location.search).get('session_id');
    var t = $('payTitle'), l = $('payLead'), e = $('payEyebrow'), nx = $('payNext');
    function fail(){
      e.textContent = 'Paiement non confirmé';
      t.innerHTML = "Nous n'avons pas pu<br>confirmer ton paiement";
      l.innerHTML = 'Si la somme a bien été débitée, écris-nous à <a href="mailto:' + MAIL_ACADEMY + '" style="border-bottom:1px solid currentColor">' + MAIL_ACADEMY + '</a> ou sur <a href="' + WA + '" target="_blank" rel="noopener" style="border-bottom:1px solid currentColor">WhatsApp</a> : nous vérifions immédiatement.';
    }
    if(!sid){ fail(); return; }
    sb.functions.invoke('confirm-checkout-session', { body: { session_id: sid } }).then(function(r){
      if(r.data && r.data.paid){
        e.textContent = 'Acompte reçu';
        t.innerHTML = 'Merci, ta place<br>est bloquée';
        l.textContent = "Ton acompte a bien été reçu. On a hâte de t'accompagner dans cette formation.";
        if(nx) nx.hidden = false;
      } else fail();
    }).catch(fail);
  }

  /* ================= Démarrage ================= */
  function start(){
    loadCms();
    loadSessionsOf();
    initCalSlots();
    initThanksPay();
    Array.prototype.forEach.call(document.querySelectorAll('form[data-cmk]'), function(f){
      var t = f.getAttribute('data-cmk');
      if(t === 'formation' || t === 'amc') initFormation(f);
      else if(t === 'contact') initContact(f);
      else if(t === 'waitlist') initWaitlist(f);
      else if(t === 'audit') initAudit(f);
      else if(t === 'business') initBusiness(f);
      else if(t === 'candidature') initCandidature(f);
      else if(t === 'mariee') initMariee(f);
    });
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
