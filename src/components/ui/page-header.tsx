import { SidebarTrigger } from "./sidebar";
import { ReactNode } from "react";

interface PageHeaderProps {
  leftContent: ReactNode;
  rightContent: ReactNode;
}

export function PageHeader({ leftContent, rightContent }: PageHeaderProps) {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-lg bg-white/75 border-b border-sidebar-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="-ml-1" />
            {leftContent}
          </div>
          {rightContent}
        </div>
      </div>
    </header>
  );
}
