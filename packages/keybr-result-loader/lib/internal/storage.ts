import { recoverResults, Result } from "@keybr/result";
import { DatabaseError } from "../errors.ts";
import { PersistentResultStorage } from "./local.ts";
import {
  type LocalResultStorage,
  type ProgressListener,
  type ResultStorage,
} from "./types.ts";

export type OpenRequest = {
  // Load our own local data.
  readonly type: "private";
};

export function openResultStorage(request: OpenRequest): ResultStorage {
  return wrapResultStorage(openRawResultStorage(request));
}

export function wrapResultStorage(storage: ResultStorage): ResultStorage {
  return translateErrors(validateResults(storage));
}

function openRawResultStorage(request: OpenRequest) {
  switch (request.type) {
    case "private": {
      const local = new PersistentResultStorage();
      return new ResultStorageOfLocalUser(local);
    }
  }
}

function translateErrors(storage: ResultStorage): ResultStorage {
  return new (class ErrorTranslator implements ResultStorage {
    async load(pl?: ProgressListener): Promise<Result[]> {
      try {
        return await storage.load(pl);
      } catch (err: any) {
        throw new DatabaseError("Cannot read records from database", {
          cause: err,
        });
      }
    }

    async append(
      results: readonly Result[],
      pl?: ProgressListener,
    ): Promise<void> {
      try {
        await storage.append(results, pl);
      } catch (err: any) {
        throw new DatabaseError("Cannot add records to database", {
          cause: err,
        });
      }
    }

    async clear(): Promise<void> {
      try {
        await storage.clear();
      } catch (err: any) {
        throw new DatabaseError("Cannot clear database", {
          cause: err,
        });
      }
    }
  })();
}

function validateResults(storage: ResultStorage): ResultStorage {
  return new (class ErrorTranslator implements ResultStorage {
    async load(pl?: ProgressListener): Promise<Result[]> {
      return recoverResults(await storage.load(pl));
    }

    async append(
      results: readonly Result[],
      pl?: ProgressListener,
    ): Promise<void> {
      results = results.filter(Result.isValid);
      if (results.length > 0) {
        await storage.append(results, pl);
      }
    }

    async clear(): Promise<void> {
      await storage.clear();
    }
  })();
}

export class ResultStorageOfLocalUser implements ResultStorage {
  readonly #local: LocalResultStorage;

  constructor(local: LocalResultStorage) {
    this.#local = local;
  }

  async load(pl = dummy): Promise<Result[]> {
    return await this.#local.load();
  }

  async append(results: readonly Result[], pl = dummy): Promise<void> {
    await this.#local.append(results);
  }

  async clear(): Promise<void> {
    await this.#local.clear();
  }
}

function dummy(total: number, current: number): void {}
