'use client'

import { SWRConfig } from 'swr'
import { ReactNode } from 'react'

interface SWRProviderProps {
  children: ReactNode
}

export function SWRProvider({ children }: SWRProviderProps) {
  return (
    <SWRConfig
      value={{
        revalidateOnFocus: false,
        revalidateOnReconnect: true,
        dedupingInterval: 5000,
        errorRetryCount: 3,
        errorRetryInterval: 5000,
        shouldRetryOnError: true,
        keepPreviousData: true,
      }}
    >
      {children}
    </SWRConfig>
  )
}
