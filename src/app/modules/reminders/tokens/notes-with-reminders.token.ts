import { InjectionToken } from '@angular/core';
import { NotesRepository } from '../../notes/repositories';

export const NOTES_WITH_REMINDERS = new InjectionToken<NotesRepository>(
  'notes with reminders'
);
