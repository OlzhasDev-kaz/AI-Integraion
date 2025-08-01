// Validation utilities
export const validators = {
  required: (value) => {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return 'Это поле обязательно для заполнения';
    }
    return null;
  },

  email: (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (value && !emailRegex.test(value)) {
      return 'Введите корректный email адрес';
    }
    return null;
  },

  minLength: (min) => (value) => {
    if (value && value.length < min) {
      return `Минимальная длина: ${min} символов`;
    }
    return null;
  },

  maxLength: (max) => (value) => {
    if (value && value.length > max) {
      return `Максимальная длина: ${max} символов`;
    }
    return null;
  },

  pattern: (regex, message) => (value) => {
    if (value && !regex.test(value)) {
      return message;
    }
    return null;
  },

  fileType: (allowedTypes) => (file) => {
    if (!file) return null;
    
    const extension = '.' + file.name.split('.').pop().toLowerCase();
    if (!allowedTypes.includes(extension)) {
      return `Разрешены только файлы: ${allowedTypes.join(', ')}`;
    }
    return null;
  },

  fileSize: (maxSizeMB) => (file) => {
    if (!file) return null;
    
    const maxSize = maxSizeMB * 1024 * 1024;
    if (file.size > maxSize) {
      return `Максимальный размер файла: ${maxSizeMB}MB`;
    }
    return null;
  },

  // Исправленная валидация API ключей
  apiKey: (provider) => (value) => {
    if (!value) return null; // Не обязательное поле
    
    // Убираем лишние пробелы
    const trimmedValue = value.trim();
    
    // Базовые проверки для каждого провайдера
    switch (provider) {
      case 'openai':
        if (!trimmedValue.startsWith('sk-')) {
          return 'OpenAI API ключ должен начинаться с "sk-"';
        }
        if (trimmedValue.length < 20) {
          return 'OpenAI API ключ слишком короткий';
        }
        if (trimmedValue.length > 200) {
          return 'OpenAI API ключ слишком длинный';
        }
        // Проверяем что после sk- идут только допустимые символы
        if (!/^sk-[A-Za-z0-9\-_]+$/.test(trimmedValue)) {
          return 'OpenAI API ключ содержит недопустимые символы';
        }
        break;
        
      case 'anthropic':
        if (!trimmedValue.startsWith('sk-ant-')) {
          return 'Anthropic API ключ должен начинаться с "sk-ant-"';
        }
        if (trimmedValue.length < 30) {
          return 'Anthropic API ключ слишком короткий';
        }
        if (!/^sk-ant-[A-Za-z0-9\-_]+$/.test(trimmedValue)) {
          return 'Anthropic API ключ содержит недопустимые символы';
        }
        break;
        
      case 'gemini':
        if (!trimmedValue.startsWith('AIza')) {
          return 'Google API ключ должен начинаться с "AIza"';
        }
        if (trimmedValue.length < 20) {
          return 'Google API ключ слишком короткий';
        }
        if (!/^AIza[A-Za-z0-9\-_]+$/.test(trimmedValue)) {
          return 'Google API ключ содержит недопустимые символы';
        }
        break;
        
      default:
        if (trimmedValue.length < 10) {
          return 'API ключ слишком короткий';
        }
    }
    
    return null;
  },

  url: (value) => {
    if (!value) return null;
    
    try {
      new URL(value);
      return null;
    } catch {
      return 'Введите корректный URL';
    }
  },

  phone: (value) => {
    if (!value) return null;
    
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
      return 'Введите корректный номер телефона';
    }
    return null;
  },

  number: (value) => {
    if (value && isNaN(Number(value))) {
      return 'Введите корректное число';
    }
    return null;
  },

  integer: (value) => {
    if (value && (!Number.isInteger(Number(value)))) {
      return 'Введите целое число';
    }
    return null;
  },

  min: (minimum) => (value) => {
    if (value && Number(value) < minimum) {
      return `Минимальное значение: ${minimum}`;
    }
    return null;
  },

  max: (maximum) => (value) => {
    if (value && Number(value) > maximum) {
      return `Максимальное значение: ${maximum}`;
    }
    return null;
  },

  password: (value) => {
    if (!value) return null;
    
    const errors = [];
    
    if (value.length < 8) {
      errors.push('минимум 8 символов');
    }
    
    if (!/[A-Z]/.test(value)) {
      errors.push('заглавная буква');
    }
    
    if (!/[a-z]/.test(value)) {
      errors.push('строчная буква');
    }
    
    if (!/\d/.test(value)) {
      errors.push('цифра');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
      errors.push('специальный символ');
    }
    
    if (errors.length > 0) {
      return `Пароль должен содержать: ${errors.join(', ')}`;
    }
    
    return null;
  },

  confirmPassword: (originalPassword) => (value) => {
    if (value !== originalPassword) {
      return 'Пароли не совпадают';
    }
    return null;
  },

  businessName: (value) => {
    if (!value) return 'Название компании обязательно';
    
    if (value.length < 2) {
      return 'Название слишком короткое';
    }
    
    if (value.length > 100) {
      return 'Название слишком длинное';
    }
    
    if (!/^[a-zA-Zа-яА-Я0-9\s\-\.&]+$/.test(value)) {
      return 'Название содержит недопустимые символы';
    }
    
    return null;
  }
};

// Utility function to combine validators
export const combineValidators = (...validators) => {
  return (value) => {
    for (const validator of validators) {
      const error = validator(value);
      if (error) return error;
    }
    return null;
  };
};

// Pre-configured validator combinations
export const validatorPresets = {
  email: combineValidators(validators.required, validators.email),
  password: combineValidators(validators.required, validators.password),
  businessName: combineValidators(validators.required, validators.businessName),
  // Упрощенная валидация для API ключей - только проверка формата, не обязательные
  apiKeyOpenAI: validators.apiKey('openai'),
  apiKeyAnthropic: validators.apiKey('anthropic'),
  apiKeyGemini: validators.apiKey('gemini'),
  uploadFile: combineValidators(
    validators.fileType(['.csv', '.xlsx', '.json', '.txt', '.pdf']),
    validators.fileSize(10)
  )
};