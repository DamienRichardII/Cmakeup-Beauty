-- À exécuter dans l'éditeur SQL de Supabase (projet haymfuvlbogtiempezto)
-- Ajoute la colonne solde_cpf à auto_makeup_class_demandes, nécessaire pour
-- le nouveau champ "Solde disponible sur ton compte CPF" demandé par la cheffe
-- de projet sur auto-makeup-class.html (même champ que cours-auto-maquillage-prive.html).
-- Sans cette colonne, ajouter le champ au formulaire casserait TOUTES les
-- inscriptions (même principe que le bug corrigé en section 3 du journal).

ALTER TABLE public.auto_makeup_class_demandes ADD COLUMN IF NOT EXISTS solde_cpf text;
