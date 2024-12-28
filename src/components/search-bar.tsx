'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import debounce from 'lodash/debounce';
import { Search } from 'lucide-react';

export default function SearchBar({ initialQuery = '' }) {
  const [query, setQuery] = useState(initialQuery);
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSearch = debounce((searchQuery: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (searchQuery) {
      params.set('q', searchQuery);
    } else {
      params.delete('q');
    }
    params.set('page', '1');
    router.push(`/?${params.toString()}`);
  }, 300);

  return (
    <div className="flex gap-2 relative">
      <Input
        className="max-w-xs rounded-3xl border border-sidebar-border"
        placeholder="Search images..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          handleSearch(e.target.value);
        }}
      />
    </div>
  );
}
