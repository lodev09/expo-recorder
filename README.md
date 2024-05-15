# Expo Recorder

Audio recorder for your React Native apps 🎙️

<img alt="Expo Recorder" src="preview.gif" width="300px" />

This is a wrapper component that implements [Expo Audio](https://docs.expo.dev/versions/latest/sdk/audio/) and features an animated waveform for your recording needs. 💪

> [!NOTE]
> This package is mostly subjective and might not fit your use case and/or design.
>
> I will try to make this as generic as possible, but if you want a very customized experience, feel free to copy its source code. Alternatively, you could submit a PR if you think it will help the general public. See [contributing](#contributing) to get started.

## Installation

```sh
npx expo install @lodev09/expo-recorder
```

### Dependencies

```sh
npx expo install expo-av react-native-reanimated react-native-gesture-handler
```

You might want to check out the individual installation instructions from this package's dependencies.

* [`expo-av`](https://docs.expo.dev/versions/latest/sdk/av/)
* [`react-native-reanimated`](https://docs.swmansion.com/react-native-reanimated/)
* [`react-native-gesture-handler`](https://docs.swmansion.com/react-native-gesture-handler/docs/)

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
