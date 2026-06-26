import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  QueryList,
  signal,
  ViewChildren,
  ViewEncapsulation,
  WritableSignal,
} from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FieldConfig } from '../../models/field-config.model';
import { Dictionary } from '../../models/dictionary.model';

// Angular Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatRadioModule } from '@angular/material/radio';
import { MatSliderModule } from '@angular/material/slider';
import { MatDividerModule } from '@angular/material/divider';
import { MatPseudoCheckboxModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTimepicker, MatTimepickerModule } from '@angular/material/timepicker';
import { LOCALE_ID } from '@angular/core';
import { debounceTime } from 'rxjs/operators';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';

export interface FormRow {
  rowIndex: number;
  fields: FieldConfig[];
}

@Component({
  selector: 'easy-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    MatDatepickerModule,
    MatAutocompleteModule,
    MatRadioModule,
    MatSliderModule,
    MatPseudoCheckboxModule,
    MatIconModule,
    MatTimepickerModule,
    MatTimepickerModule,
    ScrollingModule,
    MatExpansionModule,
    MatMenuModule,
    MatTooltipModule,
  ],
  providers: [{ provide: LOCALE_ID, useValue: 'en-GB' }],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './easy-form.component.html',
  styleUrl: './easy-form.component.css',
})
export class EasyFormComponent {
  
  form = input.required<FormGroup>();
  filteredOptions = new Map<string, WritableSignal<Dictionary[]>>();
  protected allTimes: string[] = this.generateTimes();
  protected panelTimes: string[] = this.generatePanelTimes();
  filteredTimes = new Map<string, WritableSignal<string[]>>();

  @ViewChildren('timepickerRef') timepickers!: QueryList<MatTimepicker<Date>>;

  rows = computed<FormRow[]>(() => {
    const fg = this.form();
    const fields = Object.values(fg.controls).filter(
      (c): c is FieldConfig => 'fieldType' in c && 'row' in c && 'col' in c,
    );

    const rowMap = new Map<number, FieldConfig[]>();
    for (const field of fields) {
      const existing = rowMap.get(field.row) ?? [];
      existing.push(field);
      rowMap.set(field.row, existing);
    }

    return Array.from(rowMap.entries())
      .sort(([a], [b]) => a - b)
      .map(([rowIndex, rowFields]) => {
        const sorted = rowFields.sort((a, b) => a.col - b.col);
        return { rowIndex, fields: sorted, colSpan: 1, remainder: 0 };
      });
  });

  _ = effect(() => {
    const fg = this.form();
    for (const key of Object.keys(fg.controls)) {
      const ctrl = fg.controls[key];
      if (!('fieldType' in ctrl)) continue;
      const field = ctrl as FieldConfig;

      if (!this.filteredOptions.has(key)) {
        const sig = signal<Dictionary[]>(field.options);
        this.filteredOptions.set(key, sig);

        if (field.fieldType === 'autocomplete') {
          fg.controls[key].valueChanges.pipe(debounceTime(150)).subscribe((val: any) => {
            const search = (val ?? '').toString().toLowerCase();
            sig.set(
              search
                ? field.options.filter((opt) => opt.value.toLowerCase().includes(search))
                : field.options,
            );
          });
        }
      }
    }
  });

  getControlName(field: FieldConfig): string {
    const fg = this.form();
    return Object.keys(fg.controls).find((key) => fg.controls[key] === field) ?? '';
  }

  isType(field: FieldConfig, ...types: string[]): boolean {
    return types.includes(field.fieldType);
  }

  stepNumber(controlName: string, direction: 1 | -1): void {
    const control = this.form().controls[controlName];
    const current = parseFloat(control.value) || 0;
    control.setValue(current + direction);
  }

  getFilteredOptions(controlName: string): WritableSignal<Dictionary[]> {
    return this.filteredOptions.get(controlName) ?? signal([]);
  }

  isOptionSelected(controlName: string, key: any): boolean {
    const value: any[] = this.form().controls[controlName]?.value ?? [];
    return value.includes(key);
  }

  getDisplayFn(field: FieldConfig): (value: any) => string {
    return (value: any) => {
      if (!value) return '';
      const match = field.options.find((o) => o.key === value);
      return match ? match.value : value;
    };
  }

  private generateTimes(): string[] {
    const times: string[] = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m++) {
        const hh = h.toString().padStart(2, '0');
        const mm = m.toString().padStart(2, '0');
        times.push(`${hh}:${mm}`);
      }
    }
    return times;
  }

  getFilteredTimes(controlName: string): WritableSignal<string[]> {
    if (!this.filteredTimes.has(controlName)) {
      this.filteredTimes.set(controlName, signal(this.allTimes));
    }
    return this.filteredTimes.get(controlName)!;
  }

  onTimeFocus(controlName: string): void {
    this.getFilteredTimes(controlName).set(this.allTimes);
  }

  onTimeInput(event: Event, controlName: string): void {
    const input = event.target as HTMLInputElement;
    let val = input.value.replace(/[^0-9]/g, '');
    if (val.length >= 2) val = val.slice(0, 2) + ':' + val.slice(2, 4);
    input.value = val;
    const control = this.form().controls[controlName];
    if (control) control.setValue(val, { emitEvent: false });
    this.getFilteredTimes(controlName).set(
      val ? this.allTimes.filter((t) => t.startsWith(val)) : this.allTimes,
    );
  }

  onColorPickerInput(event: Event, controlName: string): void {
    const val = (event.target as HTMLInputElement).value;
    this.form().controls[controlName].setValue(val);
  }

  onColorTextInput(event: Event, controlName: string): void {
    const val = (event.target as HTMLInputElement).value;
    this.form().controls[controlName].setValue(val, { emitEvent: false });
  }

  private generatePanelTimes(): string[] {
    const times: string[] = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 30) {
        const hh = h.toString().padStart(2, '0');
        const mm = m.toString().padStart(2, '0');
        times.push(`${hh}:${mm}`);
      }
    }
    return times;
  }
}
