import {Link} from '@remix-run/react'; // Importing Link component from Remix for navigation.
import {type VariantOption, VariantSelector} from '@shopify/hydrogen'; // Importing types and components for variant selection from Shopify's Hydrogen framework.
import type {
  ProductFragment,
  ProductVariantFragment,
} from 'storefrontapi.generated'; // Importing types for product and product variant fragments.
import {AddToCartButton} from '~/components/AddToCartButton'; // Importing the AddToCartButton component for adding items to the cart.
import {useAside} from '~/components/Aside'; // Importing custom hook to manage aside components (e.g., cart).

/**
 * ProductForm component renders the product selection form.
 * It includes variant selection and an add-to-cart button.
 */
export function ProductForm({
  product, // Product data passed as a prop.
  selectedVariant, // The currently selected variant of the product.
  variants, // Array of available product variants.
}: {
  product: ProductFragment; // Type definition for product.
  selectedVariant: ProductFragment['selectedVariant']; // Type for the selected variant.
  variants: Array<ProductVariantFragment>; // Array of product variant fragments.
}) {
  const {open} = useAside(); // Using custom hook to get the open function for the aside component.
  
  return (
    <div className="product-form">
      {/* VariantSelector component to handle the selection of product variants */}
      <VariantSelector
        handle={product.handle} // Product handle for identification.
        options={product.options.filter((option) => option.values.length > 1)} // Filtering options to show only those with multiple values.
        variants={variants} // Passing available variants.
      >
        {/* Render each option using the ProductOptions component */}
        {({option}) => <ProductOptions key={option.name} option={option} />}
      </VariantSelector>
      <br />
      {/* AddToCartButton component for adding the selected variant to the cart */}
      <AddToCartButton
        disabled={!selectedVariant || !selectedVariant.availableForSale} // Disable button if no variant is selected or if it is sold out.
        onClick={() => {
          open('cart'); // Open the cart aside when the button is clicked.
        }}
        lines={
          selectedVariant
            ? [
                {
                  merchandiseId: selectedVariant.id, // ID of the selected variant.
                  quantity: 1, // Quantity to add to the cart.
                  selectedVariant, // The selected variant object.
                },
              ]
            : [] // If no selected variant, return an empty array.
        }
      >
        {selectedVariant?.availableForSale ? 'Add to cart' : 'Sold out'} 
        {/* Button text based on variant availability */}
      </AddToCartButton>
    </div>
  );
}

/**
 * ProductOptions component renders the options for a specific variant.
 * It displays the name of the option and its available values.
 */
function ProductOptions({option}: {option: VariantOption}) {
  return (
    <div className="product-options" key={option.name}>
      <h5>{option.name}</h5> {/* Displaying the name of the variant option */}
      <div className="product-options-grid">
        {/* Mapping over the option values to create clickable links */}
        {option.values.map(({value, isAvailable, isActive, to}) => {
          return (
            <Link
              className="product-options-item" // Class for styling each option item.
              key={option.name + value} // Unique key for each link.
              prefetch="intent" // Prefetch the page when the link is hovered.
              preventScrollReset // Prevent scroll reset when navigating.
              replace // Replace the current entry in history instead of adding a new one.
              to={to} // Link destination for the variant option.
              style={{
                border: isActive ? '1px solid black' : '1px solid transparent', // Border styling based on active state.
                opacity: isAvailable ? 1 : 0.3, // Opacity based on availability.
              }}
            >
              {value} {/* Displaying the value of the variant option */}
            </Link>
          );
        })}
      </div>
      <br />
    </div>
  );
}
