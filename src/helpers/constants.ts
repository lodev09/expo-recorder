import { Platform } from 'react-native'
import type { WithSpringConfig } from 'react-native-reanimated'

export const METERING_MIN_POWER = Platform.select({ default: -50, android: -100 })
export const METERING_MAX_POWER = 0

export const WAVEFORM_LINE_WIDTH = 1
export const TIMELINE_MS_PER_LINE = 250 // ms

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
