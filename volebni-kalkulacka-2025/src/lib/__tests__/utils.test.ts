import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { withBasePath } from '../utils'

const ORIGINAL_ENV = { ...process.env }
const ORIGINAL_NODE_ENV = process.env.NODE_ENV

const setNodeEnv = (value?: string) => {
  if (value === undefined) {
    delete (process.env as Record<string, string | undefined>).NODE_ENV
    return
  }

  Object.defineProperty(process.env, 'NODE_ENV', {
    value,
    configurable: true,
    writable: true,
    enumerable: true,
  })
}

describe('withBasePath', () => {
  beforeEach(() => {
    setNodeEnv(ORIGINAL_NODE_ENV)
    Object.assign(process.env, ORIGINAL_ENV)
  })

  afterEach(() => {
    setNodeEnv(ORIGINAL_NODE_ENV)
    Object.assign(process.env, ORIGINAL_ENV)
  })

  it('returns normalized path in development without base path prefix', () => {
    setNodeEnv('development')
    process.env.NEXT_PUBLIC_BASE_PATH = '/volby2025'

    expect(withBasePath('data/theses.json')).toBe('/data/theses.json')
  })

  it('applies base path in production', () => {
    setNodeEnv('production')
    process.env.NEXT_PUBLIC_BASE_PATH = '/volby2025'

    expect(withBasePath('/data/theses.json')).toBe('/volby2025/data/theses.json')
  })

  it('normalizes missing leading slash', () => {
    setNodeEnv('production')
    process.env.NEXT_PUBLIC_BASE_PATH = '/volby2025'

    expect(withBasePath('data/issues.json')).toBe('/volby2025/data/issues.json')
  })

  it('returns original path when no base path is configured', () => {
    setNodeEnv('production')
    delete process.env.NEXT_PUBLIC_BASE_PATH

    expect(withBasePath('/data/parties.json')).toBe('/data/parties.json')
  })

  it('passthrough for absolute URLs and special protocols', () => {
    setNodeEnv('production')
    process.env.NEXT_PUBLIC_BASE_PATH = '/volby2025'

    expect(withBasePath('https://example.com/app.js')).toBe('https://example.com/app.js')
    expect(withBasePath('mailto:info@example.com')).toBe('mailto:info@example.com')
    expect(withBasePath('tel:+420123456789')).toBe('tel:+420123456789')
  })

  it('returns base path for empty string in production', () => {
    setNodeEnv('production')
    process.env.NEXT_PUBLIC_BASE_PATH = '/volby2025'

    expect(withBasePath('')).toBe('/volby2025')
  })
})