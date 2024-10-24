import {Suspense} from 'react';
// Importing `Suspense` from React, which allows for asynchronous data to be rendered once it's resolved.

import {Await, NavLink} from '@remix-run/react';
// Importing `Await` for handling promises in suspense boundaries and `NavLink` for navigation in Remix.

import type {FooterQuery, HeaderQuery} from 'storefrontapi.generated';
// Importing TypeScript types for `FooterQuery` and `HeaderQuery`, generated from the Shopify Storefront API.

/**
 * Footer component that displays the footer menu.
 * @param footerPromise - A Promise that resolves with the footer data.
 * @param header - The header data containing shop details (e.g., primary domain).
 * @param publicStoreDomain - The public domain of the store, used for link processing.
 */
interface FooterProps {
  footer: Promise<FooterQuery | null>; // The footer data is fetched asynchronously, hence a promise.
  header: HeaderQuery;                 // The header data, already resolved.
  publicStoreDomain: string;           // The public domain of the store for comparing link URLs.
}

export function Footer({
  footer: footerPromise,
  header,
  publicStoreDomain,
}: FooterProps) {
  return (
    <Suspense>
      <Await resolve={footerPromise}>
        {/* Await resolves the promise containing the footer data */}
        {(footer) => (
          <footer className="footer">
            {/* If footer data and shop domain exist, render the footer menu */}
            {footer?.menu && header.shop.primaryDomain?.url && (
              <FooterMenu
                menu={footer.menu}
                primaryDomainUrl={header.shop.primaryDomain.url}
                publicStoreDomain={publicStoreDomain}
              />
            )}
          </footer>
        )}
      </Await>
    </Suspense>
  );
}

/**
 * FooterMenu component that renders a navigation menu in the footer.
 * @param menu - The menu items from the footer data.
 * @param primaryDomainUrl - The shop's primary domain, used to strip internal links.
 * @param publicStoreDomain - The public domain of the store for URL comparisons.
 */
function FooterMenu({
  menu,
  primaryDomainUrl,
  publicStoreDomain,
}: {
  menu: FooterQuery['menu'];
  primaryDomainUrl: FooterProps['header']['shop']['primaryDomain']['url'];
  publicStoreDomain: string;
}) {
  return (
    <nav className="footer-menu" role="navigation">
      {(menu || FALLBACK_FOOTER_MENU).items.map((item) => {
        if (!item.url) return null; // Skip items without a valid URL.
        
        // If the URL is internal (contains the store domain), strip the domain and use only the path.
        const url =
          item.url.includes('myshopify.com') ||
          item.url.includes(publicStoreDomain) ||
          item.url.includes(primaryDomainUrl)
            ? new URL(item.url).pathname
            : item.url;
        
        const isExternal = !url.startsWith('/'); // Determine if the link is external.

        // Render external links with target="_blank", internal links using `NavLink`.
        return isExternal ? (
          <a href={url} key={item.id} rel="noopener noreferrer" target="_blank">
            {item.title}
          </a>
        ) : (
          <NavLink
            end
            key={item.id}
            prefetch="intent" // Prefetch the route on intent.
            style={activeLinkStyle} // Apply active/pending styles.
            to={url}
          >
            {item.title}
          </NavLink>
        );
      })}
    </nav>
  );
}

// Fallback menu items to be used if no menu data is available from the footer query.
const FALLBACK_FOOTER_MENU = {
  id: 'gid://shopify/Menu/199655620664',
  items: [
    {
      id: 'gid://shopify/MenuItem/461633060920',
      resourceId: 'gid://shopify/ShopPolicy/23358046264',
      tags: [],
      title: 'Privacy Policy',
      type: 'SHOP_POLICY',
      url: '/policies/privacy-policy',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461633093688',
      resourceId: 'gid://shopify/ShopPolicy/23358013496',
      tags: [],
      title: 'Refund Policy',
      type: 'SHOP_POLICY',
      url: '/policies/refund-policy',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461633126456',
      resourceId: 'gid://shopify/ShopPolicy/23358111800',
      tags: [],
      title: 'Shipping Policy',
      type: 'SHOP_POLICY',
      url: '/policies/shipping-policy',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461633159224',
      resourceId: 'gid://shopify/ShopPolicy/23358079032',
      tags: [],
      title: 'Terms of Service',
      type: 'SHOP_POLICY',
      url: '/policies/terms-of-service',
      items: [],
    },
  ],
};

/**
 * A helper function to apply styling for active and pending states on links.
 * @param isActive - Whether the link is currently active (matches the current URL).
 * @param isPending - Whether the link is pending navigation.
 * @returns A style object adjusting font weight and color based on state.
 */
function activeLinkStyle({
  isActive,
  isPending,
}: {
  isActive: boolean;
  isPending: boolean;
}) {
  return {
    fontWeight: isActive ? 'bold' : undefined, // Bold text for active links.
    color: isPending ? 'grey' : 'white',       // Grey text while pending, otherwise white.
  };
}
