import {Money} from '@shopify/hydrogen'; 
// Importing the Money component from Shopify's Hydrogen framework to format and display money values.

import type {MoneyV2} from '@shopify/hydrogen/storefront-api-types'; 
// Importing the MoneyV2 type from the Shopify Hydrogen Storefront API. This represents the price structure.

interface ProductPriceProps {
  price?: MoneyV2; // Optional prop for the product's regular price.
  compareAtPrice?: MoneyV2 | null; // Optional prop for the product's "compare at" price (the original price before any discount).
}

/**
 * ProductPrice component is responsible for displaying the product's price.
 * If a "compare at" price is provided, it shows both the regular and discounted prices.
 * If no "compare at" price is available, it only shows the regular price.
 */
export function ProductPrice({
  price, // The product's regular price.
  compareAtPrice, // The product's "compare at" price (if the product is on sale).
}: ProductPriceProps) {
  return (
    <div className="product-price">
      
      {/* Check if a compareAtPrice is provided. If so, show the product as being on sale. */}
      {compareAtPrice ? (
        <div className="product-price-on-sale">
          {/* If a regular price is provided, display it using the Money component. */}
          {price ? <Money data={price} /> : null}

          {/* Display the compareAtPrice as the original price, using the <s> tag to indicate it's crossed out. */}
          <s>
            <Money data={compareAtPrice} />
          </s>
        </div>
      ) : price ? (
        /* If no compareAtPrice is provided, simply display the regular price. */
        <Money data={price} />
      ) : (
        /* If no price is available, render a non-breaking space to maintain layout structure. */
        <span>&nbsp;</span>
      )}
    </div>
  );
}
