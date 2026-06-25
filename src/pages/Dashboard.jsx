import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getRanking } from "../services/scores.service";
import PointsInfo from "../components/PointsInfo";

const MEDALS = ["🥇", "🥈", "🥉"];

export default function Dashboard() {
    const [ranking, setRanking] = useState([]);
    const [status, setStatus] = useState("loading"); // loading | ready | error

    useEffect(() => {
        let active = true;

        (async () => {
            try {
                const data = await getRanking();
                if (active) {
                    setRanking(data);
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

            {status === "ready" && ranking.length === 0 && (
                <div className="state">Aún no hay participantes en la polla.</div>
            )}

            {status === "ready" && ranking.length > 0 && (
                <>
                    {!hasPoints && (
                        <div className="state">
                            El torneo aún no comienza. Los puntos aparecerán cuando se
                            carguen los resultados de los grupos.
                        </div>
                    )}

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

                    <h2 className="section-title">Clasificación general</h2>
                    <div className="ranking">
                        {ranking.map((player, index) => (
                            <div
                                key={player.id}
                                className={`rank-row ${index < 3 ? "is-top" : ""}`}
                            >
                                <span className="pos">{index + 1}</span>
                                <span className="player">{player.name}</span>
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
        </div>
    );
}
