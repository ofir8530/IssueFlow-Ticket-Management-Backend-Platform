import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttachmentsService } from './attachments.service';
import { Attachment } from '../attachments/attachment.entity'; 

@Module({
  imports: [
    TypeOrmModule.forFeature([Attachment]),
  ],
  providers: [AttachmentsService],
  exports: [AttachmentsService], 
})
export class AttachmentsModule {}