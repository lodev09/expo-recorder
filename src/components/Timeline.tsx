import React, { memo } from 'react'
import { View, type TextStyle, type ViewStyle, Text } from 'react-native'

import {
  TIMELINES,
  TIMELINE_GAP_PER_250_MS,
  TIMELINE_HEIGHT,
  WAVEFORM_LINE_WIDTH,
  formatTimer,
  spacing,
} from '../helpers'

export const Timeline = memo(() => {
  return (
    <View style={$container}>
      {TIMELINES.map((lineMs) => {
        const isSeconds = lineMs % 4 === 0
        const height = isSeconds ? spacing.sm : spacing.xs
        return (
          <View key={String(lineMs)}>
            <View style={{ height, width: WAVEFORM_LINE_WIDTH, backgroundColor: 'gray' }} />
            {isSeconds && <Text style={$timelineSeconds}>{formatTimer((lineMs / 4) * 1000)}</Text>}
          </View>
        )
      })}
    </View>
  )
})

const $timelineSeconds: TextStyle = {
  position: 'absolute',
  width: spacing.xxl,
  fontSize: spacing.xs,
  color: 'yellow',
  bottom: 0,
}

const $container: ViewStyle = {
  position: 'absolute',
  bottom: -TIMELINE_HEIGHT,
  flexDirection: 'row',
  height: TIMELINE_HEIGHT,
  gap: TIMELINE_GAP_PER_250_MS,
}
