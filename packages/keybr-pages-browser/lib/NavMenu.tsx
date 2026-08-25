import { Pages, type PageInfo } from "@keybr/pages-shared";
import { Icon } from "@keybr/widget";
import { clsx } from "clsx";
import { type ReactNode } from "react";
import { useIntl } from "react-intl";
import { mdiPulse } from "@mdi/js";
import { NavLink } from "react-router";
import * as styles from "./NavMenu.module.less";
import { SubMenu } from "./SubMenu.tsx";
import { ThemeSwitcher } from "./themes/ThemeSwitcher.tsx";

export function NavMenu({ currentPath }: { readonly currentPath: string }) {
  return (
    <div className={styles.root}>
      <MenuItem>
        <BrandLink />
      </MenuItem>

      <MenuItem>
        <ThemeSwitcher />
      </MenuItem>

      <MenuItem>
        <MenuItemLink page={Pages.practice} />
      </MenuItem>

      <MenuItem>
        <MenuItemLink page={Pages.profile} />
      </MenuItem>

      <MenuItem>
        <MenuItemLink page={Pages.help} />
      </MenuItem>

      <MenuItem>
        <MenuItemLink page={Pages.highScores} />
      </MenuItem>

      <MenuItem>
        <MenuItemLink page={Pages.typingTest} />
      </MenuItem>

      <MenuItem>
        <MenuItemLink page={Pages.layouts} />
      </MenuItem>

      <MenuItem>
        <SubMenu currentPath={currentPath} />
      </MenuItem>
    </div>
  );
}

function MenuItem({ children }: { readonly children: ReactNode }) {
  return <div className={styles.item}>{children}</div>;
}

function BrandLink() {
  return (
    <NavLink
      className={({ isActive }) =>
        clsx(styles.accountLink, isActive && styles.isActive)
      }
      to={Pages.practice.path}
    >
      <Icon className={styles.icon} shape={mdiPulse} />
      <span className={styles.userName}>PulseType</span>
    </NavLink>
  );
}

function MenuItemLink({
  page: {
    path,
    link: { label, title, icon },
  },
}: {
  readonly page: PageInfo;
}) {
  const { formatMessage } = useIntl();
  return (
    <NavLink
      className={({ isActive }) =>
        clsx(styles.link, isActive && styles.isActive)
      }
      to={path}
      title={title && formatMessage(title)}
    >
      <Icon className={styles.icon} shape={icon ?? ""} />
      <span className={styles.label}>{formatMessage(label)}</span>
    </NavLink>
  );
}
