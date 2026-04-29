import ShapeIcon from './ShapeIcon'
import './Toolbar.css'

const SHAPES = ['circle', 'square', 'triangle', 'star', 'diamond']

const PRESETS = [
  '#5c7cfa', '#e74c3c', '#f39c12', '#2ecc71',
  '#1abc9c', '#e91e63', '#9b59b6', '#ecf0f1',
]

export default function Toolbar({ tool, onToolChange, tagDefaults, onTagDefaultsChange, onPresent, sidebarVisible, onToggleSidebar }) {
  const set = (key, value) => onTagDefaultsChange(prev => ({ ...prev, [key]: value }))

  return (
    <div className="toolbar">
      {/* Sidebar toggle */}
      <button
        className="tool-btn sidebar-toggle-btn"
        onClick={onToggleSidebar}
        title={sidebarVisible ? 'Hide sidebar' : 'Show sidebar'}
      >
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          {sidebarVisible
            ? <><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/></>
            : <><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/><path d="M14 9l3 3-3 3"/></>
          }
        </svg>
      </button>

      <div className="toolbar-divider" />

      {/* Mode toggle */}
      <div className="toolbar-group">
        <button
          className={`tool-btn ${tool === 'pan' ? 'active' : ''}`}
          onClick={() => onToolChange('pan')}
          title="Pan / Explore"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18"/>
          </svg>
          Pan
        </button>
        <button
          className={`tool-btn ${tool === 'tag' ? 'active' : ''}`}
          onClick={() => onToolChange('tag')}
          title="Tag"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          Tag
        </button>
      </div>
      <div className="toolbar-divider" />
      <span className="toolbar-label">Defaults</span>
      <div className="toolbar-divider" />

      {/* Shape picker */}
      <div className="toolbar-group">
        <span className="toolbar-label">Shape</span>
        <div className="shape-picker">
          {SHAPES.map(shape => (
            <button
              key={shape}
              className={`shape-btn ${tagDefaults.shape === shape ? 'active' : ''}`}
              onClick={() => set('shape', shape)}
              title={shape.charAt(0).toUpperCase() + shape.slice(1)}
            >
              <ShapeIcon shape={shape} color={tagDefaults.shape === shape ? tagDefaults.color : '#8892aa'} size={18} />
            </button>
          ))}
        </div>
      </div>

      <div className="toolbar-divider" />

      {/* Color picker */}
      <div className="toolbar-group">
        <span className="toolbar-label">Color</span>
        <div className="color-row">
          {PRESETS.map(c => (
            <button
              key={c}
              className={`color-swatch ${tagDefaults.color === c ? 'active' : ''}`}
              style={{ background: c }}
              onClick={() => set('color', c)}
              title={c}
            />
          ))}
          <label className="color-custom" title="Custom color">
            <input
              type="color"
              value={tagDefaults.color}
              onChange={e => set('color', e.target.value)}
            />
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 8v8M8 12h8" strokeLinecap="round"/>
            </svg>
          </label>
        </div>
      </div>

      <div className="toolbar-divider" />

      {/* Size slider */}
      <div className="toolbar-group">
        <span className="toolbar-label">Size <em>{tagDefaults.size}px</em></span>
        <input
          type="range"
          min="12"
          max="64"
          value={tagDefaults.size}
          onChange={e => set('size', +e.target.value)}
          className="size-slider"
        />
      </div>

      {/* Opacity slider */}
      <div className="toolbar-group">
        <span className="toolbar-label" style={{ marginLeft: '4px' }}>Opacity <em>{Math.round(tagDefaults.opacity)}%</em></span>
        <input
          type="range"
          min="0"
          max="100"
          step="10"
          value={tagDefaults.opacity}
          onChange={e => set('opacity', +e.target.value)}
          className="size-slider"
        />
      </div>


      {/* Present button — pushed to the right */}
      <div style={{ flex: 1 }} />
      <button className="tool-btn present-btn" onClick={onPresent} title="Enter presentation mode">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2"/>
          <path d="M8 21h8M12 17v4"/>
        </svg>
        Present
      </button>
    </div>
  )
}
