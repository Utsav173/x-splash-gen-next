'use client';

import {
  BadgeCheck,
  ChevronsUpDown,
  CreditCard,
  KeyRound,
  LogOut,
} from 'lucide-react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { useUser } from '@/lib/auth';
import { signOut } from '@/app/(login)/actions';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function NavUser() {
  const { isMobile } = useSidebar();
  const router = useRouter();
  const { user } = useUser();

  if (!user) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <Link href="/sign-in">
            <SidebarMenuButton
              asChild
              size="lg"
              className=" rounded-full data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground bg-green-100 text-green-900 hover:bg-green-300 transition-all duration-200 ease-in-out hover:shadow-md "
            >
              <div className="flex items-center justify-between px-4">
                Sign in
                <KeyRound />
              </div>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  const getUserIntial = () => {
    if (user?.email.split('@')[0]) {
      return user?.email.split('@')[0].charAt(0);
    } else {
      return 'CN';
    }
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:bg-orange-100 hover:text-orange-800 transition-all duration-200 ease-in-out group-first:"
            >
              <Avatar className="h-8 w-8 rounded-full">
                <AvatarFallback className="rounded-full group-hover:bg-orange-200 group-hover:text-orange-800">
                  {getUserIntial()}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {user?.email.split('@')[0]}
                </span>
                <span className="truncate text-xs">{user?.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarFallback className="rounded-lg">
                    {getUserIntial()}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {user?.email.split('@')[0]}
                  </span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <BadgeCheck />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCard />
                Billing
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={async() => {
                await signOut();
                router.push('/');
              }}
            >
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
