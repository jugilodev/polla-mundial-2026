import { supabase } from "../lib/supabase";

/**
 * Resultados reales de la fase de grupos.
 * Cada fila indica la posición final real de un equipo en su grupo.
 * Solo existen filas para los grupos ya disputados (puede estar vacío o parcial).
 */
export async function getGroupResults() {
    const { data, error } = await supabase
        .from("group_results")
        .select("team_id, final_position, qualified_as_best_third");

    if (error) throw error;

    return data;
}
