import React, {
  forwardRef,
  type Ref,
  useImperativeHandle,
  useState,
  useEffect,
  useRef,
  useMemo,
} from 'react'
import {
  useAudioRecorder,
  useAudioPlayer,
  setAudioModeAsync,
  useAudioRecorderState,
  useAudioPlayerStatus,
  RecordingPresets,
} from 'expo-audio'
import {
  runOnJS,
  useDerivedValue,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated'

import type {
  Metering,
  PlaybackStatus,
  RecordInfo,
  RecorderProps,
  RecorderRef,
} from './Recorder.types'
import { Waveform } from './components'
import {
  METERING_MIN_POWER,
  SPRING_CONFIG,
  TIMELINE_MS_PER_LINE,
  WAVEFORM_LINE_WIDTH,
  Spacing,
} from './helpers'

const DEFAULT_MAX_DURATION = 120000 // 2m
const DEFAULT_TIMELINE_GAP_PER_250_MS = Spacing.lg
const DEFAULT_TIMELINE_UPDATE_INTERVAL = 50 // ms

export const Recorder = forwardRef((props: RecorderProps, ref: Ref<RecorderRef>) => {
  const {
    progressInterval = DEFAULT_TIMELINE_UPDATE_INTERVAL,
    onPositionChange,
    onRecordStart,
    onRecordStop,
    onRecordReset,
    onPlaybackStart,
    onPlaybackStop,
    timelineGap = DEFAULT_TIMELINE_GAP_PER_250_MS,
    maxDuration = DEFAULT_MAX_DURATION,
    ...rest
  } = props

  const audioRecorder = useAudioRecorder({
    ...RecordingPresets.HIGH_QUALITY,
    isMeteringEnabled: true,
  })
  const recorderState = useAudioRecorderState(audioRecorder, progressInterval)

  const audioPlayer = useAudioPlayer(null, {
    updateInterval: progressInterval,
  })
  const playerStatus = useAudioPlayerStatus(audioPlayer)

  const recordingUri = useRef<string>()

  const [meterings, setMeterings] = useState<Metering[]>([])
  const [position, setPosition] = useState(0)
  const [duration, setDuration] = useState(0)

  // Derived from audio hooks
  const isRecording = recorderState.isRecording && recorderState.isRecording
  const isPreviewPlaying = playerStatus.playing

  const timelineTotalWidthPer250ms = timelineGap + WAVEFORM_LINE_WIDTH

  const waveformMaxWidth = useMemo(
    () => (duration / TIMELINE_MS_PER_LINE) * timelineTotalWidthPer250ms,
    [duration]
  )

  const isScrollAnimating = useSharedValue(false)
  const scrollX = useSharedValue(0)
  const currentMs = useSharedValue(0)

  const updatePosition = (positionMs: number) => {
    setPosition(positionMs)
    onPositionChange?.(positionMs)
  }

  useDerivedValue(() => {
    if (isPreviewPlaying) return
    if (isRecording) return
    // if (isScrollAnimating.value) return

    if (scrollX.value <= 0) {
      const ms =
        Math.floor(
          ((Math.abs(scrollX.value) / timelineTotalWidthPer250ms) * TIMELINE_MS_PER_LINE) / 100
        ) * 100

      if (ms <= duration && ms !== currentMs.value) {
        runOnJS(updatePosition)(ms)
        currentMs.value = ms
      }
    } else {
      runOnJS(updatePosition)(0)
    }
  })

  const record = async () => {
    if (isRecording) return

    await setAudioModeAsync({
      playsInSilentMode: true,
      allowsRecording: true,
      interruptionMode: 'doNotMix',
    })

    setMeterings([])
    updatePosition(0)

    // Prepare and start recording
    await audioRecorder.prepareToRecordAsync()

    audioRecorder.record()

    const event: RecordInfo = { uri: audioRecorder.uri ?? undefined }
    onRecordStart?.(event)

    return event
  }

  const reset = async () => {
    // Stop playback if playing
    if (isPreviewPlaying) {
      audioPlayer.pause()
    }

    // Stop recording if recording
    if (isRecording) {
      await audioRecorder.stop()
    }

    setMeterings([])
    updatePosition(0)
    setDuration(0)

    recordingUri.current = undefined

    // Remove audio player source
    audioPlayer.remove()

    onRecordReset?.()
  }

  const resetScroll = (callback: () => void) => {
    isScrollAnimating.value = true
    scrollX.value = withSpring(0, SPRING_CONFIG, () => {
      isScrollAnimating.value = false
      runOnJS(callback)()
    })
  }

  const playbackAtPosition = async (ms: number) => {
    if (!recordingUri.current) return

    await setAudioModeAsync({
      playsInSilentMode: true,
      allowsRecording: false,
      interruptionMode: 'doNotMix',
    })

    // Load the audio if not already loaded
    if (!audioPlayer.isLoaded) {
      audioPlayer.replace({ uri: recordingUri.current })
    }

    // Seek to position (in seconds)
    audioPlayer.seekTo(ms / 1000)
    audioPlayer.play()

    let status: PlaybackStatus | undefined
    if (playerStatus?.duration) {
      status = {
        position: ms,
        duration: Math.floor(playerStatus.duration * 1000),
      }
    }

    onPlaybackStart?.(status)
  }

  const stop = async () => {
    if (!isRecording) return

    await audioRecorder.stop()

    const uri = audioRecorder.uri ?? undefined

    let durationMillis: number | undefined = duration

    if (uri) {
      // Load the recorded audio into the player
      audioPlayer.replace({ uri })

      recordingUri.current = uri

      // Wait a bit for the player to load and get duration
      // In expo-audio, duration becomes available after loading
      await new Promise((resolve) => setTimeout(resolve, 100))

      if (audioPlayer.duration) {
        durationMillis = Math.floor(audioPlayer.duration * 1000)
        setDuration(durationMillis)
      }

      // Set position to end of recording
      if (durationMillis) {
        await audioPlayer.seekTo(durationMillis / 1000)
        updatePosition(durationMillis)
      }
    }

    const event: RecordInfo = {
      uri,
      duration: durationMillis,
      meterings,
    }

    onRecordStop?.(event)
    return event
  }

  // handles wave form updates during recording
  useEffect(() => {
    if (isRecording) {
      scrollX.value = withTiming(-waveformMaxWidth, { duration: progressInterval })
    }
  }, [isRecording, waveformMaxWidth])

  // handles wave form updates during playback
  useEffect(() => {
    if (isPreviewPlaying) {
      const x = (position / TIMELINE_MS_PER_LINE) * timelineTotalWidthPer250ms
      scrollX.value = withTiming(-Math.min(x, waveformMaxWidth), {
        duration: progressInterval,
      })
    }
  }, [isPreviewPlaying, position])

  // stops recording if it exceeds the max duration
  useEffect(() => {
    if (isRecording && duration >= maxDuration) {
      stop()
    }
  }, [duration, isRecording, maxDuration])

  // Handle PLAYBACK status updates from the AUDIO PLAYER
  useEffect(() => {
    if (playerStatus.playing && !playerStatus.didJustFinish) {
      // Update position during playback
      const positionMs = Math.floor(playerStatus.currentTime * 1000)
      updatePosition(positionMs)
    } else if (!playerStatus.playing && playerStatus.didJustFinish) {
      // Handle playback completion
      const playbackCurrentMs = playerStatus.currentTime * 1000
      const playbackDurationMs = playerStatus.duration * 1000
      audioPlayer.pause()
      onPlaybackStop?.({
        position: Math.floor(playbackCurrentMs),
        duration: Math.floor(playbackDurationMs),
      })
    }
  }, [
    playerStatus.playing,
    playerStatus.currentTime,
    playerStatus.duration,
    playerStatus.didJustFinish,
  ])

  // Handle RECORDING status updates from the AUDIO RECORDER
  useEffect(() => {
    if (isRecording && recorderState.durationMillis > 0) {
      setDuration(recorderState.durationMillis)

      if (recorderState.durationMillis > maxDuration) {
        return
      }

      updatePosition(recorderState.durationMillis)

      // Add metering data if available
      if (recorderState.metering !== undefined) {
        setMeterings((prev) => {
          return [
            ...prev,
            {
              position: recorderState.durationMillis,
              key: recorderState.durationMillis + prev.length,
              db: recorderState.metering ?? METERING_MIN_POWER,
            },
          ]
        })
      }
    }
  }, [isRecording, recorderState.durationMillis, recorderState.metering])

  useImperativeHandle(ref, () => ({
    startRecording: async () => {
      if (meterings.length > 0) {
        return new Promise((resolve) => {
          resetScroll(async () => {
            const info = await record()
            resolve(info)
          })
        })
      } else {
        return await record()
      }
    },
    stopRecording: stop,
    resetRecording: async () => {
      if (isRecording) return

      if (meterings.length > 0) {
        return new Promise((resolve) => {
          resetScroll(async () => {
            await reset()
            resolve()
          })
        })
      } else {
        return await reset()
      }
    },
    startPlayback: async () => {
      if (isRecording) return
      if (isPreviewPlaying) return

      const playPosition = position / 100 < Math.floor(duration / 100) ? position : 0
      if (playPosition === 0) {
        return new Promise((resolve) => {
          resetScroll(async () => {
            await playbackAtPosition(0)
            resolve()
          })
        })
      } else {
        return await playbackAtPosition(playPosition)
      }
    },
    stopPlayback: async () => {
      if (!isPreviewPlaying) return

      audioPlayer.pause()

      let status: PlaybackStatus | undefined
      if (playerStatus?.currentTime !== undefined && playerStatus?.duration) {
        status = {
          position: Math.floor(playerStatus.currentTime * 1000),
          duration: Math.floor(playerStatus.duration * 1000),
        }
      }

      onPlaybackStop?.(status)
    },
  }))

  return (
    <Waveform
      timelineGap={timelineGap}
      maxDuration={maxDuration}
      meterings={isRecording ? meterings.slice(-60) : meterings}
      waveformMaxWidth={waveformMaxWidth}
      recording={isRecording}
      playing={isPreviewPlaying}
      scrollX={scrollX}
      {...rest}
    />
  )
})
