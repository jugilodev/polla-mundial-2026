import { KNOCKOUT_STAGE_LABELS } from "../lib/scoring";

const STAGE_ORDER = [
    "ROUND_OF_32",
    "ROUND_OF_16",
    "QUARTERFINALS",
    "SEMIFINALS",
    "THIRD_PLACE",
    "FINAL",
];

export default function ScoreBreakdown({ breakdown }) {
    if (!breakdown) return null;

    return (
        <div className="score-breakdown" aria-label="Desglose de puntos">
            <span className="score-breakdown-chip score-breakdown-group">
                Grupos <strong>{breakdown.groups}</strong>
            </span>

            {STAGE_ORDER.map((stage) => {
                const points = breakdown.knockout?.[stage] ?? 0;
                return (
                    <span
                        key={stage}
                        className={`score-breakdown-chip ${
                            points > 0 ? "is-active" : "is-muted"
                        }`}
                    >
                        {KNOCKOUT_STAGE_LABELS[stage]} <strong>{points}</strong>
                    </span>
                );
            })}

            <span className="score-breakdown-chip score-breakdown-bonus">
                Bono exacto <strong>{breakdown.exactMatchBonus}</strong>
            </span>
        </div>
    );
}
