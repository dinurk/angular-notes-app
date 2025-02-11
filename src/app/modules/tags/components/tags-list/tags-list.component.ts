import { Component, OnInit } from '@angular/core';
import { filter, Observable, Subject, takeUntil } from 'rxjs';
import { ITag } from '../../interfaces/tag.interface';
import { NavigationEnd, Router } from '@angular/router';
import { TagsRepository } from '../../repositories';

@Component({
  selector: 'app-tags-list',
  templateUrl: './tags-list.component.html',
  styleUrls: ['./tags-list.component.scss'],
})
export class TagsListComponent implements OnInit {
  private readonly ngUnsubscribe: Subject<void> = new Subject();

  public constructor(
    /** Сервис маршрутизаци */
    private readonly router: Router,
    /** Репозиторий тэгов */
    public readonly tagsRepository: TagsRepository
  ) {}

  /** Тэги, отображаемые на текущей странице */
  public tags$: Observable<ITag[]> = this.tagsRepository.tags$;

  /** Номер текущей страницы */
  public paginationData$ = this.tagsRepository.paginationData$;

  /** Инициализация компонента */
  public ngOnInit(): void {
    /** Пока что сделал так, в дальнейшем нужно будет переделать */
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe((event: any) => {
        this.selectedTagId = event.url.slice(event.url.lastIndexOf('/') + 1);
      });
  }

  public selectedTagId: string | null = null;

  /**
   * Просмотр тэга
   * @param tagId - Id тэга
   * */
  public viewTag(tagId: string): void {
    this.router.navigate([`/tags/view/${tagId}`]);
  }

  /** Добавить тэг */
  public addTag(): void {
    this.router.navigate(['/tags/add']);
  }

  /**
   * Обработчик изменения номера страницы
   * @param pageNumber - номер страницы
   * */
  public onChangePageNumber(pageNumber: any): void {
    this.tagsRepository.setCurrentPage(pageNumber);
  }

  /**
   * Функция отслеживания изменений в списке заметок
   * @param index - номер записи
   * @param item - элемент списка
   * @returns ID элемента списка
   *  */
  public trackByFn(index: number, item: ITag): string {
    return item.id;
  }

  public selectTag(tagId: string) {
    this.selectedTagId = tagId;
    this.viewTag(tagId);
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
