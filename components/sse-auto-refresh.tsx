"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export function SSEAutoRefresh() {
  const router = useRouter()

  useEffect(() => {
    const eventSource = new EventSource("/api/stream")

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.action === "refresh") {
          router.refresh()
        }
      } catch (err) {
        console.error("Failed to parse SSE data", err)
      }
    }

    eventSource.onerror = (error) => {
      console.error("SSE error in auto-refresh", error)
      // Optional: Close and reconnect, but browser EventSource auto-reconnects anyway
    }

    return () => {
      eventSource.close()
    }
  }, [router])

  return null
}
