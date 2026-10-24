import { useEffect, useState } from 'react'

export default function useResponsiveSidebar(sidebarWidth) {
  // Reserve room for the 56px navigation rail and a usable conversation area.
  const breakpoint = Math.max(960, sidebarWidth + 56 + 640)
  const query = `(max-width: ${breakpoint - 1}px)`
  const [compact, setCompact] = useState(() => window.matchMedia(query).matches)
  const [desktopCollapsed, setDesktopCollapsed] = useState(false)
  const [compactExpanded, setCompactExpanded] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    const update = () => {
      setCompact(media.matches)
      setCompactExpanded(false)
    }
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [query])

  const collapsed = compact ? !compactExpanded : desktopCollapsed
  const toggle = () => {
    if (compact) setCompactExpanded((current) => !current)
    else setDesktopCollapsed((current) => !current)
  }
  return { compact, collapsed, toggle }
}
