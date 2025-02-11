import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReminderEditComponent,
  ReminderFormComponent,
  RemindersListComponent,
  RemindersPanelComponent,
} from './components';
import { RemindersRoutingModule } from './reminders-routing.module';
import { NzCalendarModule } from 'ng-zorro-antd/calendar';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { RemindersCalendarComponent } from './components/reminders-calendar/reminders-calendar.component';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { SharedModule } from '../shared/shared.module';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NOTES_WITH_REMINDERS, NOTES_WITHOUT_REMINDERS } from './tokens';
import { NotesRepository } from '../notes/repositories';

@NgModule({
  providers: [
    {
      provide: NOTES_WITHOUT_REMINDERS,
      useClass: NotesRepository,
    },
  ],
  declarations: [
    RemindersListComponent,
    ReminderFormComponent,
    RemindersPanelComponent,
    RemindersCalendarComponent,
    ReminderEditComponent,
  ],
  imports: [
    CommonModule,
    RemindersRoutingModule,
    NzCalendarModule,
    NzGridModule,
    NzDatePickerModule,
    ReactiveFormsModule,
    NzFormModule,
    NzSpaceModule,
    NzButtonModule,
    NzIconModule,
    NzStepsModule,
    NzCardModule,
    NzCheckboxModule,
    NzPaginationModule,
    NzAlertModule,
    NzFormModule,
    NzBadgeModule,
    FormsModule,
    SharedModule,
    NzModalModule,
  ],
})
export class RemindersModule {}
