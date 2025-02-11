import { createStore, withProps, select } from '@ngneat/elf';
import { Observable, Subject } from 'rxjs';
import { Injectable } from '@angular/core';

/** Состояние списка тэгов */
interface ITagsPanelStateProps {
  /** Id выделенных тэгов */
  checkedTagsIds: Set<string>;
  /** Id выбраного ждля редактирования тэга */
  selectedTagId: string | null;
}

/** Хранилище состояния панели тэгов */
export const tagsListStateStore = createStore(
  { name: 'tagsListState' },
  withProps<ITagsPanelStateProps>({
    checkedTagsIds: new Set<string>(),
    selectedTagId: null,
  })
);

/** Репозиторий состояния панели тэгов */
@Injectable({ providedIn: 'root' })
export class TagsPanelStateRepository {
  public checkedTagsIds$: Observable<Set<string>> = tagsListStateStore.pipe(
    select((state: ITagsPanelStateProps) => state.checkedTagsIds)
  );

  public selectedTagId$: Observable<string | null> = tagsListStateStore.pipe(
    select((state: ITagsPanelStateProps) => state.selectedTagId)
  );

  private needRefresh: Subject<void> = new Subject();
  public needRefresh$: Observable<void> = this.needRefresh;

  /** Запросить обновление данных страницы */
  public refresh() {
    this.needRefresh.next();
  }

  /**
   * Выбрать тэг для редактирования
   * @param tagId - Id выбранного тэга
   * */
  public selectTag(tagId: string | null): void {
    tagsListStateStore.update((state) => ({
      ...state,
      selectedTagId: tagId,
    }));
  }

  /**
   * Обработчик выделения тэга
   * @param tagId - Id тэга
   * */
  public handleTagCheck(tagId: string): void {
    const { checkedTagsIds } = tagsListStateStore.state;

    tagsListStateStore.update((state) => {
      const newSet = new Set(state.checkedTagsIds);
      !checkedTagsIds.has(tagId) ? newSet.add(tagId) : newSet.delete(tagId);
      return {
        ...state,
        checkedTagsIds: newSet,
      };
    });
  }

  /**
   * Сбросить состояние репозитория
   * Выбранный тэг становится null, список выделенных тэгов очищается
   */
  public reset(): void {
    tagsListStateStore.update((state) => ({
      selectedTagId: null,
      checkedTagsIds: new Set(),
    }));
  }
}
