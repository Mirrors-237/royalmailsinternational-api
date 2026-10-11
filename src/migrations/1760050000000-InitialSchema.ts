import { MigrationInterface, QueryRunner } from "typeorm";

// Initial schema, identical to the one synchronize created before migrations were introduced.
// On a database already created by synchronize the tables exist: the migration is then
// only recorded as applied, without changing anything.
export class InitialSchema1760050000000 implements MigrationInterface {
    name = 'InitialSchema1760050000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        if (await queryRunner.hasTable("site_settings")) return;

        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
        await queryRunner.query(`
            CREATE TABLE "users" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "email" character varying NOT NULL,
                "passwordHash" character varying NOT NULL,
                "role" character varying NOT NULL DEFAULT 'admin',
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"),
                CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."checkpoints_status_enum" AS ENUM(
                'PICKED_UP',
                'DEPARTED',
                'ARRIVED',
                'IN_CUSTOMS',
                'CUSTOMS_CLEARED',
                'OUT_FOR_DELIVERY',
                'DELIVERED',
                'EXCEPTION',
                'RETURNED'
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "checkpoints" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "shipmentId" uuid NOT NULL,
                "city" character varying NOT NULL,
                "country" character varying NOT NULL,
                "lat" numeric(10, 7) NOT NULL,
                "lng" numeric(10, 7) NOT NULL,
                "status" "public"."checkpoints_status_enum" NOT NULL,
                "statusLabel" character varying NOT NULL,
                "facility" character varying,
                "occurredAt" TIMESTAMP WITH TIME ZONE NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_dfcc46a91d96ecba8a8dcd8b11c" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."shipments_category_enum" AS ENUM(
                'DOCUMENT',
                'PARCEL',
                'FREIGHT',
                'FRAGILE',
                'PERISHABLE',
                'DANGEROUS'
            )
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."shipments_transportmode_enum" AS ENUM('AIR', 'SEA', 'ROAD', 'MULTI')
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."shipments_status_enum" AS ENUM(
                'PENDING',
                'PICKED_UP',
                'IN_TRANSIT',
                'IN_CUSTOMS',
                'OUT_FOR_DELIVERY',
                'DELIVERED',
                'EXCEPTION'
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "shipments" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "trackingNumber" character varying NOT NULL,
                "senderName" character varying NOT NULL,
                "senderEmail" character varying NOT NULL,
                "senderPhone" character varying NOT NULL,
                "senderAddress" character varying NOT NULL,
                "senderCity" character varying NOT NULL,
                "senderCountry" character varying NOT NULL,
                "receiverName" character varying NOT NULL,
                "receiverEmail" character varying NOT NULL,
                "receiverPhone" character varying NOT NULL,
                "receiverAddress" character varying NOT NULL,
                "receiverCity" character varying NOT NULL,
                "receiverCountry" character varying NOT NULL,
                "weightKg" numeric(10, 2) NOT NULL,
                "lengthCm" numeric(10, 2),
                "widthCm" numeric(10, 2),
                "heightCm" numeric(10, 2),
                "category" "public"."shipments_category_enum" NOT NULL DEFAULT 'PARCEL',
                "transportMode" "public"."shipments_transportmode_enum" NOT NULL DEFAULT 'AIR',
                "description" character varying,
                "status" "public"."shipments_status_enum" NOT NULL DEFAULT 'PENDING',
                "estimatedDelivery" date,
                "declaredValue" numeric(10, 2),
                "currency" character varying,
                "isInsured" boolean NOT NULL DEFAULT false,
                "notes" character varying,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_3300d7adbd17fdb51bdfd8c951e" UNIQUE ("trackingNumber"),
                CONSTRAINT "PK_6deda4532ac542a93eab214b564" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."leads_status_enum" AS ENUM(
                'NEW',
                'CONTACTED',
                'QUOTED',
                'CONVERTED',
                'LOST'
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "leads" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "fullName" character varying NOT NULL,
                "email" character varying NOT NULL,
                "phone" character varying NOT NULL,
                "company" character varying,
                "originCity" character varying NOT NULL,
                "originCountry" character varying NOT NULL,
                "destinationCity" character varying NOT NULL,
                "destinationCountry" character varying NOT NULL,
                "weightKg" numeric(10, 2) NOT NULL,
                "lengthCm" numeric(10, 2),
                "widthCm" numeric(10, 2),
                "heightCm" numeric(10, 2),
                "transportMode" character varying,
                "category" character varying,
                "message" character varying,
                "status" "public"."leads_status_enum" NOT NULL DEFAULT 'NEW',
                "adminNotes" character varying,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_cd102ed7a9a4ca7d4d8bfeba406" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "site_settings" (
                "id" SERIAL NOT NULL,
                "siteName" character varying NOT NULL DEFAULT 'Transport Atlantic Courrier',
                "trackingPrefix" character varying(8) NOT NULL DEFAULT 'TAC',
                "tagline" character varying NOT NULL DEFAULT 'Global Logistics Trust',
                "description" character varying NOT NULL DEFAULT 'Expert en transport international, fret aérien, maritime et terrestre. Votre partenaire logistique de confiance pour le commerce mondial.',
                "address" character varying NOT NULL DEFAULT '123 Rue du Commerce',
                "postalCode" character varying NOT NULL DEFAULT '75001',
                "city" character varying NOT NULL DEFAULT 'Paris',
                "country" character varying NOT NULL DEFAULT 'France',
                "email" character varying NOT NULL DEFAULT 'contact@tac-logistics.com',
                "phone" character varying NOT NULL DEFAULT '+33 1 00 00 00 00',
                "whatsapp" character varying NOT NULL DEFAULT '',
                "openingHours" character varying NOT NULL DEFAULT 'Lun–Ven : 8h–18h',
                "mapEmbedUrl" character varying NOT NULL DEFAULT '',
                "socialFacebook" character varying NOT NULL DEFAULT '',
                "socialLinkedin" character varying NOT NULL DEFAULT '',
                "socialTwitter" character varying NOT NULL DEFAULT '',
                "primaryColor" character varying NOT NULL DEFAULT '#1e3a5f',
                "accentColor" character varying NOT NULL DEFAULT '#d97706',
                "metaTitle" character varying NOT NULL DEFAULT 'Transport Atlantic Courrier | Fret Aérien, Maritime & Terrestre',
                "metaDescription" character varying NOT NULL DEFAULT 'Expert en transport international. Fret aérien, maritime et terrestre vers 150+ pays. Suivi en temps réel. Devis gratuit en 24h.',
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_e4290e8371a166d7e066d131f6e" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."contact_messages_status_enum" AS ENUM('UNREAD', 'READ', 'REPLIED')
        `);
        await queryRunner.query(`
            CREATE TABLE "contact_messages" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "fullName" character varying NOT NULL,
                "email" character varying NOT NULL,
                "phone" character varying,
                "subject" character varying NOT NULL,
                "message" text NOT NULL,
                "status" "public"."contact_messages_status_enum" NOT NULL DEFAULT 'UNREAD',
                "adminReply" character varying,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_b74f96eb2edd977ccfba6533293" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "testimonials" (
                "id" SERIAL NOT NULL,
                "name" character varying NOT NULL,
                "role" character varying NOT NULL DEFAULT '',
                "company" character varying NOT NULL DEFAULT '',
                "content" text NOT NULL,
                "rating" integer NOT NULL DEFAULT '5',
                "avatarInitials" character varying NOT NULL DEFAULT '',
                "isActive" boolean NOT NULL DEFAULT true,
                "displayOrder" integer NOT NULL DEFAULT '0',
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_63b03c608bd258f115a0a4a1060" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "partners" (
                "id" SERIAL NOT NULL,
                "name" character varying NOT NULL,
                "logoUrl" character varying NOT NULL DEFAULT '',
                "websiteUrl" character varying NOT NULL DEFAULT '',
                "isActive" boolean NOT NULL DEFAULT true,
                "displayOrder" integer NOT NULL DEFAULT '0',
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_998645b20820e4ab99aeae03b41" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "checkpoints"
            ADD CONSTRAINT "FK_d0990dc5240a4d2740ac589a15c" FOREIGN KEY ("shipmentId") REFERENCES "shipments"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "checkpoints" DROP CONSTRAINT "FK_d0990dc5240a4d2740ac589a15c"
        `);
        await queryRunner.query(`
            DROP TABLE "partners"
        `);
        await queryRunner.query(`
            DROP TABLE "testimonials"
        `);
        await queryRunner.query(`
            DROP TABLE "contact_messages"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."contact_messages_status_enum"
        `);
        await queryRunner.query(`
            DROP TABLE "site_settings"
        `);
        await queryRunner.query(`
            DROP TABLE "leads"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."leads_status_enum"
        `);
        await queryRunner.query(`
            DROP TABLE "shipments"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."shipments_status_enum"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."shipments_transportmode_enum"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."shipments_category_enum"
        `);
        await queryRunner.query(`
            DROP TABLE "checkpoints"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."checkpoints_status_enum"
        `);
        await queryRunner.query(`
            DROP TABLE "users"
        `);
    }

}
