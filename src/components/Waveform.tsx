import React, { memo } from 'react'
import {
  useWindowDimensions,
  type StyleProp,
  type ViewStyle,
  View,
  type ColorValue,
  type ViewProps,
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
  WAVEFORM_LINE_WIDTH,
  Spacing,
} from '../helpers'
import { TimeIndicator } from './TimeIndicator'
import { Timeline } from './Timeline'

const DEFAULT_WAVEFORM_ACTIVE_COLOR = '#d72d66'
const DEFAULT_WAVEFORM_INACTIVE_COLOR = 'rgba(0, 0, 0, 0.4)'

const DEFAULT_WAVEFORM_HEIGHT = 160
const DEFAULT_BACKGROUND_COLOR = '#f9f9f9'
const DEFAULT_PROGRESS_BACKGROUND_COLOR = '#bbbbbb'

interface WaveformProps extends ViewProps {
  meterings: Metering[]
  maxDuration: number
  recording: boolean
  playing: boolean
  waveformMaxWidth: number
  timelineGap: number
  timelineColor?: ColorValue
  waveformHeight?: number
  waveformActiveColor?: ColorValue
  waveformInactiveColor?: ColorValue
  backgroundColor?: ColorValue
  progressBackgroundColor?: ColorValue
  tintColor?: ColorValue
  scrollX: SharedValue<number>
}

interface WaveformLineProps {
  position: number
  db: number
  color: ColorValue
  maxHeight: number
  gap: number
}

export const Waveform = (props: WaveformProps) => {
  const {
    scrollX,
    meterings = [],
    recording,
    playing,
    backgroundColor = DEFAULT_BACKGROUND_COLOR,
    progressBackgroundColor = DEFAULT_PROGRESS_BACKGROUND_COLOR,
    maxDuration,
    tintColor,
    timelineColor,
    timelineGap,
    waveformMaxWidth,
    waveformHeight = DEFAULT_WAVEFORM_HEIGHT,
    waveformActiveColor = DEFAULT_WAVEFORM_ACTIVE_COLOR,
    waveformInactiveColor = DEFAULT_WAVEFORM_INACTIVE_COLOR,
    style,
  } = props

  const dimensions = useWindowDimensions()
  const waveformContainerHeight = waveformHeight + Spacing.md * 2

  const prevScrollX = useSharedValue(0)

  const $waveformWrapper: StyleProp<ViewStyle> = [
    {
      height: waveformContainerHeight,
      left: dimensions.width / 2 - WAVEFORM_LINE_WIDTH / 2,
    },
    style,
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
      backgroundColor: progressBackgroundColor,
      height: waveformContainerHeight,
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
          <View
            style={[$waveformBackground, { height: waveformContainerHeight, backgroundColor }]}
          />
          <Animated.View style={$waveformWrapper}>
            <View style={$waveformLineStyles}>
              {meterings.map(({ position, key, db }) => (
                <WaveformLine
                  key={key}
                  gap={timelineGap}
                  position={position}
                  db={db}
                  maxHeight={waveformHeight}
                  color={recording ? waveformActiveColor : waveformInactiveColor}
                />
              ))}
            </View>
            <Timeline duration={maxDuration} gap={timelineGap} color={timelineColor} />
          </Animated.View>
          {recording && (
            <View
              style={[
                $progressCover,
                {
                  backgroundColor,
                  height: waveformContainerHeight,
                  left: dimensions.width / 2,
                },
              ]}
            />
          )}
          <TimeIndicator height={waveformContainerHeight} color={tintColor} />
        </View>
      </GestureDetector>
    </GestureHandlerRootView>
  )
}

const WaveformLine = memo((props: WaveformLineProps) => {
  const { db, maxHeight, gap, color, position } = props
  return (
    <View
      style={[
        $waveformLine,
        {
          backgroundColor: color,
          left: (position / TIMELINE_MS_PER_LINE) * (gap + WAVEFORM_LINE_WIDTH),
          height: interpolate(
            db,
            [METERING_MIN_POWER, METERING_MAX_POWER],
            [1, maxHeight],
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
  position: 'absolute',
  flexDirection: 'row',
  alignItems: 'center',
}

const $waveformLine: ViewStyle = {
  position: 'absolute',
  width: WAVEFORM_LINE_WIDTH,
}

const $waveformBackground: ViewStyle = {
  position: 'absolute',
  left: 0,
  right: 0,
}

const $progressCover: ViewStyle = {
  position: 'absolute',
  backgroundColor: 'red',
  right: 0,
}
