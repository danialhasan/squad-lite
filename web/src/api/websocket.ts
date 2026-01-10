import type { WsEvent } from '@/types'
import { isMockMode, createMockWsClient } from './mock'

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3001/ws'

export type WsClientOptions = {
  onEvent: (event: WsEvent) => void
  onConnect?: () => void
  onDisconnect?: () => void
  onError?: (error: Event) => void
}

const createRealWsClient = (options: WsClientOptions) => {
  let ws: WebSocket | null = null
  let reconnectAttempts = 0
  const maxReconnectAttempts = 5
  const reconnectDelay = 1000

  const connect = () => {
    ws = new WebSocket(WS_URL)

    ws.onopen = () => {
      console.log('[WS] Connected')
      reconnectAttempts = 0
      options.onConnect?.()
    }

    ws.onmessage = (msg) => {
      try {
        const event: WsEvent = JSON.parse(msg.data)
        options.onEvent(event)
      } catch (err) {
        console.error('[WS] Failed to parse message:', err)
      }
    }

    ws.onclose = () => {
      console.log('[WS] Disconnected')
      options.onDisconnect?.()

      // Auto-reconnect
      if (reconnectAttempts < maxReconnectAttempts) {
        reconnectAttempts++
        console.log(`[WS] Reconnecting in ${reconnectDelay}ms (attempt ${reconnectAttempts})`)
        setTimeout(connect, reconnectDelay)
      }
    }

    ws.onerror = (error) => {
      console.error('[WS] Error:', error)
      options.onError?.(error)
    }
  }

  const disconnect = () => {
    if (ws) {
      ws.close()
      ws = null
    }
  }

  const send = (data: unknown) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data))
    }
  }

  return {
    connect,
    disconnect,
    send,
  }
}

// Export the appropriate client based on mock mode
export const createWsClient = (options: WsClientOptions) => {
  if (isMockMode()) {
    console.log('[WS] Using mock WebSocket client')
    return createMockWsClient(options)
  }
  return createRealWsClient(options)
}
