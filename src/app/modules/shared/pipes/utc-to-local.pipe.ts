import { Pipe, PipeTransform } from '@angular/core';
import { DateTime } from 'luxon';

/** Пайп, преобразующий строку со временем UTC в строку с локальным временем  */
@Pipe({
  name: 'utcToLocal',
})
export class UtcToLocalPipe implements PipeTransform {
  /**
   * @param value - строка с датой для преобразования
   * @param inputFormat - входной формат даты
   * @param outputFormat - выходной формат даты
   * @returns преобразованную в локальное время строку с датой
   */
  public transform(
    value: string | null,
    inputFormat: string = 'yyyy-MM-dd HH:mm:ss',
    outputFormat: string = 'dd.MM.yyyy HH:mm'
  ): string | null {
    if (!value) {
      return null;
    }

    return DateTime.fromFormat(value, inputFormat, {
      zone: 'UTC',
    })
      .setZone('local')
      .toFormat(outputFormat);
  }
}
