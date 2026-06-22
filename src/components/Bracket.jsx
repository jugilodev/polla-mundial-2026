import { useMemo } from "react";

const STAGES = [
    { key: "ROUND_OF_32", label: "Dieciseisavos" },
    { key: "ROUND_OF_16", label: "Octavos" },
    { key: "QUARTERFINALS", label: "Cuartos" },
    { key: "SEMIFINALS", label: "Semis" },
    { key: "FINAL", label: "Final" },
];

function TeamLine({ team, won }) {
    return (
        <div className={`bteam ${won ? "won" : "lost"}`}>
            <span className="bteam-name">{team?.name ?? "—"}</span>
            {won && <span className="bteam-check">✓</span>}
        </div>
    );
}

function MatchCard({ match }) {
    const winnerId = match.winner?.id;
    return (
        <div className="bmatch">
            <TeamLine team={match.team1} won={match.team1?.id === winnerId} />
            <TeamLine team={match.team2} won={match.team2?.id === winnerId} />
        </div>
    );
}

export default function Bracket({ matches }) {
    const byStage = useMemo(() => {
        const map = {};
        for (const m of matches) {
            (map[m.stage] ??= []).push(m);
        }
        return map;
    }, [matches]);

    const final = byStage.FINAL?.[0];
    const champion = final?.winner;
    const third = byStage.THIRD_PLACE?.[0];

    return (
        <div className="bracket-wrap">
            {champion && (
                <div className="champion">
                    <div className="champion-trophy">🏆</div>
                    <div className="champion-meta">
                        <span className="champion-label">Campeón pronosticado</span>
                        <span className="champion-name">{champion.name}</span>
                    </div>
                </div>
            )}

            <div className="bracket-scroll">
                <div className="bracket">
                    {STAGES.map((stage) => {
                        const stageMatches = byStage[stage.key] ?? [];
                        if (stageMatches.length === 0) return null;
                        return (
                            <div className="round" key={stage.key}>
                                <div className="round-label">{stage.label}</div>
                                <div className="round-matches">
                                    {stageMatches.map((m) => (
                                        <MatchCard key={m.id} match={m} />
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {third && (
                <div className="third-place">
                    <span className="third-badge">🥉 Tercer lugar</span>
                    <div className="bmatch">
                        <TeamLine
                            team={third.team1}
                            won={third.team1?.id === third.winner?.id}
                        />
                        <TeamLine
                            team={third.team2}
                            won={third.team2?.id === third.winner?.id}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
