# NgEasyForm

Build Angular Material forms from a plain object instead of writing templates by hand.

You describe each field once (its type, label, validators, options, and so on), and NgEasyForm gives you a typed reactive `FormGroup` and an `<easy-form>` component that renders it with Angular Material components, laid out in a responsive grid.

```ts
readonly form = inject(EasyFormBuilder).build({
  firstName: { fieldType: FieldType.Input, label: 'First Name', validators: Validators.required },
  email:     { fieldType: FieldType.Email, label: 'Email' },
  country:   { fieldType: FieldType.Select, label: 'Country', options: countries },
});
```

```html
<easy-form [form]="form" />
```

## Why

Building a Material form normally means repeating the same `mat-form-field`, `mat-label`, `mat-hint`, and `mat-error` markup for every field, keeping it in sync with a `FormGroup` you define separately. NgEasyForm keeps the field definition and the form in one place:

- **One schema per form**: field type, label, placeholder, hint, icons, options, validators, and initial value all live in one object.
- **Standard reactive forms**: `build()` returns a normal `FormGroup`, so `valueChanges`, `setValue`, `disable()`, `markAllAsTouched()`, and the rest work as usual.
- **Automatic layout**: fields are arranged into rows for you, or you can place each one with `pos: { row, col }`.
- **Built-in error messages**: map validator keys to messages and they show under the field once it is touched.

## Supported field types

| `FieldType` | Rendered with | Value |
| --- | --- | --- |
| `Input`, `Email`, `Password`, `Tel`, `Url` | `matInput` | `string` |
| `Number` | `matInput` with up/down step buttons | `number` |
| `Textarea` | `matInput` textarea | `string` |
| `Select` | `mat-select` | option `key` |
| `Multiselect` | `mat-select multiple` | array of option `key`s |
| `Autocomplete` | `mat-autocomplete` with filtering and virtual scroll | option `key` |
| `Checkbox` | `mat-checkbox` | `boolean` |
| `Toggle` | `mat-slide-toggle` | `boolean` |
| `Date` | `mat-datepicker` | `Date` |
| `Time` | text input with a time list | `"HH:MM"` (24-hour) |
| `Color` | text input plus native color picker | hex string, e.g. `"#4f46e5"` |

`Radio`, `DateRange`, `MultiAutocomplete`, and a combined date-time picker are planned but not rendered yet.

## Repository layout

This is an Angular CLI workspace with two projects:

| Project | Path | Purpose |
| --- | --- | --- |
| `ng-easy-form-lib` | [projects/ng-easy-form-lib](projects/ng-easy-form-lib) | The library: `EasyFormBuilder`, `EasyFormComponent`, and the models. |
| `ng-easy-form-demo` | [projects/ng-easy-form-demo](projects/ng-easy-form-demo) | A sample app that uses the library. |

## Getting started

### Requirements

- Angular 20 and Angular Material / CDK 20
- A Material theme in your global styles
- A date adapter if you use `Date` fields, e.g. `provideNativeDateAdapter()` in your app config

```ts
// app.config.ts
import { provideNativeDateAdapter } from '@angular/material/core';

export const appConfig: ApplicationConfig = {
  providers: [
    // ...
    provideNativeDateAdapter(),
  ],
};
```

### Build and run locally

The demo app consumes the library from `dist/`, so build the library first:

```bash
npm install
ng build ng-easy-form-lib      # add --watch to rebuild on changes
ng serve ng-easy-form-demo
```

Then open `http://localhost:4200/`.

## Usage

### 1. Define the form

Inject `EasyFormBuilder` and pass it a schema. Each key becomes a control name.

```ts
import { Component, inject } from '@angular/core';
import { Validators } from '@angular/forms';
import { EasyFormBuilder, EasyFormComponent, FieldType } from 'ng-easy-form-lib';

@Component({
  selector: 'app-profile',
  imports: [EasyFormComponent],
  template: `
    <easy-form [form]="form" />
    <button (click)="save()">Save</button>
  `,
})
export class ProfileComponent {
  private readonly fb = inject(EasyFormBuilder);

  readonly form = this.fb.build({
    firstName: {
      fieldType: FieldType.Input,
      label: 'First Name',
      placeholder: 'Enter first name',
      validators: Validators.required,
      error: [{ key: 'required', message: 'First name is required' }],
    },
    age: {
      fieldType: FieldType.Number,
      label: 'Age',
      validators: [Validators.required, Validators.min(18)],
      error: [
        { key: 'required', message: 'Age is required' },
        { key: 'min', message: 'Must be 18 or older' },
      ],
    },
    country: {
      fieldType: FieldType.Select,
      label: 'Country',
      options: [
        { key: 'us', value: 'United States' },
        { key: 'ca', value: 'Canada' },
      ],
    },
    bio: {
      fieldType: FieldType.Textarea,
      label: 'Biography',
      textareaRows: 6,
    },
    subscribed: {
      fieldType: FieldType.Toggle,
      label: 'Subscribe to newsletter',
      initialValue: true,
    },
  });

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    console.log(this.form.value);
  }
}
```

### 2. Pre-fill from existing data

Pass an object as the second argument to `build()`. Any matching key overrides that field's `initialValue`.

```ts
readonly form = this.fb.build(schema, { firstName: 'John', age: 28, country: 'us' });
```

### 3. Work with the form

`build()` returns a regular `FormGroup`, and every control is a `FieldConfig`, which extends `FormControl`.

```ts
this.form.controls['country'].valueChanges.subscribe((value) => { /* ... */ });
this.form.controls['age'].disable();
this.form.patchValue({ firstName: 'Jane' });
```

## Field options

Every schema entry accepts these properties:

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `fieldType` | `FieldType` | (required) | Which control to render. |
| `label` | `string` | (required) | Field label. |
| `placeholder` | `string` | `''` | Input placeholder. |
| `hint` | `string` | `''` | Helper text shown under the field when there is no error. |
| `hintAlign` | `'start' \| 'end'` | `'start'` | Hint alignment. |
| `error` | `{ key, message }[]` | `[]` | Messages keyed by validator error key. The first matching one is shown once the field is touched and invalid. |
| `prefixText` / `suffixText` | `string` | `''` | Text before or after the input, e.g. `'$'` or `'kg'`. |
| `prefixIcon` / `suffixIcon` | `string` | `''` | Material icon name before or after the input. |
| `appearance` | `'fill' \| 'outline'` | `'fill'` | `mat-form-field` appearance. |
| `options` | `{ key, value }[]` | `[]` | Choices for `Select`, `Multiselect`, and `Autocomplete`. `key` is stored in the form; `value` is displayed. |
| `pos` | `{ row, col }` | auto | Explicit grid position (see [Layout](#layout)). |
| `disabled` | `boolean` | `false` | Start the control disabled. |
| `textareaRows` | `number` | `4` | Visible rows for `Textarea`. |
| `initialValue` | `any` | `null` | Starting value, unless overridden by the `data` argument. |
| `validators` | `ValidatorFn \| ValidatorFn[]` | | Sync validators. |
| `asyncValidators` | `AsyncValidatorFn \| AsyncValidatorFn[]` | | Async validators. |
| `formControlOptions` | `FormControlOptions` | | Passed to `FormControl` when `validators` is not set, e.g. `{ updateOn: 'blur' }`. |

## Layout

Each row is a CSS grid whose columns are split evenly between the fields in that row.

**Automatic layout.** Fields without a `pos` are placed for you, in schema order:

| Fields | Row pattern |
| --- | --- |
| 1–3 | one row |
| 4 | 2 + 2 |
| 5 | 3 + 2 |
| 6 | 3 + 3 |
| 7 | 4 + 3 |
| 8 | 3 + 3 + 2 |
| 9 | 3 + 3 + 3 |
| 10 | 4 + 4 + 2 |
| 11 | 4 + 4 + 3 |
| 12 | 4 + 4 + 4 |
| 13+ | rows of 4, remainder on the last row |

Textareas are left out of that count. Each one gets its own full-width row after the other fields.

**Manual layout.** Set `pos: { row, col }` to place a field yourself. Fields with the same `row` share it, ordered by `col`.

```ts
firstName: { fieldType: FieldType.Input, label: 'First', pos: { row: 1, col: 1 } },
lastName:  { fieldType: FieldType.Input, label: 'Last',  pos: { row: 1, col: 2 } },
email:     { fieldType: FieldType.Email, label: 'Email', pos: { row: 2, col: 1 } },
```

You can mix both. Auto-placed fields go below the last explicitly positioned row.

## Running tests

```bash
ng test
```

## License

See [LICENSE](LICENSE).
