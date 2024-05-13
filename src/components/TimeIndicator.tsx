import React, { memo } from 'react'
import { View, type ViewStyle } from 'react-native'

import { TIMELINE_POSITION_INDICATOR_WIDTH, WAVEFORM_CONTAINER_HEIGHT, spacing } from '../helpers'

export const TimeIndicator = memo(() => {
  return (
    <View style={$lineIndicator}>
      <View style={[$dot, $top]} />
      <View style={[$dot, $bottom]} />
    </View>
  )
})

const $lineIndicator: ViewStyle = {
  position: 'absolute',
  height: WAVEFORM_CONTAINER_HEIGHT,
  width: TIMELINE_POSITION_INDICATOR_WIDTH,
  backgroundColor: 'blue',
  alignSelf: 'center',
  alignItems: 'center',
  justifyContent: 'center',
}

const $dot: ViewStyle = {
  alignSelf: 'center',
  height: spacing.xs,
  width: spacing.xs,
  backgroundColor: 'blue',
  borderRadius: spacing.xs / 2,
}

const $top: ViewStyle = { top: 0 }
const $bottom: ViewStyle = { bottom: 0 }
