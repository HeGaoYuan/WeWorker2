const HOST_SUFFIXES = new Set(['com', 'cn', 'net', 'org', 'gov', 'edu'])

const GENERATED_ICON_COLORS = [
  '#2563eb',
  '#0f766e',
  '#7c3aed',
  '#c2410c',
  '#be123c',
  '#4d7c0f',
  '#0369a1',
  '#a16207',
]

function meaningfulText(value) {
  return String(value || '')
    .trim()
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
}

/** Generate a stable two-character monogram for a site without a bundled icon. */
export function getSiteIconInitials(site) {
  const value = meaningfulText(site?.name || site?.id)
  if (!value) return '?'

  const chinese = [...value].filter((char) => /\p{Script=Han}/u.test(char))
  if (chinese.length >= 2) return chinese.slice(0, 2).join('')
  if (chinese.length === 1) return chinese[0]

  const parts = value.split(/[.\s_/:\\-]+/u).filter(Boolean)
  const hostPart = parts.length > 1 && HOST_SUFFIXES.has(parts.at(-1).toLowerCase())
    ? parts[0]
    : null
  if (hostPart) return hostPart.slice(0, 2).toUpperCase()

  const words = value.split(/[^\p{L}\p{N}]+/u).filter(Boolean)
  if (words.length >= 2) return `${[...words[0]][0]}${[...words[1]][0]}`.toUpperCase()
  return [...(words[0] || value)].slice(0, 2).join('').toUpperCase()
}

export function getSiteIconColor(site) {
  const value = meaningfulText(site?.id || site?.name)
  let hash = 0
  for (const char of value) hash = (hash * 31 + char.codePointAt(0)) >>> 0
  return GENERATED_ICON_COLORS[hash % GENERATED_ICON_COLORS.length]
}

export function shouldGenerateSiteIcon(site, hasAsset, resolved) {
  return Boolean(
    site?.id
    && !hasAsset
    && resolved?.mode === 'svg'
    && resolved.key === 'globe',
  )
}
