import type { WithSpringConfig } from 'react-native-reanimated'

// expo-audio meters android by peak amplitude, so ambient noise reads ~-45..-30 dB.
// -50 keeps quiet rooms near the baseline on both platforms.
export const METERING_MIN_POWER = -50
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
}
