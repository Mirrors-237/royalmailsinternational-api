import { MigrationInterface, QueryRunner } from "typeorm";

// S3 keys of the logo, the dark-background logo and the favicon (null = no image)
export class AddBrandingKeys1760050100000 implements MigrationInterface {
    name = 'AddBrandingKeys1760050100000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "site_settings"
                ADD COLUMN IF NOT EXISTS "logoKey" character varying,
                ADD COLUMN IF NOT EXISTS "logoOnDarkKey" character varying,
                ADD COLUMN IF NOT EXISTS "faviconKey" character varying
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "site_settings"
                DROP COLUMN "faviconKey",
                DROP COLUMN "logoOnDarkKey",
                DROP COLUMN "logoKey"
        `);
    }
}
