const enc = svg => `url("data:image/svg+xml,${encodeURIComponent(svg)}")`

export const BACKGROUNDS = [
  { id: '',       label: 'None' },
  { id: 'sea',    label: 'Sea' },
  { id: 'forest', label: 'Forest' },
  { id: 'grass',  label: 'Grass' },
  { id: 'rocks',  label: 'Rocks' },
  { id: 'bricks', label: 'Bricks' },
]

export function getBackgroundCss(id) {
  switch (id) {
    case 'sea':
      return enc(
        '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="50">' +
        '<path d="M0,25 C20,15 30,15 50,25 C70,35 80,35 100,25" stroke="rgba(62, 135, 208, 0.16)" stroke-width="2" fill="none"/>' +
        '<path d="M0,40 C20,30 30,30 50,40 C70,50 80,50 100,40" stroke="rgba(64,148,230,0.08)" stroke-width="1.5" fill="none"/>' +
        '</svg>'
      )
    case 'forest':
      return enc(
        '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64">' +
        '<polygon points="32,6 56,52 8,52" stroke="rgba(60,130,70,0.18)" stroke-width="1.5" fill="none"/>' +
        '<line x1="32" y1="52" x2="32" y2="60" stroke="rgba(60,130,70,0.14)" stroke-width="2.5" stroke-linecap="round"/>' +
        '</svg>'
      )
    case 'grass':
      return enc(
        '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="18">' +
        '<line x1="4" y1="18" x2="5" y2="10" stroke="rgba(80,155,60,0.22)" stroke-width="1.5" stroke-linecap="round"/>' +
        '<line x1="10" y1="18" x2="10" y2="7" stroke="rgba(80,155,60,0.28)" stroke-width="1.5" stroke-linecap="round"/>' +
        '<line x1="16" y1="18" x2="15" y2="11" stroke="rgba(80,155,60,0.22)" stroke-width="1.5" stroke-linecap="round"/>' +
        '</svg>'
      )
    case 'rocks':
      return enc(
        '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="48">' +
        '<ellipse cx="14" cy="32" rx="11" ry="7" stroke="rgba(150,140,125,0.2)" stroke-width="1.5" fill="none"/>' +
        '<ellipse cx="44" cy="20" rx="9" ry="6" stroke="rgba(150,140,125,0.16)" stroke-width="1.5" fill="none"/>' +
        '<ellipse cx="50" cy="40" rx="8" ry="5" stroke="rgba(150,140,125,0.14)" stroke-width="1.5" fill="none"/>' +
        '<ellipse cx="6" cy="12" rx="5" ry="4" stroke="rgba(150,140,125,0.12)" stroke-width="1" fill="none"/>' +
        '</svg>'
      )
    case 'bricks':
      return enc(
        '<svg xmlns="http://www.w3.org/2000/svg" width="60" height="32">' +
        '<line x1="0" y1="0" x2="60" y2="0" stroke="rgba(175,150,130,0.18)" stroke-width="1"/>' +
        '<line x1="0" y1="16" x2="60" y2="16" stroke="rgba(175,150,130,0.18)" stroke-width="1"/>' +
        '<line x1="0" y1="32" x2="60" y2="32" stroke="rgba(175,150,130,0.18)" stroke-width="1"/>' +
        '<line x1="30" y1="0" x2="30" y2="16" stroke="rgba(175,150,130,0.15)" stroke-width="1"/>' +
        '<line x1="15" y1="16" x2="15" y2="32" stroke="rgba(175,150,130,0.15)" stroke-width="1"/>' +
        '<line x1="45" y1="16" x2="45" y2="32" stroke="rgba(175,150,130,0.15)" stroke-width="1"/>' +
        '</svg>'
      )
    default:
      return ''
  }
}
