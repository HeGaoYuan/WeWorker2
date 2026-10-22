import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { test } from 'node:test'
import { resolveSiteIcon } from '../utils/site-icon-resolve.js'
import { getSiteIconColor, getSiteIconInitials, shouldGenerateSiteIcon } from '../utils/site-icon-generated.js'

const profile = JSON.parse(readFileSync(new URL('../../../build-profile.json', import.meta.url), 'utf8'))
const icons = profile.adapters.map(id => {
  const root = new URL(`../../../../adapters/${id}/`, import.meta.url)
  return [id, ['icon.svg', 'icon.png'].map(name => new URL(name, root)).find(existsSync)]
})

test('every bundled website owns its image in its Adapter root', () => {
  for (const [id, url] of icons) {
    assert.ok(url, `missing Adapter root icon for ${id}`)
    const data = readFileSync(url)
    if (url.pathname.endsWith('.png')) {
      assert.equal(data.subarray(0, 8).toString('hex'), '89504e470d0a1a0a')
    } else {
      assert.match(data.toString(), /^<svg /)
      assert.doesNotMatch(data.toString(), /<script|<foreignObject|href=/i)
    }
  }
})

test('sites without a bundled or manifest icon receive a stable generated icon', () => {
  const site = { id: 'app.example.com', name: 'Application' }
  const resolved = resolveSiteIcon(site)
  assert.deepEqual(resolved, { mode: 'svg', key: 'globe' })
  assert.equal(shouldGenerateSiteIcon(site, false, resolved), true)
  assert.equal(getSiteIconInitials(site), 'AP')
  assert.match(getSiteIconColor(site), /^#[0-9a-f]{6}$/i)
  assert.equal(shouldGenerateSiteIcon(site, true, resolved), false)
  assert.deepEqual(resolveSiteIcon({ icon: 'mail' }), { mode: 'svg', key: 'mail' })
  assert.deepEqual(resolveSiteIcon({ icon: '⭐' }), { mode: 'literal', text: '⭐' })
})

test('all bundled icons have enough source pixels for the welcome grid on a 2x display', () => {
  // Allow 40 CSS px (the welcome grid uses 34). A rectangular logo is contained,
  // so its longest edge needs at least 80 source pixels at devicePixelRatio 2.
  for (const [id, url] of icons) {
    assert.ok(url, `missing Adapter root icon for ${id}`)
    if (url.pathname.endsWith('.svg')) continue
    const data = readFileSync(url)
    const width = data.readUInt32BE(16)
    const height = data.readUInt32BE(20)
    assert.ok(Math.max(width, height) >= 80, `${id}: ${width}x${height} is too small for the welcome grid`)
  }
})
