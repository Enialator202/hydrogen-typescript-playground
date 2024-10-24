import {Await, Link} from '@remix-run/react';
// Await for handling promises in a Suspense component, Link for navigation between pages.

import {Suspense, useId} from 'react';
// Suspense is used to display fallback content while waiting for async data, useId generates a unique ID for components.

import type {
  CartApiQueryFragment,
  FooterQuery,
  HeaderQuery,
} from 'storefrontapi.generated';
// Type imports generated by GraphQL for the cart, footer, and header data structures.

import {Aside} from '~/components/Aside';
// Aside component handles displaying modal-like containers such as cart, search, and mobile menus.

import {Footer} from '~/components/Footer';
// Footer component which renders the footer section of the page.

import {Header, HeaderMenu} from '~/components/Header';
// Header component for the top navigation and branding, and HeaderMenu for the menu structure.

import {CartMain} from '~/components/CartMain';
// CartMain component to display the main content of the cart.

import {
  SEARCH_ENDPOINT,
  SearchFormPredictive,
} from '~/components/SearchFormPredictive';
// Predictive search components for handling search form input and displaying search results.

import {SearchResultsPredictive} from '~/components/SearchResultsPredictive';
// Component to display predictive search results based on user input.

interface PageLayoutProps {
  cart: Promise<CartApiQueryFragment | null>; // Async cart data, possibly null.
  footer: Promise<FooterQuery | null>; // Async footer data, possibly null.
  header: HeaderQuery; // Header data object.
  isLoggedIn: Promise<boolean>; // Async flag for user authentication status.
  publicStoreDomain: string; // The public domain of the store, used for URL handling.
  children?: React.ReactNode; // Optional children elements that will be displayed in the main content area.
}

export function PageLayout({
  cart,
  children = null,
  footer,
  header,
  isLoggedIn,
  publicStoreDomain,
}: PageLayoutProps) {
  return (
    <Aside.Provider>
      {/* Provider to handle the state of different Aside components like cart, search, and mobile menu */}
      
      {/* Cart modal/aside with cart data */}
      <CartAside cart={cart} />
      
      {/* Search modal/aside for predictive search */}
      <SearchAside />
      
      {/* Mobile menu aside for mobile navigation */}
      <MobileMenuAside header={header} publicStoreDomain={publicStoreDomain} />
      
      {/* Header at the top, passing header, cart, and login state */}
      {header && (
        <Header
          header={header}
          cart={cart}
          isLoggedIn={isLoggedIn}
          publicStoreDomain={publicStoreDomain}
        />
      )}
      
      {/* Main content area */}
      <main>{children}</main>
      
      {/* Footer at the bottom, passing footer, header, and public store domain */}
      <Footer
        footer={footer}
        header={header}
        publicStoreDomain={publicStoreDomain}
      />
    </Aside.Provider>
  );
}

function CartAside({cart}: {cart: PageLayoutProps['cart']}) {
  return (
    <Aside type="cart" heading="CART">
      {/* Cart content wrapped in a Suspense component, showing a loading message until cart data resolves */}
      <Suspense fallback={<p>Loading cart ...</p>}>
        <Await resolve={cart}>
          {(cart) => {
            return <CartMain cart={cart} layout="aside" />;
            // Render CartMain component with the resolved cart data, layout set to 'aside'.
          }}
        </Await>
      </Suspense>
    </Aside>
  );
}

function SearchAside() {
  const queriesDatalistId = useId(); 
  // Generates a unique ID for the datalist element in the search form.
  
  return (
    <Aside type="search" heading="SEARCH">
      <div className="predictive-search">
        <br />
        
        {/* Predictive search form */}
        <SearchFormPredictive>
          {({fetchResults, goToSearch, inputRef}) => (
            <>
              {/* Search input field, fetches results when typing or focusing on the field */}
              <input
                name="q"
                onChange={fetchResults}
                onFocus={fetchResults}
                placeholder="Search"
                ref={inputRef}
                type="search"
                list={queriesDatalistId}
              />
              &nbsp;
              {/* Search button that triggers full search results */}
              <button onClick={goToSearch}>Search</button>
            </>
          )}
        </SearchFormPredictive>

        {/* Display predictive search results */}
        <SearchResultsPredictive>
          {({items, total, term, state, closeSearch}) => {
            const {articles, collections, pages, products, queries} = items;

            // Show loading message when search is in progress
            if (state === 'loading' && term.current) {
              return <div>Loading...</div>;
            }

            // Show a message if no results are found
            if (!total) {
              return <SearchResultsPredictive.Empty term={term} />;
            }

            return (
              <>
                {/* Render queries (suggestions) for the search term */}
                <SearchResultsPredictive.Queries
                  queries={queries}
                  queriesDatalistId={queriesDatalistId}
                />
                
                {/* Render products, collections, pages, and articles found by the search */}
                <SearchResultsPredictive.Products
                  products={products}
                  closeSearch={closeSearch}
                  term={term}
                />
                <SearchResultsPredictive.Collections
                  collections={collections}
                  closeSearch={closeSearch}
                  term={term}
                />
                <SearchResultsPredictive.Pages
                  pages={pages}
                  closeSearch={closeSearch}
                  term={term}
                />
                <SearchResultsPredictive.Articles
                  articles={articles}
                  closeSearch={closeSearch}
                  term={term}
                />
                
                {/* If search term exists and there are total results, show link to view all results */}
                {term.current && total ? (
                  <Link
                    onClick={closeSearch}
                    to={`${SEARCH_ENDPOINT}?q=${term.current}`}
                  >
                    <p>
                      View all results for <q>{term.current}</q>
                      &nbsp; →
                    </p>
                  </Link>
                ) : null}
              </>
            );
          }}
        </SearchResultsPredictive>
      </div>
    </Aside>
  );
}

function MobileMenuAside({
  header,
  publicStoreDomain,
}: {
  header: PageLayoutProps['header']; // Header data for mobile menu.
  publicStoreDomain: PageLayoutProps['publicStoreDomain']; // Public domain used for URL handling.
}) {
  return (
    header.menu &&
    header.shop.primaryDomain?.url && (
      <Aside type="mobile" heading="MENU">
        {/* Render HeaderMenu component for mobile layout */}
        <HeaderMenu
          menu={header.menu}
          viewport="mobile"
          primaryDomainUrl={header.shop.primaryDomain.url}
          publicStoreDomain={publicStoreDomain}
        />
      </Aside>
    )
  );
}
