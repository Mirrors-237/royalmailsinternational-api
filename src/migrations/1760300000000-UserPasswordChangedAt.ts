import { MigrationInterface, QueryRunner } from 'typeorm';

// Date of the last password change: sessions opened before it are refused
export class UserPasswordChangedAt1760300000000 implements MigrationInterface {
  name = 'UserPasswordChangedAt1760300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "passwordChangedAt" TIMESTAMP WITH TIME ZONE`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "passwordChangedAt"`);
  }
}
