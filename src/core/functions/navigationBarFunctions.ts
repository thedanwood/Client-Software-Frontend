import { RouterNames } from "../enums/RouterNames";
import { NavButtons } from "../enums/NavButtons";
import navButtonConfig from "../constants/navButtonConfig";

function isNavigationBarSelected(navButton: NavButtons, routeName: RouterNames): boolean {
  let routes = navButtonConfig[navButton];
  return routes.some((x) => x === routeName);
}

export { isNavigationBarSelected };
