import { Component } from '@angular/core';
import { ITab } from './interfaces';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  public constructor(
    /** Сервис маршрутизации */
    private readonly router: Router
  ) {}

  /** Вкладки в приложении */
  public tabs: ITab[] = [
    {
      title: 'Заметки',
      route: 'notes',
    },
    {
      title: 'Напоминания',
      route: 'reminders',
    },
    {
      title: 'Тэги',
      route: 'tags',
    },
  ];

  /**
   * Открыть вкладку
   * @param tab - вкладка, на которую осуществляется переход
   * */
  public openTab(tab: ITab): void {
    this.router.navigate([`/${tab.route}`]);
  }
}
