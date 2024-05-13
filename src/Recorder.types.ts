import type { ColorValue, ViewProps } from 'react-native'

export interface RecorderProps extends Omit<ViewProps, 'children'> {
  backgroundColor?: ColorValue
  tintColor?: ColorValue
  timelineColor?: ColorValue
  textColor?: ColorValue
}

export interface RecorderRef {
  startRecording: () => Promise<void>
  resetRecording: () => Promise<void>
  playSound: () => Promise<void>
  stopSound: () => Promise<void>
}

export interface Metering {
  position: number
  key: number
  db: number
}
