import { useState, useCallback } from 'react';

export const useValidation = (rules) => {
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validate = useCallback((field, value) => {
    const fieldRules = rules[field];
    if (!fieldRules) return null;

    // If rules is an array of validators
    if (Array.isArray(fieldRules)) {
      for (const rule of fieldRules) {
        const error = rule(value);
        if (error) {
          setErrors(prev => ({ ...prev, [field]: error }));
          return error;
        }
      }
    } else {
      // If rules is a single validator function
      const error = fieldRules(value);
      if (error) {
        setErrors(prev => ({ ...prev, [field]: error }));
        return error;
      }
    }

    // Clear error if validation passes
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
    return null;
  }, [rules]);

  const validateAll = useCallback((values) => {
    const newErrors = {};
    let isValid = true;

    Object.keys(rules).forEach(field => {
      const error = validate(field, values[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [rules, validate]);

  const touch = useCallback((field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  }, []);

  const touchAll = useCallback(() => {
    const allFields = Object.keys(rules);
    const touchedFields = {};
    allFields.forEach(field => {
      touchedFields[field] = true;
    });
    setTouched(touchedFields);
  }, [rules]);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const clearTouched = useCallback(() => {
    setTouched({});
  }, []);

  const clearField = useCallback((field) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
    setTouched(prev => {
      const newTouched = { ...prev };
      delete newTouched[field];
      return newTouched;
    });
  }, []);

  const isFieldValid = useCallback((field) => {
    return !errors[field];
  }, [errors]);

  const isFormValid = useCallback(() => {
    return Object.keys(errors).length === 0;
  }, [errors]);

  const getFieldError = useCallback((field) => {
    return touched[field] ? errors[field] : null;
  }, [errors, touched]);

  return {
    errors,
    touched,
    validate,
    validateAll,
    touch,
    touchAll,
    clearErrors,
    clearTouched,
    clearField,
    isFieldValid,
    isFormValid,
    getFieldError
  };
};