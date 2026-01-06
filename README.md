# Expo Recorder

Audio recorder for your React Native apps 🎙️<br>
This is a wrapper component that implements [Expo Audio](https://docs.expo.dev/versions/latest/sdk/audio/) and features an animated waveform for your recording needs. 💪

<img alt="Expo Recorder" src="preview.gif" width="300px" />

> [!NOTE]
> This package is mostly subjective and might not fit your use case and/or design.
>
> I will try to make this as generic as possible, but if you want a very customized experience, feel free to copy its code and customize it the way you want. Alternatively, you could submit a PR if you think it will help the general public. See the [contributing guide](CONTRIBUTING.md) to get started.

## Installation

```sh
npx expo install @lodev09/expo-recorder
```

### Dependencies

```sh
npx expo install expo-audio react-native-reanimated react-native-gesture-handler
```

You might want to check out the individual installation instructions from this package's dependencies.

* [`expo-audio`](https://docs.expo.dev/versions/latest/sdk/audio/)
* [`react-native-reanimated`](https://docs.swmansion.com/react-native-reanimated/)
* [`react-native-gesture-handler`](https://docs.swmansion.com/react-native-gesture-handler/docs/)

## Usage

```tsx
import { View, Button } from 'react-native'
import { Recorder, type RecorderRef } from '@lodev09/expo-recorder'

const App = () => {
  const recorder = useRef<RecorderRef>(null)

  const startRecording = async () => {
    const record = await recorder.current?.startRecording()
    console.log(record.uri)
  }

  const stopRecording = async () => {
    const record = await recorder.current?.stopRecording()
    console.log(record.uri) // Save the uri somewhere! 🎉
  }

  return (
    <View>
      <Recorder ref={recorder} />
      <Button title="Record" onPress={startRecording} />
      <Button title="Stop" onPress={stopRecording} />
    </View>
  )
}
```

For complete usage, see [example](example/components/ThemedRecorderSheet.tsx).

Also check out [`react-native-true-sheet`](https://github.com/lodev09/react-native-true-sheet), the **Bottom Sheet** used in this example.

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

---

Made with ❤️ by [@lodev09](http://linkedin.com/in/lodev09/)
