# FireFly V0.5a

A local school-use app for games and music. Static HTML, CSS, and JS — no build step.

**Status:** Alpha (`main`)

---

## What’s in it

* **Home** — jump cards, a few random games, recently added tracks
* **Games** — library pulled from FROG, Xaden, and ABMINN. Search, compressed mode, virtualized grid (only visible cards are painted)
* **Music** — catalog plus a Phonk section. Play all / shuffle. The now-playing rail shows on the right once a track starts
* **Settings** — Red-Ember, Shark-Blue, or Blank. Autoplay and default volume
* **Credits** — the people who built it

Themes fade between wallpapers. Chromebooks skip extra webfonts and keep the games grid light.

---

## Run it

Open the folder over HTTP (file:// will break music and some game loads):

```bash
python -m http.server 8767
```

Then go to `http://127.0.0.1:8767/`.

Or use the GitHub copy:

* App: `https://cdn.jsdelivr.net/gh/X-NOBER/FireFLy_V0.5a@main/index.html`
* Launcher: [`fetchingEngine/md.html`](https://cdn.jsdelivr.net/gh/X-NOBER/FireFLy_V0.5a@main/fetchingEngine/md.html)

---

## Repo layout

| Path | What it is |
| :--- | :--- |
| `index.html` / `main.css` / `script.js` | The app |
| `music/` | Local MP3s |
| `loading images/` | Splash frames |
| `fetchingEngine/` | Launchers (`md.html`, `rm.html`, `float.html`) |
| `logo/` / `avatars/` | Branding and credits photos |

---

## Credits

| Person | Role |
| :--- | :--- |
| **$h4rky** | Creator & lead developer |
| **1Cool_Pig** | Games co-developer |
| **X-NOBER** | Game assets / CryoFetcher v4 |
| **ClumsyTheBudgie** | Mortal support |

Built for school gaming and too many late nights.
