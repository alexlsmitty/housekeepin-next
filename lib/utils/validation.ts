export const validateEmail = (email: string): boolean => {
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(email);
};

export const validateRequired = (value: string): boolean => {
  return value.trim().length > 0;
};

export const validateNumber = (value: string): boolean => {
  return !isNaN(Number(value)) && isFinite(Number(value));
};

export const validatePositiveNumber = (value: string): boolean => {
  return validateNumber(value) && Number(value) > 0;
};

export const validateUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

export const validateDate = (date: Date | null): boolean => {
  return date instanceof Date && !isNaN(date.getTime());
};

// Form validation helper
export const validateForm = (formData: Record<string, any>, rules: Record<string, (value: any) => boolean>): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  Object.entries(rules).forEach(([field, validationFn]) => {
    const value = formData[field];
    if (!validationFn(value)) {
      errors[field] = `Invalid ${field.replace('_', ' ')}`;
    }
  });
  
  return errors;
};
