const STAR_POINTS = (() => {
  const pts = []
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? 12 : 5
    const angle = (i * Math.PI) / 5 - Math.PI / 2
    pts.push(`${12 + r * Math.cos(angle)},${12 + r * Math.sin(angle)}`)
  }
  return pts.join(' ')
})()

export default function ShapeIcon({ shape, color = 'currentColor', size = 24, strokeWidth = 0 }) {
  const s = size
  const half = s / 2

  const sharedProps = {
    fill: color,
    stroke: strokeWidth ? 'rgba(0,0,0,0.3)' : 'none',
    strokeWidth,
  }

  switch (shape) {
    case 'circle':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" {...sharedProps} />
        </svg>
      )
    case 'square':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24">
          <rect x="2" y="2" width="20" height="20" rx="2" {...sharedProps} />
        </svg>
      )
    case 'triangle':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24">
          <polygon points="12,2 22,22 2,22" {...sharedProps} />
        </svg>
      )
    case 'star':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24">
          <polygon points={STAR_POINTS} {...sharedProps} />
        </svg>
      )
    case 'diamond':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24">
          <polygon points="12,2 22,12 12,22 2,12" {...sharedProps} />
        </svg>
      )
    default:
      return null
  }
}
