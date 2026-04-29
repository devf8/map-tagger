import { useState, useRef, useCallback } from 'react'
import ShapeIcon from './ShapeIcon'
import './TagMarker.css'




export default function TagMarker({
  tag, transform, imageSize, isEditing,
  onClick, onNavigate, onDragStart, presentationMode, 
}) {
  const [shown, setShown] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const timerRef = useRef(null)

  const gap = tag.tooltipGap ?? 20
  const pos = tag.tooltipPosition || 'top'

  const POS_STYLE = {
    top:    { bottom: `calc(100% + ${gap}px)`, left: '50%',  transform: 'translateX(-50%)' },
    bottom: { top:    `calc(100% + ${gap}px)`, left: '50%',  transform: 'translateX(-50%)' },
    left:   { right:  `calc(100% + ${gap}px)`, top:  '50%',  transform: 'translateY(-50%)' },
    right:  { left:   `calc(100% + ${gap}px)`, top:  '50%',  transform: 'translateY(-50%)' },
  }

  const BRIDGE_STYLE = {
    top:    { bottom: '100%', height: gap, left: '50%', transform: 'translateX(-50%)', width: 300 },
    bottom: { top:    '100%', height: gap, left: '50%', transform: 'translateX(-50%)', width: 300 },
    left:   { right:  '100%', width: gap,  top:  '50%', transform: 'translateY(-50%)', height: 200 },
    right:  { left:   '100%', width: gap,  top:  '50%', transform: 'translateY(-50%)', height: 200 },
  }
  // Always show tooltip in edit mode so the gear button is reachable
  const hasTooltip = tag.fullTitle || tag.description || tag.linkedMapId || !presentationMode

  const handleEnter = useCallback(() => {
    clearTimeout(timerRef.current)
    setLeaving(false)
    if (hasTooltip) setShown(true)
  }, [hasTooltip])

  const handleLeave = useCallback(() => {
    if (!shown) return
    timerRef.current = setTimeout(() => {
      setLeaving(true)
      timerRef.current = setTimeout(() => {
        setShown(false)
        setLeaving(false)
      }, 220)
    }, 180)
  }, [shown])

  const screenX = transform.x + tag.x * imageSize.width * transform.scale
  const screenY = transform.y + tag.y * imageSize.height * transform.scale

  const handleEditClick = useCallback((e) => {
    e.stopPropagation()
    onClick(tag)
  }, [tag, onClick])

  const handleNavClick = useCallback((e) => {
    e.stopPropagation()
    onNavigate?.(tag.linkedMapId)
  }, [tag.linkedMapId, onNavigate])

  return (
    <div
      className={`tag-marker${isEditing ? ' editing' : ''}${shown ? ' active' : ''}${presentationMode ? ' readonly' : ''}`}
      style={{ left: screenX, top: screenY }}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      {shown && hasTooltip && (
        <div className="tag-gap-bridge" style={BRIDGE_STYLE[pos]} onMouseDown={e => e.stopPropagation()} />
      )}

      {shown && hasTooltip && (
        <div
          className={`tag-tooltip tag-tooltip--${pos}${leaving ? ' leaving' : ''}${!presentationMode ? ' tag-tooltip--editable' : ''}`}
          style={POS_STYLE[pos]}
          onMouseDown={e => e.stopPropagation()}
        >
          {!presentationMode && (
            <button className="tag-gear-btn" onClick={handleEditClick} title="Edit tag">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
            </button>
          )}

          {tag.fullTitle && <div className="tag-tooltip-title">{tag.fullTitle}</div>}
          {tag.description && <div className="tag-tooltip-desc">{tag.description}</div>}
          {!presentationMode && tag.editorNotes && (
            <p className="tag-editor-notes">{tag.editorNotes}</p>
          )}
          {tag.linkedMapId && (
            <button className="tag-nav-btn" onClick={handleNavClick}>
              {tag.linkButtonText || 'Open Map'}
              <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          )}
        </div>
      )}

      <div
        className="tag-icon"
        style={{ width: tag.size, height: tag.size, opacity: (tag.opacity ?? 100) / 100 }}
        onMouseDown={!presentationMode ? (e) => { e.stopPropagation(); onDragStart?.(tag, e) } : undefined}
      >
        <ShapeIcon shape={tag.shape} color={tag.color} size={tag.size} strokeWidth={1.5} />
        {isEditing && <div className="tag-ring" style={{ width: tag.size + 10, height: tag.size + 10 }} />}
      </div>

      {tag.shortTitle && (
        <div className={`tag-label ${tag.isPrivate? 'tag-label--private' : ''}`}>{tag.shortTitle}{tag.isPrivate && '*'}</div>
      )}
    </div>
  )
}
