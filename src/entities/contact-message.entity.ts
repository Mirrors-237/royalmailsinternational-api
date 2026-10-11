import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum MessageStatus {
  UNREAD = 'UNREAD',
  READ   = 'READ',
  REPLIED = 'REPLIED',
}

@Entity('contact_messages')
export class ContactMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column() fullName: string;
  @Column() email: string;
  @Column({ nullable: true }) phone: string;
  @Column() subject: string;
  @Column('text') message: string;

  @Column({ type: 'enum', enum: MessageStatus, default: MessageStatus.UNREAD })
  status: MessageStatus;

  @Column({ nullable: true })
  adminReply: string;

  @CreateDateColumn()
  createdAt: Date;
}
