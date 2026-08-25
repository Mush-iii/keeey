import { test } from "node:test";
import { FakeIntlProvider } from "@keybr/intl";
import { render } from "@testing-library/react";
import { isNotNull } from "rich-assert";
import { MemoryRouter } from "react-router";
import { Template } from "./Template.tsx";

test("render", () => {
  const r = render(
    <FakeIntlProvider>
      <MemoryRouter>
        <Template path="/page">
          <div>hello</div>
        </Template>
      </MemoryRouter>
    </FakeIntlProvider>,
  );

  isNotNull(r.queryByText("hello"));

  r.unmount();
});
