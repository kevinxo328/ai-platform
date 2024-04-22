import { NavLink, Outlet } from "react-router-dom";
import { useState } from "react";
import clsx from "clsx";
import { ChevronRightIcon } from "@radix-ui/react-icons";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../shadcn/ui/tooltip";
import { routes } from "@/router/routes";
import { AppThemeToggle } from "./AppThemeToggle";
import { Separator } from "@radix-ui/react-separator";
import { useTheme } from "@/contexts/ui-theme";

const AppHeader = () => {
  const { theme } = useTheme();
  // let imageSrc = `/logo-${import.meta.env.VITE_APP_DEFAULT_THEME}.svg`;
  // if (theme === "light" || theme === "dark") {
  //   imageSrc = `/logo-${theme}.svg`;
  // } else if (
  //   theme === "system" ||
  //   (!theme && import.meta.env.VITE_APP_DEFAULT_THEME === "system")
  // ) {
  //   imageSrc = window.matchMedia("(prefers-color-scheme: dark)").matches
  //     ? `/logo-dark.svg`
  //     : `/logo-light.svg`;
  // }
  return (
    <>
      <header className="py-4 px-8 h-[64px] flex justify-end">
        {/* <NavLink to={"/"}>
          <img
            src={imageSrc}
            alt="logo"
            className="max-h-[30px] w-auto h-auto"
          />
        </NavLink> */}
        <AppThemeToggle />
      </header>
      <Separator />
    </>
  );
};

const AppLayout = () => {
  const [menuOpen, setMenuOpen] = useState(true);
  const menuItems = routes[0].children[0].children?.filter((item) =>
    Object.hasOwn(item, "name")
  );

  return (
    <div className="h-screen overflow-hidden">
      <aside
        className={clsx(
          "h-screen bg-slate-100 dark:bg-slate-900 transition-all duration-300 p-4 fixed w-[250px] z-50",
          menuOpen ? "translate-x-0" : "-translate-x-full w-0"
        )}
      >
        <div className="flex flex-col space-y-2 overflow-hidden">
          {menuItems &&
            menuItems.map((item) => (
              // @ts-ignore
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  clsx(
                    "block p-2 transition-all rounded-md text-foreground flex-shrink-0",
                    "hover:bg-primary/10",
                    isActive ? "bg-primary/10 text-primary font-bold" : ""
                  )
                }
              >
                {item.name}
              </NavLink>
            ))}
        </div>
        <div
          className={clsx(
            "cursor-pointer text-foreground/60 hover:text-foreground/80",
            "absolute top-1/2 right-0 transform -translate-y-1/2 translate-x-full transition-all duration-300"
          )}
          onClick={() => setMenuOpen((pre) => !pre)}
        >
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <div className="p-2 relative">
                  <ChevronRightIcon
                    className={clsx("w-5 h-5", menuOpen ? "rotate-180" : "")}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                {`${menuOpen ? "關閉" : "開啟"}側邊欄`}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </aside>
      <div
        className={clsx(
          "transition-all duration-300",
          menuOpen ? "ml-[250px]" : "ml-0"
        )}
      >
        <AppHeader />
        <main className="p-8 w-full h-full min-h-[calc(100dvh_-_65px)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
