import React, { type ReactNode } from 'react'
import {
  type ColorValue,
  type DimensionValue,
  type FlexStyle,
  type StyleProp,
  View,
  type ViewProps,
  type ViewStyle,
} from 'react-native'

type directionShort = 'l' | 'r' | 't' | 'b' | 'x' | 'y' | ''
type styleNameShort = 'm' | 'p'
type SystemProp = `${styleNameShort}${directionShort}`

export type BoxLayoutProps = Partial<Record<SystemProp, DimensionValue>>

export interface BoxProps extends BoxLayoutProps {
  flex?: boolean | number
  shrink?: boolean | number
  wrap?: boolean | FlexStyle['flexWrap']
  grow?: boolean | number
  basis?: FlexStyle['flexBasis']
  gap?: FlexStyle['gap']
  bg?: ColorValue
  h?: ViewStyle['height']
  w?: ViewStyle['width']
  align?: FlexStyle['alignItems']
  self?: FlexStyle['alignSelf']
  justify?: FlexStyle['justifyContent']
  z?: number
  row?: boolean
  reverse?: boolean
  float?: boolean
  top?: number
  bottom?: number
  left?: number
  right?: number
  onLayout?: ViewProps['onLayout']
  children?: ReactNode
  testID?: string
  style?: StyleProp<ViewStyle>
}

export const notEmpty = <TValue = unknown,>(value: TValue | null | undefined): value is TValue =>
  value !== null && value !== undefined

export const useBoxLayout = (props: BoxLayoutProps): StyleProp<ViewStyle> => {
  const { m, mb, ml, mr, mt, mx, my, p, pb, pl, pr, pt, px, py } = props

  return [
    notEmpty(m) && { margin: m },
    notEmpty(mb) && { marginBottom: mb },
    notEmpty(ml) && { marginLeft: ml },
    notEmpty(mr) && { marginRight: mr },
    notEmpty(mt) && { marginTop: mt },
    notEmpty(mx) && { marginHorizontal: mx },
    notEmpty(my) && { marginVertical: my },
    notEmpty(p) && { padding: p },
    notEmpty(pb) && { paddingBottom: pb },
    notEmpty(pl) && { paddingLeft: pl },
    notEmpty(pr) && { paddingRight: pr },
    notEmpty(pt) && { paddingTop: pt },
    notEmpty(px) && { paddingHorizontal: px },
    notEmpty(py) && { paddingVertical: py },
  ]
}

/**
 * <View /> on steroids
 */
export const Box = (props: BoxProps) => {
  const {
    testID = 'test-layout-box',
    style,
    children,
    onLayout,
    h,
    w,
    bg,
    align,
    self,
    justify,
    row,
    reverse,
    flex,
    shrink,
    basis,
    grow,
    wrap,
    gap,
    z,
    float,
    top,
    bottom,
    left,
    right,
    ...rest
  } = props

  const shortStyles = useBoxLayout(rest)
  const styles: StyleProp<ViewStyle> = [
    [
      notEmpty(z) && { zIndex: z },
      notEmpty(float) && { position: float ? 'absolute' : undefined },
      notEmpty(flex) && { flex: typeof flex === 'boolean' ? 1 : flex },
      notEmpty(shrink) && { flexShrink: typeof shrink === 'boolean' ? 1 : shrink },
      notEmpty(grow) && { flexGrow: typeof grow === 'boolean' ? 1 : grow },
      notEmpty(basis) && { flexBasis: basis },
      notEmpty(wrap) && { flexWrap: typeof wrap === 'boolean' ? (wrap ? 'wrap' : 'nowrap') : wrap },
      notEmpty(h) && { height: h },
      notEmpty(w) && { width: w },
      notEmpty(bg) && { backgroundColor: bg },
      (notEmpty(row) || notEmpty(reverse)) && {
        flexDirection: ((row ? 'row' : 'column') +
          (reverse ? '-reverse' : '')) as FlexStyle['flexDirection'],
      },
      notEmpty(align) && { alignItems: align },
      notEmpty(self) && { alignSelf: self },
      notEmpty(justify) && { justifyContent: justify },
      notEmpty(gap) && { gap },
      notEmpty(top) && { top },
      notEmpty(bottom) && { bottom },
      notEmpty(left) && { left },
      notEmpty(right) && { right },
    ],
    shortStyles,
    style,
  ]

  return (
    <View testID={testID} style={styles} onLayout={onLayout}>
      {children}
    </View>
  )
}
