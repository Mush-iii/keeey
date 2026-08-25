import {
  allLocales,
  defaultLocale,
  useIntlDisplayNames,
  usePreferredLocale,
} from "@keybr/intl";
import { clsx } from "clsx";
import { type ReactNode } from "react";
import * as styles from "./SubMenu.module.less";

const localeStorageKey = "pulsetype.locale";

export function SubMenu({ currentPath }: { readonly currentPath: string }) {
  return (
    <div className={styles.root}>
      <LocaleSwitcher />
    </div>
  );
}

function LocaleSwitcher() {
  const { formatLanguageName, formatLocalLanguageName } = useIntlDisplayNames();
  const preferredLocale = usePreferredLocale();
  const primary = [];
  primary.push(
    <button
      key="preferred"
      type="button"
      className={clsx(styles.localeLink, styles.localeButton)}
      onClick={() => switchTo(preferredLocale)}
    >
      {formatLocalLanguageName(preferredLocale)}
    </button>,
  );
  if (preferredLocale !== defaultLocale) {
    primary.push(
      <button
        key="default"
        type="button"
        className={clsx(styles.localeLink, styles.localeButton)}
        onClick={() => switchTo(defaultLocale)}
      >
        {formatLocalLanguageName(defaultLocale)}
      </button>,
    );
  }
  const secondary = [];
  for (const locale of allLocales) {
    if (locale !== preferredLocale && locale !== defaultLocale) {
      if (secondary.length > 0) {
        secondary.push(" ");
      }
      secondary.push(
        <button
          key={locale}
          type="button"
          className={clsx(styles.localeLink, styles.localeButton)}
          title={`${formatLocalLanguageName(locale)} / ${formatLanguageName(locale)}`}
          onClick={() => switchTo(locale)}
        >
          {locale}
        </button>,
      );
    }
  }
  return (
    <>
      {...primary}
      <span className={styles.localeList}>{...secondary}</span>
    </>
  );
}

function switchTo(locale: string): void {
  try {
    localStorage.setItem(localeStorageKey, locale);
  } catch {
    // Ignore.
  }
  window.location.hash = "";
  window.location.reload();
}
