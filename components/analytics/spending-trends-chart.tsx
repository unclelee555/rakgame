'use client'

import { ResponsiveLine } from '@nivo/line'
import { useTheme } from 'next-themes'

interface SpendingTrendsChartProps {
  data: Array<{
    month: string
    amount: number
  }>
  currency: string
}

export function SpendingTrendsChart({ data, currency }: SpendingTrendsChartProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[400px] text-muted-foreground">
        No data available
      </div>
    )
  }

  // Format month labels (YYYY-MM to MMM YYYY)
  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1)
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  }

  // Transform data for line chart
  const lineData = [
    {
      id: 'spending',
      data: data.map((item) => ({
        x: formatMonth(item.month),
        y: item.amount
      }))
    }
  ]

  return (
    <div className="h-[300px] sm:h-[400px]">
      <ResponsiveLine
        data={lineData}
        margin={{ top: 20, right: 10, bottom: 60, left: 60 }}
        xScale={{ type: 'point' }}
        yScale={{
          type: 'linear',
          min: 0,
          max: 'auto',
          stacked: false,
          reverse: false
        }}
        yFormat=" >-.2f"
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: -45,
          legend: 'Month',
          legendOffset: 50,
          legendPosition: 'middle'
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: `Spending (${currency})`,
          legendOffset: -60,
          legendPosition: 'middle',
          format: (value) => `${value.toLocaleString()}`
        }}
        pointSize={10}
        pointColor={{ theme: 'background' }}
        pointBorderWidth={2}
        pointBorderColor={{ from: 'serieColor' }}
        pointLabelYOffset={-12}
        useMesh={true}
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
        tooltip={({ point }) => (
          <div className="bg-background border rounded px-2 py-1 text-sm">
            <strong>{point.data.xFormatted}</strong>: {currency} {Number(point.data.yFormatted).toLocaleString()}
          </div>
        )}
      />
    </div>
  )
}
