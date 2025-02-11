import { IBaseEntity } from 'src/app/interfaces';

/** Модель сущности "Тэг" */
export interface ITag extends IBaseEntity {
  /** наименоавние Тэга */
  name: string;
}
