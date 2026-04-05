import { useState, useEffect } from 'react';
import { Page, Collection } from '../types';
import { fetchCollections } from '../api';

interface CollectionsPageProps {
  onNavigate: (page: Page) => void;
}

export function CollectionsPage({ onNavigate }: CollectionsPageProps) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCollections()
      .then(data => {
        setCollections(data.map(c => ({
          ...c,
          image: c.image ?? '',
          id: c.id.toString(),
        } as unknown as Collection)));
      })
      .catch(err => console.error('Failed to fetch collections:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="w-full py-32 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="w-full py-12 px-6 max-w-[1920px] mx-auto">
      <div className="mb-16 text-center">
        <h1 className="text-4xl md:text-6xl font-bold uppercase tracking-tighter mb-4">
          Collections
        </h1>
        <p className="text-gray-500 max-w-xl mx-auto">
          Explore our seasonal edits and curated selections.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {collections.length > 0 ? (
          collections.map((collection) => (
            <div
              key={collection.id}
              onClick={() => {
                const url = new URL(window.location.href);
                url.searchParams.set('collection', collection.slug);
                window.history.pushState({}, '', url);
                onNavigate('shop');
              }}
              className="group relative aspect-[4/5] md:aspect-[16/10] overflow-hidden cursor-pointer"
            >
              <img
                src={collection.image}
                alt={collection.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
              <div className="absolute inset-0 flex flex-col justify-center items-center text-white p-6 text-center">
                <h2 className="text-3xl md:text-4xl font-bold uppercase tracking-tighter mb-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  {collection.name}
                </h2>
                <p className="opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500 delay-100 max-w-md">
                  {collection.description}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-20 text-gray-400 font-medium uppercase tracking-widest border border-dashed border-gray-200">
            No collections found. Add them in the admin panel.
          </div>
        )}
      </div>
    </div>
  );
}
