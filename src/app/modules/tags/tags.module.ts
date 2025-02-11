import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  TagFormComponent,
  TagsListComponent,
  TagsPanelComponent,
  TagViewComponent,
} from './components';
import { TagsRoutingModule } from './tags-routing.module';
import { FormsModule } from '@angular/forms';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzNotificationModule } from 'ng-zorro-antd/notification';

@NgModule({
  declarations: [
    TagsListComponent,
    TagFormComponent,
    TagsPanelComponent,
    TagViewComponent,
  ],
  imports: [
    CommonModule,
    TagsRoutingModule,
    FormsModule,
    NzInputModule,
    NzFormModule,
    NzButtonModule,
    NzGridModule,
    NzTableModule,
    NzModalModule,
    NzIconModule,
    NzSpaceModule,
    NzPaginationModule,
    NzNotificationModule,
  ],
})
export class TagsModule {}
