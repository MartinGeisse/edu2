import {Pool, types} from "pg";
import {backendSystemConfiguration} from "../../backendSystemConfiguration";

types.setTypeParser(20, (val) => {
  const result = parseInt(val, 10);
  if (result >= Number.MAX_SAFE_INTEGER) {
    throw new Error("BIGINT returned from PostgreSQL was too big for JS to handle");
  }
  return result;
});

let poolPromise: Promise<Pool> | null = null;

/**
 * This is a function returning a promise in case constructing the pool must be async and/or lazy.
 */
export function getPostgresPool(): Promise<Pool> {
  if (poolPromise === null) {
    poolPromise = (async (): Promise<Pool> => {
      return new Pool({
        host: backendSystemConfiguration.postgresHost,
        user: backendSystemConfiguration.postgresUser,
        password: backendSystemConfiguration.postgresPassword,
        database: backendSystemConfiguration.postgresDatabase,
      });
    })();
  }
  return poolPromise;
}