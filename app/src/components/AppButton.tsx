import type { ButtonHTMLAttributes } from 'react'
import type { ComponentSize, ComponentTone } from './types'

type ButtonState = 'default' | 'error'

type AppButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string
  size?: ComponentSize
  tone?: ComponentTone
  state?: ButtonState
}

const AppButton = ({
  label,
  size = 'md',
  tone = 'primary',
  state = 'default',
  className = '',
  ...rest
}: AppButtonProps) => {
  return (
    <button
      type="button"
      className={`app-btn app-btn--${size} app-btn--${tone} app-btn--${state} ${className}`.trim()}
      {...rest}
    >
      {label}
    </button>
  )
}

export default AppButton
