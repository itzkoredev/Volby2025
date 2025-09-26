import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function withBasePath(path: string) {
  if (!path) {
    return process.env.NODE_ENV === 'development' ? '/' : (process.env.NEXT_PUBLIC_BASE_PATH ?? '') || '/'
  }

  const isAbsoluteUrl = /^(?:[a-z]+:)?\/\//i.test(path) || path.startsWith('mailto:') || path.startsWith('tel:')
  if (isAbsoluteUrl) {
    return path
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`

  // In development we serve without basePath to avoid 404s when running locally.
  if (process.env.NODE_ENV === 'development') {
    return normalizedPath
  }

  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ''
  if (!basePath) {
    return normalizedPath
  }

  const sanitizedBase = basePath.endsWith('/') ? basePath.slice(0, -1) : basePath
  return `${sanitizedBase}${normalizedPath}`
}