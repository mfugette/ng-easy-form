import { afterNextRender, Component, effect, inject, signal } from '@angular/core';
import { Validators } from '@angular/forms';
import { EasyFormComponent, FieldType, EasyFormBuilder } from 'ng-easy-form-lib';
import { cities, countries, languages, users } from './data';
import { MatDialog } from '@angular/material/dialog';
import { debounceTime } from 'rxjs';

export interface Employee {
  firstName: string;
  lastName: string;
  email: string;
  age: number | null;
  bio: string;
  country: string;
  languages: string[];
  city: string;
  users: string[];
  birthDate: Date | null;
  startDate: Date | null;
  dateAndTime: Date | null;
  appointmentTime: string;
  favoriteColor: string;
}

const testEmployee: Employee = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  age: 28,
  bio: '',
  country: 'us',
  languages: ['en', 'es', 'fr'],
  city: 'chi',
  users: [users[0].key, users[4].key, users[12].key],
  birthDate: new Date('1996-03-15'),
  startDate: new Date('2021-06-01'),
  dateAndTime: new Date('2026-07-04T09:00:00'),
  appointmentTime: '14:30',
  favoriteColor: '#4f46e5',
};

@Component({
  selector: 'app-root',
  imports: [EasyFormComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('ng-easy-form-demo');

  readonly fb = inject(EasyFormBuilder);
  disable = signal<boolean>(false);

  _ = effect(() => {
    const shouldDisable = this.disable();
    ['firstName', 'lastName', 'email', 'age'].forEach((key) => {
      shouldDisable ? this.form.controls[key].disable() : this.form.controls[key].enable();
    });
  });

  readonly form = this.fb.build(
    {
      firstName: {
        fieldType: FieldType.Input,
        label: 'First Name',
        placeholder: 'Enter first name',
        disabled: this.disable(),
        validators: Validators.required,
      },
      lastName: {
        fieldType: FieldType.Input,
        label: 'Last Name',
        placeholder: 'Enter last name',
        disabled: this.disable(),
        validators: Validators.required,
      },
      email: {
        fieldType: FieldType.Email,
        label: 'Email Address',
        placeholder: 'you@example.com',
        disabled: this.disable(),
        validators: Validators.required,
      },
      age: {
        fieldType: FieldType.Number,
        label: 'Age',
        placeholder: '18',
        disabled: this.disable(),
        validators: Validators.required,
      },
      bio: {
        fieldType: FieldType.Textarea,
        label: 'Biography',
        placeholder: 'Tell us about yourself...',
      },
      country: {
        fieldType: FieldType.Select,
        label: 'Country',
        options: countries,
      },
      languages: {
        fieldType: FieldType.Multiselect,
        label: 'Languages Spoken',
        options: languages,
      },
      city: {
        fieldType: FieldType.Autocomplete,
        label: 'City',
        placeholder: 'Search for a city...',
        options: users,
      },
      birthDate: {
        fieldType: FieldType.Date,
        label: 'Date of Birth',
      },
      startDate: {
        fieldType: FieldType.Date,
        label: 'Start Date',
      },
      favoriteColor: {
        fieldType: FieldType.Color,
        label: 'Favorite Color',
      },
      wearsHats: {
        fieldType: FieldType.Checkbox,
        label: 'Wears Hats',
      },
      likesApples: {
        fieldType: FieldType.Toggle,
        label: 'Likes Apples',
      },
    },
    null,
  );

  __ = afterNextRender(() => this._setupChangeHandlers());

  private _setupChangeHandlers(): void {
    const { startDate, country, email } = this.form.controls;

    startDate.valueChanges.subscribe((val) => {
      console.log('startDate changed:', val);
    });

    country.valueChanges.subscribe((val) => {
      console.log('country changed:', val);
    });

    email.valueChanges.pipe(debounceTime(300)).subscribe((val) => {
      console.log('email changed:', val);
    });
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      console.error('Please fill out all required fields.');
      return;
    }

    const form = this.form;
    const payload: Employee = {
      ...testEmployee,
      ...form.value,
    };
    console.log('payload', payload);
  }
}
