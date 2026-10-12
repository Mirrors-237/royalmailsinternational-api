import { MigrationInterface, QueryRunner } from 'typeorm';

// Legal notice and privacy notice details, edited in the admin (empty = not shown on the website)
const TEXT_COLUMNS = ['legalForm', 'registrationNumber', 'vatNumber', 'publicationDirector', 'supervisoryAuthority'];
const LONG_TEXT_COLUMNS = ['hostingProvider', 'dataRetention', 'dataProcessors'];

export class LegalInformation1760400000000 implements MigrationInterface {
  name = 'LegalInformation1760400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const column of TEXT_COLUMNS) {
      await queryRunner.query(`ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "${column}" character varying NOT NULL DEFAULT ''`);
    }
    for (const column of LONG_TEXT_COLUMNS) {
      await queryRunner.query(`ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "${column}" text NOT NULL DEFAULT ''`);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const column of [...LONG_TEXT_COLUMNS, ...TEXT_COLUMNS]) {
      await queryRunner.query(`ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "${column}"`);
    }
  }
}
