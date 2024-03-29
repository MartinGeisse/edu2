import {Pool, PoolClient, QueryResult, QueryResultRow, types} from "pg";
import {backendSystemConfiguration} from "../../backendSystemConfiguration";

// --------------------------------------------------------------------------------------------------------------------
// type mapping
// --------------------------------------------------------------------------------------------------------------------

// map type 20 (bigint)
types.setTypeParser(20, (val) => {
  const result = parseInt(val, 10);
  if (result >= Number.MAX_SAFE_INTEGER) {
    throw new Error("BIGINT returned from PostgreSQL was too big for JS to handle");
  }
  return result;
});

// --------------------------------------------------------------------------------------------------------------------
// connection pool
// --------------------------------------------------------------------------------------------------------------------

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

// --------------------------------------------------------------------------------------------------------------------
// connection wrapper class
// --------------------------------------------------------------------------------------------------------------------

export interface PostgresConnection {
  needsInternalClient(): PoolClient;
  query<R extends QueryResultRow>(queryText: string, values?: unknown[]): Promise<QueryResult<R>>;
  release(): void;
}

class PostgresConnectionImpl implements PostgresConnection {
  constructor(private internalClient: PoolClient | null) {}

  needsInternalClient(): PoolClient {
    if (this.internalClient === null) {
      throw new Error("Postgres client has already been released");
    }
    return this.internalClient;
  }

  async query<R extends QueryResultRow>(queryText: string, values?: unknown[]): Promise<QueryResult<R>> {
    return this.needsInternalClient().query(queryText, values);
  }

  release(): void {
    this.needsInternalClient().release();
    this.internalClient = null;
  }

  checkReleased(): void {
    if (this.internalClient !== null) {
      this.internalClient.release();
      this.internalClient = null;
      console.error("Postgres client has not been released after TTL");
    }
  }
}

export async function getNewGlobalPostgresConnection(
    autoCloseTtlSeconds: number | null = 600,
): Promise<PostgresConnection> {
  const internalClient: PoolClient = await (await getPostgresPool()).connect();
  const connection = new PostgresConnectionImpl(internalClient);
  if (autoCloseTtlSeconds !== null) {
    setTimeout(() => connection.checkReleased(), autoCloseTtlSeconds * 1000);
  }
  return connection;
}

export async function withNewGlobalPostgresConnection<R = void>(
    body: (connection: PostgresConnection) => Promise<R>,
    autoCloseTtlSeconds: number | null = 600,
): Promise<R> {
    const connection = await getNewGlobalPostgresConnection(autoCloseTtlSeconds);
    try {
        return await body(connection);
    } finally {
        connection.release();
    }
}

export async function withTransaction<R = void>(
    connection: PostgresConnection,
    body: (connection: PostgresConnection) => Promise<R>,
): Promise<R> {
    await connection.query("BEGIN");
    try {
        const result = await body(connection);
        await connection.query("COMMIT");
        return result;
    } catch (e) {
        await connection.query("ROLLBACK");
        throw e;
    }
}

export async function withNewGlobalPostgresConnectionAndSingleTransaction<R = void>(
    body: (connection: PostgresConnection) => Promise<R>,
    autoCloseTtlSeconds: number | null = 600,
): Promise<R> {
    return await withNewGlobalPostgresConnection(async (connection) => {
        return await withTransaction(connection, body);
    }, autoCloseTtlSeconds);
}
