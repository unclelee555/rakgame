'use client'

import { ResponsivePie } from '@nivo/pie'
import { useTheme } from 'next-themes'

interface SellerChartProps {
  data: Array<{
    seller: string
    amount: number
  }>
  currency: string
}

export function SellerChart({ data, currency }: SellerChartProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[400px] text-muted-foreground">
        No data available
      </div>
    )
  }

  // Transform data for pie chart
  const pieData = data.map((item) => ({
    id: item.seller,
    label: item.seller,
    value: item.amount
  }))

  return (
    <div className="h-[300px] sm:h-[400px]">
      <ResponsivePie
        data={pieData}
        margin={{ top: 20, right: 20, bottom: 80, left: 20 }}
        innerRadius={0.5}
        padAngle={0.7}
        cornerRadius={3}
        activeOuterRadiusOffset={8}
        borderWidth={1}
        borderColor={{
          from: 'color',
          modifiers: [['darker', 0.2]]
        }}
        arcLinkLabelsSkipAngle={10}
        arcLinkLabelsTextColor={isDark ? '#a1a1aa' : '#52525b'}
        arcLinkLabelsThickness={2}
        arcLinkLabelsColor={{ from: 'color' }}
        arcLabelsSkipAngle={10}
        arcLabelsTextColor={{
          from: 'color',
          modifiers: [['darker', 2]]
        }}
        theme={{
          labels: {
            text: {
              fill: isDark ? '#a1a1aa' : '#52525b'
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
        tooltip={({ datum }) => (
          <div className="bg-background border rounded px-2 py-1 text-sm">
            <strong>{datum.label}</strong>: {currency} {datum.value.toLocaleString()}
          </div>
        )}
        legends={[
          {
            anchor: 'bottom',
            direction: 'row',
            justify: false,
            translateX: 0,
            translateY: 56,
            itemsSpacing: 0,
            itemWidth: 100,
            itemHeight: 18,
            itemTextColor: isDark ? '#a1a1aa' : '#52525b',
            itemDirection: 'left-to-right',
            itemOpacity: 1,
            symbolSize: 18,
            symbolShape: 'circle'
          }
        ]}
      />
    </div>
  )
}
