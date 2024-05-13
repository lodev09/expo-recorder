# Expo Recorder

Audio recorder for your React Native apps 🎙️

<img alt="Expo Recorder" src="preview.gif" width="300px" />

This is a wrapper component that implements [Expo Audio](https://docs.expo.dev/versions/latest/sdk/audio/). Features an animated Waveform for your recording needs. 💪

## Installation

```sh
npx expo install @lodev09/expo-recorder react-native-reanimated react-native-gesture-handler
```

## Usage

```tsx
import { View, Button } from 'react-native'
import { Recorder, type RecorderRef } from '@lodev09/expo-recorder'

const App = () => {
  const recorder = useRef<RecorderRef>(null)

  const startRecord = () => {
    recorder.current?.startRecording()
  }

  const stopRecord = () => {
    recorder.current?.stopRecording()
  }

  const recordingStopped = (uri?: string) => {
    console.log(uri) // Save the uri somewhere! 🎉
  }

  return (
    <View>
      <Recorder ref={recorder} onRecordStop={recordingStopped} />
      <Button title="Record" onPress={startRecord} />
      <Button title="Stop" onPress={stopRecord} />
    </View>
  )
}
```

For more advanced usage, see [example](example/components/ThemedRecorderSheet.tsx).

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

---

Made with ❤️ by [@lodev09](http://linkedin.com/in/lodev09/)
