import { Component } from '@angular/core';
import { catchError, EMPTY, of, Subject, switchMap, takeUntil } from 'rxjs';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { TagsPanelStateRepository, TagsRepository } from '../../repositories';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { ITag } from '../../interfaces/tag.interface';

@Component({
  selector: 'app-tag-form',
  templateUrl: './tag-form.component.html',
  styleUrls: ['./tag-form.component.scss'],
})
export class TagFormComponent {
  private readonly ngUnsubscribe: Subject<void> = new Subject();

  public title: string = 'Добавить тэг';

  public tagName: string | null = null;

  /** Выбранный тэг для редактирования */
  private selectedTag: ITag | null = null;

  public constructor(
    /** Сервис уведомлений */
    private readonly notificationService: NzNotificationService,
    /** Репозиторий состояния панели напоминаний */
    private readonly tagsPanelStateRepository: TagsPanelStateRepository,
    private readonly tagsRepository: TagsRepository,
    /** Сервис маршрутизации */
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {}

  /** Инициализация компонента */
  public ngOnInit(): void {
    this.route.paramMap
      .pipe(
        switchMap((paramMap: ParamMap) => {
          const tagId = paramMap.get('tagId');
          if (!tagId) {
            return of(null);
          }

          return this.tagsRepository.getTagById(tagId);
        }),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe((tag: ITag | null) => {
        if (tag) {
          this.title = 'Редактирование тэга';
          this.selectedTag = tag;
          this.tagName = tag.name;
        }
      });
  }

  /** Сохранить данные формы (установить напоминание) */
  public async save(): Promise<void> {
    if (this.selectedTag) {
      this.tagsRepository
        .updateTag({ ...this.selectedTag!, name: this.tagName! })
        .pipe(
          catchError((err: Error) => {
            this.notificationService.error(
              'Ошибка',
              'Ошибка при изменении тэга'
            );
            console.log(err);
            return EMPTY;
          }),
          takeUntil(this.ngUnsubscribe)
        )
        .subscribe(() => {
          this.notificationService.success('Успешно', 'Тэг успешно изменен');
          this.router.navigate([`/tags/view/${this.selectedTag?.id}`]);
        });
      return;
    }

    this.tagsRepository
      .addTag({ name: this.tagName! })
      .pipe(
        catchError((err: Error) => {
          this.notificationService.error(
            'Ошибка',
            'Ошибка при добавлении тэга'
          );
          console.log(err);
          return EMPTY;
        }),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe((tag: ITag) => {
        this.notificationService.success('Успешно', 'Тэг успешно добавлен');
        this.router.navigate([`/tags/view/${tag.id}`]);
      });
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
