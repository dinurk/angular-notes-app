import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TruncatePipe, UtcToLocalPipe } from './pipes';

@NgModule({
  declarations: [UtcToLocalPipe, TruncatePipe],
  imports: [CommonModule],
  exports: [UtcToLocalPipe, TruncatePipe],
})
export class SharedModule {}
