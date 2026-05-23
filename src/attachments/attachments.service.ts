import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attachment } from './attachment.entity';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class AttachmentsService {
  constructor(
    @InjectRepository(Attachment) private repo: Repository<Attachment>,
  ) {}

  async addAttachment(ticketId: string, file: Express.Multer.File) {
    const attachment = this.repo.create({
      filename: file.originalname,
      path: file.path,
      mimetype: file.mimetype, 
      size: file.size,         
      ticket: { id: ticketId } as any,
    });
    return this.repo.save(attachment);
  }

  async getAttachments(ticketId: string) {
    return this.repo.find({ where: { ticket: { id: ticketId } } });
  }

  async deleteAttachment(attachmentId: string) {
    const attachment = await this.repo.findOneBy({ id: attachmentId });
    if (!attachment) throw new NotFoundException('Attachment not found');

    try {
      await fs.unlink(attachment.path);
    } catch (error) {
      console.error('File not found on disk, deleting record anyway', error);
    }

    return await this.repo.remove(attachment);
  }
}