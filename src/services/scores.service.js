import { supabase } from "../lib/supabase";
import { getParticipants } from "./participants.service";

/**
 * Devuelve el ranking de TODOS los participantes.
 *
 * Los puntos viven en la vista `participant_scores`, que se calcula
 * comparando las predicciones con los resultados reales (`group_results`).
 * Mientras no haya resultados cargados, esa vista está vacía: en ese caso
 * igual listamos a todos los participantes con 0 puntos en lugar de mostrar
 * una pantalla vacía.
 */
export async function getRanking() {
    const [participants, scores] = await Promise.all([
        getParticipants(),
        getScores(),
    ]);

    const pointsById = new Map(scores.map((s) => [s.id, s.points ?? 0]));

    return participants
        .map((p) => ({
            id: p.id,
            name: p.name,
            points: pointsById.get(p.id) ?? 0,
        }))
        .sort((a, b) => b.points - a.points || a.name.localeCompare(b.name));
}

async function getScores() {
    const { data, error } = await supabase
        .from("participant_scores")
        .select("*");

    if (error) throw error;

    return data;
}
