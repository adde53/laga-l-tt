/**
 * Minimal PostgREST-emulator för integrationstester av edge-funktionerna.
 *
 * Tabellernas kolumner läses ur den riktiga migrationsfilen, så att ett
 * felstavat kolumnnamn i en edge-funktion faktiskt gör att testet fallerar
 * istället för att tyst passera.
 */

export interface TableSchema {
  columns: Set<string>;
  primaryKey: string[];
}

/** Läser CREATE TABLE-satserna ur migrationen och plockar ut kolumner + PK. */
export function parseSchema(sql: string): Record<string, TableSchema> {
  const tables: Record<string, TableSchema> = {};

  const tableRe = /CREATE TABLE IF NOT EXISTS public\.(\w+)\s*\(([\s\S]*?)\n\);/g;
  let match: RegExpExecArray | null;

  while ((match = tableRe.exec(sql)) !== null) {
    const [, name, body] = match;
    const columns = new Set<string>();
    let primaryKey: string[] = [];

    for (const rawLine of body.split("\n")) {
      const line = rawLine.replace(/--.*$/, "").trim();
      if (!line) continue;

      const pk = line.match(/^PRIMARY KEY\s*\(([^)]+)\)/i);
      if (pk) {
        primaryKey = pk[1].split(",").map((c) => c.trim());
        continue;
      }

      const col = line.match(/^(\w+)\s+(text|integer|boolean|jsonb|date|timestamptz)/i);
      if (col) {
        columns.add(col[1]);
        if (/PRIMARY KEY/i.test(line)) primaryKey = [col[1]];
      }
    }

    tables[name] = { columns, primaryKey };
  }

  return tables;
}

type Row = Record<string, unknown>;

export interface MockDb {
  tables: Record<string, Row[]>;
  /** Antal anrop per tabell och metod – används för att verifiera beteende. */
  calls: Array<{ method: string; table: string; query: string }>;
}

function matchesFilter(row: Row, key: string, expr: string): boolean {
  const [op, ...rest] = expr.split(".");
  const value = rest.join(".");
  const cell = row[key];

  switch (op) {
    case "eq":
      return String(cell ?? "") === value;
    case "neq":
      return String(cell ?? "") !== value;
    case "gte":
      return cell != null && String(cell) >= value;
    case "lte":
      return cell != null && String(cell) <= value;
    case "is":
      return value === "null" ? cell == null : cell === (value === "true");
    default:
      throw new Error(`Mock: operatorn '${op}' stöds inte`);
  }
}

/**
 * Startar en PostgREST-liknande server. Returnerar url + databas + stop().
 */
export function startMockPostgrest(
  schema: Record<string, TableSchema>,
  seed: Record<string, Row[]> = {},
) {
  const db: MockDb = { tables: {}, calls: [] };
  for (const table of Object.keys(schema)) db.tables[table] = [...(seed[table] ?? [])];

  const assertColumns = (table: string, row: Row) => {
    const known = schema[table]?.columns;
    if (!known) throw new Error(`Mock: okänd tabell '${table}'`);
    for (const key of Object.keys(row)) {
      if (!known.has(key)) {
        throw new Error(
          `Mock: kolumnen '${key}' finns inte i public.${table} ` +
            `(giltiga: ${[...known].join(", ")})`,
        );
      }
    }
  };

  const controller = new AbortController();

  const server = Deno.serve(
    { port: 54999, signal: controller.signal, onListen: () => {} },
    async (req) => {
      const url = new URL(req.url);
      const table = url.pathname.replace(/^\/rest\/v1\//, "").replace(/\/$/, "");
      const jsonHeaders = { "Content-Type": "application/json" };

      if (!schema[table]) {
        return new Response(JSON.stringify({ message: `okänd tabell ${table}` }), {
          status: 404,
          headers: jsonHeaders,
        });
      }

      db.calls.push({ method: req.method, table, query: url.search });

      const filters = [...url.searchParams.entries()].filter(
        ([k]) => !["select", "order", "limit", "offset", "on_conflict"].includes(k),
      );

      const applyFilters = (rows: Row[]) =>
        rows.filter((row) => filters.every(([k, v]) => matchesFilter(row, k, v)));

      try {
        if (req.method === "GET") {
          let rows = applyFilters(db.tables[table]);
          const limit = url.searchParams.get("limit");
          if (limit) rows = rows.slice(0, Number(limit));
          return new Response(JSON.stringify(rows), { headers: jsonHeaders });
        }

        if (req.method === "POST") {
          const body = await req.json();
          const incoming: Row[] = Array.isArray(body) ? body : [body];
          const pk = schema[table].primaryKey;

          for (const row of incoming) {
            assertColumns(table, row);
            const existing = db.tables[table].findIndex((r) =>
              pk.every((k) => String(r[k] ?? "") === String(row[k] ?? ""))
            );
            if (existing >= 0) db.tables[table][existing] = { ...db.tables[table][existing], ...row };
            else db.tables[table].push({ ...row });
          }

          return new Response(JSON.stringify(incoming), { status: 201, headers: jsonHeaders });
        }

        if (req.method === "PATCH") {
          const patch = await req.json();
          assertColumns(table, patch);
          for (const row of applyFilters(db.tables[table])) Object.assign(row, patch);
          return new Response(JSON.stringify([]), { headers: jsonHeaders });
        }

        if (req.method === "DELETE") {
          const doomed = new Set(applyFilters(db.tables[table]));
          db.tables[table] = db.tables[table].filter((r) => !doomed.has(r));
          return new Response(JSON.stringify([]), { headers: jsonHeaders });
        }

        return new Response("method not allowed", { status: 405 });
      } catch (e) {
        return new Response(
          JSON.stringify({ message: e instanceof Error ? e.message : String(e) }),
          { status: 400, headers: jsonHeaders },
        );
      }
    },
  );

  return {
    url: "http://localhost:54999",
    db,
    stop: async () => {
      controller.abort();
      await server.finished.catch(() => {});
    },
  };
}

