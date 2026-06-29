const GROUP_POINTS = 1;

const KNOCKOUT_STAGE_POINTS = {
    ROUND_OF_32: 2,
    ROUND_OF_16: 3,
    QUARTERFINALS: 4,
    SEMIFINALS: 5,
    THIRD_PLACE: 6,
    FINAL: 8,
};

export const KNOCKOUT_STAGE_LABELS = {
    ROUND_OF_32: "16avos",
    ROUND_OF_16: "8avos",
    QUARTERFINALS: "4tos",
    SEMIFINALS: "Semis",
    THIRD_PLACE: "3º",
    FINAL: "Final",
};

function toKey(value) {
    return value == null ? "" : String(value);
}

function pairKey(team1Id, team2Id) {
    return [toKey(team1Id), toKey(team2Id)].sort().join(":");
}

function resultTeam1Id(result) {
    return result?.team1_id ?? result?.team1?.id ?? null;
}

function resultTeam2Id(result) {
    return result?.team2_id ?? result?.team2?.id ?? null;
}

function resultWinnerId(result) {
    return result?.winner_team_id ?? result?.winner?.id ?? null;
}

export function isGroupHit(prediction, result) {
    if (!result) return false;
    if (result.final_position !== prediction.predicted_position) return false;

    if (result.final_position === 3) {
        return (
            Boolean(prediction.predicted_best_third) &&
            Boolean(result.qualified_as_best_third)
        );
    }

    return true;
}

export function scoreGroupPrediction(prediction, result) {
    const hit = isGroupHit(prediction, result);
    return {
        points: hit ? GROUP_POINTS : 0,
        hit,
        decided: Boolean(result),
    };
}

export function knockoutResultKey(stage, team1Id, team2Id) {
    return `${stage}:${pairKey(team1Id, team2Id)}`;
}

export function buildKnockoutResultMap(results) {
    const map = new Map();
    for (const result of results) {
        map.set(
            knockoutResultKey(result.stage, resultTeam1Id(result), resultTeam2Id(result)),
            result
        );
    }
    return map;
}

export function scoreKnockoutPrediction(prediction, result) {
    const winnerId = resultWinnerId(result);
    if (!result || winnerId == null) {
        return {
            points: 0,
            winnerHit: false,
            bonusHit: false,
            decided: false,
        };
    }

    const winnerHit = toKey(prediction.winner_team_id) === toKey(winnerId);
    const bonusHit =
        pairKey(prediction.team1_id, prediction.team2_id) ===
        pairKey(resultTeam1Id(result), resultTeam2Id(result));
    const stagePoints = KNOCKOUT_STAGE_POINTS[prediction.stage] ?? 0;

    return {
        points: (winnerHit ? stagePoints : 0) + (bonusHit ? 1 : 0),
        winnerHit,
        bonusHit,
        decided: true,
    };
}

export function createScoreBreakdown() {
    return {
        groups: 0,
        knockout: {
            ROUND_OF_32: 0,
            ROUND_OF_16: 0,
            QUARTERFINALS: 0,
            SEMIFINALS: 0,
            THIRD_PLACE: 0,
            FINAL: 0,
        },
        exactMatchBonus: 0,
    };
}

export function addGroupScore(breakdown, prediction, result) {
    const scored = scoreGroupPrediction(prediction, result);
    breakdown.groups += scored.points;
    return scored;
}

export function addKnockoutScore(breakdown, prediction, result) {
    const scored = scoreKnockoutPrediction(prediction, result);
    if (scored.decided) {
        if (scored.winnerHit) {
            breakdown.knockout[prediction.stage] =
                (breakdown.knockout[prediction.stage] ?? 0) +
                (KNOCKOUT_STAGE_POINTS[prediction.stage] ?? 0);
        }
        if (scored.bonusHit) {
            breakdown.exactMatchBonus += 1;
        }
    }
    return scored;
}

export function getBreakdownTotal(breakdown) {
    return (
        breakdown.groups +
        Object.values(breakdown.knockout).reduce((sum, value) => sum + value, 0) +
        breakdown.exactMatchBonus
    );
}

export { KNOCKOUT_STAGE_POINTS };
