import React, { useRef } from 'react'
import { Image, StyleSheet } from 'react-native'
import { requestRecordingPermissionsAsync } from 'expo-audio'

import { HelloWave } from '@/components/HelloWave'
import ParallaxScrollView from '@/components/ParallaxScrollView'
import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { ThemedButton } from '@/components/ThemedButton'
import { ThemedRecorderSheet, type ThemedRecorderSheetRef } from '@/components/ThemedRecorderSheet'

const HomeScreen = () => {
  const recorderRef = useRef<ThemedRecorderSheetRef>(null)

  const openRecorder = async () => {
    const permissionStatus = await requestRecordingPermissionsAsync()
    if (!permissionStatus.granted) return

    recorderRef.current?.present()
  }

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Expo Recorder</ThemedText>
        <HelloWave />
      </ThemedView>
      <ThemedButton title="Open Recorder" onPress={openRecorder} />
      <ThemedRecorderSheet ref={recorderRef} />
    </ParallaxScrollView>
  )
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
})

export default HomeScreen
