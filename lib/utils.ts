import { createHash } from "crypto";
import baseX from "base-x";
import path from "path";
import { writeFileSync } from "fs";

export function pagePathToId(path: string) {
  return qualifyId(path.replaceAll("\\", "/"));
}

const BASE62 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

export function writeCacheBusted(targetPath: string, buffer: Buffer) {
  const hash = createHash("sha-256");
  hash.update(buffer);
  const key = baseX(BASE62).encode(hash.digest()).substring(0, 12);

  // Insert the cache busting suffix into the filename such that
  // blah.txt becomes blah.<hash>.txt
  let filename = path.basename(targetPath);
  const idx = filename.indexOf(".");
  if (idx == -1) {
    filename += "." + key;
  } else {
    filename = filename.substring(0, idx) + "." + key + filename.substring(idx);
  }

  const outputPath = path.join(path.dirname(targetPath), filename);
  writeFileSync(outputPath, buffer);
  return outputPath;
}

// Old guides used ae2: as the default namespace
export function qualifyId(id: string): string;
export function qualifyId(id: undefined): undefined;
export function qualifyId(id: string | undefined): string | undefined {
  if (id && !id.includes(":")) {
    return "ae2:" + id;
  } else {
    return id;
  }
}

export function requireString(obj: any, path: string): string {
  let current = obj;
  const pathElems = path.split(".");

  // Navigate to the elements parent
  for (let i = 0; i < pathElems.length - 1; i++) {
    let pathSoFar = pathElems.slice(0, i + 1).join(".");
    const propName = pathElems[i];
    const value = current[propName];
    if (typeof value !== "object") {
      throw new Error(`Could not find object along path ${pathSoFar}`);
    }
    if (Array.isArray(value)) {
      throw new Error(`Found array along path ${pathSoFar}`);
    }
    if (value === null) {
      throw new Error(`Found null along path ${pathSoFar}`);
    }
    current = value;
  }

  const value = current[pathElems[pathElems.length - 1]];
  if (value === undefined) {
    throw new Error(`Value at path ${path} is undefined`);
  } else if (typeof value !== "string") {
    throw new Error(`Value at path ${path} is not a string`);
  }
  return value;
}
