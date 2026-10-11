import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  HeadBucketCommand,
  CreateBucketCommand,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { Readable } from 'node:stream';

// S3-compatible object storage (RustFS)
@Injectable()
export class StorageService implements OnModuleInit {
  private readonly log = new Logger(StorageService.name);
  private readonly client: S3Client;
  private readonly bucket: string;

  constructor(private config: ConfigService) {
    this.bucket = this.config.get('S3_BUCKET', 'tac-assets');
    this.client = new S3Client({
      endpoint:       this.config.get('S3_ENDPOINT', 'http://localhost:9000'),
      region:         this.config.get('S3_REGION', 'us-east-1'),
      forcePathStyle: true, // RustFS: path-style URLs, not subdomains
      credentials: {
        accessKeyId:     this.config.get('S3_ACCESS_KEY', ''),
        secretAccessKey: this.config.get('S3_SECRET_KEY', ''),
      },
      // The SDK adds CRC32 checksums by default, which some S3-compatible stores reject
      requestChecksumCalculation:  'WHEN_REQUIRED',
      responseChecksumValidation: 'WHEN_REQUIRED',
    });
  }

  // Create the bucket if it does not exist
  async onModuleInit() {
    try {
      await this.client.send(new HeadBucketCommand({ Bucket: this.bucket }));
    } catch {
      try {
        await this.client.send(new CreateBucketCommand({ Bucket: this.bucket }));
        this.log.log(`Bucket "${this.bucket}" created`);
      } catch (err) {
        this.log.warn(`Could not check or create the bucket: ${err.message}`);
      }
    }
  }

  async put(key: string, body: Buffer, contentType: string) {
    await this.client.send(new PutObjectCommand({
      Bucket:      this.bucket,
      Key:         key,
      Body:        body,
      ContentType: contentType,
    }));
  }

  // Returns null when the object does not exist
  async get(key: string): Promise<{ body: Readable; contentType: string; length?: number } | null> {
    try {
      const res = await this.client.send(new GetObjectCommand({ Bucket: this.bucket, Key: key }));
      return {
        body:        res.Body as Readable,
        contentType: res.ContentType ?? 'application/octet-stream',
        length:      res.ContentLength,
      };
    } catch (err) {
      if (err.name === 'NoSuchKey' || err.$metadata?.httpStatusCode === 404) return null;
      throw err;
    }
  }

  async delete(key: string) {
    try {
      await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
    } catch (err) {
      this.log.warn(`Suppression de "${key}" impossible : ${err.message}`);
    }
  }
}
