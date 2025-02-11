import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {
  EmptyComponent,
  NoteFormComponent,
  NotesPanelComponent,
  NoteViewComponent,
} from './components';

const routes: Routes = [
  {
    path: '',
    component: NotesPanelComponent,
    children: [
      {
        path: '',
        component: EmptyComponent,
      },
      {
        path: 'add',
        component: NoteFormComponent,
      },
      {
        path: 'edit/:noteId',
        component: NoteFormComponent,
      },
      {
        path: 'view/:noteId',
        component: NoteViewComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NotesRoutingModule {}
