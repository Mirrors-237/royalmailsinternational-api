import { MigrationInterface, QueryRunner } from 'typeorm';

// "In transit" tracking event, chosen in the admin like the other events
export class CheckpointInTransit1760600000000 implements MigrationInterface {
  name = 'CheckpointInTransit1760600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TYPE "public"."checkpoints_status_enum" ADD VALUE IF NOT EXISTS 'IN_TRANSIT' AFTER 'DEPARTED'`);
  }

  // PostgreSQL cannot drop a value from an enum: the type is rebuilt without it,
  // and "In transit" events become "Departed" events.
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`UPDATE "checkpoints" SET "status" = 'DEPARTED' WHERE "status" = 'IN_TRANSIT'`);
    await queryRunner.query(`ALTER TYPE "public"."checkpoints_status_enum" RENAME TO "checkpoints_status_enum_old"`);
    await queryRunner.query(`
      CREATE TYPE "public"."checkpoints_status_enum" AS ENUM(
        'PICKED_UP', 'DEPARTED', 'ARRIVED', 'IN_CUSTOMS', 'CUSTOMS_CLEARED',
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
