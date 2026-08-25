import { ErrorHandler } from "@keybr/debug";
import {
  getPageData,
  LoadingProgress,
  PageDataContext,
  Pages,
  Root,
} from "@keybr/pages-shared";
import { SettingsLoader } from "@keybr/settings-loader";
import { lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { useIntl } from "react-intl";
import { HashRouter, Route, Routes } from "react-router";
import { IntlLoader } from "./loader/IntlLoader.tsx";
import { Template } from "./Template.tsx";
import { ThemeProvider } from "./themes/ThemeProvider.tsx";
import { Title } from "./Title.tsx";

export function main() {
  const selector = Root.selector;
  let container = document.querySelector<HTMLElement>(selector);
  if (container == null) {
    container = document.createElement("div");
    document.body.appendChild(container);
  }
  createRoot(container).render(<App />);
}

const HelpPage = lazy(() => import("./pages/help.tsx"));
const HighScorePage = lazy(() => import("./pages/high-scores.tsx"));
const LayoutsPage = lazy(() => import("./pages/layouts.tsx"));
const PracticePage = lazy(() => import("./pages/practice.tsx"));
const ProfilePage = lazy(() => import("./pages/profile.tsx"));
const TypingTestPage = lazy(() => import("./pages/typing-test.tsx"));

export function App() {
  return (
    <PageDataContext.Provider value={getPageData()}>
      <ErrorHandler>
        <IntlLoader>
          <SettingsLoader>
            <ThemeProvider>
              <PageRoutes />
            </ThemeProvider>
          </SettingsLoader>
        </IntlLoader>
      </ErrorHandler>
    </PageDataContext.Provider>
  );
}

function PageRoutes() {
  const { locale } = useIntl();
  return (
    <HashRouter basename={Pages.intlBase(locale)}>
      <Routes>
        <Route
          index={true}
          path={Pages.practice.path}
          element={
            <Template path={Pages.practice.path}>
              <Title page={Pages.practice} />
              <Suspense fallback={<LoadingProgress />}>
                <PracticePage />
              </Suspense>
            </Template>
          }
        />
        <Route
          path={Pages.help.path}
          element={
            <Template path={Pages.help.path}>
              <Title page={Pages.help} />
              <Suspense fallback={<LoadingProgress />}>
                <HelpPage />
              </Suspense>
            </Template>
          }
        />
        <Route
          path={Pages.highScores.path}
          element={
            <Template path={Pages.highScores.path}>
              <Title page={Pages.highScores} />
              <Suspense fallback={<LoadingProgress />}>
                <HighScorePage />
              </Suspense>
            </Template>
          }
        />
        <Route
          path={Pages.layouts.path}
          element={
            <Template path={Pages.layouts.path}>
              <Title page={Pages.layouts} />
              <Suspense fallback={<LoadingProgress />}>
                <LayoutsPage />
              </Suspense>
            </Template>
          }
        />
        <Route
          path={`${Pages.profile.path}`}
          element={
            <Template path={Pages.profile.path}>
              <Title page={Pages.profile} />
              <Suspense fallback={<LoadingProgress />}>
                <ProfilePage />
              </Suspense>
            </Template>
          }
        />
        <Route
          path={Pages.typingTest.path}
          element={
            <Template path={Pages.typingTest.path}>
              <Title page={Pages.typingTest} />
              <Suspense fallback={<LoadingProgress />}>
                <TypingTestPage />
              </Suspense>
            </Template>
          }
        />
        <Route
          path="*"
          element={
            <Template path={Pages.practice.path}>
              <Title page={Pages.practice} />
              <Suspense fallback={<LoadingProgress />}>
                <PracticePage />
              </Suspense>
            </Template>
          }
        />
      </Routes>
    </HashRouter>
  );
}
