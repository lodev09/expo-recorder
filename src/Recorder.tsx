import React, {
  forwardRef,
  type Ref,
  useImperativeHandle,
  useState,
  useEffect,
  useRef,
} from 'react'
import { type AVPlaybackStatus, Audio } from 'expo-av'
import {
  runOnJS,
  useDerivedValue,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated'

import type { Metering, PlaybackStatus, RecorderProps, RecorderRef } from './Recorder.types'
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

  const recording = useRef<Audio.Recording>()
  const sound = useRef<Audio.Sound>()
  const recordingUri = useRef<string>()

  const [isRecording, setIsRecording] = useState(false)
  const [isPreviewPlaying, setisPreviewPlaying] = useState(false)

  const [meterings, setMeterings] = useState<Metering[]>([])
  const [position, setPosition] = useState(0)
  const [duration, setDuration] = useState(0)

  const timelineTotalWidthPer250ms = timelineGap + WAVEFORM_LINE_WIDTH
  const waveformMaxWidth = (duration / TIMELINE_MS_PER_LINE) * timelineTotalWidthPer250ms

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
    if (isScrollAnimating.value) return

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

  const handlePlaybackStatus = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      if (status.didJustFinish) {
        setisPreviewPlaying(false)
        onPlaybackStop?.({ position: status.positionMillis, duration: status.durationMillis })
      } else if (status.isPlaying && status.positionMillis >= (status.durationMillis ?? 0)) {
        // Android workaround: force pause when position reached duration
        setisPreviewPlaying(false)
        sound.current?.pauseAsync()
      }

      updatePosition(status.positionMillis)
    }
  }

  const handleRecordingStatus = (status: Audio.RecordingStatus) => {
    if (status.isRecording && status.durationMillis > 0) {
      setDuration(status.durationMillis)

      if (status.durationMillis > maxDuration) {
        return
      }

      updatePosition(status.durationMillis)
      setMeterings((prev) => {
        return [
          ...prev,
          {
            position: status.durationMillis,
            key: status.durationMillis + prev.length,
            db: status.metering ?? METERING_MIN_POWER,
          },
        ]
      })
    }
  }

  const record = async () => {
    if (isRecording) return
    if (recording.current) return

    setMeterings([])
    updatePosition(0)
    setIsRecording(true)

    const newRecording = new Audio.Recording()
    recording.current = newRecording

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    })

    newRecording.setProgressUpdateInterval(progressInterval)
    newRecording.setOnRecordingStatusUpdate(handleRecordingStatus)

    await newRecording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY)
    const status = await newRecording.startAsync()
    onRecordStart?.(status.uri)
  }

  const reset = async () => {
    setisPreviewPlaying(false)
    setIsRecording(false)

    setMeterings([])
    updatePosition(0)
    setDuration(0)

    recordingUri.current = undefined

    await recording.current?.stopAndUnloadAsync()
    recording.current = undefined

    await sound.current?.stopAsync()
    await sound.current?.unloadAsync()
    sound.current = undefined

    await Audio.setAudioModeAsync({ allowsRecordingIOS: false })
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
    if (!sound.current) return

    await sound.current.setPositionAsync(ms)
    const playStatus = await sound.current.playAsync()

    let status: PlaybackStatus | undefined
    if (playStatus.isLoaded) {
      status = { position: playStatus.positionMillis, duration: playStatus.durationMillis }
    }

    onPlaybackStart?.(status)
    setisPreviewPlaying(true)
  }

  const stopRecording = async () => {
    if (!isRecording) return
    if (!recording.current) return

    await recording.current?.stopAndUnloadAsync()
    await Audio.setAudioModeAsync({ allowsRecordingIOS: false })

    let durationMillis: number | undefined
    const uri = recording.current?.getURI()
    if (uri) {
      const newSound = new Audio.Sound()
      newSound.setOnPlaybackStatusUpdate(handlePlaybackStatus)

      await newSound.loadAsync({ uri })
      await newSound.setProgressUpdateIntervalAsync(progressInterval)

      // Sync position and duration ms
      const currentStatus = await newSound.getStatusAsync()
      if (currentStatus.isLoaded) {
        durationMillis = currentStatus.durationMillis ?? duration
        await newSound.setPositionAsync(durationMillis)

        updatePosition(durationMillis)
        setDuration(durationMillis)
      }

      sound.current = newSound
      recordingUri.current = uri
    }

    recording.current = undefined
    setIsRecording(false)

    onRecordStop?.(uri, durationMillis, meterings)
  }

  useEffect(() => {
    if (isRecording) {
      scrollX.value = withTiming(-waveformMaxWidth, { duration: progressInterval })
    }
  }, [isRecording, waveformMaxWidth])

  useEffect(() => {
    if (isPreviewPlaying) {
      const x = (position / TIMELINE_MS_PER_LINE) * timelineTotalWidthPer250ms
      scrollX.value = withTiming(-Math.min(x, waveformMaxWidth), {
        duration: progressInterval,
      })
    }
  }, [isPreviewPlaying, position])

  useEffect(() => {
    if (isRecording && duration >= maxDuration) {
      stopRecording()
    }
  }, [duration, isRecording, maxDuration])

  useEffect(() => {
    if (isRecording) {
      scrollX.value = withSpring(0, SPRING_CONFIG)
    }
  }, [isRecording])

  useImperativeHandle(ref, () => ({
    startRecording: async () => {
      if (meterings.length > 0) {
        resetScroll(record)
      } else {
        await record()
      }
    },
    stopRecording,
    resetRecording: async () => {
      if (isRecording) return

      if (meterings.length > 0) {
        resetScroll(reset)
      } else {
        await reset()
      }
    },
    startPlayback: async () => {
      if (isRecording) return
      if (isPreviewPlaying) return

      const playPosition = position / 100 < Math.floor(duration / 100) ? position : 0
      if (playPosition === 0) {
        resetScroll(() => playbackAtPosition(0))
      } else {
        await playbackAtPosition(playPosition)
      }
    },
    stopPlayback: async () => {
      if (!sound.current) return
      if (!isPreviewPlaying) return

      const pauseStatus = await sound.current.pauseAsync()

      let status: PlaybackStatus | undefined
      if (pauseStatus.isLoaded) {
        status = { position: pauseStatus.positionMillis, duration: pauseStatus.durationMillis }
      }

      onPlaybackStop?.(status)
      setisPreviewPlaying(false)
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
