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
    case 'diamond':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24">
          <polygon points="12,2 22,12 12,22 2,12" {...sharedProps} />
        </svg>
    )
    case 'star':
      return (
        <svg width={s} height={s} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path {...sharedProps} fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clipRule="evenodd" />
        </svg>

      )

    case 'arrow-up':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24">
          <polygon points="12,2 22,13 17,13 17,22 7,22 7,13 2,13" {...sharedProps} />
        </svg>
      )
    case 'arrow-down':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24">
          <polygon points="12,22 2,11 7,11 7,2 17,2 17,11 22,11" {...sharedProps} />
        </svg>
      )
    case 'arrow-left':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24">
          <polygon points="2,12 13,2 13,7 22,7 22,17 13,17 13,22" {...sharedProps} />
        </svg>
      )
    case 'arrow-right':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24">
          <polygon points="22,12 11,2 11,7 2,7 2,17 11,17 11,22" {...sharedProps} />
        </svg>
      )
    case 'talk':
      // courtesy of heroicons.com
      return (
        <svg width={s} height={s} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" >
          <path {...sharedProps} fillRule="evenodd" d="M4.804 21.644A6.707 6.707 0 0 0 6 21.75a6.721 6.721 0 0 0 3.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.674 6.192.232.226.277.428.254.543a3.73 3.73 0 0 1-.814 1.686.75.75 0 0 0 .44 1.223ZM8.25 10.875a1.125 1.125 0 1 0 0 2.25 1.125 1.125 0 0 0 0-2.25ZM10.875 12a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Zm4.875-1.125a1.125 1.125 0 1 0 0 2.25 1.125 1.125 0 0 0 0-2.25Z" clipRule="evenodd" />
        </svg>
      )
    case 'skull':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24">
          <path
            fillRule="evenodd"
            d="M12,1.5 C6,1.5 2,5.5 2,10.5 C2,14.5 4,17.5 7.5,19 L7.5,22 L9.5,22 L9.5,20 L14.5,20 L14.5,22 L16.5,22 L16.5,19 C20,17.5 22,14.5 22,10.5 C22,5.5 18,1.5 12,1.5 Z M6.5,10 A2,2 0 1,0 10.5,10 A2,2 0 1,0 6.5,10 Z M13.5,10 A2,2 0 1,0 17.5,10 A2,2 0 1,0 13.5,10 Z"
            {...sharedProps}
          />
        </svg>
      )
    case 'x':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24">
          <polygon points="5,2 12,9 19,2 22,5 15,12 22,19 19,22 12,15 5,22 2,19 9,12 2,5" {...sharedProps} />
        </svg>
      )
    case 'pin':
      return (
        <svg width={s} height={s} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path {...sharedProps} fillRule="evenodd" d="m11.54 22.351.07.04.028.016a.76.76 0 0 0 .723 0l.028-.015.071-.041a16.975 16.975 0 0 0 1.144-.742 19.58 19.58 0 0 0 2.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 0 0-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 0 0 2.682 2.282 16.975 16.975 0 0 0 1.145.742ZM12 13.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clipRule="evenodd" />
        </svg>

      )
    case 'bookmark':
      return (
        <svg width={s} height={s} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" >
          <path {...sharedProps} fillRule="evenodd" d="M6.32 2.577a49.255 49.255 0 0 1 11.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 0 1-1.085.67L12 18.089l-7.165 3.583A.75.75 0 0 1 3.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93Z" clipRule="evenodd" />
        </svg>
      )
    default:
      return null
  }
}
