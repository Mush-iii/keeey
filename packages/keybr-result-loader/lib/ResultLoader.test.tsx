import { test } from "node:test";
import { type PageData, PageDataContext } from "@keybr/pages-shared";
import { ResultFaker, useResults } from "@keybr/result";
import { act, render, waitFor } from "@testing-library/react";
import { equal } from "rich-assert";
import { ResultLoader } from "./ResultLoader.tsx";

const faker = new ResultFaker();

test("load results", async () => {
  // Act.

  const r = render(
    <ResultLoader>
      <TestClient />
    </ResultLoader>,
    { wrapper: TestUser },
  );

  await waitFor(() => r.getByTitle("count"));

  // Assert.

  equal(r.getByTitle("count").textContent, "0");

  // Act.

  r.getByTitle("append").click();
  await act(async () => {
    await waitFor(() => r.getByTitle("count"));
  });

  // Assert.

  equal(r.getByTitle("count").textContent, "1");

  // Cleanup.

  r.unmount();
});

function TestUser({ children }: { children: any }) {
  return (
    <PageDataProvider>{children}</PageDataProvider>
  );
}

function PageDataProvider({ children }: { children: any }) {
  return (
    <PageDataContext.Provider value={{ publicUser: { id: null } } as PageData}>
      {children}
    </PageDataContext.Provider>
  );
}

function TestClient() {
  const { results, appendResults, clearResults } = useResults();
  return (
    <div>
      <p>
        <span title="count">{results.length}</span>
      </p>
      <p>
        <button
          title="append"
          onClick={() => {
            appendResults(faker.nextResultList(1));
          }}
        >
          append
        </button>
      </p>
      <p>
        <button
          title="clear"
          onClick={() => {
            clearResults();
          }}
        >
          clear
        </button>
      </p>
    </div>
  );
}
