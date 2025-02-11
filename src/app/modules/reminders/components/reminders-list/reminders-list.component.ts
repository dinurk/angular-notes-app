import { Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NotesRepository } from 'src/app/modules/notes/repositories';
import {
  catchError,
  EMPTY,
  Observable,
  Subject,
  switchMap,
  takeUntil,
} from 'rxjs';
import { INote } from 'src/app/modules/notes/interfaces';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NOTES_WITH_REMINDERS, NOTES_WITHOUT_REMINDERS } from '../../tokens';

@Component({
  selector: 'app-reminders-list',
  templateUrl: './reminders-list.component.html',
  styleUrls: ['./reminders-list.component.scss'],
})
export class RemindersListComponent implements OnInit {
  private readonly ngUnsubscribe: Subject<void> = new Subject();

  /** Заметки (напоминания), отображаемые на текущей странице */
  public notes$: Observable<INote[]> = this.notesRepository.notes$;

  /** Номер текущей страницы */
  public paginationData$ = this.notesRepository.paginationData$;

  /** Количество элементов, отображаемых на странице */
  public readonly limit: number = 10;

  public constructor(
    /** Сервис маршрутизаци */
    private readonly router: Router,
    /** Сервис уведомлений */
    private readonly notificationService: NzNotificationService,
    /** Сервис заметок */
    private readonly notesRepository: NotesRepository,
    /** Сервис модальных окон */
    private readonly modalService: NzModalService,
    @Inject(NOTES_WITHOUT_REMINDERS)
    public readonly notesWithoutRemindersRepository: NotesRepository
  ) {}

  /** Инициализация компонента */
  public ngOnInit(): void {
    this.notesRepository.setParam('hasReminder', true);
    this.notesWithoutRemindersRepository.setParam('hasReminder', false);
  }

  /** Добавить напоминание */
  public addReminder(): void {
    this.router.navigate(['/reminders/add']);
  }

  /**
   * Обработчик кнопки "Удалить напоминание"
   * @param noteId - Id заметки, для которой удаляется напоминание
   */
  public onDeleteClick(noteId: string) {
    this.modalService.confirm({
      nzTitle: `Удаление`,
      nzContent: `Вы уверены, что хотите удалить напоминание?`,
      nzOnOk: () => this.deleteReminder(noteId),
      nzCentered: true,
    });
  }

  /** Изменить напоминание
   * @param noteId - Id напоминания
   */
  public editReminder(noteId: string) {
    this.router.navigate([`/reminders/edit/${noteId}`]);
  }

  /**
   * Удалить напомонание
   * @param noteId - Id заметки, для которой удаляется напоминание
   */
  public deleteReminder(noteId: string): void {
    this.notesRepository
      .getNoteById(noteId)
      .pipe(
        switchMap((note: INote | null) => {
          return this.notesRepository.updateNote({
            ...note!,
            reminderDateTime: null,
          });
        }),
        catchError((err: Error) => {
          this.notificationService.error('Ошибка при удалении напоминания', '');
          console.log(err);
          return EMPTY;
        }),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(() => {
        this.notificationService.success(
          'Успешно',
          'Напоминание успешно удалено'
        );
        this.router.navigate(['/reminders']);
      });
  }

  /**
   * Обработчик изменения номера страницы
   * @param pageNumber - номер страницы
   * */
  public onChangePageNumber(pageNumber: number): void {
    this.notesRepository.setCurrentPage(pageNumber);
  }

  /**
   * Функция отслеживания изменений в списке заметок
   * @param index - номер записи
   * @param item - элемент списка
   * @returns ID элемента списка
   *  */
  public trackByFn(index: number, item: INote): string {
    return item.id;
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
