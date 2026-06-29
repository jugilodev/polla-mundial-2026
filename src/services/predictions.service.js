import { supabase } from "../lib/supabase";

export async function getPredictionsByParticipant(participantId) {
    const { data, error } = await supabase
        .from("group_predictions")
        .select(`
      *,
      teams (
        id,
        name,
        group_letter
      )
    `)
        .eq("participant_id", participantId);

    if (error) throw error;

    return data;
}

export async function getAllGroupPredictions() {
    const { data, error } = await supabase
        .from("group_predictions")
        .select("participant_id, team_id, predicted_position, predicted_best_third");

    if (error) throw error;

    return data;
}
