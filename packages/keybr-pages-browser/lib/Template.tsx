import { type ReactNode } from "react";
import { PortalContainer, Toaster } from "@keybr/widget";
import { NavMenu } from "./NavMenu.tsx";
import * as styles from "./Template.module.less";

export function Template({
  path,
  children,
}: {
  readonly path: string;
  readonly children: ReactNode;
}) {
  return (
    <div className={styles.body}>
      <main className={styles.main}>
        {children}
        <PortalContainer />
        <Toaster />
      </main>
      <nav className={styles.nav}>
        <NavMenu currentPath={path} />
      </nav>
    </div>
  );
}
