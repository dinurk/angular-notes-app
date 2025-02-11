import { Component, OnInit } from '@angular/core';
import { DateTime } from 'luxon';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { catchError, EMPTY, Subject, takeUntil } from 'rxjs';
import { INote } from 'src/app/modules/notes/interfaces';
import { NotesRepository } from 'src/app/modules/notes/repositories';
import { NotesService } from 'src/app/modules/notes/services';

@Component({
  selector: 'app-reminders-calendar',
  templateUrl: './reminders-calendar.component.html',
  styleUrls: ['./reminders-calendar.component.scss'],
})
export class RemindersCalendarComponent implements OnInit {
  private readonly ngUnsubscribe: Subject<void> = new Subject();

  /**
   * Словарь заметок: дню месяца сопоставляются заметки,
   * у которых на этот день установлено напоминание
   * */
  public notesMap: Map<number, INote[]> = new Map();

  /** Выбранный месяц в календаре */
  public selectedDate: Date = new Date();

  public constructor(
    /** Сервис заметок */
    private readonly notesService: NotesService,
    private readonly notesRepository: NotesRepository,
    /** Сервис уведомлений */
    private readonly notificationService: NzNotificationService
  ) {}

  /** Инициализация компонента */
  public ngOnInit(): void {
    this.selectedDate = new Date();
    this.getNotesForSelectedMonth(this.selectedDate);

    this.notesRepository.notes$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        this.refresh();
      });
  }

  /** Обновить данные календаря */
  public refresh() {
    this.notesMap.clear();
    this.getNotesForSelectedMonth(this.selectedDate);
  }

  /** Получить заметки на текущий месяц (выбранный в календаре) */
  public getNotesForSelectedMonth(date: Date) {
    this.notesService
      .getNotesForMonth(DateTime.fromJSDate(date).toFormat('yyyy-MM'))
      .pipe(
        catchError((err: Error) => {
          this.notificationService.error(
            'Ошибка',
            'Ошибка при загрузке заметок за текущий месяц'
          );
          console.log(err);
          return EMPTY;
        }),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe((notes: INote[]) => {
        notes.forEach((note: INote) => {
          const noteReminderDateTime: DateTime = DateTime.fromFormat(
            note.reminderDateTime!,
            'yyyy-MM-dd HH:mm:ss',
            {
              zone: 'UTC',
            }
          );

          let notesForDay: INote[] | undefined = this.notesMap.get(
            noteReminderDateTime.toLocal().day
          );

          if (!notesForDay) {
            notesForDay = [note];
            this.notesMap.set(noteReminderDateTime.toLocal().day, notesForDay);
            return;
          }

          notesForDay.push(note);
        });
      });
  }

  /**
   * На дату есть напоминания
   * @param date - дата, для которой проверяется наличие напоминаний
   * @returns признак наличия напоминаний на указанную дату
   * */
  public hasRemindersForDate(date: Date): boolean {
    return (
      this.notesMap.has(date.getDate()) &&
      date.getMonth() === this.selectedDate.getMonth()
    );
  }

  /**
   * Получить напоминания на дату
   * @param date - дата, на которую нужно получить уведомления
   * @returns напоминания на указанную дату
   */
  public getRemindersForDate(date: Date): INote[] {
    return this.notesMap.get(date.getDate())!;
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
