import React, { memo } from 'react'
import { View, type TextStyle, type ViewStyle, Text, type ColorValue } from 'react-native'

import { WAVEFORM_LINE_WIDTH, formatSeconds, Spacing, TIMELINE_MS_PER_LINE } from '../helpers'

const TIMELINE_HEIGHT = Spacing.xl
const DEFAULT_COLOR = 'rgba(0, 0, 0, 0.5)'

interface TimelineProps {
  color?: ColorValue
  gap: number
  duration: number
}

export const Timeline = memo(({ color, gap, duration }: TimelineProps) => {
  const timelineColor = color ?? DEFAULT_COLOR

  const timeline = Array.from({ length: duration / TIMELINE_MS_PER_LINE + 1 })

  return (
    <View style={[$container, { gap }]}>
      {timeline.map((_, index) => {
        const isSeconds = index % 4 === 0
        const height = isSeconds ? Spacing.sm : Spacing.xs
        return (
          <View key={String(index)}>
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

const $container: ViewStyle = {
  position: 'absolute',
  flexDirection: 'row',
  height: TIMELINE_HEIGHT,
  bottom: -TIMELINE_HEIGHT,
}
