import { Snowflake } from "@theinternetfolks/snowflake";
import { ParamError, SchemaValidationError } from "@universe/errors";
import validator from "validator";
import { Schema } from "./schema";

const getId = (): string => Snowflake.generate();

export const getSanitizedEmail = (email: string) => {
  const email_sanitized = validator.normalizeEmail(email.toLowerCase().trim());

  return email_sanitized || null;
};

/**
 * Converts validation errors into an array of parameter-specific error objects.
 * 
 * @function errorsToParam
 * @param {Record<string, string[]>} data - A map of field names to error messages.
 * 
 * @returns {ParamError[]} - An array of error objects, each containing a `message` and `param`.
 */
const errorsToParam = (data: Record<string, string[]>): ParamError[] => {
  const errors: ParamError[] = [];
  for (const key of Object.keys(data)) {
    for (const message of data[key]) {
      errors.push({ message, param: key });
    }
  }
  return errors;
};


const isValidSchema = (
  document: Record<string, any>,
  rules: Validator.Rules,
  options?: { halt?: boolean; update?: boolean }
): ParamError[] | undefined => {
  if (typeof options?.halt === 'undefined') {
    options = { ...(options || {}), halt: true };
  }

  if (typeof options?.update === 'undefined') {
    options = { ...(options || {}), update: false };
  }

  const appliedRules = { ...rules };

  if (options?.update) {
    for (const key of Object.keys(rules)) {
      const rule = appliedRules[key];
      if (Array.isArray(rule)) {
        appliedRules[key] = rule.filter((item) => item !== 'required');
      }
    }
  }
  const validation = new Schema(document, appliedRules);
  if (!validation.passes()) {
    if (options?.halt) {
      throw new SchemaValidationError(
        errorsToParam(validation.errors.all())
      );
    } else {
      return errorsToParam(validation.errors.all());
    }
  }
  return undefined;
};


export const helper = {
  /**
   * Generates a unique identifier using the Snowflake algorithm.
   * 
   * @function getId
   * @returns {string} - A unique identifier as a string.
  */
  getId,
  /**
   * Normalizes and sanitizes an email address.
   * 
   * @function getSanitizedEmail
   * @param {string} email - The email address to sanitize.
   * 
   * @returns {string | null} - The sanitized email address, or `null` if the input is invalid.
  */
  getSanitizedEmail,
  /**
   * Validates a document against a set of validation rules.
   * 
   * @function isValidSchema
   * @param {Record<string, any>} document - The data to validate.
   * @param {Validator.Rules} rules - The validation rules to apply.
   * @param {Object} [options] - Optional validation settings.
   * @param {boolean} [options.halt=true] - If `true`, throws an error on validation failure.
   * @param {boolean} [options.update=false] - If `true`, adjusts rules for partial updates by removing 'required' checks.
   * 
   * @throws {SchemaValidationError} - If validation fails and `halt` is `true`.
   * 
   * @returns {ParamError[] | undefined} - An array of validation errors if validation fails and `halt` is `false`, otherwise `undefined`.
  */
  isValidSchema
}