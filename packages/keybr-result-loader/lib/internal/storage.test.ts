import { test } from "node:test";
import { type Result, ResultFaker } from "@keybr/result";
import { deepEqual, equal, rejects } from "rich-assert";
import {
  ResultStorageOfLocalUser,
  wrapResultStorage,
} from "./storage.ts";
import { type LocalResultStorage } from "./types.ts";

const faker = new ResultFaker();

test("local user - initially is empty", async () => {
  const local: Result[] = [];

  const storage = wrapResultStorage(
    new ResultStorageOfLocalUser(new FakeLocalResultStorage(local)),
  );

  const results = await storage.load();

  equal(results.length, 0);
});

test("local user - append to local", async () => {
  const r0 = faker.nextResult();
  const r1 = faker.nextResult();
  const r2 = faker.nextResult({ length: 0, time: 0 });
  const local: Result[] = [];

  const storage = wrapResultStorage(
    new ResultStorageOfLocalUser(new FakeLocalResultStorage(local)),
  );

  await storage.append([r0]);
  await storage.append([r1]);
  await storage.append([r2]);
  const results = await storage.load();

  // Should contain data from updated local store.
  deepEqual(results, [r0, r1]);

  // Local store should be updated.
  deepEqual(local, [r0, r1]);
});

test("handle local storage errors", async () => {
  const storage = wrapResultStorage(
    new ResultStorageOfLocalUser(
      new (class FailingLocalResultStorage implements LocalResultStorage {
        async load(): Promise<Result[]> {
          throw new Error("Test read error");
        }

        async append(): Promise<void> {
          throw new Error("Test add error");
        }

        async clear(): Promise<void> {
          throw new Error("Test clear error");
        }
      })(),
    ),
  );

  // Try to open.
  await rejects(storage.load(), /Cannot read records from database/);

  // Try to append.
  await rejects(
    storage.append([faker.nextResult()]),
    /Cannot add records to database/,
  );

  // Try to clear.
  await rejects(storage.clear(), /Cannot clear database/);
});

class FakeLocalResultStorage implements LocalResultStorage {
  readonly #results: Result[];

  constructor(results: Result[]) {
    this.#results = results;
  }

  async load(): Promise<Result[]> {
    return [...this.#results];
  }

  async append(results: readonly Result[]): Promise<void> {
    this.#results.push(...results);
  }

  async clear(): Promise<void> {
    this.#results.length = 0;
  }
}
