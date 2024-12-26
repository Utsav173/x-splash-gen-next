'use client';

import * as React from 'react';
import {
  AudioWaveform,
  Command,
  GalleryVerticalEnd,
  ImageUp,
  Telescope,
  LibraryBig,
} from 'lucide-react';

import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { TeamSwitcher } from '@/components/team-switcher';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar';

// This is sample data.
const data = {
  teams: [
    {
      name: 'X-splash-gen',
      logo: GalleryVerticalEnd,
      plan: 'Enterprise',
    },
    {
      name: 'Image Explorer',
      logo: AudioWaveform,
      plan: 'Startup',
    },
    {
      name: 'Evil Corp.',
      logo: Command,
      plan: 'Free',
    },
  ],
  navMain: [
    {
      title: 'Explore',
      url: '/',
      icon: Telescope,
    },
    {
      title: 'Create',
      url: '/create',
      icon: ImageUp,
    },
    {
      title: 'Collections',
      url: '/collections',
      icon: LibraryBig,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
