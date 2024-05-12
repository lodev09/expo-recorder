import React, { forwardRef, type Ref, useImperativeHandle } from 'react'
import { View } from 'react-native'
// import Animated, { Extrapolation, interpolate, useAnimatedStyle } from 'react-native-reanimated'

import type { RecorderProps, RecorderRef } from './Recorder.types'

// const MAX_RECORDING_TIME = 120000 // 2m

// const METERING_MIN_POWER = Platform.select({ ios: -50, android: -100 })
// const METERING_MAX_POWER = 0

// const RECORDING_INDICATOR_SCALE = 0.5

// const WAVEFORM_MAX_HEIGHT = 160
// const WAVEFORM_CONTAINER_HEIGHT = WAVEFORM_MAX_HEIGHT + spacing.md * 2

// const TIMELINE_MS_PER_LINE = 250 // ms
// const TIMELINE_UPDATE_INTERVAL = 50 // ms
// const TIMELINE_GAP_PER_250_MS = spacing.lg

// const TIMELINE_HEIGHT = spacing.xl

// const TIMELINE_POSITION_INDICATOR_WIDTH = 2
// const WAVEFORM_LINE_WIDTH = 1

// const TIMELINE_TOTAL_WIDTH_PER_250_MS = TIMELINE_GAP_PER_250_MS + WAVEFORM_LINE_WIDTH
// const TIMELINES = Array.from({ length: MAX_RECORDING_TIME / TIMELINE_MS_PER_LINE + 1 }).map((i) => i)

// interface Metering {
//   position: number
//   key: number
//   db: number
// }

export const Recorder = forwardRef((_props: RecorderProps, ref: Ref<RecorderRef>) => {
  /*const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  const [meterings, setMeterings] = useState<Metering[]>([])
  const [position, setPosition] = useState(0)
  const [duration, setDuration] = useState(0)

  const waveformMaxWidth = (duration / TIMELINE_MS_PER_LINE) * TIMELINE_TOTAL_WIDTH_PER_250_MS

  const isScrollAnimating = useSharedValue(false)
  const scrollX = useSharedValue(0)
  const scale = useSharedValue(1)
  const currentMs = useSharedValue(0)*/

  useImperativeHandle(ref, () => ({
    record: async () => {},
  }))

  return <View />
})
