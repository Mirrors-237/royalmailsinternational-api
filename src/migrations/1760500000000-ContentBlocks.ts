import { MigrationInterface, QueryRunner } from 'typeorm';

// Image and text blocks edited in the admin
export class ContentBlocks1760500000000 implements MigrationInterface {
  name = 'ContentBlocks1760500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "contentBlocks" jsonb NOT NULL DEFAULT '{}'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "contentBlocks"`);
  }
}
