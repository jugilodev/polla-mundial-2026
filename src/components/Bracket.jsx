import { useMemo } from "react";
import { flagFor } from "../lib/flags";

const STAGES = [
    { key: "ROUND_OF_32", label: "Dieciseisavos", short: "16avos" },
    { key: "ROUND_OF_16", label: "Octavos", short: "8avos" },
    { key: "QUARTERFINALS", label: "Cuartos", short: "4tos" },
    { key: "SEMIFINALS", label: "Semifinales", short: "Semis" },
    { key: "FINAL", label: "Final", short: "Final" },
];

// Iniciales para el "escudo" del equipo (2 letras a partir del nombre).
function initials(name) {
    if (!name) return "—";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
}

function TeamLine({ team, won, decided }) {
    const state = !decided ? "pending" : won ? "won" : "lost";
    const flag = flagFor(team?.name);
    return (
        <div className={`bteam ${state}`}>
            <span className={`bteam-badge ${flag ? "is-flag" : ""}`} aria-hidden="true">
                {flag ?? initials(team?.name)}
            </span>
            <span className="bteam-name">{team?.name ?? "—"}</span>
            {won && <span className="bteam-check" aria-label="Avanza">✓</span>}
        </div>
    );
}

function MatchCard({ match }) {
    const winnerId = match.winner?.id;
    const decided = Boolean(winnerId);
    return (
        <div className={`bmatch ${decided ? "decided" : ""}`}>
            <TeamLine
                team={match.team1}
                won={match.team1?.id === winnerId}
                decided={decided}
            />
            <div className="bmatch-vs">vs</div>
            <TeamLine
                team={match.team2}
                won={match.team2?.id === winnerId}
                decided={decided}
            />
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
                            <section className="round" key={stage.key}>
                                <header className="round-label">
                                    <span className="round-label-text">{stage.label}</span>
                                    <span className="round-label-count">
                                        {stageMatches.length}
                                        {stageMatches.length === 1 ? " partido" : " partidos"}
                                    </span>
                                </header>
                                <div className="round-matches">
                                    {stageMatches.map((m) => (
                                        <MatchCard key={m.id} match={m} />
                                    ))}
                                </div>
                            </section>
                        );
                    })}
                </div>
            </div>

            {third && (
                <section className="third-place">
                    <header className="round-label">
                        <span className="round-label-text">🥉 Tercer lugar</span>
                    </header>
                    <MatchCard match={third} />
                </section>
            )}
        </div>
    );
}
