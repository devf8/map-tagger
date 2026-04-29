import { useState, useRef, useEffect, useCallback } from 'react'
import TagMarker from './TagMarker'
import { getBackgroundCss } from './backgrounds'
import './MapViewer.css'

const MIN_SCALE = 0.05
const MAX_SCALE = 20
const ZOOM_FACTOR = 1.12
const DRAG_THRESHOLD = 4
const TAG_DRAG_MIN = 5  // px movement before tag drag is committed

export default function MapViewer({
  imageUrl, tags, tool, presentationMode, transitionPhase, mapMeta,
  onMapClick, onTagClick, onNavigate, onTagMove, onExitPresentation, editingTagId,
  canNavigateBack, onNavigateBack,
  allLabels = [], hiddenLabels = new Set(), onToggleLabel,
}) {
  const containerRef = useRef(null)
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 })
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [imageError, setImageError] = useState(false)

  // Tag drag state — stored in both state (for rendering) and ref (for handlers)
  const [tagDrag, _setTagDrag] = useState(null)
  const tagDragRef = useRef(null)
  const updateTagDrag = useCallback((updater) => {
    _setTagDrag(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      tagDragRef.current = next
      return next
    })
  }, [])

  const transformRef = useRef({ x: 0, y: 0, scale: 1 })
  const imageSizeRef = useRef({ width: 0, height: 0 })
  const dragRef = useRef(null)
  const hasDraggedRef = useRef(false)

  const applyTransform = useCallback((updater) => {
    setTransform(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      transformRef.current = next
      return next
    })
  }, [])

  useEffect(() => {
    applyTransform({ x: 0, y: 0, scale: 1 })
    setImageSize({ width: 0, height: 0 })
    imageSizeRef.current = { width: 0, height: 0 }
    setImageError(false)
  }, [imageUrl, applyTransform])

  const fitImage = useCallback((nw, nh) => {
    const container = containerRef.current
    if (!container) return
    const { width: cw, height: ch } = container.getBoundingClientRect()
    const scale = Math.min(cw / nw, ch / nh) * 0.72
    const x = (cw - nw * scale) / 2
    const y = (ch - nh * scale) / 2
    applyTransform({ x, y, scale })
  }, [applyTransform])

  const handleImageLoad = useCallback((e) => {
    const { naturalWidth: nw, naturalHeight: nh } = e.target
    const size = { width: nw, height: nh }
    setImageSize(size)
    imageSizeRef.current = size
    fitImage(nw, nh)
  }, [fitImage])

  const handleWheel = useCallback((e) => {
    e.preventDefault()
    const container = containerRef.current
    if (!container) return
    const rect = container.getBoundingClientRect()
    const cx = e.clientX - rect.left
    const cy = e.clientY - rect.top
    const dir = e.deltaY < 0 ? ZOOM_FACTOR : 1 / ZOOM_FACTOR
    applyTransform(prev => {
      const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, prev.scale * dir))
      const ratio = newScale / prev.scale
      return { scale: newScale, x: cx - ratio * (cx - prev.x), y: cy - ratio * (cy - prev.y) }
    })
  }, [applyTransform])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => el.removeEventListener('wheel', handleWheel)
  }, [handleWheel])

  // Called by TagMarker's icon mousedown — starts tag drag instead of map pan
  const handleTagDragStart = useCallback((tag, e) => {
    updateTagDrag({
      id: tag.id,
      origX: tag.x,
      origY: tag.y,
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      currentX: tag.x,
      currentY: tag.y,
      hasMoved: false,
    })
  }, [updateTagDrag])

  const handleMouseDown = useCallback((e) => {
    if (e.button !== 0) return
    // Tag drag start is handled by TagMarker (via handleTagDragStart) and stops
    // propagation, so this only fires for clicks on empty map space.
    const t = transformRef.current
    dragRef.current = { startX: e.clientX, startY: e.clientY, tx: t.x, ty: t.y }
    hasDraggedRef.current = false
    setIsDragging(true)
  }, [])

  const handleMouseMove = useCallback((e) => {
    // Tag drag takes priority over map pan
    if (tagDragRef.current) {
      const { startMouseX, startMouseY, origX, origY } = tagDragRef.current
      const dx = e.clientX - startMouseX
      const dy = e.clientY - startMouseY
      if (Math.hypot(dx, dy) >= TAG_DRAG_MIN) {
        const t = transformRef.current
        const { width, height } = imageSizeRef.current
        if (width === 0) return
        const newX = Math.max(0, Math.min(1, origX + dx / (width * t.scale)))
        const newY = Math.max(0, Math.min(1, origY + dy / (height * t.scale)))
        updateTagDrag(prev => prev ? { ...prev, currentX: newX, currentY: newY, hasMoved: true } : null)
      }
      return
    }

    if (!dragRef.current) return
    const { startX, startY, tx, ty } = dragRef.current
    const dx = e.clientX - startX
    const dy = e.clientY - startY
    if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) {
      hasDraggedRef.current = true
    }
    applyTransform(prev => ({ ...prev, x: tx + dx, y: ty + dy }))
  }, [applyTransform, updateTagDrag])

  const handleMouseUp = useCallback((e) => {
    // Finalise tag drag
    if (tagDragRef.current) {
      const drag = tagDragRef.current
      if (drag.hasMoved) onTagMove?.(drag.id, drag.currentX, drag.currentY)
      updateTagDrag(null)
      setIsDragging(false)
      return
    }

    const wasDrag = hasDraggedRef.current
    const startPos = dragRef.current
    dragRef.current = null
    setIsDragging(false)

    if (!wasDrag && !presentationMode && tool === 'tag' && imageSizeRef.current.width > 0 && startPos) {
      const container = containerRef.current
      if (!container) return
      const rect = container.getBoundingClientRect()
      const cx = e.clientX - rect.left
      const cy = e.clientY - rect.top
      const t = transformRef.current
      const { width, height } = imageSizeRef.current
      const rx = (cx - t.x) / (width * t.scale)
      const ry = (cy - t.y) / (height * t.scale)
      if (rx >= 0 && rx <= 1 && ry >= 0 && ry <= 1) {
        onMapClick(rx, ry)
      }
    }
  }, [tool, presentationMode, onMapClick, onTagMove, updateTagDrag])

  const activeTool = presentationMode ? 'pan' : tool
  const cursor = transitionPhase ? 'default'
    : tagDrag ? 'default'
    : activeTool === 'tag' ? 'crosshair'
    : isDragging ? 'default' : 'default'

  const zoomCenter = (dir) => applyTransform(p => {
    const s = Math.min(MAX_SCALE, Math.max(MIN_SCALE, p.scale * (dir > 0 ? ZOOM_FACTOR : 1 / ZOOM_FACTOR)))
    const container = containerRef.current
    const r = container?.getBoundingClientRect()
    const cx = r ? r.width / 2 : 0
    const cy = r ? r.height / 2 : 0
    return { scale: s, x: cx - (s / p.scale) * (cx - p.x), y: cy - (s / p.scale) * (cy - p.y) }
  })

  return (
    <div
      ref={containerRef}
      className={`map-viewer${presentationMode ? ' map-viewer--present' : ''}${transitionPhase ? ` map-viewer--${transitionPhase}` : ''}`}
      style={{ cursor }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {mapMeta?.background && (
        <div
          className="map-bg-pattern"
          style={{ backgroundImage: getBackgroundCss(mapMeta.background) }}
        />
      )}

      {imageUrl && (
        <div
          className="map-image-layer"
          style={{
            transformOrigin: '0 0',
            transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
          }}
        >
          <img
            src={imageUrl}
            alt="Map"
            className="map-image"
            onLoad={handleImageLoad}
            onError={() => setImageError(true)}
            draggable={false}
          />
          {imageSize.width > 0 && (mapMeta?.title || mapMeta?.subtitle) && (
            <div className="map-title-overlay">
              {mapMeta.title    && <h1 className="map-title">{mapMeta.title}</h1>}
              {mapMeta.subtitle && <p  className="map-subtitle">{mapMeta.subtitle}</p>}
            </div>
          )}
          {imageSize.width > 0 && mapMeta?.description && (
            <div className="map-desc-overlay">
              <p className="map-desc-text">{mapMeta.description}</p>
            </div>
          )}
          {imageSize.width > 0 && !presentationMode && mapMeta?.privateNotes && (
            <div className="map-notes-overlay">
              <div className="map-notes-inner">
                <span className="map-notes-label">Editor Notes</span>
                <p className="map-notes-text">{mapMeta.privateNotes}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {imageError && (
        <div className="map-image-error">
          <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 8v4M12 16h.01" strokeLinecap="round"/>
          </svg>
          <span>Image unavailable</span>
        </div>
      )}

      {imageSize.width > 0 && tags.map(tag => {
        if (presentationMode && tag.isPrivate) 
          return null

        const labels = tag.labels ?? []

        if (labels.length > 0 && labels.every(label => hiddenLabels.has(label))) 
          return null

        const t = tagDrag?.id === tag.id
          ? { ...tag, x: tagDrag.currentX, y: tagDrag.currentY }
          : tag
        return (
          <TagMarker
            key={tag.id}
            tag={t}
            transform={transform}
            imageSize={imageSize}
            isEditing={!presentationMode && tag.id === editingTagId}
            onClick={onTagClick}
            onNavigate={onNavigate}
            onDragStart={handleTagDragStart}
            presentationMode={presentationMode}
          />
        )
      })}

      {!presentationMode && (
        <div className="map-hint">
          {activeTool === 'tag'
            ? 'Click on the map to place a tag'
            : 'Scroll to zoom · Drag to pan · Drag a tag icon to move it'}
        </div>
      )}

      <div className="map-zoom-controls">
        <button onClick={() => zoomCenter(1)} title="Zoom in">+</button>
        <button onClick={() => zoomCenter(-1)} title="Zoom out">−</button>
        <button onClick={() => imageSizeRef.current.width > 0 && fitImage(imageSizeRef.current.width, imageSizeRef.current.height)} title="Fit to screen">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M3 7V3h4M17 3h4v4M21 17v4h-4M7 21H3v-4" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {(canNavigateBack || allLabels.length > 0) && (
        <div className="map-top-left">
          {canNavigateBack && (
            <button className="nav-back-btn" onClick={onNavigateBack} title="Go back to previous map">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 5l-7 7 7 7"/>
              </svg>
              Return
            </button>
          )}

          {!presentationMode && allLabels.length > 0 && (
            <div className="label-filter">
              <button
                key="toggle-all-chip "
                className={`lf-chip lf-chip--toggle-all`}
                onClick={() => onToggleLabel('toggle-all')}
                title={`Toggle all`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="" width="16" height="16">
                  <path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
                  <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 0 1 0-1.186A10.004 10.004 0 0 1 10 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0 1 10 17c-4.257 0-7.893-2.66-9.336-6.41ZM14 10a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" clipRule="evenodd" />
                </svg>
              </button>
              
              {allLabels.map(label => (
                <button
                  key={label}
                  className={`lf-chip${hiddenLabels.has(label) ? ' lf-chip--hidden' : ''}`}
                  onClick={() => onToggleLabel(label)}
                  title={hiddenLabels.has(label) ? `Show "${label}"` : `Hide "${label}"`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {presentationMode && (
        <button className="exit-present-btn" onClick={onExitPresentation} title="Editor">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </button>
      )}
    </div>
  )
}
