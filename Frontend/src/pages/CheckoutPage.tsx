import { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Page } from '../types';
import { useToast } from '../context/ToastContext';
import { createOrder, triggerMpesaPush, fetchMyOrders } from '../api';

// M-Pesa is the only supported payment method.

const Input = ({ label, value, onChange, type = 'text', placeholder, name, autoComplete }: { label: string; value?: string; onChange?: (val: string) => void; type?: string; placeholder?: string; name?: string; autoComplete?: string }) => (
  <div className="mb-6">
    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
      {label}
    </label>
    <input
      type={type}
      name={name}
      autoComplete={autoComplete}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      className="w-full border-b border-gray-300 py-3 text-sm focus:outline-none focus:border-black transition-colors bg-transparent"
    />
  </div>
);

interface CheckoutPageProps {
  onNavigate: (page: Page) => void;
}

export function CheckoutPage({ onNavigate }: CheckoutPageProps) {
  const { items, subtotal } = useCart();
  const { isAuthenticated, user } = useAuth();
  
  const [step, setStep] = useState<1 | 2>(1);
  const [phoneNumber, setPhoneNumber] = useState(user?.phone || '');
  const [mpesaLoading, setMpesaLoading] = useState(false);
  const { clearCart } = useCart();
  const { showToast } = useToast();

  
  // Shipping form state
  const [shippingInfo, setShippingInfo] = useState({
    address: '',
    city: '',
    postalCode: '',
    country: ''
  });
  const [isDetecting, setIsDetecting] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
          const data = await res.json();

          setShippingInfo(prev => ({
            ...prev,
            country: data.countryName || '',
            city: data.city || data.locality || '',
            postalCode: data.postcode || ''
          }));
        } catch (error) {
          console.error("Error fetching location data:", error);
          alert("Failed to get location details. Please enter manually.");
        } finally {
          setIsDetecting(false);
        }
      },
      (error) => {
        setIsDetecting(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            alert("Please allow location access to use this feature.");
            break;
          default:
            alert("Location detection failed.");
        }
      }
    );
  };

  const userCity = shippingInfo.city.toLowerCase();
  const userAddress = shippingInfo.address.toLowerCase();
  
  const isEgerton = userCity.includes('egerton') || userCity.includes('njoro') || userAddress.includes('egerton') || userAddress.includes('njoro');
  const isNakuru = userCity.includes('nakuru') || userAddress.includes('nakuru');

  const getShippingFee = () => {
    if (!shippingInfo.city && !shippingInfo.address) return null;
    if (isEgerton) return 0;
    if (isNakuru) return 200;
    if (subtotal > 10000) return 0;
    return 500;
  };

  const shipping = getShippingFee();
  const tax = subtotal * 0.08;
  const total = subtotal + (shipping ?? 500) + tax;

  useEffect(() => {
    if (!isAuthenticated) {
      alert('You must be logged in to checkout.');
      onNavigate('customer-login');
    }
  }, [isAuthenticated, onNavigate]);

  const handleMpesaPayment = async () => {
    if (!phoneNumber) {
      showToast('Please enter a phone number', 'error');
      return;
    }
    setMpesaLoading(true);
    try {
      // 1. Create order
      const orderData = {
          full_name: `${user?.firstName} ${user?.lastName}`.trim() || 'Customer',
          email: user?.email || '',
          phone: phoneNumber,
          address: shippingInfo.address,
          city: shippingInfo.city,
          postal_code: shippingInfo.postalCode,
          country: shippingInfo.country,
          total_amount: total,
          items: items.map(item => ({
              product: parseInt(item.id),
              product_name: item.name,
              price: item.price,
              quantity: item.quantity,
              size: item.selectedSize,
              color: item.selectedColor
          }))
      };

      const orderRes = await createOrder(orderData);
      
      if (orderRes && orderRes.id) {
        // 2. Trigger STK Push
        showToast('Processing M-Pesa... Please check your phone.', 'info');
        const mpesaRes = await triggerMpesaPush(orderRes.id, phoneNumber);
        
        if (mpesaRes.ResponseCode === '0') {
            // 3. Start Polling for status change
            let attempts = 0;
            const pollInterval = setInterval(async () => {
                attempts++;
                const orders = await fetchMyOrders();
                const currentOrder = orders.find(o => o.id === orderRes.id);
                
                if (currentOrder && currentOrder.status === 'paid') {
                    clearInterval(pollInterval);
                    showToast('Payment Successful!', 'success');
                    clearCart();
                    onNavigate('home');
                } else if (attempts > 20) { // Time out after ~60 seconds
                    clearInterval(pollInterval);
                    setMpesaLoading(false);
                    showToast('Payment verification timed out. If you paid, it will update shortly.', 'info');
                }
            }, 3000);
        } else {
            showToast(mpesaRes.errorMessage || 'M-Pesa push failed', 'error');
            setMpesaLoading(false);
        }
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to process payment', 'error');
      setMpesaLoading(false);
    }
  };

  const isShippingValid = shippingInfo.address && shippingInfo.city && shippingInfo.postalCode && shippingInfo.country;

  const handleStepChange = (newStep: 1 | 2) => {
    if (newStep === 2) {
      if (!isShippingValid) return;
      setStep(2); 
    } else {
      setStep(newStep);
    }
  };

  return (
    <div className="max-w-[1920px] mx-auto px-6 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
        {/* Left: Form */}
        <div className="lg:col-span-7">
          {/* Steps */}
          <div className="flex items-center space-x-4 mb-12 text-sm font-medium">
            <span className={step >= 1 ? 'text-black' : 'text-gray-400'}>Shipping</span>
            <span className="text-gray-300">/</span>
            <span className={step >= 2 ? 'text-black' : 'text-gray-400'}>Payment</span>
          </div>

          {step === 1 && (
            <div className="animate-fade-in">
              <div className="flex justify-between items-start mb-8">
                <h2 className="text-2xl font-bold uppercase tracking-tight">Shipping Address</h2>
                <button
                  onClick={detectLocation}
                  disabled={isDetecting}
                  className="text-xs font-bold uppercase tracking-widest text-black border border-black px-4 py-2 hover:bg-black hover:text-white transition-all disabled:opacity-50"
                >
                  {isDetecting ? 'Detecting...' : 'Detect My Location'}
                </button>
              </div>
              <Input
                label="Address"
                name="address"
                autoComplete="address-line1"
                value={shippingInfo.address}
                onChange={(val) => setShippingInfo({ ...shippingInfo, address: val })}
                placeholder="e.g. 123 Luxury Lane"
              />
              <div className="grid grid-cols-2 gap-6">
                <Input
                  label="City"
                  name="city"
                  autoComplete="address-level2"
                  value={shippingInfo.city}
                  onChange={(val) => setShippingInfo({ ...shippingInfo, city: val })}
                />
                <Input
                  label="Postal Code"
                  name="zip"
                  autoComplete="postal-code"
                  value={shippingInfo.postalCode}
                  onChange={(val) => setShippingInfo({ ...shippingInfo, postalCode: val })}
                />
              </div>
              <Input
                label="Country"
                name="country"
                autoComplete="country-name"
                value={shippingInfo.country}
                onChange={(val) => setShippingInfo({ ...shippingInfo, country: val })}
              />
              <div className="mt-12 flex items-center gap-4">
                <Button
                  onClick={() => handleStepChange(2)}
                  size="lg"
                  disabled={!isShippingValid}
                >
                  Continue to Payment
                </Button>
              </div>
              {!isShippingValid && shippingInfo.address && (
                <p className="text-xs text-red-500 mt-2 italic">Please provide full shipping details to proceed.</p>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="animate-fade-in">
              <div className="space-y-4 animate-fade-in-up bg-gray-50 p-6 rounded mb-8 border border-green-100">
                <div className="bg-green-50 p-4 border border-green-100 rounded-lg">
                  <p className="text-sm text-green-800 mb-2 font-bold">Lipa na M-Pesa</p>
                  <p className="text-xs text-green-700">Enter your M-Pesa phone number below. You will receive a prompt on your phone to complete the payment.</p>
                </div>
                
                {/* Non-refundable Policy Notice */}
                <div className="bg-amber-50 p-3 border border-amber-200 rounded flex items-start gap-2">
                  <span className="text-amber-600 font-bold">!</span>
                  <p className="text-[10px] text-amber-800 font-medium leading-tight">
                    <span className="font-bold uppercase">Important:</span> All purchases are strictly <span className="underline">non-refundable</span>. By proceeding, you agree to this final sale policy.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="0712345678"
                    className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-green-600 transition-colors bg-white px-2"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </div>
                <div className="mt-8">
                  <Button
                    size="lg"
                    fullWidth
                    onClick={handleMpesaPayment}
                    isLoading={mpesaLoading}
                    disabled={!termsAccepted}
                  >
                    <span className="text-white">Pay with M-Pesa</span>
                  </Button>
                </div>
              </div>

              {/* Terms & Conditions Acceptance */}
              <div className="mt-8 pt-8 border-t border-gray-100 flex items-start gap-3">
                <input
                  type="checkbox"
                  id="terms"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-1 h-4 w-4 border-gray-300 rounded text-black focus:ring-black"
                />
                <label htmlFor="terms" className="text-sm text-gray-600 leading-relaxed">
                  I have read and agree to the{' '}
                  <button onClick={() => onNavigate('terms-conditions')} className="text-black underline font-medium hover:text-gray-600 transition-colors">Terms & Conditions</button>
                  {' '}and{' '}
                  <button onClick={() => onNavigate('privacy-policy')} className="text-black underline font-medium hover:text-gray-600 transition-colors">Privacy Policy</button>.
                </label>
              </div>

              <div className="mt-12 flex items-center gap-4">
                <button onClick={() => setStep(1)} className="text-sm font-medium underline">Back</button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Summary */}
        <div className="lg:col-span-5">
          <div className="bg-gray-50 p-8 lg:p-12 sticky top-24">
            <h3 className="text-lg font-bold uppercase tracking-wide mb-8">Order Summary</h3>
            <div className="space-y-6 mb-8 max-h-96 overflow-y-auto pr-2">
              {items.map((item) => (
                <div key={`${item.id}-${item.selectedSize}`} className="flex gap-4">
                  <div className="w-16 h-20 bg-white flex-shrink-0">
                    <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium">{item.name}</h4>
                    <p className="text-xs text-gray-500 mt-1">Size: {item.selectedSize} / {item.selectedColor}</p>
                    <p className="text-xs text-gray-500 mt-1">Qty: {item.quantity}</p>
                  </div>
                  <span className="text-sm font-medium">KSH {(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-200 pt-6 space-y-3 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>KSH {subtotal.toLocaleString()}</span></div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>
                  {shipping === null 
                    ? <span className="text-gray-400 italic">Enter location</span> 
                    : (shipping === 0 ? 'Free' : `KSH ${shipping.toLocaleString()}`)}
                </span>
              </div>
              <div className="flex justify-between"><span>Tax</span><span>KSH {tax.toLocaleString()}</span></div>
              <div className="border-t border-gray-200 pt-4 flex justify-between text-lg font-bold">
                <span>Total</span><span>KSH {total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
