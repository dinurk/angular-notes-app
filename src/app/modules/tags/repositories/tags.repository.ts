import { createStore } from '@ngneat/elf';
import {
  addEntities,
  deleteAllEntities,
  deleteEntities,
  getEntity,
  updateEntities,
  upsertEntities,
  withEntities,
} from '@ngneat/elf-entities';
import {
  deleteAllPages,
  getPaginationData,
  hasPage,
  selectCurrentPageEntities,
  selectPaginationData,
  setCurrentPage,
  setPage,
  skipWhilePageExists,
  updatePaginationData,
  withPagination,
} from '@ngneat/elf-pagination';
import { Observable, of, tap } from 'rxjs';
import { IDataPage } from 'src/app/interfaces';
import { ITag } from '../interfaces/tag.interface';
import { Injectable } from '@angular/core';
import { TagsService } from '../services';

@Injectable({ providedIn: 'root' })
/** Репозиторий тэгов */
export class TagsRepository {
  private readonly tagsStore = createStore(
    { name: 'tags' },
    withEntities<ITag>(),
    withPagination()
  );

  /** Тэги, отображаемые на текущей странице */
  public tags$: Observable<ITag[]> = this.tagsStore.pipe(
    selectCurrentPageEntities()
  );

  /** Количество записей, отображаемых на одной странице */
  private readonly perPage: number = 8;

  /** Данные пагинации */
  public paginationData$ = this.tagsStore.pipe(selectPaginationData());

  public constructor(
    /** Сервис тэгов */
    private readonly tagsService: TagsService
  ) {
    this.tagsStore.update(setCurrentPage(1));
  }

  /**
   * Загрузить с сервера данные страницы
   * @param page - номер страницы
   * */
  private loadPageData(page: number): void {
    this.tagsService
      .get(page, this.perPage)
      .pipe(
        tap((data: IDataPage<ITag>) => this.cachePage(data)),
        skipWhilePageExists(this.tagsStore, page)
      )
      .subscribe();
  }

  private getCurrentPage(): number {
    return this.tagsStore.query(getPaginationData()).currentPage;
  }

  /**
   * Перейти на страницу
   * @param currentPage - номер траницы
   * */
  public setCurrentPage(currentPage: number): void {
    if (!this.tagsStore.query(hasPage(currentPage))) {
      this.loadPageData(currentPage);
    }
    this.tagsStore.update(setCurrentPage(currentPage));
  }

  /**
   * Закэшировать страницу с тэгами
   * @param response - результат выполнения запроса заметок
   * */
  private cachePage(response: IDataPage<ITag>): void {
    const { data, ...paginationData } = response;
    this.tagsStore.update(
      /** Кэшируем данные страницы */
      upsertEntities(data),
      /** Обновление данных о состоянии пагинации */
      updatePaginationData(paginationData),
      /** Привязка Id полученных записей к номеру страницы */
      setPage(
        paginationData.currentPage,
        data.map((tag: ITag) => tag.id)
      )
    );
  }

  /**
   * Добавить тэг
   * @param tag - добавляемый тэг
   * */
  public addTag(tag: Omit<ITag, 'id'>): Observable<ITag> {
    return this.tagsService.add(tag).pipe(
      tap((tag: ITag) => {
        this.tagsStore.update(addEntities([tag]));
        this.deleteAllPages();
        this.loadPageData(this.getCurrentPage());
      })
    );
  }

  /**
   * Удалить заметки
   * @param tagIds - id удаляемых тэгов
   * */
  public removeTag(tagIds: string[]) {
    return this.tagsService.remove(tagIds).pipe(
      tap(() => {
        this.tagsStore.update(deleteEntities(tagIds));
        this.deleteAllPages();
        this.loadPageData(this.getCurrentPage());
      })
    );
  }

  /**
   * Обноаить тэг
   * @param tag - обновляемый тэг
   * @returns Observable с обновленной тэгом
   * */
  public updateTag(tag: ITag): Observable<ITag> {
    return this.tagsService.update(tag).pipe(
      tap((tag: ITag) => {
        this.tagsStore.update(updateEntities(tag.id, tag));
        this.deleteAllPages();
        this.loadPageData(this.getCurrentPage());
      })
    );
  }

  /** Удалить все закэшированные страницы */
  public deleteAllPages(): void {
    this.tagsStore.update(deleteAllPages());
  }

  /** Удалить все закэшированные тэги */
  public deleteAllEntities() {
    this.tagsStore.update(deleteAllEntities());
  }

  /**
   * Получить тэг по Id
   * @param tagId - Id тэга
   * @returns Найденный тег или null, если тэг не был найден
   * */
  public getTagById(tagId: string): Observable<ITag | null> {
    const tag: ITag | null = this.tagsStore.query(getEntity(tagId)) ?? null;

    if (tag) {
      return of(tag);
    }
    return this.tagsService
      .getById(tagId)
      .pipe(tap((tag: ITag) => this.tagsStore.update(addEntities(tag))));
  }
}
