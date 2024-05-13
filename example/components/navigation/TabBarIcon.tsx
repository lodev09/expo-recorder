// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/

import React from 'react'
import type { TextStyle } from 'react-native'

import Ionicons from '@expo/vector-icons/Ionicons'
import { type IconProps } from '@expo/vector-icons/build/createIconSet'
import { type ComponentProps } from 'react'

export function TabBarIcon({ style, ...rest }: IconProps<ComponentProps<typeof Ionicons>['name']>) {
  return <Ionicons size={28} style={[$icon, style]} {...rest} />
}

const $icon: TextStyle = { marginBottom: -3 }
