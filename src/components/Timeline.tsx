import React, { memo } from 'react'
import { View, type TextStyle, type ViewStyle, Text, type ColorValue } from 'react-native'

import { TIMELINES, WAVEFORM_LINE_WIDTH, formatSeconds, spacing } from '../helpers'

const TIMELINE_HEIGHT = spacing.xl
const DEFAULT_COLOR = 'rgba(0, 0, 0, 0.5)'

interface TimelineProps {
  color?: ColorValue
  gap: number
}

export const Timeline = memo(({ color, gap }: TimelineProps) => {
  const timelineColor = color ?? DEFAULT_COLOR

  return (
    <View style={[$container, { gap }]}>
      {TIMELINES.map((lineMs) => {
        const isSeconds = lineMs % 4 === 0
        const height = isSeconds ? spacing.sm : spacing.xs
        return (
          <View key={String(lineMs)}>
            <View style={{ height, width: WAVEFORM_LINE_WIDTH, backgroundColor: timelineColor }} />
            {isSeconds && (
              <Text style={[$timelineSeconds, { color: timelineColor }]}>
                {formatSeconds(lineMs / 4)}
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
  flexDirection: 'row',
  height: TIMELINE_HEIGHT,
  bottom: -TIMELINE_HEIGHT,
}
