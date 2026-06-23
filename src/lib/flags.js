/**
 * Banderas de las selecciones.
 *
 * Los nombres de equipo vienen de la base de datos (en español). Para no
 * depender de tildes ni mayúsculas, normalizamos el nombre y lo mapeamos a un
 * código ISO 3166-1 alpha-2; de ese código se genera el emoji de bandera con
 * los "regional indicator symbols".
 */

// Normaliza: minúsculas, sin acentos y sin espacios duplicados.
function normalize(name) {
    return (name ?? "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/\s+/g, " ")
        .trim();
}

// Nombre de país (normalizado) -> código ISO alpha-2.
// Se incluyen variantes (español, inglés y formas comunes) apuntando al mismo país.
const NAME_TO_ISO = {
    // CONMEBOL
    argentina: "AR",
    brasil: "BR",
    brazil: "BR",
    uruguay: "UY",
    colombia: "CO",
    chile: "CL",
    peru: "PE",
    ecuador: "EC",
    paraguay: "PY",
    bolivia: "BO",
    venezuela: "VE",
    // UEFA
    espana: "ES",
    spain: "ES",
    francia: "FR",
    france: "FR",
    alemania: "DE",
    germany: "DE",
    inglaterra: "GB-ENG",
    england: "GB-ENG",
    "reino unido": "GB",
    escocia: "GB-SCT",
    scotland: "GB-SCT",
    gales: "GB-WLS",
    wales: "GB-WLS",
    "irlanda del norte": "GB-NIR",
    italia: "IT",
    italy: "IT",
    portugal: "PT",
    "paises bajos": "NL",
    holanda: "NL",
    netherlands: "NL",
    belgica: "BE",
    belgium: "BE",
    croacia: "HR",
    croatia: "HR",
    suiza: "CH",
    switzerland: "CH",
    dinamarca: "DK",
    denmark: "DK",
    suecia: "SE",
    sweden: "SE",
    noruega: "NO",
    norway: "NO",
    polonia: "PL",
    poland: "PL",
    austria: "AT",
    "republica checa": "CZ",
    chequia: "CZ",
    "czech republic": "CZ",
    serbia: "RS",
    ucrania: "UA",
    ukraine: "UA",
    turquia: "TR",
    turkey: "TR",
    grecia: "GR",
    greece: "GR",
    rumania: "RO",
    rumanía: "RO",
    romania: "RO",
    hungria: "HU",
    hungary: "HU",
    eslovaquia: "SK",
    eslovenia: "SI",
    irlanda: "IE",
    ireland: "IE",
    "bosnia y herzegovina": "BA",
    "bosnia-herzegovina": "BA",
    albania: "AL",
    georgia: "GE",
    finlandia: "FI",
    islandia: "IS",
    rusia: "RU",
    russia: "RU",
    // CONCACAF
    mexico: "MX",
    mejico: "MX",
    "estados unidos": "US",
    eeuu: "US",
    usa: "US",
    "united states": "US",
    canada: "CA",
    "costa rica": "CR",
    panama: "PA",
    honduras: "HN",
    jamaica: "JM",
    "el salvador": "SV",
    guatemala: "GT",
    haiti: "HT",
    "trinidad y tobago": "TT",
    "curazao": "CW",
    surinam: "SR",
    // CONMEBOL/varios ya cubiertos arriba
    // CAF
    marruecos: "MA",
    morocco: "MA",
    senegal: "SN",
    "costa de marfil": "CI",
    nigeria: "NG",
    camerun: "CM",
    cameroon: "CM",
    egipto: "EG",
    egypt: "EG",
    ghana: "GH",
    argelia: "DZ",
    algeria: "DZ",
    tunez: "TN",
    tunisia: "TN",
    mali: "ML",
    "sudafrica": "ZA",
    "south africa": "ZA",
    "cabo verde": "CV",
    "burkina faso": "BF",
    angola: "AO",
    "guinea ecuatorial": "GQ",
    guinea: "GN",
    gabon: "GA",
    "republica democratica del congo": "CD",
    "rd congo": "CD",
    congo: "CG",
    zambia: "ZM",
    // AFC
    japon: "JP",
    japan: "JP",
    "corea del sur": "KR",
    "south korea": "KR",
    corea: "KR",
    "corea del norte": "KP",
    iran: "IR",
    "arabia saudita": "SA",
    "saudi arabia": "SA",
    australia: "AU",
    catar: "QA",
    qatar: "QA",
    irak: "IQ",
    iraq: "IQ",
    "emiratos arabes unidos": "AE",
    uzbekistan: "UZ",
    "uzbekistán": "UZ",
    jordania: "JO",
    "arabia": "SA",
    china: "CN",
    india: "IN",
    tailandia: "TH",
    vietnam: "VN",
    indonesia: "ID",
    bahrein: "BH",
    omán: "OM",
    oman: "OM",
    siria: "SY",
    palestina: "PS",
    libano: "LB",
    kuwait: "KW",
    // OFC
    "nueva zelanda": "NZ",
    "nueva zelandia": "NZ",
    "new zealand": "NZ",
    "nueva caledonia": "NC",
    fiyi: "FJ",
};

// Convierte un código ISO alpha-2 al emoji de bandera.
function isoToEmoji(iso) {
    return iso
        .toUpperCase()
        .replace(/./g, (c) =>
            String.fromCodePoint(127397 + c.charCodeAt(0))
        );
}

// Banderas especiales que no son ISO alpha-2 (subdivisiones del Reino Unido).
const SPECIAL = {
    "GB-ENG": "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    "GB-SCT": "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
    "GB-WLS": "🏴󠁧󠁢󠁷󠁬󠁳󠁿",
    "GB-NIR": "🇬🇧",
};

/**
 * Devuelve el emoji de bandera para el nombre de una selección.
 * Si no se reconoce el país, devuelve null (el componente usa un respaldo).
 */
export function flagFor(name) {
    const iso = NAME_TO_ISO[normalize(name)];
    if (!iso) return null;
    return SPECIAL[iso] ?? isoToEmoji(iso);
}
