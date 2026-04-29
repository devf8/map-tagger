import { useRef, useCallback, useState } from 'react'
import './ImageList.css'

export default function ImageList({ images, selectedId, defaultMapId, onSelect, onAddMap, onDelete, onEdit, onReorder, onSetDefault, onImport, onExport, onImportBegin, onImportError }) {
  const importInputRef = useRef(null)
  const reorderDragIdRef = useRef(null)
  const [reorderDragId, setReorderDragId] = useState(null)
  const [reorderOverId, setReorderOverId] = useState(null)

  const handleEdit = useCallback((e, img) => {
    e.stopPropagation()
    onEdit(img)
  }, [onEdit])

  const handleImportFile = useCallback((e) => {
    const file = e.target.files[0]
    if (!file) return
    onImportBegin?.()
    const reader = new FileReader()
    reader.onload = (ev) => {
      try { onImport(JSON.parse(ev.target.result)) }
      catch { onImportError?.(); alert('Invalid session file.') }
    }
    reader.readAsText(file)
    e.target.value = ''
  }, [onImport, onImportBegin, onImportError])

  return (
    <div className="image-list">
      <div className="il-actions">
        <button className="add-map-btn" onClick={onAddMap}>
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 5v14M5 12h14" strokeLinecap="round"/>
          </svg>
          Add Map
        </button>
      </div>

      <div className="images-scroll">
        {images.length === 0 ? (
          <div className="images-empty">No maps yet</div>
        ) : (
          images.map(img => (
            <div
              key={img.id}
              draggable={true}
              className={[
                'image-item',
                img.id === selectedId ? 'selected' : '',
                img.id === reorderDragId ? 'reorder-dragging' : '',
                img.id === reorderOverId ? 'reorder-over' : '',
              ].filter(Boolean).join(' ')}
              onClick={() => onSelect(img)}
              onDragStart={e => {
                e.stopPropagation()
                reorderDragIdRef.current = img.id
                setReorderDragId(img.id)
                e.dataTransfer.effectAllowed = 'move'
              }}
              onDragOver={e => {
                if (!reorderDragIdRef.current || reorderDragIdRef.current === img.id) return
                e.preventDefault()
                e.stopPropagation()
                setReorderOverId(img.id)
              }}
              onDragLeave={e => {
                if (!e.currentTarget.contains(e.relatedTarget)) {
                  setReorderOverId(null)
                }
              }}
              onDrop={e => {
                e.preventDefault()
                e.stopPropagation()
                const id = reorderDragIdRef.current
                if (id && id !== img.id) onReorder(id, img.id)
                reorderDragIdRef.current = null
                setReorderDragId(null)
                setReorderOverId(null)
              }}
              onDragEnd={() => {
                reorderDragIdRef.current = null
                setReorderDragId(null)
                setReorderOverId(null)
              }}
            >
              <div className="drag-handle">
                <svg viewBox="0 0 6 14" width="6" height="14" fill="currentColor">
                  <circle cx="1.5" cy="2"  r="1.2"/><circle cx="4.5" cy="2"  r="1.2"/>
                  <circle cx="1.5" cy="7"  r="1.2"/><circle cx="4.5" cy="7"  r="1.2"/>
                  <circle cx="1.5" cy="12" r="1.2"/><circle cx="4.5" cy="12" r="1.2"/>
                </svg>
              </div>
              <div className="image-thumb">
                <img
                  src={img.imageUrl}
                  alt={img.displayName || 'Map'}
                  onError={e => { e.currentTarget.style.opacity = '0' }}
                />
              </div>
              <div className="image-meta">
                <span className="image-name" title={img.displayName || img.imageUrl}>
                  {img.displayName || 'Untitled Map'}
                </span>
                <span className="image-info">
                  {img.id === defaultMapId && <span className="default-badge">default</span>}
                </span>
              </div>
              <div className="image-actions">
                <button
                  className={`image-action-btn${img.id === defaultMapId ? ' is-default' : ''}`}
                  onClick={e => { e.stopPropagation(); onSetDefault(img.id) }}
                  title={img.id === defaultMapId ? 'Default map' : 'Set as default map'}
                >
                  <svg viewBox="0 0 24 24" width="12" height="12" fill={img.id === defaultMapId ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9.5L12 3l9 6.5V21a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z"/>
                    <path d="M9 22V12h6v10"/>
                  </svg>
                </button>
                <button
                  className="image-action-btn"
                  onClick={e => handleEdit(e, img)}
                  title="Edit map info"
                >
                  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="il-data-actions">
        <input
          ref={importInputRef}
          type="file"
          accept=".json"
          style={{ display: 'none' }}
          onChange={handleImportFile}
        />
        <button className="data-btn" onClick={() => importInputRef.current?.click()} title="Import data.json">
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Import
        </button>
        <button className="data-btn" onClick={onExport} title="Export data.json">
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Export
        </button>
      </div>
    </div>
  )
}
