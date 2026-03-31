import type { NavigationState } from '@react-navigation/native';

import { trackScreenView } from './track';

export function getActiveRouteName(
  state: NavigationState | undefined,
): string | undefined {
  if (!state?.routes?.length) {
    return undefined;
  }
  const route = state.routes[state.index];
  if (route.state) {
    return getActiveRouteName(route.state as NavigationState);
  }
  return route.name;
}

/**
 * Returns an `onStateChange` handler for `NavigationContainer` that logs `screen_view` for the focused route.
 */
export function createNavigationStateChangeHandler(): (
  state: NavigationState | undefined,
) => void {
  let lastRouteName: string | undefined;
  return (state: NavigationState | undefined) => {
    const name = getActiveRouteName(state);
    if (name && name !== lastRouteName) {
      lastRouteName = name;
      void trackScreenView(name);
    }
  };
}
