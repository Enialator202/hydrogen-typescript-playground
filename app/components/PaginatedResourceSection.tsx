import * as React from 'react'; // Importing React library to create components.
import {Pagination} from '@shopify/hydrogen'; // Importing Pagination component from Shopify's Hydrogen framework.

/**
 * <PaginatedResourceSection> is a component that encapsulates how the previous and next behaviors throughout your application.
 * It provides a structure for paginating through a list of resources, allowing users to navigate between pages of items.
 */

export function PaginatedResourceSection<NodesType>({
  connection, // Connection prop that contains pagination data and node information.
  children, // Function that renders child components for each node, receiving the node and its index.
  resourcesClassName, // Optional className for styling the resources container.
}: {
  connection: React.ComponentProps<typeof Pagination<NodesType>>['connection']; // Type for connection, based on Pagination component's props.
  children: React.FunctionComponent<{node: NodesType; index: number}>; // Function type for rendering child components with node and index.
  resourcesClassName?: string; // Optional string for additional class names for styling.
}) {
  return (
    <Pagination connection={connection}>
      {/* Pagination component takes in the connection prop for managing pagination */}
      {({nodes, isLoading, PreviousLink, NextLink}) => {
        // Destructuring nodes (current items), isLoading (loading state), PreviousLink (link component for previous page), and NextLink (link component for next page).
        
        // Mapping over nodes to render children components for each node with its index.
        const resoucesMarkup = nodes.map((node, index) =>
          children({node, index}), // Calling children function with the current node and its index.
        );

        return (
          <div>
            {/* Link for navigating to the previous set of items */}
            <PreviousLink>
              {isLoading ? 'Loading...' : <span>↑ Load previous</span>}
              {/* Show loading text while loading, otherwise show the previous link text */}
            </PreviousLink>
            
            {/* Conditional rendering for resources container */}
            {resourcesClassName ? (
              <div className={resourcesClassName}>{resoucesMarkup}</div> // If resourcesClassName is provided, wrap resources in a div with that class.
            ) : (
              resoucesMarkup // Otherwise, just render the resources directly.
            )}
            
            {/* Link for navigating to the next set of items */}
            <NextLink>
              {isLoading ? 'Loading...' : <span>Load more ↓</span>}
              {/* Show loading text while loading, otherwise show the next link text */}
            </NextLink>
          </div>
        );
      }}
    </Pagination>
  );
}
