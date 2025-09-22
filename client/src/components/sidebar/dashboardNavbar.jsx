import { useState } from "react"
import {
  CompassIcon,
  FeatherIcon,
  HouseIcon,
  PlusIcon,
  SearchIcon,
} from "lucide-react"

import NotificationMenu from "@/components/notification-menu"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/sidebar/sidebar"
import TeamSwitcher from "@/components/team-switcher"
import UserMenu from "@/components/user-menu"
import { Button } from "@/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu"

const navigationLinks = [
  { href: "#", label: "Dashboard", icon: HouseIcon },
  { href: "#", label: "Explore", icon: CompassIcon },
  { href: "#", label: "Write", icon: FeatherIcon },
  { href: "#", label: "Search", icon: SearchIcon },
]

export default function DashboardNavbar({ onAddActivity }) {
  const handleLogActivity = () => {
    if (onAddActivity) {
      onAddActivity()
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b px-4 md:px-2 bg-background">
      <div className="flex h-12 items-center justify-between gap-5">
        
        {/* Left side - Sidebar */}
        <SidebarProvider>
          <div className="flex">
            <AppSidebar />
          </div>
        </SidebarProvider>
                    
        {/* Middle area */}
        <NavigationMenu className="max-md:hidden">
          <NavigationMenuList className="gap-2">
            {navigationLinks.map((link, index) => {
              const Icon = link.icon
              return (
                <NavigationMenuItem key={index}>
                  <NavigationMenuLink
                    href={link.href}
                    className="flex size-8 items-center justify-center p-1.5"
                    title={link.label}
                  >
                    <Icon aria-hidden="true" />
                    <span className="sr-only">{link.label}</span>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              )
            })}
          </NavigationMenuList>
        </NavigationMenu>
        
        {/* Right side */}
        <div className="flex flex-1 items-center justify-end gap-4">
          <Button
            size="sm"
            className="text-sm max-sm:aspect-square max-sm:p-0"
            onClick={handleLogActivity}
          >
            <PlusIcon
              className="opacity-60 sm:-ms-1"
              size={16}
              aria-hidden="true"
            />
            <span className="max-sm:sr-only">Log Activity</span>
          </Button>
          <NotificationMenu />
          <UserMenu />
        </div>
      </div>
    </header>
  )
}