import type { ColorValue, ViewProps } from 'react-native'

export interface PlaybackStatus {
  position: number
  duration?: number
}

export interface RecorderProps extends Omit<ViewProps, 'children'> {
  /**
   * The main background color of the waveform container.
   */
  backgroundColor?: ColorValue

  /**
   * The background color of the recording progress.
   */
  progressBackgroundColor?: ColorValue

  /**
   * The progress update interval while recording.
   * In milliseconds
   *
   * @default 50
   */
  progressInterval?: number

  /**
   * The maximum recording duration in milliseconds.
   *
   * @default 120000
   */
  maxDuration?: number

  /**
   * Height of the wave form
   * @default 160
   */
  waveformHeight?: number

  /**
   * The waveform active tint color
   *
   * @default #d72d66
   */
  waveformActiveColor?: ColorValue

  /**
   * Inactive waveform color
   *
   * @default #7987a0
   */
  waveformInactiveColor?: ColorValue

  /**
   * Tint color used on the time indicator.
   * @type {[type]}
   */
  tintColor?: ColorValue

  /**
   * The gap between timelines per 250ms.
   *
   * @default 24
   */
  timelineGap?: number

  /**
   * The color of the timeline.
   */
  timelineColor?: ColorValue

  /**
   * Called when position changed, in milliseconds.
   * Either by dragging, playing, or recording.
   */
  onPositionChange?: (position: number) => void

  /**
   * Called when record has started.
   * @param position - the current position it started.
   */
  onRecordStart?: (uri?: string | null) => void

  /**
   * Called when record has stopped.
   * @param position - the current position it stopped.
   * @param duration - the duration of the recording
   */
  onRecordStop?: (uri?: string | null, duration?: number, meterings?: Metering[]) => void

  /**
   * Called when recording has been reset.
   */
  onRecordReset?: () => void

  /**
   * Called when playback has started.
   * @param status - the current position it started.
   */
  onPlaybackStart?: (status?: PlaybackStatus) => void

  /**
   * Called when playback has stopped.
   * @param status - the current position it stopped.
   */
  onPlaybackStop?: (status?: PlaybackStatus) => void
}

export interface RecorderRef {
  startRecording: () => Promise<void>
  stopRecording: () => Promise<void>
  resetRecording: () => Promise<void>
  startPlayback: () => Promise<void>
  stopPlayback: () => Promise<void>
}

export interface Metering {
  position: number
  key: number
  db: number
}
