import { Injectable } from '@angular/core';
import { IDataPage } from 'src/app/interfaces';
import { INote } from '../interfaces';
import { Observable, of, tap } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { DateTime } from 'luxon';

/** Сервис заметок */
@Injectable({
  providedIn: 'root',
})
export class NotesService {
  private notes: INote[] = [];

  public constructor() {}

  public get(
    page: number,
    limit: number,
    params: Record<string, any>
  ): Observable<IDataPage<INote>> {
    /** Эмуляция работы с бэкендом */
    if (params['hasReminder'] === true) {
      return this.getNotesWithReminders(page, limit);
    } else if (params['hasReminder'] === false) {
      return this.getNotesWithoutReminders(page, limit);
    }
    return of({
      data: this.notes.slice((page - 1) * limit, page * limit),
      total: this.notes.length,
      perPage: limit,
      lastPage: Math.ceil(this.notes.length / limit),
      currentPage: page,
    });
  }

  /**
   * Получить заметки, у которых не задано напоминание
   * @param page - Номер страницы
   * @param limit - кличество элементов на странице
   * @returns Observable с заметками, у которых не задано напоминание
   * */
  private getNotesWithoutReminders(
    page: number,
    limit: number
  ): Observable<IDataPage<INote>> {
    const notes = this.notes.filter((note: INote) => !note.reminderDateTime);

    return of({
      data: notes.slice((page - 1) * limit, page * limit),
      total: notes.length,
      perPage: limit,
      lastPage: Math.ceil(notes.length / limit),
      currentPage: page,
    });
  }

  /**
   * Получить заметки, у которых задано напоминание
   * @param page - Номер страницы
   * @param limit - кличество элементов на странице
   * @returns Observable с заметками, у которых задано напоминание
   * */
  private getNotesWithReminders(
    page: number,
    limit: number
  ): Observable<IDataPage<INote>> {
    const notes = this.notes.filter((note: INote) => note.reminderDateTime);

    return of({
      data: notes.slice((page - 1) * limit, page * limit),
      total: notes.length,
      perPage: limit,
      lastPage: Math.ceil(notes.length / limit),
      currentPage: page,
    });
  }

  public getById(id: string): Observable<INote> {
    const note: INote | undefined = this.notes.find(
      (item: INote) => item.id === id
    );

    if (!note) {
      throw new Error(`item with id ${id} not found`);
    }

    return of(note);
  }

  public add(item: Omit<INote, 'id'>): Observable<INote> {
    const newItem = { ...item, reminderDateTime: null, id: uuidv4() } as INote;
    this.notes.push(newItem);
    return of(newItem);
  }

  /**
   * Добавить напоминание
   * @param noteId - Id заметки, для которой добавляем напоминание
   * @param reminderDateTime - строка с датой и временем в UTC в формате tilmestamp (гггг-ММ-дд чч:мм:сс)
   */
  public setReminders(
    noteIds: string[],
    reminderDateTime: string
  ): Observable<INote[]> {
    const notes: INote[] = this.notes.filter((note: INote) =>
      noteIds.includes(note.id)
    );
    notes.forEach((note: INote) => {
      note.reminderDateTime = reminderDateTime;
    });
    return of(notes);
  }

  /**
   * Удалить напоминание у заметки
   * @param noteId - Id заметки
   * */
  public deleteReminder(noteId: string): Observable<void> {
    const note = this.notes.find((note) => note.id === noteId);
    note!.reminderDateTime = null;
    return of(note as void);
  }

  public remove(itemIds: string[]): Observable<void> {
    this.notes = this.notes.filter((item: INote) => !itemIds.includes(item.id));
    return of(undefined);
  }

  /**
   * Получить заметки за месяц
   * @param date - строка даты в формате: гггг-ММ
   * */
  public getNotesForMonth(date: string): Observable<INote[]> {
    const dateUtc = DateTime.fromFormat(date, 'yyyy-MM', {
      zone: 'UTC',
    });

    const sameMonthNotes = this.notes.filter((note: INote) => {
      const reminderDateTime = note.reminderDateTime;
      if (!reminderDateTime) {
        return false;
      }

      const reminderDateTimeUtc = DateTime.fromFormat(
        reminderDateTime,
        'yyyy-MM-dd HH:mm:ss',
        {
          zone: 'UTC',
        }
      );

      return reminderDateTimeUtc.hasSame(dateUtc, 'month');
    });

    return of(sameMonthNotes);
  }

  public update(note: INote): Observable<INote> {
    const index: number = this.notes.findIndex(
      (item: INote) => item.id === note.id
    );
    if (index === -1) {
      throw new Error('note not found');
    }
    this.notes[index] = { ...this.notes[index], ...note };
    return of(note);
  }
}
