import {Suspense, useEffect, useState} from 'react';
import {Await, NavLink, useAsyncValue} from '@remix-run/react';
import {
  type CartViewPayload,
  useAnalytics,
  useOptimisticCart,
} from '@shopify/hydrogen';
import type {HeaderQuery, CartApiQueryFragment} from 'storefrontapi.generated';
import {useAside} from '~/components/Aside';
import {Menu, Search, ShoppingBag, User} from 'lucide-react';

interface HeaderProps {
  header: HeaderQuery;
  cart: Promise<CartApiQueryFragment | null>;
  isLoggedIn: Promise<boolean>;
  publicStoreDomain: string;
}

type Viewport = 'desktop' | 'mobile';

export function Header({
  header,
  isLoggedIn,
  cart,
  publicStoreDomain,
}: HeaderProps) {
  const {shop, menu} = header;

  const [isScrolled, setIscrolled] = useState(false);
  const [isScrollingUp, setIsScrollingUp] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const {type: asideType} = useAside();

  useEffect(() => {
    const root = document.documentElement;

    root.style.setProperty(
      '--announcement-height',
      isScrolled ? '0px' : '40px',
    );
    root.style.setProperty('--header-height', isScrolled ? '64px' : '80px');

    const handleScroll = () => {
      if (asideType !== 'closed') return;

      const currentScrollY = window.scrollY;

      setIsScrollingUp(currentScrollY < lastScrollY);
      setLastScrollY(currentScrollY);

      setIscrolled(currentScrollY > 50);
    };

    window.addEventListener('scroll', handleScroll, {passive: true});

    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY, isScrolled, asideType]);

  return (
    <header
      className={` fixed w-full transition-transform z-40 duration-500 ease-in-out ${!isScrollingUp && isScrolled && asideType === 'closed' ? '-translate-y-full' : 'translate-y-0'}`}
    >
      {/* --- Announcement Bar ---- */}
      <div
        className={`overflow-hidden transition-all duration-500 ${isScrolled ? 'max-0' : 'max-h-12'} bg-brand-green text-brand-creme`}
      >
        <div className={`container mx-auto text-center py-2.5 px-4`}>
          <p className="text-center leading-tight text-[13px] sm:text-sm">
            Complimentary Shipping on Orders above NGN 200,000,000
          </p>
        </div>
      </div>
      {/* --- Main Header ---- */}

      <header
        className={`transition-all duration-500 ease-in-out border-b ${isScrolled ? 'bg-white/80 backdrop-blur-lg shadow-sm border-transparent' : 'bg-white border-gray-100'}`}
      >
        <div className="container mx-auto">
          {/* ----- Mobile Logo (550px) ---- */}
          <div
            className={`hidden max-[550px]:block text-center border-gray-100 transition-all duration-300 ease-in-out ${isScrolled ? 'py-1' : 'py-2'}`}
          >
            <NavLink prefetch="intent" to={'/'} end className={`text-2xl`}>
              <h1 className="font-bold"> OOL Autos</h1>
            </NavLink>
          </div>

          {/* ----- Header Content ---- */}

          <div
            className={`flex items-center justify-between px-4 sm:px-6 transition duration-500 ${isScrolled ? 'py-3 sm:py-4' : 'py-4 sm:py-6'}`}
          >
            {/* ----- Menu Toggle ----- */}

            <div className={`lg:hidden`}>
              <HeaderMenuMobileToggle />
            </div>
            {/* ----- LG Screen Logo ----- */}
            <NavLink
              prefetch="intent"
              to={'/'}
              className={`text-center max-[550px]:hidden absolute left-1/2 -translate-x-1/2 lg:static lg:translate-x-0 lg:text-left transition-all duration-200 ease-in-out ${isScrolled ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-[28px]'}`}
            >
              <h1>OOL Autos</h1>
            </NavLink>

            {/* ------ Desktop Nav ------ */}

            <div className="hidden lg:block flex-1-px-12">
              <HeaderMenu
                menu={menu}
                viewport="desktop"
                primaryDomainUrl={header.shop.primaryDomain.url}
                publicStoreDomain={publicStoreDomain}
              />
            </div>

            {/* ---- CTAs ----- */}
            <div className="flex items-center">
              <HeaderCtas isLoggedIn={isLoggedIn} cart={cart} />
            </div>
          </div>
        </div>
      </header>
    </header>
  );
}

export function HeaderMenu({
  menu,
  primaryDomainUrl,
  viewport,
  publicStoreDomain,
}: {
  menu: HeaderProps['header']['menu'];
  primaryDomainUrl: HeaderProps['header']['shop']['primaryDomain']['url'];
  viewport: Viewport;
  publicStoreDomain: HeaderProps['publicStoreDomain'];
}) {
  const className = `header-menu-${viewport}`;
  const {close} = useAside();

  const baseClassName =
    "transition-all duration-200 hover:text-brand-green/60 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-brand-green/60 after:transition-all after:duration-300 hover:after:w-full";
  const desktopClassName =
    'flex items-center justify-center space-x-12 text-sm uppercase';
  const mobileClassName = 'flex flex-col px-6';

  return (
    <nav
      className={viewport === 'desktop' ? desktopClassName : mobileClassName}
      role="navigation"
    >
      {viewport === 'desktop' &&
        // ---Desktop Menu---
        menu?.items.map((item) => {
          if (!item.url) return null;
          const url =
            item.url.includes('myshopify.com') ||
            item.url.includes(publicStoreDomain) ||
            item.url.includes(primaryDomainUrl)
              ? new URL(item.url).pathname
              : item.url;
          return (
            <NavLink
              className={({isActive}) =>
                `${baseClassName} ${isActive ? 'text-brand-green/60' : 'text-brand-green'}`
              }
              end
              key={item.id}
              onClick={close}
              prefetch="intent"
              to={url}
            >
              {item.title}
            </NavLink>
          );
        })}

      {viewport === 'mobile' && (
        <>
          {/* ----Mobile Nav Links --- */}

          <div className="space-y-6 py-4">
            {menu?.items.map((item) => {
              if (!item.url) return null;
              const url =
                item.url.includes('myshopify.com') ||
                item.url.includes(publicStoreDomain) ||
                item.url.includes(primaryDomainUrl)
                  ? new URL(item.url).pathname
                  : item.url;

              return (
                <NavLink
                  className={({isActive}) =>
                    `${baseClassName} text-lg py-2 block ${isActive ? 'text-brand-green/60' : 'text-brand-green'}`
                  }
                  end
                  key={item.id}
                  onClick={close}
                  prefetch="intent"
                  to={url}
                >
                  {item.title}
                </NavLink>
              );
            })}
          </div>
          {/* ----Mobile Footer Links --- */}

          <div className={`mt-auto border-t border-gray-100 py-6`}>
            <div className="space-y-4">
              <NavLink
                to={'/account'}
                className={`flex items-center space-x-2 text-brand-green hover:text-brand-green/60`}
              >
                <User className="w-5 h-5" />
                <span className="text-base">Account</span>
              </NavLink>

              <button
                onClick={() => {
                  close();
                }}
                className="flex items-center space-x-2 text-brand-green hover:text-brand-green/80 w-fit"
              >
                <Search className="w-5 h-5" />
                <span className="text-base">Search</span>
              </button>
            </div>
          </div>
        </>
      )}
    </nav>
  );
}

function HeaderCtas({
  isLoggedIn,
  cart,
}: Pick<HeaderProps, 'isLoggedIn' | 'cart'>) {
  return (
    <nav
      className="flex items-center space-x-2 sm:space-x-3 lg:space-x-8"
      role="navigation"
    >
      <SearchToggle />
      <NavLink
        prefetch="intent"
        to={'/account'}
        className={`hover:text-brand-green/60 transition-all duration-200 p-2 relative  after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-brand-green/60 after:transition-all after:duration-300 hover:after:w-full`}
      >
        <span className="sr-only">Account</span>
        <User className="w-5 h-5" />
      </NavLink>
      <CartToggle cart={cart} />
    </nav>
  );
}

function HeaderMenuMobileToggle() {
  const {open} = useAside();
  return (
    <button
      className={`p-2 -ml-2 hover:text-brand-green transition-colors duration-200`}
      onClick={() => open('mobile')}
    >
      <Menu className={`w-5 h-5`} />
    </button>
  );
}

function SearchToggle() {
  const {open} = useAside();
  return (
    <button
      className="p-2 hover:text-brand-green/60 transition-colors duration-200 relative  after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-brand-green/60 after:transition-all after:duration-300 hover:after:w-full"
      onClick={() => open('search')}
    >
      <Search className="w-5 h-5" />
    </button>
  );
}

function CartBadge({count}: {count: number | null}) {
  const {open} = useAside();
  const {publish, shop, cart, prevCart} = useAnalytics();

  return (
    <button
      className="relative p-2 hover:text-brand-green/60 transition-colors duration-200 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-brand-green/60 after:transition-all after:duration-300 hover:after:w-full"
      onClick={() => {
        open('cart');
        publish('cart_viewed', {
          cart,
          prevCart,
          shop,
          url: window.location.href || '',
        });
      }}
    >
      <ShoppingBag className="w-5 h-5" />
      {count !== null && count > 0 && (
        <span className="absolute top-1 right-1 bg-brand-green text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-medium">
          {count > 9 ? `9+` : count}
        </span>
      )}
    </button>
  );
}

function CartToggle({cart}: Pick<HeaderProps, 'cart'>) {
  return (
    <Suspense fallback={<CartBadge count={null} />}>
      <Await resolve={cart}>
        <CartBanner />
      </Await>
    </Suspense>
  );
}

function CartBanner() {
  const originalCart = useAsyncValue() as CartApiQueryFragment | null;
  const cart = useOptimisticCart(originalCart);
  return <CartBadge count={cart?.totalQuantity ?? 0} />;
}
