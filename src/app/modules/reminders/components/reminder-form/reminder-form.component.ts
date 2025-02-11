import { Component, Inject, OnInit } from '@angular/core';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { catchError, EMPTY, Observable, Subject, takeUntil } from 'rxjs';
import { INote } from 'src/app/modules/notes/interfaces';
import { NotesRepository } from 'src/app/modules/notes/repositories';
import { DateTime } from 'luxon';
import { Router } from '@angular/router';
import { NOTES_WITHOUT_REMINDERS } from '../../tokens';

@Component({
  selector: 'app-reminder-form',
  templateUrl: './reminder-form.component.html',
  styleUrls: ['./reminder-form.component.scss'],
})
export class ReminderFormComponent implements OnInit {
  private readonly ngUnsubscribe: Subject<void> = new Subject();

  /** Номер шага заполенния формы */
  public currentStep: number = 0;

  public selectedNote: INote | null = null;

  /** Заметки, отображаемые на текущей странице */
  public notes$: Observable<INote[]> =
    this.notesWithoutRemindersRepository.notes$;

  /** Номер текущей страницы */
  public paginationData$ = this.notesWithoutRemindersRepository.paginationData$;

  /** Время напоминания о заметке */
  public reminderDate: Date | null = null;

  public constructor(
    /** Сервис заметок */
    @Inject(NOTES_WITHOUT_REMINDERS)
    private readonly notesWithoutRemindersRepository: NotesRepository,
    private readonly notesRepository: NotesRepository,
    /** Сервис уведомлений */
    private readonly notificationService: NzNotificationService,
    /** Севрис маршрутизации */
    private readonly router: Router
  ) {}

  /** Инициализация компонента */
  public ngOnInit(): void {
    this.notesWithoutRemindersRepository.setParam('hasReminder', false);
  }

  /**
   * Обработчик изменения номера страницы (при выборе заметок)
   * @param pageNumber - номер страницы
   * */
  public onChangePageNumber(pageNumber: number): void {
    this.notesWithoutRemindersRepository.setCurrentPage(pageNumber);
  }

  /** Переход на предыдущий шаг формы */
  public back(): void {
    this.currentStep = this.currentStep - 1;
    this.reminderDate = null;
  }

  /** Переход на следующий шаг формы */
  public next(): void {
    this.currentStep = this.currentStep + 1;
  }

  public setectNote(note: INote) {
    this.selectedNote = note;
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
            'Ошибка при добавлении напоминания'
          );
          console.log(err);
          return EMPTY;
        }),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(() => {
        this.notificationService.success(
          'Успешно',
          'Напоминание успешно добавлено'
        );

        this.router.navigate(['reminders']);
      });
  }

  public trackByFn(index: number, item: INote) {
    return item.id;
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
