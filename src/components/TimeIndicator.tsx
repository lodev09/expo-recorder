import React, { memo } from 'react'
import { View, type ColorValue, type ViewStyle } from 'react-native'

import { spacing } from '../helpers'

interface TimeIndicatorProps {
  color?: ColorValue
  height: number
}

export const TimeIndicator = memo(({ color, height }: TimeIndicatorProps) => {
  const backgroundColor = color ?? 'white'
  return (
    <View style={[$lineIndicator, { backgroundColor, height }]}>
      <View style={[$dot, { backgroundColor }, $top]} />
      <View style={[$dot, { backgroundColor }, $bottom]} />
    </View>
  )
})

const $lineIndicator: ViewStyle = {
  position: 'absolute',
  width: 2,
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
