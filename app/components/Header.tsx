import {Suspense} from 'react';
// Suspense from React, used for handling async components and showing fallback content while waiting for data.

import {Await, NavLink, useAsyncValue} from '@remix-run/react';
// Await for handling promises within Suspense, NavLink for navigation, useAsyncValue for getting resolved async data.

import {
  type CartViewPayload,
  useAnalytics,
  useOptimisticCart,
} from '@shopify/hydrogen';
// Importing types and utilities from Shopify's Hydrogen framework.
// CartViewPayload is a type definition, useAnalytics for event tracking, useOptimisticCart for optimistic cart updates.

import type {HeaderQuery, CartApiQueryFragment} from 'storefrontapi.generated';
// Importing GraphQL-generated types for HeaderQuery and CartApiQueryFragment from the storefront API.

import {useAside} from '~/components/Aside';
// Custom hook, useAside, which is likely used to open or close a side navigation or modal.

interface HeaderProps {
  header: HeaderQuery; // Data for the header, containing shop and menu info.
  cart: Promise<CartApiQueryFragment | null>; // Async cart data, potentially null.
  isLoggedIn: Promise<boolean>; // Async flag indicating if the user is logged in.
  publicStoreDomain: string; // The public domain for the store, used for URL handling.
}

type Viewport = 'desktop' | 'mobile'; 
// Defines the viewport type, which determines if the menu is for desktop or mobile.

export function Header({
  header,
  isLoggedIn,
  cart,
  publicStoreDomain,
}: HeaderProps) {
  const {shop, menu} = header; // Destructuring shop and menu from header data.
  return (
    <header className="header">
      {/* Link to the homepage, displays the shop name */}
      <NavLink prefetch="intent" to="/" style={activeLinkStyle} end>
        <strong>{shop.name}</strong>
      </NavLink>

      {/* Render the header menu for desktop, passing in necessary props */}
      <HeaderMenu
        menu={menu}
        viewport="desktop"
        primaryDomainUrl={header.shop.primaryDomain.url}
        publicStoreDomain={publicStoreDomain}
      />

      {/* Render the call-to-actions section (e.g., account, cart, search) */}
      <HeaderCtas isLoggedIn={isLoggedIn} cart={cart} />
    </header>
  );
}

export function HeaderMenu({
  menu,
  primaryDomainUrl,
  viewport,
  publicStoreDomain,
}: {
  menu: HeaderProps['header']['menu']; // The menu data.
  primaryDomainUrl: HeaderProps['header']['shop']['primaryDomain']['url']; // The primary domain of the shop.
  viewport: Viewport; // Viewport type (desktop or mobile).
  publicStoreDomain: HeaderProps['publicStoreDomain']; // Public domain of the store.
}) {
  const className = `header-menu-${viewport}`; // Sets the CSS class based on the viewport.
  const {close} = useAside(); // Custom hook for closing the aside (likely a modal or navigation panel).

  return (
    <nav className={className} role="navigation">
      {/* If in mobile viewport, render a 'Home' link */}
      {viewport === 'mobile' && (
        <NavLink
          end
          onClick={close} // Close the mobile menu when clicking the link.
          prefetch="intent"
          style={activeLinkStyle}
          to="/"
        >
          Home
        </NavLink>
      )}

      {/* Render the menu items */}
      {(menu || FALLBACK_HEADER_MENU).items.map((item) => {
        if (!item.url) return null; // Skip items without a URL.

        // If the URL is internal, strip the domain and keep the path.
        const url =
          item.url.includes('myshopify.com') ||
          item.url.includes(publicStoreDomain) ||
          item.url.includes(primaryDomainUrl)
            ? new URL(item.url).pathname
            : item.url;

        return (
          <NavLink
            className="header-menu-item"
            end
            key={item.id}
            onClick={close} // Close the menu when an item is clicked.
            prefetch="intent"
            style={activeLinkStyle} // Apply style depending on active state.
            to={url} // Use the processed URL for the link.
          >
            {item.title}
          </NavLink>
        );
      })}
    </nav>
  );
}

function HeaderCtas({
  isLoggedIn,
  cart,
}: Pick<HeaderProps, 'isLoggedIn' | 'cart'>) {
  return (
    <nav className="header-ctas" role="navigation">
      {/* Mobile menu toggle button */}
      <HeaderMenuMobileToggle />

      {/* Account link, toggles between 'Sign in' and 'Account' based on login state */}
      <NavLink prefetch="intent" to="/account" style={activeLinkStyle}>
        <Suspense fallback="Sign in">
          <Await resolve={isLoggedIn} errorElement="Sign in">
          <svg className="account-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
          <path d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512l388.6 0c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304l-91.4 0z"/></svg>
          </Await>
        </Suspense>
      </NavLink>

      {/* Search button */}
      <SearchToggle />

      {/* Cart button */}
      <CartToggle cart={cart} />
    </nav>
  );
}

function HeaderMenuMobileToggle() {
  const {open} = useAside(); // Using useAside to open the mobile menu.
  return (
    <button
      className="header-menu-mobile-toggle reset"
      onClick={() => open('mobile')} // Opens the mobile menu when clicked.
    >
      <h3>☰</h3>
    </button>
  );
}

function SearchToggle() {
  const {open} = useAside(); // Using useAside to open the search.
  return (
    <button className="reset" onClick={() => open('search')}>
      <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
      <path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"/></svg>
    </button>
  );
}

function CartBadge({count}: {count: number | null}) {
  const {open} = useAside(); // Using useAside to open the cart.
  const {publish, shop, cart, prevCart} = useAnalytics(); // Use analytics for cart view tracking.

  return (
    <a
      className="cart-container"
      href="/cart"
      onClick={(e) => {
        e.preventDefault();
        open('cart'); // Open cart modal when clicked.
        publish('cart_viewed', {
          cart,
          prevCart,
          shop,
          url: window.location.href || '', // Publish analytics event.
        } as CartViewPayload);
      }}
    >
      <svg className="cart-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M0 24C0 10.7 10.7 0 24 0L69.5 0c22 0 41.5 12.8 50.6 32l411 0c26.3 0 45.5 25 38.6 50.4l-41 152.3c-8.5 31.4-37 53.3-69.5 53.3l-288.5 0 5.4 28.5c2.2 11.3 12.1 19.5 23.6 19.5L488 336c13.3 0 24 10.7 24 24s-10.7 24-24 24l-288.3 0c-34.6 0-64.3-24.6-70.7-58.5L77.4 54.5c-.7-3.8-4-6.5-7.9-6.5L24 48C10.7 48 0 37.3 0 24zM128 464a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zm336-48a48 48 0 1 1 0 96 48 48 0 1 1 0-96z"/></svg>
      <p className="cart-badge">
        {count === null ? <span>&nbsp;</span> : count} {/* Display cart item count */}
      </p>
    </a>
  );
}

function CartToggle({cart}: Pick<HeaderProps, 'cart'>) {
  return (
    <Suspense fallback={<CartBadge count={null} />}> {/* Fallback shows empty cart badge */}
      <Await resolve={cart}>
        <CartBanner /> {/* Show cart content when resolved */}
      </Await>
    </Suspense>
  );
}

function CartBanner() {
  const originalCart = useAsyncValue() as CartApiQueryFragment | null; // Async value from cart.
  const cart = useOptimisticCart(originalCart); // Use optimistic cart to handle cart changes.
  return <CartBadge count={cart?.totalQuantity ?? 0} />; // Show total item count in the cart.
}

const FALLBACK_HEADER_MENU = {
  id: 'gid://shopify/Menu/199655587896',
  items: [
    {
      id: 'gid://shopify/MenuItem/461609500728',
      resourceId: null,
      tags: [],
      title: 'Collections',
      type: 'HTTP',
      url: '/collections',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609533496',
      resourceId: null,
      tags: [],
      title: 'Blog',
      type: 'HTTP',
      url: '/blogs/journal',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609566264',
      resourceId: null,
      tags: [],
      title: 'Policies',
      type: 'HTTP',
      url: '/policies',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609599032',
      resourceId: 'gid://shopify/Page/92591030328',
      tags: [],
      title: 'About',
      type: 'PAGE',
      url: '/pages/about',
      items: [],
    },
  ],
};

function activeLinkStyle({
  isActive,
  isPending,
}: {
  isActive: boolean;
  isPending: boolean;
}) {
  return {
    fontWeight: isActive ? 'bold' : undefined,
    color: isPending ? 'grey' : 'black',
  };
}
