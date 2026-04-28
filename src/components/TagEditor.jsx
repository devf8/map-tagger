import { useState, useEffect, useCallback, useRef } from 'react'
import ShapeIcon from './ShapeIcon'
import './TagEditor.css'

const SHAPES = ['circle', 'square', 'triangle', 'star', 'diamond']
const PRESETS = [
  '#5c7cfa', '#e74c3c', '#f39c12', '#2ecc71',
  '#1abc9c', '#e91e63', '#9b59b6', '#ecf0f1',
]

// Cross-pattern position picker: [col, row] in a 3×3 grid (1-indexed)
const POSITIONS = [
  { id: 'top',    col: 2, row: 1, label: '↑', title: 'Tooltip above' },
  { id: 'left',   col: 1, row: 2, label: '←', title: 'Tooltip left'  },
  { id: 'right',  col: 3, row: 2, label: '→', title: 'Tooltip right' },
  { id: 'bottom', col: 2, row: 3, label: '↓', title: 'Tooltip below' },
]

export default function TagEditor({ tag, isNew, images = [], onSave, onDelete, onCancel }) {
  const [form, setForm] = useState(tag)
  useEffect(() => { setForm(tag) }, [tag])
  const overlayDownRef = useRef(false)

  const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  const handleSave = useCallback(() => {
    if (!form.fullTitle.trim()) return
    onSave(form)
  }, [form, onSave])

  return (
    <div
      className="tag-editor-overlay"
      onMouseDown={e => { overlayDownRef.current = e.target === e.currentTarget }}
      onClick={() => { if (overlayDownRef.current) onCancel() }}
    >
      <div className="tag-editor" onClick={e => e.stopPropagation()}>

        <div className="te-header">
          <div className="te-preview">
            <ShapeIcon shape={form.shape} color={form.color} size={form.size} strokeWidth={1.5} />
          </div>
          <h2>{isNew ? 'New Tag' : 'Edit Tag'}</h2>
          <button className="te-close" onClick={onCancel} title="Close">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className="te-body">

          {/* ── Content ── */}
          <section className="te-section">
            <h3>Content</h3>
            <label>
              <span>Full Title <em>*</em></span>
              <input
                type="text"
                placeholder=""
                value={form.fullTitle}
                onChange={e => set('fullTitle', e.target.value)}
                autoFocus
              />
            </label>
            <label>
              <span>Short Label <small>shown on map</small></span>
              <input
                type="text"
                placeholder="Capital"
                value={form.shortTitle}
                onChange={e => set('shortTitle', e.target.value)}
                maxLength={40}
              />
            </label>
            <label>
              <span>Description</span>
              <textarea
                placeholder="Details about this tag…"
                value={form.description}
                onChange={e => set('description', e.target.value)}
                rows={3}
              />
            </label>
            <label>
              <span>Editor Notes <small>hidden in presentation</small></span>
              <textarea
                placeholder="Private notes visible only in edit mode…"
                value={form.editorNotes ?? ''}
                onChange={e => set('editorNotes', e.target.value)}
                rows={2}
              />
            </label>
          </section>

          {/* ── Style ── */}
          <section className="te-section">
            <h3>Style</h3>

            <div className="te-field">
              <span>Shape</span>
              <div className="te-shapes">
                {SHAPES.map(shape => (
                  <button
                    key={shape}
                    className={`te-shape-btn ${form.shape === shape ? 'active' : ''}`}
                    onClick={() => set('shape', shape)}
                    title={shape}
                  >
                    <ShapeIcon shape={shape} color={form.shape === shape ? form.color : '#545d7a'} size={22} />
                  </button>
                ))}
              </div>
            </div>

            <div className="te-field">
              <span>Color</span>
              <div className="te-colors">
                {PRESETS.map(c => (
                  <button
                    key={c}
                    className={`te-swatch ${form.color === c ? 'active' : ''}`}
                    style={{ background: c }}
                    onClick={() => set('color', c)}
                    title={c}
                  />
                ))}
                <label className="te-color-custom" title="Custom">
                  <input type="color" value={form.color} onChange={e => set('color', e.target.value)} />
                  <span style={{ background: form.color }} />
                </label>
              </div>
            </div>

            <div className="te-field">
              <span>Size <em>{form.size ?? 20}px</em></span>
              <input
                type="range" min="10" max="64"
                value={form.size ?? 20}
                onChange={e => set('size', +e.target.value)}
                className="te-slider"
              />
            </div>

            <div className="te-field">
              <span>Opacity <em>{form.opacity ?? 100}</em></span>
              <input
                type="range" min="0" max="100"
                value={form.opacity ?? 100}
                onChange={e => set('opacity', +e.target.value)}
                className="te-slider"
              />
            </div>

            <div className="te-field">
              <span>Tooltip Position</span>
              <div className="te-pos-picker">
                {POSITIONS.map(p => (
                  <button
                    key={p.id}
                    className={`te-pos-btn ${(form.tooltipPosition || 'top') === p.id ? 'active' : ''}`}
                    style={{ gridColumn: p.col, gridRow: p.row }}
                    onClick={() => set('tooltipPosition', p.id)}
                    title={p.title}
                  >
                    {p.label}
                  </button>
                ))}
                <div className="te-pos-center" style={{ gridColumn: 2, gridRow: 2 }}>
                  <ShapeIcon shape={form.shape} color={form.color} size={14} />
                </div>
              </div>
            </div>

            <div className="te-field">
              <span>Tooltip gap <em>{form.tooltipGap ?? 20}px</em></span>
              <input
                defaultValue={20}
                type="range" min="20" max="100"
                value={form.tooltipGap}
                onChange={e => set('tooltipGap', +e.target.value)}
                className="te-slider"
              />
            </div>
          </section>

          {/* ── Nested Map ── */}
          <section className="te-section">
            <h3>Nested Map</h3>

            {images.length === 0 ? (
              <p className="te-empty-note">Upload more maps to enable map linking.</p>
            ) : (
              <>
                <div className="te-field">
                  <span>Link to Map</span>
                  <select
                    className="te-select"
                    value={form.linkedMapId ?? ''}
                    onChange={e => set('linkedMapId', e.target.value || null)}
                  >
                    <option value="">— No link —</option>
                    {images.map(img => (
                      <option key={img.id} value={img.id}>{img.displayName || 'Untitled Map'}</option>
                    ))}
                  </select>
                </div>

                {form.linkedMapId && (
                  <label>
                    <span>Button Text</span>
                    <input
                      type="text"
                      placeholder="Open map"
                      value={form.linkButtonText ?? ''}
                      onChange={e => set('linkButtonText', e.target.value)}
                      maxLength={40}
                    />
                  </label>
                )}
              </>
            )}
          </section>
        </div>

        <div className="te-footer">
          {!isNew && (
            <button className="te-btn danger" onClick={() => onDelete(form.id)}>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Delete
            </button>
          )}
          <div style={{ flex: 1 }} />
          <button className="te-btn ghost" onClick={onCancel}>Cancel</button>
          <button
            className="te-btn primary"
            onClick={handleSave}
            disabled={!form.fullTitle.trim()}
          >
            {isNew ? 'Place Tag' : 'Save'}
          </button>
        </div>

      </div>
    </div>
  )
}
