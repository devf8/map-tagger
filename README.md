# Map Tagger
An interactive image annotation tool. Upload any image, explore it with pan and zoom, and place customizable tags that show tooltips on hover. Assisted by Claude.

## Installation

Install dependencies for frontend:

```bash
# From the project root
npm install
```

## Development

Run the backend and frontend in two separate terminals.

**frontend (port 5173):**
```bash
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173) in your browser.

## Building for Production

Build the frontend into static files:

```bash
npm run build
```

This outputs to `client/dist/`. Then serve everything from the backend:

## Usage

| Action | How |
|---|---|
| Upload a map | Click **Upload Image** in the sidebar, or drag and drop an image onto it |
| Pan | Select the **Pan** tool, then click and drag |
| Zoom | Scroll wheel anywhere on the map, or use the `+` / `−` buttons |
| Fit to screen | Click the fit button (⤢) in the bottom-right |
| Add a tag | Select the **Add Tag** tool, then click anywhere on the map |
| Edit a tag | Click any existing tag marker |
| Delete a tag | Open the tag editor and click **Delete** |
| Delete an image | Hover over it in the sidebar and click the × button |

## Tag Customisation

When creating or editing a tag you can configure:

- **Full title** — shown in the hover tooltip
- **Short label** — small badge displayed on the map at all times
- **Description** — body text in the tooltip
- **Shape** — circle, square, triangle, star, or diamond
- **Color** — eight presets or a custom color picker
- **Size** — drag the slider between 12 px and 64 px
- **Opacity** — drag the slider between 0-100
