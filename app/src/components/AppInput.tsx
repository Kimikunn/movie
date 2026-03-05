import type { InputHTMLAttributes } from 'react'
import type { ComponentSize } from './types'

type InputState = 'default' | 'error'

type AppInputProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string
  label: string
  helperText?: string
  errorText?: string
  uiSize?: ComponentSize
  state?: InputState
}

const AppInput = ({
  id,
  label,
  helperText,
  errorText,
  uiSize = 'md',
  state = 'default',
  className = '',
  ...rest
}: AppInputProps) => {
  const hasError = state === 'error' || Boolean(errorText)
  return (
    <label className={`app-input app-input--${uiSize} ${hasError ? 'is-error' : ''}`.trim()} htmlFor={id}>
      <span className="app-input__label">{label}</span>
      <input id={id} className={`app-input__field ${className}`.trim()} {...rest} />
      {hasError ? (
        <span className="app-input__hint app-input__hint--error">{errorText ?? '输入内容无效'}</span>
      ) : (
        helperText && <span className="app-input__hint">{helperText}</span>
      )}
    </label>
  )
}

export default AppInput
