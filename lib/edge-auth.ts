type TokenPayload = { id: string; exp?: number }

const secret = process.env.JWT_SECRET || 'secret'

function base64UrlToBytes(value: string) {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/')
  const binary = atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '='))
  return Uint8Array.from(binary, char => char.charCodeAt(0))
}

/** Verifies the HS256 tokens issued by lib/auth without importing Node-only packages. */
export async function verifyEdgeToken(token: string): Promise<TokenPayload | null> {
  try {
    const [header, payload, signature] = token.split('.')
    if (!header || !payload || !signature) return null

    const parsedHeader = JSON.parse(new TextDecoder().decode(base64UrlToBytes(header)))
    const parsedPayload = JSON.parse(new TextDecoder().decode(base64UrlToBytes(payload))) as TokenPayload
    if (parsedHeader.alg !== 'HS256' || !parsedPayload.id) return null
    if (parsedPayload.exp && parsedPayload.exp <= Math.floor(Date.now() / 1000)) return null

    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify'])
    const valid = await crypto.subtle.verify('HMAC', key, base64UrlToBytes(signature), new TextEncoder().encode(`${header}.${payload}`))
    return valid ? parsedPayload : null
  } catch {
    return null
  }
}