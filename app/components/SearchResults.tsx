import {Link} from '@remix-run/react';
// Importing the `Link` component from Remix to handle navigation.

import {Image, Money, Pagination} from '@shopify/hydrogen';
// Importing components from Shopify's Hydrogen framework: `Image` for rendering product images, 
// `Money` for displaying formatted prices, and `Pagination` for paginating results.

import {urlWithTrackingParams, type RegularSearchReturn} from '~/lib/search';
// Importing a utility function `urlWithTrackingParams` to generate URLs with tracking parameters, 
// and the type `RegularSearchReturn` that likely represents the structure of search results.

type SearchItems = RegularSearchReturn['result']['items'];
// Extracting the `items` type from the search result object, representing the structure of individual search results.

type PartialSearchResult<ItemType extends keyof SearchItems> = Pick<
  SearchItems,
  ItemType
> & Pick<RegularSearchReturn, 'term'>;
// Defining a type for partial search results that includes a specific subset of search items (e.g., articles, pages, products)
// and the search `term`.

type SearchResultsProps = RegularSearchReturn & {
  children: (args: SearchItems & {term: string}) => React.ReactNode;
};
// Defining the prop types for the `SearchResults` component. It extends the `RegularSearchReturn` type and expects 
// a `children` function that receives search items and the search `term` as arguments.

export function SearchResults({
  term,
  result,
  children,
}: Omit<SearchResultsProps, 'error' | 'type'>) {
  // Destructuring `term`, `result`, and `children` from the `SearchResultsProps`, while omitting `error` and `type`.

  if (!result?.total) {
    // If there are no search results, return `null` (nothing is rendered).
    return null;
  }

  // Passing the search `items` and `term` to the `children` function, allowing the parent to render based on these values.
  return children({...result.items, term});
}

// Attaching specific search result handlers as properties of `SearchResults`.
SearchResults.Articles = SearchResultsArticles;
SearchResults.Pages = SearchResultsPages;
SearchResults.Products = SearchResultsProducts;
SearchResults.Empty = SearchResultsEmpty;
// Each of these handlers (`Articles`, `Pages`, `Products`, `Empty`) represents a different type of search result.

function SearchResultsArticles({
  term,
  articles,
}: PartialSearchResult<'articles'>) {
  // The `SearchResultsArticles` component handles rendering article search results.
  // It expects the search `term` and an array of `articles`.

  if (!articles?.nodes.length) {
    // If there are no articles, return `null` (nothing is rendered).
    return null;
  }

  // Rendering the articles list.
  return (
    <div className="search-result">
      <h2>Articles</h2>
      <div>
        {articles?.nodes?.map((article) => {
          // For each article, generate a URL with tracking parameters using `urlWithTrackingParams`.
          const articleUrl = urlWithTrackingParams({
            baseUrl: `/blogs/${article.handle}`,
            trackingParams: article.trackingParameters,
            term,
          });

          // Render each article as a link.
          return (
            <div className="search-results-item" key={article.id}>
              <Link prefetch="intent" to={articleUrl}>
                {article.title}
              </Link>
            </div>
          );
        })}
      </div>
      <br />
    </div>
  );
}

function SearchResultsPages({term, pages}: PartialSearchResult<'pages'>) {
  // The `SearchResultsPages` component handles rendering page search results.
  // It expects the search `term` and an array of `pages`.

  if (!pages?.nodes.length) {
    // If there are no pages, return `null`.
    return null;
  }

  // Rendering the pages list.
  return (
    <div className="search-result">
      <h2>Pages</h2>
      <div>
        {pages?.nodes?.map((page) => {
          // Generate a URL for each page using `urlWithTrackingParams`.
          const pageUrl = urlWithTrackingParams({
            baseUrl: `/pages/${page.handle}`,
            trackingParams: page.trackingParameters,
            term,
          });

          // Render each page as a link.
          return (
            <div className="search-results-item" key={page.id}>
              <Link prefetch="intent" to={pageUrl}>
                {page.title}
              </Link>
            </div>
          );
        })}
      </div>
      <br />
    </div>
  );
}

function SearchResultsProducts({
  term,
  products,
}: PartialSearchResult<'products'>) {
  // The `SearchResultsProducts` component handles rendering product search results.
  // It expects the search `term` and an array of `products`.

  if (!products?.nodes.length) {
    // If there are no products, return `null`.
    return null;
  }

  // Rendering the products list with pagination.
  return (
    <div className="search-result">
      <h2>Products</h2>
      <Pagination connection={products}>
        {({nodes, isLoading, NextLink, PreviousLink}) => {
          // For each product, generate a URL and render the product details (image, title, price).
          const ItemsMarkup = nodes.map((product) => {
            const productUrl = urlWithTrackingParams({
              baseUrl: `/products/${product.handle}`,
              trackingParams: product.trackingParameters,
              term,
            });

            return (
              <div className="search-results-item" key={product.id}>
                <Link prefetch="intent" to={productUrl}>
                  {product.variants.nodes[0].image && (
                    <Image
                      data={product.variants.nodes[0].image}
                      alt={product.title}
                      width={50}
                    />
                  )}
                  <div>
                    <p>{product.title}</p>
                    <small>
                      <Money data={product.variants.nodes[0].price} />
                    </small>
                  </div>
                </Link>
              </div>
            );
          });

          return (
            <div>
              {/* Render the "Load previous" and "Load more" buttons for pagination, showing a loading state if applicable. */}
              <div>
                <PreviousLink>
                  {isLoading ? 'Loading...' : <span>↑ Load previous</span>}
                </PreviousLink>
              </div>
              <div>
                {ItemsMarkup}
                <br />
              </div>
              <div>
                <NextLink>
                  {isLoading ? 'Loading...' : <span>Load more ↓</span>}
                </NextLink>
              </div>
            </div>
          );
        }}
      </Pagination>
      <br />
    </div>
  );
}

function SearchResultsEmpty() {
  // This component renders when no search results are found.
  return <p>No results, try a different search.</p>;
}
