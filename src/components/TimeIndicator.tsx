import React, { memo } from 'react'
import { View, type ColorValue, type ViewStyle } from 'react-native'

import { TIMELINE_POSITION_INDICATOR_WIDTH, WAVEFORM_CONTAINER_HEIGHT, spacing } from '../helpers'

interface TimeIndicatorProps {
  color?: ColorValue
}

export const TimeIndicator = memo(({ color }: TimeIndicatorProps) => {
  const backgroundColor = color ?? 'white'
  return (
    <View style={[$lineIndicator, { backgroundColor }]}>
      <View style={[$dot, { backgroundColor }, $top]} />
      <View style={[$dot, { backgroundColor }, $bottom]} />
    </View>
  )
})

const $lineIndicator: ViewStyle = {
  position: 'absolute',
  height: WAVEFORM_CONTAINER_HEIGHT,
  width: TIMELINE_POSITION_INDICATOR_WIDTH,
  alignSelf: 'center',
  alignItems: 'center',
  justifyContent: 'center',
}

const $dot: ViewStyle = {
  position: 'absolute',
  alignSelf: 'center',
  height: spacing.xs,
  width: spacing.xs,
  borderRadius: spacing.xs / 2,
}

const $top: ViewStyle = { top: 0 }
const $bottom: ViewStyle = { bottom: 0 }
