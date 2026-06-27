import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getPredictionsByParticipant } from "../services/predictions.service";
import { getParticipants } from "../services/participants.service";
import { getKnockoutPredictions } from "../services/knockout.service";
import { getGroupResults } from "../services/results.service";
import Bracket from "../components/Bracket";
import { flagFor } from "../lib/flags";

export default function Participant() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [participants, setParticipants] = useState([]);
    const [predictions, setPredictions] = useState([]);
    const [knockout, setKnockout] = useState([]);
    const [results, setResults] = useState([]);
    const [status, setStatus] = useState("loading"); // loading | ready | error
    const [view, setView] = useState("groups"); // groups | bracket

    // Datos que no dependen del participante (selector + resultados reales).
    // Se cargan una sola vez.
    useEffect(() => {
        let active = true;
        (async () => {
            try {
                const [parts, res] = await Promise.all([
                    getParticipants(),
                    getGroupResults(),
                ]);
                if (active) {
                    setParticipants(parts);
                    setResults(res);
                }
            } catch (err) {
                console.error(err);
            }
        })();
        return () => {
            active = false;
        };
    }, []);

    // Predicciones del participante actual. Se recarga al cambiar el id.
    useEffect(() => {
        let active = true;
        (async () => {
            setStatus("loading");
            try {
                const [groupData, knockoutData] = await Promise.all([
                    getPredictionsByParticipant(id),
                    getKnockoutPredictions(id),
                ]);
                if (active) {
                    setPredictions(groupData);
                    setKnockout(knockoutData);
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
    }, [id]);

    const currentIndex = participants.findIndex((p) => String(p.id) === String(id));
    const current = participants[currentIndex];
    const prev = currentIndex > 0 ? participants[currentIndex - 1] : null;
    const next =
        currentIndex >= 0 && currentIndex < participants.length - 1
            ? participants[currentIndex + 1]
            : null;

    // Agrupa predicciones por grupo y ordena por posición predicha.
    const groups = useMemo(() => {
        const map = new Map();
        for (const p of predictions) {
            const letter = p.teams?.group_letter ?? "?";
            if (!map.has(letter)) map.set(letter, []);
            map.get(letter).push(p);
        }
        for (const list of map.values()) {
            list.sort(
                (a, b) => (a.predicted_position ?? 99) - (b.predicted_position ?? 99)
            );
        }
        return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
    }, [predictions]);

    // Mapa team_id -> resultado real (posición final en su grupo).
    const resultsById = useMemo(() => {
        const map = new Map();
        for (const r of results) map.set(r.team_id, r);
        return map;
    }, [results]);

    // Resumen de aciertos de fase de grupos: por cada posición exacta, +1 punto.
    const groupSummary = useMemo(() => {
        let hits = 0;
        let decided = 0; // predicciones cuyo equipo ya tiene resultado real
        for (const p of predictions) {
            const real = resultsById.get(p.teams?.id);
            if (!real) continue;
            decided += 1;
            if (real.final_position === p.predicted_position) hits += 1;
        }
        return { hits, decided, points: hits };
    }, [predictions, resultsById]);

    const hasResults = resultsById.size > 0;

    return (
        <div>
            <header className="page-header">
                <span className="kicker">Predicciones</span>
                <h1>{current ? current.name : "Participante"}</h1>
                <p>
                    <Link to="/">← Volver a la clasificación</Link>
                </p>
            </header>

            {/* Selector + flechas para cambiar de participante */}
            <div className="participant-bar">
                <label htmlFor="participant-select">Participante</label>
                <select
                    id="participant-select"
                    className="select"
                    value={id}
                    onChange={(e) => navigate(`/participant/${e.target.value}`)}
                >
                    {participants.map((p) => (
                        <option key={p.id} value={p.id}>
                            {p.name}
                        </option>
                    ))}
                </select>
                <div className="nav-arrows">
                    <button
                        className="icon-btn"
                        disabled={!prev}
                        onClick={() => prev && navigate(`/participant/${prev.id}`)}
                        title={prev ? prev.name : "Sin anterior"}
                        aria-label="Participante anterior"
                    >
                        ‹
                    </button>
                    <button
                        className="icon-btn"
                        disabled={!next}
                        onClick={() => next && navigate(`/participant/${next.id}`)}
                        title={next ? next.name : "Sin siguiente"}
                        aria-label="Participante siguiente"
                    >
                        ›
                    </button>
                </div>
            </div>

            {status === "loading" && (
                <div className="state">
                    <div className="spinner" />
                    Cargando predicciones…
                </div>
            )}

            {status === "error" && (
                <div className="state error">
                    No se pudieron cargar las predicciones.
                </div>
            )}

            {status === "ready" &&
                predictions.length === 0 &&
                knockout.length === 0 && (
                    <div className="state">
                        Este participante aún no tiene predicciones.
                    </div>
                )}

            {status === "ready" &&
                (groups.length > 0 || knockout.length > 0) && (
                    <>
                        {/* Filtro: alterna entre fase de grupos y brackets */}
                        <div className="view-tabs" role="tablist" aria-label="Tipo de predicción">
                            <button
                                role="tab"
                                aria-selected={view === "groups"}
                                className={`view-tab ${view === "groups" ? "active" : ""}`}
                                onClick={() => setView("groups")}
                            >
                                Fase de grupos
                            </button>
                            <button
                                role="tab"
                                aria-selected={view === "bracket"}
                                className={`view-tab ${view === "bracket" ? "active" : ""}`}
                                onClick={() => setView("bracket")}
                            >
                                Brackets
                            </button>
                        </div>

                        {view === "groups" &&
                            (groups.length > 0 ? (
                                <>
                                    {/* Resumen de puntos de fase de grupos */}
                                    {hasResults && (
                                        <div className="score-summary">
                                            <span className="score-summary-icon">🎯</span>
                                            <span className="score-summary-text">
                                                Acertó{" "}
                                                <strong>
                                                    {groupSummary.hits} de{" "}
                                                    {groupSummary.decided}
                                                </strong>{" "}
                                                posiciones ya disputadas
                                            </span>
                                            <span className="score-summary-pts">
                                                +{groupSummary.points} pts
                                            </span>
                                        </div>
                                    )}

                                    <div className="groups">
                                        {groups.map(([letter, teams]) => {
                                            const groupHits = teams.filter((p) => {
                                                const r = resultsById.get(p.teams?.id);
                                                return (
                                                    r &&
                                                    r.final_position ===
                                                        p.predicted_position
                                                );
                                            }).length;
                                            return (
                                                <div className="group-card" key={letter}>
                                                    <h3>
                                                        <span>Grupo {letter}</span>
                                                        {hasResults && (
                                                            <span className="group-hits">
                                                                {groupHits} ✓
                                                            </span>
                                                        )}
                                                    </h3>
                                                    {teams.map((p) => {
                                                        const real = resultsById.get(
                                                            p.teams?.id
                                                        );
                                                        const hit =
                                                            real &&
                                                            real.final_position ===
                                                                p.predicted_position;
                                                        const miss = real && !hit;
                                                        return (
                                                            <div
                                                                key={p.id}
                                                                className={`team-row ${
                                                                    p.predicted_position <=
                                                                    2
                                                                        ? "qualifies"
                                                                        : ""
                                                                } ${
                                                                    hit ? "hit" : ""
                                                                } ${miss ? "miss" : ""}`}
                                                            >
                                                                <span className="seed">
                                                                    {p.predicted_position}
                                                                </span>
                                                                {flagFor(
                                                                    p.teams?.name
                                                                ) && (
                                                                    <span
                                                                        className="team-flag"
                                                                        aria-hidden="true"
                                                                    >
                                                                        {flagFor(
                                                                            p.teams?.name
                                                                        )}
                                                                    </span>
                                                                )}
                                                                <span className="team-name">
                                                                    {p.teams?.name}
                                                                    {miss && (
                                                                        <span className="team-real">
                                                                            Real:{" "}
                                                                            {
                                                                                real.final_position
                                                                            }
                                                                            .º
                                                                        </span>
                                                                    )}
                                                                </span>
                                                                {p.predicted_best_third && (
                                                                    <span
                                                                        className="star"
                                                                        title="Mejor tercero"
                                                                    >
                                                                        ⭐
                                                                    </span>
                                                                )}
                                                                {hit && (
                                                                    <span
                                                                        className="hit-badge"
                                                                        title="Posición exacta"
                                                                    >
                                                                        ✓ +1
                                                                    </span>
                                                                )}
                                                                {miss && (
                                                                    <span
                                                                        className="miss-badge"
                                                                        aria-label="Falló"
                                                                    >
                                                                        ✕
                                                                    </span>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </>
                            ) : (
                                <div className="state">
                                    Sin predicciones de fase de grupos.
                                </div>
                            ))}

                        {view === "bracket" &&
                            (knockout.length > 0 ? (
                                <Bracket matches={knockout} />
                            ) : (
                                <div className="state">
                                    Sin predicciones de fase eliminatoria.
                                </div>
                            ))}
                    </>
                )}
        </div>
    );
}
