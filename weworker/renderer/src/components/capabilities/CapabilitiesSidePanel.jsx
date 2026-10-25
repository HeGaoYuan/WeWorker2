import React, { useEffect, useRef, useState } from 'react'
import { useSitesStore } from '../../store/sites.js'
import { useCapabilitiesPanelStore } from '../../store/capabilities-panel.js'
import SitesCapabilitiesView from './SitesCapabilitiesView.jsx'
import Tooltip from '../Tooltip.jsx'
import { GridViewIcon, ListViewIcon, SearchIcon } from '../icons/PanelIcons.jsx'

const headerBtnStyle = {
  width: 28,
  height: 28,
  borderRadius: 6,
  border: 'none',
  background: 'var(--bg-tertiary)',
  color: 'var(--text-muted)',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 0,
  flexShrink: 0,
}

const VIEW_MODE_BUTTON_SIZE = 28
const VIEW_MODE_BUTTON_GAP = 4

const viewModeSwitcherStyle = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  gap: VIEW_MODE_BUTTON_GAP,
  flexShrink: 0,
}

const viewModeIndicatorStyle = (viewMode) => ({
  position: 'absolute',
  top: 0,
  left: viewMode === 'grid' ? VIEW_MODE_BUTTON_SIZE + VIEW_MODE_BUTTON_GAP : 0,
  width: VIEW_MODE_BUTTON_SIZE,
  height: VIEW_MODE_BUTTON_SIZE,
  borderRadius: 6,
  background: 'color-mix(in srgb, var(--accent) 14%, var(--bg-tertiary))',
  boxShadow: 'inset 0 0 0 1px color-mix(in srgb, var(--accent) 32%, transparent)',
  pointerEvents: 'none',
  transition: 'left 190ms ease',
})

const viewModeButtonStyle = (active) => ({
  ...headerBtnStyle,
  position: 'relative',
  zIndex: 1,
  background: 'transparent',
  color: active ? 'var(--accent)' : headerBtnStyle.color,
  boxShadow: 'none',
  transition: 'color 190ms ease',
})

export default function CapabilitiesSidePanel({ width = 340 }) {
  const closePanel = useCapabilitiesPanelStore((s) => s.closePanel)
  const viewMode = useCapabilitiesPanelStore((s) => s.viewMode)
  const setViewMode = useCapabilitiesPanelStore((s) => s.setViewMode)
  const load = useSitesStore((s) => s.load)
  const sites = useSitesStore((s) => s.sites)
  const [query, setQuery] = useState('')
  const searchRef = useRef(null)


  useEffect(() => {
    load()
  }, [load])

  const focusSearch = () => {
    searchRef.current?.focus()
  }

  return (
    <aside style={{
      width,
      flexShrink: 0,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      borderLeft: '1px solid var(--border)',
      background: 'var(--bg-secondary)',
      overflow: 'hidden',
    }}>
      <header style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 8,
        padding: '8px 10px',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
        background: 'var(--bg-secondary)',
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 6,
          }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', flexShrink: 0 }}>场景总览</div>
              <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-muted)', fontSize: 10.5 }}>
                {sites.length} 个网站
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
              <div style={viewModeSwitcherStyle}>
                <span style={viewModeIndicatorStyle(viewMode)} />
              <Tooltip text="网站列表">
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  aria-label="网站列表视图"
                  title="网站列表"
                  style={viewModeButtonStyle(viewMode === 'list')}
                >
                  <ListViewIcon />
                </button>
              </Tooltip>
              <Tooltip text="所有网站">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  aria-label="所有网站视图"
                  title="所有网站"
                  style={viewModeButtonStyle(viewMode === 'grid')}
                >
                  <GridViewIcon />
                </button>
              </Tooltip>
              </div>
              <Tooltip text="收起面板">
                <button
                  type="button"
                  onClick={closePanel}
                  aria-label="收起场景总览"
                  style={{ ...headerBtnStyle, fontSize: 16, lineHeight: 1 }}
                >
                  ✕
                </button>
              </Tooltip>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 7, alignItems: 'center' }}>
            <input
              ref={searchRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') e.currentTarget.blur()
              }}
              placeholder="搜索网站或场景…"
              style={{
                flex: 1,
                minWidth: 0,
                padding: '5px 9px',
                fontSize: 12,
                borderRadius: 8,
                border: '1px solid var(--border)',
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
            />
            <button
              type="button"
              onClick={focusSearch}
              title="搜索"
              aria-label="搜索"
              style={{
                width: 32,
                height: 30,
                flexShrink: 0,
                borderRadius: 8,
                border: '1px solid var(--border)',
                background: 'var(--bg-primary)',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
              }}
            >
              <SearchIcon />
            </button>
          </div>
        </div>
      </header>
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          scrollbarGutter: 'stable',
          padding: '8px 8px 10px',
          boxSizing: 'border-box',
          minHeight: 0,
        }}
      >
        <SitesCapabilitiesView
          searchQuery={query}
          onSearchQueryChange={setQuery}
          hideToolbarSearch
          viewMode={viewMode}
        />
      </div>
    </aside>
  )
}
