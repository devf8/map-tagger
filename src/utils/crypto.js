// encodeURIComponent before btoa makes it safe for any Unicode characters in session data
export function encryptSession(data) {
  return btoa(encodeURIComponent(JSON.stringify(data)))
}

export function decryptSession(text) {
  if (text.trimStart().startsWith('{')) return JSON.parse(text)
  try {
    return JSON.parse(decodeURIComponent(atob(text.trim())))
  } catch {
    throw new Error('Failed to decode session file.')
  }
}
