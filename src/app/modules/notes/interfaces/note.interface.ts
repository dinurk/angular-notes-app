import { IBaseEntity } from 'src/app/interfaces';
import { ITag } from '../../tags/interfaces/tag.interface';

/** Модель данных сущности "Заметка" */
export interface INote extends IBaseEntity {
  /** Заголовок заметки */
  title: string;
  /** Заметка */
  text: string;
  /** Дата и время напоминания */
  reminderDateTime: string | null;
  /** Тэги, привязанные к данной заметке */
  tags?: ITag[];
}
