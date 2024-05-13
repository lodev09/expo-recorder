import React, { forwardRef, useRef, type Ref } from 'react'
import { Pressable, View, type StyleProp, type ViewStyle, TouchableOpacity } from 'react-native'
import Ionicons from '@expo/vector-icons/Ionicons'
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Recorder, type RecorderRef } from '@lodev09/expo-recorder'
import { type TrueSheetProps, TrueSheet } from '@lodev09/react-native-true-sheet'

import { useThemeColor } from '@/hooks/useThemeColor'
import { Box } from './Box'
import { Spacing } from '@/constants/Spacing'

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

    const recorderRef = useRef<RecorderRef>(null)

    const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'recorderSheet')
    const iconColor = useThemeColor({}, 'recorderIcon')
    const tintColor = useThemeColor({}, 'recorderTint')
    const timelineColor = useThemeColor({}, 'recorderTimeline')
    const textColor = useThemeColor({}, 'text')
    const recordBorderColor = useThemeColor({ light: 'rgba(0,0,0,0.3)' }, 'text')
    const recorderBackgroundColor = useThemeColor({}, 'recorderBackground')

    const scale = useSharedValue(1)

    const toggleRecording = async () => {}

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
        sizes={['auto']}
        style={[{ backgroundColor }, style]}
        contentContainerStyle={[$sheetContent, { paddingBottom: insets.bottom + Spacing.md }]}
        {...rest}
      >
        <Recorder
          ref={recorderRef}
          tintColor={tintColor}
          timelineColor={timelineColor}
          textColor={textColor}
          backgroundColor={recorderBackgroundColor}
        />
        <Box row justify="space-between" align="center" mt={Spacing.lg}>
          <Box>
            <TouchableOpacity activeOpacity={0.8} style={$recordControl} onPress={() => undefined}>
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
            <TouchableOpacity activeOpacity={0.8} style={$recordControl} onPress={() => undefined}>
              <Ionicons name="play" size={Spacing.xl} style={{ color: iconColor }} />
            </TouchableOpacity>
          </Box>
        </Box>
      </TrueSheet>
    )
  }
)

const $sheetContent: ViewStyle = {
  paddingTop: Spacing.xl,
}

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
