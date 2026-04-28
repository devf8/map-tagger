import { useState, useEffect, useCallback, useRef } from 'react'
import { BACKGROUNDS, getBackgroundCss } from './backgrounds'
import './MapEditor.css'

export default function MapEditor({ image, isDefault, onToggleDefault, onSave, onCancel }) {
  const [form, setForm] = useState({})
  const overlayDownRef = useRef(false)

  useEffect(() => {
    setForm({
      displayName: image.displayName || '',
      title: image.title || '',
      subtitle: image.subtitle || '',
      description: image.description || '',
      background: image.background || '',
    })
  }, [image])

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }))

  const handleSave = useCallback(() => onSave(image.id, form), [image.id, form, onSave])

  return (
    <div
      className="map-editor-overlay"
      onMouseDown={e => { overlayDownRef.current = e.target === e.currentTarget }}
      onClick={() => { if (overlayDownRef.current) onCancel() }}
    >
      <div className="map-editor" onClick={e => e.stopPropagation()}>

        <div className="me-header">
          <svg className="me-header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6-3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
          </svg>
          <h2>Edit Map</h2>
          <button className="me-close" onClick={onCancel}>
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className="me-body">

          <section className="me-section">
            <h3>Identity</h3>
            <label>
              <span>Display Name</span>
              <input
                type="text"
                placeholder="My Map"
                value={form.displayName ?? ''}
                onChange={e => set('displayName', e.target.value)}
                autoFocus
              />
            </label>
            <label>
              <span>Description</span>
              <textarea
                placeholder="A description of this map…"
                value={form.description ?? ''}
                onChange={e => set('description', e.target.value)}
                rows={3}
              />
            </label>
            <div className="me-checkbox-row">
              <label className="me-checkbox-label">
                <input
                  type="checkbox"
                  checked={!!isDefault}
                  onChange={e => onToggleDefault(image.id, e.target.checked)}
                />
                <span>Default map</span>
              </label>
              <small>opened automatically when loading this session</small>
            </div>
          </section>

          <section className="me-section">
            <label>
                <span>Background Pattern</span>
              <select
                className="me-select"
                value={form.background ?? ''}
                onChange={e => set('background', e.target.value)}
              >
                {BACKGROUNDS.map(bg => (
                  <option key={bg.id} value={bg.id}>{bg.label}</option>
                ))}
              </select>
            {form.background && (
              <div
                className="me-bg-preview"
                style={{ backgroundImage: getBackgroundCss(form.background) }}
              />
            )}
            </label>
       
          </section>

          <section className="me-section">
            <h3>Map Header <small>displayed above the map image</small></h3>
            <label>
              <span>Title</span>
              <input
                type="text"
                placeholder="The Kingdom of Terra"
                value={form.title ?? ''}
                onChange={e => set('title', e.target.value)}
              />
            </label>
            <label>
              <span>Subtitle</span>
              <input
                type="text"
                placeholder="A land of adventure"
                value={form.subtitle ?? ''}
                onChange={e => set('subtitle', e.target.value)}
              />
            </label>
          </section>

        </div>

        <div className="me-footer">
          <button className="me-btn ghost" onClick={onCancel}>Cancel</button>
          <button className="me-btn primary" onClick={handleSave}>Save</button>
        </div>

      </div>
    </div>
  )
}
