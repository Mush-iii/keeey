import { type LocaleId } from "@keybr/intl";

export type PageData = {
  /**
   * Base URL.
   */
  readonly base: string;
  /**
   * Active locale identifier.
   */
  readonly locale: LocaleId;
  /**
   * The current user as is visible to the public.
   *
   * In the desktop app this is always an anonymous local user.
   */
  readonly publicUser: AnyUser;
  /**
   * Serialized user settings.
   */
  readonly settings: unknown | null;
};

export type AnonymousUser = {
  /**
   * Anonymous user id.
   */
  readonly id: null;
  /**
   * Anonymous user name.
   */
  readonly name: string;
  /**
   * Image url for avatar.
   */
  readonly imageUrl: null;
};

export type NamedUser = {
  /**
   * Unique user id.
   */
  readonly id: string;
  /**
   * Non-unique user name.
   */
  readonly name: string;
  /**
   * Image url for avatar.
   */
  readonly imageUrl: string | null;
  /**
   * Whether this is a premium user;
   */
  readonly premium: boolean;
};

export type AnyUser = AnonymousUser | NamedUser;
