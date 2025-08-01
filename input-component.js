import React, { forwardRef, useRef, useId } from 'react';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';

const Input = forwardRef(({ 
  label, 
  error, 
  help,
  required = false,
  type = 'text',
  icon: Icon,
  iconPosition = 'left',
  clearable = false,
  showPasswordToggle = false,
  'aria-describedby': ariaDescribedBy,
  className = '',
  containerClassName = '',
  onClear,
  ...props 
}, ref) => {
  const [showPassword, setShowPassword] = React.useState(false);
  const [isFocused, setIsFocused] = React.useState(false);
  const inputId = useId();
  const errorId = `${inputId}-error`;
  const helpId = `${inputId}-help`;
  const internalRef = useRef(null);
  const inputRef = ref || internalRef;

  const actualType = type === 'password' && showPassword ? 'text' : type;
  const hasError = Boolean(error);
  const hasIcon = Boolean(Icon);
  const hasPasswordToggle = type === 'password' && showPasswordToggle;
  const hasClear = clearable && props.value;

  const handleC