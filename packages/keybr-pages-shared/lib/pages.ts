import { defaultLocale } from "@keybr/intl";
import {
  mdiChartAreaspline,
  mdiHelpCircleOutline,
  mdiKeyboard,
  mdiKeyboardOutline,
  mdiSpeedometer,
  mdiTrophyOutline,
} from "@mdi/js";
import { defineMessage, type MessageDescriptor } from "react-intl";
import { type AnonymousUser, type AnyUser, type NamedUser } from "./types.ts";

export const siteName = "PulseType";

export type Meta = {
  readonly name?: string;
  readonly property?: string;
  readonly content: string | MessageDescriptor;
};

export type PageInfo = {
  readonly path: string;
  readonly title: MessageDescriptor;
  readonly link: {
    readonly label: MessageDescriptor;
    readonly title?: MessageDescriptor;
    readonly icon?: string;
  };
  readonly meta: Meta[];
};

export namespace Pages {
  export const practice = {
    path: "/",
    title: defineMessage({
      id: "t_Practice",
      defaultMessage: "Practice",
    }),
    link: {
      label: defineMessage({
        id: "t_Practice",
        defaultMessage: "Practice",
      }),
      title: defineMessage({
        id: "page.practice.description",
        defaultMessage:
          "Typing practice lessons to improve your speed and accuracy.",
      }),
      icon: mdiKeyboard,
    },
    meta: [
      {
        name: "description",
        content: defineMessage({
          id: "page.practice.description",
          defaultMessage:
            "Typing practice lessons to improve your speed and accuracy.",
        }),
      },
    ],
  } satisfies PageInfo;

  export const profile = {
    path: "/profile",
    title: defineMessage({
      id: "t_Profile",
      defaultMessage: "Profile",
    }),
    link: {
      label: defineMessage({
        id: "t_Profile",
        defaultMessage: "Profile",
      }),
      title: defineMessage({
        id: "page.profile.description",
        defaultMessage:
          "The detailed statistics regarding your learning progress.",
      }),
      icon: mdiChartAreaspline,
    },
    meta: [{ name: "robots", content: "noindex" }],
  } satisfies PageInfo;

  export const help = {
    path: "/help",
    title: defineMessage({
      id: "t_Help",
      defaultMessage: "Help",
    }),
    link: {
      label: defineMessage({
        id: "t_Help",
        defaultMessage: "Help",
      }),
      title: defineMessage({
        id: "page.help.description",
        defaultMessage: "The instructions for using this application.",
      }),
      icon: mdiHelpCircleOutline,
    },
    meta: [
      {
        name: "description",
        content: defineMessage({
          id: "page.help.description",
          defaultMessage: "The instructions for using this application.",
        }),
      },
    ],
  } satisfies PageInfo;

  export const highScores = {
    path: "/high-scores",
    title: defineMessage({
      id: "t_High_Scores",
      defaultMessage: "High Scores",
    }),
    link: {
      label: defineMessage({
        id: "t_High_Scores",
        defaultMessage: "High Scores",
      }),
      title: defineMessage({
        id: "page.highScores.description",
        defaultMessage: "Your personal best scores.",
      }),
      icon: mdiTrophyOutline,
    },
    meta: [
      {
        name: "description",
        content: defineMessage({
          id: "page.highScores.description",
          defaultMessage: "Your personal best scores.",
        }),
      },
    ],
  } satisfies PageInfo;

  export const typingTest = {
    path: "/typing-test",
    title: defineMessage({
      id: "t_Typing_Test",
      defaultMessage: "Typing Test",
    }),
    link: {
      label: defineMessage({
        id: "t_Typing_Test",
        defaultMessage: "Typing Test",
      }),
      title: defineMessage({
        id: "page.typingTest.description",
        defaultMessage: "Typing speed and accuracy test.",
      }),
      icon: mdiSpeedometer,
    },
    meta: [
      {
        name: "description",
        content: defineMessage({
          id: "page.typingTest.description",
          defaultMessage: "Typing speed and accuracy test.",
        }),
      },
    ],
  } satisfies PageInfo;

  export const layouts = {
    path: "/layouts",
    title: defineMessage({
      id: "t_Layouts",
      defaultMessage: "Layouts",
    }),
    link: {
      label: defineMessage({
        id: "t_Layouts",
        defaultMessage: "Layouts",
      }),
      title: defineMessage({
        id: "page.layouts.description",
        defaultMessage: "Comparison charts of keyboard layouts.",
      }),
      icon: mdiKeyboardOutline,
    },
    meta: [
      {
        name: "description",
        content: defineMessage({
          id: "page.layouts.description",
          defaultMessage: "Comparison charts of keyboard layouts.",
        }),
      },
    ],
  } satisfies PageInfo;

  export function profileOf(arg: string): string;
  export function profileOf(arg: NamedUser): string;
  export function profileOf(arg: AnonymousUser): null;
  export function profileOf(arg: AnyUser): string | null;
  export function profileOf(arg: null): null;
  export function profileOf(arg: any): string | null {
    if (arg == null) {
      return null;
    }
    if (typeof arg === "string") {
      return `${Pages.profile.path}/${arg}`;
    }
    if (typeof arg === "object" && typeof arg.id === "string") {
      return `${Pages.profile.path}/${arg.id}`;
    }
    return null;
  }

  export function intlBase(locale: string): string {
    return locale === defaultLocale ? "" : `/${locale}`;
  }

  export function intlPath(path: string, locale: string): string {
    return locale === defaultLocale
      ? path
      : path === "/"
        ? `/${locale}`
        : `/${locale}${path}`;
  }
}
