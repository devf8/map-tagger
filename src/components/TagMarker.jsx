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
  const touchStartPos = useRef(null)

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

  const handleTouchStartMarker = useCallback((e) => {
    const touch = e.touches[0]
    touchStartPos.current = { x: touch.clientX, y: touch.clientY }
  }, [])

  const handleTouchEndMarker = useCallback((e) => {
    if (!touchStartPos.current) return
    const touch = e.changedTouches[0]
    const dx = touch.clientX - touchStartPos.current.x
    const dy = touch.clientY - touchStartPos.current.y
    touchStartPos.current = null
    if (Math.hypot(dx, dy) < 8) {
      if (shown) {
        setLeaving(true)
        timerRef.current = setTimeout(() => { setShown(false); setLeaving(false) }, 220)
      } else if (hasTooltip) {
        clearTimeout(timerRef.current)
        setLeaving(false)
        setShown(true)
      }
    }
  }, [shown, hasTooltip])

  return (
    <div
      className={`tag-marker${isEditing ? ' editing' : ''}${shown ? ' active' : ''}${presentationMode ? ' readonly' : ''}`}
      style={{ left: screenX, top: screenY }}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onTouchStartCapture={handleTouchStartMarker}
      onTouchEnd={handleTouchEndMarker}
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
            <button className="tag-edit-btn" onClick={handleEditClick} title="Edit tag">
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}

          {tag.fullTitle && <div className={`tag-tooltip-title ${tag.isPrivate ? 'tag-tooltip-title--private' : ''}`}>{tag.fullTitle}</div>}
          {tag.description && <div className="tag-tooltip-desc">{tag.description}</div>}
          {!presentationMode && tag.editorNotes && (
            <p className="tag-private-notes">{tag.editorNotes}</p>
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
        onTouchStart={!presentationMode ? (e) => {
          const touch = e.touches[0]
          onDragStart?.(tag, { clientX: touch.clientX, clientY: touch.clientY })
        } : undefined}
      >
        <ShapeIcon shape={tag.shape} color={tag.color} size={tag.size} strokeWidth={1.5} />
        {isEditing && <div className="tag-ring" style={{ width: tag.size + 10, height: tag.size + 10 }} />}
      </div>

      {tag.shortTitle && (
        <div className={`tag-label ${tag.isPrivate? 'tag-label--private' : ''}`}>{tag.shortTitle}</div>
      )}
    </div>
  )
}
