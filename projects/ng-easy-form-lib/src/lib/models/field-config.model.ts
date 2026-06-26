import { FormControl, FormControlOptions, ValidatorFn, AsyncValidatorFn } from '@angular/forms';
import { Dictionary } from './dictionary.model';
import { FieldType } from './field-type.enum';

export interface FieldError {
  key: string;
  message: string;
}

export interface FieldConfigOptions {
  fieldType: FieldType;
  label: string;
  placeholder?: string;
  hint?: string;
  hintAlign?: 'start' | 'end';
  error?: FieldError[];
  prefixText?: string;
  suffixText?: string;
  prefixIcon?: string;
  suffixIcon?: string;
  appearance?: 'outline' | 'fill';
  pos?: { row: number; col: number };
  options?: Dictionary[];
  disabled?: boolean;
  textareaRows?: number;
  formControlOptions?: FormControlOptions;
}

export class FieldConfig<T = any> extends FormControl {
  readonly fieldType: FieldType;
  readonly label: string;
  readonly placeholder: string;
  readonly hint: string;
  readonly hintAlign: 'start' | 'end';
  readonly error: FieldError[];
  readonly prefixText: string;
  readonly suffixText: string;
  readonly prefixIcon: string;
  readonly suffixIcon: string;
  readonly appearance: 'outline' | 'fill';
  readonly row: number;
  readonly col: number;
  readonly options: Dictionary[];
  readonly textareaRows: number;

  constructor(
    initialValue: T | null,
    fieldConfigOptions: FieldConfigOptions,
    validators?: ValidatorFn | ValidatorFn[] | null,
    asyncValidators?: AsyncValidatorFn | AsyncValidatorFn[] | null,
  ) {
    super(
      { value: initialValue, disabled: fieldConfigOptions.disabled ?? false },
      validators ?? fieldConfigOptions.formControlOptions ?? null,
      asyncValidators ?? null,
    );

    this.fieldType = fieldConfigOptions.fieldType;
    this.label = fieldConfigOptions.label;
    this.placeholder = fieldConfigOptions.placeholder ?? '';
    this.hint = fieldConfigOptions.hint ?? '';
    this.hintAlign = fieldConfigOptions.hintAlign ?? 'start';
    this.error = fieldConfigOptions.error ?? [];
    this.prefixText = fieldConfigOptions.prefixText ?? '';
    this.suffixText = fieldConfigOptions.suffixText ?? '';
    this.prefixIcon = fieldConfigOptions.prefixIcon ?? '';
    this.suffixIcon = fieldConfigOptions.suffixIcon ?? '';
    this.appearance = fieldConfigOptions.appearance ?? 'fill';
    this.row = fieldConfigOptions.pos?.row ?? 0;
    this.col = fieldConfigOptions.pos?.col ?? 0;
    this.options = fieldConfigOptions.options ?? [];
    this.textareaRows = fieldConfigOptions.textareaRows ?? 4;
  }

  getErrorMessage(): string | null {
    if (!this.error.length || !this.invalid || !this.touched) return null;
    const match = this.error.find((e) => this.hasError(e.key));
    return match?.message ?? null;
  }
}
