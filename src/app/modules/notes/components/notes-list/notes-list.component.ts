import { Component, Inject, OnInit } from '@angular/core';
import { INote } from '../../interfaces';
import { NzModalService } from 'ng-zorro-antd/modal';
import {
  ActivatedRoute,
  NavigationEnd,
  ParamMap,
  Router,
} from '@angular/router';
import {
  catchError,
  EMPTY,
  filter,
  map,
  Observable,
  Subject,
  takeUntil,
} from 'rxjs';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NotesRepository } from '../../repositories';

/** Компоенент списка с заметками */
@Component({
  selector: 'app-notes-list',
  templateUrl: './notes-list.component.html',
  styleUrls: ['./notes-list.component.scss'],
})
export class NotesListComponent implements OnInit {
  private readonly ngUnsubscribe: Subject<void> = new Subject();

  /** Заметки, отображаемые на текущей странице */
  public notes$: Observable<INote[]> = this.notesRepository.notes$;

  public checkedNotesIds: Set<string> = new Set();

  public selectedNoteId: string | null = null;

  /** Номер текущей страницы */
  public paginationData$ = this.notesRepository.paginationData$;

  public constructor(
    /** Сервис модальных окон */
    private readonly modalService: NzModalService,
    /** Сервис маршрутизаци */
    private readonly router: Router,
    /** Сервис уведомлений */
    private readonly notificationService: NzNotificationService,
    /** Репозиторий заметок */
    public readonly notesRepository: NotesRepository,
    private readonly route: ActivatedRoute
  ) {}

  public ngOnInit(): void {
    this.notesRepository.clearParams();

    /** Пока что сделал так, в дальнейшем нужно будет переделать */
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe((event: any) => {
        this.selectedNoteId = event.url.slice(event.url.lastIndexOf('/') + 1);
      });
  }

  public onDeleteClick(): void {
    this.modalService.confirm({
      nzTitle: `Удаление`,
      nzContent: `Вы уверены, что хотите удалить выбранные элементы?`,
      nzOnOk: () => this.deleteChecked(),
      nzCentered: true,
    });
  }

  public async deleteChecked(): Promise<void> {
    this.notesRepository
      .removeNote(Array.from(this.checkedNotesIds))
      .pipe(
        catchError((err: Error) => {
          this.notificationService.error('Ошибка при удалении напоминаний', '');
          console.log(err);
          return EMPTY;
        }),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(() => {
        this.notificationService.success(
          'Успешно',
          'Напоминания успешно удалены'
        );
        this.checkedNotesIds.clear();
        this.selectedNoteId = null;
        this.router.navigate(['/notes']);
      });
  }

  /**
   * Обработчик нажатия на карточку заметки
   * @param note - заметка, на которую кликнул пользователь
   * @param event - событие клика мышью
   * */
  public async onNoteCardClick(
    noteId: string,
    event: MouseEvent
  ): Promise<void> {
    /** Простой клик на карточку открывает форму просмотра */
    if (!event.ctrlKey) {
      this.selectedNoteId = noteId;
      this.viewNote(noteId);
      return;
    }

    /** Клик с зажатым ctrl выделяет элемент списка  */
    if (this.selectedNoteId && this.checkedNotesIds.size === 0) {
      this.checkedNotesIds.add(this.selectedNoteId);

      if (this.selectedNoteId === noteId) {
        return;
      }
    }

    this.onNoteChecked(noteId);
  }

  public onNoteChecked(noteId: string) {
    if (this.checkedNotesIds.has(noteId)) {
      this.checkedNotesIds.delete(noteId);
    } else {
      this.checkedNotesIds.add(noteId);
    }
  }

  /** Снять выделение */
  public clearChecked() {
    this.checkedNotesIds.clear();
  }

  /**
   * Просмотреть заметку
   * @param noteId - Id заметки для просмотра
   * */
  public viewNote(noteId: string) {
    this.router.navigate([`/notes/view/${noteId}`]);
  }

  /** Добавить заметку */
  public addNote(): void {
    this.router.navigate(['/notes/add']);
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
