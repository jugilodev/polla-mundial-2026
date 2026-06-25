// Reglas del sistema de puntos. Sección colapsable (mobile-first).
const RULES = [
    {
        icon: "🎯",
        pts: 1,
        title: "Posición exacta en fase de grupos",
        desc: "Por cada selección que ubiques en su posición exacta del grupo.",
    },
    {
        icon: "⚽",
        pts: 2,
        title: "Pasa de dieciseisavos a octavos",
        desc: "Por cada selección que aciertes que avanza a octavos.",
    },
    {
        icon: "⚽",
        pts: 3,
        title: "Pasa de octavos a cuartos",
        desc: "Por cada selección que aciertes que avanza a cuartos.",
    },
    {
        icon: "⚽",
        pts: 4,
        title: "Pasa de cuartos a semifinales",
        desc: "Por cada selección que aciertes que avanza a semifinales.",
    },
    {
        icon: "⚽",
        pts: 5,
        title: "Pasa de semifinales a la final",
        desc: "Por cada selección que aciertes que llega a la final.",
    },
    {
        icon: "🥉",
        pts: 6,
        title: "Ganador del tercer y cuarto puesto",
        desc: "Por atinarle al ganador del partido por el tercer lugar.",
    },
    {
        icon: "🏆",
        pts: 8,
        title: "Campeón del mundial",
        desc: "Por acertar la selección que gana el título.",
    },
];

export default function PointsInfo() {
    return (
        <details className="points-info">
            <summary className="points-info-summary">
                <span className="points-info-icon">📊</span>
                <span className="points-info-title">¿Cómo se puntúa?</span>
                <span className="points-info-chevron" aria-hidden="true">⌄</span>
            </summary>

            <div className="points-info-body">
                <ul className="points-rules">
                    {RULES.map((r) => (
                        <li className="points-rule" key={r.title}>
                            <span className="points-rule-icon" aria-hidden="true">
                                {r.icon}
                            </span>
                            <span className="points-rule-text">
                                <span className="points-rule-title">{r.title}</span>
                                <span className="points-rule-desc">{r.desc}</span>
                            </span>
                            <span className="points-rule-pts">+{r.pts}</span>
                        </li>
                    ))}
                </ul>

                <div className="points-bonus">
                    <span className="points-bonus-icon" aria-hidden="true">✨</span>
                    <span>
                        <strong>Bono en todos los brackets:</strong> por cada cruce en el
                        que aciertes el enfrentamiento exacto, ganas <strong>+1 punto
                        extra</strong>.
                    </span>
                </div>
            </div>
        </details>
    );
}
