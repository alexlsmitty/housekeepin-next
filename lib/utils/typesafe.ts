/**
 * Type utilities to help with type safety
 */

/**
 * Safely cast an unknown value to a specific type
 * @param value The value to cast
 * @returns The value cast to type T
 */
export function safeCast<T>(value: unknown): T {
  return value as T;
}

/**
 * Safely convert a value to a number
 * @param value Value to convert to number
 * @param defaultValue Default value to return if conversion fails
 * @returns The converted number or default value
 */
export function toNumber(value: unknown, defaultValue: number = 0): number {
  if (value === null || value === undefined) return defaultValue;
  const num = Number(value);
  return isNaN(num) ? defaultValue : num;
}

/**
 * Safely convert a value to a string
 * @param value Value to convert to string
 * @param defaultValue Default value to return if value is null/undefined
 * @returns The string value
 */
export function toString(value: unknown, defaultValue: string = ''): string {
  if (value === null || value === undefined) return defaultValue;
  return String(value);
}

/**
 * Safely convert a value to a boolean
 * @param value Value to convert to boolean
 * @param defaultValue Default value to return if value is null/undefined
 * @returns The boolean value
 */
export function toBoolean(value: unknown, defaultValue: boolean = false): boolean {
  if (value === null || value === undefined) return defaultValue;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const lowercase = value.toLowerCase();
    if (lowercase === 'true' || lowercase === 'yes' || lowercase === '1') return true;
    if (lowercase === 'false' || lowercase === 'no' || lowercase === '0') return false;
  }
  return Boolean(value);
}

/**
 * Safely convert a value to a Date
 * @param value Value to convert to Date
 * @param defaultValue Default value to return if conversion fails
 * @returns The Date object or default value
 */
export function toDate(value: unknown, defaultValue: Date | null = null): Date | null {
  if (value === null || value === undefined) return defaultValue;
  
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? defaultValue : value;
  }
  
  if (typeof value === 'number' || typeof value === 'string') {
    const date = new Date(value);
    return isNaN(date.getTime()) ? defaultValue : date;
  }
  
  return defaultValue;
}

/**
 * Type guard to check if a value is of a specific type
 * @param value Value to check
 * @param typeCheck Function to check if value matches type
 * @returns True if value is of type T
 */
export function isType<T>(value: unknown, typeCheck: (value: unknown) => boolean): value is T {
  return typeCheck(value);
}

/**
 * Type guard to check if object has a property
 * @param obj Object to check
 * @param prop Property to look for
 * @returns True if object has property
 */
export function hasProperty<T extends object, K extends PropertyKey>(
  obj: T,
  prop: K
): obj is T & Record<K, unknown> {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}
