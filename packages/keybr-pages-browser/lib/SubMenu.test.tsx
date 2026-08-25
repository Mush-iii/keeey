import { test } from "node:test";
import { FakeIntlProvider, PreferredLocaleContext } from "@keybr/intl";
import { render } from "@testing-library/react";
import { isNotNull } from "rich-assert";
import { SubMenu } from "./SubMenu.tsx";

test("render", () => {
  const r = render(
    <PreferredLocaleContext.Provider value="pl">
      <FakeIntlProvider>
        <SubMenu currentPath="/page" />
      </FakeIntlProvider>
    </PreferredLocaleContext.Provider>,
  );

  isNotNull(r.queryByText("Polski"));
  isNotNull(r.queryByText("English"));

  r.unmount();
});
