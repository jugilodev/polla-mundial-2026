import { supabase } from "../lib/supabase";

/**
 * Predicciones de fase eliminatoria de un participante.
 * Trae el nombre de cada equipo resolviendo las 3 llaves foráneas a `teams`.
 * Se ordena por id para conservar el orden natural del bracket.
 */
export async function getKnockoutPredictions(participantId) {
    const { data, error } = await supabase
        .from("knockout_predictions")
        .select(
            `
      id,
      stage,
      team1:teams!team1_id (id, name),
      team2:teams!team2_id (id, name),
      winner:teams!winner_team_id (id, name)
    `
        )
        .eq("participant_id", participantId)
        .order("id");

    if (error) throw error;

    return data;
}
