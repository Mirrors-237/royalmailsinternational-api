import { MigrationInterface, QueryRunner } from "typeorm";

// Column defaults only (used when the settings row is first created); existing values are unchanged.
// down() restores the previous French defaults.

export class EnglishSettingsDefaults1760100000000 implements MigrationInterface {
    name = 'EnglishSettingsDefaults1760100000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "site_settings"
            ALTER COLUMN "siteName"
            SET DEFAULT 'Transport Atlantic Courier'
        `);
        await queryRunner.query(`
            ALTER TABLE "site_settings"
            ALTER COLUMN "tagline"
            SET DEFAULT 'International shipping you can track'
        `);
        await queryRunner.query(`
            ALTER TABLE "site_settings"
            ALTER COLUMN "description"
            SET DEFAULT 'International air, sea and road freight, with customs clearance and tracking at every step.'
        `);
        await queryRunner.query(`
            ALTER TABLE "site_settings"
            ALTER COLUMN "email"
            SET DEFAULT 'contact@example.com'
        `);
        await queryRunner.query(`
            ALTER TABLE "site_settings"
            ALTER COLUMN "openingHours"
            SET DEFAULT 'Mon–Fri, 8am–6pm'
        `);
        await queryRunner.query(`
            ALTER TABLE "site_settings"
            ALTER COLUMN "primaryColor"
            SET DEFAULT '#0b5bd3'
        `);
        await queryRunner.query(`
            ALTER TABLE "site_settings"
            ALTER COLUMN "accentColor"
            SET DEFAULT '#f59e0b'
        `);
        await queryRunner.query(`
            ALTER TABLE "site_settings"
            ALTER COLUMN "metaTitle"
            SET DEFAULT 'Transport Atlantic Courier | Air, Sea & Road Freight'
        `);
        await queryRunner.query(`
            ALTER TABLE "site_settings"
            ALTER COLUMN "metaDescription"
            SET DEFAULT 'International air, sea and road freight to 150+ countries. Live tracking at every step. Free quote within 24 hours.'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "site_settings"
            ALTER COLUMN "metaDescription"
            SET DEFAULT 'Expert en transport international. Fret aérien, maritime et terrestre vers 150+ pays. Suivi en temps réel. Devis gratuit en 24h.'
        `);
        await queryRunner.query(`
            ALTER TABLE "site_settings"
            ALTER COLUMN "metaTitle"
            SET DEFAULT 'Transport Atlantic Courrier | Fret Aérien, Maritime & Terrestre'
        `);
        await queryRunner.query(`
            ALTER TABLE "site_settings"
            ALTER COLUMN "accentColor"
            SET DEFAULT '#d97706'
        `);
        await queryRunner.query(`
            ALTER TABLE "site_settings"
            ALTER COLUMN "primaryColor"
            SET DEFAULT '#1e3a5f'
        `);
        await queryRunner.query(`
            ALTER TABLE "site_settings"
            ALTER COLUMN "openingHours"
            SET DEFAULT 'Lun–Ven : 8h–18h'
        `);
        await queryRunner.query(`
            ALTER TABLE "site_settings"
            ALTER COLUMN "email"
            SET DEFAULT 'contact@tac-logistics.com'
        `);
        await queryRunner.query(`
            ALTER TABLE "site_settings"
            ALTER COLUMN "description"
            SET DEFAULT 'Expert en transport international, fret aérien, maritime et terrestre. Votre partenaire logistique de confiance pour le commerce mondial.'
        `);
        await queryRunner.query(`
            ALTER TABLE "site_settings"
            ALTER COLUMN "tagline"
            SET DEFAULT 'Global Logistics Trust'
        `);
        await queryRunner.query(`
            ALTER TABLE "site_settings"
            ALTER COLUMN "siteName"
            SET DEFAULT 'Transport Atlantic Courrier'
        `);
    }

}
