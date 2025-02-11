import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  NoteFormComponent,
  NotesListComponent,
  NotesPanelComponent,
} from './components';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { ReactiveFormsModule } from '@angular/forms';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzNotificationModule } from 'ng-zorro-antd/notification';
import { NotesRoutingModule } from './notes-routing.module';
import { EmptyComponent } from './components/empty/empty.component';
import { NoteViewComponent } from './components/note-view/note-view.component';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { SharedModule } from '../shared/shared.module';

/** Модуль заметок */
@NgModule({
  declarations: [
    NotesListComponent,
    NoteFormComponent,
    EmptyComponent,
    NoteViewComponent,
    NotesPanelComponent,
  ],
  imports: [
    CommonModule,
    NzTableModule,
    NzCardModule,
    NzGridModule,
    NzPaginationModule,
    NzCheckboxModule,
    NzSpaceModule,
    NzIconModule,
    NzButtonModule,
    NzModalModule,
    NzFormModule,
    ReactiveFormsModule,
    NzInputModule,
    NzDrawerModule,
    NzSelectModule,
    NotesRoutingModule,
    NzNotificationModule,
    NzPopoverModule,
    NzAlertModule,
    NzToolTipModule,
    NzTagModule,
    SharedModule,
  ],
  exports: [NotesListComponent, NoteFormComponent],
})
export class NotesModule {}
