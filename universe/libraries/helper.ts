import { Snowflake } from "@theinternetfolks/snowflake";
import { ParamError, SchemaValidationError } from "@universe/errors";
import validator from "validator";
import { Schema } from "./schema";

const getId = (): string => Snowflake.generate();

export const getSanitizedEmail = (email: string) => {
  const email_sanitized = validator.normalizeEmail(email.toLowerCase().trim());

  return email_sanitized || null;
};

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
  getId,
  getSanitizedEmail,
  isValidSchema
}