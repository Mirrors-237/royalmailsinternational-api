import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('testimonials')
export class Testimonial {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ default: '' })
  role: string;

  @Column({ default: '' })
  company: string;

  @Column('text')
  content: string;

  @Column({ type: 'int', default: 5 })
  rating: number;

  @Column({ default: '' })
  avatarInitials: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'int', default: 0 })
  displayOrder: number;

  @CreateDateColumn()
  createdAt: Date;
}
