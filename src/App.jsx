import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import MapViewer from './components/MapViewer'
import TagEditor from './components/TagEditor'
import MapEditor from './components/MapEditor'
import AddMapModal from './components/AddMapModal'
import ImageList from './components/ImageList'
import Toolbar from './components/Toolbar'
import SessionGate from './components/SessionGate'
import PasswordPrompt from './components/PasswordPrompt'
import './App.css'

export default function App() {
  const [hasSession, setHasSession] = useState(false)
  const [sessionMeta, setSessionMeta] = useState({ password: '', title: '', description: '', defaultMapId: '' })
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false)

  const [images, setImages] = useState([])
  const [selectedImage, setSelectedImage] = useState(null)
  const [tags, setTags] = useState([])
  const [editingTag, setEditingTag] = useState(null)
  const [isNewTag, setIsNewTag] = useState(false)
  const [editingMap, setEditingMap] = useState(null)
  const [showAddMap, setShowAddMap] = useState(false)
  const [tool, setTool] = useState('pan')
  const [tagDefaults, setTagDefaults] = useState({ shape: 'circle', color: '#5c7cfa', size: 20, opacity: 100 })
  const [hiddenLabels, setHiddenLabels] = useState(new Set())
  const [presentationMode, setPresentationMode] = useState(false)
  const [sidebarVisible, setSidebarVisible] = useState(true)
  const [mapTransition, setMapTransition] = useState(null)
  const [mapHistory, setMapHistory] = useState([])
  const transitionTimer = useRef(null)

  useEffect(() => () => clearTimeout(transitionTimer.current), [])

  const selectImage = useCallback((image) => {
    setSelectedImage(image)
    setTags(image.tags ?? [])
    setEditingTag(null)
    setHiddenLabels(new Set())
  }, [])

  const allLabels = useMemo(
    () => [...new Set(tags.flatMap(t => t.labels ?? []))].filter(Boolean).sort(),
    [tags]
  )

  const handleToggleLabel = useCallback((label) => {
    if (label === 'toggle-all') {
      if (hiddenLabels.size <= allLabels.length && hiddenLabels.size > 0) {
        setHiddenLabels(new Set());
      } else {
        setHiddenLabels(new Set(allLabels));
      }
      return;
    }

    setHiddenLabels(prev => {
      const next = new Set(prev)
      next.has(label) ? next.delete(label) : next.add(label)
      return next
    })
  }, [hiddenLabels, allLabels])

  // Accepts already-parsed JSON data { password, title, description, defaultMapId, images }
  const handleImport = useCallback((data) => {
    const importedImages = data.images ?? []
    const defaultImage =
      importedImages.find(i => i.id === data.defaultMapId) ?? importedImages[0] ?? null
    setSessionMeta({
      password: data.password ?? '',
      title: data.title ?? '',
      description: data.description ?? '',
      defaultMapId: defaultImage?.id ?? '',
    })
    setImages(importedImages)
    if (defaultImage) {
      setSelectedImage(defaultImage)
      setTags(defaultImage.tags ?? [])
    } else {
      setSelectedImage(null)
      setTags([])
    }
    setEditingTag(null)
    setMapHistory([])
    setPresentationMode(true)
    setSidebarVisible(true)
    setHasSession(true)
  }, [])

  const handleCreateSession = useCallback((meta) => {
    setSessionMeta({
      password: meta.password ?? '',
      title: meta.title ?? '',
      description: meta.description ?? '',
      defaultMapId: '',
    })
    setImages([])
    setSelectedImage(null)
    setTags([])
    setEditingTag(null)
    setMapHistory([])
    setPresentationMode(false)
    setSidebarVisible(true)
    setHasSession(true)
  }, [])

  const handleSetDefaultMap = useCallback((imageId) => {
    setSessionMeta(prev => ({ ...prev, defaultMapId: imageId }))
  }, [])

  const handleToggleDefaultMap = useCallback((imageId, checked) => {
    setSessionMeta(prev => ({
      ...prev,
      defaultMapId: checked ? imageId : (prev.defaultMapId === imageId ? '' : prev.defaultMapId),
    }))
  }, [])

  const handleExport = useCallback(() => {
    const data = {
      password: sessionMeta.password,
      title: sessionMeta.title,
      description: sessionMeta.description,
      defaultMapId: sessionMeta.defaultMapId || images[0]?.id || '',
      images,
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${(sessionMeta.title || 'map-session').replace(/[^a-z0-9]/gi, '-')}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [sessionMeta, images])

  const enterPresentation = useCallback(() => {
    setEditingTag(null)
    setTool('pan')
    setPresentationMode(true)
    setHiddenLabels(new Set())
  }, [])

  const exitPresentation = useCallback(() => {
    if (sessionMeta.password) {
      setShowPasswordPrompt(true)
    } else {
      setPresentationMode(false)
    }
  }, [sessionMeta.password])

  const handlePasswordConfirm = useCallback((input) => {
    if (input === sessionMeta.password) {
      setShowPasswordPrompt(false)
      setPresentationMode(false)
      return true
    }
    return false
  }, [sessionMeta.password])

  const navigateToMap = useCallback((targetImageId) => {
    const target = images.find(i => i.id === targetImageId)
    if (!target) return
    clearTimeout(transitionTimer.current)
    setMapTransition('exit')
    setMapHistory(prev => selectedImage ? [...prev, selectedImage.id] : prev)
    transitionTimer.current = setTimeout(() => {
      selectImage(target)
      setMapTransition('enter')
      transitionTimer.current = setTimeout(() => setMapTransition(null), 380)
    }, 300)
  }, [images, selectImage, selectedImage])

  const navigateBack = useCallback(() => {
    setMapHistory(prev => {
      if (prev.length === 0) return prev
      const prevId = prev[prev.length - 1]
      const prevImage = images.find(i => i.id === prevId)
      if (prevImage) {
        clearTimeout(transitionTimer.current)
        setMapTransition('exit')
        transitionTimer.current = setTimeout(() => {
          selectImage(prevImage)
          setMapTransition('enter')
          transitionTimer.current = setTimeout(() => setMapTransition(null), 380)
        }, 300)
      }
      return prev.slice(0, -1)
    })
  }, [images, selectImage])

  const handleSidebarSelect = useCallback((image) => {
    selectImage(image)
    setMapHistory([])
  }, [selectImage])

  const handleAddMap = useCallback((formData) => {
    const newImage = {
      id: crypto.randomUUID(),
      imageUrl: formData.imageUrl,
      displayName: formData.displayName || '',
      title: formData.title || '',
      subtitle: formData.subtitle || '',
      description: formData.description || '',
      tags: [],
    }
    setImages(prev => [...prev, newImage])
    selectImage(newImage)
    setShowAddMap(false)
    // First map added becomes the default automatically
    setSessionMeta(prev => prev.defaultMapId ? prev : { ...prev, defaultMapId: newImage.id })
  }, [selectImage])

  const deleteImage = useCallback((imageId) => {
    setImages(prev =>
      prev
        .filter(i => i.id !== imageId)
        .map(img => ({
          ...img,
          tags: img.tags?.map(t =>
            t.linkedMapId === imageId ? { ...t, linkedMapId: null, linkButtonText: '' } : t
          ) ?? [],
        }))
    )
    if (selectedImage?.id === imageId) {
      setSelectedImage(null)
      setTags([])
      setEditingTag(null)
    }
    setSessionMeta(prev =>
      prev.defaultMapId === imageId ? { ...prev, defaultMapId: '' } : prev
    )
  }, [selectedImage])

  const persistTags = useCallback((newTags) => {
    if (!selectedImage) return
    setTags(newTags)
    setImages(prev => prev.map(img =>
      img.id === selectedImage.id ? { ...img, tags: newTags } : img
    ))
  }, [selectedImage])

  const handleTagMove = useCallback((tagId, newX, newY) => {
    persistTags(tags.map(t => t.id === tagId ? { ...t, x: newX, y: newY } : t))
  }, [tags, persistTags])

  const handleMapClick = useCallback((x, y) => {
    const newTag = {
      id: crypto.randomUUID(), x, y,
      shortTitle: '', fullTitle: 'New Tag', description: '',
      editorNotes: '',
      shape: tagDefaults.shape, 
      color: tagDefaults.color, 
      size: tagDefaults.size, 
      opacity: tagDefaults.opacity,
      tooltipPosition: 'top', linkedMapId: null, linkButtonText: '',
    }
    setEditingTag(newTag)
    setIsNewTag(true)
  }, [tagDefaults])

  const handleTagClick = useCallback((tag) => {
    setEditingTag({ ...tag })
    setIsNewTag(false)
  }, [])

  const handleSaveTag = useCallback((tag) => {
    const newTags = isNewTag ? [...tags, tag] : tags.map(t => t.id === tag.id ? tag : t)
    persistTags(newTags)
    setEditingTag(null)
  }, [isNewTag, tags, persistTags])

  const handleDeleteTag = useCallback((tagId) => {
    persistTags(tags.filter(t => t.id !== tagId))
    setEditingTag(null)
  }, [tags, persistTags])

  const handleReorderImages = useCallback((dragId, targetId) => {
    const from = images.findIndex(i => i.id === dragId)
    const to = images.findIndex(i => i.id === targetId)
    if (from === -1 || to === -1 || from === to) return
    const next = [...images]
    const [item] = next.splice(from, 1)
    next.splice(to, 0, item)
    setImages(next)
  }, [images])

  const handleSaveMapMeta = useCallback((imageId, meta) => {
    setImages(prev => prev.map(img => img.id === imageId ? { ...img, ...meta } : img))
    setSelectedImage(prev => prev?.id === imageId ? { ...prev, ...meta } : prev)
    setEditingMap(null)
  }, [])

  const linkableImages = images.filter(img => img.id !== selectedImage?.id)
  const mapMeta = selectedImage ? {
    title: selectedImage.title,
    subtitle: selectedImage.subtitle,
    description: selectedImage.description,
    background: selectedImage.background,
  } : null

  if (!hasSession) {
    return (
      <div className="app no-sidebar">
        <main className="main">
          <SessionGate onImport={handleImport} onCreate={handleCreateSession} />
        </main>
      </div>
    )
  }

  return (
    <div className={`app${presentationMode ? ' presentation' : ''}${!sidebarVisible && !presentationMode ? ' no-sidebar' : ''}`}>
      {!presentationMode && sidebarVisible && (
        <aside className="sidebar">
          <div className="sidebar-header">
            <h1>Map <span>Tagger</span></h1>
            {sessionMeta.title && (
              <p className="sidebar-session-name">{sessionMeta.title}</p>
            )}
          </div>
          <ImageList
            images={images}
            selectedId={selectedImage?.id}
            defaultMapId={sessionMeta.defaultMapId}
            onSelect={handleSidebarSelect}
            onAddMap={() => setShowAddMap(true)}
            onDelete={deleteImage}
            onEdit={setEditingMap}
            onReorder={handleReorderImages}
            onSetDefault={handleSetDefaultMap}
            onImport={handleImport}
            onExport={handleExport}
          />
        </aside>
      )}

      <main className="main">
        {selectedImage ? (
          <>
            {!presentationMode && (
              <Toolbar
                tool={tool}
                onToolChange={setTool}
                tagDefaults={tagDefaults}
                onTagDefaultsChange={setTagDefaults}
                onPresent={enterPresentation}
                sidebarVisible={sidebarVisible}
                onToggleSidebar={() => setSidebarVisible(v => !v)}
              />
            )}
            <MapViewer
              imageUrl={selectedImage.imageUrl}
              tags={tags}
              tool={tool}
              presentationMode={presentationMode}
              transitionPhase={mapTransition}
              mapMeta={mapMeta}
              onMapClick={handleMapClick}
              onTagClick={handleTagClick}
              onNavigate={navigateToMap}
              onTagMove={handleTagMove}
              onExitPresentation={exitPresentation}
              editingTagId={editingTag?.id}
              canNavigateBack={mapHistory.length > 0}
              onNavigateBack={navigateBack}
              allLabels={allLabels}
              hiddenLabels={hiddenLabels}
              onToggleLabel={handleToggleLabel}
            />
          </>
        ) : (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6-3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <h2>No map selected</h2>
            <p>Add a map from the sidebar to get started</p>
          </div>
        )}
      </main>

      {editingTag && !presentationMode && (
        <TagEditor
          tag={editingTag}
          isNew={isNewTag}
          images={linkableImages}
          onSave={handleSaveTag}
          onDelete={handleDeleteTag}
          onCancel={() => setEditingTag(null)}
        />
      )}

      {editingMap && (
        <MapEditor
          image={editingMap}
          isDefault={sessionMeta.defaultMapId === editingMap.id}
          onToggleDefault={handleToggleDefaultMap}
          onSave={handleSaveMapMeta}
          onCancel={() => setEditingMap(null)}
        />
      )}

      {showAddMap && (
        <AddMapModal
          onSave={handleAddMap}
          onCancel={() => setShowAddMap(false)}
        />
      )}

      {showPasswordPrompt && (
        <PasswordPrompt
          onConfirm={handlePasswordConfirm}
          onCancel={() => setShowPasswordPrompt(false)}
        />
      )}
    </div>
  )
}
