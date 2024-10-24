import { Link, useFetcher, type Fetcher } from '@remix-run/react'; // Importing Link for navigation and useFetcher for data fetching
import { Image, Money } from '@shopify/hydrogen'; // Importing Image and Money components from Shopify Hydrogen
import React, { useRef, useEffect } from 'react'; // Importing necessary React hooks
import {
  getEmptyPredictiveSearchResult, // Function to get an empty predictive search result
  urlWithTrackingParams, // Function to construct URLs with tracking parameters
  type PredictiveSearchReturn, // Type definition for predictive search return
} from '~/lib/search'; // Importing custom search library
import { useAside } from './Aside'; // Custom hook to manage aside component visibility

// Type definition for predictive search items
type PredictiveSearchItems = PredictiveSearchReturn['result']['items'];

// Type definition for the return value of usePredictiveSearch hook
type UsePredictiveSearchReturn = {
  term: React.MutableRefObject<string>; // Reference to the search term input
  total: number; // Total number of items found
  inputRef: React.MutableRefObject<HTMLInputElement | null>; // Reference to the search input element
  items: PredictiveSearchItems; // Items returned from the predictive search
  fetcher: Fetcher<PredictiveSearchReturn>; // Fetcher for managing data fetching
};

// Type definition for arguments passed to search results predictive component
type SearchResultsPredictiveArgs = Pick<
  UsePredictiveSearchReturn,
  'term' | 'total' | 'inputRef' | 'items' // Selecting relevant properties from UsePredictiveSearchReturn
> & {
  state: Fetcher['state']; // Fetcher state (e.g., loading, idle)
  closeSearch: () => void; // Function to close the search results
};

// Type definition for partial predictive search results
type PartialPredictiveSearchResult<
  ItemType extends keyof PredictiveSearchItems,
  ExtraProps extends keyof SearchResultsPredictiveArgs = 'term' | 'closeSearch',
> = Pick<PredictiveSearchItems, ItemType> & // Selecting specific item types
  Pick<SearchResultsPredictiveArgs, ExtraProps>; // Adding additional properties

// Type definition for the search results predictive component props
type SearchResultsPredictiveProps = {
  children: (args: SearchResultsPredictiveArgs) => React.ReactNode; // Render prop pattern for children
};

/**
 * Component that renders predictive search results
 */
export function SearchResultsPredictive({
  children,
}: SearchResultsPredictiveProps) {
  const aside = useAside(); // Get the aside context to manage search results
  const { term, inputRef, fetcher, total, items } = usePredictiveSearch(); // Custom hook to fetch predictive search results

  /*
   * Utility function that resets the search input field
   */
  function resetInput() {
    if (inputRef.current) {
      inputRef.current.blur(); // Remove focus from the input field
      inputRef.current.value = ''; // Clear the input field value
    }
  }

  /**
   * Utility function that resets the search input and closes the search aside
   */
  function closeSearch() {
    resetInput(); // Call the resetInput function
    aside.close(); // Close the aside component
  }

  // Render the children with the relevant arguments
  return children({
    items, // List of items found
    closeSearch, // Function to close the search
    inputRef, // Reference to the input field
    state: fetcher.state, // Current state of the fetcher
    term, // Current search term
    total, // Total number of results found
  });
}

// Export subcomponents for specific types of results
SearchResultsPredictive.Articles = SearchResultsPredictiveArticles;
SearchResultsPredictive.Collections = SearchResultsPredictiveCollections;
SearchResultsPredictive.Pages = SearchResultsPredictivePages;
SearchResultsPredictive.Products = SearchResultsPredictiveProducts;
SearchResultsPredictive.Queries = SearchResultsPredictiveQueries;
SearchResultsPredictive.Empty = SearchResultsPredictiveEmpty;

/**
 * Component to render articles in the predictive search results
 */
function SearchResultsPredictiveArticles({
  term,
  articles,
  closeSearch,
}: PartialPredictiveSearchResult<'articles'>) {
  if (!articles.length) return null; // Return null if there are no articles

  return (
    <div className="predictive-search-result" key="articles">
      <h5>Articles</h5>
      <ul>
        {articles.map((article) => { // Map over the list of articles
          const articleUrl = urlWithTrackingParams({
            baseUrl: `/blogs/${article.blog.handle}/${article.handle}`, // Construct URL for the article
            trackingParams: article.trackingParameters, // Get tracking parameters
            term: term.current ?? '', // Current search term
          });

          return (
            <li className="predictive-search-result-item" key={article.id}>
              <Link onClick={closeSearch} to={articleUrl}> {/* Link to the article */}
                {article.image?.url && ( // Check if the article has an image
                  <Image
                    alt={article.image.altText ?? ''} // Alt text for the image
                    src={article.image.url} // Image URL
                    width={50} // Set image width
                    height={50} // Set image height
                  />
                )}
                <div>
                  <span>{article.title}</span> {/* Render article title */}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/**
 * Component to render collections in the predictive search results
 */
function SearchResultsPredictiveCollections({
  term,
  collections,
  closeSearch,
}: PartialPredictiveSearchResult<'collections'>) {
  if (!collections.length) return null; // Return null if there are no collections

  return (
    <div className="predictive-search-result" key="collections">
      <h5>Collections</h5>
      <ul>
        {collections.map((collection) => { // Map over the list of collections
          const collectionUrl = urlWithTrackingParams({
            baseUrl: `/collections/${collection.handle}`, // Construct URL for the collection
            trackingParams: collection.trackingParameters, // Get tracking parameters
            term: term.current, // Current search term
          });

          return (
            <li className="predictive-search-result-item" key={collection.id}>
              <Link onClick={closeSearch} to={collectionUrl}> {/* Link to the collection */}
                {collection.image?.url && ( // Check if the collection has an image
                  <Image
                    alt={collection.image.altText ?? ''} // Alt text for the image
                    src={collection.image.url} // Image URL
                    width={50} // Set image width
                    height={50} // Set image height
                  />
                )}
                <div>
                  <span>{collection.title}</span> {/* Render collection title */}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/**
 * Component to render pages in the predictive search results
 */
function SearchResultsPredictivePages({
  term,
  pages,
  closeSearch,
}: PartialPredictiveSearchResult<'pages'>) {
  // If there are no pages, return null (nothing to render)
  if (!pages.length) return null;

  return (
    <div className="predictive-search-result" key="pages">
      <h5>Pages</h5> {/* Header for the pages section */}
      <ul>
        {pages.map((page) => { // Map over the list of pages
          const pageUrl = urlWithTrackingParams({
            baseUrl: `/pages/${page.handle}`, // Construct the URL for the page
            trackingParams: page.trackingParameters, // Add tracking parameters
            term: term.current, // Current search term
          });

          return (
            <li className="predictive-search-result-item" key={page.id}> {/* List item for each page */}
              <Link onClick={closeSearch} to={pageUrl}> {/* Link to the page, closing search on click */}
                <div>
                  <span>{page.title}</span> {/* Display the page title */}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/**
 * Component to render products in the predictive search results
 */
function SearchResultsPredictiveProducts({
  term,
  products,
  closeSearch,
}: PartialPredictiveSearchResult<'products'>) {
  // If there are no products, return null (nothing to render)
  if (!products.length) return null;

  return (
    <div className="predictive-search-result" key="products">
      <h5>Products</h5> {/* Header for the products section */}
      <ul>
        {products.map((product) => { // Map over the list of products
          const productUrl = urlWithTrackingParams({
            baseUrl: `/products/${product.handle}`, // Construct the URL for the product
            trackingParams: product.trackingParameters, // Add tracking parameters
            term: term.current, // Current search term
          });

          // Get the first image variant if available
          const image = product?.variants?.nodes?.[0].image;
          return (
            <li className="predictive-search-result-item" key={product.id}> {/* List item for each product */}
              <Link to={productUrl} onClick={closeSearch}> {/* Link to the product, closing search on click */}
                {image && ( // Check if the product has an image
                  <Image
                    alt={image.altText ?? ''} // Alt text for the image
                    src={image.url} // Source URL for the image
                    width={50} // Width for the image
                    height={50} // Height for the image
                  />
                )}
                <div>
                  <p>{product.title}</p> {/* Display the product title */}
                  <small>
                    {product?.variants?.nodes?.[0].price && ( // Check if there is a price
                      <Money data={product.variants.nodes[0].price} /> // Render price
                    )}
                  </small>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/**
 * Component to render query suggestions in a datalist for the predictive search
 */
function SearchResultsPredictiveQueries({
  queries,
  queriesDatalistId,
}: PartialPredictiveSearchResult<'queries', never> & {
  queriesDatalistId: string; // ID for the datalist element
}) {
  // If there are no queries, return null (nothing to render)
  if (!queries.length) return null;

  return (
    <datalist id={queriesDatalistId}> {/* Datalist element for query suggestions */}
      {queries.map((suggestion) => {
        if (!suggestion) return null; // Skip if suggestion is null

        return <option key={suggestion.text} value={suggestion.text} />; // Render each suggestion as an option
      })}
    </datalist>
  );
}

/**
 * Component to display a message when no search results are found
 */
function SearchResultsPredictiveEmpty({
  term,
}: {
  term: React.MutableRefObject<string>; // Reference to the current search term
}) {
  // If the search term is empty, return null (no message to display)
  if (!term.current) {
    return null;
  }

  return (
    <p>
      No results found for <q>{term.current}</q> {/* Display no results message with the search term */}
    </p>
  );
}

/**
 * Hook that returns the predictive search results, fetcher, and input ref.
 * @example
 * '''ts
 * const { items, total, inputRef, term, fetcher } = usePredictiveSearch();
 * '''
 **/
function usePredictiveSearch(): UsePredictiveSearchReturn {
  // Initialize the fetcher for retrieving predictive search data
  const fetcher = useFetcher<PredictiveSearchReturn>({ key: 'search' });
  const term = useRef<string>(''); // Mutable reference for the search term
  const inputRef = useRef<HTMLInputElement | null>(null); // Mutable reference for the search input element

  // If the fetcher is in the loading state, update the current search term
  if (fetcher?.state === 'loading') {
    term.current = String(fetcher.formData?.get('q') || ''); // Get the search term from the form data
  }

  // Capture the search input element as a ref
  useEffect(() => {
    if (!inputRef.current) {
      inputRef.current = document.querySelector('input[type="search"]'); // Query for the search input element
    }
  }, []);

  // Get items and total from the fetcher's data or return an empty search result
  const { items, total } =
    fetcher?.data?.result ?? getEmptyPredictiveSearchResult();

  return { items, total, inputRef, term, fetcher }; // Return the values for usePredictiveSearch
}
