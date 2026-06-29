import { getParticipants } from "./participants.service";
import { getAllGroupPredictions } from "./predictions.service";
import { getGroupResults } from "./results.service";
import {
    addGroupScore,
    addKnockoutScore,
    buildKnockoutResultMap,
    createScoreBreakdown,
    getBreakdownTotal,
    knockoutResultKey,
} from "../lib/scoring";
import { getAllKnockoutPredictions, getKnockoutResults } from "./knockout.service";

/**
 * Devuelve el ranking de TODOS los participantes.
 *
 * El puntaje se calcula en el frontend para poder sumar:
 * - Fase de grupos
 * - Fase eliminatoria
 * - Bono por cruce exacto aunque el orden de team1/team2 esté invertido
 */
export async function getRanking() {
    const [
        participants,
        groupPredictions,
        groupResults,
        knockoutPredictions,
        knockoutResults,
    ] = await Promise.all([
        getParticipants(),
        getAllGroupPredictions(),
        getGroupResults(),
        getAllKnockoutPredictions(),
        getKnockoutResults(),
    ]);

    const scoresById = new Map(
        participants.map((p) => [p.id, createScoreBreakdown()])
    );

    const groupResultsByTeamId = new Map(
        groupResults.map((result) => [result.team_id, result])
    );
    const knockoutResultsByKey = buildKnockoutResultMap(knockoutResults);

    for (const prediction of groupPredictions) {
        const result = groupResultsByTeamId.get(prediction.team_id);
        const breakdown = scoresById.get(prediction.participant_id);
        if (breakdown) addGroupScore(breakdown, prediction, result);
    }

    for (const prediction of knockoutPredictions) {
        const result =
            knockoutResultsByKey.get(
                knockoutResultKey(
                    prediction.stage,
                    prediction.team1_id,
                    prediction.team2_id
                )
            ) ?? null;
        const breakdown = scoresById.get(prediction.participant_id);
        if (breakdown) addKnockoutScore(breakdown, prediction, result);
    }

    return participants
        .map((p) => {
            const breakdown = scoresById.get(p.id) ?? createScoreBreakdown();
            return {
                id: p.id,
                name: p.name,
                points: getBreakdownTotal(breakdown),
                breakdown,
            };
        })
        .sort((a, b) => b.points - a.points || a.name.localeCompare(b.name));
}
