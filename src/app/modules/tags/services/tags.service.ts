import { Injectable } from '@angular/core';
import { ITag } from '../interfaces/tag.interface';
import { Observable, of } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { IDataPage } from 'src/app/interfaces';

@Injectable({
  providedIn: 'root',
})
export class TagsService {
  private tags: ITag[] = [];

  public constructor() {}

  /** Получить все тэги */
  public getAllTags(): Observable<ITag[]> {
    return of(this.tags);
  }

  public get(page: number, limit: number): Observable<IDataPage<ITag>> {
    return of({
      data: this.tags.slice((page - 1) * limit, page * limit),
      total: this.tags.length,
      perPage: limit,
      lastPage: Math.ceil(this.tags.length / limit),
      currentPage: page,
    });
  }

  public getById(id: string): Observable<ITag> {
    const tag: ITag | undefined = this.tags.find(
      (item: ITag) => item.id === id
    );

    if (!tag) {
      throw new Error(`item with id ${id} not found`);
    }

    return of(tag);
  }

  public remove(itemIds: string[]): Observable<void> {
    this.tags = this.tags.filter((item: ITag) => !itemIds.includes(item.id));
    return of(undefined);
  }

  public update(tag: ITag): Observable<ITag> {
    const index: number = this.tags.findIndex(
      (item: ITag) => item.id === tag.id
    );
    if (index === -1) {
      throw new Error('note not found');
    }
    this.tags[index] = { ...this.tags[index], ...tag };
    return of(tag);
  }

  public add(tag: Omit<ITag, 'id'>): Observable<ITag> {
    const newTag = { id: uuidv4(), ...tag };
    this.tags.push(newTag);
    return of(newTag);
  }
}
