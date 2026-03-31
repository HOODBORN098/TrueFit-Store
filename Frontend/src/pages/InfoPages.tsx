import { Page } from '../types';
import { ArrowLeft, Truck, HelpCircle, Ruler, Mail } from 'lucide-react';
import { Button } from '../components/ui/Button';

interface InfoPageProps {
  type: Page;
  onNavigate: (page: Page) => void;
}

export function InfoPage({ type, onNavigate }: InfoPageProps) {
  const getContent = () => {
    switch (type) {
      case 'support':
        return {
          title: 'Contact Us',
          icon: <Mail className="w-12 h-12 mb-4 text-black" />,
          description: 'Have a question? We are here to help. Reach out to our team.',
          details: [
            { label: 'Email', value: 'hello@truefit.com' },
            { label: 'WhatsApp', value: '0112 394 362' },
            { label: 'Hours', value: 'Mon-Fri: 9am - 6pm' }
          ]
        };
      case 'shipping':
        return {
          title: 'Shipping & Returns',
          icon: <Truck className="w-12 h-12 mb-4 text-black" />,
          description: 'We offer worldwide shipping with premium courier partners.',
          details: [
            { label: 'Domestic', value: '1-3 Business Days' },
            { label: 'International', value: '5-10 Business Days' },
            { label: 'Returns', value: '30-day easy returns policy' }
          ]
        };
      case 'faq':
        return {
          title: 'Frequently Asked Questions',
          icon: <HelpCircle className="w-12 h-12 mb-4 text-black" />,
          description: 'Common questions about our products and services.',
          details: [
            { label: 'Quality', value: '100% premium materials' },
            { label: 'Payment', value: 'Secure encrypted checkout' },
            { label: 'Sizing', value: 'Standard fit unless noted' }
          ]
        };
      case 'size-guide':
        return {
          title: 'Size Guide',
          icon: <Ruler className="w-12 h-12 mb-4 text-black" />,
          description: 'Find your perfect TrueFit size.',
          details: [
            { label: 'Small', value: 'Chest: 36-38"' },
            { label: 'Medium', value: 'Chest: 38-40"' },
            { label: 'Large', value: 'Chest: 40-42"' }
          ]
        };
      default:
        return null;
    }
  };

  const content = getContent();
  if (!content) return null;

  return (
    <div className="max-w-4xl mx-auto px-6 py-20 animate-fade-in">
      <button
        onClick={() => onNavigate('home')}
        className="flex items-center text-sm text-gray-500 hover:text-black transition-colors mb-12 group"
      >
        <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
        Back to Home
      </button>

      <div className="flex flex-col items-center text-center">
        {content.icon}
        <h1 className="text-4xl font-bold uppercase tracking-tight mb-4">{content.title}</h1>
        <p className="text-gray-600 mb-12 max-w-lg">{content.description}</p>

        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {content.details.map((detail, i) => (
            <div key={i} className="border border-gray-100 p-8 rounded-xl bg-gray-50/50">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">{detail.label}</p>
              <p className="text-lg font-medium text-black">{detail.value}</p>
            </div>
          ))}
        </div>

        <Button 
          variant="outline" 
          size="lg" 
          onClick={() => onNavigate('shop')}
        >
          Continue Shopping
        </Button>
      </div>
    </div>
  );
}
