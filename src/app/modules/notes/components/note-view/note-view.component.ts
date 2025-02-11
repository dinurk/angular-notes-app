import { Component, Inject } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import {
  catchError,
  EMPTY,
  of,
  Subject,
  switchMap,
  take,
  takeUntil,
} from 'rxjs';
import { INote } from '../../interfaces';
import { NotesRepository } from '../../repositories';
import { NzModalService } from 'ng-zorro-antd/modal';

/** Компонент просмотра заметки */
@Component({
  selector: 'app-note-view',
  templateUrl: './note-view.component.html',
  styleUrls: ['./note-view.component.scss'],
})
export class NoteViewComponent {
  private readonly ngUnsubscribe: Subject<void> = new Subject();

  /** Отображаемая заметка */
  public note!: INote;

  public constructor(
    /** Сервис маршрутизации */
    private readonly router: Router,
    /** Сервис уведомлений */
    private readonly notificationService: NzNotificationService,
    private readonly route: ActivatedRoute,
    /** Репозиторий заметок */
    private readonly notesRepository: NotesRepository,
    private readonly modalService: NzModalService
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
          this.router.navigate(['/notes']);
          return;
        }
        this.note = note;
      });
  }

  /** Редактировать заметку */
  public editNote(): void {
    this.router.navigate([`/notes/edit/${this.note.id}`]);
  }

  /** Удалить заметку */
  public onDeleteClick(): void {
    this.modalService.confirm({
      nzTitle: `Удаление`,
      nzContent: `Вы уверены, что хотите удалить заметку?`,
      nzOnOk: () => this.deleteNote(),
      nzCentered: true,
    });
  }

  public deleteNote(): void {
    this.notesRepository
      .removeNote([this.note.id])
      .pipe(
        catchError((err: Error) => {
          this.notificationService.error(
            'Ошибка',
            'Ошибка при удалении заметки'
          );
          console.log(err);
          return EMPTY;
        }),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(() => {
        this.notificationService.success('Успешно', 'Заметка успешно удалена');
        this.router.navigate(['/notes']);
      });
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
