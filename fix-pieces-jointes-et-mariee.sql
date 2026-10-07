-- À exécuter une fois dans Supabase > SQL Editor (projet haymfuvlbogtiempezto).
-- Corrige l'envoi des pièces jointes et le rattachement du créneau Calendly (appel mariée).

-- 1) Photos d'inspiration (appel découverte mariée) : autoriser le dépôt par une visiteuse.
--    Le bucket était public en lecture mais sans aucune règle d'écriture : tous les dépôts échouaient.
drop policy if exists "uploads_appel_mariee_public_upload" on storage.objects;
create policy "uploads_appel_mariee_public_upload"
  on storage.objects for insert
  to anon, authenticated
  with check (bucket_id = 'uploads-appel-mariee');

update storage.buckets
set file_size_limit = 10485760,
    allowed_mime_types = array['image/jpeg','image/png','image/webp','image/heic','image/heif']
where id = 'uploads-appel-mariee';

-- 2) Rattachement du créneau Calendly à la demande mariée (remplace la version précédente :
--    elle écrivait statut = 'rdv_confirme', valeur refusée par la contrainte de la colonne).
create or replace function public.attach_mariee_rdv(p_id uuid, p_event text, p_invitee text)
returns void
language sql
security definer
set search_path = public
as $$
  update public.appels_decouverte_mariee
     set calendly_event_uri   = p_event,
         calendly_invitee_uri = p_invitee,
         rdv_statut           = 'confirme'
   where id = p_id
     and calendly_invitee_uri is null
     and created_at > now() - interval '24 hours';
$$;
revoke all on function public.attach_mariee_rdv(uuid, text, text) from public;
grant execute on function public.attach_mariee_rdv(uuid, text, text) to anon, authenticated;
