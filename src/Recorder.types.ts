import type { ViewProps } from 'react-native'

export interface RecorderProps extends Omit<ViewProps, 'children'> {}

export interface RecorderRef {
  record: () => Promise<void>
}
