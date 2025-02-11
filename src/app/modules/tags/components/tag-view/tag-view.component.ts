import { Component } from '@angular/core';
import {
  catchError,
  EMPTY,
  map,
  of,
  Subject,
  switchMap,
  takeUntil,
} from 'rxjs';
import { ITag } from '../../interfaces/tag.interface';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { TagsRepository } from '../../repositories';
import { NzModalService } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-tag-view',
  templateUrl: './tag-view.component.html',
  styleUrls: ['./tag-view.component.scss'],
})
export class TagViewComponent {
  private readonly ngUnsubscribe: Subject<void> = new Subject();

  /** Отображаемый тэг */
  public tag!: ITag;

  public constructor(
    /** Сервис маршрутизации */
    private readonly router: Router,
    /** Текущий маршрут */
    private readonly route: ActivatedRoute,
    /** Сервис уведомлений */
    private readonly notificationService: NzNotificationService,
    /** Репозиторий тэгов */
    private readonly tagsRepository: TagsRepository,
    /** Сервис модальных окон */
    private readonly modalService: NzModalService
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
        if (tag === null) {
          this.notificationService.error('Неверный маршрут', '');
          this.router.navigate(['/tags']);
          return;
        }
        this.tag = tag;
      });
  }

  /** Редактировать заметку */
  public editTag(): void {
    this.router.navigate([`/tags/edit/${this.tag.id}`]);
  }

  /** Обработчик кнопки "Удалить" */
  public onDeleteClick() {
    this.modalService.confirm({
      nzTitle: `Удаление`,
      nzContent: `Вы уверены, что хотите удалить тэг?`,
      nzOnOk: () => this.deleteTag(),
      nzCentered: true,
    });
  }

  /** Удалить напомонание */
  public deleteTag(): void {
    this.tagsRepository
      .removeTag([this.tag.id])
      .pipe(
        catchError((err: Error) => {
          this.notificationService.error('Ошибка при удалении тэга', '');
          console.log(err);
          return EMPTY;
        }),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(() => {
        this.notificationService.success('Успешно', 'Тэг успешно удален');
        this.router.navigate(['/tags']);
      });
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
