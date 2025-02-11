import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { INote, INoteForm } from '../../interfaces';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import {
  catchError,
  EMPTY,
  map,
  of,
  Subject,
  switchMap,
  takeUntil,
} from 'rxjs';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NotesRepository } from '../../repositories';
import { TagsService } from 'src/app/modules/tags/services';
import { ITag } from 'src/app/modules/tags/interfaces/tag.interface';

/** Комопонент формы добавления/изменения заметки */
@Component({
  selector: 'app-note-form',
  templateUrl: './note-form.component.html',
  styleUrls: ['./note-form.component.scss'],
})
export class NoteFormComponent implements OnInit, OnDestroy {
  private readonly ngUnsubscribe: Subject<void> = new Subject();

  /** Форма добавления/изменения заметки */
  public form!: FormGroup<INoteForm>;

  /** Заголовок формы */
  public title: string = 'Редактирование заметки';

  /** Id редактируемой Заметки */
  public noteId: string | null = null;

  /** Тэги */
  public tags: ITag[] = [];

  public constructor(
    /** Сервис маршрутизации */
    private readonly router: Router,
    /** Сервис уведомлений */
    private readonly notificationService: NzNotificationService,
    /** Репозиторий заметок */
    public readonly notesRepository: NotesRepository,
    /** Сервис тэгов */
    private readonly tagsService: TagsService,
    private readonly route: ActivatedRoute
  ) {}

  /** Инициализация компонента */
  public ngOnInit(): void {
    this.form = new FormGroup<INoteForm>({
      title: new FormControl<string | null>(null, [
        Validators.required,
        Validators.maxLength(200),
      ]),
      text: new FormControl<string | null>(null, [
        Validators.required,
        Validators.maxLength(4000),
      ]),
      tagIds: new FormControl<string[] | null>(null),
    });

    this.tagsService
      .getAllTags()
      .pipe(
        catchError((err: Error) => {
          this.notificationService.error(
            'Ошибка при получении списка тэгов',
            ''
          );
          console.log(err);
          return EMPTY;
        }),
        map((tags: ITag[]) => {
          this.tags = tags;
        }),
        switchMap(() => {
          return this.route.paramMap;
        }),
        switchMap((paramMap: ParamMap) => {
          this.noteId = paramMap.get('noteId');

          /** Открыта форма добавления */
          if (this.noteId === null) {
            this.title = 'Добавить заметку';
            return of(null);
          }

          return this.notesRepository.getNoteById(this.noteId);
        }),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe((note: INote | null) => {
        if (note) {
          this.form.patchValue({
            ...note,
            tagIds: note.tags?.map((tag: ITag) => tag.id),
          });
        }
      });
  }

  /** Сохранить заметку */
  public save(): void {
    const formValue: any = { ...this.form.value };
    /** Для эмуляции работы с бэкендом сделал замену id на полный объект */
    formValue.tags = this.form.value.tagIds?.map((tagId) => {
      return this.tags.find((tag) => tag.id === tagId);
    }) as unknown as string[];
    delete formValue.tagIds;

    /** Добавить заметку */
    if (!this.noteId) {
      this.notesRepository
        .addNote(formValue as INote)
        .pipe(
          catchError((err: Error) => {
            this.notificationService.error(
              'Ошибка',
              'Ошибка при добавлении заметки'
            );
            console.log(err);
            return EMPTY;
          }),
          takeUntil(this.ngUnsubscribe)
        )
        .subscribe((note: INote) => {
          this.notificationService.success(
            'Успешно',
            'Заметка успешно добавлена'
          );
          this.router.navigate([`/notes/view/${note.id}`]);
        });
      return;
    }

    /** Обновить заметку */
    this.notesRepository
      .updateNote({ id: this.noteId, ...formValue } as INote)
      .pipe(
        catchError((err: Error) => {
          this.notificationService.error(
            'Ошибка',
            'Ошибка при обновлении заметки'
          );
          console.log(err);
          return EMPTY;
        }),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe((note: INote) => {
        this.notificationService.success('Успешно', 'Заметка успешно изменена');
        this.router.navigate([`/notes/view/${this.noteId}`]);
      });
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
