import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {
  ReminderEditComponent,
  ReminderFormComponent,
  RemindersCalendarComponent,
  RemindersPanelComponent,
} from './components';

const routes: Routes = [
  {
    path: '',
    component: RemindersPanelComponent,
    children: [
      {
        path: '',
        component: RemindersCalendarComponent,
      },
      {
        path: 'add',
        component: ReminderFormComponent,
      },
      {
        path: 'edit/:noteId',
        component: ReminderEditComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RemindersRoutingModule {}
