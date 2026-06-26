import { Injectable } from '@angular/core';
import { AsyncValidatorFn, FormGroup, ValidatorFn } from '@angular/forms';
import { FieldConfig, FieldConfigOptions } from '../models/field-config.model';
import { FieldType } from '../models/field-type.enum';

export type FormSchema = Record<
  string,
  FieldConfigOptions & {
    initialValue?: any;
    validators?: ValidatorFn | ValidatorFn[] | null;
    asyncValidators?: AsyncValidatorFn | AsyncValidatorFn[] | null;
  }
>;

/* Default form layout if no position is defined */
@Injectable({ providedIn: 'root' })
export class EasyFormBuilder {
  private readonly ROW_MAP: Record<number, number[]> = {
    1: [1],
    2: [1, 1],
    3: [1, 1, 1],
    4: [2, 2],
    5: [3, 2],
    6: [3, 3],
    7: [4, 3],
    8: [3, 3, 2],
    9: [3, 3, 3],
    10: [4, 4, 2],
    11: [4, 4, 3],
    12: [4, 4, 4],
  };

  private getRowDistribution(count: number): number[] {
    if (this.ROW_MAP[count]) return this.ROW_MAP[count];
    // 13+ fields: fill rows of 4, last row gets the remainder
    const rows: number[] = [];
    let remaining = count;
    while (remaining > 0) {
      const take = Math.min(4, remaining);
      rows.push(take);
      remaining -= take;
    }
    return rows;
  }

  private assignAutoPositions(
    entries: [string, FieldConfigOptions & { initialValue?: any }][],
  ): void {
    // Separate textareas from other fields
    const textareas = entries.filter(([, o]) => o.fieldType === FieldType.Textarea);
    const others = entries.filter(([, o]) => o.fieldType !== FieldType.Textarea);

    const distribution = this.getRowDistribution(others.length);

    let row = 1;
    let othersIdx = 0;

    for (const colCount of distribution) {
      for (let col = 1; col <= colCount; col++) {
        if (othersIdx < others.length) {
          others[othersIdx][1].pos = { row, col };
          othersIdx++;
        }
      }

      /* 
       After each row of non-textareas, check if a textarea follows in sequence
       Textareas get inserted between rows of other fields
      */
      row++;
    }

    // Place textareas. Each gets its own full row unless there are only textareas
    if (textareas.length > 0 && others.length === 0) {
      // All fields are textareas; stack them
      textareas.forEach(([, o], i) => {
        o.pos = { row: i + 1, col: 1 };
      });
    } else {
      // Each textarea gets its own row after all other fields
      textareas.forEach(([, o], i) => {
        o.pos = { row: row + i, col: 1 };
      });
    }
  }

  build<T extends Record<string, any>>(schema: FormSchema, data?: T | null): FormGroup {
    const entries = Object.entries(schema);
    const needsAuto = entries.filter(([, o]) => !o.pos);
    const hasPos = entries.filter(([, o]) => !!o.pos);

    if (needsAuto.length > 0) {
      const maxExplicitRow = hasPos.reduce((max, [, o]) => Math.max(max, o.pos!.row), 0);
      this.assignAutoPositions(needsAuto);
      if (maxExplicitRow > 0) {
        needsAuto.forEach(([, o]) => {
          o.pos!.row += maxExplicitRow;
        });
      }
    }

    const controls: Record<string, FieldConfig> = {};
    for (const [key, options] of entries) {
      const { initialValue, validators, asyncValidators, ...fieldOptions } = options;
      const value = data && key in data ? data[key] : (initialValue ?? null);
      controls[key] = new FieldConfig(
        value,
        fieldOptions as FieldConfigOptions,
        validators,
        asyncValidators,
      );
    }
    return new FormGroup(controls);
  }
}
