import { test, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { FEATURED_VISIBLE_COUNT_KEY, readFeaturedVisibleCount } from '../components/welcome/welcome-utils.js'

const previousWindow = globalThis.window
afterEach(() => {
  if (previousWindow === undefined) delete globalThis.window
  else globalThis.window = previousWindow
})

function savedCount(value) {
  globalThis.window = { localStorage: { getItem: (key) => key === FEATURED_VISIBLE_COUNT_KEY ? value : null } }
}

test('a new homepage shows five sites when no display count was saved', () => {
  savedCount(null)
  assert.equal(readFeaturedVisibleCount(), 5)
})

test('homepage retains the user display count including hiding all sites', () => {
  savedCount('2')
  assert.equal(readFeaturedVisibleCount(), 2)
  savedCount('0')
  assert.equal(readFeaturedVisibleCount(), 0)
})

test('homepage falls back to five for an invalid saved display count', () => {
  savedCount('invalid')
  assert.equal(readFeaturedVisibleCount(), 5)
})
