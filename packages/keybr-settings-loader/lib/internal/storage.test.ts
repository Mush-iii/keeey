import { test } from "node:test";
import { Settings, stringProp } from "@keybr/settings";
import { deepEqual, isFalse, isNotNull, isTrue } from "rich-assert";
import { openSettingsStorage, STORAGE_KEY } from "./storage.ts";

test.beforeEach(() => {
  localStorage.clear();
});

test.afterEach(() => {
  localStorage.clear();
});

test("store and load settings", async () => {
  // Arrange.

  const settings = new Settings().set(stringProp("prop", "abc"), "xyz");

  // Store settings.

  deepEqual(await openSettingsStorage(null, null).store(settings), settings);
  isNotNull(localStorage.getItem(STORAGE_KEY));

  // Load settings.

  deepEqual(await openSettingsStorage(null, null).load(), settings);
  isNotNull(localStorage.getItem(STORAGE_KEY));
});

test("validate stored settings", async () => {
  // Load from garbage data.

  localStorage.setItem(STORAGE_KEY, "garbage");
  deepEqual(
    await openSettingsStorage(null, null).load(),
    new Settings(undefined, true),
  );

  // Load from valid data.

  localStorage.setItem(STORAGE_KEY, "{}");
  deepEqual(
    await openSettingsStorage(null, null).load(),
    new Settings(undefined, false),
  );
});

test("detect new settings", async () => {
  // Load for the first time.

  isTrue((await openSettingsStorage(null, null).load()).isNew);
  isNotNull(localStorage.getItem(STORAGE_KEY));

  // Load for the second time.

  isFalse((await openSettingsStorage(null, null).load()).isNew);
  isNotNull(localStorage.getItem(STORAGE_KEY));
});
