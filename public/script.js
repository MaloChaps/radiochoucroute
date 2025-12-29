const audio = document.getElementById("audio");
const playBtn = document.getElementById("playBtn");
const trackTitle = document.getElementById("trackTitle");

const META_URL = "https://radio.choucroute.club/status-json.xsl";

/* --- Fix accents (José / Céline etc.) --- */
function fixMojibake(s) {
    if (!s || !/[ÃÂ]/.test(s)) return s;
    try {
        const bytes = Uint8Array.from([...s].map(c => c.charCodeAt(0)));
        return new TextDecoder("utf-8").decode(bytes);
    } catch {
        return s;
    }
}

/* --- Play / Pause --- */
playBtn.addEventListener("click", async () => {
    try {
        if (audio.paused) {
            await audio.play();
            playBtn.textContent = "Pause";
        } else {
            audio.pause();
            playBtn.textContent = "Play";
        }
    } catch (e) {
        console.error("Play error", e);
    }
});

/* --- Fetch title from Icecast --- */
function pickSource(icestats) {
    const s = icestats?.source;
    if (!s) return null;
    return Array.isArray(s) ? s[0] : s;
}

async function loadTitle() {
    try {
        const res = await fetch(META_URL, { cache: "no-store" });
        const data = await res.json();
        const src = pickSource(data.icestats);

        if (!src?.title) return;

        const fixed = fixMojibake(src.title);
        trackTitle.textContent = fixed;
    } catch (e) {
        console.warn("Metadata unavailable");
    }
}

loadTitle();
setInterval(loadTitle, 5000); // refresh toutes les 5s

