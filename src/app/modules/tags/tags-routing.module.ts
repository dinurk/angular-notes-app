import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {
  TagFormComponent,
  TagsPanelComponent,
  TagViewComponent,
} from './components';

const routes: Routes = [
  {
    path: '',
    component: TagsPanelComponent,
    children: [
      {
        path: 'add',
        component: TagFormComponent,
      },
      {
        path: 'view/:tagId',
        component: TagViewComponent,
      },
      {
        path: 'edit/:tagId',
        component: TagFormComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TagsRoutingModule {}
