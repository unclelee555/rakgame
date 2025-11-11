'use client'

import { ResponsiveBar } from '@nivo/bar'
import { useTheme } from 'next-themes'
import type { Platform } from '@/lib/types/database'

interface PlatformChartProps {
  data: Array<{
    platform: Platform
    amount: number
  }>
  currency: string
}

export function PlatformChart({ data, currency }: PlatformChartProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[400px] text-muted-foreground">
        No data available
      </div>
    )
  }

  return (
    <div className="h-[300px] sm:h-[400px]">
      <ResponsiveBar
        data={data}
        keys={['amount']}
        indexBy="platform"
        margin={{ top: 20, right: 10, bottom: 60, left: 60 }}
        padding={0.3}
        valueScale={{ type: 'linear' }}
        indexScale={{ type: 'band', round: true }}
        colors={{ scheme: 'nivo' }}
        borderColor={{
          from: 'color',
          modifiers: [['darker', 1.6]]
        }}
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: -45,
          legend: 'Platform',
          legendPosition: 'middle',
          legendOffset: 50
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: `Spending (${currency})`,
          legendPosition: 'middle',
          legendOffset: -60,
          format: (value) => `${value.toLocaleString()}`
        }}
        labelSkipWidth={12}
        labelSkipHeight={12}
        labelTextColor={{
          from: 'color',
          modifiers: [['darker', 1.6]]
        }}
        theme={{
          axis: {
            ticks: {
              text: {
                fill: isDark ? '#a1a1aa' : '#52525b'
              }
            },
            legend: {
              text: {
                fill: isDark ? '#a1a1aa' : '#52525b'
              }
            }
          },
          grid: {
            line: {
              stroke: isDark ? '#27272a' : '#e4e4e7'
            }
          },
          tooltip: {
            container: {
              background: isDark ? '#18181b' : '#ffffff',
              color: isDark ? '#fafafa' : '#09090b',
              fontSize: 12,
              borderRadius: 4,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }
          }
        }}
        tooltip={({ indexValue, value }) => (
          <div className="bg-background border rounded px-2 py-1 text-sm">
            <strong>{indexValue}</strong>: {currency} {value.toLocaleString()}
          </div>
        )}
      />
    </div>
  )
}
