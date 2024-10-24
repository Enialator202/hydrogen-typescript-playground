import type {ProductVariantFragment} from 'storefrontapi.generated'; 
// Importing the type definition for ProductVariantFragment, which includes the product image data structure.

import {Image} from '@shopify/hydrogen'; 
// Importing the Image component from Shopify's Hydrogen framework for rendering responsive images.

/**
 * ProductImage component is responsible for rendering a product's image.
 * It checks if an image is provided, and if so, it displays the image using the Hydrogen Image component.
 * Otherwise, it renders an empty div with a "product-image" class.
 */
export function ProductImage({
  image, // The image prop contains data related to the product variant's image.
}: {
  image: ProductVariantFragment['image']; // The type of the image is derived from ProductVariantFragment.
}) {
  
  // If no image is available, return an empty div with the "product-image" class.
  if (!image) {
    return <div className="product-image" />;
  }

  // If an image is available, render the image inside a div with the "product-image" class.
  return (
    <div className="product-image">
      <Image
        alt={image.altText || 'Product Image'} // Provide alt text for accessibility. Use provided altText or default to 'Product Image'.
        aspectRatio="1/1" // Set the aspect ratio of the image to be square (1:1).
        data={image} // Pass the image data to the Image component.
        key={image.id} // Use the image ID as the key for rendering the component.
        sizes="(min-width: 45em) 50vw, 100vw" 
        // Set the responsive sizes attribute: 50% of the viewport width for screens wider than 45em, otherwise 100%.
      />
    </div>
  );
}
