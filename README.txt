CMAKEUP BEAUTY — SITE COMPLET (MAQUETTE)
==========================================
16 pages HTML statiques, prêtes à être intégrées. Toutes les pages sont
liées entre elles par navigation relative (les fichiers doivent rester
dans le même dossier, ou être adaptés si vous les répartissez en
sous-dossiers).

SITE PRINCIPAL (CMAKEUP BEAUTY — prestations, formations, ebook)
------------------------------------------------------------------
- index.html                 Page d'accueil
- prestations.html           Prestations makeup (Soft Glam, Full Glam, Smoky Eyes)
- prestations-mariee.html    Prestation Mariée (avec appel découverte)
- equipe.html                L'équipe (Colleen, Lady, Arlyne, Fatou)
- formations.html            Page hub des formations (renvoie vers les 3 ci-dessous)
- formation-collective.html  Formation collective 4 jours (présentiel, Saint-Denis)
- auto-makeup-class.html     Auto Makeup Class
- formation-en-ligne.html    Formation en ligne Soft Glam — page "Bientôt disponible"
                              avec liste d'attente (la formation n'est pas encore lancée)
- ebook.html                 Ebook Business "Vivre du Maquillage"
- contact.html                Formulaire de contact général
- reservation.html            Parcours de réservation (infos > paiement > confirmation)
                              — MOCKUP VISUEL, à connecter à un vrai système de
                              réservation + Stripe (voir note dans le fichier)

COACHING BUSINESS MUA (académie, accompagnement pour Makeup Artists)
------------------------------------------------------------------
- coaching-business-mua.html          Présentation des 3 packs (Audit 200€,
                                       Business 500€, Business + Visite terrain 800€)
- formulaire-candidature-business.html Formulaire de candidature au Pack Business
- questionnaire-audit.html             Questionnaire envoyé après paiement du Pack Audit
- questionnaire-complet-business.html  Questionnaire envoyé après validation +
                                        paiement du Pack Business

À PRÉVOIR CÔTÉ INTÉGRATION
------------------------------------------------------------------
1. Tous les formulaires (<form>) sont des maquettes visuelles sans back-end.
   Les champs ont des attributs "name" pour faciliter le branchement à un
   outil d'envoi (CRM, emailing, Airtable...). Des commentaires HTML dans
   le code indiquent où et comment chaque formulaire doit être connecté.
2. reservation.html simule un parcours de paiement en JS pur (voir le
   <script> en bas du fichier) — à remplacer par une vraie intégration
   Stripe + système de réservation.
3. formation-en-ligne.html est la page "Bientôt disponible" actuellement
   active dans le menu. La version complète et prête à publier de cette
   page existe déjà : formation-en-ligne-complete.html. Le jour du
   lancement, il suffit de remplacer formation-en-ligne.html par le
   contenu de formation-en-ligne-complete.html (ou de mettre à jour les
   liens de navigation vers ce fichier).
4. Plusieurs images sont encore en placeholder (base64 ou liens externes
   vercel.app) — à remplacer par les vrais visuels avant mise en ligne.

Identité visuelle : polices Cormorant Garamond (titres) et Jost (texte),
palette ivoire/encre, déjà en place sur toutes les pages via Google Fonts.
