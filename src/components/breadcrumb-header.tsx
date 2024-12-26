'use client';

import { usePathname } from 'next/navigation';
import React from 'react';
import { BreadcrumbItem, BreadcrumbPage } from './ui/breadcrumb';
import Link from 'next/link';

const BreadcrumbHeader = () => {
  const path = usePathname();

  const isHome = path === '/';

  if (isHome) {
    return null;
  }

  return (
    <BreadcrumbItem>
      <Link href={path}>
        <BreadcrumbPage className="capitalize">
          {path.replace('/', '')}
        </BreadcrumbPage>
      </Link>
    </BreadcrumbItem>
  );
};

export default BreadcrumbHeader;
