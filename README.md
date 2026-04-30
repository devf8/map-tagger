# Map Tagger

A browser-based map annotation tool built with the GM's best interests in mind. Load any image by URL, explore it with pan and zoom, and place tags that reveal tooltips on hover or tap. Sessions are saved as portable JSON files. No server, no account, no sync required.

## Features

### Sessions
- Create a session with a title, description, and optional editor password
- Import an existing `.json` session file to resume work
- Export the current session back to a named `.json` file
- Password-protect the editor — leaving presentation mode requires the password if one was set

### Maps
- Add multiple maps per session by providing an image URL
- Each map has a display name, title, subtitle, description, and private editor notes
- Set a default map that opens automatically when the session loads
- Choose a decorative background pattern rendered behind the image
- Drag maps to reorder them in the sidebar
- Delete a map — broken tag links to it are cleaned up automatically

### Tags
Click to place a marker anywhere on a map. Each tag supports:

| Field | Notes |
|---|---|
| Full title | Shown in the tooltip header |
| Short label | Small badge always visible on the map |
| Description | Body text in the tooltip |
| Editor notes | Only visible in editor mode |
| Private flag | Hidden entirely in presentation mode |
| Shape | Circle, square, triangle, star, or diamond |
| Color | 8 presets + custom color picker |
| Size | 10–64 px slider |
| Opacity | 0–100 slider |
| Tooltip position | Top, bottom, left, or right |
| Tooltip gap | Distance between the marker and the tooltip |
| Map link | Opens another map when clicked — enables drill-down navigation |
| Link button text | Label for the navigation button inside the tooltip |

### Canvas
- **Pan** — click-drag (mouse) or one-finger drag (touch)
- **Zoom** — scroll wheel, pinch-to-zoom, or the `+` / `−` buttons
- **Fit to screen** — the ⤢ button resets the view to fit the image
- **Move tags** — drag any tag icon to reposition it on the map (tag tool only)
- **Animated transitions** — fade/scale animation when navigating between linked maps
- **Back navigation** — a Return button appears when drilled into a nested map

### Presentation Mode
- Hides the toolbar, sidebar, and all editor UI
- Suppresses private tags and editor notes

## Stack

React 18 + Vite. No backend, the app runs entirely in the browser. Sessions are exported and imported as plain JSON files.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Building

```bash
npm run build
```

Output goes to `dist/`. Serve the folder with any static file host.

## Typical Workflow

1. Open the app → **New Session** or **Import Session**
2. Add maps via the sidebar `+` button — provide any accessible image URL
3. Switch to the **Tag** tool, click the map to place markers, fill in details in the side panel
4. Optionally link tags to other maps to create drill-down navigation
5. Click **Present** to enter presentation mode for showing to players
6. **Export** to save the session as a `.json` file for later
