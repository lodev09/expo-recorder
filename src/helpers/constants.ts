import { Platform } from 'react-native'
import type { WithSpringConfig } from 'react-native-reanimated'

import { spacing } from './spacing'

export const MAX_RECORDING_TIME = 120000 // 2m

export const METERING_MIN_POWER = Platform.select({ default: -50, android: -100 })
export const METERING_MAX_POWER = 0

export const RECORDING_INDICATOR_SCALE = 0.5

export const WAVEFORM_MAX_HEIGHT = 160
export const WAVEFORM_CONTAINER_HEIGHT = WAVEFORM_MAX_HEIGHT + spacing.md * 2
export const WAVEFORM_TINT_COLOR = '#d72d66'

export const TIMELINE_MS_PER_LINE = 250 // ms
export const TIMELINE_UPDATE_INTERVAL = 50 // ms
export const TIMELINE_GAP_PER_250_MS = spacing.lg

export const TIMELINE_HEIGHT = spacing.xl

export const TIMELINE_POSITION_INDICATOR_WIDTH = 2
export const WAVEFORM_LINE_WIDTH = 1

export const TIMELINE_TOTAL_WIDTH_PER_250_MS = TIMELINE_GAP_PER_250_MS + WAVEFORM_LINE_WIDTH
export const TIMELINES = Array.from(
  {
    length: MAX_RECORDING_TIME / TIMELINE_MS_PER_LINE + 1,
  },
  (_, k) => k
).map((i) => i)

export const SPRING_SHORT_CONFIG: WithSpringConfig = {
  stiffness: 120,
  overshootClamping: true,
}

export const SPRING_CONFIG: WithSpringConfig = {
  damping: 500,
  stiffness: 1000,
  mass: 3,
  overshootClamping: true,
  restDisplacementThreshold: 10,
  restSpeedThreshold: 10,
}
