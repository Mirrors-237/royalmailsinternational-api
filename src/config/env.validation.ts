// Checked once at startup (ConfigModule). In production the API refuses to start with missing
// secrets or with the example values from .env.example, which are public.
const EXAMPLE_VALUES: Record<string, string[]> = {
  JWT_SECRET:    ['change_me_in_production_very_long_secret_key'],
  DB_PASSWORD:   ['tic_password'],
  S3_SECRET_KEY: ['change_me', 'rustfsadmin'],
};

const REQUIRED_IN_PRODUCTION = ['DB_HOST', 'DB_USERNAME', 'DB_PASSWORD', 'DB_NAME', 'S3_ENDPOINT', 'S3_ACCESS_KEY', 'S3_SECRET_KEY', 'S3_BUCKET'];

export const isProduction = (env: Record<string, unknown>) => env.NODE_ENV === 'production';

export function validateEnv(env: Record<string, unknown>) {
  const errors: string[] = [];
  const value = (key: string) => (typeof env[key] === 'string' ? (env[key] as string).trim() : '');

  // Without it no session can be signed or checked
  if (!value('JWT_SECRET')) errors.push('JWT_SECRET is required.');

  if (isProduction(env)) {
    for (const key of REQUIRED_IN_PRODUCTION) {
      if (!value(key)) errors.push(`${key} is required in production.`);
    }
    if (value('JWT_SECRET') && value('JWT_SECRET').length < 32) {
      errors.push('JWT_SECRET must be at least 32 characters long in production (e.g. openssl rand -hex 32).');
    }
    for (const [key, examples] of Object.entries(EXAMPLE_VALUES)) {
      if (examples.includes(value(key))) errors.push(`${key} still has the example value from .env.example.`);
    }
  }

  if (errors.length) {
    throw new Error(`Invalid configuration:\n  - ${errors.join('\n  - ')}`);
  }
  return env;
}
