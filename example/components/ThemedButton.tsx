import React from 'react'
import { TouchableOpacity, type TouchableOpacityProps, StyleSheet } from 'react-native'

import { useThemeColor } from '@/hooks/useThemeColor'

import { ThemedText } from './ThemedText'

export type ThemedButtonProps = TouchableOpacityProps & {
  title: string
  lightColor?: string
  darkColor?: string
}

export const ThemedButton = ({
  style,
  lightColor,
  darkColor,
  title,
  ...otherProps
}: ThemedButtonProps) => {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'button')
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={[styles.container, { backgroundColor }, style]}
      {...otherProps}
    >
      <ThemedText>{title}</ThemedText>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 4,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
})
