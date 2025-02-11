import { FormControl } from '@angular/forms';

/** Форма добавления/изменеия заметки */
export interface INoteForm {
  /** Заголовок заметки */
  title: FormControl<string | null>;
  /** Заметка */
  text: FormControl<string | null>;
  /** Тэги */
  tagIds: FormControl<string[] | null>;
}
