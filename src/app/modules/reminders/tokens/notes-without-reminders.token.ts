import { InjectionToken } from '@angular/core';
import { NotesRepository } from '../../notes/repositories';

export const NOTES_WITHOUT_REMINDERS = new InjectionToken<NotesRepository>(
  'notes without reminders'
);
