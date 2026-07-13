import React, { memo, useMemo } from 'react'
import { View, type TextStyle, type ViewStyle, Text, type ColorValue } from 'react-native'

import { WAVEFORM_LINE_WIDTH, formatSeconds, Spacing, TIMELINE_MS_PER_LINE } from '../helpers'

const TIMELINE_HEIGHT = Spacing.xl
const DEFAULT_COLOR = 'rgba(0, 0, 0, 0.5)'

interface TimelineProps {
  color?: ColorValue
  gap: number
  duration: number
  page: number
  pageWidth: number
}

export const Timeline = memo(({ color, gap, duration, page, pageWidth }: TimelineProps) => {
  const timelineColor = color ?? DEFAULT_COLOR

  // only mount ticks within ~2 screens of the scroll position
  const ticks = useMemo(() => {
    const tickWidth = gap + WAVEFORM_LINE_WIDTH
    const count = duration / TIMELINE_MS_PER_LINE + 1
    const first = Math.max(0, Math.floor(((page - 2) * pageWidth) / tickWidth))
    const last = Math.min(count - 1, Math.ceil(((page + 2) * pageWidth) / tickWidth))

    const result = []
    for (let index = first; index <= last; index++) {
      result.push(index)
    }

    return result
  }, [duration, gap, page, pageWidth])

  return (
    <View style={$container}>
      {ticks.map((index) => {
        const isSeconds = index % 4 === 0
        const height = isSeconds ? Spacing.sm : Spacing.xs
        const left = index * (gap + WAVEFORM_LINE_WIDTH)
        return (
          <View key={String(index)} style={[$tick, { left }]}>
            <View style={{ height, width: WAVEFORM_LINE_WIDTH, backgroundColor: timelineColor }} />
            {isSeconds && (
              <Text style={[$timelineSeconds, { color: timelineColor }]}>
                {formatSeconds(index / 4)}
              </Text>
            )}
          </View>
        )
      })}
    </View>
  )
})

const $timelineSeconds: TextStyle = {
  position: 'absolute',
  width: Spacing.xxl,
  fontSize: 12,
  bottom: 0,
}

const $tick: ViewStyle = {
  position: 'absolute',
  top: 0,
  bottom: 0,
}

const $container: ViewStyle = {
  position: 'absolute',
  height: TIMELINE_HEIGHT,
  bottom: -TIMELINE_HEIGHT,
}
