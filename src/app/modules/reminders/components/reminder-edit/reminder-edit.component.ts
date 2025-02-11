import { Component } from '@angular/core';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { catchError, EMPTY, of, Subject, switchMap, takeUntil } from 'rxjs';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { DateTime } from 'luxon';
import { NotesRepository } from 'src/app/modules/notes/repositories';
import { INote } from 'src/app/modules/notes/interfaces';

@Component({
  selector: 'app-reminder-edit',
  templateUrl: './reminder-edit.component.html',
  styleUrls: ['./reminder-edit.component.scss'],
})
export class ReminderEditComponent {
  private readonly ngUnsubscribe: Subject<void> = new Subject();

  /** Время напоминания о заметке */
  public reminderDate: Date | null = null;

  /** выбранной заметки */
  private selectedNote: INote | null = null;

  public constructor(
    private readonly notesRepository: NotesRepository,
    /** Сервис уведомлений */
    private readonly notificationService: NzNotificationService,
    /** Сервис маршрутизации */
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {}

  /** Инициализация компонента */
  public ngOnInit(): void {
    this.route.paramMap
      .pipe(
        switchMap((paramMap: ParamMap) => {
          const noteId = paramMap.get('noteId');
          if (!noteId) {
            return of(null);
          }
          return this.notesRepository.getNoteById(noteId);
        }),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe((note: INote | null) => {
        if (note === null) {
          this.notificationService.error('Неверный маршрут', '');
          this.router.navigate(['/reminders']);
          return;
        }
        this.selectedNote = note;

        if (!this.selectedNote.reminderDateTime) {
          return;
        }

        this.reminderDate = DateTime.fromFormat(
          this.selectedNote.reminderDateTime,
          'yyyy-MM-dd HH:mm:ss',
          {
            zone: 'UTC',
          }
        ).toJSDate();
      });
  }

  /** Сохранить данные формы (установить напоминание) */
  public save(): void {
    const dateTimeString: string = DateTime.fromJSDate(this.reminderDate!)
      .toUTC()
      .toFormat('yyyy-MM-dd HH:mm:ss');

    this.notesRepository
      .updateNote({ ...this.selectedNote!, reminderDateTime: dateTimeString })
      .pipe(
        catchError((err: Error) => {
          this.notificationService.error(
            'Ошибка',
            'Ошибка при изменении напоминания'
          );
          console.log(err);
          return EMPTY;
        }),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(() => {
        this.notificationService.success(
          'Успешно',
          'Напоминание успешно изменено'
        );
        this.router.navigate(['/reminders']);
      });
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
