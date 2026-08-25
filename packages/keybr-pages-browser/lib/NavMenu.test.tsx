import { test } from "node:test";
import { FakeIntlProvider, PreferredLocaleContext } from "@keybr/intl";
import { render } from "@testing-library/react";
import { isNotNull } from "rich-assert";
import { MemoryRouter } from "react-router";
import { NavMenu } from "./NavMenu.tsx";

test("render", () => {
  const r = render(
    <PreferredLocaleContext.Provider value="pl">
      <FakeIntlProvider>
        <MemoryRouter>
          <NavMenu currentPath="/page" />
        </MemoryRouter>
      </FakeIntlProvider>
    </PreferredLocaleContext.Provider>,
  );

  isNotNull(r.queryByText("PulseType"));

  r.unmount();
});
