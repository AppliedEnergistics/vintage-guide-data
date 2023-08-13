import { LoadedPage } from "./loadPages.js";
import { ExportedPage, GuideIndex } from "./targetTypes.js";
import { EXIT, SKIP, visit, VisitorResult } from "unist-util-visit";
import { MdxJsxFlowElement, MdxJsxTextElement } from "mdast-util-mdx";
import { findCategory, PageTree } from "./buildPageTree.js";
import { BlockContent } from "mdast";

function fixupImages(loadedPage: LoadedPage) {
  visit(loadedPage.root, "image", (node) => {
    if (!node.url) {
      return;
    }

    // In the new system, we use host-absolute URLs since
    // we use hash-based routing
    const startOfPublic = node.url.indexOf("/public/");
    if (startOfPublic === -1) {
      console.warn("Cannot handle image with URL: %s", node.url);
      return;
    }

    node.url = node.url.substring(startOfPublic + "/public".length);
  });
}

function stripPositions(loadedPage: LoadedPage) {
  // Strip position info
  visit(loadedPage.root, (node) => {
    delete node["position"];
  });
}

// Fix up <div class=""> to <div className="">
function fixupDivClassAttribute(loadedPage: LoadedPage) {
  visit(loadedPage.root, "mdxJsxFlowElement", (node) => {
    if (node.name === "div") {
      for (let attribute of node.attributes) {
        if (
          attribute.type === "mdxJsxAttribute" &&
          attribute.name === "class"
        ) {
          attribute.name = "className";
        }
      }
    }
  });
}

function fixupCustomElement(
  pageTree: PageTree,
  pageId: string,
  name: string,
  node: MdxJsxTextElement | MdxJsxFlowElement,
): VisitorResult {
  // Collect attributes into a record
  const oldProps: Record<string, any> = {};
  for (let attribute of node.attributes) {
    if (attribute.type === "mdxJsxAttribute") {
      oldProps[attribute.name] = attribute.value;
    } else {
      console.warn(
        "Unsupported attribute node %s for element %s on page %s",
        attribute.type,
        name,
        pageId,
      );
    }
  }
  let newProps: Record<string, any> = {};

  function moveProps(...names: string[]) {
    for (let name of names) {
      newProps[name] = oldProps[name];
      delete oldProps[name];
    }
  }

  function takeProp(propName: string): any {
    const prop = oldProps[propName];
    delete oldProps[propName];
    if (!prop) {
      console.warn(
        "Missing prop %s on custom element %s in %s",
        propName,
        name,
        pageId,
      );
    }
    return prop;
  }

  // This was the list of custom tags supported by the 1.16-1.19 guide
  // See [[...slug]].tsx in that source tree
  switch (name) {
    case "ItemGrid":
      // This just shows a grid and works as-is (no props)
      break;
    case "ItemIcon":
      // New props are "id" and optional "nolink"
      newProps = { id: takeProp("itemId") };
      break;
    case "ItemLink":
      moveProps("id");
      break;
    case "RecipeFor":
      moveProps("id");
      break;
    case "CategoryIndex":
      moveProps("category");
      break;
    case "SubCategories":
      // Instead of adding this tag to the new guide, we resolve the sub-categories ahead-of-time
      const category = findCategory(pageTree, takeProp("category"));

      // Convert the el itself into a div
      node.name = "div";
      node.children = category.categories.flatMap(
        (subCategory) =>
          [
            {
              type: "heading",
              depth: 3,
              children: [{ type: "text", value: subCategory.title }],
            },
            {
              type: "mdxJsxFlowElement",
              name: "CategoryIndex",
              attributes: [
                {
                  type: "mdxJsxAttribute",
                  name: "category",
                  value: subCategory.fullPath,
                },
              ],
              children: [],
            },
          ] satisfies BlockContent[] as any,
      );
      return SKIP;
    case "InscriberRecipes":
      break;
    case "P2PTunnelTypes":
      break;
    default:
      console.warn(
        "Unable to handle custom element %s in page %s",
        name,
        pageId,
      );
      return;
  }

  const remainingKeys = Object.keys(oldProps);
  if (remainingKeys.length) {
    console.warn(
      "Don't know how to handle props [%s] on custom element %s in %s",
      remainingKeys.join(", "),
      name,
      pageId,
    );
  }

  node.attributes = Object.entries(newProps).map(([name, value]) => {
    return {
      type: "mdxJsxAttribute",
      name,
      value,
    };
  });
}

function fixupCustomElements(pageTree: PageTree, loadedPage: LoadedPage) {
  visit(loadedPage.root, ["mdxJsxFlowElement", "mdxJsxTextElement"], (node) => {
    if (
      node.type === "mdxJsxFlowElement" ||
      node.type === "mdxJsxTextElement"
    ) {
      const tagName = node.name;
      // Only process React-Elements. Elements starting with Lower-Case are auto-converted to HTML-Elements
      // or at least they could be.
      if (tagName && tagName[0].match(/[A-Z]/)) {
        return fixupCustomElement(pageTree, loadedPage.id, tagName, node);
      }
    }
  });
}

function fixupPageTitle(loadedPage: LoadedPage) {
  // If the page does not contain a level-1 heading, insert one with the page title
  let found = false;
  visit(loadedPage.root, "heading", (node) => {
    if (node.depth === 1) {
      found = true;
    }
    return EXIT;
  });

  if (!found) {
    loadedPage.root.children.unshift({
      type: "heading",
      depth: 1,
      children: [
        {
          type: "text",
          value: loadedPage.title,
        },
      ],
    });
  }
}

function convertPage(pageTree: PageTree, loadedPage: LoadedPage): ExportedPage {
  stripPositions(loadedPage);
  fixupImages(loadedPage);
  fixupDivClassAttribute(loadedPage);
  fixupCustomElements(pageTree, loadedPage);
  fixupPageTitle(loadedPage);

  return {
    title: loadedPage.title,
    astRoot: loadedPage.root,
    frontmatter: loadedPage.frontmatter,
  };
}

export default function convertPages(
  pageTree: PageTree,
  pages: Record<string, LoadedPage>,
  guideIndex: GuideIndex,
) {
  for (const [pageId, loadedPage] of Object.entries(pages)) {
    guideIndex.pages[pageId] = convertPage(pageTree, loadedPage);
  }
}
