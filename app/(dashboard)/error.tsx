"use client"

import { useEffect } from "react"
import { ErrorMessage } from "@/components/error-boundary"

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Dashboard error:", error)
  }, [error])

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
      <ErrorMessage
        title="Dashboard Error"
        message={error.message || "An unexpected error occurred"}
        onRetry={reset}
      />
    </div>
  )
}
