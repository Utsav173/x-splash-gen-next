'use client';

import { type LucideIcon } from 'lucide-react';

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
}) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <Link href={item.url} key={item.title}>
            <SidebarMenuItem className="group">
              <SidebarMenuButton
                tooltip={item.title}
                className={cn(
                  'rounded-full hover:bg-orange-100 hover:text-orange-800 transition-all duration-200 ease-in-out',
                  {
                    'bg-orange-100 hover:bg-orange-200':
                      pathname.split('/')[1] === item.url.split('/')[1],
                    'text-orange-800':
                      pathname.split('/')[1] === item.url.split('/')[1],
                  }
                )}
              >
                {item.icon && <item.icon />}
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </Link>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
