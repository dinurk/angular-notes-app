import { Pipe, PipeTransform } from '@angular/core';
import { DateTime } from 'luxon';

/** Пайп, укорачивающий строку до определенной длины */
@Pipe({
  name: 'truncate',
})
export class TruncatePipe implements PipeTransform {
  /**
   * @param value - строка для усечения
   * @param length - длина
   * @returns усеченная строка
   */
  public transform(
    value: string | undefined,
    length: number = 100
  ): string | undefined {
    if (!value) {
      return undefined;
    }

    return value.substring(0, length) + (value.length > length ? '...' : '');
  }
}
