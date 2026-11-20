import { MigrationInterface, QueryRunner } from 'typeorm';

// "Custom" tracking event: the admin chooses the name of the step shown to the customer
export class CheckpointCustom1760700000000 implements MigrationInterface {
  name = 'CheckpointCustom1760700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TYPE "public"."checkpoints_status_enum" ADD VALUE IF NOT EXISTS 'CUSTOM'`);
    await queryRunner.query(`ALTER TABLE "checkpoints" ADD "customName" character varying(40)`);
  }

  // PostgreSQL cannot drop a value from an enum: the type is rebuilt without it,
  // and custom events become "In transit" events (their customer text is kept).
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`UPDATE "checkpoints" SET "status" = 'IN_TRANSIT' WHERE "status" = 'CUSTOM'`);
    await queryRunner.query(`ALTER TABLE "checkpoints" DROP COLUMN "customName"`);
    await queryRunner.query(`ALTER TYPE "public"."checkpoints_status_enum" RENAME TO "checkpoints_status_enum_old"`);
    await queryRunner.query(`
      CREATE TYPE "public"."checkpoints_status_enum" AS ENUM(
        'PICKED_UP', 'DEPARTED', 'IN_TRANSIT', 'ARRIVED', 'IN_CUSTOMS', 'CUSTOMS_CLEARED',
        'OUT_FOR_DELIVERY', 'DELIVERED', 'EXCEPTION', 'RETURNED'
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "checkpoints" ALTER COLUMN "status"
      TYPE "public"."checkpoints_status_enum" USING "status"::text::"public"."checkpoints_status_enum"
    `);
    await queryRunner.query(`DROP TYPE "public"."checkpoints_status_enum_old"`);
  }
}
