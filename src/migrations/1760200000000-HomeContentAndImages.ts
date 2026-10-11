import { MigrationInterface, QueryRunner } from 'typeorm';

// Editable home page content and website photos
export class HomeContentAndImages1760200000000 implements MigrationInterface {
  name = 'HomeContentAndImages1760200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "homeContent" jsonb`);
    await queryRunner.query(`ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "imageKeys" jsonb NOT NULL DEFAULT '{}'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "imageKeys"`);
    await queryRunner.query(`ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "homeContent"`);
  }
}
