import { createStore, withProps } from '@ngneat/elf';
import {
  addEntities,
  deleteAllEntities,
  deleteEntities,
  getEntity,
  updateEntities,
  upsertEntities,
  withEntities,
} from '@ngneat/elf-entities';
import { INote } from '../interfaces';
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
import { NotesService } from '../services';
import { Injectable } from '@angular/core';

/** Состояние списка заметок */
interface INotesRepositoryProps {
  /** Параметры запроса */
  params: Record<string, string>;
}

@Injectable({ providedIn: 'root' })
/** Репозиторий заметок */
export class NotesRepository {
  /** Хранилище заметок */
  private readonly notesStore = createStore(
    { name: 'notes' },
    withProps<INotesRepositoryProps>({
      params: {},
    }),
    withEntities<INote>(),
    withPagination()
  );

  /** Количество записей, отображаемых на одной странице */
  private readonly perPage: number = 8;

  /** Заметки, отображаемые на текущей странице */
  public notes$: Observable<INote[]> = this.notesStore.pipe(
    selectCurrentPageEntities()
  );

  /** Данные пагинации */
  public paginationData$ = this.notesStore.pipe(selectPaginationData());

  public constructor(
    /** Сервис заметок */
    private readonly notesService: NotesService
  ) {
    this.notesStore.update(setCurrentPage(1));
  }

  /**
   * Загрузить с сервера данные страницы
   * @param page - номер страницы
   * */
  private loadPageData(page: number): void {
    this.notesService
      .get(page, this.perPage, this.notesStore.getValue().params)
      .pipe(
        tap((data: IDataPage<INote>) => this.cachePage(data)),
        skipWhilePageExists(this.notesStore, page)
      )
      .subscribe();
  }

  private getCurrentPage(): number {
    return this.notesStore.query(getPaginationData()).currentPage;
  }

  public clearParams() {
    this.notesStore.update((state) => ({
      ...state,
      params: {},
    }));

    this.deleteAllPages();
    this.loadPageData(this.getCurrentPage());
  }

  public setParam(key: string, value: any) {
    this.notesStore.update((state) => ({
      ...state,
      params: { ...state.params, [key]: value },
    }));

    this.deleteAllPages();
    this.loadPageData(this.getCurrentPage());
  }

  /**
   * Перейти на страницу
   * @param currentPage - номер траницы
   * */
  public setCurrentPage(currentPage: number): void {
    if (!this.notesStore.query(hasPage(currentPage))) {
      this.loadPageData(currentPage);
    }
    this.notesStore.update(setCurrentPage(currentPage));
  }

  /**
   * Закэшировать страницу с заметками
   * @param response - результат выполнения запроса заметок
   *  */
  private cachePage(response: IDataPage<INote>): void {
    const { data, ...paginationData } = response;
    this.notesStore.update(
      /** Кэшируем данные страницы */
      upsertEntities(data),
      /** Обновление данных о состоянии пагинации */
      updatePaginationData(paginationData),
      /** Привязка Id полученных записей к номеру страницы */
      setPage(
        paginationData.currentPage,
        data.map((note: INote) => note.id)
      )
    );
  }

  /**
   * Добавить заметку
   * @param note - добавляемая заметка
   * */
  public addNote(note: Omit<INote, 'id'>): Observable<INote> {
    return this.notesService.add(note).pipe(
      tap((note: INote) => {
        this.notesStore.update(addEntities([note]));
        this.deleteAllPages();
        this.loadPageData(this.getCurrentPage());
      })
    );
  }

  /**
   * Удалить заметки
   * @param noteIds - id удаляемых заметок
   * */
  public removeNote(noteIds: string[]) {
    return this.notesService.remove(noteIds).pipe(
      tap(() => {
        this.notesStore.update(deleteEntities(noteIds));
        this.deleteAllPages();
        this.loadPageData(this.getCurrentPage());
      })
    );
  }

  /**
   * Обноаить заметку
   * @param note - обновляеая заметка
   * @returns Observable с обновленной завметкой
   * */
  public updateNote(note: INote): Observable<INote> {
    return this.notesService.update(note).pipe(
      tap((note: INote) => {
        this.notesStore.update(updateEntities(note.id, note));
        this.deleteAllPages();
        this.loadPageData(this.getCurrentPage());
      })
    );
  }

  /** Удалить все закэшированные страницы */
  public deleteAllPages(): void {
    this.notesStore.update(deleteAllPages());
  }

  /** Удалить все закэшированные заметки */
  public deleteAllEntities() {
    this.notesStore.update(deleteAllEntities());
  }

  /** Удалить закэшированные страницы и заметки */
  public clearCached() {
    this.deleteAllEntities();
    this.deleteAllPages();
  }

  /**
   * Получить заметку по Id
   * @param noteId - Id заметки
   * @returns Найденная заметка или null, если заметка не была найдена
   * */
  public getNoteById(noteId: string): Observable<INote | null> {
    const note: INote | null = this.notesStore.query(getEntity(noteId)) ?? null;

    if (note) {
      return of(note);
    }
    return this.notesService
      .getById(noteId)
      .pipe(
        tap(
          (note: INote | null) =>
            note && this.notesStore.update(addEntities(note))
        )
      );
  }
}
