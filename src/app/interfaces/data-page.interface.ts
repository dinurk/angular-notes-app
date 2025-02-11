/** Страница с данными типа T */
// export interface IDataPage<T> {
//   /** Записи запрошенной страницы */
//   data: T[];
//   /** Общее количество записей */
//   total: number;
// }

export interface IDataPage<T> {
  /** Записи запрошенной страницы */
  data: T[];
  /** Общее количество записей */
  total: number;
  /** Количество элементов на странице */
  perPage: number;
  /** Номер последней страницы */
  lastPage: number;
  /** Номер текущей страницы */
  currentPage: number;
}