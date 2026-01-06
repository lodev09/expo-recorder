import React, { forwardRef, useRef, type Ref, useState } from 'react'
import {
  Pressable,
  View,
  type StyleProp,
  type ViewStyle,
  TouchableOpacity,
  Text,
  type TextStyle,
} from 'react-native'
import { getRecordingPermissionsAsync } from 'expo-audio'
import * as Haptics from 'expo-haptics'
import Ionicons from '@expo/vector-icons/Ionicons'
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Recorder, type RecordInfo, type RecorderRef } from '@lodev09/expo-recorder'
import { type TrueSheetProps, TrueSheet } from '@lodev09/react-native-true-sheet'

import { useThemeColor } from '@/hooks/useThemeColor'
import { Box } from './Box'
import { Spacing } from '@/constants/Spacing'
import { formatTimer } from '@/utils/formatTimer'

const RECORD_BUTTON_SIZE = 60
const RECORD_BUTTON_BACKGROUND_SIZE = RECORD_BUTTON_SIZE + Spacing.md
const RECORDING_INDICATOR_COLOR = '#d72d66'
const RECORDING_INDICATOR_SCALE = 0.5

export interface ThemedRecorderSheetProps extends TrueSheetProps {
  lightColor?: string
  darkColor?: string
}

export interface ThemedRecorderSheetRef extends TrueSheet {}

export const ThemedRecorderSheet = forwardRef(
  (props: ThemedRecorderSheetProps, ref: Ref<TrueSheet>) => {
    const { style, lightColor, darkColor, ...rest } = props

    const insets = useSafeAreaInsets()

    const [isRecording, setIsRecording] = useState(false)
    const [isPlaying, setIsPlaying] = useState(false)
    const [position, setPosition] = useState(0)

    const recorderRef = useRef<RecorderRef>(null)

    const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'recorderSheet')
    const progressBackgroundColor = useThemeColor({}, 'recorderProgress')
    const iconColor = useThemeColor({}, 'recorderIcon')
    const tintColor = useThemeColor({}, 'recorderTint')
    const timelineColor = useThemeColor({}, 'recorderTimeline')
    const positionColor = useThemeColor({}, 'text')
    const recordBorderColor = useThemeColor({ light: 'rgba(0,0,0,0.3)' }, 'text')
    const recorderBackgroundColor = useThemeColor({}, 'recorderBackground')
    const waveformInactiveColor = useThemeColor({}, 'recorderWaveformInactive')

    const scale = useSharedValue(1)

    const handleRecordStop = (record?: RecordInfo) => {
      scale.value = withSpring(1)
      setIsRecording(false)

      // Use this uri. Yay! 🎉
      console.log(record?.uri)
      console.log(record?.duration)
      // console.log(record?.meterings)
    }

    const toggleRecording = async () => {
      const permissionStatus = await getRecordingPermissionsAsync()

      if (!permissionStatus.granted) return

      Haptics.selectionAsync()

      if (isRecording) {
        const record = await recorderRef.current?.stopRecording()
        handleRecordStop(record)
      } else {
        await recorderRef.current?.startRecording()

        scale.value = withSpring(RECORDING_INDICATOR_SCALE)
        setIsRecording(true)
      }
    }

    const resetRecording = async () => {
      if (isRecording) return

      Haptics.selectionAsync()
      await recorderRef.current?.resetRecording()
    }

    const togglePlayback = async () => {
      if (isRecording) return

      Haptics.selectionAsync()
      if (isPlaying) {
        await recorderRef.current?.stopPlayback()
      } else {
        await recorderRef.current?.startPlayback()
      }
    }

    const $recordIndicatorStyles: StyleProp<ViewStyle> = [
      $recordIndicator,
      useAnimatedStyle(() => ({
        borderRadius: interpolate(
          scale.value,
          [1, RECORDING_INDICATOR_SCALE],
          [RECORD_BUTTON_SIZE / 2, Spacing.xs],
          Extrapolation.CLAMP
        ),
        transform: [{ scale: scale.value }],
      })),
    ]

    return (
      <TrueSheet
        ref={ref}
        detents={['auto']}
        insetAdjustment="never"
        style={[{ backgroundColor, paddingVertical: insets.bottom + Spacing.md }, style]}
        {...rest}
      >
        <Recorder
          ref={recorderRef}
          tintColor={tintColor}
          waveformInactiveColor={waveformInactiveColor}
          progressInterval={50}
          timelineColor={timelineColor}
          backgroundColor={recorderBackgroundColor}
          progressBackgroundColor={progressBackgroundColor}
          onRecordStop={handleRecordStop}
          onRecordReset={() => {
            scale.value = 1
            setIsRecording(false)
            setIsPlaying(false)
          }}
          onPlaybackStart={() => setIsPlaying(true)}
          onPlaybackStop={() => setIsPlaying(false)}
          onPositionChange={(pos: number) => setPosition(pos)}
        />
        <View style={{ padding: Spacing.md, marginTop: Spacing.xxl }}>
          <Text style={[$positionText, { color: positionColor ?? '#333333' }]}>
            {formatTimer(Math.round(position / 100) * 100, true)}
          </Text>
        </View>
        <Box row justify="space-between" align="center" mt={Spacing.lg}>
          <Box>
            <TouchableOpacity activeOpacity={0.5} style={$recordControl} onPress={resetRecording}>
              <Ionicons name="refresh" size={Spacing.xl} style={{ color: iconColor }} />
            </TouchableOpacity>
          </Box>
          <Box justify="center" align="center" mx={Spacing.xxl}>
            <View style={[$recordButtonBackground, { borderColor: recordBorderColor }]} />
            <Pressable style={$recordButton} onPress={toggleRecording}>
              <Animated.View style={$recordIndicatorStyles} />
            </Pressable>
          </Box>
          <Box>
            <TouchableOpacity activeOpacity={0.8} style={$recordControl} onPress={togglePlayback}>
              <Ionicons
                name={isPlaying ? 'pause' : 'play'}
                size={Spacing.xl}
                style={{ color: iconColor }}
              />
            </TouchableOpacity>
          </Box>
        </Box>
      </TrueSheet>
    )
  }
)

const $recordButtonBackground: ViewStyle = {
  borderRadius: RECORD_BUTTON_BACKGROUND_SIZE / 2,
  height: RECORD_BUTTON_BACKGROUND_SIZE,
  width: RECORD_BUTTON_BACKGROUND_SIZE,
  borderWidth: 2,
  borderColor: 'white',
}

const $recordButton: ViewStyle = {
  position: 'absolute',
}

const $recordIndicator: ViewStyle = {
  backgroundColor: RECORDING_INDICATOR_COLOR,
  borderRadius: RECORD_BUTTON_SIZE / 2,
  height: RECORD_BUTTON_SIZE,
  width: RECORD_BUTTON_SIZE,
}

const $recordControl: ViewStyle = {
  padding: Spacing.md,
}

const $positionText: TextStyle = {
  fontWeight: 'medium',
  fontSize: 28,
  textAlign: 'center',
}
