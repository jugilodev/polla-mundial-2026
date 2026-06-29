import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getRanking } from "../services/scores.service";
import { getGroupResults } from "../services/results.service";
import { getKnockoutResults } from "../services/knockout.service";
import PointsInfo from "../components/PointsInfo";
import Bracket from "../components/Bracket";
import ScoreBreakdown from "../components/ScoreBreakdown";
import { flagFor } from "../lib/flags";

const MEDALS = ["🥇", "🥈", "🥉"];

export default function Dashboard() {
    const [ranking, setRanking] = useState([]);
    const [groupResults, setGroupResults] = useState([]);
    const [knockoutResults, setKnockoutResults] = useState([]);
    const [status, setStatus] = useState("loading"); // loading | ready | error

    useEffect(() => {
        let active = true;

        (async () => {
            try {
                const [rankingData, resultsData, knockoutData] = await Promise.all([
                    getRanking(),
                    getGroupResults(),
                    getKnockoutResults(),
                ]);
                if (active) {
                    setRanking(rankingData);
                    setGroupResults(resultsData);
                    setKnockoutResults(knockoutData);
                    setStatus("ready");
                }
            } catch (err) {
                console.error(err);
                if (active) setStatus("error");
            }
        })();

        return () => {
            active = false;
        };
    }, []);

    const top3 = ranking.slice(0, 3);
    const hasPoints = ranking.some((p) => p.points > 0);
    const hasGroupResults = groupResults.length > 0;

    const groups = useMemo(() => {
        const map = new Map();
        for (const row of groupResults) {
            const letter = row.teams?.group_letter ?? "?";
            if (!map.has(letter)) map.set(letter, []);
            map.get(letter).push(row);
        }

        for (const list of map.values()) {
            list.sort((a, b) => (a.final_position ?? 99) - (b.final_position ?? 99));
        }

        return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
    }, [groupResults]);

    return (
        <div>
            <header className="page-header">
                <span className="kicker">Polla Mundial</span>
                <h1>🏆 Mundial 2026</h1>
                <p>Clasificación general de todos los participantes</p>
            </header>

            <PointsInfo />

            {status === "loading" && (
                <div className="state">
                    <div className="spinner" />
                    Cargando clasificación…
                </div>
            )}

            {status === "error" && (
                <div className="state error">
                    No se pudo cargar la clasificación. Intenta de nuevo.
                </div>
            )}

            {status === "ready" && (
                <>
                    <details className="results-dropdown">
                        <summary className="results-dropdown-summary">
                            <span className="results-dropdown-title">
                                Fase de grupos real
                            </span>
                            <span className="results-dropdown-meta">
                                {hasGroupResults
                                    ? `${groups.length} grupo${
                                          groups.length === 1 ? "" : "s"
                                      }`
                                    : "Sin resultados"}
                            </span>
                            <span className="results-dropdown-chevron" aria-hidden="true">
                                ⌄
                            </span>
                        </summary>

                        <div className="results-dropdown-body">
                            {hasGroupResults ? (
                                <div className="groups groups--real">
                                    {groups.map(([letter, teams]) => (
                                        <div
                                            className="group-card real-group-card"
                                            key={letter}
                                        >
                                            <h3>
                                                <span>Grupo {letter}</span>
                                                <span className="group-hits">
                                                    {teams.length} equipo
                                                    {teams.length === 1 ? "" : "s"}
                                                </span>
                                            </h3>
                                            {teams.map((row) => (
                                                <div
                                                    key={row.team_id}
                                                    className={`team-row ${
                                                        row.final_position <= 2
                                                            ? "qualifies"
                                                            : ""
                                                    } ${
                                                        row.final_position === 3
                                                            ? "best-third"
                                                            : ""
                                                    }`}
                                                >
                                                    <span className="seed">
                                                        {row.final_position}
                                                    </span>
                                                    {flagFor(row.teams?.name) && (
                                                        <span
                                                            className="team-flag"
                                                            aria-hidden="true"
                                                        >
                                                            {flagFor(row.teams?.name)}
                                                        </span>
                                                    )}
                                                    <span className="team-name">
                                                        {row.teams?.name}
                                                        {row.final_position === 3 &&
                                                            row.qualified_as_best_third && (
                                                                <span className="team-real">
                                                                    Clasificó como mejor
                                                                    tercero
                                                                </span>
                                                            )}
                                                    </span>
                                                    {row.final_position === 3 &&
                                                        row.qualified_as_best_third && (
                                                            <span
                                                                className="hit-badge"
                                                                title="Mejor tercero"
                                                            >
                                                                ⭐ Mejor 3.º
                                                            </span>
                                                        )}
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="state results-dropdown-empty">
                                    Aún no se han cargado resultados reales de la fase de
                                    grupos.
                                </div>
                            )}
                        </div>
                    </details>

                    <details className="results-dropdown">
                        <summary className="results-dropdown-summary">
                            <span className="results-dropdown-title">Bracket real</span>
                            <span className="results-dropdown-meta">
                                {knockoutResults.length > 0
                                    ? `${knockoutResults.length} partido${
                                          knockoutResults.length === 1 ? "" : "s"
                                      }`
                                    : "Sin resultados"}
                            </span>
                            <span className="results-dropdown-chevron" aria-hidden="true">
                                ⌄
                            </span>
                        </summary>

                        <div className="results-dropdown-body">
                            {knockoutResults.length > 0 ? (
                                <Bracket matches={knockoutResults} />
                            ) : (
                                <div className="state results-dropdown-empty">
                                    Aún no se han cargado resultados reales del bracket.
                                </div>
                            )}
                        </div>
                    </details>

                    {ranking.length === 0 ? (
                        <div className="state">Aún no hay participantes en la polla.</div>
                    ) : !hasPoints ? (
                        <div className="state">
                            El torneo aún no comienza. Los puntos aparecerán cuando se
                            carguen resultados reales de grupos o knockout.
                        </div>
                    ) : null}

                    {hasPoints && top3.length === 3 && (
                        <>
                            <h2 className="section-title">Podio</h2>
                            <div className="podium">
                                {top3.map((player, index) => (
                                    <div
                                        key={player.id}
                                        className={`podium-card rank-${index + 1}`}
                                    >
                                        <div className="medal">{MEDALS[index]}</div>
                                        <div className="name">{player.name}</div>
                                        <div className="pts">{player.points} pts</div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {ranking.length > 0 && (
                        <>
                            <h2 className="section-title">Clasificación general</h2>
                            <div className="ranking">
                                {ranking.map((player, index) => (
                                    <div
                                        key={player.id}
                                        className={`rank-row ${index < 3 ? "is-top" : ""}`}
                                    >
                                        <span className="pos">{index + 1}</span>
                                        <span className="player">
                                            <span>{player.name}</span>
                                            <ScoreBreakdown breakdown={player.breakdown} />
                                        </span>
                                        <span className="points">
                                            {player.points}
                                            <span>pts</span>
                                        </span>
                                        <Link className="link" to={`/participant/${player.id}`}>
                                            Ver predicciones →
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </>
            )}
        </div>
    );
}
