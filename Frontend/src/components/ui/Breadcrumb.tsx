import { Fragment } from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { Page } from '../../types';
interface BreadcrumbItem {
  label: string;
  page?: Page;
}
interface BreadcrumbProps {
  items: BreadcrumbItem[];
  onNavigate: (page: Page) => void;
  className?: string;
}
export function Breadcrumb({
  items,
  onNavigate,
  className = ''
}: BreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={`hidden md:flex items-center text-sm text-gray-500 mb-8 ${className}`}>

      <button
        onClick={() => onNavigate('home')}
        className="hover:text-black transition-colors flex items-center"
        aria-label="Home">

        <Home size={14} />
      </button>

      {items.map((item, index) =>
      <Fragment key={index}>
          <ChevronRight size={14} className="mx-2 text-gray-300" />
          {item.page ?
        <button
          onClick={() => onNavigate(item.page!)}
          className="hover:text-black transition-colors">

              {item.label}
            </button> :

        <span className="text-black font-medium truncate max-w-[200px]">
              {item.label}
            </span>
        }
        </Fragment>
      )}
    </nav>);

}
