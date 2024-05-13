import React, { memo } from 'react'
import {
  useWindowDimensions,
  type StyleProp,
  type ViewStyle,
  View,
  type ColorValue,
} from 'react-native'
import Animated, {
  useSharedValue,
  type SharedValue,
  useAnimatedStyle,
  withDecay,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated'
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler'

import type { Metering } from '../Recorder.types'

import {
  METERING_MAX_POWER,
  METERING_MIN_POWER,
  TIMELINE_MS_PER_LINE,
  TIMELINE_TOTAL_WIDTH_PER_250_MS,
  WAVEFORM_CONTAINER_HEIGHT,
  WAVEFORM_LINE_WIDTH,
  WAVEFORM_MAX_HEIGHT,
  WAVEFORM_TINT_COLOR,
} from '../helpers'
import { TimeIndicator } from './TimeIndicator'
import { Timeline } from './Timeline'

interface WaveformProps {
  meterings: Metering[]
  recording: boolean
  playing: boolean
  waveformMaxWidth: number
  scrollX: SharedValue<number>
}

interface WaveformLineProps {
  position: number
  db: number
  color: ColorValue
}

export const Waveform = (props: WaveformProps) => {
  const { scrollX, waveformMaxWidth, meterings = [], recording, playing } = props

  const dimensions = useWindowDimensions()

  const prevScrollX = useSharedValue(0)

  const $waveformWrapper: StyleProp<ViewStyle> = [
    {
      height: WAVEFORM_CONTAINER_HEIGHT,
      left: dimensions.width / 2 - WAVEFORM_LINE_WIDTH / 2,
    },
    useAnimatedStyle(() => ({
      transform: [
        {
          translateX: scrollX.value,
        },
      ],
    })),
  ]

  const $waveformLineStyles: StyleProp<ViewStyle> = [
    $waveformLines,
    {
      backgroundColor: 'green',
      width: waveformMaxWidth,
    },
  ]

  const pan = Gesture.Pan()
    .onBegin(() => {
      prevScrollX.value = scrollX.value
    })
    .onChange((e) => {
      const x = prevScrollX.value + e.translationX
      scrollX.value = x
    })
    .onFinalize((e) => {
      scrollX.value = withDecay({
        velocity: e.velocityX,
        deceleration: 0.995,
        rubberBandEffect: true,
        rubberBandFactor: 1,
        clamp: [-waveformMaxWidth, 0],
      })
    })
    .activeOffsetX([-10, 10])
    .enabled(!recording && !playing)

  return (
    <GestureHandlerRootView style={$gestureHandler}>
      <GestureDetector gesture={pan}>
        <View>
          <View style={$background} />
          <Animated.View style={$waveformWrapper}>
            <View style={$waveformLineStyles}>
              {meterings.map(({ position, key, db }, index, arr) => (
                <WaveformLine
                  key={key}
                  position={position}
                  db={db}
                  color={
                    recording ? (index === arr.length - 1 ? 'pink' : WAVEFORM_TINT_COLOR) : 'gray'
                  }
                />
              ))}
            </View>
            <Timeline />
          </Animated.View>
          <TimeIndicator />
        </View>
      </GestureDetector>
    </GestureHandlerRootView>
  )
}

const WaveformLine = memo((props: WaveformLineProps) => {
  const { db, color, position } = props
  return (
    <View
      style={[
        $waveformLine,
        {
          backgroundColor: color,
          left: (position / TIMELINE_MS_PER_LINE) * TIMELINE_TOTAL_WIDTH_PER_250_MS,
          height: interpolate(
            db,
            [METERING_MIN_POWER, METERING_MAX_POWER],
            [1, WAVEFORM_MAX_HEIGHT],
            Extrapolation.CLAMP
          ),
        },
      ]}
    />
  )
})

const $gestureHandler: ViewStyle = {
  flexGrow: 1,
}

const $waveformLines: ViewStyle = {
  height: WAVEFORM_CONTAINER_HEIGHT,
  position: 'absolute',
  flexDirection: 'row',
  alignItems: 'center',
}

const $waveformLine: ViewStyle = {
  position: 'absolute',
  width: WAVEFORM_LINE_WIDTH,
}

const $background: ViewStyle = {
  position: 'absolute',
  backgroundColor: 'red',
  left: 0,
  right: 0,
  height: WAVEFORM_CONTAINER_HEIGHT,
}
