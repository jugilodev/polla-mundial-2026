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

export async function getAllKnockoutPredictions() {
    const { data, error } = await supabase
        .from("knockout_predictions")
        .select("participant_id, stage, team1_id, team2_id, winner_team_id");

    if (error) throw error;

    return data;
}

export async function getKnockoutResults() {
    const { data, error } = await supabase
        .from("knockout_results")
        .select(
            `
      id,
      stage,
      match_number,
      team1:teams!team1_id (id, name),
      team2:teams!team2_id (id, name),
      winner:teams!winner_team_id (id, name)
    `
        )
        .order("stage")
        .order("match_number");

    if (error) throw error;

    return data;
}
