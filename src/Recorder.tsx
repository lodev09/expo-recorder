import React, {
  forwardRef,
  type Ref,
  useImperativeHandle,
  useState,
  useEffect,
  useRef,
} from 'react'
import { View, Text, type TextStyle } from 'react-native'
import { type AVPlaybackStatus, Audio } from 'expo-av'
import {
  runOnJS,
  useDerivedValue,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated'

import type { Metering, RecorderProps, RecorderRef } from './Recorder.types'
import { Waveform } from './components'
import {
  MAX_RECORDING_TIME,
  METERING_MIN_POWER,
  RECORDING_INDICATOR_SCALE,
  SPRING_CONFIG,
  SPRING_SHORT_CONFIG,
  TIMELINE_MS_PER_LINE,
  TIMELINE_TOTAL_WIDTH_PER_250_MS,
  TIMELINE_UPDATE_INTERVAL,
  formatTimer,
  spacing,
} from './helpers'

export const Recorder = forwardRef((props: RecorderProps, ref: Ref<RecorderRef>) => {
  const { ...rest } = props

  const recording = useRef<Audio.Recording>()
  const sound = useRef<Audio.Sound>()
  const recordingUri = useRef<string>()

  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  const [meterings, setMeterings] = useState<Metering[]>([])
  const [position, setPosition] = useState(0)
  const [duration, setDuration] = useState(0)

  const waveformMaxWidth = (duration / TIMELINE_MS_PER_LINE) * TIMELINE_TOTAL_WIDTH_PER_250_MS

  const isScrollAnimating = useSharedValue(false)
  const scrollX = useSharedValue(0)
  const scale = useSharedValue(1)
  const currentMs = useSharedValue(0)

  useDerivedValue(() => {
    if (isPlaying) return
    if (isRecording) return
    if (isScrollAnimating.value) return

    if (scrollX.value <= 0) {
      const ms =
        Math.floor(
          ((Math.abs(scrollX.value) / TIMELINE_TOTAL_WIDTH_PER_250_MS) * TIMELINE_MS_PER_LINE) / 100
        ) * 100

      if (ms <= duration && ms !== currentMs.value) {
        runOnJS(setPosition)(ms)
        currentMs.value = ms
      }
    } else {
      runOnJS(setPosition)(0)
    }
  })

  const handlePlaybackStatus = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      if (status.didJustFinish) {
        setIsPlaying(false)
      } else if (status.isPlaying && status.positionMillis >= (status.durationMillis ?? 0)) {
        // Android workaround: force pause when position reached duration
        setIsPlaying(false)
        sound.current?.pauseAsync()
      }

      setPosition(status.positionMillis)
    }
  }

  const handleRecordingStatus = (status: Audio.RecordingStatus) => {
    if (status.isRecording && status.durationMillis > 0) {
      setDuration(status.durationMillis)

      if (status.durationMillis > MAX_RECORDING_TIME) {
        return
      }

      setPosition(status.durationMillis)
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

  const reset = async () => {
    setIsPlaying(false)
    setIsRecording(false)

    setMeterings([])
    setPosition(0)
    setDuration(0)

    recordingUri.current = undefined

    await recording.current?.stopAndUnloadAsync()
    recording.current = undefined

    await sound.current?.stopAsync()
    await sound.current?.unloadAsync()
    sound.current = undefined

    await Audio.setAudioModeAsync({ allowsRecordingIOS: false })
  }

  const resetScroll = (callback: () => void) => {
    isScrollAnimating.value = true
    scrollX.value = withSpring(0, SPRING_CONFIG, () => {
      isScrollAnimating.value = false
      runOnJS(callback)()
    })
  }

  const playAtPosition = async (ms: number) => {
    if (!sound.current) return

    await sound.current.setPositionAsync(ms)
    await sound.current.playAsync()
    setIsPlaying(true)
  }

  const stopRecording = async () => {
    if (!isRecording) return
    if (!recording.current) return

    try {
      await recording.current?.stopAndUnloadAsync()
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false })

      const uri = recording.current?.getURI()
      if (uri) {
        const newSound = new Audio.Sound()
        newSound.setOnPlaybackStatusUpdate(handlePlaybackStatus)

        await newSound.loadAsync({ uri })
        await newSound.setProgressUpdateIntervalAsync(TIMELINE_UPDATE_INTERVAL)

        // Sync position and duration ms
        const currentStatus = await newSound.getStatusAsync()
        if (currentStatus.isLoaded) {
          const durationMillis = currentStatus.durationMillis ?? duration
          await newSound.setPositionAsync(durationMillis)

          setPosition(durationMillis)
          setDuration(durationMillis)
        }

        sound.current = newSound
        recordingUri.current = uri
      }
    } catch (e) {
      console.error(e)
    } finally {
      recording.current = undefined
      setIsRecording(false)
    }
  }

  useEffect(() => {
    if (isRecording) {
      scrollX.value = withTiming(-waveformMaxWidth, { duration: TIMELINE_UPDATE_INTERVAL })
    }
  }, [isRecording, waveformMaxWidth])

  useEffect(() => {
    if (isPlaying) {
      const x = (position / TIMELINE_MS_PER_LINE) * TIMELINE_TOTAL_WIDTH_PER_250_MS
      scrollX.value = withTiming(-Math.min(x, waveformMaxWidth), {
        duration: TIMELINE_UPDATE_INTERVAL,
      })
    }
  }, [isPlaying, position])

  useEffect(() => {
    if (isRecording && duration >= MAX_RECORDING_TIME) {
      stopRecording()
    }
  }, [duration, isRecording])

  useEffect(() => {
    if (isRecording) {
      scale.value = withSpring(RECORDING_INDICATOR_SCALE, SPRING_SHORT_CONFIG)
      scrollX.value = withSpring(0, SPRING_CONFIG)
    } else {
      scale.value = withSpring(1, SPRING_SHORT_CONFIG)
    }
  }, [isRecording])

  useImperativeHandle(ref, () => ({
    startRecording: async () => {
      if (isRecording) return
      if (recording.current) return

      setMeterings([])
      setPosition(0)
      setIsRecording(true)

      const newRecording = new Audio.Recording()
      recording.current = newRecording

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      })

      newRecording.setProgressUpdateInterval(TIMELINE_UPDATE_INTERVAL)
      newRecording.setOnRecordingStatusUpdate(handleRecordingStatus)

      await newRecording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY)
      await newRecording.startAsync()
    },
    resetRecording: async () => {
      if (meterings.length > 0) {
        resetScroll(reset)
      } else {
        await reset()
      }
    },
    playSound: async () => {
      if (isPlaying) return

      const playPosition = position / 100 < Math.floor(duration / 100) ? position : 0
      if (playPosition === 0) {
        resetScroll(() => playAtPosition(0))
      } else {
        await playAtPosition(playPosition)
      }
    },
    stopSound: async () => {
      if (!sound.current) return
      if (!isPlaying) return

      await sound.current.pauseAsync()
      setIsPlaying(false)
    },
  }))

  return (
    <View {...rest}>
      <Waveform
        meterings={isRecording ? meterings.slice(-60) : meterings}
        waveformMaxWidth={waveformMaxWidth}
        recording={isRecording}
        playing={isPlaying}
        scrollX={scrollX}
      />
      <View style={{ padding: spacing.md, marginTop: spacing.xxl }}>
        <Text style={$positionText}>{formatTimer(Math.round(position / 100) * 100, true)}</Text>
      </View>
    </View>
  )
})

const $positionText: TextStyle = {
  fontWeight: 'medium',
  fontSize: spacing.xxl,
  textAlign: 'center',
}
