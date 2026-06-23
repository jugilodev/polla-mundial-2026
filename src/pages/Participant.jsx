import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getPredictionsByParticipant } from "../services/predictions.service";
import { getParticipants } from "../services/participants.service";
import { getKnockoutPredictions } from "../services/knockout.service";
import Bracket from "../components/Bracket";
import { flagFor } from "../lib/flags";

export default function Participant() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [participants, setParticipants] = useState([]);
    const [predictions, setPredictions] = useState([]);
    const [knockout, setKnockout] = useState([]);
    const [status, setStatus] = useState("loading"); // loading | ready | error
    const [view, setView] = useState("groups"); // groups | bracket

    // Lista de participantes (para el selector). Se carga una sola vez.
    useEffect(() => {
        let active = true;
        (async () => {
            try {
                const data = await getParticipants();
                if (active) setParticipants(data);
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
                                <div className="groups">
                                    {groups.map(([letter, teams]) => (
                                        <div className="group-card" key={letter}>
                                            <h3>Grupo {letter}</h3>
                                            {teams.map((p) => (
                                                <div
                                                    key={p.id}
                                                    className={`team-row ${
                                                        p.predicted_position <= 2
                                                            ? "qualifies"
                                                            : ""
                                                    }`}
                                                >
                                                    <span className="seed">
                                                        {p.predicted_position}
                                                    </span>
                                                    {flagFor(p.teams?.name) && (
                                                        <span
                                                            className="team-flag"
                                                            aria-hidden="true"
                                                        >
                                                            {flagFor(p.teams?.name)}
                                                        </span>
                                                    )}
                                                    <span className="team-name">
                                                        {p.teams?.name}
                                                    </span>
                                                    {p.predicted_best_third && (
                                                        <span
                                                            className="star"
                                                            title="Mejor tercero"
                                                        >
                                                            ⭐
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
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
