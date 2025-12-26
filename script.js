const STREAM_URL = "https://radio.choucroute.club/live.mp3";
const STATUS_URL = "https://radio.choucroute.club/status-json.xsl";

const audio = document.getElementById("audio");
const btn = document.getElementById("btn");
const clockEl = document.getElementById("clock");
const trackEl = document.getElementById("track");

audio.src = STREAM_URL;

function setTrack(text, muted=false){
  trackEl.innerHTML = `<span class="label">Titre :</span> <span class="value ${muted ? "muted" : ""}">${text}</span>`;
}

// Horloge (Europe/Paris)
function tickClock(){
  const now = new Date();
  clockEl.textContent = new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Europe/Paris",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  }).format(now);
}
setInterval(tickClock, 250);
tickClock();

// Play / Pause
btn.addEventListener("click", async () => {
  try{
    if (audio.paused) await audio.play();
    else audio.pause();
  } catch(e){
    // autoplay bloqué ou autre
    btn.textContent = "▶︎ Play";
  }
});

audio.addEventListener("play", () => { btn.textContent = "⏸ Pause"; });
audio.addEventListener("pause", () => { btn.textContent = "▶︎ Play"; });

// Metadata (Icecast JSON)
function pickTrack(source){
  if (!source) return null;

  const title =
    source.title ||
    source.streamtitle ||
    source.song ||
    source["icy-title"] ||
    null;

  const artist =
    source.artist ||
    source["icy-artist"] ||
    null;

  if (!title && !artist) return null;
  return artist ? `${artist} — ${title || "Live"}` : title;
}

async function refreshStatus(){
  try{
    const res = await fetch(STATUS_URL, { cache: "no-store" });
    const data = await res.json();

    const icestats = data.icestats || {};
    let source = icestats.source || null;

    if (Array.isArray(source)){
      const wanted = "/live.mp3";
      source =
        source.find(s =>
          (s.listenurl && s.listenurl.includes(wanted)) ||
          (s.mount && s.mount === wanted) ||
          (s["mount-name"] && s["mount-name"] === wanted)
        ) || source[0] || null;
    }

    const track = pickTrack(source);
    if (track) setTrack(track, false);
    else setTrack("Aucune metadata", true);

  } catch(e){
    setTrack("Impossible de lire le statut", true);
  }
}

refreshStatus();
setInterval(refreshStatus, 5000);
