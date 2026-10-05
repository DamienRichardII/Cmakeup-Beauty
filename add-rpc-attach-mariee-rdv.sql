-- Rattache le créneau Calendly confirmé à la demande "appel découverte mariée"
-- déjà enregistrée à l'envoi du formulaire (la table n'autorise que l'insertion
-- publique ; cette fonction est la seule écriture permise au public, limitée
-- aux fiches de moins de 24 h dont le créneau n'est pas encore rattaché).
create or replace function public.attach_mariee_rdv(p_id uuid, p_event text, p_invitee text)
returns void
language sql
security definer
set search_path = public
as $$
  update public.appels_decouverte_mariee
     set calendly_event_uri   = p_event,
         calendly_invitee_uri = p_invitee,
         rdv_statut           = 'confirme',
         statut               = 'rdv_confirme'
   where id = p_id
     and calendly_invitee_uri is null
     and created_at > now() - interval '24 hours';
$$;
revoke all on function public.attach_mariee_rdv(uuid, text, text) from public;
grant execute on function public.attach_mariee_rdv(uuid, text, text) to anon, authenticated;
