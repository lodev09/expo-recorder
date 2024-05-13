import React, { memo } from 'react'
import { View, type TextStyle, type ViewStyle, Text, type ColorValue } from 'react-native'

import {
  TIMELINES,
  TIMELINE_GAP_PER_250_MS,
  TIMELINE_HEIGHT,
  WAVEFORM_LINE_WIDTH,
  formatTimer,
  spacing,
} from '../helpers'

const DEFAULT_COLOR = 'rgba(0, 0, 0, 0.5)'

interface TimelineProps {
  color?: ColorValue
}

export const Timeline = memo(({ color }: TimelineProps) => {
  const timelineColor = color ?? DEFAULT_COLOR

  return (
    <View style={$container}>
      {TIMELINES.map((lineMs) => {
        const isSeconds = lineMs % 4 === 0
        const height = isSeconds ? spacing.sm : spacing.xs
        return (
          <View key={String(lineMs)}>
            <View style={{ height, width: WAVEFORM_LINE_WIDTH, backgroundColor: timelineColor }} />
            {isSeconds && (
              <Text style={[$timelineSeconds, { color: timelineColor }]}>
                {formatTimer((lineMs / 4) * 1000)}
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
  width: spacing.xxl,
  fontSize: 14,
  bottom: 0,
}

const $container: ViewStyle = {
  position: 'absolute',
  bottom: -TIMELINE_HEIGHT,
  flexDirection: 'row',
  height: TIMELINE_HEIGHT,
  gap: TIMELINE_GAP_PER_250_MS,
}
