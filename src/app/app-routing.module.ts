import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/notes',
    pathMatch: 'full',
  },
  {
    path: 'notes',
    loadChildren: () =>
      import('./modules/notes/notes.module').then((m) => m.NotesModule),
  },
  {
    path: 'reminders',
    loadChildren: () =>
      import('./modules/reminders/reminders.module').then(
        (m) => m.RemindersModule
      ),
  },
  {
    path: 'tags',
    loadChildren: () =>
      import('./modules/tags/tags.module').then((m) => m.TagsModule),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
